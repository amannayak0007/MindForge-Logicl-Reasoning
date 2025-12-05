import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionData } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "The category of the reasoning question (e.g., Series, Analogy, Blood Relations).",
    },
    questionText: {
      type: Type.STRING,
      description: "The main text of the question or riddle.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4 possible answers. One must be correct.",
    },
    correctAnswer: {
      type: Type.STRING,
      description: "The correct answer string, must match one of the options exactly.",
    },
    explanation: {
      type: Type.STRING,
      description: "A concise explanation of the logic behind the answer.",
    },
    hint: {
      type: Type.STRING,
      description: "A subtle clue to help the user solve the puzzle without revealing the answer.",
    },
    visualSVG: {
      type: Type.STRING,
      description: "Optional. REQUIRED if category is Visual Reasoning or Figure Series. Raw SVG code (starting with <svg and ending with </svg>) depicting the puzzle. Viewbox '0 0 300 200' recommended for series. Do not include markdown code blocks.",
    },
  },
  required: ["category", "questionText", "options", "correctAnswer", "explanation", "hint"],
};

const CATEGORIES = [
  "Analogy (Tree : Forest :: Book : ?)",
  "Classification / Odd One Out",
  "Series Completion (Numbers or Letters)",
  "Coding-Decoding",
  "Blood Relations",
  "Direction Sense",
  "Logical Venn Diagrams (Text based description)",
  "Mathematical Puzzles (Age, probability, work/time)",
  "Syllogisms / Statement & Conclusion",
  "Visual Reasoning / Figure Series (Geometric patterns, shape sequences)"
];

export const generateQuestion = async (level: number): Promise<QuestionData> => {
  const model = "gemini-2.5-flash";

  // Logic to determine difficulty keywords based on level
  let difficultyDescriptor = "Easy";
  if (level > 5) difficultyDescriptor = "Medium";
  if (level > 10) difficultyDescriptor = "Hard";
  if (level > 20) difficultyDescriptor = "Expert";
  if (level > 30) difficultyDescriptor = "Genius";

  // Pre-select category to allow specific prompting
  const selectedCategoryRaw = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const isVisualCategory = selectedCategoryRaw.includes("Visual") || selectedCategoryRaw.includes("Figure");

  let specificInstructions = "";

  if (isVisualCategory) {
    specificInstructions = `
    *** VISUAL REASONING MODE ACTIVE ***
    1. You MUST provide valid SVG code in the 'visualSVG' field.
    2. The SVG must be raw code starting with '<svg' and ending with '</svg>'.
    3. DO NOT wrap the SVG in markdown code blocks (no \`\`\`).
    4. SVG DESIGN RULES:
       - Use 'viewBox="0 0 300 150"' for sequences or '0 0 200 200' for grids.
       - Use HIGH CONTRAST: stroke="white" stroke-width="2" fill="none" (or bright colors). Background will be dark slate.
       - Text inside SVG must be white (fill="white").
       - The puzzle should visually depict the pattern (e.g., rotating shapes, missing segment).
    5. 'questionText' should be simple, e.g., "Which shape replaces the question mark?"
    `;
  } else {
    specificInstructions = `
    *** TEXT ONLY MODE ***
    1. Set 'visualSVG' field to null or empty string.
    2. Rely entirely on text description.
    `;
  }

  const prompt = `
    You are a master logic puzzle generator for a game called "MindForge".
    Generate a SINGLE unique reasoning question for Level ${level} (${difficultyDescriptor} difficulty).
    
    The selected category is: **${selectedCategoryRaw}**

    ${specificInstructions}

    General Constraints:
    - Provide 4 distinct options.
    - Ensure the logic is sound and the answer is unambiguous.
    - Include a 'hint' that gives a small nudge.
    - Output strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are a rigid game engine that outputs valid JSON only.",
        // Increase budget for visual tasks to ensure SVG correctness
        thinkingConfig: { thinkingBudget: isVisualCategory || level > 15 ? 1024 : 0 } 
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as QuestionData;
      // Safety fallbacks ensuring category matches what we asked for
      if (!data.category) data.category = selectedCategoryRaw.split(' ')[0];
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback question in case of API failure
    return {
      category: "Series Completion",
      questionText: "Which number comes next: 2, 4, 8, 16, ...?",
      options: ["20", "24", "32", "64"],
      correctAnswer: "32",
      explanation: "Powers of 2: 2^1, 2^2, 2^3, 2^4, 2^5 = 32.",
      hint: "Multiply the previous number by 2.",
      difficulty: 1,
    };
  }
};
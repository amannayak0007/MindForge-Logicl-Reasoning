import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionData } from "../types";

// Lazy initialization of Gemini - only when needed
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

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
      description: "Optional. Only if the category is 'Visual Reasoning' or 'Figure Series'. Provide raw SVG code (starting with <svg and ending with </svg>) depicting the puzzle. Do not include markdown code blocks. The SVG should be viewbox '0 0 200 200'. If not applicable, leave empty.",
    },
  },
  required: ["category", "questionText", "options", "correctAnswer", "explanation", "hint"],
};

export const generateQuestion = async (level: number): Promise<QuestionData> => {
  const model = "gemini-2.5-flash";

  // Logic to determine difficulty keywords based on level
  let difficultyDescriptor = "Easy";
  if (level > 5) difficultyDescriptor = "Medium";
  if (level > 10) difficultyDescriptor = "Hard";
  if (level > 20) difficultyDescriptor = "Expert";
  if (level > 30) difficultyDescriptor = "Genius";

  const prompt = `
    You are a master logic puzzle generator for a game called "MindForge".
    Generate a SINGLE unique reasoning question for Level ${level} (${difficultyDescriptor} difficulty).
    
    Randomly select ONE category from this list, ensuring variety:
    1. Analogy (Tree : Forest :: Book : ?)
    2. Classification / Odd One Out
    3. Series Completion (Numbers or Letters, e.g., ab_bc_c_ba_c)
    4. Coding-Decoding
    5. Blood Relations
    6. Direction Sense
    7. Logical Venn Diagrams (Text based description)
    8. Mathematical Puzzles (Age, probability, work/time)
    9. Syllogisms / Statement & Conclusion
    10. Visual Reasoning (Geometric patterns, shape series)

    Constraints:
    - Provide 4 distinct options.
    - Ensure the logic is sound and the answer is unambiguous.
    - Include a 'hint' that gives a small nudge.
    - For "Visual Reasoning", try to create a simple SVG representation in the 'visualSVG' field if possible, or describe the visual pattern clearly in text.
    - For "Series Completion", make sure the pattern requires some thought but is solvable.
    - Do NOT wrap the JSON in markdown blocks.
  `;

  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are a rigid game engine that outputs valid JSON only.",
        // Adjust thinking budget based on difficulty roughly
        thinkingConfig: { thinkingBudget: level > 15 ? 1024 : 0 } 
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as QuestionData;
      return data;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback question in case of API failure to prevent app crash
    return {
      category: "Fallback",
      questionText: "Which number comes next: 2, 4, 8, 16, ...?",
      options: ["20", "24", "32", "64"],
      correctAnswer: "32",
      explanation: "Powers of 2: 2^1, 2^2, 2^3, 2^4, 2^5 = 32.",
      hint: "Multiply the previous number by 2.",
      difficulty: 1,
    };
  }
};
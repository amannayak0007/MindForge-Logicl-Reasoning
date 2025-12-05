export enum QuestionCategory {
  Analogy = 'Analogy',
  Classification = 'Classification',
  Series = 'Series Completion',
  Coding = 'Coding-Decoding',
  BloodRelations = 'Blood Relations',
  Direction = 'Direction Sense',
  Venn = 'Logical Venn Diagrams',
  Math = 'Mathematical Puzzles',
  Syllogism = 'Syllogisms',
  Critical = 'Critical Reasoning',
  Visual = 'Visual Reasoning'
}

export interface QuestionData {
  category: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  difficulty: number;
  /**
   * If the question involves a visual SVG, this string contains the SVG code.
   * If null, it's a text-based question.
   */
  visualSVG?: string; 
}

export interface GameState {
  currentLevel: number;
  score: number;
  streak: number;
  highScore: number;
}
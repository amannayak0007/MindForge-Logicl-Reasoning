import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { GameCard } from './components/GameCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateQuestion } from './services/geminiService';
import { QuestionData, GameState } from './types';

const App: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    score: 0,
    streak: 0,
    highScore: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load High Score
  useEffect(() => {
    const savedHigh = localStorage.getItem('mindforge_highscore');
    if (savedHigh) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHigh) }));
    }
  }, []);

  const fetchNewQuestion = useCallback(async (level: number) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const question = await generateQuestion(level);
      setCurrentQuestion(question);
      setHasError(false);
    } catch (error) {
      console.error("Failed to load question:", error);
      setHasError(true);
      // Show fallback question even on error
      setCurrentQuestion({
        category: "Error",
        questionText: "Unable to connect to the question service. Please check your API configuration.",
        options: ["Retry", "Check API Key", "Contact Support", "Refresh Page"],
        correctAnswer: "Refresh Page",
        explanation: "The application requires a valid Gemini API key to generate questions. Please ensure GEMINI_API_KEY is set in your environment variables.",
        hint: "Check the browser console for more details.",
        difficulty: 1,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      fetchNewQuestion(1);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      // Update State for correct
      setGameState(prev => {
        const newScore = prev.score + (10 * prev.currentLevel) + (prev.streak * 5);
        const newHigh = Math.max(newScore, prev.highScore);
        localStorage.setItem('mindforge_highscore', newHigh.toString());
        
        return {
          ...prev,
          score: newScore,
          streak: prev.streak + 1,
          highScore: newHigh,
          currentLevel: prev.currentLevel + 1 // Advance level on correct answer
        };
      });
    } else {
      // Wrong answer - just reset streak, endless mode continues
      setGameState(prev => ({
        ...prev,
        streak: 0
      }));
    }
  };

  const handleNext = () => {
    // Always fetch based on current level (which might have increased if they got it right)
    fetchNewQuestion(gameState.currentLevel);
  };

  return (
    <Layout>
      {/* HUD - Consolidated Stats */}
      <div className="w-full grid grid-cols-3 gap-3 mb-6">
        {/* Level Card */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center border-t border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
          <span className="text-xl font-black text-white">{gameState.currentLevel}</span>
        </div>

        {/* Score Card */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center border-t border-blue-500/20 bg-blue-500/5">
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Score</span>
          <span className="text-xl font-black text-blue-100">{gameState.score.toLocaleString()}</span>
        </div>

        {/* Streak Card */}
        <div className={`glass-panel p-3 rounded-2xl flex flex-col items-center justify-center border-t transition-colors duration-300 ${gameState.streak > 2 ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${gameState.streak > 2 ? 'text-orange-300' : 'text-slate-400'}`}>Streak</span>
          <div className="flex items-center space-x-1">
            <span className={`text-xl font-black ${gameState.streak > 2 ? 'text-orange-200' : 'text-slate-200'}`}>{gameState.streak}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${gameState.streak > 2 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="min-h-[400px]">
        {isLoading && !currentQuestion ? (
          <LoadingSpinner />
        ) : currentQuestion ? (
          <>
            {hasError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  ⚠️ API Error: Check console for details. Using fallback question.
                </p>
              </div>
            )}
            <GameCard 
              question={currentQuestion} 
              onAnswer={handleAnswer} 
              onNext={handleNext}
              disabled={isLoading}
            />
          </>
        ) : (
           <div className="glass-panel p-8 rounded-3xl text-center">
             <div className="text-red-400 mb-4">Error loading. Please refresh.</div>
             <button 
               onClick={() => fetchNewQuestion(1)}
               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
             >
               Retry
             </button>
           </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center opacity-30 text-xs flex justify-center items-center space-x-4">
        <p>Powered by Google Gemini</p>
        {gameState.highScore > 0 && (
          <p className="text-yellow-500/50 font-semibold">Best: {gameState.highScore}</p>
        )}
      </div>
    </Layout>
  );
};

export default App;
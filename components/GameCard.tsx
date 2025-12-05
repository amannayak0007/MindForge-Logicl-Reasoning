import React, { useState, useEffect } from 'react';
import { QuestionData } from '../types';

interface GameCardProps {
  question: QuestionData;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  disabled: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ question, onAnswer, onNext, disabled }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowHint(false);
  }, [question]);

  const handleSelect = (option: string) => {
    if (disabled || isSubmitted) return;
    
    setSelectedOption(option);
    setIsSubmitted(true);
    
    const correct = option === question.correctAnswer;
    onAnswer(correct);
  };

  const getOptionStyle = (option: string) => {
    const baseStyle = "w-full p-4 rounded-xl text-left transition-all duration-200 border-2 font-medium relative overflow-hidden";
    
    if (isSubmitted) {
      if (option === question.correctAnswer) {
        return `${baseStyle} bg-green-500/20 border-green-500 text-green-100`;
      }
      if (option === selectedOption && option !== question.correctAnswer) {
        return `${baseStyle} bg-red-500/20 border-red-500 text-red-100`;
      }
      return `${baseStyle} border-slate-700 opacity-50`;
    }

    return `${baseStyle} bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0`;
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl animate-[fadeIn_0.5s_ease-out] relative">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
          {question.category}
        </span>
        
        {/* Hint Button */}
        {!isSubmitted && (
          <button 
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
            title="Get a hint"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-semibold">Hint</span>
          </button>
        )}
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-4 text-white">
          {question.questionText}
        </h2>
        
        {/* Visual Content (if available) */}
        {question.visualSVG && (
          <div 
            className="w-full h-48 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-6 p-4"
            dangerouslySetInnerHTML={{ __html: question.visualSVG }} 
          />
        )}
        
        {/* Hint Display */}
        {showHint && !isSubmitted && (
           <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-[fadeIn_0.3s_ease-out]">
             <p className="text-yellow-200 text-sm">
               <span className="font-bold">💡 Hint:</span> {question.hint}
             </p>
           </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={disabled || isSubmitted}
            className={getOptionStyle(option)}
          >
            <div className="flex items-center">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold mr-4 shrink-0 transition-colors ${
                  isSubmitted && option === question.correctAnswer ? 'bg-green-500 text-white' : 
                  isSubmitted && option === selectedOption ? 'bg-red-500 text-white' : 
                  'bg-white/10'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{option}</span>
            </div>
            
            {/* Success/Error Icon Overlay */}
            {isSubmitted && option === question.correctAnswer && (
                 <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                 </div>
            )}
             {isSubmitted && option === selectedOption && option !== question.correctAnswer && (
                 <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                 </div>
            )}
          </button>
        ))}
      </div>

      {/* Feedback & Next Button */}
      {isSubmitted && (
        <div className="mt-6 animate-[slideUp_0.3s_ease-out]">
          <div className={`p-5 rounded-xl border ${selectedOption === question.correctAnswer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg font-bold ${selectedOption === question.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                {selectedOption === question.correctAnswer ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              <strong className="text-slate-100">Explanation:</strong> {question.explanation}
            </p>
          </div>
          
          <button
            onClick={onNext}
            className="w-full mt-4 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Next Question</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
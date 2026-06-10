import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface MatchingScoreProps {
  score: number;
  lang: 'sw' | 'en';
  hasInterests: boolean;
  onTakeQuiz?: () => void;
}

export const MatchingScoreChart: React.FC<MatchingScoreProps> = ({ score, lang, hasInterests, onTakeQuiz }) => {
  // If user has no interests saved, we show 0 matched
  const matchedValue = hasInterests ? score : 0;
  
  // Guard against match score higher than 100 just in case
  const percentage = Math.min(Math.max(matchedValue, 0), 100);
  
  const data = [
    { name: 'Matched', value: percentage },
    { name: 'Remaining', value: 100 - percentage }
  ];

  // Pick color based on score value
  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Deep Emerald
    if (val >= 50) return '#059669'; // Mid Emerald-600
    if (val >= 25) return '#f59e0b'; // Amber
    return '#64748b'; // Slate
  };

  const primaryColor = hasInterests ? getScoreColor(percentage) : '#cbd5e1';

  return (
    <div 
      className="flex items-center space-x-2.5 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/50 hover:border-emerald-500/25 transition-colors duration-150 shrink-0"
      onClick={(e) => {
        // Prevent expanding parent card when clicking the matching status
        e.stopPropagation();
      }}
    >
      <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
        <PieChart width={44} height={44}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={15}
            outerRadius={20}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={primaryColor} />
            <Cell fill={hasInterests ? '#f1f5f9' : '#e2e8f0'} />
          </Pie>
        </PieChart>
        
        {/* Absolute center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black tracking-tight text-stone-800">
            {hasInterests ? `${percentage}%` : '—'}
          </span>
        </div>
      </div>

      <div className="flex flex-col text-left leading-tight min-w-[70px]">
        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
          {lang === 'sw' ? 'Mlingano' : 'Match Score'}
        </span>
        {hasInterests ? (
          <span 
            className={`text-[10px] font-extrabold ${
              percentage >= 80 ? 'text-emerald-600' :
              percentage >= 50 ? 'text-teal-600' :
              percentage >= 25 ? 'text-amber-600' : 'text-stone-505'
            }`}
          >
            {percentage >= 80 ? (lang === 'sw' ? 'Tayari Sana' : 'Strong Match') :
             percentage >= 50 ? (lang === 'sw' ? 'Inafaa Sana' : 'Good Match') :
             percentage >= 25 ? (lang === 'sw' ? 'Inafaa Kidogo' : 'Partial Match') :
             (lang === 'sw' ? 'Inatofautiana' : 'No Match')}
          </span>
        ) : (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onTakeQuiz) onTakeQuiz();
            }}
            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-black underline transition-colors cursor-pointer text-left"
          >
            {lang === 'sw' ? 'Weka Vipengele' : 'Take Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

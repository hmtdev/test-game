import React from 'react';
import { Player } from '../types';

interface CellProps {
  player: Player;
  isWinningCell?: boolean;
  rowIndex: number;
}

const Cell: React.FC<CellProps> = ({ player, isWinningCell, rowIndex }) => {
  let colorClass = 'bg-slate-900'; // Default empty hole (shows background)
  let borderClass = 'border-transparent';
  let shadowClass = 'shadow-inner shadow-black/50'; // Inner shadow for depth

  if (player === Player.One) {
    colorClass = 'bg-yellow-400';
    shadowClass = 'shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.4),0px_4px_6px_rgba(0,0,0,0.3)]';
  } else if (player === Player.Two) {
    colorClass = 'bg-red-500';
    shadowClass = 'shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.4),0px_4px_6px_rgba(0,0,0,0.3)]';
  }

  const animationClass = player !== Player.None ? 'animate-drop' : '';
  const winningClass = isWinningCell ? 'ring-4 ring-white animate-pulse' : '';

  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center relative z-0">
       {/* This div represents the 'hole' in the blue board */}
      <div 
        className={`w-full h-full rounded-full ${colorClass} ${shadowClass} ${animationClass} ${winningClass} transition-colors duration-300`}
        // Simple inline style to stagger animations if needed, though pure CSS class is often enough
        style={{ animationDuration: '0.4s' }}
      >
        {/* Shine effect for plastic look */}
        {player !== Player.None && (
          <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white opacity-40"></div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Cell);

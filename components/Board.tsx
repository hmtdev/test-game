import React from 'react';
import { BoardState, Player } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: BoardState;
  onColumnClick: (colIndex: number) => void;
  currentPlayer: Player;
  isAiThinking: boolean;
  gameActive: boolean;
  winningCells: { row: number; col: number }[] | null;
}

const Board: React.FC<BoardProps> = ({ board, onColumnClick, currentPlayer, isAiThinking, gameActive, winningCells }) => {
  
  const isWinningCell = (r: number, c: number) => {
    return winningCells?.some(cell => cell.row === r && cell.col === c);
  };

  return (
    <div className="relative p-4 bg-board rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-b-8 border-board-dark select-none">
      {/* Leg stands (Visual) */}
      <div className="absolute -bottom-8 -left-2 w-4 h-24 bg-board-dark -z-10 rounded-b-lg"></div>
      <div className="absolute -bottom-8 -right-2 w-4 h-24 bg-board-dark -z-10 rounded-b-lg"></div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 bg-board-light p-2 sm:p-3 md:p-4 rounded border-4 border-board-dark shadow-inner">
        {/* 
           We map columns first to easily create clickable columns overlay, 
           but visual grid usually maps rows. 
           To keep it semantic, we iterate rows, but handle clicks via a transparent overlay or button per cell.
           Here we map row by row for visual grid layout.
        */}
        {board.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={() => gameActive && !isAiThinking ? onColumnClick(colIndex) : undefined}
              >
                <Cell 
                  player={cell.player} 
                  rowIndex={rowIndex} 
                  isWinningCell={isWinningCell(rowIndex, colIndex)}
                />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Column Hover Indicators (Overlay) - Optional for Desktop */}
      {gameActive && !isAiThinking && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-between px-[20px] sm:px-[28px] md:px-[36px] py-[20px] sm:py-[28px] md:py-[36px]">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 hover:bg-white/5 rounded-full transition-colors duration-200 pointer-events-auto" onClick={() => onColumnClick(i)}></div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Board;

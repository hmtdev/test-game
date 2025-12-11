import React from 'react';
import { GameMode, GameStatus, Player } from '../types';

interface ControlsProps {
  gameStatus: GameStatus;
  currentPlayer: Player;
  gameMode: GameMode;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
  winner: Player | null;
  isAiThinking: boolean;
  onlinePlayerId?: Player | null; // For displaying "You are Player X"
}

const Controls: React.FC<ControlsProps> = ({
  gameStatus,
  currentPlayer,
  gameMode,
  onReset,
  onModeChange,
  winner,
  isAiThinking,
  onlinePlayerId
}) => {
  const getStatusText = () => {
    if (isAiThinking) return "Gemini is thinking...";
    if (gameMode === GameMode.Online && onlinePlayerId) {
      if (currentPlayer === onlinePlayerId) return "Your Turn";
      return "Opponent's Turn";
    }
    return currentPlayer === Player.One ? "Player 1" : (gameMode === GameMode.PvAI ? "Gemini AI" : "Player 2");
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-lg mx-auto mb-8">
      
      {/* Header / Status */}
      <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 w-full shadow-lg border border-slate-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-200 uppercase tracking-wider">Status</h2>
            <div className="flex flex-col items-end">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  gameMode === GameMode.PvAI ? 'bg-purple-600' : 
                  gameMode === GameMode.Online ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                  {gameMode === GameMode.PvAI ? 'Human vs AI' : gameMode === GameMode.Online ? 'Online PvP' : 'Human vs Human'}
              </div>
              {gameMode === GameMode.Online && onlinePlayerId && (
                <span className="text-xs text-gray-400 mt-1">
                  You are <span className={onlinePlayerId === Player.One ? 'text-yellow-500' : 'text-red-500'}>
                    {onlinePlayerId === Player.One ? 'Player 1' : 'Player 2'}
                  </span>
                </span>
              )}
            </div>
        </div>

        <div className="flex items-center justify-center space-x-4">
          {gameStatus === GameStatus.Playing ? (
            <div className="flex items-center space-x-3 animate-fade-in">
              <span className="text-gray-400">Turn:</span>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-white transition-all ${
                currentPlayer === Player.One ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-red-500 shadow-red-500/50'
              } shadow-lg`}>
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span>{getStatusText()}</span>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-black text-white animate-bounce-small">
              {gameStatus === GameStatus.Draw && "It's a Draw!"}
              {gameStatus === GameStatus.Won && (
                <span className={winner === Player.One ? "text-yellow-400" : "text-red-400"}>
                   {winner === Player.One ? "Player 1" : (gameMode === GameMode.PvAI ? "Gemini AI" : "Player 2")} Wins!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 w-full">
        <button
          onClick={onReset}
          className="flex-1 bg-white text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 active:scale-95"
        >
          {gameStatus === GameStatus.Playing ? 'Restart Game' : 'New Game'}
        </button>
        
        <div className="relative group">
            <button className="h-full bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-slate-600 transition-colors flex items-center space-x-2">
                <span>Mode</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
                <button 
                    onClick={() => onModeChange(GameMode.PvP)} 
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-slate-800 ${gameMode === GameMode.PvP ? 'font-bold bg-blue-50' : ''}`}
                >
                    Human vs Human
                </button>
                <button 
                    onClick={() => onModeChange(GameMode.PvAI)} 
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-slate-800 ${gameMode === GameMode.PvAI ? 'font-bold bg-purple-50' : ''}`}
                >
                    Human vs AI (Gemini)
                </button>
                <button 
                    onClick={() => onModeChange(GameMode.Online)} 
                    className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-slate-800 ${gameMode === GameMode.Online ? 'font-bold bg-green-50' : ''}`}
                >
                    Play Online
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
import React, { useState } from 'react';

interface OnlinePanelProps {
  onJoin: (roomId: string) => void;
  isConnecting: boolean;
  connectionError: string | null;
  isWaitingForOpponent: boolean;
  myPeerId: string | null; // Kept for interface compatibility but ignored
}

const OnlinePanel: React.FC<OnlinePanelProps> = ({ onJoin, isConnecting, connectionError, isWaitingForOpponent }) => {
  const [roomId, setRoomId] = useState('');

  const handleStart = () => {
    if (roomId.trim()) {
      onJoin(roomId.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center relative z-10">Online PvP</h2>
        <p className="text-slate-400 text-center mb-6 text-sm relative z-10">
          Enter a Room Name. If it exists, you'll join it. If not, you'll create it.
        </p>

        {connectionError && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm relative z-10">
            {connectionError}
          </div>
        )}

        {!isWaitingForOpponent ? (
            <div className="space-y-4 relative z-10">
                <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Room Name</label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="e.g. pizza, game1, secret-base"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    />
                </div>

                <button
                    onClick={handleStart}
                    disabled={isConnecting || !roomId.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center space-x-2"
                >
                    {isConnecting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <span>Enter Room</span>
                    )}
                </button>
            </div>
        ) : (
            <div className="text-center py-8 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Room Created!</h3>
                <p className="text-slate-300">Room Name: <span className="font-mono font-bold text-yellow-400">{roomId}</span></p>
                <p className="text-slate-400 text-sm mt-4">Waiting for Player 2 to join...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OnlinePanel;
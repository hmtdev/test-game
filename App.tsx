import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, GameMode, GameStatus, Player, WinResult } from './types';
import { createEmptyBoard, checkWin, checkDraw, getAvailableRow, cloneBoard } from './utils/gameLogic';
import { getBestMove } from './services/geminiService';
import Board from './components/Board';
import Controls from './components/Controls';
import OnlinePanel from './components/OnlinePanel';
import { AI_THINKING_DELAY_MS } from './constants';
import Peer, { DataConnection } from 'peerjs';

// Protocol Types
type NetworkMessage = 
  | { type: 'MOVE'; col: number }
  | { type: 'RESET' };

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.One);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PvAI);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<{ row: number; col: number }[] | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Online State
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [onlinePlayerId, setOnlinePlayerId] = useState<Player | null>(null); // Am I Player 1 or 2?
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const resetGame = useCallback((mode?: GameMode) => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(Player.One);
    setGameStatus(GameStatus.Playing);
    setWinner(null);
    setWinningCells(null);
    setIsAiThinking(false);
    
    // If switching modes, update mode
    if (mode) {
      setGameMode(mode);
      // Clean up peer if leaving online mode
      if (mode !== GameMode.Online && peerInstance) {
        peerInstance.destroy();
        setPeerInstance(null);
        setConnection(null);
        setOnlinePlayerId(null);
        setIsWaitingForOpponent(false);
      }
    } else {
        // If just resetting IN online mode, notify peer
        if (gameMode === GameMode.Online && connection) {
             connection.send({ type: 'RESET' });
        }
    }
  }, [gameMode, peerInstance, connection]);

  // Handle incoming remote reset
  const handleRemoteReset = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(Player.One);
    setGameStatus(GameStatus.Playing);
    setWinner(null);
    setWinningCells(null);
    setIsAiThinking(false);
  }, []);

  // PEERJS: Setup Data Connection listeners
  const setupConnection = (conn: DataConnection) => {
    setConnection(conn);
    setIsConnecting(false);
    setConnectionError(null);
    setIsWaitingForOpponent(false);
    
    // Reset game when new connection established so both start fresh
    handleRemoteReset();

    conn.on('data', (data: any) => {
      const msg = data as NetworkMessage;
      if (msg.type === 'MOVE') {
        dropDisc(msg.col, true); // true = isRemote
      } else if (msg.type === 'RESET') {
        handleRemoteReset();
      }
    });

    conn.on('close', () => {
      alert('Opponent disconnected');
      setConnection(null);
      setGameMode(GameMode.PvAI); // Fallback
    });
  };

  const startOnlineGame = (userRoomId: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    setIsWaitingForOpponent(false);

    if (peerInstance) {
      peerInstance.destroy();
    }

    // Prefix the room ID to avoid collisions with other PeerJS users on the public server
    const roomId = `gemini-connect4-v1-${userRoomId}`;

    // 1. Try to create the room (Act as Host)
    const peer = new Peer(roomId);

    peer.on('open', (id) => {
      // If successful, I am the Host (Player 1)
      console.log('Created room:', id);
      setPeerInstance(peer);
      setOnlinePlayerId(Player.One);
      setIsWaitingForOpponent(true);
      setIsConnecting(false);
    });

    peer.on('connection', (conn) => {
      console.log('Peer connected to me');
      setupConnection(conn);
    });

    peer.on('error', (err: any) => {
      console.log('Peer Error:', err.type);
      if (err.type === 'unavailable-id') {
        // ID is taken, meaning the room exists. Connect to it (Act as Guest)
        console.log('Room exists, joining as Guest...');
        peer.destroy(); // Destroy failed host peer

        // Create a new random peer to connect as client
        const clientPeer = new Peer();
        
        clientPeer.on('open', () => {
           const conn = clientPeer.connect(roomId);
           
           conn.on('open', () => {
             console.log('Connected to Host');
             setupConnection(conn);
             setOnlinePlayerId(Player.Two);
           });

           conn.on('error', (e) => {
             console.error('Connection to host failed', e);
             setConnectionError("Could not connect to room. Host might be disconnected.");
             setIsConnecting(false);
           });

           setPeerInstance(clientPeer);
        });

        clientPeer.on('error', (e) => {
          setConnectionError("Client connection error: " + e.message);
          setIsConnecting(false);
        });

      } else {
        setConnectionError(`Error: ${err.type || 'Unknown PeerJS Error'}`);
        setIsConnecting(false);
      }
    });
  };

  const handleGameEnd = (result: WinResult | null, isDraw: boolean) => {
    if (result) {
      setGameStatus(GameStatus.Won);
      setWinner(result.winner);
      setWinningCells(result.winningCells);
    } else if (isDraw) {
      setGameStatus(GameStatus.Draw);
    }
  };

  const dropDisc = useCallback((colIndex: number, isRemote: boolean = false) => {
    if (gameStatus !== GameStatus.Playing) return;

    // Check availability
    const rowIndex = getAvailableRow(board, colIndex);
    if (rowIndex === null) return; 

    // Update Board
    const newBoard = cloneBoard(board);
    newBoard[rowIndex][colIndex].player = currentPlayer;
    setBoard(newBoard);

    // Network Sync: If it's MY move (not remote), send it
    if (!isRemote && gameMode === GameMode.Online && connection) {
        connection.send({ type: 'MOVE', col: colIndex });
    }

    // Check Win/Draw
    const winResult = checkWin(newBoard, currentPlayer);
    const isDraw = checkDraw(newBoard);

    if (winResult || isDraw) {
      handleGameEnd(winResult, isDraw);
    } else {
      // Switch Player
      setCurrentPlayer(prev => (prev === Player.One ? Player.Two : Player.One));
    }
  }, [board, currentPlayer, gameStatus, gameMode, connection]);

  // AI Logic Effect
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const playAiTurn = async () => {
      if (
        gameMode === GameMode.PvAI &&
        currentPlayer === Player.Two &&
        gameStatus === GameStatus.Playing
      ) {
        setIsAiThinking(true);
        const startTime = Date.now();
        const bestColumn = await getBestMove(board);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, AI_THINKING_DELAY_MS - elapsedTime);

        timeoutId = setTimeout(() => {
          dropDisc(bestColumn);
          setIsAiThinking(false);
        }, remainingDelay);
      }
    };

    playAiTurn();
    return () => clearTimeout(timeoutId);
  }, [currentPlayer, gameMode, gameStatus, board, dropDisc]);

  const handleColumnClick = (colIndex: number) => {
    // Blocks
    if (gameStatus !== GameStatus.Playing) return;
    if (isAiThinking) return;

    // Online Permission Check
    if (gameMode === GameMode.Online) {
        if (!connection) return; // Not connected yet
        if (currentPlayer !== onlinePlayerId) return; // Not my turn
    }

    dropDisc(colIndex);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 font-sans relative">
      
      {/* Online Setup Overlay */}
      {gameMode === GameMode.Online && !connection && (
        <OnlinePanel 
            onJoin={startOnlineGame}
            isConnecting={isConnecting}
            connectionError={connectionError}
            isWaitingForOpponent={isWaitingForOpponent}
            myPeerId={null} // Not used in this version
        />
      )}

      <div className="w-full max-w-3xl flex flex-col items-center z-10">
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-8 drop-shadow-lg tracking-tight">
          CONNECT 4
        </h1>

        <Controls
          gameStatus={gameStatus}
          currentPlayer={currentPlayer}
          gameMode={gameMode}
          onReset={() => resetGame()}
          onModeChange={(mode) => resetGame(mode)}
          winner={winner}
          isAiThinking={isAiThinking}
          onlinePlayerId={onlinePlayerId}
        />

        <Board
          board={board}
          onColumnClick={handleColumnClick}
          currentPlayer={currentPlayer}
          isAiThinking={isAiThinking}
          gameActive={gameStatus === GameStatus.Playing}
          winningCells={winningCells}
        />

        <div className="mt-8 text-slate-500 text-sm">
          {gameMode === GameMode.PvAI ? 'Powered by Gemini 2.5 Flash' : (gameMode === GameMode.Online ? 'Online P2P via PeerJS' : 'Local Multiplayer')}
        </div>
      </div>
    </div>
  );
};

export default App;
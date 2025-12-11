export enum Player {
  None = 0,
  One = 1, // Human (Yellow)
  Two = 2, // AI or Human 2 (Red)
}

export enum GameMode {
  PvP = 'PvP',
  PvAI = 'PvAI',
  Online = 'Online', // New mode
}

export enum GameStatus {
  Playing = 'Playing',
  Won = 'Won',
  Draw = 'Draw',
}

export interface CellState {
  player: Player;
  isWinningCell?: boolean;
}

// 6 rows x 7 columns
export type BoardState = CellState[][];

export interface MoveResult {
  column: number;
  row: number;
}

export interface WinResult {
  winner: Player;
  winningCells: { row: number; col: number }[];
}
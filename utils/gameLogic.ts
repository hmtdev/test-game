import { BoardState, CellState, Player, WinResult } from '../types';
import { ROWS as ROWS_CONST, COLS as COLS_CONST } from '../constants';

export const createEmptyBoard = (): BoardState => {
  return Array.from({ length: ROWS_CONST }, () =>
    Array.from({ length: COLS_CONST }, () => ({ player: Player.None }))
  );
};

export const getAvailableRow = (board: BoardState, colIndex: number): number | null => {
  for (let r = ROWS_CONST - 1; r >= 0; r--) {
    if (board[r][colIndex].player === Player.None) {
      return r;
    }
  }
  return null;
};

export const checkWin = (board: BoardState, player: Player): WinResult | null => {
  // Horizontal
  for (let r = 0; r < ROWS_CONST; r++) {
    for (let c = 0; c < COLS_CONST - 3; c++) {
      if (
        board[r][c].player === player &&
        board[r][c + 1].player === player &&
        board[r][c + 2].player === player &&
        board[r][c + 3].player === player
      ) {
        return { winner: player, winningCells: [{ r, c }, { r, c: c + 1 }, { r, c: c + 2 }, { r, c: c + 3 }].map(pos => ({ row: pos.r, col: pos.c })) };
      }
    }
  }

  // Vertical
  for (let r = 0; r < ROWS_CONST - 3; r++) {
    for (let c = 0; c < COLS_CONST; c++) {
      if (
        board[r][c].player === player &&
        board[r + 1][c].player === player &&
        board[r + 2][c].player === player &&
        board[r + 3][c].player === player
      ) {
        return { winner: player, winningCells: [{ r, c }, { r: r + 1, c }, { r: r + 2, c }, { r: r + 3, c }].map(pos => ({ row: pos.r, col: pos.c })) };
      }
    }
  }

  // Diagonal (Down-Right)
  for (let r = 0; r < ROWS_CONST - 3; r++) {
    for (let c = 0; c < COLS_CONST - 3; c++) {
      if (
        board[r][c].player === player &&
        board[r + 1][c + 1].player === player &&
        board[r + 2][c + 2].player === player &&
        board[r + 3][c + 3].player === player
      ) {
        return { winner: player, winningCells: [{ r, c }, { r: r + 1, c: c + 1 }, { r: r + 2, c: c + 2 }, { r: r + 3, c: c + 3 }].map(pos => ({ row: pos.r, col: pos.c })) };
      }
    }
  }

  // Diagonal (Up-Right)
  for (let r = 3; r < ROWS_CONST; r++) {
    for (let c = 0; c < COLS_CONST - 3; c++) {
      if (
        board[r][c].player === player &&
        board[r - 1][c + 1].player === player &&
        board[r - 2][c + 2].player === player &&
        board[r - 3][c + 3].player === player
      ) {
        return { winner: player, winningCells: [{ r, c }, { r: r - 1, c: c + 1 }, { r: r - 2, c: c + 2 }, { r: r - 3, c: c + 3 }].map(pos => ({ row: pos.r, col: pos.c })) };
      }
    }
  }

  return null;
};

export const checkDraw = (board: BoardState): boolean => {
  return board[0].every(cell => cell.player !== Player.None);
};

export const cloneBoard = (board: BoardState): BoardState => {
  return board.map(row => row.map(cell => ({ ...cell })));
};
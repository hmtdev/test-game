export const ROWS = 6;
export const COLS = 7;

export const EMPTY_BOARD_MAP = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => ({ player: 0 }))
);

export const PLAYER_NAMES = {
  1: "Player 1 (Yellow)",
  2: "Player 2 (Red)",
};

export const AI_THINKING_DELAY_MS = 800; // Artificial delay for better UX

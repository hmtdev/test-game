import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, Player } from '../types';
import { getAvailableRow } from '../utils/gameLogic';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert board to simple number matrix for AI
const serializeBoard = (board: BoardState): number[][] => {
  return board.map(row => row.map(cell => cell.player));
};

export const getBestMove = async (board: BoardState): Promise<number> => {
  if (!apiKey) {
    console.warn("No API Key provided, falling back to random move");
    return getRandomMove(board);
  }

  try {
    const serialized = serializeBoard(board);
    const validCols = [];
    for(let c=0; c<7; c++) {
        if(getAvailableRow(board, c) !== null) validCols.push(c);
    }

    const prompt = `
      You are playing Connect 4. You are Player 2 (represented by the number 2).
      Your opponent is Player 1 (represented by the number 1). 0 represents an empty cell.
      The board is a 6-row by 7-column grid (rows 0-5, cols 0-6).
      
      Current Board State (JSON matrix):
      ${JSON.stringify(serialized)}
      
      Analyze the board carefully.
      1. Check if you can win immediately. If so, choose that column.
      2. Check if the opponent can win on their next turn. If so, block them.
      3. Otherwise, prioritize the center column or building a connection.
      
      Your response must be a JSON object containing the 'column' (integer 0-6) and a short 'reasoning' string.
      Only choose a column that is not full.
      Valid columns are: ${JSON.stringify(validCols)}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            column: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
          },
          required: ["column"],
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Validate AI Move
    if (typeof result.column === 'number' && validCols.includes(result.column)) {
      console.log(`Gemini Logic: ${result.reasoning}`);
      return result.column;
    } else {
      console.warn("AI returned invalid or full column, using fallback.");
      return getRandomMove(board);
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getRandomMove(board);
  }
};

const getRandomMove = (board: BoardState): number => {
  const validCols: number[] = [];
  for (let c = 0; c < 7; c++) {
    if (getAvailableRow(board, c) !== null) {
      validCols.push(c);
    }
  }
  if (validCols.length === 0) return -1;
  return validCols[Math.floor(Math.random() * validCols.length)];
};

export const BOARD_SIZE = 8;
export const SQUARE_SIZE = 1;
export const RECONNECT_TIMEOUT_SECONDS = 60;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

/**
 * Convert algebraic notation (e.g. "e4") to 3D world position [x, y, z].
 * Board is centered at origin. y=0 is the board surface.
 */
export function squareTo3DPosition(square: string): [number, number, number] {
  const file = square[0];
  const rank = square[1];
  const fileIndex = FILES.indexOf(file);
  const rankIndex = RANKS.indexOf(rank);

  // Center board at origin: file a=0..h=7 -> x from -3.5 to 3.5
  const x = (fileIndex - 3.5) * SQUARE_SIZE;
  const z = (3.5 - rankIndex) * SQUARE_SIZE; // rank 1 = far side, rank 8 = near
  const y = 0;

  return [x, y, z];
}

/**
 * Convert 3D position back to algebraic square notation.
 */
export function positionToSquare(x: number, z: number): string | null {
  const fileIndex = Math.round(x / SQUARE_SIZE + 3.5);
  const rankIndex = Math.round(3.5 - z / SQUARE_SIZE);

  if (fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7) {
    return null;
  }

  return FILES[fileIndex] + RANKS[rankIndex];
}

export { FILES, RANKS };


import {z} from 'genkit';

export const AdaptiveHintRequestSchema = z.object({
  puzzle: z.string().describe('The current state of the Sudoku board as a 9x9 grid string, with empty cells represented by "."'),
  difficulty: z.string().describe('The difficulty of the puzzle (e.g., "easy", "medium", "hard").'),
  skillLevel: z.number().min(1).max(10).describe('The estimated skill level of the player on a scale of 1 to 10.'),
  progress: z.number().min(0).max(1).describe('The player\'s progress through the puzzle, from 0.0 (start) to 1.0 (nearly complete).'),
});

export const AdaptiveHintResponseSchema = z.object({
  hint: z.string().describe('A clear, actionable hint for the player.'),
  reasoning: z.string().describe('A brief explanation of the logic behind the hint provided.'),
});

export type AdaptiveHintRequest = z.infer<typeof AdaptiveHintRequestSchema>;
export type AdaptiveHintResponse = z.infer<typeof AdaptiveHintResponseSchema>;

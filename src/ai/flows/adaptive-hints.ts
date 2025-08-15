// 'use server';
/**
 * @fileOverview Adaptive hints AI agent.
 *
 * - getAdaptiveHint - A function that provides adaptive hints for Sudoku puzzles.
 * - AdaptiveHintInput - The input type for the getAdaptiveHint function.
 * - AdaptiveHintOutput - The return type for the getAdaptiveHint function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveHintInputSchema = z.object({
  puzzle: z.string().describe('The current state of the Sudoku puzzle as a string representation.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).describe('The difficulty level of the Sudoku puzzle.'),
  skillLevel: z.number().int().min(1).max(10).describe('The player\'s self-rated skill level on a scale of 1 to 10.'),
  progress: z.number().min(0).max(1).describe('The player\'s progress in solving the puzzle, ranging from 0 to 1.'),
});
export type AdaptiveHintInput = z.infer<typeof AdaptiveHintInputSchema>;

const AdaptiveHintOutputSchema = z.object({
  hint: z.string().describe('A helpful hint to assist the player in solving the Sudoku puzzle, tailored to their skill level and progress.'),
  reasoning: z.string().optional().describe('Explanation of why the hint is helpful and applicable in the current puzzle state.'),
});
export type AdaptiveHintOutput = z.infer<typeof AdaptiveHintOutputSchema>;

export async function getAdaptiveHint(input: AdaptiveHintInput): Promise<AdaptiveHintOutput> {
  return adaptiveHintsFlow(input);
}

const adaptiveHintsPrompt = ai.definePrompt({
  name: 'adaptiveHintsPrompt',
  input: {schema: AdaptiveHintInputSchema},
  output: {schema: AdaptiveHintOutputSchema},
  prompt: `You are a Sudoku expert providing hints to players of varying skill levels.

  Provide a hint to help the player make progress on the puzzle. Consider the difficulty, the player's skill level, and their current progress.

  Puzzle difficulty: {{difficulty}}
  Player skill level (1-10): {{skillLevel}}
  Puzzle progress (0-1): {{progress}}

  Current Sudoku puzzle:
  {{puzzle}}

  Provide a hint and, if possible, a brief explanation of your reasoning. The hint should be actionable and guide the player without giving away the solution directly.
  For beginner players, focus on basic techniques like scanning rows, columns, and blocks for missing numbers. For more advanced players, suggest techniques like hidden singles, naked pairs, or pointing pairs.
  Adapt the difficulty of the hint to the skill level, and adjust the hint based on progress. For example, hints should be easier at the start of the game, and harder close to the end.
  Make sure your hint actually solves part of the puzzle and isn't useless or misleading.

  Adhere to this format:
  Hint: ...
  Reasoning: ... (optional)
  `,
});

const adaptiveHintsFlow = ai.defineFlow(
  {
    name: 'adaptiveHintsFlow',
    inputSchema: AdaptiveHintInputSchema,
    outputSchema: AdaptiveHintOutputSchema,
  },
  async input => {
    const {output} = await adaptiveHintsPrompt(input);
    return output!;
  }
);



'use server';
/**
 * @fileoverview A Genkit flow for providing adaptive hints for a Sudoku puzzle.
 *
 * This file defines a Genkit flow that takes the current state of a Sudoku
 * puzzle and provides a context-aware hint to the user.
 */

import {ai} from '@/ai/genkit';
import type { AdaptiveHintRequest, AdaptiveHintResponse } from '@/ai/schema/adaptive-hints';
import { AdaptiveHintRequestSchema, AdaptiveHintResponseSchema } from '@/ai/schema/adaptive-hints';


export async function getAdaptiveHint(
  input: AdaptiveHintRequest
): Promise<AdaptiveHintResponse> {
  return getAdaptiveHintFlow(input);
}

const adaptiveHintPrompt = ai.definePrompt({
  name: 'adaptiveHintPrompt',
  input: { schema: AdaptiveHintRequestSchema },
  output: { schema: AdaptiveHintResponseSchema },
  prompt: `
    You are a Sudoku master, providing helpful hints to a player.
    Your goal is to help them learn and improve, not just give away the answer.
    Analyze the provided Sudoku puzzle and player information to give a tailored hint.

    **Player Information:**
    - Difficulty: {{{difficulty}}}
    - Estimated Skill Level: {{{skillLevel}}}/10
    - Puzzle Progress: {{{progress}}}

    **Current Puzzle State:**
    (Empty cells are represented by '.')
    {{{puzzle}}}

    **Your Task:**
    Based on the player's skill and progress, provide one single, specific, and helpful hint.

    - **For beginners (skill level 1-4) or early progress (< 0.3):**
      - Focus on basic techniques.
      - Suggest a specific number to look for in a specific row, column, or 3x3 box.
      - Example Hint: "Look at the top-left 3x3 box. Where can the number 5 go?"
      - Example Reasoning: "This guides the user to a simple placement without giving the exact cell."

    - **For intermediate players (skill level 5-7) or mid-progress (0.3 - 0.7):**
      - Introduce slightly more advanced techniques like 'hidden singles' or 'pointing pairs'.
      - Don't point to the exact cell, but guide them to the area and the logic.
      - Example Hint: "In the middle column, there is only one possible cell for the number 8."
      - Example Reasoning: "This points to a 'hidden single', a common intermediate technique."

    - **For advanced players (skill level 8-10) or late progress (> 0.7):**
      - Hint towards more complex strategies like X-Wing, Swordfish, or Naked/Hidden Pairs/Triples if you can spot one.
      - Be more abstract.
      - Example Hint: "Consider the placement of the number 2 in rows 4 and 6. Does that limit where a 2 can go in any columns?"
      - Example Reasoning: "This hints towards an X-Wing technique, a more advanced strategy."

    **Output Format:**
    Provide your response in the specified JSON format with a 'hint' and a 'reasoning'. The hint should be what the user sees, and the reasoning explains your choice of hint.
    Provide only ONE hint. Do not suggest looking at multiple numbers or boxes.
  `,
});


const getAdaptiveHintFlow = ai.defineFlow(
  {
    name: 'getAdaptiveHintFlow',
    inputSchema: AdaptiveHintRequestSchema,
    outputSchema: AdaptiveHintResponseSchema,
  },
  async (input) => {
    const { output } = await adaptiveHintPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a hint.');
    }
    return output;
  }
);

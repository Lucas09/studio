"use client";

import { Heart, Timer, BrainCircuit } from 'lucide-react';
import { type Difficulty } from '@/lib/sudoku';
import { Card } from '@/components/ui/card';

interface GameHeaderProps {
  difficulty: Difficulty;
  lives: number;
  seconds: number;
}

export default function GameHeader({ difficulty, lives, seconds }: GameHeaderProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <header className="w-full mb-4">
      <Card className="p-2 sm:p-4">
        <div className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2" title="Difficulty">
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="font-semibold text-primary">{capitalizedDifficulty}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" title="Lives">
              <span className="font-semibold text-destructive">{lives}</span>
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-destructive fill-current" />
            </div>
            <div className="flex items-center gap-2" title="Time">
              <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="font-semibold text-primary min-w-[45px]">{formatTime(seconds)}</span>
            </div>
          </div>
        </div>
      </Card>
    </header>
  );
}

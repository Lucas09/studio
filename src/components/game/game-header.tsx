"use client";

import { Heart, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/lib/sudoku';

interface GameHeaderProps {
  difficulty: Difficulty;
  lives: number;
  seconds: number;
}

export default function GameHeader({ difficulty, lives, seconds }: GameHeaderProps) {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="flex items-center justify-between w-full p-4 rounded-lg bg-card shadow-sm">
      <div>
        <Badge variant="outline" className="text-sm capitalize">
          {difficulty}
        </Badge>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{lives}</span>
          <Heart className={`w-6 h-6 ${lives > 0 ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex items-center gap-2 font-mono text-lg">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span>{formatTime(seconds)}</span>
        </div>
      </div>
    </header>
  );
}
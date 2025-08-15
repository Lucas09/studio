"use client";

import { Button } from '@/components/ui/button';
import { Eraser, Edit3 } from 'lucide-react';

interface NumpadProps {
  onNumberClick: (num: number) => void;
  onEraseClick: () => void;
  onNotesClick: () => void;
  isNotesMode: boolean;
}

export default function Numpad({ onNumberClick, onEraseClick, onNotesClick, isNotesMode }: NumpadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-sm mx-auto lg:w-64">
        <div className="grid grid-cols-5 gap-1.5">
            {numbers.map((num) => (
            <Button
                key={num}
                variant="outline"
                className="aspect-square text-2xl h-auto"
                onClick={() => onNumberClick(num)}
            >
                {num}
            </Button>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant={isNotesMode ? "secondary" : "outline"} onClick={onNotesClick} className="py-6">
                <Edit3 className="w-5 h-5 mr-2" />
                Notes
            </Button>
            <Button variant="outline" onClick={onEraseClick} className="py-6">
                <Eraser className="w-5 h-5 mr-2" />
                Erase
            </Button>
        </div>
    </div>
  );
}

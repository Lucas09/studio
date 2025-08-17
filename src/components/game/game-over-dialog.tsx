"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Award, Frown, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameOverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isWin: boolean;
  time: number;
  onNewGame: () => void;
}

export default function GameOverDialog({ isOpen, onClose, isWin, time, onNewGame }: GameOverDialogProps) {
  const router = useRouter();
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleNewGame = () => {
    onNewGame();
    onClose();
  }

  const handleMainMenu = () => {
    router.push('/');
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          {isWin ? (
            <Award className="w-16 h-16 text-yellow-500" />
          ) : (
            <Frown className="w-16 h-16 text-destructive" />
          )}
          <AlertDialogTitle className="text-2xl">
            {isWin ? 'Congratulations!' : 'Game Over'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isWin
              ? `You solved the puzzle in ${formatTime(time)}.`
              : "You've run out of lives. Better luck next time!"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleMainMenu}>
            <Home className="mr-2 h-4 w-4" />
            Main Menu
            </Button>
          <AlertDialogAction onClick={handleNewGame}>Play Again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

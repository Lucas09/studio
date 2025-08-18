"use client";
import React, { useState } from "react";
import { usePlayerId } from "@/hooks/use-player-id";
import Lobby from "@/components/app/lobby";
import MultiplayerLobby from "@/components/app/multiplayer-lobby";
import GameBoard from "@/components/app/game-board";
import type { Game } from "@/lib/game-state";
import DailyChallenges from "@/components/app/daily-challenges";
import Profile from "@/components/app/profile";
import { Home, Trophy, UserCircle } from 'lucide-react';
import { sudokuGenerator } from '@/lib/sudoku';


export default function App() {
  const playerId = usePlayerId();
  const [activeView, setActiveView] = useState("lobby");
  const [gameData, setGameData] = useState<Partial<Game> | null>(null);
  const [language, setLanguage] = React.useState<'da' | 'en'>('da');


  if (!playerId) {
    return <div>Loading...</div>;
  }
  
    const t = { // Midlertidig oversættelsesobjekt for at undgå at skulle importere den store fil.
        da: {
            home: 'Hjem',
            challenges: 'Udfordringer',
            profile: 'Profil',
            title: 'Sudoku',
            continueGame: "Fortsæt spil",
            difficulty: "Sværhedsgrad",
            easy: "Let",
            medium: "Mellem",
            hard: "Svær",
            veryhard: "Meget svær",
            impossible: "Umulig",
            startGameAlone: "Start alene",
            coop: "Co-op",
            vs: "Versus",
            joinGame: "Deltag i spil",
            enterGameId: "Indtast spil-ID",
            join: "Deltag",
            invalidGameId: "Ugyldigt spil-ID",
            gameLobby: "Multiplayer Lobby",
            shareCode: "Del koden med en ven for at spille sammen",
            playerJoined: "En spiller har sluttet sig til!",
            waitingForPlayer: "Venter på en spiller...",
            startGame: "Start spillet",
            waitingForHost: "Venter på værten...",
            waitingForHostDescription: "Kun værten kan starte spillet",
            gameNotFound: "Spil ikke fundet",
            startChallenge: "Start Udfordring",
            dailyChallengesTitle: "Daglige Udfordringer",
            weekdays: ['M', 'T', 'O', 'T', 'F', 'L', 'S'],
            months: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
            settings: 'Indstillinger',
            language: 'Sprog',
            back: 'Tilbage',
            errors: 'Fejl',
            hint: 'Hint',
            erase: 'Slet',
            notes: 'Noter',
            gameOver: 'Spillet er slut',
            gameOverMessage: 'Du har lavet 3 fejl.',
            tryAgain: 'Prøv Igen',
            watchAdForLife: 'Se Reklame for Ekstra Liv',
            opportunity: 'Mulighed!',
            adForHint: 'Se en reklame for et extra hint?',
            adForLife: 'Se reklame for et ekstra liv?',
            yes: 'Ja tak',
            no: 'Nej tak',
            congratulations: 'Tillykke!',
            puzzleSolved: 'Du har løst Sudokuen!',
            backToMenu: 'Tilbage til menuen',
            opponentWon: 'Din modstander vandt!',
            opponent: 'Modstander',
            statistics: 'Statistik',
            memberSince: 'Medlem siden',
            solved: 'Løste',
            bestTime: 'Bedste tid',
            avgTime: 'Gns. tid',
        },
        en: {
            home: 'Home',
            challenges: 'Challenges',
            profile: 'Profile',
            title: 'Sudoku',
            continueGame: "Continue Game",
            difficulty: "Difficulty",
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            veryhard: "Very Hard",
            impossible: "Impossible",
            startGameAlone: "Start Solo",
            coop: "Co-op",
            vs: "Versus",
            joinGame: "Join Game",
            enterGameId: "Enter Game ID",
            join: "Join",
            invalidGameId: "Invalid Game ID",
            gameLobby: "Multiplayer Lobby",
            shareCode: "Share this code with a friend to play",
            playerJoined: "A player has joined!",
            waitingForPlayer: "Waiting for a player...",
            startGame: "Start Game",
            waitingForHost: "Waiting for host...",
            waitingForHostDescription: "Only the host can start the game",
            gameNotFound: "Game not found",
            startChallenge: "Start Challenge",
            dailyChallengesTitle: "Daily Challenges",
            weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            settings: 'Settings',
            language: 'Language',
            back: 'Back',
            errors: 'Errors',
            hint: 'Hint',
            erase: 'Erase',
            notes: 'Notes',
            gameOver: 'Game Over',
            gameOverMessage: 'You made 3 mistakes.',
            tryAgain: 'Try Again',
            watchAdForLife: 'Watch Ad for Extra Life',
            opportunity: 'Opportunity!',
            adForHint: 'Watch an ad for an extra hint?',
            adForLife: 'Watch an ad for an extra life?',
            yes: 'Yes please',
            no: 'No thanks',
            congratulations: 'Congratulations!',
            puzzleSolved: 'You solved the puzzle!',
            backToMenu: 'Back to menu',
            opponentWon: 'Your opponent won!',
            opponent: 'Opponent',
            statistics: 'Statistics',
            memberSince: 'Member since',
            solved: 'Solved',
            bestTime: 'Best time',
            avgTime: 'Avg. time',
        }
    }[language];
  
    const navItems = [
        { view: 'lobby', icon: Home, label: t.home },
        { view: 'daily', icon: Trophy, label: t.challenges },
        { view: 'profile', icon: UserCircle, label: t.profile },
    ];

    const handleBackToLobby = () => {
        setGameData(null);
        setActiveView('lobby');
    }
  
    const handleStartDailyChallenge = (day: number) => {
        if (day) {
            setGameData({ difficulty: 'Medium', mode: `Daily Challenge - Day ${day}` });
            setActiveView("game");
        }
    };
    
  const onStartGame=({ difficulty, mode }) => {
    setGameData({ difficulty, mode });
    setActiveView("game");
  }

  const onResumeGame=() => {
    const saved = localStorage.getItem("savedSudokuGame");
    if (saved) {
      const savedGame = JSON.parse(saved);
      // Ensure all board data is converted back from strings
      savedGame.puzzle = sudokuGenerator.stringToBoard(savedGame.puzzle);
      savedGame.solution = sudokuGenerator.stringToBoard(savedGame.solution);
      if (savedGame.players && savedGame.players[playerId]) {
          savedGame.players[playerId].board = sudokuGenerator.stringToBoard(savedGame.players[playerId].board);
          savedGame.players[playerId].notes = sudokuGenerator.stringToNotes(savedGame.players[playerId].notes);
      }
      setGameData(savedGame);
      setActiveView("game");
    }
  }

  const renderView = () => {
      switch (activeView) {
        case "lobby":
            return (
                <Lobby
                  playerId={playerId}
                  setActiveView={setActiveView}
                  setGameData={setGameData}
                  onStartGame={onStartGame}
                  onResumeGame={onResumeGame}
                  t={t}
                />
            );
        case "multiplayer-lobby":
            return gameData?.gameId ? (
                <MultiplayerLobby
                    game={gameData}
                    playerId={playerId}
                    setActiveView={setActiveView}
                    setGameData={setGameData}
                    t={t}
                />
            ) : <div>{t.gameNotFound}</div>;
        case "game":
             return gameData ? (
                <GameBoard
                  initialGameData={gameData}
                  playerId={playerId}
                  onBack={handleBackToLobby}
                  setGameData={setGameData}
                  t={t}
                />
            ) : <div>{t.gameNotFound}</div>;
        case 'daily':
            return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
        case 'profile':
            return <Profile t={t} language={language} setLanguage={setLanguage} />;
        default:
             return (
                <Lobby
                  playerId={playerId}
                  setActiveView={setActiveView}
                  setGameData={setGameData}
                  onStartGame={onStartGame}
                  onResumeGame={onResumeGame}
                  t={t}
                />
            );
      }
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-lg">
        <main className="flex-grow overflow-auto">
            {renderView()}
        </main>
        {activeView !== 'game' && activeView !== 'multiplayer-lobby' && (
             <nav className="grid grid-cols-3 gap-2 p-2 bg-white border-t border-gray-200">
                {navItems.map(item => (
                    <button key={item.view} onClick={() => setActiveView(item.view)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${activeView === item.view ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </nav>
        )}
    </div>
  );
}

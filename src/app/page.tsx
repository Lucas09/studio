
"use client";
import React from 'react';
import { Home, Calendar, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Game, GameDifficulty, GameMode } from '@/services/game-service';
import { gameService } from '@/services/game-service';
import { sudokuGenerator } from '@/lib/sudoku';
import { translations } from '@/lib/translations';

import Lobby from '@/components/app/lobby';
import GameBoard from '@/components/app/game-board';
import MultiplayerLobby from '@/components/app/multiplayer-lobby';
import DailyChallenges from '@/components/app/daily-challenges';
import Profile from '@/components/app/profile';

export default function App() {
    const [language, setLanguage] = React.useState('da');
    const [activeView, setActiveView] = React.useState('lobby');
    const [gameData, setGameData] = React.useState<Game | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        setIsClient(true);
    }, []);
    
    const t = translations[language];

     React.useEffect(() => {
        if (!gameData || !gameData.gameId || gameData.mode === 'Solo') return;

        const unsubscribe = gameService.onGameUpdate(gameData.gameId, (updatedGame) => {
            if (updatedGame && updatedGame.status === 'active' && activeView !== 'game') {
                setActiveView('game');
                setGameData({
                    ...updatedGame,
                    notes: gameService.deserializeNotes(updatedGame.notes)
                });
            }
        });

        return () => unsubscribe();
    }, [gameData?.gameId, gameData?.mode, activeView]);


    const handleSaveGame = (currentGameState) => {
        if (typeof window !== 'undefined' && currentGameState.mode === 'Solo') {
            const { puzzle, solution, board, ...rest } = currentGameState;
             const gameToSave = {
                ...rest,
                puzzle: Array.isArray(puzzle) ? puzzle : Object.values(puzzle),
                solution: Array.isArray(solution) ? solution : Object.values(solution),
                board: Array.isArray(board) ? board : Object.values(board),
            };
            localStorage.setItem('savedSudokuGame', JSON.stringify(gameToSave));
        }
    };

    const startSoloGame = ({difficulty, mode}) => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        const newGameData: Game = {
            puzzle, 
            solution, 
            difficulty, 
            mode,
            board: puzzle.map(row => [...row]), 
            notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
            errors: 0, 
            timer: 0,
            hints: 3,
            errorCells: [],
            status: 'active',
            playerCount: 1,
        };
        setGameData(newGameData);
        setActiveView('game');
        handleSaveGame(newGameData);
    };

    const handleResumeGame = () => {
        if (typeof window !== 'undefined') {
            const savedGameJSON = localStorage.getItem('savedSudokuGame');
            if (savedGameJSON) {
                const savedGameData = JSON.parse(savedGameJSON);
                setGameData({
                    ...savedGameData,
                    notes: savedGameData.notes.map(row => row.map(cell => new Set(cell)))
                });
                setActiveView('game');
            }
        }
    };
    
    const handleCreateMultiplayerGame = async ({difficulty, mode}: {difficulty: GameDifficulty, mode: GameMode}) => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        try {
            const gameId = await gameService.createGame({ puzzle, solution, difficulty, mode });
            const initialGameData: Game = {
                gameId,
                puzzle,
                solution,
                difficulty,
                mode,
                status: 'lobby',
                board: puzzle.map(row => [...row]),
                notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
                errors: 0,
                timer: 0,
                hints: 3,
                errorCells: [],
                playerCount: 1,
            };
            setGameData(initialGameData);
            setActiveView('multiplayerLobby');
        } catch (error) {
            console.error("Error creating game:", error);
            toast({ title: "Error", description: "Could not create game.", variant: "destructive" });
        }
    };

    const handleJoinMultiplayerGame = async (gameId) => {
        if (!gameId || gameId.length !== 6) {
            toast({ title: t.invalidGameId, variant: "destructive" });
            return;
        }

        try {
            const game = await gameService.joinGame(gameId);
            if (game) {
                 setGameData({
                    ...game,
                    notes: gameService.deserializeNotes(game.notes),
                });
                if (game.status === 'active') {
                    setActiveView('game');
                } else {
                    setActiveView('multiplayerLobby');
                }
            } else {
                toast({ title: t.gameNotFound, variant: "destructive" });
            }
        } catch (error) {
            console.error("Error joining game:", error);
            toast({ title: t.gameNotFound, variant: "destructive" });
        }
    };
    
    const handleStartDailyChallenge = (day) => {
        if (day) {
            startSoloGame({difficulty: 'Medium', mode: `Daily Challenge - Day ${day}`});
        }
    };
    
    const handleGameExit = () => {
        const previousView = gameData?.mode?.startsWith('Daily') ? 'daily' : 'lobby';
        if (typeof window !== 'undefined' && gameData?.mode === 'Solo') {
            localStorage.removeItem('savedSudokuGame');
        }
        setGameData(null);
        setActiveView(previousView);
    };

    const renderView = () => {
        switch (activeView) {
            case 'game': 
                return <GameBoard initialGameData={gameData} onBack={handleGameExit} onSave={handleSaveGame} t={t} />;
            case 'multiplayerLobby':
                return <MultiplayerLobby 
                            gameId={gameData.gameId} 
                            onBack={handleGameExit}
                            t={t}
                        />;
            case 'daily': 
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile': 
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'lobby': 
            default: 
                return <Lobby 
                            onStartGame={startSoloGame} 
                            onCreateMultiplayerGame={handleCreateMultiplayerGame}
                            onJoinMultiplayerGame={handleJoinMultiplayerGame}
                            onResumeGame={handleResumeGame}
                            t={t}
                        />;
        }
    };

    const NavItem = ({ view, icon, label }) => (
        <button onClick={() => setActiveView(view)} className={`flex flex-col items-center justify-center w-full pt-3 pb-3 transition-colors ${activeView === view ? 'text-blue-500' : 'text-gray-400 hover:text-gray-800'}`}>
            {icon}
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );
    
    if (!isClient) {
        return (
            <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col max-w-lg mx-auto shadow-2xl">
              <main className="flex-grow overflow-y-auto relative"></main>
              <nav className="flex justify-around bg-white border-t border-gray-200 shadow-lg pb-safe">
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <Home /><span className="text-xs mt-1 font-medium">{t.home}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <Calendar /><span className="text-xs mt-1 font-medium">{t.challenges}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <User /><span className="text-xs mt-1 font-medium">{t.profile}</span>
                    </div>
              </nav>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col max-w-lg mx-auto shadow-2xl">
            <main className="flex-grow overflow-y-auto relative">
                {renderView()}
            </main>
            {activeView !== 'game' && activeView !== 'multiplayerLobby' && (
                <nav className="flex justify-around bg-white border-t border-gray-200 shadow-lg pb-safe">
                    <NavItem view="lobby" icon={<Home />} label={t.home} />
                    <NavItem view="daily" icon={<Calendar />} label={t.challenges} />
                    <NavItem view="profile" icon={<User />} label={t.profile} />
                </nav>
            )}
        </div>
    );
}


"use client";
import React from 'react';
import { Home, Calendar, User, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Game, GameDifficulty, GameMode } from '@/services/game-service';
import { gameService } from '@/services/game-service';
import { sudokuGenerator } from '@/lib/sudoku';
import { translations } from '@/lib/translations';

import Lobby from '@/components/app/lobby';
import GameBoard from '@/components/app/game-board';
import DailyChallenges from '@/components/app/daily-challenges';
import Profile from '@/components/app/profile';
import { v4 as uuidv4 } from 'uuid';

const MultiplayerLobby = ({ game, t }) => {
    const { toast } = useToast();
    const handleCopy = () => {
        navigator.clipboard.writeText(game.gameId);
        toast({ title: "Copied!", description: "Game code copied to clipboard." });
    };

    const playerIds = Object.keys(game.players || {});
    
    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-purple-600 mb-4">{t.gameLobby}</h1>
            <p className="text-gray-600 mb-6">{t.shareCode}</p>
            <div className="bg-white p-4 rounded-lg shadow-inner flex items-center justify-center space-x-4 mb-8">
                <span className="text-2xl font-mono tracking-widest text-gray-700">{game.gameId}</span>
                <button onClick={handleCopy} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"><Copy/></button>
            </div>
            {playerIds.length < 2 ? (
                <p className="text-lg text-gray-500 animate-pulse">{t.waitingForPlayer}</p>
            ) : (
                <p className="text-lg text-green-500 font-semibold">{t.playerJoined}</p>
            )}
        </div>
    );
};


export default function App() {
    const [language, setLanguage] = React.useState('da');
    const [activeView, setActiveView] = React.useState('lobby');
    const [gameData, setGameData] = React.useState<Game | null>(null);
    const [playerId, setPlayerId] = React.useState<string | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        setIsClient(true);
        let storedPlayerId = localStorage.getItem('sudokuPlayerId');
        if (!storedPlayerId) {
            storedPlayerId = uuidv4();
            localStorage.setItem('sudokuPlayerId', storedPlayerId);
        }
        setPlayerId(storedPlayerId);
    }, []);
    
    const t = translations[language];

    const handleSaveGame = (currentGameState) => {
        if (typeof window !== 'undefined' && currentGameState.mode === 'Solo') {
            const { puzzle, solution, ...rest } = currentGameState;
             const gameToSave = {
                ...rest,
                puzzle: Array.isArray(puzzle) ? puzzle : Object.values(puzzle),
                solution: Array.isArray(solution) ? solution : Object.values(solution),
                notes: currentGameState.notes ? gameService.serializeNotes(currentGameState.notes) : [],
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
            players: {},
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
                    notes: savedGameData.notes ? gameService.deserializeNotes(savedGameData.notes) : Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()))
                });
                setActiveView('game');
            }
        }
    };

    const handleCreateMultiplayerGame = async ({ difficulty, mode }) => {
        if (!playerId) return;
        const newGame = await gameService.createGame(difficulty, mode, playerId);
        if (newGame) {
            setGameData(newGame);
            setActiveView('multiplayerLobby');
        }
    };

    const handleJoinMultiplayerGame = async (gameId: string) => {
        if (!playerId) return;
        const joinedGame = await gameService.joinGame(gameId, playerId);
        if (joinedGame) {
            setGameData(joinedGame);
            setActiveView('game');
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: t.gameNotFound,
            });
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
                return <GameBoard initialGameData={gameData} onBack={handleGameExit} onSave={handleSaveGame} t={t} playerId={playerId} />;
            case 'multiplayerLobby':
                return <MultiplayerLobby game={gameData} t={t} />;
            case 'daily': 
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile': 
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'lobby': 
            default: 
                return <Lobby 
                            onStartGame={startSoloGame} 
                            onResumeGame={handleResumeGame}
                            onCreateMultiplayerGame={handleCreateMultiplayerGame}
                            onJoinMultiplayerGame={handleJoinMultiplayerGame}
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

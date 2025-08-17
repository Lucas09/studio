
"use client";
import React from 'react';
import { Home, Swords, Trophy, UserCircle, Download } from 'lucide-react';
import Lobby from '@/components/app/lobby';
import GameBoard from '@/components/app/game-board';
import DailyChallenges from '@/components/app/daily-challenges';
import Profile from '@/components/app/profile';
import MultiplayerLobby from '@/components/app/multiplayer-lobby';
import { translations } from '@/lib/translations';
import { sudokuGenerator } from '@/lib/sudoku';
import type { Game, GameDifficulty, GameMode } from '@/lib/game-state';
import { createGame, joinGame } from '@/services/game-service';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { useGameUpdates } from '@/hooks/use-game-updates';

type View = 'lobby' | 'game' | 'daily' | 'profile' | 'multiplayer-lobby';

const App = () => {
    const [view, setView] = React.useState<View>('lobby');
    const [gameId, setGameId] = React.useState<string | null>(null);
    const { gameData, setGameData } = useGameUpdates(gameId);
    const [language, setLanguage] = React.useState<'da' | 'en'>('da');
    const [playerId, setPlayerId] = React.useState('');
    const { toast } = useToast();

    React.useEffect(() => {
        let storedPlayerId = localStorage.getItem('sudokuPlayerId');
        if (!storedPlayerId) {
            storedPlayerId = uuidv4();
            localStorage.setItem('sudokuPlayerId', storedPlayerId);
        }
        setPlayerId(storedPlayerId);
    }, []);

    React.useEffect(() => {
        if (gameData?.status === 'active' && view !== 'game' && gameData.gameId) {
          setView('game');
        }
    }, [gameData, view]);


    const t = translations[language];

    const startSoloGame = (options: { difficulty: GameDifficulty, mode: GameMode }) => {
        const { puzzle, solution } = sudokuGenerator.generate(options.difficulty);
        const newGame: Game = {
            difficulty: options.difficulty,
            mode: options.mode,
            puzzle: puzzle,
            solution: solution,
            status: 'active',
            players: {
                [playerId]: {
                    id: playerId,
                    board: JSON.parse(JSON.stringify(puzzle)),
                    notes: sudokuGenerator.createEmptyNotes(),
                    errors: 0,
                    timer: 0,
                    errorCells: [],
                    hints: 3,
                }
            }
        };
        setGameData(newGame);
        setView('game');
        if (options.mode === 'Solo') {
            handleSaveGame(newGame);
        }
    };
    
    const handleCreateMultiplayerGame = async (options: { difficulty: GameDifficulty, mode: GameMode }) => {
        if (!playerId) return;
        const newGame = await createGame(options.difficulty, options.mode, playerId);
        if (newGame && newGame.gameId) {
            setGameId(newGame.gameId);
            setView('multiplayer-lobby');
        }
    };
    
    const handleJoinMultiplayerGame = async (gameIdToJoin: string) => {
        if (!playerId || !gameIdToJoin) return;
        const joinedGame = await joinGame(gameIdToJoin, playerId);
        if (joinedGame && joinedGame.gameId) {
             setGameId(joinedGame.gameId);
             if (joinedGame.status === 'waiting') {
                setView('multiplayer-lobby');
             } else if (joinedGame.status === 'active') {
                setView('game');
             }
        } else {
            toast({ title: t.gameNotFound, variant: 'destructive'});
        }
    };

    const handleResumeGame = () => {
        const savedGameString = localStorage.getItem('savedSudokuGame');
        if (savedGameString) {
            const savedGame = JSON.parse(savedGameString);
            Object.values(savedGame.players).forEach((player: any) => {
                if(player.notes) {
                    player.notes = sudokuGenerator.stringToNotes(player.notes);
                }
            });
            setGameData(savedGame);
            setView('game');
        }
    };

    const handleSaveGame = (currentGameData: Game | null) => {
        if (currentGameData && currentGameData.mode === 'Solo') {
            const savableGameData = {
                ...currentGameData,
                players: Object.fromEntries(
                    Object.entries(currentGameData.players).map(([pid, pdata]) => [
                        pid,
                        {
                            ...pdata,
                            notes: sudokuGenerator.notesToString(pdata.notes),
                        },
                    ])
                ),
            };
            localStorage.setItem('savedSudokuGame', JSON.stringify(savableGameData));
        }
    };
    
    const handleBackToLobby = () => {
        if (gameData?.mode === 'Solo') {
            handleSaveGame(gameData);
        }
        setGameData(null);
        setGameId(null);
        setView('lobby');
    };
    
    const handleStartDailyChallenge = (day: number) => {
        if (day) {
            startSoloGame({difficulty: 'Medium', mode: `Daily Challenge - Day ${day}`});
        }
    };

    const renderView = () => {
        if (!playerId) return <div>Loading player...</div>;
        
        switch (view) {
            case 'game':
                return gameData ? <GameBoard initialGameData={gameData} onBack={handleBackToLobby} onSave={handleSaveGame} t={t} playerId={playerId} /> : <div>{t.gameNotFound}</div>;
            case 'daily':
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile':
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'multiplayer-lobby':
                 return gameData ? <MultiplayerLobby game={gameData} t={t} setActiveView={setView} setGameData={setGameData} playerId={playerId}/> : <div>{t.gameNotFound}</div>
            case 'lobby':
            default:
                return <Lobby onStartGame={startSoloGame} onResumeGame={handleResumeGame} onCreateMultiplayerGame={handleCreateMultiplayerGame} onJoinMultiplayerGame={handleJoinMultiplayerGame} t={t} />;
        }
    };

    const navItems = [
        { view: 'lobby', icon: Home, label: t.home },
        { view: 'daily', icon: Trophy, label: t.challenges },
        { view: 'profile', icon: UserCircle, label: t.profile },
    ];

    return (
        <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-lg">
            <main className="flex-grow overflow-auto">
                {renderView()}
            </main>
            {view !== 'game' && view !== 'multiplayer-lobby' && (
                 <nav className="grid grid-cols-3 gap-2 p-2 bg-white border-t border-gray-200">
                    {navItems.map(item => (
                        <button key={item.view} onClick={() => setView(item.view as View)} className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${view === item.view ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};

export default App;

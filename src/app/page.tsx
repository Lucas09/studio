
"use client";
import React from 'react';
import { Home, Trophy, UserCircle } from 'lucide-react';
import Lobby from '@/components/app/lobby';
import GameBoard from '@/components/app/game-board';
import DailyChallenges from '@/components/app/daily-challenges';
import Profile from '@/components/app/profile';
import MultiplayerLobby from '@/components/app/multiplayer-lobby';
import { translations } from '@/lib/translations';
import { sudokuGenerator } from '@/lib/sudoku';
import type { Game, GameDifficulty, GameMode } from '@/lib/game-state';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { useGameUpdates } from '@/hooks/use-game-updates';

type View = 'lobby' | 'game' | 'daily' | 'profile' | 'multiplayer-lobby';

const App = () => {
    const [view, setView] = React.useState<View>('lobby');
    const [gameId, setGameId] = React.useState<string | null>(null);
    const [soloGameData, setSoloGameData] = React.useState<Game | null>(null);
    const { gameData: multiplayerGameData, setGameData: setMultiplayerGameData } = useGameUpdates(gameId);
    const [language, setLanguage] = React.useState<'da' | 'en'>('da');
    const [playerId, setPlayerId] = React.useState('');
    const { toast } = useToast();

    const gameData = gameId ? multiplayerGameData : soloGameData;
    const setGameData = gameId ? setMultiplayerGameData : setSoloGameData;

    React.useEffect(() => {
        let storedPlayerId = localStorage.getItem('sudokuPlayerId');
        if (!storedPlayerId) {
            storedPlayerId = uuidv4();
            localStorage.setItem('sudokuPlayerId', storedPlayerId);
        }
        setPlayerId(storedPlayerId);
    }, []);

    React.useEffect(() => {
        if (gameId && !multiplayerGameData) {
            // This case can happen if we set a gameId but the initial fetch hasn't completed.
            // We can show a loading state or just wait. For now, we wait.
            return;
        }
        if (multiplayerGameData?.status === 'active' && view !== 'game' && multiplayerGameData.gameId) {
          setView('game');
        }
    }, [multiplayerGameData, view, gameId]);


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
        setSoloGameData(newGame);
        setView('game');
    };
    
    const handleResumeGame = () => {
        const savedGameString = localStorage.getItem('savedSudokuGame');
        if (savedGameString) {
            const savedGame = JSON.parse(savedGameString);
            
            // Critical fix: Ensure all board-like structures are converted from strings
            const puzzle = sudokuGenerator.stringToBoard(savedGame.puzzle);
            const solution = sudokuGenerator.stringToBoard(savedGame.solution);
            
            const playerState = savedGame.players[playerId];
            if (playerState) {
                playerState.board = sudokuGenerator.stringToBoard(playerState.board);
                playerState.notes = sudokuGenerator.stringToNotes(playerState.notes);
            }
            
            const gameToResume: Game = {
                ...savedGame,
                puzzle: puzzle,
                solution: solution,
                players: {
                    ...savedGame.players,
                    [playerId]: playerState,
                }
            };
    
            setSoloGameData(gameToResume);
            setView('game');
        }
    };

    const handleSaveGame = (currentGameData: Game | null) => {
        if (currentGameData && currentGameData.mode === 'Solo' && playerId && currentGameData.players[playerId]) {
            const playerState = currentGameData.players[playerId];
            const savableGameData = {
                ...currentGameData,
                puzzle: sudokuGenerator.boardToString(currentGameData.puzzle),
                solution: sudokuGenerator.boardToString(currentGameData.solution),
                players: {
                    [playerId]: {
                        ...playerState,
                        board: sudokuGenerator.boardToString(playerState.board),
                        notes: sudokuGenerator.notesToString(playerState.notes),
                    }
                },
            };
            localStorage.setItem('savedSudokuGame', JSON.stringify(savableGameData));
        }
    };
    
    const handleBackToLobby = () => {
        if (gameData?.mode === 'Solo') {
            handleSaveGame(gameData);
        }
        setSoloGameData(null);
        setGameId(null); // This will also clear multiplayerGameData via the hook
        setView('lobby');
    };
    
    const handleStartDailyChallenge = (day: number) => {
        if (day) {
            startSoloGame({difficulty: 'Medium', mode: `Daily Challenge - Day ${day}`});
        }
    };
    
     const handleSetMultiplayerGame = (data: { gameId: string }) => {
        setGameId(data.gameId);
    };

    const renderView = () => {
        if (!playerId) return <div className="flex justify-center items-center h-full">Loading player...</div>;
        
        switch (view) {
            case 'game':
                // Pass the correct game data based on whether it's solo or multiplayer
                const activeGameData = gameId ? multiplayerGameData : soloGameData;
                return activeGameData ? <GameBoard initialGameData={activeGameData} onBack={handleBackToLobby} onSave={handleSaveGame} t={t} playerId={playerId} gameId={gameId} setGameData={setGameData} /> : <div>{t.gameNotFound}</div>;
            case 'daily':
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile':
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'multiplayer-lobby':
                 // The lobby needs the most up-to-date version of the game data
                 return multiplayerGameData ? <MultiplayerLobby game={multiplayerGameData} t={t} setActiveView={setView} setGameData={setMultiplayerGameData} playerId={playerId}/> : <div className="flex justify-center items-center h-full">{t.gameNotFound}</div>
            case 'lobby':
            default:
                return <Lobby 
                          onStartGame={startSoloGame} 
                          onResumeGame={handleResumeGame} 
                          setActiveView={setView}
                          setGameData={handleSetMultiplayerGame}
                          playerId={playerId}
                          t={t} 
                       />;
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

    
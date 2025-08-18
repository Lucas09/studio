
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
        if (multiplayerGameData?.status === 'active' && view !== 'game' && multiplayerGameData.gameId) {
          setView('game');
        }
    }, [multiplayerGameData, view]);


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
            
            const playerState = savedGame.players[playerId];
            if (playerState) {
                if(playerState.notes && typeof playerState.notes === 'string') {
                    playerState.notes = sudokuGenerator.stringToNotes(playerState.notes);
                }
                if(playerState.board && typeof playerState.board === 'string') {
                    playerState.board = sudokuGenerator.stringToBoard(playerState.board);
                }
            }
            
            const gameToResume: Game = {
                ...savedGame,
                puzzle: sudokuGenerator.stringToBoard(savedGame.puzzle),
                solution: sudokuGenerator.stringToBoard(savedGame.solution),
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
            // Create a savable version of the game data
            const savableGameData = {
                ...currentGameData,
                 // board and notes must be converted to strings for localStorage
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
                return gameData ? <GameBoard initialGameData={gameData} onBack={handleBackToLobby} onSave={handleSaveGame} t={t} playerId={playerId} gameId={gameId} setGameData={setGameData} /> : <div>{t.gameNotFound}</div>;
            case 'daily':
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile':
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'multiplayer-lobby':
                 return gameData ? <MultiplayerLobby game={gameData} t={t} setActiveView={setView} setGameData={setMultiplayerGameData} playerId={playerId}/> : <div>{t.gameNotFound}</div>
            case 'lobby':
            default:
                return <Lobby 
                          onStartGame={startSoloGame} 
                          onResumeGame={handleResumeGame} 
                          setActiveView={setView}
                          setGameData={(data) => setGameId(data.gameId)}
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

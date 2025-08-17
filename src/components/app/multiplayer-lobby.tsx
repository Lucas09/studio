
"use client";
import React from 'react';
import { Copy, Users, Sword } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Game } from '@/services/game-service';
import { getGameUpdates, startGame } from '@/services/game-service';

const MultiplayerLobby = ({ game, t, setActiveView, setGameData, playerId }) => {
    const { toast } = useToast();

    // Listen for game updates
    React.useEffect(() => {
        if (game?.gameId) {
            const unsubscribe = getGameUpdates(game.gameId, (updatedGame) => {
                if (updatedGame) {
                    setGameData(updatedGame);
                    // If game becomes active, switch to game board view
                    if (updatedGame.status === 'active' && Object.keys(updatedGame.players).length > 1) {
                        setActiveView('game');
                    }
                }
            });
            return () => unsubscribe();
        }
    }, [game?.gameId, setGameData, setActiveView]);

    const handleCopyCode = () => {
        if (game?.gameId) {
            navigator.clipboard.writeText(game.gameId);
            toast({
                title: "Copied!",
                description: "Game code copied to clipboard.",
            });
        }
    };

    const handleStartGame = () => {
        if(game?.gameId && Object.keys(game.players).length > 1) {
            // The creator of the game should be the one starting it.
             startGame(game.gameId);
        }
    };
    
    if (!game) {
        return <div className="flex justify-center items-center h-full">{t.gameNotFound}</div>
    }

    const isCoop = game.mode === 'Co-op';
    const playerIds = Object.keys(game.players || {});
    const hasTwoPlayers = playerIds.length > 1;
    // The player who created the game is the first one in the playerIds array.
    const isCreator = playerIds[0] === playerId;

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">{t.gameLobby}</h1>
                <p className="text-gray-600 mb-6">{t.shareCode}</p>

                <div className="bg-gray-100 border-dashed border-2 border-gray-300 rounded-xl p-4 flex items-center justify-center mb-6">
                    <span className="text-2xl font-mono font-bold text-gray-700 mr-4 tracking-widest">{game.gameId}</span>
                    <button onClick={handleCopyCode} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                        <Copy className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                
                <div className="flex items-center justify-center space-x-4 mb-8">
                     {isCoop ? <Users className="h-8 w-8 text-teal-500" /> : <Sword className="h-8 w-8 text-red-500" />}
                     <span className="text-xl font-semibold">{isCoop ? t.coop : t.vs}</span>
                </div>

                <div className="min-h-[60px] mb-8">
                    {hasTwoPlayers ? (
                        <p className="text-green-600 font-semibold animate-pulse text-lg">{t.playerJoined}</p>
                    ) : (
                        <p className="text-gray-500 text-lg">{t.waitingForPlayer}</p>
                    )}
                </div>

                <button 
                    onClick={handleStartGame} 
                    disabled={!hasTwoPlayers || !isCreator}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreator ? t.startGame : t.waitingForHost}
                </button>
                 {!isCreator && <p className="text-sm text-gray-500 mt-4">{t.waitingForHostDescription}</p>}
            </div>
        </div>
    );
};

export default MultiplayerLobby;

    


"use client";
import React from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { gameService } from '@/services/game-service';

const MultiplayerLobby = ({ gameId, onBack, t }) => {
    const [copied, setCopied] = React.useState(false);
    const [playerCount, setPlayerCount] = React.useState(1);

    React.useEffect(() => {
        if (!gameId) return;
        const unsubscribe = gameService.onGameUpdate(gameId, (game) => {
            if (game) {
                setPlayerCount(game.playerCount);
            }
        });
        return () => unsubscribe();
    }, [gameId]);


    const copyToClipboard = () => {
         if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(gameId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full items-center justify-center text-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm relative">
                <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ArrowLeft /></button>
                <h2 className="text-2xl font-bold mb-4">{t.gameLobby}</h2>
                <p className="text-gray-600 mb-6">{t.shareCode}</p>
                <div className="flex items-center justify-center space-x-2 bg-gray-100 p-4 rounded-lg mb-6">
                    <span className="text-3xl font-bold tracking-widest text-blue-600">{gameId}</span>
                    <button onClick={copyToClipboard} className="p-2 rounded-full hover:bg-gray-300 transition-colors">
                        {copied ? <Check className="text-green-500" /> : <Copy />}
                    </button>
                </div>
                 {playerCount < 2 ? 
                    <p className="text-gray-500 mb-6 animate-pulse">{t.waitingForPlayer}</p>
                    :
                    <p className="text-green-500 mb-6 font-semibold">{t.playerJoined}</p>
                }
                <button onClick={() => gameService.updateGame(gameId, { status: 'active' })} disabled={playerCount < 2} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-transform transform hover:scale-105 disabled:opacity-50">
                    {t.startGame}
                </button>
            </div>
        </div>
    );
};

export default MultiplayerLobby;

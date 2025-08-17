
"use client";
import React from 'react';
import { History, Users, Sword } from 'lucide-react';
import type { GameDifficulty, GameMode } from '@/lib/game-state';

const Lobby = ({ onStartGame, onResumeGame, onCreateMultiplayerGame, onJoinMultiplayerGame, t }) => {
    const [difficulty, setDifficulty] = React.useState<GameDifficulty>('Easy');
    const [hasSavedGame, setHasSavedGame] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState('');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasSavedGame(!!localStorage.getItem('savedSudokuGame'))
        }
    }, []);

    const difficulties = {
        'Easy': t.easy, 'Medium': t.medium, 'Hard': t.hard,
        'Very Hard': t.veryhard, 'Impossible': t.impossible
    };
    
    const handleJoinSubmit = (e) => {
        e.preventDefault();
        if (joinCode.trim().length === 20) { // Firestore IDs are 20 chars
            onJoinMultiplayerGame(joinCode.trim());
        } else {
            alert(t.invalidGameId);
        }
    }

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">{t.title}</h1>

            {hasSavedGame && (<button onClick={onResumeGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl mb-8 flex items-center justify-center transition-transform transform hover:scale-105"><History className="mr-3" /> {t.continueGame}</button>)}

            <div className="bg-white p-6 rounded-2xl shadow-md flex-grow flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t.difficulty}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {Object.entries(difficulties).map(([key, value]) => (<button key={key} onClick={() => setDifficulty(key as GameDifficulty)} className={`py-3 rounded-lg text-sm font-semibold transition-colors ${difficulty === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{value}</button>))}
                </div>

                <div className="flex flex-col space-y-4 mb-6">
                    <button onClick={() => onStartGame({ difficulty, mode: 'Solo' })} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105">{t.startGameAlone}</button>
                    <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Co-op'})} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105"><Users className="mr-3"/>{t.coop}</button>
                    <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Versus'})} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105"><Sword className="mr-3"/>{t.vs}</button>
                </div>
                
                <div className="mt-auto">
                    <hr className="my-6 border-gray-200" />
                    <h3 className="text-lg font-semibold mb-4 text-center">{t.joinGame}</h3>
                     <form onSubmit={handleJoinSubmit} className="flex flex-col space-y-3">
                        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} type="text" placeholder={t.enterGameId} className="w-full p-3 border rounded-lg text-center" />
                        <button type="submit" className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl">{t.join}</button>
                     </form>
                </div>
            </div>
        </div>
    );
};

export default Lobby;

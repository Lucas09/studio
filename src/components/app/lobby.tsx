
"use client";
import React from 'react';
import { History, Users, Swords, Copy, Check } from 'lucide-react';
import type { GameDifficulty } from '@/services/game-service';

const Lobby = ({ onStartGame, onCreateMultiplayerGame, onJoinMultiplayerGame, onResumeGame, t }) => {
    const [difficulty, setDifficulty] = React.useState<GameDifficulty>('Easy');
    const [gameMode, setGameMode] = React.useState(null);
    const [multiplayerStep, setMultiplayerStep] = React.useState(null);
    const [joinGameId, setJoinGameId] = React.useState('');
    const [hasSavedGame, setHasSavedGame] = React.useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasSavedGame(!!localStorage.getItem('savedSudokuGame'))
        }
    }, []);


    const difficulties = {
        'Easy': t.easy, 'Medium': t.medium, 'Hard': t.hard, 
        'Very Hard': t.veryhard, 'Impossible': t.impossible
    };

    const handleMultiplayerClick = () => {
        if (gameMode === 'multi') {
            setGameMode(null);
            setMultiplayerStep(null);
        } else {
            setGameMode('multi');
            setMultiplayerStep('choice');
        }
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">{t.title}</h1>
            
            {hasSavedGame && (<button onClick={onResumeGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl mb-8 flex items-center justify-center transition-transform transform hover:scale-105"><History className="mr-3" /> {t.continueGame}</button>)}

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t.difficulty}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {Object.entries(difficulties).map(([key, value]) => (<button key={key} onClick={() => setDifficulty(key as GameDifficulty)} className={`py-3 rounded-lg text-sm font-semibold transition-colors ${difficulty === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{value}</button>))}
                </div>

                <div className="flex flex-col space-y-4">
                     <button onClick={() => onStartGame({difficulty, mode: 'Solo'})} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105">{t.startGameAlone}</button>
                    <button onClick={handleMultiplayerClick} className={`w-full text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-colors ${gameMode === 'multi' ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'}`}>{t.startGameMultiplayer}</button>
                </div>

                {gameMode === 'multi' && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        {multiplayerStep === 'choice' && (
                            <>
                                <h3 className="font-semibold mb-3 text-center">{t.playTogether}</h3>
                                <div className="flex flex-col space-y-3">
                                    <button onClick={() => setMultiplayerStep('create')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg">{t.createNewGame}</button>
                                    <button onClick={() => setMultiplayerStep('join')} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg">{t.joinGame}</button>
                                </div>
                            </>
                        )}
                        {multiplayerStep === 'create' && (
                             <>
                                <h3 className="font-semibold mb-3 text-center">{t.createNewGame}</h3>
                                <div className="flex space-x-4 mb-4">
                                    <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Co-op'})} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg flex items-center justify-center"><Users className="mr-2 h-5 w-5" /> {t.coop}</button>
                                    <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Versus'})} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center"><Swords className="mr-2 h-5 w-5" /> {t.vs}</button>
                                </div>
                             </>
                        )}
                        {multiplayerStep === 'join' && (
                            <>
                                <h3 className="font-semibold mb-3 text-center">{t.joinGame}</h3>
                                <div className="flex items-center space-x-2">
                                    <input type="text" value={joinGameId} onChange={(e) => setJoinGameId(e.target.value.toUpperCase())} placeholder={t.enterGameId} className="w-full p-3 rounded-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"/>
                                    <button onClick={() => onJoinMultiplayerGame(joinGameId)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded-md">{t.join}</button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lobby;

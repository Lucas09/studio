
"use client";
import React from 'react';
import { User } from 'lucide-react';

const Profile = ({ t, language, setLanguage }) => {
    const stats = {
        'Easy': { solved: 12, bestTime: '03:45', avgTime: '05:12' },
        'Medium': { solved: 8, bestTime: '07:11', avgTime: '09:34' },
        'Hard': { solved: 3, bestTime: '15:23', avgTime: '18:01' },
        'Very Hard': { solved: 1, bestTime: '25:40', avgTime: '25:40' },
        'Impossible': { solved: 0, bestTime: 'N/A', avgTime: 'N/A' },
    };

    const difficulties = {
        'Easy': t.easy,
        'Medium': t.medium,
        'Hard': t.hard,
        'Very Hard': t.veryhard,
        'Impossible': t.impossible
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4 ring-4 ring-white shadow-md"><User className="w-12 h-12 text-white" /></div>
                <h1 className="text-2xl font-bold">Spiller123</h1>
                <p className="text-gray-500">{t.memberSince} Juli 2025</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">{t.statistics}</h2>
                <div className="space-y-3">
                    {Object.entries(stats).map(([difficultyKey, data]) => (
                        <div key={difficultyKey} className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-600">{difficulties[difficultyKey]}</h3>
                            <div className="flex justify-between items-center text-sm mt-2 text-gray-600 flex-wrap gap-2">
                                <span>{t.solved}: <span className="font-semibold text-gray-800">{data.solved}</span></span>
                                <span>{t.bestTime}: <span className="font-semibold text-gray-800">{data.bestTime}</span></span>
                                <span>{t.avgTime}: <span className="font-semibold text-gray-800">{data.avgTime}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-md">
                 <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">{t.settings}</h2>
                 <div className="p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-bold text-blue-600 mb-2">{t.language}</h3>
                    <div className="flex space-x-4">
                        <button onClick={() => setLanguage('da')} className={`w-full py-2 rounded-lg font-semibold ${language === 'da' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Dansk</button>
                        <button onClick={() => setLanguage('en')} className={`w-full py-2 rounded-lg font-semibold ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>English</button>
                    </div>
                 </div>
            </div>
        </div>
    );
};
export default Profile;

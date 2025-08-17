
"use client";
import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';

const DailyChallenges = ({ onStartDailyChallenge, t }) => {
    const [today, setToday] = React.useState(new Date());
    const [selectedDay, setSelectedDay] = React.useState(new Date().getDate());

    const firstDayOfMonth = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const completedChallenges = [3, 8, 12, 15, 17];
    const calendarDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const emptyDays = Array.from({length: firstDayOfMonth});
    const monthName = t.months[today.getMonth()];

    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">{t.dailyChallengesTitle}</h1>
            <div className="bg-white p-4 rounded-2xl shadow-md flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setToday(new Date(today.setMonth(today.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft /></button>
                    <h2 className="text-xl font-semibold">{monthName} {today.getFullYear()}</h2>
                    <button onClick={() => setToday(new Date(today.setMonth(today.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200 transform rotate-180"><ArrowLeft /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">{t.weekdays.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`}></div>)}
                    {calendarDays.map(day => {
                        const isCompleted = completedChallenges.includes(day);
                        const isToday = day === new Date().getDate() && today.getMonth() === new Date().getMonth();
                        const isFuture = day > new Date().getDate() && today.getMonth() >= new Date().getMonth();
                        const isSelected = day === selectedDay;

                        return (<button 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    disabled={isFuture}
                                    className={`aspect-square rounded-lg flex flex-col justify-center items-center transition-colors 
                                        ${isCompleted ? 'bg-green-500 text-white' :
                                          isFuture ? 'bg-gray-100 text-gray-400' : 
                                          isSelected ? 'bg-yellow-400 text-white ring-2 ring-yellow-500' :
                                          isToday ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 
                                          'bg-gray-200 hover:bg-gray-300'}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}>
                                <span className="text-lg font-bold">{day}</span>
                                {isCompleted && <Trophy className="h-4 w-4 text-yellow-300" />}
                            </button>)
                    })}
                </div>
                <div className="mt-auto pt-4">
                    <button 
                        onClick={() => onStartDailyChallenge(selectedDay)} 
                        disabled={!selectedDay}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.startChallenge}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyChallenges;

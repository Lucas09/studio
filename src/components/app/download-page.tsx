
"use client";
import React from 'react';
import { Download, FileCode } from 'lucide-react';

const allFiles = [
  {
    path: '.env',
    content: ``
  },
  {
    path: 'README.md',
    content: `# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
`
  },
  {
    path: 'apphosting.yaml',
    content: `# Settings to manage and configure a Firebase App Hosting backend.
# https://firebase.google.com/docs/app-hosting/configure

runConfig:
  # Increase this value if you'd like to automatically spin up
  # more instances in response to increased traffic.
  maxInstances: 1
`
  },
  {
    path: 'components.json',
    content: `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
`
  },
  {
    path: 'next.config.ts',
    content: `
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://*.cloudworkstations.dev',
      'https://*.firebase.studio',
    ],
  },
};

export default nextConfig;
`
  },
  {
    path: 'package.json',
    content: `{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
    "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@genkit-ai/googleai": "^1.14.1",
    "@genkit-ai/next": "^1.14.1",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^10.12.2",
    "genkit": "^1.14.1",
    "lucide-react": "^0.475.0",
    "next": "15.3.3",
    "patch-package": "^8.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^9.0.8",
    "genkit-cli": "^1.14.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
`
  },
  {
    path: 'src/ai/dev.ts',
    content: `import { config } from 'dotenv';
config();

import '@/ai/flows/adaptive-hints.ts';
`
  },
  {
    path: 'src/ai/flows/adaptive-hints.ts',
    content: `
'use server';
/**
 * @fileoverview A Genkit flow for providing adaptive hints for a Sudoku puzzle.
 *
 * This file defines a Genkit flow that takes the current state of a Sudoku
 * puzzle and provides a context-aware hint to the user.
 */

import {ai} from '@/ai/genkit';
import type { AdaptiveHintRequest, AdaptiveHintResponse } from '@/ai/schema/adaptive-hints';
import { AdaptiveHintRequestSchema, AdaptiveHintResponseSchema } from '@/ai/schema/adaptive-hints';


export async function getAdaptiveHint(
  input: AdaptiveHintRequest
): Promise<AdaptiveHintResponse> {
  return getAdaptiveHintFlow(input);
}

const adaptiveHintPrompt = ai.definePrompt({
  name: 'adaptiveHintPrompt',
  input: { schema: AdaptiveHintRequestSchema },
  output: { schema: AdaptiveHintResponseSchema },
  prompt: \`
    You are a Sudoku master, providing helpful hints to a player.
    Your goal is to help them learn and improve, not just give away the answer.
    Analyze the provided Sudoku puzzle and player information to give a tailored hint.

    **Player Information:**
    - Difficulty: {{{difficulty}}}
    - Estimated Skill Level: {{{skillLevel}}}/10
    - Puzzle Progress: {{{progress}}}

    **Current Puzzle State:**
    (Empty cells are represented by '.')
    {{{puzzle}}}

    **Your Task:**
    Based on the player's skill and progress, provide one single, specific, and helpful hint.

    - **For beginners (skill level 1-4) or early progress (< 0.3):**
      - Focus on basic techniques.
      - Suggest a specific number to look for in a specific row, column, or 3x3 box.
      - Example Hint: "Look at the top-left 3x3 box. Where can the number 5 go?"
      - Example Reasoning: "This guides the user to a simple placement without giving the exact cell."

    - **For intermediate players (skill level 5-7) or mid-progress (0.3 - 0.7):**
      - Introduce slightly more advanced techniques like 'hidden singles' or 'pointing pairs'.
      - Don't point to the exact cell, but guide them to the area and the logic.
      - Example Hint: "In the middle column, there is only one possible cell for the number 8."
      - Example Reasoning: "This points to a 'hidden single', a common intermediate technique."

    - **For advanced players (skill level 8-10) or late progress (> 0.7):**
      - Hint towards more complex strategies like X-Wing, Swordfish, or Naked/Hidden Pairs/Triples if you can spot one.
      - Be more abstract.
      - Example Hint: "Consider the placement of the number 2 in rows 4 and 6. Does that limit where a 2 can go in any columns?"
      - Example Reasoning: "This hints towards an X-Wing technique, a more advanced strategy."

    **Output Format:**
    Provide your response in the specified JSON format with a 'hint' and a 'reasoning'. The hint should be what the user sees, and the reasoning explains your choice of hint.
    Provide only ONE hint. Do not suggest looking at multiple numbers or boxes.
  \`,
});


const getAdaptiveHintFlow = ai.defineFlow(
  {
    name: 'getAdaptiveHintFlow',
    inputSchema: AdaptiveHintRequestSchema,
    outputSchema: AdaptiveHintResponseSchema,
  },
  async (input) => {
    const { output } = await adaptiveHintPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a hint.');
    }
    return output;
  }
);
`
  },
  {
    path: 'src/ai/genkit.ts',
    content: `import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
`
  },
  {
    path: 'src/ai/schema/adaptive-hints.ts',
    content: `
import {z} from 'genkit';

export const AdaptiveHintRequestSchema = z.object({
  puzzle: z.string().describe('The current state of the Sudoku board as a 9x9 grid string, with empty cells represented by "."'),
  difficulty: z.string().describe('The difficulty of the puzzle (e.g., "easy", "medium", "hard").'),
  skillLevel: z.number().min(1).max(10).describe('The estimated skill level of the player on a scale of 1 to 10.'),
  progress: z.number().min(0).max(1).describe('The player\\'s progress through the puzzle, from 0.0 (start) to 1.0 (nearly complete).'),
});

export const AdaptiveHintResponseSchema = z.object({
  hint: z.string().describe('A clear, actionable hint for the player.'),
  reasoning: z.string().describe('A brief explanation of the logic behind the hint provided.'),
});

export type AdaptiveHintRequest = z.infer<typeof AdaptiveHintRequestSchema>;
export type AdaptiveHintResponse = z.infer<typeof AdaptiveHintResponseSchema>;
`
  },
  {
    path: 'src/app/globals.css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 94.1%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 211 33% 28%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 90%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 84% 63%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 63%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 211 33% 28%;
    --radius: 0.8rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 211 33% 28%;
    --primary-foreground: 0 0% 98%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 0 84% 63%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 0 84% 63%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`
  },
  {
    path: 'src/app/layout.tsx',
    content: `import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SudokuSphere',
  description: 'A social sudoku app, where you can play with or against your friends.',
  icons: [{ rel: "icon", url: "/icon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
`
  },
  {
    path: 'src/app/page.tsx',
    content: `
"use client";
import React from 'react';
import { Home, Calendar, User, Copy, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Game } from '@/services/game-service';
import { gameService } from '@/services/game-service';
import { sudokuGenerator } from '@/lib/sudoku';
import { translations } from '@/lib/translations';

import Lobby from '@/components/app/lobby';
import GameBoard from '@/components/app/game-board';
import DailyChallenges from '@/components/app/daily-challenges';
import Profile from '@/components/app/profile';
import { v4 as uuidv4 } from 'uuid';
import MultiplayerLobby from '@/components/app/multiplayer-lobby';
import DownloadPage from '@/components/app/download-page';


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
            const gameToSave = {
                ...currentGameState,
                 puzzle: sudokuGenerator.boardToString(currentGameState.puzzle),
                 solution: sudokuGenerator.boardToString(currentGameState.solution),
                 notes: sudokuGenerator.notesToString(currentGameState.notes),
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
            status: 'active',
            players: {
                'solo': {
                    id: 'solo',
                    board: puzzle.map(row => [...row]), 
                    notes: Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set())),
                    errors: 0, 
                    timer: 0,
                    hints: 3,
                    errorCells: [],
                }
            }
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
                 const soloPlayer = {
                     board: sudokuGenerator.stringToBoard(savedGameData.puzzle),
                     notes: sudokuGenerator.stringToNotes(savedGameData.notes),
                     errors: savedGameData.errors || 0,
                     timer: savedGameData.timer || 0,
                     hints: savedGameData.hints || 3,
                     errorCells: savedGameData.errorCells || [],
                };
                
                setGameData({
                    ...savedGameData,
                    puzzle: sudokuGenerator.stringToBoard(savedGameData.puzzle),
                    solution: sudokuGenerator.stringToBoard(savedGameData.solution),
                     players: {
                         'solo': soloPlayer
                     }
                });
                setActiveView('game');
            }
        }
    };

    const handleCreateMultiplayerGame = async ({ difficulty, mode }) => {
        if (!playerId) return;
        try {
            const newGame = await gameService.createGame(difficulty, mode, playerId);
            if (newGame) {
                setGameData(newGame);
                setActiveView('multiplayerLobby');
            }
        } catch (error) {
            console.error("Failed to create multiplayer game:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create game. Please try again.",
            });
        }
    };

    const handleJoinMultiplayerGame = async (gameId: string) => {
        if (!playerId) return;
        try {
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
        } catch(error) {
             console.error("Failed to join multiplayer game:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: t.gameNotFound,
            });
        }
    };
    
    const handleStartDailyChallenge = (day) => {
        if (day) {
            startSoloGame({difficulty: 'Medium', mode: \`Daily Challenge - Day \${day}\`});
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
                return <GameBoard initialGameData={gameData} onBack={handleGameExit} onSave={handleSaveGame} t={t} playerId={playerId || 'solo'} />;
            case 'multiplayerLobby':
                return <MultiplayerLobby game={gameData} t={t} setActiveView={setActiveView} setGameData={setGameData} />;
            case 'daily': 
                return <DailyChallenges onStartDailyChallenge={handleStartDailyChallenge} t={t} />;
            case 'profile': 
                return <Profile t={t} language={language} setLanguage={setLanguage} />;
            case 'download':
                return <DownloadPage />;
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
        <button onClick={() => setActiveView(view)} className={\`flex flex-col items-center justify-center w-full pt-3 pb-3 transition-colors \${activeView === view ? 'text-blue-500' : 'text-gray-400 hover:text-gray-800'}\`}>
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
                    <div className="flex flex-col items-center justify-center w-full pt-3 pb-3 text-gray-400">
                        <Download /><span className="text-xs mt-1 font-medium">Download</span>
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
                    <NavItem view="download" icon={<Download />} label="Download" />
                </nav>
            )}
        </div>
    );
}
`
  },
  {
    path: 'src/components/app/daily-challenges.tsx',
    content: `
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
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">{t.weekdays.map((day, index) => <div key={\`\${day}-\${index}\`}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-2">
                    {emptyDays.map((_, i) => <div key={\`empty-\${i}\`}></div>)}
                    {calendarDays.map(day => {
                        const isCompleted = completedChallenges.includes(day);
                        const isToday = day === new Date().getDate() && today.getMonth() === new Date().getMonth();
                        const isFuture = day > new Date().getDate() && today.getMonth() >= new Date().getMonth();
                        const isSelected = day === selectedDay;

                        return (<button 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    disabled={isFuture}
                                    className={\`aspect-square rounded-lg flex flex-col justify-center items-center transition-colors 
                                        \${isCompleted ? 'bg-green-500 text-white' :
                                          isFuture ? 'bg-gray-100 text-gray-400' : 
                                          isSelected ? 'bg-yellow-400 text-white ring-2 ring-yellow-500' :
                                          isToday ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 
                                          'bg-gray-200 hover:bg-gray-300'}
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    \`}>
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
`
  },
  {
    path: 'src/components/app/game-board.tsx',
    content: `
"use client";
import React from 'react';
import { ArrowLeft, Lightbulb, Eraser, BrainCircuit, Repeat, Video } from 'lucide-react';
import type { Game, Player } from '@/services/game-service';
import { gameService } from '@/services/game-service';

const calculateInitialCounts = (board) => {
    const counts = {};
    for (let i = 1; i <= 9; i++) {
        counts[i] = 0;
    }
    if (!board) return counts;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r] && board[r][c] !== null) {
                counts[board[r][c]]++;
            }
        }
    }
    return counts;
};


const Confetti = () => {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);


    if (!isClient) return null;

    const confettiCount = 150;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-4"
                    style={{
                        left: \`\${Math.random() * 100}%\`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animation: \`fall \${3 + Math.random() * 2}s linear \${Math.random() * 5}s infinite\`,
                        transform: \`rotate(\${Math.random() * 360}deg)\`,
                        top: '-20px',
                    }}
                />
            ))}
            <style>{\`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(720deg);
                    }
                }
            \`}</style>
        </div>
    );
};


const GameBoard = ({ initialGameData, onBack, onSave, t, playerId }) => {
    const [gameData, setGameData] = React.useState<Game>(initialGameData);
    const [isNoteMode, setIsNoteMode] = React.useState(false);
    const [selectedCell, setSelectedCell] = React.useState(null);
    const [highlightedNumber, setHighlightedNumber] = React.useState(null);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [isGameWon, setIsGameWon] = React.useState(false);
    const [isAdPlaying, setIsAdPlaying] = React.useState(false);
    const [adMessage, setAdMessage] = React.useState('');
    
    const isMultiplayer = gameData.mode !== 'Solo';
    const playerState: Player | undefined = isMultiplayer ? gameData.players?.[playerId] : gameData.players?.['solo'];
    const opponentId = isMultiplayer ? Object.keys(gameData.players || {}).find(id => id !== playerId) : null;
    const opponentState: Player | undefined = opponentId ? gameData.players?.[opponentId] : null;

    const { board, notes, timer, errors, hints } = playerState || {};
    const [numberCounts, setNumberCounts] = React.useState(() => calculateInitialCounts(board));
    
    const puzzle = gameData.puzzle;
    const solution = gameData.solution;
    
    // Real-time updates for multiplayer
    React.useEffect(() => {
        if (isMultiplayer && gameData.gameId) {
            const unsubscribe = gameService.getGameUpdates(gameData.gameId, (updatedGame) => {
                setGameData(updatedGame);
            });
            return () => unsubscribe();
        }
    }, [isMultiplayer, gameData.gameId]);

    // Timer logic
    React.useEffect(() => {
        if (gameData.status !== 'active' || isGameWon || isGameOver) return;
        
        const interval = setInterval(() => {
            const newTime = (playerState?.timer || 0) + 1;
            const updates: Partial<Player> = { timer: newTime };
            
            if (isMultiplayer) {
                gameService.updateGame(gameData.gameId, playerId, updates);
            } else {
                 const updatedGame = { ...gameData, players: { ...gameData.players, [playerId]: { ...playerState, ...updates }}};
                 setGameData(updatedGame as Game);
                 onSave(updatedGame);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameData, playerState, onSave, isMultiplayer, gameData.gameId, playerId, isGameWon, isGameOver]);

    React.useEffect(() => {
        if (playerState) {
            checkWinCondition(playerState.board);
            setNumberCounts(calculateInitialCounts(playerState.board));
        }
    }, [playerState?.board]);

     React.useEffect(() => {
        if (playerState?.errors >= 3) {
            setIsGameOver(true);
        }
    }, [playerState?.errors]);

    const updateGame = (updates: Partial<Player>) => {
        if (isMultiplayer) {
            gameService.updateGame(gameData.gameId, playerId, updates);
        } else {
             const updatedPlayerState = { ...playerState, ...updates };
             const updatedGame = { ...gameData, players: { ...gameData.players, [playerId]: updatedPlayerState }};
             setGameData(updatedGame as Game);
        }
    };
    
    const checkWinCondition = (currentBoard) => {
        if (!currentBoard) return;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!currentBoard[r] || currentBoard[r][c] === null) {
                    return;
                }
            }
        }
        setIsGameWon(true);
        if(isMultiplayer) {
             gameService.setWinner(gameData.gameId, playerId);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return \`\${mins}:\${secs}\`;
    };

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        if(board && board[row]){
             const clickedNumber = board[row][col];
             setHighlightedNumber(clickedNumber !== null ? clickedNumber : null);
        }
    };
    
    const clearNotesForValue = (currentNotes, row, col, value) => {
        const newNotes = currentNotes.map(r => r.map(c => new Set(c)));
        for (let i = 0; i < 9; i++) {
            newNotes[row][i].delete(value);
            newNotes[i][col].delete(value);
        }
        const startRow = Math.floor(row / 3) * 3, startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) for (let c = startCol; c < startCol + 3; c++) newNotes[r][c].delete(value);
        return newNotes;
    };

    const handleNumberInput = (num) => {
        if (!selectedCell || isGameWon || gameData.status === 'finished' || !playerState) return;
        const { row, col } = selectedCell;
        
        if (!puzzle || !puzzle[row] || puzzle[row][col] !== null) return; 

        if (isNoteMode) {
            const newNotes = notes.map(r => r.map(c => new Set(c)));
            const cellNotes = newNotes[row][col];
            if (cellNotes.has(num)) cellNotes.delete(num);
            else cellNotes.add(num);
            updateGame({ notes: newNotes });
        } else {
            let newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === row && cell.col === col));
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = num;
            
            if (solution && solution[row] && solution[row][col] === num) {
                const newNotes = clearNotesForValue(notes, row, col, num);
                setHighlightedNumber(num);
                updateGame({ board: newBoard, errorCells: newErrorCells, notes: newNotes });
            } else {
                newErrorCells = [...newErrorCells, { row, col }];
                const newErrors = errors + 1;
                updateGame({ board: newBoard, errorCells: newErrorCells, errors: newErrors });
            }
        }
    };
    
    const handleErase = () => {
        if (!selectedCell || isGameWon || gameData.status === 'finished' || !playerState) return;
        const { row, col } = selectedCell;
        if (!puzzle || !puzzle[row] || puzzle[row][col] !== null) return;
        
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = null;
        
        const newNotes = notes.map(r => r.map(c => new Set(c)));
        newNotes[row][col].clear();

        const newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === row && cell.col === col));
        updateGame({ board: newBoard, notes: newNotes, errorCells: newErrorCells });
    };

    const handleHint = () => {
        if (hints > 0 && !isGameWon) {
            const emptyCells = [];
            for(let r=0; r<9; r++) for(let c=0; c<9; c++) if(board && board[r] && board[r][c] === null) emptyCells.push({r, c});
            if(emptyCells.length > 0) {
                const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const newBoard = board.map(b => [...b]);
                const hintNum = solution[r][c];
                newBoard[r][c] = hintNum;
                const newNotes = clearNotesForValue(notes, r, c, hintNum);
                const newErrorCells = (playerState.errorCells || []).filter(cell => !(cell.row === r && cell.col === c));
                updateGame({ board: newBoard, hints: hints - 1, notes: newNotes, errorCells: newErrorCells });
            }
        } else if (!isGameWon) {
            setAdMessage(t.adForHint);
            setIsAdPlaying(true);
        }
    };
    
    const handleAdConfirm = (type) => {
        setIsAdPlaying(false);
        setTimeout(() => {
            if(type === 'hint') updateGame({ hints: (hints || 0) + 1 });
            else if (type === 'life') {
                setIsGameOver(false);
                updateGame({ errors: 2 });
            }
        }, 1500);
    };

    const Modal = ({ title, titleColor, children, onConfirm, onCancel, confirmText, cancelText }) => (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-sm text-gray-800">
                <h2 className={\`text-3xl font-bold mb-4 \${titleColor}\`}>{title}</h2>
                <div className="text-gray-600 mb-6">{children}</div>
                <div className="flex flex-col space-y-4">
                    {onConfirm && <button onClick={onConfirm} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105">{confirmText}</button>}
                    {onCancel && <button onClick={onCancel} className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105">{cancelText}</button>}
                </div>
            </div>
        </div>
    );
    
    if (!playerState) {
        return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    const displayedBoard = gameData.mode === 'Co-op' && opponentState ? opponentState.board : board;

    return (
        <div className="p-4 bg-gray-50 text-gray-800 flex flex-col h-full justify-between">
            {(isGameWon || gameData.winner === playerId) && <Confetti />}
            {(isGameWon || gameData.winner === playerId) && <Modal title={t.congratulations} titleColor="text-green-500" onCancel={onBack} cancelText={t.backToMenu}><p>{t.puzzleSolved}</p></Modal>}
            {gameData.winner && gameData.winner !== playerId && <Modal title={t.gameOver} titleColor="text-red-500" onCancel={onBack} cancelText={t.backToMenu}><p>{t.opponentWon}</p></Modal>}

            {isGameOver && <Modal title={t.gameOver} titleColor="text-red-500" onCancel={onBack} cancelText={<><Repeat className="mr-2 h-5 w-5" /> {t.tryAgain}</>} onConfirm={() => { setIsGameOver(false); setAdMessage(t.adForLife); setIsAdPlaying(true); }} confirmText={<><Video className="mr-2 h-5 w-5" /> {t.watchAdForLife}</>}><p>{t.gameOverMessage}</p></Modal>}
            {isAdPlaying && <Modal title={t.opportunity} titleColor="text-yellow-500" onCancel={() => setIsAdPlaying(false)} cancelText={t.no} onConfirm={() => handleAdConfirm(adMessage.includes('hint') ? 'hint' : 'life')} confirmText={t.yes}><p>{adMessage}</p></Modal>}
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"><ArrowLeft /></button>
                    <div className="text-lg font-semibold">{gameData.difficulty} ({gameData.mode})</div>
                    <div className="flex items-center space-x-4">
                        <div className="text-red-500 font-bold text-lg">{t.errors}: {errors}/3</div>
                        <div className="font-mono text-lg">{formatTime(timer)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-gray-400 rounded-lg overflow-hidden border-2 border-gray-400 aspect-square">
                    {Array.from({ length: 9 }).map((_, boxIdx) => (
                        <div key={boxIdx} className="grid grid-cols-3 gap-px bg-gray-300">
                            {Array.from({ length: 9 }).map((_, cellIdx) => {
                                const rIdx = Math.floor(boxIdx / 3) * 3 + Math.floor(cellIdx / 3);
                                const cIdx = (boxIdx % 3) * 3 + (cellIdx % 3);
                                if (!displayedBoard || !displayedBoard[rIdx]) return null;
                                const cell = displayedBoard[rIdx][cIdx];
                                const isGiven = puzzle && puzzle[rIdx] && puzzle[rIdx][cIdx] !== null;
                                const isSelected = selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
                                const isInSelectedRowCol = !isSelected && selectedCell && (rIdx === selectedCell.row || cIdx === selectedCell.col);
                                const isInSelectedBox = !isSelected && selectedCell && (Math.floor(rIdx / 3) === Math.floor(selectedCell.row / 3) && Math.floor(cIdx / 3) === Math.floor(selectedCell.col / 3));
                                const isError = !isGiven && (playerState.errorCells || []).some(cell => cell.row === rIdx && cell.col === cIdx);
                                const isHighlighted = !isSelected && highlightedNumber && cell !== null && cell === highlightedNumber;

                                return (
                                    <div key={\`\${rIdx}-\${cIdx}\`} onClick={() => handleCellClick(rIdx, cIdx)} className={\`flex justify-center items-center aspect-square transition-colors duration-100 cursor-pointer \${isSelected ? 'bg-blue-300' : isHighlighted ? 'bg-yellow-200' : (isInSelectedRowCol || isInSelectedBox) ? 'bg-blue-100' : 'bg-white'}\`}>
                                        <div className={\`text-3xl \${isGiven ? 'font-bold text-gray-800' : isError ? 'font-medium text-red-500' : 'font-medium text-blue-600'}\`}>
                                            {cell !== null ? cell : (
                                                notes && notes[rIdx] && notes[rIdx][cIdx] && notes[rIdx][cIdx].size > 0 && (
                                                    <div className="grid grid-cols-3 gap-px text-xs text-gray-500 leading-none">
                                                        {[1,2,3,4,5,6,7,8,9].map(n => (<div key={n} className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex justify-center items-center">{notes[rIdx][cIdx].has(n) ? n : ''}</div>))}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                 {gameData.mode === 'Versus' && opponentState && (
                    <div className="mt-4 p-2 bg-gray-200 rounded-lg">
                        <h3 className="text-sm font-semibold text-center">{t.opponent}: {formatTime(opponentState.timer)} - {t.errors}: {opponentState.errors}/3</h3>
                    </div>
                 )}
            </div>

            <div className="mt-4">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <button onClick={handleHint} className="flex flex-col items-center p-3 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50" disabled={!hints || hints === 0}><Lightbulb className="text-yellow-500"/><span className="text-xs font-semibold mt-1">{t.hint} ({hints})</span></button>
                    <button onClick={handleErase} className="flex flex-col items-center p-3 rounded-lg bg-gray-200 hover:bg-gray-300"><Eraser /><span className="text-xs font-semibold mt-1">{t.erase}</span></button>
                    <button onClick={() => setIsNoteMode(!isNoteMode)} className={\`flex flex-col items-center p-3 rounded-lg transition-colors \${isNoteMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}\`}><BrainCircuit /><span className="text-xs font-semibold mt-1">{t.notes}</span></button>
                </div>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumberInput(num)} disabled={numberCounts[num] >= 9} className="bg-gray-200 hover:bg-blue-200 text-2xl font-bold rounded-lg p-3 aspect-square flex justify-center items-center transition-transform transform hover:scale-105 disabled:opacity-30 disabled:pointer-events-none">{num}</button>))}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
`
  },
  {
    path: 'src/components/app/lobby.tsx',
    content: `
"use client";
import React from 'react';
import { History, Users, Sword } from 'lucide-react';
import type { GameDifficulty, GameMode } from '@/services/game-service';

const Lobby = ({ onStartGame, onResumeGame, onCreateMultiplayerGame, onJoinMultiplayerGame, t }) => {
    const [difficulty, setDifficulty] = React.useState<GameDifficulty>('Easy');
    const [hasSavedGame, setHasSavedGame] = React.useState(false);
    const [multiplayerStep, setMultiplayerStep] = React.useState<'none' | 'create' | 'join'>('none');
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
    
    const handleJoinSubmit = () => {
        if (joinCode.trim().length === 20) { // Firestore IDs are 20 chars
            onJoinMultiplayerGame(joinCode.trim());
        } else {
            alert(t.invalidGameId);
        }
    }

    const renderMultiplayerButtons = () => (
        <div>
            <h3 className="text-lg font-semibold mb-4 text-center">{t.createNewGame}</h3>
            <div className="flex flex-col space-y-4">
                 <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Co-op'})} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105"><Users className="mr-3"/>{t.coop}</button>
                 <button onClick={() => onCreateMultiplayerGame({difficulty, mode: 'Versus'})} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105"><Sword className="mr-3"/>{t.vs}</button>
            </div>
            <hr className="my-6" />
            <h3 className="text-lg font-semibold mb-4 text-center">{t.joinGame}</h3>
             <div className="flex flex-col space-y-3">
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} type="text" placeholder={t.enterGameId} className="w-full p-3 border rounded-lg text-center" />
                <button onClick={handleJoinSubmit} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl">{t.join}</button>
             </div>
             <button onClick={() => setMultiplayerStep('none')} className="w-full text-center text-gray-500 mt-6">{t.back}</button>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">{t.title}</h1>

            {hasSavedGame && multiplayerStep === 'none' && (<button onClick={onResumeGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl mb-8 flex items-center justify-center transition-transform transform hover:scale-105"><History className="mr-3" /> {t.continueGame}</button>)}

            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{t.difficulty}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {Object.entries(difficulties).map(([key, value]) => (<button key={key} onClick={() => setDifficulty(key as GameDifficulty)} className={\`py-3 rounded-lg text-sm font-semibold transition-colors \${difficulty === key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}\`}>{value}</button>))}
                </div>

                {multiplayerStep === 'none' ? (
                    <div className="flex flex-col space-y-4">
                        <button onClick={() => onStartGame({ difficulty, mode: 'Solo' })} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105">{t.startGameAlone}</button>
                        <button onClick={() => setMultiplayerStep('create')} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105">{t.playTogether}</button>
                    </div>
                ) : renderMultiplayerButtons()}
            </div>
        </div>
    );
};

export default Lobby;
`
  },
  {
    path: 'src/components/app/multiplayer-lobby.tsx',
    content: `
"use client";
import React from 'react';
import { Copy, Users, Sword } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Game } from '@/services/game-service';
import { gameService } from '@/services/game-service';

const MultiplayerLobby = ({ game, t, setActiveView, setGameData }) => {
    const { toast } = useToast();

    // Listen for game updates
    React.useEffect(() => {
        if (game?.gameId) {
            const unsubscribe = gameService.getGameUpdates(game.gameId, (updatedGame) => {
                setGameData(updatedGame);
                // If game becomes active, switch to game board view
                if (updatedGame.status === 'active' && Object.keys(updatedGame.players).length === 2) {
                    setActiveView('game');
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
        if(game?.gameId && Object.keys(game.players).length === 2) {
            gameService.updateGameStatus(game.gameId, 'active');
        }
    };
    
    if (!game) {
        return <div className="flex justify-center items-center h-full">{t.gameNotFound}</div>
    }

    const isCoop = game.mode === 'Co-op';
    const playerIds = Object.keys(game.players || {});
    const hasTwoPlayers = playerIds.length === 2;

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
                    disabled={!hasTwoPlayers}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t.startGame}
                </button>
            </div>
        </div>
    );
};

export default MultiplayerLobby;
`
  },
  {
    path: 'src/components/app/profile.tsx',
    content: `
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
                        <button onClick={() => setLanguage('da')} className={\`w-full py-2 rounded-lg font-semibold \${language === 'da' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}\`}>Dansk</button>
                        <button onClick={() => setLanguage('en')} className={\`w-full py-2 rounded-lg font-semibold \${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}\`}>English</button>
                    </div>
                 </div>
            </div>
        </div>
    );
};
export default Profile;
`
  },
  {
    path: 'src/lib/firebase.ts',
    content: `// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
`
  },
  {
    path: 'src/lib/sudoku.ts',
    content: `

// --- Utility functions for Sudoku generation and manipulation ---
export const sudokuGenerator = {
    generate: (difficulty) => {
        let puzzle = Array(9).fill(null).map(() => Array(9).fill(null));
        sudokuGenerator.solve(puzzle);
        let holes;
        switch (difficulty) {
            case 'Let':
            case 'Easy':
                holes = 35;
                break;
            case 'Medium':
                holes = 45;
                break;
            case 'Svær':
            case 'Hard':
                holes = 50;
                break;
            case 'Meget svær':
            case 'Very Hard':
                holes = 55;
                break;
            case 'Umulig':
            case 'Impossible':
                holes = 60;
                break;
            default:
                holes = 35;
        }
        let solution = JSON.parse(JSON.stringify(puzzle));
        let attempts = holes;
        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== null) {
                puzzle[row][col] = null;
                attempts--;
            }
        }
        return { puzzle, solution };
    },
    solve: (board) => {
        const findEmpty = (b) => {
            for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (b[r][c] === null) return [r, c];
            return null;
        };
        const validate = (num, pos, b) => {
            const [r, c] = pos;
            for (let i = 0; i < 9; i++) if (b[r][i] === num && c !== i) return false;
            for (let i = 0; i < 9; i++) if (b[i][c] === num && r !== i) return false;
            const boxRow = Math.floor(r / 3) * 3, boxCol = Math.floor(c / 3) * 3;
            for (let i = boxRow; i < boxRow + 3; i++) for (let j = boxCol; j < boxCol + 3; j++) if (b[i][j] === num && (i !== r || j !== c)) return false;
            return true;
        };
        const empty = findEmpty(board);
        if (!empty) return true;
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let i = 0; i < nums.length; i++) {
            if (validate(nums[i], empty, board)) {
                board[empty[0]][empty[1]] = nums[i];
                if (sudokuGenerator.solve(board)) return true;
                board[empty[0]][empty[1]] = null;
            }
        }
        return false;
    },
    // Converts a 2D array board to a flat string
    boardToString: (board) => {
        if (!board) return '.'.repeat(81);
        return board.map(row => row.map(cell => cell === null ? '.' : cell).join('')).join('');
    },
    // Converts a flat string to a 2D array board
    stringToBoard: (boardString) => {
        const board = [];
        for (let i = 0; i < 9; i++) {
            const rowStr = boardString.substring(i * 9, (i + 1) * 9);
            const row = rowStr.split('').map(char => char === '.' ? null : parseInt(char));
            board.push(row);
        }
        return board;
    },
    // Serializes the notes Set[][] to a string
    notesToString: (notes) => {
         if (!notes) return JSON.stringify(Array(81).fill([]));
        return JSON.stringify(notes.map(row => row.map(cellSet => Array.from(cellSet))));
    },
    // Deserializes a string back into the notes Set[][]
    stringToNotes: (notesString) => {
        if (!notesString) {
            return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
        }
        try {
            const parsedArray = JSON.parse(notesString);
            return parsedArray.map(row => row.map(cellArray => new Set(cellArray)));
        } catch (e) {
            console.error("Failed to parse notes string:", e);
            return Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()));
        }
    }
};
`
  },
  {
    path: 'src/lib/translations.ts',
    content: `
export const translations = {
    da: {
        // General
        home: 'Hjem',
        challenges: 'Udfordringer',
        profile: 'Profil',
        settings: 'Indstillinger',
        language: 'Sprog',
        back: 'Tilbage',
        
        // Lobby
        title: 'Social Sudoku',
        continueGame: 'Fortsæt Sidste Spil',
        difficulty: 'Vælg Sværhedsgrad',
        startGameAlone: 'Start Spil (Alene)',
        playTogether: 'Spil Sammen',
        createNewGame: 'Opret et nyt spil',
        joinGame: 'Deltag i et spil',
        coop: 'Samarbejde',
        vs: 'Mod hinanden',
        enterGameId: 'Indtast Spil ID',
        join: 'Deltag',
        invalidGameId: 'Indtast venligst en gyldig spilkode.',
        gameNotFound: 'Spil ikke fundet. Tjek koden og prøv igen.',

        // Difficulties
        easy: 'Let',
        medium: 'Medium',
        hard: 'Svær',
        veryhard: 'Meget svær',
        impossible: 'Umulig',

        // Game Board
        errors: 'Fejl',
        hint: 'Hint',
        erase: 'Slet',
        notes: 'Noter',
        gameOver: 'Game Over',
        gameOverMessage: 'Du har lavet 3 fejl.',
        tryAgain: 'Prøv Igen',
        watchAdForLife: 'Se Reklame for Ekstra Liv',
        opportunity: 'Mulighed!',
        adForHint: 'Se en reklame for et extra hint?',
        adForLife: 'Se reklame for et ekstra liv?',
        yes: 'Ja tak',
        no: 'Nej tak',
        congratulations: 'Tillykke!',
        puzzleSolved: 'Du har løst Sudokuen!',
        backToMenu: 'Tilbage til menuen',
        opponentWon: 'Din modstander vandt!',
        opponent: 'Modstander',
        
        // Multiplayer Lobby
        gameLobby: 'Spil Lobby',
        shareCode: 'Del denne kode med en ven for at spille sammen.',
        waitingForPlayer: 'Venter på at en anden spiller deltager...',
        playerJoined: 'Spiller 2 er deltager!',
        startGame: 'Start Spil',
        
        // Daily Challenges
        dailyChallengesTitle: 'Daglige Udfordringer',
        startChallenge: 'Start Udfordring',
        
        // Profile
        statistics: 'Statistik',
        memberSince: 'Medlem siden',
        solved: 'Løste',
        bestTime: 'Bedste tid',
        avgTime: 'Gns. tid',
        weekdays: ['M', 'T', 'O', 'T', 'F', 'L', 'S'],
        months: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
    },
    en: {
        // General
        home: 'Home',
        challenges: 'Challenges',
        profile: 'Profile',
        settings: 'Settings',
        language: 'Language',
        back: 'Back',

        // Lobby
        title: 'Social Sudoku',
        continueGame: 'Continue Last Game',
        difficulty: 'Select Difficulty',
        startGameAlone: 'Start Game (Solo)',
        playTogether: 'Play Together',
        createNewGame: 'Create a new game',
        joinGame: 'Join a game',
        coop: 'Co-op',
        vs: 'Versus',
        enterGameId: 'Enter Game ID',
        join: 'Join',
        invalidGameId: 'Please enter a valid game code.',
        gameNotFound: 'Game not found. Check the code and try again.',

        // Difficulties
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        veryhard: 'Very Hard',
        impossible: 'Impossible',

        // Game Board
        errors: 'Errors',
        hint: 'Hint',
        erase: 'Erase',
        notes: 'Notes',
        gameOver: 'Game Over',
        gameOverMessage: 'You made 3 mistakes.',
        tryAgain: 'Try Again',
        watchAdForLife: 'Watch Ad for Extra Life',
        opportunity: 'Opportunity!',
        adForHint: 'Watch an ad for an extra hint?',
        adForLife: 'Watch an ad for an extra life?',
        yes: 'Yes please',
        no: 'No thanks',
        congratulations: 'Congratulations!',
        puzzleSolved: 'You solved the puzzle!',
        backToMenu: 'Back to menu',
        opponentWon: 'Your opponent won!',
        opponent: 'Opponent',

        // Multiplayer Lobby
        gameLobby: 'Game Lobby',
        shareCode: 'Share this code with a friend to play together.',
        waitingForPlayer: 'Waiting for another player to join...',
        playerJoined: 'Player 2 has joined!',
        startGame: 'Start Game',

        // Daily Challenges
        dailyChallengesTitle: 'Daily Challenges',
        startChallenge: 'Start Challenge',

        // Profile
        statistics: 'Statistics',
        memberSince: 'Member since',
        solved: 'Solved',
        bestTime: 'Best time',
        avgTime: 'Avg. time',
        weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    }
};
`
  },
  {
    path: 'src/lib/utils.ts',
    content: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
  },
  {
    path: 'src/services/game-service.ts',
    content: `
import { db } from '@/lib/firebase';
import { sudokuGenerator } from '@/lib/sudoku';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";

export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Impossible';
export type GameMode = 'Solo' | 'Co-op' | 'Versus';
export type GameStatus = 'waiting' | 'active' | 'finished';

// This interface represents the data structure for client-side logic
export interface Player {
    id: string;
    board: (number | null)[][];
    notes: Set<number>[][];
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

// This interface represents the data structure in Firestore
// Notice board and notes are simple strings
export interface FirestorePlayer {
    id: string;
    board: string;
    notes: string;
    errors: number;
    timer: number;
    errorCells?: { row: number, col: number }[];
    hints?: number;
}

// This interface represents the game structure in Firestore
export interface FirestoreGame {
    gameId?: string;
    puzzle: string; // Stored as a flat string
    solution: string; // Stored as a flat string
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: FirestorePlayer };
    winner?: string;
    createdAt?: any;
}

// This is the main Game interface used throughout the app client-side
export interface Game {
    gameId?: string;
    puzzle: (number | null)[][];
    solution: (number | null)[][];
    difficulty: GameDifficulty;
    mode: GameMode;
    status: GameStatus;
    players: { [key: string]: Player };
    winner?: string;
    createdAt?: any;
}

// Helper to convert a FirestoreGame to a client-side Game
const fromFirestoreGame = (firestoreGame: FirestoreGame, id: string): Game => {
    const players: { [key: string]: Player } = {};
    if (firestoreGame.players) {
        for (const pId in firestoreGame.players) {
            const pData = firestoreGame.players[pId];
            players[pId] = {
                ...pData,
                board: sudokuGenerator.stringToBoard(pData.board),
                notes: sudokuGenerator.stringToNotes(pData.notes),
            };
        }
    }

    return {
        ...firestoreGame,
        gameId: id,
        puzzle: sudokuGenerator.stringToBoard(firestoreGame.puzzle),
        solution: sudokuGenerator.stringToBoard(firestoreGame.solution),
        players,
    };
};

export const gameService = {
    createGame: async (difficulty: GameDifficulty, mode: GameMode, playerId: string): Promise<Game> => {
        const { puzzle, solution } = sudokuGenerator.generate(difficulty);
        
        const initialPlayerState: FirestorePlayer = {
            id: playerId,
            board: sudokuGenerator.boardToString(puzzle),
            notes: sudokuGenerator.notesToString(Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()))),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };

        const newGameDataForFirestore: Omit<FirestoreGame, 'gameId'> = {
            difficulty,
            mode,
            puzzle: sudokuGenerator.boardToString(puzzle),
            solution: sudokuGenerator.boardToString(solution),
            status: 'waiting' as GameStatus,
            players: {
                [playerId]: initialPlayerState
            },
            createdAt: serverTimestamp(),
        };

        const gameCollection = collection(db, "games");
        const gameRef = await addDoc(gameCollection, newGameDataForFirestore);
        
        const createdGame = await getDoc(gameRef);
        return fromFirestoreGame(createdGame.data() as FirestoreGame, gameRef.id);
    },

    joinGame: async (gameId: string, playerId: string): Promise<Game | null> => {
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
            console.error("Game not found!");
            return null;
        }

        const firestoreGame = gameSnap.data() as FirestoreGame;
        
        const newPlayerBoard = firestoreGame.mode === 'Co-op' ? firestoreGame.players[Object.keys(firestoreGame.players)[0]].board : firestoreGame.puzzle;

        const newPlayer: FirestorePlayer = {
            id: playerId,
            board: newPlayerBoard,
            notes: sudokuGenerator.notesToString(Array(9).fill(0).map(() => Array(9).fill(0).map(() => new Set()))),
            errors: 0,
            timer: 0,
            hints: 3,
            errorCells: []
        };

        await updateDoc(gameRef, {
            [\`players.\${playerId}\`]: newPlayer,
        });

        if (Object.keys(firestoreGame.players).length === 1) {
            await gameService.updateGameStatus(gameId, 'active');
        }

        const updatedGameSnap = await getDoc(gameRef);
        return fromFirestoreGame(updatedGameSnap.data() as FirestoreGame, updatedGameSnap.id);
    },

    getGameUpdates: (gameId: string, callback: (game: Game) => void) => {
        const gameRef = doc(db, 'games', gameId);
        return onSnapshot(gameRef, (docSnap) => {
            if (docSnap.exists()) {
                const firestoreGame = docSnap.data() as FirestoreGame;
                callback(fromFirestoreGame(firestoreGame, docSnap.id));
            } else {
                console.error("Game not found during update");
            }
        });
    },

    updateGame: async (gameId: string, playerId: string, updates: Partial<Player>) => {
        const gameRef = doc(db, 'games', gameId);
        const updateData = {};
        
        for(const key in updates) {
            let value = updates[key];
            if (key === 'board' && Array.isArray(value)) {
                 value = sudokuGenerator.boardToString(value as (number|null)[][]);
            }
            if (key === 'notes') {
                value = sudokuGenerator.notesToString(value);
            }
            updateData[\`players.\${playerId}.\${key}\`] = value;
        }

        if(Object.keys(updateData).length > 0) {
            await updateDoc(gameRef, updateData);
        }
    },
    
    updateGameStatus: async (gameId: string, status: GameStatus) => {
        const gameRef = doc(db, 'games', gameId);
        await updateDoc(gameRef, { status });
    },

    setWinner: async (gameId: string, playerId: string) => {
        const gameRef = doc(db, 'games', gameId);
        await updateDoc(gameRef, {
            winner: playerId,
            status: 'finished'
        });
    },
    
};
`
  },
  {
    path: 'tailwind.config.ts',
    content: `import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
`
  },
  {
    path: 'tsconfig.json',
    content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`
  }
];

const DownloadPage = () => {

    const handleDownload = () => {
        const fileContents = allFiles.map(file => {
            const content = typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2);
            return `
// Path: ${file.path}
//--------------------------------------------------------------------------------
\`\`\`
${content}
\`\`\`
`;
        }).join('\\n\\n================================================================================\\n\\n');

        const htmlContent = \`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sudoku Project Files</title>
                <style>
                    body { font-family: sans-serif; line-height: 1.5; padding: 2em; }
                    pre { background-color: #f4f4f4; padding: 1em; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
                    h2 { border-bottom: 2px solid #ccc; padding-bottom: 0.5em; }
                </style>
            </head>
            <body>
                <h1>Sudoku Project Files</h1>
                <p>All project files are included below. You can save this HTML file for a complete backup.</p>
                <div id="file-container"></div>
                <script>
                    const rawContent = \`\${fileContents}\`;
                    const files = rawContent.split('================================================================================');
                    const container = document.getElementById('file-container');

                    files.forEach(fileBlock => {
                        if (fileBlock.trim()) {
                            const pathMatch = fileBlock.match(/\\/\\/ Path: (.*)/);
                            const path = pathMatch ? pathMatch[1] : 'Unknown File';
                            
                            const contentMatch = fileBlock.match(/\\\`\\\`\\\`([\\s\\S]*)\\\`\\\`\\\`$/);
                            const content = contentMatch ? contentMatch[1] : '';

                            const fileHeader = document.createElement('h2');
                            fileHeader.textContent = path;
                            
                            const pre = document.createElement('pre');
                            const code = document.createElement('code');
                            code.textContent = content.trim();
                            pre.appendChild(code);

                            container.appendChild(fileHeader);
                            container.appendChild(pre);
                        }
                    });
                </script>
            </body>
            </html>
        \`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sudoku-project-files.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    return (
        <div className="p-6 bg-gray-50 text-gray-800 flex flex-col h-full items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <FileCode className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Download Project Files</h1>
                <p className="text-gray-600 mb-8">
                    Click the button below to download all of your project files bundled into a single HTML file.
                    You can save this file as a complete backup of your application code.
                </p>
                <button
                    onClick={handleDownload}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-transform transform hover:scale-105"
                >
                    <Download className="mr-3" />
                    Download All Files
                </button>
            </div>
        </div>
    );
};

export default DownloadPage;

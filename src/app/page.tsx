
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function App() {
    const router = useRouter();

    React.useEffect(() => {
        router.replace('/share');
    }, [router]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p>Omdirigerer til delingssiden...</p>
        </div>
    );
}

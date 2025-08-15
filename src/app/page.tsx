import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Puzzle, Users, Swords, Check, X } from 'lucide-react';

const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
const friends = [
  { name: 'Alice', online: true, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'Bob', online: false, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { name: 'Charlie', online: true, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
];
const invites = [
  { from: 'David', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d', mode: 'Co-op' },
  { from: 'Eve', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', mode: 'Versus' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Puzzle className="h-10 w-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
              SudokuSphere
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Challenge your mind, connect with friends.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="w-6 h-6" />
                New Game
              </CardTitle>
              <CardDescription>Start a new solo puzzle.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {difficulties.map((level) => (
                <Button key={level} asChild variant="outline" className="text-lg py-6">
                  <Link href={`/play?difficulty=${level.toLowerCase()}`}>{level}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Play with Friends
              </CardTitle>
              <CardDescription>Invite friends or accept challenges.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Friends Online</h3>
                <div className="flex items-center space-x-2">
                  {friends.map(friend => (
                     <div key={friend.name} className="relative">
                       <Avatar>
                         <AvatarImage src={friend.avatar} alt={friend.name} />
                         <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       {friend.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />}
                     </div>
                  ))}
                </div>
                <Separator />
                <h3 className="text-sm font-medium text-muted-foreground">Game Invites</h3>
                <div className="space-y-3">
                  {invites.map(invite => (
                    <div key={invite.from} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={invite.avatar} alt={invite.from} />
                          <AvatarFallback>{invite.from.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{invite.from}</p>
                          <Badge variant={invite.mode === 'Co-op' ? 'default' : 'destructive'} className="text-xs">
                            {invite.mode === 'Co-op' ? <Users className="w-3 h-3 mr-1" /> : <Swords className="w-3 h-3 mr-1" />}
                            {invite.mode}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 hover:bg-green-200 text-green-700">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 hover:bg-red-200 text-red-700">
                           <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function GamePage() {
  const [currentRiddle, setCurrentRiddle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, ended
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
    setupWebSocket();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        // Reveal a new letter every 30 seconds
        if (timeLeft % 30 === 0 && revealedLetters < currentRiddle.answer.length) {
          setRevealedLetters(revealedLetters + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameStatus('ended');
    }
  }, [timeLeft, gameStatus]);

  const fetchLeaderboard = async () => {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    setLeaderboard(data);
  };

  const setupWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:21213/');
    
    ws.current.onopen = () => {
      console.log('Connected to TikTok WebSocket');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'chat') {
        handleChatMessage(data.data);
      }
    };
  };

  const handleChatMessage = (message) => {
    if (gameStatus !== 'playing' || !currentRiddle) return;
    
    const text = message.comment;
    if (text.startsWith('.') && text.substring(1).toLowerCase() === currentRiddle.answer.toLowerCase()) {
      // Correct answer
      const username = message.user.nickname;
      const score = timeLeft; // More points for faster answers
      
      // Add to correct answers
      setCorrectAnswers(prev => [...prev, { username, score }]);
      
      // Update leaderboard
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score })
      }).then(fetchLeaderboard);
    }
  };

  const startGame = async () => {
    const res = await fetch('/api/riddles');
    const riddles = await res.json();
    const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    setCurrentRiddle(randomRiddle);
    setTimeLeft(120);
    setRevealedLetters(0);
    setCorrectAnswers([]);
    setGameStatus('playing');
  };

  const displayAnswer = () => {
    if (!currentRiddle) return '';
    return currentRiddle.answer.split('').map((char, index) => {
      return index < revealedLetters || char === ' ' ? char : '_';
    }).join(' ');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-3xl">
                {gameStatus === 'waiting' ? 'Ready to Play?' : 
                 gameStatus === 'playing' ? currentRiddle.question : 'Game Over!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {gameStatus === 'playing' && (
                <>
                  <Progress value={(120 - timeLeft) / 120 * 100} />
                  <div className="text-center text-2xl font-mono">
                    {displayAnswer()}
                  </div>
                  <div className="text-center text-xl">
                    Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                </>
              )}
              
              {gameStatus === 'ended' && (
                <div className="text-center text-2xl">
                  The answer was: {currentRiddle.answer}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              {gameStatus === 'waiting' && (
                <Button size="lg" onClick={startGame}>Start Game</Button>
              )}
              {gameStatus === 'ended' && (
                <Button size="lg" onClick={startGame}>Play Again</Button>
              )}
            </CardFooter>
          </Card>

          {gameStatus === 'ended' && correctAnswers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Winners</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {correctAnswers
                      .sort((a, b) => b.score - a.score)
                      .map((answer, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{answer.username}</TableCell>
                          <TableCell>{answer.score}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player, index) => (
                    <TableRow key={player.username}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{player.username}</TableCell>
                      <TableCell>{player.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function AdminPage() {
  const [riddles, setRiddles] = useState([]);
  const [newRiddle, setNewRiddle] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchRiddles();
  }, []);

  const fetchRiddles = async () => {
    const res = await fetch('/api/riddles');
    const data = await res.json();
    setRiddles(data);
  };

  const addRiddle = async () => {
    await fetch('/api/riddles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRiddle)
    });
    setNewRiddle({ question: '', answer: '' });
    fetchRiddles();
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Riddle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Question"
            value={newRiddle.question}
            onChange={(e) => setNewRiddle({...newRiddle, question: e.target.value})}
          />
          <Input
            placeholder="Answer"
            value={newRiddle.answer}
            onChange={(e) => setNewRiddle({...newRiddle, answer: e.target.value})}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={addRiddle}>Save Riddle</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riddles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riddles.map((riddle) => (
                <TableRow key={riddle.id}>
                  <TableCell>{riddle.question}</TableCell>
                  <TableCell>{riddle.answer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

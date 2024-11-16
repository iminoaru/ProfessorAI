'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import useStore from '@/useStore';
import ProgressBar from '@/components/ProgressBar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface Test {
  test_id: string;
  course_id: string;
  chunk_id: string;
  test_question: string;
  correct_option: string;
  incorrect_options: string[];
}

interface Chunk {
  chunk_id: string;
  content_id: string;
  chunk_title: string;
  chunk_content: string;
}

const TestCard: React.FC<{
  test: Test;
  chunk: Chunk | null;
  selectedOption: string | null;
  onAnswer: (option: string) => void;
  onClear: () => void;
}> = ({ test, chunk, selectedOption, onAnswer, onClear }) => {
  const options = [test.correct_option, ...test.incorrect_options];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{test.test_question}</h3>
          
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`option-${index}`}
              checked={selectedOption === option}
              onCheckedChange={() => onAnswer(option)}
            />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))}
            <div className="flex justify-start gap-2">
              <Button variant="outline" size="sm" onClick={onClear}>Clear Selection</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Chunk
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold mb-2">
                      {chunk?.chunk_title || 'Chunk Content'}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(100vh-10rem)] pr-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {chunk?.chunk_content || 'No content available'}
                    </p>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
      </CardContent>
    </Card>
  );
};

const MainTest: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: content_id } = useParams();
  const { userID, session } = useStore();

  const [answers, setAnswers] = useState<{ [testId: string]: string | null }>({});

  useEffect(() => {
    const fetchTestsAndChunks = async () => {
      if (content_id) {
        try {
          const chunksResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/chunk/${content_id}`
          );
          setChunks(chunksResponse.data);

          const testsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/test/${content_id}`
          );
          setTests(testsResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
          if (axios.isAxiosError(error) && error.response) {
            setError(
              `Error: ${error.response.status} - ${
                error.response.data.message || 'Unknown error'
              }`
            );
          } else {
            setError('An unknown error occurred');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestsAndChunks();
  }, [content_id]);

  const handleAnswer = (option: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [tests[currentTestIndex].test_id]: option,
    }));
  };

  const handleClear = () => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [tests[currentTestIndex].test_id]: null,
    }));
  };

  const handleFinishQuiz = async () => {
    const totalCorrect = Object.entries(answers).filter(
      ([testId, answer]) => answer === tests.find(t => t.test_id === testId)?.correct_option
    ).length;
    const totalIncorrect = Object.keys(answers).length - totalCorrect;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/score/add-scores`,
        {
          course_id: content_id,
          correct_score: totalCorrect,
          incorrect_score: totalIncorrect,
        },
        {
          params: { user_id: userID },
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );

      router.push(`/test/scores/${content_id}`);
    } catch (error: any) {
      console.error('Error submitting scores:', error);
      if (error.response?.status === 422) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be signed in to submit scores"
        });
      } else {
        toast({
          variant: "destructive", 
          title: "Error",
          description: "An error occurred while submitting scores"
        });
      }
    }
  };

  const handlePrevious = () => {
    setCurrentTestIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentTestIndex((prev) => Math.min(tests.length - 1, prev + 1));
  };

  const getCurrentChunk = () => {
    const currentTest = tests[currentTestIndex];
    return chunks.find(chunk => chunk.chunk_id === currentTest?.chunk_id) || null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-bold text-center">It&apos;s Quiz Time!</CardTitle>
          <CardDescription className="text-center mt-2">
            Here is the quiz provided to you with default instructions. Good luck!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
                // Start of Selection
                <>
                  <div className="mb-4 flex justify-between items-center max-w-lg mx-auto px-4">
                    <Button onClick={handlePrevious} disabled={currentTestIndex === 0} size="sm">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <div className="text-sm font-medium">
                      {currentTestIndex + 1} of {tests.length}
                    </div>
                    <Button onClick={handleNext} disabled={currentTestIndex === tests.length - 1} size="sm">
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="w-full max-w-lg mx-auto bg-gray-200 rounded-full h-2 mb-6">
                    <div
                      className="bg-secondary h-2 rounded-full transition-width duration-300"
                      style={{ width: `${((currentTestIndex + 1) / tests.length) * 100}%` }}
                    ></div>
                  </div>
                  {tests[currentTestIndex] && (
                    <TestCard
                      test={tests[currentTestIndex]}
                      chunk={getCurrentChunk()}
                      selectedOption={answers[tests[currentTestIndex].test_id] || null}
                      onAnswer={handleAnswer}
                      onClear={handleClear}
                    />
                  )}
                </>
          )}
        </CardContent>
        <CardFooter className="p-6 flex justify-center">
          <Button
            onClick={handleFinishQuiz}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
            disabled={loading || Object.keys(answers).length === 0}
          >
            Finish Quiz
          </Button>
        </CardFooter>
    </div>
  );
};

export default MainTest;
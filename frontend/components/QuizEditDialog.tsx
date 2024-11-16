import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EditIcon from '@/components/icons/Edit';
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import QuizEditor from './QuizEditor';
import QuizCard from './QuizCard';

interface Quiz {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string;
}

function QuizEditDialog({ quiz, onQuizSave }: { quiz: Quiz; onQuizSave: (quiz: Quiz) => void }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState(quiz.question);
  const [correctAnswer, setCorrectAnswer] = useState(quiz.correct_answer);
  const [incorrectAnswers, setIncorrectAnswers] = useState(quiz.incorrect_answers);
  const [explanation, setExplanation] = useState(quiz.explanation);

  const onQuizChange = {
    setQuestion,
    setCorrectAnswer,
    setIncorrectAnswers: (index: number, value: string) =>
      setIncorrectAnswers((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      }),
    setExplanation,
  };
  const handleSaveEdits = () => {
    onQuizSave({
      question,
      correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswers,
      explanation,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <EditIcon className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] overflow-x-scroll">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
          <DialogDescription>
            Make changes to the test here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-6">
          <QuizEditor
            quiz={{
              question,
              correct_answer: correctAnswer,
              incorrect_answers: incorrectAnswers,
              explanation,
            }}
            onQuizChange={onQuizChange}
          />
          <QuizCard
            quiz={{
              question,
              correct_answer: correctAnswer,
              incorrect_answers: incorrectAnswers,
              explanation,
            }}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSaveEdits}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuizEditDialog;
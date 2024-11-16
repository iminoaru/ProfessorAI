import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import QuizEditDialog from './QuizEditDialog';

interface Quiz {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string;
}

function QuizCard({ quiz, onQuizSave, deleteQuiz }: { quiz: Quiz; onQuizSave?: any; deleteQuiz?: any }) {
  const { question, correct_answer, incorrect_answers, explanation } = quiz;

  return (
    <Card className={`w-[400px] h-[400px] flex flex-col justify-between`}>
      <CardContent className="flex-grow overflow-y-auto p-4 pb-2 gap-6">
        <Label className="font-bold mb-2">Question:</Label>
        <p>{question}</p>
        <hr />
        <Label className="font-bold mb-2">Correct Answer:</Label>
        <p>{correct_answer}</p>
        <hr />
        <Label className="font-bold mb-2">Incorrect Answers:</Label>
        <ul className="list-disc pl-5">
          {incorrect_answers.map((answer, index) => (
            <li key={index}>{answer}</li>
          ))}
        </ul>
        <hr />
        <Label className="font-bold mb-2">Explanation:</Label>
        <p>{explanation}</p>
      </CardContent>
      {onQuizSave && deleteQuiz && (
        <CardFooter className="p-2 flex justify-between">
          <Button variant="destructive" onClick={deleteQuiz}>
            Delete
          </Button>
          <QuizEditDialog quiz={quiz} onQuizSave={onQuizSave} />
        </CardFooter>
      )}
    </Card>
  );
}

export default QuizCard;
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Quiz {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string;
}

function QuizEditor({ quiz, onQuizChange }: { quiz: Quiz; onQuizChange: any }) {   
  const { setQuestion, setCorrectAnswer, setIncorrectAnswers, setExplanation } = onQuizChange;
  return (
    <div className="w-[400px] h-[500px]">
      <div className="mb-4">
        <Label>Question</Label>
        <Input
          type="text"
          value={quiz?.question || ''}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question"
        />
      </div>
      <div className="mb-4">
        <Label>Correct Answer</Label>
        <Input
          type="text"
          value={quiz?.correct_answer || ''}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter correct answer"
        />
      </div>
      <div className="mb-4">
        <Label>Incorrect Answers</Label>
        {quiz?.incorrect_answers.map((answer: any, index: any) => (
          <Input
            key={index}
            type="text"
            value={answer}
            onChange={(e) => setIncorrectAnswers(index, e.target.value)}
            placeholder={`Enter incorrect answer ${index + 1}`}
            className="mb-2"
          />
        ))}
      </div>
      <div className="mb-4">
        <Label>Explanation</Label>
        <Textarea
          className="h-[100px]"
          value={quiz?.explanation || ''}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Enter explanation"
        />
      </div>
    </div>
  );
}

export default QuizEditor;
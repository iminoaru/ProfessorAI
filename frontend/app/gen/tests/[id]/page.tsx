'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import EditIcon from '@/components/icons/Edit';
import { ArrowRightIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import useStore from '@/useStore';
import Markdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';
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
  index: number;
  onEdit?: (test: Test) => void;
  onDelete?: (testId: string) => void;
}> = ({ test, index, onEdit, onDelete }) => (
  <div className="relative">
    <div className="absolute -top-4 left-2 transform -translate-x-1/2  text-foreground px-3 py-1 rounded-full text-sm font-bold">
       #{index + 1}
    </div>
    <Card className="w-[400px] h-[400px] flex flex-col justify-between mt-4">
      <CardContent className="flex-grow overflow-y-auto p-6 pb-2 space-y-4">
        <div>
          <Label className="font-bold text-base mb-1">Question:</Label>
          <p className="text-sm">{test.test_question}</p>
        </div>
        <hr />
        <div>
          <Label className="font-bold text-base mb-1">Correct Answer:</Label>
          <p className="text-sm">{test.correct_option}</p>
        </div>
        <hr />
        <div>
          <Label className="font-bold text-base mb-1">Incorrect Answers:</Label>
          <ul className="list-disc pl-5 text-sm">
            {test.incorrect_options.map((answer, index) => (
              <li key={index}>{answer}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      {onEdit && onDelete && (
        <CardFooter className="p-4 flex gap-4 justify-end">
          <Button variant="destructive" onClick={() => onDelete(test.test_id)}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => onEdit(test)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardFooter>
      )}
    </Card>
  </div>
);

const TestEditor: React.FC<{
  test: Test;
  onTestChange: {
    setTestQuestion: (value: string) => void;
    setCorrectOption: (value: string) => void;
    setIncorrectOptions: (index: number, value: string) => void;
  };
  errors: {
    question?: string;
    correctOption?: string;
    incorrectOptions?: string[];
  };
}> = ({ test, onTestChange, errors }) => {
  const { setTestQuestion, setCorrectOption, setIncorrectOptions } = onTestChange;

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <Label>Question</Label>
        <Input
          type="text"
          value={test.test_question}
          onChange={(e) => setTestQuestion(e.target.value)}
          placeholder="Enter question"
        />
        {errors.question && <p className="text-red-500 text-sm">{errors.question}</p>}
      </div>
      <div>
        <Label>Correct Answer</Label>
        <Input
          type="text"
          value={test.correct_option}
          onChange={(e) => setCorrectOption(e.target.value)}
          placeholder="Enter correct answer"
        />
        {errors.correctOption && <p className="text-red-500 text-sm">{errors.correctOption}</p>}
      </div>
      <div>
        <Label>Incorrect Answers</Label>
        {test.incorrect_options.map((answer, index) => (
          <div key={index} className="mt-2">
            <Input
              type="text"
              value={answer}
              onChange={(e) => setIncorrectOptions(index, e.target.value)}
              placeholder={`Enter incorrect answer ${index + 1}`}
            />
            {errors.incorrectOptions && errors.incorrectOptions[index] && (
              <p className="text-red-500 text-sm">{errors.incorrectOptions[index]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditTestDialog: React.FC<{
  test: Test;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTest: Test) => void;
}> = ({ test, isOpen, onClose, onSave }) => {
  const [editedTest, setEditedTest] = useState<Test>(test);
  const [errors, setErrors] = useState({});

  const onTestChange = {
    setTestQuestion: (value: string) => setEditedTest({ ...editedTest, test_question: value }),
    setCorrectOption: (value: string) => setEditedTest({ ...editedTest, correct_option: value }),
    setIncorrectOptions: (index: number, value: string) => {
      const updatedOptions = [...editedTest.incorrect_options];
      updatedOptions[index] = value;
      setEditedTest({ ...editedTest, incorrect_options: updatedOptions });
    },
  };

  const validateTest = () => {
    const newErrors: { [key: string]: string | string[] } = {};
    if (!editedTest.test_question.trim()) {
      newErrors.question = "Question cannot be empty";
    }
    if (!editedTest.correct_option.trim()) {
      newErrors.correctOption = "Correct option cannot be empty";
    }
    const incorrectOptionsErrors = editedTest.incorrect_options.map(option => 
      !option.trim() ? "Incorrect option cannot be empty" : null
    );
    if (incorrectOptionsErrors.some(error => error !== null)) {
      newErrors.incorrectOptions = incorrectOptionsErrors.filter(error => error !== null).join(', ');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdits = () => {
    if (validateTest()) {
      onSave(editedTest);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <TestEditor test={editedTest} onTestChange={onTestChange} errors={errors} />
            <div className="hidden lg:block w-full max-w-md">
            <TestCard test={editedTest} index={0} />
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveEdits}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ChunkNavigator: React.FC<{
  chunks: Chunk[];
  selectedChunkIndex: number;
  onChunkChange: (index: number) => void;
}> = ({ chunks, selectedChunkIndex, onChunkChange }) => {
  const selectedChunk = chunks[selectedChunkIndex];

  return (
    <div className="bg-primary/20 p-6 rounded-lg mb-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-black">{selectedChunk?.chunk_title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onChunkChange(Math.max(0, selectedChunkIndex - 1))}
            disabled={selectedChunkIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onChunkChange(Math.min(chunks.length - 1, selectedChunkIndex + 1))}
            disabled={selectedChunkIndex === chunks.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-black">
        <Markdown>
        {selectedChunk?.chunk_content}
        </Markdown>
        </p>
    </div>
  );
};

const CourseTestsEditor: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeletingTest, setIsDeletingTest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: content_id } = useParams();
  const { userID } = useStore();

  useEffect(() => {
    const fetchTestsAndChunks = async () => {
      if (content_id) {
        try {
          const chunksResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chunk/${content_id}`);
          console.log('Chunks:', chunksResponse.data);
          setChunks(chunksResponse.data);

          const testsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test/${content_id}`);
          console.log('Tests:', testsResponse.data);
          setTests(testsResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          if (axios.isAxiosError(error) && error.response) {
            setError(`Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
            toast({
              variant: "destructive", 
              title: "Error",
              description: `Failed to fetch data: ${error.response.data.message || 'Unknown error'}`
            });
          } else {
            setError('An unknown error occurred');
            toast({
              variant: "destructive",
              title: "Error", 
              description: "An unknown error occurred while fetching data"
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestsAndChunks();
  }, [content_id]);

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedTest: Test) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test/${updatedTest.test_id}`, updatedTest, {
        params: { user_id: userID }
      });
      setTests(tests.map(t => t.test_id === updatedTest.test_id ? updatedTest : t));
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating test:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update test. Please try again."
      });
    }
  };

  const handleDelete = (testId: string) => {
    setIsDeletingTest(testId);
  };

  const confirmDelete = async () => {
    if (isDeletingTest) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test/${isDeletingTest}`, {
          params: { user_id: userID }
        });
        setTests(tests.filter(t => t.test_id !== isDeletingTest));
        setIsDeletingTest(null);
      } catch (error) {
        console.error("Error deleting test:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete test. Please try again."
        });
      }
    }
  };

  const handleFinishEditing = async () => {
    try {
      router.push(`/test/${content_id}`);
    } catch (error) {
      console.error("Error submitting tests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit tests. Please try again."
      });
    }
  };

  const filteredTests = chunks[selectedChunkIndex]
    ? tests.filter(test => test.chunk_id === chunks[selectedChunkIndex].chunk_id)
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
        <CardHeader className="p-6 flex flex-col items-center">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Tests Editor</CardTitle>
            <CardDescription className="mt-2 max-w-2xl mx-auto">
              Review and edit the generated tests for your course. Make sure they accurately reflect the content and learning objectives.
            </CardDescription>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              // onClick={handleRedo}
              className="bg-secondary text-secondary-foreground"
              disabled={true}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Redo
              {/* {isRegenerating ? 'Regenerating...' : 'Redo'} */}
            </Button>
            <Button
              onClick={handleFinishEditing}
              className="bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Next'}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <div className="flex space-x-6 pt-6 pb-6" style={{ width: `${filteredTests.length * 420}px` }}>
                  {filteredTests.map((test, index) => (
                    <TestCard
                      key={test.test_id}
                      test={test}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      />
                    ))}
                </div>
              </div>
                    {chunks.length > 0 && (
                      <ChunkNavigator
                        chunks={chunks}
                        selectedChunkIndex={selectedChunkIndex}
                        onChunkChange={setSelectedChunkIndex}
                      />
                    )}
            </>
          )}
        </CardContent>
      {editingTest && (
        <EditTestDialog
          test={editingTest}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      <AlertDialog open={!!isDeletingTest} onOpenChange={() => setIsDeletingTest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this test?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseTestsEditor;
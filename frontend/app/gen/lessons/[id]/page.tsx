'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit, RotateCcw } from 'lucide-react';
import useStore from '@/useStore';
import ProgressBar from '@/components/ProgressBar';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Switch } from '@/components/ui/switch';

interface Lesson {
    lesson_id: string;
    course_id: string;
    chunk_id: string;
    title: string;
    subtitle: string;
    bullet_points: string[] | string;
}

const LessonCard: React.FC<{
    lesson: Lesson;
    onEdit: (lesson: Lesson) => void;
    onDelete: (lessonId: string) => void;
    showEditDelete?: boolean;
    cardNumber?: number;
}> = ({ lesson, onEdit, onDelete, showEditDelete = true, cardNumber }) => {
    const bulletPoints = Array.isArray(lesson.bullet_points)
        ? lesson.bullet_points
        : JSON.parse(lesson.bullet_points || '[]');

    return (
        <div className="relative mb-6">
            {cardNumber !== undefined && (
                <div className="absolute -top-6 left-2 text-sm font-semibold text-foreground">
                    #{cardNumber}
                </div>
            )}
            <Card className="bg-white rounded-lg p-4 flex flex-col justify-between w-full h-[400px]">
                <CardHeader className="flex flex-row justify-between items-center mb-2 p-0">
                    <CardTitle className="pb-2 text-lg font-semibold">{lesson.title}</CardTitle>
                    {showEditDelete && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(lesson)}
                                className="flex items-center justify-center"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(lesson.lesson_id)}
                                className="flex items-center justify-center"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-0">
                    <h4 className="font-semibold mb-2">{lesson.subtitle}</h4>
                    <ul className="list-disc pl-5">
                        {bulletPoints.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

const EditLessonDialog: React.FC<{
    lesson: Lesson | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedLesson: Lesson) => void;
}> = ({ lesson, isOpen, onClose, onSave }) => {
    const [editedLesson, setEditedLesson] = useState<Lesson | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (lesson) {
            const bulletPoints = Array.isArray(lesson.bullet_points)
                ? lesson.bullet_points
                : JSON.parse(lesson.bullet_points || '[]');
            setEditedLesson({ ...lesson, bullet_points: bulletPoints });
        } else {
            setEditedLesson(null);
        }
    }, [lesson]);

    if (!editedLesson) return null;

    const handleBulletPointChange = (index: number, value: string) => {
        const newBulletPoints = [...(editedLesson.bullet_points as string[])];
        newBulletPoints[index] = value;
        setEditedLesson({ ...editedLesson, bullet_points: newBulletPoints });
    };

    const handleAddBulletPoint = () => {
        setEditedLesson({
            ...editedLesson,
            bullet_points: [...(editedLesson.bullet_points as string[]), ''],
        });
    };

    const handleRemoveBulletPoint = (index: number) => {
        const newBulletPoints = [...(editedLesson.bullet_points as string[])];
        newBulletPoints.splice(index, 1);
        setEditedLesson({ ...editedLesson, bullet_points: newBulletPoints });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Edit Lesson</DialogTitle>
                    <DialogDescription>
                        Make changes to the lesson here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[400px]">
                        <div className="mb-4">
                            <Label htmlFor="lesson-title">Title</Label>
                            <Input
                                id="lesson-title"
                                value={editedLesson.title}
                                onChange={(e) =>
                                    setEditedLesson({ ...editedLesson, title: e.target.value })
                                }
                                placeholder="Enter title"
                                className="bg-white"
                            />
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="lesson-subtitle">Subtitle</Label>
                            <Input
                                id="lesson-subtitle"
                                value={editedLesson.subtitle}
                                onChange={(e) =>
                                    setEditedLesson({ ...editedLesson, subtitle: e.target.value })
                                }
                                placeholder="Enter subtitle"
                                className="bg-white"
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Bullet Points</Label>
                            {(editedLesson.bullet_points as string[]).map(
                                (point: string, index: number) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <Input
                                            value={point}
                                            onChange={(e) => handleBulletPointChange(index, e.target.value)}
                                            placeholder={`Bullet Point ${index + 1}`}
                                            className="mr-2 bg-white"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveBulletPoint(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            )}
                            <Button variant="outline" size="sm" onClick={handleAddBulletPoint}>
                                + Add Point
                            </Button>
                        </div>
                    </div>
                    <div className="w-full md:w-[400px]">
                        <div className="flex items-center justify-between mb-2 md:hidden">
                            <Label htmlFor="show-preview" className="text-sm font-medium">
                                Show Preview
                            </Label>
                            <Switch
                                id="show-preview"
                                checked={showPreview}
                                onCheckedChange={setShowPreview}
                            />
                        </div>
                        <div className={`${showPreview ? 'block' : 'hidden'} md:block`}>
                            <Label>Preview</Label>
                            <LessonCard
                                lesson={editedLesson}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                showEditDelete={false}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={() => onSave(editedLesson)} className="bg-primary">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const CourseLessonsEditor: React.FC = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeletingLesson, setIsDeletingLesson] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { id: content_id } = useParams();
    const { userID, isLoading: isUserLoading, session, fetchSessionAndUserStatus } = useStore();

    const fetchLessons = useCallback(async () => {
        if (content_id) {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson/${content_id}`,
                    {
                        params: { user_id: userID },
                    }
                );
                console.log('Lessons:', response.data);

                // Ensure bullet_points is an array
                const fetchedLessons = response.data.map((lesson: Lesson) => ({
                    ...lesson,
                    bullet_points: Array.isArray(lesson.bullet_points)
                        ? lesson.bullet_points
                        : JSON.parse(lesson.bullet_points || '[]'),
                }));

                setLessons(fetchedLessons);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [content_id, userID]);

    useEffect(() => {
        fetchSessionAndUserStatus();
    }, [fetchSessionAndUserStatus]);

    useEffect(() => {
        if (!isUserLoading && session) {
            fetchLessons();
        }
    }, [fetchLessons, isUserLoading, session]);

    const handleEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async (updatedLesson: Lesson) => {
        try {
            setIsSubmitting(true);
            // Send bullet_points as an array, not a JSON string
            await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson/${updatedLesson.lesson_id}`,
                updatedLesson,
                {
                    params: { user_id: userID },
                }
            );
            setLessons(
                lessons.map((l) =>
                    l.lesson_id === updatedLesson.lesson_id ? updatedLesson : l
                )
            );
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Error updating lesson:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (lessonId: string) => {
        setIsDeletingLesson(lessonId);
    };

    const confirmDelete = async () => {
        if (isDeletingLesson) {
            try {
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson/${isDeletingLesson}`,
                    {
                        params: { user_id: userID },
                    }
                );
                setLessons(lessons.filter((l) => l.lesson_id !== isDeletingLesson));
                setIsDeletingLesson(null);
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    const handleProceedToNextStep = () => {
        router.push(`/gen/tests/${content_id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ProgressBar />
                <CardHeader className="p-6 flex flex-col items-center">
                    <div className="text-center">
                        <CardTitle className="text-2xl font-bold">Lessons Editor</CardTitle>
                        <CardDescription className="mt-2 max-w-2xl mx-auto">
                            We identified the following main topics from the content. Please review and edit them.
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
                            onClick={handleProceedToNextStep}
                            className="bg-primary text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Next'}
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="w-full h-[400px] rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {lessons.map((lesson, index) => (
                                <div key={lesson.lesson_id} className="bg-secondary/10 rounded-lg">
                                    <LessonCard
                                        lesson={lesson}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        cardNumber={index + 1}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 flex justify-center">
                    <Button
                        onClick={handleProceedToNextStep}
                        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Proceed to Tests'}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                </CardFooter>

            <EditLessonDialog
                lesson={editingLesson}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveEdit}
            />

            <AlertDialog
                open={!!isDeletingLesson}
                onOpenChange={() => setIsDeletingLesson(null)}
            >
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-red-600">
                            Delete Confirmation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-700 mt-2">
                            Are you sure you want to delete this lesson? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CourseLessonsEditor;
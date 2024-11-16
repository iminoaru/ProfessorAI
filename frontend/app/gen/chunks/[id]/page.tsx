'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
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
import ReactMarkdown from 'react-markdown';
import { Trash2, Edit, RotateCcw } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { Skeleton } from '@/components/ui/skeleton';
import useStore from '@/useStore';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Switch } from '@/components/ui/switch';

interface Chunk {
  chunk_id: string;
  content_id: string;
  chunk_title: string;
  chunk_content: string;
}

const ChunkCard: React.FC<{
  chunk: Chunk;
  onEdit: (chunk: Chunk) => void;
  onDelete: (chunkId: string) => void;
  showEditDelete?: boolean;
  cardNumber?: number;
}> = ({
  chunk,
  onEdit,
  onDelete,
  showEditDelete = true,
  cardNumber,
}) => (
  <div className="relative mb-6">
    {cardNumber !== undefined && (
      <div className="absolute -top-6 left-2 text-sm font-semibold text-foreground">
        #{cardNumber}
      </div>
    )}
    <Card className="bg-white rounded-lg p-4 flex flex-col justify-between w-full h-[400px] shadow-md">
      <CardHeader className="flex flex-row justify-between items-center mb-2 p-0">
        <CardTitle className="pb-2 text-lg font-semibold">{chunk.chunk_title}</CardTitle>
        {showEditDelete && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(chunk)}
              className="flex items-center justify-center"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(chunk.chunk_id)}
              className="flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          className="prose prose-sm sm:prose-base lg:prose-lg"
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-3" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-base font-bold my-1" {...props} />,
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-blue-300 pl-4 my-2 italic text-gray-700" {...props} />
            ),
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <pre className={`language-${match[1]} bg-gray-100 p-2 rounded`}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : null;
            },
            a: ({ node, ...props }) => (
              <a className="text-blue-500 hover:underline" {...props} />
            ),
          }}
        >
          {chunk.chunk_content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  </div>
);

const EditChunkDialog: React.FC<{
  chunk: Chunk | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedChunk: Chunk) => void;
}> = ({ chunk, isOpen, onClose, onSave }) => {
  const [editedChunk, setEditedChunk] = useState<Chunk | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setEditedChunk(chunk);
  }, [chunk]);

  if (!editedChunk) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Chunk</DialogTitle>
          <DialogDescription>
            Make changes to the chunk here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <Label htmlFor="chunk-title">Title</Label>
              <Input
                id="chunk-title"
                className="bg-white"
                value={editedChunk.chunk_title}
                onChange={(e) =>
                  setEditedChunk({
                    ...editedChunk,
                    chunk_title: e.target.value,
                  })
                }
                placeholder="Enter title"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="chunk-content">Content</Label>
              <Textarea
                id="chunk-content"
                className="bg-white h-[200px] md:h-[300px]"
                value={editedChunk.chunk_content}
                onChange={(e) =>
                  setEditedChunk({
                    ...editedChunk,
                    chunk_content: e.target.value,
                  })
                }
                placeholder="Enter content"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
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
              
              <div className="bg-primary/10 rounded-lg overflow-y-auto p-4 h-full">
                <ChunkCard
                  chunk={editedChunk}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  showEditDelete={false}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={() => onSave(editedChunk)}
            disabled={!editedChunk.chunk_title.trim() || !editedChunk.chunk_content.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CourseChunksEditor: React.FC = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeletingChunk, setIsDeletingChunk] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { id: content_id } = useParams();
  const { userID, isLoading: isUserLoading, session, fetchSessionAndUserStatus } = useStore();

  const fetchChunks = useCallback(async () => {
    if (content_id && userID) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chunk/${content_id}`,
          {
            params: { user_id: userID },
          }
        );
        console.log('Chunks:', response.data);
        setChunks(response.data);
      } catch (error) {
        console.error('Error fetching chunks:', error);
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
      fetchChunks();
    }
  }, [fetchChunks, isUserLoading, session]);

  const handleEdit = (chunk: Chunk) => {
    setEditingChunk(chunk);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (updatedChunk: Chunk) => {
    try {
      setIsSubmitting(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chunk/${updatedChunk.chunk_id}`,
        updatedChunk,
        {
          params: { user_id: userID },
        }
      );
      setChunks(
        chunks.map((c) =>
          c.chunk_id === updatedChunk.chunk_id ? updatedChunk : c
        )
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating chunk:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (chunkId: string) => {
    setIsDeletingChunk(chunkId);
  };

  const confirmDelete = async () => {
    if (isDeletingChunk) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chunk/delete-chunks/${isDeletingChunk}`,
          {
            params: { user_id: userID },
          }
        );
        setChunks(chunks.filter((c) => c.chunk_id !== isDeletingChunk));
        setIsDeletingChunk(null);
      } catch (error) {
        console.error('Error deleting chunk:', error);
      }
    }
  };

  const handleFinishEditing = async () => {
    setIsProcessing(true);
    try {
      const [testResponse, lessonResponse] = await Promise.all([
        axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/test/generate-tests/${content_id}`,
          {},
          { params: { user_id: userID } }
        ),
        axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/lesson/generate-lessons/${content_id}`,
          {},
          { params: { user_id: userID } }
        ),
      ]);

      router.push(`/gen/chat/${content_id}`);
    } catch (error) {
      console.error('Error generating tests or lessons:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
        <CardHeader className="p-6 flex flex-col items-center">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Chunks Editor</CardTitle>
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
              onClick={handleFinishEditing}
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
              {chunks.map((chunk, index) => (
                <div key={chunk.chunk_id} className="bg-secondary/10 rounded-lg">
                  <ChunkCard
                    chunk={chunk}
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
            onClick={handleFinishEditing}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Proceed to Lessons'}
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>

      <EditChunkDialog
        chunk={editingChunk}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />

      <AlertDialog
        open={!!isDeletingChunk}
        onOpenChange={() => setIsDeletingChunk(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-red-600">
              Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 mt-2">
              Are you sure you want to delete this chunk? This action cannot be undone.
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

      {isProcessing && (
        <div 
          className="fixed inset-0 z-50 transition-all duration-500 ease-in-out"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-lg text-center opacity-0 animate-fade-in">
              <h3 className="text-3xl font-light mb-4 text-white">
                Putting Things Together
              </h3>
              <div className="space-y-2 text-lg">
                
                <p className="text-white/60 text-sm mt-4">
                  This might take a couple of minutes...
                </p>
              </div>
              
              {/* Minimal loading indicator */}
              <div className="mt-8">
                <div className="inline-flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400/80 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-blue-400/80 animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-400/80 animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseChunksEditor;

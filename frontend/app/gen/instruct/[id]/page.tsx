'use client'

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { FileText, Image as ImageIcon, FileSpreadsheet, FileAudio, FileVideo, Archive, ArrowRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import axios from 'axios';
import useStore from '@/useStore';
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from '@/hooks/use-toast';

export default function FileUploadPage() {
  const router = useRouter();
  const { id: course_id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [instructions, setInstructions] = useState('');
  const { userID } = useStore();
  const [loading, setLoading] = useState(true);

  const files = [
    { name: 'project_proposal.pdf', size: '2.3 MB', icon: FileText },
    { name: 'team_photo.jpg', size: '3.0 MB', icon: ImageIcon },
    { name: 'presentation_slides.pptx', size: '5.0 MB', icon: FileText },
    { name: 'budget_2023.xlsx', size: '1.0 MB', icon: FileSpreadsheet },
    { name: 'meeting_notes.docx', size: '512.0 KB', icon: FileText },
    { name: 'project_timeline.png', size: '2.0 MB', icon: ImageIcon }
  ];

  const instructionSuggestions = [
    "Make sure to include all key points",
    "Do not make it too hard",
    "Be concise and clear",
  ];

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instruct/${course_id}`, {
          params: { "user_id": userID }
        });
        
        const { title, summary, instructions } = res.data[0];

        setTitle(title || '');
        setSummary(summary || '');
        setInstructions(instructions || '');
        setLoading(false);
        
      } catch (error) {
        console.error("Error fetching instructions or generating image:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch instructions. Please try again."
        });
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [course_id, userID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, summary, instructions });

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instruct/${course_id}`,
        { title, summary, instructions },
        {
          params: { "user_id": userID }
        }
      );
      router.push(`/gen/review/${course_id}`);
      } catch (error) {
        console.error("Error submitting instructions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit instructions. Please try again."
        });
      }
  };

  const addInstruction = (suggestion: string) => {
    setInstructions(suggestion);
  };

  const ContentSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Instruct</CardTitle>
          <CardDescription className="text-center text-gray-600 mt-2 max-w-lg mx-auto">
            Provide a summary and some instructions to guide quiz generation. We have auto-filled the template with some suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <ContentSkeleton />
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium mb-1">Summary</label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full h-24"
                  />
                </div>
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium mb-1">Instructions</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {instructionSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-primary/30 text-primary hover:bg-primary/50"
                        onClick={() => addInstruction(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full h-24"
                  />
                </div>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-200 p-6 flex justify-center">
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            disabled={loading}
          >
            Next
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
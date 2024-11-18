'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ProgressBar from '@/components/ProgressBar';
import useStore from '@/useStore';
import { ArrowRight, Zap, FileText, Video, Headphones, Globe, Code, Link2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const [link, setLink] = useState('');
  const [course_id, setCourseID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { userID, session } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (!session) {
        alert('You need to be logged in to generate content');
        return;
      }
  
      console.log('Starting the first API call...');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/content`,
        { link, name: 'upload' },
        {
          headers: {
            Authorization: `Bearer ${session}`
          },
          params: { user_id: userID }
        }
      );
  
      if (response.data) {
        const generatedCourseID = response.data;
        setCourseID(generatedCourseID);
        console.log('First API call successful:', generatedCourseID);
  
        console.log('Starting the second API call...');
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/instruct/generate-instructions/${generatedCourseID}`,
          {},
          {
            params: { user_id: userID }
          }
        );
  
        console.log('Second API call successful');
        router.push(`/gen/instruct/${generatedCourseID}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate content please try again"
        });
        throw new Error('Failed to generate content');
      }
    } catch (error) {
      console.error('Error during API calls:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
      <Card className={`w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Upload</CardTitle>
          <CardDescription className="text-center text-gray-600 mt-2">Enter a link to learn from.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="https://example.com/article"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="flex justify-between gap-4">
              
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 round</Button>ed-md transition duration-300 ease-in-out">
                {isLoading ? 'Generating...' : 'Next'}
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </form>
          
        </CardContent>
      </Card>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Or try these examples:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => setLink("https://dmv.ny.gov/brochure/mv21.pdf")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 flex-shrink-0" size={20} />
                <span className="truncate">Clash Royale AI</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">Britain buys semiconductor factory for defence purposes</CardDescription>
            </CardHeader>
          </Card> */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => router.push("/test/ddaf4d75-17f6-40a2-b99c-61ae19034282")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 flex-shrink-0" size={20} />
                <span className="truncate">Core Java Quiz</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">A quiz on Core Java to quickly brush up your knowledge.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => router.push("/test/789a8ba9-99e8-4ff6-8943-ca54675ab5fc")}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Video className="mr-2 flex-shrink-0" size={20} />
                <span className="truncate">5/3/1 Strength Program</span>
              </CardTitle>
              <CardDescription className="line-clamp-2">Learn about the 5/3/1 Strength Program from the creator of Stronglifts.</CardDescription>
            </CardHeader>
          </Card>
          
        </div>
      </div>
      {isLoading && (
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
                Processing Your Content
              </h3>
              <div className="space-y-2 text-lg">
                <p className="text-white/60 text-sm mt-4">
                  This might take a couple of minutes...
                </p>
              </div>
              
              {/* Loading indicator */}
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
}
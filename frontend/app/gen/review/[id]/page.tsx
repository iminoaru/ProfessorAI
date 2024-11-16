'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import useStore from '@/useStore';
import ReactMarkdown from 'react-markdown';
import ProgressBar from '@/components/ProgressBar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface CourseData {
  name: string;
  markdown: string;
}

const ReviewPage = () => {
  const { id: course_id } = useParams();
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseData>({ name: '', markdown: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const { userID } = useStore();

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if(course_id){
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/content/${course_id}`, {
            params: { user_id: userID }
          });
          setCourseData(response.data[0]);
          console.log('Course data:', response.data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [course_id, userID]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/update-course/${course_id}`,
        courseData,
        {
          params: { user_id: userID }
        }
      );

      router.push(`/gen/chunks/${course_id}`);
    } catch (error) {
      console.error('Error updating course data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;
      const newValue = textarea.value.substring(0, selectionStart) + "\n" + textarea.value.substring(selectionEnd);
      setCourseData(prev => ({ ...prev, markdown: newValue }));
      
      // Set cursor position after setState
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };

  const ContentSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[calc(100vh-400px)] w-full" />
    </div>
  );

  const MarkdownPreview = () => (
    <div className="border p-4 bg-secondary/10 rounded-md overflow-auto h-[calc(100vh-400px)]">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-bold my-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-bold my-2" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-lg font-bold my-2" {...props} />,
          p: ({node, ...props}) => <p className="my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />,
          a: ({node, ...props}) => (
            <span className="inline-flex items-center">
              <a className="text-gray-700 underline" {...props} />
              <a href={props.href} target="_blank" rel="noopener noreferrer" className="underline">
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </span>
          ),
        }}
      >
        {courseData.markdown}
      </ReactMarkdown>
    </div>
  );

  const [isEditorMode, setIsEditorMode] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200 p-6">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Review Content</CardTitle>
            <CardDescription className="text-gray-600 mt-2 max-w-lg mx-auto">
              Preview the sourced content as markdown, a friendly format for AI. You can improve the generation by removing bad parsing artifacts.
            </CardDescription>
          </div>
          <div className="flex gap-4 pt-4 justify-center">
            <Button 
              onClick={handleSubmit} 
              className="bg-primary text-primary-foreground" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Submitting...' : 'Next'}
              {isSubmitting ? null : <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <ContentSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="md:hidden">
                <Tabs defaultValue="preview" className="w-full" onValueChange={(value) => setActiveTab(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <div className="w-full space-y-2">
                      <MarkdownPreview />
                    </div>
                  </TabsContent>
                  <TabsContent value="edit">
                    <div className="w-full space-y-2">
                      <Textarea
                        id="markdown"
                        name="markdown"
                        value={courseData.markdown}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full h-[calc(100vh-400px)]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="hidden md:block">
                <div className="flex justify-end mb-4">
                  <Switch
                    checked={isEditorMode}
                    onCheckedChange={setIsEditorMode}
                    id="editor-mode"
                  />
                  <Label htmlFor="editor-mode" className="ml-2">
                    Editor Mode
                  </Label>
                </div>
                {isEditorMode ? (
                  <div className="flex space-x-4">
                    <div className="w-1/2 space-y-2">
                      <label htmlFor="markdown" className="block text-sm font-medium mb-1 text-center">Editor</label>
                      <Textarea
                        id="markdown"
                        name="markdown"
                        value={courseData.markdown}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full h-[calc(100vh-400px)]"
                      />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <label htmlFor="markdown-preview" className="block text-sm font-medium mb-1 text-center">Preview</label>
                      <MarkdownPreview />
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <label htmlFor="markdown-preview" className="block text-sm font-medium mb-1 text-center">Preview</label>
                    <MarkdownPreview />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-200 p-6 flex justify-center">
          <Button 
            onClick={handleSubmit} 
            className="w-full md:w-1/4" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Submitting...' : 'Next'}
            {isSubmitting ? null : <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReviewPage;
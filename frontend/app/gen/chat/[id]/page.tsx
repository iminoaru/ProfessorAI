'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Send } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import useStore from '@/useStore';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { id: course_id } = useParams();
  const { userID } = useStore();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkGenerationStatus = () => {
      const status = localStorage.getItem(`generating_${course_id}`);
      setIsGenerating(status === 'true');
    };

    checkGenerationStatus();

    const interval = setInterval(checkGenerationStatus, 2000);

    return () => clearInterval(interval);
  }, [course_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    scrollToBottom();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${course_id}/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id,
            message: input,
            user_id: userID,
          }),
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let partialResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsStreaming(false);
              scrollToBottom();
              break;
            }
            partialResponse += data;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].content = partialResponse;
              return newMessages;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleNext = () => {
    if (!isGenerating) {
      router.push(`/gen/lessons/${course_id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar />
      <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div>
            <h1 className="text-xl font-semibold">AI Professor 🧑‍🏫</h1>
            </div>
          <Button 
            onClick={handleNext} 
            variant="outline" 
            className="gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">Generating Lessons & Quiz...</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue to Lessons
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Ask any doubts regarding the material you uploaded
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-white border mr-4'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        className="prose prose-sm max-w-none dark:prose-invert"
                        components={{
                          p: ({node, ...props}) => <p className="my-1 whitespace-pre-wrap" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                          code: ({node, className, children, ...props}) => (
                            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5" {...props}>
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white p-4 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import useStore from '@/useStore';
import { ArrowRightIcon, FileTextIcon, DownloadIcon, EyeOpenIcon } from '@radix-ui/react-icons';

const CourseLessonsEditor: React.FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();
    const { id: content_id } = useParams();
    const { userID, isLoading: isUserLoading, session, fetchSessionAndUserStatus } = useStore();

    useEffect(() => {
        fetchSessionAndUserStatus();
    }, [fetchSessionAndUserStatus]);

    const handleProceedToNextStep = () => {
        router.push(`/test/${content_id}`);
    };

    const handleDownloadPPT = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/lessons-pptx/${content_id}`,
                {
                    params: { user_id: userID },
                    responseType: 'blob',
                }
            );

            const pptBlob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            });
            const url = URL.createObjectURL(pptBlob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Lessons_${content_id}.pptx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PPT:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleViewLessonsAsPDF = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/lessons-pdf/${content_id}`,
                {
                    params: { user_id: userID },
                    responseType: 'blob',
                }
            );

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfUrl);
        } catch (error) {
            console.error('Error fetching PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Lessons Review</h1>
                <p className="text-lg text-gray-600">
                    Here is a PPT you can use to instruct your students. These can serve well as flashcards too.
                </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center items-center">
                <Button onClick={handleViewLessonsAsPDF} className="w-full sm:w-auto" disabled={isDownloading}>
                <EyeOpenIcon className="h-4 w-4 mr-2" /> {isDownloading ? 'Loading...' : 'View PDF'} 
                </Button>
                <Button onClick={handleDownloadPPT} className="w-full sm:w-auto" disabled={isDownloading}>
                <DownloadIcon className="h-4 w-4 mr-2" />  {isDownloading ? 'Downloading...' : 'Download PPT'}
                </Button>
                <Button onClick={handleProceedToNextStep} className="w-full sm:w-auto">
                    Take Test <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
            </div>

            {pdfUrl && (
                <div className="mt-8 flex justify-center">
                    <iframe src={pdfUrl} className="w-4/5 h-[600px]" title="Lessons PDF"></iframe>
                </div>
            )}
        </div>
    );
};

export default CourseLessonsEditor;

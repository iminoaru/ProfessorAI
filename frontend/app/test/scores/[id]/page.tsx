'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import useStore from '@/useStore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Score {
  score_id: string;
  course_id: string;
  user_id: string;
  incorrect_score: number;
  correct_score: number;
}

const CourseScoreView: React.FC = () => {
  const [score, setScore] = useState<Score | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { id: course_id } = useParams();
  const router = useRouter();
  const { userID, session } = useStore();

  useEffect(() => {
    const fetchScore = async () => {
      if (course_id) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/score/get-scores/${course_id}`,
            {
              params: { user_id: userID },
              headers: {
                Authorization: `Bearer ${session}`,
              },
            }
          );
          console.log('Score:', response.data);
          setScore(response.data[0]);
        } catch (error) {
          console.error('Error fetching score:', error);
          if (axios.isAxiosError(error) && error.response) {
            setError(
              `Error: ${error.response.status} - ${
                error.response.data.message || 'Unknown error'
              }`
            );
          } else {
            setError('An unknown error occurred');
          }
        }
      }
    };

    fetchScore();
  }, [course_id, userID, session]);

  if (error) {
    return <div className="text-red-500 mt-8 text-center">{error}</div>;
  }

  if (!score) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mt-4 mb-6 text-center">Your Quiz Results</h1>
        <Card className="max-w-2xl mx-auto p-6">
          <div className="text-center mb-6">
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-4" />
          </div>
          <div className="max-w-md mx-auto">
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  const totalQuestions = score.correct_score + score.incorrect_score;

  const data = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        label: 'Number of Questions',
        data: [score.correct_score, score.incorrect_score],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Quiz Results',
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center">Your Quiz Results</h1>

      <Card className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <p className="text-lg">
            <strong>Attempted Questions:</strong> {totalQuestions}
          </p>
          <p className="text-lg">
            <strong>Correct Answers:</strong> {score.correct_score}
          </p>
          <p className="text-lg">
            <strong>Incorrect Answers:</strong> {score.incorrect_score}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Bar data={data} options={options} />
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
      </div>
    </div>
  );
};

export default CourseScoreView;

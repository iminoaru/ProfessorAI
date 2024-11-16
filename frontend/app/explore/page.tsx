import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ExplorePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Popular Quizzes Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Popular Quizzes</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48">
                    <p className="text-gray-500">Stay tuned! Popular quizzes will be available shortly.</p>
                </CardContent>
            </Card>

            {/* Leaderboards Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboards</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-48">
                    <p className="text-gray-500">Leaderboards feature is on the way. Check back soon!</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExplorePage;

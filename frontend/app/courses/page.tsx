'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useStore from '@/useStore';
import Link from 'next/link';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { Loader2, MoreHorizontal, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { debounce } from 'lodash'; // Import debounce utility

interface Course {
  course_id: string;
  author_id: string;
  name: string;
  source: string;
  total_questions: number;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { userID, session, isLoading, fetchSessionAndUserStatus } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch courses from the backend
  const fetchCourses = useCallback(async () => {
    if (!userID || !session) {
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/course/course-info`,
        {
          params: { user_id: userID },
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
      toast({
        title: 'Error',
        description: 'There was an error fetching your courses.',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  }, [userID, session, toast]);

  useEffect(() => {
    fetchSessionAndUserStatus();
  }, [fetchSessionAndUserStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!userID || !session) {
          router.push('/register?callback=/courses');
        } else {
          fetchCourses();
        }
      }
    }, 500); // Reduced delay for faster response

    return () => clearTimeout(timer);
  }, [isLoading, userID, session, fetchCourses, router]);

  // Debounced search to optimize performance
  const debouncedSearch = useCallback(
    debounce((query: string, coursesList: Course[]) => {
      const filtered = coursesList.filter(
        (course) =>
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.source.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }, 300), // 300ms debounce delay
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery, courses);
  }, [searchQuery, courses, debouncedSearch]);

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/course/delete-course/${courseToDelete.course_id}`,
        {
          params: { user_id: userID },
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );
      const updatedCourses = courses.filter(
        (course) => course.course_id !== courseToDelete.course_id
      );
      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      toast({
        title: 'Course Deleted',
        description: `The course "${courseToDelete.name}" has been deleted.`,
        variant: 'default',
      });
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the course.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4 text-center">My Courses</h1>
      <p className="text-lg mb-8 text-center">
        Search for your courses, take tests anytime, and edit the content.
      </p>

      {/* Search Input */}
      {courses.length > 0 && (
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search courses"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading || isFetching ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full max-w-md mx-auto" />
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button
            onClick={fetchCourses}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : filteredCourses.length > 0 ? (
        // Courses Table
        <div className="overflow-x-auto">
          <Table className="min-w-full text-lg">
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 text-left">Name</TableHead>
                <TableHead className="px-6 py-3 text-left">Source</TableHead>
                <TableHead className="px-6 py-3 text-left">Total Questions</TableHead>
                <TableHead className="px-6 py-3 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.course_id} className="hover:bg-gray-100">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {course.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                    <a
                      href={course.source}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {course.source}
                    </a>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {course.total_questions}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label="Actions">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => router.push(`/lesson/${course.course_id}`)}
                        >
                          PPT
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/test/${course.course_id}`)}
                        >
                          Take Test
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/gen/review/${course.course_id}`)}
                        >
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCourseToDelete(course)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        // No Courses Found
        <div className="text-center space-y-4">
          <p className="text-xl">
            {searchQuery
              ? 'No courses match your search.'
              : 'You have no courses yet.'}
          </p>
          <Link href="/gen/create">
            <Button className="mt-4">Create a Course</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the course &ldquo;{courseToDelete?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;

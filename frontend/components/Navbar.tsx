'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import useStore from '@/useStore';
import UserProfile from '@/components/supaauth/user-profile';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useStore();

  const handleCoursesClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      alert('Please sign in to access your courses');
      return;
    }
  };

  return (
    <nav className="bg-background border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">ProfessorAI</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-10 space-x-8">
              <Link 
                href="/gen/create"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Create
              </Link>
              <Link 
                href="/courses"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                onClick={handleCoursesClick}
              >
                My Courses
              </Link>
            </div>
          </div>

          {/* Right side - Auth & Mobile Menu */}
          <div className="flex items-center">
            {/* Auth Button/Profile */}
            {session ? (
              <div className="h-8 w-8">
                <UserProfile />
              </div>
            ) : (
              <Link 
                href="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-4 md:hidden p-2 rounded-md hover:bg-accent"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                href="/gen/create"
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Create
              </Link>
              <Link
                href="/courses"
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent"
                onClick={(e) => {
                  handleCoursesClick(e);
                  setIsOpen(false);
                }}
              >
                My Courses
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
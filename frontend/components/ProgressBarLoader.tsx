'use client'

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import NProgress from 'nprogress';
import { Loader2 } from 'lucide-react';

export default function LoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

  useEffect(() => {
    if (isPending) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isPending]);

  useEffect(() => {
    startTransition(() => {
      // This empty transition will trigger for route changes
    });
  }, [pathname, searchParams, startTransition]);

  if (!isPending) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <p className="mt-2 text-lg font-semibold text-white">Processing...</p>
      </div>
    </div>
  );
}
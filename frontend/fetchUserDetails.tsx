'use client'
import React, { useEffect } from 'react';
import useStore from './useStore';

const FetchUserDetails: React.FC = () => {
  const fetchSessionAndUserStatus = useStore((state) => state.fetchSessionAndUserStatus);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    fetchSessionAndUserStatus();
  }, [fetchSessionAndUserStatus]);

  // You can use this loading state in your app to show a loading indicator
  
  return null;
};

export default FetchUserDetails;
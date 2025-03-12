"use client";
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="flex flex-col items-center justify-center p-12">
            <svg 
              className="w-16 h-16 text-[#ea176b]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">Something went wrong!</h3>
            <p className="mt-2 text-sm text-gray-500">
              We're sorry, but an error occurred while loading the page.
            </p>
            <button 
              onClick={() => reset()}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
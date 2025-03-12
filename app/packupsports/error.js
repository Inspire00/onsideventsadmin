// app/error.js
'use client';
 
import { useEffect } from 'react';
 
export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-[#ea176b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Something went wrong!</h1>
        <p className="mt-2 text-gray-600">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 px-6 py-2 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white font-medium rounded-md hover:from-[#d01461] hover:to-[#0aa78a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea176b]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}



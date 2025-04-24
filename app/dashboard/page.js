// app/dashboard/page.js
"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';// Adjust the path to your firebase config
import { onAuthStateChanged } from 'firebase/auth';


export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [user, setUser] = useState(null); // Store the authenticated user

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // If no user is signed in, redirect to home page
        router.push('/');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleCardClick = (path) => {
    router.push(path);
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-500 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Render dashboard only if user is authenticated
  return (
    <div className="min-h-screen bg-gray-500 py-8">

      
           

            

      <div className=" max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

         {/* Right Logo */}
         <div className="absolute right-32 top-80 -translate-y-1.5 md:hidden">
              <img
                src="/Icon_GreenWeb.png" // Replace with your right logo path
                alt="Right Logo"
                className="h-20 w-auto" // Adjust size as needed
              />
            </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] sm:px-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-white">Welcome, {user?.email}! Choose an option below</p>
          </div>

         

          <div className="px-4 py-5 sm:p-6 bg-rose-50">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Create Function Pack */}
              <div
                onClick={() => handleCardClick('/functionpack')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Create Function Pack Envelope</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">Plan and manage event function packs</p>
                </div>
              </div>

              {/* Card 2: Create Corporate PackUp */}
              <div
                onClick={() => handleCardClick('/packupformal')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Create Corporate PackUp</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">Organize corporate packing lists</p>
                </div>
              </div>

              {/* Card 3: Create Sports PackUp */}
              <div
                onClick={() => handleCardClick('/packupsports')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Create Sports PackUp</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">Manage sports event packing lists</p>
                </div>
              </div>

              {/* Card 4: Events Calendar */}
              <div
                onClick={() => handleCardClick('/events')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Events Calendar</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">View and schedule events</p>
                </div>
              </div>

               {/* Card 5: PackUpViews */}
               <div
                onClick={() => handleCardClick('/packupviews')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Pack Up Views</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">View all function pack ups</p>
                </div>
              </div>

               {/* Card 6: Sports Pack Up Views */}
               <div
                onClick={() => handleCardClick('/sportpackupviews')}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">Sport Pack Ups Views</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">View all sports pack ups</p>
                </div>
              </div>

            </div>
          </div>

           
        </div>
        {/* Left Logo */}
        <div className="absolute left-32 top-80 -translate-y-1.5 md:hidden">
              <img
                src="/Icon_TealWeb.png" // Replace with your left logo path
                alt="Left Logo"
                className="h-20 w-auto" // Adjust size as needed
              />
            </div>

      </div>
    </div>
  );
}
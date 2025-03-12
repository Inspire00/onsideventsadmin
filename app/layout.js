"use client"; // Make RootLayout a client component
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './config/firebase'; // Adjust path to your Firebase config
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar'; // Adjust path to your Navbar component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "Onside Events Admin",
  description: "Created by Vincent",
};


export default function RootLayout({ children }) {
  
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [user, setUser] = useState(null); // Store authenticated user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/'); // Redirect to home page if not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-500 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  // Render layout with Navbar and children only if authenticated
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen bg-gray-500 py-8">{children}</main>
      </body>
    </html>
  );
}

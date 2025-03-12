"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Starting auth check...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state resolved:", currentUser ? "Logged in" : "Not logged in");
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error("Auth callback error:", err);
      setError(err.message);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      if (loading) {
        console.error("Auth check timed out after 10s");
        setError("Authentication timed out. Please check Firebase config.");
        setLoading(false);
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]); // Keep router in deps to ensure effect runs once

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

  if (error) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-500 flex items-center justify-center">
          <div className="text-white text-center">
            <p>Error: {error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-[#ea176b] text-white rounded"
            >
              Go to Login
            </button>
          </div>
        </body>
      </html>
    );
  }

  if (!user) {
    console.log("No user, redirecting to /");
    if (typeof window !== 'undefined') {
      window.location.href = '/'; // Force full page reload
    }
    return (
      <html lang="en">
        <body className="min-h-screen bg-gray-500 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">Redirecting to login...</p>
          </div>
        </body>
      </html>
    );
  }

  console.log("Rendering main layout for user:", user.uid);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <main className="min-h-screen bg-gray-500 py-8">{children}</main>
      </body>
    </html>
  );
}
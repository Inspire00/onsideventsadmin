"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { auth } from './config/firebase';

import firebaseConfig from './config/firebase';

// List of authorized email addresses
const AUTHORIZED_EMAILS = [
  'greg@onsideevents.co.za',
  'collette@onsideevents.co.za',
  'tyron@onsideevents.co.za',
  'joey@onsideevents.co.za',
  'thuli@onsideevents.co.za',
  'nadia@onsideevents.co.za',
  'adele@onsideevents.co.za',
  'nissah@onsideevents.co.za',
  'vinnyatsa2@gmail.com'

  ];

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if email is in authorized list
    if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      setError('Not Authorised User');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Use Firebase Auth directly without Firestore check first
      await signInWithEmailAndPassword(auth, email, password);
      
      // If successful, redirect to home page
      router.push('/dashboard');
    } catch (error) {
      // Handle Firebase Auth errors
      setLoading(false);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('User does not exist');
          break;
        case 'auth/wrong-password':
          setError('Invalid password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Login failed: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[#1a1a1a] border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#ea176b]">Onside Admin Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white-500 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b] text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b] text-white"
              pattern="[a-zA-Z0-9]+" // Alphanumeric validation
              title="Password must contain only letters and numbers"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ea176b] hover:bg-[#d0065a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea176b] transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
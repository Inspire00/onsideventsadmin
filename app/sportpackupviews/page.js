"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase'; // Adjust path based on your project structure
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader'; // Adjust path if needed

export default function SportPackupViews() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const packsCollection = collection(db, "packuplistsports");
      const packsSnapshot = await getDocs(packsCollection);
      const packsList = packsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date
      }));
      packsList.sort((a, b) => {
        const dateA = new Date(a.date.split('/').join('-'));
        const dateB = new Date(b.date.split('/').join('-'));
        return dateB - dateA; // Latest date first
      });
      setPacks(packsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sports packs:", err);
      setError("Failed to load sports packup data. Please try again later.");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (error) {
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
              <h3 className="mt-4 text-xl font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <button 
                onClick={fetchPacks}
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

  return (
    <div className="min-h-screen bg-gray-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] sm:px-6">
            <h1 className="text-2xl font-bold text-white">Sports Packup Views</h1>
            <p className="mt-1 text-sm text-white">View all sports packup information</p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="p-6">
              {packs.length > 0 ? (
                <div className="space-y-6">
                  {packs.map(pack => (
                    <SportPackCard key={pack.id} pack={pack} formatDate={formatDate} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No sports packup data available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SportPackCard({ pack, formatDate }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const renderMapItems = (mapObj, title) => {
    if (!mapObj || typeof mapObj !== 'object') return null;
    const items = Object.entries(mapObj).filter(([_, value]) => value !== "0"); // Exclude items with quantity "0"
    if (items.length === 0) return null;
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-2xl font-bold text-red-700">{title}:</h4>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span className="text-sm text-black">
                {key}: {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-rose-50 rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={toggleExpanded}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b]">
        <h2 className="text-lg font-semibold text-white">{pack.client}</h2>
        <p className="text-sm text-white">{formatDate(pack.date)}</p>
      </div>
      <div className="px-4 py-3">
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-700">Location: {pack.location}</p>
          <div className="flex justify-between items-center">
            <p className="text-base font-bold text-gray-700">Suite: {pack.suiteNumber || 'N/A'}</p>
            <p className="text-base font-bold text-gray-700">Stadium: {pack.stadium || 'N/A'}</p>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={expanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-3">
              
              {renderMapItems(pack.arrivalSnacks, "Arrival Snacks")}
              {renderMapItems(pack.cutlery, "Cutlery")}
              {renderMapItems(pack.drySnacks, "Dry Snacks")}
              {renderMapItems(pack.extras, "Extras")}
              {renderMapItems(pack.mainCourse, "Main Course")}
              {renderMapItems(pack.teaAndCoffeeStation, "Tea and Coffee Station")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const DetailRow = ({ label, value, children }) => (
  <div className="flex flex-row items-center">
    <span className="text-[#ea176b] text-lg font-medium">{label}: </span>
    {children ? (
      <div className="ml-2 text-gray-700 text-sm font-medium">{children}</div>
    ) : (
      <span className="ml-2 text-[#0cbb9b] text-base font-medium">{value}</span>
    )}
  </div>
);
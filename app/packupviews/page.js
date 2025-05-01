"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase'; // Adjust path based on your project structure
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader'; // Adjust path if needed

export default function PackupViews() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const packsCollection = collection(db, "packuplist");
      const packsSnapshot = await getDocs(packsCollection);
      const packsList = packsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date
      }));
      packsList.sort((a, b) => {
        const dateA = new Date(a.date.split('/').join('-'));
        const dateB = new Date(b.date.split('/').join('-'));
        return dateB - dateA;
      });
      setPacks(packsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching packs:", err);
      setError("Failed to load packup data. Please try again later.");
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
            <h1 className="text-2xl font-bold text-white">Packup Views</h1>
            <p className="mt-1 text-sm text-white">View all packup information</p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="p-6">
              {packs.length > 0 ? (
                <div className="space-y-6">
                  {packs.map(pack => (
                    <PackCard key={pack.id} pack={pack} formatDate={formatDate} refreshPacks={fetchPacks} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No packup data available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackCard({ pack, formatDate, refreshPacks }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);
  const toggleEdit = () => setIsEditing(!isEditing);

  const handleAddItem = async (e) => {
    e.stopPropagation();
    if (!newItem || !newQuantity) {
      alert("Please enter both an item name and quantity.");
      return;
    }

    const newItemEntry = {
      id: Date.now().toString(),
      item: newItem,
      quantity: newQuantity
    };

    try {
      const packRef = doc(db, "packuplist", pack.id);
      const updatedItems = pack.item && Array.isArray(pack.item) ? [...pack.item, newItemEntry] : [newItemEntry];
      await updateDoc(packRef, { item: updatedItems });
      console.log(`Added item to ${pack.id}:`, newItemEntry);
      setNewItem('');
      setNewQuantity('');
      setIsEditing(false);
      refreshPacks();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const packRef = doc(db, "packuplist", pack.id);
      await deleteDoc(packRef);
      console.log(`Deleted pack ${pack.id}`);
      setShowDeleteConfirm(false);
      refreshPacks();
    } catch (error) {
      console.error("Error deleting pack:", error);
      alert("Failed to delete pack. Please try again.");
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">{pack.compName}</h2>
            <p className="text-sm text-white">{formatDate(pack.date)}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="text-white hover:text-red-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <p className="text-base font-bold text-gray-700">Client: {pack.client}</p>
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
              <DetailRow label="Client" value={pack.client} />
              <DetailRow label="Company Name" value={pack.compName} />
              <DetailRow label="Date" value={formatDate(pack.date)} />
              <DetailRow label="Location" value={pack.location} />
             
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-bold text-red-700">Items:</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleEdit(); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isEditing ? 'Cancel' : 'Edit Items'}
                  </button>
                </div>
                {pack.item && Array.isArray(pack.item) && pack.item.length > 0 ? (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pack.item.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <span className="text-sm text-black">
                          {item.item}: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No items available</p>
                )}
                {isEditing && (
                  <div className="mt-4 space-y-2">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter item name"
                      className="w-90 px-3 py-2 text-sm border rounded-md"
                    />
                    <input
                      type="text"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter quantity"
                      className="w-40 ml-5 px-3 py-2 text-sm border rounded-md"
                    />
                    <button
                      onClick={handleAddItem}
                      className="w-full px-3 py-2 text-xs bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white rounded-md"
                    >
                      Add Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
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
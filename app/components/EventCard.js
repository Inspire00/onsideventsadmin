"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';

// Define DetailRow component
const DetailRow = ({ label, value, children }) => {
  return (
    <div className="flex flex-row items-center">
      <span className="text-[#ea176b] text-lg font-medium">{label}: </span>
      {children ? (
        <div className="ml-2 text-gray-700 text-sm font-medium">{children}</div>
      ) : (
        <span className="ml-2 text-[#0cbb9b] text-base font-medium">{value}</span>
      )}
    </div>
  );
};

export default function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const [pdfs, setPdfs] = useState({
    menu_pdf: event?.menu_pdf || '',
    fancy_pdf: event?.fancy_pdf || '',
    norman_pdf: event?.norman_pdf || '',
  });
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!event) {
    console.error("EventCard received an undefined event prop");
    return null;
  }

  const toggleExpanded = () => setExpanded(!expanded);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(0, 0, 0, hours, minutes));
  };

  const parseDate = (dateString) => {
    let date;
    if (dateString instanceof Date) {
      const year = dateString.getFullYear();
      const month = String(dateString.getMonth() + 1).padStart(2, '0');
      const day = String(dateString.getDate()).padStart(2, '0');
      return new Date(year, month - 1, day);
    }
    if (typeof dateString === "string") {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
      date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
    }
    console.error("Invalid date input, received:", dateString);
    return new Date();
  };

  const eventDate = parseDate(event.date);

  const toggleEditMode = () => setIsEditing(!isEditing);

  const removePdf = (pdfKey) => {
    setPdfs((prev) => ({ ...prev, [pdfKey]: '' }));
  };

  const addNewPdf = (url) => {
    if (!url) return;
    if (!pdfs.menu_pdf) {
      setPdfs((prev) => ({ ...prev, menu_pdf: url }));
    } else if (!pdfs.fancy_pdf) {
      setPdfs((prev) => ({ ...prev, fancy_pdf: url }));
    } else if (!pdfs.norman_pdf) {
      setPdfs((prev) => ({ ...prev, norman_pdf: url }));
    } else {
      console.warn("All PDF slots are filled!");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        let storageFolder;
        if (!pdfs.menu_pdf) storageFolder = 'menu_pdfs';
        else if (!pdfs.fancy_pdf) storageFolder = 'fancy_pdfs';
        else if (!pdfs.norman_pdf) storageFolder = 'norman_pdfs';
        else {
          console.warn("No available PDF slots!");
          return;
        }
        const storageRef = ref(storage, `${storageFolder}/${fileName}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        addNewPdf(downloadUrl);
        console.log(`Uploaded ${file.name} to ${storageFolder}: ${downloadUrl}`);
      } catch (error) {
        console.error("Error uploading PDF:", error);
      }
    } else {
      console.error("Please select a PDF file");
    }
  };

  const saveChanges = async () => {
    try {
      const eventRef = doc(db, "function_pack", event.id);
      await updateDoc(eventRef, {
        menu_pdf: pdfs.menu_pdf || null,
        fancy_pdf: pdfs.fancy_pdf || null,
        norman_pdf: pdfs.norman_pdf || null,
      });
      console.log("PDFs updated in Firestore for event:", event.id);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving PDF changes to Firestore:", error);
    }
  };

  console.log("Events data:", event);
  console.log("Current PDFs:", pdfs);

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
        <h2 className="text-lg font-semibold text-white">{event.compName}</h2>
        <p className="text-sm text-white">
          {eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <p className="text-base font-bold text-gray-700">Client: {event.client}</p>
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
              <DetailRow label="Location" value={event.location} />
              <DetailRow label="Guest Number" value={event.guestNum} />
              <DetailRow label="Guest Arrival" value={formatTime(event.guest_arrival)} />
              <DetailRow label="Setup Time" value={formatTime(event.set_up)} />
              <DetailRow label="Staff">
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-sm">Waiters: {event.waiters_num}</div>
                  <div className="text-sm">Barmen: {event.barmen_num}</div>
                  <div className="text-sm">Chefs: {event.chefs}</div>
                </div>
              </DetailRow>
              <DetailRow label="Function Manager" value={event.function_mgr} />
              <DetailRow label="Sales Associate" value={event.sales_associate} />
              {event.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">Notes:</h4>
                  <p className="mt-1 text-sm text-gray-600">{event.notes}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">PDF Documents:</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isEditing ? saveChanges() : toggleEditMode();
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isEditing ? 'Save' : 'Edit PDFs'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pdfs.menu_pdf && (
                    <div className="flex items-center">
                      <a
                        href={pdfs.menu_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs bg-[#ea176b] text-white rounded-md inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Menu PDF
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePdf('menu_pdf');
                          }}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  {pdfs.fancy_pdf && (
                    <div className="flex items-center">
                      <a
                        href={pdfs.fancy_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs bg-[#0cbb9b] text-white rounded-md inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Fancy Affairs PDF
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePdf('fancy_pdf');
                          }}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  {pdfs.norman_pdf && (
                    <div className="flex items-center">
                      <a
                        href={pdfs.norman_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-xs bg-[#e3ed18] text-black rounded-md inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Norman PDF
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePdf('norman_pdf');
                          }}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4 space-y-2">
                    <input
                      type="text"
                      value={newPdfUrl}
                      onChange={(e) => setNewPdfUrl(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Enter PDF URL (e.g., http://example.com/file.pdf)"
                      className="w-full px-3 py-2 text-sm border rounded-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addNewPdf(newPdfUrl);
                        setNewPdfUrl('');
                      }}
                      className="px-3 py-2 text-xs bg-blue-600 text-white rounded-md"
                    >
                      Add PDF URL
                    </button>
                    <div>
                      <label className="text-xs text-gray-600">Or upload a PDF file:</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
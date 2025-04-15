import { useState, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

const EventCard = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingPdfs, setIsEditingPdfs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrls, setPdfUrls] = useState({
    menu_pdf: '',
    hiring_pdf1: '',
    hiring_pdf2: '',
    hiring_pdf3: '',
    hiring_pdf4: '',
    hiring_pdf5: '',
    hiring_pdf6: '',
  });
  const fileInputRefs = {
    menu_pdf: useRef(null),
    hiring_pdf1: useRef(null),
    hiring_pdf2: useRef(null),
    hiring_pdf3: useRef(null),
    hiring_pdf4: useRef(null),
    hiring_pdf5: useRef(null),
    hiring_pdf6: useRef(null),
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEditPdfs = () => {
    setIsEditingPdfs(!isEditingPdfs);
    setError(null);
    setPdfUrls({
      menu_pdf: '',
      hiring_pdf1: '',
      hiring_pdf2: '',
      hiring_pdf3: '',
      hiring_pdf4: '',
      hiring_pdf5: '',
      hiring_pdf6: '',
    });
  };

  const handleUrlChange = (field) => (e) => {
    setPdfUrls((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (field) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validate field
    if (!fileInputRefs[field]) {
      console.error(`Invalid field: ${field}`);
      setError(`Invalid field: ${field}`);
      return;
    }
  
    setUploading(true);
    setError(null);
  
    try {
      const storageRef = ref(storage, `event_pdfs/${event.id}/${field}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
  
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { [field]: downloadURL });
  
      event[field] = downloadURL;
    } catch (err) {
      console.error(`Error uploading ${field}:`, err);
      setError(`Failed to upload ${field}. Please try again.`);
    } finally {
      setUploading(false);
      // Safely reset file input
      if (fileInputRefs[field]?.current) {
        fileInputRefs[field].current.value = '';
      } else {
        console.warn(`File input ref for ${field} is null`);
      }
    }
  };
  const handleSaveUrl = (field) => async () => {
    const url = pdfUrls[field];
    if (!url) return;

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { [field]: url });

      event[field] = url;
      setPdfUrls((prev) => ({ ...prev, [field]: '' }));
    } catch (err) {
      console.error(`Error saving URL for ${field}:`, err);
      setError(`Failed to save URL for ${field}. Please try again.`);
    }
  };

  const renderPdfField = (field, label) => (
    <div className="mt-2 flex items-center space-x-2">
      <p className="text-sm font-medium text-gray-700">
        {label}:{" "}
        <span className={event[field] ? "text-green-600" : "text-red-600"}>
          {event[field] ? "View PDF" : "No Pdf"}
        </span>
      </p>
      {event[field] && (
        <a
          href={event[field]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline text-sm"
        >
          🔗
        </a>
      )}
    </div>
  );

  const renderEditPdfField = (field, label) => (
    <div className="mt-2">
      <p className="text-sm font-semibold text-[#ea176b]">{label}:</p>
     
      <div className="mt-1 flex items-center space-x-2">
        <p className="text-sm text-black">Upload PDF:</p>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRefs[field]}
          onChange={handleFileChange(field)}
          className="text-sm"
          disabled={uploading}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] p-3 rounded-t-lg">
        <div>
          <h3 className="text-lg font-semibold text-white">{event.compName}</h3>
          <p className="text-sm font-semibold text-gray-200">Client: {event.client}</p>
          <p className="text-sm font-semibold text-gray-200">Date: {event.date}</p>
          <p className="text-sm font-semibold text-gray-200">Location: {event.location}</p>
        </div>
        <button
          onClick={toggleExpand}
          className="text-white hover:text-gray-200 focus:outline-none"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <p className="text-sm text-[#ea176b] mt-2">Guest Arrival: {event.guest_arrival}</p>
          <p className="text-sm text-[#ea176b] mt-2">Setup Time: {event.set_up}</p>
          <p className="text-sm text-[#ea176b] mt-2">
            Staff: Waiters: <span className='text-black font-bold text-[16px]'>{event.waiters_num}</span> Barmen: <span className='text-black font-bold text-[16px]'>{event.barmen_num}</span>
          </p>
          <p className="text-sm text-[#ea176b] mt-2">Chefs: {event.chefs}</p>
          <p className="text-sm text-[#ea176b] mt-2">Function Manager: {event.function_mgr}</p>
          <p className="text-sm text-[#ea176b] mt-2">Sales Associate: {event.sales_associate}</p>
          <p className="text-sm text-[#ea176b] mt-2">Notes: {event.notes}</p>
          
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-semibold text-gray-800">PDF Documents:</h4>
              <button
                onClick={toggleEditPdfs}
                className="text-blue-500 underline text-sm"
              >
                {isEditingPdfs ? "Done" : "Edit PDFs"}
              </button>
            </div>
            {!isEditingPdfs ? (
              <>
                {renderPdfField("menu_pdf", "Menu PDF")}
                {renderPdfField("hiring_pdf1", "Hiring PDF 1")}
                {renderPdfField("hiring_pdf2", "Hiring PDF 2")}
                {renderPdfField("hiring_pdf3", "Hiring PDF 3")}
                {renderPdfField("hiring_pdf4", "Hiring PDF 4")}
                {renderPdfField("hiring_pdf5", "Hiring PDF 5")}
                {renderPdfField("hiring_pdf6", "Hiring PDF 6")}
              </>
            ) : (
              <>
                {renderEditPdfField("menu_pdf", "Menu PDF")}
                {renderEditPdfField("hiring_pdf1", "Hiring PDF 1")}
                {renderEditPdfField("hiring_pdf2", "Hiring PDF 2")}
                {renderEditPdfField("hiring_pdf3", "Hiring PDF 3")}
                {renderEditPdfField("hiring_pdf4", "Hiring PDF 4")}
                {renderEditPdfField("hiring_pdf5", "Hiring PDF 5")}
                {renderEditPdfField("hiring_pdf6", "Hiring PDF 6")}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default EventCard;
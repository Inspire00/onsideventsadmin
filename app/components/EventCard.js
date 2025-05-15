import { useState, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const EventCard = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingPdfs, setIsEditingPdfs] = useState(false);
  const [isEditingGuestNum, setIsEditingGuestNum] = useState(false);
  const [isEditingWaitersNum, setIsEditingWaitersNum] = useState(false);
  const [isEditingBarmenNum, setIsEditingBarmenNum] = useState(false);
  const [isEditingChefs, setIsEditingChefs] = useState(false);
  const [isEditingHoursCharged, setIsEditingHoursCharged] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [guestNumInput, setGuestNumInput] = useState(event.guestNum);
  const [waitersNumInput, setWaitersNumInput] = useState(event.waiters_num);
  const [barmenNumInput, setBarmenNumInput] = useState(event.barmen_num);
  const [chefsInput, setChefsInput] = useState(event.chefs);
  const [hoursChargedInput, setHoursChargedInput] = useState(event.hours_charged);
  const [notesInput, setNotesInput] = useState(event.notes || '');
  const [dateInput, setDateInput] = useState(new Date(event.date));
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

  const toggleEditGuestNum = () => {
    setIsEditingGuestNum(!isEditingGuestNum);
    setGuestNumInput(event.guestNum);
    setError(null);
  };

  const toggleEditWaitersNum = () => {
    setIsEditingWaitersNum(!isEditingWaitersNum);
    setWaitersNumInput(event.waiters_num);
    setError(null);
  };

  const toggleEditBarmenNum = () => {
    setIsEditingBarmenNum(!isEditingBarmenNum);
    setBarmenNumInput(event.barmen_num);
    setError(null);
  };

  const toggleEditChefs = () => {
    setIsEditingChefs(!isEditingChefs);
    setChefsInput(event.chefs);
    setError(null);
  };

  const toggleEditHoursCharged = () => {
    setIsEditingHoursCharged(!isEditingHoursCharged);
    setHoursChargedInput(event.hours_charged);
    setError(null);
  };

  const toggleEditNotes = () => {
    setIsEditingNotes(!isEditingNotes);
    setNotesInput(event.notes || '');
    setError(null);
  };

  const toggleEditDate = () => {
    setIsEditingDate(!isEditingDate);
    setDateInput(new Date(event.date));
    setError(null);
  };

  const handleUrlChange = (field) => (e) => {
    setPdfUrls((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGuestNumChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setGuestNumInput(value);
    }
  };

  const handleWaitersNumChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setWaitersNumInput(value);
    }
  };

  const handleBarmenNumChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setBarmenNumInput(value);
    }
  };

  const handleChefsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setChefsInput(value);
    }
  };

  const handleHoursChargedChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setHoursChargedInput(value);
    }
  };

  const handleNotesChange = (e) => {
    setNotesInput(e.target.value);
  };

  const handleDateChange = (date) => {
    setDateInput(date);
  };

  const handleFileChange = (field) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  const handleSaveGuestNum = async () => {
    if (guestNumInput === '') {
      setError('Guest number cannot be empty');
      return;
    }

    const newGuestNum = Number(guestNumInput);
    if (isNaN(newGuestNum) || newGuestNum < 0) {
      setError('Please enter a valid guest number');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { guestNum: newGuestNum });
      event.guestNum = newGuestNum;
      setIsEditingGuestNum(false);
      setError(null);
    } catch (err) {
      console.error('Error saving guest number:', err);
      setError('Failed to save guest number. Please try again.');
    }
  };

  const handleSaveWaitersNum = async () => {
    if (waitersNumInput === '') {
      setError('Waiters number cannot be empty');
      return;
    }

    const newWaitersNum = Number(waitersNumInput);
    if (isNaN(newWaitersNum) || newWaitersNum < 0) {
      setError('Please enter a valid waiters number');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { waiters_num: newWaitersNum });
      event.waiters_num = newWaitersNum;
      setIsEditingWaitersNum(false);
      setError(null);
   lot } catch (err) {
      console.error('Error saving waiters number:', err);
      setError('Failed to save waiters number. Please try again.');
    }
  };

  const handleSaveBarmenNum = async () => {
    if (barmenNumInput === '') {
      setError('Barmen number cannot be empty');
      return;
    }

    const newBarmenNum = Number(barmenNumInput);
    if (isNaN(newBarmenNum) || newBarmenNum < 0) {
      setError('Please enter a valid barmen number');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { barmen_num: newBarmenNum });
      event.barmen_num = newBarmenNum;
      setIsEditingBarmenNum(false);
      setError(null);
    } catch (err) {
      console.error('Error saving barmen number:', err);
      setError('Failed to save barmen number. Please try again.');
    }
  };

  const handleSaveChefs = async () => {
    if (chefsInput === '') {
      setError('Chefs number cannot be empty');
      return;
    }

    const newChefs = Number(chefsInput);
    if (isNaN(newChefs) || newChefs < 0) {
      setError('Please enter a valid chefs number');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { chefs: newChefs });
      event.chefs = newChefs;
      setIsEditingChefs(false);
      setError(null);
    } catch (err) {
      console.error('Error saving chefs number:', err);
      setError('Failed to save chefs number. Please try again.');
    }
  };

  const handleSaveHoursCharged = async () => {
    if (hoursChargedInput === '') {
      setError('Hours charged cannot be empty');
      return;
    }

    const newHoursCharged = Number(hoursChargedInput);
    if (isNaN(newHoursCharged) || newHoursCharged < 0) {
      setError('Please enter a valid hours charged value');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { hours_charged: newHoursCharged });
      event.hours_charged = newHoursCharged;
      setIsEditingHoursCharged(false);
      setError(null);
    } catch (err) {
      console.error('Error saving hours charged:', err);
      setError('Failed to save hours charged. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { notes: notesInput });
      event.notes = notesInput;
      setIsEditingNotes(false);
      setError(null);
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes. Please try again.');
    }
  };

  const handleSaveDate = async () => {
    if (!dateInput) {
      setError('Date cannot be empty');
      return;
    }

    try {
      const formattedDate = `${dateInput.getFullYear()}/${String(dateInput.getMonth() + 1).padStart(2, '0')}/${String(dateInput.getDate()).padStart(2, '0')}`;
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { date: formattedDate });
      event.date = formattedDate;
      setIsEditingDate(false);
      setError(null);
    } catch (err) {
      console.error('Error saving date:', err);
      setError('Failed to save date. Please try again.');
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
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-200">Date:</p>
            {isEditingDate ? (
              <div className="flex items-center space-x-2">
                <DatePicker
                  selected={dateInput}
                  onChange={handleDateChange}
                  className="w-40 border border-gray-300 rounded px-2 py-1 text-sm text-black"
                />
                <button
                  onClick={handleSaveDate}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditDate}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold text-gray-200">{event.date}</span>
                <button
                  onClick={toggleEditDate}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
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
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-[#ea176b] min-w-[20px]">Guest Number:</p>
            {isEditingGuestNum ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={guestNumInput}
                  onChange={handleGuestNumChange}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveGuestNum}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditGuestNum}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[16px] text-black font-bold">{event.guestNum}</span>
                <button
                  onClick={toggleEditGuestNum}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-[#ea176b] mt-2">Guest Arrival: {event.guest_arrival}</p>
          <p className="text-sm text-[#ea176b] mt-2">Setup Time: {event.set_up}</p>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-[#ea176b] min-w-[20px]">Staff:</p>
            <span className="text-sm text-[#ea176b]">Waiters:</span>
            {isEditingWaitersNum ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={waitersNumInput}
                  onChange={handleWaitersNumChange}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveWaitersNum}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditWaitersNum}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[16px] text-black font-bold">{event.waiters_num}</span>
                <button
                  onClick={toggleEditWaitersNum}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
            <span className="text-sm text-[#ea176b]">Barmen:</span>
            {isEditingBarmenNum ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={barmenNumInput}
                  onChange={handleBarmenNumChange}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveBarmenNum}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditBarmenNum}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[16px] text-black font-bold">{event.barmen_num}</span>
                <button
                  onClick={toggleEditBarmenNum}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-[#ea176b] min-w-[20px]">Chefs:</p>
            {isEditingChefs ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={chefsInput}
                  onChange={handleChefsChange}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveChefs}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditChefs}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[16px] text-black font-bold">{event.chefs}</span>
                <button
                  onClick={toggleEditChefs}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-[#ea176b] min-w-[20px]">Hours Charged:</p>
            {isEditingHoursCharged ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={hoursChargedInput}
                  onChange={handleHoursChargedChange}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveHoursCharged}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditHoursCharged}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-[16px] text-black font-bold">{event.hours_charged}</span>
                <button
                  onClick={toggleEditHoursCharged}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-[#ea176b] mt-2">Function Manager: {event.function_mgr}</p>
          <p className="text-sm text-[#ea176b] mt-2">Sales Associate: {event.sales_associate}</p>
          <div className="flex items-center space-x-2 mt-2">
            <p className="text-sm text-[#ea176b] min-w-[20px]">Notes:</p>
            {isEditingNotes ? (
              <div className="flex items-center space-x-2">
                <textarea
                  value={notesInput}
                  onChange={handleNotesChange}
                  className="w-64 border border-gray-300 rounded px-2 py-1 text-sm"
                  rows="4"
                />
                <button
                  onClick={handleSaveNotes}
                  className="text-blue-500 underline text-sm"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditNotes}
                  className="text-red-500 underline text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-[#ea176b]">{event.notes || 'No notes'}</span>
                <button
                  onClick={toggleEditNotes}
                  className="text-blue-500 underline text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-semibold text-gray-800">PDF Documents:</h4>
              <button
                className="text-blue-500 underline text-sm"
                onClick={toggleEditPdfs}
              >
                {isEditingPdfs ? "Done" : "Edit PDFs"}
              </button>
            </div>
            {!isEditingPdfs ? (
              <>
                {renderPdfField("menu_pdf", "Menu PDF")}
                {renderPdfField("hiring_pdf1", "Attachment 1")}
                {renderPdfField("hiring_pdf2", "Attachment 2")}
                {renderPdfField("hiring_pdf3", "Attachment 3")}
                {renderPdfField("hiring_pdf4", "Attachment 4")}
                {renderPdfField("hiring_pdf5", "Attachment 5")}
                {renderPdfField("hiring_pdf6", "Attachment 6")}
              </>
            ) : (
              <>
                {renderEditPdfField("menu_pdf", "Menu PDF")}
                {renderEditPdfField("hiring_pdf1", "Attachment 1")}
                {renderEditPdfField("hiring_pdf2", "Attachment 2")}
                {renderEditPdfField("hiring_pdf3", "Attachment 3")}
                {renderEditPdfField("hiring_pdf4", "Attachment 4")}
                {renderEditPdfField("hiring_pdf5", "Attachment 5")}
                {renderEditPdfField("hiring_pdf6", "Attachment 6")}
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
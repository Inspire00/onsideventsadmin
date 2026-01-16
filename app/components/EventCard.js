"use client";
import { useState, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const EventCard = ({ event, onEventUpdate, currentUser, onEventDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingPdfs, setIsEditingPdfs] = useState(false);
  const [isEditingGuestNum, setIsEditingGuestNum] = useState(false);
  const [isEditingWaitersNum, setIsEditingWaitersNum] = useState(false);
  const [isEditingBarmenNum, setIsEditingBarmenNum] = useState(false);
  const [isEditingChefs, setIsEditingChefs] = useState(false);
  const [isEditingHoursCharged, setIsEditingHoursCharged] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingGuestArrival, setIsEditingGuestArrival] = useState(false);
  const [isEditingSetUp, setIsEditingSetUp] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [guestNumInput, setGuestNumInput] = useState(event.guestNum);
  const [waitersNumInput, setWaitersNumInput] = useState(event.waiters_num);
  const [barmenNumInput, setBarmenNumInput] = useState(event.barmen_num);
  const [chefsInput, setChefsInput] = useState(event.chefs);
  const [hoursChargedInput, setHoursChargedInput] = useState(event.hours_charged);
  const [notesInput, setNotesInput] = useState(event.notes || '');
  const [dateInput, setDateInput] = useState(new Date(event.date));
  const [guestArrivalInput, setGuestArrivalInput] = useState(event.guest_arrival);
  const [setUpInput, setSetUpInput] = useState(event.set_up);
  const [reportForm, setReportForm] = useState({
    hours_worked: '',
    guests_attended: '',
    hiring: [{ item: '', qty_issued: '', qty_counted: '' }],
    report: '',
  });
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrls, setPdfUrls] = useState({
    menu_pdf: '',
    event_menu: '',
    costing: '',
    hiring_pdf1: '',
    hiring_pdf2: '',
    hiring_pdf3: '',
    hiring_pdf4: '',
    hiring_pdf5: '',
    hiring_pdf6: '',
    hiring_pdf7: '',
    hiring_pdf8: '',
    hiring_pdf9: '',
  });
  const fileInputRefs = {
    menu_pdf: useRef(null),
    event_menu: useRef(null),
    costing: useRef(null),
    hiring_pdf1: useRef(null),
    hiring_pdf2: useRef(null),
    hiring_pdf3: useRef(null),
    hiring_pdf4: useRef(null),
    hiring_pdf5: useRef(null),
    hiring_pdf6: useRef(null),
    hiring_pdf7: useRef(null),
    hiring_pdf8: useRef(null),
    hiring_pdf9: useRef(null),
  };

  const allAcceptedFormats = ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .png, .jpg, .jpeg";

  // Check if current user can delete
  const canDelete = currentUser && (
    currentUser.email === 'support@onsideevents.co.za' || 
    currentUser.email === 'Tyrone@onsideevents.co.za' ||
    currentUser.email === 'vinnyatsa2@gmail.com'
  );

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEditPdfs = () => {
    setIsEditingPdfs(!isEditingPdfs);
    setError(null);
    setPdfUrls({
      menu_pdf: '',
      event_menu: '',
      costing: '',
      hiring_pdf1: '',
      hiring_pdf2: '',
      hiring_pdf3: '',
      hiring_pdf4: '',
      hiring_pdf5: '',
      hiring_pdf6: '',
      hiring_pdf7: '',
      hiring_pdf8: '',
      hiring_pdf9: '',
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

  const toggleEditGuestArrival = () => {
    setIsEditingGuestArrival(!isEditingGuestArrival);
    setGuestArrivalInput(event.guest_arrival);
    setError(null);
  };

  const toggleEditSetUp = () => {
    setIsEditingSetUp(!isEditingSetUp);
    setSetUpInput(event.set_up);
    setError(null);
  };

  const toggleEditReport = () => {
    setIsEditingReport(!isEditingReport);
    setReportForm({
      hours_worked: '',
      guests_attended: '',
      hiring: [{ item: '', qty_issued: '', qty_counted: '' }],
      report: '',
    });
    setError(null);
  };

  const toggleViewReport = () => {
    setIsViewingReport(!isViewingReport);
    setError(null);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setPasswordInput('');
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (passwordInput !== '2010onside') {
      setError('Incorrect password');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Delete associated Storage files
      const listRef = ref(storage, `event_pdfs/${event.id}`);
      const list = await listAll(listRef);
      const deletePromises = list.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletePromises);

      // Delete Firestore document
      const eventRef = doc(db, 'function_pack', event.id);
      await deleteDoc(eventRef);

      // Notify parent to remove the event from the list
      if (onEventDelete) {
        onEventDelete(event.id);
      }

      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setDeleting(false);
    }
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

  const handleGuestArrivalChange = (e) => {
    setGuestArrivalInput(e.target.value);
  };

  const handleSetUpChange = (e) => {
    setSetUpInput(e.target.value);
  };

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    if (name === 'report') {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount <= 200) {
        setReportForm((prev) => ({ ...prev, [name]: value }));
      } else {
        setError('Report cannot exceed 200 words');
      }
    } else {
      setReportForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleHiringChange = (index, field, value) => {
    const newHiring = [...reportForm.hiring];
    if (field === 'qty_issued' || field === 'qty_counted') {
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        newHiring[index][field] = value;
      }
    } else {
      newHiring[index][field] = value;
    }
    setReportForm((prev) => ({ ...prev, hiring: newHiring }));
  };

  const addHiringEntry = () => {
    setReportForm((prev) => ({
      ...prev,
      hiring: [...prev.hiring, { item: '', qty_issued: '', qty_counted: '' }],
    }));
  };

  const removeHiringEntry = (index) => {
    setReportForm((prev) => ({
      ...prev,
      hiring: prev.hiring.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (field) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!fileInputRefs[field]?.current) {
      setError(`Invalid field: ${field}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `event_pdfs/${event.id}/${field}-${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { [field]: downloadURL });

      const updatedDoc = await getDoc(eventRef);
      if (updatedDoc.exists()) {
        const updatedEvent = { id: updatedDoc.id, ...updatedDoc.data() };
        if (onEventUpdate) {
          onEventUpdate(updatedEvent);
        } else {
          setError('Event updated, but UI may not reflect changes. Please refresh.');
        }
      } else {
        setError('Failed to fetch updated event data');
      }
    } catch (err) {
      setError(`Failed to upload ${field}: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRefs[field]?.current) {
        fileInputRefs[field].current.value = '';
      }
    }
  };

  const handleSaveUrl = async (field) => {
    const url = pdfUrls[field];
    if (!url) return;

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { [field]: url });
      event[field] = url;
      setPdfUrls((prev) => ({ ...prev, [field]: '' }));
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingGuestNum(false);
      setError(null);
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingWaitersNum(false);
      setError(null);
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingBarmenNum(false);
      setError(null);
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingChefs(false);
      setError(null);
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingHoursCharged(false);
      setError(null);
    } catch (err) {
      setError('Failed to save hours charged. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { notes: notesInput });
      event.notes = notesInput;
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingNotes(false);
      setError(null);
    } catch (err) {
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
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingDate(false);
      setError(null);
    } catch (err) {
      setError('Failed to save date. Please try again.');
    }
  };

  const handleSaveGuestArrival = async () => {
    if (!guestArrivalInput) {
      setError('Guest Arrival time cannot be empty');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { guest_arrival: guestArrivalInput });
      event.guest_arrival = guestArrivalInput;
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingGuestArrival(false);
      setError(null);
    } catch (err) {
      setError('Failed to save guest arrival time. Please try again.');
    }
  };

  const handleSaveSetUp = async () => {
    if (!setUpInput) {
      setError('Set Up time cannot be empty');
      return;
    }

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, { set_up: setUpInput });
      event.set_up = setUpInput;
      if (onEventUpdate) {
        const updatedDoc = await getDoc(eventRef);
        onEventUpdate({ id: updatedDoc.id, ...updatedDoc.data() });
      }
      setIsEditingSetUp(false);
      setError(null);
    } catch (err) {
      setError('Failed to save set up time. Please try again.');
    }
  };

  const handleSaveReport = async () => {
    const hoursWorked = Number(reportForm.hours_worked);
    const guestsAttended = Number(reportForm.guests_attended);
    if (reportForm.hours_worked === '' || isNaN(hoursWorked) || hoursWorked < 0) {
      setError('Please enter a valid number for hours worked');
      return;
    }
    if (reportForm.guests_attended === '' || isNaN(guestsAttended) || guestsAttended < 0) {
      setError('Please enter a valid number for guests attended');
      return;
    }
    for (const [index, entry] of reportForm.hiring.entries()) {
      if (!entry.item.trim()) {
        setError(`Hiring item ${index + 1} name cannot be empty`);
        return;
      }
      const qtyIssued = Number(entry.qty_issued);
      const qtyCounted = Number(entry.qty_counted);
      if (entry.qty_issued === '' || isNaN(qtyIssued) || qtyIssued < 0) {
        setError(`Hiring item ${index + 1} issued quantity must be a valid number`);
        return;
      }
      if (entry.qty_counted === '' || isNaN(qtyCounted) || qtyCounted < 0) {
        setError(`Hiring item ${index + 1} counted quantity must be a valid number`);
        return;
      }
    }
    const wordCount = reportForm.report.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 200) {
      setError('Report cannot exceed 200 words');
      return;
    }

    const newReport = {
      hours_worked: hoursWorked,
      guests_attended: guestsAttended,
      hiring: reportForm.hiring.map((entry) => ({
        item: entry.item,
        qty_issued: Number(entry.qty_issued),
        qty_counted: Number(entry.qty_counted),
        missing: Number(entry.qty_issued) - Number(entry.qty_counted),
      })),
      report: reportForm.report,
    };

    try {
      const eventRef = doc(db, 'function_pack', event.id);
      await updateDoc(eventRef, {
        event_report: arrayUnion(newReport),
      });
      const updatedDoc = await getDoc(eventRef);
      if (updatedDoc.exists()) {
        const updatedEvent = { id: updatedDoc.id, ...updatedDoc.data() };
        if (onEventUpdate) {
          onEventUpdate(updatedEvent);
        }
        setIsEditingReport(false);
        setReportForm({
          hours_worked: '',
          guests_attended: '',
          hiring: [{ item: '', qty_issued: '', qty_counted: '' }],
          report: '',
        });
        setError(null);
      } else {
        setError('Failed to fetch updated event data');
      }
    } catch (err) {
      setError('Failed to save event report. Please try again.');
    }
  };

  const renderPdfField = (field, label) => (
    <div className="mt-4 flex items-center space-x-2">
      <p className="text-sm font-medium text-gray-700">
        {label}:{" "}
        <span className={event[field] ? "text-green-600" : "text-red-600"}>
          {event[field] ? "View Document" : "No Document"}
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
    <div className="mt-4">
      <p className="text-sm font-semibold text-[#ea176b]">{label}:</p>
      <div className="mt-2 flex items-center space-x-2">
        <p className="text-sm text-black">Upload PDF:</p>
        <input
          type="file"
          // Updated to include Word, Excel, PowerPoint, and Images
          accept={allAcceptedFormats}
          ref={fileInputRefs[field]}
          onChange={handleFileChange(field)}
          className="text-sm"
          disabled={uploading}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] p-4 rounded-t-lg">
        <div>
          <h3 className="text-xl font-bold text-white">{event.compName}</h3>
          <p className="text-sm font-semibold text-gray-200 mt-2">Client: {event.client}</p>
          <div className="flex items-center space-x-2 mt-2">
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
                  className="text-blue-300 underline text-sm hover:text-blue-100"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditDate}
                  className="text-red-300 underline text-sm hover:text-red-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-200">{event.date}</span>
                <button
                  onClick={toggleEditDate}
                  className="text-blue-300 underline text-sm hover:text-blue-100"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-200 mt-2">Location: {event.location}</p>
        </div>
        <div className="flex items-center space-x-2">
          {canDelete && (
            <button
              onClick={handleDeleteClick}
              className="text-red-500 hover:text-red-700 focus:outline-none"
              disabled={deleting}
              title="Delete Event"
            >
              <svg
                className="w-6 h-6"
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
          )}
          <button
            onClick={toggleExpand}
            className="text-white hover:text-gray-200 focus:outline-none text-sm font-semibold px-4 py-2 rounded bg-gray-800"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">Please enter the password to delete this event:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-4"
              placeholder="Enter password"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Guest Number:</p>
            {isEditingGuestNum ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={guestNumInput}
                  onChange={handleGuestNumChange}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveGuestNum}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditGuestNum}
                  className="text-red-500 underline text-sm hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-base text-black font-semibold">{event.guestNum}</span>
                <button
                  onClick={toggleEditGuestNum}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Guest Arrival:</p>
            {isEditingGuestArrival ? (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={guestArrivalInput}
                  onChange={handleGuestArrivalChange}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={handleSaveGuestArrival}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditGuestArrival}
                  className="text-red-500 underline text-sm hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-base text-black font-semibold">{event.guest_arrival}</span>
                <button
                  onClick={toggleEditGuestArrival}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Setup Time:</p>
            {isEditingSetUp ? (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={setUpInput}
                  onChange={handleSetUpChange}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={handleSaveSetUp}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditSetUp}
                  className="text-red-500 underline text-sm hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-base text-black font-semibold">{event.set_up}</span>
                <button
                  onClick={toggleEditSetUp}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3">
      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-center space-x-3">
        <p className="text-sm font-semibold text-[#ea176b] min-w-[80px]">Staff:</p>
        <span className="text-sm font-semibold text-[#ea176b]">Waiters:</span>
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
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              Save
            </button>
            <button
              onClick={toggleEditWaitersNum}
              className="text-red-500 underline text-sm hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-base text-black font-semibold">{event.waiters_num}</span>
            <button
              onClick={toggleEditWaitersNum}
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              Edit
            </button>
          </div>
        )}
        <span className="text-sm font-semibold text-[#ea176b]">Barmen:</span>
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
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              Save
            </button>
            <button
              onClick={toggleEditBarmenNum}
              className="text-red-500 underline text-sm hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-base text-black font-semibold">{event.barmen_num}</span>
            <button
              onClick={toggleEditBarmenNum}
              className="text-blue-500 underline text-sm hover:text-blue-700"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Mobile: Vertical stacked layout */}
      <div className="md:hidden space-y-2">
        {/* Waiters Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span className="text-sm font-semibold text-[#ea176b]">👨‍🍳 Waiters:</span>
            <span className={!isEditingWaitersNum ? "text-base text-black font-semibold" : "text-gray-400"}>{event.waiters_num}</span>
          </div>
          {isEditingWaitersNum ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="number"
                value={waitersNumInput}
                onChange={handleWaitersNumChange}
                className="w-full sm:w-20 border border-gray-300 rounded px-2 py-2 text-sm"
                min="0"
                placeholder="Waiters"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveWaitersNum}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition duration-200"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditWaitersNum}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleEditWaitersNum}
              className="text-blue-500 underline text-sm hover:text-blue-700 sm:no-underline sm:bg-blue-100 sm:px-3 sm:py-1 sm:rounded"
            >
              Edit
            </button>
          )}
        </div>

        {/* Barmen Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <span className="text-sm font-semibold text-[#ea176b]">🍸 Barmen:</span>
            <span className={!isEditingBarmenNum ? "text-base text-black font-semibold" : "text-gray-400"}>{event.barmen_num}</span>
          </div>
          {isEditingBarmenNum ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="number"
                value={barmenNumInput}
                onChange={handleBarmenNumChange}
                className="w-full sm:w-20 border border-gray-300 rounded px-2 py-2 text-sm"
                min="0"
                placeholder="Barmen"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveBarmenNum}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition duration-200"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditBarmenNum}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleEditBarmenNum}
              className="text-blue-500 underline text-sm hover:text-blue-700 sm:no-underline sm:bg-blue-100 sm:px-3 sm:py-1 sm:rounded"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>



          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Chefs:</p>
            {isEditingChefs ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={chefsInput}
                  onChange={handleChefsChange}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveChefs}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditChefs}
                  className="text-red-500 underline text-sm hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-base text-black font-semibold">{event.chefs}</span>
                <button
                  onClick={toggleEditChefs}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Hours Charged:</p>
            {isEditingHoursCharged ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={hoursChargedInput}
                  onChange={handleHoursChargedChange}
                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="0"
                />
                <button
                  onClick={handleSaveHoursCharged}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={toggleEditHoursCharged}
                  className="text-red-500 underline text-sm hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-base text-black font-semibold">{event.hours_charged}</span>
                <button
                  onClick={toggleEditHoursCharged}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-[#ea176b] mt-4">Function Manager: {event.function_mgr}</p>
          <p className="text-sm font-semibold text-[#ea176b] mt-2">Sales Associate: {event.sales_associate}</p>
          <div className="flex items-start space-x-3 mt-4">
            <p className="text-sm font-semibold text-[#ea176b] min-w-[100px]">Notes:</p>
            {isEditingNotes ? (
              <div className="flex flex-col space-y-2">
                <textarea
                  value={notesInput}
                  onChange={handleNotesChange}
                  className="w-80 border border-gray-300 rounded px-2 py-1 text-sm"
                  rows="4"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveNotes}
                    className="text-blue-500 underline text-sm hover:text-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={toggleEditNotes}
                    className="text-red-500 underline text-sm hover:text-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#ea176b]">{event.notes || 'No notes'}</span>
                <button
                  onClick={toggleEditNotes}
                  className="text-blue-500 underline text-sm hover:text-blue-700"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={toggleEditReport}
              className="bg-[#ea176b] text-white font-semibold px-4 py-2 rounded hover:bg-[#c8145a] transition duration-200"
            >
              {isEditingReport ? 'Cancel Event Report' : 'Write Event Report'}
            </button>
            <button
              onClick={toggleViewReport}
              className="bg-[#0cbb9b] text-white font-semibold px-4 py-2 rounded hover:bg-[#099a7d] transition duration-200"
            >
              {isViewingReport ? 'Hide Event Report' : 'View Event Report'}
            </button>
          </div>
         {isEditingReport && (
                <div className="mt-6 p-6 border border-gray-300 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-bold text-[#ea176b] mb-4">Event Report</h4>
                  <div className="grid grid-cols-1 gap-y-6">
                    <div>
                      <label className="text-sm font-semibold text-[#ea176b]">Hours Worked:</label>
                      <input
                        type="number"
                        name="hours_worked"
                        value={reportForm.hours_worked}
                        onChange={handleReportChange}
                        className="mt-1 w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#ea176b]">Guests Attended:</label>
                      <input
                        type="number"
                        name="guests_attended"
                        value={reportForm.guests_attended}
                        onChange={handleReportChange}
                        className="mt-1 w-32 border border-gray-300 rounded px-2 py-1 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#ea176b]">Hiring Items:</label>
                      <div className="space-y-4 mt-3">
                        {reportForm.hiring.map((entry, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            {/* Desktop: Horizontal layout */}
                            <div className="hidden md:flex items-center space-x-3">
                              <input
                                type="text"
                                placeholder="Item name"
                                value={entry.item}
                                onChange={(e) => handleHiringChange(index, 'item', e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Issued"
                                value={entry.qty_issued}
                                onChange={(e) => handleHiringChange(index, 'qty_issued', e.target.value)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                              />
                              <input
                                type="number"
                                placeholder="Counted"
                                value={entry.qty_counted}
                                onChange={(e) => handleHiringChange(index, 'qty_counted', e.target.value)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                min="0"
                              />
                              <span className="w-20 text-sm text-gray-600 font-medium text-center">
                                Missing: <span className={Number(entry.qty_issued) - Number(entry.qty_counted) > 0 ? "text-red-600 font-semibold" : "text-green-600"}>{Number(entry.qty_issued) - Number(entry.qty_counted) || 0}</span>
                              </span>
                              {reportForm.hiring.length > 1 && (
                                <button
                                  onClick={() => removeHiringEntry(index)}
                                  className="text-red-500 text-sm hover:text-red-700 font-medium"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            
                            {/* Mobile: Vertical stacked layout */}
                            <div className="md:hidden space-y-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Item Name</label>
                                <input
                                  type="text"
                                  placeholder="Item name"
                                  value={entry.item}
                                  onChange={(e) => handleHiringChange(index, 'item', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Issued Qty</label>
                                <input
                                  type="number"
                                  placeholder="Issued"
                                  value={entry.qty_issued}
                                  onChange={(e) => handleHiringChange(index, 'qty_issued', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Counted Qty</label>
                                <input
                                  type="number"
                                  placeholder="Counted"
                                  value={entry.qty_counted}
                                  onChange={(e) => handleHiringChange(index, 'qty_counted', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                                  min="0"
                                />
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Missing</label>
                                <div className={`text-sm font-semibold text-center p-2 rounded ${
                                  Number(entry.qty_issued) - Number(entry.qty_counted) > 0 
                                    ? 'bg-red-100 text-red-700 border border-red-200' 
                                    : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                  {Number(entry.qty_issued) - Number(entry.qty_counted) || 0} items
                                </div>
                              </div>
                              {reportForm.hiring.length > 1 && (
                                <button
                                  onClick={() => removeHiringEntry(index)}
                                  className="w-full bg-red-100 text-red-600 py-2 px-4 rounded border border-red-200 hover:bg-red-200 text-sm font-medium transition duration-200"
                                >
                                  Remove Item
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addHiringEntry}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white rounded-md hover:from-[#c8145a] transition duration-200 font-semibold"
                      >
                        + Add Hiring Item
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#ea176b]">
                        Report (Max 200 words):
                      </label>
                      <textarea
                        name="report"
                        value={reportForm.report}
                        onChange={handleReportChange}
                        className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        rows="5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Word count: {reportForm.report ? reportForm.report.split(/\s+/).filter(Boolean).length : 0}/200
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveReport}
                        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                      >
                        Save Report
                      </button>
                      <button
                        onClick={toggleEditReport}
                        className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
          {isViewingReport && (
            <div className="mt-6 p-6 border border-gray-300 rounded-lg bg-gray-50">
              <h4 className="text-lg font-bold text-[#ea176b] mb-4">Event Reports</h4>
              {event.event_report && event.event_report.length > 0 ? (
                event.event_report.map((report, index) => (
                  <div key={index} className="mb-6 border-b border-gray-200 pb-4">
                    <p className="text-base font-bold text-[#ea176b] mb-2">
                      Report {index + 1}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Hours Worked:</span> {report.hours_worked}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Hours to be Invoiced:</span>{" "}
                      {event.hours_charged - report.hours_worked < 0 ? (
                        <span className="text-red-600 font-semibold">
                          {event.hours_charged - report.hours_worked} hours
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">No invoicing needed</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Guests Attended:</span> {report.guests_attended}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Attendance Rate:</span>{" "}
                      {event.guestNum > 0 ? `${((report.guests_attended / event.guestNum) * 100).toFixed(1)}%` : "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-[#ea176b] mb-2">Hiring Items:</p>
                    {report.hiring && report.hiring.length > 0 ? (
                      <ul className="list-disc pl-6 mb-2">
                        {report.hiring.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            {item.item}: Issued {item.qty_issued}, Counted {item.qty_counted}, Missing{" "}
                            <span className={item.missing > 0 ? "text-red-600 font-semibold" : "text-gray-700"}>
                              {item.missing}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-700 mb-2">No hiring items</p>
                    )}
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Report:</span> {report.report || 'No report text'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-700">No event reports available</p>
              )}
            </div>
          )}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-gray-800">Attached Documents</h4>
              <button
                className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                onClick={toggleEditPdfs}
              >
                {isEditingPdfs ? "Done" : "Edit PDFs"}
              </button>
            </div>
            {!isEditingPdfs ? (
              <>
                {renderPdfField("event_menu", "Event Menu")}
                {renderPdfField("costing", "Costing")}
                {renderPdfField("menu_pdf", "Bar 1")}
                {renderPdfField("hiring_pdf1", "Bar 2")}
                {renderPdfField("hiring_pdf2", "Decor 1")}
                {renderPdfField("hiring_pdf3", "Decor 2")}
                {renderPdfField("hiring_pdf4", "Decor 3")}
                {renderPdfField("hiring_pdf5", "Pack-Up List")}
                {renderPdfField("hiring_pdf6", "Dietaries 1")}
                {renderPdfField("hiring_pdf7", "Dietaries 2")}
                {renderPdfField("hiring_pdf8", "Dietaries 3")}
                {renderPdfField("hiring_pdf9", "Extra")}
              </>
            ) : (
              <>
                {renderEditPdfField("event_menu", "Event Menu")}
                {renderEditPdfField("costing", "Costing")}
                {renderEditPdfField("menu_pdf", "Bar 1")}
                {renderEditPdfField("hiring_pdf1", "Bar 2")}
                {renderEditPdfField("hiring_pdf2", "Decor 1")}
                {renderEditPdfField("hiring_pdf3", "Decor 2")}
                {renderEditPdfField("hiring_pdf4", "Decor 3")}
                {renderEditPdfField("hiring_pdf5", "Pack-Up List")}
                {renderEditPdfField("hiring_pdf6", "Dietaries 1")}
                {renderEditPdfField("hiring_pdf7", "Dietaries 2")}
                {renderEditPdfField("hiring_pdf8", "Dietaries 3")}
                {renderEditPdfField("hiring_pdf9", "Extra")}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default EventCard;
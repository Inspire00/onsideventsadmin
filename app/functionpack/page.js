"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { db, storage } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function FunctionPack() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    compName: '',
    guestNum: '', // Allow empty string initially
    location: '',
    waiters_num: '', // Allow empty string initially
    barmen_num: '', // Allow empty string initially
    hours_charged: '', // Allow empty string initially
    client: '',
    guest_arrival: '',
    set_up: '',
    chefs: '', // Allow empty string initially
    notes: '',
    function_mgr: '',
    sales_associate: '',
    date: new Date(),
    menu_pdf: '',
    hiring_pdf1: '',
    hiring_pdf2: '',
    hiring_pdf3: '',
    hiring_pdf4: '',
    hiring_pdf5: '',
    hiring_pdf6: '',
    hiring_pdf7: '',
    hiring_pdf8: '',
    hiring_pdf9: '',
    event_report: [], // Initialize as empty array
  });

  const [errors, setErrors] = useState({});
  const [pdfFiles, setPdfFiles] = useState({
    menu_pdf: null,
    hiring_pdf1: null,
    hiring_pdf2: null,
    hiring_pdf3: null,
    hiring_pdf4: null,
    hiring_pdf5: null,
    hiring_pdf6: null,
    hiring_pdf7: null,
    hiring_pdf8: null,
    hiring_pdf9: null
  });

  const functionManagers = ['Richard', 'Lyton', 'Other'];
  const salesAssociates = ['Adele','Collette','Greg','Joey','Nadia','Thuli'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleNumberBlur = (e) => {
    const { name, value } = e.target;
    const numberFields = ['guestNum', 'waiters_num', 'barmen_num', 'hours_charged', 'chefs'];
    
    if (numberFields.includes(name)) {
      const newValue = value === '' ? 0 : Math.max(0, Number(value));
      setFormData({
        ...formData,
        [name]: newValue
      });
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date
    });
  };

  const handlePdfChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setPdfFiles({
        ...pdfFiles,
        [name]: files[0]
      });
      
      const fakeUrl = URL.createObjectURL(files[0]);
      setFormData({
        ...formData,
        [name]: fakeUrl
      });
    }
  };

  const uploadPdfToFirebase = async (file, path) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const validateForm = (data = formData) => {
    const newErrors = {};
    
    const requiredFields = [
      'compName',
      'guestNum',
      'location',
      'waiters_num',
      'barmen_num',
      'client',
      'guest_arrival',
      'set_up',
      'chefs',
      'function_mgr',
      'sales_associate',
      'date'
    ];

    requiredFields.forEach(key => {
      // Allow 0 for number fields
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        newErrors[key] = 'This field is required';
      }
    });

    const numberFields = ['guestNum', 'waiters_num', 'barmen_num', 'hours_charged', 'chefs'];
    numberFields.forEach(key => {
      const value = Number(data[key]);
      if (isNaN(value)) {
        newErrors[key] = 'Must be a valid number';
      } else if (value < 0) {
        newErrors[key] = 'Must be a non-negative number';
      }
    });

    if (data.notes) {
      const wordCount = data.notes.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 200) {
        newErrors.notes = 'Notes cannot exceed 200 words';
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Current form data:', formData);
    
    // Convert empty number fields to 0 before validation
    const numberFields = ['guestNum', 'waiters_num', 'barmen_num', 'hours_charged', 'chefs'];
    const updatedFormData = { ...formData };
    numberFields.forEach(field => {
      if (updatedFormData[field] === '') {
        updatedFormData[field] = 0; // Set empty fields to 0
      } else {
        updatedFormData[field] = Number(updatedFormData[field]); // Convert to number
      }
    });
    
    // Update formData state with the converted values
    setFormData(updatedFormData);
    
    // Validate the updated form data
    const isValid = validateForm(updatedFormData); // Pass updatedFormData to validateForm
    console.log('Form is valid:', isValid);
    
    if (!isValid) {
      console.log('Validation failed, errors:', errors);
      return;
    }
    
    setLoading(true);
    console.log('Loading state set to true');
    
    try {
      console.log('Starting PDF uploads');
      const uploadTasks = [];
      const fileUrls = {};
      
      if (pdfFiles.menu_pdf) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.menu_pdf, 'menu_pdfs').then(url => {
            fileUrls.menu_pdf = url;
            console.log('Menu PDF uploaded:', url);
          })
        );
      }
      
      if (pdfFiles.hiring_pdf1) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf1, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf1 = url;
            console.log('Hiring PDF 1 uploaded:', url);
          })
        );
      }
      
      if (pdfFiles.hiring_pdf2) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf2, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf2 = url;
            console.log('Hiring PDF 2 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf3) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf3, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf3 = url;
            console.log('Hiring PDF 3 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf4) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf4, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf4 = url;
            console.log('Hiring PDF 4 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf5) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf5, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf5 = url;
            console.log('Hiring PDF 5 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf6) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf6, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf6 = url;
            console.log('Hiring PDF 6 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf7) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf7, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf7 = url;
            console.log('Hiring PDF 7 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf8) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf8, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf8 = url;
            console.log('Hiring PDF 8 uploaded:', url);
          })
        );
      }

      if (pdfFiles.hiring_pdf9) {
        uploadTasks.push(
          uploadPdfToFirebase(pdfFiles.hiring_pdf9, 'hiring_pdfs').then(url => {
            fileUrls.hiring_pdf9 = url;
            console.log('Hiring PDF 9 uploaded:', url);
          })
        );
      }

      await Promise.all(uploadTasks);
      console.log('All PDF uploads completed');
      
      // Format date as YYYY/MM/DD
      const dateObj = updatedFormData.date;
      const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
      updatedFormData.event_report = formData.event_report || [];


      const submissionData = {
        ...updatedFormData,
        date: formattedDate,
        timestamp: new Date().toISOString(),
        menu_pdf: fileUrls.menu_pdf || updatedFormData.menu_pdf,
        hiring_pdf1: fileUrls.hiring_pdf1 || updatedFormData.hiring_pdf1,
        hiring_pdf2: fileUrls.hiring_pdf2 || updatedFormData.hiring_pdf2,
        hiring_pdf3: fileUrls.hiring_pdf3 || updatedFormData.hiring_pdf3,
        hiring_pdf4: fileUrls.hiring_pdf4 || updatedFormData.hiring_pdf4,
        hiring_pdf5: fileUrls.hiring_pdf5 || updatedFormData.hiring_pdf5,
        hiring_pdf6: fileUrls.hiring_pdf6 || updatedFormData.hiring_pdf6,
        hiring_pdf7: fileUrls.hiring_pdf7 || updatedFormData.hiring_pdf7,
        hiring_pdf8: fileUrls.hiring_pdf8 || updatedFormData.hiring_pdf8,
        hiring_pdf9: fileUrls.hiring_pdf9 || updatedFormData.hiring_pdf9,
        event_report: updatedFormData.event_report,
      };
      
      console.log('Submitting to Firestore:', submissionData);
      const docRef = await addDoc(collection(db, "function_pack"), submissionData);
      console.log('Document successfully written with ID:', docRef.id);
      
      setLoading(false);
      alert('Event information pack created successfully!');
      router.push('/events');
      
      
      
    } catch (error) {
      console.error('Error in form submission:', error);
      setLoading(false);
      alert('Error creating event information pack. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 py-8">
       {/* Right Logo */}
       <div className="absolute right-32 top-80 -translate-y-1.5">
              <img
                src="/Icon_GreenWeb.png" // Replace with your right logo path
                alt="Right Logo"
                className="h-20 w-auto" // Adjust size as needed
              />
            </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] sm:px-6">
            <h1 className="text-2xl font-bold text-white">Function Pack Envelope</h1>
            <p className="mt-1 text-sm text-white">Create a new event function pack </p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-[#ea176b]">Creating your event pack...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-medium font-medium text-[#ea176b]">
                    Event Date
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    className={`mt-1 block w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>

                <div>
                  <label htmlFor="compName" className="block text-medium font-medium text-[#ea176b]">
                    Company
                  </label>
                  <input
                    type="text"
                    name="compName"
                    id="compName"
                    value={formData.compName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.compName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.compName && <p className="mt-1 text-sm text-red-500">{errors.compName}</p>}
                </div>

                <div>
                  <label htmlFor="client" className="block text-medium font-medium text-[#ea176b]">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="client"
                    id="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.client ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.client && <p className="mt-1 text-sm text-red-500">{errors.client}</p>}
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-medium font-medium text-[#ea176b]">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                </div>

                <div>
                  <label htmlFor="guest_arrival" className="block text-medium font-medium text-[#ea176b]">
                    Guest Arrival Time
                  </label>
                  <input
                    type="time"
                    name="guest_arrival"
                    id="guest_arrival"
                    value={formData.guest_arrival}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.guest_arrival ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.guest_arrival && <p className="mt-1 text-sm text-red-500">{errors.guest_arrival}</p>}
                </div>
                
                <div>
                  <label htmlFor="set_up" className="block text-medium font-medium text-[#ea176b]">
                    Set Up Time
                  </label>
                  <input
                    type="time"
                    name="set_up"
                    id="set_up"
                    value={formData.set_up}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.set_up ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.set_up && <p className="mt-1 text-sm text-red-500">{errors.set_up}</p>}
                </div>

                <div>
                  <label htmlFor="guestNum" className="block text-medium font-medium text-[#ea176b]">
                    Guest Number
                  </label>
                  <input
                    type="number"
                    name="guestNum"
                    id="guestNum"
                    value={formData.guestNum}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    min="0"
                    className={`mt-1 block w-full border ${errors.guestNum ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.guestNum && <p className="mt-1 text-sm text-red-500">{errors.guestNum}</p>}
                </div>
                
                <div>
                  <label htmlFor="waiters_num" className="block text-medium font-medium text-[#ea176b]">
                    Waiters Number
                  </label>
                  <input
                    type="number"
                    name="waiters_num"
                    id="waiters_num"
                    value={formData.waiters_num}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    min="0"
                    className={`mt-1 block w-full border ${errors.waiters_num ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.waiters_num && <p className="mt-1 text-sm text-red-500">{errors.waiters_num}</p>}
                </div>
                
                <div>
                  <label htmlFor="barmen_num" className="block text-medium font-medium text-[#ea176b]">
                    Barmen Number
                  </label>
                  <input
                    type="number"
                    name="barmen_num"
                    id="barmen_num"
                    value={formData.barmen_num}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    min="0"
                    className={`mt-1 block w-full border ${errors.barmen_num ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.barmen_num && <p className="mt-1 text-sm text-red-500">{errors.barmen_num}</p>}
                </div>

                <div>
                  <label htmlFor="chefs" className="block text-medium font-medium text-[#ea176b]">
                    Chefs Number
                  </label>
                  <input
                    type="number"
                    name="chefs"
                    id="chefs"
                    value={formData.chefs}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    min="0"
                    className={`mt-1 block w-full border ${errors.chefs ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.chefs && <p className="mt-1 text-sm text-red-500">{errors.chefs}</p>}
                </div>
                
                <div>
                  <label htmlFor="hours_charged" className="block text-medium font-medium text-[#ea176b]">
                    Hours Charged
                  </label>
                  <input
                    type="number"
                    name="hours_charged"
                    id="hours_charged"
                    value={formData.hours_charged}
                    onChange={handleInputChange}
                    onBlur={handleNumberBlur}
                    min="0"
                    className={`mt-1 block w-full border ${errors.hours_charged ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.hours_charged && <p className="mt-1 text-sm text-red-500">{errors.hours_charged}</p>}
                </div>
                
               
              </div>
              
              <div className="mt-6">
                <label className="block text-medium font-medium text-[#ea176b]">
                  Function Manager
                </label>
                <div className="mt-2 space-y-2">
                  {functionManagers.map((manager) => (
                    <div key={manager} className="flex items-center">
                      <input
                        id={`manager-${manager}`}
                        name="function_mgr"
                        type="radio"
                        value={manager}
                        checked={formData.function_mgr === manager}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-[#ea176b] focus:ring-[#ea176b] border-gray-300"
                      />
                      <label htmlFor={`manager-${manager}`} className="ml-3 block text-sm text-gray-700">
                        {manager}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.function_mgr && <p className="mt-1 text-sm text-red-500">{errors.function_mgr}</p>}
              </div>
              
              <div className="mt-6">
                <label className="block text-medium font-medium text-[#ea176b]">
                  Sales Associate
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {salesAssociates.map((associate) => (
                    <div key={associate} className="flex items-center">
                      <input
                        id={`associate-${associate}`}
                        name="sales_associate"
                        type="radio"
                        value={associate}
                        checked={formData.sales_associate === associate}
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-[#ea176b] focus:ring-[#ea176b] border-gray-300"
                      />
                      <label htmlFor={`associate-${associate}`} className="ml-3 block text-sm text-gray-700">
                        {associate}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.sales_associate && <p className="mt-1 text-sm text-red-500">{errors.sales_associate}</p>}
              </div>

              <div className="mt-6">
                <label htmlFor="notes" className="block text-medium font-medium text-[#ea176b]">
                  Notes (Max 200 words)
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${errors.notes ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                ></textarea>
                {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Word count: {formData.notes ? formData.notes.split(/\s+/).filter(Boolean).length : 0}/200
                </p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="menu_pdf" className="block text-medium font-medium text-[#ea176b]">
                    Bar 1
                  </label>
                  <input
                    type="file"
                    name="menu_pdf"
                    id="menu_pdf"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#ea176b] file:text-white
                      hover:file:bg-pink-700"
                  />
                  {pdfFiles.menu_pdf && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.menu_pdf.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="hiring_pdf1" className="block text-medium font-medium text-[#ea176b] ">
                    Bar 2
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf1"
                    id="hiring_pdf1"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf1 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf1.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="hiring_pdf2" className="block text-medium font-medium text-[#ea176b] ">
                    Decor 1
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf2"
                    id="hiring_pdf2"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf2 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf2.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf3" className="block text-medium font-medium text-[#ea176b] ">
                    Decor 2
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf3"
                    id="hiring_pdf3"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf3 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf3.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf4" className="block text-medium font-medium text-[#ea176b] ">
                    Decor 3
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf4"
                    id="hiring_pdf4"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf4 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf4.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf5" className="block text-medium font-medium text-[#ea176b] ">
                    Pack-Up List
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf5"
                    id="hiring_pdf5"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf5 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf5.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf6" className="block text-medium font-medium text-[#ea176b] ">
                    Dietaries 1
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf6"
                    id="hiring_pdf6"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf6 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf6.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf7" className="block text-medium font-medium text-[#ea176b] ">
                    Dietaries 2
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf7"
                    id="hiring_pdf7"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf7 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf7.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf8" className="block text-medium font-medium text-[#ea176b] ">
                    Dietaries 3
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf8 "
                    id="hiring_pdf8"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf8 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf8.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="hiring_pdf9" className="block text-medium font-medium text-[#ea176b] ">
                    Extra
                  </label>
                  <input
                    type="file"
                    name="hiring_pdf9"
                    id="hiring_pdf9"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0cbb9b] file:text-white
                      hover:file:bg-teal-700"
                  />
                  {pdfFiles.hiring_pdf9 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {pdfFiles.hiring_pdf9.name}
                    </p>
                  )}
                </div>

              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#c01059] hover:to-[#0a9a81]'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea176b]`}
                >
                  {loading ? 'Creating...' : 'Create Event Pack'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

       {/* Left Logo */}
       <div className="absolute left-32 top-80 -translate-y-1.5">
              <img
                src="/Icon_TealWeb.png" // Replace with your left logo path
                alt="Left Logo"
                className="h-20 w-auto" // Adjust size as needed
              />
            </div>

    </div>
  );
}
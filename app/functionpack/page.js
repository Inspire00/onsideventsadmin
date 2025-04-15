// app/page.js
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
    guestNum: '',
    location: '',
    waiters_num: '',
    barmen_num: '',
    client: '',
    guest_arrival: '',
    set_up: '',
    chefs: '',
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
    hiring_pdf6: ''
  });

  const [errors, setErrors] = useState({});
  const [pdfFiles, setPdfFiles] = useState({
    menu_pdf: null,
    hiring_pdf1: null,
    hiring_pdf2: null,
    hiring_pdf3: null,
    hiring_pdf4: null,
    hiring_pdf5: null,
    hiring_pdf6: null
  });

  const functionManagers = ['Richard', 'Small', 'Other'];
  const salesAssociates = ['Adele','Collette','Greg','Joey','Nadia','Nissa', 'Thuli'];

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

  const validateForm = () => {
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
      if (!formData[key] || formData[key] === '') {
        newErrors[key] = 'This field is required';
      }
    });

    const numberFields = ['guestNum', 'waiters_num', 'barmen_num', 'chefs'];
    numberFields.forEach(key => {
      if (formData[key] && (isNaN(formData[key]) || Number(formData[key]) < 0)) {
        newErrors[key] = 'Must be a positive number';
      }
    });

    if (formData.notes) {
      const wordCount = formData.notes.trim().split(/\s+/).filter(Boolean).length;
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
    
    const isValid = validateForm();
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
      
      await Promise.all(uploadTasks);
      console.log('All PDF uploads completed');
      
      // Format date as YYYY/MM/DD
      const dateObj = formData.date;
      const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
      
      const submissionData = {
        ...formData,
        date: formattedDate,
        timestamp: new Date().toISOString(),
        menu_pdf: fileUrls.menu_pdf || formData.menu_pdf,
        hiring_pdf1: fileUrls.hiring_pdf1 || formData.hiring_pdf1,
        hiring_pdf2: fileUrls.hiring_pdf2 || formData.hiring_pdf2,
        hiring_pdf3: fileUrls.hiring_pdf3 || formData.hiring_pdf3,
        hiring_pdf4: fileUrls.hiring_pdf4 || formData.hiring_pdf4,
        hiring_pdf5: fileUrls.hiring_pdf5 || formData.hiring_pdf5,
        hiring_pdf6: fileUrls.hiring_pdf6 || formData.hiring_pdf6
      };
      
      console.log('Submitting to Firestore:', submissionData);
      const docRef = await addDoc(collection(db, "function_pack"), submissionData);
      console.log('Document successfully written with ID:', docRef.id);
      
      setLoading(false);
      alert('Event information pack created successfully!');
      
      setFormData({
        compName: '',
        guestNum: '',
        location: '',
        waiters_num: '',
        barmen_num: '',
        client: '',
        guest_arrival: '',
        set_up: '',
        chefs: '',
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
        hiring_pdf6: ''
      });
      
      setPdfFiles({
        menu_pdf: null,
        hiring_pdf1: null,
        hiring_pdf2: null,
        hiring_pdf3: null,
        hiring_pdf4: null,
        hiring_pdf5: null,
        hiring_pdf6: null
      });
      
    } catch (error) {
      console.error('Error in form submission:', error);
      setLoading(false);
      alert('Error creating event information pack. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 py-8">
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
                    className={`mt-1 block w-full border ${errors.chefs ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.chefs && <p className="mt-1 text-sm text-red-500">{errors.chefs}</p>}
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
                    Menu PDF
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
                    Hiring PDF 1
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
                    Hiring PDF 2
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
                    Hiring PDF 3
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
                    Hiring PDF 4
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
                    Hiring PDF 5
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
                    Hiring PDF 6
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
    </div>
  );
}
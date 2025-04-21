// app/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';


export default function PackUpFormal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    compName: '',
    date: new Date(),
    location: '',
    items: []
  });
  const [newItem, setNewItem] = useState({ item: '', quantity: '' });
  const [errors, setErrors] = useState({});

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

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date
    });
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };

  const addItem = () => {
    if (!newItem.item || !newItem.quantity) {
      setErrors({
        ...errors,
        newItem: 'Both item name and quantity are required'
      });
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          item: newItem.item,
          quantity: newItem.quantity // Kept as string
        }
      ]
    });
    
    setNewItem({ item: '', quantity: '' });
    setErrors({});
  };

  const removeItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    const requiredFields = ['client', 'compName', 'date', 'location'];
    requiredFields.forEach(key => {
      if (!formData[key] || formData[key] === '') {
        newErrors[key] = 'This field is required';
      }
    });

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (!isValid) return;
    
    setLoading(true);
    
    try {
      const dateObj = formData.date;
      const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
      
      const submissionData = {
        client: formData.client,
        compName: formData.compName,
        date: formattedDate,
        location: formData.location,
        item: formData.items.map(item => ({
          id: item.id,
          item: item.item,
          quantity: item.quantity // Stored as string
        })),
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "packuplist"), submissionData);
      
      setLoading(false);
      alert('Packing list created successfully!');
      router.push('/packupviews');
      
      setFormData({
        client: '',
        compName: '',
        date: new Date(),
        location: '',
        items: []
      });
      setNewItem({ item: '', quantity: '' });
      
    } catch (error) {
      console.error('Error in form submission:', error);
      setLoading(false);
      alert('Error creating packing list. Please try again.');
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
            <h1 className="text-2xl font-bold text-white">Function PackUp List</h1>
            <p className="mt-1 text-sm text-white">Create a new packing list</p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-16 h-16 border-4 border-[#ea176b] border-t-[#e3ed18] rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-[#ea176b]">Creating your packing list...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-[#ea176b]">
                    Date
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    className={`mt-1 block w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>

                <div>
                  <label htmlFor="compName" className="block text-sm font-medium text-[#ea176b]">
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
                  <label htmlFor="client" className="block text-sm font-medium text-[#ea176b]">
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
                  <label htmlFor="location" className="block text-sm font-medium text-[#ea176b]">
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
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-[#ea176b] mb-2">
                  Add New Item
                </label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="item"
                    value={newItem.item}
                    onChange={handleNewItemChange}
                    placeholder="Item name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                  />
                  <input
                    type="text" // Changed from number to text
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    placeholder="Quantity (e.g., 2 bundles)"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-1 bg-[#ea176b] text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea176b]"
                  >
                    Add
                  </button>
                </div>
                {errors.newItem && <p className="mt-1 text-sm text-red-500">{errors.newItem}</p>}
              </div>

              {formData.items.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items List
                  </label>
                  {formData.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-3 gap-4 mb-4 items-center">
                      <input
                        type="text"
                        value={item.item}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                      />
                      <input
                        type="text" // Changed from number to text
                        value={item.quantity}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.items && <p className="mt-1 text-sm text-red-500">{errors.items}</p>}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#c01059] hover:to-[#0a9a81]'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea176b]`}
                >
                  {loading ? 'Creating...' : 'Create Packing List'}
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
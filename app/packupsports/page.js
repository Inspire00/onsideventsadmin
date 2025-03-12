// app/page.js
"use client";
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function PackUpSports() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(),
    location: '',
    client: '',
    suiteNumber: '',
    drySnacks: {
      whiteDrySnackBowl: '0',
      drySnacksTongs: '0',
      scoopsSweeties: '0',
      serviettes: '0',
      bambooBoatsSmall: '0',
      silverHeights: '0'
    },
    arrivalSnacks: {
      smallServingTongs: '0',
      woodenSpoons: '0',
      silverHeights: '0'
    },
    mainCourse: {
      rollerTops: '0',
      whiteLegsChafingDish: '0',
      silverLegsChafingDish: '0',
      chafingFuel: '0',
      servingSpoons: '0',
      servingTongs: '0',
      champagneCoolerMedium: '0',
      breadBasket: '0',
      breadKnife: '0',
      butterBowl: '0'
    },
    cutlery: {
      sidePlates: '0',
      mainPlates: '0',
      mainKnives: '0',
      mainForks: '0',
      spoons: '0',
      cutleryHolder: '0'
    },
    extras: {
      saltAndPepper: '0',
      toothpicks: '0',
      gloves: '0',
      lappies: '0',
      dishesSoap: '0',
      binBags: '0'
    },
    teaAndCoffeeStation: {
      milk: '0',
      teaBox: '0',
      coffeeStirrers: '0',
      disposableCoffeeCups: '0',
      coffeeCupLids: '0',
      coffeeStirrerHolder: '0',
      coffeeStationDirtiesBowl: '0',
      bigCoffeeMachine: '0',
      nespressoCoffeeMachine: '0',
      podsBoxes: '0'
    }
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleNestedInputChange = (category, field, value) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value
      }
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['date', 'location', 'client', 'suiteNumber'];
    
    requiredFields.forEach(key => {
      if (!formData[key] || formData[key] === '') {
        newErrors[key] = 'This field is required';
      }
    });

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
        date: formattedDate,
        location: formData.location,
        client: formData.client,
        suiteNumber: formData.suiteNumber,
        drySnacks: formData.drySnacks,
        arrivalSnacks: formData.arrivalSnacks,
        mainCourse: formData.mainCourse,
        cutlery: formData.cutlery,
        extras: formData.extras,
        teaAndCoffeeStation: formData.teaAndCoffeeStation,
        timestamp: new Date().toISOString()
      };
      
      await addDoc(collection(db, "packuplistsports"), submissionData);
      
      setLoading(false);
      alert('Sports packing list created successfully!');
      
      setFormData({
        date: new Date(),
        location: '',
        client: '',
        suiteNumber: '',
        drySnacks: {
          whiteDrySnackBowl: '0',
          drySnacksTongs: '0',
          scoopsSweeties: '0',
          serviettes: '0',
          bambooBoatsSmall: '0',
          silverHeights: '0'
        },
        arrivalSnacks: {
          smallServingTongs: '0',
          woodenSpoons: '0',
          silverHeights: '0'
        },
        mainCourse: {
          rollerTops: '0',
          whiteLegsChafingDish: '0',
          silverLegsChafingDish: '0',
          chafingFuel: '0',
          servingSpoons: '0',
          servingTongs: '0',
          champagneCoolerMedium: '0',
          breadBasket: '0',
          breadKnife: '0',
          butterBowl: '0'
        },
        cutlery: {
          sidePlates: '0',
          mainPlates: '0',
          mainKnives: '0',
          mainForks: '0',
          spoons: '0',
          cutleryHolder: '0'
        },
        extras: {
          saltAndPepper: '0',
          toothpicks: '0',
          gloves: '0',
          lappies: '0',
          dishesSoap: '0',
          binBags: '0'
        },
        teaAndCoffeeStation: {
          milk: '0',
          teaBox: '0',
          coffeeStirrers: '0',
          disposableCoffeeCups: '0',
          coffeeCupLids: '0',
          coffeeStirrerHolder: '0',
          coffeeStationDirtiesBowl: '0',
          bigCoffeeMachine: '0',
          nespressoCoffeeMachine: '0',
          podsBoxes: '0'
        }
      });
      
    } catch (error) {
      console.error('Error in form submission:', error);
      setLoading(false);
      alert('Error creating packing list. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-500 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] sm:px-6">
            <h1 className="text-2xl font-bold text-white">Sports Packing List</h1>
            <p className="mt-1 text-sm text-white">Create a new sports packing list</p>
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
                  <label htmlFor="date" className="block text-sm font-medium text-[#ea176b]">Date</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={handleDateChange}
                    className={`mt-1 block w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[#ea176b]">Location</label>
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
                  <label htmlFor="client" className="block text-sm font-medium text-[#ea176b]">Client</label>
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
                  <label htmlFor="suiteNumber" className="block text-sm font-medium text-[#ea176b]">Suite Number</label>
                  <input
                    type="text"
                    name="suiteNumber"
                    id="suiteNumber"
                    value={formData.suiteNumber}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.suiteNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]`}
                  />
                  {errors.suiteNumber && <p className="mt-1 text-sm text-red-500">{errors.suiteNumber}</p>}
                </div>
              </div>

              {/* Dry Snacks */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Dry Snacks</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.drySnacks).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('drySnacks', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrival Snacks */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Arrival Snacks</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.arrivalSnacks).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('arrivalSnacks', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Course */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Main Course</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.mainCourse).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('mainCourse', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Cutlery */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Cutlery</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.cutlery).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('cutlery', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Extras</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.extras).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('extras', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tea & Coffee Station */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[#ea176b]">Tea & Coffee Station</h2>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 mt-2">
                  {Object.entries(formData.teaAndCoffeeStation).map(([key, value]) => (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                      <input
                        type="text"
                        id={key}
                        value={value}
                        onChange={(e) => handleNestedInputChange('teaAndCoffeeStation', key, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ea176b] focus:border-[#ea176b]"
                      />
                    </div>
                  ))}
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
                  {loading ? 'Creating...' : 'Create Sports Packing List'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
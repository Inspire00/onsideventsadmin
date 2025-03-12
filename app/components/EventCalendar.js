"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function EventCalendar({ 
  events, 
  onSelectDate, 
  onChangeMonth,
  currentMonth: propCurrentMonth,
  currentYear: propCurrentYear,
  selectedDate
}) {
  // Use props or default to current month/year
  const [currentMonth, setCurrentMonth] = useState(propCurrentMonth !== undefined ? propCurrentMonth : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(propCurrentYear !== undefined ? propCurrentYear : new Date().getFullYear());

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Update internal state and notify parent when month changes
  const changeMonth = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (onChangeMonth) {
      onChangeMonth(newMonth, newYear);
    }
  };

  // Helper function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Get number of days in current month
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
  
  // Create array of day numbers
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create blank spaces for days before first day of month
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  
  // Combine blanks and days
  const calendar = [...blanks, ...days];
  
  // Check if a date has events
  const hasEvents = (day) => {
    return events.some(event => {
      const eventDate = event.date instanceof Date 
        ? event.date 
        : new Date(event.date);
        
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };
  
  // Get count of events for a date
  const getEventCount = (day) => {
    return events.filter(event => {
      const eventDate = event.date instanceof Date 
        ? event.date 
        : new Date(event.date);
        
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    }).length;
  };
  
  // Handle day click
  const handleDayClick = (day) => {
    if (day === null) return; // Don't do anything for blank spaces
    
    const date = new Date(currentYear, currentMonth, day);
    onSelectDate(date);
  };
  
  // Check if a date is selected
  const isSelected = (day) => {
    if (!selectedDate || day === null) return false;
    
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] text-white flex justify-between items-center">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button 
          onClick={() => changeMonth(1)}
          className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((day, index) => (
            <motion.div
              key={index}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-md
                ${day === null ? 'bg-transparent' : 'cursor-pointer'}
                ${isSelected(day) ? 'bg-[#ea176b] text-white' : day === null ? '' : 'hover:bg-gray-100'}
                ${hasEvents(day) && !isSelected(day) ? 'border-2 border-[#0cbb9b]' : ''}
              `}
              onClick={() => handleDayClick(day)}
              whileHover={{ scale: day === null ? 1 : 1.05 }}
              whileTap={{ scale: day === null ? 1 : 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {day !== null && (
                <>
                  <div className="text-sm font-medium">{day}</div>
                  {hasEvents(day) && (
                    <div className={`text-xs mt-1 ${isSelected(day) ? 'text-white' : 'text-[#0cbb9b] font-semibold'}`}>
                      {getEventCount(day)} event{getEventCount(day) !== 1 ? 's' : ''}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
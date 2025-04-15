"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import EventCalendar from '../components/EventCalendar';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import dynamic from 'next/dynamic';


const EventCard = dynamic(() => import('../components/EventCard'), {
  ssr: false,
});

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate && events.length > 0) {
      const filtered = events.filter(event => {
        const eventDate = new Date(event.date); // Parse the string date for comparison
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsCollection = collection(db, "function_pack");
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date // Keep as string in "YYYY/MM/DD" format
      }));
      setEvents(eventsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (month, year) => {
    setCurrentMonth(month);
    setCurrentYear(year);
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
                onClick={fetchEvents}
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
            <h1 className="text-2xl font-bold text-white">Event Calendar</h1>
            <p className="mt-1 text-sm text-white">View and manage function packs</p>
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              <div className="lg:col-span-1">
                <EventCalendar 
                  events={events} 
                  onSelectDate={handleDateSelect} 
                  onChangeMonth={handleMonthChange}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  selectedDate={selectedDate}
                />
              </div>
              
              <div className="lg:col-span-2">
                {selectedDate ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Events for {selectedDate.toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                    
                    {filteredEvents.length > 0 ? (
                      <div className="space-y-4">
                        {filteredEvents.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500">No events scheduled for this date.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center h-full flex items-center justify-center">
                    <p className="text-gray-500">Select a date from the calendar to view events.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
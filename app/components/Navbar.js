"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { FaTachometerAlt, FaFolderPlus, FaBoxOpen, FaFutbol, FaCalendarAlt } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi'; // Added for the hamburger menu
import { auth } from '../config/firebase';

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/functionpack', name: 'Function Pack', icon: <FaFolderPlus /> },
    { path: '/packupformal', name: 'Corporate PackUp', icon: <FaBoxOpen /> },
    { path: '/packupsports', name: 'Sports PackUp', icon: <FaFutbol /> },
    { path: '/events', name: 'Events Calendar', icon: <FaCalendarAlt /> },
  ];

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false); // Close menu on navigation
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white text-3xl focus:outline-none"
            >
              {isOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>

          {/* DESKTOP NAV ITEMS - Hidden on mobile */}
          <div className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-all duration-200"
              >
                <span className="mr-2 text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>

          {/* LOGO / LOGOUT */}
          <div className="flex items-center">
            <img
              src="/Icon_GreenWeb.png"
              alt="Logo"
              className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden bg-[#ea176b] border-t border-white/10 animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center w-full px-4 py-3 text-white hover:bg-[#0cbb9b] rounded-md transition-colors"
              >
                <span className="mr-4 text-2xl">{item.icon}</span>
                <span className="text-base font-semibold">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
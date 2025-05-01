"use client";
import { useRouter } from 'next/navigation';
import { signOut, getAuth } from 'firebase/auth';
import { FaTachometerAlt, FaFolderPlus, FaBoxOpen, FaFutbol, FaCalendarAlt } from 'react-icons/fa';
import { auth } from '../config/firebase'; // Adjust path to your Firebase config

const Navbar = () => {
  const router = useRouter();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/functionpack', name: 'Function Pack', icon: <FaFolderPlus /> },
    { path: '/packupformal', name: 'Corporate PackUp', icon: <FaBoxOpen /> },
    { path: '/packupsports', name: 'Sports PackUp', icon: <FaFutbol /> },
    { path: '/events', name: 'Events Calendar', icon: <FaCalendarAlt /> },
  ];

  const handleNavigation = (path) => {
    router.push(path);
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
    <nav className="bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center px-3 py-2 text-white hover:text-gray-200 transition-colors duration-200"
              >
                <span className="mr-2 text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <img
              src="/Icon_GreenWeb.png"
              alt="Onside Catering in Johannesburg"
              className="h-10 w-auto cursor-pointer"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// components/Navbar.jsx
"use client";
import { useRouter } from 'next/navigation';
import { FaTachometerAlt, FaFolderPlus, FaBoxOpen, FaFutbol, FaCalendarAlt } from 'react-icons/fa'; // Added FaTachometerAlt for Dashboard

const Navbar = () => {
  const router = useRouter();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaTachometerAlt /> }, // Added Dashboard
    { path: '/functionpack', name: 'Function Pack', icon: <FaFolderPlus /> },
    { path: '/packupformal', name: 'Corporate PackUp', icon: <FaBoxOpen /> },
    { path: '/packupsports', name: 'Sports PackUp', icon: <FaFutbol /> },
    { path: '/events', name: 'Events Calendar', icon: <FaCalendarAlt /> },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <nav className="bg-gradient-to-r from-[#ea176b] to-[#0cbb9b] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
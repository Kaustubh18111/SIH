import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiBarChart2, FiCheckSquare, FiBookOpen, FiUsers, FiSettings, FiLogOut, FiMic } from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const navigationLinks = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/assess', icon: FiBarChart2, label: 'Assess' },
    { path: '/track', icon: FiCheckSquare, label: 'Track' },
    { path: '/resources', icon: FiBookOpen, label: 'Resources' },
    { path: '/community', icon: FiUsers, label: 'Community' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-800 text-white flex flex-col">
      {/* Logo/App Name */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Mental Health</h1>
        <p className="text-gray-400 text-sm">Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {/* Unmute AI Link */}
          <li>
            <NavLink
              to="/unmute-ai"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <FiMic className="w-5 h-5 mr-3" />
              Unmute AI
            </NavLink>
          </li>
          
          {navigationLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium">AN</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Ananya</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <FiLogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
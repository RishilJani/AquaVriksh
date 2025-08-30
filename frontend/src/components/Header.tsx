"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showSidebarButton?: boolean;
  onSidebarOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Blue Carbon Ecosystem Platform",
  subtitle = "Empowering communities for sustainable coastal conservation",
  onMenuClick,
  showSidebarButton = false,
  onSidebarOpen
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-teal-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center">
          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-lg hover:bg-teal-50 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Outside Arrow Button to Open Sidebar */}
          {showSidebarButton && (
            <button
              onClick={onSidebarOpen}
              className="mr-2 sm:mr-4 p-1 sm:p-2 rounded-lg hover:bg-teal-50 transition-colors group"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            /* User is logged in - show user menu */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* User is not logged in - show login/signup buttons */
            <>
              <button 
                onClick={handleLogin}
                className="bg-teal-600 hover:bg-teal-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
              >
                Login
              </button>
              <button 
                onClick={handleSignup}
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;

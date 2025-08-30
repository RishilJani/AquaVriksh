import React from 'react';

interface SidebarProps {
  activeSection?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection = 'dashboard', 
  isOpen = true,
  onClose,
  onToggle
}) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { id: 'verifications', label: 'My Verifications', icon: 'verifications' },
    { id: 'badges', label: 'Badges', icon: 'badges' },
    { id: 'profile', label: 'My Profile', icon: 'profile' },
  ];

  const userRoles = [
    { id: 'contributors', label: 'Top Contributors', color: 'green' },
    { id: 'verifiers', label: 'AI Verifiers', color: 'blue' },
    { id: 'admin', label: 'Admin Panel', color: 'purple' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case 'leaderboard':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'verifications':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'badges':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getRoleColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-700';
      case 'blue':
        return 'bg-blue-50 text-blue-700';
      case 'purple':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getRoleDotColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle sidebar tap to toggle
  const handleSidebarTap = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 min-h-screen z-50 bg-white/95 backdrop-blur-md border-r border-teal-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
        `}
        onClick={handleSidebarTap}
      >
        <div className="p-3 sm:p-4">
          {/* Logo and Close Button */}
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-teal-600">AquaVriksh</h1>
              </div>
            
            {/* Close Button for Mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering sidebar toggle
                if (onClose) onClose();
              }}
              className="lg:hidden p-1 rounded-lg hover:bg-teal-50 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Inside Arrow Button to Close Sidebar */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering sidebar toggle
                if (onClose) onClose();
              }}
              className="p-1 sm:p-2 rounded-lg hover:bg-teal-50 transition-colors group"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 transform rotate-180 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.id === 'dashboard' ? '/' : `/${item.id}`}
                className={`flex items-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                  activeSection === item.id
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering sidebar toggle
                  if (onClose) onClose();
                }}
              >
                <span className="mr-2 sm:mr-3">{getIcon(item.icon)}</span>
                {item.label}
              </a>
            ))}
          </nav>

          {/* User Role Section */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              User Roles
            </h3>
            <div className="space-y-1">
              {userRoles.map((role) => (
                <div key={role.id} className={`flex items-center px-2 py-1 rounded-lg ${getRoleColor(role.color)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${getRoleDotColor(role.color)}`}></div>
                  <span className="text-xs">{role.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

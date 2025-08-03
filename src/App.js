import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ExplorePage from './components/ExplorePage';
import ProfilePage from './components/ProfilePage';
import ArtistProfilePage from './components/ArtistProfilePage';
import MessagesPage from './components/MessagesPage';
import LoadingOverlay from './components/LoadingOverlay';
import Notification from './components/Notification';
import AddTalentModal from './components/AddTalentModal';
import UploadWorkModal from './components/UploadWorkModal';
import EditProfileModal from './components/EditProfileModal';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParams, setCurrentParams] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddTalentModal, setShowAddTalentModal] = useState(false);
  const [showUploadWorkModal, setShowUploadWorkModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('kalakriti_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('kalakriti_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleNavigate = (page, params = null) => {
    if (page === 'add-talent') {
      setShowAddTalentModal(true);
    } else if (page === 'upload-work') {
      setShowUploadWorkModal(true);
    } else if (page === 'edit-profile') {
      setShowEditProfileModal(true);
    } else {
      setCurrentPage(page);
      setCurrentParams(params);
    }
    
    if (params) {
      // Handle page-specific parameters
      console.log('Navigation params:', params);
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    showNotification(`Switched to ${!isDarkMode ? 'dark' : 'light'} theme! 🎨`, 'success');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleModalSuccess = () => {
    showNotification('Action completed successfully! 🎉', 'success');
    // Refresh the current page to show updated data
    if (currentPage === 'profile') {
      // Force a re-render of the profile page
      setCurrentPage('home');
      setTimeout(() => setCurrentPage('profile'), 100);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'explore':
        return <ExplorePage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'artist-profile':
        return <ArtistProfilePage artistId={currentParams} onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginModal onClose={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterModal onClose={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
        <LoadingOverlay isLoading={isLoading} />
        
        <Navigation 
          onNavigate={handleNavigate} 
          onToggleTheme={handleToggleTheme} 
          isDarkMode={isDarkMode} 
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderCurrentPage()}
        </div>

        {/* Modals */}
        {showAddTalentModal && (
          <AddTalentModal 
            onClose={() => setShowAddTalentModal(false)} 
            onSuccess={handleModalSuccess}
          />
        )}
        
        {showUploadWorkModal && (
          <UploadWorkModal 
            onClose={() => setShowUploadWorkModal(false)} 
            onSuccess={handleModalSuccess}
          />
        )}

        {showEditProfileModal && (
          <EditProfileModal 
            onClose={() => setShowEditProfileModal(false)} 
            onSuccess={handleModalSuccess}
          />
        )}

        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App; 
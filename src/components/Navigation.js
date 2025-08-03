import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Moon, Sun, Compass, MessageCircle, User, LogOut } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const Navigation = ({ onNavigate, onToggleTheme, isDarkMode }) => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for unread messages
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.id)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Count unread messages from other users
      const unreadCount = allMessages.filter(msg => 
        msg.senderId !== currentUser.id && // Only count messages from others
        !msg.readBy?.includes(currentUser.id) // Only count unread messages
      ).length;

      setTotalUnreadMessages(unreadCount);
    }, (error) => {
      console.error('Error listening to messages for notification count:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('home');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="gradient-bg shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer hover-scale" 
              onClick={() => onNavigate('home')}
            >
              🎨 KalaKriti <span className="text-sm font-normal opacity-75">v5.0</span>
            </h1>
          </div>
          
          {currentUser && (
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => onNavigate('explore')} 
                className="text-white hover:text-gray-200 px-3 py-2 rounded-md transition-colors flex items-center"
              >
                <Compass className="w-4 h-4 mr-2" />
                Explore
              </button>
              
              <button 
                onClick={() => onNavigate('messages')} 
                className="text-white hover:text-gray-200 px-3 py-2 rounded-md relative transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
                {totalUnreadMessages > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                  </div>
                )}
              </button>
              
              <button 
                onClick={() => onNavigate('profile')} 
                className="text-white hover:text-gray-200 px-3 py-2 rounded-md transition-colors flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {currentUser.photo ? (
                      <img 
                        src={currentUser.photo} 
                        alt={currentUser.name} 
                        className="profile-photo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="profile-photo bg-purple-100 flex items-center justify-center">
                        <User className="text-purple-600" />
                      </div>
                    )}
                    <div className="profile-photo bg-purple-100 flex items-center justify-center" style={{ display: 'none' }}>
                      <User className="text-purple-600" />
                    </div>
                  </div>
                  <span className="text-white font-medium">Welcome, {currentUser.name}!</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate('register')} 
                  className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            <button 
              onClick={onToggleTheme} 
              className="text-white hover:text-gray-200 px-3 py-2 rounded-md transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
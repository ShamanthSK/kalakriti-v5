import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Plus, Edit, Upload, Palette, BarChart3, ExternalLink, Trash2 } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import DeleteAccountModal from './DeleteAccountModal';

const ProfilePage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [userWorks, setUserWorks] = useState([]);
  const [collaborationFeed, setCollaborationFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all data in parallel for better performance
        const [worksSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'works')),
          getDocs(collection(db, 'users'))
        ]);

        const works = worksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get user's works
        const userWorks = works.filter(work => work.userId === currentUser.id);
        setUserWorks(userWorks);

        // Get collaboration opportunities
        const collaborationWorks = works
          .filter(work => work.collaboration === 'Yes' && work.userId !== currentUser.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // Add user data to collaboration works
        const collaborationFeedWithUsers = collaborationWorks.map(work => {
          const user = users.find(u => u.id === work.userId);
          return {
            ...work,
            userName: user?.name || 'Unknown Artist',
            userId: work.userId
          };
        });

        setCollaborationFeed(collaborationFeedWithUsers);

      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserWorks([]);
        setCollaborationFeed([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <p className="text-gray-500 mb-4">Please log in to view your profile</p>
        <button 
          onClick={() => onNavigate('login')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  const userStats = {
    uploads: userWorks.length,
    collaborations: userWorks.filter(w => w.collaboration === 'Yes').length,
    messages: 0, // You can implement this later by fetching messages
    daysActive: Math.floor((Date.now() - new Date(currentUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))
  };

  return (
    <div className="fade-in">
      {/* User Profile Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">👤 My Profile</h2>
          <div className="flex space-x-3">
            <button 
              onClick={() => onNavigate('add-talent')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Talent
            </button>
            <button 
              onClick={() => onNavigate('edit-profile')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-6">
              {currentUser.photo ? (
                <img 
                  src={currentUser.photo} 
                  alt={currentUser.name} 
                  className="profile-photo-large mr-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="profile-photo-large bg-purple-100 flex items-center justify-center mr-4">
                  <User className="text-2xl text-purple-600" />
                </div>
              )}
              <div className="profile-photo-large bg-purple-100 flex items-center justify-center mr-4" style={{ display: 'none' }}>
                <User className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">👋 {currentUser.name}</h3>
                <p className="text-gray-600">📧 {currentUser.email}</p>
                <p className="text-sm text-gray-500">🎨 {currentUser.primaryCategory} Artist</p>
                <p className="text-sm text-gray-500">📅 Joined {new Date(currentUser.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 mb-6 flex items-center justify-around shadow">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">{userWorks.length}</div>
                <div className="text-sm">Works</div>
              </div>
              <div className="w-px h-8 bg-white opacity-30 mx-6"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">{currentUser.talents?.length || 0}</div>
                <div className="text-sm">Skills</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                🎯 Your Talents
              </h4>
              {currentUser.talents && currentUser.talents.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentUser.talents.map((talent, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-800">{talent.skill}</span>
                        <span className="text-sm text-gray-600 ml-2">({talent.category})</span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">{talent.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No talents added yet. Click "Add Talent" to get started!</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                📊 Your Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 user-stats" id="userWorksCount">{userStats.uploads}</div>
                  <div className="text-sm text-blue-700">🎨 Works</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 user-stats" id="userCollaborationsCount">{userStats.collaborations}</div>
                  <div className="text-sm text-blue-700">🤝 Collaborations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 user-stats" id="userMessagesCount">{userStats.messages}</div>
                  <div className="text-sm text-blue-700">💬 Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.daysActive}</div>
                  <div className="text-sm text-blue-700">📅 Days Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Works Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎨 My Creative Works</h2>
          <button 
            onClick={() => onNavigate('upload-work')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Work
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userWorks.length > 0 ? (
            userWorks.map(work => (
              <div key={work.id} className="bg-gray-50 p-6 rounded-xl card-hover">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 text-lg cursor-pointer">
                    {work.title}
                  </h4>
                  <div className="flex space-x-2">
                    {work.url && (
                      <a 
                        href={work.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => onNavigate('edit-work', work.id)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {work.category}
                  </span>
                  {work.collaboration === 'Yes' ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      🤝 Open for Collaboration
                    </span>
                  ) : (
                    <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                      📋 Showcase
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{work.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>📅 {new Date(work.createdAt).toLocaleDateString()}</span>
                  <span>👁️ {work.views || 0} views</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500 mb-4">No works uploaded yet</p>
              <button 
                onClick={() => onNavigate('upload-work')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Upload Your First Work
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collaboration Feed */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🤝 Collaboration Opportunities</h2>
        <div className="space-y-6">
          {collaborationFeed.length > 0 ? (
            collaborationFeed.map(work => (
              <div key={work.id} className="border border-gray-200 rounded-xl p-6 card-hover bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="profile-photo bg-purple-100 flex items-center justify-center">
                      <User className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{work.title}</h3>
                      <p className="text-sm text-gray-600">by {work.userName}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    🤝 Seeking Collaboration
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {work.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      📅 {new Date(work.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{work.description}</p>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => onNavigate('artist-profile', work.userId)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    👤 View Profile
                  </button>
                  <button 
                    onClick={() => onNavigate('messages', work.userId)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    💬 Start Chat
                  </button>
                  {work.url && (
                    <a 
                      href={work.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      🔗 View Work
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤝</div>
              <p className="text-gray-500 mb-4">No collaboration opportunities available right now</p>
              <button 
                onClick={() => onNavigate('explore')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Explore Artists
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
};

export default ProfilePage; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, MessageCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const ArtistProfilePage = ({ artistId, onNavigate }) => {
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [artistWorks, setArtistWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistId) return;

      try {
        // Fetch artist data
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('__name__', '==', artistId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const artistData = {
            id: userSnapshot.docs[0].id,
            ...userSnapshot.docs[0].data()
          };
          setArtist(artistData);

          // Fetch artist's works
          const worksRef = collection(db, 'works');
          const worksQuery = query(worksRef, where('userId', '==', artistId));
          const worksSnapshot = await getDocs(worksQuery);
          const works = worksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setArtistWorks(works);
        }
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading artist profile...</span>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <p className="text-gray-500 mb-4">Artist not found</p>
        <button 
          onClick={() => onNavigate('explore')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => onNavigate('explore')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Explore
        </button>
      </div>

      {/* Artist Profile Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">👤 Artist Profile</h2>
          {currentUser && currentUser.id !== artist.id && (
            <div className="flex space-x-3">
              <button 
                onClick={() => onNavigate('messages', artist.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center mb-6">
              {artist.photo ? (
                <img 
                  src={artist.photo} 
                  alt={artist.name} 
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
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">👋 {artist.name}</h3>
                <p className="text-gray-600">📧 {artist.email}</p>
                <p className="text-sm text-gray-500">🎨 {artist.primaryCategory} Artist</p>
                <p className="text-sm text-gray-500">📅 Joined {new Date(artist.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 mb-6 flex items-center justify-around shadow">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">{artistWorks.length}</div>
                <div className="text-sm">Works</div>
              </div>
              <div className="w-px h-8 bg-white opacity-30 mx-6"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold">{artist.talents?.length || 0}</div>
                <div className="text-sm">Skills</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-800 mb-4">🎯 Talents & Skills</h4>
              {artist.talents && artist.talents.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {artist.talents.map((talent, index) => (
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
                <p className="text-gray-500">No talents listed yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Artist's Works Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🎨 {artist.name}'s Creative Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistWorks.length > 0 ? (
            artistWorks.map(work => (
              <div key={work.id} className="bg-gray-50 p-6 rounded-xl card-hover">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 text-lg">
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

                {work.collaboration === 'Yes' && currentUser && currentUser.id !== artist.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => onNavigate('messages', artist.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      🤝 Start Collaboration
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500 mb-4">No works uploaded yet</p>
              <p className="text-gray-400 text-sm">This artist hasn't shared any works yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfilePage; 
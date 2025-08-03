import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, User, MessageCircle } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const ExplorePage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [artists, setArtists] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        // Fetch users and works in parallel
        const [usersSnapshot, worksSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'works'))
        ]);

        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const works = worksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out current user
        const otherUsers = users.filter(user => user.id !== currentUser?.id);

        // Add work counts to users
        const artistsWithStats = otherUsers.map(user => {
          const userWorks = works.filter(work => work.userId === user.id);
          const collaborations = userWorks.filter(work => work.collaboration === 'Yes').length;
          
          return {
            ...user,
            works: userWorks.length,
            collaborations: collaborations
          };
        });

        setArtists(artistsWithStats);

      } catch (error) {
        console.error('Error fetching artists:', error);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, [currentUser]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Music', label: '🎵 Music' },
    { value: 'Visual Arts', label: '🎨 Visual Arts' },
    { value: 'Writing', label: '✍️ Writing' },
    { value: 'Photography', label: '📸 Photography' },
    { value: 'Dance', label: '💃 Dance' }
  ];

  const filteredArtists = artists.filter(artist => {
    if (currentFilter === 'all') return true;
    return artist.primaryCategory === currentFilter || 
           artist.talents?.some(talent => talent.category === currentFilter);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading artists...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🌍 Explore Artists & Projects</h2>
        
        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter by Category
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button 
                key={category.value}
                onClick={() => setCurrentFilter(category.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentFilter === category.value 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.length > 0 ? (
            filteredArtists.map(artist => (
              <div key={artist.id} className="bg-white border rounded-xl p-6 card-hover">
                <div className="flex items-center mb-4">
                  {artist.photo ? (
                    <img 
                      src={artist.photo} 
                      alt={artist.name} 
                      className="profile-photo mr-3"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="profile-photo bg-purple-100 flex items-center justify-center mr-3">
                      <User className="text-purple-600" />
                    </div>
                  )}
                  <div className="profile-photo bg-purple-100 flex items-center justify-center mr-3" style={{ display: 'none' }}>
                    <User className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{artist.name}</h3>
                      {artist.isOnline ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{artist.primaryCategory}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {artist.talents && artist.talents.length > 0 ? (
                      artist.talents.slice(0, 3).map((talent, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {talent.skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No talents listed yet</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {artist.works} works • {artist.collaborations} seeking collaboration
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onNavigate('artist-profile', artist.id)} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    👤 Profile
                  </button>
                  <button 
                    onClick={() => onNavigate('messages', artist.id)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 mb-2">No artists found in this category</p>
              <p className="text-gray-400 text-sm">Try selecting a different category or check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage; 
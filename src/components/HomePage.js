import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Palette, MessageCircle, Rocket, Star } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const HomePage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalWorks: 0,
    totalCollaborations: 0,
    totalMessages: 0
  });
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [liveActivity, setLiveActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel for better performance
        const [usersSnapshot, worksSnapshot, messagesSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'works')),
          getDocs(collection(db, 'messages'))
        ]);

        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const works = worksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        setStats({
          totalArtists: users.length,
          totalWorks: works.length,
          totalCollaborations: works.filter(w => w.collaboration === 'Yes').length,
          totalMessages: messages.length
        });

        // Get featured artists (users with most talents, excluding current user)
        const featuredArtists = users
          .filter(user => user.id !== currentUser?.id)
          .sort((a, b) => (b.talents?.length || 0) - (a.talents?.length || 0))
          .slice(0, 6);

        setFeaturedArtists(featuredArtists);

        // Create live activity feed
        const recentWorks = works
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        const recentUsers = users
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 2);

        const activity = [
          ...recentWorks.map(work => ({
            type: 'work_uploaded',
            message: `${work.userName} uploaded "${work.title}"`,
            timestamp: work.createdAt
          })),
          ...recentUsers.map(user => ({
            type: 'user_joined',
            message: `${user.name} joined the community`,
            timestamp: user.joinDate
          }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
         .slice(0, 5);

        setLiveActivity(activity);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default values on error
        setStats({
          totalArtists: 0,
          totalWorks: 0,
          totalCollaborations: 0,
          totalMessages: 0
        });
        setFeaturedArtists([]);
        setLiveActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const features = [
    {
      icon: <Users className="text-2xl text-purple-600" />,
      title: "Smart Matching",
      description: "AI-powered algorithm finds perfect collaborators based on your skills and interests",
      bgColor: "bg-purple-100"
    },
    {
      icon: <Palette className="text-2xl text-green-600" />,
      title: "Portfolio Showcase",
      description: "Beautiful galleries to display your work with advanced filtering and categorization",
      bgColor: "bg-green-100"
    },
    {
      icon: <MessageCircle className="text-2xl text-blue-600" />,
      title: "Real-time Chat",
      description: "Instant messaging with file sharing, voice notes, and project collaboration tools",
      bgColor: "bg-blue-100"
    },
    {
      icon: <Rocket className="text-2xl text-orange-600" />,
      title: "Project Management",
      description: "Built-in tools to manage collaborative projects from concept to completion",
      bgColor: "bg-orange-100"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading amazing content...</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero-bg rounded-2xl text-white p-12 mb-12 text-center fade-in">
        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
          Connect. Create. Collaborate.
        </h1>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join KalaKriti v5.0 - The most advanced platform for creative collaboration with enhanced features and seamless user experience
        </p>
        {!currentUser ? (
          <div>
            <button 
              onClick={() => onNavigate('register')} 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold mr-4 hover-scale transition-all"
            >
              🚀 Get Started Free
            </button>
            <button 
              onClick={() => onNavigate('login')} 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl font-semibold hover-scale transition-all"
            >
              🔑 Sign In
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xl mb-6">Welcome back to your enhanced creative community!</p>
            <button 
              onClick={() => onNavigate('explore')} 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold mr-4 hover-scale transition-all"
            >
              🌍 Explore Artists
            </button>
            <button 
              onClick={() => onNavigate('messages')} 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl font-semibold hover-scale transition-all"
            >
              💬 Check Messages
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-8 rounded-xl shadow-lg card-hover text-center fade-in">
            <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔥 Live Activity</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full pulse-animation"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
        <div className="space-y-4">
          {liveActivity.length > 0 ? (
            liveActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`bg-${activity.type === 'user_joined' ? 'green' : 'blue'}-100 w-10 h-10 rounded-full flex items-center justify-center`}>
                  {activity.type === 'user_joined' ? (
                    <Users className="text-green-600" />
                  ) : (
                    <Palette className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{activity.message}</p>
                  <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-gray-500 mb-2">No recent activity yet!</p>
              <p className="text-gray-400 text-sm">Join our community and be the first to create something amazing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Artists */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12 fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">⭐ Featured Artists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArtists.length > 0 ? (
            featuredArtists.map((artist) => (
              <div key={artist.id} className="bg-gray-50 p-6 rounded-xl card-hover">
                <div className="flex items-center mb-4">
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
                      <Users className="text-purple-600 text-2xl" />
                    </div>
                  )}
                  <div className="profile-photo-large bg-purple-100 flex items-center justify-center mr-4" style={{ display: 'none' }}>
                    <Users className="text-purple-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-800">{artist.name}</h3>
                      {artist.isOnline && <div className="status-online"></div>}
                    </div>
                    <p className="text-sm text-gray-600">{artist.primaryCategory} Artist</p>
                    <p className="text-xs text-gray-500">Joined {new Date(artist.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">🎯 Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {artist.talents && artist.talents.length > 0 ? (
                      artist.talents.slice(0, 3).map((talent, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {talent.skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No talents listed yet</span>
                    )}
                  </div>
                </div>
                {currentUser && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onNavigate('artist-profile', artist.id)} 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      👤 View Profile
                    </button>
                    <button 
                      onClick={() => onNavigate('messages', artist.id)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      💬
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500 mb-4">No artists to showcase yet!</p>
              <p className="text-gray-400 text-sm">Be the first to join our creative community and start collaborating.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-xl text-white p-8 text-center fade-in">
        <h2 className="text-3xl font-bold mb-8">🌟 Join Our Thriving Community</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="hover-scale">
            <div className="text-4xl font-bold mb-2">{stats.totalArtists.toLocaleString()}</div>
            <div className="text-purple-200">👥 Active Artists</div>
          </div>
          <div className="hover-scale">
            <div className="text-4xl font-bold mb-2">{stats.totalWorks.toLocaleString()}</div>
            <div className="text-purple-200">🎨 Creative Works</div>
          </div>
          <div className="hover-scale">
            <div className="text-4xl font-bold mb-2">{stats.totalCollaborations.toLocaleString()}</div>
            <div className="text-purple-200">🤝 Collaborations</div>
          </div>
          <div className="hover-scale">
            <div className="text-4xl font-bold mb-2">{stats.totalMessages.toLocaleString()}</div>
            <div className="text-purple-200">💬 Messages Sent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 
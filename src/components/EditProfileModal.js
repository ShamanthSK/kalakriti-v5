import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, User, Mail, Palette } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const EditProfileModal = ({ onClose, onSuccess }) => {
  const { currentUser, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    primaryCategory: 'Visual Arts',
    photo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        primaryCategory: currentUser.primaryCategory || 'Visual Arts',
        photo: currentUser.photo || ''
      });
    }
  }, [currentUser]);

  const categories = [
    { value: 'Music', label: '🎵 Music' },
    { value: 'Visual Arts', label: '🎨 Visual Arts' },
    { value: 'Writing', label: '✍️ Writing' },
    { value: 'Dance', label: '💃 Dance' },
    { value: 'Photography', label: '📸 Photography' },
    { value: 'Video Production', label: '🎬 Video Production' },
    { value: 'Voice Acting', label: '🎤 Voice Acting' },
    { value: 'Graphic Design', label: '🖌️ Graphic Design' },
    { value: 'Digital Art', label: '💻 Digital Art' },
    { value: 'Animation', label: '🎞️ Animation' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        name: formData.name,
        primaryCategory: formData.primaryCategory,
        photo: formData.photo || null
      });

      // Refresh user data
      await refreshUserData();
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-500 mb-4">Please log in to edit your profile</p>
            <button 
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">✏️ Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              👤 Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              📧 Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              🎨 Primary Category
            </label>
            <select
              name="primaryCategory"
              value={formData.primaryCategory}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo URL (Optional)
            </label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com/your-photo.jpg"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 
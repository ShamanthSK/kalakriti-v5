import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';

const AddTalentModal = ({ onClose, onSuccess }) => {
  const { currentUser, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    skill: '',
    category: 'Visual Arts',
    level: 'Intermediate'
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Visual Arts',
    'Music',
    'Writing',
    'Photography',
    'Dance',
    'Film',
    'Design',
    'Crafts',
    'Technology',
    'Other'
  ];

  const levels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const talentData = {
        skill: formData.skill,
        category: formData.category,
        level: formData.level
      };

      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        talents: arrayUnion(talentData)
      });

      // Refresh user data to show the new talent
      await refreshUserData();
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding talent:', error);
      alert('Error adding talent. Please try again.');
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
            <p className="text-gray-500 mb-4">Please log in to add talents</p>
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
          <h2 className="text-2xl font-bold text-gray-800">🎯 Add Your Talent</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill/Talent *
            </label>
            <input
              type="text"
              name="skill"
              value={formData.skill}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Digital Painting, Guitar, Creative Writing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">💡 Tips for adding talents:</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Be specific about your skills</li>
              <li>• Include both technical and creative abilities</li>
              <li>• Honest skill levels help with better matching</li>
              <li>• You can add multiple talents</li>
            </ul>
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Talent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTalentModal; 
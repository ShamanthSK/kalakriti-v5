import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, User, Mail, Lock, Eye, EyeOff, Palette } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/config';

const RegisterModal = ({ onClose, onNavigate }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryCategory: 'Visual Arts'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    console.log('Starting registration process...');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Form data:', formData);
      
      // Register the user
      await signup(formData.email, formData.password, formData.name, formData.primaryCategory);
      
      console.log('Registration successful!');
      
      // Send email verification
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        console.log('Email verification sent!');
      }

      // Show success message
      alert(`🎉 Welcome to KalaKriti v5.0, ${formData.name}!\n\nThank you for joining our creative community! We've sent a verification email to ${formData.email}.\n\nPlease check your email and verify your account to get started with collaborating with amazing artists!`);
      
      onClose();
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-center">🚀 Join KalaKriti v5.0</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              👤 Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              📧 Email
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              🎨 Primary Art Category
            </label>
            <select 
              name="primaryCategory"
              value={formData.primaryCategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
              required
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              📸 Profile Photo URL (Optional)
            </label>
            <input 
              type="url" 
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/your-photo.jpg"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              🔒 Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              🔒 Confirm Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:border-purple-500 form-input" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <button 
            onClick={() => onNavigate('login')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 
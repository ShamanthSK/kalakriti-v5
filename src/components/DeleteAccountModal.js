import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const DeleteAccountModal = ({ onClose }) => {
  const { currentUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (!currentUser || confirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsLoading(true);
    try {
      // Delete user's works
      const worksRef = collection(db, 'works');
      const userWorksQuery = query(worksRef, where('userId', '==', currentUser.id));
      const userWorksSnapshot = await getDocs(userWorksQuery);
      
      const workDeletions = userWorksSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(workDeletions);

      // Delete user's messages
      const messagesRef = collection(db, 'messages');
      const userMessagesQuery = query(
        messagesRef, 
        where('participants', 'array-contains', currentUser.id)
      );
      const userMessagesSnapshot = await getDocs(userMessagesQuery);
      
      const messageDeletions = userMessagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(messageDeletions);

      // Delete user document
      const userRef = doc(db, 'users', currentUser.id);
      await deleteDoc(userRef);

      // Logout user
      await logout();
      
      onClose();
      alert('Account deleted successfully. You have been logged out.');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-500 mb-4">Please log in to delete your account</p>
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
          <h2 className="text-2xl font-bold text-red-600">⚠️ Delete Account</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">This action cannot be undone!</h3>
              <p className="text-sm text-red-700">
                Deleting your account will permanently remove:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Your profile and personal information</li>
                <li>• All your uploaded works</li>
                <li>• All your messages and conversations</li>
                <li>• Your talents and skills</li>
                <li>• All collaboration data</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "DELETE" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Type DELETE to confirm"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading || confirmText !== 'DELETE'}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="spinner mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal; 
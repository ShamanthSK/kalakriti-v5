import React from 'react';

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
        <div className="spinner"></div>
        <span className="text-gray-700 font-medium">Loading amazing content...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay; 
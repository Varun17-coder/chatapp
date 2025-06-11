
import React from 'react';

interface QueueScreenProps {
  position: number;
  onLeaveQueue: () => void;
}

const QueueScreen: React.FC<QueueScreenProps> = ({ position, onLeaveQueue }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {position}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Waiting in Queue
        </h2>

        <p className="text-gray-600 mb-6">
          Looking for another user to connect with...
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-500">Searching for match</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            Position in queue: <span className="font-semibold text-blue-600">#{position}</span>
          </div>

          <button
            onClick={onLeaveQueue}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Leave Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueScreen;

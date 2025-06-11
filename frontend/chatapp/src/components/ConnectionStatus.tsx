
import React from 'react';
import type { ConnectionState } from '../types';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  error: string | null;
  onReconnect: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  error,
  onReconnect
}) => {
  const getStatusInfo = () => {
    switch (connectionState) {
      case 'connecting':
        return {
          title: 'Connecting...',
          message: 'Establishing connection to the server',
          color: 'blue',
          showReconnect: false,
          icon: (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          )
        };

      case 'disconnected':
        return {
          title: 'Disconnected',
          message: 'Connection to server lost',
          color: 'gray',
          showReconnect: true,
          icon: (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };

      case 'error':
        return {
          title: 'Connection Error',
          message: error || 'Failed to connect to server',
          color: 'red',
          showReconnect: true,
          icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };

      default:
        return {
          title: 'Unknown State',
          message: 'Something went wrong',
          color: 'gray',
          showReconnect: true,
          icon: (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          {statusInfo.icon}
        </div>

        <h2 className={`text-2xl font-bold mb-4 text-${statusInfo.color}-600`}>
          {statusInfo.title}
        </h2>

        <p className="text-gray-600 mb-6">
          {statusInfo.message}
        </p>

        {statusInfo.showReconnect && (
          <button
            onClick={onReconnect}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;

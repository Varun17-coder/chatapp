
import React, { useState } from 'react';

interface ManualJoinFormProps {
  onJoin: (roomId: string, role: 'sender' | 'receiver') => void;
  onClose: () => void;
}

const ManualJoinForm: React.FC<ManualJoinFormProps> = ({ onJoin, onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [role, setRole] = useState<'sender' | 'receiver'>('sender');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId.trim()) {
      setError('Room ID is required');
      return;
    }

    if (roomId.length < 3) {
      setError('Room ID must be at least 3 characters');
      return;
    }

    setError('');
    onJoin(roomId.trim(), role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Join Room</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID (e.g., abc123)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('sender')}
                  className={`p-4 rounded-lg border-2 transition-colors text-center ${
                    role === 'sender'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Sender</div>
                  <div className="text-sm mt-1">Send messages</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('receiver')}
                  className={`p-4 rounded-lg border-2 transition-colors text-center ${
                    role === 'receiver'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Receiver</div>
                  <div className="text-sm mt-1">Receive messages</div>
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Join Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualJoinForm;

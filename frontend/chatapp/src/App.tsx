
import React, { useReducer, useCallback, useEffect, useState } from 'react';
import { useWebSocket, type WebSocketMessage } from './useWebSocket';
import { appReducer, initialState, type ChatMessage } from './types';
import { v4 as uuidv4 } from 'uuid';
import ConnectionStatus from './components/ConnectionStatus';
import QueueScreen from './components/QueueScreen';
import ChatRoom from './components/ChatRoom';
import ManualJoinForm from './components/ManualJoin';
import './App.css';

const WEBSOCKET_URL = 'ws://localhost:8080';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [showManualJoin, setShowManualJoin] = useState(false);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received message:', message);

    switch (message.type) {
      case 'queueStatus':
        dispatch({ type: 'SET_CONNECTION_STATE', payload: 'in-queue' });
        dispatch({ type: 'SET_QUEUE_POSITION', payload: message.position || 0 });
        break;

      case 'matched':
        dispatch({ type: 'SET_CONNECTION_STATE', payload: 'matched' });
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            id: uuidv4(), 
            role: message.role 
          } 
        });
        dispatch({
          type: 'SET_ROOM',
          payload: {
            id: message.roomId,
            participants: [],
            messages: [],
            createdAt: new Date()
          }
        });
        setTimeout(() => {
          dispatch({ type: 'SET_CONNECTION_STATE', payload: 'in-room' });
        }, 1000);
        break;

      case 'chatMessage':
        { const chatMessage: ChatMessage = {
          id: uuidv4(),
          text: message.text,
          from: message.from,
          timestamp: new Date(),
          isOwn: false
        };
        dispatch({ type: 'ADD_MESSAGE', payload: chatMessage });
        break; }

      case 'participantLeft':
        dispatch({ type: 'PARTICIPANT_LEFT', payload: { role: message.role } });
        dispatch({ type: 'SET_QUEUE_POSITION', payload: 1 });
        break;

      case 'leftQueue':
        dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connected' });
        break;

      case 'error':
        dispatch({ type: 'SET_ERROR', payload: message.message });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const {
    isConnected,
    isConnecting,
    error: wsError,
    sendMessage,
    reconnect
  } = useWebSocket(WEBSOCKET_URL, {
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'in-queue' });
      dispatch({ type: 'SET_ERROR', payload: null });
    },
    onClose: () => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'disconnected' });
    },
    onError: () => {
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'error' });
    }
  });

  useEffect(() => {
    if (wsError) {
      dispatch({ type: 'SET_ERROR', payload: wsError });
    }
  }, [wsError]);

  const sendChatMessage = useCallback((text: string) => {
    if (state.user && state.room) {
      const message: ChatMessage = {
        id: uuidv4(),
        text,
        from: state.user.role,
        timestamp: new Date(),
        isOwn: true
      };

      dispatch({ type: 'ADD_MESSAGE', payload: message });

      sendMessage({
        type: 'chatMessage',
        roomId: state.room.id,
        text
      });
    }
  }, [state.user, state.room, sendMessage]);

  const joinRoom = useCallback((roomId: string, role: 'sender' | 'receiver') => {
    sendMessage({
      type: 'joinRoom',
      roomId,
      role
    });

    dispatch({ 
      type: 'SET_USER', 
      payload: { id: uuidv4(), role } 
    });

    dispatch({
      type: 'SET_ROOM',
      payload: {
        id: roomId,
        participants: [],
        messages: [],
        createdAt: new Date()
      }
    });

    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'in-room' });
    setShowManualJoin(false);
  }, [sendMessage]);

  const leaveQueue = useCallback(() => {
    sendMessage({ type: 'leaveQueue' });
    dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connected' });
  }, [sendMessage]);

  const terminateRoom = useCallback(() => {
    if (state.room) {
      sendMessage({
        type: 'terminateRoom',
        roomId: state.room.id
      });
      dispatch({ type: 'RESET_STATE' });
      dispatch({ type: 'SET_CONNECTION_STATE', payload: 'connected' });
    }
  }, [state.room, sendMessage]);

  const renderContent = () => {
    switch (state.connectionState) {
      case 'disconnected':
      case 'connecting':
      case 'error':
        return (
          <ConnectionStatus
            connectionState={state.connectionState}
            error={state.error}
            onReconnect={reconnect}
          />
        );

      case 'connected':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Welcome to WebSocket Chat
              </h1>
              <p className="text-gray-600 mb-8 text-center">
                Join the queue to be automatically matched with another user, or manually join a specific room.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => dispatch({ type: 'SET_CONNECTION_STATE', payload: 'in-queue' })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Join Queue
                </button>
                <button
                  onClick={() => setShowManualJoin(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Manual Join Room
                </button>
              </div>
            </div>
          </div>
        );

      case 'in-queue':
        return (
          <QueueScreen
            position={state.queuePosition}
            onLeaveQueue={leaveQueue}
          />
        );

      case 'matched':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Matched!</h2>
              <p className="text-gray-600">
                You've been paired with another user. Entering chat room...
              </p>
            </div>
          </div>
        );

      case 'in-room':
        return (
          <ChatRoom
            user={state.user}
            room={state.room}
            messages={state.messages}
            onSendMessage={sendChatMessage}
            onLeaveRoom={terminateRoom}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderContent()}
      {showManualJoin && (
        <ManualJoinForm
          onJoin={joinRoom}
          onClose={() => setShowManualJoin(false)}
        />
      )}
    </div>
  );
};

export default App;

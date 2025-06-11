export interface User {
    id: string;
    role: 'sender' | 'receiver';
  }
  
  export interface ChatMessage {
    id: string;
    text: string;
    from: 'sender' | 'receiver';
    timestamp: Date;
    isOwn?: boolean;
  }
  
  export interface Room {
    id: string;
    participants: User[];
    messages: ChatMessage[];
    createdAt: Date;
  }
  
  export type ConnectionState = 
    | 'disconnected'
    | 'connecting' 
    | 'connected'
    | 'in-queue'
    | 'matched'
    | 'in-room'
    | 'error';
  
  export interface AppState {
    connectionState: ConnectionState;
    user: User | null;
    room: Room | null;
    queuePosition: number;
    error: string | null;
    isTyping: boolean;
    messages: ChatMessage[];
  }
  
  export type AppAction =
   | { type: 'SET_CONNECTION_STATE'; payload: ConnectionState }
   | { type: 'SET_USER'; payload: User }
   | { type: 'SET_ROOM'; payload: Room }
   | { type: 'ADD_MESSAGE'; payload: ChatMessage }
   | { type: 'SET_QUEUE_POSITION'; payload: number }
   | { type: 'SET_ERROR'; payload: string | null }
   | { type: 'SET_TYPING'; payload: boolean }
   | { type: 'RESET_STATE' }
   | { type: 'PARTICIPANT_LEFT'; payload: { role: string } };
  
  export const initialState: AppState = {
    connectionState: 'disconnected',
    user: null,
    room: null,
    queuePosition: 0,
    error: null,
    isTyping: false,
    messages: []
  };
  
  export const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case 'SET_CONNECTION_STATE':
        return { ...state, connectionState: action.payload };
  
      case 'SET_USER':
        return { ...state, user: action.payload };
  
      case 'SET_ROOM':
        return { ...state, room: action.payload };
  
      case 'ADD_MESSAGE':
        return { 
          ...state, 
          messages: [...state.messages, action.payload] 
        };
  
      case 'SET_QUEUE_POSITION':
        return { ...state, queuePosition: action.payload };
  
      case 'SET_ERROR':
        return { ...state, error: action.payload };
  
      case 'SET_TYPING':
        return { ...state, isTyping: action.payload };
  
      case 'PARTICIPANT_LEFT':
        return {
          ...state,
          connectionState: 'in-queue',
          room: null,
          messages: []
        };
  
      case 'RESET_STATE':
        return initialState;
  
      default:
        return state;
    }
  };
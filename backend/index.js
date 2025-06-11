import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { v4 as uuidv4 } from "uuid";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket Server is running securely");
});

const wss = new WebSocketServer({ server });

const rooms = {};
const waitingQueue = []; 

const generateRoomId = () => {
  return uuidv4().substring(0, 8); 
};

const cleanupRoom = (roomId, ws) => {
  const room = rooms[roomId];
  if (room) {
    const otherSocket = ws === room.senderSocket ? room.receiverSocket : room.senderSocket;
    const otherRole = ws === room.senderSocket ? "receiver" : "sender";
    
    if (otherSocket && otherSocket.readyState === WebSocket.OPEN) {
      otherSocket.send(JSON.stringify({
        type: "participantLeft",
        role: otherRole === "receiver" ? "sender" : "receiver"
      }));
    }
    
    delete rooms[roomId];
    console.log(`Room ${roomId} has been terminated and cleaned up`);
  }
};

const matchUsers = () => {
  if (waitingQueue.length >= 2) {
    const sender = waitingQueue.shift();
    const receiver = waitingQueue.shift();
    
    // Generate new room
    const roomId = generateRoomId();
    
    // Create room
    rooms[roomId] = {
      senderSocket: sender.ws,
      receiverSocket: receiver.ws,
      createdAt: new Date()
    };
    
    // Store room info in websocket objects for cleanup
    sender.ws.roomId = roomId;
    sender.ws.role = "sender";
    receiver.ws.roomId = roomId;
    receiver.ws.role = "receiver";
    
    // Notify both users they've been matched
    sender.ws.send(JSON.stringify({
      type: "matched",
      roomId: roomId,
      role: "sender",
      message: "You've been matched with another user!"
    }));
    
    receiver.ws.send(JSON.stringify({
      type: "matched",
      roomId: roomId,
      role: "receiver",
      message: "You've been matched with another user!"
    }));
    
    console.log(`Users matched in room: ${roomId}`);
  }
};

const removeFromQueue = (ws) => {
  const index = waitingQueue.findIndex(user => user.ws === ws);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
    console.log(`User removed from waiting queue. Queue length: ${waitingQueue.length}`);
  }
};

wss.on("connection", (ws) => {
  console.log("USER connected");
  ws.on("error", console.error);
  
  const userId = uuidv4();
  waitingQueue.push({
    ws: ws,
    userId: userId,
    connectedAt: new Date()
  });
  
  console.log(`User ${userId} added to waiting queue. Queue length: ${waitingQueue.length}`);
  
  ws.send(JSON.stringify({
    type: "queueStatus",
    message: "Waiting for another user to connect...",
    position: waitingQueue.length
  }));
  
  matchUsers();

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    if (message.type === "joinRoom") {
     
      const { roomId, role } = message;
      let room = rooms[roomId];
      if (!room) {
        room = { senderSocket: null, receiverSocket: null };
        rooms[roomId] = room;
      }
      
      removeFromQueue(ws);
      
      if (role === "sender") {
        if (room.senderSocket) {
          ws.send(JSON.stringify({ type: "error", message: "Room already has a sender" }));
        } else {
          room.senderSocket = ws;
          ws.roomId = roomId;
          ws.role = role;
          console.log(`Candidate manually joined room: ${roomId}`);
        }
      } else if (role === "receiver") {
        room.receiverSocket = ws;
        ws.roomId = roomId;
        ws.role = role;
        console.log(`Interviewer manually joined room: ${roomId}`);
      }

    } else if (message.type === "chatMessage") {
      const roomId = ws.roomId || message.roomId;
      const { text } = message;
      const room = rooms[roomId];
      
      if (ws === room?.senderSocket && room.receiverSocket) {
        room.receiverSocket.send(JSON.stringify({ 
          type: "chatMessage", 
          text,
          from: "sender"
        }));
      } else if (ws === room?.receiverSocket && room.senderSocket) {
        room.senderSocket.send(JSON.stringify({ 
          type: "chatMessage", 
          text,
          from: "receiver"
        }));
      }

    } else if (message.type === "terminateRoom") {
      const roomId = ws.roomId || message.roomId;
      if (roomId && rooms[roomId]) {
        cleanupRoom(roomId, ws);
      }
      
    } else if (message.type === "leaveQueue") {
      removeFromQueue(ws);
      ws.send(JSON.stringify({
        type: "leftQueue",
        message: "You've left the waiting queue"
      }));
    }
  });

  ws.on("close", () => {
    console.log("Connection closed");
    removeFromQueue(ws);
    
    if (ws.roomId) {
      const room = rooms[ws.roomId];
      if (room) {
        const otherSocket = ws === room.senderSocket ? room.receiverSocket : room.senderSocket;
        const otherRole = ws.role === "sender" ? "receiver" : "sender";
        
        if (otherSocket && otherSocket.readyState === WebSocket.OPEN) {
          otherSocket.send(JSON.stringify({
            type: "participantLeft",
            role: ws.role,
            message: "The other participant has disconnected"
          }));
          
          const userId = uuidv4();
          waitingQueue.push({
            ws: otherSocket,
            userId: userId,
            connectedAt: new Date()
          });
          
          delete otherSocket.roomId;
          delete otherSocket.role;
          
          otherSocket.send(JSON.stringify({
            type: "queueStatus",
            message: "Waiting for another user to connect...",
            position: waitingQueue.length
          }));
          
          console.log(`User put back in queue after partner disconnected. Queue length: ${waitingQueue.length}`);
        }
        
        cleanupRoom(ws.roomId, ws);
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
  console.log("Auto-matching enabled - users will be paired automatically");
});
import { Server, Socket } from 'socket.io';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🟢 [Socket] Client connected: ${socket.id}`);

    // --- 1. Room Management ---
    socket.on('join-room', (roomId: string, userId: string) => {//what does socket.on does? It's a Socket.IO method that listens for a specific event from the client. In this case, we're listening for a 'join-room' event, which the frontend emits when a user enters a board. 
    // The callback function receives the roomId and userId as parameters, allowing us to handle the logic of adding this socket connection to the appropriate room and notifying other users in that room about the new participant.
      // socket.join() is a native Socket.IO method that subscribes this connection to a specific channel
      socket.join(roomId);
      console.log(`🚪 [Socket] User ${userId} (${socket.id}) joined room: ${roomId}`);
      
      // Notify everyone ELSE in the room that a new user arrived
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
    });

    socket.on('leave-room', (roomId: string, userId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
    });

    // --- 2. Transient State (High-Frequency Cursor Movements) ---
   // --- 2. Transient State (High-Frequency Cursor Movements) ---
    // UPGRADED: Added 'name' and 'color' to the payload
    socket.on('cursor-move', (data: { roomId: string, userId: string, name: string, color: string, x: number, y: number }) => {
      socket.to(data.roomId).volatile.emit('cursor-update', data);  //The .volatile flag tells Socket.IO that if the client's network is congested, it's better to drop this packet than to delay it. This is perfect for cursor movements, where real-time updates are more important than guaranteed delivery. If a cursor update is dropped, the next one will arrive shortly, keeping the experience smooth without overwhelming the server or network.
    });

    // --- 3. Persistent State (Drawing/Shapes) ---
    socket.on('draw-event', (data: { roomId: string, action: string, shape: any }) => {
      // Standard emit. Guaranteed delivery via TCP. 
      // socket.to() broadcasts to everyone in the room EXCEPT the person who drew it (preventing infinite loops).
      socket.to(data.roomId).emit('draw-update', data);
      // --- NEW: The Nuke Button ---
    socket.on('clear-board', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('board-cleared');  //emit a simple event with no payload, since the frontend will just clear everything upon receiving it
    });

    socket.on('delete-shapes', (data: { roomId: string, shapeIds: string[] }) => {
      socket.to(data.roomId).emit('shapes-deleted', data.shapeIds);  //what emit means? It's a Socket.IO method used to send an event from the server to the clients. In this case, when the server receives a 'delete-shapes' event from one client, it uses socket.to(data.roomId).emit('shapes-deleted', data.shapeIds) to broadcast a 'shapes-deleted' event to all other clients in the same room, along with the IDs of the shapes that should be deleted. This way, all clients can stay in sync about which shapes have been removed from the board.
    });//does this method deletes the shapes or just notify multiple users? It just notifies multiple users. The actual deletion logic happens on the frontend, where each client will listen for the 'shapes-deleted' event and remove the corresponding shapes from their local state. This design keeps the server stateless regarding the board's content, allowing it to simply relay messages between clients without needing to manage the game state itself. then what is the use of it? It allows for real-time collaboration. When one user deletes shapes, all other users see those shapes disappear immediately, creating a seamless shared experience.
    });

    // --- 4. Disconnect Handling ---
    socket.on('disconnect', () => {
      console.log(`🔴 [Socket] Client disconnected: ${socket.id}`);
      // Note: Socket.IO automatically leaves all rooms upon disconnect. 
      // In the future, we will add logic here to broadcast a global "cursor-remove" event.
    });

    // --- Transient State (Live Ink Streaming) ---
    socket.on('draw-stream', (data: { roomId: string, userId: string, shape: any }) => {
      // The .volatile flag drops the packet if the network is congested, preventing memory leaks
      socket.to(data.roomId).volatile.emit('draw-stream-update', data);
    });

    // --- 4. Absolute Consensus (Undo/Redo Sync) ---
    socket.on('force-state-sync', (data: { roomId: string, shapes: any[] }) => {
      // Overwrite everyone else's board with this exact array of shapes
      socket.to(data.roomId).emit('sync-full-state', data.shapes);
    });

    // --- 5. Selection Tool (Shape Dragging) ---
    socket.on('shape-update', (data: { roomId: string, shape: any }) => {
      // Broadcast the new coordinates of the moved shape
      socket.to(data.roomId).emit('shape-updated', data.shape);
    });
  });
};
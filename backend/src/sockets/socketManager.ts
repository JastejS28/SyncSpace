import { Server, Socket } from 'socket.io';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🟢 [Socket] Client connected: ${socket.id}`);

    // --- 1. Room Management ---
    socket.on('join-room', (roomId: string, userId: string) => {
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
      socket.to(data.roomId).volatile.emit('cursor-update', data);
    });

    // --- 3. Persistent State (Drawing/Shapes) ---
    socket.on('draw-event', (data: { roomId: string, action: string, shape: any }) => {
      // Standard emit. Guaranteed delivery via TCP. 
      // socket.to() broadcasts to everyone in the room EXCEPT the person who drew it (preventing infinite loops).
      socket.to(data.roomId).emit('draw-update', data);
      // --- NEW: The Nuke Button ---
    socket.on('clear-board', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('board-cleared');
    });

    socket.on('delete-shapes', (data: { roomId: string, shapeIds: string[] }) => {
      socket.to(data.roomId).emit('shapes-deleted', data.shapeIds);
    });
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
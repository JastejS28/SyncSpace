import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const getStringParam = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

export const saveRoomData = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = getStringParam(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ success: false, error: 'Invalid roomId' });
      return;
    }
    // NEW: Accept name and thumbnail from the frontend
    const { shapes, name, thumbnail } = req.body; 
    
    const userId = req.user?.sub; 
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized: Missing user ID" });
      return;
    }

    const room = await prisma.room.upsert({
      where: { id: roomId },
      // NEW: Apply them to the database
      update: { data: shapes, name: name, thumbnail: thumbnail },
      create: { 
        id: roomId, 
        data: shapes,
        ownerId: userId,
        name: name || "Untitled Board",
        thumbnail: thumbnail
      },
    });

    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("🔴 Error saving room data:", error);
    res.status(500).json({ success: false, error: "Failed to save board state" });
  }
};


export const getRoomData = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = getStringParam(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ success: false, error: 'Invalid roomId' });
      return;
    }
    const userId = req.user?.sub; // The person requesting the board

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      // Return empty room structure to prevent frontend crashes
      res.status(404).json({ success: false, room: { data: [] } });
      return;
    }


    // THE SECURITY GATE: If the board is strictly private, ONLY the owner can access it.
    if (!room.isPublic && room.ownerId !== userId) {
      res.status(403).json({ success: false, error: "This board is private." });
      return;
    }

    // THE FIX: We MUST return the entire 'room' object, not just 'room.data'
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error("🔴 Error fetching room data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch board state" });
  }
};

// --- NEW: Create a brand new empty room ---
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const room = await prisma.room.create({
      data: {
        ownerId: userId,
        name: "Untitled Board",
        data: [], // Empty canvas
      }
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    console.error("🔴 Error creating room:", error);
    res.status(500).json({ success: false, error: "Failed to create room" });
  }
};

// --- NEW: Get all rooms for the dashboard ---
export const getUserRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;  //what does req.user?.sub mean? The 'sub' claim in the JWT typically contains the unique user ID. This is how we identify which user is making the request, so we can fetch only their boards from the database. The requireAuth middleware ensures that req.user is populated with the decoded JWT payload, so we can safely access req.user.sub to get the user's ID.
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const rooms = await prisma.room.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' }, // Show newest boards first
      select: {
        id: true,
        name: true,
        updatedAt: true,
        thumbnail: true, // <--- ADD THIS EXACT LINE
        // We purposely exclude 'data' here so we don't send 50MB of JSON to the dashboard
      }
    });

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("🔴 Error fetching user rooms:", error);
    res.status(500).json({ success: false, error: "Failed to fetch rooms" });
  }
};


export const toggleVisibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = getStringParam(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ success: false, error: 'Invalid roomId' });
      return;
    }
    // Extract BOTH settings from the frontend request
    const { isPublic, allowEdits } = req.body; 
    const userId = req.user?.sub;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (room?.ownerId !== userId) {
      res.status(403).json({ success: false, error: "Only the owner can change visibility" });
      return;
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      // Save BOTH settings to PostgreSQL
      data: { isPublic, allowEdits }, 
    });

    res.status(200).json({ success: true, isPublic: updatedRoom.isPublic, allowEdits: updatedRoom.allowEdits });
  } catch (error) {
    console.error("🔴 Error updating access:", error);
    res.status(500).json({ success: false, error: "Failed to update access" });
  }
};


// --- NEW: Delete a board ---
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = getStringParam(req.params.roomId);
    if (!roomId) {
      res.status(400).json({ success: false, error: 'Invalid roomId' });
      return;
    }
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // FIREWALL: Only the owner can delete a board
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ success: false, error: "Room not found" });
      return;
    }
    if (room.ownerId !== userId) {
      res.status(403).json({ success: false, error: "Only the owner can delete this board." });
      return;
    }

    // Execute the physical deletion
    await prisma.room.delete({
      where: { id: roomId }
    });

    res.status(200).json({ success: true, message: "Board deleted successfully" });
  } catch (error) {
    console.error("🔴 Error deleting room:", error);
    res.status(500).json({ success: false, error: "Failed to delete board" });
  }
};


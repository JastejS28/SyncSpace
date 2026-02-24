import { Router } from 'express';
import { syncUser } from '../controllers/user.controller';
import { saveRoomData, getRoomData, createRoom, getUserRooms, toggleVisibility, deleteRoom } from '../controllers/room.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { generateAIResponse } from '../controllers/ai.controller';

const router = Router();

router.post('/user/sync', requireAuth, syncUser);

// --- Dashboard Routes ---
router.post('/room', requireAuth, createRoom);       // Create a new board
router.get('/room', requireAuth, getUserRooms);      // Get all boards for the user

// --- Canvas Routes ---
router.post('/room/:roomId', requireAuth, saveRoomData); // Auto-save specific board
router.get('/room/:roomId', requireAuth, getRoomData);   // Load specific board
router.put('/room/:roomId/visibility', requireAuth, toggleVisibility);
router.delete('/room/:roomId', requireAuth, deleteRoom);

router.post('/ai/generate', requireAuth, generateAIResponse);
export default router;
import { Router } from 'express';
import { syncUser } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Notice how requireAuth sits before syncUser. 
// It intercepts the request and verifies the token first.
router.post('/sync', requireAuth, syncUser);

export default router;
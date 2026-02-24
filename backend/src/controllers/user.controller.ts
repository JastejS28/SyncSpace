import { Request, Response } from 'express';
import { ErrorWrapper } from '../utils/ErrorWrapper';
import { ErrorHandler } from '../utils/ErrorHandler';

import { prisma } from '../lib/prisma';
export const syncUser = ErrorWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.sub;// The 'sub' claim in the JWT typically contains the unique user ID.
  const email = req.user?.email as string;//
//You asked why we use it if we "expect" the user to exist. You know the user exists because the requireAuth middleware ran first. 
// TypeScript's compiler does not know that. Because we defined user?: jose.JWTPayload; as an optional property on the Express Request object (since public routes won't have a user),
// TypeScript will throw a fatal build error if you try to type req.user.sub. 
// The compiler assumes req.user might be undefined and refuses to compile to prevent a potential runtime crash.
  if (!userId || !email) {
    // We throw your custom error. The ErrorWrapper automatically catches it and formats the response.
    throw new ErrorHandler(400, 'Invalid token payload missing user ID or email');
  }

  const user = await prisma.user.upsert({  //update and insert
    where: { id: userId },
    update: {}, 
    create: {
      id: userId,
      email: email,
      name: (req.user?.name as string) || 'New User',
    },
  });

  res.status(200).json({ 
    success: true,
    message: 'User synced successfully', 
    user 
  });
});
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

declare global {
  namespace Express {
    interface Request {
      user?: jose.JWTPayload;
    }
  }
}

const jwks = jose.createRemoteJWKSet(  //what is JWKS? JSON Web Key Set - a standardized format for representing public keys used to verify JWTs. StackAuth exposes their public keys at this URL, allowing us to verify tokens they issue without needing to manage keys ourselves.
  new URL(`https://api.stack-auth.com/api/v1/projects/${process.env.STACK_PROJECT_ID}/.well-known/jwks.json`)
);

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = '';

    // 1. Try Authorization header first (Standard for mobile apps or external API calls)
    const authHeader = req.headers.authorization;  //what exactly is authorization header? It's a standard HTTP header used to pass authentication credentials. In our case, we expect it to be in the format "Bearer <token>", where <token> is the JWT issued by StackAuth.
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Fallback to cookies (Standard for our Next.js frontend)
    else if (req.cookies['stack-access']) {
      // StackAuth stores this as a stringified array: ["refresh_token", "jwt_token"]
      const parsedCookie = JSON.parse(req.cookies['stack-access']);
      if (Array.isArray(parsedCookie) && parsedCookie.length > 1) {
         token = parsedCookie[1]; // Extract the actual JWT
      }
    }

    // If no token was found in either place, kill the request
    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication token missing' });
      return;
    }

    console.log(`🔍 Extracted Token for Verification: ${token.substring(0, 20)}...`);

    // 3. Cryptographically verify the token against StackAuth's public keys
    const { payload } = await jose.jwtVerify(token, jwks);
    
    // 4. Attach the decoded user data (ID, email) to the request, returns it to the controller that called this middleware, so it can know which user is making the request without needing to decode the token again. This is super useful for any controller that needs to know "who" is making the request, like fetching their rooms, or creating a new board under their account.
    req.user = payload; 
    
    // 5. Pass control to the user sync controller
    next();
  } catch (error) {
    console.error("🔴 JWT Verification Failed:", error);
    res.status(403).json({ success: false, error: 'Invalid, forged, or expired token' });
  }
};
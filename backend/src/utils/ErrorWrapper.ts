import { Request, Response, NextFunction } from 'express';

// Defines the shape of an Express middleware/controller function
type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const ErrorWrapper = (cb: AsyncController) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await cb(req, res, next);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        status: statusCode,
        message: error.message || 'Internal Server Error',
        success: false,
        errors: error.errors || []
      });
    }
  };
};
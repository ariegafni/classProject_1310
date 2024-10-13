import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
    statusCode?: number
}

export const errorHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            console.error(error);
            const customError = error as CustomError;
            res.status(customError.statusCode || 500).json({
                message: customError.message || "error comes from the server"
            })

        }
    }
}
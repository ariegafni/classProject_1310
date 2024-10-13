import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// הגדרת אינטרפייס שיכלול את פרטי המשתמש
interface AuthRequest extends Request {
    user?: { userId: string, role?: string };
}

// פונקציה לאימות טוקן של משתמש
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // ניסיון לחלץ את הטוקן מה-Cookie
    const token = req.cookies.token;

    // אם אין טוקן, תחזיר שגיאה 401
    if (!token) {
        res.status(401).json({ message: 'אין לך טוקן, התנתק ונסה שוב' });
        return;
    }

    try {
        // ניסיון לאמת את הטוקן
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
        
        // אם האימות מצליח, הוסף את פרטי המשתמש לאובייקט הבקשה
        req.user = decoded;

        // המשך לפונקציה הבאה בשרשרת הטיפול
        next();
    } catch (error) {
        // אם הטוקן לא תקין, תחזיר שגיאה 401
        res.status(401).json({ message: 'הטוקן לא בתוקף' });
    }
};

// פונקציה לאימות מנהלים
export const managerAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // אם התפקיד של המשתמש אינו מנהל, תחזיר שגיאה 403
    if (req.user?.role !== 'manager') {
        res.status(403).json({ message: "Access denied, Managers only!" });
    } else {
        // אם התפקיד הוא מנהל, המשך לפונקציה הבאה
        next();
    }
}

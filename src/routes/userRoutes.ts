import express from 'express';
import { register, login } from '../controllers/authController';
import { getUsers } from '../controllers/userController';
import { authMiddleware, managerAuthMiddleware } from '../middleware/authMiddleware';
import { errorHandler } from '../utils/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: רישום משתמש חדש
 *     description: יוצר חשבון משתמש חדש במערכת. אם המשתמש הוא מנהל, מחזיר טוקן ב-cookie.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [employee, manager]
 *               salary:
 *                 type: number
 *               yearsOfExperience:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               age:
 *                 type: number
 *     responses:
 *       201:
 *         description: המשתמש נרשם בהצלחה
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isManager:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; HttpOnly; Secure; SameSite=Strict
 *       400:
 *         description: שגיאה בנתונים שהוזנו
 */

router.post('/auth/register', register);

/**
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: התחברות למערכת
 *     description: מאמת את פרטי המשתמש ומחזיר טוקן ב-cookie אם המשתמש הוא מנהל.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: התחברות הצליחה
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isManager:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; HttpOnly; Secure; SameSite=Strict
 *       401:
 *         description: שם משתמש או סיסמה שגויים
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: קבלת כל המשתמשים
 *     description: תחזיר רשימה של כל המשתמשים. זמין רק למנהלים
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: רשימת משתמשים הוחזרה בהצלחה
 *       401:
 *         description: לא מורשה, נדרשת התחברות
 *       403: 
 *         description: נדרשת הרשאת מנהל
 */
router.get("/", authMiddleware, managerAuthMiddleware, errorHandler(getUsers));

router.post('/auth/login', login);



export default router;

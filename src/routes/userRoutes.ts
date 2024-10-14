import express from 'express';
import { register, login, addGrade } from '../controllers/authController';
import { getUsers } from '../controllers/userController';
import { authMiddleware, managerAuthMiddleware } from '../middleware/authMiddleware';
import { errorHandler } from '../utils/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: רישום משתמש חדש
 *     description: יוצר חשבון משתמש חדש במערכת.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Student, Teacher]
 *               className:
 *                 type: string
 *               grades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                     comment:
 *                       type: string
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
 *                 userId:
 *                   type: string
 *       400:
 *         description: שגיאה בנתונים שהוזנו
 */
router.post('/auth/register', register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: התחברות למערכת
 *     description: מאמת את פרטי המשתמש על פי שם (name) וסיסמה ומחזיר טוקן ב-cookie אם ההתחברות הצליחה.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
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
 *                 userId:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: שם משתמש או סיסמה שגויים
 */
router.post('/login', login);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: קבלת כל המשתמשים
 *     description: תחזיר רשימה של כל המשתמשים. זמין רק למנהלים.
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

/**
 * @swagger
 * /users/add-grade:
 *   post:
 *     summary: הוספת ציון לתלמיד
 *     description: מאפשר למורה להוסיף ציון לתלמיד בכיתה שלו.
 *     tags: [Grades]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - score
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: מזהה התלמיד
 *               score:
 *                 type: number
 *                 description: הציון שניתן לתלמיד
 *               comment:
 *                 type: string
 *                 description: הערה על הציון (לא חובה)
 *     responses:
 *       201:
 *         description: הציון נוסף בהצלחה
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 grades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       score:
 *                         type: number
 *                       comment:
 *                         type: string
 *       400:
 *         description: התלמיד אינו שייך לכיתה הזו או שגיאה בנתונים שהוזנו
 *       403:
 *         description: רק מרצים יכולים להוסיף ציונים
 *       404:
 *         description: הכיתה או התלמיד לא נמצאו
 */

// הוספת ציון לתלמיד (רק למורים)
router.post("/add-grade", authMiddleware, addGrade);

export default router;

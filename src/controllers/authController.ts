import { Request, Response } from "express";
import User from "../modules/userModel";
import { generateToken } from "../utils/auth";
import { createUser } from "../servicece/userServicece";
import { Class } from "../modules/classModel";


export const register = async (req: Request, res: Response) => {
    const { name, password, role, email, className, grades } = req.body;

    try {
        const user = await createUser({
            name, password, role, email, className, grades
        });

        if (user.role === 'Teacher') {
            const newClass = new Class({
                className,
                teacher: user._id,
                students: []
            });
            await newClass.save();
            res.status(201).json({ message: "נרשמת בהצלחה כמורה חדש", userId: user.id });
        } else if (user.role === 'Student') {
            const existingClass = await Class.findOne({ className });
            if (!existingClass) {
                res.status(400).json({ message: "הכיתה המבוקשת אינה קיימת" });
                return;
            }

            existingClass.students.push(user._id);
            await existingClass.save();
            res.status(201).json({ message: "נרשמת בהצלחה כתלמיד", userId: user.id });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json("תקלה בהרשמה");
    }
}
// התחברות של משתמש קיים
export const login = async (req: Request, res: Response) => {
    const { name, password } = req.body;  // משתמשים רק ב-name וב-password

    const user = await User.findOne({ name });  // חיפוש משתמש לפי name

    if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ message: "שם משתמש או סיסמה שגויים" });
        return;
    }

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000
    });

    if (user.role === 'Teacher') {
        res.status(200).json({ message: "התחברת בהצלחה אדוני המרצה", userId: user.id, token });
    } else {
        res.status(200).json({ message: "התחברת בהצלחה תלמיד", userId: user.id, token });
    }
};

// פונקציה להוספת ציון לתלמיד על ידי מרצה
export const addGrade = async (req: any, res: any) => {
    const { studentId, score, comment } = req.body;

    try {
        // מציאת המשתמש שמחובר (המרצה)
        const teacher = req.user;

        // בדיקה שהמרצה אכן מחובר
        if (!teacher || teacher.role !== 'Teacher') {
            return res.status(403).json({ message: "רק מרצים יכולים להוסיף ציונים" });
        }

        // מציאת הכיתה שהמרצה מלמד בה
        const classInfo = await Class.findOne({ teacher: teacher.userId, className: req.body.className });
        if (!classInfo) {
            return res.status(404).json({ message: "הכיתה לא נמצאה עבור המרצה הזה" });
        }
        

        // בדיקה אם התלמיד נמצא בכיתה הזו
        if (!classInfo.students.includes(studentId)) {
            return res.status(400).json({ message: "התלמיד אינו שייך לכיתה הזו" });
        }

        // מציאת התלמיד
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "התלמיד לא נמצא" });
        }

        // הוספת הציון לתלמיד
        student.grades.push({ score, comment });
        await student.save();

        res.status(201).json({ message: "הציון נוסף בהצלחה", grades: student.grades });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "שגיאה בהוספת הציון" });
    }
};
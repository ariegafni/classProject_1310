import { Request, Response } from "express";
import User from "../modules/userModel";
import { generateToken } from "../utils/auth";
import { createUser } from "../servicece/userServicece";
import { Class } from "../modules/classModel"; 

// פונקציה להרשמה של משתמש חדש
export const register = async (req: any, res: any) => {
    const { name, password, role, email, className, grades } = req.body;

    try {
        // יצירת משתמש חדש
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
        } else if (user.role === 'Student') {
            
            const existingClass = await Class.findOne({ className });
            if (!existingClass) {
                return res.status(400).json({ message: "הכיתה המבוקשת אינה קיימת" });
            }

            
            existingClass.students.push(user._id);
            await existingClass.save();
        }

        
        const token = generateToken(user.id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, 
            maxAge: 9000000 
        });

        // החזרת התגובה עם מזהה המשתמש וההצלחה
        if (user.role === 'Teacher') {
            res.status(201).json({ message: "נרשמת בהצלחה כמורה חדש", userId: user.id, token });
        } else {
            res.status(201).json({ message: "נרשמת בהצלחה כתלמיד", userId: user.id, token });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json("תקלה בהרשמה");
    }
}

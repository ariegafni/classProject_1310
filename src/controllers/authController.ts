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

        const token = generateToken(user.id, user.role);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000
        });

        if (user.role === 'Teacher') {
            const newClass = new Class({
                className,
                teacher: user._id,
                students: []
            });
            await newClass.save();
            res.status(201).json({ message: "נרשמת בהצלחה כמורה חדש", userId: user.id, token });
        } else if (user.role === 'Student') {
            const existingClass = await Class.findOne({ className });
            if (!existingClass) {
                res.status(400).json({ message: "הכיתה המבוקשת אינה קיימת" });
                return;
            }

            existingClass.students.push(user._id);
            await existingClass.save();
            res.status(201).json({ message: "נרשמת בהצלחה כתלמיד", userId: user.id, token });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json("תקלה בהרשמה");
    }
}

// התחברות של משתמש קיים
export const login = async (req: Request, res: Response) => {
    const { name, password } = req.body;

    const user = await User.findOne({ name });

    if (!user || (await user.comparePassword(password))) {
        res.status(401).json({ message: "שם משתמש או סיסמה שגויים" })
        return
    };

    const token = generateToken(user.id, user.role);
    res.cookie('token', token, {
        httpOnly:true,
        secure: false,
        maxAge: 3600000
    })
     // החזרת התגובה עם מזהה המשתמש וההצלחה
     if (user.role === 'Teacher') {
        res.status(200).json({ message: "התחברת בהצלחה אדוני המרצה", userId: user.id, token });
    } else {
        res.status(200).json({ message: "התחברת בהצלחה תלמיד", userId: user.id, token });
    }

}
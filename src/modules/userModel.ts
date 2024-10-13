import mongoose, { Schema, Document, Types, model } from "mongoose";
import bcrypt from 'bcrypt';

export interface IGrades extends Document {
    score: number;
    comment: string;
}

const gradeSchema = new Schema<IGrades>({
    score: { type: Number, required: true },
    comment: { type: String }
});

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    password: string;
    role: 'Student' | 'Teacher';
    email: string;
    className: string;
    grades: Types.DocumentArray<IGrades>; 

    comparePassword(userPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        unique: false
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Student', 'Teacher'],  
        default: 'Student'
    },
    email: {
        type: String,  
        required: true,
        unique: false
    },
    className: {
        type: String, 
        required: true
    },
    grades: [gradeSchema] 
});

// הצפנת הסיסמה לפני שמירה
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// פונקציה להשוואת סיסמאות
UserSchema.methods.comparePassword = async function (userPassword: string): Promise<boolean> {
    return await bcrypt.compare(userPassword, this.password);
}

// יצירת אינדקסים
UserSchema.index({ role: 1 });
UserSchema.index({ name: 1 });

export default mongoose.model<IUser>("User", UserSchema);
export const Grades = model<IGrades>('Grades', gradeSchema);

//נתיב לסוואגר
// http://localhost:3000/api-docs/
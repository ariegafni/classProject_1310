import { Schema, model, Document, Types } from 'mongoose';

export interface IClass extends Document {
  className: string;
  teacher: Types.ObjectId;  
  students: Types.ObjectId[];  
}

const classSchema = new Schema<IClass>({
  className: { type: String, required: true, unique: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export const Class = model<IClass>('Class', classSchema);

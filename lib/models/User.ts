import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Doctor' | 'Patient';
  phone?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for dummy data, but usually required
  role: { type: String, enum: ['Admin', 'Doctor', 'Patient'], default: 'Patient' },
  phone: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

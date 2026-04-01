import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  specialization: string;
  experience: number;
  bio?: string;
  consultationFee?: number;
  availability: boolean;
  availableDays?: string[];
}

const DoctorSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String, required: false },
  consultationFee: { type: Number, required: false },
  availability: { type: Boolean, default: true },
  availableDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

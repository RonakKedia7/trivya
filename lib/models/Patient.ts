import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  user: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  contactNumber?: string;
  bloodGroup?: string;
  address?: string;
}

const PatientSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date, required: false },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false },
  contactNumber: { type: String, required: false },
  bloodGroup: { type: String, required: false },
  address: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  diagnosis: string;
  prescription: string;
  notes?: string;
  attachments?: string[];
  date: Date;
}

const MedicalRecordSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: false },
  diagnosis: { type: String, required: true },
  prescription: { type: String, required: true },
  notes: { type: String, required: false },
  attachments: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

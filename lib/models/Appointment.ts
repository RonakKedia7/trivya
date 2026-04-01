import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  type: 'in-person' | 'video';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
}

const AppointmentSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'video'], default: 'in-person' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

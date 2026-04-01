import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IDayAvailability {
  day: string;
  isWorking: boolean;
  slots: IAvailabilitySlot[];
}

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  specialization: string;
  experience: number;
  bio?: string;
  consultationFee?: number;
  availability: IDayAvailability[];
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const DayAvailabilitySchema = new Schema<IDayAvailability>(
  {
    day: { type: String, required: true },
    isWorking: { type: Boolean, default: false },
    slots: { type: [AvailabilitySlotSchema], default: [] },
  },
  { _id: false },
);

const defaultAvailability = (): IDayAvailability[] => [
  { day: 'Monday', isWorking: true, slots: [] },
  { day: 'Tuesday', isWorking: true, slots: [] },
  { day: 'Wednesday', isWorking: true, slots: [] },
  { day: 'Thursday', isWorking: true, slots: [] },
  { day: 'Friday', isWorking: true, slots: [] },
  { day: 'Saturday', isWorking: false, slots: [] },
  { day: 'Sunday', isWorking: false, slots: [] },
];

const DoctorSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String, required: false },
  consultationFee: { type: Number, required: false },
  availability: { type: [DayAvailabilitySchema], default: defaultAvailability },
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

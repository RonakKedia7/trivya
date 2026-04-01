/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import PatientModel from '@/lib/models/Patient';
import UserModel from '@/lib/models/User';
import { notFound, ok, serverError } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
function mapPatientToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    role: 'patient',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || doc.contactNumber || '',
    dateOfBirth: doc.dateOfBirth ? safeIso(doc.dateOfBirth).split('T')[0] : '',
    gender: doc.gender ? doc.gender.toString().toLowerCase() : '',
    bloodGroup: doc.bloodGroup || '',
    address: doc.address || '',
    emergencyContact: '',
    createdAt: doc.createdAt ? safeIso(doc.createdAt).split('T')[0] : '',
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    let doc = await PatientModel.findById(id).populate('user');
    if (!doc && mongoose.isValidObjectId(id)) doc = await PatientModel.findOne({ user: id }).populate('user');
    if (!doc) return notFound('Patient not found');
    return ok(mapPatientToFrontend(doc));
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const patient = await PatientModel.findById(id);
    if (!patient) return notFound('Patient not found');
    await UserModel.findByIdAndDelete(patient.user);
    await PatientModel.findByIdAndDelete(id);
    return ok(null, 'Patient deleted successfully');
  } catch {
    return serverError();
  }
}

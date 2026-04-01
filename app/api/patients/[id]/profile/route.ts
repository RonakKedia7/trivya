/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import PatientModel from '@/lib/models/Patient';
import UserModel from '@/lib/models/User';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object') return badRequest('Invalid request body');
    await connectDB();
    const patient = await PatientModel.findById(id).populate('user');
    if (!patient) return notFound('Patient not found');
    if (body.name || body.phone) {
      const userUpdates: any = {};
      if (body.name) userUpdates.name = body.name;
      if (body.phone) userUpdates.phone = body.phone;
      await UserModel.findByIdAndUpdate((patient.user as any)._id, userUpdates);
    }
    const updates: any = {};
    if (body.dateOfBirth) updates.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender) updates.gender = body.gender === 'male' ? 'Male' : body.gender === 'female' ? 'Female' : 'Other';
    if (body.bloodGroup) updates.bloodGroup = body.bloodGroup;
    if (body.address) updates.address = body.address;
    if (body.phone) updates.contactNumber = body.phone;
    const updated = await PatientModel.findByIdAndUpdate(id, updates, { new: true }).populate('user');
    if (!updated) return notFound('Patient not found');
    return ok(mapPatientToFrontend(updated), 'Profile updated successfully');
  } catch {
    return serverError();
  }
}

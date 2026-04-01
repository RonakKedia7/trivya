/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import DoctorModel from '@/lib/models/Doctor';
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
function mapDoctorToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    role: 'doctor',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || '',
    specialization: doc.specialization,
    department: doc.specialization,
    qualification: doc.qualification || 'MBBS, MD',
    experience: doc.experience,
    consultationFee: doc.consultationFee || 500,
    bio: doc.bio || '',
    availability: doc.availability || [],
    createdAt: safeIso(doc.createdAt).split('T')[0],
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    let doc = await DoctorModel.findById(id).populate('user');
    if (!doc && mongoose.isValidObjectId(id)) {
      doc = await DoctorModel.findOne({ user: id }).populate('user');
    }
    if (!doc) return notFound('Doctor not found');
    return ok(mapDoctorToFrontend(doc));
  } catch {
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object') return badRequest('Invalid request body');
    await connectDB();
    const doctor = await DoctorModel.findById(id).populate('user');
    if (!doctor) return notFound('Doctor not found');
    if (body.name || body.phone) {
      const userUpdates: any = {};
      if (body.name) userUpdates.name = body.name;
      if (body.phone) userUpdates.phone = body.phone;
      await UserModel.findByIdAndUpdate((doctor.user as any)._id, userUpdates);
    }
    const docUpdates: any = {};
    if (body.specialization || body.department) docUpdates.specialization = body.specialization || body.department;
    if (body.experience !== undefined) docUpdates.experience = body.experience;
    if (body.consultationFee !== undefined) docUpdates.consultationFee = body.consultationFee;
    if (body.bio !== undefined) docUpdates.bio = body.bio;
    const updatedDoc = await DoctorModel.findByIdAndUpdate(id, docUpdates, { new: true }).populate('user');
    if (!updatedDoc) return notFound('Doctor not found');
    return ok(mapDoctorToFrontend(updatedDoc), 'Doctor updated successfully');
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const doctor = await DoctorModel.findById(id);
    if (!doctor) return notFound('Doctor not found');
    await UserModel.findByIdAndDelete(doctor.user);
    await DoctorModel.findByIdAndDelete(id);
    return ok(null, 'Doctor deleted successfully');
  } catch {
    return serverError();
  }
}

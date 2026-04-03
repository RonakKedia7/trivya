/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConfig";
import AppointmentModel from "@/lib/models/Appointment";
import UserModel from "@/lib/models/User";
import DoctorModel from "@/lib/models/Doctor";
import PatientModel from "@/lib/models/Patient";
import {
  getUserFromRequest,
  hasPendingPasswordReset,
} from "@/lib/middleware/auth";
import { serverError, unauthorized } from "@/lib/utils/apiResponse";

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
function mapAppointmentToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    patientId:
      doc.patient?.user?._id?.toString() ||
      doc.patient?._id?.toString() ||
      doc.patient?.toString(),
    patientName: doc.patient?.user?.name || "Unknown Patient",
    doctorId:
      doc.doctor?.user?._id?.toString() ||
      doc.doctor?._id?.toString() ||
      doc.doctor?.toString(),
    doctorName: doc.doctor?.user?.name || "Unknown Doctor",
    department: doc.doctor?.specialization || "General",
    date: safeIso(doc.date).split("T")[0],
    time: doc.timeSlot,
    status: (doc.status || "").toString().toLowerCase(),
    reason: doc.type || "in-person",
    createdAt: safeIso(doc.createdAt),
  };
}

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id))
      return unauthorized("You must update your password before continuing");

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get("status") || undefined,
      date: searchParams.get("date") || undefined,
      doctorId: searchParams.get("doctorId") || undefined,
      patientId: searchParams.get("patientId") || undefined,
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    };

    await connectDB();
    const dbUser = await UserModel.findById(decoded.id);
    if (!dbUser) return unauthorized();
    const roleSpecificQuery: any = {};
    if (dbUser.role === "Doctor") {
      const doctor = await DoctorModel.findOne({ user: dbUser._id });
      if (doctor) roleSpecificQuery.doctor = doctor._id;
    } else if (dbUser.role === "Patient") {
      const patient = await PatientModel.findOne({ user: dbUser._id });
      if (patient) roleSpecificQuery.patient = patient._id;
    }
    const query: any = { ...roleSpecificQuery };
    if (filters.status) query.status = new RegExp(`^${filters.status}$`, "i");
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (filters.doctorId && mongoose.isValidObjectId(filters.doctorId))
      query.doctor = new mongoose.Types.ObjectId(filters.doctorId);
    if (filters.patientId && mongoose.isValidObjectId(filters.patientId))
      query.patient = new mongoose.Types.ObjectId(filters.patientId);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 100;
    const docs = await AppointmentModel.find(query)
      .populate({ path: "doctor", populate: { path: "user" } })
      .populate({ path: "patient", populate: { path: "user" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await AppointmentModel.countDocuments(query);
    return NextResponse.json(
      {
        success: true,
        data: docs.map(mapAppointmentToFrontend),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      { status: 200 },
    );
  } catch {
    return serverError();
  }
}

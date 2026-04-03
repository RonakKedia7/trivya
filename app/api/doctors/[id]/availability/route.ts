/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/dbConfig";
import DoctorModel from "@/lib/models/Doctor";
import {
  getUserFromRequest,
  hasPendingPasswordReset,
} from "@/lib/middleware/auth";
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/utils/apiResponse";

type TimeSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
function toMinutes(time: string): number | null {
  const match = String(time || "")
    .trim()
    .match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
function normalizeSchedule(raw: any) {
  if (typeof raw === "boolean") {
    if (raw)
      return WEEK_DAYS.map((day) => ({
        day,
        isWorking: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ].includes(day),
        slots: [],
      }));
    return WEEK_DAYS.map((day) => ({ day, isWorking: false, slots: [] }));
  }
  const incoming = Array.isArray(raw) ? raw : [];
  const byDay = new Map<string, any>();
  for (const item of incoming) {
    const day = WEEK_DAYS.find(
      (d) => d.toLowerCase() === String(item?.day || "").toLowerCase(),
    );
    if (!day) continue;
    const slots: TimeSlot[] = Array.isArray(item?.slots)
      ? item.slots
          .filter(
            (s: any) =>
              typeof s?.startTime === "string" &&
              typeof s?.endTime === "string",
          )
          .map((s: any) => ({
            startTime: s.startTime.trim(),
            endTime: s.endTime.trim(),
            isAvailable: Boolean(s.isAvailable),
          }))
      : [];

    slots.sort(
      (a: TimeSlot, b: TimeSlot) =>
        (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0),
    );
    byDay.set(day, { day, isWorking: Boolean(item?.isWorking), slots });
  }
  return WEEK_DAYS.map(
    (day) => byDay.get(day) ?? { day, isWorking: false, slots: [] },
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = getUserFromRequest(_req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id))
      return unauthorized("You must update your password before continuing");

    const { id } = await params;
    await connectDB();
    const doctor = await DoctorModel.findById(id).select("availability");
    const data = doctor ? normalizeSchedule(doctor.availability) : null;
    if (!data) return notFound("Doctor not found");
    return ok(data);
  } catch {
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id))
      return unauthorized("You must update your password before continuing");

    const { id } = await params;
    const body = await req.json();
    if (!body?.schedule) return badRequest("schedule is required");
    await connectDB();
    const normalizedSchedule = normalizeSchedule(body.schedule);
    for (const day of normalizedSchedule) {
      const ranges = day.slots
        .map((slot: any) => ({
          start: toMinutes(slot.startTime),
          end: toMinutes(slot.endTime),
        }))
        .filter((r: any) => r.start !== null && r.end !== null);
      for (let i = 0; i < ranges.length; i += 1) {
        if (ranges[i].start >= ranges[i].end)
          return badRequest(
            "Invalid availability payload or overlapping time slots",
          );
        for (let j = i + 1; j < ranges.length; j += 1) {
          const overlap =
            ranges[i].start < ranges[j].end && ranges[j].start < ranges[i].end;
          if (overlap)
            return badRequest(
              "Invalid availability payload or overlapping time slots",
            );
        }
      }
    }
    const updatedDoc = await DoctorModel.findByIdAndUpdate(
      id,
      { availability: normalizedSchedule },
      { new: true },
    ).select("availability");
    const updated = updatedDoc
      ? normalizeSchedule(updatedDoc.availability)
      : null;
    if (!updated)
      return badRequest(
        "Invalid availability payload or overlapping time slots",
      );
    return ok(updated, "Availability updated successfully");
  } catch {
    return serverError();
  }
}

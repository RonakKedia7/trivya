'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors } from '@/lib/mock-data';
import { WeeklySchedule, TimeSlot } from '@/lib/types';

const defaultTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export default function DoctorAvailabilityPage() {
  const { user } = useAuth();
  const currentDoctor = mockDoctors.find(d => d.email === user?.email) || mockDoctors[0];
  
  const [schedule, setSchedule] = useState<WeeklySchedule>(currentDoctor.availability);
  const [saved, setSaved] = useState(false);

  const toggleDayWorking = (dayIndex: number) => {
    const newSchedule = [...schedule];
    const day = newSchedule[dayIndex];
    day.isWorking = !day.isWorking;
    
    if (day.isWorking && day.slots.length === 0) {
      // Add default slots when enabling a day
      day.slots = defaultTimeSlots.reduce((acc, time, i) => {
        if (i % 2 === 0 && defaultTimeSlots[i + 1]) {
          acc.push({
            startTime: time,
            endTime: defaultTimeSlots[i + 1],
            isAvailable: true,
          });
        }
        return acc;
      }, [] as TimeSlot[]);
    }
    
    setSchedule(newSchedule);
  };

  const toggleSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex].isAvailable = 
      !newSchedule[dayIndex].slots[slotIndex].isAvailable;
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Availability</h1>
          <p className="text-muted-foreground">Set your working days and available time slots</p>
        </div>
        <button
          onClick={handleSave}
          className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-success"></span>
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-muted"></span>
          <span className="text-sm text-muted-foreground">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-destructive/30"></span>
          <span className="text-sm text-muted-foreground">Day Off</span>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Time Slots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedule.map((day, dayIndex) => (
                <tr key={day.day} className={!day.isWorking ? 'bg-destructive/5' : ''}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                    {day.day}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      onClick={() => toggleDayWorking(dayIndex)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        day.isWorking
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      }`}
                    >
                      {day.isWorking ? 'Working' : 'Day Off'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {day.isWorking ? (
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot, slotIndex) => (
                          <button
                            key={slotIndex}
                            onClick={() => toggleSlot(dayIndex, slotIndex)}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              slot.isAvailable
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No slots available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground">How to use</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Click on the status button to toggle between Working and Day Off</li>
          <li>Click on individual time slots to mark them as available or unavailable</li>
          <li>Green slots are available for booking, gray slots are blocked</li>
          <li>Remember to save your changes after making updates</li>
        </ul>
      </div>
    </div>
  );
}

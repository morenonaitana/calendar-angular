import { Appointment } from "./appointment.model";

// Define a model for calendar days
export interface CalendarDay {
    date: Date;
    isToday: boolean;
    appointments: Appointment[];  // Array to handle multiple appointments per day
  }
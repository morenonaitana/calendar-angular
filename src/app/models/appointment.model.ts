// app/models/appointment.model.ts
export interface Appointment {
    id: number;
    title: string;
    date: Date;
    time: string;
    description?: string;
  }
  
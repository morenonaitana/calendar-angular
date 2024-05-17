import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { CalendarDay } from '../models/calendar-day.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private _appointments: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);
  private _calendarDays = new BehaviorSubject<CalendarDay[]>([]);
  public readonly calendarDays$ = this._calendarDays.asObservable();
  private defaultsAdded = false; // Flag to check if defaults have been added

  get appointments(): Observable<Appointment[]> {
    return this._appointments.asObservable();
  }

  getAppointments(): Appointment[] {
    return this._appointments.value;
  }

  updateAppointments(days: CalendarDay[]): void {
    const updatedAppointments = days.reduce((acc: Appointment[], day: CalendarDay) => [...acc, ...day.appointments], [] as Appointment[]);
    this._appointments.next(updatedAppointments);
  }

  addAppointment(appointment: Appointment): void {
    const currentValue = this._appointments.value;
    const updatedValue = [...currentValue, appointment];
    this._appointments.next(updatedValue);
  }

  updateAppointment(updatedAppointment: Appointment): void {
    const currentValue = this._appointments.value;
    const updatedValue = currentValue.map(appointment =>
      appointment.id === updatedAppointment.id ? updatedAppointment : appointment
    );
    this._appointments.next(updatedValue);
  }

  deleteAppointment(id: number): void {
    const currentValue = this._appointments.value;
    const updatedValue = currentValue.filter(appointment => appointment.id !== id);
    this._appointments.next(updatedValue);
  }

  addDefaultAppointmentsIfEmpty(): void {
    if (!this.defaultsAdded && this._appointments.value.length === 0) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const defaultAppointments: Appointment[] = [
        {
          id: 1,
          title: 'Meeting with Bob',
          date: new Date(currentYear, currentMonth, 5),
          time: '10:00',
          description: 'Discuss the new project requirements.'
        },
        {
          id: 2,
          title: 'Lunch with Alice',
          date: new Date(currentYear, currentMonth, 12),
          time: '12:30',
          description: 'Catch up over lunch.'
        },
        {
          id: 3,
          title: 'Payever Interview',
          date: new Date(currentYear, currentMonth, 18),
          time: '15:00',
          description: 'Introduction call.'
        }
      ];

      const currentValue = this._appointments.value;
      const updatedValue = [...currentValue, ...defaultAppointments];
      this._appointments.next(updatedValue);
      this.defaultsAdded = true; // Set the flag to indicate defaults have been added
    }
  }
}

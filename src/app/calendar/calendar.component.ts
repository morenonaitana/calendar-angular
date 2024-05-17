import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';
import { CalendarDay } from '../models/calendar-day.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterLink,
    DragDropModule,
    CdkDropList,
    DatePipe,
    FormsModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  currentMonth!: string;
  currentYear!: number;
  currentDate!: Date;
  days: CalendarDay[] = [];
  dailyAppointments: Appointment[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  isDailyView = false;
  listIds!: string[];

  private readonly months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  constructor(private appointmentService: AppointmentService, private router: Router) {}

  drop(event: CdkDragDrop<Appointment[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedAppointment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const containerIndex = +event.container.id;
      if (!isNaN(containerIndex) && containerIndex >= 0 && containerIndex < this.days.length) {
        const newDate = this.days[containerIndex].date;
        movedAppointment.date = new Date(newDate);
        this.appointmentService.updateAppointment(movedAppointment);
      }
    }
    this.updateAppointmentsInService();
    this.updateDailyAppointments(); // Update daily appointments immediately
  }

  dropInDailyView(event: CdkDragDrop<Appointment[]>, hour: number): void {
    if (event.previousContainer === event.container) {
      console.log('same container')
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedAppointment = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the time of the moved appointment
      const newTime = `${hour.toString().padStart(2, '0')}:00`;
      movedAppointment.time = newTime;
      movedAppointment.date = this.currentDate; // Ensure the date is set to the current date in day view
      this.appointmentService.updateAppointment(movedAppointment);
    }

    // Update daily appointments immediately
    this.updateDailyAppointments();
  }

  ngOnInit(): void {
    this.initCalendar();
    this.appointmentService.addDefaultAppointmentsIfEmpty(); // Add default appointments if there are no existing ones
    this.listIds = this.days.map((_, index) => index.toString());
    this.appointmentService.appointments.subscribe(appointments => {
      this.assignAppointmentsToDays(appointments);
      this.updateDailyAppointments(); // Ensure daily appointments are updated
    });
  }

  initCalendar(): void {
    const currentDate = new Date();
    this.currentDate = currentDate;
    this.currentMonth = this.getMonthName(currentDate.getMonth());
    this.currentYear = currentDate.getFullYear();
    this.generateCalendarDays(currentDate);
    this.assignAppointmentsToDays(this.appointmentService.getAppointments());
  }

  generateCalendarDays(currentDate: Date): void {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.days = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      this.days.push({
        date: new Date(date),
        isToday: date.toDateString() === new Date().toDateString(),
        appointments: []
      });
    }
  }

  assignAppointmentsToDays(appointments: Appointment[]): void {
    this.days.forEach(day => {
      day.appointments = appointments
        .filter(appointment =>
          new Date(appointment.date).toDateString() === day.date.toDateString()
        )
        .sort((a, b) => this.compareTimes(a.time, b.time));
    });

    // Update daily appointments if in daily view
    if (this.isDailyView) {
      this.updateDailyAppointments();
    }
  }

  compareTimes(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    if (hours1 < hours2) return -1;
    if (hours1 > hours2) return 1;
    if (minutes1 < minutes2) return -1;
    if (minutes1 > minutes2) return 1;
    return 0;
  }

  updateAppointmentsInService(): void {
    this.appointmentService.updateAppointments(this.days);
  }

  getMonthName(month: number): string {
    return this.months[month];
  }

  getMonthIndex(monthName: string): number {
    return this.months.indexOf(monthName);
  }

  moveMonth(direction: number): void {
    const monthIndex = this.getMonthIndex(this.currentMonth);
    const newDate = new Date(this.currentYear, monthIndex + direction, 1);
    this.currentMonth = this.getMonthName(newDate.getMonth());
    this.currentYear = newDate.getFullYear();
    this.generateCalendarDays(newDate);
    this.assignAppointmentsToDays(this.appointmentService.getAppointments());
  }

  moveDay(direction: number): void {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + direction);
    this.currentDate = newDate;
    this.updateDailyAppointments();
  }

  updateDailyAppointments(): void {
    this.dailyAppointments = this.appointmentService
      .getAppointments()
      .filter(
        appointment =>
          new Date(appointment.date).toDateString() === this.currentDate.toDateString()
      )
      .sort((a, b) => this.compareTimes(a.time, b.time));
  }

  getAppointmentsForHour(hour: number): Appointment[] {
    return this.dailyAppointments.filter(appointment => {
      const [appointmentHour] = appointment.time.split(':').map(Number);
      return appointmentHour === hour;
    });
  }

  deleteAppointment(appointment: Appointment): void {
    this.appointmentService.deleteAppointment(appointment.id);
    this.updateAppointmentsInService();
    this.updateDailyAppointments();
  }

  openAddAppointment(date: Date): void {
    const currentTime = new Date();
    const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    this.router.navigate(['/add-appointment'], { queryParams: { date: date.toISOString(), time: timeString } });
  }
}

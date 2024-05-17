import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../models/appointment.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, FormsModule],
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit {
  title!: string;
  date!: Date;
  time!: string;
  description!: string;

  constructor(private appointmentService: AppointmentService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.date = new Date(params['date']);
      }
      if (params['time']) {
        this.time = params['time'];
      } else {
        const currentTime = new Date();
        this.time = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/calendar']);
  }

  addAppointment(): void {
    if (!this.title || !this.date || !this.time) {
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      title: this.title,
      date: this.date,
      time: this.time,
      description: this.description
    };
    this.appointmentService.addAppointment(newAppointment);
    this.router.navigate(['/calendar']);
  }
}

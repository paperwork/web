import { Component, OnInit } from '@angular/core';
import { EnvService } from './env/env.service';
import { UsersService } from './users/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Paperwork';

  constructor(public envService: EnvService, public usersService: UsersService) {}

  ngOnInit() {
  }
}

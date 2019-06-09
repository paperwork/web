import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { get } from 'lodash';

import { UsersService } from '../app/users/users.service';
import { AlertService } from '../app/partial-alert/alert.service';

@Injectable()
export class ApiAuthInterceptor implements HttpInterceptor {
  constructor(
    private usersService: UsersService,
    private alertService: AlertService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      switch(err.status) {
      case 401:
        this.usersService.logout();
        location.reload(true);
        return;
      default:
        return throwError(err);
      }
    }))
  }
}

@Injectable()
export class ApiJwtInterceptor implements HttpInterceptor {
  constructor(
    private usersService: UsersService,
    private alertService: AlertService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.usersService.isLoggedIn === true) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.usersService.accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private httpClient: HttpClient) {
  }

  register(email: string, password: string, name: object) {
    return this.httpClient
      .post<{content: { token:  string } }>('http://localhost:1337/login', {email, password, name})
      .pipe(tap(res => {
        localStorage.setItem('access_token', res.content.token);
      }));
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<{content: { token:  string } }>('http://localhost:1337/login', { email, password })
      .pipe(tap(res => {
        localStorage.setItem('access_token', res.content.token);
      }));
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  public get isLoggedIn(): boolean {
    return localStorage.getItem('access_token') !==  null;
  }
}

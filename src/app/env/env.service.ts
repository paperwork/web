import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { from } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
declare var window: any;

export type TEnvStatus = {
  initialized?: boolean;
  loggedIn?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  private _status: BehaviorSubject<TEnvStatus> = new BehaviorSubject({ 'initialized': false });
  public readonly status: Observable<TEnvStatus> = this._status.asObservable();

  private statusMap: TEnvStatus = {
    initialized: false,
    loggedIn: false
  }

  constructor() {
    this.init();
  }

  public setStatusOf(property: string, value: any) {
    if(this.statusMap.hasOwnProperty(property) === true) {
      this.statusMap[property] = value;
      this._status.next(this.statusMap);
    }
  }

  public async init() {
    await from(fetch('/.env.json')
      .then(function(response) {
        return response.json();
      }))
    .pipe(map((dotenv) => {
      window.dotenv = dotenv;
      return
    }))
    .toPromise();

    this.setStatusOf('initialized', true);
  }

  public get(key: string): string {
    if(window.hasOwnProperty('dotenv') && window.dotenv.hasOwnProperty(key) === true) {
      return window.dotenv[key];
    } else {
      return "";
    }
  }

  public gatewayUrl() {
    return this.get('apiGatewayProtocol') + '://' + this.get('apiGatewayHostPort');
  }

  public gatewayHostPort() {
    return this.get('apiGatewayProtocol');
  }
}

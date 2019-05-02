import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  constructor() {
    this.init();
  }

  public init() {
    return from(fetch('/.env.json')
      .then(function(response) {
        return response.json();
      }))
    .pipe(map((dotenv) => {
      window.dotenv = dotenv;
      return
    }))
    .toPromise();
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

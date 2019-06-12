import { Injectable } from '@angular/core';
import { Observable, of, empty, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import ObjectID from 'bson-objectid';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EnvService } from '../env/env.service';
import { accessToken, isLoggedIn } from '../../lib/token.helper';
import { paramsToQuery, mapContent } from '../../lib/api.helper';
import { CollectionService, ICollectionService } from '../../lib/collection.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends CollectionService<User> implements ICollectionService<User> {
  constructor(
    protected httpClient: HttpClient,
    protected envService: EnvService
  ) {
    super(
      httpClient,
      envService,
      () => {
        this.init({
          collectionName: 'users',
          apiUrl: `${this.envService.gatewayUrl()}/users`,
          entryInitializer: User
        });
        this.envService.pushToStatusOf('initializedCollections', 'users');
      }
    );
  }

  async onCollectionChange(change): Promise<boolean> {
    const changeType: string = change.type;
    const changedEntry: object|null = changeType === 'deleted' ? get(change, 'entry.previousValue', null) : get(change, 'entry.currentValue', null);
    const changedEntryId: string|null = get(changedEntry, 'id', null);

    if(changedEntryId === null) {
      console.log('ID for changed entry is NULL!');
      return false;
    }

    if(changeType === 'deleted') {
      this.memDbChangeEntry(changeType, changedEntryId, undefined);
    } else {
      this.memDbChangeEntry(changeType, changedEntryId, new User(changedEntry));
    }
    return true;
  }

  public async mergeToLocalDb(notes: List<User>): Promise<List<User>> {
    console.debug('mergeToLocalDb: NOT YET IMPLEMENTED');
    return List();
  }

  register(email: string, password: string, name: object) {
    return this.httpClient
      .post<{content: { token:  string } }>(`${this.envService.gatewayUrl()}/login`, {email, password, name})
      .pipe(tap(res => {
        localStorage.setItem('access_token', res.content.token);
      }));
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<{content: { token:  string } }>(`${this.envService.gatewayUrl()}/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem('access_token', res.content.token);
      }));
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  public get isLoggedIn(): boolean {
    return isLoggedIn();
  }

  public get accessToken(): string | null {
    return accessToken();
  }

}

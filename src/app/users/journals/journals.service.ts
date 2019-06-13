import { Injectable } from '@angular/core';
import { Observable, of, empty, BehaviorSubject, throwError, Subscription } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import ObjectID from 'bson-objectid';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { EnvService, TEnvStatus } from '../../env/env.service';
import { tokenGetDecoded, accessToken, isLoggedIn, Token } from '../../../lib/token.helper';
import { paramsToQuery, mapContent } from '../../../lib/api.helper';
import { CollectionService, ICollectionService } from '../../../lib/collection.service';
import { Journal } from './journal';

@Injectable({
  providedIn: 'root'
})
export class UsersJournalsService extends CollectionService<Journal> implements ICollectionService<Journal> {
  constructor(
    protected httpClient: HttpClient,
    protected envService: EnvService
  ) {
    super(
      httpClient,
      envService,
      () => {
        const token: Token|null = tokenGetDecoded();

        this.init({
          collectionName: 'users_journals',
          apiUrl: `${this.envService.gatewayUrl()}/users/${token.userId}/journals`,
          entryInitializer: Journal
        });
        this.envService.pushToStatusOf('initializedCollections', 'users_journals');
      }
    );
  }

  async onCollectionChange(change): Promise<boolean> {
    console.warn('Journals collection does not support changes!');
    return true;
  }

  public async mergeToLocalDb(notes: List<Journal>, source: string): Promise<List<Journal>> {
    console.debug('mergeToLocalDb: NOT YET IMPLEMENTED');
    return List();
  }

}

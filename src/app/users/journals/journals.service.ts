import { Injectable, OnInit } from '@angular/core';
import { Observable, of, empty, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { List } from 'immutable';
import { get } from 'lodash';
import { ObjectId } from '../../../lib/objectid.helper';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { EnvService } from '../../env/env.service';
import { tokenGetDecoded, accessToken, isLoggedIn, Token } from '../../../lib/token.helper';
import { getSyncId, setSyncId } from '../../../lib/sync.helper';
import { CollectionService, ICollectionService } from '../../../lib/collection.service';
import { Journal } from './journal';

@Injectable({
  providedIn: 'root'
})
export class UsersJournalsService extends CollectionService implements ICollectionService, OnInit {
  collectionName: string = 'users_journals';

  private _entries: BehaviorSubject<List<Journal>> = new BehaviorSubject(List([]));
  public readonly entries: Observable<List<Journal>> = this._entries.asObservable();

  constructor(
    private httpClient: HttpClient,
    private envService: EnvService
  ) {
    super();
    this.ngOnInit();
  }

  ngOnInit() {
    this.init();
    this.onCollectionInit();
  }

  async onCollectionInit(): Promise<boolean> {
    console.debug('Initializing users/journals.service ...');
    return true;
  }

  async onCollectionChange(change): Promise<boolean> {
    console.warn('Journals collection does not support changes!');
    return true;
  }

  public bulkChange(bulk: List<Journal>) {
    console.debug('Retrieved journals:');
    console.debug(bulk);
    this._entries.next(bulk);
    const newestJournalEntry: Journal|null = bulk.get(-1);

    if(newestJournalEntry !== null) {
      // console.debug('Setting syncId:', newestJournalEntry.id);
      // setSyncId(newestJournalEntry.id);
    } else {
      console.debug('No new entries, not setting syncId.');
    }
  }

  public listSnapshot(): List<Journal> {
    return this._entries.getValue();
  }

  public show(id: string): Observable<Journal> {
    return this.entries.pipe(
      map((journals: List<Journal>) => journals.find(journal => journal.id === id))
    );
  }

  apiList(params = {}) {
    const token: Token|null = tokenGetDecoded();

    if(isLoggedIn() === false || token === null) {
      console.debug('Not performing apiList since user is not logged in / token is null');
      return of(List());
    }

    const syncId: string = getSyncId();

    return this.httpClient
      .get<{content: Array<Journal> }>(
        `${this.envService.gatewayUrl()}/users/${token.userId}/journals?newer_than_id=${syncId}`,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken()
          })
        }
      )
      .pipe(
        map(res => {
          let itemsArray: Array<Journal> = [];

          if(Array.isArray(res.content) === true) {
            itemsArray = res.content.map((item: Object): Journal => {
              return new Journal(item);
            });
          } else {
            itemsArray.push(new Journal(res.content));
          }

          return List(itemsArray);
        }),
        catchError((err: HttpErrorResponse) => {
          switch(err.status) {
          case 404:
            console.debug('Retrieved 404 for journals, apparently there is nothing new!');
            return of(List());
          default:
            return throwError(err);
          }
        })
      );
  }

}

import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject,ReplaySubject, Subscription, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { forEach, omit, get, map } from 'lodash';
import { List, Record } from 'immutable';

import { ICollectionService } from '../../lib/collection.service';
import { EnvService, TEnvStatus } from '../env/env.service';
import { AlertService } from '../partial-alert/alert.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user';
import { UsersJournalsService } from '../users/journals/journals.service';
import { Journal } from '../users/journals/journal';
import { NotesService } from '../notes/notes.service';
import { Note } from '../notes/note';

import { getSyncId, setSyncId } from '../../lib/sync.helper';

export type TEntry = {
  id: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private envStatus: Subscription = null;
  private collectionSubscriptions: Array<Subscription> = [];

  private syncJournalsSubscription: Subscription;
  private _syncJournals = new ReplaySubject<List<Journal>>(1);
  public syncJournals: Observable<List<Journal>> = this._syncJournals.asObservable();

  public syncInProgess: Object = {
    'user': false,
    'note': false,
    'journal': false
  };

  constructor(
    private envService: EnvService,
    private alertService: AlertService,
    private usersService: UsersService,
    private usersJournalsService: UsersJournalsService,
    private notesService: NotesService
  ) {
    console.debug('Constructing SyncService ...');
    this.init();
  }

  init() {
    console.debug('Initializing SyncService ...');
    this.envStatus = this.envService.status.subscribe((status: TEnvStatus) => {
      console.debug('Retrieved EnvService status:', status);
      if(this.canSync(status, '') === true) {
        this.syncMandatory();
        this.triggerSync('note');
      }
    });

    this.syncJournalsSubscription = this.syncJournals.subscribe(async (newJournalEntries: List<Journal>): Promise<boolean> => {
      if(newJournalEntries.size > 0) {
        const checkEntry: Journal = newJournalEntries.get(0);
        return this.syncNewJournalEntries(checkEntry.resource, newJournalEntries);
      }
    });

    this.subscribeToCollectionService(this.usersService, User, 'user');
    this.subscribeToCollectionService(this.usersJournalsService, Journal, 'journal');
    this.subscribeToCollectionService(this.notesService, Note, 'note');

    // setInterval(() => {
    //   this.notesService.memDbToLocalDb();
    // }, 30000);
  }

  private subscribeToCollectionService<T>(collectionService: ICollectionService<T>, entryType, resource: string): boolean {
    console.debug('subscribeToCollectionService: Subscribing to collection', collectionService.collectionName, '...');
    const collectionSubscription: Subscription = collectionService.entriesPersisted.subscribe(async (entries: List<T>): Promise<boolean> => {
      if(this.canSync(this.envService.getStatus(), resource) === true) {
        const mergedNotes: List<T> = await collectionService.mergeToLocalDb(entries, 'memDb');
        console.debug('subscribeToCollectionService: Retrieved merged notes', mergedNotes);
        collectionService.memDbPersist(mergedNotes);
        return true;
      }

      return false;
    });

    this.collectionSubscriptions.push(collectionSubscription);
    return true;
  }

  ngOnDestroy() {
    this.unsubscribeCollectionSubscriptions();
    this.syncJournalsSubscription.unsubscribe();
    this.envStatus.unsubscribe();
  }

  private unsubscribeCollectionSubscriptions(): boolean {
    console.debug('Unsubscribing from all current subscriptions ...');
    forEach(this.collectionSubscriptions, (subscription: Subscription): boolean => {
      subscription.unsubscribe();
      return true;
    });

    return true;
  }

  public canSync(status: TEnvStatus, resource: string): boolean {
    if(typeof status === 'object'
    && status.initialized === true
    && status.loggedIn === true
    && status.domReady === true
    && status.initializedCollections.includes('users') === true
    && status.initializedCollections.includes('notes') === true
    && status.initializedCollections.includes('users_journals') === true) {
      if(resource === ''
      || (resource !== '' && this.syncInProgess[resource] !== true)) {
        console.debug('canSync: Everything good to go, can begin syncing!');
        return true;
      }
    }

    console.debug('canSync: Not ready for sync yet, waiting ...');
    return false;
  }

  public async triggerSync(resource: string): Promise<boolean> {
    console.debug('triggerSync: %s', resource);
    await this.triggerSyncJournals(resource);
    return true;
  }

  public async triggerSyncJournals(resource: string): Promise<boolean> {
    console.debug('triggerSyncJournals: %s', resource);
    return new Promise((fulfill, reject) => {
      const status: TEnvStatus = this.envService.getStatus();
      if(this.canSync(status, resource) === false) {
        return false;
      }

      this.syncInProgess[resource] = true;

      const syncId: string = getSyncId(resource);
      console.debug('triggerSyncJournals: Syncing UsersJournalsService with syncId %s for %s ...', syncId, resource);

      this.usersJournalsService.apiList({
        resource: resource,
        newer_than_id: syncId
      }, {
        authenticatedOnly: true
      }).subscribe(
        (newJournalEntries: List<Journal>) => {
          this.syncInProgess[resource] = false;

          if(newJournalEntries.size > 0) {
            console.debug('triggerSyncJournals: Found new journal entries, publishing ...');
            this._syncJournals.next(newJournalEntries);
          } else {
            console.debug('triggerSyncJournals: No new journal entries found, finishing sync.');
          }
          return fulfill(true);
        },
        (error) => {
          this.alertService.error(error.message);

          this.syncInProgess[resource] = false;
          return reject(false);
        }
      );
    });
  }

  private async syncMandatory(): Promise<boolean> {
    // ------------------------------------------------ Users ----------------------------------------------------------
    this.syncInProgess['user'] = true;
    try {
      console.debug('syncMandatory: Triggering syncUsers ...');
      await this.syncUsers();
      console.debug('syncMandatory: syncUsers finished successfully!');
    } catch(error) {
      console.error(error);
    }
    this.syncInProgess['user'] = false;

    return true;
  }

  private async syncNewJournalEntries(resource: string, newJournalEntries: List<Journal>): Promise<boolean> {
    console.debug('syncNewJournalEntries ...', newJournalEntries);

    if(this.canSync(this.envService.getStatus(), resource) === false) {
      console.debug('syncNewJournalEntries: Aborting sync');
      return false;
    }

    this.syncInProgess[resource] = true;

    // ----------------------------------------- Notes from Journal entries --------------------------------------------

    const allJournalEntryIds: List<string> = newJournalEntries.map((newJournalEntry: Journal): string => newJournalEntry.id);
    console.debug('syncNewJournalEntries: allJournalEntryIds', allJournalEntryIds);
    let syncedJournalEntryIds: List<string> = List();
    console.debug('syncNewJournalEntries: syncedJournalEntryIds', syncedJournalEntryIds);

    if(newJournalEntries.size > 0) {
      console.debug('syncNewJournalEntries: Got new journal entries! Checking ...');

      const noteIds: List<string> = newJournalEntries.map((newNoteJournalEntry: Journal): string => {
        console.debug('syncNewJournalEntries: Adding note ID %s to request ...', newNoteJournalEntry.resource_id);
        console.debug('syncNewJournalEntries:', newNoteJournalEntry);
        return newNoteJournalEntry.resource_id;
      });
      console.debug('syncNewJournalEntries: noteIds', noteIds);

      try {
        console.debug('syncNewJournalEntries: Triggering syncNotes ...');
        await this.syncNotes(noteIds);
        console.debug('syncNewJournalEntries: syncNotes finished successfully!');
      } catch(error) {
        console.error(error);
      }
    }

    // TODO: Intersect allJournalEntryIds with syncedJournalEntryIds and see which IDs did not sync
    const newestJournalEntry: Journal|null = newJournalEntries.get(-1);
    if(newestJournalEntry !== null) {
      console.debug('syncNewJournalEntries: Setting syncId:', newestJournalEntry.id);
      // setSyncId(resource, newestJournalEntry.id);
    }

    this.syncInProgess[resource] = false;
    return true;
  }

  private async syncUsers() {
    return new Promise((fulfill, reject) => {
      console.debug('syncUsers ...');
      this.usersService.apiList({
        }, {
          authenticatedOnly: true
        }).subscribe(async (users: List<User>) => {
          console.debug('syncUsers: users', users);

          if(users.size > 0) {
            console.debug('syncUsers: Retrieved users from API, syncing to LocalDb ...');
            const mergedUsers: List<User> = await this.usersService.mergeToLocalDb(users, 'api');
            console.debug('syncUsers: Retrieved merged notes', mergedUsers);
            this.usersService.memDbPersist(mergedUsers);
            return fulfill(mergedUsers);
          }

          console.debug('No new journal entries found, finishing sync.');
          return fulfill(List());
        },
        (error) => {
          return reject(error);
        }
      );
    });
  }

  private async syncNotes(noteIds: List<string>) {
    return new Promise((fulfill, reject) => {
      console.debug('syncNotes ...', noteIds.toJS());
      this.notesService.apiList({
          ids: noteIds.toJS()
        }, {
          authenticatedOnly: true
        }).subscribe(async (newNotes: List<Note>) => {
          console.debug('syncNotes: newNotes', newNotes);

          if(newNotes.size > 0) {
            console.debug('syncNotes: Retrieved notes from API, syncing to LocalDb ...');
            const mergedNotes: List<Note> = await this.notesService.mergeToLocalDb(newNotes, 'api');
            console.debug('syncNotes: Retrieved merged notes', mergedNotes);
            this.notesService.memDbPersist(mergedNotes);
            return fulfill(mergedNotes);
          }

          console.debug('No new journal entries found, finishing sync.');
          return fulfill(List());
        },
        (error) => {
          return reject(error);
        }
      );
    });
  }


}

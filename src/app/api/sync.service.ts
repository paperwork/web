import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
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

export type TPouchResponseRow = {
  doc: {
    _id: string;
    _rev: string;
    _attachments: Object;
    [key: string]: any;
  };
}

export type TPouchResponse = {
  offset: number;
  total_rows: number;
  rows: Array<TPouchResponseRow>;
};

@Injectable({
  providedIn: 'root'
})
export class SyncService implements OnInit, OnDestroy {
  envStatus: Subscription = null;
  collectionSubscriptions: Array<Subscription> = [];

  constructor(
    private envService: EnvService,
    private alertService: AlertService,
    private usersService: UsersService,
    private usersJournalsService: UsersJournalsService,
    private notesService: NotesService
  ) {
    console.debug('Constructing SyncService ...');
    this.ngOnInit();
  }

  ngOnInit() {
    console.debug('Initializing SyncService ...');
    this.envStatus = this.envService.status.subscribe((status: TEnvStatus) => {
      console.debug('Retrieved EnvService status:', status);
      if(this.canSync(status) === true) {
        // console.debug('apiLoad(usersService)');
        // this.apiLoad(this.usersService, User);

        // console.debug('apiLoad(usersJournalsService)');
        // this.apiLoad(this.usersJournalsService, Journal);

        // console.debug('apiLoad(notesService)');
        // this.apiLoad(this.notesService, Note);

        this.sync();
      }
    });

    this.subscribeToCollectionService(this.usersService, User);
    this.subscribeToCollectionService(this.usersJournalsService, Journal);
    this.subscribeToCollectionService(this.notesService, Note);
  }

  ngOnDestroy() {
    this.unsubscribeCollectionSubscriptions();
  }

  canSync(status: TEnvStatus): boolean {
    if(typeof status === 'object'
    && status.initialized === true
    && status.loggedIn === true
    && status.domReady === true) {
      return true;
    }

    return false;
  }

  public async sync(): Promise<boolean> {
    const status: TEnvStatus = this.envService.getStatus();
    if(this.canSync(status) === false) {
      return false;
    }

    console.debug('Syncing UsersJournalsService ...');
    await this.apiLoad(this.usersJournalsService, Journal, {}, null, null, async (collectionService: ICollectionService, newJournalEntries: List<Journal>) => {
      return this.syncJournalReflector(collectionService, newJournalEntries);
    });

    return true;
  }

  private async syncJournalReflector(collectionService: ICollectionService, newJournalEntries: List<Journal>) {
      console.debug('Checking currently available journal entries:', newJournalEntries);

      if(newJournalEntries.size > 0) {
        console.debug('Got new journal entries! Checking ...');

        const newJournalNoteEntries: List<Journal> = newJournalEntries.filter((journalEntry: Journal) => journalEntry.resource === 'note');
        if(newJournalNoteEntries.size > 0) {
          console.debug('Got new journal entries for notes! Checking ...');

          const promises: List<Promise<any>> = newJournalNoteEntries.map(async (newJournalNoteEntry: Journal) => {
            console.debug('Requesting note', newJournalNoteEntry.resource_id);

            await this.apiLoad(this.notesService, Note, { id: newJournalNoteEntry.resource_id }, null, async (collectionService: ICollectionService, existingEntries: List<Note>, newEntries: List<Note>) => {
              return this.syncNoteMerger(collectionService, existingEntries, newEntries);
            }, null);

            setSyncId(newJournalNoteEntry.id);
          });

          await Promise.all(promises);
          console.debug('Updated all notes!');
        }
      }
  }

  private async syncNoteMerger(collectionService: ICollectionService, existingEntries: List<Note>, newEntries: List<Note>) {

  }

  private subscribeToCollectionService(collectionService: ICollectionService, entryType, perEntryCallback: Function|null = null, reflectCallback: Function|null = null): boolean {
    console.debug('Subscribing to collection', collectionService.collectionName, '...');
    const collectionSubscription: Subscription = collectionService.entriesPersisted.subscribe(async (entries: List<any>): Promise<boolean> => {
      return this.collectionServiceProcessEntries(collectionService, entryType, entries, perEntryCallback, reflectCallback);
    });

    this.collectionSubscriptions.push(collectionSubscription);
    return true;
  }

  private async collectionServiceProcessEntries(collectionService: ICollectionService, entryType, entries: List<any>, entriesMerger: Function|null = null, perEntryCallback: Function|null = null, reflectCallback: Function|null = null): Promise<boolean> {
    const collectionName: string = collectionService.collectionName;
    const db: any = collectionService.db;

    if(entries.size === 0) {
      console.debug('Nothing to persist to local database.');
      return true;
    }

    const existingEntries: List<any> = await this.collectionServiceLoadExistingEntries(collectionService, entryType);
    let mergedEntries: List<any> = List();

    console.debug('Merging new values:', entries);
    console.debug('Merging with existing values:', existingEntries);
    if(entriesMerger === null) {
      console.debug('Using regular merger ...');
      mergedEntries = existingEntries.concat(entries);
    } else {
      console.debug('Using custom merger ...');
      mergedEntries = await entriesMerger(collectionService, existingEntries, entries);
    }

    try {
      console.debug('Persisting changes to local database ...', mergedEntries);
      const mergedEntriesJs: Array<TEntry> = mergedEntries.toJS();
      console.debug('Got original data:');
      console.debug(mergedEntriesJs);
      const mergedEntriesRows: Array<Object> = this.rowsFromEntries(mergedEntriesJs);
      console.debug('Transformed original data:');
      console.debug(mergedEntriesRows);
      // const dbret = await db.bulkDocs(mergedEntriesRows);
      // console.debug(dbret);

      const newEntriesPromises: List<Promise<any>> = mergedEntries.map(async (entry: any) => {
        const entryId = entry.id;
        // const dbretEntry = dbret.find((retEntry) => (retEntry.ok === true && retEntry.id === entryId));
        let dbretEntry;
        const newEntry: any = entry.set('_rev', get(dbretEntry, 'rev', undefined));

        if(perEntryCallback !== null) {
          console.debug('Calling per entry callback ...');
          return perEntryCallback(collectionService, newEntry);
        }

        return newEntry;
      });

      const newEntriesArray: Array<any> = await Promise.all(newEntriesPromises.values());
      const newEntries: List<any> = List(newEntriesArray);

      if(reflectCallback === null) {
        console.debug('Using regular reflect callback ...');
        await this.collectionServiceReflectChanges(collectionService, newEntries);
      } else {
        console.debug('Using custom reflect callback ...');
        await reflectCallback(collectionService, newEntries);
      }
    } catch(err) {
      console.error('Could not persist changes to local database:');
      console.error(err);
    }

    return true;
  }

  private async collectionServiceReflectChanges(collectionService: ICollectionService, entries: List<any>): Promise<boolean> {
    console.debug('Propagating:', entries);
    await collectionService.bulkChange(entries);
    return true;
  }

  private unsubscribeCollectionSubscriptions(): boolean {
    console.debug('Unsubscribing from all current subscriptions ...');
    forEach(this.collectionSubscriptions, (subscription: Subscription): boolean => {
      subscription.unsubscribe();
      return true;
    });

    this.envStatus.unsubscribe();

    return true;
  }

  async collectionServiceLoadExistingEntries(collectionService: ICollectionService, entryType): Promise<List<TEntry>> {
    console.debug('collectionServiceLoadExistingEntries ...');
    const allDocs: TPouchResponse = await collectionService.collection.allDocs({include_docs: true});

    console.debug('All existing documents:', allDocs);

    const entries: Array<TEntry> = map(allDocs.rows, (row: TPouchResponseRow) => {
      const entry = omit(row.doc, ['_id']);
      entry.id = row.doc._id;
      console.debug('Loading the following row:');
      console.debug(entry);
      return new entryType(entry);
    });

    console.debug('Converted existing documents:', entries);

    return List(entries);
  }

  private rowFromEntry(entry: TEntry): Object {
    const row = omit(entry, ['id']);
    row._id = entry.id;

    return row;
  }

  private rowsFromEntries(entries: Array<TEntry>): Array<Object> {
    return entries.map((entry: TEntry) => {
      return this.rowFromEntry(entry);
    });
  }

  private async apiLoad(collectionService: ICollectionService, entryType, params = {}, entriesMerger: Function|null = null, perEntryCallback: Function|null = null, reflectCallback: Function|null = null) {
    return collectionService.apiList(params)
      .subscribe(
        (entries: List<Record<TEntry>>) => {
          if(entries.size > 0) {
            this.collectionServiceProcessEntries(collectionService, entryType, entries, entriesMerger, perEntryCallback, reflectCallback);
          }
        },
        (error) => {
          this.alertService.error(error.message);
        }
      );
  }

}

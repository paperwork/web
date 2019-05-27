import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import { EnvService } from './env/env.service';
import { SyncService } from './api/sync.service';
import { Subscription } from 'rxjs';
import { List } from 'immutable';
import { get, forEach } from 'lodash';

export class DatabaseCollections {
  [key: string]: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Paperwork';
  // collectionSubscriptions: Array<Subscription> = [];

  constructor(
    public envService: EnvService,
    public syncService: SyncService
  ) {
  }

  ngOnInit() {
    // this.initializeDatabase();
  }

  ngOnDestroy() {
    // this.unsubscribeCollectionSubscriptions();
  }

  // private async initializeDatabase(): Promise<boolean> {
  //   const collectionServices: Array<ICollectionService> = this.getCollectionServices();
  //   return this.initializeCollectionServices(collectionServices);
  // }

  // private async observeDatabase(collectionService: ICollectionService): Promise<ICollectionService> {
  //   if(collectionService.constructor.prototype.hasOwnProperty('onCollectionChange')) {

  //     collectionService.db.changes({
  //       since: 'now',
  //       live: true,
  //       include_docs: true
  //     }).on('change', async (change) => {
  //         await collectionService.onCollectionChange({
  //           revision: change.doc._rev | 0,
  //           type: change.deleted === true ? 'deleted' : 'upserted',
  //           entry: {
  //             currentValue: get(change, 'doc', null), // TODO: Run through transformation-wrapper in order to convert _id, etc.
  //             // previousValue: get(change, 'oldObj', null),
  //             alteredProperties: get(change, 'changes', null)
  //           }
  //         });
  //     });

  //   }

  //   return collectionService;
  // }

  // private async initializeCollectionServices(collectionServices: Array<ICollectionService>): Promise<boolean> {

  //   const initializerPromises: Array<Promise<boolean>> = collectionServices.map((collectionService: ICollectionService) => {
  //     return this.initializeCollectionService(collectionService);
  //   });

  //   const initializerResults: Array<boolean> = await Promise.all(initializerPromises);
  //   console.debug('Initializers finished with the following results:');
  //   console.debug(initializerResults);

  //   console.debug('Running subscriptions:');
  //   console.debug(this.collectionSubscriptions);

  //   return true;
  // }

  // private async initializeCollectionService(collectionService: ICollectionService): Promise<boolean> {
  //   if(collectionService.hasOwnProperty('collectionName')) {
  //     collectionService.db = new PouchDB(collectionService.collectionName);

  //     let success: boolean = true;
  //     if(collectionService.constructor.prototype.hasOwnProperty('onCollectionInit')) {
  //       try {
  //         success = await collectionService.onCollectionInit();
  //       } catch(err) {
  //         console.error(err);
  //         return false;
  //       }
  //     }

  //     if(success === true) {
  //       success = this.subscribeToCollectionService(collectionService);
  //     }

  //     return success;
  //   }

  //   return false;
  // }


  // private subscribeToCollectionService(collectionService: ICollectionService): boolean {
  //   console.debug('Subscribing to collection', collectionService.collectionName, '...');
  //   const collectionSubscription: Subscription = collectionService.entries.subscribe(async (entries: List<any>): Promise<boolean> => {
  //     const collectionName: string = collectionService.collectionName;
  //     const db: any = collectionService.db;

  //     if(entries.size === 0) {
  //       console.debug('Nothing to persist to local database.');
  //       return true;
  //     }

  //     // TODO: Run through db, compare with entries and see, which db entries were deleted in entires, hence require deletion.
  //     try {
  //       console.debug('Persisting changes to local database ...');
  //       await db.bulkDocs(entries);
  //     } catch(err) {
  //       console.error('Could not persist changes to local database:');
  //       console.error(err);
  //     }

  //     return true;
  //   });

  //   this.collectionSubscriptions.push(collectionSubscription);
  //   return true;
  // }

  // private unsubscribeCollectionSubscriptions(): boolean {
  //   console.debug('Unsubscribing from all current subscriptions ...');
  //   forEach(this.collectionSubscriptions, (subscription: Subscription): boolean => {
  //     subscription.unsubscribe();
  //     return true;
  //   });

  //   return true;
  // }

  // private getCollectionServices(): Array<ICollectionService> {
  //   return this.injector.get(ITCollectionService);
  // }

  // private getCollectionService(name: string): ICollectionService|null {
  //   const collectionService: ICollectionService|undefined = this.getCollectionServices().find(collectionService => collectionService.collectionName === name);

  //   if(typeof collectionService === 'undefined') {
  //     return null;
  //   }

  //   return collectionService;
  // }
}

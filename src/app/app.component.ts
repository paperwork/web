import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import { EnvService } from './env/env.service';
import { ITCollectionService, ICollectionService } from '../lib/collection.service';
import { Subscription } from 'rxjs';
import { List } from 'immutable';
import { get, forEach } from 'lodash';
import Dexie from 'dexie';
import 'dexie-observable';

export class DexieStores {
  [key: string]: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Paperwork';
  collectionChangeTypes = [
    'null',
    'created',
    'updated',
    'deleted'
  ];
  collectionSubscriptions: Array<Subscription> = [];

  constructor(
    private injector: Injector,
    public envService: EnvService
  ) {
  }

  ngOnInit() {
    this.initializeDatabase();
  }

  ngOnDestroy() {
    this.unsubscribeCollectionSubscriptions();
  }

  private async initializeDatabase(): Promise<boolean> {
    const collectionServices: Array<ICollectionService> = this.getCollectionServices();
    const stores: DexieStores = this.getStores(collectionServices);

    const db: Dexie|null = await this.openDatabase(1, stores);

    if(db === null) {
      return false;
    }

    return this.initializeCollectionServices(collectionServices, db);
  }

  private async openDatabase(version: number, stores: DexieStores): Promise<Dexie|null> {
    let db: Dexie = new Dexie(environment.database.name, { autoOpen: false });

    console.debug(`Trying to open local database "${environment.database.name}" with version ${version} and the following stores:`);
    console.debug(stores);
    db.version(version).stores(stores);

    try {
      console.debug('Opening local database ...');
      await db.open();

      console.debug('Adding observer to local database ...');
      db = await this.observeDatabase(db);

      return db;
    } catch(err) {
      console.error('Could not open local database:');
      console.error(err);

      console.debug('Will delete the local database now.');
      Dexie.delete(environment.database.name);

      return null;
    }

    return db;
  }

  private async observeDatabase(db: Dexie): Promise<Dexie> {
    db.on('changes', async (changes) => {
      changes.forEach(async (change) => {
        const collectionService: ICollectionService = this.getCollectionService(change.table);

        if(collectionService.constructor.prototype.hasOwnProperty('onCollectionChange')) {
          await collectionService.onCollectionChange({
            // revision: change.rev | 0,
            type: this.collectionChangeTypes[change.type],
            entry: {
              currentValue: get(change, 'obj', null),
              previousValue: get(change, 'oldObj', null),
              alteredProperties: get(change, 'mods', null)
            }
          });
        }
      });
    });

    return db;
  }

  private async initializeCollectionServices(collectionServices: Array<ICollectionService>, db: Dexie): Promise<boolean> {
    let successful: boolean = true;

    collectionServices.forEach(async (collectionService: ICollectionService) => {
      collectionService.db = db;

      if(collectionService.constructor.prototype.hasOwnProperty('onCollectionInit')) {
        try {
          const success: boolean = await collectionService.onCollectionInit();

          if(successful === true) {
            successful = success;
          }
        } catch(err) {
          console.error(err);

          successful = false;
        }
      }
    });

    return successful;
  }

  private subscribeToCollectionService(collectionService: ICollectionService): boolean {
    const collectionSubscription: Subscription = collectionService.entries.subscribe(async (entries: List<any>): Promise<boolean> => {
      const collectionName: string = collectionService.collectionName;
      const db: Dexie = collectionService.db;

      try {
        console.debug('Persisting changes to local database ...');
        db[collectionName].bulkPut(entries);
      } catch(err) {
        console.error('Could not persist changes to local database:');
        console.error(err);
      }

      return true;
    });

    this.collectionSubscriptions.push(collectionSubscription);
    return true;
  }

  private unsubscribeCollectionSubscriptions(): boolean {
    forEach(this.collectionSubscriptions, (subscription: Subscription): boolean => {
      subscription.unsubscribe();
      return true;
    });

    return true;
  }

  private getStores(collectionServices: Array<ICollectionService>): DexieStores {
    return collectionServices.reduce((storeMap: DexieStores, collectionService: ICollectionService) => {
      if(collectionService.hasOwnProperty('collectionName')
      && collectionService.hasOwnProperty('index')) {
        storeMap[collectionService.collectionName] = collectionService.index;
      }
      return storeMap;
    }, {});
  }

  private getCollectionServices(): Array<ICollectionService> {
    return this.injector.get(ITCollectionService);
  }

  private getCollectionService(name: string): ICollectionService|null {
    const collectionService: ICollectionService|undefined = this.getCollectionServices().find(collectionService => collectionService.collectionName === name);

    if(typeof collectionService === 'undefined') {
      return null;
    }

    return collectionService;
  }
}

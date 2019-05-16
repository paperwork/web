import { Component, Injector, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { EnvService } from './env/env.service';
import { ITCollectionService, ICollectionService } from '../lib/collection.service';
import { get } from 'lodash';
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
export class AppComponent implements OnInit {
  title = 'Paperwork';
  collectionChangeTypes = [
    'null',
    'created',
    'updated',
    'deleted'
  ];

  constructor(
    private injector: Injector,
    public envService: EnvService
  ) {
    this.initializeDatabase();
  }

  ngOnInit() {
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

  private async observeDatabase(db: Dexie): Promise<Dexie> {
    // db.on('changes', async (changes) => {
    //   changes.forEach(async (change) => {
    //     const collectionService: ICollectionService = this.getCollectionService(change.table);

    //     if(collectionService.constructor.prototype.hasOwnProperty('onCollectionChange')) {
    //       await collectionService.onCollectionChange({
    //         revision: change.rev | 0,
    //         type: this.collectionChangeTypes[change.type],
    //         entry: {
    //           currentValue: get(change, 'obj', null),
    //           previousValue: get(change, 'oldObj', null),
    //           alteredProperties: get(change, 'mods', null)
    //         }
    //       });
    //     }
    //   });
    // });

    return db;
  }

  private async openDatabase(version: number, stores: DexieStores): Promise<Dexie|null> {
    let db = new Dexie(environment.database.name);
    db.version(version).stores(stores);
    db = await this.observeDatabase(db);

    try {
      await db.open();

      return db;
    } catch(err) {
      console.error(err);

      return null;
    }
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

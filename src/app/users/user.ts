import { List, Record } from 'immutable';
import { merge } from 'lodash';

export interface IUser {
  id: string;
  created_at?: Date;
  deleted_at?: Date;
}

const UserRecord = Record({
  id: '',
  created_at: new Date(),
  deleted_at: null
});

export class User extends UserRecord implements IUser {
  constructor(properties) {
      super(properties);
  }
}

import { List, Record } from 'immutable';
import { merge } from 'lodash';

export interface IUser {
  id: string;
  gid: string;
  email: string;
  name: {
    first_name: string;
    last_name: string;
  };
  profile_photo: string;
  role: string;
  created_at?: Date;
  deleted_at?: Date;
}

const UserRecord = Record({
  id: '',
  gid: '',
  email: '',
  name: {
    first_name: '',
    last_name: '',
  },
  profile_photo: '',
  role: '',
  created_at: new Date(),
  deleted_at: null
});

export class User extends UserRecord implements IUser {
  constructor(properties) {
      super(properties);
  }
}

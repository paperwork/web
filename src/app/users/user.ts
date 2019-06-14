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
  _rev?: string;
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
  deleted_at: null,
  _rev: undefined
});

export class User extends UserRecord implements IUser {
  constructor(properties) {
      super(properties);
  }

  getProfilePhotoPath(gatewayUrl: string): string {
    if(this.profile_photo !== null
    && this.profile_photo !== '') {
      return `${gatewayUrl}/profile_photos/${this.profile_photo}`;
    }

    return '/assets/images/avatar-default.png';
  }
}

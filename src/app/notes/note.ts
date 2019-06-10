import { List, Record } from 'immutable';
import { merge } from 'lodash';

export type TNoteAccessUser = {
  user?: {
    email: string;
    name: {
      first_name: string;
      last_name: string;
    }
  }
}

export type TNoteAccessPermissions = {
  can_leave: boolean;
  can_read: boolean;
  can_share: boolean;
  can_write: boolean;
  can_change_permissions: boolean;
}

export type TNoteAccess = TNoteAccessUser & TNoteAccessPermissions

export interface INote {
  id: string;
  version?: string;
  title?: string;
  body?: string;
  attachments?: Array<string>;
  tags?: Array<string>;
  meta?: {
    [key: string]: any
  };
  access?: {
    [userGid: string]: TNoteAccessPermissions
  }
  path?: string;
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  _original?: Note;
  _rev?: string;
  _api?: {
    must_create?: boolean;
    must_update?: boolean;
  };
}

export const NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER: TNoteAccessPermissions = {
  can_leave: false,
  can_read: true,
  can_share: true,
  can_write: true,
  can_change_permissions: true,
};

const NoteRecord = Record({
  id: '',
  version: undefined,
  title: '',
  body: '',
  attachments: [],
  tags: [],
  meta: {
    'mimeType': 'text/markdown'
  },
  access: {},
  path: '',
  created_by: '',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
  _original: undefined,
  _rev: undefined,
  _api: undefined,
});

export class Note extends NoteRecord implements INote {
  constructor(properties) {
      super(properties);
  }

  addAccess(gid: string, permissions: TNoteAccessPermissions, user: TNoteAccessUser): this {
    const access: TNoteAccess = merge(permissions, user);
    const currentAccess: object = this.get('access');

    if(Object.keys(currentAccess).length === 0) {
      return this.set('created_by', gid).setIn(['access', gid], access)
    }

    return this.setIn(['access', gid], access);
  }
}

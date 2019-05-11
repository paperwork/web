import { List, Record } from 'immutable';

type TNoteAccessPermissions = {
    can_leave: boolean;
    can_read: boolean;
    can_share: boolean;
    can_write: boolean;
  }

interface INote {
  id: string;
  title: string;
  body: string;
  attachments: Array<string>;
  tags: Array<string>;
  meta: {
    [key: string]: any
  };
  access: {
    [userGid: string]: TNoteAccessPermissions
  }
  path: string;
  created_by: string;
  created_at: Date;
}

export const NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER: TNoteAccessPermissions = {
  can_leave: false,
  can_read: true,
  can_share: true,
  can_write: true
};

const NoteRecord = Record({
  id: '',
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
  created_at: new Date()
});

export class Note extends NoteRecord implements INote {
  constructor(properties) {
      super(properties);
  }

  addAccess(gid: string, permissions: TNoteAccessPermissions): this {
    const currentAccess: object = this.get('access');

    if(Object.keys(currentAccess).length === 0) {
      return this.set('created_by', gid).setIn(['access', gid], permissions)
    }

    return this.setIn(['access', gid], permissions);
  }
}

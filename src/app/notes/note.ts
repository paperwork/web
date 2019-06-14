import { List, Record } from 'immutable';
import { merge, get } from 'lodash';
import DiffMatchPatch from 'diff-match-patch';

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

export const NOTE_ACCESS_PERMISSIONS_DEFAULT_OWNER: TNoteAccessPermissions = {
  can_leave: false,
  can_read: true,
  can_share: true,
  can_write: true,
  can_change_permissions: true,
};

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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  _rev?: string;
  $_original?: Note;
  $_api?: {
    must_create?: boolean;
    must_update?: boolean;
  };
}

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
  created_at: (new Date()).toISOString(),
  updated_at: (new Date()).toISOString(),
  deleted_at: undefined,
  _rev: undefined,
  $_original: undefined,
  $_api: undefined,
});

export class Note extends NoteRecord implements INote {
  constructor(properties) {
      super(properties);
  }

  public addAccess(gid: string, permissions: TNoteAccessPermissions, user: TNoteAccessUser): this {
    const access: TNoteAccess = merge(permissions, user);
    const currentAccess: object = this.get('access');

    if(Object.keys(currentAccess).length === 0) {
      return this.set('created_by', gid).setIn(['access', gid], access)
    }

    return this.setIn(['access', gid], access);
  }

  public set$_api(source: string, was_created: boolean): this {
    switch(source) {
    case 'memDb':
      return this.merge({
        '$_api': {
          'must_create': was_created,
          'must_update': !was_created
        }
      });
    case 'api':
      return this.merge({
        '$_api': {
          'must_create': false,
          'must_update': false
        }
      });
    default:
      return this;
    break;
    }

    return this;
  }

  public mergeWithNote(withNote: Note): Note {
    const dmp = new DiffMatchPatch();

    console.debug('mergeWithNote: Merging this', this.toJS());
    console.debug('mergeWithNote: with Note', withNote.toJS());

    const originalNote: Note|null = get(this, '$_original', get(withNote, '$_original', null));

    let diffAgainstNote: Note;

    if(originalNote === null) {
      console.warn('mergeWithNote: No _original included, will diff against new note.');
      diffAgainstNote = withNote;
    } else {
       diffAgainstNote = originalNote;
    }

    const mergedNote: Note = List(['title', 'body', 'attachments', 'tags', 'path']).reduce((note: Note, prop: string): Note => {
      let diffAgainstNotePropVal: string;
      let thisPropVal: string;
      let withNotePropVal: string;

      if(typeof withNote[prop] === 'object'
      && Array.isArray(withNote[prop]) === true) {
        diffAgainstNotePropVal = diffAgainstNote[prop].join('≠');
        thisPropVal = this[prop].join('≠');
        withNotePropVal = withNote[prop].join('≠');
      } else if(typeof withNote[prop] === 'string') {
        diffAgainstNotePropVal = diffAgainstNote[prop];
        thisPropVal = this[prop];
        withNotePropVal = withNote[prop];
      } else {
        console.warn('mergeWithNote: Dealing with an unknown property type, will not do anything and simply return the (new) note for this property ...');
        return note;
      }

      console.debug('mergeWithNote: diffAgainstNotePropVal', diffAgainstNotePropVal);
      console.debug('mergeWithNote: thisPropVal', thisPropVal);
      console.debug('mergeWithNote: withNotePropVal', withNotePropVal);

      let diff = dmp.diff_main(diffAgainstNotePropVal, thisPropVal, true);
      dmp.diff_cleanupSemantic(diff);
      let patch_list = dmp.patch_make(diffAgainstNotePropVal, thisPropVal, diff);

      console.debug('mergeWithNote: patch', patch_list);

      let [newPropValue, lineByLineStatus] = dmp.patch_apply(patch_list, withNotePropVal);

      if(typeof withNote[prop] === 'object'
      && Array.isArray(withNote[prop]) === true) {
        return note.merge({
          [prop]: newPropValue.split('≠')
        });
      } else if(typeof withNote[prop] === 'string') {
        return note.merge({
          [prop]: newPropValue
        });
      }
    }, withNote);

    return mergedNote;
  }

}

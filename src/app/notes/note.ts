export class Note {
  id: string;
  title: string;
  body: string;
  attachments: Array<string>;
  tags: Array<string>;
  meta: object;
  access: {
    [userGid: string]: {
      can_leave: boolean,
      can_read: boolean,
      can_share: boolean,
      can_write: boolean
    }
  }
  path: string;
  created_by: string;
  created_at: Date;
}

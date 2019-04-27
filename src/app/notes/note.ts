export class Note {
  id: string;
  title: string;
  body: string;
  attachments: Array<string>;
  tags: Array<string>;
  meta: object;
  path: string;
  created_by: string;
  created_at: Date;
}

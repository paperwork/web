export class Notification {
  id: string;
  body: string;
  icons: Array<{
    type: string,
    uri: string
  }>;
  created_at: Date;
}

import { Note } from './note';

export const MockNotes: Array<Note> = [
  {
    id: "5cc477b02bb6216ea7dcbaeb",
    title: "A test note",
    body: "This is the note's body",
    attachments: ["id01"],
    tags: ["yolo"],
    meta: {
      mimetype: "md"
    },
    path: "my folder/my subfolder",
    created_at: new Date("2019-04-27T15:40:09.028Z"),
    created_by: "5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37"
  },
  {
    id: "5cc477b02bb6216ea7dcebba",
    title: "Another test note",
    body: "This is the note's body",
    attachments: ["id02"],
    tags: ["yolo"],
    meta: {
      mimetype: "md"
    },
    path: "my folder/my subfolder",
    created_at: new Date("2019-04-27T15:40:09.028Z"),
    created_by: "5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37"
  }
]

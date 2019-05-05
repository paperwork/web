import { Note } from './note';

export const MockNotes: Array<Note> = [
  {
    id: "5cc477b02bb6216ea7dcbaeb",
    title: "A test note",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.",
    attachments: ["id01"],
    tags: ["yolo"],
    meta: {
      mimetype: "md"
    },
    access: {
      '5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37': {
        can_leave: false,
        can_read: true,
        can_share: true,
        can_write: true
      }
    },
    path: "my folder/my subfolder",
    created_at: new Date("2019-04-27T15:40:09.028Z"),
    created_by: "5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37"
  },
  {
    id: "5cc477b02bdcbb6216ea7aeb",
    title: "A second test note",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.",
    attachments: ["id01", "id01"],
    tags: ["cool", "hot", "cute", "igdaily"],
    meta: {
      mimetype: "md"
    },
    access: {
      '5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37': {
        can_leave: false,
        can_read: true,
        can_share: true,
        can_write: true
      }
    },
    path: "my folder/my second subfolder",
    created_at: new Date("2019-04-27T15:40:09.028Z"),
    created_by: "5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37"
  },
  {
    id: "5cc477b02bb6216ea7dcebba",
    title: "Another test note",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    attachments: ["id02"],
    tags: ["yolo"],
    meta: {
      mimetype: "md"
    },
    access: {
      '5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37': {
        can_leave: false,
        can_read: true,
        can_share: true,
        can_write: true
      }
    },
    path: "my folder/my subfolder",
    created_at: new Date("2019-04-27T15:40:09.028Z"),
    created_by: "5cc477a52bb6216e7b352b4e@f6849bf4-261a-4a4f-bd71-87134d334c37"
  }
]

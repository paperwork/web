import { Buffer } from 'buffer/';

// This code was mostly copy & pasted from https://github.com/mongodb/js-bson/blob/master/lib/objectid.js

const PROCESS_UNIQUE = window.crypto.getRandomValues(new Uint8Array(5));;

export class ObjectId {
  id: Buffer;

  static index: number = ~~(Math.random() * 0xffffff);

  constructor() {
    this.id = ObjectId.generate();
  }

  static getInc() {
    return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
  }

  static generate() {
    const time = ~~(Date.now() / 1000);
    const inc = ObjectId.getInc();
    const buffer = Buffer.alloc(12);

    // 4-byte timestamp
    buffer[3] = time & 0xff;
    buffer[2] = (time >> 8) & 0xff;
    buffer[1] = (time >> 16) & 0xff;
    buffer[0] = (time >> 24) & 0xff;

    // 5-byte process unique
    buffer[4] = PROCESS_UNIQUE[0];
    buffer[5] = PROCESS_UNIQUE[1];
    buffer[6] = PROCESS_UNIQUE[2];
    buffer[7] = PROCESS_UNIQUE[3];
    buffer[8] = PROCESS_UNIQUE[4];

    // 3-byte counter
    buffer[11] = inc & 0xff;
    buffer[10] = (inc >> 8) & 0xff;
    buffer[9] = (inc >> 16) & 0xff;

    return buffer;
  }

  toString(format?: string) {
    return this.id.toString(typeof format === 'string' ? format : 'hex');
  }

  getTimestamp() {
    const timestamp = new Date();
    const time = this.id.readUInt32BE(0);
    timestamp.setTime(Math.floor(time) * 1000);
    return timestamp;
  }
}

import { List, Record } from 'immutable';
import { merge } from 'lodash';

export interface IJournal {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  resource_system_id: string;
  trigger: string;
  trigger_id: string;
  trigger_system_id: string;
  _rev?: string;
}

const JournalRecord = Record({
  id: '',
  action: '',
  resource: '',
  resource_id: '',
  resource_system_id: '',
  trigger: '',
  trigger_id: '',
  trigger_system_id: '',
  _rev: undefined
});

export class Journal extends JournalRecord implements IJournal {
  constructor(properties) {
      super(properties);
  }
}

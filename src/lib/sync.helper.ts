export const getSyncId = (resource: string): string => {
  let syncId: string|null = localStorage.getItem(`sync_id_${resource}`);

  if(syncId === null) {
    syncId = "";
  }

  return syncId;
};

export const setSyncId = (resource: string, syncId: string): string => {
  localStorage.setItem(`sync_id_${resource}`, syncId);
  return syncId;
};

export const resetSyncId = (resource: string = ''): string => {
  if(resource === '') {
    resetSyncId('user');
    resetSyncId('note');
    return '';
  }

  const syncId: string = getSyncId(resource);
  localStorage.removeItem(`sync_id_${resource}`);
  return syncId;
};

export const getRevisionNumber = (rev: string): number => {
  if(typeof rev !== 'string') {
    return -1;
  }

  const rMatchRevisionNumber = /^([0-9]{1,})-.*$/;
  const match: Array<string> | null = rev.match(rMatchRevisionNumber);

  if(match !== null
  && match.length === 2) {
    const revisionNumberStr: string = match[1];
    return parseInt(revisionNumberStr, 10);
  }

  return -1;
};

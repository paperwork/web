export const getSyncId = (): string => {
  let syncId: string|null = localStorage.getItem('sync_id');

  if(syncId === null) {
    syncId = "";
  }

  return syncId;
};

export const setSyncId = (syncId: string): string => {
  localStorage.setItem('sync_id', syncId);
  return syncId;
};

export const resetSyncId = (): string => {
  const syncId: string = getSyncId();
  localStorage.removeItem('sync_id');
  return syncId;
};

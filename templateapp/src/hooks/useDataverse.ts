import { useState, useEffect, useCallback } from 'react';
import type { DataverseRecord } from '../types';
import { dataverseService } from '../services/dataverse.service';

export function useDataverse() {
  const [records, setRecords] = useState<DataverseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dataverseService.getAll().then(data => {
      if (!cancelled) {
        setRecords(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [version]);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  const save = useCallback(async (record: DataverseRecord) => {
    const saved = await dataverseService.save(record);
    refresh();
    return saved;
  }, [refresh]);

  const deleteRecord = useCallback(async (id: string) => {
    await dataverseService.delete(id);
    refresh();
  }, [refresh]);

  return { records, loading, refresh, save, deleteRecord };
}

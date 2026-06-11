import type { DataverseRecord } from '../types';
import { mockRecords } from './mock.data';

let records: DataverseRecord[] = [...mockRecords];
let nextId = 100;

export const dataverseService = {
  async getAll(): Promise<DataverseRecord[]> {
    return [...records];
  },

  async get(id: string): Promise<DataverseRecord | undefined> {
    return records.find(r => r.id === id);
  },

  async save(record: DataverseRecord): Promise<DataverseRecord> {
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = { ...record };
      return records[index];
    }
    const newRecord: DataverseRecord = { ...record, id: String(nextId++) };
    records.push(newRecord);
    return newRecord;
  },

  async delete(id: string): Promise<void> {
    records = records.filter(r => r.id !== id);
  },
};

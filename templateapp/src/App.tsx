import { useState } from 'react';
import { AppShell } from './components/AppShell/AppShell';
import { RecordList } from './components/RecordList/RecordList';
import { RecordForm } from './components/RecordForm/RecordForm';
import { useDataverse } from './hooks/useDataverse';
import type { DataverseRecord } from './types';

type AppView = 'list' | 'form';

function newBlankRecord(): DataverseRecord {
  return { id: '', name: '', xen_stage: 1 };
}

function App() {
  const { records, save, deleteRecord } = useDataverse();
  const [view, setView] = useState<AppView>('list');
  const [selectedRecord, setSelectedRecord] = useState<DataverseRecord | null>(null);
  const [formKey, setFormKey] = useState(0);

  const openForm = (record: DataverseRecord) => {
    setSelectedRecord(record);
    setFormKey(k => k + 1);
    setView('form');
  };

  const handleSave = async (record: DataverseRecord) => {
    await save(record);
    setView('list');
  };

  const handleDelete = async (id: string) => {
    await deleteRecord(id);
    setView('list');
  };

  return (
    <AppShell>
      {view === 'list' && (
        <RecordList
          records={records}
          onSelectRecord={openForm}
          onNewRecord={() => openForm(newBlankRecord())}
        />
      )}
      {view === 'form' && selectedRecord && (
        <RecordForm
          key={formKey}
          record={selectedRecord}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={() => setView('list')}
          onNew={() => openForm(newBlankRecord())}
        />
      )}
    </AppShell>
  );
}

export default App;

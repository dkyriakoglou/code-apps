import { useState } from 'react';
import { Field, Input, Textarea, Button } from '@fluentui/react-components';
import { BusinessProcessFlow } from '../BusinessProcessFlow/BusinessProcessFlow';
import { RecordCommandBar } from '../RecordCommandBar/RecordCommandBar';
import type { DataverseRecord } from '../../types';
import { customerConfig } from '../../config/customer.config';

interface RecordFormProps {
  record: DataverseRecord;
  onSave: (record: DataverseRecord) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onNew: () => void;
}

export function RecordForm({ record, onSave, onDelete, onBack, onNew }: RecordFormProps) {
  const [formData, setFormData] = useState<DataverseRecord>({ ...record });
  const [activeStage, setActiveStage] = useState(record.xen_stage || 1);

  const isNew = !record.id;

  const handleFieldChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, xen_stage: activeStage });
  };

  const handleNextStage = () => {
    setActiveStage(s => Math.min(s + 1, customerConfig.stages.length));
  };

  const handlePrevStage = () => {
    setActiveStage(s => Math.max(s - 1, 1));
  };

  return (
    <div>
      <BusinessProcessFlow activeStage={activeStage} onStageClick={setActiveStage} />

      <RecordCommandBar
        onSave={handleSave}
        onNew={onNew}
        onDelete={() => onDelete(record.id)}
        onBack={onBack}
        isNew={isNew}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px 24px',
        maxWidth: 800,
        marginTop: 8,
      }}>
        {customerConfig.formFields.map(field => (
          <Field
            key={field.name}
            label={field.label}
            required={field.required}
            style={field.type === 'multiline' ? { gridColumn: '1 / -1' } : {}}
          >
            {field.type === 'multiline' ? (
              <Textarea
                value={String(formData[field.name] ?? '')}
                onChange={(_, data) => handleFieldChange(field.name, data.value)}
                rows={3}
                resize="vertical"
              />
            ) : (
              <Input
                type={
                  field.type === 'date' ? 'date'
                  : field.type === 'currency' ? 'number'
                  : 'text'
                }
                value={String(formData[field.name] ?? '')}
                onChange={(_, data) => handleFieldChange(
                  field.name,
                  field.type === 'currency' ? Number(data.value) : data.value,
                )}
              />
            )}
          </Field>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 24, maxWidth: 800, justifyContent: 'flex-end' }}>
        <Button onClick={handlePrevStage} disabled={activeStage <= 1}>
          ← Prev Stage
        </Button>
        <Button
          appearance="primary"
          onClick={handleNextStage}
          disabled={activeStage >= customerConfig.stages.length}
        >
          Next Stage →
        </Button>
      </div>
    </div>
  );
}

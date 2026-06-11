import { Toolbar, ToolbarButton, ToolbarDivider } from '@fluentui/react-components';
import { SaveRegular, AddRegular, DeleteRegular, ArrowLeftRegular } from '@fluentui/react-icons';

interface RecordCommandBarProps {
  onSave: () => void;
  onNew: () => void;
  onDelete: () => void;
  onBack: () => void;
  isNew?: boolean;
}

export function RecordCommandBar({ onSave, onNew, onDelete, onBack, isNew }: RecordCommandBarProps) {
  return (
    <Toolbar style={{ padding: '4px 0', marginBottom: 8 }}>
      <ToolbarButton icon={<SaveRegular />} appearance="primary" onClick={onSave}>
        Save
      </ToolbarButton>
      <ToolbarButton icon={<AddRegular />} onClick={onNew}>
        New
      </ToolbarButton>
      {!isNew && (
        <ToolbarButton icon={<DeleteRegular />} onClick={onDelete}>
          Delete
        </ToolbarButton>
      )}
      <ToolbarDivider />
      <ToolbarButton icon={<ArrowLeftRegular />} onClick={onBack}>
        Back
      </ToolbarButton>
    </Toolbar>
  );
}

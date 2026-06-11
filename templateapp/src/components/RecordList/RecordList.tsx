import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  type TableColumnDefinition,
  createTableColumn,
  TableCellLayout,
  Badge,
  Button,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import type { DataverseRecord } from '../../types';
import { customerConfig } from '../../config/customer.config';

interface RecordListProps {
  records: DataverseRecord[];
  onSelectRecord: (record: DataverseRecord) => void;
  onNewRecord: () => void;
}

type BadgeColor = 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning';

function getStageName(stageId: number): string {
  return customerConfig.stages.find(s => s.id === stageId)?.name ?? String(stageId);
}

function getStageBadgeColor(stageId: number): BadgeColor {
  const max = customerConfig.stages.length;
  if (stageId === max) return 'success';
  if (stageId === 1) return 'informative';
  if (stageId === 2) return 'brand';
  return 'warning';
}

export function RecordList({ records, onSelectRecord, onNewRecord }: RecordListProps) {
  const columns: TableColumnDefinition<DataverseRecord>[] = [
    createTableColumn<DataverseRecord>({
      columnId: 'name',
      compare: (a, b) => a.name.localeCompare(b.name),
      renderHeaderCell: () => 'Name',
      renderCell: (r) => <TableCellLayout>{r.name}</TableCellLayout>,
    }),
    createTableColumn<DataverseRecord>({
      columnId: 'estimatedvalue',
      renderHeaderCell: () => 'Est. Value',
      renderCell: (r) => (
        <TableCellLayout>
          {r.estimatedvalue != null ? `$${r.estimatedvalue.toLocaleString()}` : '—'}
        </TableCellLayout>
      ),
    }),
    createTableColumn<DataverseRecord>({
      columnId: 'closingdate',
      renderHeaderCell: () => 'Close Date',
      renderCell: (r) => <TableCellLayout>{r.closingdate ?? '—'}</TableCellLayout>,
    }),
    createTableColumn<DataverseRecord>({
      columnId: 'stage',
      renderHeaderCell: () => 'Stage',
      renderCell: (r) => (
        <TableCellLayout>
          <Badge appearance="filled" color={getStageBadgeColor(r.xen_stage)}>
            {getStageName(r.xen_stage)}
          </Badge>
        </TableCellLayout>
      ),
    }),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#323130' }}>
          {customerConfig.entityDisplayNamePlural}
        </h2>
        <Button icon={<AddRegular />} appearance="primary" onClick={onNewRecord}>
          New
        </Button>
      </div>

      <DataGrid
        items={records}
        columns={columns}
        sortable
        getRowId={(r) => r.id}
        style={{ width: '100%' }}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<DataverseRecord>>
          {({ item, rowId }) => (
            <DataGridRow<DataverseRecord>
              key={rowId}
              onClick={() => onSelectRecord(item)}
              style={{ cursor: 'pointer' }}
            >
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
}

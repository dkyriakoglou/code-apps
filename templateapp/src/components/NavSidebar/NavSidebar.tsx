import { customerConfig } from '../../config/customer.config';

interface NavSidebarProps {
  onSelect?: (key: string) => void;
  selected?: string;
}

export function NavSidebar({ onSelect, selected = 'records' }: NavSidebarProps) {
  return (
    <nav style={{
      width: 240,
      flexShrink: 0,
      backgroundColor: '#f3f2f1',
      borderRight: '1px solid #e1dfdd',
      padding: '8px 0',
    }}>
      <div style={{
        padding: '8px 16px',
        fontSize: 11,
        fontWeight: 600,
        color: '#605e5c',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {customerConfig.entityDisplayNamePlural}
      </div>
      <button
        onClick={() => onSelect?.('records')}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 16px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontSize: 14,
          color: '#323130',
          borderLeft: selected === 'records'
            ? `3px solid ${customerConfig.brandColor}`
            : '3px solid transparent',
          fontWeight: selected === 'records' ? 600 : 400,
        }}
      >
        {customerConfig.entityDisplayNamePlural}
      </button>
    </nav>
  );
}

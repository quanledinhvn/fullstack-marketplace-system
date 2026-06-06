import { DocumentStatus } from '@app/shared';

interface Props {
  value: string;
  onChange: (status: string) => void;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: DocumentStatus.PENDING, label: 'Pending' },
  { value: DocumentStatus.PROCESSING, label: 'Processing' },
  { value: DocumentStatus.VERIFIED, label: 'Verified' },
  { value: DocumentStatus.REJECTED, label: 'Rejected' },
  { value: DocumentStatus.INCONCLUSIVE, label: 'Inconclusive' },
  { value: DocumentStatus.ERROR, label: 'Error' },
];

export function StatusFilter({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="status-filter"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

import { DocumentStatus } from '@app/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  value: string;
  onChange: (status: string) => void;
}

const EMPTY_SENTINEL = '__ALL__';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: EMPTY_SENTINEL, label: 'All' },
  { value: DocumentStatus.PROCESSING, label: 'Processing' },
  { value: DocumentStatus.VERIFIED, label: 'Verified' },
  { value: DocumentStatus.REJECTED, label: 'Rejected' },
  { value: DocumentStatus.INCONCLUSIVE, label: 'Inconclusive' },
  { value: DocumentStatus.ERROR, label: 'Error' },
];

export function StatusFilter({ value, onChange }: Props) {
  const selectValue = value || undefined;

  function handleValueChange(val: string) {
    onChange(val === EMPTY_SENTINEL ? '' : val);
  }

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

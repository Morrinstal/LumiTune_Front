import './FilterChip.css'

type FilterChipProps = {
  label:     string;
  selected?: boolean;
  onToggle?: (next: boolean) => void;
  disabled?: boolean;
}

function FilterChip({ label, selected=false, onToggle, disabled }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`filterChip${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle?.(!selected)}
    >
      <span className="chipLabel" title={label}>{label}</span>
    </button>
  );
}

export default FilterChip;
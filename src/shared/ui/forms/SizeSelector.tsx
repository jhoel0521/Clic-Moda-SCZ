interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onChange: (size: string) => void;
  label?: string;
}

export function SizeSelector({ sizes, selected, onChange, label = 'Talla' }: SizeSelectorProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
        {label}
        {selected && (
          <span className="ml-2 font-bold text-[var(--color-brand)]">— {selected}</span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            aria-pressed={selected === size}
            className={[
              'min-w-[44px] rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all duration-150',
              selected === size
                ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-gray-400',
            ].join(' ')}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

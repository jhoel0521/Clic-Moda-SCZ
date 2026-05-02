interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onChange: (size: string) => void;
  label?: string;
}

export function SizeSelector({ sizes, selected, onChange, label = 'Talla' }: SizeSelectorProps) {
  return (
    <div>
      <p className="text-text-primary mb-3 text-sm font-semibold">
        {label}
        {selected && <span className="text-brand ml-2 font-bold">— {selected}</span>}
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
                : 'border-border text-text-secondary bg-white hover:border-gray-400',
            ].join(' ')}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

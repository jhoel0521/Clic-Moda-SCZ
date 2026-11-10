interface SectionProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PADDING: Record<string, string> = {
  sm: 'py-10 md:py-12',
  md: 'py-14 md:py-16',
  lg: 'py-20 md:py-24',
};

export function Section({ children, className = '', size = 'md' }: SectionProps) {
  return <section className={`w-full ${PADDING[size]} ${className}`}>{children}</section>;
}

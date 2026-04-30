interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES: Record<string, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-[1400px]',
  xl: 'max-w-[1600px]',
};

export function Container({ children, className = '', size = 'lg' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${SIZES[size]} px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

import { Badge, badgeVariants } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customBadgeVariants = cva(badgeVariants(), {
  variants: {
    variant: {
      INTERVIEW:
        'border-transparent bg-pace-blue-500 text-pace-white-500 font-light',
      RESUME:
        'border-transparent bg-pace-purple-500 text-pace-white-500 font-light',
      NETWORKING:
        'border-transparent bg-pace-yellow-500 text-pace-white-500 font-light'
    }
  },
  defaultVariants: {
    variant: 'INTERVIEW'
  }
});

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'INTERVIEW' | 'RESUME' | 'NETWORKING' | string;
}

export function CustomBadge({
  className,
  variant,
  ...props
}: CustomBadgeProps) {
  return (
    <Badge
      className={cn(
        customBadgeVariants({
          variant: variant as 'INTERVIEW' | 'RESUME' | 'NETWORKING'
        }),
        className
      )}
      {...props}
    />
  );
}

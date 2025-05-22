import { Badge, badgeVariants } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customBadgeVariants = cva(badgeVariants(), {
  variants: {
    variant: {
      Interview:
        'border-transparent bg-pace-blue-500 text-pace-white-500 font-light',
      Resume:
        'border-transparent bg-pace-purple-500 text-pace-white-500 font-light',
      Networking:
        'border-transparent bg-pace-yellow-500 text-pace-white-500 font-light'
    }
  },
  defaultVariants: {
    variant: 'Interview'
  }
});

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'Interview' | 'Resume' | 'Networking';
}

export function CustomBadge({
  className,
  variant,
  ...props
}: CustomBadgeProps) {
  return (
    <Badge
      className={cn(customBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}

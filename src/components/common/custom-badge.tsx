import { Badge, badgeVariants } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customBadgeVariants = cva(badgeVariants(), {
  variants: {
    variant: {
      INTERVIEW:
        'border-transparent bg-pace-blue-500 !text-pace-sm text-pace-white-500 font-light',
      RESUME:
        'border-transparent bg-pace-purple-500 !text-pace-sm text-pace-white-500 font-light',
      NETWORKING:
        'border-transparent bg-pace-yellow-500 !text-pace-sm text-pace-white-500 font-light',
      MARKETING:
        'border-transparent bg-pace-orange-700 !text-pace-sm text-pace-white-500 font-light',
      DESIGN:
        'border-transparent bg-pace-pink-500 !text-pace-sm text-pace-white-500 font-light',
      PUBLIC:
        'border-transparent bg-pace-mint-600 !text-pace-sm text-pace-white-500 font-light',
      IT: 'border-transparent bg-pace-blue-700 !text-pace-sm text-pace-white-500 font-light',
      ACCOUNTING:
        'border-transparent bg-pace-navy-500 !text-pace-sm text-pace-white-500 font-light',
      SERVICE:
        'border-transparent bg-pace-teal-500 !text-pace-sm text-pace-white-500 font-light'
    }
  },
  defaultVariants: {
    variant: 'INTERVIEW'
  }
});

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'Interview'
    | 'Resume'
    | 'Networking'
    | 'Marketing'
    | 'Design'
    | 'Public'
    | 'IT'
    | 'Accounting'
    | 'Service'
    | string;
}

export function CustomBadge({
  className,
  variant,
  ...props
}: CustomBadgeProps) {
  // Normalize variant to uppercase to match cva keys
  const normalizedVariant = variant?.toUpperCase();

  return (
    <Badge
      className={cn(
        customBadgeVariants({
          variant: normalizedVariant as
            | 'INTERVIEW'
            | 'RESUME'
            | 'NETWORKING'
            | 'MARKETING'
            | 'DESIGN'
            | 'PUBLIC'
            | 'IT'
            | 'ACCOUNTING'
            | 'SERVICE'
        }),
        className
      )}
      {...props}
    />
  );
}

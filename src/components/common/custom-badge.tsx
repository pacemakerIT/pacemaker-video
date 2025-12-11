import { Badge, badgeVariants } from '@/components/ui/badge';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customBadgeVariants = cva(badgeVariants(), {
  variants: {
    variant: {
      Interview:
        'border-transparent bg-pace-blue-500 !text-pace-sm text-pace-white-500 font-light',
      Resume:
        'border-transparent bg-pace-purple-500 !text-pace-sm text-pace-white-500 font-light',
      Networking:
        'border-transparent bg-pace-yellow-500 !text-pace-sm text-pace-white-500 font-light',
      Marketing:
        'border-transparent bg-pace-orange-700 !text-pace-sm text-pace-white-500 font-light',
      Design:
        'border-transparent bg-pace-pink-500 !text-pace-sm text-pace-white-500 font-light',
      Public:
        'border-transparent bg-pace-mint-600 !text-pace-sm text-pace-white-500 font-light',
      IT: 'border-transparent bg-pace-blue-700 !text-pace-sm text-pace-white-500 font-light',
      Accounting:
        'border-transparent bg-pace-navy-500 !text-pace-sm text-pace-white-500 font-light',
      Service:
        'border-transparent bg-pace-teal-500 !text-pace-sm text-pace-white-500 font-light'
    }
  },
  defaultVariants: {
    variant: 'Interview'
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
  // Normalize variant to capitalize first letter (case-insensitive)
  const normalizedVariant = variant
    ? variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase()
    : undefined;

  return (
    <Badge
      className={cn(
        customBadgeVariants({
          variant: normalizedVariant as
            | 'Interview'
            | 'Resume'
            | 'Networking'
            | 'Marketing'
            | 'Design'
            | 'Public'
            | 'IT'
            | 'Accounting'
            | 'Service'
        }),
        className
      )}
      {...props}
    />
  );
}

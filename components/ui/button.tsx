import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva('ui-btn', {
  variants: {
    variant: {
      default: 'ui-btn-default',
      outline: 'ui-btn-outline',
    },
    size: {
      default: 'ui-btn-size-default',
      sm: 'ui-btn-size-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };

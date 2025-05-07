import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonMetallicVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 shadow-metallic",
  {
    variants: {
      variant: {
        default: "bg-metallic-gold bg-[size:200%_200%] animate-shimmer border border-gold-500/30 text-forest-900 font-bold hover:translate-y-[-2px] hover:shadow-lg",
        silver: "bg-metallic-silver bg-[size:200%_200%] animate-shimmer border border-gray-300 text-gray-800 font-bold hover:translate-y-[-2px] hover:shadow-lg",
        outline: "border-2 border-gold-500 bg-background hover:bg-gold-500/10 text-forest-900 hover:translate-y-[-1px]",
        ghost: "hover:bg-accent/10 text-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonMetallicProps {
  variant?: "default" | "silver" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asChild?: boolean;
  [key: string]: any;
}

export function ButtonMetallic({ 
  className = "", 
  variant = "default", 
  size = "default", 
  ...props 
}: ButtonMetallicProps) {
  return (
    <button
      className={cn(buttonMetallicVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonMetallicVariants }; 
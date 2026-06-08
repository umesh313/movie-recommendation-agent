import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-white rounded-full hover:opacity-85",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md",
        secondary:
          "bg-white text-ink rounded-full shadow-level-1 hover:bg-canvas-soft",
        ghost:
          "hover:bg-accent hover:text-accent-foreground rounded-full",
        link: "text-link underline-offset-4 hover:underline",
        // Vercel nav-scale (sm) buttons
        "nav-cta-primary":
          "bg-ink text-white rounded-sm px-2 py-0 h-7 text-body-sm-strong font-medium",
        "nav-cta-secondary":
          "bg-white text-ink rounded-sm px-2 py-0 h-7 text-body-sm-strong font-medium shadow-level-1",
        "nav-cta-ask-ai":
          "bg-white text-ink rounded-sm px-2 py-0 h-7 text-body-sm-strong font-medium border border-hairline",
        // Vercel marketing-scale (pill) buttons
        "pill-primary":
          "bg-ink text-white rounded-pill px-3 py-0 h-11 text-button-lg font-medium hover:opacity-85",
        "pill-secondary":
          "bg-white text-ink rounded-pill px-3 py-0 h-11 text-button-lg font-medium shadow-level-1 hover:bg-canvas-soft",
        "pill-primary-sm":
          "bg-ink text-white rounded-pill px-2 py-0 h-9 text-button-md font-medium hover:opacity-85",
        "pill-secondary-sm":
          "bg-white text-ink rounded-pill px-2 py-0 h-9 text-button-md font-medium shadow-level-1 hover:bg-canvas-soft",
        // Vercel tab-ghost
        "tab-ghost":
          "bg-white text-ink rounded-pill-sm px-4 py-0 h-9 text-body-sm font-medium hover:bg-canvas-soft",
        // Icon button
        "icon-round":
          "bg-white text-ink rounded-full border border-hairline p-2",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
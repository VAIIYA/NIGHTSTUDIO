import { ChevronRight } from "lucide-react";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      Skip to main content
    </a>
  );
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  ...props
}: {
  children: React.ReactNode;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className="sr-only"
      {...props}
    >
      {children}
    </Component>
  );
}

export function Announcer({
  message,
  politeness = 'polite'
}: {
  message: string;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function FocusTrap({
  children,
  active = true
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  if (!active) return <>{children}</>;

  return (
    <div className="focus-trap" tabIndex={-1}>
      {children}
    </div>
  );
}
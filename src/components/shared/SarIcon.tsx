import { SaudiRiyal } from "lucide-react";

/**
 * Saudi Riyal currency symbol icon following SAMA official guidelines:
 * - Matches text height via 1em sizing
 * - Maintains proportional geometric structure
 * - Inherits current text color for contrast
 * - Use with `dir="ltr"` wrapper to ensure symbol is always LEFT of number
 */
export default function SarIcon({ className }: { className?: string }) {
  return (
    <SaudiRiyal
      className={`inline-block h-[1em] w-[1em] align-middle ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

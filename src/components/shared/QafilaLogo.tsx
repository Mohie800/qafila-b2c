interface QafilaLogoProps {
  size?: number;
  className?: string;
}

export default function QafilaLogo({
  size = 36,
  className = "",
}: QafilaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simplified camel silhouette */}
      <path
        d="M16 48h32M18 48V36c0-2 1-4 3-5l4-3c1-1 2-3 2-5v-4c0-1 .5-2 1.5-2.5L32 14l2 2c1 .5 2 1 3 1h3c2 0 3 1 4 2l2 3v6c0 2 1 4 2 5l2 3v12M24 48v-6M40 48v-6M30 16l-1-4c0-1 .5-2 1.5-2s2 1 2 2l-1 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

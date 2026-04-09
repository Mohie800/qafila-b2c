"use client";

interface TopicPillProps {
  label: string;
  onClick: (label: string) => void;
}

export default function TopicPill({ label, onClick }: TopicPillProps) {
  return (
    <button
      onClick={() => onClick(label)}
      className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
    >
      {label}
    </button>
  );
}

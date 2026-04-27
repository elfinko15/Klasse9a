const GRADIENTS = [
  ["#7c3aed", "#a855f7"],
  ["#ec4899", "#f43f5e"],
  ["#f59e0b", "#fb923c"],
  ["#10b981", "#06b6d4"],
  ["#3b82f6", "#6366f1"],
  ["#8b5cf6", "#ec4899"],
  ["#14b8a6", "#10b981"],
  ["#f97316", "#ef4444"],
];

function getGradient(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % GRADIENTS.length;
  return GRADIENTS[h];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  name: string;
  profilePictureUrl?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ name, profilePictureUrl, size = 48, className = "" }: Props) {
  const [from, to] = getGradient(name);
  const initials = getInitials(name);

  if (profilePictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePictureUrl}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: size * 0.36,
        boxShadow: `0 4px 15px ${from}60`,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

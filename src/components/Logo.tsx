export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* Circle background */}
      <circle cx="32" cy="32" r="30" fill="url(#logo-bg)" />
      {/* Cart handle */}
      <path
        d="M18 18 L22 18 L28 38 L48 38"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cart body - trapezoid */}
      <path
        d="M24 24 L46 24 L44 34 L26 34 Z"
        fill="white"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* AIO text */}
      <text
        x="35"
        y="32.5"
        textAnchor="middle"
        fontFamily="Arial,Helvetica,sans-serif"
        fontWeight="bold"
        fontSize="9"
        fill="white"
        letterSpacing="1"
      >
        AIO
      </text>
      {/* Cart wheels */}
      <circle cx="30" cy="43" r="3" fill="white" />
      <circle cx="44" cy="43" r="3" fill="white" />
    </svg>
  );
}

export default function NavButton({
  className,
  direction,
  onClick,
}: {
  className?: string;
  direction: "next" | "prev";
  onClick: () => void;
}) {
  return (
    <button
      title={direction}
      className={`w-16 h-16 text-gray-500 rounded-full transition-colors hover:bg-black hover:bg-opacity-5 flex items-center justify-center ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span className="sr-only">{direction}</span>
      <svg
        viewBox="0 0 20 20"
        className="w-4 h-4 transform -rotate-45 mx-auto"
        style={{
          transform:
            direction === "next"
              ? "scale(-1,1) rotate(-45deg)"
              : "rotate(-45deg)",
        }}
      >
        <rect width={3} height={17} x={3} y={3} fill="currentColor" />
        <rect width={17} height={3} x={3} y={3} fill="currentColor" />
      </svg>
    </button>
  );
}

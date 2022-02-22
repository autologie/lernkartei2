export default function CloseButton({
  className,
  onClick,
}: {
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`shadow-lg transform rotate-45 flex items-center justify-center bg-white rounded-full w-8 h-8 ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span className="sr-only">Close</span>
      <svg viewBox="0 0 20 20" className="w-4 h-4">
        <rect width={2} height={20} x={9} y={0} fill="currentColor" />
        <rect width={20} height={2} x={0} y={9} fill="currentColor" />
      </svg>
    </button>
  );
}

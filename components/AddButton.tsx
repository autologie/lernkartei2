export default function AddButton({
  className,
  onClick,
}: {
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center justify-center bg-blue-500 rounded-full w-12 h-12 md:w-16 md:h-16 text-4xl text-white font-extralight ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <svg viewBox="0 0 20 20" className="w-6 h-6">
        <rect width={2} height={20} x={9} y={0} fill="currentColor" />
        <rect width={20} height={2} x={0} y={9} fill="currentColor" />
      </svg>
    </button>
  );
}

export default function PrevButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      title="Prev"
      className={`w-8 h-8 text-gray-500 rounded-full transition-colors hover:bg-gray-100 flex items-center justify-center ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      &lt;
    </button>
  );
}

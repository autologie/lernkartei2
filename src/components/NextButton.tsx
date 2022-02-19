export default function NextButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      title="Next"
      className={`w-16 h-16 text-xl text-gray-500 rounded-full transition-colors hover:bg-gray-100 flex items-center justify-center ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      &gt;
    </button>
  );
}

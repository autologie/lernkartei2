export default function AddButton({
  className,
  onClick,
}: {
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center justify-center bg-blue-500 rounded-full w-16 h-16 text-4xl text-white ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      +
    </button>
  );
}

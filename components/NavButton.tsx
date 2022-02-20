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
      className={`w-16 h-16 text-xl text-gray-500 rounded-full transition-colors hover:bg-gray-100 flex items-center justify-center ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      {direction === "next" ? ">" : "<"}
    </button>
  );
}

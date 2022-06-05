import { AiOutlineClose } from "react-icons/ai";

export default function CloseButton({
  className,
  onClick,
}: {
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`shadow-lg transform flex items-center justify-center bg-white dark:bg-gray-900 rounded-full w-8 h-8 ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span className="sr-only">Close</span>
      <AiOutlineClose />
    </button>
  );
}

import { AiOutlineSearch } from "react-icons/ai";

export default function SearchButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center justify-center bg-blue-500 rounded-full w-12 h-12 md:w-16 md:h-16 text-white font-extralight ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span className="sr-only">Search word</span>
      <AiOutlineSearch className="w-6 h-6 md:w-8 md:h-8" />
    </button>
  );
}

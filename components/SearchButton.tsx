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
      className={`flex items-center justify-center bg-blue-500 rounded-full w-8 h-8 md:w-12 md:h-12 text-white font-extralight ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span className="sr-only">Search word</span>
      <AiOutlineSearch className="w-5 h-5 md:w-7 md:h-7" />
    </button>
  );
}

export default function WordNotFound({
  onSkip,
  className,
}: {
  className?: string;
  onSkip: () => void;
}) {
  return (
    <div
      className={`${
        className ?? ""
      } flex items-center flex-col gap-4 p-4 bg-red-100 rounded-lg`}
    >
      <p className="text-2xl font-semibold text-red-700">Word not found</p>
      <button
        className="block mx-auto mt-4 bg-white rounded-xl py-2 px-24 text-xl"
        onClick={onSkip}
      >
        Skip
      </button>
    </div>
  );
}

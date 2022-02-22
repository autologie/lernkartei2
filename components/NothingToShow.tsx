import { encode, Settings } from "../models/Settings";

export default function NothingToShow({
  settings,
  onAdd,
}: {
  settings: Settings;
  onAdd: () => void;
}) {
  return (
    <p className="text-center">
      <button className="text-blue-500 underline" onClick={onAdd}>
        Add a few words
      </button>{" "}
      {settings.wordFilter === undefined ? (
        ""
      ) : (
        <>
          or{" "}
          <a
            className="text-blue-500 underline"
            href={`?${encode({
              ...settings,
              wordFilter: undefined,
            })}`}
          >
            clear filter
          </a>
        </>
      )}{" "}
      to get started!
    </p>
  );
}

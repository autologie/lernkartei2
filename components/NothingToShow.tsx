import { encode, Settings } from "../models/Settings";

export default function NothingToShow({ settings }: { settings: Settings }) {
  return (
    <p className="text-center">
      {settings.wordFilter === undefined ? (
        "Word not registered"
      ) : (
        <>
          <a
            className="text-blue-500 underline"
            href={`?${encode({
              ...settings,
              wordFilter: undefined,
            })}`}
          >
            clear filter
          </a>{" "}
          to get started!
        </>
      )}
    </p>
  );
}

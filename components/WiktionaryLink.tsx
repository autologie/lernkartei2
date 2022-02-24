export default function WiktionaryLink({ entry }: { entry: string }) {
  return (
    <a
      className="underline"
      target="_blank"
      rel="noopener noreferrer"
      href={`https://de.wiktionary.org/wiki/${encodeURIComponent(entry)}`}
    >
      Wiktionary
    </a>
  );
}

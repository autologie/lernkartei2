import { useEffect, useState } from "react";

export default function useDarkMode(): boolean {
  const query =
    typeof window === "undefined"
      ? undefined
      : window.matchMedia("(prefers-color-scheme: dark)");
  const [value, setValue] = useState(query?.matches ?? false);

  useEffect(() => {
    if (query === undefined) {
      return;
    }

    function handleChange() {
      if (query === undefined) {
        return;
      }

      setValue(query.matches);
    }

    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, [query]);

  return value;
}

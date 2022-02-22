import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

export function ModalTemplate({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [animState, setAnimState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => setAnimState(true));
  }, []);

  return (
    <div
      className={`transform-colors duration-100 ${
        animState ? "bg-black" : "bg-transparent"
      } bg-opacity-30 fixed left-0 bottom-0 w-full h-full flex flex-col items-center justify-end md:justify-start z-10 p-0 md:p-12 md:pt-36 overflow-auto`}
      onClick={(e) => {
        if (
          contentRef.current === null ||
          !contentRef.current.contains(e.target as any)
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        className={`relative duration-300 ${
          animState ? "opacity-100 max-h-2/3" : "opacity-0 max-h-0"
        } md:max-h-unset w-full max-w-prose p-4 bg-white shadow-xl rounded-b-none md:rounded-b-xl rounded-xl overflow-auto md:overflow-visible`}
      >
        {children}
      </div>
    </div>
  );
}

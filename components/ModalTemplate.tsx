import { ReactNode, useRef } from "react";

export function ModalTemplate({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="bg-black bg-opacity-30 fixed left-0 bottom-0 w-full h-full flex flex-col items-center justify-end md:justify-start z-10 p-0 md:p-12 md:pt-36 overflow-auto"
      onClick={(e) => {
        if (
          contentRef.current === null ||
          !(e.target instanceof HTMLElement) ||
          !contentRef.current.contains(e.target)
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        className="relative max-h-2/3 md:max-h-unset w-full max-w-prose p-4 bg-white shadow-xl rounded-b-none md:rounded-b-xl rounded-xl overflow-auto md:overflow-visible"
      >
        {children}
      </div>
    </div>
  );
}

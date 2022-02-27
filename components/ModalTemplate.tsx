import React, {
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import CloseButton from "./CloseButton";

const ModalTemplate = React.forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    onClose: () => void;
    onAnimationEnd: () => void;
  }
>(({ children, onClose, onAnimationEnd }, ref) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [animState, setAnimState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => setAnimState(true));
  }, []);

  useImperativeHandle(ref, () => contentRef.current!);

  return (
    <div
      className={`transform-colors duration-100 ${
        animState ? "bg-black dark:bg-white" : "bg-transparent"
      } bg-opacity-30 dark:bg-opacity-20 fixed left-0 bottom-0 w-full h-full flex flex-col items-center justify-end md:justify-start z-10 p-0 md:p-12 md:pt-36 overflow-auto`}
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
        className={`relative duration-300 max-h-3/4 ${
          animState ? "opacity-100" : "opacity-0"
        } md:max-h-unset w-full max-w-prose p-4 bg-white dark:bg-gray-900 shadow-xl rounded-b-none md:rounded-b-xl rounded-xl overflow-auto md:overflow-visible`}
        style={{ transform: `translate(0,${animState ? 0 : 25}%)` }}
        onTransitionEnd={onAnimationEnd}
      >
        {children}

        <CloseButton
          className="absolute right-0 top-0 z-10 hidden md:flex -m-3"
          onClick={onClose}
        />
      </div>
    </div>
  );
});

ModalTemplate.displayName = "ModalTemplate";

export default ModalTemplate;

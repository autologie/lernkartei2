import styles from "./NextButton.module.css";

export default function NextButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`relative block bg-blue-500 text-white rounded-xl py-2 px-24 text-base font-light ${
        className ?? ""
      }`}
      onClick={onClick}
    >
      <span
        className={`absolute left-0 top-0 bg-blue-500 rounded-2xl ${styles.next_button_ping}`}
      ></span>
      Next
    </button>
  );
}

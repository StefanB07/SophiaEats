export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-deep-sea-surface rounded-xl shadow-md border border-luminescent-line p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

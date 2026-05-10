export default function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-pure-white rounded-xl shadow-md border border-border-gray p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

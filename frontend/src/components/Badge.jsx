export default function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-border-gray text-slate-dark",
    success: "bg-mint-green text-pure-white",
    warning: "bg-warning-yellow text-slate-dark",
    error: "bg-crimson-alert text-pure-white",
    brand: "bg-deep-sea-navy text-pure-white"
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

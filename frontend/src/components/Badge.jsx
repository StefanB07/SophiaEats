export default function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-luminescent-line text-starlight-white",
    success: "bg-mint-glow text-midnight-navy",
    warning: "bg-amber-warning text-midnight-navy",
    error: "bg-crimson-alert text-starlight-white",
    brand: "bg-deep-sea-surface border border-luminescent-line text-starlight-white"
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

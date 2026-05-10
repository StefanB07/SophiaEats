export default function Button({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center";
  const variants = {
    primary: "bg-sunset-coral text-pure-white hover:bg-red-500",
    secondary: "bg-border-gray text-slate-dark hover:bg-gray-300",
    outline: "border-2 border-deep-sea-navy text-deep-sea-navy hover:bg-deep-sea-navy hover:text-pure-white",
    danger: "bg-crimson-alert text-pure-white hover:bg-red-600",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const baseClasses = "px-4 py-2 rounded-lg font-bold transition-all duration-200 inline-flex items-center justify-center border-none";
  const variants = {
    primary: "bg-sunset-coral text-midnight-navy hover:bg-sunset-coral/90 shadow-md hover:shadow-lg",
    secondary: "bg-luminescent-line text-starlight-white hover:bg-luminescent-line/80",
    outline: "border-2 border-wave-crest-blue text-wave-crest-blue hover:bg-wave-crest-blue hover:text-midnight-navy",
    danger: "bg-crimson-alert text-starlight-white hover:bg-crimson-alert/90 shadow-md hover:shadow-lg",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

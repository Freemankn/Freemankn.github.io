interface FnShieldProps {
  readonly className?: string;
  readonly size?: "default" | "large";
}

export function FnShield({ className = "", size = "default" }: FnShieldProps) {
  const classes = [
    "fn-shield",
    size === "large" ? "fn-shield--large" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      <span>FN</span>
    </span>
  );
}

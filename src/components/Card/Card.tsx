export function Card({
  className = "",
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`border bg-white ${className}`} {...props} />;
}

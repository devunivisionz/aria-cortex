export function CardContent({
  className = "",
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={` ${className}`} {...props} />;
}

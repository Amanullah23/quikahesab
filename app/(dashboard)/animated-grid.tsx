export default function AnimatedGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${className} animate-fade-in-up`}>{children}</div>;
}
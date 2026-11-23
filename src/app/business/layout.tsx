export default function BusinessLayout({ children }: LayoutProps<"/business">) {
  return (
    <div className="min-h-dvh bg-ink-50 flex flex-col">
      <div className="flex-1 w-full max-w-md mx-auto bg-white min-h-dvh flex flex-col relative">{children}</div>
    </div>
  );
}

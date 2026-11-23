export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col px-6">{children}</div>
    </div>
  );
}

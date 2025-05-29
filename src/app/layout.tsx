import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sl">
      <body className="bg-[#231F20] text-white min-h-screen m-0 p-0">{children}</body>
    </html>
  );
}

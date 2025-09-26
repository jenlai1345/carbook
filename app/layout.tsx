import Providers from "./providers";

export const metadata = {
  title: "CarBook 中古車進存銷系統",
  description: "Login starter with Back4App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

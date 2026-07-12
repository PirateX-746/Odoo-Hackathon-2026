import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ACCESS_TOKEN_KEY } from "@/libs/constant";
import { sessionFromAccessToken } from "@/libs/helper";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Reserved for numeric/data readouts (VINs, plates, odometer, timestamps) —
// not the general UI face, see globals.css font-mono usage.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Transport Operations Platform",
  description: "Smart Transport Operations Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;
  const initialUser = accessToken ? sessionFromAccessToken(accessToken) : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}

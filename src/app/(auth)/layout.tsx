import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Chakra_Petch } from "next/font/google";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${chakra.className} antialiased flex flex-col min-h-screen`}>
      <Navbar />
      {children}
      <Toaster />
    </div>
  );
}

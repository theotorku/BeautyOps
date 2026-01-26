import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "BeautyOps AI | AI Workflow Engine for Beauty AEs",
  description: "Transform field notes into strategic intel in seconds. The AI-powered workflow engine for Beauty Account Executives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

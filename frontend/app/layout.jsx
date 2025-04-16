import "./globals.css";

export const metadata = {
  title: "RAG PoC - Aleph Alpha",
  description: "Proof of concept for RAG using Aleph Alpha",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

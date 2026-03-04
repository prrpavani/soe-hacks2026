import "./globals.css";

export const metadata = {
  title: "Talley Open Seat",
  description: "Simple seat-sharing response form with admin stats",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

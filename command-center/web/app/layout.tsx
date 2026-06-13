import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agentic Trading Command Center",
  description: "Operator interface for the AI trading system",
};

const NAV: [string, string][] = [
  ["/", "Home"], ["/approvals", "Approvals"], ["/market", "Market"],
  ["/opportunities", "Opportunities"], ["/portfolio", "Portfolio"],
  ["/performance", "Performance"], ["/lessons", "Lessons"],
  ["/audit", "Audit"], ["/agents", "Agents"],
  ["/capital-flows", "Capital Flows"], ["/improvement", "Improvement"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
        <nav className="w-44 shrink-0 border-r border-zinc-800 p-3 hidden md:block">
          <div className="text-xs font-semibold tracking-wider text-zinc-500 mb-3">
            COMMAND CENTER
          </div>
          <ul className="space-y-0.5">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="block px-2 py-1.5 rounded text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 min-w-0 p-4 md:p-6 max-w-7xl">{children}</main>
      </body>
    </html>
  );
}

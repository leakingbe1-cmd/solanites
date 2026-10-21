import Link from "next/link";
import { gameConfig } from "@/config/gameConfig";

export const metadata = { title: "No promises — Solanites" };

const POINTS: [string, string][] = [
  ["Not financial advice", `Nothing on this site is financial, investment or legal advice. ${gameConfig.token.symbol} is a memecoin: do your own research and only use money you can afford to lose.`],
  ["No promises of value", `We make no promise about the price of ${gameConfig.token.symbol}, its market or any return. Prices of tokens like this can fall to zero.`],
  ["Eggs and creatures are game items", "They are earned by holding and have no cash value. Rarity is decided by fixed odds on the server, not by payment."],
  ["Plans can change", "Features described as planned or coming soon may change or not happen. Changes are announced in the shipping log."],
  ["Stay safe", "Solanites never DMs first and never asks for a seed phrase or private key. Eggs never need a wallet connection."],
];

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen pt-24 lg:pt-28">
      <div className="sl-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[600px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="sl-eyebrow">The fine print, kept short</p>
        <h1 className="mt-3 sl-display-l text-bone">No promises</h1>
        <dl className="mt-10 space-y-6">
          {POINTS.map(([title, body]) => (
            <div key={title} className="sl-panel rounded-md p-5">
              <dt className="font-display text-xl text-bone">{title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-mist">{body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-mist">
          See what has changed in the{" "}
          <Link href="/updates" className="text-bone underline-offset-4 hover:underline">
            shipping log
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

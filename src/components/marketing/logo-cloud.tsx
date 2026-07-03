import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { LOGOS } from "@/lib/mock-data";

export function LogoCloud() {
  return (
    <section className="py-16">
      <div className="shell">
        <Reveal>
          <p className="text-center text-label uppercase tracking-widest text-ink-500">
            Trusted by risk &amp; fraud teams at the world&apos;s fastest-moving companies
          </p>
        </Reveal>
        <div className="mt-8">
          <Marquee speed={38}>
            {LOGOS.map((name) => (
              <span
                key={name}
                className="text-h3 font-semibold tracking-tight text-ink-600 transition-colors duration-300 hover:text-ink-300"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

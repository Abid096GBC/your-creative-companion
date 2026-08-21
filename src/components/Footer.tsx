import { Facebook, HeartPulse, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer id="contact" className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <span className="text-xl font-bold text-primary">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ঘরে বসেই বিশ্বস্ত ও পেশাদার নার্সিং সেবা। প্রশিক্ষিত নার্স, স্বচ্ছ খরচ, ২৪/৭ সাপোর্ট।
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">জরুরি হটলাইন</h3>
          <a
            href={`tel:${SITE.phone}`}
            className="mt-3 flex items-center gap-2 text-lg font-bold text-primary"
          >
            <Phone className="size-4" /> {SITE.phoneDisplay}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Mail className="size-4" /> {SITE.email}
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">সেবা এলাকা</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {SITE.areas.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <MapPin className="size-4 text-accent" /> {a}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">সোশ্যাল</h3>
          <div className="mt-3 flex gap-2">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#contact"
                aria-label="social link"
                className="flex size-9 items-center justify-center rounded-lg border border-border text-primary transition-colors hover:bg-secondary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name} (Shushrusha) — সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

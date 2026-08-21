import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hello Shushrusha, I would like to book a service.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp চ্যাট"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-whatsapp-foreground shadow-glow transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">WhatsApp চ্যাট</span>
    </a>
  );
}

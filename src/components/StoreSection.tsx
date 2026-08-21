import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceWizard } from "@/components/ServiceWizard";
import { PRODUCTS } from "@/lib/site";

export function StoreSection() {
  return (
    <section id="store" className="border-y border-border/60 bg-card/60 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <ShoppingBag className="size-6 text-primary" /> সার্জিক্যাল ও মেডিকেল প্রোডাক্ট স্টোর
          </h2>
          <p className="mt-3 text-muted-foreground">
            প্রয়োজনীয় মেডিকেল সামগ্রী অর্ডার করুন — নার্স ভিজিটের সাথেই পৌঁছে যাবে।
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="card-elevated flex flex-col p-5">
              <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
              <p className="text-xs font-medium tracking-wide text-accent">{p.nameEn}</p>
              <p className="mt-3 text-lg font-bold text-primary">
                ৳{p.price} <span className="text-xs font-medium text-muted-foreground">/ {p.unit}</span>
              </p>
              <div className="mt-4">
                <ServiceWizard
                  serviceId="product"
                  extraTitle={`প্রোডাক্ট অর্ডার — ${p.name} (${p.nameEn})`}
                  presetDetails={{ product: p.name, unit_price: p.price, qty: 1 }}
                >
                  <Button variant="softOutline" className="w-full">
                    অর্ডার করুন
                  </Button>
                </ServiceWizard>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

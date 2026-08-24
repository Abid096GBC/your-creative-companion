import { CATEGORY_LABEL, type OrderCategory } from "@/lib/orders-store";

const ORDER: OrderCategory[] = ["nursing", "doctor", "lab", "store"];

export function OrderTabs({
  value,
  counts,
  onChange,
}: {
  value: OrderCategory;
  counts: Record<OrderCategory, number>;
  onChange: (c: OrderCategory) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div role="tablist" className="flex w-max min-w-full gap-2">
        {ORDER.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={value === c}
            onClick={() => onChange(c)}
            className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
              value === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {CATEGORY_LABEL[c]}
            <span className="ml-1 opacity-70">({counts[c] ?? 0})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

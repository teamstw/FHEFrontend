"use client";
import { Shell } from "@/components/layout/page-shell";
import {
  Badge,
  Button,
  Check,
  Field,
  Modal,
  Notice,
  Panel,
  Rows,
  saved,
} from "@/components/ui/cepp";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { type SavedCard } from "@/types/cepp";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export default function CardsPage() {
  const { model, update } = useCepp(),
    source = useData(api.cards, mockCards),
    [cards, setCards] = useState<SavedCard[] | null>(null),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<SavedCard | null>(null),
    [name, setName] = useState(""),
    [number, setNumber] = useState(""),
    [expiry, setExpiry] = useState(""),
    [defaultCard, setDefault] = useState(false),
    [remove, setRemove] = useState<SavedCard | null>(null),
    router = useRouter();
  const list = cards ?? (model.cardsLoaded ? model.cards : source.data) ?? [];
  const persist = (next: SavedCard[]) => {
    setCards(next);
    update((m) => ({ ...m, cards: next, cardsLoaded: true }));
    saved();
  };
  const save = () => {
    if (backendEnabled) {
      toast.info(
        "Connect Stripe SetupIntent and hosted Elements to save a payment method.",
      );
      return;
    }
    if (
      !name.trim() ||
      !/^\d{4}$/.test(number) ||
      !/^\d{2}\/\d{4}$/.test(expiry)
    ) {
      toast.error("Enter a name, four demo digits, and expiry MM/YYYY");
      return;
    }
    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12 || new Date(year, month, 0) < new Date()) {
      toast.error("Enter a future expiry date");
      return;
    }
    const card: SavedCard = {
      id: editing?.id || crypto.randomUUID(),
      brand: "Visa",
      last4: number,
      expiry,
      name: name.trim(),
      default: defaultCard || list.length === 0,
    };
    persist([
      ...list
        .filter((c) => c.id !== editing?.id)
        .map((c) => (card.default ? { ...c, default: false } : c)),
      card,
    ]);
    setOpen(false);
    setNumber("");
    setName("");
    setExpiry("");
  };
  return (
    <Shell
      title="My Credit Card"
      description="บัตรที่บันทึกไว้ · แสดงเฉพาะข้อมูลที่ปิดบังแล้ว"
      action=<Button
        onClick={() => {
          setEditing(null);
          setOpen(true);
          setName("");
          setNumber("");
          setExpiry("");
        }}
      >
        Add credit card
      </Button>
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}
      {list.map((card) => (
        <Panel key={card.id}>
          <div className="cepp-row wrap">
            <h2>
              {card.brand} · •••• {card.last4}
            </h2>
            {card.default && <Badge tone="green">Default</Badge>}
          </div>
          <p className="cepp-muted">
            {card.name} · Expires {card.expiry.replace("/", " / ")}
          </p>
          {card.default && (
            <Rows rows={[["Used for", "Personal / Enterprise A / Group 3"]]} />
          )}
          <div className="cepp-row start wrap">
            <Button
              secondary
              onClick={() => {
                if (backendEnabled) {
                  toast.info("Connect the payment-method update endpoint");
                  return;
                }
                if (card.default) {
                  setEditing(card);
                  setName(card.name);
                  setNumber(card.last4);
                  setExpiry(card.expiry);
                  setDefault(card.default);
                  setOpen(true);
                } else
                  persist(
                    list.map((c) => ({ ...c, default: c.id === card.id })),
                  );
              }}
            >
              {card.default ? "Update billing details" : "Set as default"}
            </Button>
            <Button secondary danger onClick={() => setRemove(card)}>
              Remove
            </Button>
          </div>
        </Panel>
      ))}
      {!list.length && (
        <Notice title="No saved cards">
          Add a payment method to use for billing.
        </Notice>
      )}
      <Notice title="Secure payments · demo cards">
        Card data is handled through Stripe. CEPP shows only the card brand,
        last four digits and expiry; no full card number or CVC is retained
        here.
      </Notice>
      <Notice title="Before removing your default card" warning>
        Choose another payment method for active billing contexts before
        removing the default. Changing a saved card does not change a
        workspace’s payer or plan.
      </Notice>
      <div>
        <Button secondary onClick={() => router.push("/billing")}>
          View Billing
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Update billing details" : "Add credit card"}
        eyebrow="Account / CEPP"
        description="เพิ่มวิธีชำระเงินอย่างปลอดภัย"
      >
        <Notice title="Secure card details · Stripe payment form">
          {backendEnabled
            ? "Stripe Elements integration is required."
            : "Only the last four digits and expiry are displayed here."}
        </Notice>
        <Field
          label="Cardholder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />
        <Field
          label="Card number · demo last four digits"
          value={number}
          onChange={(e) =>
            setNumber(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          maxLength={4}
          inputMode="numeric"
          placeholder="4242"
        />
        <div className="cepp-grid">
          <Field
            label="Expiry date"
            placeholder="08/2028"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <Field
            label="CVC"
            value=""
            disabled
            placeholder="Handled by Stripe"
          />
        </div>
        <Check checked={defaultCard} onChange={setDefault}>
          Set as default payment method
        </Check>
        <Notice title="Your payment data stays protected">
          ข้อมูลบัตรจะถูกจัดการโดย Stripe Only the card brand, last four digits
          and expiry appear in your saved cards.
        </Notice>
        <div className="cepp-row">
          <Button secondary onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save card</Button>
        </div>
      </Modal>
      <Modal
        open={!!remove}
        onClose={() => setRemove(null)}
        title="Remove payment method?"
        description="Choose another default before removing an active card."
      >
        <div className="cepp-row">
          <Button secondary onClick={() => setRemove(null)}>
            Cancel
          </Button>
          <Button
            danger
            disabled={!!remove?.default}
            onClick={() => {
              if (backendEnabled) {
                toast.info("Connect the payment-method deletion endpoint");
                return;
              }
              persist(list.filter((c) => c.id !== remove?.id));
              setRemove(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}
const mockCards: SavedCard[] = [
  {
    id: "visa",
    brand: "Visa",
    last4: "4242",
    expiry: "08/2028",
    name: "Test User",
    default: true,
  },
  {
    id: "mastercard",
    brand: "Mastercard",
    last4: "1881",
    expiry: "11/2027",
    name: "Test User",
    default: false,
  },
];

"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { notifySaved } from "@/lib/save-feedback";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import type { SavedCard } from "@/types/billing";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export default function CreditCardsPage() {
  const { model, update } = useAppState(),
    source = useApiData(api.cards, mockCards),
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
    notifySaved();
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
    <PageShell
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
            <DetailRows
              rows={[["Used for", "Personal / Enterprise A / Group 3"]]}
            />
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
        <TextField
          label="Cardholder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />
        <TextField
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
          <TextField
            label="Expiry date"
            placeholder="08/2028"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <TextField
            label="CVC"
            value=""
            disabled
            placeholder="Handled by Stripe"
          />
        </div>
        <Checkbox checked={defaultCard} onChange={setDefault}>
          Set as default payment method
        </Checkbox>
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
    </PageShell>
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

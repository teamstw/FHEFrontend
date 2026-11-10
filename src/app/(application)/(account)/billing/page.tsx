"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { Select } from "@/components/ui/select";
import { notifySaved } from "@/lib/save-feedback";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { download } from "@/lib/file-download";
import type { BillingSummary } from "@/types/billing";
import { BillingSplitPanel } from "@/features/billing/components/billing-split-panel";
import type { BillingSplit } from "@/types/billing";
import type { Group } from "@/types/workspace";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
export default function BillingPage() {
  const { model, update } = useAppState(),
    router = useRouter(),
    [scope, setScope] = useState("Enterprise A"),
    [budget, setBudget] = useState(model.budget || mockBilling.budget),
    [threshold, setThreshold] = useState(model.threshold || "80"),
    [pause, setPause] = useState(true),
    [plan, setPlan] = useState(false),
    [selectedPlan, setSelectedPlan] = useState("Team"),
    [cancel, setCancel] = useState(false),
    [invoice, setInvoice] = useState("");
  const authorization = useAuthorization({
    groups: mockBillingGroups,
    workspaces: mockWorkspaces,
  });
  const canManage = authorization.canManage(scope);
  useEffect(() => {
    setPlan(false);
    setCancel(false);
  }, [scope, canManage]);
  const groupSource = authorization.groupSource;
  const billingGroups = backendEnabled
    ? groupSource.data || []
    : model.groupsLoaded
      ? model.groups
      : groupSource.data || [];
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const contextOptions = Array.from(
    new Set([
      "Personal",
      "Enterprise A",
      ...billingGroups.flatMap((group) =>
        group.enterpriseName
          ? [group.enterpriseName, group.enterpriseName + " / " + group.name]
          : [],
      ),
    ]),
  );
  const loadBilling = useCallback(() => api.billing(scope), [scope]);
  const source = useApiData(loadBilling, mockBilling);
  const billing = backendEnabled
    ? source.data
    : scope === "Personal"
      ? mockPersonalBilling
      : scope.includes(" / ")
        ? mockGroupBilling
        : mockBilling;
  useEffect(() => {
    if (backendEnabled && source.data) {
      setBudget(source.data.budget);
      setThreshold(source.data.threshold);
    }
  }, [source.data]);
  useEffect(() => {
    if (!backendEnabled) {
      const preset =
        scope === "Personal"
          ? mockPersonalBilling
          : scope.includes(" / ")
            ? mockGroupBilling
            : mockBilling;
      const current = model.billingSettings?.[scope];
      setBudget(current?.budget || preset.budget);
      setThreshold(current?.threshold || preset.threshold);
    }
  }, [scope]);
  if (!billing)
    return (
      <PageShell title="Billing" description="ค่าใช้จ่ายตามพื้นที่ทำงาน">
        <Notice
          title={source.error ? "Unable to load billing" : "Loading billing…"}
        >
          {source.error || "Loading your billing context."}
        </Notice>
      </PageShell>
    );
  const additional = Math.max(0, billing.usage - billing.included),
    total = billing.planAmount + additional * billing.overageRate;
  return (
    <PageShell
      title="Billing"
      description="ค่าใช้จ่ายตามพื้นที่ทำงาน · ตัวเลขตัวอย่าง Demo / THB / excluding tax"
    >
      <Select
        label="Billing context / ผู้ชำระเงิน"
        value={scope}
        onChange={setScope}
        options={
          contextOptions.includes(scope)
            ? contextOptions
            : [...contextOptions, scope]
        }
      />
      <div className="cepp-row start wrap">
        <Badge>{scope} · selected</Badge>
        <Badge>Independent billing context</Badge>
      </div>
      <Notice title="Independent billing contexts">
        แต่ละ Billing context มีแพ็กเกจ การใช้งาน และใบแจ้งหนี้ของตัวเอง
        การแบ่งบิลด้านล่างจัดสรรเฉพาะยอดของ context ที่เลือก
        ไม่รวมยอดจากบิลอื่นอัตโนมัติ
      </Notice>
      <div className="cepp-grid three">
        {[
          [
            "Current plan · " +
              (model.billingSettings?.[scope]?.plan || billing.plan),
            "฿" + billing.planAmount.toLocaleString(),
            `Per month · includes ${billing.included.toLocaleString()} images`,
          ],
          [
            "Usage · " + billing.period,
            billing.usage.toLocaleString(),
            `${additional} additional images × ฿${billing.overageRate} = ฿${additional * billing.overageRate}`,
          ],
          [
            "Projected charge",
            "฿" + total.toLocaleString(),
            "Plan + usage · no tax in demo",
          ],
        ].map(([label, value, desc]) => (
          <Panel key={label}>
            <h3>{label}</h3>
            <strong style={{ fontSize: 30, lineHeight: "36px" }}>
              {value}
            </strong>
            <p className="cepp-muted">{desc}</p>
          </Panel>
        ))}
      </div>
      <BillingSplitPanel
        key={scope + ":" + canManage}
        canEdit={canManage}
        scope={scope}
        total={total}
        groups={billingGroups}
        name={model.name || "ฉัน"}
        saved={
          backendEnabled ? billing.split : model.billingSettings?.[scope]?.split
        }
        loading={scope !== "Personal" && groupSource.loading}
        error={scope !== "Personal" ? groupSource.error : ""}
        onRetry={() => void groupSource.refresh()}
        onSave={async (split: BillingSplit) => {
          if (!canManage)
            throw new Error("Only Owner or Admin can change billing");
          const savedScope = scope;
          if (backendEnabled) {
            await api.updateBilling({ scope: savedScope, split });
            if (scopeRef.current === savedScope)
              source.setData((current) =>
                current ? { ...current, split } : current,
              );
          }
          update((current) => ({
            ...current,
            billingSettings: {
              ...current.billingSettings,
              [savedScope]: {
                ...(current.billingSettings?.[savedScope] || {
                  budget,
                  threshold,
                }),
                split,
              },
            },
          }));
          toast.success("Saved billing split");
        }}
      />
      <Panel title={"Current context · " + scope}>
        <DetailRows
          rows={[
            ["Payer", scope + " · " + (model.name || mockProfile.name)],
            ["Your role", authorization.role(scope) || "Access unavailable"],
            ["Payment", billing.payment],
            ["Next billing date", billing.nextBillingDate],
          ]}
        />
        {canManage && (
          <div className="cepp-row start wrap">
            <Button onClick={() => setPlan(true)}>Change plan</Button>
            <Button secondary onClick={() => router.push("/credit-cards")}>
              Change payment method
            </Button>
            <Button danger secondary onClick={() => setCancel(true)}>
              Cancel plan
            </Button>
          </div>
        )}
      </Panel>
      <Panel title="Budget and limits">
        {canManage ? (
          <>
            <div className="cepp-grid">
              <TextField
                label="Monthly budget"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <TextField
                label="Alert threshold (%)"
                type="number"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <Checkbox checked={pause} onChange={setPause}>
              Pause new jobs when the monthly budget is reached
            </Checkbox>
            <p className="cepp-muted">
              Projected spend is ฿{total.toLocaleString()} / ฿
              {Number(budget).toLocaleString()} (
              {budget && Number(budget) > 0
                ? ((total / Number(budget)) * 100).toFixed(1)
                : "0"}
              %). ฿{Math.max(0, Number(budget) - total).toLocaleString()}{" "}
              remains.
            </p>
            <div>
              <Button
                onClick={async () => {
                  if (!canManage) return;
                  if (
                    !budget ||
                    Number(budget) < 0 ||
                    Number(threshold) < 1 ||
                    Number(threshold) > 100
                  ) {
                    toast.error("Enter a valid budget and threshold (1–100%)");
                    return;
                  }
                  try {
                    if (backendEnabled)
                      await api.updateBilling({
                        scope,
                        budget,
                        threshold,
                        pause,
                      });
                    update((m) => ({
                      ...m,
                      billingSettings: {
                        ...m.billingSettings,
                        [scope]: {
                          ...m.billingSettings?.[scope],
                          budget,
                          threshold,
                          pause,
                        },
                      },
                    }));
                    notifySaved();
                  } catch {
                    toast.error("Unable to save billing limits");
                  }
                }}
              >
                Save limits
              </Button>
            </div>
          </>
        ) : (
          <DetailRows
            rows={[
              ["Monthly budget", "฿" + Number(budget).toLocaleString()],
              ["Alert threshold", threshold + "%"],
              ["Pause when budget reached", pause ? "Enabled" : "Disabled"],
            ]}
          />
        )}
      </Panel>
      <Panel title={"Invoices · " + scope}>
        {billing.invoices.map((item) => (
          <Panel key={item.id}>
            <div className="cepp-row wrap">
              <div>
                <strong>{item.id}</strong>
                <p className="cepp-muted">
                  {item.date} · {item.amount} · {item.status}
                </p>
              </div>
              <Button secondary small onClick={() => setInvoice(item.id)}>
                {item.status === "Paid"
                  ? "View / download invoice"
                  : "View draft"}
              </Button>
            </div>
            <p className="cepp-muted">{item.description}</p>
          </Panel>
        ))}
      </Panel>
      {/* <Panel title="Separate context preview · Group 3">
        <p className="cepp-muted">
          Switch to Group 3 to manage its billing independently.
        </p>
        <DetailRows
          rows={[
            ["Payer / payment", "Group 3 · Pim Suri · Visa ••••4242"],
            ["Plan / included", "Group · ฿600/month · 500 images"],
            ["Usage / overage", "620 images · 120 × ฿2 = ฿240"],
            ["Projected charge", "฿840 = ฿600 + ฿240"],
            ["Budget / remaining", "฿1,000 / ฿160"],
          ]}
        />
        <div>
          <Button
            secondary
            onClick={() => {
              setScope("Enterprise A / Group 3");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Switch to Group 3 billing
          </Button>
        </div>
      </Panel> */}
      <Modal
        open={plan && canManage}
        onClose={() => setPlan(false)}
        title="Change plan"
      >
        <Select
          label="Plan"
          value={selectedPlan}
          onChange={setSelectedPlan}
          options={["Starter", "Team", "Group"]}
        />

        <Button
          onClick={() => {
            if (!canManage) return;
            if (backendEnabled) {
              toast.info("Connect subscription change endpoint");
              return;
            }
            update((m) => ({
              ...m,
              billingSettings: {
                ...m.billingSettings,
                [scope]: {
                  ...m.billingSettings?.[scope],
                  budget,
                  threshold,
                  plan: selectedPlan,
                },
              },
            }));
            setPlan(false);
            notifySaved();
          }}
        >
          Save plan
        </Button>
      </Modal>
      <Modal
        open={cancel && canManage}
        onClose={() => setCancel(false)}
        title="Cancel plan?"
        description="This changes only your local preview plan."
      >
        <Button
          danger
          onClick={() => {
            if (!canManage) return;
            if (backendEnabled) {
              toast.info("Connect subscription cancellation endpoint");
              return;
            }
            update((m) => ({
              ...m,
              billingSettings: {
                ...m.billingSettings,
                [scope]: {
                  ...m.billingSettings?.[scope],
                  budget,
                  threshold,
                  plan: "Starter",
                },
              },
            }));
            setCancel(false);
            notifySaved();
          }}
        >
          Confirm cancellation
        </Button>
      </Modal>
      <Modal open={!!invoice} onClose={() => setInvoice("")} title={invoice}>
        <Notice title="Demo invoice">
          This is sample invoice data from Figma and is not a tax document.
        </Notice>
        <DetailRows
          rows={[
            ["Context", scope],
            ["Projected charge", "฿" + total.toLocaleString()],
            ["Status", invoice.endsWith("02") ? "Paid" : "Draft"],
          ]}
        />
        <Button
          onClick={() =>
            download(
              invoice + "-demo.json",
              JSON.stringify({ invoice, scope, total, demo: true }, null, 2),
            )
          }
        >
          Download demo invoice
        </Button>
      </Modal>
    </PageShell>
  );
}
const mockProfile = {
  name: "Test User",
  email: "user1@example.com",
  privacy: false,
};
const mockInvoices = [
  {
    id: "INV-2026-03",
    date: "31 Mar 2026",
    amount: "฿1,480",
    status: "Draft projection",
    description: "Plan ฿1,000 + additional usage ฿480",
  },
  {
    id: "INV-2026-02",
    date: "28 Feb 2026",
    amount: "฿1,000",
    status: "Paid",
    description: "Team plan · no additional usage",
  },
];
const mockBilling: BillingSummary = {
  budget: "1500",
  threshold: "80",
  plan: "Team",
  usage: 1240,
  planAmount: 1000,
  included: 1000,
  overageRate: 2,
  period: "1–31 Mar 2026",
  role: "Enterprise Owner",
  payment: "Visa ••••4242 · expires 08/2028",
  nextBillingDate: "31 Mar 2026",
  invoices: mockInvoices,
};
const mockGroupBilling: BillingSummary = {
  ...mockBilling,
  plan: "Group",
  usage: 620,
  planAmount: 600,
  included: 500,
  role: "Group Admin",
  budget: "1000",
};
const mockPersonalBilling: BillingSummary = {
  ...mockBilling,
  plan: "Starter",
  usage: 32,
  planAmount: 0,
  included: 100,
  role: "Sole user",
  budget: "500",
};

// Example memberships for the billing recipient selector; API /groups supplies real memberships.
const mockBillingGroups: Group[] = [
  {
    id: "3",
    name: "Group 3",
    enterpriseName: "Enterprise A",
    role: "Admin",
    members: [],
    files: 0,
  },
  {
    id: "4",
    name: "Group 4",
    enterpriseName: "Enterprise A",
    role: "Member",
    members: [],
    files: 0,
  },
  {
    id: "5",
    name: "Group 5",
    enterpriseName: "Enterprise A",
    role: "Member",
    members: [],
    files: 0,
  },
];

const mockWorkspaces: import("@/types/workspace").WorkspaceOption[] = [
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
];

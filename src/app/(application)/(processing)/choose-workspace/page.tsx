"use client";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { getGroupEnterprise } from "@/lib/group-membership";
import type { WorkspaceOption } from "@/types/workspace";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChooseWorkspacePage() {
  const router = useRouter();
  const { model, scope, setScope } = useAppState();
  const source = useApiData(api.workspaces, mockWorkspaces);
  const enterpriseFor = (entry: WorkspaceOption) =>
    entry.enterpriseName || entry.name.split(" / ").slice(0, -1).join(" / ");
  const initialEnterprise =
    scope && scope !== "Personal" ? scope.split(" / ")[0] : "";
  const [workspace, chooseWorkspace] = useState(
    scope
      ? initialEnterprise
        ? `enterprise:${initialEnterprise}`
        : "personal"
      : "",
  );
  const inventory = source.data || [];
  const personal = inventory.find((entry) => entry.type === "personal");
  const enterprises = Array.from(
    new Set([
      ...(!backendEnabled && model.enterprise ? [model.enterprise] : []),
      ...(!backendEnabled && model.groupsLoaded
        ? model.groups.flatMap((group) => {
            const parent = getGroupEnterprise(
              group,
              model.enterprise || "Enterprise A",
            );
            return parent ? [parent] : [];
          })
        : []),
      ...inventory
        .filter((entry) => entry.type !== "personal")
        .map((entry) =>
          entry.type === "enterprise" ? entry.name : enterpriseFor(entry),
        )
        .filter(Boolean),
    ]),
  );
  const isEnterprise = workspace.startsWith("enterprise:");
  const enterprise = isEnterprise ? workspace.slice("enterprise:".length) : "";
  const selectedScope =
    workspace === "personal"
      ? personal?.name || ""
      : isEnterprise && enterprises.includes(enterprise)
        ? enterprise
        : "";
  const canContinue = !!selectedScope && !source.loading && !source.error;

  return (
    <main className="cepp-content cepp-workspace-choice">
      <p className="cepp-eyebrow">Upload / CEPP</p>
      <div className="cepp-heading">
        <h1>Choosing your workspace</h1>
        <p>เลือก workspace ที่จะใช้ทำงาน</p>
      </div>
      <form
        className="cepp-workspace-form"
        aria-busy={source.loading}
        onSubmit={(event) => {
          event.preventDefault();
          if (!canContinue) return;
          setScope(selectedScope);
          router.push("/upload");
        }}
      >
        <div
          className={`cepp-workspace-field${isEnterprise ? " has-icon" : ""}`}
        >
          <Select
            label="Workspace / พื้นที่ทำงาน"
            value={workspace}
            onChange={(value) => {
              chooseWorkspace(value);
            }}
            options={[
              {
                value: "",
                label: source.loading
                  ? "Loading workspaces…"
                  : "Choose a workspace",
              },
              ...(personal
                ? [{ value: "personal", label: personal.name }]
                : []),
              ...enterprises.map((name) => ({
                value: `enterprise:${name}`,
                label: name,
              })),
            ]}
          />
          {isEnterprise && (
            <img
              className="cepp-workspace-icon"
              src="/figma/fdc44.svg"
              width={16.1667}
              height={12.8333}
              alt=""
            />
          )}
          <img
            className="cepp-workspace-chevron"
            src={workspace ? "/figma/b572f.svg" : "/figma/d5aaa.svg"}
            width={16}
            height={16}
            alt=""
          />
        </div>
        {source.error && (
          <Notice
            title="Unable to load workspaces"
            action={
              <Button secondary onClick={() => source.refresh()}>
                Retry
              </Button>
            }
          >
            {source.error}
          </Notice>
        )}
        {!source.loading && !source.error && !inventory.length && (
          <Notice title="No workspaces available">
            ยังไม่มีพื้นที่ทำงานที่คุณสามารถใช้งานได้
          </Notice>
        )}
        <p className="cepp-workspace-hint">
          Personal เป็นพื้นที่ของคุณคนเดียว · Enterprise
          เป็นพื้นที่ทำงานร่วมกันขององค์กร
        </p>
        <div className="cepp-workspace-actions">
          <Button secondary onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canContinue}>
            Continue
          </Button>
        </div>
      </form>
    </main>
  );
}

// Page-local Figma fixtures. The configured API supplies this inventory instead.
const mockWorkspaces: WorkspaceOption[] = [
  { id: "personal", name: "Personal", type: "personal" },
  { id: "enterprise-a", name: "Enterprise A", type: "enterprise" },
  { id: "enterprise-b", name: "Enterprise B", type: "enterprise" },
];

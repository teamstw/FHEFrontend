"use client";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { type WorkspaceState } from "@/features/workspaces/hooks/use-workspace-management";
import { backendEnabled } from "@/lib/api/backend-api";
import { toast } from "sonner";
export function WorkspaceDialogs({ workspace }: { workspace: WorkspaceState }) {
  const {
    mockMembers,
    view,
    availableEnterprises,
    groupEnterprise,
    setGroupEnterprise,
    modal,
    setModal,
    name,
    setName,
    email,
    setEmail,
    pending,
    invites,
    setInvites,
    enterprise,
    list,
    persist,
    log,
    create,
    authorization,
    enterpriseAdmin,
    enterpriseRole,
    admin,
  } = workspace;
  return (
    <>
      <Modal
        open={
          (modal === "enterprise" && authorization.canCreateGroup(null)) ||
          (modal === "group" &&
            authorization.canCreateGroup(
              view === "groups" ? groupEnterprise : workspace.activeEnterprise,
            ))
        }
        onClose={() => setModal("")}
        title={modal === "group" ? "Create group" : "Create enterprise"}
      >
        <TextField
          label="Name"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
        />
        {modal === "group" && view === "groups" && (
          <Select
            label="Enterprise / สังกัด"
            value={groupEnterprise || ""}
            onChange={(value) => setGroupEnterprise(value || null)}
            options={[
              { value: "", label: "No enterprise (Independent group)" },
              ...availableEnterprises
                .filter((value) => authorization.canManage(value))
                .map((value) => ({ value, label: value })),
            ]}
          />
        )}
        <div className="cepp-row">
          <Button secondary onClick={() => setModal("")}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={create}>
            Create
          </Button>
        </div>
      </Modal>
      <Modal
        open={modal === "invited"}
        onClose={() => setModal("")}
        title="Invited Group"
        description="คำเชิญเข้าร่วมกลุ่ม"
        wide
      >
        {invites.map((g, i) => (
          <Panel key={g}>
            <div className="cepp-row wrap">
              <div>
                <h3>{g}</h3>
                <p className="cepp-muted">
                  {i === 0 ? 4 : i + 1} Members · {i === 0 ? 4 : i} Files
                </p>
              </div>
              <div className="cepp-row wrap">
                <Button
                  secondary
                  small
                  onClick={() =>
                    toast.info(g + " · " + enterprise + " · invitation preview")
                  }
                >
                  View
                </Button>
                <Button
                  small
                  onClick={() => {
                    if (backendEnabled) {
                      toast.info("Connect invitation acceptance endpoint");
                      return;
                    }
                    persist([
                      ...list,
                      {
                        id: crypto.randomUUID(),
                        name: g,
                        enterpriseName: enterprise,
                        role: "Member",
                        members: mockMembers,
                        files: 4,
                      },
                    ]);
                    setInvites((v) => v.filter((x) => x !== g));
                  }}
                >
                  Accept
                </Button>
                <Button
                  secondary
                  danger
                  small
                  onClick={() => {
                    if (backendEnabled) {
                      toast.info("Connect invitation rejection endpoint");
                      return;
                    }
                    setInvites((v) => v.filter((x) => x !== g));
                    toast.info("Invitation rejected");
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Panel>
        ))}
        {!invites.length && (
          <Notice title="No pending invitations">
            Your invitations have been handled.
          </Notice>
        )}
      </Modal>
      <Modal
        open={
          modal.startsWith("Invite") &&
          (modal.includes("enterprise") ? enterpriseAdmin : admin)
        }
        onClose={() => setModal("")}
        title={modal}
      >
        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)}
          onClick={() => {
            if (modal.includes("enterprise") ? !enterpriseAdmin : !admin)
              return;
            if (backendEnabled) {
              toast.info("Connect invitation endpoint");
              return;
            }
            log("Invitation prepared for " + email);
            toast.success("Invitation prepared");
            setModal("");
          }}
        >
          Invite member
        </Button>
      </Modal>
      <Modal
        open={modal === "delete" && enterpriseAdmin}
        onClose={() => setModal("")}
        title={"Delete " + pending?.name + "?"}
        description="Review shared jobs, keys and members before removing this group."
      >
        <div className="cepp-row">
          <Button secondary onClick={() => setModal("")}>
            Cancel
          </Button>
          <Button
            danger
            onClick={() => {
              if (!enterpriseAdmin) return;
              if (backendEnabled) {
                toast.info("Connect authorized group deletion endpoint");
                return;
              }
              persist(list.filter((g) => g.id !== pending?.id));
              log("Removed " + pending?.name);
              setModal("");
            }}
          >
            Delete group
          </Button>
        </div>
      </Modal>
      <Modal
        open={modal.startsWith("Transfer") && enterpriseRole === "Owner"}
        onClose={() => setModal("")}
        title="Transfer enterprise ownership"
      >
        <Notice title="Owner-only enterprise action" warning>
          Ownership transfer requires the authenticated backend and confirmation
          by the new owner. No real permissions are changed in this preview.
        </Notice>
        <Button secondary onClick={() => setModal("")}>
          Close
        </Button>
      </Modal>
    </>
  );
}

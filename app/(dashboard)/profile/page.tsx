"use client";
import { Shell } from "@/components/layout/page-shell";
import { Icon } from "@/components/ui/brand-icon";
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
import { download } from "@/lib/download";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export default function ProfilePage() {
  const { model, update } = useCepp(),
    source = useData(api.profile, mockProfile),
    [name, setName] = useState(model.name || mockProfile.name),
    [privacy, setPrivacy] = useState(model.privacy),
    [confirm, setConfirm] = useState(false),
    [avatar, setAvatar] = useState(""),
    router = useRouter();
  const saveProfile = async (data: unknown) => {
    try {
      if (backendEnabled) await api.updateProfile(data);
      update((m) => ({ ...m, name: name.trim() || m.name, privacy }));
      saved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save");
    }
  };
  return (
    <Shell
      title="Profile"
      description="ข้อมูลบัญชีและความเป็นส่วนตัวของคุณ"
      wide
    >
      <div className="cepp-grid">
        <Panel title="Identity / ข้อมูลส่วนตัว">
          <div className="cepp-row wrap">
            <div className="cepp-row">
              <span className="cepp-avatar">{avatar || "TU"}</span>
              <div>
                <strong>{model.name || source.data?.name}</strong>
                <p className="cepp-muted">@user1 · fictional demo account</p>
              </div>
            </div>
            <Button
              secondary
              small
              onClick={() => setAvatar(avatar === "TU" ? "ZT" : "TU")}
            >
              Edit avatar
            </Button>
          </div>
          <Field
            label="Display name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label="Email"
            value={source.data?.email || ""}
            readOnly
            hint="Verified through Google OAuth. Email is managed by your Google account."
          />
          <div className="cepp-row start">
            <Button
              disabled={!name.trim()}
              onClick={() => saveProfile({ name: name.trim() })}
            >
              Save name
            </Button>
            <Badge tone="green">Verified</Badge>
          </div>
        </Panel>
        <Panel title="Account and sign-in">
          <div className="cepp-row">
            <strong>
              <Icon name="google" size={19} /> Google OAuth
            </strong>
            <Badge tone="green">Connected</Badge>
          </div>
          <Rows
            rows={[
              ["Account ID", "usr_••••1024"],
              ["Member since", "25 Feb 2026"],
              ["Last sign-in", "2 Mar 2026 · 09:24 ICT"],
            ]}
          />
          <p className="cepp-muted">
            Sign-in is handled by Google. CEPP does not store a Google password.
          </p>
          <div>
            <Button
              secondary
              onClick={() =>
                backendEnabled
                  ? window.location.assign(api.signInUrl())
                  : toast.info(
                      "Configure the backend Google OAuth connection first.",
                    )
              }
            >
              Manage Google connection
            </Button>
          </div>
        </Panel>
      </div>
      {source.error && <p className="cepp-alert">{source.error}</p>}
      <Panel title="Consent and privacy / ความยินยอม">
        <Check checked onChange={() => {}} disabled>
          I agree to the Terms and processing policy · accepted 25 Feb 2026
        </Check>
        <Check checked onChange={() => {}} disabled>
          Receive essential security and job notifications
        </Check>
        <Check checked={privacy} onChange={setPrivacy}>
          Receive product updates and optional analytics
        </Check>
        <Notice title="Your privacy choices">
          Optional preferences can be changed at any time. Essential security
          notices remain enabled. Shared workspace content is governed by its
          workspace policy.
        </Notice>
        <div className="cepp-row start wrap">
          <Button onClick={() => saveProfile({ privacy })}>
            Save privacy preferences
          </Button>
          <Button secondary onClick={() => router.push("/privacy")}>
            View privacy policy
          </Button>
        </div>
      </Panel>
      <Panel title="Export your data">
        <p className="cepp-muted">
          Request a copy of your profile, workspace memberships, billing records
          and job metadata. Secret-key backups are not included in an account
          export.
        </p>
        <div>
          <Button
            secondary
            onClick={() =>
              download(
                "cepp-account-export.json",
                JSON.stringify(
                  {
                    ...model,
                    cards: model.cards.map(({ last4, brand }) => ({
                      last4,
                      brand,
                    })),
                  },
                  null,
                  2,
                ),
              )
            }
          >
            Export my data
          </Button>
        </div>
      </Panel>
      <Panel title="Danger zone / ลบบัญชี">
        <Notice title="Deleting your account is irreversible" warning>
          Export your records and retain all key backups first. Transfer any
          enterprise or group ownership before deletion.
        </Notice>
        <div>
          <Button danger secondary onClick={() => setConfirm(true)}>
            Delete account
          </Button>
        </div>
      </Panel>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete account?"
        description="This action needs the account deletion backend."
      >
        <Notice title="Account deletion is not connected" warning>
          No account will be deleted in local preview. Implement the ownership
          checks and authenticated deletion endpoint first.
        </Notice>
        <Button secondary onClick={() => setConfirm(false)}>
          Close
        </Button>
      </Modal>
    </Shell>
  );
}
const mockProfile = {
  name: "Test User",
  email: "user1@example.com",
  privacy: false,
};

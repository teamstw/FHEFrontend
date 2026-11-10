"use client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { avatarDataUrl, prepareAvatar, storeAvatar } from "@/lib/avatar-image";
import { PageShell } from "@/components/layout/page-shell";
import { AppIcon } from "@/components/ui/app-icon";
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
import { download } from "@/lib/file-download";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
export default function ProfilePage() {
  const { data: session } = useSession();
  const { model, update, ready } = useAppState(),
    source = useApiData(api.profile, mockProfile),
    [name, setName] = useState(model.name || mockProfile.name),
    [privacy, setPrivacy] = useState(model.privacy),
    [confirm, setConfirm] = useState(false),
    [avatarEditor, setAvatarEditor] = useState(false),
    [avatarFile, setAvatarFile] = useState<File | null>(null),
    [avatarPreview, setAvatarPreview] = useState(""),
    [avatarError, setAvatarError] = useState(""),
    [avatarReading, setAvatarReading] = useState(false),
    [avatarSaving, setAvatarSaving] = useState(false),
    router = useRouter();
  const avatarInput = useRef<HTMLInputElement>(null);
  const avatarRequest = useRef(0);
  const currentAvatar =
    model.avatarUrl || source.data?.avatarUrl || session?.user?.image || "";
  const displayName = model.name || source.data?.name || "Test User";
  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );
  useEffect(
    () => () => {
      avatarRequest.current++;
    },
    [],
  );
  const resetAvatarEditor = () => {
    avatarRequest.current++;
    setAvatarEditor(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    setAvatarReading(false);
  };
  const chooseAvatar = async (file: File | undefined) => {
    if (!file) return;
    const request = ++avatarRequest.current;
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarError("");
    setAvatarReading(true);
    try {
      const prepared = await prepareAvatar(file);
      if (request !== avatarRequest.current) return;
      setAvatarFile(prepared);
      setAvatarPreview(URL.createObjectURL(prepared));
    } catch (error) {
      if (request === avatarRequest.current)
        setAvatarError(
          error instanceof Error ? error.message : "Unable to read image",
        );
    } finally {
      if (request === avatarRequest.current) setAvatarReading(false);
    }
  };
  const saveAvatar = async () => {
    if (!ready || !avatarFile || avatarReading || avatarSaving) return;
    setAvatarSaving(true);
    setAvatarError("");
    try {
      const avatarUrl = backendEnabled
        ? (await api.updateAvatar(avatarFile)).avatarUrl
        : await avatarDataUrl(avatarFile);
      if (typeof avatarUrl !== "string" || !avatarUrl.trim())
        throw new Error("Backend did not return an avatar URL");
      if (!backendEnabled) storeAvatar(session?.user?.email || "", avatarUrl);
      update((model) => ({ ...model, avatarUrl }));
      source.setData((profile) => ({ ...profile, avatarUrl }));
      resetAvatarEditor();
      notifySaved();
    } catch (error) {
      setAvatarError(
        error instanceof Error ? error.message : "Unable to save avatar",
      );
    } finally {
      setAvatarSaving(false);
    }
  };
  const saveProfile = async (data: unknown) => {
    try {
      if (backendEnabled) await api.updateProfile(data);
      update((m) => ({ ...m, name: name.trim() || m.name, privacy }));
      notifySaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save");
    }
  };
  return (
    <PageShell
      title="Profile"
      description="ข้อมูลบัญชีและความเป็นส่วนตัวของคุณ"
      wide
    >
      <div className="cepp-grid">
        <Panel title="Identity / ข้อมูลส่วนตัว">
          <div className="cepp-row wrap">
            <div className="cepp-row">
              <UserAvatar src={currentAvatar} name={displayName} />
              <div>
                <strong>{model.name || source.data?.name}</strong>
                <p className="cepp-muted">{session?.user?.email}</p>
              </div>
            </div>
            <Button
              secondary
              small
              disabled={!ready}
              onClick={() => setAvatarEditor(true)}
            >
              Edit avatar
            </Button>
          </div>
          <TextField
            label="Display name"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            value={session?.user?.email || ""}
            readOnly
            hint="Verified through Google OAuth. Email is managed by your Google account."
          />
          <div className="cepp-row start cepp-profile-name-actions">
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
              <AppIcon name="google" size={19} /> Google OAuth
            </strong>
            <Badge tone="green">Connected</Badge>
          </div>
          <DetailRows
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
              onClick={() => void signIn("google", { callbackUrl: "/profile" })}
            >
              Manage Google connection
            </Button>
          </div>
        </Panel>
      </div>
      {source.error && <p className="cepp-alert">{source.error}</p>}
      <Modal
        open={avatarEditor}
        onClose={() => {
          if (!avatarSaving) resetAvatarEditor();
        }}
        title="Edit avatar"
        description="เลือกรูปภาพสำหรับโปรไฟล์ของคุณ"
      >
        <div className="cepp-avatar-editor">
          <UserAvatar
            src={avatarPreview || currentAvatar}
            name={displayName}
            className="cepp-avatar-preview"
          />
          <p className="cepp-muted">JPG, PNG หรือ WebP · ขนาดไม่เกิน 5 MB</p>
          <input
            ref={avatarInput}
            type="file"
            hidden
            aria-label="Avatar image"
            accept="image/jpeg,image/png,image/webp"
            disabled={avatarReading || avatarSaving}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void chooseAvatar(file);
            }}
          />
          <Button
            secondary
            disabled={avatarReading || avatarSaving}
            onClick={() => avatarInput.current?.click()}
          >
            {avatarReading
              ? "Preparing image…"
              : avatarFile
                ? "Change image"
                : "Choose image"}
          </Button>
          {avatarError && (
            <p className="cepp-alert" role="alert">
              {avatarError}
            </p>
          )}
        </div>
        <div className="cepp-row start wrap cepp-avatar-actions">
          <Button secondary disabled={avatarSaving} onClick={resetAvatarEditor}>
            Cancel
          </Button>
          <Button
            disabled={!avatarFile || avatarReading || avatarSaving}
            onClick={() => void saveAvatar()}
          >
            {avatarSaving ? "Saving…" : "Save avatar"}
          </Button>
        </div>
      </Modal>
      {/* <Panel title="Consent and privacy / ความยินยอม">
        <Checkbox checked onChange={() => {}} disabled>
          I agree to the Terms and processing policy · accepted 25 Feb 2026
        </Checkbox>
        <Checkbox checked onChange={() => {}} disabled>
          Receive essential security and job notifications
        </Checkbox>
        <Checkbox checked={privacy} onChange={setPrivacy}>
          Receive product updates and optional analytics
        </Checkbox>
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
      </Panel> */}
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
    </PageShell>
  );
}
const mockProfile = {
  avatarUrl: "",
  name: "Test User",
  email: "user1@example.com",
  privacy: false,
};

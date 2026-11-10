"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { canManageRole } from "@/lib/authorization";
import { PageShell } from "@/components/layout/page-shell";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { DetailRows } from "@/components/ui/detail-rows";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { WorkflowSteps } from "@/features/jobs/components/workflow-steps";
import { KeyGenerationDialog } from "@/features/keys/components/key-generation-dialog";
import { GroupMultiSelect } from "@/features/workspaces/components/group-multi-select";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { fileWorkspace } from "@/lib/local-file-storage";
import { StoredFilePicker } from "@/features/files/components/stored-file-picker";
import type { StoredFile, FileFolder } from "@/types/file-storage";
import type { Group } from "@/types/workspace";
import type { Job } from "@/types/job";
import type { KeyRecord } from "@/types/key";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
export default function UploadPage() {
  const {
      files,
      setFiles,
      sourceFiles,
      setSourceFiles,
      scope,
      selectedGroups,
      setSelectedGroups,
      model,
      ready,
      update,
      setActiveJob,
    } = useAppState(),
    router = useRouter(),
    input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false),
    [open, setOpen] = useState(false),
    [pickerOpen, setPickerOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [all, setAll] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (ready && !scope) router.replace("/choose-workspace");
  }, [ready, scope, router]);
  const isEnterprise = !!scope && scope !== "Personal";
  const loadGroups = useCallback(
    () =>
      isEnterprise ? api.workspaceGroups(scope) : Promise.resolve<Group[]>([]),
    [isEnterprise, scope],
  );
  const groupSource = useApiData(loadGroups, mockGroups);
  const authorization = useAuthorization({
    groups: mockGroups,
    workspaces: mockWorkspaces,
  });
  const canManage = authorization.canManage(scope);
  const groups = (
    !backendEnabled && model.groupsLoaded
      ? model.groups
      : groupSource.data || []
  )
    .filter((group) => group.enterpriseName === scope)
    .filter(
      (group, index, all) =>
        all.findIndex((item) => item.id === group.id) === index,
    );
  const groupsForJob = isEnterprise
    ? groups
        .filter((group) =>
          selectedGroups.some((selected) => selected.id === group.id),
        )
        .map(({ id, name }) => ({ id, name }))
    : [];
  const batch = [
    ...files.map((file) => ({
      name: file.name,
      size: file.size,
      stored: false,
    })),
    ...sourceFiles.map((file) => ({
      name: file.name,
      size: file.sizeBytes,
      stored: true,
    })),
  ];
  const sourceScopeMatches = sourceFiles.every(
    (file) => fileWorkspace(file.scope) === scope,
  );
  const canGenerate =
    canManage &&
    groupsForJob.every((selected) =>
      canManageRole(groups.find((group) => group.id === selected.id)?.role),
    ) &&
    !!batch.length &&
    !!scope &&
    sourceScopeMatches &&
    (!isEnterprise ||
      (!groupSource.loading && !groupSource.error && groupsForJob.length > 0));
  function add(incoming: File[]) {
    if (!canManage) return;
    const valid = incoming.filter(
      (f) => /\.(jpe?g|png|mp4)$/i.test(f.name) && f.size > 0,
    );
    if (valid.length !== incoming.length)
      setError("รองรับไฟล์ .jpg, .png และ .mp4 ที่ไม่ว่างเท่านั้น");
    else setError("");
    setFiles([
      ...files,
      ...valid.filter(
        (f) =>
          !files.some(
            (old) =>
              old.name === f.name &&
              old.size === f.size &&
              old.lastModified === f.lastModified,
          ),
      ),
    ]);
    if (input.current) input.current.value = "";
  }
  const total = batch.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
  async function start(key: KeyRecord) {
    if (!canGenerate) {
      setError("เลือกไฟล์และกลุ่มที่ต้องการก่อนเริ่มประมวลผล");
      return;
    }
    setBusy(true);
    try {
      let job: Job;
      if (backendEnabled) {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        form.append("scope", scope);
        form.append(
          "sourceFileIds",
          JSON.stringify(sourceFiles.map((file) => file.id)),
        );
        if (sourceFiles[0]?.folderId)
          form.append("folderId", sourceFiles[0].folderId);
        form.append(
          "groupIds",
          JSON.stringify(groupsForJob.map((group) => group.id)),
        );
        form.append("keyId", key.id);
        form.append("version", String(key.version));
        job = await api.createJob(form);
      } else
        job = {
          id: "LOCAL-" + crypto.randomUUID(),
          name: "Face Detection - Batch " + new Date().toLocaleTimeString(),
          files: batch.map((f) => f.name),
          sourceFileIds: sourceFiles.map((file) => file.id),
          folderId: sourceFiles[0]?.folderId || null,
          count: batch.length,
          size: total.toFixed(1) + " MB",
          scope,
          groupIds: groupsForJob.map((group) => group.id),
          groupNames: groupsForJob.map((group) => group.name),
          keyId: key.id,
          version: key.version,
          status: "Processing",
          date: new Date().toLocaleDateString("en-GB"),
          result: "demo_batch_metadata.json",
          demo: true,
        };
      update((m) => ({ ...m, jobs: [job, ...m.jobs] }));
      setActiveJob(job);
      router.push("/progress");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create job");
    } finally {
      setBusy(false);
    }
  }
  if (!scope) return null;
  if (!canManage)
    return (
      <PageShell
        title="Upload"
        section="Upload"
        description="พื้นที่ทำงานที่เลือก"
      >
        <DetailRows
          rows={[
            ["Workspace", scope],
            ["Your role", authorization.role(scope) || "Access unavailable"],
          ]}
        />
        <p className="cepp-muted">
          เฉพาะ Owner หรือ Admin ของพื้นที่นี้เท่านั้นที่เพิ่มไฟล์และเริ่มงานได้
        </p>
        <Button secondary onClick={() => router.push("/choose-workspace")}>
          Change workspace
        </Button>
      </PageShell>
    );
  return (
    <PageShell
      title={canGenerate ? "Ready to generate a key" : "Upload"}
      description={
        batch.length
          ? "ตรวจสอบไฟล์และพื้นที่ทำงานก่อนเริ่มประมวลผล"
          : "นำเข้าไฟล์เพื่อประมวลผล Face Detection อย่างปลอดภัย"
      }
      section="Upload"
    >
      <WorkflowSteps step={1} />
      <div className="cepp-row start wrap cepp-upload-source-actions">
        <Button secondary disabled={busy} onClick={() => setPickerOpen(true)}>
          Select from My File
        </Button>
        <span className="cepp-muted">เลือกไฟล์ต้นฉบับจาก Workspace นี้</span>
      </div>
      <input
        ref={input}
        hidden
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.mp4"
        onChange={(e) => add(Array.from(e.target.files || []))}
      />
      {batch.length === 0 ? (
        <button
          className={"cepp-dropzone " + (drag ? "drag" : "")}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(Array.from(e.dataTransfer.files));
          }}
        >
          <AppIcon name="upload" size={24} />
          <strong>Drag &amp; Drop ไฟล์ หรือ คลิกเพื่อเลือก</strong>
          <p className="cepp-muted">รองรับไฟล์ภาพ, วิดีโอ (.jpg, .png, .mp4)</p>
        </button>
      ) : (
        <Panel title={`Batch / ${batch.length} files`}>
          <div className="cepp-row">
            <p className="cepp-muted">
              JPG / PNG / MP4 · {total.toFixed(1)} MB total
            </p>
            <Button
              secondary
              small
              onClick={() => {
                setFiles([]);
                setSourceFiles([]);
              }}
            >
              Clear all
            </Button>
          </div>
          {batch.slice(0, all ? batch.length : 3).map((f, i) => (
            <div className="cepp-file-row" key={f.name + i}>
              <AppIcon name="upload" />
              <div>
                <p>{f.name}</p>
                <small>
                  {f.name.split(".").pop()?.toUpperCase()} ·{" "}
                  {(f.size / 1024 / 1024).toFixed(1)} MB{" "}
                  {f.stored ? "· From My File" : ""}
                </small>
              </div>
              <Button
                secondary
                small
                onClick={() => {
                  if (i < files.length)
                    setFiles(files.filter((_, j) => j !== i));
                  else
                    setSourceFiles(
                      sourceFiles.filter((_, j) => j !== i - files.length),
                    );
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {batch.length > 3 && !all && (
            <button className="cepp-muted" onClick={() => setAll(true)}>
              + {batch.length - 3} files · View all files
            </button>
          )}
          <div>
            <Button secondary onClick={() => input.current?.click()}>
              Add files
            </Button>
          </div>
        </Panel>
      )}
      {!sourceScopeMatches && (
        <Notice title="Workspace does not match">
          ไฟล์ต้นฉบับต้องอยู่ใน Workspace เดียวกับงาน เลือก Workspace
          เดิมหรือนำไฟล์ออกจาก Batch
        </Notice>
      )}
      {error && (
        <p className="cepp-alert" role="alert">
          {error}
        </p>
      )}
      <Panel className="cepp-selected-workspace">
        <div className="cepp-row wrap">
          <div>
            <p className="cepp-muted">Workspace / พื้นที่ทำงาน</p>
            <strong>{scope}</strong>
          </div>
          <Button
            secondary
            small
            onClick={() => router.push("/choose-workspace")}
          >
            Change workspace
          </Button>
        </div>
      </Panel>
      {isEnterprise && (
        <>
          <GroupMultiSelect
            options={groups.filter((group) => canManageRole(group.role))}
            value={groupsForJob}
            onChange={setSelectedGroups}
            loading={groupSource.loading}
            disabled={groupSource.loading || !!groupSource.error}
          />
          {groupSource.error && (
            <Notice
              title="Unable to load groups"
              action={
                <Button secondary onClick={() => groupSource.refresh()}>
                  Retry
                </Button>
              }
            >
              {groupSource.error}
            </Notice>
          )}
          {!groupSource.loading && !groupSource.error && !groups.length && (
            <Notice title="No groups available">
              ยังไม่มีกลุ่มที่คุณสามารถใช้งานได้ใน Enterprise นี้
            </Notice>
          )}
          <p className="cepp-muted">
            เลือกได้มากกว่า 1 กลุ่ม · เลือกอย่างน้อย 1 กลุ่มก่อนสร้าง Key
          </p>
        </>
      )}
      {canGenerate && (
        <Notice title={`Ready · Batch / ${batch.length} files`}>
          Files validated. This job belongs to {scope}
          {groupsForJob.length
            ? ` / ${groupsForJob.map((group) => group.name).join(", ")}`
            : ""}
          . The selected key and version will be recorded with the job.
        </Notice>
      )}
      <div className="cepp-row start wrap">
        <Button disabled={!canGenerate || busy} onClick={() => setOpen(true)}>
          Generate Key
        </Button>
        {batch.length > 0 && scope ? (
          <Button
            secondary
            onClick={() => {
              setFiles([]);
              setSourceFiles([]);
            }}
          >
            Clear batch
          </Button>
        ) : (
          <span className="cepp-muted">
            Choose a valid file and workspace to continue.{" "}
            {isEnterprise && "Select at least one group."}
          </span>
        )}
      </div>
      {pickerOpen && (
        <StoredFilePicker
          key={scope}
          scope={scope}
          selectedIds={sourceFiles.map((file) => file.id)}
          mockFiles={mockStoredFiles}
          mockFolders={mockFileFolders}
          onClose={() => setPickerOpen(false)}
          onConfirm={(selected) => {
            setSourceFiles([
              ...sourceFiles,
              ...selected.filter(
                (file) =>
                  !sourceFiles.some((existing) => existing.id === file.id),
              ),
            ]);
            setError("");
            setPickerOpen(false);
          }}
        />
      )}
      {open && canGenerate && (
        <KeyGenerationDialog
          open={open}
          onClose={() => setOpen(false)}
          onReady={start}
          groups={groupsForJob}
          fixtureGroups={mockGroups}
          fixtureWorkspaces={mockWorkspaces}
        />
      )}
    </PageShell>
  );
}

// Page-local Figma fixtures; the scoped group endpoint is used when configured.
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Group 1",
    enterpriseName: "Enterprise A",
    role: "Owner",
    members: [],
    files: 4,
  },
  {
    id: "2",
    name: "Group 2",
    enterpriseName: "Enterprise A",
    role: "Member",
    members: [],
    files: 1,
  },
  {
    id: "3",
    name: "Group 3",
    enterpriseName: "Enterprise A",
    role: "Admin",
    members: [],
    files: 2,
  },
  {
    id: "enterprise-b-group",
    name: "Product team",
    enterpriseName: "Enterprise B",
    role: "Member",
    members: [],
    files: 2,
  },
];

const mockStoredFiles: StoredFile[] = [
  {
    id: "source-001",
    name: "photo-samples.jpg",
    sizeBytes: 2457600,
    mimeType: "image/jpeg",
    scope: "Personal",
    date: "28 Feb 2026",
    folderId: null,
    demo: true,
  },
  {
    id: "source-002",
    name: "street-camera.mp4",
    sizeBytes: 50541363,
    mimeType: "video/mp4",
    scope: "Enterprise A",
    date: "25 Feb 2026",
    folderId: null,
    demo: true,
  },
  {
    id: "source-003",
    name: "drone-flight.mp4",
    sizeBytes: 164416717,
    mimeType: "video/mp4",
    scope: "Personal",
    date: "2 Mar 2026",
    folderId: "folder-captures",
    demo: true,
  },
];
const mockFileFolders: FileFolder[] = [
  {
    id: "folder-captures",
    name: "Field captures",
    scope: "Personal",
    parentId: null,
  },
  {
    id: "folder-survey",
    name: "Site survey",
    scope: "Enterprise A",
    parentId: null,
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

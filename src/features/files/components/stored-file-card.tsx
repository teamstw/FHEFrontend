"use client";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { formatFileSize, supportsFhe } from "@/lib/local-file-storage";
import type { StoredFile } from "@/types/file-storage";

export function StoredFileCard({
  canManage,
  file,
  downloading,
  downloadDisabled,
  onView,
  onDownload,
  onProcess,
  onMove,
}: {
  canManage: boolean;
  file: StoredFile;
  downloading: boolean;
  downloadDisabled: boolean;
  onView: () => void;
  onDownload: () => void;
  onProcess: () => void;
  onMove: () => void;
}) {
  return (
    <Panel className="cepp-library-file-card">
      <div className="cepp-row wrap">
        <div className="cepp-library-file-name">
          <AppIcon name="upload" size={20} />
          <h3>{file.name}</h3>
        </div>
        <div className="cepp-row cepp-job-card-actions">
          <Button small secondary onClick={onView}>
            View
          </Button>
          <Button
            small
            secondary
            disabled={downloadDisabled}
            onClick={onDownload}
          >
            {downloading ? "Downloading…" : "Download"}
          </Button>
        </div>
      </div>
      <p className="cepp-muted cepp-mono">
        {formatFileSize(file.sizeBytes)} · {file.date}
      </p>
      <p className="cepp-muted">{file.scope}</p>
      {canManage && (
        <div className="cepp-library-file-footer">
          <Button
            small
            secondary
            disabled={!supportsFhe(file)}
            title={
              supportsFhe(file)
                ? "Process a new copy with FHE"
                : "FHE supports JPG, PNG and MP4"
            }
            onClick={onProcess}
          >
            Process with FHE
          </Button>
          <Button small secondary onClick={onMove}>
            Move
          </Button>
        </div>
      )}
    </Panel>
  );
}

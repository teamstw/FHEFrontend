# My File: originals, FHE results and folders

My File has two sections on the same page. Original files are independent stored
objects. FHE results are new artifacts belonging to completed jobs. Processing
jobs stay in History and are excluded from My File, including legacy local records.

## Data model

- StoredFile: id, name, sizeBytes, mimeType, scope, date, folderId and optional demo.
- FileFolder: id, name, scope and parentId (null at the workspace root).
- Job retains its job ID and key/version. sourceFileIds links existing original
  files; resultFileId identifies a separate output artifact; folderId places that
  output in the library. Missing folderId is the root for backward compatibility.
- FHE processing does not change an original file's identity, bytes or classification.
  Reprocessing it creates another job and another resultFileId, even for identical
  names/inputs. Originals and outputs may be moved independently.
- Decryption and processing remain separate: only Completed jobs enter FHE results;
  encrypted outputs show View/Decrypt, decrypted outputs show View/Download.

## User flow

1. Choose a workspace and create/open folders (nested folders are supported).
2. Upload original files into that location. Originals can be viewed, downloaded,
   moved and, for JPG/PNG/MP4, sent to FHE using Process with FHE.
3. The upload workflow receives stored-file references and the source workspace.
   Users may add new device files, remove inputs or select Enterprise groups there.
   Cross-workspace references block key generation and must be rejected by the server.
4. A job is created with sourceFileIds; existing stored files are not reuploaded.
5. On completion, the server creates a new result artifact, supplies resultFileId,
   and keeps the originals unchanged. The new file appears in FHE results.

Folder navigation is shared by both sections. Workspace filtering resets the folder
location. Search is limited to the current folder and selected workspace. Names
are trimmed, limited to 80 characters and must be unique among siblings in the same
workspace (case-insensitive); separators and control characters are rejected.
Move dialogs list only folders within the file's workspace. Backend authorization
must also enforce this independently of the UI.

## Local behavior

Page-local fixtures remain at the bottom of src/app/(application)/(account)/my-file/page.tsx.
Browser metadata in cepp-ui-v2 adds storedFiles and fileFolders, with empty defaults
for old data. Original upload bytes are stored in IndexedDB cepp-original-files,
not JSON/localStorage, and can be downloaded after refresh. No secret key material
is stored there. Fixture originals download clearly named metadata JSON; uploaded
originals download their actual bytes. FHE remains a local metadata simulation.

The selected sourceFiles are transient workflow state; refreshing Upload requires
selecting the source again from My File. A local completed job gets a new resultFileId.
The real backend must own completion and artifact creation in its database.

## Backend API contracts

All calls use the existing NEXT_PUBLIC_CEPP_API_URL and cookie credentials.

| Method / path | Contract |
| --- | --- |
| GET /storage/files | StoredFile[] of authorized original records |
| POST /storage/files | multipart files, scope, optional folderId; return StoredFile[] |
| GET /storage/files/:id/download | Return {downloadUrl} for authorized original bytes |
| PATCH /storage/files/:id | {folderId: string or null}; return updated StoredFile |
| GET /file-folders | FileFolder[] for authorized workspace scopes, including parent chains |
| POST /file-folders | {name, scope, parentId}; return created FileFolder |
| GET /files | Job[] describing authorized completed output artifacts; UI defensively excludes Processing |
| PATCH /files/:resultFileId | {folderId: string or null}; return {folderId} without changing job/source IDs |
| GET /files/:resultFileId/download | Fresh authorized decrypted-result download URL |
| POST /jobs | multipart new device files and/or sourceFileIds JSON array, scope, groupIds, keyId, version, optional folderId |
| GET /jobs/:jobId | Job status and output metadata; completion includes a newly created resultFileId |

Legacy Job records may omit resultFileId; the adapter falls back to job ID for those
records. New responses should always provide the actual artifact ID. Existing
/jobs/:jobId/decrypt remains keyed by job ID and must persist decrypted:true.
Download responses should use absolute HTTP(S) URLs and Content-Disposition: attachment.

The server validates source ownership, group permissions, workspace/folder scope,
file formats/size, key binding and duplicate folder names. Completing a job must
atomically create a distinct output DB record and associate it with the job and
sourceFileIds. Never update an original record into an FHE result. Failed API calls
do not fall back to page fixtures or pretend that an upload/move/folder was saved.

## Source responsibilities

- src/app/(application)/(account)/my-file/page.tsx: page layout, forms and fixtures.
- src/features/files/hooks/use-file-library.ts: inventories and storage/folder actions.
- src/features/files/components/: reusable source-file cards and folder navigation.
- src/lib/local-file-storage.ts: local source bytes and file/workspace helpers.
- src/types/file-storage.ts: storage and folder contracts.
- Existing job components handle completed output actions and decryption.

## Selecting stored inputs directly on Upload

Upload has Select from My File. Its checkbox dialog reads only /storage/files,
never /files (FHE output artifacts). The picker shows nonempty JPG/PNG/MP4 originals
in the current workspace, across folders. Originals keep their original
classification when used as inputs; a newly generated FHE output is a separate file.
Search and folder filtering preserve draft checkbox selections. Cancel changes
nothing; confirming appends unique source IDs alongside any device files. Already
added inputs are checked/disabled, and Clear all/Clear batch remove both sources.
Page-local picker fixtures are kept at the bottom of the Upload route module.

Backend requests fail visibly and never substitute mock originals. The existing
POST /jobs sourceFileIds contract applies; the server must still validate every
source ID as an authorized original in the requested workspace.

Upload group choices require explicit Group.enterpriseName === selected workspace.
Foreign Enterprise groups, independent groups and records with an unknown parent
are excluded. Scope changes reset selected groups, and the job/key payloads are
derived from the current eligible group intersection rather than unchecked IDs.
GET /groups?scope=... must return the actual enterpriseName for every selectable
Enterprise group. Legacy parent inference remains outside this Upload selector.

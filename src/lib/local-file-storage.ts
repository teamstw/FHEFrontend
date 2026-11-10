// Browser-only source bytes are kept outside the metadata stored by the provider.
function openFiles(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cepp-original-files", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("files"))
        request.result.createObjectStore("files");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Unable to open local file storage."));
    request.onblocked = () =>
      reject(new Error("Local file storage is busy. Please try again."));
  });
}

export async function saveOriginalFiles(files: { id: string; file: File }[]) {
  const database = await openFiles();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("files", "readwrite");
      files.forEach(({ id, file }) =>
        transaction.objectStore("files").put(file, id),
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = transaction.onabort = () =>
        reject(
          new Error(
            "Unable to save files on this device. Check available storage and try again.",
          ),
        );
    });
  } finally {
    database.close();
  }
}

export async function loadOriginalFile(id: string): Promise<Blob | null> {
  const database = await openFiles();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database
        .transaction("files", "readonly")
        .objectStore("files")
        .get(id);
      request.onsuccess = () =>
        resolve(request.result instanceof Blob ? request.result : null);
      request.onerror = () =>
        reject(new Error("Unable to read the original file."));
    });
  } finally {
    database.close();
  }
}

export function fileWorkspace(scope: string) {
  return scope.split(" / ")[0];
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function supportsFhe(file: { name: string; sizeBytes: number }) {
  return /\.(jpe?g|png|mp4)$/i.test(file.name) && file.sizeBytes > 0;
}

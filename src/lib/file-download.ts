export function download(
  name: string,
  value: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadFromUrl(name: string, downloadUrl: string) {
  const url = new URL(downloadUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Unable to download this file. Please try again.");
  const link = document.createElement("a");
  link.href = url.href;
  link.download = name;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

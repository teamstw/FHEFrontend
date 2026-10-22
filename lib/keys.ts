import type { KeyRecord } from "@/types/cepp";
export function masked(key: KeyRecord) {
  return key.id.split("_")[0] + "_••••" + key.id.split("_")[1].slice(-4);
}
export async function fingerprint(file: File) {
  const bytes = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

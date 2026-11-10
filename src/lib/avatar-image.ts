const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function storageKey(account: string) {
  return (
    "cepp-avatar:" +
    encodeURIComponent(account.trim().toLowerCase() || "local-preview")
  );
}

export function loadStoredAvatar(account: string): string {
  try {
    const value = localStorage.getItem(storageKey(account)) || "";
    return /^data:image\/(png|jpeg|webp);base64,/.test(value) ? value : "";
  } catch {
    return "";
  }
}

export function storeAvatar(account: string, image: string) {
  try {
    localStorage.setItem(storageKey(account), image);
  } catch {
    throw new Error(
      "ไม่สามารถบันทึกรูปในเบราว์เซอร์ได้ กรุณาตรวจสอบพื้นที่จัดเก็บแล้วลองใหม่",
    );
  }
}

export function avatarDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    reader.readAsDataURL(file);
  });
}

export async function prepareAvatar(file: File): Promise<File> {
  if (!AVATAR_TYPES.has(file.type))
    throw new Error("รองรับเฉพาะไฟล์ JPG, PNG และ WebP");
  if (!file.size || file.size > MAX_AVATAR_SIZE)
    throw new Error("กรุณาเลือกรูปภาพขนาดไม่เกิน 5 MB และไม่ใช่ไฟล์ว่าง");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error("ไฟล์นี้ไม่ใช่รูปภาพที่อ่านได้ กรุณาเลือกรูปอื่น"));
      image.src = objectUrl;
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    if (!side) throw new Error("รูปภาพนี้ไม่มีขนาดที่ถูกต้อง");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("ไม่สามารถเตรียมรูปภาพได้ กรุณาลองใหม่");
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("ไม่สามารถเตรียมรูปภาพได้")),
        "image/webp",
        0.9,
      ),
    );
    return new File(
      [blob],
      blob.type === "image/webp" ? "avatar.webp" : "avatar.png",
      { type: blob.type },
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

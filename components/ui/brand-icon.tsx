"use client";
const icons: Record<string, string> = {
  shield: "54567.svg",
  user: "9fba2.svg",
  chevron: "87b8b.svg",
  bell: "08b3d.svg",
  upload: "a83f7.svg",
  personal: "5df53.svg",
  group: "14e26.svg",
  google: "46823.svg",
  arrow: "a14b9.svg",
  face: "69ed1.svg",
  feature1: "ef430.svg",
  feature2: "08d85.svg",
  feature3: "b8eaf.svg",
  feature4: "8b0f2.svg",
  feature5: "5baf5.svg",
  feature6: "bbb20.svg",
  process1: "e820d.svg",
  process2: "10dfd.svg",
  process3: "006f9.svg",
  process4: "986f2.svg",
  lock: "434da.svg",
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <img
      className="cepp-icon"
      src={"/figma/" + (icons[name] || icons.shield)}
      alt=""
      width={size}
      height={size}
    />
  );
}

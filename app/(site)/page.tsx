"use client";
import { Icon } from "@/components/ui/brand-icon";
import { Badge, Button, Modal, Panel } from "@/components/ui/cepp";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function HomePage() {
  const { model, update } = useCepp(),
    router = useRouter(),
    [login, setLogin] = useState(false),
    [contact, setContact] = useState(false);
  const start = () =>
    model.signedIn ? router.push("/upload") : setLogin(true);
  return (
    <div className="cepp-home">
      <section className="cepp-hero">
        <img className="cepp-hero-bg" src="/figma/79343.png" alt="" />
        <img
          src="/figma/8f9ca.svg"
          alt=""
          width={1905}
          height={939}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "none",
            pointerEvents: "none",
          }}
        />
        <Badge>
          <Icon name="lock" size={14} />
          Fully Homomorphic Encryption
        </Badge>
        <h1>
          Zero <b>Trust</b>
          <br />
          Face Detection
        </h1>
        <p>
          ระบบ Face Detection ที่สามารถประมวลผลบนข้อมูลที่ถูกเข้ารหัส (Encrypted
          Data) หลากหลายรูปแบบได้โดยตรง โดยไม่ต้องผ่านการถอดรหัสก่อนเข้า process
        </p>
        <div className="cepp-row wrap">
          <Button onClick={start}>
            Get Started <Icon name="arrow" size={16} />
          </Button>
          <Button
            secondary
            onClick={() =>
              document
                .getElementById("technology")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Learn More
          </Button>
        </div>
        <div className="cepp-scan">
          <img
            src="/figma/3ccd5.svg"
            width={766}
            height={430}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.05,
              maxWidth: "none",
            }}
          />
          <div className="cepp-corner tl" />
          <div className="cepp-corner tr" />
          <div className="cepp-corner bl" />
          <div className="cepp-corner br" />
          <div className="scan-label">
            ENCRYPTED_MODE: FHE
            <br />
            STATUS: PROCESSING
            <br />
            TRUST_LEVEL: ZERO
          </div>
          <span className="face">
            <Icon name="face" size={48} />
          </span>
          <div className="scan-label bottom">
            DETECTION: ACTIVE
            <br />
            ENCRYPTION: AES-256 + FHE
            <br />
            LATENCY: 12ms
          </div>
        </div>
      </section>
      <section className="cepp-home-section" id="features">
        <div className="section-heading">
          <p className="cepp-eyebrow">Features</p>
          <h2>เทคโนโลยีที่ปฏิวัติความปลอดภัย</h2>
          <p>
            ในยุคที่ปฏิบัติการทางทหารต้องพึ่งพาข้อมูลข่าวกรองเชิงลึก การนำ AI
            มาช่วยวิเคราะห์ข้อมูลคือสิ่งจำเป็น
          </p>
        </div>
        <div className="cepp-grid three">
          {features.map((f, i) => (
            <Panel key={f.title}>
              <div className="cepp-feature-icon">
                <Icon name={"feature" + (i + 1)} size={20} />
              </div>
              <h3>{f.title}</h3>
              <p className="cepp-muted">{f.description}</p>
            </Panel>
          ))}
        </div>
      </section>
      <section className="cepp-stats" aria-label="Technology specifications">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <p>{label}</p>
          </div>
        ))}
      </section>
      <section className="cepp-home-section" id="technology">
        <div className="cepp-grid" style={{ alignItems: "center", gap: 64 }}>
          <div className="cepp-stack">
            <p className="cepp-eyebrow" style={{ color: "#009576" }}>
              Technology
            </p>
            <h2 style={{ fontSize: 36, lineHeight: "40px" }}>
              Fully Homomorphic Encryption
            </h2>
            <p className="cepp-muted">
              ในยุคที่ปฏิบัติการทางทหารต้องพึ่งพาข้อมูลข่าวกรองเชิงลึก
              ไม่ว่าจะเป็นภาพถ่ายใบหน้าเป้าหมาย หรือวิดีโอสดแบบจากโดรน การนำ AI
              มาช่วยวิเคราะห์ข้อมูลคือสิ่งจำเป็น
            </p>
            <p className="cepp-muted">
              แต่เทคโนโลยีแบบดั้งเดิมมีข้อจำกัดที่อันตราย คือ
              ต้องทำการถอดรหัสข้อมูล (Decryption)
              ให้อยู่ในรูปไฟล์ปกติก่อนประมวลผลเสมอ
            </p>
            <p className="cepp-muted">
              ด้วยเทคโนโลยีการเข้ารหัสแบบ Fully Homomorphic Encryption (FHE)
              เพื่อให้ข้อมูลปลอดภัยตลอดทาง ตั้งแต่ รับข้อมูล ระหว่าง process
              ไปจนถึงการส่งข้อมูล
            </p>
            <div>
              <Button onClick={() => router.push("/documentation")}>
                Learn More <Icon name="arrow" size={16} />
              </Button>
            </div>
          </div>
          <Panel>
            {[
              "Input Data",
              "FHE Processing",
              "AI Analysis",
              "Encrypted Output",
            ].map((v, i) => (
              <div className="cepp-row start" key={v}>
                <span
                  className="cepp-logo"
                  style={{
                    borderRadius: 99,
                    width: 48,
                    height: 48,
                    color: i % 2 ? "#009576" : "#00a5da",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="cepp-panel"
                  style={{ flex: 1, padding: "16px 20px", gap: 0 }}
                >
                  <strong>{v}</strong>
                  <small className="cepp-muted">
                    {
                      [
                        "Encrypted Image",
                        "No Decryption Needed",
                        "Face Detection",
                        "Secure Results",
                      ][i]
                    }
                  </small>
                </div>
              </div>
            ))}
            <div className="cepp-row">
              <span className="cepp-mono" style={{ color: "#009576" }}>
                ● ENCRYPTION: ACTIVE
              </span>
              <span className="cepp-mono cepp-muted">AES-256 + FHE v2.0</span>
            </div>
          </Panel>
        </div>
      </section>
      <section className="cepp-home-section" id="process">
        <div className="section-heading">
          <p className="cepp-eyebrow">Process</p>
          <h2>ขั้นตอนการทำงาน</h2>
          <p>กระบวนการที่ปลอดภัยตั้งแต่ต้นจนจบ ไม่มีจุดใดที่ข้อมูลถูกเปิดเผย</p>
        </div>
        <div className="cepp-process-grid">
          {processSteps.map((s, i) => (
            <Panel key={s.title}>
              <div className="cepp-feature-icon">
                <Icon name={"process" + (i + 1)} size={24} />
              </div>
              <p className="cepp-mono" style={{ color: "#009576" }}>
                Step {String(i + 1).padStart(2, "0")}
              </p>
              <h3>{s.title}</h3>
              <p className="cepp-muted">{s.description}</p>
            </Panel>
          ))}
        </div>
      </section>
      <section className="cepp-home-section" style={{ paddingTop: 64 }}>
        <Panel>
          <div className="cepp-cta">
            <span className="cepp-logo" style={{ width: 56, height: 56 }}>
              <Icon name="shield" size={28} />
            </span>
            <h2>พร้อมเริ่มต้นใช้งาน?</h2>
            <p className="cepp-muted">
              เริ่มต้นปกป้องข้อมูลของคุณด้วยเทคโนโลยี Zero Trust Face Detection
              วันนี้
            </p>
            <div className="cepp-row wrap">
              <Button onClick={start}>
                Get Started <Icon name="arrow" size={16} />
              </Button>
              <Button secondary onClick={() => setContact(true)}>
                Contact Sales
              </Button>
            </div>
          </div>
        </Panel>
      </section>
      <footer className="cepp-home-footer">
        <strong>
          Zero <span style={{ color: "#00a5da" }}>Trust</span> Face Detection
        </strong>
        <div className="cepp-row wrap">
          {[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Documentation", "/documentation"],
            ["Contact", "/contact"],
          ].map(([name, url]) => (
            <a key={url} href={url}>
              {name}
            </a>
          ))}
        </div>
        <span>2026 Zero Trust FD. All rights reserved.</span>
      </footer>
      <Modal
        open={login}
        onClose={() => setLogin(false)}
        title="Sign in"
        description="Use your Google account to continue."
      >
        <Button
          secondary
          onClick={() => {
            if (backendEnabled) {
              window.location.assign(api.signInUrl());
              return;
            }
            update((m) => ({ ...m, signedIn: true }));
            setLogin(false);
            router.replace("/");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          <Icon name="google" size={19} />
          Continue with Google
        </Button>

        <div className="cepp-row">
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </Modal>
      <Modal
        open={contact}
        onClose={() => setContact(false)}
        title="Contact Sales"
      >
        <p className="cepp-muted">
          ยังไม่ได้กำหนดช่องทางติดต่อฝ่ายขาย กรุณาเชื่อมข้อมูลติดต่อจาก backend
          ก่อนเปิดใช้งานจริง
        </p>
        <Button secondary onClick={() => setContact(false)}>
          Close
        </Button>
      </Modal>
    </div>
  );
}
const features = [
  {
    title: "Zero Trust Architecture",
    description:
      "ไม่ไว้วางใจข้อมูลใดๆ โดยปริยาย ทุกขั้นตอนผ่านการเข้ารหัสตั้งแต่ต้นจนจบ",
  },
  {
    title: "AI Face Detection",
    description:
      "ระบบ AI ตรวจจับใบหน้าที่ทำงานบนข้อมูลเข้ารหัสได้โดยตรง โดยไม่ต้องถอดรหัส",
  },
  {
    title: "Fully Homomorphic Encryption",
    description:
      "เทคโนโลยี FHE ที่ช่วยให้ประมวลผลข้อมูลในสถานะเข้ารหัสได้อย่างสมบูรณ์",
  },
  {
    title: "Real-time Processing",
    description:
      "ประมวลผลแบบ Real-time ด้วยความเร็วสูง รองรับการทำงานทั้งภาพถ่ายและวิดีโอสด",
  },
  {
    title: "Military-grade Security",
    description:
      "ระดับความปลอดภัยระดับทหาร รองรับการใช้งานในภาคการทหารและข่าวกรอง",
  },
  {
    title: "End-to-End Encrypted",
    description:
      "ข้อมูลปลอดภัยตลอดทาง ตั้งแต่รับข้อมูล ระหว่าง process ไปจนถึงการส่งข้อมูล",
  },
];
const stats = [
  ["99.7%", "Detection Accuracy"],
  ["12ms", "Processing Latency"],
  ["256-bit", "Encryption Standard"],
  ["Zero", "Data Exposure Points"],
];
const processSteps = [
  {
    title: "Data Ingestion",
    description: "รับข้อมูลภาพหรือวิดีโอ ที่ถูกเข้ารหัสได้ทันที",
  },
  {
    title: "Processing",
    description:
      "ประมวลผลข้อมูลที่ถูกเข้ารหัสอย่างสมบูรณ์ ด้วย Fully Homomorphic Encryption",
  },
  {
    title: "AI Analysis",
    description:
      "AI ประมวลผล Face Detection บนข้อมูลที่เข้ารหัส โดยไม่ต้องถอดรหัส",
  },
  {
    title: "Secure Output",
    description:
      "ส่งผลลัพธ์ที่เข้ารหัสกลับ ถอดรหัสได้เฉพาะผู้ที่มีสิทธิ์เท่านั้น",
  },
];

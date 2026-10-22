// import { GridBackground } from "@/components/grid-background"
// import { Navbar } from "@/components/navbar"
// import { HeroSection } from "@/components/hero-section"
// import { FeaturesSection } from "@/components/features-section"
// import { StatsSection } from "@/components/stats-section"
// import { TechnologySection } from "@/components/technology-section"
// import { ProcessSection } from "@/components/process-section"
// import { CTASection } from "@/components/cta-section"
// import { Footer } from "@/components/footer"

// export default function Home() {
//   return (
//     <main className="relative min-h-screen overflow-x-hidden">
//       <GridBackground />
//       <Navbar />
//       <HeroSection />
//       <FeaturesSection />
//       <StatsSection />
//       <TechnologySection />
//       <ProcessSection />
//       <CTASection />
//       <Footer />
//     </main>
//   )
// }

"use client";

import { useEffect, useState } from "react";
// @ts-ignore
import createFheModule from "@/lib/fhe/openfhe_wasm.js";

export default function FheTestPage() {
  const [fheModule, setFheModule] = useState<any>(null);
  const [fheInstance, setFheInstance] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Data States
  const [inputText, setInputText] = useState<number>(25.5);
  const [ciphertext, setCiphertext] = useState<string>("");
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);

  // Key Files State
  const [ccFile, setCcFile] = useState<File | null>(null);
  const [pkFile, setPkFile] = useState<File | null>(null);
  const [skFile, setSkFile] = useState<File | null>(null);

  // Performance Benchmark States
  const [wasmEncryptTime, setWasmEncryptTime] = useState<number | null>(null);
  const [jsBenchmarkTime, setJsBenchmarkTime] = useState<number | null>(null);

  // Control States
  const [isKeysReady, setIsKeysReady] = useState<boolean>(false);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    addLog("⏳ กำลังโหลดระบบ FHE (WASM)...");
    createFheModule()
      .then((Module: any) => {
        setFheModule(Module);
        const instance = new Module.FHEWasm();
        setFheInstance(instance);
        addLog("✅ โหลดระบบ FHE WASM สำเร็จ พร้อมใช้งาน");
      })
      .catch((err: any) => {
        addLog(`❌ โหลด WASM ล้มเหลว: ${err.message}`);
      });
  }, []);

  // 1️⃣ ขั้นตอนการโหลด Keys
  const handleSetupKeys = async () => {
    if (!fheInstance) return;

    if (!ccFile || !pkFile) {
      addLog("❌ กรุณาแนบไฟล์ CryptoContext (cc) และ Public Key (pub) ครับ");
      return;
    }

    try {
      addLog("----------------------------------------");
      addLog("⚙️ กำลังติดตั้ง CryptoContext และ Public Key...");

      const ccStr = await ccFile.text();
      const pkStr = await pkFile.text();

      const isSuccess = fheInstance.init(ccStr, pkStr);
      if (!isSuccess) {
        addLog("❌ ติดตั้ง Keys ไม่สำเร็จ (รูปแบบไฟล์ไม่ถูกต้อง)");
        setIsKeysReady(false);
        return;
      }

      setIsKeysReady(true);
      addLog(
        "✅ ติดตั้ง Encryption Keys สำเร็จ! ระบบพร้อมทำการ Encrypt ข้อมูลแล้ว",
      );
    } catch (error: any) {
      addLog(`❌ เกิด Error ตอนตั้งค่า Keys: ${error.message}`);
    }
  };

  // 2️⃣ ขั้นตอน Encrypt ข้อมูล (WASM Benchmark)
  const handleEncrypt = () => {
    if (!fheInstance || !isKeysReady) return;

    try {
      addLog("----------------------------------------");
      addLog(`🔐 [WASM C++] กำลังเข้ารหัสตัวเลข: ${inputText}...`);

      const startTime = performance.now();
      const result = fheInstance.encrypt(inputText);
      const endTime = performance.now();

      const duration = parseFloat((endTime - startTime).toFixed(2));
      setWasmEncryptTime(duration);

      if (result && result.length > 0) {
        setCiphertext(result);
        setDecryptedValue(null);

        addLog(`⚡ [WASM C++] Encrypt สำเร็จ! ใช้เวลา: ${duration} ms`);

        if (fheModule && fheModule.HEAP8) {
          const memSizeMB = (
            fheModule.HEAP8.buffer.byteLength /
            (1024 * 1024)
          ).toFixed(2);
          addLog(`🧠 WASM C++ Heap Memory: ${memSizeMB} MB`);
        }
      } else {
        addLog("⚠️ Encrypt ไม่ส่งผลลัพธ์กลับมา");
      }
    } catch (error: any) {
      addLog(`❌ เกิด Error ตอน Encrypt: ${error.message}`);
    }
  };

  // 🧪 ทดสอบภาระงานด้วย Pure JavaScript (10 ล้านรอบ)
  const handleRunJSBenchmark = () => {
    addLog("----------------------------------------");
    addLog(
      "🧪 [Pure JS] กำลังรัน Math Simulation 10 ล้านรอบ เพื่อจำลองภาระงานหนัก...",
    );

    // หน่วงเวลาเล็กน้อยเพื่อให้ UI อัปเดต Log ก่อนเริ่มคำนวณ
    setTimeout(() => {
      const startTime = performance.now();

      let val = inputText;
      for (let i = 0; i < 10000000; i++) {
        val = Math.sin(val) * Math.cos(val) + Math.sqrt(i + 1);
      }

      const endTime = performance.now();
      const duration = parseFloat((endTime - startTime).toFixed(2));
      setJsBenchmarkTime(duration);

      addLog(`🐢 [Pure JS] คำนวณเสร็จสิ้น ใช้เวลา: ${duration} ms`);
    }, 50);
  };

  // 3️⃣ ขั้นตอน Decrypt
  const handleDecrypt = async () => {
    if (!fheInstance || !ciphertext) return;

    if (!skFile) {
      addLog("❌ ต้องแนบไฟล์ Secret Key (key_sec.txt) ก่อนถอดรหัสครับ");
      return;
    }

    try {
      addLog("----------------------------------------");
      addLog("🔑 กำลังโหลด Secret Key...");
      const skStr = await skFile.text();

      const isSkLoaded = fheInstance.loadPrivateKey(skStr);
      if (!isSkLoaded) {
        addLog("❌ Secret Key ไม่ถูกต้อง");
        return;
      }

      addLog("🔓 กำลังถอดรหัส Ciphertext...");

      const startTime = performance.now();
      const result = fheInstance.decrypt(ciphertext);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (result === -999999.0) {
        addLog("❌ Secret Key ไม่ตรงกับระบบ!");
        setDecryptedValue(null);
      } else {
        setDecryptedValue(result);
        addLog(
          `🎉 ถอดรหัสสำเร็จ! ใช้เวลา: ${duration} ms | ค่าเดิม: ${result.toFixed(4)}`,
        );
      }
    } catch (error: any) {
      addLog(`❌ เกิด Error ตอน Decrypt: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "monospace",
        maxWidth: "850px",
        margin: "0 auto",
      }}
    >
      <h2>🧪 FHE Client-Side Flow Simulation & Benchmark</h2>

      {/* STEP 1: โหลด Keys */}
      <div
        style={{
          background: "#212121",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #424242",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#00e5ff" }}>
          1️⃣ รับ/ใส่ Keys ที่ได้จากระบบ (cc & pub)
        </h4>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "inline-block", width: "180px", color: "#ccc" }}
          >
            CryptoContext (cc):
          </label>
          <input
            type="file"
            onChange={(e) => setCcFile(e.target.files?.[0] || null)}
            style={{ color: "#fff" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{ display: "inline-block", width: "180px", color: "#ccc" }}
          >
            Public Key (pub):
          </label>
          <input
            type="file"
            onChange={(e) => setPkFile(e.target.files?.[0] || null)}
            style={{ color: "#fff" }}
          />
        </div>

        <button
          onClick={handleSetupKeys}
          disabled={!fheInstance}
          style={{
            marginTop: "10px",
            padding: "6px 16px",
            cursor: "pointer",
            fontWeight: "bold",
            background: "#00bcd4",
            color: "#000",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ⚙️ ติดตั้ง Keys เข้าสู่ WASM
        </button>
      </div>

      {/* STEP 2: Encrypt */}
      {isKeysReady && (
        <div
          style={{
            background: "#1b5e20",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #2e7d32",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#b9f6ca" }}>
            2️⃣ เข้ารหัสข้อมูล (Encrypt)
          </h4>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <label>ป้อนข้อมูลตัวเลข: </label>
            <input
              type="number"
              value={inputText}
              onChange={(e) => setInputText(parseFloat(e.target.value))}
              style={{ padding: "5px", fontSize: "16px", width: "100px" }}
            />
            <button
              onClick={handleEncrypt}
              style={{
                padding: "6px 16px",
                cursor: "pointer",
                fontWeight: "bold",
                background: "#69f0ae",
                color: "#000",
                border: "none",
                borderRadius: "4px",
              }}
            >
              🔒 เข้ารหัสด้วย WASM (C++)
            </button>
          </div>

          {/* 📊 ส่วนแสดงตารางเปรียบเทียบ Performance */}
          <div
            style={{
              background: "#0d2818",
              padding: "12px",
              borderRadius: "6px",
              border: "1px dashed #69f0ae",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#a7ffeb",
              }}
            >
              ⚡ Performance Benchmark Comparison
            </div>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div>
                <span>WASM Encrypt Time: </span>
                <span style={{ color: "#69f0ae", fontWeight: "bold" }}>
                  {wasmEncryptTime !== null
                    ? `${wasmEncryptTime} ms`
                    : "ยังไม่ได้ทดสอบ"}
                </span>
              </div>
              <div>
                <span>
                  Pure JS (10M Math Loops ให้ใกล้เคียงกับการทำงานของ FHE):{" "}
                </span>
                <span style={{ color: "#ffb74d", fontWeight: "bold" }}>
                  {jsBenchmarkTime !== null
                    ? `${jsBenchmarkTime} ms`
                    : "ยังไม่ได้ทดสอบ"}
                </span>
              </div>
            </div>
            <button
              onClick={handleRunJSBenchmark}
              style={{
                marginTop: "10px",
                padding: "4px 12px",
                cursor: "pointer",
                background: "#ff9800",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              🧪 ทดสอบความเร็ว Pure JS
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Decrypt */}
      {ciphertext && (
        <div
          style={{
            background: "#311b92",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #4527a0",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#ea80fc" }}>
            3️⃣ ถอดรหัสผลลัพธ์ (Decrypt)
          </h4>
          <p
            style={{ fontSize: "12px", color: "#d1c4e9", margin: "0 0 10px 0" }}
          >
            *ต้องระบุ Secret Key (sec) เพื่อยืนยันสิทธิ์ในการถอดรหัส
          </p>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "inline-block",
                width: "180px",
                color: "#ff80ab",
              }}
            >
              Secret Key (sec):
            </label>
            <input
              type="file"
              onChange={(e) => setSkFile(e.target.files?.[0] || null)}
              style={{ color: "#fff" }}
            />
          </div>

          <button
            onClick={handleDecrypt}
            style={{
              padding: "8px 20px",
              cursor: "pointer",
              fontWeight: "bold",
              background: "#ff4081",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            🔓 ถอดรหัสด้วย Secret Key นี้
          </button>

          {decryptedValue !== null && (
            <div
              style={{
                marginTop: "15px",
                background: "#004d40",
                color: "#64ffda",
                padding: "12px",
                borderRadius: "5px",
                fontSize: "18px",
                fontWeight: "bold",
                border: "1px solid #1de9b6",
              }}
            >
              🎯 ผลลัพธ์ที่ถอดรหัสได้จริง: {decryptedValue.toFixed(4)}
            </div>
          )}
        </div>
      )}

      {/* Console Logs */}
      <h3>Console Logs:</h3>
      <div
        style={{
          background: "#1e1e1e",
          color: "#00ff00",
          padding: "15px",
          borderRadius: "5px",
          minHeight: "150px",
          maxHeight: "250px",
          overflowY: "auto",
        }}
      >
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: "4px" }}>
            {log}
          </div>
        ))}
      </div>

      {/* Ciphertext Output */}
      {ciphertext && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ciphertext (JSON String):</h3>
          <textarea
            readOnly
            value={ciphertext}
            rows={4}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "12px",
              background: "#222",
              color: "#aaa",
              border: "1px solid #555",
            }}
          />
        </div>
      )}
    </div>
  );
}

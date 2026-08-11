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

'use client';

import React, { useEffect, useState } from 'react';
// @ts-ignore
import createFheModule from '../lib/openfhe_wasm.js';

export default function FheTestPage() {
  const [fheInstance, setFheInstance] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [inputText, setInputText] = useState<number>(25.5);
  const [ciphertext, setCiphertext] = useState<string>('');
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);

  // Files State
  const [ccFile, setCcFile] = useState<File | null>(null);
  const [pkFile, setPkFile] = useState<File | null>(null);
  const [skFile, setSkFile] = useState<File | null>(null); // เลือกทีหลังตอนจะ Decrypt

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  useEffect(() => {
    addLog('⏳ กำลังโหลดไฟล์ WASM...');
    createFheModule()
      .then((Module: any) => {
        const instance = new Module.FHEWasm();
        setFheInstance(instance);
        addLog('✅ โหลด WASM และสร้าง FHEWasm Instance สำเร็จ');
      })
      .catch((err: any) => {
        addLog(`❌ โหลด WASM ล้มเหลว: ${err.message}`);
      });
  }, []);

  // 🔒 ขั้นตอน Encrypt (ใช้แค่ CryptoContext + Public Key)
  const runEncrypt = async () => {
    if (!fheInstance) return;

    if (!ccFile || !pkFile) {
      addLog('❌ กรุณาเลือกไฟล์ CryptoContext และ Public Key ให้ครบก่อนครับ');
      return;
    }

    try {
      addLog('----------------------------------------');
      addLog(`🔢 กำลังเตรียมข้อมูลตัวเลข: ${inputText}`);
      addLog('⚙️ กำลังอ่านข้อมูลไฟล์ Setup Keys...');

      const ccStr = await ccFile.text();
      const pkStr = await pkFile.text();

      const isSuccess = fheInstance.init(ccStr, pkStr);
      if (!isSuccess) {
        addLog('❌ โหลด Setup Keys เข้า WASM ไม่สำเร็จ');
        return;
      }
      addLog('✅ โหลด Keys ลง WASM สำเร็จ!');

      addLog('🔐 กำลังทำการ Encrypt...');
      // ส่ง inputText (number) เข้าไปตรงๆ ได้เลย
      const result = fheInstance.encrypt(inputText);

      if (result && result.length > 0) {
        setCiphertext(result);
        setDecryptedValue(null);
        setSkFile(null); // รีเซ็ต Private key เก่าถ้ามี
        addLog('🎉 เข้ารหัสสำเร็จ! ได้รับ Ciphertext เรียบร้อย');
      } else {
        addLog('⚠️ Encrypt ไม่ส่งค่ากลับมา');
      }
    } catch (error: any) {
      addLog(`❌ เกิด Error: ${error.message}`);
    }
  };

  // 🔓 ขั้นตอน Decrypt (ต้องแนบ Private Key ณ ตอนกด)
  const runDecrypt = async () => {
    if (!fheInstance || !ciphertext) return;

    if (!skFile) {
      addLog('❌ กรุณาอัปโหลดไฟล์ Private Key (key_sec.txt) ก่อนทำการถอดรหัส');
      return;
    }

    try {
      addLog('----------------------------------------');
      addLog('🔑 กำลังตรวจสอบ Private Key...');
      const skStr = await skFile.text();

      const isSkLoaded = fheInstance.loadPrivateKey(skStr);
      if (!isSkLoaded) {
        addLog('❌ โครงสร้าง Private Key ไม่ถูกต้อง');
        return;
      }

      addLog('🔓 กำลังลองถอดรหัส...');
      const result = fheInstance.decrypt(ciphertext);

      if (result === -999999.0) {
        addLog('❌ Private Key ไม่ตรงกับ Public Key! ถอดรหัสล้มเหลว');
        setDecryptedValue(null);
      } else {
        setDecryptedValue(result);
        addLog(`🎉 Key ถูกต้อง! ถอดรหัสสำเร็จได้ค่า: ${result.toFixed(4)}`);
      }
    } catch (error: any) {
      addLog(`❌ เกิด Error ตอน Decrypt: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 OpenFHE WASM Integration Test</h2>

      {/* STEP 1: Encrypt Setup */}
      <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#00e5ff' }}>1️⃣ อัปโหลด Keys สำหรับ Encrypt:</h4>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'inline-block', width: '180px', color: '#ccc' }}>CryptoContext File:</label>
          <input type="file" onChange={(e) => setCcFile(e.target.files?.[0] || null)} style={{ color: '#fff' }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'inline-block', width: '180px', color: '#ccc' }}>Public Key File:</label>
          <input type="file" onChange={(e) => setPkFile(e.target.files?.[0] || null)} style={{ color: '#fff' }} />
        </div>

        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>ใส่ตัวเลขทดสอบ: </label>
          <input
            type="number"
            value={inputText}
            onChange={(e) => setInputText(parseFloat(e.target.value))}
            style={{ padding: '5px', fontSize: '16px', width: '100px' }}
          />
          <button
            onClick={runEncrypt}
            disabled={!fheInstance}
            style={{ padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold', background: '#00e676', color: '#000', border: 'none', borderRadius: '4px' }}
          >
            🔒 เริ่มทดสอบ Encrypt
          </button>
        </div>
      </div>

      {/* STEP 2: Decrypt Area (จะแสดงเมื่อมี Ciphertext แล้ว) */}
      {ciphertext && (
        <div style={{ background: '#1a237e', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #3d5aff' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ff4081' }}>2️⃣ ยืนยัน Key เพื่อถอดรหัส (Decrypt):</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'inline-block', width: '180px', color: '#ff80ab' }}>Private Key File:</label>
            <input type="file" onChange={(e) => setSkFile(e.target.files?.[0] || null)} style={{ color: '#fff' }} />
          </div>

          <button
            onClick={runDecrypt}
            style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold', background: '#ff4081', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            🔓 ถอดรหัสด้วย Key นี้
          </button>

          {decryptedValue !== null && (
            <div style={{ marginTop: '15px', background: '#004d40', color: '#64ffda', padding: '10px', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold' }}>
              🎯 ผลลัพธ์ที่ถอดรหัสได้: {decryptedValue.toFixed(4)}
            </div>
          )}
        </div>
      )}

      <h3>Console Logs:</h3>
      <div style={{ background: '#1e1e1e', color: '#00ff00', padding: '15px', borderRadius: '5px', minHeight: '150px', maxHeight: '250px', overflowY: 'auto' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>{log}</div>
        ))}
      </div>

      {ciphertext && (
        <div style={{ marginTop: '20px' }}>
          <h3>Ciphertext (JSON):</h3>
          <textarea
            readOnly
            value={ciphertext}
            rows={4}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', background: '#222', color: '#aaa', border: '1px solid #555' }}
          />
        </div>
      )}
    </div>
  );
}
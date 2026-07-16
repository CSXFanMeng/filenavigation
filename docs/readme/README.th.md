# FileNavigation

[ทุกภาษา](../../README.md) · [รุ่นล่าสุด](https://github.com/CSXFanMeng/filenavigation/releases/latest)

FileNavigation เป็นแอปเดสก์ท็อป Rust + Tauri สำหรับค้นหาไฟล์และโฟลเดอร์ในไดเรกทอรีภายในเครื่องที่เลือก การค้นหาทำงานบนเครื่องทั้งหมด โดยไม่อัปโหลดชื่อ เส้นทาง หรือเนื้อหาไฟล์

## คุณสมบัติ

- ค้นหาไฟล์และโฟลเดอร์ภายในเครื่อง
- แบ็กเอนด์ Rust/Tauri แบบอะซิงโครนัสเต็มรูปแบบ พร้อมยกเลิกและแสดงความคืบหน้า
- กรองประเภท เรียงลำดับ และแสดงผลลัพธ์แบบต่อเนื่อง
- UI ตอบสนองสมัยใหม่พร้อมไอคอน Lucide และสถานะโฟกัสที่เข้าถึงได้
- หน้าต่างไร้กรอบที่แอปวาดเองพร้อมปุ่มควบคุมหลายภาษา
- พื้นที่ทำงานคงที่และรายการผลลัพธ์ที่เลื่อนอย่างอิสระ
- อินเทอร์เฟซ 20 ภาษาในไฟล์ภาษาแยกกัน
- ตรวจสอบ GitHub Release ล่าสุดพร้อมบันทึกตามภาษาปัจจุบัน
- แสดง digest ของตัวติดตั้งเพื่อตรวจสอบความถูกต้อง

## ดาวน์โหลด

- Windows: `.exe` และ `.msi`
- macOS: `.dmg` และ `.app`
- Linux: `.deb`, `.rpm` และ `.AppImage`

ดาวน์โหลดจาก [GitHub Releases](https://github.com/CSXFanMeng/filenavigation/releases/latest)

## การพัฒนาและการ Build

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

หาก PowerShell บล็อก `npm.ps1` ให้ใช้ `npm.cmd` ไฟล์ผลลัพธ์อยู่ใน `src-tauri/target/release/bundle/`

## ภาษาและการอัปเดต

คำแปลอยู่ใน `src/i18n/locales` ส่วน [RELEASE_NOTES.md](../../RELEASE_NOTES.md) ใช้บล็อก `<!-- lang:xx -->` ตัวตรวจสอบจะเลือกภาษาปัจจุบัน จากนั้นภาษาอังกฤษ และสุดท้ายคือข้อความ Release ทั้งหมด

## ใบอนุญาต

โครงการใช้ [FileNavigation Non-Commercial Source License](../../LICENSE.md) ห้ามใช้งานเชิงพาณิชย์ ขายต่อ โฮสต์ SaaS บริการแบบชำระเงิน การรวมเชิงพาณิชย์แบบปิด และการรวมในผลิตภัณฑ์เชิงพาณิชย์

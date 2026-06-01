# 📱 คู่มือ Build MINEPLAY APK (Android)
## ใช้ Capacitor — ทีละขั้นตอน

---

## 🔧 สิ่งที่ต้องติดตั้งก่อน

| โปรแกรม | ลิงก์ดาวน์โหลด | หมายเหตุ |
|---|---|---|
| Node.js (LTS) | https://nodejs.org | เลือก **LTS** |
| Android Studio | https://developer.android.com/studio | ใช้พื้นที่ ~4GB |
| Java JDK 17 | มาพร้อม Android Studio | ไม่ต้องติดตั้งแยก |

> ⏱ ขั้นตอนนี้ใช้เวลาประมาณ **30–60 นาที** (ส่วนใหญ่รอดาวน์โหลด)

---

## ขั้นตอนที่ 1 — ติดตั้ง Node.js

1. เข้าไปที่ https://nodejs.org
2. คลิก **"LTS"** ดาวน์โหลดและติดตั้งตามปกติ
3. เปิด Terminal (Windows: **Command Prompt** หรือ **PowerShell**)
4. ตรวจสอบว่าติดตั้งสำเร็จ:
```
node -v
npm -v
```
ควรเห็นเลขเวอร์ชัน เช่น `v20.x.x` และ `10.x.x`

---

## ขั้นตอนที่ 2 — ติดตั้ง Android Studio

1. ดาวน์โหลดจาก https://developer.android.com/studio
2. ติดตั้งตามปกติ (Next → Next → Finish)
3. เปิด Android Studio ครั้งแรก → คลิก **"More Actions" → "SDK Manager"**
4. ใน **SDK Platforms** ติ๊ก **Android 14 (API 34)**
5. ใน **SDK Tools** ติ๊ก:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
6. คลิก **Apply → OK** รอดาวน์โหลด

### ตั้งค่า Environment Variables (Windows)
1. กด `Win + R` พิมพ์ `sysdm.cpl` → Enter
2. แท็บ **Advanced** → **Environment Variables**
3. ใน **System Variables** คลิก **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\ชื่อคุณ\AppData\Local\Android\Sdk`
4. หา `Path` ใน System Variables → **Edit** → **New** → เพิ่ม:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
5. กด OK ทุกหน้าต่าง

> 💡 **Mac/Linux:** เพิ่มใน `~/.zshrc` หรือ `~/.bashrc`:
> ```
> export ANDROID_HOME=$HOME/Library/Android/sdk
> export PATH=$PATH:$ANDROID_HOME/platform-tools
> ```

---

## ขั้นตอนที่ 3 — เตรียมโปรเจกต์

1. แตก zip ไฟล์ `mineplay-capacitor.zip` ที่ได้รับ
2. เปิด Terminal แล้ว `cd` ไปยังโฟลเดอร์ที่แตก:
```
cd C:\Users\ชื่อคุณ\Downloads\mineplay-capacitor
```
3. ติดตั้ง dependencies:
```
npm install
```
รอสักครู่ (จะสร้างโฟลเดอร์ `node_modules`)

---

## ขั้นตอนที่ 4 — เพิ่ม Android Platform

```
npx cap add android
```

คำสั่งนี้จะสร้างโฟลเดอร์ `android/` ในโปรเจกต์

---

## ขั้นตอนที่ 5 — Sync ไฟล์เกมเข้า Android

```
npx cap sync android
```

คำสั่งนี้จะคัดลอกไฟล์จาก `www/` เข้าไปใน Android project

> 🔄 **ทุกครั้งที่แก้ไขโค้ดเกม** ให้รันคำสั่งนี้ใหม่

---

## ขั้นตอนที่ 6 — เปิดใน Android Studio

```
npx cap open android
```

Android Studio จะเปิดขึ้นมาพร้อมโปรเจกต์ รอ **Gradle sync** เสร็จ (มุมล่างขวาจะแสดงความคืบหน้า)

---

## ขั้นตอนที่ 7 — Build APK

### วิธีที่ 1: Build แบบ Debug (ทดสอบ)
1. เมนู **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. รอ build เสร็จ (1–3 นาที)
3. คลิก **"locate"** ในแถบแจ้งเตือนมุมล่างขวา
4. APK จะอยู่ที่: `android/app/build/outputs/apk/debug/app-debug.apk`

### วิธีที่ 2: Build แบบ Release (แจกจ่าย)
1. เมนู **Build → Generate Signed Bundle / APK**
2. เลือก **APK** → Next
3. **Create new...** เพื่อสร้าง keystore (กรอกข้อมูลตามต้องการ)
4. เลือก **release** → คลิก **Finish**
5. APK จะอยู่ที่: `android/app/build/outputs/apk/release/app-release.apk`

---

## ขั้นตอนที่ 8 — ติดตั้งบนมือถือ

### วิธีที่ 1: ส่งไฟล์ตรงๆ
1. คัดลอก `.apk` ไปไว้ในมือถือ (ผ่าน USB, Google Drive, Line ฯลฯ)
2. เปิดไฟล์ใน File Manager บนมือถือ
3. ถ้าขึ้น "Install blocked" → ไปที่ Settings → Security → เปิด **"Unknown sources"** หรือ **"Install unknown apps"**
4. ติดตั้งและเปิดเล่นได้เลย!

### วิธีที่ 2: ADB (ถ้าต่อสาย USB)
```
adb install app-debug.apk
```

---

## 🛠 แก้ปัญหาที่พบบ่อย

**❌ `ANDROID_HOME` not found**
→ ตรวจสอบ Environment Variables อีกครั้ง แล้วปิด/เปิด Terminal ใหม่

**❌ Gradle sync failed**
→ ใน Android Studio: File → Invalidate Caches → Restart

**❌ `npx cap` command not found**
→ ลอง `npm install -g @capacitor/cli` แล้วรันใหม่

**❌ Build error: SDK not found**
→ ใน Android Studio → SDK Manager → ตรวจสอบว่า Android 14 (API 34) ติดตั้งแล้ว

**❌ Firebase ไม่ทำงาน**
→ ตรวจสอบว่ามือถือเชื่อมต่ออินเทอร์เน็ต (Firebase ต้องใช้ internet)

---

## 📂 โครงสร้างโฟลเดอร์

```
mineplay-capacitor/
├── www/                  ← ไฟล์เกมทั้งหมด (อย่าแก้ที่นี่โดยตรง)
│   ├── index.html
│   ├── css/
│   └── js/
├── android/              ← สร้างโดย Capacitor (หลัง npx cap add android)
├── package.json
└── capacitor.config.json
```

> 💡 **ต้องการแก้ไขเกม?** แก้ไฟล์ใน `www/` แล้วรัน `npx cap sync android` อีกครั้ง

---

## ✅ สรุปคำสั่งทั้งหมด (ครั้งแรก)

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
# จากนั้น Build APK ใน Android Studio
```

## 🔄 ครั้งต่อไป (หลังแก้ไขโค้ด)

```bash
npx cap sync android
npx cap open android
# Build APK ใน Android Studio
```

# 📱 คู่มือ Build MINEPLAY APK ด้วย Termux + GitHub Actions
## ไม่ต้องใช้ PC เลย — ทำบนมือถือได้ทั้งหมด

---

## ภาพรวม

```
มือถือ (Termux)  →  push โค้ด  →  GitHub  →  build APK อัตโนมัติ  →  ดาวน์โหลด APK
```

---

## ขั้นตอนที่ 1 — สมัคร GitHub (ถ้ายังไม่มี)

1. เปิดเบราเซอร์ไปที่ https://github.com
2. คลิก **Sign up** → กรอกข้อมูล → สร้างบัญชี
3. สร้าง Repository ใหม่:
   - คลิก **"+"** มุมขวาบน → **New repository**
   - ชื่อ: `mineplay`
   - เลือก **Private** (แนะนำ เพราะมี Firebase key)
   - คลิก **Create repository**
4. จดจำ URL ของ repo เช่น `https://github.com/ชื่อคุณ/mineplay`

---

## ขั้นตอนที่ 2 — ติดตั้ง Termux

1. ดาวน์โหลด Termux จาก **F-Droid** (แนะนำ):
   - https://f-droid.org/packages/com.termux/
   - หรือ Play Store ก็ได้ แต่เวอร์ชันอาจเก่ากว่า
2. เปิด Termux

---

## ขั้นตอนที่ 3 — ติดตั้ง Git ใน Termux

```bash
pkg update -y
pkg install git -y
```

---

## ขั้นตอนที่ 4 — ตั้งค่า Git

```bash
git config --global user.name "ชื่อของคุณ"
git config --global user.email "อีเมลของคุณ@gmail.com"
```

---

## ขั้นตอนที่ 5 — สร้าง GitHub Token (แทน password)

GitHub ไม่รับ password ธรรมดาแล้ว ต้องใช้ Personal Access Token:

1. ไปที่ https://github.com/settings/tokens
2. คลิก **"Generate new token (classic)"**
3. ตั้งชื่อ: `termux`
4. Expiration: **No expiration** (หรือตามต้องการ)
5. ติ๊ก **repo** (ทั้งหมดในหมวด repo)
6. คลิก **Generate token**
7. **คัดลอก token ไว้** (จะเห็นแค่ครั้งเดียว!) เช่น `ghp_xxxxxxxxxxxx`

---

## ขั้นตอนที่ 6 — แตกไฟล์โปรเจกต์

1. ส่งไฟล์ `mineplay-capacitor.zip` มาไว้ในมือถือ (ผ่าน Line, Google Drive ฯลฯ)
2. ใน Termux ติดตั้ง unzip:
```bash
pkg install unzip -y
```
3. แตกไฟล์ (ปรับ path ตามที่เก็บไว้):
```bash
# ถ้าไฟล์อยู่ใน Downloads
cp /sdcard/Download/mineplay-capacitor.zip ~/
cd ~
unzip mineplay-capacitor.zip
cd mineplay-capacitor
```

> 💡 ถ้า Termux เข้า storage ไม่ได้ ให้รัน: `termux-setup-storage` ก่อน

---

## ขั้นตอนที่ 7 — Push โค้ดขึ้น GitHub

```bash
cd ~/mineplay-capacitor

# เริ่ม git
git init
git add .
git commit -m "MINEPLAY FPV v0.1.13"

# เชื่อมกับ GitHub repo (เปลี่ยน URL ให้ตรงกับของคุณ)
git remote add origin https://github.com/ชื่อคุณ/mineplay.git

# Push (จะถามชื่อและ token)
git push -u origin main
```

เมื่อถามรหัสผ่าน:
- **Username:** ชื่อ GitHub ของคุณ
- **Password:** วาง Token ที่คัดลอกไว้ (จะไม่แสดงตัวอักษร กด Enter ได้เลย)

---

## ขั้นตอนที่ 8 — ดู GitHub Actions Build

1. เปิดเบราเซอร์ไปที่ repo ของคุณ
2. คลิกแท็บ **"Actions"**
3. จะเห็น workflow **"Build MINEPLAY APK"** กำลังรัน (วงกลมสีเหลือง)
4. รอประมาณ **5–10 นาที**
5. เมื่อเสร็จจะเป็นสีเขียว ✅

---

## ขั้นตอนที่ 9 — ดาวน์โหลด APK

1. คลิกที่ workflow run ที่เสร็จแล้ว
2. เลื่อนลงมาหัวข้อ **"Artifacts"**
3. คลิก **"MINEPLAY-debug"** → ดาวน์โหลด zip
4. แตก zip → ได้ไฟล์ `app-debug.apk`

---

## ขั้นตอนที่ 10 — ติดตั้ง APK

1. เปิดไฟล์ `app-debug.apk` ใน File Manager
2. ถ้าขึ้น "Install blocked":
   - Settings → Apps → Special app access → **Install unknown apps**
   - เลือก File Manager → เปิด **Allow**
3. ติดตั้ง → เปิดเล่นได้เลย! 🎮

---

## 🔄 ครั้งต่อไป (หลังแก้ไขโค้ดเกม)

แก้ไฟล์ใน `www/` แล้วรัน:

```bash
cd ~/mineplay-capacitor
git add .
git commit -m "แก้ไข: [อธิบายสิ่งที่เปลี่ยน]"
git push
```

GitHub จะ build APK ใหม่ให้อัตโนมัติ!

---

## 🛠 แก้ปัญหาที่พบบ่อย

**❌ `git push` ถามรหัสแล้วบอก authentication failed**
→ ตรวจสอบว่า Token มีสิทธิ์ **repo** และยังไม่หมดอายุ

**❌ Termux เข้าไฟล์ใน /sdcard ไม่ได้**
→ รัน `termux-setup-storage` แล้วกด Allow

**❌ Build failed ใน Actions**
→ คลิกที่ workflow → คลิก job ที่ fail → ดู log ข้อความสีแดง แล้วบอกฉันได้เลย

**❌ APK ติดตั้งแล้วเปิดไม่ได้ / ค้าง**
→ ตรวจสอบว่ามือถือเชื่อมต่ออินเทอร์เน็ต (Firebase ต้องใช้)

**❌ Actions แท็บไม่มี workflow**
→ ตรวจสอบว่าโฟลเดอร์ `.github/workflows/build-apk.yml` อยู่ใน repo แล้ว

---

## 📂 โครงสร้างไฟล์ที่ push ขึ้น GitHub

```
mineplay-capacitor/
├── .github/
│   └── workflows/
│       └── build-apk.yml   ← GitHub Actions workflow
├── www/                    ← ไฟล์เกมทั้งหมด
│   ├── index.html
│   ├── css/
│   └── js/
├── .gitignore
├── capacitor.config.json
└── package.json
```

> node_modules/ และ android/ จะถูก `.gitignore` ไว้ ไม่ต้อง push

---

## ✅ สรุปคำสั่ง Termux ทั้งหมด

```bash
# ครั้งแรก
pkg update -y && pkg install git unzip -y
termux-setup-storage
cp /sdcard/Download/mineplay-capacitor.zip ~/
cd ~ && unzip mineplay-capacitor.zip && cd mineplay-capacitor
git config --global user.name "ชื่อคุณ"
git config --global user.email "อีเมลคุณ"
git init && git add . && git commit -m "first commit"
git remote add origin https://github.com/ชื่อคุณ/mineplay.git
git push -u origin main

# ครั้งต่อไป (หลังแก้โค้ด)
git add . && git commit -m "update" && git push
```

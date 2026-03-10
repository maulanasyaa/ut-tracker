<div align="center">

  <h1>📚 UT-Tracker</h1>

  <p>A modern, offline-first student progress tracker for Universitas Terbuka.</p>

  [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![GitHub last commit](https://img.shields.io/github/last-commit/maulanasyaa/ut-tracker)](https://github.com/maulanasyaa/ut-tracker/commits/main)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/maulanasyaa/ut-tracker/ci.yml?branch=main)](https://github.com/maulanasyaa/ut-tracker/actions)

  <br/>

  <a href="#️-download">Download</a> •
  <a href="#-features">Features</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-packaging--build">Build</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>

  <br/>

</div>

---

**UT-Tracker** adalah aplikasi desktop ringan dan privat yang dirancang khusus untuk mahasiswa Universitas Terbuka. Aplikasi ini membantu Anda mengelola semester, mata kuliah, dan kewajiban mingguan (Tugas, Diskusi, Presensi) dalam satu antarmuka yang intuitif dan sepenuhnya luring (*offline*).

---

## ⬇️ Download

| Platform | Download |
|---|---|
| macOS (Apple Silicon) | [UT-Tracker-1.0.0-arm64.dmg](https://github.com/maulanasyaa/ut-tracker/releases/latest) |
| macOS (Intel) | [UT-Tracker-1.0.0.dmg](https://github.com/maulanasyaa/ut-tracker/releases/latest) |
| Windows | [UT-Tracker.Setup.1.0.0.exe](https://github.com/maulanasyaa/ut-tracker/releases/latest) |

> **Note:** UT-Tracker is not code-signed. You may need to bypass OS security warnings on first launch.

### macOS
Run the following command in Terminal after installing:
```bash
xattr -cr /Applications/Anchor.app
```

### Windows
Click **"More info"** → **"Run anyway"** when the SmartScreen prompt appears.

---

## ✨ Features

### 🎓 Academic Hub
- **Multi-Semester Management** — Kelola data banyak semester sekaligus dan aktifkan salah satu untuk fokus pada progres saat ini.
- **Smart Course Generation** — Tambahkan mata kuliah, dan sistem akan otomatis membuat 3 Tugas (Minggu 3, 5, 7), 8 Diskusi, dan 8 Presensi untuk Anda.
- **Progress Tracking** — Visualisasi progres real-time untuk setiap mata kuliah, membantu Anda melihat berapa banyak kewajiban yang tersisa.

### ⚡ Productivity & Automation
- **Weekly Deadline Tracking** — Atur batas waktu per minggu dan dapatkan notifikasi desktop jika ada tugas yang *overdue*.
- **Course Types** — Mendukung mata kuliah Umum dan Berpraktik (tanpa diskusi) dengan skema pengerjaan yang berbeda.
- **Detailed Logs** — Simpan tanggal submit dan catatan pribadi untuk setiap item pengerjaan.

### 🔒 Privacy & Data Control
- **100% Offline-First** — Data Anda adalah milik Anda. Semua informasi disimpan secara lokal di mesin Anda tanpa sinkronisasi cloud pihak ketiga.
- **Auto-Backup System** — Lindungi data Anda dari kehilangan dengan fitur pencadangan otomatis berkala ke folder pilihan Anda.
- **Export/Import JSON** — Pindahkan data antar perangkat dengan mudah melalui fitur ekspor dan impor satu klik.

### 🎨 Premium Experience
- **Fluid Animations** — Transisi antarmuka yang halus didukung oleh Framer Motion.
- **Dynamic Themes** — Pilih dari berbagai tema (Classic, Dracula, Midnight, dll) dan dukungan Dark Mode penuh.
- **Responsive Interface** — Desain sidebar yang ramping dengan tata letak yang bersih dan modern.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Core | [Electron](https://www.electronjs.org/) |
| Frontend | [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| State Management | [Zustand](https://github.com/pmndrs/zustand) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Testing | [Vitest](https://vitest.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/maulanasyaa/ut-tracker.git
cd ut-tracker

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 💻 Usage

1. **Tambah Semester** — Klik `+ Tambah` di bagian Semester pada sidebar. Atur tanggal mulai untuk mengaktifkan fitur notifikasi.
2. **Tambah Matkul** — Klik `+ Tambah` di bagian Mata Kuliah. Pilih tipe 'Umum' atau 'Berpraktik'.
3. **Update Progres** — Klik mata kuliah di sidebar, lalu klik pada item (Tugas/Diskusi/Presensi) untuk memperbarui status pengerjaan.
4. **Kelola Data** — Akses pengaturan di pojok kiri bawah untuk mengatur tema, folder backup, atau melakukan ekspor data.

---

## 📦 Packaging & Build

```bash
# Build for macOS
npm run dist:mac

# Build for Windows
npm run dist:win
```

> Output binary akan tersedia di direktori `dist/`.

---

## 📂 Project Structure

```text
ut-tracker/
├── src/
│   ├── main/           # Electron main process & pure business logic
│   │   ├── logic.js    # Core functions (testable)
│   │   └── main.js     # Electron window & IPC handlers
│   ├── preload/        # Secure bridge between Main & Renderer
│   ├── renderer/       # React application source
│   │   ├── src/store/  # Zustand state logic
│   │   ├── src/pages/  # Dashboard & Detail views
│   │   └── src/components/ # UI Components
│   └── test/           # Comprehensive Vitest suite
└── vitest.config.js    # Test configuration
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by Maulana Syarip Abdurahman</sub>
</div>

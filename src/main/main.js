import { app, BrowserWindow, ipcMain, Notification, dialog, shell, globalShortcut } from 'electron'
import path from 'path'
import fs from 'fs'
import logic from './logic.js'
import { fileURLToPath } from 'url'

// Handle __dirname in ESM if needed, though electron-vite usually shims it.
// If not using type: module, Vite will transpile this back anyway.

// ==================== JSON STORE ====================

function getDataPath() {
  return path.join(app.getPath('userData'), 'ut-tracker.json')
}

// Initialize logic with data path
app.whenReady().then(() => {
  logic.setDataPath(getDataPath())
})

// Proxies for logic functions to maintain compatibility with existing IPC handlers if needed, 
// though we can also call logic functions directly.

// ==================== IPC HANDLERS ====================

function setupIPC() {

  // ---------- SEMESTERS ----------
  ipcMain.handle('semester:getAll', () => logic.semesterGetAll())
  ipcMain.handle('semester:create', (_, args) => logic.semesterCreate(args))
  ipcMain.handle('semester:setActive', (_, args) => logic.semesterSetActive(args))
  ipcMain.handle('semester:delete', (_, args) => logic.semesterDelete(args))
  ipcMain.handle('semester:update', (_, args) => logic.semesterUpdate(args))

  // ---------- MATA KULIAH ----------
  ipcMain.handle('matkul:getBySemester', (_, args) => logic.matkulGetBySemester(args))
  ipcMain.handle('matkul:create', (_, args) => logic.matkulCreate(args))
  ipcMain.handle('matkul:delete', (_, args) => logic.matkulDelete(args))
  ipcMain.handle('matkul:getDetail', (_, args) => logic.matkulGetDetail(args))
  ipcMain.handle('matkul:setCurrentWeek', (_, args) => logic.matkulSetCurrentWeek(args))

  // ---------- UPDATE ITEMS ----------
  ipcMain.handle('tugas:update',    (_, data) => logic.updateItem('tugas', data))
  ipcMain.handle('diskusi:update',  (_, data) => logic.updateItem('diskusi', data))
  ipcMain.handle('presensi:update', (_, data) => logic.updateItem('presensi', data))

  // ---------- DATA EXPORT ----------
  ipcMain.handle('data:export', async () => {
    const d = logic.readData()
    const payload = { ...d, exported_at: new Date().toISOString(), exported_from: 'UT Tracker' }
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Ekspor Data UT-Tracker',
      defaultPath: `ut-tracker-export-${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { success: false }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
    shell.showItemInFolder(filePath)
    return { success: true }
  })

  // ---------- DATA IMPORT ----------
  ipcMain.handle('data:import-open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Pilih File Import',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths.length) return null
    try {
      const raw = fs.readFileSync(filePaths[0], 'utf-8')
      const parsed = JSON.parse(raw)
      if (!logic.validateImportFile(parsed)) return { error: 'File tidak valid — bukan ekspor UT Tracker.' }
      return { data: parsed }
    } catch { return { error: 'File tidak bisa dibaca atau rusak.' } }
  })

  ipcMain.handle('data:import-execute', (_, args) => logic.importExecute(args))

  // ---------- BACKUP ----------
  ipcMain.handle('backup:choose-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Pilih Folder Backup',
      properties: ['openDirectory', 'createDirectory']
    })
    if (canceled || !filePaths.length) return null
    return filePaths[0]
  })

  ipcMain.handle('backup:open-folder', async () => {
    const backupPath = logic.settingsGet({ key: 'backup_path' })
    if (!backupPath || !fs.existsSync(backupPath)) return { success: false, error: 'Folder tidak ditemukan.' }
    shell.openPath(backupPath)
    return { success: true }
  })

  ipcMain.handle('backup:now', async () => {
    const d = logic.readData()
    return logic.backupNow({
      backupPath: d.settings?.backup_path,
      maxBackups: d.settings?.backup_max,
      data: d
    })
  })

  // ---------- SETTINGS ----------
  ipcMain.handle('settings:get', (_, args) => logic.settingsGet(args))
  ipcMain.handle('settings:set', (_, args) => logic.settingsSet(args))
}

// ==================== NOTIFICATION ====================

function sendStartupNotification() {
  try {
    if (!Notification.isSupported()) return
    const d = logic.readData()
    const activeSemester = d.semesters.find(s => s.is_active === 1)
    if (!activeSemester?.tanggal_mulai) return

    const diffDays = Math.floor((Date.now() - new Date(activeSemester.tanggal_mulai)) / 86400000)
    const currentWeek = Math.max(1, Math.min(8, Math.floor(diffDays / 7) + 1))

    const mkIds = d.mata_kuliah.filter(m => m.semester_id === activeSemester.id).map(m => m.id)
    const pending = d.tugas.filter(t => mkIds.includes(t.matkul_id) && t.status === 0 && t.minggu_due <= currentWeek)

    if (pending.length > 0) {
      new Notification({
        title: 'UT-Tracker',
        body: `Ada ${pending.length} tugas yang belum dikerjakan dan sudah melewati batas minggu ini!`
      }).show()
    }
  } catch (err) { console.error('Notification error:', err) }
}

// ==================== WINDOW ====================

let mainWindow = null

function saveWindowBounds(win) {
  try {
    if (win.isMaximized() || win.isMinimized()) return
    logic.settingsSet({ key: 'window_bounds', value: win.getBounds() })
  } catch {}
}

function createWindow() {
  const bounds = logic.getWindowBounds()
  const win = new BrowserWindow({
    width: bounds.width || 1200,
    height: bounds.height || 800,
    x: bounds.x,
    y: bounds.y,
    minWidth: 900,
    minHeight: 600,
    title: 'UT-Tracker',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  const saveBounds = () => saveWindowBounds(win)
  win.on('resize', saveBounds); win.on('move', saveBounds); win.on('close', saveBounds)
  return win
}

function triggerBackupScheduler() {
  logic.startBackupScheduler(() => {
    if (mainWindow) mainWindow.webContents.send('backup:triggered')
  })
}

ipcMain.on('backup:settings-changed', () => triggerBackupScheduler())

app.whenReady().then(() => {
  setupIPC()
  mainWindow = createWindow()
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(sendStartupNotification, 2000)
    triggerBackupScheduler()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow) mainWindow.webContents.toggleDevTools()
    })
  }
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { mainWindow = createWindow() } })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('will-quit', () => globalShortcut.unregisterAll())

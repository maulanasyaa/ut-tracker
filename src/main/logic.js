/**
 * ut-tracker — pure business logic
 * No electron deps — fully unit-testable
 */

import path from 'path'
import fs from 'fs'

// ─── DATA STORE ───────────────────────────────────────────────────────────────

let _dataPath = null
let _cache    = null

function setDataPath(p) { _dataPath = p }

function getDataPath() {
  if (!_dataPath) throw new Error('dataPath not set — call setDataPath() first')
  return _dataPath
}

function emptyData() {
  return { semesters: [], mata_kuliah: [], tugas: [], diskusi: [], presensi: [], settings: {}, _lastId: 0 }
}

function readData() {
  if (_cache) return _cache
  const p = getDataPath()
  if (!fs.existsSync(p)) {
    _cache = emptyData()
    writeData(_cache)
  } else {
    _cache = JSON.parse(fs.readFileSync(p, 'utf-8'))
  }
  return _cache
}

function writeData(data) {
  _cache = data
  fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8')
}

function resetCache() { _cache = null }

function nextId(data) {
  data._lastId = (data._lastId || 0) + 1
  return data._lastId
}

// ─── SEMESTER ─────────────────────────────────────────────────────────────────

function semesterSort(semesters) {
  return [...semesters].sort((a, b) => {
    const nA = parseInt(a.nama.replace('Semester ', '')) || 0
    const nB = parseInt(b.nama.replace('Semester ', '')) || 0
    if (nA !== nB) return nA - nB
    return (a.tahun || '').localeCompare(b.tahun || '')
  })
}

function semesterGetAll() {
  return semesterSort(readData().semesters)
}

function semesterCreate({ nama, tahun, tanggal_mulai }) {
  const d  = readData()
  const id = nextId(d)
  d.semesters.push({ id, nama, tahun, tanggal_mulai: tanggal_mulai || '', is_active: 0 })
  writeData(d)
  return { id }
}

function semesterSetActive({ id }) {
  const d = readData()
  d.semesters = d.semesters.map(s => ({ ...s, is_active: s.id === id ? 1 : 0 }))
  writeData(d)
  return { success: true }
}

function semesterDelete({ id }) {
  const d     = readData()
  const mkIds = d.mata_kuliah.filter(m => m.semester_id === id).map(m => m.id)
  d.semesters   = d.semesters.filter(s => s.id !== id)
  d.mata_kuliah = d.mata_kuliah.filter(m => m.semester_id !== id)
  d.tugas       = d.tugas.filter(t => !mkIds.includes(t.matkul_id))
  d.diskusi     = d.diskusi.filter(t => !mkIds.includes(t.matkul_id))
  d.presensi    = d.presensi.filter(t => !mkIds.includes(t.matkul_id))
  writeData(d)
  return { success: true }
}

function semesterUpdate({ id, nama, tahun, tanggal_mulai }) {
  const d = readData()
  d.semesters = d.semesters.map(s =>
    s.id === id ? { ...s, nama, tahun, tanggal_mulai: tanggal_mulai || '' } : s
  )
  writeData(d)
  return { success: true }
}

// ─── MATA KULIAH ──────────────────────────────────────────────────────────────

function matkulGetBySemester({ semester_id }) {
  const d = readData()
  return d.mata_kuliah
    .filter(m => m.semester_id === semester_id)
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }))
    .map(mk => ({
      ...mk,
      progress: {
        tugas:    { done: d.tugas.filter(t => t.matkul_id === mk.id && t.status === 1).length, total: 3 },
        diskusi:  { done: d.diskusi.filter(t => t.matkul_id === mk.id && t.status === 1).length, total: mk.type === 'berpraktik' ? 0 : 8 },
        presensi: { done: d.presensi.filter(t => t.matkul_id === mk.id && t.status === 1).length, total: 8 }
      }
    }))
}

function matkulCreate({ semester_id, nama, kode, type }) {
  const d  = readData()
  const id = nextId(d)
  d.mata_kuliah.push({
    id, semester_id, nama, kode: kode || '',
    type: type || 'umum', current_week: 1, started: false, week_deadlines: {}
  })

  // 3 tugas — minggu 3, 5, 7
  ;[{ nomor: 1, minggu_due: 3 }, { nomor: 2, minggu_due: 5 }, { nomor: 3, minggu_due: 7 }].forEach(t => {
    d.tugas.push({ id: nextId(d), matkul_id: id, nomor: t.nomor, minggu_due: t.minggu_due, status: 0, catatan: '', tanggal_submit: '' })
  })

  // 8 presensi; diskusi hanya untuk umum
  for (let i = 1; i <= 8; i++) {
    if (type !== 'berpraktik') {
      d.diskusi.push({ id: nextId(d), matkul_id: id, minggu: i, status: 0, catatan: '', tanggal_submit: '' })
    }
    d.presensi.push({ id: nextId(d), matkul_id: id, minggu: i, status: 0, catatan: '', tanggal_submit: '' })
  }

  writeData(d)
  return { id }
}

function matkulDelete({ id }) {
  const d = readData()
  d.mata_kuliah = d.mata_kuliah.filter(m => m.id !== id)
  d.tugas       = d.tugas.filter(t => t.matkul_id !== id)
  d.diskusi     = d.diskusi.filter(t => t.matkul_id !== id)
  d.presensi    = d.presensi.filter(t => t.matkul_id !== id)
  writeData(d)
  return { success: true }
}

function matkulGetDetail({ id }) {
  const d      = readData()
  const matkul = d.mata_kuliah.find(m => m.id === id)
  if (!matkul) return null
  return {
    ...matkul,
    tugas:    d.tugas.filter(t => t.matkul_id === id).sort((a, b) => a.nomor - b.nomor),
    diskusi:  d.diskusi.filter(t => t.matkul_id === id).sort((a, b) => a.minggu - b.minggu),
    presensi: d.presensi.filter(t => t.matkul_id === id).sort((a, b) => a.minggu - b.minggu)
  }
}

function matkulSetCurrentWeek({ id, week, deadline }) {
  const d = readData()
  d.mata_kuliah = d.mata_kuliah.map(m => {
    if (m.id !== id) return m
    const week_deadlines = { ...(m.week_deadlines || {}) }
    if (deadline) week_deadlines[String(week)] = deadline
    return { ...m, current_week: week, started: true, week_deadlines }
  })
  writeData(d)
  return { success: true }
}

// ─── ITEMS (tugas / diskusi / presensi) ───────────────────────────────────────

function updateItem(table, { id, status, catatan, tanggal_submit }) {
  const d = readData()
  d[table] = d[table].map(item =>
    item.id === id
      ? { ...item, status, catatan: catatan || '', tanggal_submit: tanggal_submit || '' }
      : item
  )
  writeData(d)
  return { success: true }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function settingsGet({ key }) {
  return readData().settings[key] ?? null
}

function settingsSet({ key, value }) {
  const d = readData()
  d.settings[key] = value
  writeData(d)
  return { success: true }
}

// ─── WINDOW BOUNDS ────────────────────────────────────────────────────────────

function getWindowBounds() {
  try {
    const d = readData()
    return d.settings?.window_bounds || {}
  } catch { return {} }
}

// ─── IMPORT / EXPORT ──────────────────────────────────────────────────────────

function importExecute({ mode, importData, currentData }) {
  // currentData passed in for testability (otherwise read from store)
  const d = currentData || readData()

  if (mode === 'replace') {
    const newData = {
      semesters:   importData.semesters   || [],
      mata_kuliah: importData.mata_kuliah || [],
      tugas:       importData.tugas       || [],
      diskusi:     importData.diskusi     || [],
      presensi:    importData.presensi    || [],
      settings:    d.settings,
      _lastId:     importData._lastId     || 0
    }
    writeData(newData)
    return { success: true }
  }

  // mode === 'merge'
  const idMapSem = {}
  const idMapMk  = {}
  let lastId = d._lastId || 0
  const nid  = () => ++lastId

  for (const sem of (importData.semesters || [])) {
    const exists = d.semesters.find(s => s.nama === sem.nama && s.tahun === sem.tahun)
    if (exists) { idMapSem[sem.id] = exists.id; continue }
    const newId = nid()
    idMapSem[sem.id] = newId
    d.semesters.push({ ...sem, id: newId })
  }
  for (const mk of (importData.mata_kuliah || [])) {
    const newSemId = idMapSem[mk.semester_id]
    if (!newSemId) continue
    const exists = d.mata_kuliah.find(m => m.nama === mk.nama && m.semester_id === newSemId)
    if (exists) { idMapMk[mk.id] = exists.id; continue }
    const newId = nid()
    idMapMk[mk.id] = newId
    d.mata_kuliah.push({ ...mk, id: newId, semester_id: newSemId })
  }
  for (const item of (importData.tugas || [])) {
    const newMkId = idMapMk[item.matkul_id]
    if (!newMkId) continue
    if (!d.tugas.find(t => t.matkul_id === newMkId && t.nomor === item.nomor))
      d.tugas.push({ ...item, id: nid(), matkul_id: newMkId })
  }
  for (const item of (importData.diskusi || [])) {
    const newMkId = idMapMk[item.matkul_id]
    if (!newMkId) continue
    if (!d.diskusi.find(t => t.matkul_id === newMkId && t.minggu === item.minggu))
      d.diskusi.push({ ...item, id: nid(), matkul_id: newMkId })
  }
  for (const item of (importData.presensi || [])) {
    const newMkId = idMapMk[item.matkul_id]
    if (!newMkId) continue
    if (!d.presensi.find(t => t.matkul_id === newMkId && t.minggu === item.minggu))
      d.presensi.push({ ...item, id: nid(), matkul_id: newMkId })
  }
  d._lastId = lastId
  writeData(d)
  return { success: true }
}

// ─── BACKUP FILE MANAGEMENT ───────────────────────────────────────────────────

let _backupTimer = null

function startBackupScheduler(onTrigger) {
  if (_backupTimer) clearInterval(_backupTimer)
  const d = readData()
  const settings = d.settings || {}
  if (!settings.backup_enabled || !settings.backup_path || !settings.backup_interval) return
  
  const ms = settings.backup_interval * 60 * 60 * 1000
  _backupTimer = setInterval(() => {
    onTrigger()
  }, ms)
}

function backupNow({ backupPath, maxBackups, data }) {
  if (!backupPath) return { success: false, error: 'Folder backup belum diset.' }
  if (!fs.existsSync(backupPath)) {
    try { fs.mkdirSync(backupPath, { recursive: true }) }
    catch { return { success: false, error: 'Folder tidak bisa dibuat.' } }
  }
  const ts       = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const filename = path.join(backupPath, `ut-tracker-backup-${ts}.json`)
  fs.writeFileSync(filename, JSON.stringify({ ...data, backup_at: new Date().toISOString() }, null, 2), 'utf-8')

  // cleanup old files
  const max   = maxBackups || 10
  const files = fs.readdirSync(backupPath)
    .filter(f => f.startsWith('ut-tracker-backup-') && f.endsWith('.json'))
    .map(f => ({ f, t: fs.statSync(path.join(backupPath, f)).mtimeMs }))
    .sort((a, b) => a.t - b.t)
  while (files.length > max) {
    const old = files.shift()
    fs.unlinkSync(path.join(backupPath, old.f))
  }
  return { success: true, filename }
}

// ─── VALIDATE IMPORT FILE ─────────────────────────────────────────────────────

function validateImportFile(parsed) {
  if (!parsed || typeof parsed !== 'object') return false
  return Array.isArray(parsed.semesters) && Array.isArray(parsed.mata_kuliah)
}

export default {
  // store
  setDataPath, resetCache, readData, writeData, nextId, emptyData,
  // semester
  semesterSort, semesterGetAll, semesterCreate, semesterSetActive,
  semesterDelete, semesterUpdate,
  // matkul
  matkulGetBySemester, matkulCreate, matkulDelete, matkulGetDetail, matkulSetCurrentWeek,
  // items
  updateItem,
  // settings
  settingsGet, settingsSet,
  // window
  getWindowBounds,
  // import/export
  importExecute, validateImportFile,
  // backup
  backupNow, startBackupScheduler,
}

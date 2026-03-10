/**
 * UT-Tracker — Comprehensive Test Suite
 * Covers: data layer, semester, matkul, items, settings, import/export, backup, validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

// We require CJS logic module
const logic = require('../main/logic.js')

// ─── TEST SETUP ───────────────────────────────────────────────────────────────

let tmpDir
let dbFile

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'ut-tracker-test-'))
  dbFile = join(tmpDir, 'data.json')
  logic.setDataPath(dbFile)
  logic.resetCache()
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// ─── DATA LAYER ───────────────────────────────────────────────────────────────

describe('Data Layer', () => {
  it('creates default structure when file does not exist', () => {
    const d = logic.readData()
    expect(d.semesters).toEqual([])
    expect(d.mata_kuliah).toEqual([])
    expect(d.tugas).toEqual([])
    expect(d.diskusi).toEqual([])
    expect(d.presensi).toEqual([])
    expect(d.settings).toEqual({})
    expect(d._lastId).toBe(0)
  })

  it('reads existing file from disk', () => {
    const sample = { ...logic.emptyData(), _lastId: 99 }
    writeFileSync(dbFile, JSON.stringify(sample))
    logic.resetCache()
    expect(logic.readData()._lastId).toBe(99)
  })

  it('persists data to disk on writeData', () => {
    const d = logic.readData()
    d.settings.foo = 'bar'
    logic.writeData(d)
    logic.resetCache()
    expect(logic.readData().settings.foo).toBe('bar')
  })

  it('nextId increments sequentially', () => {
    const d = logic.emptyData()
    expect(logic.nextId(d)).toBe(1)
    expect(logic.nextId(d)).toBe(2)
    expect(logic.nextId(d)).toBe(3)
    expect(d._lastId).toBe(3)
  })

  it('nextId works from any starting point', () => {
    const d = { ...logic.emptyData(), _lastId: 50 }
    expect(logic.nextId(d)).toBe(51)
  })
})

// ─── SEMESTER ─────────────────────────────────────────────────────────────────

describe('Semester — Sorting', () => {
  it('sorts by nomor ascending', () => {
    const result = logic.semesterSort([
      { nama: 'Semester 3', tahun: '2026' },
      { nama: 'Semester 1', tahun: '2026' },
      { nama: 'Semester 2', tahun: '2026' },
    ])
    expect(result.map(s => s.nama)).toEqual(['Semester 1', 'Semester 2', 'Semester 3'])
  })

  it('sorts by tahun when nomor is same', () => {
    const result = logic.semesterSort([
      { nama: 'Semester 1', tahun: '2027' },
      { nama: 'Semester 1', tahun: '2025' },
      { nama: 'Semester 1', tahun: '2026' },
    ])
    expect(result.map(s => s.tahun)).toEqual(['2025', '2026', '2027'])
  })

  it('handles missing tahun gracefully', () => {
    const result = logic.semesterSort([
      { nama: 'Semester 2', tahun: '' },
      { nama: 'Semester 1', tahun: '' },
    ])
    expect(result[0].nama).toBe('Semester 1')
  })
})

describe('Semester — CRUD', () => {
  it('creates a semester and returns id', () => {
    const { id } = logic.semesterCreate({ nama: 'Semester 1', tahun: '2026', tanggal_mulai: '2026-03-01' })
    expect(id).toBe(1)
    const all = logic.semesterGetAll()
    expect(all).toHaveLength(1)
    expect(all[0].nama).toBe('Semester 1')
    expect(all[0].tahun).toBe('2026')
    expect(all[0].is_active).toBe(0)
  })

  it('defaults tanggal_mulai to empty string when not provided', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    expect(logic.semesterGetAll()[0].tanggal_mulai).toBe('')
  })

  it('sets one semester active and deactivates others', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    logic.semesterCreate({ nama: 'Semester 2', tahun: '2026' })
    const all = logic.semesterGetAll()
    logic.semesterSetActive({ id: all[1].id })
    const updated = logic.semesterGetAll()
    expect(updated.find(s => s.id === all[0].id).is_active).toBe(0)
    expect(updated.find(s => s.id === all[1].id).is_active).toBe(1)
  })

  it('deletes semester and cascades to matkul/tugas/diskusi/presensi', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    const semId = logic.semesterGetAll()[0].id
    logic.matkulCreate({ semester_id: semId, nama: 'Kalkulus', type: 'umum' })
    logic.semesterDelete({ id: semId })
    expect(logic.semesterGetAll()).toHaveLength(0)
    expect(logic.readData().mata_kuliah).toHaveLength(0)
    expect(logic.readData().tugas).toHaveLength(0)
    expect(logic.readData().diskusi).toHaveLength(0)
    expect(logic.readData().presensi).toHaveLength(0)
  })

  it('deleting one semester does not affect other semesters data', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    logic.semesterCreate({ nama: 'Semester 2', tahun: '2026' })
    const [s1, s2] = logic.semesterGetAll()
    logic.matkulCreate({ semester_id: s1.id, nama: 'MK A', type: 'umum' })
    logic.matkulCreate({ semester_id: s2.id, nama: 'MK B', type: 'umum' })
    logic.semesterDelete({ id: s1.id })
    expect(logic.semesterGetAll()).toHaveLength(1)
    expect(logic.readData().mata_kuliah).toHaveLength(1)
    expect(logic.readData().mata_kuliah[0].nama).toBe('MK B')
  })

  it('updates semester fields', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2025' })
    const id = logic.semesterGetAll()[0].id
    logic.semesterUpdate({ id, nama: 'Semester 1', tahun: '2026', tanggal_mulai: '2026-03-01' })
    const updated = logic.semesterGetAll()[0]
    expect(updated.tahun).toBe('2026')
    expect(updated.tanggal_mulai).toBe('2026-03-01')
  })
})

// ─── MATA KULIAH ──────────────────────────────────────────────────────────────

describe('Matkul — Create (umum)', () => {
  let semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
  })

  it('creates matkul with correct defaults', () => {
    logic.matkulCreate({ semester_id: semId, nama: 'Kalkulus', kode: 'MAT101', type: 'umum' })
    const d = logic.readData()
    expect(d.mata_kuliah).toHaveLength(1)
    expect(d.mata_kuliah[0]).toMatchObject({
      nama: 'Kalkulus', kode: 'MAT101', type: 'umum',
      current_week: 1, started: false
    })
    expect(d.mata_kuliah[0].week_deadlines).toEqual({})
  })

  it('auto-creates exactly 3 tugas for umum', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Kalkulus', type: 'umum' })
    const tugas = logic.readData().tugas.filter(t => t.matkul_id === id)
    expect(tugas).toHaveLength(3)
    expect(tugas.map(t => t.minggu_due)).toEqual([3, 5, 7])
    expect(tugas.map(t => t.nomor)).toEqual([1, 2, 3])
    tugas.forEach(t => expect(t.status).toBe(0))
  })

  it('auto-creates exactly 8 diskusi for umum', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Kalkulus', type: 'umum' })
    const diskusi = logic.readData().diskusi.filter(t => t.matkul_id === id)
    expect(diskusi).toHaveLength(8)
    expect(diskusi.map(t => t.minggu)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('auto-creates exactly 8 presensi for umum', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Kalkulus', type: 'umum' })
    const presensi = logic.readData().presensi.filter(t => t.matkul_id === id)
    expect(presensi).toHaveLength(8)
  })

  it('defaults type to umum when not provided', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Fisika' })
    expect(logic.readData().mata_kuliah.find(m => m.id === id).type).toBe('umum')
  })

  it('defaults kode to empty string when not provided', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Fisika' })
    expect(logic.readData().mata_kuliah.find(m => m.id === id).kode).toBe('')
  })
})

describe('Matkul — Create (berpraktik)', () => {
  let semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
  })

  it('creates 3 tugas for berpraktik', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Praktikum Fisika', type: 'berpraktik' })
    expect(logic.readData().tugas.filter(t => t.matkul_id === id)).toHaveLength(3)
  })

  it('does NOT create diskusi for berpraktik', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Praktikum Fisika', type: 'berpraktik' })
    expect(logic.readData().diskusi.filter(t => t.matkul_id === id)).toHaveLength(0)
  })

  it('creates 8 presensi for berpraktik', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Praktikum Fisika', type: 'berpraktik' })
    expect(logic.readData().presensi.filter(t => t.matkul_id === id)).toHaveLength(8)
  })
})

describe('Matkul — getBySemester', () => {
  let semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
  })

  it('returns only matkul for the given semester', () => {
    logic.semesterCreate({ nama: 'Semester 2', tahun: '2026' })
    const sem2Id = logic.semesterGetAll()[1].id
    logic.matkulCreate({ semester_id: semId,  nama: 'MK A', type: 'umum' })
    logic.matkulCreate({ semester_id: sem2Id, nama: 'MK B', type: 'umum' })
    expect(logic.matkulGetBySemester({ semester_id: semId })).toHaveLength(1)
  })

  it('sorts matkul alphabetically by nama (locale id)', () => {
    logic.matkulCreate({ semester_id: semId, nama: 'Zologi',   type: 'umum' })
    logic.matkulCreate({ semester_id: semId, nama: 'Algoritma', type: 'umum' })
    logic.matkulCreate({ semester_id: semId, nama: 'Matematika', type: 'umum' })
    const names = logic.matkulGetBySemester({ semester_id: semId }).map(m => m.nama)
    expect(names).toEqual(['Algoritma', 'Matematika', 'Zologi'])
  })

  it('includes correct progress totals for umum', () => {
    logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    const mk = logic.matkulGetBySemester({ semester_id: semId })[0]
    expect(mk.progress.tugas.total).toBe(3)
    expect(mk.progress.diskusi.total).toBe(8)
    expect(mk.progress.presensi.total).toBe(8)
    expect(mk.progress.tugas.done).toBe(0)
    expect(mk.progress.diskusi.done).toBe(0)
    expect(mk.progress.presensi.done).toBe(0)
  })

  it('includes diskusi.total = 0 for berpraktik', () => {
    logic.matkulCreate({ semester_id: semId, nama: 'Praktikum', type: 'berpraktik' })
    const mk = logic.matkulGetBySemester({ semester_id: semId })[0]
    expect(mk.progress.diskusi.total).toBe(0)
  })

  it('counts done progress correctly', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    const d = logic.readData()
    // Mark 2 tugas done
    d.tugas.filter(t => t.matkul_id === id).slice(0, 2).forEach(t => t.status = 1)
    // Mark 3 diskusi done
    d.diskusi.filter(t => t.matkul_id === id).slice(0, 3).forEach(t => t.status = 1)
    logic.writeData(d)
    logic.resetCache()
    const mk = logic.matkulGetBySemester({ semester_id: semId })[0]
    expect(mk.progress.tugas.done).toBe(2)
    expect(mk.progress.diskusi.done).toBe(3)
  })
})

describe('Matkul — delete & getDetail', () => {
  let semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
  })

  it('deletes matkul and cascades all items', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    logic.matkulDelete({ id })
    expect(logic.readData().mata_kuliah).toHaveLength(0)
    expect(logic.readData().tugas.filter(t => t.matkul_id === id)).toHaveLength(0)
    expect(logic.readData().diskusi.filter(t => t.matkul_id === id)).toHaveLength(0)
    expect(logic.readData().presensi.filter(t => t.matkul_id === id)).toHaveLength(0)
  })

  it('deleting one matkul does not affect sibling matkul items', () => {
    const { id: id1 } = logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    logic.matkulCreate({ semester_id: semId, nama: 'MK B', type: 'umum' })
    logic.matkulDelete({ id: id1 })
    const d = logic.readData()
    expect(d.mata_kuliah).toHaveLength(1)
    expect(d.tugas).toHaveLength(3)   // MK B's 3 tugas still exist
    expect(d.diskusi).toHaveLength(8) // MK B's 8 diskusi still exist
    expect(d.presensi).toHaveLength(8)
  })

  it('getDetail returns null for non-existent id', () => {
    expect(logic.matkulGetDetail({ id: 999 })).toBeNull()
  })

  it('getDetail returns matkul with sorted tugas/diskusi/presensi', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    const detail = logic.matkulGetDetail({ id })
    expect(detail.tugas).toHaveLength(3)
    expect(detail.diskusi).toHaveLength(8)
    expect(detail.presensi).toHaveLength(8)
    // tugas sorted by nomor
    expect(detail.tugas.map(t => t.nomor)).toEqual([1, 2, 3])
    // diskusi sorted by minggu
    expect(detail.diskusi.map(t => t.minggu)).toEqual([1,2,3,4,5,6,7,8])
  })

  it('getDetail for berpraktik has empty diskusi array', () => {
    const { id } = logic.matkulCreate({ semester_id: semId, nama: 'Praktikum', type: 'berpraktik' })
    const detail = logic.matkulGetDetail({ id })
    expect(detail.diskusi).toHaveLength(0)
  })
})

describe('Matkul — setCurrentWeek', () => {
  let mkId, semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
    const res = logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    mkId  = res.id
  })

  it('sets started = true and updates current_week', () => {
    logic.matkulSetCurrentWeek({ id: mkId, week: 1, deadline: '2026-03-17' })
    const mk = logic.readData().mata_kuliah.find(m => m.id === mkId)
    expect(mk.started).toBe(true)
    expect(mk.current_week).toBe(1)
  })

  it('stores deadline in week_deadlines keyed by string week', () => {
    logic.matkulSetCurrentWeek({ id: mkId, week: 1, deadline: '2026-03-17' })
    const mk = logic.readData().mata_kuliah.find(m => m.id === mkId)
    expect(mk.week_deadlines['1']).toBe('2026-03-17')
  })

  it('advances to next week and adds new deadline', () => {
    logic.matkulSetCurrentWeek({ id: mkId, week: 1, deadline: '2026-03-17' })
    logic.matkulSetCurrentWeek({ id: mkId, week: 2, deadline: '2026-03-24' })
    const mk = logic.readData().mata_kuliah.find(m => m.id === mkId)
    expect(mk.current_week).toBe(2)
    expect(mk.week_deadlines['1']).toBe('2026-03-17')
    expect(mk.week_deadlines['2']).toBe('2026-03-24')
  })

  it('does not overwrite existing deadline when none provided', () => {
    logic.matkulSetCurrentWeek({ id: mkId, week: 1, deadline: '2026-03-17' })
    logic.matkulSetCurrentWeek({ id: mkId, week: 2 }) // no deadline
    const mk = logic.readData().mata_kuliah.find(m => m.id === mkId)
    expect(mk.week_deadlines['1']).toBe('2026-03-17')
    expect(mk.week_deadlines['2']).toBeUndefined()
  })

  it('does not affect other matkul', () => {
    const { id: mkId2 } = logic.matkulCreate({ semester_id: semId, nama: 'MK B', type: 'umum' })
    logic.matkulSetCurrentWeek({ id: mkId, week: 3, deadline: '2026-03-31' })
    const mk2 = logic.readData().mata_kuliah.find(m => m.id === mkId2)
    expect(mk2.started).toBe(false)
    expect(mk2.current_week).toBe(1)
  })
})

// ─── ITEMS (tugas / diskusi / presensi) ───────────────────────────────────────

describe('updateItem — tugas', () => {
  let tugasId, semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
    logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    tugasId = logic.readData().tugas[0].id
  })

  it('marks tugas as done', () => {
    logic.updateItem('tugas', { id: tugasId, status: 1, catatan: 'selesai', tanggal_submit: '2026-03-10' })
    const t = logic.readData().tugas.find(t => t.id === tugasId)
    expect(t.status).toBe(1)
    expect(t.catatan).toBe('selesai')
    expect(t.tanggal_submit).toBe('2026-03-10')
  })

  it('marks tugas back to undone', () => {
    logic.updateItem('tugas', { id: tugasId, status: 1, catatan: '', tanggal_submit: '' })
    logic.updateItem('tugas', { id: tugasId, status: 0, catatan: '', tanggal_submit: '' })
    expect(logic.readData().tugas.find(t => t.id === tugasId).status).toBe(0)
  })

  it('defaults catatan and tanggal_submit to empty string', () => {
    logic.updateItem('tugas', { id: tugasId, status: 1 })
    const t = logic.readData().tugas.find(t => t.id === tugasId)
    expect(t.catatan).toBe('')
    expect(t.tanggal_submit).toBe('')
  })

  it('does not affect other tugas rows', () => {
    const allIds = logic.readData().tugas.map(t => t.id)
    logic.updateItem('tugas', { id: tugasId, status: 1, catatan: 'ok', tanggal_submit: '2026-03-10' })
    const others = logic.readData().tugas.filter(t => t.id !== tugasId)
    others.forEach(t => expect(t.status).toBe(0))
  })
})

describe('updateItem — diskusi & presensi', () => {
  let semId

  beforeEach(() => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    semId = logic.semesterGetAll()[0].id
    logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
  })

  it('updates diskusi status', () => {
    const diskusiId = logic.readData().diskusi[0].id
    logic.updateItem('diskusi', { id: diskusiId, status: 1, catatan: 'hadir', tanggal_submit: '2026-03-10' })
    expect(logic.readData().diskusi.find(d => d.id === diskusiId).status).toBe(1)
  })

  it('updates presensi status', () => {
    const presensiId = logic.readData().presensi[0].id
    logic.updateItem('presensi', { id: presensiId, status: 1, catatan: '', tanggal_submit: '2026-03-10' })
    expect(logic.readData().presensi.find(p => p.id === presensiId).status).toBe(1)
  })
})

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

describe('Settings', () => {
  it('returns null for non-existent key', () => {
    expect(logic.settingsGet({ key: 'unknown' })).toBeNull()
  })

  it('sets and gets a value', () => {
    logic.settingsSet({ key: 'darkMode', value: 'true' })
    expect(logic.settingsGet({ key: 'darkMode' })).toBe('true')
  })

  it('overwrites existing value', () => {
    logic.settingsSet({ key: 'theme', value: 'classic' })
    logic.settingsSet({ key: 'theme', value: 'dracula' })
    expect(logic.settingsGet({ key: 'theme' })).toBe('dracula')
  })

  it('stores window_bounds object', () => {
    const bounds = { x: 100, y: 200, width: 1200, height: 800 }
    logic.settingsSet({ key: 'window_bounds', value: bounds })
    expect(logic.settingsGet({ key: 'window_bounds' })).toEqual(bounds)
  })
})

describe('getWindowBounds', () => {
  it('returns empty object when no window_bounds saved', () => {
    expect(logic.getWindowBounds()).toEqual({})
  })

  it('returns saved bounds', () => {
    const bounds = { x: 50, y: 50, width: 1000, height: 700 }
    logic.settingsSet({ key: 'window_bounds', value: bounds })
    logic.resetCache()
    expect(logic.getWindowBounds()).toEqual(bounds)
  })
})

// ─── IMPORT / EXPORT ──────────────────────────────────────────────────────────

describe('validateImportFile', () => {
  it('returns true for valid UT Tracker export', () => {
    expect(logic.validateImportFile({ semesters: [], mata_kuliah: [] })).toBe(true)
  })

  it('returns false when semesters missing', () => {
    expect(logic.validateImportFile({ mata_kuliah: [] })).toBe(false)
  })

  it('returns false when mata_kuliah missing', () => {
    expect(logic.validateImportFile({ semesters: [] })).toBe(false)
  })

  it('returns false for null', () => {
    expect(logic.validateImportFile(null)).toBe(false)
  })

  it('returns false for non-array semesters', () => {
    expect(logic.validateImportFile({ semesters: 'x', mata_kuliah: [] })).toBe(false)
  })
})

describe('importExecute — replace mode', () => {
  it('replaces all data but preserves settings', () => {
    logic.settingsSet({ key: 'theme', value: 'dracula' })
    logic.resetCache()
    const importData = {
      semesters: [{ id: 1, nama: 'Semester 1', tahun: '2025', is_active: 0 }],
      mata_kuliah: [], tugas: [], diskusi: [], presensi: [], _lastId: 1
    }
    logic.importExecute({ mode: 'replace', importData })
    const d = logic.readData()
    expect(d.semesters).toHaveLength(1)
    expect(d.semesters[0].nama).toBe('Semester 1')
    expect(d.settings.theme).toBe('dracula') // settings preserved
  })

  it('handles empty import data gracefully', () => {
    logic.importExecute({ mode: 'replace', importData: { semesters: [], mata_kuliah: [] } })
    expect(logic.readData().semesters).toHaveLength(0)
  })
})

describe('importExecute — merge mode', () => {
  it('adds new semesters from import', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    const importData = {
      semesters: [{ id: 99, nama: 'Semester 2', tahun: '2026', is_active: 0 }],
      mata_kuliah: [], tugas: [], diskusi: [], presensi: [], _lastId: 99
    }
    logic.importExecute({ mode: 'merge', importData })
    expect(logic.semesterGetAll()).toHaveLength(2)
  })

  it('skips duplicate semester (same nama + tahun)', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    const importData = {
      semesters: [{ id: 99, nama: 'Semester 1', tahun: '2026', is_active: 0 }],
      mata_kuliah: [], tugas: [], diskusi: [], presensi: [], _lastId: 99
    }
    logic.importExecute({ mode: 'merge', importData })
    expect(logic.semesterGetAll()).toHaveLength(1)
  })

  it('remaps IDs correctly for matkul referencing imported semester', () => {
    const importData = {
      semesters:   [{ id: 1, nama: 'Semester 3', tahun: '2026', is_active: 0 }],
      mata_kuliah: [{ id: 2, semester_id: 1, nama: 'Statistika', kode: 'ST101', type: 'umum', current_week: 1, started: false, week_deadlines: {} }],
      tugas: [], diskusi: [], presensi: [], _lastId: 2
    }
    logic.importExecute({ mode: 'merge', importData })
    const sems = logic.semesterGetAll()
    expect(sems).toHaveLength(1)
    const mk = logic.readData().mata_kuliah[0]
    expect(mk.semester_id).toBe(sems[0].id) // remapped, not original 1
    expect(mk.nama).toBe('Statistika')
  })

  it('skips matkul whose semester was not imported', () => {
    const importData = {
      semesters:   [],
      mata_kuliah: [{ id: 5, semester_id: 999, nama: 'Orphan MK', type: 'umum' }],
      tugas: [], diskusi: [], presensi: [], _lastId: 5
    }
    logic.importExecute({ mode: 'merge', importData })
    expect(logic.readData().mata_kuliah).toHaveLength(0)
  })

  it('does not duplicate existing matkul on re-import', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    logic.matkulCreate({ semester_id: logic.semesterGetAll()[0].id, nama: 'Kalkulus', type: 'umum' })

    const semId = logic.semesterGetAll()[0].id
    const importData = {
      semesters:   [{ id: semId, nama: 'Semester 1', tahun: '2026', is_active: 0 }],
      mata_kuliah: [{ id: 99, semester_id: semId, nama: 'Kalkulus', kode: '', type: 'umum', current_week: 1, started: false, week_deadlines: {} }],
      tugas: [], diskusi: [], presensi: [], _lastId: 100
    }
    logic.importExecute({ mode: 'merge', importData })
    expect(logic.readData().mata_kuliah).toHaveLength(1)
  })
})

// ─── BACKUP ───────────────────────────────────────────────────────────────────

describe('startBackupScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('does not start if backup_enabled is false', () => {
    const callback = vi.fn()
    logic.settingsSet({ key: 'backup_enabled', value: false })
    logic.startBackupScheduler(callback)
    vi.advanceTimersByTime(1000 * 60 * 60 * 24) // 24 hours
    expect(callback).not.toHaveBeenCalled()
  })

  it('triggers callback based on backup_interval (hours)', () => {
    const callback = vi.fn()
    logic.settingsSet({ key: 'backup_enabled', value: true })
    logic.settingsSet({ key: 'backup_path', value: '/tmp/backup' })
    logic.settingsSet({ key: 'backup_interval', value: 2 }) // 2 hours
    
    logic.startBackupScheduler(callback)
    
    // Advance 1 hour
    vi.advanceTimersByTime(1000 * 60 * 60 * 1)
    expect(callback).not.toHaveBeenCalled()
    
    // Advance another 1 hour (total 2)
    vi.advanceTimersByTime(1000 * 60 * 60 * 1)
    expect(callback).toHaveBeenCalledTimes(1)
    
    // Total 4 hours
    vi.advanceTimersByTime(1000 * 60 * 60 * 2)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('resets existing timer when called again', () => {
    const callback = vi.fn()
    logic.settingsSet({ key: 'backup_enabled', value: true })
    logic.settingsSet({ key: 'backup_path', value: '/tmp/backup' })
    logic.settingsSet({ key: 'backup_interval', value: 1 })
    
    logic.startBackupScheduler(callback)
    vi.advanceTimersByTime(1000 * 60 * 30) // 30 mins passed
    
    // Restart scheduler
    logic.startBackupScheduler(callback)
    vi.advanceTimersByTime(1000 * 60 * 40) // another 40 mins (total 70 mins from start)
    // If it didn't reset, it would have fired at 60 mins. 
    // But since it reset, it needs 60 mins from the restart.
    expect(callback).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(1000 * 60 * 20) // total 60 mins from restart
    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('backupNow', () => {
  let backupDir

  beforeEach(() => {
    backupDir = join(tmpDir, 'backups')
  })

  it('returns error when backupPath is falsy', () => {
    const result = logic.backupNow({ backupPath: null, data: logic.emptyData() })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/belum diset/)
  })

  it('creates backup folder if it does not exist', () => {
    const data = logic.emptyData()
    logic.backupNow({ backupPath: backupDir, data })
    const files = readdirSync(backupDir)
    expect(files.some(f => f.startsWith('ut-tracker-backup-'))).toBe(true)
  })

  it('backup file contains valid JSON with backup_at field', () => {
    const { filename } = logic.backupNow({ backupPath: backupDir, data: logic.emptyData() })
    const content = JSON.parse(require('fs').readFileSync(filename, 'utf-8'))
    expect(content.backup_at).toBeDefined()
    expect(content.semesters).toBeDefined()
  })

  it('returns success and filename', () => {
    const result = logic.backupNow({ backupPath: backupDir, data: logic.emptyData() })
    expect(result.success).toBe(true)
    expect(result.filename).toContain('ut-tracker-backup-')
  })

  it('deletes oldest backup files when exceeding maxBackups', async () => {
    const data = logic.emptyData()
    const maxBackups = 3
    // Create 5 backups with small delay to ensure different timestamps
    for (let i = 0; i < 5; i++) {
      logic.backupNow({ backupPath: backupDir, maxBackups, data })
      await new Promise(r => setTimeout(r, 10))
    }
    const files = readdirSync(backupDir).filter(f => f.startsWith('ut-tracker-backup-'))
    expect(files.length).toBeLessThanOrEqual(maxBackups)
  })
})

// ─── ID INTEGRITY ─────────────────────────────────────────────────────────────

describe('ID integrity across operations', () => {
  it('IDs are globally unique across all entities', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    const semId = logic.semesterGetAll()[0].id
    logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    logic.matkulCreate({ semester_id: semId, nama: 'MK B', type: 'umum' })

    const d = logic.readData()
    const allIds = [
      ...d.semesters.map(s => s.id),
      ...d.mata_kuliah.map(m => m.id),
      ...d.tugas.map(t => t.id),
      ...d.diskusi.map(t => t.id),
      ...d.presensi.map(t => t.id),
    ]
    const uniqueIds = new Set(allIds)
    expect(uniqueIds.size).toBe(allIds.length)
  })

  it('_lastId in data reflects highest ID used', () => {
    logic.semesterCreate({ nama: 'Semester 1', tahun: '2026' })
    const semId = logic.semesterGetAll()[0].id
    logic.matkulCreate({ semester_id: semId, nama: 'MK A', type: 'umum' })
    const d = logic.readData()
    // 1 semester + 1 matkul + 3 tugas + 8 diskusi + 8 presensi = 21 entities
    expect(d._lastId).toBe(21)
  })
})

import { useState } from 'react'
import { XIcon } from './ui/Icons'
import useStore from '../store/useStore'

export default function SemesterModal({ onClose }) {
  const { semesters } = useStore()

  const [step, setStep] = useState(1)
  const [semesterId, setSemesterId] = useState(null)

  // Step 1
  const [nomor, setNomor] = useState('')
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [loadingSem, setLoadingSem] = useState(false)
  const [semError, setSemError] = useState('')

  // Step 2
  const [matkulList, setMatkulList] = useState([{ nama: '', kode: '', type: 'umum' }])
  const [loadingMatkul, setLoadingMatkul] = useState(false)
  const [matkulErrors, setMatkulErrors] = useState({})

  const nomorInt = parseInt(nomor)
  const isStep1Valid = nomorInt >= 1 && nomorInt <= 10 && tahun.trim()

  // ---- Step 1 ----
  const handleCreateSemester = async () => {
    if (!isStep1Valid) return
    const isDuplicate = semesters.some(
      s => s.nama === `Semester ${nomorInt}` && s.tahun === tahun.trim()
    )
    if (isDuplicate) {
      setSemError(`Semester ${nomorInt} ${tahun.trim()} sudah ada.`)
      return
    }
    setSemError('')
    setLoadingSem(true)
    const { id } = await window.api.semester.create({
      nama: `Semester ${nomorInt}`,
      tahun: tahun.trim(),
      tanggal_mulai: ''
    })
    await window.api.semester.setActive(id)
    setSemesterId(id)
    setLoadingSem(false)
    setStep(2)
  }

  // ---- Step 2 ----
  const addRow = () => setMatkulList(prev => [...prev, { nama: '', kode: '', type: 'umum' }])
  const removeRow = (i) => setMatkulList(prev => prev.filter((_, idx) => idx !== i))
  const updateRow = (i, field, value) => {
    setMatkulList(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    // clear error on edit
    setMatkulErrors(prev => { const n = { ...prev }; delete n[i]; return n })
  }

  const validMatkul = matkulList.filter(m => m.nama.trim())

  const handleSaveMatkul = async () => {
    if (validMatkul.length === 0) { onClose(); return }

    // Check duplicates within the form itself
    const names = validMatkul.map(m => m.nama.trim().toLowerCase())
    const errors = {}
    matkulList.forEach((m, i) => {
      if (!m.nama.trim()) return
      const lower = m.nama.trim().toLowerCase()
      if (names.filter(n => n === lower).length > 1) {
        errors[i] = 'Nama duplikat'
      }
    })
    if (Object.keys(errors).length > 0) {
      setMatkulErrors(errors)
      return
    }

    setLoadingMatkul(true)
    for (const m of validMatkul) {
      await window.api.matkul.create({
        semester_id: semesterId,
        nama: m.nama.trim(),
        kode: m.kode.trim(),
        type: m.type
      })
    }
    setLoadingMatkul(false)
    await useStore.getState().loadSemesters()
    onClose()
  }

  // ---- Render Step 1 ----
  if (step === 1) return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tambah Semester</h3>
          <span className="ml-auto text-xs text-gray-400">1 / 2</span>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1.5">
            Nomor Semester <span className="text-gray-400 font-normal">(1–10)</span>
          </label>
          <input
            type="number" min={1} max={10}
            value={nomor} onChange={e => { setNomor(e.target.value); setSemError('') }}
            onKeyDown={e => e.key === 'Enter' && handleCreateSemester()}
            placeholder="e.g. 3" autoFocus
            className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${semError ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1.5">Tahun</label>
          <input
            type="text" value={tahun}
            onChange={e => { setTahun(e.target.value); setSemError('') }}
            placeholder="2026"
            className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${semError ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
          />
        </div>

        {semError
          ? <p className="text-xs text-red-500 mb-4 -mt-1">⚠ {semError}</p>
          : isStep1Valid && (
            <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-4 -mt-1">
              ✦ <strong>Semester {nomorInt} — {tahun}</strong>
            </p>
          )
        }

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Batal
          </button>
          <button
            onClick={handleCreateSemester}
            disabled={!isStep1Valid || loadingSem}
            className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSem ? 'Menyimpan...' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ---- Render Step 2 ----
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700 overflow-visible">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tambah Mata Kuliah</h3>
          <span className="ml-auto text-xs text-gray-400">2 / 2</span>
        </div>
        <p className="text-xs text-gray-400 mb-5">Semester berhasil dibuat. Tambahkan mata kuliah yang kamu ambil semester ini.</p>

        <div className="space-y-2 mb-3 max-h-72 overflow-y-auto py-1 px-1 -mx-1">
          {matkulList.map((m, i) => (
            <div key={i}>
              <div className="flex gap-2 items-center">
                <input
                  type="text" value={m.nama}
                  onChange={e => updateRow(i, 'nama', e.target.value)}
                  placeholder={`Nama matkul ${i + 1}`}
                  autoFocus={i === 0}
                  className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${matkulErrors[i] ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                />
                <input
                  type="text" value={m.kode}
                  onChange={e => updateRow(i, 'kode', e.target.value)}
                  placeholder="Kode (opsional)"
                  className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={m.type} onChange={e => updateRow(i, 'type', e.target.value)}
                  className="w-28 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="umum">Umum</option>
                  <option value="berpraktik">Berpraktik</option>
                </select>
                {matkulList.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-500 text-lg leading-none flex-shrink-0">✕</button>
                )}
              </div>
              {matkulErrors[i] && (
                <p className="text-xs text-red-500 mt-0.5 ml-1">⚠ {matkulErrors[i]}</p>
              )}
            </div>
          ))}
        </div>

        <button onClick={addRow} className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 mb-5">
          + Tambah matkul
        </button>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Lewati
          </button>
          <button
            onClick={handleSaveMatkul}
            disabled={validMatkul.length === 0 || loadingMatkul}
            className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMatkul ? 'Menyimpan...' : `Simpan ${validMatkul.length > 0 ? `(${validMatkul.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

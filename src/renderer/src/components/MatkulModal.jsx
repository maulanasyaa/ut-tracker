import { useState } from 'react'
import useStore from '../store/useStore'

export default function MatkulModal({ onClose }) {
  const { activeSemester, createMatkul } = useStore()
  const [nama, setNama] = useState('')
  const [kode, setKode] = useState('')
  const [type, setType] = useState('umum')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!nama.trim() || !activeSemester) return
    setLoading(true)
    await createMatkul({
      semester_id: activeSemester.id,
      nama: nama.trim(),
      kode: kode.trim(),
      type
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">Tambah Mata Kuliah</h3>

        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1.5">Nama Matkul</label>
          <input
            type="text"
            value={nama}
            onChange={e => setNama(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Pengantar Akuntansi"
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1.5">
            Kode Matkul
            <span className="ml-1 text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={kode}
            onChange={e => setKode(e.target.value)}
            placeholder="e.g. EKMA4115"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Tipe Matkul</label>
          <div className="flex gap-2">
            <button
              onClick={() => setType('umum')}
              className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${
                type === 'umum'
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Umum
            </button>
            <button
              onClick={() => setType('berpraktik')}
              className={`flex-1 py-2 text-sm rounded-lg font-medium border transition-colors ${
                type === 'berpraktik'
                  ? 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Berpraktik
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4 -mt-3">
          ℹ️ Akan otomatis dibuat: 3 TMK (minggu 3, 5, 7), 8 diskusi, dan 8 presensi.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nama.trim() || loading}
            className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

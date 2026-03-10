import { useState } from 'react'
import { BookIcon, AlertIcon, ClockIcon, CalendarIcon } from '../components/ui/Icons'
import useStore from '../store/useStore'
import ManageMatkulModal from '../components/ManageMatkulModal'

function MiniBar({ done, total, color }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const trackColors = { amber: 'bg-amber-100 dark:bg-amber-950', green: 'bg-green-100 dark:bg-green-950', blue: 'bg-blue-100 dark:bg-blue-950' }
  const fillColors  = { amber: 'bg-amber-400 dark:bg-amber-500', green: 'bg-green-400 dark:bg-green-500', blue: 'bg-blue-400 dark:bg-blue-500' }
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-1.5 ${trackColors[color]} rounded-full overflow-hidden`}>
        <div className={`h-full ${fillColors[color]} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{done}/{total}</span>
    </div>
  )
}

export default function Dashboard() {
  const { activeSemester, matkulList, selectMatkul, semesters } = useStore()
  const [showManage, setShowManage] = useState(false)

  if (semesters.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-10 py-16">
      {/* Ilustrasi */}
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mb-6 shadow-sm">
        <BookIcon size={36} className="text-indigo-400 dark:text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Selamat datang di UT-Tracker!</h2>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm leading-relaxed mb-10">
        Tracker offline untuk memantau progres tugas, diskusi, dan presensi mata kuliah Universitas Terbuka kamu.
      </p>

      {/* Step guide */}
      <div className="flex flex-col gap-3 w-full max-w-xs text-left">
        {[
          { step: '1', label: 'Klik "+ Tambah"', desc: 'di bagian Semester pada sidebar kiri' },
          { step: '2', label: 'Isi nama & tahun semester', desc: 'lalu klik Simpan' },
          { step: '3', label: 'Tambahkan mata kuliah', desc: 'dan mulai tracking aktivitasmu' },
        ].map(({ step, label, desc }) => (
          <div key={step} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">{step}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow hint */}
      <div className="mt-8 flex items-center gap-2 text-indigo-400 dark:text-indigo-500 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        <span className="text-sm font-medium">Mulai dari sini</span>
      </div>
    </div>
  )

  if (!activeSemester) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pilih semester di sidebar untuk mulai</p>
    </div>
  )

  const totalItems = matkulList.length * (3 + 8 + 8)
  const totalDone  = matkulList.reduce((acc, mk) => acc + mk.progress.tugas.done + mk.progress.diskusi.done + mk.progress.presensi.done, 0)
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0
  const totalTugasDone   = matkulList.reduce((a, mk) => a + mk.progress.tugas.done, 0)
  const totalDiskusiDone = matkulList.reduce((a, mk) => a + mk.progress.diskusi.done, 0)
  const totalPresensiDone= matkulList.reduce((a, mk) => a + mk.progress.presensi.done, 0)
  const totalMatkul = matkulList.length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {activeSemester.nama} {activeSemester.tahun}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{totalMatkul} mata kuliah</p>
          </div>
          <button
            onClick={() => setShowManage(true)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-1"
          >
            ⚙ Kelola Matkul
          </button>
        </div>

        {totalMatkul > 0 && (
          <>
            <div className="mt-4 flex items-center gap-3 max-w-sm">
              <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
              </div>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 w-12">{overallPct}%</span>
            </div>
            <div className="flex gap-5 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-amber-500">{totalTugasDone}/{totalMatkul * 3}</p>
                <p className="text-xs text-gray-400">Tugas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">{totalDiskusiDone}/{totalMatkul * 8}</p>
                <p className="text-xs text-gray-400">Diskusi</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-500">{totalPresensiDone}/{totalMatkul * 8}</p>
                <p className="text-xs text-gray-400">Presensi</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Empty state */}
      {matkulList.length === 0 && (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-400 text-sm mb-3">Belum ada mata kuliah.</p>
          <button
            onClick={() => setShowManage(true)}
            className="text-sm px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
          >
            + Tambah Mata Kuliah
          </button>
        </div>
      )}

      {/* Matkul Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {matkulList.map(mk => {
          const isBerpraktik = mk.type === 'berpraktik'
          const totalMk = isBerpraktik ? (3 + 8) : (3 + 8 + 8)
          const doneMk  = mk.progress.tugas.done + mk.progress.diskusi.done + mk.progress.presensi.done
          const pct     = Math.round((doneMk / totalMk) * 100)
          const isComplete  = pct === 100
          const isNotStarted = mk.started === false

          // Deadline logic
          const today = new Date().toISOString().split('T')[0]
          const currentWeek   = mk.current_week || 1
          const activeDeadline = (mk.week_deadlines || {})[String(currentWeek)]
          const isOverdue  = !isComplete && activeDeadline && activeDeadline < today
          const daysLeft   = activeDeadline && !isOverdue
            ? Math.round((new Date(activeDeadline) - new Date(today)) / 86400000)
            : null
          const isDueSoon  = daysLeft !== null && daysLeft <= 2

          // Pending counts for current + past weeks
          const totalSoFar = isBerpraktik
            ? mk.progress.presensi.done + mk.progress.tugas.done
            : mk.progress.presensi.done + mk.progress.diskusi.done + mk.progress.tugas.done
          const expectedByNow = isNotStarted ? 0
            : isBerpraktik
              ? currentWeek + [3,5,7].filter(w => w <= currentWeek).length
              : currentWeek * 2 + [3,5,7].filter(w => w <= currentWeek).length
          const pendingNow = Math.max(0, expectedByNow - totalSoFar)

          // Border accent color via inline style
          const accentColor = isComplete
            ? '#4ade80'
            : isNotStarted
              ? '#d1d5db'
              : isOverdue
                ? '#f87171'
                : isDueSoon
                  ? '#fbbf24'
                  : pendingNow > 0
                    ? '#94a3b8'
                    : '#818cf8'
          const borderClass = 'border-gray-200 dark:border-gray-800'

          // Footer strip content
          const footerStrip = isNotStarted
            ? { icon: null, text: 'Belum dimulai', style: 'text-gray-400' }
            : isComplete
              ? null
              : isOverdue
                ? { icon: 'alert', text: `Deadline minggu ${currentWeek} terlewat`, style: 'text-red-500 dark:text-red-400' }
                : isDueSoon
                  ? { icon: 'clock', text: daysLeft === 0 ? `Deadline hari ini${pendingNow > 0 ? ` · ${pendingNow} aktivitas tersisa` : ''}` : `${daysLeft} hari lagi${pendingNow > 0 ? ` · ${pendingNow} aktivitas tersisa` : ''}`, style: 'text-amber-600 dark:text-amber-400' }
                  : pendingNow > 0
                    ? { icon: 'calendar', text: `${pendingNow} aktivitas belum selesai`, style: 'text-gray-400 dark:text-gray-500' }
                    : null

          return (
            <button
              key={mk.id}
              onClick={() => selectMatkul(mk)}
              className={`text-left rounded-xl border transition-all hover:shadow-md active:scale-[0.99] overflow-hidden bg-white dark:bg-gray-900 ${borderClass}`}
              style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}
            >
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug truncate">{mk.nama}</h3>
                    {mk.kode && <p className="text-xs text-gray-400 mt-0.5">{mk.kode}</p>}
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    mk.type === 'berpraktik'
                      ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  }`}>{mk.type}</span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className={`font-semibold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">Tugas</span>
                    <div className="flex-1"><MiniBar done={mk.progress.tugas.done} total={3} color="amber" /></div>
                  </div>
                  {!isBerpraktik && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">Diskusi</span>
                      <div className="flex-1"><MiniBar done={mk.progress.diskusi.done} total={8} color="green" /></div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">Presensi</span>
                    <div className="flex-1"><MiniBar done={mk.progress.presensi.done} total={8} color="blue" /></div>
                  </div>
                </div>
              </div>

              {/* Footer strip */}
              {footerStrip && (
                <div className={`px-5 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 ${footerStrip.style}`}>
                  {footerStrip.icon === 'alert'    && <AlertIcon size={11} />}
                  {footerStrip.icon === 'clock'    && <ClockIcon size={11} />}
                  {footerStrip.icon === 'calendar' && <CalendarIcon size={11} />}
                  <span className="text-[11px] font-medium">{footerStrip.text}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {showManage && <ManageMatkulModal onClose={() => setShowManage(false)} />}
    </div>
  )
}

import { useState } from 'react'
import { LockIcon, AlertIcon, ClockIcon, CalendarIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon, RocketIcon, PartyIcon, FingerIcon } from '../components/ui/Icons'
import useStore from '../store/useStore'

const fmtDate = (iso) => iso ? iso.split('-').reverse().join('/') : ''

function EditModal({ item, type, onSave, onClose }) {
  const [status, setStatus] = useState(item.status === 1)
  const today = new Date().toISOString().split('T')[0]
  const [tanggal, setTanggal] = useState(item.tanggal_submit || today)
  const [catatan, setCatatan] = useState(item.catatan || '')
  const title = type === 'tugas' ? `TMK ${item.nomor}` : type === 'diskusi' ? `Diskusi Minggu ${item.minggu}` : `Presensi Minggu ${item.minggu}`
  const tanggalMissing = !tanggal
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">{title}</h3>
        <button onClick={() => setStatus(!status)} className={`w-full py-2.5 rounded-xl text-sm font-medium mb-4 border transition-colors ${status ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
          {status ? '✓ Sudah dikerjakan' : '— Belum dikerjakan'}
        </button>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Tanggal Submit <span className="text-red-400">*</span>
            </label>
            <button
              onClick={() => setTanggal(today)}
              className={`text-xs px-2 py-0.5 rounded-md font-medium transition-colors ${
                tanggal === today
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Hari ini
            </button>
          </div>
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            required
            className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              tanggalMissing
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          />
          {tanggalMissing && (
            <p className="text-xs text-red-500 mt-1">Tanggal submit wajib diisi</p>
          )}
        </div>
        <div className="mb-6">
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1.5">Catatan</label>
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} placeholder="Tambahkan catatan singkat..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
          <button
            onClick={() => { if (tanggalMissing) return; onSave({ id: item.id, status: status ? 1 : 0, tanggal_submit: tanggal, catatan }); onClose() }}
            disabled={tanggalMissing}
            className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

function DeadlineModal({ nextWeek, startLabel, onConfirm, onClose }) {
  const [mode, setMode] = useState('1week')
  const defaultDate = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })()
  const [customDate, setCustomDate] = useState(defaultDate)
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{startLabel || `Pindah ke Minggu ${nextWeek}`}</h3>
        <p className="text-xs text-gray-400 mb-5">Set deadline untuk minggu ini agar kamu bisa track waktunya.</p>
        <div className="space-y-2 mb-6">
          <button onClick={() => setMode('1week')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left focus:outline-none ${mode === '1week' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${mode === '1week' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {mode === '1week' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">1 minggu dari sekarang</p>
              <p className="text-xs text-gray-400">{fmtDate(defaultDate)}</p>
            </div>
          </button>
          <button onClick={() => setMode('custom')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left focus:outline-none ${mode === 'custom' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${mode === 'custom' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {mode === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pilih tanggal sendiri</p>
          </button>
          {mode === 'custom' && (
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
          <button onClick={() => onConfirm(mode === '1week' ? defaultDate : customDate)} className="flex-1 py-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium">Lanjut</button>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item, type, locked, onEdit }) {
  const done = item.status === 1
  const label = type === 'diskusi' ? 'Diskusi' : 'Presensi'
  const colors = {
    diskusi:  { done: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    presensi: { done: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',     badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' }
  }
  if (locked) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 opacity-40 select-none">
        <div className="flex items-center gap-3">
          <LockIcon size={14} className="text-gray-400" />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className="text-xs text-gray-400">Selesaikan presensi dulu</span>
      </div>
    )
  }
  return (
    <button onClick={() => onEdit(item, type)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-sm active:scale-[0.99] text-left ${done ? colors[type].done : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${done ? (type === 'diskusi' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white') : 'border-2 border-gray-300 dark:border-gray-600'}`}>{done && '✓'}</div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {done && item.tanggal_submit && <span className="text-xs text-gray-400 flex items-center gap-1"><CalendarIcon size={11} />{fmtDate(item.tanggal_submit)}</span>}
        {done ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type].badge}`}>Selesai</span> : <span className="text-xs text-gray-400">Belum</span>}
      </div>
    </button>
  )
}

function TugasRow({ tugas, locked, onEdit }) {
  const done = tugas.status === 1
  if (locked) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-amber-200 dark:border-amber-900 opacity-40 select-none">
        <div className="flex items-center gap-3">
          <LockIcon size={14} className="text-amber-400" />
          <span className="text-sm text-amber-600 dark:text-amber-400">TMK {tugas.nomor}</span>
        </div>
        <span className="text-xs text-amber-500">Selesaikan presensi dulu</span>
      </div>
    )
  }
  return (
    <button onClick={() => onEdit(tugas, 'tugas')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-sm active:scale-[0.99] text-left ${done ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-900 hover:border-amber-300'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${done ? 'bg-amber-500 text-white' : 'border-2 border-amber-400 dark:border-amber-600'}`}>{done && '✓'}</div>
        <span className="text-sm font-medium text-amber-700 dark:text-amber-400">TMK {tugas.nomor}</span>
      </div>
      {done ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">Selesai</span> : <span className="text-xs text-amber-500">Belum</span>}
    </button>
  )
}

function PastWeekRow({ week, presensi, diskusi, tugas, onEdit, isBerpraktik }) {
  const [open, setOpen] = useState(false)
  const allDone = presensi?.status === 1 && (isBerpraktik || diskusi?.status === 1) && (!tugas || tugas.status === 1)
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-16">Minggu {week}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${presensi?.status === 1 ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
{!isBerpraktik && <span className={`w-2 h-2 rounded-full ${diskusi?.status === 1  ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />}
            {tugas && <span className={`w-2 h-2 rounded-full ${tugas.status === 1 ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'}`} />}
          </div>
          {allDone && <span className="text-xs text-green-500 font-medium flex items-center gap-1"><CheckIcon size={11} />Lengkap</span>}
        </div>
        <span className="text-gray-400">{open ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />}</span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 bg-white dark:bg-gray-900/30">
          {presensi && <ActivityRow item={presensi} type="presensi" locked={false} onEdit={onEdit} />}
          {!isBerpraktik && diskusi  && <ActivityRow item={diskusi}  type="diskusi"  locked={false} onEdit={onEdit} />}
          {tugas    && <TugasRow    tugas={tugas}   locked={false}  onEdit={onEdit} />}
        </div>
      )}
    </div>
  )
}

export default function MatkulDetail() {
  const { matkulDetail, refreshMatkulDetail } = useStore()
  const [editItem, setEditItem]         = useState(null)
  const [editType, setEditType]         = useState(null)
  const [showDeadline, setShowDeadline] = useState(false)
  const [showStart, setShowStart]       = useState(false)

  if (!matkulDetail) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    )
  }

  const { tugas, diskusi, presensi } = matkulDetail
  const isBerpraktik   = matkulDetail.type === 'berpraktik'
  const started        = matkulDetail.started ?? true
  const currentWeek    = matkulDetail.current_week || 1
  const weekDeadlines  = matkulDetail.week_deadlines || {}
  const activeDeadline = weekDeadlines[String(currentWeek)]

  const activePresensi = presensi.find(p => p.minggu === currentWeek)
  const activeDiskusi  = diskusi.find(d => d.minggu === currentWeek)
  const activeTugas    = tugas.find(t => t.minggu_due === currentWeek)
  const presensiDone   = activePresensi?.status === 1
  const weekComplete   = isBerpraktik
    ? presensiDone && (!activeTugas || activeTugas.status === 1)
    : presensiDone && activeDiskusi?.status === 1 && (!activeTugas || activeTugas.status === 1)
  const isLastWeek     = currentWeek >= 8

  const today     = new Date().toISOString().split('T')[0]
  const isOverdue = activeDeadline && activeDeadline < today && !weekComplete
  const isDueSoon = activeDeadline && activeDeadline >= today && !weekComplete && (new Date(activeDeadline) - new Date(today)) / 86400000 <= 2

  const totalDone  = tugas.filter(t => t.status === 1).length + (isBerpraktik ? 0 : diskusi.filter(d => d.status === 1).length) + presensi.filter(p => p.status === 1).length
  const overallPct = Math.round((totalDone / (isBerpraktik ? (3 + 8) : (3 + 8 + 8))) * 100)
  const pastWeeks  = Array.from({ length: currentWeek - 1 }, (_, i) => i + 1)

  const openEdit = (item, type) => { setEditItem(item); setEditType(type) }

  const handleSave = async (data) => {
    if (editType === 'tugas')    await window.api.tugas.update(data)
    if (editType === 'diskusi')  await window.api.diskusi.update(data)
    if (editType === 'presensi') await window.api.presensi.update(data)
    await refreshMatkulDetail()
  }

  const handleStartWeek1 = async (deadline) => {
    await window.api.matkul.setCurrentWeek(matkulDetail.id, 1, deadline)
    await refreshMatkulDetail()
    setShowStart(false)
  }

  const handleAdvanceWeek = async (deadline) => {
    await window.api.matkul.setCurrentWeek(matkulDetail.id, currentWeek + 1, deadline)
    await refreshMatkulDetail()
    setShowDeadline(false)
  }

  return (
    <div className="p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{matkulDetail.nama}</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${matkulDetail.type === 'berpraktik' ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'}`}>{matkulDetail.type}</span>
        </div>
        {matkulDetail.kode && <p className="text-sm text-gray-400 mb-3">{matkulDetail.kode}</p>}
        <div className="flex items-center gap-3 mt-3 max-w-sm">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 w-12">{overallPct}%</span>
        </div>
        <div className="flex gap-5 mt-3">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{tugas.filter(t => t.status === 1).length}/3 Tugas</span>
          {!isBerpraktik && <span className="text-xs font-medium text-green-600 dark:text-green-400">{diskusi.filter(d => d.status === 1).length}/8 Diskusi</span>}
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{presensi.filter(p => p.status === 1).length}/8 Presensi</span>
        </div>
      </div>

      {/* Not started screen */}
      {started === false && (
        <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 p-8 text-center">
          <RocketIcon size={40} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Belum dimulai</p>
          <p className="text-xs text-gray-400 mb-5">Mulai minggu pertama dan set deadline agar aktivitas bisa di-track.</p>
          <button onClick={() => setShowStart(true)} className="text-sm px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors">Mulai Minggu 1</button>
        </div>
      )}

      {/* Started screen */}
      {started !== false && (
        <div>
          {/* Active Week */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Minggu Aktif</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">{currentWeek}</span>
              </div>
              {weekComplete && !isLastWeek && (
                <button onClick={() => setShowDeadline(true)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors">Minggu berikutnya</button>
              )}
              {weekComplete && isLastWeek && (
                <span className="text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 font-medium flex items-center gap-1"><PartyIcon size={13} />Semester selesai!</span>
              )}
            </div>

            {activeDeadline && !weekComplete && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-3 text-xs font-medium ${isOverdue ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : isDueSoon ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                {isOverdue ? <AlertIcon size={14} /> : isDueSoon ? <ClockIcon size={14} /> : <CalendarIcon size={14} />}
                <span>{isOverdue ? 'Deadline terlewat — ' : isDueSoon ? 'Deadline mendekat — ' : 'Deadline minggu ini — '}{fmtDate(activeDeadline)}</span>
              </div>
            )}

            <div className={`rounded-2xl border-2 p-5 space-y-3 transition-colors ${weekComplete ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20' : isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-950/10' : 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20'}`}>
              {activePresensi && (
                <div>
                  {!presensiDone && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                      <FingerIcon size={13} /> Selesaikan presensi terlebih dahulu
                    </p>
                  )}
                  <ActivityRow item={activePresensi} type="presensi" locked={false} onEdit={openEdit} />
                </div>
              )}
              {!isBerpraktik && activeDiskusi && <ActivityRow item={activeDiskusi} type="diskusi" locked={!presensiDone} onEdit={openEdit} />}
              {activeTugas   && <TugasRow tugas={activeTugas} locked={!presensiDone} onEdit={openEdit} />}
              {weekComplete && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center pt-1">
                  ✓ Semua aktivitas minggu ini selesai!{!isLastWeek && ' Klik "Minggu berikutnya" untuk lanjut.'}
                </p>
              )}
            </div>
          </div>

          {/* Past Weeks */}
          {pastWeeks.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Minggu Sebelumnya</span>
              <div className="mt-3 space-y-2">
                {[...pastWeeks].reverse().map(week => (
                  <PastWeekRow key={week} week={week}
                    presensi={presensi.find(p => p.minggu === week)}
                    diskusi={diskusi.find(d => d.minggu === week)}
                    tugas={tugas.find(t => t.minggu_due === week)}
                    onEdit={openEdit}
                    isBerpraktik={isBerpraktik}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {editItem && (
        <EditModal item={editItem} type={editType} onSave={handleSave} onClose={() => { setEditItem(null); setEditType(null) }} />
      )}
      {showStart && (
        <DeadlineModal nextWeek={1} startLabel="Mulai Minggu 1" onConfirm={handleStartWeek1} onClose={() => setShowStart(false)} />
      )}
      {showDeadline && (
        <DeadlineModal nextWeek={currentWeek + 1} onConfirm={handleAdvanceWeek} onClose={() => setShowDeadline(false)} />
      )}

    </div>
  )
}

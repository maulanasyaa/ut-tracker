import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ---- Theme ----
  darkMode: false,
  theme: 'classic',
  toggleDarkMode: async () => {
    const next = !get().darkMode
    set({ darkMode: next })
    await window.api.settings.set('darkMode', String(next))
  },
  setTheme: async (theme) => {
    set({ theme })
    await window.api.settings.set('theme', theme)
  },

  // ---- Semesters ----
  semesters: [],
  activeSemester: null,

  loadSemesters: async () => {
    const semesters = await window.api.semester.getAll()
    const active = semesters.find(s => s.is_active === 1) || null
    set({ semesters, activeSemester: active })
    if (active) await get().loadMatkul(active.id)
    else set({ matkulList: [], selectedMatkul: null, matkulDetail: null })
  },

  createSemester: async (data) => {
    const { id } = await window.api.semester.create(data)
    // Auto-activate the first semester created
    const { semesters } = get()
    if (semesters.length === 0) await window.api.semester.setActive(id)
    await get().loadSemesters()
  },

  setActiveSemester: async (id) => {
    await window.api.semester.setActive(id)
    set({ selectedMatkul: null, matkulDetail: null })
    await get().loadSemesters()
  },

  deleteSemester: async (id) => {
    await window.api.semester.delete(id)
    await get().loadSemesters()
  },

  // ---- Mata Kuliah ----
  matkulList: [],
  selectedMatkul: null,
  matkulDetail: null,

  loadMatkul: async (semester_id) => {
    const list = await window.api.matkul.getBySemester(semester_id)
    set({ matkulList: list })
  },

  selectMatkul: async (matkul) => {
    if (!matkul) {
      set({ selectedMatkul: null, matkulDetail: null })
      return
    }
    set({ selectedMatkul: matkul })
    const detail = await window.api.matkul.getDetail(matkul.id)
    set({ matkulDetail: detail })
  },

  createMatkul: async (data) => {
    await window.api.matkul.create(data)
    const { activeSemester } = get()
    if (activeSemester) await get().loadMatkul(activeSemester.id)
  },

  deleteMatkul: async (id) => {
    await window.api.matkul.delete(id)
    const { activeSemester, selectedMatkul } = get()
    if (selectedMatkul?.id === id) set({ selectedMatkul: null, matkulDetail: null })
    if (activeSemester) await get().loadMatkul(activeSemester.id)
  },

  // Refresh detail page after an item is updated
  refreshMatkulDetail: async () => {
    const { selectedMatkul, activeSemester } = get()
    if (selectedMatkul) {
      const detail = await window.api.matkul.getDetail(selectedMatkul.id)
      set({ matkulDetail: detail })
    }
    if (activeSemester) await get().loadMatkul(activeSemester.id)
  },

  // ---- Init ----
  init: async () => {
    const darkMode = await window.api.settings.get('darkMode')
    const theme    = await window.api.settings.get('theme')
    set({ darkMode: darkMode === 'true', theme: theme || 'classic' })
    await get().loadSemesters()
  }
}))

export default useStore

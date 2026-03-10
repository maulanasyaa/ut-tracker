const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  semester: {
    getAll: () => ipcRenderer.invoke('semester:getAll'),
    create: (data) => ipcRenderer.invoke('semester:create', data),
    setActive: (id) => ipcRenderer.invoke('semester:setActive', { id }),
    delete: (id) => ipcRenderer.invoke('semester:delete', { id }),
    update: (data) => ipcRenderer.invoke('semester:update', data)
  },
  matkul: {
    getBySemester: (semester_id) => ipcRenderer.invoke('matkul:getBySemester', { semester_id }),
    create: (data) => ipcRenderer.invoke('matkul:create', data),
    delete: (id) => ipcRenderer.invoke('matkul:delete', { id }),
    getDetail: (id) => ipcRenderer.invoke('matkul:getDetail', { id }),
    setCurrentWeek: (id, week, deadline) => ipcRenderer.invoke('matkul:setCurrentWeek', { id, week, deadline })
  },
  tugas:   { update: (data) => ipcRenderer.invoke('tugas:update', data) },
  diskusi: { update: (data) => ipcRenderer.invoke('diskusi:update', data) },
  presensi:{ update: (data) => ipcRenderer.invoke('presensi:update', data) },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', { key }),
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value })
  },
  data: {
    export:        ()           => ipcRenderer.invoke('data:export'),
    importOpen:    ()           => ipcRenderer.invoke('data:import-open'),
    importExecute: (mode, importData) => ipcRenderer.invoke('data:import-execute', { mode, importData })
  },
  backup: {
    chooseFolder:    ()     => ipcRenderer.invoke('backup:choose-folder'),
    openFolder:      ()     => ipcRenderer.invoke('backup:open-folder'),
    now:             ()     => ipcRenderer.invoke('backup:now'),
    settingsChanged: ()     => ipcRenderer.send('backup:settings-changed'),
    onTriggered:     (cb)   => {
      ipcRenderer.on('backup:triggered', cb)
      return () => ipcRenderer.removeListener('backup:triggered', cb)
    }
  }
})

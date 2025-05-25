const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    saveToFile: (text, folderPath) =>
        ipcRenderer.invoke('save-to-file', { text, folderPath }),
    organizeFiles: (folderPath) =>
        ipcRenderer.invoke('organize-files', folderPath),
    cleanFolder: (folderPath) => ipcRenderer.invoke('clean-folder', folderPath),
})

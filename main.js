const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs-extra')

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    mainWindow.loadFile('index.html')

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

// IPC обработчики
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    })
    return result.filePaths[0]
})

ipcMain.handle('save-to-file', async (event, { text, folderPath }) => {
    try {
        const desktopPath = path.join(require('os').homedir(), 'Desktop')
        const targetFolder =
            folderPath || path.join(desktopPath, 'TextProcessorFiles')

        await fs.ensureDir(targetFolder)

        const filePath = path.join(targetFolder, 'processed_text.txt')
        await fs.writeFile(filePath, text)

        return { success: true, filePath }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('organize-files', async (event, folderPath) => {
    try {
        const files = await fs.readdir(folderPath)

        for (const file of files) {
            const filePath = path.join(folderPath, file)
            const stats = await fs.stat(filePath)

            if (stats.isFile()) {
                const ext = path.extname(file).substring(1).toLowerCase()
                if (ext) {
                    const targetDir = path.join(folderPath, ext)
                    await fs.ensureDir(targetDir)
                    await fs.move(filePath, path.join(targetDir, file), {
                        overwrite: true,
                    })
                }
            }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

ipcMain.handle('clean-folder', async (event, folderPath) => {
    try {
        const files = await fs.readdir(folderPath)

        for (const file of files) {
            const filePath = path.join(folderPath, file)
            try {
                const stats = await fs.stat(filePath)
                if (stats.isDirectory()) {
                    await fs.remove(filePath)
                } else {
                    await fs.unlink(filePath)
                }
            } catch (err) {
                console.error(`Error deleting ${filePath}:`, err.message)
                continue
            }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
})

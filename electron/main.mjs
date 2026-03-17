import { app, BrowserWindow, dialog, shell } from 'electron'
import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const isWindows = process.platform === 'win32'
const rootDir = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
let backendProcess = null
let backendPort = null
let shuttingDown = false

function primaryOrigin(port) {
  return `http://127.0.0.1:${port}`
}

function allowedOrigins(port) {
  return [primaryOrigin(port), `http://localhost:${port}`]
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForHTTP(url, timeoutMs, init) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, init)
      if (response.ok) {
        return
      }
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await wait(250)
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`)
}

async function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('failed to allocate a desktop port')))
        return
      }
      const { port } = address
      server.close(error => {
        if (error) {
          reject(error)
          return
        }
        resolve(port)
      })
    })
  })
}

function backendBinaryPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', isWindows ? 'linclawd.exe' : 'linclawd')
  }
  return 'go'
}

function backendArgs(port) {
  if (app.isPackaged) {
    return [
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--web-root',
      path.join(process.resourcesPath, 'web'),
      '--package-root',
      path.join(process.resourcesPath, 'meta'),
      '--managed-root',
      path.join(app.getPath('userData'), 'managed'),
    ]
  }

  return [
    'run',
    './src-go/cmd/linclawd',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--web-root',
    'dist',
    '--package-root',
    rootDir,
    '--managed-root',
    path.join(rootDir, '.linclaw', 'electron-local'),
  ]
}

async function ensureBackendBinaryExists() {
  if (!app.isPackaged) {
    return
  }
  await access(backendBinaryPath())
}

async function startBackend() {
  if (backendProcess) {
    return backendPort
  }

  backendPort = await getAvailablePort()
  await ensureBackendBinaryExists()

  const env = {
    ...process.env,
    LINCLAW_APP_VERSION: app.getVersion(),
    LINCLAW_PANEL_ORIGIN: primaryOrigin(backendPort),
    LINCLAW_ALLOWED_ORIGINS: allowedOrigins(backendPort).join(','),
    ...(app.isPackaged ? { LINCLAW_ELECTRON_PACKAGED: '1' } : {}),
  }

  backendProcess = spawn(backendBinaryPath(), backendArgs(backendPort), {
    cwd: app.isPackaged ? app.getPath('userData') : rootDir,
    env,
    stdio: 'inherit',
  })

  backendProcess.once('exit', (code, signal) => {
    if (shuttingDown) {
      return
    }
    backendProcess = null
    const detail = signal ? `signal=${signal}` : `code=${code ?? 0}`
    dialog.showErrorBox('LinClaw 后端已退出', `桌面端内置 Go 后端提前退出：${detail}`)
    app.quit()
  })

  const healthTimeout = app.isPackaged ? 300000 : 20000
  await waitForHTTP(`${primaryOrigin(backendPort)}/__api/health`, healthTimeout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })

  return backendPort
}

async function stopBackend() {
  if (!backendProcess) {
    return
  }

  const child = backendProcess
  backendProcess = null
  shuttingDown = true

  child.kill('SIGTERM')
  await new Promise(resolve => {
    const timer = setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGKILL')
      }
      resolve()
    }, 4000)

    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

function createWindow(targetURL) {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    title: 'LinClaw',
    backgroundColor: '#0f1115',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  void win.loadURL(targetURL)
}

async function appURL() {
  const devURL = process.env.LINCLAW_ELECTRON_DEV_SERVER_URL
  if (devURL) {
    await waitForHTTP(devURL, 20000)
    return devURL
  }

  const port = await startBackend()
  return primaryOrigin(port)
}

async function openMainWindow() {
  const targetURL = await appURL()
  createWindow(targetURL)
}

const hasLock = app.requestSingleInstanceLock()
if (!hasLock) {
  app.quit()
}

app.whenReady().then(async () => {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void openMainWindow()
    }
  })

  await openMainWindow()
}).catch(error => {
  dialog.showErrorBox('LinClaw 启动失败', String(error))
  app.quit()
})

app.on('second-instance', () => {
  const [existingWindow] = BrowserWindow.getAllWindows()
  if (!existingWindow) {
    return
  }
  if (existingWindow.isMinimized()) {
    existingWindow.restore()
  }
  existingWindow.focus()
})

app.on('before-quit', () => {
  shuttingDown = true
})

app.on('window-all-closed', async () => {
  await stopBackend()
  app.quit()
})

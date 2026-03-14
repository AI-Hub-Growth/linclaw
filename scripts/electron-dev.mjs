import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
const isWindows = process.platform === 'win32'
const tmpRoot = process.env.TMPDIR || '/tmp'
const smokeTestOnly = process.env.LINCLAW_ELECTRON_DEV_SMOKE_TEST === '1'
const goEnv = {
  GOCACHE: process.env.LINCLAW_GOCACHE || path.join(tmpRoot, 'linclaw-go-cache'),
  GOTMPDIR: process.env.LINCLAW_GOTMPDIR || path.join(tmpRoot, 'linclaw-go-tmp'),
}

function binPath(relativePath) {
  return path.join(rootDir, relativePath)
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

async function isHTTPReady(url, init) {
  try {
    const response = await fetch(url, init)
    return response.ok
  } catch {
    return false
  }
}

function spawnChild(command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  })
  child.once('error', error => {
    console.error(`[electron:dev] failed to start ${command}:`, error)
    process.exit(1)
  })
  return child
}

const goArgs = ['run', './src-go/cmd/linclawd', '--host', '127.0.0.1', '--port', '43187', '--web-root', 'dist']
const viteCommand = process.platform === 'win32' ? 'node.exe' : 'node'
const electronCommand = process.env.LINCLAW_ELECTRON_BINARY || (isWindows
  ? binPath('node_modules/electron/dist/electron.exe')
  : binPath('node_modules/.bin/electron'))

const children = []

const goReady = await isHTTPReady('http://127.0.0.1:43187/__api/health', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
})
let goServer = null
if (goReady) {
  console.log('[electron:dev] reuse existing Go backend at http://127.0.0.1:43187')
} else {
  goServer = spawnChild('go', goArgs, goEnv)
  children.push(goServer)
}

const viteReady = await isHTTPReady('http://127.0.0.1:1420')
let viteServer = null
if (viteReady) {
  console.log('[electron:dev] reuse existing Vite dev server at http://127.0.0.1:1420')
} else {
  viteServer = spawnChild(viteCommand, [binPath('scripts/run-vite.js')])
  children.push(viteServer)
}

let cleanedUp = false
function cleanup(exitCode = 0) {
  if (cleanedUp) {
    return
  }
  cleanedUp = true
  for (const child of children) {
    if (child && !child.killed) {
      child.kill('SIGTERM')
    }
  }
  setTimeout(() => {
    for (const child of children) {
      if (child && !child.killed) {
        child.kill('SIGKILL')
      }
    }
  }, 2000)
  process.exit(exitCode)
}

process.on('SIGINT', () => cleanup(130))
process.on('SIGTERM', () => cleanup(143))

if (goServer) {
  goServer.once('exit', code => {
    if (!cleanedUp) {
      console.error(`[electron:dev] Go backend exited early with code ${code ?? 0}`)
      cleanup(code ?? 1)
    }
  })
}

if (viteServer) {
  viteServer.once('exit', code => {
    if (!cleanedUp) {
      console.error(`[electron:dev] Vite dev server exited early with code ${code ?? 0}`)
      cleanup(code ?? 1)
    }
  })
}

await waitForHTTP('http://127.0.0.1:43187/__api/health', 20000, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
})
await waitForHTTP('http://127.0.0.1:1420', 20000)

if (smokeTestOnly) {
  console.log('[electron:dev] Go backend and Vite dev server are ready')
  cleanup(0)
}

const electronApp = spawnChild(electronCommand, ['.'], {
  LINCLAW_ELECTRON_DEV_SERVER_URL: 'http://127.0.0.1:1420',
})
children.push(electronApp)

electronApp.once('exit', code => {
  cleanup(code ?? 0)
})

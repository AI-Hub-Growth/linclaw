import { cp, mkdir, rm } from 'node:fs/promises'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
const buildRoot = path.join(rootDir, 'electron-build')
const webRoot = path.join(buildRoot, 'web')
const binRoot = path.join(buildRoot, 'bin')
const metaRoot = path.join(buildRoot, 'meta')
const binName = process.platform === 'win32' ? 'linclawd.exe' : 'linclawd'
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const tmpRoot = process.env.TMPDIR || '/tmp'
const goEnv = {
  GOCACHE: process.env.LINCLAW_GOCACHE || path.join(tmpRoot, 'linclaw-go-cache'),
  GOTMPDIR: process.env.LINCLAW_GOTMPDIR || path.join(tmpRoot, 'linclaw-go-tmp'),
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, ...options.env },
    })
    child.once('exit', code => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} exited with code ${code ?? 1}`))
    })
    child.once('error', reject)
  })
}

async function copyIfExists(source, destination) {
  try {
    await fs.access(source)
  } catch {
    return
  }
  await cp(source, destination, { recursive: false })
}

await rm(buildRoot, { recursive: true, force: true })
await mkdir(webRoot, { recursive: true })
await mkdir(binRoot, { recursive: true })
await mkdir(metaRoot, { recursive: true })
await mkdir(goEnv.GOCACHE, { recursive: true })
await mkdir(goEnv.GOTMPDIR, { recursive: true })

await run(npmCommand, ['run', 'build'])
await run('go', ['build', '-trimpath', '-ldflags=-s -w', '-o', path.join(binRoot, binName), './src-go/cmd/linclawd'], { env: goEnv })

await cp(path.join(rootDir, 'dist'), webRoot, { recursive: true })
await cp(path.join(rootDir, 'package.json'), path.join(metaRoot, 'package.json'))
await copyIfExists(path.join(rootDir, 'LICENSE'), path.join(metaRoot, 'LICENSE'))

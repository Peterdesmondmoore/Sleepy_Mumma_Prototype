import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const contentSecurityPolicy = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'; frame-ancestors https://missionsurface.com http://localhost:* http://127.0.0.1:*"
const bridgeVersion = 2

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Sleepy_Mumma_Prototype/demo/' : './',
  plugins: [react(), {
    name: 'mission-surface-deployment-descriptor',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'mission-surface-deployment.json', source: JSON.stringify({
        schemaVersion: 1,
        protocol: 'mission-surface-prototype',
        version: bridgeVersion,
        buildRevision: process.env.GITHUB_SHA ?? '0000000000000000000000000000000000000000',
        pagesOrigin: process.env.MISSION_SURFACE_PAGES_ORIGIN ?? 'https://Peterdesmondmoore.github.io/Sleepy_Mumma_Prototype',
        livePrototypeKeys: ['mobile-sample', 'mumma-current'],
        contentSecurityPolicy,
      }, null, 2) })
    },
  }],
})

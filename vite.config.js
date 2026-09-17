import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/eceaede'

// Dev middleware plugin to handle /api/sync, /api/menu, /api/reservations during `npm run dev`
function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Strip query string before matching path
        const pathname = req.url ? req.url.split('?')[0] : ''

        if (!pathname.startsWith('/api/')) {
          return next()
        }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', '*')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          return res.end()
        }

        if (req.method === 'GET') {
          try {
            const response = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`)
            const data = await response.json()
            res.statusCode = response.ok ? 200 : response.status
            return res.end(JSON.stringify(data))
          } catch (e) {
            res.statusCode = 500
            return res.end(JSON.stringify({ success: false, error: e.message }))
          }
        }

        if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}')

              // 1. Safe Read: fetch existing bin data
              let existingData = {}
              try {
                const getRes = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`)
                if (getRes.ok) {
                  existingData = await getRes.json()
                }
              } catch (readErr) {
                console.warn('[apiDevPlugin] Error reading current bin:', readErr)
              }

              // 2. Safe Merge: overlay incoming slices onto existing data so untouched keys are never wiped
              const now = parsed.updatedAt || Date.now()
              const mergedPayload = {
                ...existingData,
                ...parsed,
                updatedAt: now
              }

              // 3. Safe Write: persist full merged state
              const putRes = await fetch(CLOUD_BIN_URL, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(req.headers['security-key'] ? { 'Security-key': req.headers['security-key'] } : {})
                },
                body: JSON.stringify(mergedPayload)
              })

              const responseData = await putRes.json().catch(() => ({}))
              res.statusCode = putRes.ok ? 200 : putRes.status
              return res.end(JSON.stringify({
                success: putRes.ok,
                updatedAt: now,
                data: mergedPayload,
                raw: responseData
              }))
            } catch (e) {
              res.statusCode = 500
              return res.end(JSON.stringify({ success: false, error: e.message }))
            }
          })
          return
        }

        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
    open: true
  }
})
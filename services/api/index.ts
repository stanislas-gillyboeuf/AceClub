import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from "@hono/node-server"
import { auth } from "./auth"
import { serverRouter } from './server/router'
import type { HonoContext } from './types/hono'

const app = new Hono<HonoContext>()

// Logging
app.use('*', logger())

// CORS configuration for iOS app and web
app.use('*', cors({
	origin: (origin) => {
		// Allow requests with no origin (mobile apps, Postman, etc.)
		if (!origin) return '*'

		// Allow localhost for development
		if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
			return origin
		}

		// Allow iOS app custom scheme
		if (origin.startsWith('apply://')) {
			return origin
		}

		// Allow local network IPs for device testing
		if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin)) {
			return origin
		}

		// Add your production domain here
		// if (origin === 'https://yourdomain.com') return origin

		return null
	},
	allowHeaders: ['Content-Type', 'Authorization'],
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	exposeHeaders: ['Content-Length', 'Authorization'],
	maxAge: 600,
	credentials: true,
}))

// Better Auth routes - handles sign up, sign in, sign out, etc.
app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw)
})

app.get('/api/session', async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })

	if (!session) {
		return c.json({ session: null, user: null }, 200)
	}

	return c.json({
		session: session.session,
		user: session.user,
	})
})

// routes
app.route('/api/user', serverRouter)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

const port = Number(process.env.PORT) || 3000
console.log(`Server running on port ${port}`)

export default serve({ fetch: app.fetch, port })
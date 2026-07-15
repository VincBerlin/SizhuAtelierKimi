import { createApp } from './index.js'
import { registerHostingerAutoReply } from './hostingerAutoReply.js'

const app = createApp()
registerHostingerAutoReply(app)

const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0', () => {
  const mailReady = Boolean(process.env.HOSTINGER_WEBHOOK_SECRET && process.env.HOSTINGER_MAIL_API_TOKEN)
  console.log(`SizhuAtelier server on :${port} — Hostinger auto-reply=${mailReady}`)
})

const express = require("express")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000
// ONDE está o backend? Esta é a variável mais importante deste projeto!
const backendUrl = process.env.BACKEND_URL || "http://localhost:5500"

app.get("/", async (req, res) => {
  try {
    // O servidor FRONTEND chama o servidor BACKEND (chamada entre serviços)
    const response = await fetch(`${backendUrl}/api/fact`)
    const data = await response.json()

    res.send(`
      <html>
        <head><meta charset="utf-8"><title>Two-Stackerino</title></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto;">
          <h1>🖥️ Frontend do Two-Stackerino</h1>
          <p>Eu sou o <b>frontend</b>. Faço páginas para humanos. Pedi uma curiosidade ao backend:</p>
          <blockquote style="font-size: 1.4em; background: #eef; padding: 16px; border-radius: 8px;">
            ${data.fact}
          </blockquote>
          <p>Respondido pelo backend número <b>${data.backend_number}</b>
             (hostname <code>${data.backend_hostname}</code>) às ${data.time}</p>
          <p><small>URL do backend usado: <code>${backendUrl}</code></small></p>
          <p><a href="/">🔄 Quero outra curiosidade</a></p>
        </body>
      </html>
    `)
  } catch (err) {
    console.error(`Não foi possível contactar o backend em ${backendUrl}:`, err.message)
    res.status(502).send(`
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto;">
          <h1>😢 O frontend está ligado, mas o backend não responde</h1>
          <p>Tentei chamar <code>${backendUrl}/api/fact</code> e falhei.</p>
          <p>Erro: <code>${err.message}</code></p>
          <p>Verifica: o backend está a correr? O <code>BACKEND_URL</code> está certo? Há uma firewall a bloquear a porta?</p>
        </body>
      </html>
    `)
  }
})

app.get("/healthcheck", (req, res) => {
  res.status(200).send("O frontend funciona!")
})

const server = app.listen(port, () => {
  console.log(`Frontend à escuta em http://localhost:${port}`)
  console.log(`O frontend vai chamar o backend em ${backendUrl}`)
})

process.on("SIGTERM", () => server.close(() => process.exit(0)))
process.on("SIGINT", () => server.close(() => process.exit(0)))

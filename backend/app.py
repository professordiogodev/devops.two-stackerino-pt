import os
import random
import socket
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)

# Variáveis de ambiente (com valores por omissão)
PORT   = int(os.getenv("PORT", 5000))      # ex.: "5000"
NUMBER = os.getenv("NUMBER", "0")          # ex.: "1" (útil para distinguir backends)

FACTS = [
    "Um contentor é só um processo com umas paredes à volta.",
    "O problema é sempre o DNS. Até não ser. E mesmo assim é o DNS.",
    "localhost dentro de uma máquina significa ESSA máquina, não outra.",
    "O frontend mostra coisas. O backend sabe coisas.",
    "As portas são como números de porta num prédio: mesmo prédio (IP), portas diferentes.",
    "As variáveis de ambiente permitem mudar o comportamento sem mudar o código.",
]

# O backend fala JSON (dados), não HTML (páginas).
@app.route("/api/fact")
def fact():
    return jsonify({
        "fact": random.choice(FACTS),
        "backend_number": NUMBER,
        "backend_hostname": socket.gethostname(),
        "time": datetime.now().strftime("%H:%M:%S"),
    })

# Health-check simples (sempre em /healthcheck)
@app.route("/healthcheck")
def healthcheck():
    return "O backend funciona!", 200

if __name__ == "__main__":
    # 0.0.0.0 = escutar em TODAS as placas de rede (necessário para outras máquinas chegarem cá)
    print(f"Backend {NUMBER} à escuta em http://0.0.0.0:{PORT}/api/fact")
    app.run(host="0.0.0.0", port=PORT)

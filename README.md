# Two-Stackerino 🖥️ ➡️ 🧠

Duas pequenas aplicações que **falam uma com a outra**:

| Pasta       | O que é      | Linguagem       | Porta por omissão | Fala…                           |
| ----------- | ------------ | --------------- | ----------------- | ------------------------------- |
| `frontend/` | **Frontend** | Node.js/Express | `3000`            | HTML (páginas para humanos) 👀  |
| `backend/`  | **Backend**  | Python/Flask    | `5000`            | JSON (dados para programas) 🤖  |

Já sabes pôr a correr **uma** aplicação (noderino / flaskerino). Agora vais pôr **duas** aplicações a trabalhar em conjunto. É a isto que se chama **microsserviços**.

> [!NOTE]
> 🇬🇧 English version: https://github.com/professordiogodev/devops.two-stackerino

---

## 0. Frontend vs Backend — qual é a diferença?

Pensa num restaurante 🍝:

- O **frontend** é o **empregado de mesa**. Fala com o cliente (tu, no browser) e apresenta tudo de forma bonita.
- O **backend** é a **cozinha**. Faz o trabalho a sério e guarda os dados. Os clientes nunca entram na cozinha.

Neste projeto:

- O **backend** (`backend/app.py`) responde a `GET /api/fact` com **JSON** — dados em bruto, sem cores, sem layout:
  ```json
  {"fact": "As portas são como números de porta num prédio...", "backend_number": "1", "backend_hostname": "abc123", "time": "10:42:01"}
  ```
- O **frontend** (`frontend/index.js`) responde a `GET /` com uma **página HTML**. Para construir essa página, **chama o backend** e coloca a curiosidade dentro da página.

```
  ┌──────────┐   1. GET /          ┌────────────┐  2. GET /api/fact   ┌───────────┐
  │ Browser  │ ──────────────────► │  FRONTEND  │ ──────────────────► │  BACKEND  │
  │   (tu)   │ ◄────────────────── │  :3000     │ ◄────────────────── │  :5000    │
  └──────────┘   4. Página HTML    └────────────┘  3. Dados JSON      └───────────┘
```

> [!IMPORTANT]
> 💡 **Ideia-chave:** o backend é o **upstream** do frontend (o serviço de que ele depende). O frontend encontra-o através de **uma variável de ambiente: `BACKEND_URL`**. Acertar nesse URL em todas as situações é o exercício todo!

### Variáveis de ambiente

| Aplicação | Variável      | Para que serve                                          | Por omissão             |
| --------- | ------------- | ------------------------------------------------------- | ----------------------- |
| backend   | `PORT`        | Porta onde o backend fica à escuta                      | `5000`                  |
| backend   | `NUMBER`      | Um número mostrado na página (para distinguir backends) | `0`                     |
| frontend  | `PORT`        | Porta onde o frontend fica à escuta                     | `3000`                  |
| frontend  | `BACKEND_URL` | **Onde é que o frontend encontra o backend**            | `http://localhost:5000` |

As duas aplicações também têm `/healthcheck`.

---

## Nível 1 — Correr as duas no teu computador (dois terminais)

### 1.1 Obter o código

```bash
git clone https://github.com/professordiogodev/devops.two-stackerino-pt
cd devops.two-stackerino-pt
```

### 1.2 Terminal 1: arrancar o BACKEND 🧠

```bash
cd backend

# (Só em Ubuntu, se ainda não tiveres) sudo apt update && sudo apt install python3-venv -y
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt

export NUMBER=1
python3 app.py
```

> [!TIP]
> ✅ Testa — abre http://localhost:5000/api/fact no browser. Deves ver **JSON** (feio, dados em bruto). É normal: um backend produz dados, não páginas.

> [!WARNING]
> Deixa este terminal **a correr**! Se o fechares ou carregares em `Ctrl + C`, o backend para.

### 1.3 Terminal 2: arrancar o FRONTEND 🖥️

Abre um **novo** terminal (o backend tem de continuar a correr no primeiro):

```bash
cd devops.two-stackerino-pt/frontend

# (Só em Ubuntu, se ainda não tiveres) sudo apt update && sudo apt install nodejs npm -y
npm install

export BACKEND_URL=http://localhost:5000
node index.js
```

> [!TIP]
> ✅ Testa — abre http://localhost:3000. Deves ver uma **página bonita** com uma curiosidade lá dentro e "Respondido pelo backend número **1**". Atualiza a página: a curiosidade muda, porque cada atualização = o frontend chama o backend outra vez.

🎉 **Dois serviços a falar um com o outro!**

### 1.4 Estragar de propósito 🔨 (muito importante!)

1. Vai ao Terminal 1 e para o backend com `Ctrl + C`.
2. Atualiza http://localhost:3000.
3. Vais ver: *"O frontend está ligado, mas o backend não responde"*.

O frontend continua vivo — só o seu **upstream** é que desapareceu. Olha para o Terminal 2: o erro aparece lá. Volta a arrancar o backend (`python3 app.py`), atualiza a página e está resolvido.

> [!IMPORTANT]
> Esta é a coisa nº 1 que vais ter de diagnosticar na vida real: *"O problema é da minha aplicação, ou daquilo de que ela depende?"*

Para as duas aplicações (`Ctrl + C` em cada terminal) antes do Nível 2.

---

## Nível 2 — Dois servidores diferentes (VMs) ☁️

O mundo real: o frontend numa máquina, o backend noutra. Precisas de **2 VMs Linux** (ex.: 2 instâncias EC2 na mesma VPC/rede).

```
Internet ──► [ VM-FRONTEND : 3000 ]  ──IP privado──►  [ VM-BACKEND : 5000 ]
             (pública, aberta a todos)                (só o frontend pode entrar)
```

### 2.1 VM-BACKEND

```bash
sudo apt update && sudo apt install git python3-venv -y
git clone https://github.com/professordiogodev/devops.two-stackerino-pt
cd devops.two-stackerino-pt/backend
python3 -m venv venv && source ./venv/bin/activate
pip install -r requirements.txt
export NUMBER=2
python3 app.py
```

Aponta o **IP privado** desta VM (`hostname -I`, ou na consola da AWS). Exemplo: `172.31.10.20`.

### 2.2 VM-FRONTEND

```bash
sudo apt update && sudo apt install git nodejs npm -y
git clone https://github.com/professordiogodev/devops.two-stackerino-pt
cd devops.two-stackerino-pt/frontend
npm install

# Usa aqui o IP PRIVADO do BACKEND 👇
export BACKEND_URL=http://172.31.10.20:5000
node index.js
```

> [!WARNING]
> O `nodejs` instalado pelo `apt` tem de ser a versão **18 ou superior** (confirma com `node -v`), porque usamos o `fetch` nativo. Se for mais antiga, instala um Node mais recente (por exemplo com o [nvm](https://github.com/nvm-sh/nvm)).

### 2.3 Firewall / Security Groups 🔐

| VM           | Permitir entrada na porta | A partir de                                                    |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| VM-FRONTEND  | `3000`                    | Qualquer lado (`0.0.0.0/0`)                                    |
| VM-BACKEND   | `5000`                    | **Apenas** a VM-FRONTEND (o IP privado dela ou o security group) |

> [!CAUTION]
> **Não** abras a porta `5000` do backend a `0.0.0.0/0`. O backend nunca deve estar acessível a partir da internet — apenas a partir do frontend.

Abre `http://<IP-PÚBLICO-DO-FRONTEND>:3000` ✅ — "backend número **2**".

Agora experimenta `http://<IP-PÚBLICO-DO-BACKEND>:5000/api/fact` no browser → **não** funciona. Isso é uma **funcionalidade**: só o frontend está aberto ao mundo. Os clientes falam com o empregado de mesa, nunca com a cozinha. 🍝

> [!NOTE]
> No Nível 1, o `BACKEND_URL` era `http://localhost:5000` porque as duas aplicações estavam na **mesma** máquina. Agora estão em máquinas **diferentes**, por isso `localhost` estaria errado — a VM do frontend iria procurar o backend *em si própria*. Mesmo código, `BACKEND_URL` diferente. É por isso que é uma variável de ambiente!

### 🩺 Lista de diagnóstico (se vires "o backend não responde")

1. O backend está a correr? Na VM-BACKEND: `curl localhost:5000/healthcheck`
2. A VM do frontend consegue chegar lá? Na VM-FRONTEND: `curl http://<IP-PRIVADO-DO-BACKEND>:5000/healthcheck`
   - Fica pendurado / dá timeout → firewall / security group 🔐
   - "Connection refused" → o backend não está a correr, ou a porta está errada
3. O `BACKEND_URL` está correto? O frontend mostra-o quando arranca.
4. O backend está à escuta em `0.0.0.0` (todas as placas de rede) e não só em `127.0.0.1`? O nosso está — vê a última linha do `backend/app.py`.

---

## 🏆 Desafios

1. **Mudar a porta:** corre o backend com `PORT=7000`. O que mais tens de mudar para tudo continuar a funcionar?
2. **Trocar de backend:** corre dois backends (`NUMBER=1` e `NUMBER=2`) em portas diferentes. Muda o frontend de um para o outro **apenas** alterando o `BACKEND_URL` — sem mexer no código.
3. **Ler o código:** no `frontend/index.js`, encontra a linha exata onde o frontend chama o backend.
4. **Acrescentar um campo:** faz o backend devolver também `"student": "<o teu nome>"` e mostra-o na página do frontend. (Tens de alterar **os dois** serviços — é assim que funcionalidades reais são feitas!)
5. **Explicar:** numa frase cada, explica a um colega: o que é um frontend? O que é um backend? O que é um upstream?

Diverte-te! 🚀

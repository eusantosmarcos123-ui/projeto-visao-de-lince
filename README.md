# 👁️ PROJETO VISÃO DE LINCE — RECONHECIMENTO FACIAL HEALTHTECH

> **Equipe 1** &bull; Sistema de Autenticação Biométrica Facial Passwordless com Prova de Vida Ativa e Conformidade Rigorosa com a LGPD.

---

## 📌 Cenário e Motivação

Um laboratório de pesquisas clínicas (*HealthTech*) enfrentou um problema crítico de segurança: funcionários emprestavam crachás e compartilhavam senhas para registrar ponto em nome de terceiros e acessar áreas restritas de biossegurança nível 4.

O projeto **"Visão de Lince"** implementa o conceito **"Você é a sua senha"**: um sistema onde o acesso físico e lógico é concedido unicamente através do reconhecimento biométrico facial em tempo real pela webcam, integrando:
1. **Cadastro Facial Seguro:** Extração de descritores de 128 dimensões com alinhamento de 68 marcos anatômicos.
2. **Login com Prova de Vida Ativa (*Anti-Spoofing*):** Algoritmo que calcula a razão de aspecto do olho (*Eye Aspect Ratio - EAR*) para detectar piscamento natural e microexpressões, bloqueando ataques de fotos impressas ou telas de celular.
3. **Painel Secreto de Biossegurança:** Área confidencial acessível exclusivamente após verificação biométrica positiva.
4. **Governança e LGPD:** Princípio de *Privacy by Design* — **nenhuma imagem de foto é armazenada no banco de dados**, apenas representações matemáticas unidirecionais não reversíveis (Art. 11, II, 'g' e Art. 18 da LGPD).

---

## 🏗️ Arquitetura Tecnológica

* **Frontend:** HTML5, CSS3 cibernético/HealthTech, JavaScript moderno (ES6+), WebRTC (`getUserMedia`), Canvas API.
* **Inteligência Artificial:** `face-api.js` (TensorFlow.js) operando modelos pré-treinados:
  * `tiny_face_detector`: Detecção ultrarrápida de faces no navegador.
  * `face_landmark_68_model`: Mapeamento tridimensional de 68 pontos anatômicos.
  * `face_recognition_model`: Geração do vetor biométrico de 128 dimensões (*embedding*).
  * `face_expression_model`: Detecção de emoções/microexpressões faciais.
* **Backend:** Node.js, Express, CORS, Crypto nativo.
* **Banco de Dados:** Armazenamento estruturado JSON (`users.json` e `access_logs.json`) contendo apenas metadados funcionais e os vetores de características 128-D.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js v18+ instalado.

### 1. Clonar ou navegar até a pasta do projeto:
```bash
cd "c:\Users\Aluno Tech\Downloads\TUDO MARCOS VINICIUS DO SANTOS\projeto-visao-de-lince"
```

### 2. Instalar as dependências:
```bash
npm install
```

### 3. Iniciar o servidor:
```bash
npm start
```

### 4. Acessar no navegador:
Abra seu navegador em:
👉 **`http://localhost:3000`**

*(Conceda permissão de acesso à webcam quando o navegador solicitar).*

---

## ☁️ Como Fazer o Deploy em Nuvem (Entregável 1)

O projeto está 100% pronto para deploy gratuito em nuvem. Sugerimos o **Render** ou **Railway**:

### Opção Recomendada: Render (Gratuito e Simples)
1. Suba esta pasta para um repositório no seu GitHub (ex: `visao-de-lince`).
2. Acesse [render.com](https://render.com) e crie uma conta gratuita.
3. Clique em **"New +"** $\rightarrow$ **"Web Service"**.
4. Conecte seu repositório GitHub.
5. Configure:
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
6. Clique em **"Deploy Web Service"**.
7. O Render gerará uma URL pública HTTPS (ex: `https://visao-de-lince.onrender.com`).
   * *Nota importante:* Webcams em navegadores modernos só funcionam em `localhost` ou sob protocolo seguro `https://`. O Render fornece HTTPS gratuito automaticamente!

---

## 📂 Estrutura de Arquivos

```
projeto-visao-de-lince/
├── package.json               # Configurações do projeto e scripts npm
├── server.js                  # Servidor Express com APIs de autenticação e logs
├── database/
│   ├── users.json             # Base de usuários (apenas metadados e descritores 128D)
│   └── access_logs.json       # Trilha de auditoria e logs de segurança
├── public/
│   ├── css/
│   │   └── style.css          # Estilo futurista escuro com scanner HUD
│   ├── js/
│   │   ├── face-api.min.js    # Biblioteca de visão computacional
│   │   ├── app-cadastrar.js   # Script da tela de cadastro biométrico
│   │   ├── app-login.js       # Script de login com prova de vida anti-spoofing
│   │   └── app-painel.js      # Script do painel restrito e auditoria
│   ├── models/                # Redes neurais pré-treinadas locais (offline-ready)
│   ├── index.html             # Portal inicial do sistema
│   ├── cadastro.html          # Interface de cadastro com termos LGPD
│   ├── login.html             # Interface de login com câmera e prova de vida
│   └── painel.html            # Painel Secreto de Biossegurança Nível 4
└── docs/
    ├── RELATORIO_SEGURANCA_LGPD.md   # Respostas técnicas sobre embaçamento, spoofing e LGPD
    ├── TERMOS_DE_USO_LGPD.md         # Parágrafo mandatório e termos de uso
    └── ROTEIRO_PITCH_5_MINUTOS.md     # Roteiro cronometrado da apresentação
```

---

## 🔒 Conformidade LGPD & Segurança

* **Art. 5º, II:** Biometria classificada e tratada como Dado Pessoal Sensível.
* **Art. 11, II, 'g':** Tratamento fundamentado na Prevenção à Fraude e Segurança do Titular.
* **Art. 6º, III:** Princípio da Minimização — **Nenhuma imagem fotográfica do colaborador é persistida em disco**.
* **Art. 18:** Direito de revogação e exclusão definitiva disponível diretamente na interface.
* **Anti-Spoofing Ativo:** Validação biológica através do cálculo dinâmico da Razão de Aspecto do Olho (*Eye Aspect Ratio - EAR*), impedindo a invasão com fotografias estáticas.

---

*Equipe 1 — Projeto "Visão de Lince" &bull; 2026*

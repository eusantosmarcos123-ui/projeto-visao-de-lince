# 🛡️ RELATÓRIO TÉCNICO DE SEGURANÇA E CONFORMIDADE LGPD
## Projeto "Visão de Lince" — Controle de Acesso Biométrico HealthTech
**Equipe 1** &bull; **Data:** 2026 &bull; **Versão:** 1.0 (Final)

---

## 1. Sumário Executivo e Cenário do Problema

Em instituições hospitalares e laboratórios de pesquisa clínica (*HealthTech*), o controle de acesso tradicional baseado em senhas alfanuméricas e crachás de proximidade (RFID/NFC) apresenta uma falha estrutural gravíssima: **a transferibilidade da credencial**. 

O incidente registrado — onde funcionários emprestavam crachás e senhas para registrar ponto em nome de colegas ou adentrar áreas restritas de biossegurança — comprometeu a rastreabilidade sanitária, a cadeia de custódia de amostras patogênicas e violou normas de *compliance* laboratoriais.

O projeto **"Visão de Lince"** foi concebido sob a premissa de autenticação não transferível (*"Você é a sua senha"*), utilizando visão computacional e aprendizado profundo (*Deep Learning*) via `face-api.js` e redes neurais convolucionais (CNNs).

---

## 2. Reflexão de Segurança 1: Câmera Embaçada e Condições Adversas de Iluminação

### A. O Fenômeno Físico e Matemático
Uma câmera embaçada (por sujeira na lente, umidade condensada de autoclave ou vapor biológico) atua como um filtro passa-baixas (*Gaussian Blur*), eliminando frequências espaciais altas da imagem. 

Na arquitetura de redes neurais faciais:
1. **Detecção e Alinhamento:** O detector (Tiny Face Detector / SSD MobileNet) falha em localizar bordas nítidas de contraste necessárias para estimar a caixa delimitadora (*bounding box*).
2. **Marcos Anatômicos (Landmarks 68):** A perda de definição ao redor das comissuras labiais, canto dos olhos (*cantos medial e lateral*) e dorso nasal impossibilita a ancoragem dos 68 pontos geométricos.
3. **Extração do Descritor de 128 Dimensões:** Com os marcos deslocados ou ausentes, a rede de reconhecimento gera um vetor $\vec{v} \in \mathbb{R}^{128}$ com alta dispersão estatística em relação ao vetor canônico cadastrado $\vec{u}$.

### B. Impacto nas Métricas Biométricas: FAR vs. FRR
* **FRR (False Rejection Rate / Falsa Rejeição):** Dispara exponencialmente. O usuário legítimo tem seu acesso bloqueado, pois a distância euclidiana:
  $$d(\vec{u}, \vec{v}) = \sqrt{\sum_{i=1}^{128} (u_i - v_i)^2}$$
  supera o limiar de tolerância de segurança ($d > 0.52$).
* **FAR (False Acceptance Rate / Falsa Aceitação):** Permanece baixo, desde que o sistema não relaxe artificialmente o limiar euclidiano. O risco crítico é a tentação do desenvolvedor despreparado de aumentar o limiar para $0.65$ para "facilitar o login", abrindo brecha para que pessoas parecidas entrem.

### C. Solução Implementada no Visão de Lince
* **Filtro de Qualidade Pré-Matching:** O sistema rejeita o frame se o score de confiança do detector for inferior a $80\%$.
* **Instrução Ativa ao Usuário:** Notificação na tela: *"Qualidade de imagem insuficiente. Limpe a lente da câmera e posicione-se em local com iluminação direta e difusa"*.
* **Ajuste Dinâmico de Exposição:** Utilização das restrições de mídia do navegador (`advanced: [{ exposureMode: 'continuous' }]`) para mitigar sombras severas.

---

## 3. Reflexão de Segurança 2: Ataque de Apresentação (*Spoofing*) com Foto Impressa ou Celular

### A. A Vulnerabilidade do Reconhecimento 2D Estático
Sistemas biométricos ingênuos processam apenas o mapa de textura 2D. Um invasor que imprima uma fotografia em alta definição do pesquisador responsável em papel sulfite A4 ou a reproduza na tela de um tablet pode enganar o extrator de vetores, pois a geometria facial bidimensional registrada pela lente é idêntica à do colaborador real.

### B. Como a Prova de Vida (*Liveness Detection*) do Visão de Lince Bloqueia o Ataque

Para neutralizar ataques de *Presentation Attack Detection* (PAD - ISO/IEC 30107-3), implementamos uma **Prova de Vida Ativa Interativa**:

#### 1. Algoritmo de Detecção de Piscamento de Olhos via Razão de Aspecto do Olho (*Eye Aspect Ratio - EAR*)
Baseado no estudo seminal de *Soukupová e Čech (2016)*, o sistema rastreia os 6 marcos anatômicos de cada olho em tempo real:
* Olho Esquerdo: $P_{36}$ a $P_{41}$
* Olho Direito: $P_{42}$ a $P_{47}$

A razão de aspecto do olho é calculada frame a frame:
$$EAR = \frac{||P_2 - P_6|| + ||P_3 - P_5||}{2 \times ||P_1 - P_4||}$$

* **Comportamento em Olhos Abertos:** $EAR \approx 0.28 - 0.35$
* **Comportamento em Fechamento Palpebral:** $EAR < 0.21$
* **Comportamento em Foto Impressa:** $EAR = \text{constante}$ ($\Delta EAR \approx 0$).

Uma foto impressa possui curvatura ocular e pálpebras perfeitamente imóveis. Nosso algoritmo exige a detecção de uma curva característica de queda brusca ($EAR < 0.21$) seguida de recuperação imediata ($EAR > 0.25$) em um intervalo biológico plausível ($150\text{ms} \le \Delta t \le 600\text{ms}$). Sem essa transição dinámica, o sistema rotula o frame como: **"Foto Estática Detectada / Suspeita de Spoofing"** e bloqueia o envio do descritor.

#### 2. Desafio Interativo de Microexpressões (*Smiling Liveness*)
Além do EAR, o modelo carrega a rede `faceExpressionNet`. Durante a autenticação, o sistema solicita um estímulo dinâmico (ex: *"Dê um sorriso"*). Apenas quando o score da expressão de felicidade atinge $> 0.65$ a biometria é despachada para o backend, impedindo que fotografias neutras superem o bloqueio.

---

## 4. Reflexão Jurídica: A LGPD (Lei 13.709/2018) e o Armazenamento de Dados Biométricos

### A. Enquadramento Legal: Dado Pessoal Sensível
O **Artigo 5º, inciso II da LGPD** categoriza explicitamente a biometria como **Dado Pessoal Sensível**:
> *"Dado sobre origem racial ou étnica, convicção religiosa [...], dado referente à saúde ou à vida sexual, dado genético ou **biométrico**, quando vinculado a uma pessoa natural;"*

Por ser um laboratório clínico (*HealthTech*), o rigor regulatório é duplo, respondendo tanto à ANPD (Autoridade Nacional de Proteção de Dados) quanto à ANVISA / CFM.

### B. Bases Legais Aplicadas no Projeto
O tratamento biométrico no "Visão de Lince" está estritamente fundamentado no **Artigo 11, inciso II, alínea 'g' da LGPD**:
> *"Garantia da **prevenção à fraude e à segurança do titular**, nos processos de identificação e autenticação de cadastro em sistemas eletrônicos."*

Adicionalmente, coletamos o **consentimento livre, informado e inequívoco** (Art. 11, I) no momento do cadastro via checkbox mandatório com termos de uso explícitos.

### C. Princípio da Necessidade e Minimização de Dados (Art. 6º, III)
A maior falha de segurança e conformidade que equipes inexperientes cometem é salvar arquivos `.jpg` ou `.png` dos rostos no disco ou em campos `BLOB/Base64` do banco de dados. 

**No Visão de Lince, adotamos o princípio de *Privacy by Design*:**
1. **Zero Armazenamento de Fotos:** A imagem de vídeo é processada efemeramente na memória volátil (RAM) da GPU/CPU do cliente e imediatamente destruída após a extração dos pontos.
2. **Vetor Matemático Unidirecional (Descritor 128D):** O que vai para o banco de dados é unicamente um array de 128 números de ponto flutuante:
   ```json
   [-0.1042, 0.0894, 0.0521, -0.1983, ..., 0.0411]
   ```
3. **Não Reversibilidade:** Um vetor de características 128D é uma função de resumo unidirecional de alta dimensão (*one-way embedding*). Mesmo na hipótese de vazamento total do banco de dados, **é matematicamente impossível reconstruir a face visual ou a fotografia original do funcionário** a partir desses números.

### D. Cumprimento dos Direitos do Titular (Artigo 18 da LGPD)
O sistema implementa no Painel Secreto o botão de **"Revogação e Eliminação de Dados Biométricos"**, permitindo que o colaborador solicite a exclusão sumária e definitiva do seu descritor (`DELETE /api/usuarios/:id`), gerando log de auditoria do expurgo.

---

## 5. Resumo Comparativo: Abordagem Ingênua vs. Solução Visão de Lince

| Vetor de Risco | Abordagem Ingênua (Comum) | Solução Técnica do "Visão de Lince" |
| :--- | :--- | :--- |
| **Lente Suja / Embaçada** | Tenta autenticar; gera falsos positivos ou trava silenciosamente. | Validação prévia de contraste e confiança $> 80\%$, emitindo orientação de limpeza da lente. |
| **Foto Impressa / Celular** | Vulnerável. Libera acesso para a folha impressa. | **Prova de Vida Ativa**: Algoritmo de EAR (Eye Aspect Ratio) para piscamento real + desafio de sorriso. |
| **Armazenamento de Imagens** | Salva fotos no banco (Grave infração LGPD). | **Zero fotos salvas**. Apenas vetor de características 128-D abstrato e criptografado. |
| **Governança e Trilha** | Sem registro de tentativas suspeitas. | Trilha de auditoria completa registrando logins autorizados, tentativas de spoofing e expurgos LGPD. |

---

*Relatório redigido em conformidade com as diretrizes do Desafio "Visão de Lince" — Equipe 1.*

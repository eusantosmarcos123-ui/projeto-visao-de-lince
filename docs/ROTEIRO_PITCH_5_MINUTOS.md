# 🎤 ROTEIRO DE APRESENTAÇÃO: PITCH TÉCNICO (5 MINUTOS)
## Projeto "Visão de Lince" — Reconhecimento Facial em HealthTech
**Equipe 1** &bull; **Duração Total:** 05:00 cronometrados

---

### ⏱️ Cronograma do Pitch

| Minuto | Bloco | Objetivo Principal | Ação na Tela |
| :---: | :--- | :--- | :--- |
| **00:00 - 01:00** | **O Problema & O Desafio** | Capturar a atenção com o incidente real de segurança. | Slide inicial / Tela inicial do Visão de Lince |
| **01:00 - 02:30** | **Demonstração Prática (Live Demo)** | Provar que o sistema funciona em tempo real. | Cadastro Facial $\rightarrow$ Login com Prova de Vida $\rightarrow$ Painel Secreto |
| **02:30 - 03:45** | **Arquitetura Técnica & Segurança** | Responder as perguntas da câmera embaçada e do spoofing. | Exibição da telemetria e código/marcos faciais |
| **03:45 - 04:30** | **Conformidade LGPD & Governança** | Explicar a estratégia jurídica de "Zero Fotos Salvas". | Termos de uso e exclusão pelo Artigo 18 |
| **04:30 - 05:00** | **Conclusão & Fechamento** | Sintetizar o valor de negócio e abrir para a banca. | Painel de auditoria e encerramento |

---

### 🎙️ Guia de Falas e Encenação (Fala por Fala)

#### 🕒 [00:00 - 01:00] Bloco 1: A Dor do Cliente e o Incidente no Laboratório
> **Apresentador 1:**
> *"Boa tarde a todos! Imaginem um laboratório clínico de ponta desenvolvendo terapias gênicas e lidando com patógenos de alto risco. Recentemente, a diretoria descobriu um incidente crítico: colaboradores estavam emprestando crachás de proximidade e repassando senhas para bater ponto pelos colegas e acessar salas de contenção biológica.*
> 
> *Em um ambiente regulado, crachá e senha não garantem identidade real: crachás são esquecidos e senhas são compartilhadas. A diretoria nos fez uma exigência direta: implementar um sistema onde **você é a sua própria senha**.*
> 
> *Apresentamos o **Projeto Visão de Lince**: uma solução de autenticação biométrica facial passwordless, com inteligência artificial no navegador, prova de vida ativa contra fraudes e conformidade rigorosa com a LGPD."*

---

#### 🕒 [01:00 - 02:30] Bloco 2: Demonstração ao Vivo (*Live Demo*)
> **Apresentador 2 (ou operador no notebook):**
> *(Acessa a tela de Cadastro `/cadastro.html`)*
> 
> *"Vamos ver o sistema operando em tempo real. Primeiro, o cadastro do colaborador. Observem na tela que a câmera liga instantaneamente. Nossa IA faz o alinhamento dos 68 marcos anatômicos do rosto. Notem que o botão só é liberado quando a iluminação e a centralização atingem o nível ótimo de confiança.*
> 
> *Aqui embaixo, temos o parágrafo mandatório da LGPD, informando com clareza como esses dados são tratados. Preenchemos os dados da Dra. Mariana, marcamos o consentimento e clicamos em **Capturar e Salvar Biometria**.*
> 
> *(Navega para a tela de Login `/login.html`)*
> 
> *Agora, a Dra. Mariana vai entrar na área restrita. O sistema exige a câmera. Mas vejam o diferencial: ele não libera o acesso de imediato! Ele exige uma **Prova de Vida Ativa**: ele solicita um estímulo biológico — que o usuário pisque os olhos ou sorria. Vejam: quando eu pisco... **Prova de Vida Aprovada!**. Em menos de 200 milissegundos, o sistema calcula a distância euclidiana e libera a entrada no nosso **Painel Secreto**!"*
> 
> *(Mostra o `/painel.html` com os dados confidenciais de biossegurança)*

---

#### 🕒 [02:30 - 03:45] Bloco 3: Reflexão de Segurança — Câmera Embaçada e Ataque de Spoofing
> **Apresentador 1:**
> *"Agora, como nós respondemos aos desafios de segurança impostos no edital?*
> 
> *1. **E se a câmera estiver embaçada ou com baixa luz?**
> Tecnicamente, a imagem embaçada atua como um filtro Gaussiano, eliminando bordas e distorcendo os marcos anatômicos. Isso aumentaria a taxa de Falsa Rejeição (FRR). A nossa solução: calibramos o sistema com validação prévia de qualidade. Se a confiança for inferior a 80%, o sistema não 'adivinha' — ele instrui o usuário a limpar a lente ou ajustar a luz, mantendo o limiar euclidiano estrito em 0.52.
> 
> *2. **E se um invasor colocar uma foto impressa do funcionário na frente da câmera (Spoofing)?**
> Essa é a principal falha de sistemas amadores. Uma foto impressa tem uma face 2D idêntica. Para combater isso, desenvolvemos nosso motor de **Liveness Detection** baseado na **Razão de Aspecto do Olho (EAR)**. Uma foto impressa tem pálpebras imóveis e EAR perfeitamente estático. Nosso algoritmo só envia o vetor biométrico após detectar a curva matemática de fechamento e abertura palpebral ou o sorriso. Se você colocar uma foto estática, o sistema trava em 'Foto Estática Detectada' e bloqueia o acesso."*

---

#### 🕒 [03:45 - 04:30] Bloco 4: A LGPD e o Armazenamento de Dados
> **Apresentador 2:**
> *"Por fim, como lidamos com a LGPD? A biometria facial é expressamente um **Dado Pessoal Sensível** (Art. 5º, II).*
> 
> *Nossa base legal está no **Artigo 11, II, 'g'**: prevenção à fraude e segurança do titular. E aqui está a decisão de arquitetura mais importante do nosso projeto:*
> 
> *👉 **Nós NÃO armazenamos nenhuma foto de rosto no banco de dados!**
> 
> *Armazenar fotos é um risco gravíssimo de vazamento. O Visão de Lince processa o vídeo em memória temporária e extrai apenas um **vetor numérico de 128 dimensões** — uma representação matemática abstrata e unidirecional. A partir desses 128 números, é matematicamente impossível reconstruir a face humana.*
> 
> *Além disso, no canto superior do painel, garantimos o **Artigo 18 da LGPD**: o colaborador pode, com um único clique, revogar seu consentimento e eliminar definitivamente seu vetor biométrico do sistema."*

---

#### 🕒 [04:30 - 05:00] Bloco 5: Fechamento e Resultados
> **Apresentador 1:**
> *"Para concluir: resolvemos o problema do empréstimo de credenciais do laboratório, eliminamos o risco de falsificação com foto impressa, implementamos uma trilha de auditoria completa e estamos 100% alinhados à LGPD.*
> 
> *Com o 'Visão de Lince', o laboratório garante que **você é a sua senha** — intransferível, segura e privada.*
> 
> *A aplicação está rodando em nuvem e aberta para testes. Muito obrigado, estamos prontos para as perguntas da banca!"*

---

### 💡 Dicas de Sucesso para a Apresentação da Equipe

1. **Ensaio com a Câmera:** Testem a webcam do notebook com antecedência para garantir que a iluminação da sala de aula não crie sombras muito duras sobre o rosto.
2. **Tenha uma Foto Impressa ou Celular em Mãos:** Para demonstrar o Anti-Spoofing, mostre o celular com uma foto do colega na câmera e comprove que o sistema **não abre** porque a foto não pisca nem sorri! Isso impressiona qualquer banca examinadora.
3. **Distribuição de Papéis:**
   - Integrante A: Apresentação conceitual, introdução e respostas técnicas.
   - Integrante B: Operação do sistema e demonstração ao vivo.
   - Integrante C: Enfoque na LGPD e governança de dados sensíveis.

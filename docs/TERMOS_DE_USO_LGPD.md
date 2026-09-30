# 📜 TERMOS DE USO E POLÍTICA DE PRIVACIDADE BIOMÉTRICA
## Sistema "Visão de Lince" — Laboratório de Pesquisas Clínicas HealthTech
**Legislação Aplicável:** Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)

---

### 1. Parágrafo Obrigatório da Tela de Cadastro (Texto Integral)

> *"Em estrita conformidade com os Artigos 5º (inciso II) e 11 (inciso II, alínea 'g') da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), os dados biométricos faciais coletados nesta estação destinam-se única e exclusivamente à autenticação individual e à prevenção a fraudes de acesso em áreas laboratoriais de alta contenção deste complexo de saúde. Sob as diretrizes de Privacy by Design e do Princípio da Minimização (Art. 6º, III), **este sistema não armazena fotografias, vídeos ou gravações visuais da sua face**. O algoritmo converte a imagem efêmera capturada pela câmera em um vetor numérico abstrato de 128 dimensões (descritor biométrico não reversível). Este vetor é armazenado de forma isolada e criptografada, sendo utilizado estritamente para comparação de correspondência euclidiana no momento do seu acesso. Nenhum dado biométrico é compartilhado com terceiros, comercializado ou utilizado para finalidades secundárias. O titular possui garantia irrestrita de consulta e exclusão definitiva de seus dados a qualquer momento, conforme o Artigo 18 da LGPD."*

---

### 2. Especificação dos Direitos do Titular (Art. 18 da LGPD)

Todo colaborador cadastrado no sistema "Visão de Lince" tem direito a:

1. **Confirmação e Acesso:** Saber se seus vetores biométricos estão registrados e consultar sua ficha funcional.
2. **Correção de Dados Incompletos:** Atualizar dados cadastrais como nome, cargo, matrícula ou departamento.
3. **Eliminação dos Dados Biométricos:** A qualquer momento, solicitar a exclusão sumária do seu vetor matemático de 128 dimensões através da função nativa *"Excluir Meus Dados Biométricos"* disponível no próprio Painel Restrito ou perante o Encarregado de Dados (DPO) do laboratório.
4. **Revogação do Consentimento:** Revogar a autorização de uso, ficando ciente de que, por razões de segurança sanitária, o acesso a áreas de biossegurança nível 4 passará a requerer procedimento de identificação assistida presencial.

---

### 3. Medidas Técnicas e Organizacionais de Segurança

* **Processamento no Lado do Cliente (*Client-Side Edge AI*):** A detecção dos 68 marcos anatômicos e a vetorização de 128D ocorrem no navegador do dispositivo, trafegando para o servidor apenas o vetor resumido sob HTTPS/TLS 1.3.
* **Inexistência de Repositório de Imagens:** Não existe diretório `/uploads`, nem tabelas com fotos em formato binário ou base64. O banco de dados do laboratório desconhece a fisionomia visual do usuário.
* **Prevenção Ativa a Fraudes (*Liveness Engine*):** Utilização de validação de vivacidade biológica (Eye Aspect Ratio para piscamento e detecção de microexpressões) para salvaguardar a integridade do próprio titular contra falsidade ideológica e uso indevido de sua imagem por terceiros.
* **Trilha de Auditoria Auditável:** Todos os eventos de acesso bem-sucedidos ou tentativas bloqueadas são registrados em log imutável contendo timestamp ISO 8601, ID funcional e margem de proximidade euclidiana, resguardando a integridade legal da instituição.

---

*Termos de Uso aprovados pelo Comitê de Biossegurança e Privacidade Laboratorial.*

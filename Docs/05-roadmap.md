# Roadmap

## Onde estamos

**Fase 1 — Protótipo navegável.** Concluída.

Fluxo completo de 9 telas, classificação de risco funcionando, painel da
equipe com fila ordenada, ficha imprimível e três recursos de acessibilidade
(letra maior, alto contraste, leitura em voz alta). Roda em qualquer navegador
abrindo um arquivo, sem instalação e sem servidor.

O objetivo desta fase era validar **o fluxo e o vocabulário**, não construir o
produto. Por isso: sem back-end, sem login, sem banco de dados.

## Próximos passos

### Fase 2 — Validação com usuários

Antes de escrever mais código. É a fase mais importante e a mais fácil de
pular por engano.

- [ ] Sessão de teste com enfermeiro de triagem: as perguntas geram informação
      clinicamente útil? Falta alguma?
- [ ] Teste com pessoas surdas: o vocabulário faz sentido? Os ícones são
      reconhecíveis? Libras é a primeira língua de muitos usuários, e
      português escrito pode ser a barreira.
- [ ] Teste com fonoaudiólogo ou terapeuta ocupacional que trabalhe com
      Comunicação Aumentativa e Alternativa.
- [ ] Revisão da classificação de risco por profissional habilitado, contra as
      limitações listadas na [documentação de risco](04-classificacao-de-risco.md).
- [ ] Medir o tempo real de preenchimento com usuários reais.

### Fase 3 — Substituir os placeholders

- [ ] Trocar os emoji por pictogramas do ARASAAC (ou equivalente com licença
      aberta e vocabulário em português).
- [ ] Resolver a escala de dor: licenciar a Wong-Baker/FPS-R ou adotar uma
      alternativa aberta.
- [ ] Vídeos em Libras para cada pergunta, não só o texto escrito.
- [ ] Segunda língua na interface (espanhol é o candidato mais provável, pelo
      perfil de imigração no atendimento público).

### Fase 4 — Aplicação real

- [ ] Back-end com banco de dados, substituindo o `localStorage`.
- [ ] Autenticação para o painel da equipe (hoje é um link aberto na tela
      inicial — inaceitável em produção).
- [ ] Sessão por paciente, com expiração e limpeza de tela entre atendimentos.
- [ ] Reordenação da fila por tempo de espera, além do risco.
- [ ] Reavaliação periódica de quem está esperando.
- [ ] Registro de quem viu e atendeu cada ficha (trilha de auditoria).

### Fase 5 — Conformidade e integração

- [ ] Adequação à LGPD: dado de saúde é dado pessoal sensível (art. 5º, II).
      Precisa de base legal definida, política de retenção, registro de acesso
      e minimização de coleta.
- [ ] Definir se o sistema é enquadrado como software como dispositivo médico
      pela ANVISA. A classificação de risco é o ponto sensível: sistema que
      sugere prioridade clínica pode cair na regra. Consulta jurídica e
      regulatória necessária.
- [ ] Integração com o prontuário eletrônico da instituição (avaliar HL7 FHIR).
- [ ] Acessibilidade formal: auditoria WCAG 2.2 nível AA e eMAG.
- [ ] Definir o hardware do totem: tamanho de tela, altura de instalação
      (cadeirante alcança?), higienização entre usos, o que acontece quando cai
      a rede.

## Decisões em aberto

Pontos que precisam ser resolvidos e que hoje estão implícitos no protótipo:

| Questão | Situação |
|---|---|
| O paciente usa o próprio celular ou um totem da unidade? | Protótipo é responsivo, funciona nos dois; a decisão muda os requisitos de sessão e higiene |
| Acompanhante pode responder pelo paciente? | Hoje há a opção "tenho acompanhante", mas o fluxo não distingue quem respondeu |
| O que acontece se o paciente abandonar no meio? | Hoje nada é salvo; talvez devesse gerar uma ficha parcial |
| A triagem substitui ou complementa a do enfermeiro? | A premissa atual é complementar — precisa ser combinado com a instituição |
| Quantos totens por unidade, e com que fila? | Sem definição |

## Limitações do protótipo, resumidas

Para não haver dúvida sobre o que ainda não existe:

- não tem back-end, servidor ou banco de dados;
- não tem login e o painel da equipe é acessível por qualquer um;
- dados ficam apenas no navegador daquele computador, em `localStorage`;
- a classificação de risco não foi validada clinicamente;
- ícones são emoji, não pictogramas de CAA;
- não há Libras em vídeo, só texto escrito;
- não há integração com nenhum sistema hospitalar.

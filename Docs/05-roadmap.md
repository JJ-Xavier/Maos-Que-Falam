# Roadmap

## Onde estamos

**Fase 1 — Protótipo navegável.** Concluída.

**Fase 1.5 — MVP para validação.** Concluída. O protótipo virou algo que dá
para levar a uma sessão de teste com enfermeiro e com pacientes:

- telas reescritas, com fonte de alta legibilidade embutida (funciona
  offline) e layout para tablet, totem e celular;
- conferência das respostas antes de enviar;
- botão "Ajuda agora" em todas as telas, não só na inicial;
- tempo limite no totem, com aviso, e ficha parcial para quem abandona;
- leitura em voz alta de cada tela e de cada opção tocada;
- painel com PIN, abas por situação, ações de atendimento
  (chamar → atender → finalizar), aviso de tempo-alvo estourado e alerta
  sonoro para caso vermelho novo;
- reclassificação pela equipe, com motivo e histórico;
- totem e painel sincronizados entre abas;
- exportação CSV sem nomes, com tempo de preenchimento e concordância entre
  sistema e equipe;
- casos de exemplo para demonstração;
- testes automáticos da classificação de risco.

O objetivo continua sendo validar **o fluxo, o vocabulário e a regra**, não
construir o produto. Por isso ainda não há back-end, login de verdade nem
banco de dados.

**Versão 1.0.2.** Telas do totem ajustadas à altura de qualquer tela, versão
visível no app e no CSV, e o plano para celular e a decisão sobre Electron em
[Dispositivos e plataforma](06-dispositivos-e-plataforma.md). Detalhes em
[Release.txt](Release.txt).

## Próximos passos

### Fase 2 — Validação com usuários

Antes de escrever mais código. É a fase mais importante e a mais fácil de
pular por engano. O MVP foi feito para ela: rode as sessões com os casos de
exemplo apagados e exporte o CSV no fim de cada dia.

- [ ] Sessão de teste com enfermeiro de triagem: as perguntas geram informação
      clinicamente útil? Falta alguma? A ficha é lida em quanto tempo?
- [ ] Teste com pessoas surdas: o vocabulário faz sentido? Os ícones são
      reconhecíveis? Libras é a primeira língua de muitos usuários, e
      português escrito pode ser a barreira.
- [ ] Teste com fonoaudiólogo ou terapeuta ocupacional que trabalhe com
      Comunicação Aumentativa e Alternativa.
- [ ] Revisão da classificação de risco por profissional habilitado, contra as
      limitações listadas na [documentação de risco](04-classificacao-de-risco.md),
      começando pelos dois pesos que tendem a supertriar.
- [ ] Medir o tempo real de preenchimento (coluna `tempo_preenchimento_s` do
      CSV) e a concordância entre `prioridade_sistema` e `prioridade_equipe`.
- [ ] Testar a conferência: ajuda a corrigir toques errados ou só atrasa?

### Fase 3 — Substituir os placeholders

- [ ] Trocar os emoji por pictogramas do ARASAAC (ou equivalente com licença
      aberta e vocabulário em português). Atenção: a licença do ARASAAC é
      CC BY-NC-SA — confirmar se o uso pretendido é não comercial.
- [ ] Resolver a escala de dor: licenciar a Wong-Baker/FPS-R ou adotar uma
      alternativa aberta.
- [ ] Vídeos em Libras para cada pergunta, não só o texto escrito.
- [ ] Segunda língua na interface (espanhol é o candidato mais provável, pelo
      perfil de imigração no atendimento público).

### Fase 4 — Aplicação real

- [ ] Back-end com banco de dados, substituindo o `localStorage`.
- [ ] Autenticação de verdade para o painel. O PIN atual só evita acesso
      acidental; está escrito em um arquivo que qualquer um lê.
- [ ] Registro de **quem** fez cada ação (hoje o histórico diz o quê e
      quando, mas não quem).
- [ ] Rotina de reavaliação de quem está esperando além do tempo-alvo (hoje
      é só um aviso visual).
- [ ] Painel de chamada para a sala de espera, com a senha em letra grande —
      paciente surdo não ouve a chamada por voz.
- [ ] Alertas e fila no celular da equipe: servidor, PWA e notificação push,
      nas três etapas de [Dispositivos e plataforma](06-dispositivos-e-plataforma.md).
      O servidor dessa etapa é o mesmo back-end do primeiro item.

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

| Questão | Situação |
|---|---|
| O paciente usa o próprio celular ou um totem da unidade? | O MVP funciona nos dois; a decisão muda os requisitos de sessão e higiene |
| Acompanhante pode responder pelo paciente? | Há a opção "tenho acompanhante", mas o fluxo não distingue quem respondeu |
| O que acontece se o paciente abandonar no meio? | **Decidido no MVP:** se já respondeu algo, vai para a fila marcado "Não terminou a triagem" |
| O paciente deve ver a cor da prioridade? | **Decidido no MVP:** não. Ver o motivo na [classificação de risco](04-classificacao-de-risco.md#o-paciente-não-vê-a-cor) |
| A triagem substitui ou complementa a do enfermeiro? | Premissa: complementa. A cor do sistema é sugestão; a equipe confirma ou muda na ficha |
| Quantos totens por unidade, e com que fila? | Sem definição. Cada totem tem um nome em `config.js`, que aparece no alerta de ajuda |
| Como o alerta chega ao celular da equipe? | **Planejado na 1.0.2:** PWA com notificação push. Ver [Dispositivos e plataforma](06-dispositivos-e-plataforma.md) |
| O projeto precisa de Electron? | **Decidido na 1.0.2:** não, por enquanto. O totem roda em navegador no modo quiosque |
| Os celulares da equipe são da instituição ou pessoais? | Sem definição. Recomendado: da instituição |

## Limitações do MVP, resumidas

Para não haver dúvida sobre o que ainda não existe:

- não tem back-end, servidor ou banco de dados;
- dados ficam apenas no navegador daquele computador, em `localStorage`;
  totem e painel precisam estar no **mesmo navegador do mesmo computador**;
- o PIN do painel não é segurança;
- a classificação de risco não foi validada clinicamente;
- ícones são emoji, não pictogramas de CAA;
- não há Libras em vídeo, só texto escrito;
- não há integração com nenhum sistema hospitalar.

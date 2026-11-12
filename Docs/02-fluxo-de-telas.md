# Fluxo de telas

O app tem dois lados no mesmo arquivo:

- **Totem** (`index.html`) — o paciente responde apontando.
- **Painel da equipe** (`index.html#/equipe`) — fila, ficha e atendimento.
  Pede PIN.

Os dois podem ficar abertos ao mesmo tempo em abas ou monitores diferentes
do mesmo computador. Um se atualiza quando o outro grava.

## Mapa do totem

```
                    ┌──────────────────────────┐
                    │  INÍCIO                  │
                    │  (fica ligado no totem)  │
                    └────┬────────────────┬────┘
                         │                │
                   [Começar]   [Preciso de ajuda agora]
                         │                │
                         ▼                │
   ┌──────────────────────────────┐       │
   │ 1. Sobre você                │       │
   │    idade + nome (opcional)   │       │
   ├──────────────────────────────┤       │
   │ 2. Comunicação               │       │       Em QUALQUER tela,
   │ 3. Onde (boneco)             │       │       o botão vermelho
   │ 4. Sintomas                  │       │       "Ajuda agora" no topo
   │ 5. Intensidade               │       │       leva para EMERGÊNCIA
   │ 6. Começou quando            │       │       ─────────────────────┐
   │ 7. Saúde (histórico)         │       │                            │
   │ 8. Pedidos (conforto)        │       │                            │
   └──────────────┬───────────────┘       │                            │
                  ▼                       ▼                            ▼
   ┌──────────────────────────────┐  ┌───────────────────────────────────┐
   │ CONFERÊNCIA                  │  │ EMERGÊNCIA                        │
   │ "Mudar" volta ao passo e     │  │ já entrou na fila como vermelho   │
   │ retorna para cá              │  │ "Se conseguir, responda..." volta │
   └──────────────┬───────────────┘  │ para onde o paciente estava       │
                  ▼                  └───────────────────────────────────┘
   ┌──────────────────────────────┐
   │ PRONTO                       │
   │ senha + o que a equipe viu   │
   │ volta ao início em 30 s      │
   └──────────────────────────────┘
```

## Mapa da equipe

```
  "Sou da equipe" (link discreto no início)  ou  index.html#/equipe
                  │
                  ▼
  ┌──────────────────┐     ┌────────────────────────┐     ┌────────────────────┐
  │ PIN              │ ──▶ │ FILA                   │ ──▶ │ FICHA              │
  │ (padrão: 1234)   │     │ Aguardando /           │     │ comunicação,       │
  └──────────────────┘     │ Em atendimento /       │     │ alertas, pedidos,  │
                           │ Finalizados            │     │ respostas, status, │
                           └────────────────────────┘     │ prioridade,        │
                                                          │ histórico, imprimir│
                                                          └────────────────────┘
```

## Telas do totem

### Início

Fica ligada no totem. O título diz o que a pessoa pode fazer ("Mostre o que
você está sentindo"), e há três saídas:

| Elemento | Ação |
|---|---|
| Cartão amarelo "Começar" | Inicia a triagem |
| Botão vermelho "Preciso de ajuda agora" | Põe o paciente na fila como vermelho, sem nenhuma pergunta |
| Link "Sou da equipe" | Abre o acesso por PIN |

A barra do topo, presente em todas as telas do paciente, tem três controles:
**Letra maior** (1× → 1,2× → 1,4×), **Contraste** (preto e amarelo) e
**Ouvir**. Com "Ouvir" ligado, cada tela nova é lida em voz alta e cada
opção tocada também é lida — útil para quem enxerga pouco ou não lê bem.

Fora da tela inicial, o topo também mostra **Ajuda agora**, em vermelho. É a
saída de emergência no meio do fluxo, para quem piora enquanto responde.

### 1. Sobre você

Três cartões de idade (criança até 12, adulto, idoso 60+) e um campo de nome
opcional, abaixo. Apontar vem primeiro; escrever é secundário. O campo tem o
preenchimento automático desligado de propósito: num totem compartilhado, ele
mostraria o nome de quem usou antes.

### 2. Comunicação

A pergunta mais importante, e por isso a primeira depois da idade. Define
como a equipe vai abordar o paciente; a ficha mostra a resposta em destaque,
com uma orientação ("Usa Libras. Chame um intérprete antes de começar").

### 3. Onde

Boneco de frente com oito regiões tocáveis e oito botões para o que o boneco
não mostra bem (olhos, ouvido, boca, costas, pele, região íntima, corpo
todo, não sei dizer). Os braços e pernas têm a legenda "direito" e
"esquerdo", do corpo do paciente. Abaixo dos botões, uma linha confirma o que
foi marcado ("Marcado: Peito, Costas"). As regiões do boneco funcionam com
teclado (Tab, Enter, Espaço).

### 4. Sintomas

18 opções em múltipla escolha. Num tablet deitado, todas cabem numa tela só.

### 5. Intensidade

Seis carinhas (0, 2, 4, 6, 8, 10), cada uma com rótulo, número e uma faixa de
cor na base. Seis passos em vez de onze, porque discriminar "7 ou 8" é difícil
até para quem fala.

### 6. Começou quando

Escolha única.

### 7. Saúde

Múltipla escolha. "Nada disso" é exclusiva: limpa as outras quando marcada.

### 8. Pedidos

Água, banheiro, deitar, cadeira de rodas, frio, chamar a família, medo. Não
mexe na prioridade, mas aparece no cartão da fila — a equipe pode resolver
durante a espera.

### Conferência

Uma linha por pergunta, com o que foi marcado e um botão "Mudar". Mudar leva
ao passo e, ao tocar em "Pronto", volta direto para a conferência. Existe para
corrigir toque errado de quem está tremendo ou com dor.

### Pronto

Senha grande, "Fique por perto. Vamos chamar por este número", e um resumo do
que a equipe recebeu (forma de comunicação e pedidos), para o paciente saber
que foi entendido. Lembra que dá para pedir ajuda se piorar. Volta sozinha
ao início em 30 segundos.

**O paciente não vê a cor da prioridade.** A cor é uma sugestão que o
enfermeiro ainda vai confirmar; mostrar "Não urgente — até 240 min" antes
disso cria expectativa errada, pode fazer alguém ir embora, e ensina a marcar
"falta de ar" na próxima vez.

### Emergência

Tela inteira vermelha: "A equipe foi avisada. Fique onde está. Alguém vem até
você agora", com a senha. O paciente já está na fila. Se conseguir, pode
continuar respondendo — as respostas vão sendo anexadas à mesma ficha, que
continua vermelha. Volta ao início sozinha em 3 minutos.

## Telas da equipe

### PIN

O PIN fica em [config.js](../Codigo/js/config.js) (padrão `1234`). Ele só
evita que um paciente abra o painel sem querer — **não é segurança**, porque
qualquer pessoa pode ler o arquivo. Login de verdade depende de back-end
(ver [roadmap](05-roadmap.md)).

### Fila

- Três abas: **Aguardando** (inclui quem já foi chamado), **Em atendimento**
  e **Finalizados**, cada uma com a contagem.
- Resumo por cor de quem está aguardando.
- Cada cartão traz: senha e cor, nome e idade, sintomas e local, marcas
  (pediu ajuda, não terminou, alertas de comunicação, alergia, gestante,
  pedidos), tempo de espera e um botão com a próxima ação
  (Chamar → Iniciar atendimento → Finalizar).
- Quem passou do tempo-alvo da sua cor ganha borda vermelha e o aviso
  "Passou do tempo-alvo".
- Caso vermelho novo (inclusive o botão de ajuda do totem) mostra um aviso no
  topo, toca um bipe e põe a contagem de vermelhos no título da aba. O som
  pode ser desligado no topo.
- A lista se atualiza sozinha a cada 30 segundos e sempre que o totem grava.

No fim da página ficam as **ferramentas do protótipo**: exportar CSV (sem
nomes), carregar seis casos de exemplo para demonstração e apagar tudo.

### Ficha

- Faixa colorida com a prioridade, o tempo-alvo, há quanto tempo espera, de
  onde veio a cor (sistema, confirmada ou definida pela equipe) e quais
  respostas o sistema considerou.
- **Como se comunicar**, em destaque, com orientação prática.
- Alertas, pedidos e todas as respostas. Respostas que sozinhas já levam a
  laranja ou vermelho ganham contorno escuro.
- Dados do paciente, incluindo quanto tempo levou para preencher.
- Botões de atendimento, **mudar a prioridade** depois da avaliação (com
  motivo opcional) e o histórico de tudo que aconteceu com aquela ficha.
- Folha de impressão: sai só a ficha, sem botões, com a cor preservada.

## Regras de navegação

- **Escolha única avança sozinha** depois de 0,45 s — tempo de a pessoa ver
  o que marcou. Um segundo toque rápido não pula a pergunta seguinte.
- **Múltipla escolha exige "Continuar"**, que mostra quantas opções estão
  marcadas.
- **"Não sei, pular"** existe em todos os passos e apaga a resposta daquele
  passo.
- **"Voltar"** no primeiro passo volta ao início e descarta o que foi
  preenchido (a não ser que o paciente já esteja na fila por ter pedido
  ajuda).
- O rodapé com Voltar / Pular / Continuar fica fixo embaixo, ao alcance do
  polegar, mesmo quando a lista de opções rola.

## Quando ninguém mexe no totem

Depois de 90 segundos sem toque, aparece "Você ainda está aí?". Sem resposta
em 20 segundos, o totem volta ao início. **Se o paciente já tinha respondido
alguma coisa, a triagem vai para a fila marcada como "Não terminou a
triagem".** Quem abandona no meio pode ter piorado; é mais seguro a equipe ver.

Ao voltar ao início, letra, contraste e leitura em voz alta voltam ao padrão,
para o próximo paciente não herdar as preferências de quem saiu.

Todos esses tempos ficam em [config.js](../Codigo/js/config.js).

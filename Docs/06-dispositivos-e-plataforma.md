# Dispositivos e plataforma

Este documento responde a dois itens da versão 1.0.2:

1. Como levar o sistema para o celular da equipe, para que o aparelho vibre
   na hora quando alguém precisar de ajuda e para que dê para ver a fila sem
   um computador.
2. Se o projeto precisa de Electron.

## Resumo

- **Celular:** transformar o painel da equipe num app instalável pela web
  (PWA), servido por um servidor pequeno. O alerta chega como **notificação
  push**, que faz o celular vibrar mesmo bloqueado e no bolso, no Android e no
  iPhone. Isso exige servidor e HTTPS — é o mesmo passo que tira os dados do
  `localStorage`, então resolve duas pendências de uma vez.
- **Electron:** **não precisa agora.** O totem roda bem num navegador em modo
  quiosque, e o Electron não ajuda em nada no celular. Os casos em que valeria
  reavaliar estão no fim.

---

## Parte 1 — Alertas e fila no celular

### Por que não dá com o que existe hoje

Hoje as triagens ficam no `localStorage`, que só existe dentro de um
navegador de um computador. O totem e o painel conversam porque estão no
mesmo navegador. O celular é outro aparelho: para ele saber de alguma coisa,
precisa de um **servidor** no meio. Além disso, abrir o app como arquivo
(`file://`) não permite as peças que fazem um app web funcionar fechado
(service worker e push), que exigem HTTPS.

### Como um celular pode vibrar

| Mecanismo | Vibra com a tela bloqueada? | Android | iPhone | Observação |
|---|---|---|---|---|
| `navigator.vibrate()` com o painel aberto | Não. Só com a página aberta e na frente | Sim (Chrome, Firefox) | **Não.** O Safari não implementa, e todo navegador no iPhone usa o motor do Safari | Bom só como reforço quando o painel já está aberto |
| Notificação push da web (PWA) | **Sim** | Sim, com padrão de vibração próprio | Sim, desde o iOS 16.4, **só com o app adicionado à tela de início**; a vibração segue os ajustes do aparelho | Precisa de HTTPS, service worker e internet (passa pelos servidores de push do Google e da Apple) |
| App nativo (lojas Android e iOS) | Sim, e pode furar o "Não perturbe" com permissão especial | Sim | Sim; o "alerta crítico" exige autorização da Apple | Mais caro: dois apps, duas lojas, manutenção contínua |
| Mensageiro (ex.: bot de Telegram) | Sim | Sim | Sim | Rápido para um piloto, mas o dado de saúde passa por um terceiro e não há registro de quem confirmou |

### Recomendação: PWA com push, em três etapas

**Etapa 1 — Servidor e fila compartilhada**

- Um servidor pequeno (Node.js, por exemplo) com banco de dados (SQLite basta
  para o piloto) substitui o `localStorage`. O totem grava nele; o painel lê
  dele, em qualquer aparelho.
- A fila se atualiza em tempo real por SSE ou WebSocket, que fazem o papel
  do evento `storage` de hoje.
- Login de verdade para a equipe, no lugar do PIN.
- Com isso a equipe já vê a fila no celular, pelo navegador. Com o painel
  aberto, o Android vibra (`navigator.vibrate`) e toca o bipe que já existe.

**Etapa 2 — App instalável e notificação push**

- Manifesto e service worker, para o painel virar app: "Adicionar à tela de
  início", com ícone, abrindo em tela cheia.
- Botão "Receber alertas neste celular". O pedido de permissão precisa vir de
  um toque da pessoa — o iPhone exige.
- Quando o totem registra um pedido de ajuda ou um caso vermelho, o servidor
  envia push para os aparelhos de quem está de plantão. O celular vibra mesmo
  bloqueado.

**Etapa 3 — Regras para o alerta não virar ruído**

Alerta demais faz a equipe parar de olhar. Antes de ligar para todo mundo:

- **Só vibra o que é urgente:** pedido de ajuda e vermelho. O resto só
  atualiza a fila, em silêncio.
- **"Estou de plantão":** cada pessoa liga no começo do turno e desliga no
  fim. Quem não está de plantão não recebe.
- **"Vou atender":** o primeiro que confirma silencia o alerta nos outros
  aparelhos, e a ficha registra quem foi.
- **Escalonamento:** sem confirmação em 60 segundos (ajustável), alerta de
  novo, para todos e para a coordenação.
- **Teste de alerta:** um botão "Enviar alerta de teste" para conferir, no
  começo do plantão, que o aparelho ainda recebe.

### O que a notificação pode mostrar

A notificação aparece na tela bloqueada e passa pelos servidores do Google
ou da Apple (criptografada, mas passa). Por isso ela leva **só o mínimo**:

> Pedido de ajuda · senha MQF-012 · Recepção principal

Sem nome, sem sintomas. O detalhe só aparece dentro do app, depois do login.
Isso precisa constar na avaliação de LGPD (ver [roadmap](05-roadmap.md)).

### Limites que a web não contorna

- **iPhone:** não vibra pelo `navigator.vibrate`; o push só funciona com o app
  na tela de início; com "Não perturbe" ou modo foco, a notificação pode
  chegar sem som nem vibração. A web não tem acesso ao "alerta crítico".
- **Internet:** o push depende dela. Se a rede cair, o celular não recebe. O
  plano B continua sendo o painel e o bipe no computador da recepção.
- Se a validação mostrar que o alerta **precisa** furar o modo silencioso,
  como um bip hospitalar, o caminho é um app nativo. Fica como etapa futura,
  só se houver essa necessidade.

### Decisões que dependem do hospital

| Questão | Por que importa |
|---|---|
| O servidor fica na rede do hospital ou na nuvem? | Define quem opera, o contrato e o papel de cada um na LGPD |
| Quem emite o certificado HTTPS da rede interna? | Sem HTTPS confiável não há service worker nem push |
| Os celulares são da instituição ou pessoais? | Recomendado: da instituição. Dá controle, padroniza a configuração e não mistura dado de paciente com aparelho pessoal |
| O Wi-Fi alcança a recepção e as salas de atendimento? | O alerta chega pela rede; ponto cego é alerta perdido |

### Antes de construir: um teste barato

Antes de investir nas três etapas, vale um teste de um plantão com dois ou
três celulares e alertas simulados, para responder com a equipe:

- O celular vibrando ajuda, ou atrapalha o atendimento em curso?
- Quanto tempo leva entre o alerta e alguém chegar ao totem?
- Quantos alertas por turno a equipe tolera antes de começar a ignorar?

---

## Parte 2 — Precisa de Electron?

O Electron empacota o app com um navegador (Chromium) e o Node.js num
programa de computador para Windows, macOS ou Linux.

### O que o totem precisa, com e sem Electron

| Necessidade do totem | Sem Electron | Com Electron |
|---|---|---|
| Tela cheia travada, sem barra de endereço | Chrome ou Edge em modo quiosque; "Acesso atribuído" do Windows; "Fixar app" no Android; "Acesso Guiado" no iPad | Janela em modo quiosque |
| Abrir sozinho ao ligar o computador | Atalho na inicialização ou política de quiosque do Windows | Início automático |
| Imprimir a senha sem caixa de diálogo | Chrome com `--kiosk-printing` | Impressão silenciosa |
| Funcionar sem internet | Já funciona hoje; com servidor, o PWA guarda os arquivos em cache | Funciona |
| Rodar em tablet Android ou iPad | Funciona no navegador | **Não roda** |
| Alertas no celular da equipe | PWA (Parte 1) | **Não ajuda** |
| Instalar e atualizar | Nada para instalar; atualizar é trocar os arquivos | Instalador na casa de 100 MB por sistema; atualizar cada totem; o navegador embutido precisa de atualizações de segurança |

### Decisão

**Não usar Electron agora.** Tudo o que ele daria ao totem o navegador em
modo quiosque já dá, e ele não serve para o celular nem para tablet, que é
para onde o projeto está indo.

### Quando reavaliar

- Se o totem precisar falar com hardware que o navegador não acessa bem
  (impressora térmica específica, leitor de cartão do SUS, biometria). Parte
  disso o Chrome e o Edge já cobrem com WebUSB e Web Serial.
- Se a TI do hospital exigir um "programa instalado" que ela gerencia.
- Se o servidor da Parte 1 tiver que rodar dentro da própria máquina do
  totem.

Mesmo nesses casos, vale olhar o **Tauri** antes: ele usa o navegador do
próprio sistema, gera instaladores de poucos megabytes e, na versão 2,
também gera apps para Android e iOS.

### Como montar o totem hoje, sem Electron

No Windows, com o Edge:

```
msedge.exe --kiosk "file:///C:/MaosQueFalam/Codigo/index.html" --edge-kiosk-type=fullscreen --no-first-run
```

Ou com o Chrome, já liberando a impressão sem diálogo:

```
chrome.exe --kiosk --kiosk-printing "file:///C:/MaosQueFalam/Codigo/index.html"
```

Ajuste o caminho para onde a pasta estiver. Para o painel da equipe, abra o
mesmo arquivo terminado em `#/equipe` em outra janela ou outro monitor do
mesmo computador.

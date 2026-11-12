# Documentação — Mãos Que Falam

Triagem por apontamento para pacientes com dificuldade de comunicação.

## Índice

| Documento | O que tem dentro |
|---|---|
| [01 — Visão geral](01-visao-geral.md) | O problema, a proposta, princípios de design |
| [02 — Fluxo de telas](02-fluxo-de-telas.md) | Mapa do totem e do painel, e o detalhe de cada tela |
| [03 — Catálogo de opções](03-catalogo-de-opcoes.md) | Toda opção de toda tela, com pesos e ícones |
| [04 — Classificação de risco](04-classificacao-de-risco.md) | Os 5 níveis, a regra, a reclassificação pela equipe e as limitações |
| [05 — Roadmap](05-roadmap.md) | O que o MVP já tem, próximos passos e decisões em aberto |

## Como rodar

Abra [Codigo/index.html](../Codigo/index.html) num navegador recente (Chrome,
Edge, Firefox ou Safari). Não precisa instalar nada nem de servidor, e
funciona offline.

- **Totem:** `index.html`
- **Painel da equipe:** `index.html#/equipe`, ou o link "Sou da equipe" no
  rodapé da tela inicial. PIN padrão: `1234`.

Para ver os dois lados ao mesmo tempo, abra o arquivo em duas abas (ou duas
janelas lado a lado) do **mesmo navegador**: uma no totem, outra no painel.
O painel se atualiza sozinho quando o totem grava.

## Roteiro de demonstração

Cerca de 4 minutos. Antes de começar, abra o painel numa segunda janela, ao
lado do totem.

1. **Tela inicial** — mostre os controles do topo. Ligue o contraste e a
   letra maior; deixe alguns segundos para mostrar que nada muda de lugar.
   Ligue "Ouvir" e toque numa opção: ela é lida em voz alta.
2. **Preciso de ajuda agora** — toque no botão vermelho. A tela fica
   vermelha no totem e, na janela do painel, aparece o aviso "Pedido de
   ajuda" com bipe. Isso mostra a saída para quem não consegue responder.
   Toque em "Voltar ao início".
3. **Começar** e percorra o fluxo, marcando "Idoso", "Uso Libras", o peito no
   boneco, "Falta de ar", "Muito ruim" e "Água". São as escolhas que melhor
   mostram o resultado. Repare que escolha única avança sozinha.
4. **Conferência** — toque em "Mudar" nos sintomas, acrescente "Tosse" e
   veja que volta direto para a conferência. Envie.
5. **Pronto** — a senha, e o que a equipe recebeu. Explique por que o
   paciente **não** vê a cor da prioridade.
6. **Painel** — o caso aparece no topo, vermelho, com "Chamar intérprete de
   Libras" e "Água" no cartão. Toque em **Carregar casos de exemplo** para
   encher a fila: os casos graves ficam acima dos leves independente da ordem
   de chegada, e quem passou do tempo-alvo ganha borda vermelha.
7. **Ficha** — abra o caso: "Como se comunicar" em destaque, por que o sistema
   escolheu a cor, e as respostas. Mude a prioridade para laranja com o motivo
   "Saturação 98%, sem esforço respiratório" e mostre o histórico. É aqui que
   se explica que o sistema sugere e o enfermeiro decide.
8. **Exportar CSV** — o arquivo que sai das sessões de validação, sem nomes.

## Estrutura dos arquivos

```
Codigo/
  index.html            todas as telas (totem e painel)
  css/estilo.css        estilo, alto contraste, celular, impressão
  fontes/               Atkinson Hyperlegible Next (licença OFL)
  js/config.js          ajustes da instalação: PIN, nome do totem, tempos
  js/dados.js           perguntas, opções, pesos de risco, níveis
  js/regras.js          classificação de risco e ordem da fila (sem DOM)
  js/armazenamento.js   onde as triagens ficam (localStorage)
  js/interface.js       troca de tela, voz, acessibilidade, diálogos
  js/paciente.js        o fluxo do totem
  js/equipe.js          o painel e a ficha
  js/app.js             liga tudo
  testes/               testes da classificação (node --test)
Docs/                   esta documentação
Criativo/               assets (vazio — pictogramas entram aqui na fase 3)
```

Para mudar uma pergunta ou opção, mexa só em
[dados.js](../Codigo/js/dados.js). As instruções estão no
[catálogo de opções](03-catalogo-de-opcoes.md#como-adicionar-ou-mudar-uma-opção).
Para mudar PIN, nome do totem ou tempos, mexa em
[config.js](../Codigo/js/config.js).

## Testes

Na raiz do projeto, com Node 22 ou mais novo:

```
node --test "Codigo/testes/*.test.js"
```

Cobrem a classificação de risco, as opções exclusivas, a ordem da fila, o
tempo-alvo e a integridade do catálogo.

## Aviso importante

Este é um MVP para validação. A classificação de risco não foi validada
clinicamente e o sistema não substitui a avaliação de um profissional de
saúde. As pendências regulatórias (LGPD, possível enquadramento ANVISA)
estão listadas no [roadmap](05-roadmap.md).

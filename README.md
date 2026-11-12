# Mãos Que Falam

Triagem hospitalar por apontamento, para pacientes que não conseguem se
comunicar com clareza na entrada do atendimento.

O paciente responde a poucas perguntas tocando em figuras grandes — sem
depender de fala, escrita ou da presença de um intérprete. A equipe recebe,
numa fila ordenada por risco, uma ficha com a queixa, uma prioridade sugerida
e, em destaque, **como falar com aquele paciente**.

## Rodar

Abra [Codigo/index.html](Codigo/index.html) no navegador. Sem instalação, sem
servidor, funciona offline.

- Totem do paciente: `index.html`
- Painel da equipe: `index.html#/equipe` (PIN padrão `1234`)

Abra os dois em abas do mesmo navegador para ver um atualizar o outro.

## Testes

```
node --test "Codigo/testes/*.test.js"
```

## Documentação

Comece pelo [índice da documentação](Docs/README.md), que tem também um
roteiro de demonstração de 4 minutos.

- [Visão geral](Docs/01-visao-geral.md) — o problema e a proposta
- [Fluxo de telas](Docs/02-fluxo-de-telas.md)
- [Catálogo de opções](Docs/03-catalogo-de-opcoes.md)
- [Classificação de risco](Docs/04-classificacao-de-risco.md)
- [Roadmap](Docs/05-roadmap.md)

## Estrutura do projeto

- `Codigo/` — o app, em HTML, CSS e JavaScript puro
- `Criativo/` — assets criativos (pictogramas, vídeos em Libras)
- `Docs/` — documentação do projeto

## Estado atual

MVP para sessões de validação. Não tem back-end; os dados ficam no navegador.
A classificação de risco **não foi validada clinicamente** — não deve ser
usada em atendimento real. As pendências estão no [roadmap](Docs/05-roadmap.md).

A fonte [Atkinson Hyperlegible Next](https://github.com/googlefonts/atkinson-hyperlegible-next)
é distribuída sob a SIL Open Font License ([Codigo/fontes/OFL.txt](Codigo/fontes/OFL.txt)).

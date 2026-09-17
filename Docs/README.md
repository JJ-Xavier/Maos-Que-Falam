# Documentação — Mãos Que Falam

Triagem por apontamento para pacientes com dificuldade de comunicação.

## Índice

| Documento | O que tem dentro |
|---|---|
| [01 — Visão geral](01-visao-geral.md) | O problema, a proposta, princípios de design |
| [02 — Fluxo de telas](02-fluxo-de-telas.md) | Mapa do fluxo e detalhe de cada uma das 12 telas |
| [03 — Catálogo de opções](03-catalogo-de-opcoes.md) | Toda opção de toda tela, com pesos e ícones |
| [04 — Classificação de risco](04-classificacao-de-risco.md) | Os 5 níveis, a regra de cálculo e as limitações |
| [05 — Roadmap](05-roadmap.md) | Fases, próximos passos e decisões em aberto |

## Como rodar o protótipo

Abra [Codigo/index.html](../Codigo/index.html) em qualquer navegador. Não
precisa instalar nada, não precisa de servidor, funciona offline.

## Roteiro sugerido para demonstração

Cerca de 3 minutos:

1. **Tela inicial** — mostre os três controles de acessibilidade do topo.
   Ative o alto contraste e a letra maior; deixe ligado por alguns segundos
   para mostrar que a interface continua usável.
2. **Botão de emergência** — clique no botão vermelho. Ele registra o paciente
   como Vermelho/Emergência sem fazer pergunta nenhuma. Isso mostra que o
   sistema tem uma saída para quem não consegue responder.
3. **Nova triagem** e percorra o fluxo completo, marcando "Uso Libras" na tela
   de comunicação e "Falta de ar" nos sintomas. São as duas escolhas que
   demonstram melhor o resultado.
4. **Tela de confirmação** — senha gerada e previsão de espera.
5. **"Ver a ficha gerada"** — aqui está o valor do projeto: o alerta laranja
   "Chamar intérprete de Libras" no topo, a faixa vermelha com o motivo da
   classificação e a queixa organizada por blocos.
6. **Painel da equipe** — faça uma segunda triagem leve (tosse, dor 2/10) e
   volte ao painel para mostrar que o caso grave fica acima do leve na fila,
   independentemente da ordem de chegada.

## Estrutura dos arquivos

```
Codigo/
  index.html          todas as telas
  css/estilo.css      estilo, alto contraste, impressão
  js/dados.js         perguntas, opções, pesos de risco, níveis
  js/app.js           navegação, classificação, painel, ficha
Docs/                 esta documentação
Criativo/             assets (vazio — pictogramas entram aqui na fase 3)
```

Para mudar qualquer pergunta ou opção, mexa só em
[dados.js](../Codigo/js/dados.js). As instruções estão no
[catálogo de opções](03-catalogo-de-opcoes.md#como-adicionar-ou-mudar-uma-opção).

## Aviso importante

Este é um protótipo de validação de conceito. A classificação de risco não foi
validada clinicamente e o sistema não substitui a avaliação de um profissional
de saúde. As pendências regulatórias (LGPD, possível enquadramento ANVISA)
estão listadas no [roadmap](05-roadmap.md).

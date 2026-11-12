# Classificação de risco

> **Aviso.** A lógica descrita aqui é uma aproximação feita para o protótipo,
> montada para demonstrar o mecanismo. Ela **não foi validada clinicamente** e
> não deve ser usada em atendimento real sem revisão e homologação por
> profissionais de saúde da instituição.

## Os cinco níveis

As cores e os tempos seguem o Protocolo de Manchester, que é o mais usado na
rede brasileira. Isso é proposital: a equipe já conhece esse vocabulário e não
precisa aprender uma escala nova.

| Nível | Cor | Classificação | Tempo-alvo |
|---|---|---|---|
| 5 | 🔴 Vermelho | Emergência | Imediato |
| 4 | 🟠 Laranja | Muito urgente | Até 10 min |
| 3 | 🟡 Amarelo | Urgente | Até 60 min |
| 2 | 🟢 Verde | Pouco urgente | Até 120 min |
| 1 | 🔵 Azul | Não urgente | Até 240 min |

## A regra

O nível final é **o maior nível entre todas as respostas marcadas**.

Um exemplo. Paciente que marca:

- Sintomas: "Tosse" (nível 2) e "Falta de ar" (nível 5)
- Intensidade: "Ruim", 6/10 (nível 3)
- Tempo: "Hoje" (nível 3)

O resultado é **nível 5 — Vermelho**, puxado pela falta de ar. Os demais
níveis não diluem o maior.

A escolha é deliberadamente conservadora. Numa triagem, os dois erros
possíveis não têm o mesmo custo: classificar acima da prioridade real gasta
recurso da equipe; classificar abaixo pode custar a vida do paciente. O
protótipo erra sempre para o lado seguro.

A regra está em [regras.js](../Codigo/js/regras.js) e é coberta por testes
automáticos ([regras.test.js](../Codigo/testes/regras.test.js)). Para rodar,
na raiz do projeto, com Node 22 ou mais novo:

```
node --test "Codigo/testes/*.test.js"
```

## O botão de ajuda

"Preciso de ajuda agora" (na tela inicial) e "Ajuda agora" (no topo das
outras telas) põem o paciente na fila como **vermelho** na hora, com o motivo
"Tocou em Preciso de ajuda agora". Se o paciente continuar respondendo, as
respostas são anexadas à mesma ficha, que continua vermelha.

## Motivos da classificação

A ficha não mostra apenas a cor — mostra por que chegou nela. Os motivos são
**as respostas que têm exatamente o nível final**, ou seja, as que puxaram a
cor para onde ela está:

```
Laranja · Muito urgente
O sistema considerou: Sangramento; Dor ou desconforto 8/10
```

Isso existe porque uma prioridade sem justificativa é difícil de contestar, e
o enfermeiro precisa poder discordar do sistema com base em algo concreto.

Na lista de respostas da ficha, as que sozinhas já levam a laranja ou
vermelho ganham contorno escuro.

## A equipe decide

O sistema **sugere**; o enfermeiro **decide**. Na ficha, a equipe pode:

- **confirmar** a cor sugerida, ou
- **mudar** para outra, com um motivo opcional ("Saturação 88%").

A cor da equipe passa a valer para a fila. A ficha mostra as duas ("Definida
pela equipe. O sistema tinha sugerido Amarelo"), e o histórico registra a
mudança. Dá para voltar à sugestão do sistema.

A exportação CSV traz as duas colunas, `prioridade_sistema` e
`prioridade_equipe`. Isso permite medir, nas sessões de validação, quantas
vezes o enfermeiro concordou com o sistema — o dado mais importante para
saber se a regra presta.

## O paciente não vê a cor

A tela final do totem mostra só a senha e o que a equipe recebeu, nunca a cor
nem a previsão de espera. Motivos:

1. a cor ainda não foi confirmada por ninguém;
2. "Não urgente — até 240 min" pode fazer alguém com um problema sério ir
   embora;
3. quem vê que "falta de ar" dá vermelho aprende a marcar falta de ar.

## Alertas de comunicação

Separados da classificação de risco, e por um motivo: eles não dizem quão
grave o paciente está, dizem **como falar com ele**.

A resposta de comunicação aparece sempre no topo da ficha, com uma orientação
prática. Algumas opções também geram um alerta que aparece no cartão da fila:

| Situação | Alerta |
|---|---|
| Marcou "Uso Libras" | Chamar intérprete de Libras |
| Marcou "Não consigo falar" | Paciente não verbal |
| Marcou "Tenho alergia" | Relata alergia |
| Marcou "Estou grávida" | Gestante |

## Ordem da fila

O painel ordena por:

1. nível de risco, do maior para o menor (a cor da equipe, se houver;
   senão, a do sistema);
2. em caso de empate, ordem de chegada (mais antigo primeiro).

A fila **não reordena por tempo de espera** — um paciente verde não "sobe"
por esperar muito. Em vez disso, quem passa do tempo-alvo da sua cor ganha
borda vermelha e o aviso "Passou do tempo-alvo". A decisão de reavaliar fica
com a equipe.

## Limitações conhecidas

1. **Sem sinais vitais.** Um protocolo de triagem real usa pressão, saturação,
   frequência cardíaca e temperatura medidas. O protótipo só tem o que o
   paciente relata.
2. **Regra de máximo é grosseira.** Protocolos reais usam fluxogramas por
   queixa principal, com combinações de sintomas — não um único valor máximo.
3. **Sem combinação de sintomas.** "Aperto no peito" + "Falta de ar" juntos são
   mais graves que cada um isolado, e o protótipo não representa isso.
4. **Sem pediatria.** Critérios de triagem para criança são diferentes dos de
   adulto; aqui a faixa etária só é registrada.
5. **Reavaliação só visual.** O painel avisa quando alguém passa do
   tempo-alvo, mas não há rotina de reavaliação.
6. **A escala de dor não é validada.** As carinhas se inspiram na escala
   Wong-Baker, mas não são a escala original nem a Faces Pain Scale-Revised.
   Ambas têm restrição de uso; uma implementação real precisa resolver o
   licenciamento ou adotar uma alternativa aberta.

### Pontos para a revisão clínica

Dois pesos tendem a supertriar e merecem atenção de quem for revisar:

- **"Começou agora, há pouco" vale laranja sozinho.** Um corte pequeno que
  acabou de acontecer vira "muito urgente". Talvez o tempo devesse modular
  outros sintomas, e não definir um piso.
- **Dor 10/10 vale vermelho sozinha.** No Manchester, dor intensa costuma ser
  laranja.

Com a regra do máximo, pesos altos demais lotam as cores de cima e a fila
perde o sentido. Os pesos estão todos em [dados.js](../Codigo/js/dados.js).

Nenhuma dessas limitações impede a demonstração do conceito — mas todas
precisam ser endereçadas antes de qualquer piloto com paciente de verdade.

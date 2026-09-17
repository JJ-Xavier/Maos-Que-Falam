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

## O atalho de emergência

O botão vermelho da tela inicial ignora toda a lógica: registra nível 5
imediatamente, com o motivo "Botão de emergência acionado pelo paciente", sem
nenhuma pergunta. É o caminho para quem não tem condição de responder nada.

## Motivos da classificação

A ficha não mostra apenas a cor — mostra por que chegou nela. Toda resposta
que atribuiu nível 4 ou 5 entra numa lista de motivos exibida no topo da
ficha:

```
MQF-003 — Laranja · Muito urgente
Atendimento previsto: Até 10 min · Sangramento | Dor relatada 8/10
```

Isso existe porque uma prioridade sem justificativa é difícil de contestar, e
o enfermeiro precisa poder discordar do sistema com base em algo concreto.

## Alertas de comunicação

Separados da classificação de risco, e por um motivo: eles não dizem quão
grave o paciente está, dizem **como falar com ele**. Aparecem em destaque
laranja no topo da ficha.

| Situação | Alerta |
|---|---|
| Marcou "Uso Libras" | Chamar intérprete de Libras |
| Marcou "Não consigo falar" | Paciente não verbal |
| Marcou "Tenho alergia" | Paciente relata alergia |
| Marcou "Estou grávida" | Gestante |

## Ordenação da fila

O painel da equipe ordena por:

1. nível de risco, do maior para o menor;
2. em caso de empate, ordem de chegada (mais antigo primeiro).

Não há reordenação por tempo de espera — um paciente verde não "sobe" a fila
por esperar muito. Isso é uma limitação conhecida do protótipo e está no
[roadmap](05-roadmap.md).

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
5. **Sem reavaliação.** Paciente que espera precisa ser reavaliado
   periodicamente; não há esse conceito no protótipo.
6. **A escala de dor não é validada.** As carinhas se inspiram na escala
   Wong-Baker, mas não são a escala original nem a Faces Pain Scale-Revised.
   Ambas têm restrição de uso; uma implementação real precisa resolver o
   licenciamento ou adotar uma alternativa aberta.

Nenhuma dessas limitações impede a demonstração do conceito — mas todas
precisam ser endereçadas antes de qualquer piloto com paciente de verdade.

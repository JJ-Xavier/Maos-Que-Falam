# Catálogo de opções

Todas as opções de todas as telas estão em um único arquivo,
[dados.js](../Codigo/js/dados.js). Dá para alterar pergunta, opção, ícone ou
peso de risco sem tocar na lógica do aplicativo. A coluna **Nível** é o nível
de risco que aquela opção atribui (ver [classificação](04-classificacao-de-risco.md)).

## Faixa etária

| Ícone | Opção | Nível |
|---|---|---|
| 🧒 | Criança | — |
| 🧑 | Adulto | — |
| 🧓 | Idoso | 3 |

## Como você prefere se comunicar? (escolha única)

| Ícone | Opção | Alerta gerado na ficha |
|---|---|---|
| 👆 | Aponto nas figuras | — |
| 🤟 | Uso Libras | Chamar intérprete de Libras |
| ✍️ | Prefiro escrever | — |
| 🧑‍🤝‍🧑 | Tenho acompanhante | — |
| 🗣️ | Falo, mas com dificuldade | — |
| 🤐 | Não consigo falar | Paciente não verbal |

## Onde está o problema? (múltipla)

Regiões do boneco clicável:

| Região | Nível |
|---|---|
| Cabeça | — |
| Garganta / pescoço | — |
| **Peito** | **4** |
| Barriga | — |
| Braço esquerdo | — |
| Braço direito | — |
| Perna esquerda | — |
| Perna direita | — |

Regiões oferecidas como botões extras: 👁️ Olhos · 👂 Ouvido · 🦷 Boca/dente ·
🔄 Costas · 🩹 Pele · 🚻 Região íntima · 🧍 O corpo todo · ❓ Não sei dizer.

## O que você está sentindo? (múltipla)

| Ícone | Opção | Nível |
|---|---|---|
| ⚡ | Convulsão | 5 |
| 😮‍💨 | Falta de ar | 5 |
| 💔 | Aperto no peito | 5 |
| 🩸 | Sangramento | 4 |
| 😵 | Desmaiei | 4 |
| 🌀 | Confusão mental | 4 |
| 🌡️ | Febre | 3 |
| 💫 | Tontura | 3 |
| 🤕 | Caí / me machuquei | 3 |
| 🪫 | Fraqueza / sem força | 3 |
| 🤢 | Vômito / náusea | 2 |
| 🚽 | Diarreia | 2 |
| 😷 | Tosse | 2 |
| 🫧 | Inchaço | 2 |
| 🐞 | Coceira / manchas | 2 |
| 😰 | Angústia / nervosismo | 2 |
| 😣 | Dor | — |
| ➕ | Outra coisa | — |

"Dor" não tem nível próprio porque a gravidade dela vem da escala de
intensidade, na tela seguinte.

## O quanto está ruim? (escolha única)

| Carinha | Rótulo | Valor | Nível |
|---|---|---|---|
| 😀 | Nada | 0/10 | 1 |
| 🙂 | Pouco | 2/10 | 2 |
| 😐 | Mais ou menos | 4/10 | 3 |
| 😟 | Ruim | 6/10 | 3 |
| 😣 | Muito ruim | 8/10 | 4 |
| 😭 | Insuportável | 10/10 | 5 |

## Começou quando? (escolha única)

| Ícone | Opção | Nível |
|---|---|---|
| ⏱️ | Agora, há pouco | 4 |
| ☀️ | Hoje | 3 |
| 📅 | Alguns dias | 2 |
| 🗓️ | Semanas ou mais | 1 |
| ❓ | Não sei | — |

## Tem algo importante para a equipe saber? (múltipla)

| Ícone | Opção | Nível | Alerta |
|---|---|---|---|
| 💊 | Tomo medicamento | — | — |
| ⚠️ | Tenho alergia | — | Paciente relata alergia |
| 🩸 | Diabetes | — | — |
| 📈 | Pressão alta | — | — |
| ❤️ | Problema no coração | 3 | — |
| 🤰 | Estou grávida | 3 | Gestante |
| ⚡ | Epilepsia | — | — |
| 🏥 | Cirurgia recente | 3 | — |
| 🚫 | Nada disso | — | *opção exclusiva* |

## Precisa de alguma coisa agora? (múltipla)

| Ícone | Opção |
|---|---|
| 💧 | Água |
| 🚻 | Banheiro |
| 🛏️ | Deitar / sentar |
| 🦽 | Cadeira de rodas |
| 🥶 | Estou com frio |
| 📞 | Chamar minha família |
| 😨 | Estou com medo |
| 👌 | Não preciso de nada *(exclusiva)* |

Nenhuma dessas opções altera a classificação de risco. Elas existem para a
equipe resolver o desconforto durante a espera.

## Sobre os ícones

O protótipo usa emoji porque não exige nenhum arquivo externo e funciona
offline. **Não é a escolha para produção**: emoji tem desenho diferente em cada
sistema operacional e alguns não são reconhecíveis por quem usa comunicação
alternativa.

Na versão real, os ícones devem vir de um banco de pictogramas validado para
Comunicação Aumentativa e Alternativa (CAA) — o ARASAAC é o candidato natural,
por ser gratuito, ter licença aberta e conter vocabulário em português.

## Como adicionar ou mudar uma opção

Em [dados.js](../Codigo/js/dados.js), localize o passo no array `PASSOS` e
acrescente um objeto ao `opcoes`:

```js
{
  id: 'identificador-unico',   // obrigatório, sem espaços
  rotulo: 'Texto que aparece',  // obrigatório
  icone: '🩺',                  // opcional
  nivel: 4,                     // opcional — nível de risco de 1 a 5
  alerta: 'Texto do alerta',    // opcional — aparece em destaque na ficha
  exclusiva: true,              // opcional — limpa as demais quando marcada
}
```

Nenhuma outra alteração é necessária: a tela, a ficha e a classificação de
risco passam a considerar a opção nova automaticamente.

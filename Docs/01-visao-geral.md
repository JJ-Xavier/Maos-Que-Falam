# Visão geral — Mãos Que Falam

## O problema

Na entrada de um pronto-atendimento, a triagem depende quase toda da fala: o
paciente precisa explicar o que sente, onde dói, desde quando. Quem não
consegue se comunicar com clareza fica em desvantagem exatamente no momento em
que a informação é mais crítica.

Isso afeta um grupo grande e variado de pessoas:

- surdos e pessoas com deficiência auditiva;
- pessoas com afasia, disartria ou sequela de AVC;
- pessoas com autismo, deficiência intelectual ou em crise de ansiedade;
- idosos com demência;
- pacientes intubados, com trauma facial ou dor intensa;
- estrangeiros e indígenas que não falam português;
- crianças pequenas.

O resultado prático é o mesmo em todos os casos: a triagem demora mais, a
informação chega incompleta e o risco de classificar o paciente abaixo da
prioridade real aumenta.

## A proposta

Uma tela de autotriagem por apontamento. O paciente responde a poucas
perguntas tocando em figuras grandes, sem depender de fala, escrita ou de um
intérprete estar disponível no momento. Ao final, o sistema gera:

1. uma **ficha visual** com o que o paciente indicou;
2. uma **classificação de risco** preliminar;
3. **alertas de comunicação** para a equipe (por exemplo "paciente usa Libras
   — chamar intérprete", "paciente não verbal");
4. uma **senha** e o posicionamento numa fila ordenada por risco.

Quando o médico ou o enfermeiro recebe esse paciente, já sabe o que ele
precisa e como falar com ele.

## O que o sistema é e o que não é

**É** um instrumento de apoio à triagem: organiza e transmite a queixa do
paciente para a equipe.

**Não é** um sistema de diagnóstico e não substitui a avaliação do profissional
de saúde. A classificação gerada é uma sugestão de prioridade; a decisão final
é sempre do enfermeiro de triagem.

## Princípios de design

Estas são as regras que guiam cada decisão de interface:

1. **Nenhuma pergunta obrigatória.** Todo passo pode ser pulado. Um paciente
   que trava numa pergunta não pode ficar preso na tela.
2. **Um toque por tela, sempre que possível.** Em perguntas de escolha única a
   tela avança sozinha após o toque.
3. **Cor nunca é a única informação.** Todo elemento colorido também tem ícone
   e texto, por causa de daltonismo e de alto contraste.
4. **Alvos de toque grandes.** Mínimo de 96px de altura, porque o paciente
   pode estar com dor, tremendo ou com a destreza reduzida.
5. **Conservador no risco.** Na dúvida, a classificação sobe de prioridade.
   Subestimar risco é o erro mais caro numa triagem.
6. **Saída de emergência sempre visível.** Um botão vermelho na tela inicial
   registra o paciente como emergência imediatamente, sem nenhuma pergunta.

## Estado atual

Protótipo navegável em HTML, CSS e JavaScript puro, sem back-end. Serve para
validar o fluxo, o vocabulário das opções e a lógica de classificação antes de
escrever a aplicação de verdade.

Os dados ficam no `localStorage` do navegador. Nada é enviado para nenhum
servidor.

# Fluxo de telas

## Mapa geral

```
                        ┌─────────────────────┐
                        │  1. TELA INICIAL    │
                        │  (modo quiosque)    │
                        └──────┬───────┬──────┘
             ┌─────────────────┘       └──────────────┐
             │                                        │
   [Toque para começar]                    [🚨 AJUDA AGORA]
             │                                        │
             ▼                                        │
   ┌─────────────────────┐                            │
   │ 2. IDENTIFICAÇÃO    │                            │
   │ nome + faixa etária │                            │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 3. COMUNICAÇÃO      │  como você prefere         │
   │                     │  se comunicar?             │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 4. LOCAL DA QUEIXA  │  boneco clicável           │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 5. SINTOMAS         │  múltipla escolha          │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 6. INTENSIDADE      │  escala de carinhas 0-10   │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 7. TEMPO            │  começou quando?           │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 8. HISTÓRICO        │  alergia, gestação, etc.   │
   └──────────┬──────────┘                            │
              ▼                                        │
   ┌─────────────────────┐                            │
   │ 9. NECESSIDADES     │  água, banheiro, medo...   │
   └──────────┬──────────┘                            │
              │                                        │
              ▼                                        ▼
        ┌─────────────────────────────────────────────────┐
        │  CLASSIFICAÇÃO DE RISCO  (automática)           │
        └────────────────────┬────────────────────────────┘
                             ▼
        ┌─────────────────────────────────────────────────┐
        │ 10. CONFIRMAÇÃO — senha + previsão de espera    │
        └────────────────────┬────────────────────────────┘
                             ▼
        ┌─────────────────────────────────────────────────┐
        │ 11. PAINEL DA EQUIPE — fila ordenada por risco  │
        └────────────────────┬────────────────────────────┘
                             ▼
        ┌─────────────────────────────────────────────────┐
        │ 12. FICHA DE TRIAGEM — detalhe + impressão      │
        └─────────────────────────────────────────────────┘
```

O painel da equipe (11) também é acessível direto da tela inicial, pelo link
discreto no rodapé — no produto final isso estaria protegido por login.

## Detalhe de cada tela

### 1. Tela inicial

Fica permanentemente ligada no totem da recepção. Três saídas:

| Elemento | Ação |
|---|---|
| Botão gigante "Toque aqui para começar" | Inicia a triagem |
| Botão vermelho "PRECISO DE AJUDA AGORA" | Registra emergência imediata, sem perguntas |
| Link "Sou da equipe" | Abre o painel de atendimento |

A barra do topo, presente em todas as telas, tem três controles de
acessibilidade: **letra maior** (cicla 1x → 1,2x → 1,45x), **alto contraste**
(preto e amarelo) e **ouvir** (lê a pergunta em voz alta via síntese de voz do
navegador).

### 2. Identificação

Campo de nome opcional e três botões de faixa etária (criança, adulto, idoso).
Deliberadamente leve: quem não consegue ou não quer informar segue adiante.
A faixa "idoso" eleva o piso de prioridade.

### 3. Comunicação

A pergunta mais importante do fluxo, e por isso é a primeira. Define como a
equipe vai abordar o paciente e dispara alertas na ficha.

### 4. Local da queixa

Boneco em SVG com oito regiões clicáveis (cabeça, garganta, peito, barriga,
dois braços, duas pernas) mais oito botões para regiões que o boneco não
representa bem (olhos, ouvido, boca, costas, pele, região íntima, corpo todo,
não sei dizer). Aceita múltipla seleção. As regiões do boneco também são
acessíveis por teclado (Tab + Enter).

### 5. Sintomas

Grade de 18 opções em múltipla escolha. É aqui que mora a maior parte do peso
de risco.

### 6. Intensidade

Escala de seis carinhas mapeadas para 0, 2, 4, 6, 8 e 10. Seis passos em vez
de onze porque discriminar "7 ou 8" é difícil até para quem fala.

### 7. Tempo

Escolha única. Início súbito ("agora, há pouco") eleva a prioridade;
sintoma de semanas a reduz.

### 8. Histórico

Múltipla escolha com nove opções, incluindo uma exclusiva ("Nada disso") que
limpa as demais quando marcada.

### 9. Necessidades imediatas

A única tela que não é sobre a doença. Água, banheiro, deitar, cadeira de
rodas, frio, chamar a família, medo. Não altera a classificação de risco, mas
vai para a ficha — é o que transforma a espera em algo humano.

### 10. Confirmação

Senha no formato `MQF-001`, nível de prioridade com a cor correspondente e
previsão de espera.

### 11. Painel da equipe

Cartões ordenados por risco decrescente; empate resolvido por ordem de
chegada. Cada cartão traz senha, nome, resumo das três primeiras queixas,
horário e etiqueta colorida do nível.

### 12. Ficha de triagem

Detalhe completo de uma triagem: faixa de risco no topo com os motivos da
classificação, alertas em destaque, identificação e um bloco por pergunta
respondida. Tem folha de estilo de impressão, para anexar ao prontuário de
papel.

## Regras de navegação

- **Escolha única avança sozinha** após 200ms — o paciente toca uma vez e a
  tela muda.
- **Múltipla escolha exige "Continuar"**, porque o sistema não tem como saber
  quando o paciente terminou de marcar.
- **"Não sei / pular"** existe em todos os passos e apaga a resposta daquele
  passo antes de avançar.
- **"Voltar"** no primeiro passo retorna à identificação, não à tela inicial,
  para não perder o preenchimento.

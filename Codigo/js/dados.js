/*
 * dados.js — catálogo de conteúdo da triagem.
 *
 * Toda a estrutura das telas vive aqui. Dá para mudar perguntas, opções e
 * pesos de risco sem mexer na lógica do app.
 *
 * Campos de uma opção:
 *   id          obrigatório, único dentro do passo
 *   rotulo      obrigatório, texto que o paciente vê
 *   icone       opcional
 *   detalhe     opcional, texto menor abaixo do rótulo
 *   nivel       opcional, nível de risco de 1 a 5
 *   motivo      opcional, texto do motivo na ficha (padrão: o rótulo)
 *   alerta      opcional, aparece em destaque na ficha e no painel
 *   orientacao  opcional, só em "comunicação": como a equipe deve abordar
 *   exclusiva   opcional, limpa as demais quando marcada
 *
 * Níveis de risco (baseados no Protocolo de Manchester):
 *   5 = vermelho  -> emergência, atendimento imediato
 *   4 = laranja   -> muito urgente, até 10 min
 *   3 = amarelo   -> urgente, até 60 min
 *   2 = verde     -> pouco urgente, até 120 min
 *   1 = azul      -> não urgente, até 240 min
 */

const NIVEIS = {
  5: { nome: 'Vermelho', rotulo: 'Emergência', espera: 'Imediato', alvoMin: 0, cor: '#C4122F', corTexto: '#FFFFFF' },
  4: { nome: 'Laranja', rotulo: 'Muito urgente', espera: 'Até 10 min', alvoMin: 10, cor: '#EE7A1A', corTexto: '#1A2238' },
  3: { nome: 'Amarelo', rotulo: 'Urgente', espera: 'Até 60 min', alvoMin: 60, cor: '#F5C518', corTexto: '#1A2238' },
  2: { nome: 'Verde', rotulo: 'Pouco urgente', espera: 'Até 120 min', alvoMin: 120, cor: '#17773A', corTexto: '#FFFFFF' },
  1: { nome: 'Azul', rotulo: 'Não urgente', espera: 'Até 240 min', alvoMin: 240, cor: '#1D5FC4', corTexto: '#FFFFFF' },
};

const FAIXAS_ETARIAS = [
  { id: 'crianca', rotulo: 'Criança', detalhe: 'Até 12 anos', icone: '🧒' },
  { id: 'adulto', rotulo: 'Adulto', detalhe: '13 a 59 anos', icone: '🧑' },
  { id: 'idoso', rotulo: 'Idoso', detalhe: '60 anos ou mais', icone: '🧓', nivel: 3, motivo: 'Paciente idoso (60+)' },
];

/* Partes do corpo desenhadas no boneco da tela de localização. */
const PARTES_CORPO = [
  { id: 'cabeca', rotulo: 'Cabeça' },
  { id: 'garganta', rotulo: 'Garganta / pescoço' },
  { id: 'peito', rotulo: 'Peito', nivel: 4 },
  { id: 'barriga', rotulo: 'Barriga' },
  { id: 'braco-d', rotulo: 'Braço direito' },
  { id: 'braco-e', rotulo: 'Braço esquerdo' },
  { id: 'perna-d', rotulo: 'Perna direita' },
  { id: 'perna-e', rotulo: 'Perna esquerda' },
];

/* Regiões que não aparecem bem no boneco, oferecidas como botões extras. */
const PARTES_EXTRAS = [
  { id: 'olhos', rotulo: 'Olhos', icone: '👁️' },
  { id: 'ouvido', rotulo: 'Ouvido', icone: '👂' },
  { id: 'boca', rotulo: 'Boca / dente', icone: '🦷' },
  { id: 'costas', rotulo: 'Costas', icone: '🔄' },
  { id: 'pele', rotulo: 'Pele', icone: '🩹' },
  { id: 'intimo', rotulo: 'Região íntima', icone: '🚻' },
  { id: 'corpo-todo', rotulo: 'O corpo todo', icone: '🧍' },
  { id: 'nao-sei-onde', rotulo: 'Não sei dizer', icone: '❓', exclusiva: true },
];

const PASSOS = [
  {
    id: 'comunicacao',
    resumo: 'Comunicação',
    titulo: 'Como você prefere se comunicar?',
    ajuda: 'Toque em uma opção. Assim a equipe fala com você do jeito certo.',
    tipo: 'unica',
    opcoes: [
      { id: 'figuras', rotulo: 'Aponto nas figuras', icone: '👆',
        orientacao: 'Comunica-se apontando. Use figuras e perguntas de sim ou não.' },
      { id: 'libras', rotulo: 'Uso Libras', icone: '🤟', alerta: 'Chamar intérprete de Libras',
        orientacao: 'Usa Libras. Chame um intérprete antes de começar o atendimento.' },
      { id: 'escrita', rotulo: 'Prefiro escrever', icone: '✍️',
        orientacao: 'Prefere escrever. Ofereça papel e caneta.' },
      { id: 'acompanhante', rotulo: 'Tenho acompanhante', icone: '🧑‍🤝‍🧑',
        orientacao: 'Tem acompanhante que ajuda na comunicação. Confirme as respostas com o paciente.' },
      { id: 'voz-baixa', rotulo: 'Falo, mas com dificuldade', icone: '🗣️',
        orientacao: 'Fala com dificuldade. Dê tempo para responder e repita o que entendeu.' },
      { id: 'nao-falo', rotulo: 'Não consigo falar', icone: '🤐', alerta: 'Paciente não verbal',
        orientacao: 'Não consegue falar. Use perguntas de sim ou não e figuras.' },
    ],
  },
  {
    id: 'local',
    resumo: 'Onde',
    titulo: 'Onde está o problema?',
    ajuda: 'Toque no corpo ou nos botões. Pode marcar mais de um lugar.',
    tipo: 'corpo',
  },
  {
    id: 'sintomas',
    resumo: 'Sintomas',
    titulo: 'O que você está sentindo?',
    ajuda: 'Pode marcar mais de uma opção.',
    tipo: 'multipla',
    opcoes: [
      { id: 'dor', rotulo: 'Dor', icone: '😣' },
      { id: 'febre', rotulo: 'Febre', icone: '🌡️', nivel: 3 },
      { id: 'falta-ar', rotulo: 'Falta de ar', icone: '😮‍💨', nivel: 5 },
      { id: 'dor-peito', rotulo: 'Aperto no peito', icone: '💔', nivel: 5 },
      { id: 'sangramento', rotulo: 'Sangramento', icone: '🩸', nivel: 4 },
      { id: 'desmaio', rotulo: 'Desmaiei', icone: '😵', nivel: 4 },
      { id: 'convulsao', rotulo: 'Convulsão', icone: '⚡', nivel: 5 },
      { id: 'tontura', rotulo: 'Tontura', icone: '💫', nivel: 3 },
      { id: 'vomito', rotulo: 'Vômito / náusea', icone: '🤢', nivel: 2 },
      { id: 'diarreia', rotulo: 'Diarreia', icone: '🚽', nivel: 2 },
      { id: 'tosse', rotulo: 'Tosse', icone: '😷', nivel: 2 },
      { id: 'queda', rotulo: 'Caí / me machuquei', icone: '🤕', nivel: 3 },
      { id: 'inchaco', rotulo: 'Inchaço', icone: '🫧', nivel: 2 },
      { id: 'coceira', rotulo: 'Coceira / manchas', icone: '🐞', nivel: 2 },
      { id: 'confusao', rotulo: 'Confusão mental', icone: '🌀', nivel: 4 },
      { id: 'sem-forca', rotulo: 'Fraqueza / sem força', icone: '🪫', nivel: 3 },
      { id: 'ansiedade', rotulo: 'Angústia / nervosismo', icone: '😰', nivel: 2 },
      { id: 'outro', rotulo: 'Outra coisa', icone: '➕' },
    ],
  },
  {
    id: 'intensidade',
    resumo: 'Intensidade',
    titulo: 'O quanto está ruim?',
    ajuda: 'Toque na carinha que combina com o que você sente.',
    tipo: 'escala',
  },
  {
    id: 'tempo',
    resumo: 'Começou',
    titulo: 'Começou quando?',
    ajuda: 'Toque em uma opção.',
    tipo: 'unica',
    opcoes: [
      { id: 'agora', rotulo: 'Agora, há pouco', icone: '⏱️', nivel: 4, motivo: 'Começou agora, há pouco' },
      { id: 'hoje', rotulo: 'Hoje', icone: '☀️', nivel: 3, motivo: 'Começou hoje' },
      { id: 'dias', rotulo: 'Alguns dias', icone: '📅', nivel: 2, motivo: 'Começou há alguns dias' },
      { id: 'semanas', rotulo: 'Semanas ou mais', icone: '🗓️', nivel: 1, motivo: 'Começou há semanas ou mais' },
      { id: 'nao-sei-quando', rotulo: 'Não sei', icone: '❓' },
    ],
  },
  {
    id: 'historico',
    resumo: 'Saúde',
    titulo: 'Tem algo importante para a equipe saber?',
    ajuda: 'Pode marcar mais de uma opção. Se não tiver, toque em "Nada disso".',
    tipo: 'multipla',
    opcoes: [
      { id: 'medicamento', rotulo: 'Tomo medicamento', icone: '💊' },
      { id: 'alergia', rotulo: 'Tenho alergia', icone: '⚠️', alerta: 'Relata alergia' },
      { id: 'diabetes', rotulo: 'Diabetes', icone: '🩸' },
      { id: 'pressao', rotulo: 'Pressão alta', icone: '📈' },
      { id: 'coracao', rotulo: 'Problema no coração', icone: '❤️', nivel: 3 },
      { id: 'gestante', rotulo: 'Estou grávida', icone: '🤰', nivel: 3, alerta: 'Gestante', motivo: 'Gestante' },
      { id: 'epilepsia', rotulo: 'Epilepsia', icone: '⚡' },
      { id: 'cirurgia', rotulo: 'Cirurgia recente', icone: '🏥', nivel: 3 },
      { id: 'nada-disso', rotulo: 'Nada disso', icone: '🚫', exclusiva: true },
    ],
  },
  {
    id: 'necessidades',
    resumo: 'Pedidos',
    titulo: 'Precisa de alguma coisa agora?',
    ajuda: 'Não é sobre a doença. É sobre o seu conforto enquanto espera.',
    tipo: 'multipla',
    opcoes: [
      { id: 'agua', rotulo: 'Água', icone: '💧' },
      { id: 'banheiro', rotulo: 'Banheiro', icone: '🚻' },
      { id: 'deitar', rotulo: 'Deitar / sentar', icone: '🛏️' },
      { id: 'cadeira', rotulo: 'Cadeira de rodas', icone: '🦽' },
      { id: 'frio', rotulo: 'Estou com frio', icone: '🥶' },
      { id: 'familia', rotulo: 'Chamar minha família', icone: '📞' },
      { id: 'medo', rotulo: 'Estou com medo', icone: '😨' },
      { id: 'nada', rotulo: 'Não preciso de nada', icone: '👌', exclusiva: true },
    ],
  },
];

/* Escala de dor / desconforto. O nível alimenta a classificação de risco. */
const ESCALA = [
  { valor: 0, rotulo: 'Nada', icone: '😀', nivel: 1, cor: '#2E8B57' },
  { valor: 2, rotulo: 'Pouco', icone: '🙂', nivel: 2, cor: '#7DB343' },
  { valor: 4, rotulo: 'Mais ou menos', icone: '😐', nivel: 3, cor: '#F5C518' },
  { valor: 6, rotulo: 'Ruim', icone: '😟', nivel: 3, cor: '#F59A1B' },
  { valor: 8, rotulo: 'Muito ruim', icone: '😣', nivel: 4, cor: '#E8641B' },
  { valor: 10, rotulo: 'Insuportável', icone: '😭', nivel: 5, cor: '#C4122F' },
];

/*
 * dados.js — catálogo de conteúdo da triagem.
 *
 * Toda a estrutura das telas vive aqui. A intenção é que dá para mudar
 * perguntas, opções e pesos de risco sem mexer na lógica do app.
 *
 * Níveis de risco (baseados no Protocolo de Manchester):
 *   5 = vermelho  -> emergência, atendimento imediato
 *   4 = laranja   -> muito urgente, ~10 min
 *   3 = amarelo   -> urgente, ~60 min
 *   2 = verde     -> pouco urgente, ~120 min
 *   1 = azul      -> não urgente, ~240 min
 */

const NIVEIS = {
  5: { nome: 'Vermelho', rotulo: 'Emergência', espera: 'Imediato', cor: '#d32f2f' },
  4: { nome: 'Laranja', rotulo: 'Muito urgente', espera: 'Até 10 min', cor: '#ef6c00' },
  3: { nome: 'Amarelo', rotulo: 'Urgente', espera: 'Até 60 min', cor: '#f9a825' },
  2: { nome: 'Verde', rotulo: 'Pouco urgente', espera: 'Até 120 min', cor: '#2e7d32' },
  1: { nome: 'Azul', rotulo: 'Não urgente', espera: 'Até 240 min', cor: '#1565c0' },
};

/* Partes do corpo desenhadas no boneco (SVG) da tela de localização. */
const PARTES_CORPO = [
  { id: 'cabeca', rotulo: 'Cabeça' },
  { id: 'garganta', rotulo: 'Garganta / pescoço' },
  { id: 'peito', rotulo: 'Peito', nivel: 4 },
  { id: 'barriga', rotulo: 'Barriga' },
  { id: 'braco-e', rotulo: 'Braço esquerdo' },
  { id: 'braco-d', rotulo: 'Braço direito' },
  { id: 'perna-e', rotulo: 'Perna esquerda' },
  { id: 'perna-d', rotulo: 'Perna direita' },
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
  { id: 'nao-sei-onde', rotulo: 'Não sei dizer', icone: '❓' },
];

const PASSOS = [
  {
    id: 'comunicacao',
    titulo: 'Como você prefere se comunicar?',
    ajuda: 'Toque em uma opção. Isso ajuda a equipe a falar com você do jeito certo.',
    tipo: 'unica',
    opcoes: [
      { id: 'figuras', rotulo: 'Aponto nas figuras', icone: '👆' },
      { id: 'libras', rotulo: 'Uso Libras', icone: '🤟', alerta: 'Chamar intérprete de Libras' },
      { id: 'escrita', rotulo: 'Prefiro escrever', icone: '✍️' },
      { id: 'acompanhante', rotulo: 'Tenho acompanhante', icone: '🧑‍🤝‍🧑' },
      { id: 'voz-baixa', rotulo: 'Falo, mas com dificuldade', icone: '🗣️' },
      { id: 'nao-falo', rotulo: 'Não consigo falar', icone: '🤐', alerta: 'Paciente não verbal' },
    ],
  },
  {
    id: 'local',
    titulo: 'Onde está o problema?',
    ajuda: 'Toque no corpo ou nos botões abaixo. Pode marcar mais de um lugar.',
    tipo: 'corpo',
  },
  {
    id: 'sintomas',
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
    titulo: 'O quanto está ruim?',
    ajuda: 'Arraste ou toque na carinha que combina com o que você sente.',
    tipo: 'escala',
  },
  {
    id: 'tempo',
    titulo: 'Começou quando?',
    ajuda: 'Toque em uma opção.',
    tipo: 'unica',
    opcoes: [
      { id: 'agora', rotulo: 'Agora, há pouco', icone: '⏱️', nivel: 4 },
      { id: 'hoje', rotulo: 'Hoje', icone: '☀️', nivel: 3 },
      { id: 'dias', rotulo: 'Alguns dias', icone: '📅', nivel: 2 },
      { id: 'semanas', rotulo: 'Semanas ou mais', icone: '🗓️', nivel: 1 },
      { id: 'nao-sei-quando', rotulo: 'Não sei', icone: '❓' },
    ],
  },
  {
    id: 'historico',
    titulo: 'Tem algo importante para a equipe saber?',
    ajuda: 'Pode marcar mais de uma opção. Se não tiver, toque em "Nada disso".',
    tipo: 'multipla',
    opcoes: [
      { id: 'medicamento', rotulo: 'Tomo medicamento', icone: '💊' },
      { id: 'alergia', rotulo: 'Tenho alergia', icone: '⚠️', alerta: 'Paciente relata alergia' },
      { id: 'diabetes', rotulo: 'Diabetes', icone: '🩸' },
      { id: 'pressao', rotulo: 'Pressão alta', icone: '📈' },
      { id: 'coracao', rotulo: 'Problema no coração', icone: '❤️', nivel: 3 },
      { id: 'gestante', rotulo: 'Estou grávida', icone: '🤰', nivel: 3, alerta: 'Gestante' },
      { id: 'epilepsia', rotulo: 'Epilepsia', icone: '⚡' },
      { id: 'cirurgia', rotulo: 'Cirurgia recente', icone: '🏥', nivel: 3 },
      { id: 'nada-disso', rotulo: 'Nada disso', icone: '🚫', exclusiva: true },
    ],
  },
  {
    id: 'necessidades',
    titulo: 'Precisa de alguma coisa agora?',
    ajuda: 'Isso não é sobre a doença, é sobre o seu conforto enquanto espera.',
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
  { valor: 0, rotulo: 'Nada', icone: '😀', nivel: 1, cor: '#2e7d32' },
  { valor: 2, rotulo: 'Pouco', icone: '🙂', nivel: 2, cor: '#7cb342' },
  { valor: 4, rotulo: 'Mais ou menos', icone: '😐', nivel: 3, cor: '#f9a825' },
  { valor: 6, rotulo: 'Ruim', icone: '😟', nivel: 3, cor: '#fb8c00' },
  { valor: 8, rotulo: 'Muito ruim', icone: '😣', nivel: 4, cor: '#ef6c00' },
  { valor: 10, rotulo: 'Insuportável', icone: '😭', nivel: 5, cor: '#d32f2f' },
];

const FAIXAS_ETARIAS = [
  { id: 'crianca', rotulo: 'Criança', icone: '🧒' },
  { id: 'adulto', rotulo: 'Adulto', icone: '🧑' },
  { id: 'idoso', rotulo: 'Idoso', icone: '🧓', nivel: 3 },
];

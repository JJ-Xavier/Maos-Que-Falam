/*
 * Testes da classificação de risco e das regras da fila.
 *
 * Rodar, a partir da raiz do projeto:
 *   node --test "Codigo/testes/*.test.js"
 *
 * Não precisa instalar nada: usa o executor de testes nativo do Node (22+).
 * Os arquivos do app são scripts de navegador, então são carregados num
 * contexto isolado com `vm`, na mesma ordem do index.html.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const contexto = vm.createContext({});
for (const arquivo of ['dados.js', 'regras.js']) {
  const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', arquivo), 'utf8');
  vm.runInContext(codigo, contexto, { filename: arquivo });
}
const R = vm.runInContext(
  '({ NIVEIS, PASSOS, PARTES_CORPO, PARTES_EXTRAS, FAIXAS_ETARIAS, ESCALA, ' +
  'classificar, nivelEfetivo, alternarOpcao, ordenarFila, acimaDoAlvo, ' +
  'itensDe, alertasDe, pedidosDe, temRespostas })',
  contexto
);

/* O vm devolve arrays de outro "realm"; isto os traz para este. */
const simples = (v) => JSON.parse(JSON.stringify(v));

function triagem(respostas, extra) {
  return Object.assign({ respostas: respostas || {}, faixa: null, emergencia: false }, extra);
}

/* ------------------------------------------------------------------ */

test('sem nenhuma resposta, fica no nível 1 e sem motivo', () => {
  assert.deepEqual(simples(R.classificar(triagem())), { nivel: 1, motivos: [] });
});

test('o maior nível vence e os menores não diluem', () => {
  const r = R.classificar(triagem({ sintomas: ['tosse', 'falta-ar'], tempo: ['hoje'] }));
  assert.equal(r.nivel, 5);
  assert.deepEqual(simples(r.motivos), ['Falta de ar']);
});

test('os motivos são todas as respostas que têm o nível final', () => {
  const r = R.classificar(triagem({ sintomas: ['sangramento'], intensidade: ['8'], local: ['peito'] }));
  assert.equal(r.nivel, 4);
  assert.deepEqual(simples(r.motivos).sort(), [
    'Dor ou desconforto 8/10',
    'Queixa em: Peito',
    'Sangramento',
  ]);
});

test('botão de ajuda leva direto ao vermelho, mesmo sem respostas', () => {
  const r = R.classificar(triagem({}, { emergencia: true }));
  assert.equal(r.nivel, 5);
  assert.match(r.motivos[0], /ajuda agora/);
});

test('idoso tem piso amarelo', () => {
  const r = R.classificar(triagem({ sintomas: ['tosse'] }, { faixa: 'idoso' }));
  assert.equal(r.nivel, 3);
  assert.deepEqual(simples(r.motivos), ['Paciente idoso (60+)']);
});

test('escala de dor: 10 é vermelho, 0 é azul', () => {
  assert.equal(R.classificar(triagem({ intensidade: ['10'] })).nivel, 5);
  assert.equal(R.classificar(triagem({ intensidade: ['0'] })).nivel, 1);
});

test('ids que não existem mais no catálogo são ignorados', () => {
  const r = R.classificar(triagem({ sintomas: ['opcao-removida'], local: ['asa'] }));
  assert.equal(r.nivel, 1);
});

test('alertas e pedidos são lidos das respostas', () => {
  const t = triagem({
    comunicacao: ['libras'],
    historico: ['alergia', 'gestante'],
    necessidades: ['agua', 'frio'],
  });
  assert.deepEqual(simples(R.alertasDe(t).map((a) => a.alerta)), [
    'Chamar intérprete de Libras',
    'Relata alergia',
    'Gestante',
  ]);
  assert.deepEqual(simples(R.pedidosDe(t).map((p) => p.id)), ['agua', 'frio']);
  assert.equal(R.temRespostas(t), true);
  assert.equal(R.temRespostas(triagem({ sintomas: [] })), false);
});

/* ------------------------------------------------------------------ */

test('opção exclusiva limpa as outras', () => {
  const passo = R.PASSOS.find((p) => p.id === 'historico');
  const nada = passo.opcoes.find((o) => o.id === 'nada-disso');
  assert.deepEqual(simples(R.alternarOpcao(['diabetes', 'alergia'], nada, passo.opcoes)), ['nada-disso']);
});

test('marcar outra opção limpa a exclusiva', () => {
  const passo = R.PASSOS.find((p) => p.id === 'historico');
  const diabetes = passo.opcoes.find((o) => o.id === 'diabetes');
  assert.deepEqual(simples(R.alternarOpcao(['nada-disso'], diabetes, passo.opcoes)), ['diabetes']);
});

test('tocar de novo desmarca', () => {
  const passo = R.PASSOS.find((p) => p.id === 'sintomas');
  const febre = passo.opcoes.find((o) => o.id === 'febre');
  assert.deepEqual(simples(R.alternarOpcao(['febre', 'tosse'], febre, passo.opcoes)), ['tosse']);
});

/* ------------------------------------------------------------------ */

test('fila: maior risco primeiro, empate por ordem de chegada', () => {
  const fila = R.ordenarFila([
    { id: 'verde-cedo', nivelSistema: 2, chegadaEm: '2026-01-01T10:00:00Z' },
    { id: 'laranja-tarde', nivelSistema: 4, chegadaEm: '2026-01-01T10:30:00Z' },
    { id: 'laranja-cedo', nivelSistema: 4, chegadaEm: '2026-01-01T10:10:00Z' },
  ]);
  assert.deepEqual(simples(fila.map((t) => t.id)), ['laranja-cedo', 'laranja-tarde', 'verde-cedo']);
});

test('reclassificação da equipe vale mais que a do sistema', () => {
  const fila = R.ordenarFila([
    { id: 'sistema-laranja', nivelSistema: 4, chegadaEm: '2026-01-01T10:00:00Z' },
    { id: 'equipe-vermelho', nivelSistema: 2, nivelEquipe: 5, chegadaEm: '2026-01-01T10:30:00Z' },
  ]);
  assert.equal(fila[0].id, 'equipe-vermelho');
  assert.equal(R.nivelEfetivo({ nivelSistema: 2, nivelEquipe: 5 }), 5);
});

test('tempo-alvo: laranja passa do alvo depois de 10 minutos', () => {
  const chegada = Date.parse('2026-01-01T10:00:00Z');
  const t = { nivelSistema: 4, chegadaEm: new Date(chegada).toISOString(), status: 'aguardando' };
  assert.equal(R.acimaDoAlvo(t, chegada + 9 * 60000), false);
  assert.equal(R.acimaDoAlvo(t, chegada + 11 * 60000), true);
  assert.equal(R.acimaDoAlvo(Object.assign({}, t, { status: 'atendimento' }), chegada + 60 * 60000), false);
});

/* ------------------------------------------------------------------ */

test('catálogo: ids únicos por passo e níveis entre 1 e 5', () => {
  const grupos = R.PASSOS
    .filter((p) => p.opcoes)
    .map((p) => [p.id, p.opcoes])
    .concat([['corpo', R.PARTES_CORPO.concat(R.PARTES_EXTRAS)], ['faixa', R.FAIXAS_ETARIAS]]);

  for (const [nome, opcoes] of grupos) {
    const ids = opcoes.map((o) => o.id);
    assert.equal(new Set(ids).size, ids.length, 'id repetido em ' + nome);
    for (const o of opcoes) {
      assert.ok(o.rotulo, 'opção sem rótulo em ' + nome);
      if (o.nivel !== undefined) assert.ok(R.NIVEIS[o.nivel], 'nível inválido em ' + nome + '/' + o.id);
    }
  }
  for (const e of R.ESCALA) assert.ok(R.NIVEIS[e.nivel]);
});

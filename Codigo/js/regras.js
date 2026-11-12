/*
 * regras.js — classificação de risco, seleção de opções e ordem da fila.
 *
 * Só funções puras: não tocam no DOM nem no armazenamento. Por isso dá para
 * testá-las sem navegador (ver testes/regras.test.js).
 *
 * Depende de dados.js.
 */

/* ------------------------------------------------------------------ */
/* Leitura das respostas                                               */
/* ------------------------------------------------------------------ */

/* Converte os ids marcados num passo em itens completos do catálogo.
   Ids que não existem mais no catálogo são ignorados. */
function itensDoPasso(passo, ids) {
  ids = ids || [];

  if (passo.tipo === 'escala') {
    return ids
      .map((v) => ESCALA.find((e) => String(e.valor) === String(v)))
      .filter(Boolean)
      .map((e) => ({
        id: String(e.valor),
        rotulo: e.rotulo + ' (' + e.valor + '/10)',
        icone: e.icone,
        nivel: e.nivel,
        motivo: 'Dor ou desconforto ' + e.valor + '/10',
      }));
  }

  const ehCorpo = passo.tipo === 'corpo';
  const catalogo = ehCorpo ? PARTES_CORPO.concat(PARTES_EXTRAS) : passo.opcoes || [];

  return ids
    .map((id) => catalogo.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) =>
      Object.assign({ icone: ehCorpo ? '📍' : '•' }, o, {
        motivo: o.motivo || (ehCorpo ? 'Queixa em: ' + o.rotulo : o.rotulo),
      })
    );
}

function respostasDetalhadas(t) {
  return PASSOS.map((passo) => ({
    passo,
    itens: itensDoPasso(passo, (t.respostas || {})[passo.id]),
  }));
}

function itensDe(t, idPasso) {
  const passo = PASSOS.find((p) => p.id === idPasso);
  return passo ? itensDoPasso(passo, (t.respostas || {})[idPasso]) : [];
}

function temRespostas(t) {
  return Object.values(t.respostas || {}).some((v) => v && v.length);
}

/* Itens com alerta (Libras, não verbal, alergia, gestante...). */
function alertasDe(t) {
  const alertas = [];
  respostasDetalhadas(t).forEach(({ itens }) =>
    itens.forEach((i) => { if (i.alerta) alertas.push(i); })
  );
  return alertas;
}

/* Pedidos de conforto, sem a opção "Não preciso de nada". */
function pedidosDe(t) {
  return itensDe(t, 'necessidades').filter((i) => !i.exclusiva);
}

/* ------------------------------------------------------------------ */
/* Classificação de risco                                              */
/* ------------------------------------------------------------------ */

/*
 * Regra do protótipo: o nível final é o MAIOR nível entre todas as
 * respostas. É deliberadamente conservador — na dúvida, sobe a prioridade,
 * porque subestimar risco é o erro mais caro numa triagem.
 *
 * Os motivos são as respostas que puxaram o nível para onde ele está (as
 * que têm exatamente o nível final). Nível 1 não tem motivo.
 */
function classificar(t) {
  const candidatos = [];

  if (t.emergencia) {
    candidatos.push({ nivel: 5, motivo: 'Tocou em "Preciso de ajuda agora"' });
  }

  const faixa = FAIXAS_ETARIAS.find((f) => f.id === t.faixa);
  if (faixa && faixa.nivel) {
    candidatos.push({ nivel: faixa.nivel, motivo: faixa.motivo || faixa.rotulo });
  }

  respostasDetalhadas(t).forEach(({ itens }) =>
    itens.forEach((i) => {
      if (i.nivel) candidatos.push({ nivel: i.nivel, motivo: i.motivo });
    })
  );

  const nivel = candidatos.reduce((maior, c) => Math.max(maior, c.nivel), 1);
  const motivos = nivel > 1
    ? candidatos.filter((c) => c.nivel === nivel).map((c) => c.motivo)
    : [];

  return { nivel, motivos };
}

/* A classificação da equipe, quando existe, vale mais que a do sistema. */
function nivelEfetivo(t) {
  return t.nivelEquipe || t.nivelSistema || 1;
}

/* ------------------------------------------------------------------ */
/* Seleção de opções                                                   */
/* ------------------------------------------------------------------ */

/*
 * Marca ou desmarca uma opção em múltipla escolha.
 * Opção exclusiva ("Nada disso") limpa as outras, e marcar qualquer outra
 * limpa a exclusiva.
 */
function alternarOpcao(atuais, opcao, catalogo) {
  atuais = atuais || [];
  if (atuais.includes(opcao.id)) return atuais.filter((id) => id !== opcao.id);
  if (opcao.exclusiva) return [opcao.id];

  const exclusivas = catalogo.filter((o) => o.exclusiva).map((o) => o.id);
  return atuais.filter((id) => !exclusivas.includes(id)).concat(opcao.id);
}

/* ------------------------------------------------------------------ */
/* Fila                                                                */
/* ------------------------------------------------------------------ */

function minutosDeEspera(t, agora) {
  const fim = agora === undefined ? Date.now() : agora;
  return Math.max(0, Math.floor((fim - new Date(t.chegadaEm).getTime()) / 60000));
}

/* Passou do tempo-alvo do nível? Só faz sentido para quem ainda espera. */
function acimaDoAlvo(t, agora) {
  if (t.status === 'atendimento' || t.status === 'finalizado') return false;
  return minutosDeEspera(t, agora) > NIVEIS[nivelEfetivo(t)].alvoMin;
}

/* Maior risco primeiro; empate resolvido por ordem de chegada. */
function ordenarFila(lista) {
  return lista.slice().sort((a, b) =>
    nivelEfetivo(b) - nivelEfetivo(a) ||
    new Date(a.chegadaEm) - new Date(b.chegadaEm)
  );
}

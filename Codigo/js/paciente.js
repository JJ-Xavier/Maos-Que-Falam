/*
 * paciente.js — o fluxo do totem: início, perguntas, conferência, envio,
 * botão de ajuda e o tempo limite de inatividade.
 */

const Paciente = (() => {
  const TOTAL = PASSOS.length + 1; // "sobre você" + as perguntas

  let t = null;            // triagem em andamento
  let indice = 0;          // 0 = sobre você; 1..N = PASSOS[indice - 1]
  let naRevisao = false;   // está na tela de conferência
  let editando = false;    // veio da conferência para corrigir um passo
  let travado = false;     // impede toque duplo durante o avanço automático
  let retorno = null;      // contagem regressiva das telas finais

  /* Campos que o totem pode gravar. Status, reclassificação e histórico são
     da equipe, e o totem não pode sobrescrevê-los. */
  const CAMPOS_PACIENTE = [
    'nome', 'faixa', 'emergencia', 'respostas', 'completa',
    'enviadaEm', 'nivelSistema', 'motivosSistema',
  ];

  function nova() {
    return {
      id: novoId(),
      senha: null,
      nome: '',
      faixa: null,
      emergencia: false,
      respostas: {},
      chegadaEm: new Date().toISOString(),
      enviadaEm: null,
      completa: false,
      local: CONFIG.localTotem,
      origem: 'totem',
      versao: CONFIG.versao,
      nivelSistema: 1,
      motivosSistema: [],
      nivelEquipe: null,
      motivoEquipe: '',
      status: 'aguardando',
      historico: [],
    };
  }

  /* ------------------------------------------------------------------ */
  /* Gravação                                                            */
  /* ------------------------------------------------------------------ */

  function reclassificar() {
    const { nivel, motivos } = classificar(t);
    t.nivelSistema = nivel;
    t.motivosSistema = motivos;
  }

  /* Primeira gravação: gera a senha e põe o paciente na fila. */
  function registrar(evento) {
    const agora = new Date().toISOString();
    t.nome = t.nome.trim();
    t.senha = Armazenamento.proximaSenha();
    t.historico.push({ em: agora, texto: evento });
    reclassificar();
    Armazenamento.salvar(JSON.parse(JSON.stringify(t)));
  }

  /* Gravações seguintes: só os campos do paciente. */
  function persistir(evento) {
    if (!t || !t.senha) return;
    reclassificar();
    const salvo = Armazenamento.atualizar(t.id, (registro) => {
      CAMPOS_PACIENTE.forEach((c) => { registro[c] = JSON.parse(JSON.stringify(t[c])); });
      registro.nome = t.nome.trim();
      if (evento) registro.historico.push({ em: new Date().toISOString(), texto: evento });
    });
    // Se a equipe apagou tudo enquanto o paciente respondia, registra de novo.
    if (!salvo) Armazenamento.salvar(JSON.parse(JSON.stringify(t)));
  }

  /* ------------------------------------------------------------------ */
  /* Componentes                                                         */
  /* ------------------------------------------------------------------ */

  function botaoOpcao(opcao, marcada, extraClasse) {
    return (
      '<button type="button" class="opcao' + (extraClasse ? ' ' + extraClasse : '') + '" ' +
      'data-id="' + esc(opcao.id) + '" aria-pressed="' + marcada + '">' +
        '<span class="opcao-icone">' + emoji(opcao.icone || '•') + '</span>' +
        '<span class="opcao-rotulo">' + esc(opcao.rotulo) + '</span>' +
        (opcao.detalhe ? '<span class="opcao-detalhe">' + esc(opcao.detalhe) + '</span>' : '') +
      '</button>'
    );
  }

  function progresso(alvo, atual) {
    let segmentos = '';
    for (let i = 1; i <= TOTAL; i++) {
      const estado = i < atual ? 'feito' : i === atual ? 'atual' : '';
      segmentos += '<span class="progresso-segmento ' + estado + '"></span>';
    }
    alvo.innerHTML =
      '<div class="progresso-trilha" aria-hidden="true">' + segmentos + '</div>' +
      '<p class="progresso-texto">Pergunta ' + atual + ' de ' + TOTAL + '</p>';
  }

  /* Boneco: regiões desenhadas num viewBox de 240×470. */
  const FORMAS_CORPO = {
    cabeca: '<ellipse cx="120" cy="50" rx="33" ry="38"/>',
    garganta: '<rect x="103" y="87" width="34" height="22" rx="9"/>',
    peito: '<path d="M70 124c0-10 8-16 20-16h60c12 0 20 6 20 16l-5 72H75z"/>',
    barriga: '<path d="M75 200h90l-2 62c0 9-7 16-16 16H93c-9 0-16-7-16-16z"/>',
    'braco-d': '<rect x="36" y="112" width="28" height="166" rx="14" transform="rotate(9 50 112)"/>',
    'braco-e': '<rect x="176" y="112" width="28" height="166" rx="14" transform="rotate(-9 190 112)"/>',
    'perna-d': '<rect x="80" y="284" width="36" height="172" rx="18"/>',
    'perna-e': '<rect x="124" y="284" width="36" height="172" rx="18"/>',
  };

  function htmlCorpo(marcadas) {
    const zonas = PARTES_CORPO.map((parte) =>
      '<g class="zona" data-id="' + parte.id + '" role="button" tabindex="0" ' +
      'aria-label="' + esc(parte.rotulo) + '" aria-pressed="' + marcadas.includes(parte.id) + '">' +
      FORMAS_CORPO[parte.id] + '</g>'
    ).join('');

    const extras = PARTES_EXTRAS.map((p) =>
      '<button type="button" class="chip" data-id="' + p.id + '" aria-pressed="' + marcadas.includes(p.id) + '">' +
        emoji(p.icone) + '<span>' + esc(p.rotulo) + '</span>' +
      '</button>'
    ).join('');

    return (
      '<div class="mapa-corpo">' +
        '<figure class="boneco">' +
          '<svg viewBox="0 0 240 470" role="group" aria-label="Mapa do corpo, de frente">' +
            zonas +
            '<text x="22" y="304" class="boneco-lado">direito</text>' +
            '<text x="218" y="304" class="boneco-lado">esquerdo</text>' +
          '</svg>' +
          '<figcaption>Direito e esquerdo do seu corpo</figcaption>' +
        '</figure>' +
        '<div class="corpo-extras">' +
          '<h2 class="rotulo-grupo" id="extras-titulo">Ou escolha aqui</h2>' +
          '<div class="chips" role="group" aria-labelledby="extras-titulo">' + extras + '</div>' +
          '<p class="corpo-marcadas" id="corpo-marcadas" aria-live="polite"></p>' +
        '</div>' +
      '</div>'
    );
  }

  function htmlEscala(marcadas) {
    return (
      '<div class="escala" role="group" aria-labelledby="passo-titulo">' +
      ESCALA.map((e) =>
        '<button type="button" class="opcao escala-item" data-id="' + e.valor + '" ' +
        'aria-pressed="' + marcadas.includes(String(e.valor)) + '" style="--item-cor:' + e.cor + '">' +
          '<span class="opcao-icone">' + emoji(e.icone) + '</span>' +
          '<span class="opcao-rotulo">' + esc(e.rotulo) + '</span>' +
          '<span class="opcao-detalhe">' + e.valor + ' de 10</span>' +
        '</button>'
      ).join('') +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------ */
  /* Telas                                                               */
  /* ------------------------------------------------------------------ */

  function mostrarInicio() {
    pararRetorno();
    Inatividade.parar();
    t = null;
    indice = 0;
    naRevisao = false;
    editando = false;
    travado = false;
    $('#entrada-nome').value = '';
    Acessibilidade.resetar();
    mostrarVista('vista-inicio', { focar: false });
  }

  function comecar() {
    t = nova();
    editando = false;
    naRevisao = false;
    Inatividade.iniciar();
    irPara(0);
  }

  function irPara(i, interromperFala) {
    indice = i;
    naRevisao = false;
    if (i === 0) {
      renderizarSobreVoce();
      mostrarVista('vista-identificacao', { titulo: 'Pergunta 1 de ' + TOTAL });
    } else {
      renderizarPasso();
      mostrarVista('vista-passo', { titulo: 'Pergunta ' + (i + 1) + ' de ' + TOTAL });
    }
    Fala.lerTela(interromperFala);
  }

  function renderizarSobreVoce() {
    progresso($('#progresso-identificacao'), 1);
    $('#grade-idade').innerHTML = FAIXAS_ETARIAS
      .map((f) => botaoOpcao(f, t.faixa === f.id))
      .join('');
    $('#entrada-nome').value = t.nome;
    $('#btn-identificacao-avancar .rotulo-botao').textContent = editando ? 'Pronto' : 'Continuar';
  }

  function passoAtual() {
    return PASSOS[indice - 1];
  }

  function renderizarPasso() {
    const passo = passoAtual();
    const marcadas = t.respostas[passo.id] || [];
    const corpo = $('#passo-corpo');

    progresso($('#progresso-passo'), indice + 1);
    $('#passo-titulo').textContent = passo.titulo;
    $('#passo-ajuda').textContent = passo.ajuda || '';
    corpo.dataset.tipo = passo.tipo;

    if (passo.tipo === 'corpo') {
      corpo.innerHTML = htmlCorpo(marcadas);
    } else if (passo.tipo === 'escala') {
      corpo.innerHTML = htmlEscala(marcadas);
    } else {
      corpo.innerHTML =
        '<div class="grade-opcoes" role="group" aria-labelledby="passo-titulo">' +
        passo.opcoes.map((o) => botaoOpcao(o, marcadas.includes(o.id))).join('') +
        '</div>';
    }
    atualizarSelecao();
  }

  /* Atualiza a marcação sem redesenhar a tela (o foco do teclado fica onde
     estava). */
  function atualizarSelecao() {
    const passo = passoAtual();
    const marcadas = t.respostas[passo.id] || [];

    $$('#passo-corpo [data-id]').forEach((el) => {
      el.setAttribute('aria-pressed', marcadas.includes(el.dataset.id));
    });

    if (passo.tipo === 'corpo') {
      const nomes = itensDoPasso(passo, marcadas).map((i) => i.rotulo);
      $('#corpo-marcadas').textContent = nomes.length ? 'Marcado: ' + nomes.join(', ') : '';
    }

    const rotulo = $('#btn-passo-avancar .rotulo-botao');
    if (editando) rotulo.textContent = 'Pronto';
    else if (passo.tipo === 'multipla' || passo.tipo === 'corpo') {
      rotulo.textContent = marcadas.length ? 'Continuar (' + marcadas.length + ')' : 'Continuar';
    } else rotulo.textContent = 'Continuar';
  }

  function tocarOpcao(id) {
    const passo = passoAtual();
    let item;

    if (passo.tipo === 'escala') {
      item = ESCALA.find((e) => String(e.valor) === id);
      t.respostas[passo.id] = [id];
    } else if (passo.tipo === 'unica') {
      item = passo.opcoes.find((o) => o.id === id);
      t.respostas[passo.id] = [id];
    } else {
      const catalogo = passo.tipo === 'corpo' ? PARTES_CORPO.concat(PARTES_EXTRAS) : passo.opcoes;
      item = catalogo.find((o) => o.id === id);
      t.respostas[passo.id] = alternarOpcao(t.respostas[passo.id], item, catalogo);
    }
    if (!item) return;

    atualizarSelecao();
    const marcada = t.respostas[passo.id].includes(id);
    Fala.falar((marcada ? '' : 'Desmarcado: ') + item.rotulo, true);
    persistir();

    // Escolha única avança sozinha — um toque por tela. A trava impede que
    // um segundo toque rápido agende outro avanço e pule uma pergunta.
    if ((passo.tipo === 'unica' || passo.tipo === 'escala') && !travado) {
      travado = true;
      setTimeout(() => {
        travado = false;
        if (vistaAtual() === 'vista-passo' && passoAtual() === passo) avancar(false);
      }, CONFIG.atrasoAvancoMs);
    }
  }

  function avancar(interromperFala) {
    if (travado || !t) return;
    persistir();
    if (editando) {
      editando = false;
      mostrarRevisao();
    } else if (indice < PASSOS.length) {
      irPara(indice + 1, interromperFala);
    } else {
      mostrarRevisao();
    }
  }

  function voltar() {
    if (travado) return;
    if (editando) {
      editando = false;
      mostrarRevisao();
    } else if (indice === 0) {
      // Saída intencional no primeiro passo: descarta, a menos que o
      // paciente já esteja na fila (pediu ajuda antes).
      mostrarInicio();
    } else {
      irPara(indice - 1);
    }
  }

  function pular() {
    if (travado) return;
    if (indice === 0) {
      t.faixa = null;
      t.nome = '';
    } else {
      delete t.respostas[passoAtual().id];
    }
    avancar();
  }

  /* ------------------------------------------------------------------ */
  /* Conferência                                                         */
  /* ------------------------------------------------------------------ */

  function etiqueta(icone, texto) {
    return '<li class="etiqueta">' + emoji(icone) + '<span>' + esc(texto) + '</span></li>';
  }

  function linhaRevisao(titulo, etiquetas, alvo) {
    return (
      '<li class="revisao-item">' +
        '<div class="revisao-conteudo">' +
          '<h2>' + esc(titulo) + '</h2>' +
          (etiquetas.length
            ? '<ul class="etiquetas">' + etiquetas.join('') + '</ul>'
            : '<p class="revisao-vazio">Sem resposta</p>') +
        '</div>' +
        '<button type="button" class="botao botao-secundario" data-ir="' + alvo + '">' +
          'Mudar<span class="visually-hidden"> ' + esc(titulo) + '</span>' +
        '</button>' +
      '</li>'
    );
  }

  function mostrarRevisao() {
    naRevisao = true;
    const faixa = FAIXAS_ETARIAS.find((f) => f.id === t.faixa);
    const sobre = [];
    if (faixa) sobre.push(etiqueta(faixa.icone, faixa.rotulo));
    if (t.nome.trim()) sobre.push(etiqueta('👤', t.nome.trim()));

    const linhas = [linhaRevisao('Sobre você', sobre, 0)].concat(
      PASSOS.map((passo, i) =>
        linhaRevisao(
          passo.resumo,
          itensDoPasso(passo, t.respostas[passo.id]).map((it) => etiqueta(it.icone, it.rotulo)),
          i + 1
        )
      )
    );

    $('#revisao-lista').innerHTML = linhas.join('');
    mostrarVista('vista-revisao', { titulo: 'Confira suas respostas' });
    Fala.lerTela(false);
  }

  function enviar() {
    if (!t) return;
    t.completa = true;
    t.enviadaEm = new Date().toISOString();
    if (t.senha) persistir('Respostas enviadas pelo totem');
    else registrar('Triagem enviada pelo totem');
    mostrarEnviado();
  }

  /* ------------------------------------------------------------------ */
  /* Telas finais                                                        */
  /* ------------------------------------------------------------------ */

  function mostrarEnviado() {
    Inatividade.parar();
    $('#enviado-senha').textContent = t.senha;

    const avisos = [];
    const comunicacao = itensDe(t, 'comunicacao')[0];
    if (comunicacao) {
      avisos.push(
        '<p>Avisamos a equipe como você prefere se comunicar:</p>' +
        '<ul class="etiquetas">' + etiqueta(comunicacao.icone, comunicacao.rotulo) + '</ul>'
      );
    }
    const pedidos = pedidosDe(t);
    if (pedidos.length) {
      avisos.push(
        '<p>A equipe também viu seus pedidos:</p>' +
        '<ul class="etiquetas">' + pedidos.map((p) => etiqueta(p.icone, p.rotulo)).join('') + '</ul>'
      );
    }
    $('#enviado-avisos').innerHTML = avisos.join('');
    $('#enviado-avisos').hidden = !avisos.length;

    mostrarVista('vista-enviado', { titulo: 'Pronto' });
    Fala.lerTela();
    iniciarRetorno(CONFIG.retornoAutomaticoSegundos, '#enviado-contagem');
  }

  function acionarEmergencia() {
    pararRetorno();
    Inatividade.parar();
    const vinhaDoFluxo = Boolean(t) && !t.completa;
    if (!t) {
      t = nova();
      indice = 0;
      naRevisao = false;
    }
    editando = false;

    t.emergencia = true;
    if (t.senha) persistir('Tocou em "Preciso de ajuda agora"');
    else registrar('Tocou em "Preciso de ajuda agora"');

    $('#emergencia-senha').textContent = t.senha;
    $('#btn-emergencia-continuar').hidden = t.completa;
    $('#btn-emergencia-continuar .rotulo-botao').textContent = vinhaDoFluxo
      ? 'Se conseguir, continue respondendo'
      : 'Se conseguir, responda algumas perguntas';

    mostrarVista('vista-emergencia', { titulo: 'A equipe foi avisada' });
    Fala.lerTela();
    iniciarRetorno(CONFIG.retornoEmergenciaSegundos, '#emergencia-contagem');
  }

  function continuarAposEmergencia() {
    pararRetorno();
    Inatividade.iniciar();
    if (naRevisao) mostrarRevisao();
    else irPara(indice);
  }

  function iniciarRetorno(segundos, seletor) {
    pararRetorno();
    let restante = segundos;
    const alvo = $(seletor);
    const escrever = () => { alvo.textContent = 'Esta tela volta ao início em ' + restante + ' s.'; };
    escrever();
    retorno = setInterval(() => {
      restante -= 1;
      if (restante <= 0) mostrarInicio();
      else escrever();
    }, 1000);
  }

  function pararRetorno() {
    clearInterval(retorno);
    retorno = null;
  }

  /* Ninguém tocou na tela: se já havia resposta, guarda como incompleta para
     a equipe ver. Quem abandona no meio pode ter piorado. */
  function encerrarPorInatividade() {
    if (t && !t.completa && (t.senha || temRespostas(t))) {
      const evento = 'Saiu antes de terminar (tempo sem tocar na tela)';
      if (t.senha) persistir(evento);
      else registrar(evento);
    }
    mostrarInicio();
  }

  /* ------------------------------------------------------------------ */
  /* Eventos                                                             */
  /* ------------------------------------------------------------------ */

  function iniciar() {
    $('#btn-comecar').addEventListener('click', comecar);
    $('#btn-socorro').addEventListener('click', acionarEmergencia);
    $('#btn-ajuda-topo').addEventListener('click', acionarEmergencia);
    $('#btn-abrir-equipe').addEventListener('click', () => { location.hash = '#/equipe'; });

    // Sobre você
    $('#grade-idade').addEventListener('click', (e) => {
      const botao = e.target.closest('[data-id]');
      if (!botao) return;
      const faixa = FAIXAS_ETARIAS.find((f) => f.id === botao.dataset.id);
      t.faixa = t.faixa === faixa.id ? null : faixa.id;
      $$('#grade-idade [data-id]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === t.faixa));
      Fala.falar((t.faixa ? '' : 'Desmarcado: ') + faixa.rotulo, true);
      persistir();
    });
    $('#entrada-nome').addEventListener('input', (e) => { if (t) t.nome = e.target.value; });
    $('#entrada-nome').addEventListener('change', () => persistir());
    $('#entrada-nome').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
    $('#btn-identificacao-voltar').addEventListener('click', voltar);
    $('#btn-identificacao-pular').addEventListener('click', pular);
    $('#btn-identificacao-avancar').addEventListener('click', () => avancar());

    // Perguntas
    const corpo = $('#passo-corpo');
    corpo.addEventListener('click', (e) => {
      const alvo = e.target.closest('[data-id]');
      if (alvo) tocarOpcao(alvo.dataset.id);
    });
    // As regiões do boneco são <g role="button">: precisam de teclado próprio.
    corpo.addEventListener('keydown', (e) => {
      const zona = e.target.closest('g[data-id]');
      if (!zona) return;
      if (e.key === 'Enter') { e.preventDefault(); tocarOpcao(zona.dataset.id); }
      if (e.key === ' ') e.preventDefault();
    });
    corpo.addEventListener('keyup', (e) => {
      const zona = e.target.closest('g[data-id]');
      if (zona && e.key === ' ') tocarOpcao(zona.dataset.id);
    });
    $('#btn-passo-voltar').addEventListener('click', voltar);
    $('#btn-passo-pular').addEventListener('click', pular);
    $('#btn-passo-avancar').addEventListener('click', () => avancar());

    // Conferência
    $('#revisao-lista').addEventListener('click', (e) => {
      const botao = e.target.closest('[data-ir]');
      if (!botao) return;
      editando = true;
      irPara(Number(botao.dataset.ir));
    });
    $('#btn-revisao-voltar').addEventListener('click', () => irPara(PASSOS.length));
    $('#btn-enviar').addEventListener('click', enviar);

    // Telas finais
    $('#btn-terminar').addEventListener('click', mostrarInicio);
    $('#btn-emergencia-continuar').addEventListener('click', continuarAposEmergencia);
    $('#btn-emergencia-inicio').addEventListener('click', mostrarInicio);

    Inatividade.aoExpirar(encerrarPorInatividade);
  }

  return { iniciar, mostrarInicio };
})();

/* ------------------------------------------------------------------ */
/* Inatividade                                                         */
/* ------------------------------------------------------------------ */

/*
 * Num totem, a pessoa pode simplesmente ir embora. Depois de um tempo sem
 * toque, pergunta se ela ainda está ali; sem resposta, volta ao início para
 * o próximo paciente não ver os dados de quem saiu.
 */
const Inatividade = (() => {
  let ativo = false;
  let espera = null;
  let contagem = null;
  let aoExpirarFn = () => {};

  function dialogo() {
    return $('#dialogo-inatividade');
  }

  function reiniciar() {
    clearTimeout(espera);
    espera = setTimeout(avisar, CONFIG.inatividadeSegundos * 1000);
  }

  function avisar() {
    let restante = CONFIG.avisoInatividadeSegundos;
    $('#inatividade-segundos').textContent = restante;
    dialogo().showModal();
    Fala.falar('Você ainda está aí? Toque na tela para continuar.', true);
    contagem = setInterval(() => {
      restante -= 1;
      $('#inatividade-segundos').textContent = restante;
      if (restante <= 0) {
        clearInterval(contagem);
        dialogo().close('expirou');
      }
    }, 1000);
  }

  function aoTocar() {
    if (ativo && !dialogo().open) reiniciar();
  }

  function iniciarEventos() {
    // "scroll" não sobe pela árvore, mas chega à captura no document: quem
    // está lendo uma lista longa rolando a tela não conta como inativo.
    ['pointerdown', 'keydown', 'input', 'scroll', 'wheel'].forEach((tipo) =>
      document.addEventListener(tipo, aoTocar, { capture: true, passive: true })
    );
    dialogo().addEventListener('close', () => {
      clearInterval(contagem);
      const motivo = dialogo().returnValue;
      dialogo().returnValue = '';
      if (motivo === 'expirou') aoExpirarFn();
      else if (motivo !== 'parado' && ativo) reiniciar();
    });
  }

  return {
    iniciarEventos,
    aoExpirar(fn) { aoExpirarFn = fn; },
    iniciar() {
      ativo = true;
      reiniciar();
    },
    parar() {
      ativo = false;
      clearTimeout(espera);
      clearInterval(contagem);
      if (dialogo().open) dialogo().close('parado');
    },
  };
})();

/*
 * equipe.js — o lado da equipe: acesso por PIN, fila de atendimento,
 * ficha do paciente, reclassificação, alerta de emergência e as
 * ferramentas do protótipo (exportar, exemplos, apagar).
 */

const Equipe = (() => {
  const CHAVE_SESSAO = 'mqf.equipe.liberado';
  const CHAVE_SOM = 'mqf.v2.som';

  const STATUS = {
    aguardando: 'Aguardando',
    chamado: 'Chamado',
    atendimento: 'Em atendimento',
    finalizado: 'Finalizado',
  };

  const ACOES = {
    chamar: { status: 'chamado', campo: 'chamadoEm', rotulo: 'Chamar', evento: 'Paciente chamado' },
    atender: { status: 'atendimento', campo: 'atendimentoEm', rotulo: 'Iniciar atendimento', evento: 'Atendimento iniciado' },
    finalizar: { status: 'finalizado', campo: 'encerradoEm', rotulo: 'Finalizar', evento: 'Atendimento finalizado' },
    reabrir: { status: 'aguardando', campo: null, rotulo: 'Devolver para a fila', evento: 'Devolvido para a fila' },
  };

  /* Ações oferecidas em cada situação. A primeira é a principal. */
  const ACOES_POR_STATUS = {
    aguardando: ['chamar', 'atender'],
    chamado: ['atender', 'reabrir'],
    atendimento: ['finalizar', 'reabrir'],
    finalizado: ['reabrir'],
  };

  const VAZIO = {
    espera: 'Ninguém esperando agora. Quem usar o totem aparece aqui na hora. Para testar, abra o totem em outra aba ou carregue os casos de exemplo no fim da página.',
    atendimento: 'Nenhum paciente em atendimento.',
    finalizado: 'Nenhum atendimento finalizado.',
  };

  let liberadoEmMemoria = false;
  let filtro = 'espera';
  let relogio = null;
  let fichaId = null;
  let vistos = null;   // ids de casos vermelhos já anunciados
  let audio = null;

  /* ------------------------------------------------------------------ */
  /* Acesso                                                              */
  /* ------------------------------------------------------------------ */

  function liberado() {
    try { return sessionStorage.getItem(CHAVE_SESSAO) === '1'; } catch (e) { return liberadoEmMemoria; }
  }

  function liberar(sim) {
    liberadoEmMemoria = sim;
    try {
      if (sim) sessionStorage.setItem(CHAVE_SESSAO, '1');
      else sessionStorage.removeItem(CHAVE_SESSAO);
    } catch (e) { /* segue em memória */ }
  }

  function rotaAtual() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).slice(1);
  }

  function abrir(partes) {
    Inatividade.parar();
    Fala.parar();
    Acessibilidade.resetar();

    if (!liberado()) {
      mostrarPin();
      return;
    }
    document.body.classList.remove('equipe-bloqueada');
    ligarRelogio();
    if (partes[0] === 'ficha' && partes[1]) mostrarFicha(partes[1]);
    else mostrarPainel();
  }

  function fechar() {
    clearInterval(relogio);
    relogio = null;
    fichaId = null;
    $('#alerta-emergencia').hidden = true;
  }

  function mostrarPin() {
    document.body.classList.add('equipe-bloqueada');
    const campo = $('#entrada-pin');
    campo.value = '';
    campo.removeAttribute('aria-invalid');
    $('#pin-erro').hidden = true;
    $('#pin-dica').hidden = !CONFIG.mostrarDicaPin;
    $('#pin-dica').textContent = 'No protótipo, o PIN é ' + CONFIG.pinEquipe + '.';
    mostrarVista('vista-pin', { titulo: 'Acesso da equipe', focar: false });
    campo.focus();
  }

  function enviarPin(e) {
    e.preventDefault();
    const campo = $('#entrada-pin');
    if (campo.value === CONFIG.pinEquipe) {
      liberar(true);
      prepararAudio();
      abrir(rotaAtual());
    } else {
      $('#pin-erro').hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      campo.select();
    }
  }

  function sair(telaCheia) {
    liberar(false);
    if (telaCheia && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    location.hash = '#/';
  }

  /* ------------------------------------------------------------------ */
  /* Fila                                                                */
  /* ------------------------------------------------------------------ */

  function grupoDe(x) {
    if (x.status === 'atendimento') return 'atendimento';
    if (x.status === 'finalizado') return 'finalizado';
    return 'espera';
  }

  function estiloNivel(n) {
    const info = NIVEIS[n];
    return 'style="--nivel-cor:' + info.cor + ';--nivel-texto:' + info.corTexto + '"';
  }

  function tituloPainel(grupos) {
    const vermelhos = grupos.espera.filter((x) => nivelEfetivo(x) === 5).length;
    return (vermelhos ? '(' + vermelhos + ' vermelho) ' : '') + 'Fila de atendimento';
  }

  function agrupar() {
    const grupos = { espera: [], atendimento: [], finalizado: [] };
    Armazenamento.listar().forEach((x) => grupos[grupoDe(x)].push(x));
    return grupos;
  }

  function mostrarPainel() {
    fichaId = null;
    const grupos = renderizarPainel();
    mostrarVista('vista-painel', { titulo: tituloPainel(grupos) });
  }

  function renderizarPainel() {
    const grupos = agrupar();

    $$('#filtros [data-filtro]').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.filtro === filtro);
      $('.contagem', b).textContent = grupos[b.dataset.filtro].length;
    });

    $('#resumo-niveis').hidden = filtro !== 'espera';
    $('#resumo-niveis').innerHTML = [5, 4, 3, 2, 1].map((n) => {
      const qtd = grupos.espera.filter((x) => nivelEfetivo(x) === n).length;
      return (
        '<li class="' + (qtd ? '' : 'zerado') + '" ' + estiloNivel(n) + '>' +
          '<span class="bolinha">' + qtd + '</span>' + NIVEIS[n].nome +
        '</li>'
      );
    }).join('');

    let lista = grupos[filtro];
    if (filtro === 'espera') lista = ordenarFila(lista);
    else if (filtro === 'atendimento') lista = lista.slice().sort((a, b) => new Date(a.atendimentoEm) - new Date(b.atendimentoEm));
    else lista = lista.slice().sort((a, b) => new Date(b.encerradoEm) - new Date(a.encerradoEm));

    preservarFoco(() => { $('#fila').innerHTML = lista.map(cartaoCaso).join(''); });
    $('#fila-vazia').hidden = lista.length > 0;
    $('#fila-vazia').textContent = VAZIO[filtro];
    $('#painel-atualizado').textContent = 'Atualizado às ' + hora(new Date().toISOString());

    if (vistaAtual() === 'vista-painel') {
      document.title = tituloPainel(grupos) + ' | Mãos Que Falam';
    }
    detectarEmergencias();
    return grupos;
  }

  /* Re-desenhar a lista não pode tirar o foco de quem usa teclado. */
  function preservarFoco(desenhar) {
    const ativo = document.activeElement;
    const id = ativo && $('#fila').contains(ativo) ? ativo.dataset.id || ativo.dataset.ficha : null;
    const acao = ativo && ativo.dataset.acao;
    desenhar();
    if (!id) return;
    const destino =
      (acao && $('#fila [data-acao="' + acao + '"][data-id="' + id + '"]')) ||
      $('#fila [data-ficha="' + id + '"]');
    if (destino) destino.focus({ preventScroll: true });
  }

  function textoTempo(x) {
    if (x.status === 'atendimento') return 'Em atendimento desde ' + hora(x.atendimentoEm);
    if (x.status === 'finalizado') return 'Finalizado às ' + hora(x.encerradoEm);
    return 'Esperando há <strong>' + textoMinutos(minutosDeEspera(x)) + '</strong>';
  }

  function resumoQueixa(x) {
    if (x.emergencia && !temRespostas(x)) return 'Tocou em "Preciso de ajuda agora". Ainda sem respostas.';
    const sintomas = itensDe(x, 'sintomas').map((i) => i.rotulo);
    const locais = itensDe(x, 'local').map((i) => i.rotulo.toLowerCase());
    const partes = [sintomas.length ? sintomas.join(', ') + '.' : 'Nenhum sintoma marcado.'];
    if (locais.length) partes.push('Onde: ' + locais.join(', ') + '.');
    return partes.join(' ');
  }

  function cartaoCaso(x) {
    const n = nivelEfetivo(x);
    const info = NIVEIS[n];
    const atrasado = acimaDoAlvo(x);
    const faixa = FAIXAS_ETARIAS.find((f) => f.id === x.faixa);

    const marcas = [];
    if (x.emergencia) marcas.push('<li class="marca marca-socorro">Pediu ajuda no totem</li>');
    if (!x.completa) marcas.push('<li class="marca marca-incompleta">Não terminou a triagem</li>');
    if (x.status === 'chamado') marcas.push('<li class="marca">Chamado às ' + hora(x.chamadoEm) + '</li>');
    if (x.nivelEquipe) marcas.push('<li class="marca">Prioridade definida pela equipe</li>');
    alertasDe(x).forEach((a) => marcas.push('<li class="marca marca-alerta">' + emoji(a.icone) + esc(a.alerta) + '</li>'));
    pedidosDe(x).forEach((p) => marcas.push('<li class="marca marca-pedido">' + emoji(p.icone) + esc(p.rotulo) + '</li>'));

    const acao = (ACOES_POR_STATUS[x.status] || [])[0];
    const botao = acao && x.status !== 'finalizado'
      ? '<button type="button" class="botao botao-acao" data-acao="' + acao + '" data-id="' + esc(x.id) + '">' +
          ACOES[acao].rotulo + '<span class="visually-hidden"> ' + esc(x.senha) + '</span></button>'
      : '';

    return (
      '<li class="caso' + (atrasado ? ' caso-atrasado' : '') + '" ' + estiloNivel(n) + '>' +
        '<div class="caso-nivel">' +
          '<span class="caso-senha">' + esc(x.senha) + '</span>' +
          '<span class="caso-cor">' + info.nome + '</span>' +
        '</div>' +
        '<div class="caso-corpo">' +
          '<h2 class="caso-nome">' +
            '<a href="#/equipe/ficha/' + esc(x.id) + '" data-ficha="' + esc(x.id) + '">' + esc(x.nome || 'Sem nome') + '</a>' +
            (faixa ? '<span class="caso-faixa">' + esc(faixa.rotulo) + '</span>' : '') +
          '</h2>' +
          '<p class="caso-queixa">' + esc(resumoQueixa(x)) + '</p>' +
          (marcas.length ? '<ul class="marcas">' + marcas.join('') + '</ul>' : '') +
        '</div>' +
        '<div class="caso-lado">' +
          '<p class="caso-tempo">' + textoTempo(x) + '</p>' +
          (atrasado
            ? '<p class="caso-atraso">' + icone('alerta') + 'Passou do tempo-alvo (' + info.espera.toLowerCase() + ')</p>'
            : '<p class="caso-chegada">Chegou às ' + hora(x.chegadaEm) + '</p>') +
          botao +
        '</div>' +
      '</li>'
    );
  }

  function mudarStatus(id, acao) {
    const regra = ACOES[acao];
    const agora = new Date().toISOString();
    Armazenamento.atualizar(id, (x) => {
      x.status = regra.status;
      if (regra.campo) x[regra.campo] = agora;
      x.historico.push({ em: agora, texto: regra.evento });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ficha                                                               */
  /* ------------------------------------------------------------------ */

  function mostrarFicha(id) {
    fichaId = id;
    const x = renderizarFicha(id);
    mostrarVista('vista-ficha', { titulo: x ? 'Ficha ' + x.senha : 'Ficha não encontrada' });
  }

  function renderizarFicha(id) {
    const x = Armazenamento.obter(id);
    $('#ficha-status').textContent = '';
    if (!x) {
      $('#ficha').innerHTML =
        '<div class="ficha-sumiu"><h1 tabindex="-1">Ficha não encontrada</h1>' +
        '<p>Ela pode ter sido apagada. Volte para a fila.</p></div>';
      return null;
    }
    $('#ficha').innerHTML = htmlFicha(x);
    aplicarIcones($('#ficha'));
    detectarEmergencias();
    return x;
  }

  function etiqueta(icone, texto, classe) {
    return '<li class="etiqueta' + (classe ? ' ' + classe : '') + '">' + emoji(icone) + '<span>' + esc(texto) + '</span></li>';
  }

  function htmlFicha(x) {
    const n = nivelEfetivo(x);
    const info = NIVEIS[n];
    const sistema = NIVEIS[x.nivelSistema || 1];
    const faixa = FAIXAS_ETARIAS.find((f) => f.id === x.faixa);
    const comunicacao = itensDe(x, 'comunicacao')[0];
    const alertas = alertasDe(x).filter((a) => !comunicacao || a.id !== comunicacao.id);
    const pedidos = pedidosDe(x);
    const motivos = x.motivosSistema || [];

    let origem;
    if (!x.nivelEquipe) origem = 'Sugestão do sistema a partir das respostas. Confirme na avaliação.';
    else if (x.nivelEquipe === x.nivelSistema) origem = 'Confirmada pela equipe.';
    else origem = 'Definida pela equipe. O sistema tinha sugerido ' + sistema.nome + '.';

    const espera = x.status === 'atendimento' || x.status === 'finalizado'
      ? STATUS[x.status] + '.'
      : 'Esperando há ' + textoMinutos(minutosDeEspera(x)) + '.';

    // Faixa de risco
    let html =
      '<header class="ficha-faixa" ' + estiloNivel(n) + '>' +
        '<div class="ficha-faixa-topo">' +
          '<span class="ficha-senha">' + esc(x.senha) + '</span>' +
          '<span class="ficha-pilula">' + info.nome + '</span>' +
        '</div>' +
        '<h1 tabindex="-1">' + info.rotulo + '</h1>' +
        '<p class="ficha-alvo">Tempo-alvo: ' + info.espera.toLowerCase() + '. ' + espera + '</p>' +
        '<p>' + esc(origem) + (x.nivelEquipe && x.motivoEquipe ? ' Motivo: ' + esc(x.motivoEquipe) : '') + '</p>' +
        (motivos.length
          ? '<p class="ficha-motivos"><strong>O sistema considerou:</strong> ' + motivos.map(esc).join('; ') + '</p>'
          : '<p class="ficha-motivos">Nenhuma resposta indicou urgência.</p>') +
      '</header>';

    // Folha principal
    const comunicacaoHtml = comunicacao
      ? '<p class="comunicacao-destaque">' + emoji(comunicacao.icone) + esc(comunicacao.rotulo) + '</p>' +
        (comunicacao.orientacao ? '<p>' + esc(comunicacao.orientacao) + '</p>' : '')
      : '<p class="vazio">Não respondeu. Pergunte como prefere se comunicar antes de começar.</p>';

    const respostas = PASSOS.filter((p) => p.id !== 'comunicacao' && p.id !== 'necessidades').map((passo) => {
      const itens = itensDoPasso(passo, x.respostas[passo.id]);
      return (
        '<dt>' + esc(passo.resumo) + '</dt>' +
        '<dd>' + (itens.length
          ? '<ul class="etiquetas">' + itens.map((i) => etiqueta(i.icone, i.rotulo, i.nivel >= 4 ? 'etiqueta-forte' : '')).join('') + '</ul>'
          : '<span class="vazio">Não respondeu</span>') +
        '</dd>'
      );
    }).join('');

    html +=
      '<div class="ficha-grade">' +
        '<article class="folha">' +
          '<section class="folha-secao folha-comunicacao">' +
            '<h2>Como se comunicar</h2>' + comunicacaoHtml +
          '</section>' +
          (alertas.length
            ? '<section class="folha-secao"><h2>Atenção</h2><ul class="etiquetas">' +
              alertas.map((a) => etiqueta(a.icone, a.alerta, 'etiqueta-alerta')).join('') + '</ul></section>'
            : '') +
          (pedidos.length
            ? '<section class="folha-secao"><h2>Pediu enquanto espera</h2><ul class="etiquetas">' +
              pedidos.map((p) => etiqueta(p.icone, p.rotulo)).join('') + '</ul></section>'
            : '') +
          '<section class="folha-secao">' +
            '<h2>Respostas do paciente</h2>' +
            (x.emergencia && !temRespostas(x)
              ? '<p class="vazio">Tocou em "Preciso de ajuda agora" e ainda não respondeu às perguntas.</p>'
              : '<dl class="respostas">' + respostas + '</dl>' +
                '<p class="legenda">Contorno escuro: resposta que, sozinha, já sobe a prioridade para laranja ou vermelho.</p>') +
          '</section>' +
        '</article>' +
        htmlLateral(x, faixa, n) +
      '</div>';

    return html;
  }

  function htmlLateral(x, faixa, nivelAtual) {
    const preenchimento = x.enviadaEm
      ? textoDuracao(new Date(x.enviadaEm) - new Date(x.chegadaEm))
      : 'Não terminou';

    const acoes = (ACOES_POR_STATUS[x.status] || []).map((a, i) =>
      '<button type="button" class="botao ' + (i === 0 ? 'botao-primario' : 'botao-secundario') + '" data-acao="' + a + '">' +
        ACOES[a].rotulo + '</button>'
    ).join('');

    const opcoesNivel = [5, 4, 3, 2, 1].map((n) =>
      '<label class="nivel-opcao" ' + estiloNivel(n) + '>' +
        '<input type="radio" name="nivel" value="' + n + '"' + (n === nivelAtual ? ' checked' : '') + '>' +
        '<span>' + NIVEIS[n].nome + '</span>' +
      '</label>'
    ).join('');

    const historico = (x.historico || []).slice().reverse().map((h) =>
      '<li><time datetime="' + esc(h.em) + '">' + hora(h.em) + '</time> ' + esc(h.texto) + '</li>'
    ).join('');

    return (
      '<aside class="ficha-lateral">' +
        '<section class="bloco">' +
          '<h2>Paciente</h2>' +
          '<dl class="dados">' +
            '<dt>Nome</dt><dd>' + esc(x.nome || 'Não informado') + '</dd>' +
            '<dt>Idade</dt><dd>' + (faixa ? esc(faixa.rotulo + ' (' + faixa.detalhe.toLowerCase() + ')') : 'Não informada') + '</dd>' +
            '<dt>Chegou</dt><dd>' + dataHora(x.chegadaEm) + '</dd>' +
            '<dt>Preencheu em</dt><dd>' + preenchimento + '</dd>' +
            '<dt>Totem</dt><dd>' + esc(x.local || '—') + '</dd>' +
            '<dt>Situação</dt><dd>' + STATUS[x.status] + '</dd>' +
          '</dl>' +
        '</section>' +
        '<section class="bloco nao-imprimir">' +
          '<h2>Atendimento</h2>' +
          '<div class="acoes-status">' + acoes + '</div>' +
        '</section>' +
        '<section class="bloco nao-imprimir">' +
          '<h2>Prioridade</h2>' +
          '<form id="form-reclassificar" class="reclassificar">' +
            '<fieldset><legend>Cor depois da avaliação</legend><div class="niveis-opcoes">' + opcoesNivel + '</div></fieldset>' +
            '<label for="motivo-equipe">Motivo <span class="opcional">(opcional)</span></label>' +
            '<textarea id="motivo-equipe" name="motivo" rows="2">' + esc(x.motivoEquipe || '') + '</textarea>' +
            '<div class="form-acoes">' +
              '<button type="submit" class="botao botao-primario">Salvar prioridade</button>' +
              (x.nivelEquipe ? '<button type="button" class="botao botao-texto" data-desfazer>Usar a sugestão do sistema</button>' : '') +
            '</div>' +
          '</form>' +
        '</section>' +
        '<section class="bloco">' +
          '<h2>Histórico</h2>' +
          '<ol class="historico">' + historico + '</ol>' +
        '</section>' +
      '</aside>'
    );
  }

  function salvarPrioridade(form) {
    const novo = Number(form.elements.nivel.value);
    const motivo = form.elements.motivo.value.trim();
    Armazenamento.atualizar(fichaId, (x) => {
      const antes = nivelEfetivo(x);
      x.nivelEquipe = novo;
      x.motivoEquipe = motivo;
      x.historico.push({
        em: new Date().toISOString(),
        texto: (antes === novo
          ? 'Prioridade ' + NIVEIS[novo].nome + ' confirmada pela equipe'
          : 'Prioridade mudou de ' + NIVEIS[antes].nome + ' para ' + NIVEIS[novo].nome) +
          (motivo ? ': ' + motivo : ''),
      });
    });
    renderizarFicha(fichaId);
    $('#ficha-status').textContent = 'Prioridade salva.';
  }

  function desfazerPrioridade() {
    Armazenamento.atualizar(fichaId, (x) => {
      x.nivelEquipe = null;
      x.motivoEquipe = '';
      x.historico.push({
        em: new Date().toISOString(),
        texto: 'Voltou para a sugestão do sistema (' + NIVEIS[x.nivelSistema || 1].nome + ')',
      });
    });
    renderizarFicha(fichaId);
    $('#ficha-status').textContent = 'Voltou para a sugestão do sistema.';
  }

  /* ------------------------------------------------------------------ */
  /* Alerta de caso vermelho novo                                        */
  /* ------------------------------------------------------------------ */

  function detectarEmergencias() {
    const vermelhos = Armazenamento.listar().filter((x) => nivelEfetivo(x) === 5 && grupoDe(x) === 'espera');
    if (vistos === null) {
      // Primeira leitura: o que já estava na fila não dispara alarme.
      vistos = new Set(vermelhos.map((x) => x.id));
      return;
    }
    const novos = vermelhos.filter((x) => !vistos.has(x.id));
    if (!novos.length) return;
    novos.forEach((x) => vistos.add(x.id));

    const x = novos[novos.length - 1];
    $('#alerta-emergencia-texto').textContent = x.emergencia
      ? 'Pedido de ajuda: ' + x.senha + ' no totem ' + (x.local || '') + '.'
      : 'Novo caso vermelho: ' + x.senha + '. ' + resumoQueixa(x);
    $('#alerta-emergencia-link').href = '#/equipe/ficha/' + x.id;
    $('#alerta-emergencia').hidden = false;
    bip();
  }

  function somLigado() {
    try { return localStorage.getItem(CHAVE_SOM) !== '0'; } catch (e) { return true; }
  }

  function prepararAudio() {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;
    if (!audio) audio = new Contexto();
    if (audio.state === 'suspended') audio.resume();
  }

  function bip() {
    if (!somLigado() || !audio) return;
    const t0 = audio.currentTime;
    [0, 0.3, 0.6].forEach((atraso) => {
      const osc = audio.createOscillator();
      const ganho = audio.createGain();
      osc.frequency.value = 880;
      ganho.gain.setValueAtTime(0.0001, t0 + atraso);
      ganho.gain.exponentialRampToValueAtTime(0.25, t0 + atraso + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + atraso + 0.22);
      osc.connect(ganho).connect(audio.destination);
      osc.start(t0 + atraso);
      osc.stop(t0 + atraso + 0.25);
    });
  }

  function atualizarBotaoSom() {
    $('#btn-som').setAttribute('aria-pressed', somLigado());
  }

  /* ------------------------------------------------------------------ */
  /* Ferramentas do protótipo                                            */
  /* ------------------------------------------------------------------ */

  /* CSV sem nomes, para analisar as sessões de validação (tempo de
     preenchimento, respostas, concordância entre sistema e equipe). */
  function exportarCsv() {
    const lista = Armazenamento.listar().slice().sort((a, b) => new Date(a.chegadaEm) - new Date(b.chegadaEm));
    const colunas = [
      ['senha', (x) => x.senha],
      ['data', (x) => dataLocal(new Date(x.chegadaEm))],
      ['chegada', (x) => hora(x.chegadaEm)],
      ['tempo_preenchimento_s', (x) => (x.enviadaEm ? Math.round((new Date(x.enviadaEm) - new Date(x.chegadaEm)) / 1000) : '')],
      ['completa', (x) => (x.completa ? 'sim' : 'não')],
      ['pediu_ajuda', (x) => (x.emergencia ? 'sim' : 'não')],
      ['faixa_etaria', (x) => (FAIXAS_ETARIAS.find((f) => f.id === x.faixa) || {}).rotulo || ''],
    ]
      .concat(PASSOS.map((p) => [p.id, (x) => itensDoPasso(p, x.respostas[p.id]).map((i) => i.rotulo).join(' | ')]))
      .concat([
        ['prioridade_sistema', (x) => NIVEIS[x.nivelSistema || 1].nome],
        ['prioridade_equipe', (x) => (x.nivelEquipe ? NIVEIS[x.nivelEquipe].nome : '')],
        ['situacao', (x) => STATUS[x.status] || ''],
        ['local', (x) => x.local || ''],
        ['origem', (x) => x.origem || ''],
      ]);

    const celula = (v) => {
      const s = String(v === undefined || v === null ? '' : v);
      return /[";\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const linhas = [colunas.map((c) => c[0]).join(';')].concat(
      lista.map((x) => colunas.map((c) => celula(c[1](x))).join(';'))
    );

    // BOM + ponto e vírgula: o Excel em português abre sem configurar nada.
    const blob = new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'triagens-' + dataLocal() + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  const EXEMPLOS = [
    { minutos: 95, nome: 'Pedro Lima', faixa: 'adulto', segundos: 64, respostas: {
      comunicacao: ['figuras'], local: ['pele'], sintomas: ['coceira'], intensidade: ['2'],
      tempo: ['semanas'], historico: ['nada-disso'], necessidades: ['nada'] } },
    { minutos: 41, nome: 'Juliana Prado', faixa: 'adulto', segundos: 88, respostas: {
      comunicacao: ['escrita'], local: ['garganta'], sintomas: ['tosse', 'febre'], intensidade: ['4'],
      tempo: ['dias'], historico: ['gestante'], necessidades: ['agua'] } },
    { minutos: 25, nome: '', faixa: 'crianca', segundos: 121, respostas: {
      comunicacao: ['acompanhante'], local: ['barriga'], sintomas: ['vomito', 'diarreia'], intensidade: ['4'],
      tempo: ['hoje'], historico: ['nada-disso'], necessidades: ['banheiro'] } },
    { minutos: 18, nome: 'Carlos Menezes', faixa: 'adulto', segundos: 97, respostas: {
      comunicacao: ['nao-falo'], local: ['perna-d'], sintomas: ['dor', 'queda', 'sangramento'], intensidade: ['6'],
      tempo: ['hoje'], historico: ['alergia'], necessidades: ['cadeira', 'agua'] } },
    { minutos: 6, nome: 'Antônia Ribeiro', faixa: 'idoso', segundos: 143, respostas: {
      comunicacao: ['libras'], local: ['peito'], sintomas: ['falta-ar', 'dor-peito'], intensidade: ['8'],
      tempo: ['agora'], historico: ['coracao', 'medicamento'], necessidades: ['deitar'] } },
    { minutos: 2, nome: '', faixa: null, emergencia: true, incompleta: true, respostas: {} },
  ];

  function carregarExemplos() {
    const agora = Date.now();
    EXEMPLOS.forEach((ex) => {
      const chegada = new Date(agora - ex.minutos * 60000);
      const x = {
        id: novoId(),
        senha: Armazenamento.proximaSenha(),
        nome: ex.nome,
        faixa: ex.faixa,
        emergencia: Boolean(ex.emergencia),
        respostas: JSON.parse(JSON.stringify(ex.respostas)),
        chegadaEm: chegada.toISOString(),
        enviadaEm: ex.incompleta ? null : new Date(chegada.getTime() + ex.segundos * 1000).toISOString(),
        completa: !ex.incompleta,
        local: CONFIG.localTotem,
        origem: 'exemplo',
        nivelEquipe: null,
        motivoEquipe: '',
        status: 'aguardando',
        historico: [{ em: chegada.toISOString(), texto: 'Caso de exemplo criado no painel' }],
      };
      const { nivel, motivos } = classificar(x);
      x.nivelSistema = nivel;
      x.motivosSistema = motivos;
      Armazenamento.salvar(x);
    });
    filtro = 'espera';
    renderizarPainel();
  }

  async function apagarTudo() {
    const ok = await confirmar({
      titulo: 'Apagar todas as triagens?',
      texto: 'A fila, as fichas e o histórico deste navegador serão apagados, e a senha volta para 001. Não dá para desfazer.',
      rotulo: 'Apagar tudo',
      perigo: true,
    });
    if (!ok) return;
    Armazenamento.apagarTudo();
    vistos = new Set();
    $('#alerta-emergencia').hidden = true;
    renderizarPainel();
  }

  /* ------------------------------------------------------------------ */
  /* Eventos                                                             */
  /* ------------------------------------------------------------------ */

  function ligarRelogio() {
    if (relogio) return;
    relogio = setInterval(() => {
      if (vistaAtual() === 'vista-painel') renderizarPainel();
    }, CONFIG.atualizarPainelSegundos * 1000);
  }

  function iniciar() {
    $('#form-pin').addEventListener('submit', enviarPin);
    $('#btn-pin-voltar').addEventListener('click', () => { location.hash = '#/'; });

    $('#btn-sair-equipe').addEventListener('click', () => sair(false));
    $('#btn-modo-totem').addEventListener('click', () => sair(true));
    $('#btn-som').addEventListener('click', () => {
      try { localStorage.setItem(CHAVE_SOM, somLigado() ? '0' : '1'); } catch (e) { /* ignora */ }
      atualizarBotaoSom();
      prepararAudio();
    });
    atualizarBotaoSom();

    // O navegador só libera áudio depois de um gesto; qualquer clique serve.
    document.addEventListener('pointerdown', () => {
      if (document.body.classList.contains('modo-equipe') && liberado()) prepararAudio();
    });

    $('#filtros').addEventListener('click', (e) => {
      const botao = e.target.closest('[data-filtro]');
      if (!botao) return;
      filtro = botao.dataset.filtro;
      renderizarPainel();
    });

    $('#fila').addEventListener('click', (e) => {
      const botao = e.target.closest('[data-acao]');
      if (!botao) return;
      mudarStatus(botao.dataset.id, botao.dataset.acao);
      renderizarPainel();
    });

    $('#ficha').addEventListener('click', (e) => {
      const acao = e.target.closest('[data-acao]');
      if (acao) {
        mudarStatus(fichaId, acao.dataset.acao);
        renderizarFicha(fichaId);
        $('#ficha-status').textContent = ACOES[acao.dataset.acao].evento + '.';
      }
      if (e.target.closest('[data-desfazer]')) desfazerPrioridade();
    });
    $('#ficha').addEventListener('submit', (e) => {
      if (e.target.id !== 'form-reclassificar') return;
      e.preventDefault();
      salvarPrioridade(e.target);
    });
    $('#btn-imprimir').addEventListener('click', () => window.print());

    $('#alerta-emergencia-fechar').addEventListener('click', () => { $('#alerta-emergencia').hidden = true; });
    $('#alerta-emergencia-link').addEventListener('click', () => { $('#alerta-emergencia').hidden = true; });

    $('#btn-exportar').addEventListener('click', exportarCsv);
    $('#btn-exemplos').addEventListener('click', carregarExemplos);
    $('#btn-apagar').addEventListener('click', apagarTudo);

    // Outra aba (o totem) gravou algo.
    Armazenamento.observar(() => {
      const vista = vistaAtual();
      if (vista === 'vista-painel') renderizarPainel();
      else if (vista === 'vista-ficha') {
        // Não atrapalha quem está digitando o motivo.
        if (!$('#ficha').contains(document.activeElement)) renderizarFicha(fichaId);
        else detectarEmergencias();
      }
    });
  }

  return { iniciar, abrir, fechar };
})();

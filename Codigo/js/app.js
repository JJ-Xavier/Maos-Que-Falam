/*
 * app.js — lógica do protótipo.
 *
 * Protótipo sem back-end: a fila fica em localStorage. Serve para demonstrar
 * o fluxo e a classificação de risco, não para uso real.
 */

/* ------------------------------------------------------------------ */
/* Estado                                                              */
/* ------------------------------------------------------------------ */

const CHAVE_FILA = 'mqf.fila';

let indicePasso = 0;
let triagem = criarTriagemVazia();
let fichaAberta = null;

function criarTriagemVazia() {
  return {
    senha: null,
    nome: '',
    faixa: null,
    emergencia: false,
    respostas: {},   // { idDoPasso: [ids] | valor }
    criadaEm: null,
  };
}

/* ------------------------------------------------------------------ */
/* Atalhos de DOM                                                      */
/* ------------------------------------------------------------------ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function mostrarTela(id) {
  $$('.tela').forEach((t) => t.classList.remove('tela-ativa'));
  $('#' + id).classList.add('tela-ativa');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------------ */
/* Acessibilidade                                                      */
/* ------------------------------------------------------------------ */

let escalaFonte = 1;

$('#btn-fonte').addEventListener('click', () => {
  // Cicla entre 1x, 1.2x e 1.45x
  escalaFonte = escalaFonte >= 1.45 ? 1 : escalaFonte === 1 ? 1.2 : 1.45;
  document.documentElement.style.setProperty('--escala-fonte', escalaFonte);
  $('#btn-fonte').setAttribute('aria-pressed', escalaFonte > 1);
});

$('#btn-contraste').addEventListener('click', () => {
  const ativo = document.body.classList.toggle('alto-contraste');
  $('#btn-contraste').setAttribute('aria-pressed', ativo);
});

$('#btn-ler').addEventListener('click', () => {
  const alvo = $('.tela-ativa [data-falar]');
  const ajuda = $('.tela-ativa .pergunta-ajuda');
  if (!alvo || !('speechSynthesis' in window)) return;
  const texto = alvo.textContent + '. ' + (ajuda ? ajuda.textContent : '');
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  speechSynthesis.cancel();
  speechSynthesis.speak(fala);
});

/* ------------------------------------------------------------------ */
/* Tela de início                                                      */
/* ------------------------------------------------------------------ */

$('#btn-comecar').addEventListener('click', () => {
  triagem = criarTriagemVazia();
  montarFaixasEtarias();
  mostrarTela('tela-identificacao');
});

$('#btn-emergencia').addEventListener('click', () => {
  // Caminho curto: registra na hora, sem perguntar nada.
  triagem = criarTriagemVazia();
  triagem.emergencia = true;
  triagem.nome = 'Não identificado';
  finalizarTriagem();
});

$('#btn-abrir-painel').addEventListener('click', () => {
  renderizarFila();
  mostrarTela('tela-painel');
});

/* ------------------------------------------------------------------ */
/* Tela de identificação                                               */
/* ------------------------------------------------------------------ */

function montarFaixasEtarias() {
  const grade = $('#grade-idade');
  grade.innerHTML = '';
  FAIXAS_ETARIAS.forEach((faixa) => {
    const botao = criarBotaoOpcao(faixa);
    botao.addEventListener('click', () => {
      triagem.faixa = triagem.faixa === faixa.id ? null : faixa.id;
      grade.querySelectorAll('.botao-opcao').forEach((b) => {
        b.classList.toggle('selecionada', b.dataset.id === triagem.faixa);
      });
    });
    grade.appendChild(botao);
  });
}

$('#btn-identificacao-avancar').addEventListener('click', () => {
  triagem.nome = $('#entrada-nome').value.trim();
  indicePasso = 0;
  renderizarPasso();
  mostrarTela('tela-passo');
});

$$('[data-voltar]').forEach((b) =>
  b.addEventListener('click', () => mostrarTela('tela-inicio'))
);

/* ------------------------------------------------------------------ */
/* Construtores de componente                                          */
/* ------------------------------------------------------------------ */

function criarBotaoOpcao(opcao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-opcao';
  botao.dataset.id = opcao.id;
  botao.innerHTML =
    '<span class="opcao-icone" aria-hidden="true">' + (opcao.icone || '•') + '</span>' +
    '<span>' + opcao.rotulo + '</span>';
  return botao;
}

function criarChip(opcao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'chip';
  botao.dataset.id = opcao.id;
  botao.innerHTML =
    '<span class="chip-icone" aria-hidden="true">' + (opcao.icone || '•') + '</span>' +
    '<span>' + opcao.rotulo + '</span>';
  return botao;
}

/* ------------------------------------------------------------------ */
/* Renderização dos passos                                             */
/* ------------------------------------------------------------------ */

function renderizarPasso() {
  const passo = PASSOS[indicePasso];
  const corpo = $('#passo-corpo');

  $('#passo-titulo').textContent = passo.titulo;
  $('#passo-ajuda').textContent = passo.ajuda || '';

  const pct = ((indicePasso + 1) / PASSOS.length) * 100;
  $('#progresso-barra').style.width = pct + '%';
  $('#progresso-texto').textContent =
    'Pergunta ' + (indicePasso + 1) + ' de ' + PASSOS.length;

  corpo.innerHTML = '';

  if (passo.tipo === 'unica' || passo.tipo === 'multipla') {
    corpo.appendChild(renderizarGrade(passo));
  } else if (passo.tipo === 'corpo') {
    corpo.appendChild(renderizarCorpo(passo));
  } else if (passo.tipo === 'escala') {
    corpo.appendChild(renderizarEscala(passo));
  }
}

function renderizarGrade(passo) {
  const grade = document.createElement('div');
  grade.className = 'grade-opcoes';
  const selecionadas = triagem.respostas[passo.id] || [];

  passo.opcoes.forEach((opcao) => {
    const botao = criarBotaoOpcao(opcao);
    if (selecionadas.includes(opcao.id)) botao.classList.add('selecionada');

    botao.addEventListener('click', () => {
      alternarSelecao(passo, opcao);
      // Em escolha única, avança sozinho — menos toques para o paciente.
      if (passo.tipo === 'unica') {
        setTimeout(avancarPasso, 200);
      } else {
        renderizarPasso();
      }
    });

    grade.appendChild(botao);
  });

  return grade;
}

function alternarSelecao(passo, opcao) {
  const atuais = triagem.respostas[passo.id] || [];

  if (passo.tipo === 'unica') {
    triagem.respostas[passo.id] = [opcao.id];
    return;
  }

  // Opção exclusiva ("Nada disso") limpa as outras e vice-versa.
  if (opcao.exclusiva) {
    triagem.respostas[passo.id] = atuais.includes(opcao.id) ? [] : [opcao.id];
    return;
  }

  const exclusivas = (passo.opcoes || [])
    .filter((o) => o.exclusiva)
    .map((o) => o.id);

  let novas = atuais.filter((id) => !exclusivas.includes(id));
  novas = novas.includes(opcao.id)
    ? novas.filter((id) => id !== opcao.id)
    : novas.concat(opcao.id);

  triagem.respostas[passo.id] = novas;
}

function renderizarCorpo(passo) {
  const area = document.createElement('div');
  area.className = 'area-corpo';
  const marcadas = triagem.respostas[passo.id] || [];

  // --- Boneco clicável ---
  const boneco = document.createElement('div');
  boneco.className = 'boneco';
  boneco.innerHTML =
    '<svg viewBox="0 0 200 400" role="group" aria-label="Mapa do corpo">' +
      zona('cabeca', '<circle cx="100" cy="42" r="30"/>') +
      zona('garganta', '<rect x="86" y="70" width="28" height="16" rx="6"/>') +
      zona('peito', '<rect x="60" y="86" width="80" height="58" rx="12"/>') +
      zona('barriga', '<rect x="64" y="146" width="72" height="56" rx="12"/>') +
      zona('braco-d', '<rect x="32" y="92" width="24" height="112" rx="12"/>') +
      zona('braco-e', '<rect x="144" y="92" width="24" height="112" rx="12"/>') +
      zona('perna-d', '<rect x="68" y="206" width="28" height="140" rx="14"/>') +
      zona('perna-e', '<rect x="104" y="206" width="28" height="140" rx="14"/>') +
    '</svg>' +
    '<p class="boneco-legenda">Toque na parte do corpo</p>';

  function zona(id, forma) {
    const parte = PARTES_CORPO.find((p) => p.id === id);
    const classe = 'zona-corpo' + (marcadas.includes(id) ? ' marcada' : '');
    return (
      '<g class="' + classe + '" data-id="' + id + '" role="button" tabindex="0" ' +
      'aria-label="' + parte.rotulo + '">' + forma + '</g>'
    );
  }

  boneco.querySelectorAll('[data-id]').forEach((g) => {
    const acionar = () => {
      alternarSelecao({ id: passo.id, tipo: 'multipla', opcoes: [] }, { id: g.dataset.id });
      renderizarPasso();
    };
    g.addEventListener('click', acionar);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); acionar(); }
    });
  });

  // --- Botões das regiões que o boneco não mostra bem ---
  const extras = document.createElement('div');
  extras.className = 'partes-extras';
  extras.innerHTML = '<p class="rotulo-grupo">Ou escolha aqui</p>';

  const chips = document.createElement('div');
  chips.className = 'chips';
  PARTES_EXTRAS.forEach((parte) => {
    const chip = criarChip(parte);
    if (marcadas.includes(parte.id)) chip.classList.add('selecionada');
    chip.addEventListener('click', () => {
      alternarSelecao({ id: passo.id, tipo: 'multipla', opcoes: [] }, parte);
      renderizarPasso();
    });
    chips.appendChild(chip);
  });

  extras.appendChild(chips);
  area.appendChild(boneco);
  area.appendChild(extras);
  return area;
}

function renderizarEscala(passo) {
  const grade = document.createElement('div');
  grade.className = 'escala';
  const atual = triagem.respostas[passo.id];

  ESCALA.forEach((item) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'escala-item';
    botao.style.borderColor = item.cor;
    if (atual && atual[0] === String(item.valor)) botao.classList.add('selecionada');
    botao.innerHTML =
      '<span class="escala-carinha" aria-hidden="true">' + item.icone + '</span>' +
      '<span>' + item.rotulo + '</span>' +
      '<span class="escala-numero">' + item.valor + '/10</span>';
    botao.addEventListener('click', () => {
      triagem.respostas[passo.id] = [String(item.valor)];
      renderizarPasso();
      setTimeout(avancarPasso, 220);
    });
    grade.appendChild(botao);
  });

  return grade;
}

/* ------------------------------------------------------------------ */
/* Navegação entre passos                                              */
/* ------------------------------------------------------------------ */

function avancarPasso() {
  if (indicePasso < PASSOS.length - 1) {
    indicePasso += 1;
    renderizarPasso();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    finalizarTriagem();
  }
}

$('#btn-passo-avancar').addEventListener('click', avancarPasso);

$('#btn-passo-pular').addEventListener('click', () => {
  delete triagem.respostas[PASSOS[indicePasso].id];
  avancarPasso();
});

$('#btn-passo-voltar').addEventListener('click', () => {
  if (indicePasso === 0) {
    mostrarTela('tela-identificacao');
  } else {
    indicePasso -= 1;
    renderizarPasso();
  }
});

/* ------------------------------------------------------------------ */
/* Classificação de risco                                              */
/* ------------------------------------------------------------------ */

/*
 * Regra do protótipo: o nível final é o MAIOR nível entre todas as
 * respostas marcadas. É deliberadamente conservador — na dúvida, sobe a
 * prioridade, porque subestimar risco é o erro mais caro numa triagem.
 */
function classificar(t) {
  if (t.emergencia) {
    return { nivel: 5, motivos: ['Botão de emergência acionado pelo paciente'] };
  }

  let nivel = 1;
  const motivos = [];

  function considerar(candidato, motivo) {
    if (!candidato) return;
    if (candidato > nivel) { nivel = candidato; }
    if (candidato >= 4) { motivos.push(motivo); }
  }

  PASSOS.forEach((passo) => {
    const marcadas = t.respostas[passo.id] || [];

    if (passo.tipo === 'escala') {
      const valor = Number(marcadas[0]);
      if (!isNaN(valor)) {
        const item = ESCALA.find((e) => e.valor === valor);
        if (item) considerar(item.nivel, 'Dor relatada ' + valor + '/10');
      }
      return;
    }

    if (passo.tipo === 'corpo') {
      marcadas.forEach((id) => {
        const parte = PARTES_CORPO.find((p) => p.id === id);
        if (parte) considerar(parte.nivel, 'Queixa em: ' + parte.rotulo);
      });
      return;
    }

    (passo.opcoes || []).forEach((opcao) => {
      if (marcadas.includes(opcao.id)) considerar(opcao.nivel, opcao.rotulo);
    });
  });

  // Faixa etária pesa na prioridade (idoso sobe um degrau de atenção).
  const faixa = FAIXAS_ETARIAS.find((f) => f.id === t.faixa);
  if (faixa && faixa.nivel) considerar(faixa.nivel, 'Paciente idoso');

  return { nivel, motivos };
}

/* Alertas de comunicação e histórico que a equipe precisa ver em destaque. */
function coletarAlertas(t) {
  const alertas = [];
  PASSOS.forEach((passo) => {
    const marcadas = t.respostas[passo.id] || [];
    (passo.opcoes || []).forEach((opcao) => {
      if (marcadas.includes(opcao.id) && opcao.alerta) alertas.push(opcao.alerta);
    });
  });
  return alertas;
}

/* ------------------------------------------------------------------ */
/* Conclusão e persistência                                            */
/* ------------------------------------------------------------------ */

function gerarSenha() {
  const fila = carregarFila();
  const numero = (fila.length + 1).toString().padStart(3, '0');
  return 'MQF-' + numero;
}

function carregarFila() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FILA)) || [];
  } catch (e) {
    return [];
  }
}

function salvarFila(fila) {
  try {
    localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
  } catch (e) {
    // Em navegação privada o storage pode falhar; o protótipo segue em memória.
    console.warn('Não foi possível salvar a fila:', e);
  }
}

function finalizarTriagem() {
  triagem.senha = gerarSenha();
  triagem.criadaEm = new Date().toISOString();
  const { nivel } = classificar(triagem);
  triagem.nivel = nivel;

  const fila = carregarFila();
  fila.push(triagem);
  salvarFila(fila);

  const info = NIVEIS[nivel];
  $('#senha-gerada').textContent = triagem.senha;

  const cartao = $('#cartao-nivel-paciente');
  cartao.style.setProperty('--nivel-cor', info.cor);
  cartao.innerHTML =
    '<div class="cartao-nivel-titulo">' + info.rotulo + '</div>' +
    '<div class="cartao-nivel-espera">Previsão de espera: ' + info.espera + '</div>';

  fichaAberta = triagem;
  mostrarTela('tela-obrigado');
}

$('#btn-nova-triagem').addEventListener('click', () => {
  triagem = criarTriagemVazia();
  mostrarTela('tela-inicio');
});

$('#btn-ver-ficha').addEventListener('click', () => {
  renderizarFicha(fichaAberta);
  mostrarTela('tela-ficha');
});

/* ------------------------------------------------------------------ */
/* Painel da equipe                                                    */
/* ------------------------------------------------------------------ */

function renderizarFila() {
  const area = $('#fila-pacientes');
  const fila = carregarFila();

  if (!fila.length) {
    area.innerHTML =
      '<div class="fila-vazia">Nenhuma triagem registrada ainda.<br>' +
      'Faça uma no modo paciente para ver a fila.</div>';
    return;
  }

  // Maior risco primeiro; empate resolvido por ordem de chegada.
  const ordenada = fila.slice().sort((a, b) => {
    if (b.nivel !== a.nivel) return b.nivel - a.nivel;
    return new Date(a.criadaEm) - new Date(b.criadaEm);
  });

  area.innerHTML = '';
  ordenada.forEach((t) => {
    const info = NIVEIS[t.nivel] || NIVEIS[1];
    const cartao = document.createElement('button');
    cartao.type = 'button';
    cartao.className = 'cartao-paciente';
    cartao.style.setProperty('--nivel-cor', info.cor);

    const hora = new Date(t.criadaEm).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit',
    });

    cartao.innerHTML =
      '<span class="cartao-senha">' + t.senha + '</span>' +
      '<span class="cartao-corpo">' +
        '<span class="cartao-nome">' + (t.nome || 'Sem identificação') + '</span>' +
        '<span class="cartao-resumo">' + resumirQueixas(t) + ' · ' + hora + '</span>' +
      '</span>' +
      '<span class="etiqueta-nivel">' + info.nome + '</span>';

    cartao.addEventListener('click', () => {
      renderizarFicha(t);
      mostrarTela('tela-ficha');
    });

    area.appendChild(cartao);
  });
}

function resumirQueixas(t) {
  if (t.emergencia) return 'EMERGÊNCIA acionada pelo paciente';
  const passo = PASSOS.find((p) => p.id === 'sintomas');
  const ids = t.respostas.sintomas || [];
  const nomes = ids
    .map((id) => (passo.opcoes.find((o) => o.id === id) || {}).rotulo)
    .filter(Boolean);
  return nomes.length ? nomes.slice(0, 3).join(', ') : 'Sem queixa registrada';
}

$('#btn-painel-sair').addEventListener('click', () => mostrarTela('tela-inicio'));

$('#btn-limpar-fila').addEventListener('click', () => {
  if (confirm('Apagar todas as triagens deste navegador?')) {
    salvarFila([]);
    renderizarFila();
  }
});

/* ------------------------------------------------------------------ */
/* Ficha detalhada                                                     */
/* ------------------------------------------------------------------ */

function renderizarFicha(t) {
  if (!t) return;
  const area = $('#ficha-conteudo');
  const { nivel, motivos } = classificar(t);
  const info = NIVEIS[nivel];
  const alertas = coletarAlertas(t);

  let html = '';

  // Cabeçalho com o nível de risco
  html +=
    '<div class="cartao-nivel" style="--nivel-cor:' + info.cor + '">' +
      '<div class="cartao-nivel-titulo">' + t.senha + ' — ' + info.nome + ' · ' + info.rotulo + '</div>' +
      '<div class="cartao-nivel-espera">Atendimento previsto: ' + info.espera +
      (motivos.length ? ' · ' + motivos.join(' | ') : '') + '</div>' +
    '</div>';

  // Alertas de comunicação / histórico
  alertas.forEach((a) => {
    html += '<div class="ficha-alerta">⚠️ ' + a + '</div>';
  });

  // Identificação
  const faixa = FAIXAS_ETARIAS.find((f) => f.id === t.faixa);
  html +=
    '<div class="ficha-bloco">' +
      '<h3>Identificação</h3>' +
      '<div class="ficha-lista">' +
        '<span class="ficha-item">👤 ' + (t.nome || 'Sem identificação') + '</span>' +
        '<span class="ficha-item">' + (faixa ? faixa.icone + ' ' + faixa.rotulo : '❓ Idade não informada') + '</span>' +
        '<span class="ficha-item">🕐 ' + new Date(t.criadaEm).toLocaleString('pt-BR') + '</span>' +
      '</div>' +
    '</div>';

  // Um bloco por passo respondido
  PASSOS.forEach((passo) => {
    const marcadas = t.respostas[passo.id] || [];
    let itens = '';

    if (passo.tipo === 'escala') {
      const item = ESCALA.find((e) => e.valor === Number(marcadas[0]));
      if (item) {
        itens = '<span class="ficha-item">' + item.icone + ' ' + item.rotulo +
                ' (' + item.valor + '/10)</span>';
      }
    } else if (passo.tipo === 'corpo') {
      itens = marcadas.map((id) => {
        const parte = PARTES_CORPO.find((p) => p.id === id) ||
                      PARTES_EXTRAS.find((p) => p.id === id);
        return parte ? '<span class="ficha-item">📍 ' + parte.rotulo + '</span>' : '';
      }).join('');
    } else {
      itens = marcadas.map((id) => {
        const opcao = (passo.opcoes || []).find((o) => o.id === id);
        return opcao ? '<span class="ficha-item">' + (opcao.icone || '') + ' ' + opcao.rotulo + '</span>' : '';
      }).join('');
    }

    html +=
      '<div class="ficha-bloco">' +
        '<h3>' + passo.titulo + '</h3>' +
        (itens
          ? '<div class="ficha-lista">' + itens + '</div>'
          : '<p class="ficha-vazio">Não respondido / pulado</p>') +
      '</div>';
  });

  area.innerHTML = html;
}

$('#btn-ficha-voltar').addEventListener('click', () => {
  renderizarFila();
  mostrarTela('tela-painel');
});

$('#btn-imprimir').addEventListener('click', () => window.print());

/*
 * interface.js — peças de interface usadas pelo totem e pelo painel:
 * atalhos de DOM, ícones, troca de tela, diálogo de confirmação, leitura em
 * voz alta e os controles de acessibilidade do topo.
 */

const $ = (seletor, raiz) => (raiz || document).querySelector(seletor);
const $$ = (seletor, raiz) => Array.from((raiz || document).querySelectorAll(seletor));

/* Escapa texto antes de ir para innerHTML. Use em TODO dado dinâmico. */
function esc(valor) {
  return String(valor === undefined || valor === null ? '' : valor).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function emoji(icone) {
  return '<span class="emoji" aria-hidden="true">' + esc(icone) + '</span>';
}

/* ------------------------------------------------------------------ */
/* Ícones (traço, 24×24, herdam a cor do texto)                        */
/* ------------------------------------------------------------------ */

const ICONES = {
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  avancar: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  letra: '<path d="M2.5 19L8 5l5.5 14M4.6 14h6.8"/><path d="M14.5 19l3.5-9 3.5 9M15.8 16h4.4"/>',
  contraste: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  ouvir: '<path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
  socorro: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="1.1" fill="currentColor"/>',
  imprimir: '<path d="M7 9V3h10v6M7 17H4v-8h16v8h-3"/><path d="M7 14h10v7H7z"/>',
  sair: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  telaCheia: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  alerta: '<path d="M12 3.5l9.5 17h-19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.5" r="1" fill="currentColor"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  baixar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
};

function icone(nome) {
  return (
    '<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICONES[nome] || '') + '</svg>'
  );
}

/* Coloca o ícone de `data-icone` no começo (ou no fim, com data-icone-fim). */
function aplicarIcones(raiz) {
  $$('[data-icone]', raiz).forEach((el) => {
    el.insertAdjacentHTML('afterbegin', icone(el.dataset.icone));
    el.removeAttribute('data-icone');
  });
  $$('[data-icone-fim]', raiz).forEach((el) => {
    el.insertAdjacentHTML('beforeend', icone(el.dataset.iconeFim));
    el.removeAttribute('data-icone-fim');
  });
}

/* ------------------------------------------------------------------ */
/* Troca de tela                                                       */
/* ------------------------------------------------------------------ */

const VISTAS_EQUIPE = ['vista-pin', 'vista-painel', 'vista-ficha'];

function mostrarVista(id, opcoes) {
  const { titulo, focar = true } = opcoes || {};
  const equipe = VISTAS_EQUIPE.includes(id);

  $$('.vista').forEach((v) => { v.hidden = v.id !== id; });
  document.body.classList.toggle('modo-equipe', equipe);
  document.body.classList.toggle('modo-paciente', !equipe);
  document.body.dataset.vista = id;
  $('#topo-paciente').hidden = equipe;
  $('#topo-equipe').hidden = !equipe;
  document.title = (titulo ? titulo + ' | ' : '') + 'Mãos Que Falam';

  window.scrollTo(0, 0);
  if (focar) {
    const titulo1 = $('#' + id + ' h1');
    if (titulo1) titulo1.focus({ preventScroll: true });
  }
}

function vistaAtual() {
  return document.body.dataset.vista || '';
}

/* ------------------------------------------------------------------ */
/* Diálogo de confirmação                                              */
/* ------------------------------------------------------------------ */

function confirmar({ titulo, texto, rotulo, perigo }) {
  const dialogo = $('#dialogo-confirmar');
  $('#confirmar-titulo').textContent = titulo;
  $('#confirmar-texto').textContent = texto;
  const ok = $('#confirmar-ok');
  ok.textContent = rotulo || 'Confirmar';
  ok.classList.toggle('botao-perigo', Boolean(perigo));
  dialogo.returnValue = '';
  dialogo.showModal();

  return new Promise((resolve) => {
    dialogo.addEventListener('close', () => {
      resolve(dialogo.returnValue === 'ok');
      dialogo.returnValue = '';
    }, { once: true });
  });
}

/* ------------------------------------------------------------------ */
/* Leitura em voz alta                                                 */
/* ------------------------------------------------------------------ */

const Fala = {
  ativa: false,
  disponivel: 'speechSynthesis' in window,

  vozPortugues() {
    const vozes = speechSynthesis.getVoices();
    const lang = (v) => (v.lang || '').replace('_', '-').toLowerCase();
    return vozes.find((v) => lang(v) === 'pt-br') || vozes.find((v) => lang(v).startsWith('pt'));
  },

  /* interromper=true corta o que estiver sendo lido (novo toque do paciente).
     interromper=false entra na fila (ex.: ler a próxima pergunta depois do
     rótulo da opção tocada). */
  falar(texto, interromper) {
    if (!this.ativa || !this.disponivel || !texto) return;
    if (interromper) speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 0.9;
    const voz = this.vozPortugues();
    if (voz) fala.voice = voz;
    speechSynthesis.speak(fala);
  },

  parar() {
    if (this.disponivel) speechSynthesis.cancel();
  },

  /* Lê os textos marcados com data-falar na tela visível. */
  lerTela(interromper) {
    const vista = $('.vista:not([hidden])');
    if (!vista) return;
    const partes = $$('[data-falar]', vista)
      .map((el) => el.textContent.trim())
      .filter(Boolean);
    this.falar(partes.join('. '), interromper !== false);
  },
};

/* ------------------------------------------------------------------ */
/* Controles de acessibilidade do topo                                 */
/* ------------------------------------------------------------------ */

const Acessibilidade = (() => {
  const ESCALAS = [1, 1.2, 1.4];
  const NOMES = ['normal', 'grande', 'muito grande'];
  let indice = 0;

  function aplicarFonte() {
    document.documentElement.style.setProperty('--escala', ESCALAS[indice]);
    const botao = $('#btn-fonte');
    botao.dataset.nivel = indice;
    $('#fonte-atual').textContent = ', tamanho atual: ' + NOMES[indice];
  }

  function alternarContraste(ligar) {
    const ativo = document.body.classList.toggle('alto-contraste', ligar);
    $('#btn-contraste').setAttribute('aria-pressed', ativo);
  }

  function alternarFala(ligar) {
    Fala.ativa = ligar;
    $('#btn-ouvir').setAttribute('aria-pressed', ligar);
    if (ligar) Fala.lerTela();
    else Fala.parar();
  }

  function iniciar() {
    $('#btn-fonte').addEventListener('click', () => {
      indice = (indice + 1) % ESCALAS.length;
      aplicarFonte();
    });
    $('#btn-contraste').addEventListener('click', () => alternarContraste());
    $('#btn-ouvir').addEventListener('click', () => alternarFala(!Fala.ativa));
    if (!Fala.disponivel) $('#btn-ouvir').hidden = true;
    aplicarFonte();
  }

  /* Volta ao padrão. Chamado quando um paciente termina, para o próximo
     não herdar as preferências de quem usou o totem antes. */
  function resetar() {
    indice = 0;
    aplicarFonte();
    alternarContraste(false);
    alternarFala(false);
  }

  return { iniciar, resetar };
})();

/* ------------------------------------------------------------------ */
/* Formatação                                                          */
/* ------------------------------------------------------------------ */

function hora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function textoMinutos(minutos) {
  if (minutos < 1) return 'menos de 1 min';
  if (minutos < 60) return minutos + ' min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h + ' h' + (m ? ' ' + m + ' min' : '');
}

function textoDuracao(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return s + ' s';
  return Math.floor(s / 60) + ' min' + (s % 60 ? ' ' + (s % 60) + ' s' : '');
}

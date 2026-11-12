/*
 * armazenamento.js — onde as triagens ficam guardadas.
 *
 * Protótipo sem back-end: tudo vai para o localStorage deste navegador.
 * O totem e o painel da equipe podem ficar em abas diferentes do mesmo
 * navegador; o evento "storage" avisa uma aba quando a outra grava.
 *
 * Se o localStorage não estiver disponível (navegação privada, por
 * exemplo), os dados ficam só na memória até a página ser recarregada.
 */

const Armazenamento = (() => {
  const CHAVE = 'mqf.v2.triagens';
  const CHAVE_CONTADOR = 'mqf.v2.contador';
  let memoria = null;

  function ler(chave) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : null;
    } catch (e) {
      return null;
    }
  }

  function gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
      console.warn('Não foi possível gravar no localStorage; seguindo só em memória.', e);
    }
  }

  function listar() {
    const salvas = ler(CHAVE);
    if (Array.isArray(salvas)) return salvas;
    return memoria ? JSON.parse(JSON.stringify(memoria)) : [];
  }

  function gravarLista(lista) {
    memoria = lista;
    gravar(CHAVE, lista);
  }

  function obter(id) {
    return listar().find((t) => t.id === id) || null;
  }

  /* Insere ou substitui a triagem inteira. */
  function salvar(triagem) {
    const lista = listar();
    const i = lista.findIndex((t) => t.id === triagem.id);
    if (i >= 0) lista[i] = triagem;
    else lista.push(triagem);
    gravarLista(lista);
  }

  /* Lê a versão mais recente, aplica a mudança e grava. Use isto sempre que
     outra aba puder ter alterado a mesma triagem. */
  function atualizar(id, mudar) {
    const lista = listar();
    const triagem = lista.find((t) => t.id === id);
    if (!triagem) return null;
    mudar(triagem);
    gravarLista(lista);
    return triagem;
  }

  function apagarTudo() {
    gravarLista([]);
    gravar(CHAVE_CONTADOR, null);
  }

  /* Senha sequencial que recomeça todo dia: MQF-001, MQF-002... */
  function proximaSenha() {
    const hoje = dataLocal();
    let contador = ler(CHAVE_CONTADOR);
    if (!contador || contador.data !== hoje) contador = { data: hoje, n: 0 };
    contador.n += 1;
    gravar(CHAVE_CONTADOR, contador);
    return CONFIG.prefixoSenha + '-' + String(contador.n).padStart(3, '0');
  }

  /* Chama `aoMudar` quando outra aba gravar triagens. */
  function observar(aoMudar) {
    window.addEventListener('storage', (e) => {
      if (e.key === CHAVE || e.key === null) aoMudar();
    });
  }

  return { listar, obter, salvar, atualizar, apagarTudo, proximaSenha, observar };
})();

/* Data local no formato AAAA-MM-DD. */
function dataLocal(data) {
  return (data || new Date()).toLocaleDateString('sv-SE');
}

function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

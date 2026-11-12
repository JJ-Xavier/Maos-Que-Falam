/*
 * app.js — liga tudo e decide qual lado mostrar.
 *
 *   index.html            totem do paciente
 *   index.html#/equipe    painel da equipe (pede PIN)
 *
 * O painel pode ficar aberto em outra aba ou outro monitor do mesmo
 * computador; as duas abas se atualizam sozinhas.
 */

function rotear() {
  const partes = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (partes[0] === 'equipe') {
    Equipe.abrir(partes.slice(1));
  } else {
    Equipe.fechar();
    Paciente.mostrarInicio();
  }
}

aplicarIcones(document);
$$('[data-versao]').forEach((el) => { el.textContent = CONFIG.versao; });
Acessibilidade.iniciar();
Inatividade.iniciarEventos();
Paciente.iniciar();
Equipe.iniciar();

window.addEventListener('hashchange', rotear);
rotear();

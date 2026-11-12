/*
 * config.js — ajustes de instalação.
 *
 * Tudo o que muda de uma unidade para outra fica aqui, para não precisar
 * mexer na lógica do app.
 */

const CONFIG = {
  // Nome do lugar onde o totem está. Aparece no painel quando alguém pede ajuda.
  localTotem: 'Recepção principal',

  // Prefixo da senha entregue ao paciente (MQF-001, MQF-002...). Zera todo dia.
  prefixoSenha: 'MQF',

  // PIN do painel da equipe. ATENÇÃO: isto só evita que um paciente abra o
  // painel sem querer. Não é segurança — qualquer pessoa pode ler este arquivo.
  pinEquipe: '1234',

  // Mostra o PIN na tela de acesso. Útil em demonstração; desligue no piloto.
  mostrarDicaPin: true,

  // Segundos sem nenhum toque até perguntar "Você ainda está aí?".
  inatividadeSegundos: 90,

  // Segundos que o aviso de inatividade espera antes de voltar ao início.
  avisoInatividadeSegundos: 20,

  // Segundos até a tela "Pronto" voltar sozinha para o início.
  retornoAutomaticoSegundos: 30,

  // Segundos até a tela de emergência voltar sozinha para o início.
  retornoEmergenciaSegundos: 180,

  // Pausa depois de um toque em escolha única, para a pessoa ver o que marcou
  // antes de a tela mudar.
  atrasoAvancoMs: 450,

  // De quanto em quanto tempo o painel da equipe recalcula os tempos de espera.
  atualizarPainelSegundos: 30,
};

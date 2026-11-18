/* home.js — Página inicial: data de hoje + acessos rápidos */
document.getElementById('currentDate').innerText = new Date().toLocaleDateString('pt-PT', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

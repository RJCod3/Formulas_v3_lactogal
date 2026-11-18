/* calculos_sap.js — Página Cálculos SAP
 * qtdSAP = quantidade − quantidade de nata a remover para atingir a gordura
 * pretendida (regra mistura: qtdNata = qtd × (gLeite − gPret) / (gNata − gPret)) */

import { guardarDados, lerDados } from '../modules/storage.js';
import { preencherCampo, valorNumerico } from '../modules/format.js';

const CAMPOS = ['quantidade', 'gorduraPret', 'gorduraLeite', 'gorduraNata'];

function calcularSAP() {
  const semValores = CAMPOS.every((id) => document.getElementById(id).value.trim() === '');
  if (semValores) {
    document.getElementById('qtdSap').innerText = '';
    return;
  }

  const qtd = valorNumerico('quantidade');
  const gorduraPret = valorNumerico('gorduraPret');
  const gorduraLeite = valorNumerico('gorduraLeite');
  const gorduraNata = valorNumerico('gorduraNata');

  let qtdSap = 0;
  if (gorduraNata - gorduraPret !== 0) {
    const qtdNataRemovida = (qtd * (gorduraLeite - gorduraPret)) / (gorduraNata - gorduraPret);
    qtdSap = qtd - qtdNataRemovida;
  }
  document.getElementById('qtdSap').innerText = qtdSap.toFixed(0);
}

function salvarDados() {
  guardarDados('lactogal_sap', {
    qtd: document.getElementById('quantidade').value,
    gPret: document.getElementById('gorduraPret').value,
    gLeite: document.getElementById('gorduraLeite').value,
    gNata: document.getElementById('gorduraNata').value,
  });
}

function carregarDados() {
  const dados = lerDados('lactogal_sap');
  preencherCampo('quantidade', dados.qtd, '');
  preencherCampo('gorduraPret', dados.gPret, '');
  preencherCampo('gorduraLeite', dados.gLeite, '');
  preencherCampo('gorduraNata', dados.gNata, '');
  calcularSAP();
}

CAMPOS.forEach((id) =>
  document.getElementById(id).addEventListener('input', () => {
    calcularSAP();
    salvarDados();
  })
);

carregarDados();

'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const state = { role: null, filme: '' };

const el = {
  filme:      $('#step-filme'),
  confirma:   $('#step-confirma'),
  pronto:     $('#step-pronto'),
  filmeInput: $('#filme-manual'),
  manualOk:   $('#manual-ok'),
  statusFilme:$('#status-filme'),
  obs:        $('#obs'),
  status:     $('#status'),
  resumo:     $('#resumo'),
  enviar:     $('#enviar')
};

/* ---------- 01 · escolha do role ---------- */
$$('.opt').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.opt').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');

    state.role = btn.dataset.role;
    state.filme = '';
    el.filmeInput.value = '';
    el.statusFilme.textContent = '';
    el.status.textContent = '';
    el.confirma.hidden = true;
    el.pronto.hidden = true;

    if (state.role === 'anexo') {
      el.filme.hidden = true;
      abrirConfirma();
    } else {
      el.filme.hidden = false;
      el.filme.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- 02 · filme digitado ---------- */
el.manualOk.addEventListener('click', () => {
  const v = el.filmeInput.value.trim();
  if (!v) {
    el.statusFilme.textContent = 'escreve o filme primeiro.';
    el.filmeInput.focus();
    return;
  }
  state.filme = v;
  el.statusFilme.textContent = '';
  abrirConfirma();
});

el.filmeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') el.manualOk.click();
});

/* ---------- navegação entre passos ---------- */
function abrirConfirma() {
  el.confirma.hidden = false;
  el.pronto.hidden = true;
  el.confirma.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$('#voltar-1').addEventListener('click', () => {
  el.filme.hidden = true;
  el.confirma.hidden = true;
});

$('#voltar-2').addEventListener('click', () => {
  el.confirma.hidden = true;
});

/* ---------- 03 · envio ---------- */
el.enviar.addEventListener('click', async () => {
  if (!state.role) return;

  if (state.role !== 'anexo' && !state.filme) {
    el.status.textContent = 'escolhe um filme primeiro.';
    return;
  }

  el.enviar.disabled = true;
  el.status.textContent = 'salvando…';

  try {
    const res = await fetch('/api/resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role:  state.role,
        filme: state.filme,
        obs:   el.obs.value.trim()
      })
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.erro || 'erro desconhecido');

    mostrarPronto();
  } catch (e) {
    el.status.textContent = 'não deu pra salvar: ' + e.message;
  } finally {
    el.enviar.disabled = false;
  }
});

/* ---------- 04 · resumo ---------- */
function labelRole(r) {
  if (r === 'anexo')   return 'anexo — comer e beber trocando ideia';
  if (r === 'cinema')  return 'cinema — filme + lanche depois';
  if (r === 'os dois') return 'fazer os dois — cinema + anexo';
  return '—';
}

function mostrarPronto() {
  el.confirma.hidden = true;
  el.filme.hidden = true;
  el.pronto.hidden = false;

  const linhas = [
    ['role',  labelRole(state.role)],
    ['filme', state.filme || '—'],
    ['obs',   el.obs.value.trim() || '—']
  ];

  el.resumo.innerHTML = linhas
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');

  el.pronto.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- recomeçar ---------- */
$('#recomecar').addEventListener('click', () => {
  state.role = null;
  state.filme = '';
  el.filmeInput.value = '';
  el.obs.value = '';
  el.statusFilme.textContent = '';
  el.status.textContent = '';

  $$('.opt').forEach((b) => b.setAttribute('aria-pressed', 'false'));

  el.filme.hidden = true;
  el.confirma.hidden = true;
  el.pronto.hidden = true;

  window.scrollTo({ top: 0, behavior: 'smooth' });
});
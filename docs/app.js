const listEl = document.getElementById('releaseList');
const detailsEl = document.getElementById('releaseDetails');
const kpisEl = document.getElementById('kpis');
const searchEl = document.getElementById('search');
const sortOrderEl = document.getElementById('sortOrder');

let releases = [];
let selectedVersion = null;
let filteredReleases = [];

const fmtDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
};

const monthLabel = (value) => {
  if (!value) return 'Sem data';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Sem data';
  return `${d.toLocaleDateString('pt-BR', { month: 'long' })} ${d.getFullYear()}`;
};

const safeArray = (v) => (Array.isArray(v) ? v : []);
const getRepoRootUrl = (release) => {
  const compareUrl = release?.commits?.compareUrl || '';
  const prUrl = release?.pr?.url || '';

  if (compareUrl.includes('/compare/')) {
    return compareUrl.split('/compare/')[0];
  }
  if (prUrl.includes('/pull/')) {
    return prUrl.split('/pull/')[0];
  }
  return 'https://github.com/brenokf/SmartSimulate';
};

const buildKpis = () => {
  const total = releases.length;
  const files = releases.reduce((acc, r) => acc + safeArray(r.changedFiles).length, 0);
  const approvers = new Set(releases.flatMap((r) => safeArray(r.approvedBy)));
  const latest = releases[0]?.version || '—';

  kpisEl.innerHTML = `
    <article class="kpi"><span>Total releases</span><b>${total}</b></article>
    <article class="kpi"><span>Arquivos impactados</span><b>${files}</b></article>
    <article class="kpi"><span>Aprovadores únicos</span><b>${approvers.size}</b></article>
    <article class="kpi"><span>Última versão</span><b>${latest}</b></article>
  `;
};

const getVisibleReleases = (query = '') => {
  const q = query.trim().toLowerCase();
  const filtered = releases.filter((r) => {
    const haystack = [r.version, r.ticket, r.author, r?.pr?.title].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  const sortDirection = sortOrderEl?.value === 'asc' ? 1 : -1;
  filtered.sort((a, b) => {
    const da = (a.date || '');
    const db = (b.date || '');
    return da.localeCompare(db) * sortDirection;
  });

  return filtered;
};

const groupByMonth = (items) => {
  const map = new Map();
  items.forEach((release) => {
    const key = monthLabel(release.date);
    const group = map.get(key) || [];
    group.push(release);
    map.set(key, group);
  });
  return [...map.entries()];
};

const renderList = (query = '') => {
  filteredReleases = getVisibleReleases(query);

  if (filteredReleases.length === 0) {
    listEl.innerHTML = '<p class="muted">Nenhuma release encontrada.</p>';
    detailsEl.innerHTML = '<div class="empty-state"><h3>Sem resultados</h3><p>Refine a busca para encontrar uma release.</p></div>';
    return;
  }

  if (!filteredReleases.some((r) => r.version === selectedVersion)) {
    selectedVersion = filteredReleases[0].version;
  }

  const groups = groupByMonth(filteredReleases);

  listEl.innerHTML = groups
    .map(([label, items]) => `
      <section class="release-group">
        <h5>${label}</h5>
        ${items
          .map(
            (r) => `
            <article class="release-card ${selectedVersion === r.version ? 'active' : ''}" data-version="${r.version}">
              <h4>${r.version}</h4>
              <p>${r.ticket || 'Sem ticket'} • ${fmtDate(r.date)} • ${r.author || 'N/A'}</p>
              <div class="tagline">
                <span class="tag">${safeArray(r.changedFiles).length} arquivos</span>
                <span class="tag">${safeArray(r.approvedBy).length} aprovadores</span>
              </div>
            </article>
          `
          )
          .join('')}
      </section>
    `)
    .join('');

  listEl.querySelectorAll('.release-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectedVersion = card.dataset.version;
      renderList(searchEl.value);
      renderDetails();
    });
  });
};

const markdownToText = (md = '') => {
  return md
    .replace(/^###\s?/gm, '')
    .replace(/^##\s?/gm, '')
    .replace(/^#\s?/gm, '')
    .replace(/^[-*]\s?/gm, '• ')
    .replace(/\r/g, '')
    .trim();
};

const renderDetails = async () => {
  const source = filteredReleases.length > 0 ? filteredReleases : releases;
  const release = source.find((r) => r.version === selectedVersion) || source[0];
  if (!release) return;

  selectedVersion = release.version;
  const currentIndex = source.findIndex((item) => item.version === release.version);
  const prevRelease = currentIndex > 0 ? source[currentIndex - 1] : null;
  const nextRelease = currentIndex >= 0 && currentIndex < source.length - 1 ? source[currentIndex + 1] : null;

  const fileItems = safeArray(release.fileLinks)
    .slice(0, 20)
    .map((f) => `<li><a href="${f.url}" target="_blank" rel="noreferrer">${f.path}</a></li>`)
    .join('');

  const approvers = safeArray(release.approvedBy).length ? safeArray(release.approvedBy).join(', ') : 'Sem aprovação registrada';
  const repoRootUrl = getRepoRootUrl(release);

  detailsEl.innerHTML = `
    <div class="release-title">
      <h2>${release.version}</h2>
      <span class="muted">${fmtDate(release.date)}</span>
    </div>
    <p class="muted">Ticket: <b>${release.ticket || 'N/A'}</b> • Autor: <b>${release.author || 'N/A'}</b></p>
    <div class="nav-actions">
      <button id="prevRelease" ${!prevRelease ? 'disabled' : ''}>← Release anterior</button>
      <button id="nextRelease" ${!nextRelease ? 'disabled' : ''}>Próxima release →</button>
    </div>

    <div class="actions">
      ${release?.pr?.url ? `<a href="${release.pr.url}" target="_blank" rel="noreferrer">PR #${release.pr.number || ''}</a>` : ''}
      ${release?.commits?.compareUrl ? `<a href="${release.commits.compareUrl}" target="_blank" rel="noreferrer">Comparar alterações</a>` : ''}
      ${release?.docs?.changeLogUrl ? `<a href="${release.docs.changeLogUrl}" target="_blank" rel="noreferrer">Abrir changelog</a>` : ''}
      ${release?.docs?.releaseDocUrl ? `<a href="${release.docs.releaseDocUrl}" target="_blank" rel="noreferrer">Documento da release</a>` : ''}
      ${release?.commits?.base ? `<a href="${repoRootUrl}/commit/${release.commits.base}" target="_blank" rel="noreferrer">Commit base</a>` : ''}
      ${release?.commits?.head ? `<a href="${repoRootUrl}/commit/${release.commits.head}" target="_blank" rel="noreferrer">Commit novo</a>` : ''}
    </div>

    <div class="grid2">
      <section class="card">
        <h3>Resumo executivo</h3>
        <ul class="clean">
          <li>Versão anterior: ${release?.commits?.previousVersion || 'N/A'}</li>
          <li>Aprovado por: ${approvers}</li>
          <li>Arquivos alterados: ${safeArray(release.changedFiles).length}</li>
        </ul>
      </section>
      <section class="card">
        <h3>Arquivos alterados</h3>
        <ul class="clean">${fileItems || '<li>Sem arquivos registrados</li>'}</ul>
      </section>
    </div>

    <section class="doc-view">
      <h3>Visão do documento técnico-humanizado</h3>
      <pre id="docPreview">Carregando...</pre>
    </section>
  `;

  document.getElementById('prevRelease')?.addEventListener('click', () => {
    if (!prevRelease) return;
    selectedVersion = prevRelease.version;
    renderList(searchEl.value);
    renderDetails();
  });

  document.getElementById('nextRelease')?.addEventListener('click', () => {
    if (!nextRelease) return;
    selectedVersion = nextRelease.version;
    renderList(searchEl.value);
    renderDetails();
  });

  const preview = document.getElementById('docPreview');
  try {
    if (!release?.docs?.releaseDocPath) {
      preview.textContent = 'Documento da release não encontrado.';
      return;
    }
    const docUrl = `./${String(release.docs.releaseDocPath).replace(/^docs\//, '')}`;
    const response = await fetch(docUrl);
    if (!response.ok) {
      preview.textContent = 'Não foi possível carregar o documento da release.';
      return;
    }
    const md = await response.text();
    preview.textContent = markdownToText(md);
  } catch {
    preview.textContent = 'Falha ao carregar prévia do documento.';
  }
};

const bootstrap = async () => {
  try {
    const response = await fetch('./releases.json');
    if (!response.ok) throw new Error('No releases.json');
    const data = await response.json();
    releases = safeArray(data.releases);
  } catch {
    releases = [];
  }

  releases.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  selectedVersion = releases[0]?.version || null;
  buildKpis();
  renderList();
  renderDetails();
};

searchEl?.addEventListener('input', () => {
  renderList(searchEl.value);
  renderDetails();
});

sortOrderEl?.addEventListener('change', () => {
  renderList(searchEl.value);
  renderDetails();
});

bootstrap();

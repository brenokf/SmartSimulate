const elements = {
  list: document.getElementById("release-list"),
  detail: document.getElementById("detail"),
  empty: document.getElementById("empty-list"),
  search: document.getElementById("search"),
  total: document.getElementById("total-releases"),
  updated: document.getElementById("last-updated"),
};

const state = {
  releases: [],
  filtered: [],
  activeId: null,
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatNumber = (value) => {
  if (value === undefined || value === null) return "--";
  return String(value);
};

const parseMetadataDate = (timestamp) => {
  if (!timestamp) return "--";
  const asNumber = Number(timestamp);
  if (!Number.isNaN(asNumber)) {
    return formatDate(asNumber * 1000);
  }
  return formatDate(timestamp);
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatMultiline = (value) => {
  const safe = escapeHtml(value || "").trim();
  if (!safe) {
    return "--";
  }
  return safe.replace(/\r?\n/g, "<br />");
};

const renderList = () => {
  elements.list.innerHTML = "";
  if (state.filtered.length === 0) {
    elements.empty.classList.remove("hidden");
    return;
  }
  elements.empty.classList.add("hidden");

  state.filtered.forEach((release) => {
    const item = document.createElement("li");
    item.className = "release-item";
    const isActive = state.activeId === release.version;

    const title = document.createElement("h3");
    title.textContent = release.version || "Release";

    const releaseTitle = document.createElement("p");
    releaseTitle.className = "release-title";
    releaseTitle.textContent = release.pr?.title || "Untitled change";

    const subtitle = document.createElement("p");
    subtitle.textContent = `${release.ticket || "--"} • ${formatDate(release.date)}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "release-button";
    if (isActive) {
      button.classList.add("active");
      button.setAttribute("aria-current", "true");
    }
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.appendChild(title);
    button.appendChild(releaseTitle);
    button.appendChild(subtitle);
    button.addEventListener("click", () => {
      state.activeId = release.version;
      renderList();
      renderDetail(release);
    });

    item.appendChild(button);

    elements.list.appendChild(item);
  });
};

const renderDetail = (release) => {
  if (!release) {
    elements.detail.innerHTML = "<p class=\"empty\">Select a release to view details.</p>";
    return;
  }

  const stats = release.stats || {};
  const commits = release.commits || {};
  const docs = release.docs || {};
  const approvers = (release.approvedBy || []).join(", ") || "Pending";
  const context = formatMultiline(release.context);
  const impact = formatMultiline(release.impact);
  const howToValidate = formatMultiline(release.howToValidate);
  const changedFiles = release.changedFiles || [];
  const codeChanges = release.codeChanges || [];
  const historyItems = [];
  const typeMap = {
    Alteracao: "Update",
    "Funcao/Metodo": "Function/Method",
    Classe: "Class",
  };
  const fileLabel = (path) => {
    if (!path) return "Unknown file";
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
  };
  codeChanges.slice(0, 6).forEach((change) => {
    const mappedType = typeMap[change.type] || change.type || "Update";
    const fileName = fileLabel(change.file);
    historyItems.push({
      title: `${mappedType} in ${fileName}`,
      meta: change.file ? `${change.file}${change.lineStart ? ":" + change.lineStart : ""}` : "Location not provided",
    });
  });
  changedFiles.slice(0, 6).forEach((file) => {
    historyItems.push({
      title: `Touched ${fileLabel(file)}`,
      meta: file,
    });
  });
  const hasChanges = historyItems.length > 0;
  const icons = {
    summary: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6h16\"/><path d=\"M4 12h16\"/><path d=\"M4 18h10\"/></svg></span>",
    pr: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"7\" cy=\"7\" r=\"3\"/><circle cx=\"17\" cy=\"17\" r=\"3\"/><path d=\"M7 10v4a2 2 0 0 0 2 2h4\"/></svg></span>",
    docs: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6a2 2 0 0 1 2-2h9l5 5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><path d=\"M14 4v5h5\"/></svg></span>",
    compare: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 3H5a2 2 0 0 0-2 2v5\"/><path d=\"M14 21h5a2 2 0 0 0 2-2v-5\"/><path d=\"M7 17l10-10\"/></svg></span>",
    changes: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16v16H4z\"/><path d=\"M8 8h8\"/><path d=\"M8 12h8\"/><path d=\"M8 16h5\"/></svg></span>",
    validate: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 12l2 2 4-4\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/></svg></span>",
    context: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\"/><path d=\"M8 9h8\"/><path d=\"M8 13h6\"/></svg></span>",
    impact: "<span class=\"icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l9 4-9 4-9-4 9-4z\"/><path d=\"M3 11l9 4 9-4\"/><path d=\"M3 15l9 4 9-4\"/></svg></span>",
  };

  elements.detail.innerHTML = `
    <h2>${release.version || "Release"}</h2>
    <p class="subtitle">${release.ticket || "--"} · ${formatDate(release.date)} · ${release.author || "--"}</p>
    <div class="detail-meta">
      <span class="chip">Previous: ${commits.previousVersion || "--"}</span>
      <span class="chip">Approvers: ${approvers}</span>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.summary}Summary</h3>
      <div class="detail-grid">
        <div class="card">
          <span>Commits</span>
          <strong>${formatNumber(stats.commitCount)}</strong>
        </div>
        <div class="card">
          <span>Files</span>
          <strong>${formatNumber(stats.fileCount)}</strong>
        </div>
        <div class="card">
          <span>Methods</span>
          <strong>${formatNumber(stats.methodCount)}</strong>
        </div>
        <div class="card">
          <span>Approved By</span>
          <strong>${approvers}</strong>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.changes}What changed</h3>
      ${hasChanges ? "" : "<p class=\"empty\">No change highlights provided for this release.</p>"}
      ${hasChanges ? `
        <div class="audit-table" role="table" aria-label="Change log">
          <div class="audit-row audit-header" role="row">
            <div class="audit-cell" role="columnheader">Action</div>
            <div class="audit-cell" role="columnheader">Location</div>
            <div class="audit-cell" role="columnheader">Type</div>
          </div>
          ${historyItems.map((item) => {
            const parts = item.title.split(" in ");
            const action = parts[0] || item.title;
            const type = parts[1] ? "Code" : "File";
            return `
              <div class="audit-row" role="row">
                <div class="audit-cell" role="cell">${action}</div>
                <div class="audit-cell" role="cell">${item.meta}</div>
                <div class="audit-cell" role="cell">${type}</div>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.context}Context</h3>
      <div class="detail-text">${context}</div>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.impact}Impact</h3>
      <div class="detail-text">${impact}</div>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.pr}PR</h3>
      <p>
        <strong>${release.pr?.title || "--"}</strong><br />
        <a href="${release.pr?.url || "#"}" target="_blank" rel="noreferrer">${release.pr?.url || "--"}</a>
      </p>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.docs}Documentation</h3>
      <ul>
        <li><a href="${docs.releaseDocUrl || "#"}" target="_blank" rel="noreferrer">Release notes</a></li>
        <li><a href="${docs.changeLogUrl || "#"}" target="_blank" rel="noreferrer">Changelog</a></li>
      </ul>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.validate}How to validate</h3>
      <div class="detail-text">${howToValidate}</div>
      <ul>
        <li><a href="${docs.releaseDocUrl || "#"}" target="_blank" rel="noreferrer">Open release notes</a></li>
        <li><span>QA owner: ${release.author || "--"}</span></li>
      </ul>
    </div>

    <div class="detail-section">
      <h3 class="heading-with-icon">${icons.compare}Compare</h3>
      <ul>
        <li><a href="${commits.compareUrl || "#"}" target="_blank" rel="noreferrer">${commits.compareUrl || "--"}</a></li>
        <li><span>Previous: ${commits.previousVersion || "--"}</span></li>
      </ul>
    </div>
  `;
};

const filterReleases = (query) => {
  if (!query) {
    state.filtered = [...state.releases];
    return;
  }
  const lower = query.toLowerCase();
  state.filtered = state.releases.filter((release) => {
    return (
      release.ticket?.toLowerCase().includes(lower) ||
      release.version?.toLowerCase().includes(lower) ||
      release.pr?.title?.toLowerCase().includes(lower)
    );
  });
};

const setupSearch = () => {
  elements.search.addEventListener("input", (event) => {
    filterReleases(event.target.value);
    renderList();
    if (!state.filtered.find((release) => release.version === state.activeId)) {
      renderDetail(state.filtered[0]);
      state.activeId = state.filtered[0]?.version || null;
      renderList();
    }
  });
};

const loadData = async () => {
  try {
    const response = await fetch("releases.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load releases.json");
    }
    const data = await response.json();
    state.releases = data.releases || [];
    state.filtered = [...state.releases];
    elements.total.textContent = formatNumber(state.releases.length);
    elements.updated.textContent = parseMetadataDate(data.metadata?.lastUpdated);

    if (state.releases.length > 0) {
      state.activeId = state.releases[0].version;
      renderList();
      renderDetail(state.releases[0]);
    } else {
      renderList();
      renderDetail(null);
    }
  } catch (error) {
    elements.detail.innerHTML = `<p class="empty">Failed to load releases. ${error.message}</p>`;
  }
};

setupSearch();
loadData();

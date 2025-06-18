export async function loadRepositories() {
  const GITHUB_REPOSITORIES_API_URL = 'https://portfolio-repositories-backend.onrender.com/repositories';

  const LANGUAGE_COLORS = {
    Java: "#b07219", Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    HTML: "#e34c26", CSS: "#563d7c", C: "#555555", "C++": "#f34b7d",
    "C#": "#178600", PHP: "#4F5D95", Swift: "#ffac45", Kotlin: "#A97BFF",
    Go: "#00ADD8", Ruby: "#701516", Shell: "#89e051"
  };

  const EXCLUDED_REPO = 'SoaresCRF';
  const SORT_LABELS = ['Exibindo: Recentes', 'Exibindo: Antigos', 'Exibindo: A–Z'];

  const DOM = {
    list: document.getElementById('repository-list'),
    search: document.getElementById('search'),
    languageFilter: document.getElementById('language-filter'),
    sortButton: document.getElementById('sort-button'),
    count: document.getElementById('repository-count'),
    template: document.getElementById('repository-template'),
    pagination: document.getElementById('pagination')
  };

  if (Object.values(DOM).some(el => !el)) {
    console.warn('❗ Alguns elementos da interface não foram encontrados.');
    return;
  }

  let repositories = [];
  let sortMode = 0;
  let currentPage = 1;
  const itemsPerPage = 10;

  async function fetchRepositories() {
    try {
      const response = await fetch(GITHUB_REPOSITORIES_API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error('❌ Falha ao buscar repositórios:', err.message);
      return [];
    }
  }

  function getFilteredRepositories() {
    const term = DOM.search.value.toLowerCase();
    const selectedLanguage = DOM.languageFilter.value;

    return repositories
      .filter(repository => repository.name !== EXCLUDED_REPO)
      .filter(repository => {
        const matchesName = repository.name.toLowerCase().includes(term);
        const matchesLanguage = !selectedLanguage || repository.language === selectedLanguage;
        return matchesName && matchesLanguage;
      });
  }

  function sortRepositories(repositories) {
    switch (sortMode) {
      case 0: return [...repositories].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      case 1: return [...repositories].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      case 2: return [...repositories].sort((a, b) => a.name.localeCompare(b.name));
      default: return repositories;
    }
  }

  function updateSortButtonLabel() {
    DOM.sortButton.textContent = `🗂️ ${SORT_LABELS[sortMode]}`;
  }

  function renderRepositories(repositoriesToRender, totalFilteredCount) {
    DOM.list.innerHTML = '';

    repositoriesToRender.forEach(repository => {
      const clone = DOM.template.content.cloneNode(true);
      const language = repository.language || 'N/A';
      const color = LANGUAGE_COLORS[language] || '#6c757d';
      const updatedDate = new Date(repository.updated_at).toLocaleDateString();

      const link = clone.querySelector('.repository-link');
      const description = clone.querySelector('.repository-description');
      const languageBadge = clone.querySelector('.repository-language');
      const updatedText = clone.querySelector('.repository-updated');

      link.textContent = repository.name;
      link.href = repository.html_url;
      link.style.color = color;

      description.textContent = repository.description || 'Sem descrição disponível';
      description.style.color = color;

      languageBadge.textContent = language;
      languageBadge.style.backgroundColor = `${color}20`;
      languageBadge.style.color = color;

      updatedText.textContent = `| Atualizado em: ${updatedDate}`;
      updatedText.style.color = color;

      DOM.list.appendChild(clone);
    });

    updateRepositoryCount(repositoriesToRender.length, totalFilteredCount);
  }

  function updateRepositoryCount(visibleCount, totalFilteredCount) {
    const totalCount = repositories.filter(repository => repository.name !== EXCLUDED_REPO).length;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + visibleCount - 1, totalFilteredCount);

    DOM.count.textContent = `📂 Exibindo ${start}–${end} projetos de ${totalCount} no total`;
  }

  function renderPagination(totalPages) {
    DOM.pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const createPageItem = (label, disabled, onClick, active = false) => {
      const li = document.createElement('li');
      li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
      const button = document.createElement('button');
      button.className = 'page-link';
      button.textContent = label;
      button.addEventListener('click', () => {
        onClick();
        document.querySelector('section[aria-labelledby="repository-count"]').scrollIntoView({ behavior: 'smooth' });
      });
      li.appendChild(button);
      return li;
    };

    DOM.pagination.appendChild(createPageItem('«', currentPage === 1, () => {
      if (currentPage > 1) {
        currentPage--;
        updateDisplay();
      }
    }));

    for (let i = 1; i <= totalPages; i++) {
      DOM.pagination.appendChild(createPageItem(`${i}`, false, () => {
        currentPage = i;
        updateDisplay();
      }, i === currentPage));
    }

    DOM.pagination.appendChild(createPageItem('»', currentPage === totalPages, () => {
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
      }
    }));
  }

  function updateDisplay() {
    const filtered = getFilteredRepositories();
    const sorted = sortRepositories(filtered);

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRepositories = sorted.slice(startIndex, startIndex + itemsPerPage);

    renderRepositories(paginatedRepositories, sorted.length);
    renderPagination(totalPages);
  }

  function setupEventListeners() {
    DOM.sortButton.addEventListener('click', () => {
      sortMode = (sortMode + 1) % SORT_LABELS.length;
      updateSortButtonLabel();
      currentPage = 1;
      updateDisplay();
    });

    DOM.search.addEventListener('input', () => {
      currentPage = 1;
      updateDisplay();
    });

    DOM.languageFilter.addEventListener('change', () => {
      currentPage = 1;
      updateDisplay();
    });
  }

  function populateLanguageOptions(repositories) {
    const languages = [...new Set(
      repositories.filter(r => r.name !== EXCLUDED_REPO)
        .map(r => r.language)
        .filter(Boolean)
    )].sort();

    for (const lang of languages) {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      DOM.languageFilter.appendChild(option);
    }
  }

  async function initialize() {
    repositories = await fetchRepositories();
    populateLanguageOptions(repositories);
    updateSortButtonLabel();
    setupEventListeners();
    updateDisplay();
  }

  await initialize();
}

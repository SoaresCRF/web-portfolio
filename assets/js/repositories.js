// Função principal exportada
export async function loadRepositories() {
  const GITHUB_REPOSITORIES_API_URL = 'https://portfolio-repositories-backend.onrender.com/repositories';

  // Cores associadas a linguagens
  const LANGUAGE_COLORS = {
    Java: "#b07219", Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    HTML: "#e34c26", CSS: "#563d7c", C: "#555555", "C++": "#f34b7d",
    "C#": "#178600", PHP: "#4F5D95", Swift: "#ffac45", Kotlin: "#A97BFF",
    Go: "#00ADD8", Ruby: "#701516", Shell: "#89e051"
  };

  const EXCLUDED_REPO = 'SoaresCRF';
  const SORT_LABELS = ['Exibindo: Recentes', 'Exibindo: Antigos', 'Exibindo: A–Z'];

  // Seleção de elementos DOM
  const DOM = {
    list: document.getElementById('repository-list'),
    search: document.getElementById('search'),
    languageFilter: document.getElementById('language-filter'),
    sortButton: document.getElementById('sort-button'),
    count: document.getElementById('repository-count'),
    template: document.getElementById('repository-template')
  };

  if (Object.values(DOM).some(el => !el)) {
    console.warn('❗ Alguns elementos da interface não foram encontrados.');
    return;
  }

  let repositories = [];
  let sortMode = 0;

  // Fetch de repositórios do GitHub
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

  // Filtra repositórios por nome e linguagem
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

  // Ordena repositórios conforme modo atual
  function sortRepositories(repositories) {
    switch (sortMode) {
      case 0: return [...repositories].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      case 1: return [...repositories].sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      case 2: return [...repositories].sort((a, b) => a.name.localeCompare(b.name));
      default: return repositories;
    }
  }

  // Atualiza texto do botão de ordenação
  function updateSortButtonLabel() {
    DOM.sortButton.textContent = `🗂️ ${SORT_LABELS[sortMode]}`;
  }

  // Renderiza repositórios na lista
  function renderRepositories(repositories) {
    DOM.list.innerHTML = '';

    repositories.forEach(repository => {
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

    updateRepositoryCount(repositories.length);
  }

  // Atualiza contagem visível de repositórios
  function updateRepositoryCount(visibleCount) {
    const totalCount = repositories.filter(repository => repository.name !== EXCLUDED_REPO).length;
    DOM.count.textContent = `📂 Exibindo ${visibleCount} projetos de ${totalCount} no total`;
  }

  // Atualiza a exibição principal dos repositórios
  function updateDisplay() {
    const filtered = getFilteredRepositories();
    const sorted = sortRepositories(filtered);
    renderRepositories(sorted);
  }

  // Alterna modo de ordenação
  function toggleSortMode() {
    sortMode = (sortMode + 1) % SORT_LABELS.length;
    updateSortButtonLabel();
    updateDisplay();
  }

  // Popula filtro de linguagens únicas
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

  // Configura ouvintes de eventos
  function setupEventListeners() {
    DOM.sortButton.addEventListener('click', toggleSortMode);
    DOM.search.addEventListener('input', updateDisplay);
    DOM.languageFilter.addEventListener('change', updateDisplay);
  }

  // Inicialização
  async function initialize() {
    repositories = await fetchRepositories();
    populateLanguageOptions(repositories);
    updateSortButtonLabel();
    setupEventListeners();
    updateDisplay();
  }

  await initialize();
}

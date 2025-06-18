// Repositório principal para carregar os repositórios do portfólio
export async function loadRepositories() {
  // =================== CONFIGURAÇÕES ===================
  const API_URL = 'https://portfolio-repositories-backend.onrender.com/repositories';
  const EXCLUDED_REPO = 'SoaresCRF';
  const ITEMS_PER_PAGE = 10;
  const SORT_LABELS = ['Exibindo: Recentes', 'Exibindo: Antigos', 'Exibindo: A–Z'];

  const LANGUAGE_COLORS = {
    Java: "#b07219", Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    HTML: "#e34c26", CSS: "#563d7c", C: "#555555", "C++": "#f34b7d",
    "C#": "#178600", PHP: "#4F5D95", Swift: "#ffac45", Kotlin: "#A97BFF",
    Go: "#00ADD8", Ruby: "#701516", Shell: "#89e051"
  };

  const LANGUAGE_ICONS = generateLanguageIcons();

  const DOM = getDOMElements();
  if (Object.values(DOM).some(el => !el)) {
    console.warn('❗ Alguns elementos da interface não foram encontrados.');
    return;
  }

  // =================== VARIÁVEIS DE ESTADO ===================
  let repositories = [];
  let sortMode = 0;
  let currentPage = 1;
  let selectedLanguage = '';

  // =================== INICIALIZAÇÃO ===================
  await initialize();

  // =================== FUNÇÕES AUXILIARES ===================

  async function initialize() {
    repositories = await fetchRepositories();
    populateLanguageDropdown(repositories);
    updateSortButtonLabel();
    setupEventListeners();
    updateDisplay();
  }

  async function fetchRepositories() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar repositórios:', error.message);
      return [];
    }
  }

  function getDOMElements() {
    return {
      list: document.getElementById('repository-list'),
      search: document.getElementById('search'),
      sortButton: document.getElementById('sort-button'),
      count: document.getElementById('repository-count'),
      template: document.getElementById('repository-template'),
      pagination: document.getElementById('pagination'),
      dropdownButton: document.getElementById('dropdown-button'),
      dropdownList: document.getElementById('dropdown-list'),
    };
  }

  function generateLanguageIcons() {
    const base = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
    return {
      Java: `${base}/java/java-original.svg`,
      Python: `${base}/python/python-original.svg`,
      JavaScript: `${base}/javascript/javascript-original.svg`,
      TypeScript: `${base}/typescript/typescript-original.svg`,
      HTML: `${base}/html5/html5-original.svg`,
      CSS: `${base}/css3/css3-original.svg`,
      C: `${base}/c/c-original.svg`,
      "C++": `${base}/cplusplus/cplusplus-original.svg`,
      "C#": `${base}/csharp/csharp-original.svg`,
      PHP: `${base}/php/php-original.svg`,
      Swift: `${base}/swift/swift-original.svg`,
      Kotlin: `${base}/kotlin/kotlin-original.svg`,
      Go: `${base}/go/go-original.svg`,
      Ruby: `${base}/ruby/ruby-original.svg`,
      Shell: `${base}/bash/bash-original.svg`,
    };
  }

  function setupEventListeners() {
    DOM.sortButton.addEventListener('click', handleSort);
    DOM.search.addEventListener('input', handleSearch);
    DOM.dropdownButton.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (event) => {
      if (!DOM.dropdownButton.contains(event.target) && !DOM.dropdownList.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  function handleSort() {
    sortMode = (sortMode + 1) % SORT_LABELS.length;
    updateSortButtonLabel();
    currentPage = 1;
    updateDisplay();
  }

  function handleSearch() {
    currentPage = 1;
    updateDisplay();
  }

  function toggleDropdown() {
    const expanded = DOM.dropdownButton.getAttribute('aria-expanded') === 'true';
    DOM.dropdownButton.setAttribute('aria-expanded', String(!expanded));
    DOM.dropdownList.hidden = expanded;
  }

  function closeDropdown() {
    DOM.dropdownButton.setAttribute('aria-expanded', 'false');
    DOM.dropdownList.hidden = true;
  }

  function populateLanguageDropdown(repositories) {
    const languages = [...new Set(
      repositories.filter(r => r.name !== EXCLUDED_REPO)
        .map(r => r.language)
        .filter(Boolean)
    )].sort();

    DOM.dropdownList.innerHTML = '';
    addLanguageOption('🌐 Todas as linguagens', '', true);

    languages.forEach(lang => addLanguageOption(lang, lang, false));
  }

  function addLanguageOption(label, language, isAll) {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.tabIndex = 0;

    if (!isAll && LANGUAGE_ICONS[language]) {
      const img = document.createElement('img');
      img.src = LANGUAGE_ICONS[language];
      img.alt = `${language} icon`;
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.marginRight = '0.5rem';
      li.appendChild(img);
    }

    li.appendChild(document.createTextNode(label));
    li.addEventListener('click', () => selectLanguage(language));
    DOM.dropdownList.appendChild(li);
  }

  function selectLanguage(language) {
    selectedLanguage = language;
    updateDropdownButtonLabel();
    closeDropdown();
    currentPage = 1;
    updateDisplay();
  }

  function updateDropdownButtonLabel() {
    if (!selectedLanguage) {
      DOM.dropdownButton.textContent = '🌐 Todas as linguagens';
      return;
    }

    const iconUrl = LANGUAGE_ICONS[selectedLanguage];
    DOM.dropdownButton.innerHTML = iconUrl
      ? `<img src="${iconUrl}" alt="${selectedLanguage} icon" style="width:20px; height:20px; vertical-align:middle; margin-right:0.5rem;">${selectedLanguage}`
      : selectedLanguage;
  }

  function updateSortButtonLabel() {
    DOM.sortButton.textContent = `🗂️ ${SORT_LABELS[sortMode]}`;
  }

  function getFilteredRepositories() {
    const searchTerm = DOM.search.value.toLowerCase();

    return repositories
      .filter(r => r.name !== EXCLUDED_REPO)
      .filter(r => {
        const matchesName = r.name.toLowerCase().includes(searchTerm);
        const matchesLanguage = !selectedLanguage || r.language === selectedLanguage;
        return matchesName && matchesLanguage;
      });
  }

  function sortRepositories(filteredRepos) {
    const sorted = [...filteredRepos];

    switch (sortMode) {
      case 0:
        return sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      case 1:
        return sorted.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      case 2:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }

  function updateDisplay() {
    const filtered = getFilteredRepositories();
    const sorted = sortRepositories(filtered);
    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedRepos = sorted.slice(start, start + ITEMS_PER_PAGE);

    renderRepositories(paginatedRepos, sorted.length);
    renderPagination(totalPages);
  }

  function renderRepositories(repositoriesToRender, totalFilteredCount) {
    DOM.list.innerHTML = '';

    repositoriesToRender.forEach(repository => {
      const clone = DOM.template.content.cloneNode(true);
      fillRepositoryTemplate(clone, repository);
      DOM.list.appendChild(clone);
    });

    updateRepositoryCount(repositoriesToRender.length, totalFilteredCount);
  }

  function fillRepositoryTemplate(clone, repository) {
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
  }

  function updateRepositoryCount(visibleCount, totalFilteredCount) {
    const totalCount = repositories.filter(r => r.name !== EXCLUDED_REPO).length;
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
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
        if (!disabled) {
          onClick();
          updateDisplay();
          scrollToTop();
        }
      });

      li.appendChild(button);
      return li;
    };

    // Botão "Anterior"
    DOM.pagination.appendChild(
      createPageItem('«', currentPage === 1, () => currentPage--)
    );

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      DOM.pagination.appendChild(
        createPageItem(`${i}`, false, () => currentPage = i, i === currentPage)
      );
    }

    // Botão "Próximo"
    DOM.pagination.appendChild(
      createPageItem('»', currentPage === totalPages, () => currentPage++)
    );
  }

  function scrollToTop() {
    document.querySelector('section[aria-labelledby="repository-count"]').scrollIntoView({ behavior: 'smooth' });
  }
}

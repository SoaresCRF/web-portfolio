export async function loadRepositories() {
  const GITHUB_REPOSITORIES_API_URL = 'https://portfolio-repositories-backend.onrender.com/repositories';

  const LANGUAGE_COLORS = {
    Java: "#b07219", Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    HTML: "#e34c26", CSS: "#563d7c", C: "#555555", "C++": "#f34b7d",
    "C#": "#178600", PHP: "#4F5D95", Swift: "#ffac45", Kotlin: "#A97BFF",
    Go: "#00ADD8", Ruby: "#701516", Shell: "#89e051"
  };

  const LANG_ICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

  const LANGUAGE_ICONS = {
    Java: `${LANG_ICON_BASE}/java/java-original.svg`,
    Python: `${LANG_ICON_BASE}/python/python-original.svg`,
    JavaScript: `${LANG_ICON_BASE}/javascript/javascript-original.svg`,
    TypeScript: `${LANG_ICON_BASE}/typescript/typescript-original.svg`,
    HTML: `${LANG_ICON_BASE}/html5/html5-original.svg`,
    CSS: `${LANG_ICON_BASE}/css3/css3-original.svg`,
    C: `${LANG_ICON_BASE}/c/c-original.svg`,
    "C++": `${LANG_ICON_BASE}/cplusplus/cplusplus-original.svg`,
    "C#": `${LANG_ICON_BASE}/csharp/csharp-original.svg`,
    PHP: `${LANG_ICON_BASE}/php/php-original.svg`,
    Swift: `${LANG_ICON_BASE}/swift/swift-original.svg`,
    Kotlin: `${LANG_ICON_BASE}/kotlin/kotlin-original.svg`,
    Go: `${LANG_ICON_BASE}/go/go-original.svg`,
    Ruby: `${LANG_ICON_BASE}/ruby/ruby-original.svg`,
    Shell: `${LANG_ICON_BASE}/bash/bash-original.svg`,
  };

  const EXCLUDED_REPO = 'SoaresCRF';
  const SORT_LABELS = ['Exibindo: Recentes', 'Exibindo: Antigos', 'Exibindo: A–Z'];

  const DOM = {
    list: document.getElementById('repository-list'),
    search: document.getElementById('search'),
    sortButton: document.getElementById('sort-button'),
    count: document.getElementById('repository-count'),
    template: document.getElementById('repository-template'),
    pagination: document.getElementById('pagination'),
    dropdownButton: document.getElementById('dropdown-button'),
    dropdownList: document.getElementById('dropdown-list'),
  };

  if (Object.values(DOM).some(el => !el)) {
    console.warn('❗ Alguns elementos da interface não foram encontrados.');
    return;
  }

  let repositories = [];
  let sortMode = 0;
  let currentPage = 1;
  const itemsPerPage = 10;
  let selectedLanguage = '';

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

  function populateLanguageDropdown(repositories) {
    const languages = [...new Set(
      repositories.filter(r => r.name !== EXCLUDED_REPO)
        .map(r => r.language)
        .filter(Boolean)
    )].sort();

    DOM.dropdownList.innerHTML = '';

    // Opção "Todas as linguagens"
    const allItem = document.createElement('li');
    allItem.setAttribute('role', 'option');
    allItem.tabIndex = 0;
    allItem.textContent = '🌐 Todas as linguagens';
    allItem.addEventListener('click', () => selectLanguage(''));
    DOM.dropdownList.appendChild(allItem);

    for (const lang of languages) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.tabIndex = 0;

      const iconUrl = LANGUAGE_ICONS[lang];
      if (iconUrl) {
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = `${lang} icon`;
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.marginRight = '0.5rem';
        li.appendChild(img);
      }

      li.appendChild(document.createTextNode(lang));
      li.addEventListener('click', () => selectLanguage(lang));
      DOM.dropdownList.appendChild(li);
    }
  }

  function toggleDropdown() {
    const expanded = DOM.dropdownButton.getAttribute('aria-expanded') === 'true';
    DOM.dropdownButton.setAttribute('aria-expanded', String(!expanded));
    DOM.dropdownList.hidden = expanded;
  }

  function selectLanguage(language) {
    selectedLanguage = language;
    if (!language) {
      DOM.dropdownButton.textContent = '🌐 Todas as linguagens';
    } else {
      const iconUrl = LANGUAGE_ICONS[language];
      if (iconUrl) {
        DOM.dropdownButton.innerHTML = `<img src="${iconUrl}" alt="${language} icon" style="width:20px; height:20px; vertical-align:middle; margin-right:0.5rem;">${language}`;
      } else {
        DOM.dropdownButton.textContent = language;
      }
    }
    DOM.dropdownButton.setAttribute('aria-expanded', 'false');
    DOM.dropdownList.hidden = true;
    currentPage = 1;
    updateDisplay();
  }

  function getFilteredRepositories() {
    const term = DOM.search.value.toLowerCase();

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

    DOM.dropdownButton.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (event) => {
      if (!DOM.dropdownButton.contains(event.target) && !DOM.dropdownList.contains(event.target)) {
        DOM.dropdownButton.setAttribute('aria-expanded', 'false');
        DOM.dropdownList.hidden = true;
      }
    });
  }

  async function initialize() {
    repositories = await fetchRepositories();
    populateLanguageDropdown(repositories);
    updateSortButtonLabel();
    setupEventListeners();
    updateDisplay();
  }

  await initialize();
}

import {
  DEFAULT_LANGUAGE_COLOR,
  LANGUAGE_COLORS,
  formatDate,
  getCountLabel,
  normalizeRepositories,
} from './repository-utils.js';
import { getMessages } from './messages.js';

// Gerado a cada build a partir da API do GitHub (scripts/fetch-repositories.js) e servido na raiz do site,
// também para a versão em inglês (en/)
const REPOSITORIES_URL = `${import.meta.env.BASE_URL}repositories.json`;
const PAGE_LANGUAGE = document.documentElement.lang;
const MESSAGES = getMessages(PAGE_LANGUAGE);
const GITHUB_PROFILE_URL = 'https://github.com/SoaresCRF';
const DEVICON_BASE_URL = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons';

// Uma única requisição por visita: reabrir a seção reaproveita o resultado (ou tenta de novo após falha)
let repositoriesRequest = null;
// Listeners no document são trocados a cada abertura da seção para não acumularem
let documentListeners = null;

function requestRepositories() {
  repositoriesRequest ??= fetchRepositories().catch(error => {
    repositoriesRequest = null;
    throw error;
  });
  return repositoriesRequest;
}

async function fetchRepositories() {
  const response = await fetch(REPOSITORIES_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return normalizeRepositories(await response.json());
}

// Repositório principal para carregar os repositórios do portfólio
export async function loadRepositories() {
  // =================== CONFIGURAÇÕES ===================
  const EXCLUDED_REPO = 'SoaresCRF';
  const ITEMS_PER_PAGE = 10;
  const SORT_LABELS = MESSAGES.sortLabels;

  // Classes Tailwind dos elementos criados dinamicamente (literais completos para o scanner do Tailwind)
  const LANGUAGE_ICON_CLASSES = 'mr-2 size-5';
  const LANGUAGE_OPTION_CLASSES = 'flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-[#f0f0f0] aria-selected:bg-[#f0f0f0]';
  // Itens após o primeiro se sobrepõem em 1px, como na paginação original
  const PAGE_ITEM_CLASSES = 'not-first:-ml-px';
  const PAGE_LINK_CLASSES = [
    'min-h-11 min-w-11 cursor-pointer rounded-full border-0 bg-white px-4 py-[0.6rem] text-[0.95rem] text-[#333]',
    'shadow-[0_2px_6px_rgb(0_0_0/0.1)] transition-all duration-200 ease-[ease]',
    'hover:-translate-y-0.5 hover:bg-[#f0f0f0] hover:shadow-[0_4px_10px_rgb(0_0_0/0.15)] active:scale-95',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c757d]',
    'aria-[current=page]:bg-[#6c757d] aria-[current=page]:text-white aria-[current=page]:shadow-[0_4px_12px_rgb(0_0_0/0.3)]',
    'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:bg-[#f3f3f3]',
    'aria-disabled:text-[#aaa] aria-disabled:opacity-60 aria-disabled:shadow-none',
  ].join(' ');

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
    updateSortButtonLabel();

    try {
      repositories = await requestRepositories();
    } catch (error) {
      console.error('❌ Erro ao buscar repositórios:', error);
      if (DOM.list.isConnected) renderLoadError();
      return;
    }

    // O usuário pode ter trocado de seção enquanto a lista carregava
    if (!DOM.list.isConnected) return;

    populateLanguageDropdown(repositories);
    setupEventListeners();
    updateDisplay();
  }

  // A região role="status" fica sempre no DOM (vazia quando não há mensagem) para ser anunciada
  function showStatus(message, link) {
    DOM.status.replaceChildren(message);
    if (link) DOM.status.append(' ', link);
  }

  function clearStatus() {
    DOM.status.replaceChildren();
  }

  function renderLoadError() {
    const profileLink = document.createElement('a');
    profileLink.href = GITHUB_PROFILE_URL;
    profileLink.target = '_blank';
    profileLink.rel = 'noopener noreferrer';
    profileLink.className = 'font-semibold text-link underline';
    profileLink.textContent = MESSAGES.viewOnGitHub;

    DOM.count.textContent = MESSAGES.loadErrorTitle;
    showStatus(MESSAGES.loadError, profileLink);
  }

  function getDOMElements() {
    return {
      list: document.getElementById('repository-list'),
      search: document.getElementById('search'),
      sortButton: document.getElementById('sort-button'),
      count: document.getElementById('repository-count'),
      status: document.getElementById('repository-status'),
      template: document.getElementById('repository-template'),
      pagination: document.getElementById('pagination'),
      dropdownButton: document.getElementById('dropdown-button'),
      dropdownList: document.getElementById('dropdown-list'),
    };
  }

  function generateLanguageIcons() {
    const base = DEVICON_BASE_URL;
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
    DOM.dropdownButton.addEventListener('keydown', handleDropdownButtonKeydown);
    DOM.dropdownList.addEventListener('keydown', handleDropdownListKeydown);

    documentListeners?.abort();
    documentListeners = new AbortController();
    document.addEventListener('click', (event) => {
      if (!DOM.dropdownButton.contains(event.target) && !DOM.dropdownList.contains(event.target)) {
        closeDropdown();
      }
    }, { signal: documentListeners.signal });
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

  function getLanguageOptions() {
    return [...DOM.dropdownList.querySelectorAll('[role="option"]')];
  }

  // Abre a lista pelo teclado e leva o foco para a opção selecionada
  function handleDropdownButtonKeydown(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    DOM.dropdownButton.setAttribute('aria-expanded', 'true');
    DOM.dropdownList.hidden = false;

    const options = getLanguageOptions();
    (options.find(option => option.getAttribute('aria-selected') === 'true') || options[0])?.focus();
  }

  // Navegação por teclado entre as opções: setas, Home/End, Enter/Espaço seleciona, Esc/Tab fecha
  function handleDropdownListKeydown(event) {
    const options = getLanguageOptions();
    const index = options.indexOf(document.activeElement);
    const focusOption = (i) => options[(i + options.length) % options.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (index === -1) return;
        event.preventDefault();
        selectLanguage(options[index].dataset.language);
        DOM.dropdownButton.focus();
        break;
      case 'Escape':
        event.preventDefault();
        closeDropdown();
        DOM.dropdownButton.focus();
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
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
    addLanguageOption(MESSAGES.allLanguages, '', true);

    languages.forEach(lang => addLanguageOption(lang, lang, false));
  }

  function addLanguageOption(label, language, isAll) {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.className = LANGUAGE_OPTION_CLASSES;
    li.dataset.language = language;
    li.setAttribute('aria-selected', String(language === selectedLanguage));
    li.tabIndex = 0;

    if (!isAll && LANGUAGE_ICONS[language]) {
      const img = document.createElement('img');
      img.src = LANGUAGE_ICONS[language];
      img.alt = '';
      img.loading = 'lazy';
      img.className = LANGUAGE_ICON_CLASSES;
      li.appendChild(img);
    }

    li.appendChild(document.createTextNode(label));
    li.addEventListener('click', () => selectLanguage(language));
    DOM.dropdownList.appendChild(li);
  }

  function selectLanguage(language) {
    selectedLanguage = language;
    getLanguageOptions().forEach(option => {
      option.setAttribute('aria-selected', String(option.dataset.language === language));
    });
    updateDropdownButtonLabel();
    closeDropdown();
    currentPage = 1;
    updateDisplay();
  }

  function updateDropdownButtonLabel() {
    if (!selectedLanguage) {
      DOM.dropdownButton.textContent = MESSAGES.allLanguages;
      return;
    }

    DOM.dropdownButton.replaceChildren(selectedLanguage);

    const iconUrl = LANGUAGE_ICONS[selectedLanguage];
    if (iconUrl) {
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = '';
      img.className = LANGUAGE_ICON_CLASSES;
      DOM.dropdownButton.prepend(img);
    }
  }

  function updateSortButtonLabel() {
    DOM.sortButton.textContent = `🗂️ ${SORT_LABELS[sortMode]}`;
    // O nome acessível inclui o texto visível (WCAG 2.5.3) e explica que o botão alterna a ordem
    DOM.sortButton.setAttribute('aria-label', `${SORT_LABELS[sortMode]}. ${MESSAGES.sortAction}`);
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
        return sorted.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
      case 1:
        return sorted.sort((a, b) => new Date(a.pushed_at) - new Date(b.pushed_at));
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

    if (totalFilteredCount === 0) {
      showStatus(MESSAGES.noMatch);
    } else {
      clearStatus();
    }
  }

  function fillRepositoryTemplate(clone, repository) {
    const language = repository.language || 'N/A';
    const color = LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR;
    const pushedDate = formatDate(repository.pushed_at, PAGE_LANGUAGE);

    const link = clone.querySelector('.repository-link');
    const description = clone.querySelector('.repository-description');
    const languageBadge = clone.querySelector('.repository-language');
    const pushedText = clone.querySelector('.repository-pushed');
    const linkDownload = clone.querySelector('[data-download]');

    link.textContent = repository.name;
    if (repository.html_url) link.href = repository.html_url;
    else link.removeAttribute('href');
    link.style.color = color;

    description.textContent = repository.description || MESSAGES.noDescription;
    description.style.color = color;

    languageBadge.textContent = language;
    languageBadge.style.backgroundColor = `${color}20`;
    languageBadge.style.color = color;

    pushedText.textContent = MESSAGES.updatedAt(pushedDate);
    pushedText.style.color = color;

    if (repository.zip_url) linkDownload.href = repository.zip_url;
    else linkDownload.hidden = true;
    linkDownload.setAttribute('aria-label', MESSAGES.downloadSource(repository.name));
    linkDownload.style.color = color;
  }

  function updateRepositoryCount(visibleCount, totalFilteredCount) {
    DOM.count.textContent = getCountLabel({
      page: currentPage,
      perPage: ITEMS_PER_PAGE,
      visibleCount,
      filteredCount: totalFilteredCount,
      totalCount: repositories.filter(r => r.name !== EXCLUDED_REPO).length,
    }, PAGE_LANGUAGE);
  }

  function renderPagination(totalPages) {
    DOM.pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const createPageItem = (label, accessibleName, disabled, onClick, active = false) => {
      const li = document.createElement('li');
      li.className = PAGE_ITEM_CLASSES;

      const button = document.createElement('button');
      button.className = PAGE_LINK_CLASSES;
      button.textContent = label;
      button.setAttribute('aria-label', accessibleName);
      if (active) button.setAttribute('aria-current', 'page');
      if (disabled) button.setAttribute('aria-disabled', 'true');

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
      createPageItem('«', MESSAGES.previousPage, currentPage === 1, () => currentPage--)
    );

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      DOM.pagination.appendChild(
        createPageItem(`${i}`, MESSAGES.page(i), false, () => currentPage = i, i === currentPage)
      );
    }

    // Botão "Próximo"
    DOM.pagination.appendChild(
      createPageItem('»', MESSAGES.nextPage, currentPage === totalPages, () => currentPage++)
    );
  }

  // A paginação é recriada a cada troca de página: sem isto o foco do teclado cairia no <body>
  function scrollToTop() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    DOM.count.closest('section').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    DOM.count.focus({ preventScroll: true });
  }
}

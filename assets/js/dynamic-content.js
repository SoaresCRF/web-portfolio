import { getHashForSection, getSectionFromHash } from './section-hash.js';
import { getMessages } from './messages.js';

const PAGE_LANGUAGE = document.documentElement.lang;

document.addEventListener('DOMContentLoaded', () => {
  // Seletores de elementos DOM usados globalmente
  const contentContainer = document.getElementById('content');
  const menuButtons = document.querySelectorAll('button[data-section]');
  // Link para a versão no outro idioma; a âncora é atualizada para abrir na mesma seção
  const languageSwitch = document.querySelector('a[data-language-switch]');
  const languageSwitchBase = languageSwitch?.getAttribute('href');
  // Identifica a navegação mais recente; respostas de cliques anteriores são descartadas
  let latestSectionRequest = 0;

  /**
   * Exibe uma mensagem de erro no conteúdo da página
   */
  const renderErrorMessage = () => {
    contentContainer.innerHTML = `<p role="alert">${getMessages(PAGE_LANGUAGE).contentError}</p>`;
  };

  /**
   * Recarrega a animação de fade-in forçando o reflow
   */
  const triggerFadeInAnimation = () => {
    contentContainer.classList.remove('animate-fade-in');
    void contentContainer.offsetWidth; // Força o reflow
    contentContainer.classList.add('animate-fade-in');
  };

  /**
   * Leva o foco ao título da seção carregada, para leitores de tela anunciarem a troca de conteúdo
   */
  const focusSectionHeading = () => {
    const heading = contentContainer.querySelector('h2');
    if (!heading) return;

    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  };

  /**
   * Carrega o conteúdo HTML de uma seção específica
   * @param {string} section Nome da seção a ser carregada
   * @param {{ moveFocus?: boolean }} [options] moveFocus: true quando a troca vem de uma ação do usuário
   */
  const loadSectionContent = async (section, { moveFocus = false } = {}) => {
    const requestId = ++latestSectionRequest;

    try {
      const response = await fetch(`${section}.html`);

      if (!response.ok) {
        throw new Error(`Erro ao carregar a seção: ${section}`);
      }

      const htmlContent = await response.text();
      if (requestId !== latestSectionRequest) return;

      contentContainer.innerHTML = htmlContent;
      triggerFadeInAnimation();
      if (moveFocus) focusSectionHeading();

      if (section === 'projects') {
        await loadProjectRepositories();
      }

    } catch (error) {
      console.error(error);
      if (requestId === latestSectionRequest) renderErrorMessage();
    }
  };

  /**
   * Importa e executa o carregamento de repositórios da seção de projetos
   */
  const loadProjectRepositories = async () => {
    try {
      const { loadRepositories } = await import('./repositories.js');
      loadRepositories();
    } catch (error) {
      console.error('Erro ao carregar os repositórios:', error);
    }
  };

  /**
   * Marca o botão da seção atual (aria-current também define o estilo de ativo)
   * @param {HTMLElement} activeButton Botão atualmente ativo
   */
  const highlightActiveButton = (activeButton) => {
    menuButtons.forEach(button => button.removeAttribute('aria-current'));
    activeButton.setAttribute('aria-current', 'page');
  };

  /**
   * Aponta o link do outro idioma para a mesma seção (ex.: #projetos → en/#projects)
   * @param {string} section Nome da seção
   */
  const updateLanguageSwitch = (section) => {
    if (!languageSwitch) return;
    languageSwitch.href = languageSwitchBase + getHashForSection(section, languageSwitch.hreflang);
  };

  /**
   * Marca o botão e carrega o conteúdo da seção
   * @param {string} section Nome da seção
   * @param {{ moveFocus?: boolean }} [options]
   */
  const showSection = (section, options) => {
    const button = document.querySelector(`button[data-section="${section}"]`);

    if (button) {
      highlightActiveButton(button);
      updateLanguageSwitch(section);
      loadSectionContent(section, options);
    } else {
      console.warn(`Botão da seção '${section}' não encontrado.`);
    }
  };

  /**
   * Configura os listeners de clique nos botões do menu
   * O clique só troca a âncora da URL; o hashchange carrega a seção, o que também cobre Voltar/Avançar
   */
  const setupMenuEventListeners = () => {
    menuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedSection = button.dataset.section;
        const targetHash = getHashForSection(selectedSection, PAGE_LANGUAGE);

        // Mesma âncora não dispara hashchange: recarrega direto (ex.: tentar de novo após erro)
        if (location.hash === targetHash) {
          showSection(selectedSection, { moveFocus: true });
        } else {
          location.hash = targetHash;
        }
      });
    });

    window.addEventListener('hashchange', () => {
      showSection(getSectionFromHash(location.hash, PAGE_LANGUAGE), { moveFocus: true });
    });
  };

  /**
   * Inicializa o carregamento da página
   * Abre a seção indicada pela âncora da URL ("Sobre Mim" quando não há âncora válida)
   */
  const initializePage = () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    setupMenuEventListeners();
    showSection(getSectionFromHash(location.hash, PAGE_LANGUAGE));
  };

  // Start
  initializePage();
});

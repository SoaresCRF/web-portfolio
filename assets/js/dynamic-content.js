document.addEventListener('DOMContentLoaded', () => {
  // Seletores de elementos DOM usados globalmente
  const contentContainer = document.getElementById('content');
  const menuButtons = document.querySelectorAll('button[data-section]');
  // Identifica a navegação mais recente; respostas de cliques anteriores são descartadas
  let latestSectionRequest = 0;

  /**
   * Exibe uma mensagem de erro no conteúdo da página
   */
  const renderErrorMessage = () => {
    contentContainer.innerHTML = '<p role="alert">Erro ao carregar o conteúdo.</p>';
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
   * Configura os listeners de clique nos botões do menu
   */
  const setupMenuEventListeners = () => {
    menuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedSection = button.dataset.section;
        highlightActiveButton(button);
        loadSectionContent(selectedSection, { moveFocus: true });
      });
    });
  };

  /**
   * Inicializa o carregamento da página
   * Define o botão e a seção "About" como padrão inicial
   */
  const initializePage = () => {
    setupMenuEventListeners();

    const defaultSection = 'about';
    const defaultButton = document.querySelector(`button[data-section="${defaultSection}"]`);

    if (defaultButton) {
      highlightActiveButton(defaultButton);
      loadSectionContent(defaultSection);
    } else {
      console.warn(`Botão padrão da seção '${defaultSection}' não encontrado.`);
    }
  };

  // Start
  initializePage();
});

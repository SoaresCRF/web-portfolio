document.addEventListener('DOMContentLoaded', () => {
  // Seletores de elementos DOM usados globalmente
  const contentContainer = document.getElementById('content');
  const menuButtons = document.querySelectorAll('button[data-section]');

  /**
   * Exibe uma mensagem de erro no conteúdo da página
   */
  const renderErrorMessage = () => {
    contentContainer.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
  };

  /**
   * Recarrega a animação de fade-in forçando o reflow
   */
  const triggerFadeInAnimation = () => {
    contentContainer.classList.remove('fade-in-section');
    void contentContainer.offsetWidth; // Força o reflow
    contentContainer.classList.add('fade-in-section');
  };

  /**
   * Carrega o conteúdo HTML de uma seção específica
   * @param {string} section Nome da seção a ser carregada
   */
  const loadSectionContent = async (section) => {
    try {
      const response = await fetch(`${section}.html`);

      if (!response.ok) {
        throw new Error(`Erro ao carregar a seção: ${section}`);
      }

      const htmlContent = await response.text();
      contentContainer.innerHTML = htmlContent;
      triggerFadeInAnimation();

      if (section === 'projects') {
        await loadProjectRepositories();
      }

    } catch (error) {
      console.error(error);
      renderErrorMessage();
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
   * Atualiza a aparência visual dos botões do menu para indicar o botão ativo
   * @param {HTMLElement} activeButton Botão atualmente ativo
   */
  const highlightActiveButton = (activeButton) => {
    menuButtons.forEach(button => button.classList.remove('active'));
    activeButton.classList.add('active');
  };

  /**
   * Configura os listeners de clique nos botões do menu
   */
  const setupMenuEventListeners = () => {
    menuButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedSection = button.dataset.section;
        highlightActiveButton(button);
        loadSectionContent(selectedSection);
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

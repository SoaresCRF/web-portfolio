import { getHashForSection, getSectionFromHash } from './section-hash.js';
import { getMessages } from './messages.js';

// Módulos rodam depois do parse do HTML: o DOM já está pronto, sem esperar o DOMContentLoaded
const PAGE_LANGUAGE = document.documentElement.lang;

// Seletores de elementos DOM usados globalmente
const contentContainer = document.getElementById('content');
const menuButtons = document.querySelectorAll('button[data-section]');
// Link para a versão no outro idioma; a âncora é atualizada para abrir na mesma seção
const languageSwitch = document.querySelector('a[data-language-switch]');
const languageSwitchBase = languageSwitch.getAttribute('href');
// Identifica a navegação mais recente; respostas de cliques anteriores são descartadas
let latestSectionRequest = 0;

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

    // loadRepositories trata os próprios erros; o catch abaixo cobre falha ao importar o módulo
    if (section === 'projects') {
      (await import('./repositories.js')).loadRepositories();
    }

  } catch (error) {
    console.error(error);
    if (requestId === latestSectionRequest) {
      contentContainer.innerHTML = `<p role="alert">${getMessages(PAGE_LANGUAGE).contentError}</p>`;
    }
  }
};

/**
 * Marca o botão da seção (aria-current também define o estilo de ativo), aponta o link do outro idioma
 * para a mesma seção (ex.: #projetos → en/#projects) e carrega o conteúdo
 * @param {string} section Nome da seção (sempre válido: vem de getSectionFromHash ou de um botão)
 * @param {{ moveFocus?: boolean }} [options]
 */
const showSection = (section, options) => {
  menuButtons.forEach(button => button.removeAttribute('aria-current'));
  document.querySelector(`button[data-section="${section}"]`).setAttribute('aria-current', 'page');
  languageSwitch.href = languageSwitchBase + getHashForSection(section, languageSwitch.hreflang);
  loadSectionContent(section, options);
};

// O clique só troca a âncora da URL; o hashchange carrega a seção, o que também cobre Voltar/Avançar
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

// Link "Pular para o conteúdo": a âncora #main dispararia o hashchange e trocaria a seção,
// então o foco vai direto para o <main> sem alterar a URL
document.querySelector('a[data-skip-link]').addEventListener('click', (event) => {
  event.preventDefault();
  document.getElementById('main').focus();
});

document.getElementById('current-year').textContent = new Date().getFullYear();
// Abre a seção indicada pela âncora da URL ("Sobre Mim" quando não há âncora válida)
showSection(getSectionFromHash(location.hash, PAGE_LANGUAGE));

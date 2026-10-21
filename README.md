# 🌐 Portfólio - Versão Web
Este é o projeto do meu portfólio web, desenvolvido em HTML, CSS e JavaScript. O site apresenta informações gerais sobre mim, além de listar meus repositórios públicos do GitHub de forma personalizada, consumindo uma API própria criada em Node.js. Para acessar o site clique [aqui](https://soarescrf.github.io/web-portfolio/ "Versão web")
> 💡 Também existe uma versão Android mobile deste portfólio: [GitHub](https://github.com/SoaresCRF/kotlin-mobile-portfolio "Projeto no GitHub")

## ✨ Funcionalidades principais
- Listagem dinâmica dos meus repositórios públicos do GitHub.
- Pesquisa dos repositórios por nome, tipo de tecnologia e ordenação (por data ↑↓ / A-Z)
- Links diretos para cada seção (`#sobre`, `#formacao`, `#experiencia`, `#projetos`), com suporte ao botão Voltar do navegador.
- Design simples, leve e funcional.
- Consumo de dados via API Node.js (hospedada no Render).

## 🛠️ Tecnologias utilizadas
- HTML, CSS e JavaScript
- Tailwind CSS v4
- Vite (build e servidor de desenvolvimento)
- Consumo de API REST
- Node.js *(somente como back-end intermediário para requisições GitHub, não incluído neste repositório)*

## 🔌 Como funciona a arquitetura
```plaintext
Site
    ↓
API Node.js (Render)
    ↓
GitHub API
```
- *O site não se conecta diretamente à API pública do GitHub, todas as requisições passam primeiro pela minha API backend (Node.js) hospedada no Render.*

## 💻 Desenvolvimento
Requer Node.js 20.19+ ou 22.12+.
```bash
npm install       # instala as dependências
npm run dev       # servidor local: http://localhost:5173/web-portfolio/
npm run build     # gera o site em dist/
npm run preview   # serve o build de dist/ localmente
npm test          # testes das funções puras de projetos e das âncoras das seções (node:test, sem dependências)
```
- `index.html`, `assets/css/style.css` (Tailwind) e `assets/js/` são processados pelo Vite.
- `public/` é copiado sem alterações: as seções carregadas via `fetch` (`about.html`, `education.html`, `projects.html`), o manifest e os ícones Android.

## 🚀 Deploy
O workflow `Deploy to GitHub Pages` (GitHub Actions) faz o build e publica `dist/` a cada push na `main`; em pull requests ele só valida o build. Em **Settings › Pages**, a origem deve estar como **GitHub Actions**.

## 📄 Licença
Este projeto está sob a licença MIT.
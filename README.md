# 🌐 Portfólio - Versão Web
Este é o projeto do meu portfólio web, desenvolvido em HTML, CSS e JavaScript. O site apresenta informações gerais sobre mim, além de listar meus repositórios públicos do GitHub de forma personalizada, com a lista gerada no build a partir da API do GitHub. Para acessar o site clique [aqui](https://soarescrf.github.io/web-portfolio/ "Versão web")
> 💡 Também existe uma versão Android mobile deste portfólio: [GitHub](https://github.com/SoaresCRF/kotlin-mobile-portfolio "Projeto no GitHub")

## ✨ Funcionalidades principais
- Listagem dinâmica dos meus repositórios públicos do GitHub.
- Pesquisa dos repositórios por nome, tipo de tecnologia e ordenação (por data ↑↓ / A-Z)
- Links diretos para cada seção (`#sobre`, `#formacao`, `#experiencia`, `#projetos`), com suporte ao botão Voltar do navegador.
- Design simples, leve e funcional.
- Lista de repositórios atualizada diariamente no build, sem servidor intermediário: carrega na hora.

## 🛠️ Tecnologias utilizadas
- HTML, CSS e JavaScript
- Tailwind CSS v4
- Vite (build e servidor de desenvolvimento)
- Node.js (script de build que consome a API REST do GitHub)
- GitHub Actions (build diário e deploy no GitHub Pages)

## 🔌 Como funciona a arquitetura
```plaintext
GitHub Actions (a cada push e 1x por dia)
    ↓  scripts/fetch-repositories.js
GitHub API → public/repositories.json
    ↓  build (Vite)
Site no GitHub Pages → fetch('repositories.json')
```
- *O visitante não espera nenhuma API: a lista é um arquivo estático publicado junto com o site. Repositórios novos aparecem no próximo build (no máximo em 24 h, ou na hora disparando o workflow manualmente).*

## 💻 Desenvolvimento
Requer Node.js 20.19+ ou 22.12+.
```bash
npm install       # instala as dependências
npm run fetch-repos  # gera public/repositories.json (o build faz isso sozinho; rode uma vez antes do dev)
npm run dev       # servidor local: http://localhost:5173/web-portfolio/
npm run build     # gera o site em dist/
npm run preview   # serve o build de dist/ localmente
npm test          # testes das funções puras de projetos e das âncoras das seções (node:test, sem dependências)
```
- `index.html`, `assets/css/style.css` (Tailwind) e `assets/js/` são processados pelo Vite.
- `public/` é copiado sem alterações: as seções carregadas via `fetch` (`about.html`, `education.html`, `projects.html`), o `repositories.json` gerado, o manifest e os ícones Android.

## 🚀 Deploy
O workflow `Deploy to GitHub Pages` (GitHub Actions) faz o build e publica `dist/` a cada push na `main` e diariamente às 06:00 (horário de Brasília); em pull requests ele só valida o build. Em **Settings › Pages**, a origem deve estar como **GitHub Actions**.

## 📄 Licença
Este projeto está sob a licença MIT.
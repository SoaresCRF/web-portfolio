# 🌐 Portfólio - Versão Web
Este é o projeto do meu portfólio web, desenvolvido em HTML, CSS e JavaScript. O site apresenta informações gerais sobre mim, além de listar meus repositórios públicos do GitHub de forma personalizada, consumindo uma API própria criada em Node.js. Para acessar o site clique [aqui](https://soarescrf.github.io/web-portfolio/ "Versão web")
> 💡 Também existe uma versão Android mobile deste portfólio: [GitHub](https://github.com/SoaresCRF/kotlin-mobile-portfolio "Projeto no GitHub")

## ✨ Funcionalidades principais
- Listagem dinâmica dos meus repositórios públicos do GitHub.
- Pesquisa dos repositórios por nome, tipo de tecnologia e ordenação (por data ↑↓ / A-Z)
- Design simples, leve e funcional.
- Consumo de dados via API Node.js (hospedada no Render).

## 🛠️ Tecnologias utilizadas
- HTML, CSS e JavaScript
- Bootstrap
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

## 📄 Licença
Este projeto está sob a licença MIT.
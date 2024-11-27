document.addEventListener('DOMContentLoaded', () => {
    const searchLawsInput = document.getElementById('search-laws');
    const lawButtons = document.querySelectorAll('.law-button');
    const lawContent = document.getElementById('law-content');
    const loginBtn = document.getElementById('login-btn');
    const searchTextInput = document.getElementById('search-text');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const iconMoon = document.getElementById('theme-icon-moon');
    const iconSun = document.getElementById('theme-icon-sun');
    const themeText = document.getElementById('theme-text');
    const bodyElement = document.body;
    const lawCache = {};

    // Função para mostrar mensagens temporárias
    function showTemporaryMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'temporary-message';
        msgDiv.textContent = message;
        document.body.appendChild(msgDiv);
        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }

    // Filtrar botões de leis com base na pesquisa
    searchLawsInput.addEventListener('input', () => {
        const query = searchLawsInput.value.toLowerCase();
        lawButtons.forEach(button => {
            const text = button.textContent.toLowerCase();
            button.parentElement.style.display = text.includes(query) ? 'block' : 'none';
        });
    });

    // Função para exibir o conteúdo da lei
    function displayLawContent(data) {
        let htmlContent = `<h1>${data.name}</h1>`;
        let currentListType = null; // Para gerenciar listas aninhadas

        data.sections.forEach(section => {
            const type = section.type;
            let identifier = section.identifier ? section.identifier : '';
            const content = section.content ? section.content : '';
            const path = section.path;

            switch(type) {
                case 'Epígrafe':
                    // Exibir epígrafe como h2 com classe 'epigrafe', centralizado, sem a palavra 'Epígrafe'
                    htmlContent += `<h2 class="epigrafe">${content}</h2>`;
                    break;
                case 'Ementa':
                    // Exibir ementa como parágrafo alinhado à esquerda com recuo
                    htmlContent += `<p class="p-ementa">${content}</p>`;
                    break;
                case 'Preâmbulo':
                    // Exibir 'Preâmbulo' como h2, centralizado, seguido do conteúdo
                    htmlContent += `<h2 class="preambulo-subtitle">Preâmbulo</h2>`;
                    htmlContent += `<p class="preambulo-content">${content}</p>`;
                    break;
                case 'Disposições Preliminares':
                case 'Disposições Gerais':
                case 'Disposições Finais':
                case 'Disposições Transitórias':
                    // Exibir como h2, centralizado
                    htmlContent += `<h2>${type}</h2>`;
                    break;
                case 'Parte':
                    // Exibir 'Parte' seguido do identifier como h3, centralizado
                    htmlContent += `<h3>Parte ${identifier}</h3>`;
                    break;
                case 'Livro':
                    // Exibir 'Livro' seguido do identifier e conteúdo como h4, centralizado
                    htmlContent += `<h4>Livro ${identifier} - ${content}</h4>`;
                    break;
                case 'Título':
                    // Exibir 'Título' seguido do identifier e conteúdo como h4, centralizado
                    htmlContent += `<h4>Título ${identifier} - ${content}</h4>`;
                    break;
                case 'Capítulo':
                    // Exibir 'Capítulo' seguido do identifier e conteúdo como h5, centralizado
                    htmlContent += `<h5>Capítulo ${identifier} - ${content}</h5>`;
                    break;
                case 'Seção':
                    // Exibir 'Seção' seguido do identifier e conteúdo como h5, centralizado
                    htmlContent += `<h5>Seção ${identifier} - ${content}</h5>`;
                    break;
                case 'Subseção':
                    // Exibir 'Subseção' seguido do identifier e conteúdo como h6, centralizado
                    htmlContent += `<h6>Subseção ${identifier} - ${content}</h6>`;
                    break;
                case 'Artigo':
                    // Fechar qualquer lista aberta antes de renderizar o Artigo
                    if (currentListType) {
                        htmlContent += `</ul>`;
                        currentListType = null;
                    }
                    // Exibir "Art. identifier content" como parágrafo alinhado à esquerda e sem negrito, com 'Art. identifier' em negrito
                    htmlContent += `<p><strong>Art. ${identifier}</strong> ${content}</p>`;
                    break;
                case 'Parágrafo':
                    if (identifier.toLowerCase() === 'único') {
                        htmlContent += `<p><strong>Parágrafo ${identifier}.</strong> ${content}</p>`;
                    } else {
                        // Remove qualquer símbolo '§' existente e espaços antes
                        identifier = identifier.replace(/^§+/, '').trim();

                        // Extrair a parte numérica do identifier
                        const numberMatch = identifier.match(/\d+/);
                        const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;

                        // Determinar se adiciona ponto final baseado no número
                        if (number >= 10) {
                            htmlContent += `<p><strong>§ ${identifier}.</strong> ${content}</p>`;
                        } else {
                            htmlContent += `<p><strong>§ ${identifier}</strong> ${content}</p>`;
                        }
                    }
                    break;
                case 'Inciso':
                    // Fechar listas se necessário
                    if (currentListType !== 'inciso') {
                        if (currentListType) {
                            htmlContent += `</ul>`;
                        }
                        htmlContent += `<ul>`;
                        currentListType = 'inciso';
                    }
                    htmlContent += `<li>${identifier} - ${content}</li>`;
                    break;
                case 'Alínea':
                    if (currentListType !== 'alinea') {
                        if (currentListType) {
                            htmlContent += `</ul>`;
                        }
                        htmlContent += `<ul type="a">`;
                        currentListType = 'alinea';
                    }
                    htmlContent += `<li>${identifier}) ${content}</li>`;
                    break;
                case 'Item':
                    if (currentListType !== 'item') {
                        if (currentListType) {
                            htmlContent += `</ul>`;
                        }
                        htmlContent += `<ul type="1">`;
                        currentListType = 'item';
                    }
                    htmlContent += `<li>${identifier}. ${content}</li>`;
                    break;
                case 'Data de Promulgação':
                case 'Data de Publicação':
                    // Exibir como p, centralizado
                    htmlContent += `<p><strong>${type}:</strong> ${content}</p>`;
                    break;
                default:
                    // Fechar qualquer lista aberta se não for um tipo de lista
                    if (currentListType) {
                        htmlContent += `</ul>`;
                        currentListType = null;
                    }
                    // Para tipos não especificados, exibir como parágrafo alinhado à esquerda
                    htmlContent += `<p>${content}</p>`;
                    break;
            }
        });

        // Fechar qualquer lista aberta no final
        if (currentListType) {
            htmlContent += `</ul>`;
        }

        lawContent.innerHTML = htmlContent;
    }

    // Manipular clique nos botões de leis
    lawButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lawId = button.dataset.lawId;

            // Adicionar classe 'selected' ao botão clicado e remover dos outros
            lawButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');

            // Mostra o loader
            lawContent.innerHTML = `
                <div class="loader">
                    <div class="spinner"></div>
                    <p>Carregando...</p>
                </div>
            `;

            // Verifica cache
            if (lawCache[lawId]) {
                displayLawContent(lawCache[lawId]);
            } else {
                // Faz a chamada ao endpoint com o ID da lei
                fetch(`/api/laws/${lawId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) {
                            lawContent.innerHTML = `<p>${data.error}</p>`;
                        } else {
                            lawCache[lawId] = data;
                            displayLawContent(data);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        lawContent.innerHTML = `<p>Erro ao carregar o conteúdo da lei.</p>`;
                    });
            }
        });
    });

    // Botão de login
    loginBtn.addEventListener('click', () => {
        showTemporaryMessage('Função de login ainda não implementada.');
    });

    // Pesquisa no texto da lei
    searchTextInput.addEventListener('input', () => {
        showTemporaryMessage('Função de busca no texto da lei ainda não implementada.');
    });

    // Função para definir o tema
    function setTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-theme');
            iconMoon.style.display = 'none';
            iconSun.style.display = 'block';
            themeText.textContent = 'Tema claro';
            themeToggleBtn.setAttribute('aria-pressed', 'true');
            localStorage.setItem('theme', 'dark');
        } else {
            bodyElement.classList.remove('dark-theme');
            iconMoon.style.display = 'block';
            iconSun.style.display = 'none';
            themeText.textContent = 'Tema escuro';
            themeToggleBtn.setAttribute('aria-pressed', 'false');
            localStorage.setItem('theme', 'light');
        }
    }

    // Inicializa o tema
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Alterna o tema quando o botão é clicado
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
});

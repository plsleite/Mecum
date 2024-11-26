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
        data.sections.forEach(section => {
            const pathParts = section.path.split('.');
            const depth = pathParts.length;
            const headingLevel = Math.min(depth + 1, 6); // h2 a h6
            const headingTag = `h${headingLevel}`;
            htmlContent += `<${headingTag}>${section.title}</${headingTag}><p>${section.content}</p>`;
        });
        lawContent.innerHTML = htmlContent;
    }

    // Manipular clique nos botões de leis
    lawButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lawName = button.textContent.trim();
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

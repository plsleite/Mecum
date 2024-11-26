document.addEventListener('DOMContentLoaded', function () {
    const searchLawsInput = document.getElementById('search-laws');
    const lawButtons = document.querySelectorAll('.law-button'); // Seleciona apenas botões de leis
    const lawTitle = document.getElementById('law-title');
    const lawContent = document.getElementById('law-content');
  
    // Filtrar botões de leis com base na pesquisa
    searchLawsInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        lawButtons.forEach(function (button) {
            if (button.textContent.toLowerCase().includes(query)) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });
    });
  
    // Manipular clique nos botões de leis
    lawButtons.forEach(function (button) {
      button.addEventListener('click', function () {
          const lawName = this.textContent.trim();
          const lawId = this.dataset.lawId; // data-law-id será acessado como dataset.lawId
  
          // Atualiza o título da lei
          lawTitle.textContent = lawName;
  
          // Limpa o conteúdo anterior e mostra um indicador de carregamento
          lawContent.innerHTML = '<p>Carregando...</p>';
  
          // Faz a chamada ao endpoint com o ID da lei
          fetch(`/api/laws/${lawId}`)
              .then(response => response.json())
              .then(data => {
                  if (data.error) {
                      lawContent.innerHTML = `<p>${data.error}</p>`;
                  } else {
                      // Preenche o conteúdo da lei retornada pelo endpoint
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
              })
              .catch(error => {
                  console.error('Error fetching data:', error);
                  lawContent.innerHTML = `<p>Erro ao carregar o conteúdo da lei.</p>`;
              });
      });
    });
  
    // Botão de login
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', function () {
        alert('Função de login ainda não implementada.');
    });
  
    // Pesquisa no texto da lei
    const searchTextInput = document.getElementById('search-text');
    searchTextInput.addEventListener('input', function () {
        // Implementação futura da pesquisa no texto da lei
        alert('Função de busca no texto da lei ainda não implementada.');
    });
  
    // Botão de alternância de tema
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const iconMoon = document.getElementById('theme-icon-moon');
    const iconSun = document.getElementById('theme-icon-sun');
    const themeText = document.getElementById('theme-text');
    const bodyElement = document.body;
  
    // Define o tema inicial com base no localStorage ou no padrão
    const savedTheme = localStorage.getItem('theme');
  
    function setTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-theme');
            iconMoon.style.display = 'none';
            iconSun.style.display = 'block';
            themeText.textContent = 'Tema claro';
            localStorage.setItem('theme', 'dark');
        } else {
            bodyElement.classList.remove('dark-theme');
            iconMoon.style.display = 'block';
            iconSun.style.display = 'none';
            themeText.textContent = 'Tema escuro';
            localStorage.setItem('theme', 'light');
        }
    }
  
    // Inicializa o tema
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  
    // Alterna o tema quando o botão é clicado
    themeToggleBtn.addEventListener('click', function () {
        const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
});

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
  let currentLawId = null; // Variável para armazenar a lei atual

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

  // Função para determinar a profundidade com base no path
  function getDepth(path) {
    return path.split('.').length;
  }

  // Função para gerar IDs únicos para agrupamentos
  function generateId(type, identifier) {
    let id = type.toLowerCase().replace(/\s+/g, '-');
    if (identifier) {
      id += `-${identifier.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
    }
    return id;
  }

  // Função para exibir o conteúdo da lei
  function displayLawContent(data) {
    let htmlContent = `<h1>${data.name}</h1>`;

    data.sections.forEach(section => {
      const type = section.type;
      let identifier = section.identifier ? section.identifier : '';
      const content = section.content ? section.content : '';
      const path = section.path;

      // Determinar a profundidade da seção
      const depth = getDepth(path);

      // Classe de indentação baseada na profundidade
      const indentClass = `indent-level-${depth}`;

      // Gerar um ID único para cada agrupamento
      let groupingId = '';
      switch(type) {
        case 'Epígrafe':
          groupingId = generateId(type, '');
          htmlContent += `<h2 id="${groupingId}" class="grouping-header epigrafe">${content}</h2>`;
          break;
        case 'Ementa':
          // Ementa não é um agrupamento, mantemos como parágrafo
          htmlContent += `<p class="p-ementa">${content}</p>`;
          break;
        case 'Preâmbulo':
          groupingId = generateId(type, '');
          htmlContent += `<h2 id="${groupingId}" class="grouping-header preambulo-subtitle">Preâmbulo</h2>`;
          htmlContent += `<p class="preambulo-content">${content}</p>`;
          break;
        case 'Disposições Preliminares':
        case 'Disposições Gerais':
        case 'Disposições Finais':
        case 'Disposições Transitórias':
          groupingId = generateId(type, '');
          htmlContent += `<h2 id="${groupingId}" class="grouping-header">${type}</h2>`;
          break;
        case 'Parte':
          groupingId = generateId(type, identifier);
          htmlContent += `<h3 id="${groupingId}" class="grouping-header">Parte ${identifier}</h3>`;
          break;
        case 'Livro':
          groupingId = generateId(type, identifier);
          htmlContent += `<h4 id="${groupingId}" class="grouping-header">Livro ${identifier} - ${content}</h4>`;
          break;
        case 'Título':
          groupingId = generateId(type, identifier);
          htmlContent += `<h4 id="${groupingId}" class="grouping-header">Título ${identifier} - ${content}</h4>`;
          break;
        case 'Capítulo':
          groupingId = generateId(type, identifier);
          htmlContent += `<h5 id="${groupingId}" class="grouping-header">Capítulo ${identifier} - ${content}</h5>`;
          break;
        case 'Seção':
          groupingId = generateId(type, identifier);
          htmlContent += `<h5 id="${groupingId}" class="grouping-header">Seção ${identifier} - ${content}</h5>`;
          break;
        case 'Subseção':
          groupingId = generateId(type, identifier);
          htmlContent += `<h6 id="${groupingId}" class="grouping-header">Subseção ${identifier} - ${content}</h6>`;
          break;
        case 'Artigo':
          // Exibir "Art. identifier content" como parágrafo alinhado à esquerda e sem negrito, com 'Art. identifier' em negrito
          htmlContent += `<p class="artigo"><strong>Art. ${identifier}</strong> ${content}</p>`;
          break;
        case 'Parágrafo':
          if (identifier.toLowerCase() === 'único') {
            htmlContent += `<p class="paragrafo"><strong>Parágrafo ${identifier}.</strong> ${content}</p>`;
          } else {
            // Remove qualquer símbolo '§' existente e espaços antes
            identifier = identifier.replace(/^§+/, '').trim();

            // Extrair a parte numérica do identifier
            const numberMatch = identifier.match(/\d+/);
            const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;

            // Determinar se adiciona ponto final baseado no número
            if (number >= 10) {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}.</strong> ${content}</p>`;
            } else {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}</strong> ${content}</p>`;
            }
          }
          break;
        case 'Inciso':
          // Exibir Inciso como parágrafo com indentação baseada na profundidade
          htmlContent += `<p class="inciso ${indentClass}">${identifier} - ${content}</p>`;
          break;
        case 'Alínea':
          // Exibir Alínea como parágrafo com indentação baseada na profundidade
          htmlContent += `<p class="alinea ${indentClass}">${identifier}) ${content}</p>`;
          break;
        case 'Item':
          // Exibir Item como parágrafo com indentação baseada na profundidade
          htmlContent += `<p class="item ${indentClass}">${identifier}. ${content}</p>`;
          break;
        case 'Data de Promulgação':
        case 'Data de Publicação':
          // Exibir como parágrafo, centralizado
          htmlContent += `<p class="data-publicacao"><strong>${type}:</strong> ${content}</p>`;
          break;
        default:
          // Exibir como parágrafo alinhado à esquerda
          htmlContent += `<p>${content}</p>`;
          break;
      }
    });

    lawContent.innerHTML = htmlContent;

    // Após inserir o conteúdo, atualizar os sticky headers
    updateStickyHeaders();
  }

  // Manipular clique nos botões de leis
  lawButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lawId = button.dataset.lawId;
      currentLawId = lawId; // Atualiza a lei atual

      // Adicionar classe 'selected' ao botão clicado e remover dos outros
      lawButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');

      // Desabilitar todos os botões durante o carregamento
      lawButtons.forEach(btn => btn.disabled = true);

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
        lawButtons.forEach(btn => btn.disabled = false);
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
            showTemporaryMessage('Erro ao carregar o conteúdo da lei.');
            lawContent.innerHTML = `<p>Erro ao carregar o conteúdo da lei.</p>`;
          })
          .finally(() => {
            // Reabilitar os botões após o carregamento
            lawButtons.forEach(btn => btn.disabled = false);
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

  // Função para atualizar os Sticky Headers
  function updateStickyHeaders() {
    const fixedHeadersContainer = document.getElementById('fixed-headers');
    fixedHeadersContainer.innerHTML = ''; // Limpa os headers fixos

    const groupingHeaders = document.querySelectorAll('.grouping-header');
    const currentScroll = window.scrollY;
    const viewportHeight = window.innerHeight;

    const activeHeaders = [];

    groupingHeaders.forEach(header => {
      const headerTop = header.getBoundingClientRect().top + window.scrollY;
      if (headerTop <= currentScroll + 10) { // 10px de margem
        activeHeaders.push(header);
      }
    });

    // Mantém apenas os últimos cinco agrupamentos
    const lastFive = activeHeaders.slice(-5);

    lastFive.forEach(header => {
      const headerText = header.textContent.trim();
      const headerId = header.id;
      const headerTag = header.tagName.toLowerCase();
      let depth = 0;

      // Determinar a profundidade com base na tag (h2: 2, h3:3, etc.)
      if (headerTag.startsWith('h')) {
        depth = parseInt(headerTag.replace('h', ''), 10);
      }

      // Calcula a indentação: h2 (Disposições Preliminares) -> 0px, h3 -> 20px, h4 -> 40px, etc.
      const indentation = (depth - 2) * 20; // Ajuste conforme necessário

      // Criar o botão fixo
      const headerButton = document.createElement('button');
      headerButton.className = 'fixed-header';
      headerButton.textContent = headerText;

      // Aplicar indentação baseada na profundidade
      headerButton.style.marginLeft = `${indentation}px`;

      // Adicionar click listener para rolar até o header correspondente
      headerButton.addEventListener('click', () => {
        document.getElementById(headerId).scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });

      fixedHeadersContainer.appendChild(headerButton);
    });
  }

  // Atualizar os Sticky Headers ao rolar a página
  window.addEventListener('scroll', updateStickyHeaders);
  // Atualizar os Sticky Headers ao redimensionar a janela
  window.addEventListener('resize', updateStickyHeaders);
});

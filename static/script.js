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
  const fontToggleBtn = document.getElementById('font-toggle-btn'); // Novo botão
  const fontDropdown = document.getElementById('font-dropdown');
  const bodyElement = document.body;
  const lawCache = {};
  let currentLawId = null;

  // Elementos para Handles
  const leftHandle = document.querySelector('.left-handle');
  const rightHandle = document.querySelector('.right-handle');
  const leftSidebar = document.querySelector('.left-sidebar');
  const rightSidebar = document.querySelector('.right-sidebar');

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

  // Filtrar botões de leis com base na pesquisa com debounce
  let debounceTimer;
  searchLawsInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchLawsInput.value.toLowerCase();
      lawButtons.forEach(button => {
        const text = button.textContent.toLowerCase();
        button.parentElement.style.display = text.includes(query) ? 'block' : 'none';
      });
    }, 300);
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
    let htmlContent = ``;

    // Definir os tipos que são considerados como filhos que requerem ícone de seta
    const childTypes = new Set(['Artigo', 'Inciso', 'Parágrafo', 'Alínea', 'Item']);

    // Preprocessar para determinar quais headers têm filhos relevantes
    const pathsWithChildren = new Set();
    data.sections.forEach(section => {
      data.sections.forEach(child => {
        if (child.path.startsWith(section.path + '.') && child.path !== section.path && childTypes.has(child.type)) {
          pathsWithChildren.add(section.path);
        }
      });
    });

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
      let headerText = '';
      let hasChildren = pathsWithChildren.has(path);

      switch(type) {
        case 'Epígrafe':
          groupingId = generateId(type, '');
          // 'Epígrafe' nunca contém artigos, portanto, sem ícone de seta
          htmlContent += `<div id="${groupingId}" class="grouping-header epigrafe ${indentClass}" data-type="${type}">
            <span class="header-text">${content}</span>
          </div>`;
          break;
        case 'Ementa':
          htmlContent += `<p class="p-ementa">${content}</p>`;
          break;
        case 'Preâmbulo':
          groupingId = generateId(type, '');
          // 'Preâmbulo' também não possui filhos
          htmlContent += `<div id="${groupingId}" class="grouping-header preambulo-subtitle ${indentClass}" data-type="${type}">
            <span class="header-text">Preâmbulo</span>
          </div>`;
          htmlContent += `<p class="preambulo-content">${content}</p>`;
          break;
        case 'Disposições Preliminares':
        case 'Disposições Gerais':
        case 'Disposições Finais':
        case 'Disposições Transitórias':
          groupingId = generateId(type, '');
          headerText = `${type}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Parte':
          groupingId = generateId(type, identifier);
          headerText = `Parte ${identifier}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Livro':
          groupingId = generateId(type, identifier);
          headerText = `Livro ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Título':
          groupingId = generateId(type, identifier);
          headerText = `Título ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Capítulo':
          groupingId = generateId(type, identifier);
          headerText = `Capítulo ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Seção':
          groupingId = generateId(type, identifier);
          headerText = `Seção ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Subseção':
          groupingId = generateId(type, identifier);
          headerText = `Subseção ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Artigo':
          htmlContent += `<p class="artigo"><strong>Art. ${identifier}</strong> ${content}</p>`;
          break;
        case 'Parágrafo':
          if (identifier.toLowerCase() === 'único') {
            htmlContent += `<p class="paragrafo"><strong>Parágrafo ${identifier}.</strong> ${content}</p>`;
          } else {
            identifier = identifier.replace(/^§+/, '').trim();
            const numberMatch = identifier.match(/\d+/);
            const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
            if (number >= 10) {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}.</strong> ${content}</p>`;
            } else {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}</strong> ${content}</p>`;
            }
          }
          break;
        case 'Inciso':
          htmlContent += `<p class="inciso ${indentClass}">${identifier} - ${content}</p>`;
          break;
        case 'Alínea':
          htmlContent += `<p class="alinea ${indentClass}">${identifier}) ${content}</p>`;
          break;
        case 'Item':
          htmlContent += `<p class="item ${indentClass}">${identifier}. ${content}</p>`;
          break;
        case 'Data de Promulgação':
        case 'Data de Publicação':
          htmlContent += `<p class="data-publicacao"><strong>${type}:</strong> ${content}</p>`;
          break;
        default:
          htmlContent += `<p>${content}</p>`;
          break;
      }
    });

    lawContent.innerHTML = htmlContent;

    // Inicializar os eventos dos grouping headers
    initGroupingHeaderEvents();
  }

  // Manipular clique nos botões de leis
  lawButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lawId = button.dataset.lawId;
      currentLawId = lawId;

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

  // Botão de Fonte
  fontToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevenir que o clique feche o dropdown imediatamente
    const isHidden = fontDropdown.classList.contains('hidden');
    closeFontDropdown(); // Fechar outros dropdowns se existirem
    if (isHidden) {
      fontDropdown.classList.remove('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      fontDropdown.classList.add('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Evento de clique nas opções de fonte
  const fontOptions = document.querySelectorAll('.font-option');
  fontOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selectedFont = option.dataset.font;
      applyFont(selectedFont);
      showTemporaryMessage(`Fonte alterada para ${selectedFont}.`);
      closeFontDropdown();
    });
  });

  // Função para aplicar a fonte selecionada ao conteúdo principal
  function applyFont(fontName) {
    const content = document.querySelector('.content');
    if (content) {
      content.style.fontFamily = `'${fontName}', sans-serif`;
    }
  }

  // Função para fechar o dropdown de fontes
  function closeFontDropdown() {
    fontDropdown.classList.add('hidden');
    fontToggleBtn.setAttribute('aria-expanded', 'false');
  }

  // Fechar o dropdown quando clicar fora
  document.addEventListener('click', (event) => {
    if (!fontDropdown.contains(event.target) && !fontToggleBtn.contains(event.target)) {
      closeFontDropdown();
    }
  });

  // Pesquisa no texto da lei com debounce
  let searchDebounceTimer;
  searchTextInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      showTemporaryMessage('Função de busca no texto da lei ainda não implementada.');
    }, 300);
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

  // Inicializar eventos dos grouping headers
  function initGroupingHeaderEvents() {
    const groupingHeaders = document.querySelectorAll('.grouping-header');

    groupingHeaders.forEach(header => {
      const expandIcon = header.querySelector('.expand-icon');
      const headerType = header.getAttribute('data-type');

      // Apenas headers com ícone de seta possuem conteúdo a expandir
      if (expandIcon) {
        // Garantir que o ícone está na orientação correta com base na classe inicial
        if (header.classList.contains('expanded')) {
          // Nenhuma ação necessária, CSS já define a orientação
        } else {
          // Definir a orientação inicial para a direita
          // CSS já faz isso baseado na classe
        }

        header.addEventListener('click', (event) => {
          // Prevenir a propagação do evento caso o clique seja no ícone
          if (event.target.classList.contains('expand-icon')) {
            event.stopPropagation();
          }

          if (header.classList.contains('is-sticky')) {
            // Header está sticky: rolar para a posição original
            const headerId = header.id;
            const originalHeader = document.getElementById(headerId);
            if (originalHeader) {
              originalHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            // Header não está sticky: expandir/contrair
            const isExpanded = header.classList.contains('expanded');
            header.classList.toggle('expanded', !isExpanded);
            header.classList.toggle('collapsed', isExpanded);

            const nextElements = [];
            let nextSibling = header.nextElementSibling;

            while (nextSibling && !nextSibling.classList.contains('grouping-header')) {
              nextElements.push(nextSibling);
              nextSibling = nextSibling.nextElementSibling;
            }

            // Alternar visibilidade
            nextElements.forEach(element => {
              element.style.display = isExpanded ? 'none' : '';
            });
          }
        });
      }
    });
  }

  // Configurar Intersection Observer para detectar headers sticky
  const sentinel = document.getElementById('sentinel');
  const observerOptions = {
    root: null, // viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const headers = document.querySelectorAll('.grouping-header');
      headers.forEach(header => {
        if (!entry.isIntersecting && isElementAtTop(header)) {
          header.classList.add('is-sticky');
        } else {
          header.classList.remove('is-sticky');
        }
      });
    });
  }, observerOptions);

  observer.observe(sentinel);

  // Função auxiliar para verificar se o header está no topo
  function isElementAtTop(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom > 0;
  }

  // Eventos para Handles nas Telas Pequenas
  leftHandle.addEventListener('mouseenter', () => {
    leftSidebar.classList.add('open');
  });

  leftHandle.addEventListener('mouseleave', () => {
    leftSidebar.classList.remove('open');
  });

  leftSidebar.addEventListener('mouseenter', () => {
    leftSidebar.classList.add('open');
  });

  leftSidebar.addEventListener('mouseleave', () => {
    leftSidebar.classList.remove('open');
  });

  rightHandle.addEventListener('mouseenter', () => {
    rightSidebar.classList.add('open');
  });

  rightHandle.addEventListener('mouseleave', () => {
    rightSidebar.classList.remove('open');
  });

  rightSidebar.addEventListener('mouseenter', () => {
    rightSidebar.classList.add('open');
  });

  rightSidebar.addEventListener('mouseleave', () => {
    rightSidebar.classList.remove('open');
  });

  // Listener para Redimensionamento da Janela
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      leftSidebar.classList.remove('open');
      rightSidebar.classList.remove('open');
    }
  });
});

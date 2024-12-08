document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos do DOM
  const searchLawsInput = document.getElementById('search-laws');
  const lawButtons = document.querySelectorAll('.law-button');
  const lawContent = document.getElementById('law-content');
  const loginBtn = document.getElementById('login-btn');
  const searchTextInput = document.getElementById('search-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  const themeText = document.getElementById('theme-text');
  const fontToggleBtn = document.getElementById('font-toggle-btn');
  const fontDropdown = document.getElementById('font-dropdown');
  const bodyElement = document.body;
  const searchResultsContainer = document.getElementById('search-results');
  const navigationButtonsContainer = document.getElementById('navigation-buttons');
  const prevButton = document.getElementById('prev-occurrence');
  const nextButton = document.getElementById('next-occurrence');
  const searchCountElement = document.getElementById('search-count'); // Adicionado
  const lawCache = {};
  let currentLawId = null;
  let originalLawContent = null;

  // Variáveis para Navegação entre Ocorrências
  let currentMatchIndex = -1;
  let totalMatches = 0;

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

  // Função para normalizar texto (remove acentos e converte para minúsculas)
  function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Filtrar botões de leis com base na pesquisa (debounce)
  let debounceTimer;
  searchLawsInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = normalizeText(searchLawsInput.value);
      lawButtons.forEach(button => {
        const text = normalizeText(button.textContent);
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

  // Exibir o conteúdo da lei
  function displayLawContent(data) {
    let htmlContent = ``;
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

      const depth = getDepth(path);
      const indentClass = `indent-level-${depth}`;
      let groupingId = '';
      let headerText = '';
      let hasChildren = pathsWithChildren.has(path);

      switch(type) {
        case 'Epígrafe':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header epigrafe ${indentClass}" data-type="${type}">
            <span class="header-text">${content}</span>
          </div>`;
          break;
        case 'Ementa':
          htmlContent += `<p class="p-ementa">${content}</p>`;
          break;
        case 'Preâmbulo':
          groupingId = generateId(type, '');
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
    originalLawContent = htmlContent; 
    initGroupingHeaderEvents();
  }

  // Clique nos botões de leis
  lawButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lawId = button.dataset.lawId;
      currentLawId = lawId;

      lawButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');

      lawButtons.forEach(btn => btn.disabled = true);

      lawContent.innerHTML = `
        <div class="loader">
          <div class="spinner"></div>
          <p>Carregando...</p>
        </div>
      `;

      if (lawCache[lawId]) {
        displayLawContent(lawCache[lawId]);
        lawButtons.forEach(btn => btn.disabled = false);
      } else {
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
            lawButtons.forEach(btn => btn.disabled = false);
          });
      }

      // Resetar navegação entre ocorrências ao mudar de lei
      resetNavigation();
    });
  });

  // Botão de login
  loginBtn.addEventListener('click', () => {
    showTemporaryMessage('Função de login ainda não implementada.');
  });

  // Botão de Fonte
  fontToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = fontDropdown.classList.contains('hidden');
    closeFontDropdown();
    if (isHidden) {
      fontDropdown.classList.remove('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      fontDropdown.classList.add('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const fontOptions = document.querySelectorAll('.font-option');
  fontOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selectedFont = option.dataset.font;
      applyFont(selectedFont);
      showTemporaryMessage(`Fonte alterada para ${selectedFont}.`);
      closeFontDropdown();
    });
  });

  function applyFont(fontName) {
    const content = document.querySelector('.content');
    if (content) {
      content.style.fontFamily = `'${fontName}', sans-serif`;
    }
  }

  function closeFontDropdown() {
    fontDropdown.classList.add('hidden');
    fontToggleBtn.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', (event) => {
    if (!fontDropdown.contains(event.target) && !fontToggleBtn.contains(event.target)) {
      closeFontDropdown();
    }
  });

  let searchDebounceTimer;
  searchTextInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      const query = searchTextInput.value.trim();
      handleSearchInLawContent(query);
    }, 300);
  });

  /* Adicionado: Navegação com as teclas Enter, Setas para Baixo e Setas para Cima no campo de busca */
  searchTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextButton.click();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextButton.click();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      prevButton.click();
    }
  });

  /* Funções para Navegação entre Ocorrências */

  // Resetar navegação entre ocorrências
  function resetNavigation() {
    currentMatchIndex = -1;
    totalMatches = 0;
    updateNavigationButtons();
    removeCurrentHighlight();
    // Ocultar os botões de navegação
    navigationButtonsContainer.classList.add('hidden');
    // Resetar a contagem de resultados
    searchCountElement.textContent = '';
    // Remover a classe 'selected' de todos os botões de resultados
    const allResultButtons = searchResultsContainer.querySelectorAll('button');
    allResultButtons.forEach(btn => btn.classList.remove('selected'));
  }

  // Atualizar o estado dos botões de navegação
  function updateNavigationButtons() {
    if (totalMatches > 0) {
      navigationButtonsContainer.classList.remove('hidden');
      prevButton.disabled = false;
      nextButton.disabled = false;
    } else {
      navigationButtonsContainer.classList.add('hidden');
      prevButton.disabled = true;
      nextButton.disabled = true;
    }

    // Resetar os botões se não houver mais ocorrências
    if (currentMatchIndex < 0 || currentMatchIndex >= totalMatches) {
      prevButton.disabled = true;
      nextButton.disabled = true;
    }
  }

  // Definir a ocorrência atual
  function setCurrentMatch(index) {
    // Remover destaque anterior
    removeCurrentHighlight();

    // Atualizar o índice atual
    currentMatchIndex = index;

    // Adicionar destaque atual no conteúdo principal
    const highlightEl = lawContent.querySelector(`mark.highlight[data-match-index="${index}"]`);
    if (highlightEl) {
      highlightEl.classList.add('current-highlight');
      highlightEl.scrollIntoView({behavior: 'smooth', block: 'center'});
    }

    updateNavigationButtons();

    // Atualizar contagem de resultados
    searchCountElement.textContent = `Resultados: ${currentMatchIndex + 1}/${totalMatches}`;

    // Atualizar a seleção na sidebar de resultados
    const allResultButtons = searchResultsContainer.querySelectorAll('button');
    allResultButtons.forEach(btn => btn.classList.remove('selected'));
    const selectedButton = searchResultsContainer.querySelector(`button[data-target="${index}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
  }

  // Remover o destaque atual
  function removeCurrentHighlight() {
    const currentEl = lawContent.querySelector('mark.highlight.current-highlight');
    if (currentEl) {
      currentEl.classList.remove('current-highlight');
    }
  }

  // Event listeners para os botões de navegação
  prevButton.addEventListener('click', () => {
    if (totalMatches === 0) return;

    let newIndex = currentMatchIndex - 1;
    if (newIndex < 0) {
      newIndex = totalMatches - 1; // Loop para a última ocorrência
    }
    setCurrentMatch(newIndex);
  });

  nextButton.addEventListener('click', () => {
    if (totalMatches === 0) return;

    let newIndex = currentMatchIndex + 1;
    if (newIndex >= totalMatches) {
      newIndex = 0; // Loop para a primeira ocorrência
    }
    setCurrentMatch(newIndex);
  });

  // Função para destacar palavras-chave e gerar resultados
  function handleSearchInLawContent(query) {
    if (!currentLawId || !originalLawContent) {
      return;
    }

    // Se a consulta estiver vazia, restaurar conteúdo original e limpar resultados
    if (!query) {
      lawContent.innerHTML = originalLawContent;
      searchResultsContainer.innerHTML = '';
      resetNavigation();
      initGroupingHeaderEvents();
      return;
    }

    // Verifica se a busca é por frase exata (entre aspas)
    const exactPhraseMatch = query.match(/^"(.+)"$/);
    let regex;
    let normalizedQuery = '';

    if (exactPhraseMatch) {
      // Busca por frase exata
      const exactPhrase = exactPhraseMatch[1];
      normalizedQuery = normalizeText(exactPhrase);
      regex = new RegExp(exactPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); // Removido \b para busca exata
    } else {
      // Busca por palavras
      const words = query.split(/\s+/).filter(w => w.length > 0);
      if (words.length === 0) {
        lawContent.innerHTML = originalLawContent;
        searchResultsContainer.innerHTML = '';
        resetNavigation();
        initGroupingHeaderEvents();
        return;
      }
      const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
      normalizedQuery = normalizeText(query);
    }

    const paragraphs = lawContent.querySelectorAll('p');
    const matches = [];

    // Coleta de matches
    paragraphs.forEach((p, pIndex) => {
      const originalText = p.textContent;
      const normalizedText = normalizeText(originalText);
      let match;

      if (exactPhraseMatch) {
        // Busca por frase exata na versão normalizada
        const exactPhrase = normalizeText(exactPhraseMatch[1]);
        const index = normalizedText.indexOf(exactPhrase);
        if (index !== -1) {
          matches.push({
            paragraphIndex: pIndex,
            start: index,
            end: index + exactPhrase.length,
            word: originalText.substring(index, index + exactPhrase.length),
            snippet: originalText.substring(Math.max(0, index - 50), Math.min(originalText.length, index + exactPhrase.length + 50)) // Aumentado para 50 caracteres
          });
        }
      } else {
        // Busca por palavras individuais na versão normalizada
        while ((match = regex.exec(originalText)) !== null) {
          const normalizedMatch = normalizeText(match[0]);
          const start = normalizedText.indexOf(normalizedMatch, regex.lastIndex - match[0].length);
          const end = start + normalizedMatch.length;
          const snippetStart = Math.max(0, start - 50); // Aumentado para 50 caracteres
          const snippetEnd = Math.min(originalText.length, end + 50); // Aumentado para 50 caracteres
          let snippet = originalText.substring(snippetStart, snippetEnd).trim();

          // Realçar a palavra-chave no snippet
          const keyword = match[0];
          const boldKeyword = `<strong>${keyword}</strong>`;
          // Substituir a primeira ocorrência da palavra-chave no snippet por bold
          const regexKeyword = new RegExp(`(${escapeRegExp(keyword)})`, 'i');
          snippet = snippet.replace(regexKeyword, boldKeyword);

          matches.push({
            paragraphIndex: pIndex,
            start: start,
            end: end,
            word: keyword,
            snippet: snippet
          });
        }
      }
    });

    // Se não houver resultados
    if (matches.length === 0) {
      // Nenhum destaque
      lawContent.innerHTML = originalLawContent;
      // Remover a linha abaixo para suprimir a mensagem na sidebar
      // searchResultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
      resetNavigation();
      initGroupingHeaderEvents();
      // Atualizar contagem
      searchCountElement.textContent = 'Nenhum resultado encontrado.';
      return;
    }

    // Atribuir um índice global a cada match
    matches.forEach((m, i) => {
      m.globalIndex = i;
    });

    // Ordenar matches por parágrafo e posição inicial
    matches.sort((a, b) => {
      if (a.paragraphIndex === b.paragraphIndex) {
        return a.start - b.start;
      }
      return a.paragraphIndex - b.paragraphIndex;
    });

    // Reconstruir cada parágrafo com highlights
    const newParagraphs = [];
    paragraphs.forEach((p, pIndex) => {
      const originalText = p.textContent;
      const normalizedText = normalizeText(originalText);
      // Filtrar matches do parágrafo
      const pMatches = matches.filter(m => m.paragraphIndex === pIndex);
      if (pMatches.length === 0) {
        newParagraphs.push(p.innerHTML);
      } else {
        // Reconstruir o parágrafo destacando as palavras ou frase exata
        let lastIndex = 0;
        let highlightedText = '';
        pMatches.forEach((m) => {
          highlightedText += originalText.substring(lastIndex, m.start);
          highlightedText += `<mark class="highlight" data-match-index="${m.globalIndex}">${originalText.substring(m.start, m.end)}</mark>`;
          lastIndex = m.end;
        });
        highlightedText += originalText.substring(lastIndex);
        newParagraphs.push(highlightedText);
      }
    });

    // Atualizar o conteúdo
    let updatedContent = '';
    const allOriginalElements = lawContent.querySelectorAll('p, .grouping-header, .p-ementa, .preambulo-content, .preambulo-subtitle');
    let pCount = 0;
    allOriginalElements.forEach(el => {
      if (el.tagName.toLowerCase() === 'p') {
        updatedContent += `<p>${newParagraphs[pCount++]}</p>`;
      } else {
        updatedContent += el.outerHTML;
      }
    });

    lawContent.innerHTML = updatedContent;

    // Atualizar eventos de grouping headers
    initGroupingHeaderEvents();

    // Gerar lista de resultados na sidebar
    searchResultsContainer.innerHTML = '';
    matches.forEach((m) => {
      const btn = document.createElement('button');
      btn.innerHTML = `${m.snippet}...`; // Alterado para innerHTML
      btn.setAttribute('data-target', m.globalIndex);
      btn.addEventListener('click', () => {
        const highlightEl = lawContent.querySelector(`mark.highlight[data-match-index="${m.globalIndex}"]`);
        if (highlightEl) {
          highlightEl.scrollIntoView({behavior: 'smooth', block: 'center'});
          // Atualizar o índice atual e destacar a ocorrência
          setCurrentMatch(m.globalIndex);
        }
      });
      searchResultsContainer.appendChild(btn);
    });

    // Atualizar navegação e selecionar o primeiro resultado
    totalMatches = matches.length;
    if (totalMatches > 0) {
      setCurrentMatch(0);
    } else {
      resetNavigation();
    }

    // Atualizar contagem de resultados
    // Removido: searchCountElement.textContent = `Resultados encontrados: ${totalMatches}`;
  }

  // Função para alternar tema
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

  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Função para inicializar eventos dos headers de agrupamento
  function initGroupingHeaderEvents() {
    const groupingHeaders = document.querySelectorAll('.grouping-header');

    groupingHeaders.forEach(header => {
      const expandIcon = header.querySelector('.expand-icon');

      if (expandIcon) {
        header.addEventListener('click', (event) => {
          if (event.target.classList.contains('expand-icon')) {
            event.stopPropagation();
          }

          if (header.classList.contains('is-sticky')) {
            const headerId = header.id;
            const originalHeader = document.getElementById(headerId);
            if (originalHeader) {
              originalHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            const isExpanded = header.classList.contains('expanded');
            header.classList.toggle('expanded', !isExpanded);
            header.classList.toggle('collapsed', isExpanded);

            const nextElements = [];
            let nextSibling = header.nextElementSibling;

            while (nextSibling && !nextSibling.classList.contains('grouping-header')) {
              nextElements.push(nextSibling);
              nextSibling = nextSibling.nextElementSibling;
            }

            nextElements.forEach(element => {
              element.style.display = isExpanded ? 'none' : '';
            });
          }
        });
      }
    });
  }

  // Sentinela para Intersection Observer
  const sentinel = document.getElementById('sentinel');
  const observerOptions = {
    root: null,
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

  function isElementAtTop(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom > 0;
  }

  // Handles das Sidebars
  const leftHandle = document.querySelector('.left-handle');
  const rightHandle = document.querySelector('.right-handle');
  const leftSidebar = document.querySelector('.left-sidebar');
  const rightSidebar = document.querySelector('.right-sidebar');

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

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      leftSidebar.classList.remove('open');
      rightSidebar.classList.remove('open');
    }
  });
});

/* Função para escapar caracteres especiais em expressões regulares */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& significa toda a string que foi correspondida
}

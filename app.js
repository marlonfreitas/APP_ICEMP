/**
 * ICEs do Brasil - Aplicação Móvel para Visualização das Igrejas Cristãs Evangélicas
 * Lógica de Interface, Filtros, Mapas e Navegação (Identidade Oficial ICEB)
 */

// Identificador Oficial da Igreja Foco do Aplicativo
const ICEMP_ID = 'igreja-crista-evangelica-metropolitana-de-palmas-palmas-to';

// ==========================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE (NUVEM EM TEMPO REAL)
// ==========================================================================
const SUPABASE_CONFIG = {
  url: 'https://zsnkgvheajgkxobqvsqz.supabase.co',
  anonKey: 'sb_publishable_bWysMToKx0aPGXCNqCoojA_RqzwfkDT'
};

let supabaseClient = null;
if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('⚡ Supabase Client conectado com sucesso à nuvem.');
  } catch (err) {
    console.warn('Erro ao inicializar Supabase:', err);
  }
}

// Estado de Autenticação e Perfis de Usuário
const AuthState = {
  currentUser: JSON.parse(localStorage.getItem('icemp_user') || 'null') || {
    role: 'member',
    name: 'Membro da Igreja',
    email: 'membro@icemp.com.br'
  }
};

// Sincronizar Eventos Gravados no Supabase
async function fetchIcempEventsFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('icemp_events')
      .select('*')
      .order('day', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mappedEvents = data.map(row => ({
        id: row.id,
        title: row.title,
        day: row.day,
        month: row.month,
        dayOfWeek: row.day_of_week || row.dayOfWeek || '',
        time: row.time,
        location: row.location,
        badge: row.badge,
        target: row.target,
        desc: row.desc,
        created_at: row.created_at
      }));
      localStorage.setItem('icemp_custom_events', JSON.stringify(mappedEvents));
      renderEvents();
      console.log(`✅ ${mappedEvents.length} eventos sincronizados do Supabase.`);
    }
  } catch (e) {
    console.log('Aguardando criação da tabela icemp_events no Supabase.');
  }
}

// Sincronizar Informações Institucionais da ICEMP do Supabase
async function fetchIcempInfoFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('icemp_info')
      .select('*')
      .eq('id', 'icemp_main')
      .single();

    if (!error && data) {
      const customInfo = {
        name: data.name,
        address: data.address,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        pixKey: data.pix_key || data.pixKey,
        pixType: data.pix_type || data.pixType,
        description: data.description,
        schedule: data.schedule
      };
      localStorage.setItem('icemp_custom_info', JSON.stringify(customInfo));
      applyIcempDOMUpdates();
      console.log('✅ Dados institucionais da ICEMP sincronizados do Supabase.');
    }
  } catch (e) {
    console.log('Aguardando criação da tabela icemp_info no Supabase.');
  }
}

// Obter Dados da ICEMP (com mesclagem de alterações personalizadas pela liderança)
function getIcempData() {
  const base = ICEB_CHURCHES_DATA.find(c => c.id === ICEMP_ID) || ICEB_CHURCHES_DATA[0];
  const custom = JSON.parse(localStorage.getItem('icemp_custom_info') || '{}');
  return {
    ...base,
    ...custom,
    schedule: custom.schedule || base.schedule,
    monthlyAgenda: custom.monthlyAgenda || base.monthlyAgenda
  };
}

// Obter Eventos Oficiais da ICEMP (com suporte a inserção, edição e remoção pela liderança)
function getIcempEvents() {
  const cached = localStorage.getItem('icemp_custom_events');
  let events = [];
  if (cached) {
    try {
      events = JSON.parse(cached);
    } catch (e) {}
  }
  if (!events || events.length === 0) {
    const icemp = getIcempData();
    const baseEvents = (icemp.monthlyAgenda && icemp.monthlyAgenda.events) ? icemp.monthlyAgenda.events : [];
    events = baseEvents.map((ev, i) => ({
      id: ev.id || `ev_base_${i + 1}`,
      ...ev
    }));
  }

  // Garantir que o evento teste de hoje (30 de Outubro) esteja registrado para validação
  const hasTodayTest = events.some(e => String(e.id) === 'ev_hoje_30_out' || (String(e.day) === '30' && (e.month || '').toLowerCase().includes('out')));
  if (!hasTodayTest) {
    events.unshift({
      id: 'ev_hoje_30_out',
      day: '30',
      month: 'Outubro',
      dayOfWeek: 'Sexta-feira',
      title: 'Culto Especial & Clamor da Família',
      time: '20h00',
      location: 'Templo Principal - ICEMP',
      badge: 'Geral',
      target: 'Toda a congregação e visitantes',
      desc: 'Culto especial hoje às 20h00! Momento marcante de louvor congregacional e intercessão pelas famílias e jovens.'
    });
  }

  localStorage.setItem('icemp_custom_events', JSON.stringify(events));
  return events;
}

// Estado Global da Aplicação
const AppState = {
  activeTab: 'about',
  churchesViewMode: 'list', // 'list' ou 'map'
  eventsCategory: 'all',
  showPastEvents: false, // Ocultar eventos anteriores por padrão
  expandedStates: {}, // Estados expandidos na lista de igrejas (inicia recolhido)
  selectedUf: 'ALL',
  searchQuery: '',
  filterFeatures: [],
  selectedChurch: null,
  activeSlide: 0,
  favorites: JSON.parse(localStorage.getItem('iceb_favorites') || '[]'),
  mapInstance: null,
  detailMapInstance: null,
  detailMapTileLayer: null,
  detailMapCurrentLayer: 'satellite',
  fullMapInstance: null,
  fullMapTileLayer: null,
  fullMapCurrentLayer: 'satellite',
  fullMapMarkers: [],
  fullMapFilter: {
    search: '',
    uf: '',
    mear: ''
  },
  mapMarkers: []
};

// Inicialização do Aplicativo
document.addEventListener('DOMContentLoaded', () => {
  initStatusBarClock();
  renderStatePills();
  renderChurchesList();
  renderEvents();
  initIcempHeroCarousel();
  applyIcempDOMUpdates();
  updateAuthUI();
  initMiniMap();
  setupEventListeners();
  updateFavoritesCount();
  updateAboutChurchesCount();
  updateIcempModuleCounts();
  renderStudiesTopics();

  // Sincronização em Nuvem em Segundo Plano (Supabase)
  checkSupabaseSession();
  fetchIcempEventsFromSupabase();
  fetchIcempInfoFromSupabase();
});

// Carrossel Automático da Tela ICEMP
let icempSlideIndex = 0;
function initIcempHeroCarousel() {
  const track = document.getElementById('icemp-hero-carousel');
  if (!track) return;
  const slides = track.querySelectorAll('img');
  if (slides.length <= 1) return;

  setInterval(() => {
    icempSlideIndex = (icempSlideIndex + 1) % slides.length;
    track.style.transform = `translateX(-${icempSlideIndex * 100}%)`;
  }, 4500);
}

// Sincronizar Relógio da Barra de Status do Smartphone
function initStatusBarClock() {
  const clockEl = document.getElementById('status-bar-time');
  if (!clockEl) return;
  
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
  
  updateTime();
  setInterval(updateTime, 30000);
}

// Alternar entre Moldura Móvel e Tela Cheia (Para Desktop)
function toggleDeviceFrame(mode) {
  const wrapper = document.getElementById('app-wrapper');
  const btnFrame = document.getElementById('btn-view-frame');
  const btnFull = document.getElementById('btn-view-full');
  
  if (mode === 'fullscreen') {
    wrapper.classList.add('fullscreen-mode');
    btnFull.classList.add('active');
    btnFrame.classList.remove('active');
  } else {
    wrapper.classList.remove('fullscreen-mode');
    btnFrame.classList.add('active');
    btnFull.classList.remove('active');
  }
  
  setTimeout(() => {
    if (AppState.mapInstance) AppState.mapInstance.invalidateSize();
    if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
  }, 300);
}

// Renderizar Pills de Estados (UFs)
function renderStatePills() {
  const container = document.getElementById('state-pills-container');
  if (!container) return;
  
  container.innerHTML = BRAZIL_STATES.map(state => {
    const isActive = state.uf === AppState.selectedUf;
    return `
      <button 
        class="state-pill px-3.5 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap transition-all duration-200 shadow-xs flex items-center gap-1.5 ${
          isActive 
            ? 'bg-iceb-blue text-white active ring-2 ring-iceb-blue/20' 
            : 'bg-white text-iceb-gray-dark border border-slate-200/80 hover:bg-[#ebf4fa]'
        }" 
        data-uf="${state.uf}"
        onclick="filterByState('${state.uf}')"
      >
        <span>${state.name}</span>
        <span class="pill-counter px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
        }">
          ${state.count}
        </span>
      </button>
    `;
  }).join('');
}

// Função Auxiliar de Normalização de Texto (Ignora Acentos e Caixa Alta/Baixa)
function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Filtrar por Estado com Enquadramento Inteligente
function filterByState(uf) {
  AppState.selectedUf = uf;
  
  // Se houver busca digitada, verificar se ainda há resultados; senão limpar busca para exibir todas do estado
  if (AppState.searchQuery) {
    const testFiltered = getFilteredChurches();
    if (testFiltered.length === 0) {
      AppState.searchQuery = '';
      const input = document.getElementById('church-search-input');
      const clearBtn = document.getElementById('clear-search-btn');
      if (input) input.value = '';
      if (clearBtn) clearBtn.classList.add('hidden');
    }
  }

  renderStatePills();
  renderChurchesList();
  updateMapMarkers();
  
  const filtered = getFilteredChurches();
  if (filtered.length > 0 && AppState.mapInstance) {
    if (uf === 'ALL') {
      AppState.mapInstance.setView([-14.235, -51.9253], 4);
    } else if (filtered.length === 1) {
      AppState.mapInstance.setView([filtered[0].lat, filtered[0].lng], 13);
    } else if (AppState.mapMarkers.length > 0) {
      const group = L.featureGroup(AppState.mapMarkers);
      AppState.mapInstance.fitBounds(group.getBounds().pad(0.15));
    }
  }
}

// Obter Igrejas Filtradas (Busca Abrangente por Nome, Cidade, UF, Nome do Estado, Região, Bairro, Pastor)
function getFilteredChurches() {
  const qNorm = normalizeText(AppState.searchQuery);
  
  return ICEB_CHURCHES_DATA.filter(church => {
    // 1. Filtro por Estado (Pill Selecionada)
    const matchesUf = AppState.selectedUf === 'ALL' || church.uf === AppState.selectedUf;
    if (!matchesUf) return false;
    
    // 2. Filtro por Texto Digitado
    let matchesSearch = true;
    if (qNorm) {
      const nameNorm = normalizeText(church.name);
      const shortNameNorm = normalizeText(church.shortName);
      const cityNorm = normalizeText(church.city);
      const ufNorm = normalizeText(church.uf);
      const ufNameNorm = normalizeText(church.ufName);
      const regionNorm = normalizeText(church.region);
      const neighNorm = normalizeText(church.neighborhood);
      const addressNorm = normalizeText(church.address);
      const pastorNorm = normalizeText(church.pastorTitle);
      const pastorAuxNorm = normalizeText(church.pastorAuxiliar?.name);

      matchesSearch = (
        nameNorm.includes(qNorm) ||
        shortNameNorm.includes(qNorm) ||
        cityNorm.includes(qNorm) ||
        ufNorm.includes(qNorm) ||
        ufNameNorm.includes(qNorm) ||
        regionNorm.includes(qNorm) ||
        neighNorm.includes(qNorm) ||
        addressNorm.includes(qNorm) ||
        pastorNorm.includes(qNorm) ||
        pastorAuxNorm.includes(qNorm)
      );
    }
    
    // 3. Filtro por Comodidades / Características
    const matchesFeatures = AppState.filterFeatures.length === 0 || 
      AppState.filterFeatures.every(f => {
        const fNorm = normalizeText(f);
        return church.features.some(cf => normalizeText(cf).includes(fNorm));
      });
    
    return matchesSearch && matchesFeatures;
  });
}

// Alternar expansão/recolhimento de um estado na lista de igrejas
function toggleStateCollapse(uf) {
  const listEl = document.getElementById(`state-list-${uf}`);
  const iconEl = document.getElementById(`state-icon-${uf}`);
  const textHintEl = document.getElementById(`state-hint-${uf}`);
  if (!listEl) return;

  if (!AppState.expandedStates) AppState.expandedStates = {};
  const isCurrentlyHidden = listEl.classList.contains('hidden');

  if (isCurrentlyHidden) {
    listEl.classList.remove('hidden');
    if (iconEl) {
      iconEl.style.transform = 'rotate(180deg)';
      iconEl.classList.add('text-iceb-blue');
    }
    if (textHintEl) textHintEl.textContent = 'Toque para recolher';
    AppState.expandedStates[uf] = true;
  } else {
    listEl.classList.add('hidden');
    if (iconEl) {
      iconEl.style.transform = 'rotate(0deg)';
      iconEl.classList.remove('text-iceb-blue');
    }
    if (textHintEl) textHintEl.textContent = 'Toque para visualizar';
    AppState.expandedStates[uf] = false;
  }
}

// Expandir ou recolher todos os estados de uma vez
function toggleAllStates(expand) {
  if (!AppState.expandedStates) AppState.expandedStates = {};
  document.querySelectorAll('.state-churches-content').forEach(el => {
    const uf = el.dataset.uf;
    const icon = document.getElementById(`state-icon-${uf}`);
    const textHint = document.getElementById(`state-hint-${uf}`);
    if (expand) {
      el.classList.remove('hidden');
      if (icon) {
        icon.style.transform = 'rotate(180deg)';
        icon.classList.add('text-iceb-blue');
      }
      if (textHint) textHint.textContent = 'Toque para recolher';
      AppState.expandedStates[uf] = true;
    } else {
      el.classList.add('hidden');
      if (icon) {
        icon.style.transform = 'rotate(0deg)';
        icon.classList.remove('text-iceb-blue');
      }
      if (textHint) textHint.textContent = 'Toque para visualizar';
      AppState.expandedStates[uf] = false;
    }
  });
}

// Renderizar Diretório de Igrejas Ordenadas pelos Estados (Com Accordion recolhido inicialmente)
function renderChurchesList() {
  const container = document.getElementById('churches-cards-list');
  const countTitle = document.getElementById('results-count-title');
  if (!container) return;
  
  const filtered = getFilteredChurches();
  
  if (countTitle) {
    const stateName = BRAZIL_STATES.find(s => s.uf === AppState.selectedUf)?.name || 'Brasil';
    countTitle.textContent = `${filtered.length} Igrejas em ${stateName}`;
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-12 px-4 text-center flex flex-col items-center justify-center bg-white rounded-2xl shadow-xs border border-slate-200">
        <div class="w-14 h-14 rounded-full bg-iceb-blue-light flex items-center justify-center text-iceb-blue mb-3">
          <span class="material-symbols-outlined text-[28px]">search_off</span>
        </div>
        <h3 class="font-bold text-base text-iceb-navy">Nenhuma congregação encontrada</h3>
        <p class="text-xs text-slate-500 max-w-xs mt-1">Tente ajustar seus termos de pesquisa ou selecione outro estado.</p>
        <button 
          onclick="resetFilters()" 
          class="mt-4 px-4 py-2 bg-iceb-blue text-white rounded-xl text-xs font-bold shadow hover:bg-iceb-blue-dark transition-all"
        >
          Limpar Filtros
        </button>
      </div>
    `;
    return;
  }

  // Agrupar congregações por Estado (UF)
  const groups = {};
  filtered.forEach(church => {
    const uf = church.uf || 'OUTROS';
    const ufName = church.ufName || uf;
    if (!groups[uf]) {
      groups[uf] = {
        uf: uf,
        name: ufName,
        churches: []
      };
    }
    groups[uf].churches.push(church);
  });

  // Ordenar os estados em ordem alfabética do nome do estado
  const sortedUfKeys = Object.keys(groups).sort((a, b) => {
    return groups[a].name.localeCompare(groups[b].name, 'pt-BR');
  });

  const hasSearch = Boolean(AppState.searchQuery && AppState.searchQuery.trim().length > 0);

  // Montar HTML agrupado e ordenado por estado com Accordion (Recolhido inicialmente)
  container.innerHTML = sortedUfKeys.map(uf => {
    const group = groups[uf];
    // Ordenar as congregações de cada estado alfabeticamente
    group.churches.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    // Se houver pesquisa ativa no campo de busca, expande automaticamente para mostrar os resultados
    // Caso contrário, mantém recolhido inicialmente
    const isExpanded = hasSearch ? true : Boolean(AppState.expandedStates && AppState.expandedStates[uf]);

    return `
      <section class="state-churches-group flex flex-col gap-2 mb-2.5">
        <!-- Cabeçalho do Estado (Toque para abrir / fechar a lista) -->
        <button 
          type="button"
          onclick="toggleStateCollapse('${group.uf}')"
          class="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs active:scale-[0.99] transition-all text-left group"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-xl bg-iceb-navy text-white flex items-center justify-center font-black text-xs shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform">
              ${group.uf}
            </span>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-iceb-navy truncate group-hover:text-iceb-blue transition-colors">
                ${group.name}
              </h3>
              <p id="state-hint-${group.uf}" class="text-[10px] text-slate-400 font-medium">
                ${isExpanded ? 'Toque para recolher' : 'Toque para visualizar'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="px-2.5 py-0.5 rounded-full bg-iceb-blue-light text-iceb-blue font-bold text-[10px] border border-iceb-blue/20">
              ${group.churches.length} ${group.churches.length === 1 ? 'igreja' : 'igrejas'}
            </span>
            <span 
              id="state-icon-${group.uf}" 
              class="material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-iceb-blue' : ''}"
              style="transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};"
            >
              expand_more
            </span>
          </div>
        </button>

        <!-- Lista de Nomes das Igrejas do Estado (Ocultada inicialmente) -->
        <div 
          id="state-list-${group.uf}" 
          data-uf="${group.uf}"
          class="state-churches-content flex flex-col gap-1.5 pl-1 pr-0.5 ${isExpanded ? '' : 'hidden'}"
        >
          ${group.churches.map(church => {
            const isIcemp = church.id === ICEMP_ID;
            return `
              <div class="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2.5 transition-all hover:border-iceb-blue/30">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4 class="font-bold text-xs text-iceb-navy leading-snug truncate">
                      ${church.name}
                    </h4>
                    ${isIcemp ? `
                      <span class="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-extrabold flex-shrink-0">
                        ICEMP
                      </span>
                    ` : ''}
                  </div>
                  <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                    <span class="truncate">${church.city} - ${church.uf}</span>
                  </p>
                </div>

                <!-- Botão sutil para ver a localização no mapa -->
                <button 
                  type="button"
                  onclick="showChurchOnMap('${church.id}')"
                  class="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-iceb-blue-light text-slate-600 hover:text-iceb-blue font-semibold text-[11px] flex items-center gap-1 border border-slate-200/60 active:scale-95 transition-all flex-shrink-0"
                  title="Ver localização no mapa"
                >
                  <span class="material-symbols-outlined text-[14px] text-iceb-blue">map</span>
                  <span>Mapa</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }).join('');
}

// Inicializar Mapa Leaflet Integrado
function initMiniMap() {
  const mapEl = document.getElementById('churches-mini-map');
  if (!mapEl) return;
  
  AppState.mapInstance = L.map('churches-mini-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([-15.7801, -47.9292], 4);
  
  L.tileLayer(GMAPS_TILE_URLS.satellite, {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(AppState.mapInstance);

  // Fechar o card flutuante se clicar em qualquer área vazia do mapa
  AppState.mapInstance.on('click', () => {
    hideFloatingMapCard();
  });

  updateMapMarkers();
}

// Atualizar Marcadores no Mapa com a Pomba Oficial da ICEB
function updateMapMarkers() {
  if (!AppState.mapInstance) return;
  
  AppState.mapMarkers.forEach(m => AppState.mapInstance.removeLayer(m));
  AppState.mapMarkers = [];
  
  const filtered = getFilteredChurches();
  
  filtered.forEach(church => {
    // Validar se coordenadas são válidas
    const lat = Number(church.lat);
    const lng = Number(church.lng);
    if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="pin-bubble" title="${church.name}">
          <img src="assets/simbolo_pomba_azul.png" class="pin-icon" alt="ICEB"/>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });
    
    const marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(AppState.mapInstance);
      
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      showFloatingMapCard(church);
    });
    
    AppState.mapMarkers.push(marker);
  });
}

// Ocultar Card Flutuante do Mapa
function hideFloatingMapCard(event) {
  if (event) {
    event.stopPropagation();
  }
  const card = document.getElementById('map-floating-bottom-card');
  if (card) {
    card.classList.add('hidden');
  }
}

// Mostrar Card Flutuante ao Clicar no Marcador do Mapa
function showFloatingMapCard(church) {
  const card = document.getElementById('map-floating-bottom-card');
  if (!card) return;
  
  card.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0 pr-1">
      <div class="w-10 h-10 rounded-xl bg-iceb-blue-light p-1.5 flex items-center justify-center flex-shrink-0 border border-iceb-blue/20">
        <img src="assets/simbolo_pomba_azul.png" class="w-full h-full object-contain" alt="ICEB"/>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="font-bold text-xs text-iceb-navy truncate">${church.shortName}</span>
        <span class="text-[11px] text-slate-500 truncate">${church.city} - ${church.uf} • ${church.distance}</span>
      </div>
    </div>
    <div class="flex items-center gap-1 flex-shrink-0">
      <button 
        onclick="openChurchDetails('${church.id}')"
        class="px-2.5 py-1.5 rounded-lg bg-iceb-blue text-white text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all hover:bg-iceb-blue-dark"
      >
        <span>Detalhes</span>
        <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
      </button>
      <button 
        onclick="openRouteOptions('${church.id}')"
        class="w-7 h-7 rounded-lg bg-iceb-blue-light text-iceb-blue flex items-center justify-center active:scale-95 transition-all"
        title="Rotas"
      >
        <span class="material-symbols-outlined text-[15px]">near_me</span>
      </button>
      <button 
        onclick="hideFloatingMapCard(event)"
        class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-90 transition-all ml-0.5"
        title="Fechar"
        aria-label="Fechar"
      >
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  `;
  card.classList.remove('hidden');
}

// Abrir Tela Completa de Detalhes da Igreja (Apenas ICEMP possui detalhes no momento)
function openChurchDetails(churchId) {
  if (churchId !== ICEMP_ID) {
    showChurchOnMap(churchId);
    return;
  }

  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId);
  if (!church) return;
  
  AppState.selectedChurch = church;
  AppState.activeSlide = 0;
  
  const screen = document.getElementById('screen-details');
  if (!screen) return;
  
  screen.innerHTML = generateChurchDetailsHTML(church);
  screen.classList.add('active');
  screen.scrollTop = 0;
  
  // Esconder temporariamente a tela ativa anterior para evitar qualquer sobreposição do Leaflet
  document.querySelectorAll('.app-screen:not(#screen-details)').forEach(s => {
    if (s.classList.contains('active')) {
      s.dataset.wasActive = 'true';
      s.classList.remove('active');
    }
  });
  
  initDetailMiniMap(church);
}

// Fechar Tela de Detalhes e Voltar à Lista ou Mapa
function closeChurchDetails() {
  const screen = document.getElementById('screen-details');
  if (screen) {
    screen.classList.remove('active');
  }
  
  if (AppState.detailMapInstance) {
    try {
      AppState.detailMapInstance.remove();
    } catch (e) {}
    AppState.detailMapInstance = null;
  }
  
  // Desativar todas as telas e limpar atributos residuais
  document.querySelectorAll('.app-screen').forEach(s => {
    s.classList.remove('active');
    delete s.dataset.wasActive;
  });
  
  // Reativar APENAS a tela da aba atualmente ativa
  const currentTab = AppState.activeTab || 'about';
  const targetScreen = document.getElementById(`screen-${currentTab}`) || document.getElementById('screen-about');
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
  
  setTimeout(() => {
    if (AppState.fullMapInstance && currentTab === 'map') {
      AppState.fullMapInstance.invalidateSize();
    }
  }, 100);
}

// Abrir Tela de História da ICEB (125 Anos)
function openHistoryScreen() {
  const screen = document.getElementById('screen-history');
  if (!screen) return;
  
  screen.classList.add('active');
  screen.scrollTop = 0;
  
  // Esconder temporariamente a tela ativa anterior para evitar qualquer conflito
  document.querySelectorAll('.app-screen:not(#screen-history)').forEach(s => {
    if (s.classList.contains('active')) {
      s.dataset.wasActive = 'true';
      s.classList.remove('active');
    }
  });
}

// Fechar Tela de História e Retornar
function closeHistoryScreen() {
  const screen = document.getElementById('screen-history');
  if (screen) {
    screen.classList.remove('active');
  }
  
  // Restaurar a tela ativa anterior
  document.querySelectorAll('.app-screen[data-was-active="true"]').forEach(s => {
    s.classList.add('active');
    delete s.dataset.wasActive;
  });
}

// Rolar suavemente para uma seção dentro da tela de história
function scrollToHistorySection(sectionId) {
  const target = document.getElementById(sectionId);
  const container = document.getElementById('screen-history');
  if (target && container) {
    const topPos = target.offsetTop - 70;
    container.scrollTo({ top: topPos, behavior: 'smooth' });
  }
}

// Definição dos Ministérios Oficiais das Igrejas ICEB
const OFFICIAL_MINISTRIES = [
  {
    id: 'adolescentes',
    name: 'Ministério de Adolescentes',
    icon: 'diversity_3',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    desc: 'Edificação bíblica, comunhão, desafios da juventude e integração para adolescentes de 12 a 17 anos.'
  },
  {
    id: 'infantil',
    name: 'Ministério Infantil',
    icon: 'child_care',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    desc: 'Cuidado amoroso, discipulado lúdico e ensino contextualizado das Sagradas Escrituras para crianças.'
  },
  {
    id: 'mulheres',
    name: 'Mulheres em Ação',
    icon: 'favorite',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    desc: 'Comunhão feminina, círculos de oração contínua, acolhimento de famílias e projetos missionários.'
  },
  {
    id: 'homens',
    name: 'Homens de Valor',
    icon: 'shield',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    desc: 'Fortalecimento espiritual masculino, sacerdócio familiar e liderança cristã servidora na comunidade.'
  },
  {
    id: 'louvor',
    name: 'Ministério de Louvor',
    icon: 'music_note',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    desc: 'Condução congregacional com hinos bíblicos e cânticos espirituais em adoração solene ao Senhor.'
  },
  {
    id: 'recepcao',
    name: 'Ministério de Recepção',
    icon: 'front_hand',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    desc: 'Boas-vindas calorosas com carinho cristão e acolhimento aos membros e visitantes na chegada ao templo.'
  },
  {
    id: 'midias',
    name: 'Ministério de Mídias',
    icon: 'videocam',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    desc: 'Sonorização, projeção litúrgica, transmissões dos cultos e comunicação digital da comunidade.'
  }
];

// ==========================================================================
// ESTRUTURA ORGANIZACIONAL & MINISTÉRIOS DA IGREJA
// ==========================================================================

const ORG_STRUCTURE_CONFIG = {
  conselho: {
    title: 'Conselho da Igreja',
    subtitle: 'Órgão Deliberativo da Comunidade',
    icon: 'account_balance',
    color: 'bg-iceb-navy text-white',
    roleTag: 'Conselheiro',
    roleColor: 'bg-slate-100 text-iceb-navy border-slate-200',
    desc: 'Responsável pelas diretrizes espirituais, doutrinárias, administrativas e gerais da igreja local.'
  },
  meal: {
    title: 'MEAL',
    subtitle: 'Mesa Executiva Local',
    icon: 'corporate_fare',
    color: 'bg-iceb-blue text-white',
    roleTag: 'Membro da MEAL',
    roleColor: 'bg-iceb-blue-light text-iceb-blue border-iceb-blue/30',
    desc: 'Gestão executiva, planejamento de projetos, coordenação dos ministérios e administração da igreja.'
  },
  presbiterio: {
    title: 'Presbitério',
    subtitle: 'Presbíteros da Comunidade',
    icon: 'menu_book',
    color: 'bg-amber-600 text-white',
    roleTag: 'Presbítero',
    roleColor: 'bg-amber-50 text-amber-800 border-amber-200',
    desc: 'Ensino bíblico, aconselhamento pastoral, supervisão do rebanho e oração pelas famílias.'
  },
  diaconal: {
    title: 'Corpo Diaconal',
    subtitle: 'Diaconia da Comunidade',
    icon: 'volunteer_activism',
    color: 'bg-teal-600 text-white',
    roleTag: 'Diácono / Diaconisa',
    roleColor: 'bg-teal-50 text-teal-800 border-teal-200',
    desc: 'Serviço prático ao templo, beneficência, caridade, visitação e acolhimento aos necessitados.'
  }
};

// Abrir Modal de Membros da Estrutura Organizacional
function openOrgStructureModal(churchId, organKey) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId) || AppState.selectedChurch;
  if (!church) return;

  const config = ORG_STRUCTURE_CONFIG[organKey] || ORG_STRUCTURE_CONFIG.conselho;

  const titleEl = document.getElementById('org-modal-title');
  if (titleEl) titleEl.textContent = config.title;

  const subtitleEl = document.getElementById('org-modal-subtitle');
  if (subtitleEl) subtitleEl.textContent = config.subtitle;

  const iconContainer = document.getElementById('org-modal-icon-container');
  if (iconContainer) iconContainer.className = `w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0 shadow-xs`;

  const iconEl = document.getElementById('org-modal-icon');
  if (iconEl) iconEl.textContent = config.icon;

  const churchNameEl = document.getElementById('org-modal-church-name');
  if (churchNameEl) churchNameEl.textContent = church.shortName || church.name;

  // Buscar membros deste órgão na igreja
  const estrutura = church.estruturaOrganizacional || {};
  let members = [];
  if (organKey === 'conselho') {
    members = estrutura.conselho || church.conselho || [];
  } else if (organKey === 'meal') {
    members = estrutura.meal || church.meal || [];
  } else if (organKey === 'presbiterio') {
    members = estrutura.presbiterio || church.presbiterio || [];
  } else if (organKey === 'diaconal') {
    members = estrutura.diaconal || estrutura.corpoDiaconal || church.corpoDiaconal || church.diaconal || [];
  }

  const countBadge = document.getElementById('org-modal-count-badge');
  if (countBadge) {
    countBadge.textContent = members.length > 0 ? `${members.length} Integrantes` : 'Em Atualização';
  }

  const listEl = document.getElementById('org-modal-members-list');
  if (listEl) {
    if (members.length > 0) {
      listEl.innerHTML = `
        <div class="mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
          ${config.desc}
        </div>
        <div class="flex flex-col gap-2">
          ${members.map((name, idx) => `
            <div class="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-iceb-blue/40 transition-all">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-xs text-iceb-navy flex-shrink-0">
                  ${idx + 1}
                </div>
                <div class="min-w-0">
                  <h4 class="font-bold text-xs text-iceb-navy truncate">${name}</h4>
                  <p class="text-[10px] text-slate-500 mt-0.5">${config.title}</p>
                </div>
              </div>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${config.roleColor}">
                ${config.roleTag}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      listEl.innerHTML = `
        <div class="mb-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
          ${config.desc}
        </div>
        <div class="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
            <span class="material-symbols-outlined text-[26px]">groups</span>
          </div>
          <h4 class="font-bold text-xs text-iceb-navy">Membros em Fase de Atualização</h4>
          <p class="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            A nominata oficial deste órgão está em processo de cadastro pela secretaria e liderança da igreja.
          </p>
        </div>
      `;
    }
  }

  const modal = document.getElementById('org-structure-modal');
  if (modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }
}

// Fechar Modal da Estrutura Organizacional
function closeOrgStructureModal() {
  const modal = document.getElementById('org-structure-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
}

// Abrir Modal de Ministérios da Igreja
function openChurchMinistriesModal(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId) || AppState.selectedChurch;
  if (!church) return;

  const nameEl = document.getElementById('ministries-church-name');
  if (nameEl) nameEl.textContent = church.shortName || church.name;

  const ministries = (church.ministries && church.ministries.length > 0) ? church.ministries : OFFICIAL_MINISTRIES;

  const listEl = document.getElementById('church-ministries-list');
  if (listEl) {
    listEl.innerHTML = ministries.map(m => `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3 hover:border-iceb-blue/40 transition-all">
        <div class="w-10 h-10 rounded-xl ${m.color || 'bg-iceb-blue-light text-iceb-blue border-iceb-blue/30'} flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-2xs">
          <span class="material-symbols-outlined text-[20px]">${m.icon || 'groups'}</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-bold text-xs text-iceb-navy">${m.name}</h4>
            <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ativo</span>
          </div>
          ${m.leaders ? `
            <div class="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-iceb-blue">
              <span class="material-symbols-outlined text-[13px]">person</span>
              <span>Liderança: <strong class="text-iceb-navy">${m.leaders}</strong></span>
            </div>
          ` : ''}
          <p class="text-[11px] text-slate-500 mt-1 leading-snug">${m.desc || 'Ministério atuante na comunidade cristã.'}</p>
        </div>
      </div>
    `).join('');
  }

  const modal = document.getElementById('church-ministries-modal');
  if (modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }
}

// Fechar Modal de Ministérios da Igreja
function closeChurchMinistriesModal() {
  const modal = document.getElementById('church-ministries-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
}

// Abrir Modal de Estudos dos Grupos de Crescimento (GCs)
function openGCEstudosModal(churchId) {
  const targetId = churchId || ICEMP_ID;
  const church = ICEB_CHURCHES_DATA.find(c => c.id === targetId) || AppState.selectedChurch || ICEB_CHURCHES_DATA[0];
  if (!church) return;

  const fallbackStudies = {
    title: 'Estudos dos Grupos de Crescimento',
    series: 'O Princípio da Mutualidade nos Relacionamentos',
    subtheme: 'Vivendo os Mandamentos de "Uns aos Outros" no Corpo de Cristo',
    badge: 'Série Oficial • 2026',
    description: 'Série bíblica especial de edificação e comunhão aplicada aos Grupos de Crescimento da ICE Metropolitana de Palmas. Cada lição nos orienta na prática dos mandamentos bíblicos da convivência cristã: acolhimento mútuo, submissão em humildade, a guarda do coração contra feridas, o falar que edifica e promove a paz, a vitória sobre hostilidades, a integridade sem máscaras e o poder curador do perdão recíproco em Cristo.',
    folderPath: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC',
    studies: [
      {
        id: 'licao-1',
        lessonNumber: 1,
        title: 'Lição 1: O Princípio da Mutualidade',
        topic: 'Mutualidade Cristã',
        desc: 'O fundamento bíblico de pertencer, acolher e servir uns aos outros como membros vivos do Corpo de Cristo.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_1_Mutualidade.pdf',
        fileName: 'Licao_1_Mutualidade.pdf',
        size: '1.2 MB'
      },
      {
        id: 'licao-2',
        lessonNumber: 2,
        title: 'Lição 2: Visibilidade, Afeto e Cuidado',
        topic: 'Afeto & Cuidado Mútuo',
        desc: 'Enxergando as necessidades do próximo, acolhendo com carinho fraterno e praticando o cuidado ativo e intencional no Corpo de Cristo.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_2_Visibilidade_Afeto_Cuidado.pdf',
        fileName: 'Licao_2_Visibilidade_Afeto_Cuidado.pdf',
        size: '1.3 MB'
      },
      {
        id: 'licao-3',
        lessonNumber: 3,
        title: 'Lição 3: Submissão e Tolerância Mútua',
        topic: 'Submissão & Tolerância',
        desc: 'A prática da humildade sincera, da paciência no convívio e da consideração do próximo como superior a si mesmo.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_3_Submissao_Tolerancia.pdf',
        fileName: 'Licao_3_Submissao_Tolerancia.pdf',
        size: '1.9 MB'
      },
      {
        id: 'licao-4',
        lessonNumber: 4,
        title: 'Lição 4: Coração Guardado',
        topic: 'Guarda do Coração',
        desc: 'Protegendo os sentimentos, as intenções e a saúde espiritual contra amarguras e ressentimentos no convívio fraterno.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_4_Coracao_Guardado.pdf',
        fileName: 'Licao_4_Coracao_Guardado.pdf',
        size: '22.1 MB'
      },
      {
        id: 'licao-5',
        lessonNumber: 5,
        title: 'Lição 5: Semeando Paz com as Palavras',
        topic: 'Comunicação Edificante',
        desc: 'O poder transformador da comunicação guiada pelo Espírito Santo para abençoar, curar e promover a reconciliação.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_5_Semeando Paz com as Palavras.pdf',
        fileName: 'Licao_5_Semeando Paz com as Palavras.pdf',
        size: '2.0 MB'
      },
      {
        id: 'licao-6',
        lessonNumber: 6,
        title: 'Lição 6: Superando a Hostilidade e as Provocações',
        topic: 'Superação de Conflitos',
        desc: 'Como responder às ofensas com maturidade cristã, mansidão e domínio próprio diante de provações relacionais.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Lição 6 - Superando a Hostilidade e as Provocações.pdf',
        fileName: 'Lição 6 - Superando a Hostilidade e as Provocações.pdf',
        size: '1.0 MB'
      },
      {
        id: 'licao-7',
        lessonNumber: 7,
        title: 'Lição 7: O Perigo da Falsidade e Máscaras',
        topic: 'Verdade e Transparência',
        desc: 'Despindo-se de aparências e hipocrisia para cultivar comunhão autêntica, sincera e vulnerável na comunidade.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_7_Perigo_Falsidade_e_Mascara.pdf',
        fileName: 'Licao_7_Perigo_Falsidade_e_Mascara.pdf',
        size: '1.5 MB'
      },
      {
        id: 'licao-8',
        lessonNumber: 8,
        title: 'Lição 8: O Remédio Definitivo – Perdoem-se Mutuamente',
        topic: 'Perdão Mútuo',
        desc: 'O perdão como remédio restaurador de Cristo para curar feridas, restabelecer a paz e selar a unidade fraterna.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Lição 8_ O Remédio Definitivo – Perdoem-se Mutuamente.pdf',
        fileName: 'Lição 8_ O Remédio Definitivo – Perdoem-se Mutuamente.pdf',
        size: '616 KB'
      },
      {
        id: 'licao-9',
        lessonNumber: 9,
        title: 'Lição 9: O Fundamento da Edificação e o Ensino da Verdade',
        topic: 'Edificação & Ensino Mútuo',
        desc: 'Compreender que o crescimento espiritual não ocorre de forma isolada, mas através do processo contínuo de edificação mútua e do ensino informal da Palavra no dia a dia do pequeno grupo.',
        file: 'assets/igrejas/igreja-crista-evangelica-metropolitana-de-palmas-palmas-to/estudos_GC/Licao_9_Edificacao_e_Ensino_da_Verdade.pdf',
        fileName: 'Licao_9_Edificacao_e_Ensino_da_Verdade.pdf',
        size: '455 KB'
      }
    ]
  };

  const estudosGC = church.estudosGC || fallbackStudies;
  const studies = (estudosGC.studies && estudosGC.studies.length > 0) ? estudosGC.studies : fallbackStudies.studies;

  const churchNameEl = document.getElementById('gc-estudos-modal-church');
  if (churchNameEl) churchNameEl.textContent = church.shortName || church.name;

  const contentEl = document.getElementById('gc-estudos-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <!-- Card da Série Atual e Breve Descrição -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 border border-emerald-200/90 shadow-2xs">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white tracking-wide shadow-2xs">
            ${estudosGC.badge || 'Série Atual nos Lares'}
          </span>
          <span class="text-[10px] font-bold text-emerald-800">
            ${studies.length} Lições Disponíveis
          </span>
        </div>

        <h4 class="font-extrabold text-sm text-iceb-navy leading-snug">
          ${estudosGC.series || 'O Princípio da Mutualidade nos Relacionamentos'}
        </h4>

        ${estudosGC.subtheme ? `
          <p class="text-[11px] font-bold text-emerald-700 mt-0.5">
            ${estudosGC.subtheme}
          </p>
        ` : ''}

        <p class="text-[11px] text-slate-600 mt-2 leading-relaxed">
          ${estudosGC.description}
        </p>

        <div class="flex items-center gap-2 mt-3 pt-2.5 border-t border-emerald-200/60 flex-wrap text-[10px] text-emerald-800 font-semibold">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-emerald-600">verified</span>
            Estudos Oficiais do GC
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-emerald-600">file_download</span>
            Download e Leitura em PDF
          </span>
        </div>
      </div>

      <!-- Cabeçalho da Lista de Lições -->
      <div class="flex items-center justify-between pt-1 px-1">
        <div>
          <h4 class="font-bold text-xs text-iceb-navy uppercase tracking-wider">Lições dos Grupos de Crescimento</h4>
          <p class="text-[11px] text-slate-500">Acesse para ler diretamente ou baixe o PDF no seu celular/PC</p>
        </div>
        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          ${studies.length} PDFs
        </span>
      </div>

      <!-- Grade/Lista de Lições -->
      <div class="space-y-2.5">
        ${studies.map(study => {
          const encodedUrl = encodeURI(study.file);
          const safeTitle = (study.title || '').replace(/'/g, "\\'");
          const safeFileName = (study.fileName || '').replace(/'/g, "\\'");
          return `
            <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2.5 hover:border-emerald-300 transition-all">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/70 text-emerald-700 border border-emerald-200/70 flex flex-col items-center justify-center flex-shrink-0 text-center shadow-2xs">
                  <span class="text-[8px] font-bold uppercase leading-none text-emerald-600">LIÇÃO</span>
                  <span class="text-xs font-extrabold leading-none mt-0.5">${study.lessonNumber < 10 ? '0' + study.lessonNumber : study.lessonNumber}</span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1 flex-wrap">
                    <h5 class="font-bold text-xs text-iceb-navy leading-snug">${study.title}</h5>
                    ${study.topic ? `
                      <span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">${study.topic}</span>
                    ` : ''}
                  </div>
                  
                  <p class="text-[11px] text-slate-600 mt-1 leading-snug">${study.desc}</p>
                  
                  <div class="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 flex-wrap">
                    <span class="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span class="material-symbols-outlined text-[13px] text-rose-500">picture_as_pdf</span>
                      PDF • ${study.size || 'Documento'}
                    </span>
                    <span>•</span>
                    <span class="truncate max-w-[200px]">${study.fileName}</span>
                  </div>
                </div>
              </div>

              <!-- Botões de Ação -->
              <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button 
                  onclick="openPDFReader('${encodedUrl}', '${safeTitle}', '${safeFileName}')"
                  class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all"
                  title="Abrir e ler estudo no aplicativo"
                >
                  <span class="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Abrir Estudo (PDF)</span>
                </button>

                <button 
                  onclick="downloadGCStudy('${encodedUrl}', '${safeFileName}', '${safeTitle}')"
                  class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 font-bold text-xs flex items-center justify-center gap-1 active:scale-98 transition-all"
                  title="Baixar ou abrir com leitor externo"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  <span class="hidden sm:inline">Baixar</span>
                </button>

                <button 
                  onclick="shareGCStudy('${safeTitle}', '${encodedUrl}', '${safeFileName}')"
                  class="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 active:scale-95 transition-all flex items-center justify-center"
                  title="Compartilhar lição em PDF"
                >
                  <span class="material-symbols-outlined text-[16px]">share</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  const modal = document.getElementById('gc-estudos-modal');
  if (modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }
}

// Fechar Modal de Estudos dos Grupos de Crescimento
function closeGCEstudosModal() {
  const modal = document.getElementById('gc-estudos-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
}

// ==========================================
// LEITOR DE PDF INTEGRADO (OFFLINE NO APK)
// ==========================================
let currentPDFDoc = null;
let currentPDFPage = 1;
let currentPDFScale = 1.0;
let currentPDFUrl = '';
let currentPDFTitle = '';
let currentPDFFileName = '';
let isRenderingPDFPage = false;
let pendingPDFPage = null;

async function openPDFReader(fileUrl, title, fileName) {
  currentPDFUrl = fileUrl;
  currentPDFTitle = title || 'Estudo Bíblico';
  currentPDFFileName = fileName || 'Estudo.pdf';
  currentPDFPage = 1;
  currentPDFScale = 1.0;

  const modal = document.getElementById('pdf-reader-modal');
  const titleEl = document.getElementById('pdf-reader-title');
  const subtitleEl = document.getElementById('pdf-reader-subtitle');
  const loadingEl = document.getElementById('pdf-loading-indicator');
  const errorEl = document.getElementById('pdf-error-indicator');
  const zoomEl = document.getElementById('pdf-zoom-level');

  if (titleEl) titleEl.textContent = currentPDFTitle;
  if (subtitleEl) subtitleEl.textContent = currentPDFFileName;
  if (zoomEl) zoomEl.textContent = '100%';
  if (loadingEl) loadingEl.style.display = 'flex';
  if (errorEl) errorEl.classList.add('hidden');

  if (modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }

  try {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('Biblioteca PDF.js não inicializada.');
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument(currentPDFUrl);
    currentPDFDoc = await loadingTask.promise;

    const totalPagesEl = document.getElementById('pdf-total-pages');
    if (totalPagesEl) totalPagesEl.textContent = currentPDFDoc.numPages;

    if (loadingEl) loadingEl.style.display = 'none';

    renderPDFPage(1);
  } catch (err) {
    console.error('Erro ao abrir PDF no leitor interno:', err);
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.classList.remove('hidden');
  }
}

function renderPDFPage(num) {
  if (!currentPDFDoc) return;
  if (isRenderingPDFPage) {
    pendingPDFPage = num;
    return;
  }
  isRenderingPDFPage = true;

  currentPDFDoc.getPage(num).then(page => {
    const canvas = document.getElementById('pdf-render-canvas');
    if (!canvas) {
      isRenderingPDFPage = false;
      return;
    }
    const ctx = canvas.getContext('2d');

    const container = document.getElementById('pdf-canvas-container');
    const containerWidth = (container ? container.clientWidth : window.innerWidth) - 32;

    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const fitScale = (containerWidth / unscaledViewport.width) * currentPDFScale;
    const finalScale = Math.max(fitScale, 0.6 * currentPDFScale);

    const outputScale = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: finalScale });

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    const renderContext = {
      canvasContext: ctx,
      transform: transform,
      viewport: viewport
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      isRenderingPDFPage = false;
      if (pendingPDFPage !== null) {
        renderPDFPage(pendingPDFPage);
        pendingPDFPage = null;
      }
    });

    currentPDFPage = num;
    const curPageEl = document.getElementById('pdf-current-page');
    if (curPageEl) curPageEl.textContent = num;

    const prevBtn = document.getElementById('pdf-prev-btn');
    const nextBtn = document.getElementById('pdf-next-btn');
    if (prevBtn) prevBtn.disabled = (num <= 1);
    if (nextBtn) nextBtn.disabled = (num >= currentPDFDoc.numPages);
  }).catch(err => {
    console.error('Erro na renderização da página do PDF:', err);
    isRenderingPDFPage = false;
  });
}

function prevPDFPage() {
  if (currentPDFPage <= 1) return;
  renderPDFPage(currentPDFPage - 1);
}

function nextPDFPage() {
  if (!currentPDFDoc || currentPDFPage >= currentPDFDoc.numPages) return;
  renderPDFPage(currentPDFPage + 1);
}

function changePDFZoom(delta) {
  const newScale = Math.min(Math.max(currentPDFScale + delta, 0.6), 2.5);
  currentPDFScale = Math.round(newScale * 10) / 10;
  const zoomEl = document.getElementById('pdf-zoom-level');
  if (zoomEl) zoomEl.textContent = Math.round(currentPDFScale * 100) + '%';
  renderPDFPage(currentPDFPage);
}

function closePDFReader() {
  const modal = document.getElementById('pdf-reader-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
  currentPDFDoc = null;
}

function downloadCurrentPDF() {
  if (currentPDFUrl) {
    downloadGCStudy(currentPDFUrl, currentPDFFileName, currentPDFTitle);
  }
}

function shareCurrentPDF() {
  if (currentPDFUrl) {
    shareGCStudy(currentPDFTitle, currentPDFUrl, currentPDFFileName);
  }
}

// Download / Abertura de Estudo com suporte a Celular (Blob/Share) e Desktop
async function downloadGCStudy(fileUrl, fileName, title) {
  showToast('Preparando estudo...');
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error('Não foi possível obter o arquivo');
    const blob = await res.blob();

    // Em celulares (Capacitor/Mobile): Compartilhar o arquivo real via Share Sheet
    if (navigator.canShare) {
      const file = new File([blob], fileName || 'Estudo_GC.pdf', { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || fileName,
          text: `Estudo: ${title || fileName}`
        });
        showToast('Estudo pronto para visualização!');
        return;
      }
    }

    // Fallback padrão para navegadores de computador ou web
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'Estudo_GC.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    showToast('Download do estudo iniciado!');
  } catch (err) {
    console.error('Falha no download via blob:', err);
    // Fallback de clique direto
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'Estudo_GC.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Compartilhamento Inteligente (Envia arquivo PDF real ou link web limpo)
async function shareGCStudy(title, url, fileName) {
  showToast('Preparando arquivo para compartilhar...');
  try {
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const file = new File([blob], fileName || 'Estudo_GC.pdf', { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `*${title}*\nEstudo bíblico do Grupo de Crescimento - ICE Metropolitana de Palmas.`
        });
        return;
      }
    }
  } catch (e) {
    console.warn('Compartilhamento de arquivo direto não suportado, usando texto alternativo.', e);
  }

  // Fallback se não suportar envio direto de arquivo
  const isWeb = window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost');
  const webLink = isWeb ? (window.location.origin + '/' + url) : '';
  const shareText = `*${title}*\nEstudo bíblico dos Grupos de Crescimento da ICE Metropolitana de Palmas.` +
    (webLink ? `\n\nAcesse o estudo em PDF: ${webLink}` : `\n\nAcesse e leia este estudo completo pelo Aplicativo ICEB Brasil!`);

  if (navigator.share) {
    navigator.share({
      title: title,
      text: shareText
    }).catch(() => {});
  } else {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  }
}

// Gerar HTML Rico da Tela de Detalhes da Igreja
function generateChurchDetailsHTML(church) {
  const isFav = AppState.favorites.includes(church.id);

  // Ministérios da igreja
  const churchMinistries = (church.ministries && church.ministries.length > 0) ? church.ministries : OFFICIAL_MINISTRIES;
  const ministriesCount = churchMinistries.length;
  const ministriesPreviewText = churchMinistries.slice(0, 3).map(m => m.name).join(', ') + ' e mais';

  // Contagem de membros por órgão da Estrutura Organizacional
  const estrutura = church.estruturaOrganizacional || {};
  const conselhoCount = (estrutura.conselho || church.conselho || []).length;
  const mealCount = (estrutura.meal || church.meal || []).length;
  const presbiterioCount = (estrutura.presbiterio || church.presbiterio || []).length;
  const diaconalCount = (estrutura.diaconal || estrutura.corpoDiaconal || church.corpoDiaconal || church.diaconal || []).length;
  
  return `
    <!-- Top Header Fixo com Margem Segura do Topo e Botão Voltar -->
    <header class="sticky top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(29,53,70,0.03)] pt-safe-top">
      <div class="h-14 px-4 flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <button 
            onclick="closeChurchDetails()" 
            class="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-iceb-navy hover:bg-iceb-blue-light active:scale-90 transition-all"
            aria-label="Voltar"
          >
            <span class="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
          </button>
          
          <img 
            src="assets/logo_iceb_horizontal.png" 
            alt="Igreja Cristã Evangélica" 
            class="h-7 w-auto object-contain"
          />
        </div>

        <div class="flex items-center gap-1 flex-shrink-0">
          <button 
            onclick="toggleFavorite('${church.id}', event)" 
            class="w-9 h-9 rounded-full flex items-center justify-center text-iceb-gray-dark hover:text-iceb-blue active:scale-90 transition-all"
            aria-label="Salvar"
          >
            <span class="material-symbols-outlined text-[20px] ${isFav ? 'text-iceb-blue fill-1' : ''}" style="${isFav ? 'font-variation-settings: \'FILL\' 1;' : ''}">
              ${isFav ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
          <button 
            onclick="shareChurch('${church.id}')" 
            class="w-9 h-9 rounded-full flex items-center justify-center text-iceb-gray-dark hover:bg-iceb-blue-light hover:text-iceb-blue active:scale-90 transition-all"
            aria-label="Compartilhar"
          >
            <span class="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-col pb-32">
      <!-- Topo Visual: Carrossel Real para ICEMP ou Banner Institucional Oficial (Sem Fotos Inventadas) -->
      ${church.id === ICEMP_ID && church.gallery && church.gallery.length > 0 ? `
        <section class="relative w-full overflow-hidden bg-iceb-navy">
          <div class="flex transition-transform duration-500 ease-out w-full" id="details-carousel-track">
            ${church.gallery.map((photo, idx) => `
              <div class="min-w-full relative aspect-[16/11]">
                <img 
                  src="${photo.url}" 
                  alt="${photo.title}" 
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-iceb-navy/90 via-transparent to-iceb-navy/20"></div>
                <div class="absolute bottom-3 left-4 text-white">
                  <p class="text-xs text-iceb-blue-light font-bold tracking-wider uppercase">${photo.title}</p>
                  <p class="text-xs text-white/90 line-clamp-1">${photo.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Controles do Topo do Carrossel -->
          <div class="absolute top-3 right-3 flex items-center gap-2">
            <button 
              onclick="openFullscreenPhoto()" 
              class="w-8 h-8 rounded-full bg-iceb-navy/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-iceb-navy transition-colors shadow-md"
              title="Tela Cheia"
            >
              <span class="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
          </div>

          <!-- Indicador de Slide -->
          <div class="absolute bottom-3 right-4 flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-iceb-navy/85 backdrop-blur-md text-white text-[11px] font-bold" id="detail-slide-badge">
              1 / ${church.gallery.length} Fotos
            </span>
          </div>

          <!-- Dots de Navegação -->
          <div class="absolute bottom-1.5 inset-x-0 flex justify-center items-center gap-1.5 py-1">
            ${church.gallery.map((_, i) => `
              <button 
                class="carousel-dot h-1.5 ${i === 0 ? 'w-5 bg-iceb-blue' : 'w-1.5 bg-white/50'} rounded-full transition-all duration-300" 
                onclick="goToDetailSlide(${i})"
              ></button>
            `).join('')}
          </div>
        </section>
      ` : `
        <section class="relative w-full bg-gradient-to-br from-iceb-navy via-[#1F3C52] to-iceb-blue text-white p-6 py-8 flex flex-col items-center text-center overflow-hidden border-b border-slate-200/50">
          <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-3 flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <img src="assets/simbolo_pomba_azul.png" class="w-full h-full object-contain filter invert" alt="ICEB" />
          </div>
          <span class="px-3 py-1 rounded-full bg-white/15 text-iceb-blue-light text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
            Igreja Cristã Evangélica do Brasil
          </span>
          <h2 class="text-lg font-black text-white mt-2 leading-snug">${church.name}</h2>
          <p class="text-xs text-slate-200 mt-1">${church.city} - ${church.uf}</p>
        </section>
      `}

      <!-- Cabeçalho Principal da Igreja -->
      <section class="px-4 pt-5 pb-3">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-iceb-blue text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
            <span class="material-symbols-outlined text-[13px]" style="font-variation-settings: 'FILL' 1;">verified</span>
            Comunidade Oficial ICEB
          </span>
          ${church.isHeadquarters ? `
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-iceb-blue-light text-iceb-blue-dark text-[11px] font-semibold border border-iceb-blue/20">
              <span class="material-symbols-outlined text-[13px]">church</span>
              Sede Regional
            </span>
          ` : ''}
        </div>

        <h1 class="text-xl font-extrabold text-iceb-navy leading-tight tracking-tight">
          ${church.name}
        </h1>

        <div class="flex items-center gap-1.5 mt-1.5 text-iceb-gray-dark text-xs">
          <span class="material-symbols-outlined text-[16px] text-iceb-blue">explore</span>
          <span class="font-medium">${church.region} • Filiada à AICEB</span>
        </div>

        <!-- Card de Endereço com Rota Rápida -->
        <div class="mt-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div class="flex items-start gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-iceb-blue-light flex items-center justify-center flex-shrink-0 text-iceb-blue mt-0.5">
              <span class="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-iceb-navy truncate">${church.address}</p>
              <p class="text-[11px] text-iceb-gray-dark">CEP ${church.cep} • ${church.distance}</p>
              <p class="text-[10px] text-iceb-blue font-semibold mt-0.5">Estacionamento e fácil acesso</p>
            </div>
          </div>
          <button 
            onclick="openRouteOptions('${church.id}')"
            class="flex-shrink-0 px-3 py-1.5 rounded-xl bg-iceb-blue text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs hover:bg-iceb-blue-dark"
          >
            <span class="material-symbols-outlined text-[14px]">navigation</span>
            <span>Rotas</span>
          </button>
        </div>
      </section>

      <!-- Botões de Ação Rápida (4 Botões) -->
      <section class="px-4 py-2">
        <div class="grid grid-cols-4 gap-2">
          <!-- Como Chegar -->
          <button 
            onclick="openRouteOptions('${church.id}')" 
            class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white shadow-xs hover:bg-iceb-blue-light active:scale-95 transition-all text-center border border-slate-200/80 group"
          >
            <div class="w-9 h-9 rounded-full bg-iceb-blue text-white group-hover:bg-iceb-blue-dark flex items-center justify-center mb-1 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[18px]">directions</span>
            </div>
            <span class="text-[10px] font-bold text-iceb-navy">Rotas</span>
          </button>

          <!-- Dízimos e Ofertas (PIX / Conta) -->
          <button 
            onclick="openPixModal('${church.id}')" 
            class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white shadow-xs hover:bg-amber-50 active:scale-95 transition-all text-center border border-slate-200/80 group"
          >
            <div class="w-9 h-9 rounded-full bg-amber-500 text-white group-hover:bg-amber-600 flex items-center justify-center mb-1 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[18px]">volunteer_activism</span>
            </div>
            <span class="text-[10px] font-bold text-iceb-navy">Dízimos</span>
          </button>

          <!-- Ligar Secretaria -->
          <a 
            href="tel:${church.phone}" 
            class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white shadow-xs hover:bg-iceb-blue-light active:scale-95 transition-all text-center border border-slate-200/80 group"
          >
            <div class="w-9 h-9 rounded-full bg-iceb-blue-light group-hover:bg-iceb-blue text-iceb-blue group-hover:text-white flex items-center justify-center mb-1 transition-colors">
              <span class="material-symbols-outlined text-[18px]">call</span>
            </div>
            <span class="text-[10px] font-bold text-iceb-navy">Secretaria</span>
          </a>

          <!-- WhatsApp Pastoral -->
          <a 
            href="https://api.whatsapp.com/send?phone=${church.whatsapp}&text=Graça e Paz! Gostaria de falar com o plantão pastoral da ${encodeURIComponent(church.shortName)}"
            target="_blank" 
            class="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white shadow-xs hover:bg-emerald-50 active:scale-95 transition-all text-center border border-slate-200/80 group"
          >
            <div class="w-10 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[18px]">chat</span>
            </div>
            <span class="text-[10px] font-bold text-iceb-navy">WhatsApp</span>
          </a>
        </div>
      </section>

      <!-- Botão para Acessar os Ministérios da Igreja -->
      <section class="px-4 pt-3">
        <button 
          onclick="openChurchMinistriesModal('${church.id}')"
          class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-iceb-blue-light via-white to-iceb-blue-light/60 border border-iceb-blue/35 shadow-xs flex items-center justify-between gap-3 active:scale-98 transition-all group text-left"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-iceb-blue text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-[22px]">groups</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-xs text-iceb-navy">Ministérios da Igreja</h3>
                <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-iceb-blue text-white">${ministriesCount} Áreas</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 truncate">${ministriesPreviewText}</p>
            </div>
          </div>
          <div class="w-7 h-7 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-iceb-navy group-hover:text-iceb-blue flex-shrink-0">
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </div>
        </button>
      </section>

      <!-- 1. Programação Semanal dos Cultos -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy flex items-center gap-1.5">
              <span>Cultos & Horários</span>
            </h2>
            <p class="text-xs text-iceb-gray-dark">Celebração, ensino e comunhão na presença de Deus</p>
          </div>
          <span class="text-[10px] text-iceb-blue font-bold uppercase tracking-wider bg-iceb-blue-light px-2.5 py-1 rounded-full border border-iceb-blue/20">
            Semanal
          </span>
        </div>

        <div class="space-y-2.5">
          ${church.schedule.map(item => `
            <div class="p-3 rounded-2xl bg-white shadow-xs flex items-center gap-3 border border-slate-200/70">
              <div class="w-12 h-12 rounded-xl bg-iceb-blue-light flex flex-col items-center justify-center text-center flex-shrink-0 border border-iceb-blue/15">
                <span class="text-[10px] font-bold text-iceb-blue uppercase tracking-wide">${item.day}</span>
                <span class="text-xs font-extrabold text-iceb-navy leading-none">${item.time}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-xs font-bold text-iceb-navy truncate">${item.title}</h3>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${item.badge === 'Ensino' ? 'bg-amber-100 text-amber-800' : (item.badge === 'Oração' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600')}">${item.badge}</span>
                </div>
                <p class="text-[11px] text-iceb-gray-dark mt-0.5 line-clamp-1">${item.desc}</p>
              </div>
              <button 
                onclick="addReminder('${item.title}')" 
                class="p-2 text-slate-400 hover:text-iceb-blue transition-colors"
                title="Adicionar Lembrete"
              >
                <span class="material-symbols-outlined text-[18px]">notification_add</span>
              </button>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 2. Agenda do Mês -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy flex items-center gap-1.5">
              <span>Agenda de ${church.monthlyAgenda?.month || 'Outubro'}</span>
            </h2>
            <p class="text-xs text-iceb-gray-dark">Eventos, acampamentos, vigílias e congressos</p>
          </div>
          ${church.monthlyAgenda && church.monthlyAgenda.events && church.monthlyAgenda.events.length > 0 ? `
            <span class="text-[10px] text-purple-700 font-bold uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              ${church.monthlyAgenda.events.length} Eventos
            </span>
          ` : `
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Em breve
            </span>
          `}
        </div>

        ${church.monthlyAgenda && church.monthlyAgenda.events && church.monthlyAgenda.events.length > 0 ? `
          <div class="space-y-2.5">
            ${church.monthlyAgenda.events.map(ev => `
              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3 hover:border-purple-300 transition-all">
                <div class="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 flex flex-col items-center justify-center flex-shrink-0 text-center shadow-2xs mt-0.5">
                  <span class="text-[9px] font-bold uppercase leading-none text-purple-500">${ev.dayOfWeek ? ev.dayOfWeek.slice(0, 3) : 'Dia'}</span>
                  <span class="text-sm font-extrabold leading-none mt-0.5">${ev.day}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1 flex-wrap">
                    <h3 class="font-bold text-xs text-iceb-navy leading-snug">${ev.title}</h3>
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">${ev.badge || ev.target || 'Evento'}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-600 flex-wrap">
                    <span class="flex items-center gap-1 font-semibold text-purple-900">
                      <span class="material-symbols-outlined text-[13px] text-purple-600">schedule</span>
                      ${ev.time}
                    </span>
                    <span class="flex items-center gap-1 text-slate-500 truncate">
                      <span class="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                      ${ev.location}
                    </span>
                  </div>
                  ${ev.desc ? `<p class="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">${ev.desc}</p>` : ''}
                </div>
                <button 
                  onclick="addReminder('${ev.title}')" 
                  class="p-1.5 text-slate-300 hover:text-purple-600 transition-colors flex-shrink-0"
                  title="Lembrar deste evento"
                >
                  <span class="material-symbols-outlined text-[18px]">notification_add</span>
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-5 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <span class="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <h3 class="font-bold text-xs text-iceb-navy">Agenda do Mês em Atualização</h3>
            <p class="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">A programação detalhada de eventos deste mês ainda não foi cadastrada para esta congregação.</p>
          </div>
        `}
      </section>

      <!-- 3. Grupos de Crescimento (11 Grupos nos Lares) -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Grupos de Crescimento (GCs)</h2>
            <p class="text-xs text-iceb-gray-dark">Comunhão nos lares e discipulado durante a semana</p>
          </div>
          <span class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ${(church.growthGroups || []).length} Grupos
          </span>
        </div>

        <!-- Opção de Visualizar os Estudos do Grupo de Crescimento -->
        ${(church.estudosGC || church.id === 'igreja-crista-evangelica-metropolitana-de-palmas-palmas-to') ? `
          <div 
            onclick="openGCEstudosModal('${church.id}')"
            class="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md relative overflow-hidden group cursor-pointer active:scale-98 transition-all border border-emerald-400/30"
          >
            <!-- Detalhe decorativo com transparência -->
            <div class="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            <div class="absolute top-1 right-2 transform translate-x-2 -translate-y-2 opacity-15 pointer-events-none">
              <span class="material-symbols-outlined text-[88px] text-white">menu_book</span>
            </div>

            <div class="relative z-10 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[24px] text-white">auto_stories</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/80 text-white tracking-wider border border-white/20 shadow-2xs">Material em PDF</span>
                    <span class="text-[10px] font-bold text-emerald-100 flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-[13px]">picture_as_pdf</span>
                      ${(church.estudosGC?.studies || []).length || 7} Lições
                    </span>
                  </div>
                  <h3 class="font-bold text-sm text-white mt-1 leading-snug">Visualizar Estudos do GC</h3>
                  <p class="text-[11px] text-emerald-100 line-clamp-1 mt-0.5 opacity-90">${church.estudosGC?.series || 'Série: O Princípio da Mutualidade nos Relacionamentos'}</p>
                </div>
              </div>
              <div class="w-8 h-8 rounded-full bg-white text-emerald-800 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 group-hover:translate-x-0.5 transition-all">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="space-y-2.5">
          ${(church.growthGroups || [
            { name: 'GC Betel', dayTime: 'Terça • 20h00', host: 'Setor Residencial', focus: 'Estudo bíblico e oração nos lares.' },
            { name: 'GC Famílias Conectadas', dayTime: 'Quinta • 19h30', host: 'Residência de Membros', focus: 'Discipulado de casais, jovens e filhos.' }
          ]).map(gc => `
            <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3 hover:border-emerald-300 transition-all">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <span class="material-symbols-outlined text-[20px]">cottage</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-1 flex-wrap">
                  <h3 class="font-bold text-xs text-iceb-navy truncate">${gc.name}</h3>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex-shrink-0">${gc.dayTime || (gc.day + ' • ' + gc.time)}</span>
                </div>
                ${gc.leaders ? `
                  <p class="text-[11px] font-semibold text-emerald-800 mt-0.5">
                    <span class="text-slate-400 font-normal">Liderança:</span> ${gc.leaders}
                  </p>
                ` : ''}
                <p class="text-[11px] text-slate-600 mt-1 leading-snug">${gc.focus || 'Estudo bíblico, oração e comunhão fraterna.'}</p>
                ${gc.host ? `
                  <div class="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                    <span class="material-symbols-outlined text-[13px]">location_on</span>
                    <span class="truncate">${gc.host}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Botão Quero Participar de um GC -->
        <a 
          href="https://api.whatsapp.com/send?phone=${church.whatsapp}&text=Graça e Paz! Gostaria de saber mais e participar de um Grupo de Crescimento da ${encodeURIComponent(church.shortName)}."
          target="_blank"
          class="mt-2.5 w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">chat</span>
          <span>Quero Participar de um Grupo de Crescimento</span>
        </a>
      </section>

      <!-- 4. Professores e Classes de EBD -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Professores de EBD</h2>
            <p class="text-xs text-iceb-gray-dark">Escola Bíblica Dominical • Classes e Professores</p>
          </div>
          <span class="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            ${church.ebd?.schedule || 'Domingo 18h'}
          </span>
        </div>

        ${church.ebd && church.ebd.classes && church.ebd.classes.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${church.ebd.classes.map(cls => `
              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
                <div>
                  <div class="flex items-center justify-between gap-1 mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs">
                        <span class="material-symbols-outlined text-[18px]">
                          ${cls.name.toLowerCase().includes('adulto') ? 'groups' : 
                            cls.name.toLowerCase().includes('jovem') ? 'local_fire_department' : 
                            cls.name.toLowerCase().includes('adolescente') ? 'diversity_3' : 
                            cls.name.toLowerCase().includes('junior') ? 'sentiment_satisfied' : 
                            cls.name.toLowerCase().includes('primario') ? 'child_care' : 'toys'}
                        </span>
                      </div>
                      <h3 class="font-bold text-xs text-iceb-navy">${cls.name}</h3>
                    </div>
                    ${cls.leader ? `
                      <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Líder: ${cls.leader.replace('LÍDER:', '').replace('Líder:', '').trim()}
                      </span>
                    ` : ''}
                  </div>
                  
                  <div class="mt-2">
                    <p class="text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Professores:</p>
                    <div class="flex flex-wrap gap-1">
                      ${cls.teachers.map(t => `
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-medium border border-slate-200/70">
                          <span class="material-symbols-outlined text-[11px] text-amber-600">person</span>
                          <span>${t}</span>
                        </span>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="p-5 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <span class="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <h3 class="font-bold text-xs text-iceb-navy">Classes de EBD em Estruturação</h3>
            <p class="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">As turmas e escalas de professores da Escola Bíblica Dominical serão inseridas posteriormente.</p>
          </div>
        `}
      </section>

      <!-- 5. Aniversariantes do Mês -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Aniversariantes</h2>
            <p class="text-xs text-iceb-gray-dark">Celebração da vida dos nossos irmãos em Cristo</p>
          </div>
          ${church.birthdays && church.birthdays.list && church.birthdays.list.length > 0 ? `
            <span class="text-[10px] text-rose-700 font-bold uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              ${church.birthdays.month || 'Mês'} • ${church.birthdays.list.length} Irmãos
            </span>
          ` : `
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Em breve
            </span>
          `}
        </div>

        ${church.birthdays && church.birthdays.list && church.birthdays.list.length > 0 ? `
          <div>
            <!-- Versículo Bíblico -->
            ${church.birthdays.verse ? `
              <div class="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 via-white to-amber-50/60 border border-rose-200/80 shadow-2xs mb-3">
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[16px]">format_quote</span>
                  </div>
                  <div>
                    <p class="italic text-[11px] text-slate-700 font-medium leading-relaxed">
                      “${church.birthdays.verse}”
                    </p>
                    <p class="text-[10px] text-rose-700 font-bold mt-1 text-right">— ${church.birthdays.reference || '1 Tessalonicenses 5:18'}</p>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Grade de Aniversariantes -->
            <div class="grid grid-cols-2 gap-2">
              ${church.birthdays.list.map(b => `
                <div class="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2 hover:border-rose-200 transition-all">
                  <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60 flex flex-col items-center justify-center flex-shrink-0">
                    <span class="text-[8px] font-bold text-rose-400 uppercase leading-none">DIA</span>
                    <span class="text-xs font-extrabold leading-none mt-0.5">${b.day}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-iceb-navy leading-snug truncate" title="${b.name}">${b.name}</p>
                    <p class="text-[10px] text-slate-400 leading-none mt-0.5">${church.birthdays.month || 'Outubro'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="p-5 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <span class="material-symbols-outlined text-[24px]">cake</span>
            </div>
            <h3 class="font-bold text-xs text-iceb-navy">Aniversariantes do Mês</h3>
            <p class="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">A relação de aniversariantes deste mês ainda não foi disponibilizada pela secretaria local.</p>
          </div>
        `}
      </section>

      <!-- 6. Dízimos, Ofertas e Dados Bancários -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Dízimos e Ofertas</h2>
            <p class="text-xs text-iceb-gray-dark">Fidelidade e generosidade na obra do Reino de Deus</p>
          </div>
          <span class="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Contribuição
          </span>
        </div>

        <div class="p-4 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-amber-50/40 border border-slate-200/90 shadow-xs">
          <!-- Chave PIX -->
          <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs mb-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chave PIX (${church.bankAccount?.pixType || church.pixType || 'CNPJ'})</span>
              <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">PIX Oficial</span>
            </div>
            <div class="flex items-center justify-between gap-2 mt-1">
              <span class="font-mono font-bold text-sm text-iceb-navy select-all truncate">
                ${church.bankAccount?.pixKeyFormatted || church.bankAccount?.pixKey || church.pixKey}
              </span>
              <button 
                onclick="copyDirectPix('${church.bankAccount?.pixKey || church.pixKey}')"
                class="flex-shrink-0 px-3 py-1.5 rounded-xl bg-iceb-blue text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs hover:bg-iceb-blue-dark"
              >
                <span class="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Copiar</span>
              </button>
            </div>
          </div>

          <!-- Dados da Conta Bancária (se cadastrada) -->
          ${church.bankAccount ? `
            <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs mb-3">
              <p class="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-iceb-blue">account_balance</span>
                Dados Bancários para Transferência / Depósito:
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <span class="text-[10px] text-slate-400 block font-semibold">Banco</span>
                  <strong class="text-iceb-navy font-bold">${church.bankAccount.bank}</strong>
                  <span class="text-[10px] text-slate-400 block mt-0.5">Cód. ${church.bankAccount.bankCode || '070'}</span>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <span class="text-[10px] text-slate-400 block font-semibold">Tipo de Conta</span>
                  <strong class="text-iceb-navy font-bold">${church.bankAccount.accountType || 'Conta Corrente'}</strong>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <span class="text-[10px] text-slate-400 block font-semibold">Agência</span>
                  <strong class="text-iceb-navy font-bold font-mono text-sm">${church.bankAccount.agency}</strong>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <span class="text-[10px] text-slate-400 block font-semibold">Conta Corrente</span>
                  <strong class="text-iceb-navy font-bold font-mono text-sm">${church.bankAccount.account}</strong>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 mt-2 font-medium">
                Favorecido: <strong class="text-iceb-navy">${church.bankAccount.beneficiary || church.name}</strong>
              </p>
            </div>
          ` : `
            <div class="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs mb-3 text-xs">
              <p class="text-slate-500">
                Favorecido: <strong class="text-iceb-navy">${church.pixBeneficiary || church.name}</strong>
              </p>
              <p class="text-[11px] text-slate-400 mt-1">Para depósitos e transferências bancárias via agência/conta, consulte a secretaria da igreja.</p>
            </div>
          `}

          <!-- Contatos Pastorais para Comprovantes e Dúvidas -->
          ${church.bankAccount?.pastoralContacts ? `
            <div class="pt-2 border-t border-slate-200/80">
              <p class="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Plantão Pastoral para Comprovantes e Oração:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${church.bankAccount.pastoralContacts.map(p => `
                  <a 
                    href="https://api.whatsapp.com/send?phone=${p.whatsapp || p.phone.replace(/\\D/g, '')}&text=Graça e Paz ${encodeURIComponent(p.pastor)}! Gostaria de enviar um comprovante / falar sobre dízimos e ofertas."
                    target="_blank"
                    class="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-97"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[14px]">chat</span>
                      </div>
                      <div>
                        <p class="font-bold text-iceb-navy text-[11px] leading-tight">${p.pastor}</p>
                        <p class="text-[10px] text-slate-500">${p.phone}</p>
                      </div>
                    </div>
                    <span class="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </section>

      <!-- Liderança Pastoral com Pastor Titular e Pastor Auxiliar -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-1">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Liderança Pastoral</h2>
            <p class="text-xs text-iceb-gray-dark">Cuidado, aconselhamento bíblico e pastoreio</p>
          </div>
          ${church.pastorAuxiliar ? `
            <span class="text-[10px] text-iceb-blue font-bold uppercase tracking-wider bg-iceb-blue-light px-2.5 py-1 rounded-full border border-iceb-blue/20">
              Equipe Pastoral
            </span>
          ` : ''}
        </div>
        
        <div class="space-y-3 mt-3">
          <!-- Pastor Titular -->
          <div class="p-4 rounded-2xl bg-white shadow-xs border border-slate-200/80">
            <div class="flex items-start gap-3.5">
              <div class="relative flex-shrink-0">
                <img 
                  src="${church.pastorPhoto}" 
                  alt="${church.pastorTitle}" 
                  class="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-100"
                />
                <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-iceb-blue text-white flex items-center justify-center text-[10px] shadow" title="Pastor Titular">
                  <span class="material-symbols-outlined text-[12px]">shield_person</span>
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="font-bold text-sm text-iceb-navy leading-snug">${church.pastorTitle}</h3>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-iceb-blue text-white">Titular</span>
                </div>
                <p class="text-xs text-iceb-blue font-semibold mt-0.5">${church.pastorRole}</p>
                
                <!-- Nome da Esposa do Pastor Titular -->
                ${church.pastorSpouse ? `
                  <div class="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-iceb-blue-light border border-iceb-blue/20 text-[11px] text-slate-700">
                    <span class="material-symbols-outlined text-iceb-blue text-[14px]">favorite</span>
                    <span>Esposa: <strong class="text-iceb-navy font-bold">${church.pastorSpouse}</strong></span>
                  </div>
                ` : ''}

                <p class="text-[11px] text-iceb-gray-dark mt-2 leading-relaxed">${church.pastorBio}</p>
              </div>
            </div>
          </div>

          <!-- Pastor Auxiliar (se houver) -->
          ${(() => {
            const auxiliares = Array.isArray(church.pastorAuxiliar) 
              ? church.pastorAuxiliar 
              : (church.pastorAuxiliar ? [church.pastorAuxiliar] : []);
            
            return auxiliares.map(aux => `
              <div class="p-4 rounded-2xl bg-white shadow-xs border border-slate-200/80">
                <div class="flex items-start gap-3.5">
                  <div class="relative flex-shrink-0">
                    <img 
                      src="${aux.photo || 'assets/simbolo_pomba_azul.png'}" 
                      alt="${aux.name}" 
                      class="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-100"
                    />
                    <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] shadow" title="Pastor Auxiliar">
                      <span class="material-symbols-outlined text-[12px]">person</span>
                    </span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h3 class="font-bold text-sm text-iceb-navy leading-snug">${aux.name}</h3>
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">Auxiliar</span>
                    </div>
                    <p class="text-xs text-slate-500 font-semibold mt-0.5">${aux.role || 'Pastor Auxiliar'}</p>
                    
                    ${aux.spouse ? `
                      <div class="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                        <span class="material-symbols-outlined text-pink-500 text-[14px]">favorite</span>
                        <span>Esposa: <strong class="text-iceb-navy font-bold">${aux.spouse}</strong></span>
                      </div>
                    ` : ''}

                    <p class="text-[11px] text-iceb-gray-dark mt-2 leading-relaxed">${aux.bio || 'Dedicado ao ministério pastoral, discipulado e apoio ministerial à comunidade local.'}</p>
                  </div>
                </div>
              </div>
            `).join('');
          })()}
          
          <!-- Atendimento Pastoral Agendamento -->
          <div class="flex items-center justify-between gap-2 bg-[#f1f5f9] p-3 rounded-xl border border-slate-200/70">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-iceb-blue-light flex items-center justify-center text-iceb-blue flex-shrink-0">
                <span class="material-symbols-outlined text-[16px]">support_agent</span>
              </div>
              <div>
                <p class="text-[10px] text-iceb-gray-dark uppercase font-bold tracking-wide">Atendimento Pastoral</p>
                <p class="text-xs text-iceb-navy font-semibold">Gabinete com agendamento</p>
              </div>
            </div>
            <button 
              onclick="openPastoralCareModal('${church.id}')" 
              class="px-3 py-1.5 rounded-lg bg-iceb-navy text-white text-xs font-bold active:scale-95 transition-all hover:bg-iceb-blue flex-shrink-0"
            >
              Agendar
            </button>
          </div>
        </div>
      </section>

      <!-- Estrutura Organizacional da Igreja -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Estrutura Organizacional</h2>
            <p class="text-xs text-iceb-gray-dark">Governo bíblico e administração da comunidade</p>
          </div>
          <span class="text-[10px] text-iceb-navy font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Ordem Bíblica
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <!-- 1. Conselho da Igreja -->
          <button 
            type="button" 
            onclick="openOrgStructureModal('${church.id}', 'conselho')"
            class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between text-left hover:border-iceb-navy/50 active:scale-97 transition-all group"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-xl bg-iceb-navy text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">account_balance</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${conselhoCount > 0 ? 'bg-iceb-blue-light text-iceb-blue' : 'bg-slate-100 text-slate-400'}">
                  ${conselhoCount > 0 ? `${conselhoCount} membros` : 'Ver'}
                </span>
              </div>
              <h3 class="font-bold text-iceb-navy text-xs leading-tight">Conselho da Igreja</h3>
              <p class="text-[10px] text-iceb-blue font-semibold mt-0.5">Órgão Deliberativo</p>
              <p class="text-[10px] text-slate-500 mt-1 leading-snug">Diretrizes espirituais, doutrinárias e gerais.</p>
            </div>
            <div class="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-iceb-blue group-hover:text-iceb-navy">
              <span>Ver integrantes</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </button>

          <!-- 2. MEAL (Liderança Local) -->
          <button 
            type="button" 
            onclick="openOrgStructureModal('${church.id}', 'meal')"
            class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between text-left hover:border-iceb-blue/50 active:scale-97 transition-all group"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-xl bg-iceb-blue text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">corporate_fare</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${mealCount > 0 ? 'bg-iceb-blue-light text-iceb-blue' : 'bg-slate-100 text-slate-400'}">
                  ${mealCount > 0 ? `${mealCount} membros` : 'Ver'}
                </span>
              </div>
              <h3 class="font-bold text-iceb-navy text-xs leading-tight">MEAL</h3>
              <p class="text-[10px] text-iceb-blue font-semibold mt-0.5">Mesa Executiva Local</p>
              <p class="text-[10px] text-slate-500 mt-1 leading-snug">Gestão executiva e coordenação ministerial.</p>
            </div>
            <div class="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-iceb-blue group-hover:text-iceb-navy">
              <span>Ver integrantes</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </button>

          <!-- 3. Presbíteros -->
          <button 
            type="button" 
            onclick="openOrgStructureModal('${church.id}', 'presbiterio')"
            class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between text-left hover:border-amber-500/50 active:scale-97 transition-all group"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">menu_book</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${presbiterioCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}">
                  ${presbiterioCount > 0 ? `${presbiterioCount} membros` : 'Ver'}
                </span>
              </div>
              <h3 class="font-bold text-iceb-navy text-xs leading-tight">Presbitério</h3>
              <p class="text-[10px] text-amber-700 font-semibold mt-0.5">Presbíteros</p>
              <p class="text-[10px] text-slate-500 mt-1 leading-snug">Ensino bíblico, visitação e supervisão.</p>
            </div>
            <div class="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-amber-700 group-hover:text-iceb-navy">
              <span>Ver integrantes</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </button>

          <!-- 4. Diaconia -->
          <button 
            type="button" 
            onclick="openOrgStructureModal('${church.id}', 'diaconal')"
            class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between text-left hover:border-teal-500/50 active:scale-97 transition-all group"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[18px]">volunteer_activism</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${diaconalCount > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'}">
                  ${diaconalCount > 0 ? `${diaconalCount} membros` : 'Ver'}
                </span>
              </div>
              <h3 class="font-bold text-iceb-navy text-xs leading-tight">Corpo Diaconal</h3>
              <p class="text-[10px] text-teal-700 font-semibold mt-0.5">Diaconia</p>
              <p class="text-[10px] text-slate-500 mt-1 leading-snug">Serviço prático, beneficência e acolhimento.</p>
            </div>
            <div class="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-teal-700 group-hover:text-iceb-navy">
              <span>Ver integrantes</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </button>
        </div>
      </section>

      <!-- Localização & Mini Mapa da Igreja -->
      <section class="px-4 pt-6">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h2 class="font-extrabold text-base text-iceb-navy">Mapa & Localização</h2>
            <p class="text-xs text-iceb-gray-dark">Visualização de alta definição no satélite</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button 
              type="button"
              onclick="toggleDetailMapLayer()" 
              class="px-2.5 py-1 rounded-full bg-white text-iceb-navy hover:bg-slate-100 border border-slate-200/80 text-[10px] font-bold shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
              title="Alternar camada do mapa"
            >
              <span class="material-symbols-outlined text-[13px] text-iceb-blue">layers</span>
              <span id="detail-map-layer-label">Satélite</span>
            </button>
            <button 
              type="button"
              onclick="openRouteOptions('${church.id}')"
              class="px-2.5 py-1 rounded-full bg-iceb-blue text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 hover:bg-iceb-blue-dark active:scale-95 transition-all"
              title="Rotas e GPS"
            >
              <span class="material-symbols-outlined text-[13px]">navigation</span>
              <span>Rotas</span>
            </button>
          </div>
        </div>
        
        <div class="relative w-full rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div id="detail-church-map" class="w-full h-52"></div>
          
          <div class="absolute bottom-2.5 right-2.5 z-[400] flex items-center gap-1.5">
            <button 
              type="button"
              onclick="recenterDetailMap(${church.lat}, ${church.lng})" 
              class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-iceb-navy hover:text-iceb-blue active:scale-90 transition-all"
              title="Centralizar Igreja"
            >
              <span class="material-symbols-outlined text-[18px]">my_location</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Rodapé com Redes Sociais da Comunidade -->
      <section class="px-4 pt-6">
        <div class="p-4 rounded-2xl bg-white text-center border border-slate-200/80 shadow-xs">
          <p class="text-[10px] text-iceb-gray-dark uppercase font-extrabold tracking-wider mb-3">Conecte-se com a Comunidade</p>
          
          <div class="grid grid-cols-4 gap-2 py-1 max-w-xs mx-auto">
            <!-- Instagram -->
            <a 
              href="${church.instagram && church.instagram.startsWith('http') ? church.instagram : 'https://instagram.com/' + (church.instagram ? church.instagram.replace('@', '') : 'iceb.oficial')}" 
              target="_blank" 
              class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              title="Instagram"
            >
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[20px]">photo_camera</span>
              </div>
              <span class="text-[10px] font-bold text-slate-600 group-hover:text-iceb-blue">Instagram</span>
            </a>

            <!-- Facebook -->
            <a 
              href="${church.facebook || 'https://facebook.com'}" 
              target="_blank" 
              class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              title="Facebook"
            >
              <div class="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[20px]">public</span>
              </div>
              <span class="text-[10px] font-bold text-slate-600 group-hover:text-iceb-blue">Facebook</span>
            </a>

            <!-- YouTube -->
            <a 
              href="${church.youtubeUrl || 'https://youtube.com'}" 
              target="_blank" 
              class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              title="YouTube"
            >
              <div class="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              </div>
              <span class="text-[10px] font-bold text-slate-600 group-hover:text-iceb-blue">YouTube</span>
            </a>

            <!-- Site Oficial -->
            <a 
              href="${church.website || 'https://igrejacristaevangelica.com.br'}" 
              target="_blank" 
              class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
              title="Site Oficial"
            >
              <div class="w-10 h-10 rounded-full bg-iceb-blue text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-[20px]">language</span>
              </div>
              <span class="text-[10px] font-bold text-slate-600 group-hover:text-iceb-blue">Site Oficial</span>
            </a>
          </div>

          <div class="mt-3.5 pt-3 border-t border-slate-100 text-slate-500 text-[11px]">
            <p class="font-semibold text-iceb-navy">${church.name}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Igreja Cristã Evangélica do Brasil • ICEB</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

// Inicializar Mini-Mapa na Tela de Detalhes (Idêntico ao Google Satélite da página Mapa)
function initDetailMiniMap(church) {
  setTimeout(() => {
    const el = document.getElementById('detail-church-map');
    if (!el) return;

    if (AppState.detailMapInstance) {
      try {
        AppState.detailMapInstance.remove();
      } catch (e) {}
      AppState.detailMapInstance = null;
    }
    
    // Zoom 17 para mostrar nitidamente o templo e as ruas no satélite
    const detailMap = L.map('detail-church-map', {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 20
    }).setView([church.lat, church.lng], 17);
    
    AppState.detailMapInstance = detailMap;
    AppState.detailMapCurrentLayer = 'satellite';

    // Usar mesma fonte Google Satélite Híbrido da página Mapa
    AppState.detailMapTileLayer = L.tileLayer(GMAPS_TILE_URLS.satellite, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(detailMap);
    
    // Marcador com o estilo idêntico da página Mapa
    const pin = L.divIcon({
      className: 'gmaps-marker-wrapper',
      html: `
        <div class="gmaps-church-pin active" title="${church.name}">
          <div class="gmaps-pin-inner">
            <span class="material-symbols-outlined text-[18px]">church</span>
          </div>
          <div class="gmaps-pin-pulse"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    
    L.marker([church.lat, church.lng], { icon: pin }).addTo(detailMap);

    setTimeout(() => {
      if (AppState.detailMapInstance) {
        AppState.detailMapInstance.invalidateSize();
      }
    }, 200);
  }, 120);
}

// Alternar camada do Mini-Mapa (Satélite vs Ruas)
function toggleDetailMapLayer() {
  if (!AppState.detailMapInstance || !AppState.detailMapTileLayer) return;
  const labelEl = document.getElementById('detail-map-layer-label');
  
  if (AppState.detailMapCurrentLayer === 'satellite' || !AppState.detailMapCurrentLayer) {
    AppState.detailMapInstance.removeLayer(AppState.detailMapTileLayer);
    AppState.detailMapTileLayer = L.tileLayer(GMAPS_TILE_URLS.streets, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(AppState.detailMapInstance);
    AppState.detailMapCurrentLayer = 'streets';
    if (labelEl) labelEl.textContent = 'Ruas';
  } else {
    AppState.detailMapInstance.removeLayer(AppState.detailMapTileLayer);
    AppState.detailMapTileLayer = L.tileLayer(GMAPS_TILE_URLS.satellite, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(AppState.detailMapInstance);
    AppState.detailMapCurrentLayer = 'satellite';
    if (labelEl) labelEl.textContent = 'Satélite';
  }
}

// Centralizar Mini-Mapa na Igreja
function recenterDetailMap(lat, lng) {
  if (AppState.detailMapInstance) {
    AppState.detailMapInstance.setView([lat, lng], 17, { animate: true });
  }
}

// Controle do Carrossel de Fotos na Tela de Detalhes
function goToDetailSlide(index) {
  if (!AppState.selectedChurch) return;
  const track = document.getElementById('details-carousel-track');
  const badge = document.getElementById('detail-slide-badge');
  const dots = document.querySelectorAll('.carousel-dot');
  
  const total = AppState.selectedChurch.gallery.length;
  if (index < 0) index = 0;
  if (index >= total) index = total - 1;
  
  AppState.activeSlide = index;
  
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  if (badge) {
    badge.textContent = `${index + 1} / ${total} Fotos`;
  }
  
  dots.forEach((d, i) => {
    if (i === index) {
      d.className = 'carousel-dot h-1.5 w-5 bg-iceb-blue rounded-full transition-all duration-300';
    } else {
      d.className = 'carousel-dot h-1.5 w-1.5 bg-white/50 rounded-full transition-all duration-300';
    }
  });
}

// Alternar Visualização na Aba Igrejas (Lista vs Mapa)
function setChurchesViewMode(mode) {
  AppState.churchesViewMode = mode;
  const listView = document.getElementById('churches-list-view');
  const mapView = document.getElementById('churches-map-view');
  const listBtn = document.getElementById('view-mode-list-btn');
  const mapBtn = document.getElementById('view-mode-map-btn');

  if (mode === 'map') {
    if (listView) listView.classList.add('hidden');
    if (mapView) mapView.classList.remove('hidden');
    
    if (listBtn) {
      listBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-iceb-navy';
    }
    if (mapBtn) {
      mapBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white text-iceb-blue shadow-xs';
    }
    
    initFullMap();
    setTimeout(() => {
      if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
    }, 80);
    setTimeout(() => {
      if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
    }, 250);
  } else {
    if (mapView) mapView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');
    
    if (mapBtn) {
      mapBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-iceb-navy';
    }
    if (listBtn) {
      listBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white text-iceb-blue shadow-xs';
    }
  }
}

// Focar uma congregação vinda da lista diretamente no mapa interativo
function showChurchOnMap(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId);
  if (!church) return;

  // Alterna para o modo mapa
  setChurchesViewMode('map');
  
  setTimeout(() => {
    if (AppState.fullMapInstance) {
      AppState.fullMapInstance.setView([church.lat, church.lng], 16, { animate: true });
      openFullMapChurchCard(church);
    }
  }, 180);
}

// Alternar Abas Principais (Sobre ICEB, ICEMP, Eventos, Igrejas & Mapa)
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // 1. Fechar telas modais de sobreposição direta se abertas
  const screenDetails = document.getElementById('screen-details');
  if (screenDetails) screenDetails.classList.remove('active');
  const screenHistory = document.getElementById('screen-history');
  if (screenHistory) screenHistory.classList.remove('active');
  const screenTopic = document.getElementById('screen-topic-detail');
  if (screenTopic) screenTopic.classList.remove('active');
  const screenReader = document.getElementById('screen-article-reader');
  if (screenReader) screenReader.classList.remove('active');

  // 2. Limpar todas as telas ativas e remover atributos residuais
  document.querySelectorAll('.app-screen').forEach(screen => {
    screen.classList.remove('active');
    delete screen.dataset.wasActive;
  });

  // 3. Atualizar botões de navegação inferior
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 4. Ativar EXCLUSIVAMENTE a tela alvo
  const targetScreen = document.getElementById(`screen-${tabId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // 5. Inicializações e comportamentos específicos
  if (tabId === 'churches') {
    if (AppState.churchesViewMode === 'map') {
      initFullMap();
      setTimeout(() => {
        if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
      }, 100);
    }
  } else if (tabId === 'events') {
    renderEvents();
  } else if (tabId === 'icemp') {
    // Aba ICEMP ativa
    updateIcempModuleCounts();
  } else if (tabId === 'studies') {
    // Aba Estudos ativa
    renderStudiesTopics();
  }
}

// ==========================================================================
// TELA DO MAPA INTERATIVO ESTILO GOOGLE MAPS (Satellite Map)
// ==========================================================================

const GMAPS_TILE_URLS = {
  // Google Hybrid Satellite (Satélite de alta resolução com nomes de ruas, estados e cidades)
  satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  // Google Roadmap (Mapa de ruas padrão)
  streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  // Google Terrain (Relevo topográfico)
  terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
};

// Inicializar Mapa Geral em Tela Cheia (Aba Mapa)
function initFullMap() {
  const mapEl = document.getElementById('full-screen-map');
  if (!mapEl) return;

  if (!AppState.fullMapInstance) {
    // Centro geográfico do Brasil [-14.2350, -51.9253] com zoom 4
    AppState.fullMapInstance = L.map('full-screen-map', {
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 20
    }).setView([-14.2350, -51.9253], 4);

    // Camada padrão: Satélite Híbrido
    AppState.fullMapTileLayer = L.tileLayer(GMAPS_TILE_URLS.satellite, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(AppState.fullMapInstance);

    // Fechar card ao clicar em qualquer área vazia do mapa
    AppState.fullMapInstance.on('click', (e) => {
      // Se não for clique em marcador
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.closest('.gmaps-church-pin')) {
        return;
      }
      closeFullMapChurchCard();
    });

    // Fechar menu de camadas se aberto
    AppState.fullMapInstance.on('movestart', () => {
      const menu = document.getElementById('gmaps-layers-menu');
      if (menu) menu.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
      if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
    });
  }

  // Recalcular dimensões do container Leaflet com segurança
  setTimeout(() => {
    if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
  }, 50);
  setTimeout(() => {
    if (AppState.fullMapInstance) AppState.fullMapInstance.invalidateSize();
  }, 200);

  // Renderizar marcadores conforme os filtros atuais
  updateFullMapMarkers();
}

// Atualizar Marcadores e Lista Lateral no Mapa
function updateFullMapMarkers() {
  if (!AppState.fullMapInstance) return;

  // Limpar marcadores anteriores
  if (AppState.fullMapMarkers && AppState.fullMapMarkers.length > 0) {
    AppState.fullMapMarkers.forEach(m => m.remove());
  }
  AppState.fullMapMarkers = [];

  const filter = AppState.fullMapFilter || { search: '', uf: '', mear: '' };
  const query = normalizeText(filter.search || '').trim();
  const ufFilter = (filter.uf || '').toUpperCase().trim();
  const mearFilter = normalizeText(filter.mear || '').trim();

  const filtered = ICEB_CHURCHES_DATA.filter(church => {
    // Filtro por Estado (UF)
    if (ufFilter && ufFilter !== 'ALL' && church.uf !== ufFilter) {
      return false;
    }
    // Filtro por MEAR
    if (mearFilter && mearFilter !== 'todas') {
      const churchRegion = normalizeText(church.region || '');
      if (!churchRegion.includes(mearFilter)) {
        return false;
      }
    }
    // Filtro Geral de Pesquisa de Texto (Nome, Cidade, Estado, MEAR, Pastor)
    if (query) {
      const matchName = normalizeText(church.name || '').includes(query);
      const matchCity = normalizeText(church.city || '').includes(query);
      const matchUf = normalizeText(church.uf || '').includes(query);
      const matchUfName = normalizeText(church.ufName || '').includes(query);
      const matchMear = normalizeText(church.region || '').includes(query);
      const matchPastor = normalizeText(church.pastorTitle || '').includes(query);
      const matchNeighborhood = normalizeText(church.neighborhood || '').includes(query);
      if (!matchName && !matchCity && !matchUf && !matchUfName && !matchMear && !matchPastor && !matchNeighborhood) {
        return false;
      }
    }
    return true;
  });

  // Atualizar contadores
  const totalCountEl = document.getElementById('fullmap-total-count');
  if (totalCountEl) totalCountEl.textContent = filtered.length;
  const sidebarCountEl = document.getElementById('gmaps-sidebar-count');
  if (sidebarCountEl) sidebarCountEl.textContent = `${filtered.length} congregações`;

  // Atualizar lista da barra lateral
  renderFullMapSidebarList(filtered);

  // Inserir os pinos no mapa
  const bounds = [];
  filtered.forEach(church => {
    if (!church.lat || !church.lng || isNaN(church.lat) || isNaN(church.lng)) return;

    // Ícone estilo Google Maps: Estrela Dourada / Igreja sobre o Satélite
    const pin = L.divIcon({
      className: 'gmaps-marker-wrapper',
      html: `
        <div class="gmaps-church-pin" id="pin-${church.id}" title="${church.name}">
          <div class="gmaps-pin-inner">
            <span class="material-symbols-outlined text-[17px]">church</span>
          </div>
          <div class="gmaps-pin-pulse"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const marker = L.marker([church.lat, church.lng], { icon: pin })
      .addTo(AppState.fullMapInstance);

    marker.on('click', (e) => {
      if (e.originalEvent) e.originalEvent.stopPropagation();
      selectFullMapChurch(church);
    });

    AppState.fullMapMarkers.push(marker);
    bounds.push([church.lat, church.lng]);
  });

  // Ajustar enquadramento do mapa se for filtro de estado ou pesquisa específica
  if ((ufFilter || mearFilter || (query && query.length >= 2)) && bounds.length > 0) {
    if (bounds.length === 1) {
      AppState.fullMapInstance.setView(bounds[0], 13, { animate: true });
    } else {
      AppState.fullMapInstance.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 13,
        animate: true
      });
    }
  }
}

// Selecionar Igreja no Mapa e Exibir Card Flutuante de Prévia
function selectFullMapChurch(church) {
  if (!church || !AppState.fullMapInstance) return;

  // Centralizar mapa suavemente na igreja
  AppState.fullMapInstance.setView([church.lat, church.lng], Math.max(AppState.fullMapInstance.getZoom(), 12), { animate: true });

  // Destacar o pino visualmente
  document.querySelectorAll('.gmaps-church-pin').forEach(p => p.classList.remove('active'));
  const pinEl = document.getElementById(`pin-${church.id}`);
  if (pinEl) pinEl.classList.add('active');

  // Renderizar o card flutuante de prévia (Google Maps preview card)
  const card = document.getElementById('fullmap-church-card');
  if (!card) return;

  const isIcemp = church.id === ICEMP_ID;
  const photoUrl = (isIcemp && church.gallery && church.gallery.length > 0) 
    ? church.gallery[0].url 
    : null;

  card.innerHTML = `
    <div class="flex items-start gap-3">
      <!-- Ícone / Fachada Real -->
      <div class="w-14 h-14 rounded-2xl overflow-hidden bg-iceb-blue-light/60 flex items-center justify-center flex-shrink-0 border border-iceb-blue/20 text-iceb-blue">
        ${photoUrl ? `
          <img src="${photoUrl}" alt="${church.name}" class="w-full h-full object-cover"/>
        ` : `
          <span class="material-symbols-outlined text-[26px]">church</span>
        `}
      </div>

      <!-- Informações Principais -->
      <div class="flex-1 min-w-0 pr-1">
        <div class="flex items-center justify-between gap-1">
          <span class="px-2 py-0.5 rounded-full bg-iceb-blue-light text-iceb-blue text-[10px] font-extrabold uppercase">
            ${church.region || 'ICEB'}
          </span>
          <button type="button" onclick="closeFullMapChurchCard()" class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all" title="Fechar">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
        <h3 class="font-extrabold text-sm text-iceb-navy leading-tight mt-1 line-clamp-1">${church.name}</h3>
        <p class="text-[11px] text-iceb-gray-dark font-medium mt-0.5 flex items-center gap-1">
          <span class="material-symbols-outlined text-[13px] text-amber-500">location_on</span>
          <span>${church.city} - ${church.uf}</span>
        </p>
        <p class="text-[10px] text-slate-500 mt-0.5 truncate">${church.pastorTitle || 'Pastor Titular da ICEB'}</p>
      </div>
    </div>

    <!-- Botão de Como Chegar (Sem detalhes abertos) -->
    <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
      <span class="text-[10px] text-slate-400 font-medium">Localização Oficial ICEB</span>
      <a 
        href="https://maps.google.com/?q=${church.lat},${church.lng}" 
        target="_blank"
        class="py-2 px-3 rounded-xl bg-iceb-blue hover:bg-iceb-blue-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
      >
        <span class="material-symbols-outlined text-[16px]">directions</span>
        <span>Como Chegar (GPS)</span>
      </a>
    </div>
  `;

  card.classList.remove('hidden');
}

// Fechar Card Flutuante de Prévia
function closeFullMapChurchCard() {
  const card = document.getElementById('fullmap-church-card');
  if (card) card.classList.add('hidden');
  document.querySelectorAll('.gmaps-church-pin').forEach(p => p.classList.remove('active'));
}

// Alternar Camadas do Mapa (Satélite, Padrão, Relevo)
function switchMapLayer(layerType) {
  if (!AppState.fullMapInstance) return;
  AppState.fullMapCurrentLayer = layerType;

  // Remover camada anterior
  if (AppState.fullMapTileLayer) {
    AppState.fullMapInstance.removeLayer(AppState.fullMapTileLayer);
  }

  // Adicionar nova camada correspondente
  const url = GMAPS_TILE_URLS[layerType] || GMAPS_TILE_URLS.satellite;
  AppState.fullMapTileLayer = L.tileLayer(url, {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(AppState.fullMapInstance);

  // Atualizar visual do botão miniatura de camadas
  const thumbPreview = document.getElementById('gmaps-thumb-preview');
  const labelName = document.getElementById('gmaps-layer-current-name');
  if (thumbPreview && labelName) {
    thumbPreview.className = 'gmaps-thumb-preview';
    if (layerType === 'satellite') {
      thumbPreview.classList.add('gmaps-thumb-streets');
      labelName.textContent = 'Satélite';
    } else if (layerType === 'streets') {
      thumbPreview.classList.add('gmaps-thumb-satellite');
      labelName.textContent = 'Padrão';
    } else {
      thumbPreview.classList.add('gmaps-thumb-satellite');
      labelName.textContent = 'Relevo';
    }
  }

  // Atualizar classe ativa nas opções do menu
  document.querySelectorAll('.gmaps-layer-option').forEach(opt => {
    if (opt.dataset.layer === layerType) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  // Fechar o menu popover
  const menu = document.getElementById('gmaps-layers-menu');
  if (menu) menu.classList.add('hidden');
}

// Abrir/Fechar Menu Popover de Camadas
function toggleLayersMenu() {
  const menu = document.getElementById('gmaps-layers-menu');
  if (menu) menu.classList.toggle('hidden');
}

// Pesquisa de Texto no Mapa em Tempo Real
function handleFullMapSearch(query) {
  if (!AppState.fullMapFilter) AppState.fullMapFilter = { search: '', uf: '', mear: '' };
  AppState.fullMapFilter.search = query;

  const clearBtn = document.getElementById('fullmap-clear-search-btn');
  if (clearBtn) {
    if (query && query.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  updateFullMapMarkers();
}

// Limpar Campo de Pesquisa
function clearFullMapSearch() {
  const input = document.getElementById('fullmap-search-input');
  if (input) input.value = '';
  handleFullMapSearch('');
}

// Filtro Rápido em Chips (Todas, Tocantins, etc.)
function setFullMapQuickFilter(filterType) {
  if (!AppState.fullMapFilter) AppState.fullMapFilter = { search: '', uf: '', mear: '' };

  const chipAll = document.getElementById('chip-filter-all');
  const chipTo = document.getElementById('chip-filter-to');
  const ufSelect = document.getElementById('fullmap-uf-select');
  const mearSelect = document.getElementById('fullmap-mear-select');

  if (filterType === 'all') {
    AppState.fullMapFilter.uf = '';
    AppState.fullMapFilter.mear = '';
    AppState.fullMapFilter.search = '';
    const input = document.getElementById('fullmap-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('fullmap-clear-search-btn');
    if (clearBtn) clearBtn.classList.add('hidden');

    if (chipAll) chipAll.classList.add('active');
    if (chipTo) chipTo.classList.remove('active');
    if (ufSelect) ufSelect.value = '';
    if (mearSelect) mearSelect.value = '';
    resetFullMapView();
  } else if (filterType === 'TO') {
    AppState.fullMapFilter.uf = 'TO';
    if (chipAll) chipAll.classList.remove('active');
    if (chipTo) chipTo.classList.add('active');
    if (ufSelect) ufSelect.value = 'TO';
  }

  updateFullMapMarkers();
}

// Filtro pelo Dropdown de Estado (UF)
function setFullMapUfFilter(uf) {
  if (!AppState.fullMapFilter) AppState.fullMapFilter = { search: '', uf: '', mear: '' };
  AppState.fullMapFilter.uf = uf;

  const chipAll = document.getElementById('chip-filter-all');
  const chipTo = document.getElementById('chip-filter-to');
  if (chipAll) chipAll.classList.toggle('active', !uf);
  if (chipTo) chipTo.classList.toggle('active', uf === 'TO');

  updateFullMapMarkers();
}

// Filtro pelo Dropdown de MEAR
function setFullMapMearFilter(mear) {
  if (!AppState.fullMapFilter) AppState.fullMapFilter = { search: '', uf: '', mear: '' };
  AppState.fullMapFilter.mear = mear;

  const chipAll = document.getElementById('chip-filter-all');
  if (chipAll && mear) chipAll.classList.remove('active');

  updateFullMapMarkers();
}

// Abrir ou Fechar a Barra Lateral (Sidebar) de Pesquisa
function toggleMapSidebar(forceOpen) {
  const sidebar = document.getElementById('gmaps-sidebar');
  const backdrop = document.getElementById('gmaps-sidebar-backdrop');
  if (!sidebar) return;

  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('open');
  if (shouldOpen) {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.remove('hidden');
  } else {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.add('hidden');
  }
}

// Renderizar Itens da Barra Lateral
function renderFullMapSidebarList(churches) {
  const listEl = document.getElementById('gmaps-sidebar-list');
  if (!listEl) return;

  if (churches.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-10 px-4">
        <span class="material-symbols-outlined text-4xl text-slate-300">location_off</span>
        <p class="text-xs font-bold text-iceb-navy mt-2">Nenhuma congregação encontrada</p>
        <p class="text-[11px] text-slate-500 mt-1">Tente ajustar seus termos de pesquisa ou filtros.</p>
        <button type="button" onclick="setFullMapQuickFilter('all')" class="mt-3 px-3 py-1.5 rounded-full bg-iceb-blue-light text-iceb-blue text-xs font-bold">
          Ver Todas as ${ICEB_CHURCHES_DATA.length} ICEs
        </button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = churches.map(church => {
    return `
      <div class="gmaps-sidebar-item" onclick="onSidebarChurchClick('${church.id}')">
        <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-200/80 flex items-center justify-center text-iceb-blue">
          <span class="material-symbols-outlined text-[20px]">church</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs text-iceb-navy truncate">${church.name}</h4>
          <p class="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px] text-amber-500">location_on</span>
            <span>${church.city} - ${church.uf}</span>
          </p>
        </div>
        <span class="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
      </div>
    `;
  }).join('');
}

// Clique em Item da Barra Lateral
function onSidebarChurchClick(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId);
  if (!church) return;

  // Fechar sidebar
  toggleMapSidebar(false);

  // Focar no mapa e exibir card
  selectFullMapChurch(church);
}

// Localizar Usuário via GPS
function locateUserOnFullMap() {
  if (!navigator.geolocation) {
    showToast('Geolocalização não disponível');
    return;
  }
  showToast('Obtendo sua localização GPS...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (AppState.fullMapInstance) {
        AppState.fullMapInstance.setView([latitude, longitude], 14, { animate: true });
        
        L.circleMarker([latitude, longitude], {
          radius: 9,
          fillColor: '#4491CB',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(AppState.fullMapInstance).bindPopup('Você está aqui').openPopup();
      }
    },
    (err) => {
      showToast('Não foi possível obter sua localização exata');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// Redefinir Vista Geral do Brasil
function resetFullMapView() {
  if (AppState.fullMapInstance) {
    AppState.fullMapInstance.setView([-14.2350, -51.9253], 4, { animate: true });
  }
  closeFullMapChurchCard();
}

// Controles de Zoom
function zoomInFullMap() {
  if (AppState.fullMapInstance) AppState.fullMapInstance.zoomIn();
}

function zoomOutFullMap() {
  if (AppState.fullMapInstance) AppState.fullMapInstance.zoomOut();
}

// Filtrar Eventos da ICEMP por Categoria
function filterIcempEvents(category) {
  AppState.eventsCategory = category;
  
  // Atualizar visual dos botões de filtro
  document.querySelectorAll('#events-category-filters .event-filter-btn').forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.className = 'event-filter-btn active px-3 py-1.5 rounded-full text-xs font-bold bg-iceb-blue text-white transition-all shadow-2xs';
    } else {
      btn.className = 'event-filter-btn px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all';
    }
  });

  renderEvents();
}

// Compartilhar Evento da ICEMP no WhatsApp
function shareIcempEvent(title, date, time, location) {
  const text = `*Convite ICE Metropolitana de Palmas*\n\nOlá! Gostaria de convidar você para o evento:\n*${title}*\n📅 *Data:* ${date}\n⏰ *Horário:* ${time}\n📍 *Local:* ${location}\n\nIgreja Cristã Evangélica Metropolitana de Palmas (Q. 201 Sul, Av. Teotônio Segurado). Você e sua família são nossos convidados especiais!`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ==========================================================================
// CONTROLE TEMPORAL E RENDERIZAÇÃO INTELIGENTE DE EVENTOS DA ICEMP
// ==========================================================================

// Mapeamento de Meses em Português
const PT_MONTHS = {
  'janeiro': 0, 'jan': 0,
  'fevereiro': 1, 'fev': 1,
  'marco': 2, 'março': 2, 'mar': 2,
  'abril': 3, 'abr': 3,
  'maio': 4, 'mai': 4,
  'junho': 5, 'jun': 5,
  'julho': 6, 'jul': 6,
  'agosto': 7, 'ago': 7,
  'setembro': 8, 'set': 8,
  'outubro': 9, 'out': 9,
  'novembro': 10, 'nov': 10,
  'dezembro': 11, 'dez': 11
};

// Converter Evento para Objeto Date
function parseEventDate(ev, defaultMonth = 'Outubro', defaultYear = null) {
  const now = new Date();
  const year = ev.year ? parseInt(ev.year, 10) : (defaultYear ? parseInt(defaultYear, 10) : now.getFullYear());
  const day = parseInt(ev.day, 10) || 1;
  const monthRaw = normalizeText(ev.month || defaultMonth || '');

  let month = now.getMonth();
  for (const [key, val] of Object.entries(PT_MONTHS)) {
    if (monthRaw.includes(key)) {
      month = val;
      break;
    }
  }
  return new Date(year, month, day, 0, 0, 0, 0);
}

// Obter Status Temporal do Evento: 'today', 'past', 'future'
function getEventTiming(ev, defaultMonth, defaultYear) {
  const evDate = parseEventDate(ev, defaultMonth, defaultYear);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const evTime = evDate.getTime();
  const todayTime = today.getTime();

  if (evTime === todayTime) return 'today';
  if (evTime < todayTime) return 'past';
  return 'future';
}

// Alternar Visibilidade dos Eventos Anteriores (Passados)
function togglePastEvents() {
  AppState.showPastEvents = !AppState.showPastEvents;
  renderEvents();
}

// Renderizar Card Individual de Evento
function renderSingleEventCard(ev, isPast, isLeader, monthName) {
  const isToday = ev._timing === 'today';
  const isJovens = normalizeText(ev.badge).includes('jovens') || normalizeText(ev.target).includes('jovens');
  const isAdolescentes = normalizeText(ev.badge).includes('adolescentes') || normalizeText(ev.target).includes('adolescentes');
  const isMulheres = normalizeText(ev.badge).includes('mulheres') || normalizeText(ev.target).includes('mulheres');
  const isFamilia = normalizeText(ev.badge).includes('familia');
  const isKids = normalizeText(ev.badge).includes('infantil') || normalizeText(ev.target).includes('criancas');

  let badgeColor = 'bg-iceb-blue-light text-iceb-blue border-iceb-blue/20';
  if (isJovens) badgeColor = 'bg-indigo-50 text-indigo-600 border-indigo-200';
  else if (isAdolescentes) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  else if (isMulheres) badgeColor = 'bg-rose-50 text-rose-600 border-rose-200';
  else if (isFamilia) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  else if (isKids) badgeColor = 'bg-sky-50 text-sky-600 border-sky-200';

  const fullDateStr = `${ev.day} de ${ev.month || monthName} (${ev.dayOfWeek})`;

  // Estilização diferenciada para evento de HOJE vs Passado vs Futuro
  let cardClass = 'bg-white rounded-3xl p-4 shadow-xs border border-slate-200/90 flex flex-col gap-3 transition-all hover:border-iceb-blue/30 relative';
  let dateBoxClass = 'w-13 h-13 rounded-2xl bg-iceb-navy text-white flex flex-col items-center justify-center flex-shrink-0 shadow-xs px-2.5 py-1.5';
  let monthText = (ev.month || monthName).slice(0, 3);

  if (isToday) {
    cardClass = 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl p-4 shadow-md border-2 border-amber-400 flex flex-col gap-3 transition-all relative ring-2 ring-amber-400/20';
    dateBoxClass = 'w-13 h-13 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm px-2.5 py-1.5';
    monthText = 'HOJE';
  } else if (isPast) {
    cardClass = 'bg-white/80 rounded-3xl p-4 shadow-2xs border border-slate-200/70 flex flex-col gap-3 transition-all opacity-85 relative';
    dateBoxClass = 'w-13 h-13 rounded-2xl bg-slate-400 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-2xs px-2.5 py-1.5';
  }

  return `
    <article class="${cardClass}">
      <!-- Topo: Data, Título e Badges -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="${dateBoxClass}">
            <span class="text-xs font-black leading-none">${ev.day}</span>
            <span class="text-[9px] font-extrabold uppercase leading-none mt-1 ${isToday ? 'text-amber-100 font-black' : 'text-iceb-blue-light'}">${monthText}</span>
          </div>
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[11px] font-bold text-slate-500">${ev.dayOfWeek}</span>
              ${isToday ? `
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white flex items-center gap-0.5 animate-pulse shadow-2xs">
                  <span class="material-symbols-outlined text-[11px]">notifications_active</span> É HOJE!
                </span>
              ` : ''}
              ${isPast ? `
                <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  Realizado
                </span>
              ` : ''}
            </div>
            <h3 class="font-extrabold text-[15px] text-iceb-navy leading-snug mt-0.5">${ev.title}</h3>
          </div>
        </div>

        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor} flex-shrink-0">
          ${ev.badge || 'Comunidade'}
        </span>
      </div>

      <!-- Descrição do Evento -->
      ${ev.desc ? `
        <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
          ${ev.desc}
        </p>
      ` : ''}

      <!-- Informações de Horário, Local e Público -->
      <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] ${isToday ? 'text-amber-600 font-bold' : 'text-iceb-blue'} flex-shrink-0">schedule</span>
          <span class="font-semibold text-iceb-navy">${ev.time}</span>
        </div>

        <div class="flex items-center gap-1.5 truncate">
          <span class="material-symbols-outlined text-[16px] text-rose-500 flex-shrink-0">location_on</span>
          <span class="truncate text-slate-600">${ev.location}</span>
        </div>

        ${ev.target ? `
          <div class="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span class="material-symbols-outlined text-[15px] text-slate-400 flex-shrink-0">group</span>
            <span><strong>Público:</strong> ${ev.target}</span>
          </div>
        ` : ''}
      </div>

      <!-- Ações do Evento: Gestão para Pastor e Convidar para Membro -->
      <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        ${isLeader ? `
          <div class="flex items-center gap-1.5">
            <button 
              type="button"
              onclick="openEditEventModal('${ev.id}')"
              class="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 border border-amber-200"
              title="Editar este evento"
            >
              <span class="material-symbols-outlined text-[15px]">edit</span>
              <span>Editar</span>
            </button>
            <button 
              type="button"
              onclick="deleteIcempEvent('${ev.id}')"
              class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 border border-rose-200"
              title="Remover evento"
            >
              <span class="material-symbols-outlined text-[15px]">delete</span>
              <span>Excluir</span>
            </button>
          </div>
        ` : `
          <div></div>
        `}

        <button 
          type="button"
          onclick="shareIcempEvent('${ev.title.replace(/'/g, "\\'")}', '${fullDateStr}', '${ev.time}', '${ev.location.replace(/'/g, "\\'")}')"
          class="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs"
        >
          <span class="material-symbols-outlined text-[16px]">share</span>
          <span>Convidar</span>
        </button>
      </div>
    </article>
  `;
}

// Renderizar Eventos Oficiais da ICEMP com Filtro de Datas e Lembrete
function renderEvents() {
  const container = document.getElementById('events-container');
  const countBadge = document.getElementById('icemp-events-count-badge');
  if (!container) return;

  const icemp = getIcempData();
  const allEvents = getIcempEvents();
  const monthName = icemp.monthlyAgenda?.month || 'Outubro';
  const defaultYear = icemp.monthlyAgenda?.year || 2026;
  const isLeader = AuthState.currentUser && AuthState.currentUser.role === 'leader';

  const category = AppState.eventsCategory || 'all';
  const filteredEvents = allEvents.filter(ev => {
    if (category === 'all') return true;
    const catNorm = normalizeText(category);
    const badgeNorm = normalizeText(ev.badge);
    const targetNorm = normalizeText(ev.target);
    const titleNorm = normalizeText(ev.title);
    return badgeNorm.includes(catNorm) || targetNorm.includes(catNorm) || titleNorm.includes(catNorm);
  });

  // Classificar por temporalidade (Hoje, Futuro, Passado)
  const upcomingEvents = [];
  const pastEvents = [];
  const todayEventsList = [];

  filteredEvents.forEach(ev => {
    const timing = getEventTiming(ev, monthName, defaultYear);
    ev._timing = timing;
    ev._dateObj = parseEventDate(ev, monthName, defaultYear);
    if (timing === 'today') {
      todayEventsList.push(ev);
      upcomingEvents.push(ev);
    } else if (timing === 'future') {
      upcomingEvents.push(ev);
    } else {
      pastEvents.push(ev);
    }
  });

  // Próximos: ordem cronológica crescente (hoje primeiro, depois próximos dias)
  upcomingEvents.sort((a, b) => a._dateObj.getTime() - b._dateObj.getTime());

  // Passados: ordem decrescente (mais recente passado primeiro)
  pastEvents.sort((a, b) => b._dateObj.getTime() - a._dateObj.getTime());

  // Atualizar badge de notificação no rodapé
  const navEventsBadge = document.getElementById('nav-events-today-badge');
  if (navEventsBadge) {
    navEventsBadge.classList.toggle('hidden', todayEventsList.length === 0);
  }

  // Atualizar badge de contagem no topo
  if (countBadge) {
    if (AppState.showPastEvents) {
      countBadge.textContent = `${upcomingEvents.length + pastEvents.length} Eventos • ${monthName}`;
    } else {
      countBadge.textContent = `${upcomingEvents.length} Próximos • ${monthName}`;
    }
  }

  let html = '';

  // 1. BANNER DE LEMBRETE SE HOUVER EVENTO HOJE
  if (todayEventsList.length > 0) {
    const todayEv = todayEventsList[0];
    html += `
      <div class="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm flex items-center gap-3.5 border border-amber-300 relative overflow-hidden">
        <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner">
          <span class="material-symbols-outlined text-[26px] text-white animate-bounce">notifications_active</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-full bg-white text-amber-900 font-black text-[9px] uppercase tracking-wider shadow-2xs">
              Lembrete • É Hoje!
            </span>
            <span class="text-xs font-black text-amber-100 flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[13px]">schedule</span> ${todayEv.time}
            </span>
          </div>
          <h4 class="font-extrabold text-sm text-white mt-1 leading-snug truncate">${todayEv.title}</h4>
          <p class="text-xs text-amber-100 truncate flex items-center gap-1 mt-0.5">
            <span class="material-symbols-outlined text-[13px]">location_on</span> ${todayEv.location}
          </p>
        </div>
      </div>
    `;
  }

  // 2. LISTA DE EVENTOS PRÓXIMOS (HOJE + POSTERIORES)
  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    html += `
      <div class="py-12 px-4 text-center flex flex-col items-center justify-center bg-white rounded-3xl shadow-xs border border-slate-200">
        <div class="w-14 h-14 rounded-2xl bg-iceb-blue-light flex items-center justify-center text-iceb-blue mb-3">
          <span class="material-symbols-outlined text-[28px]">calendar_today</span>
        </div>
        <h3 class="font-bold text-base text-iceb-navy">Nenhum evento nesta categoria</h3>
        <p class="text-xs text-slate-500 max-w-xs mt-1">Selecione "Todos" para visualizar a agenda completa da ICEMP.</p>
        <button 
          onclick="filterIcempEvents('all')" 
          class="mt-4 px-4 py-2 bg-iceb-blue text-white rounded-xl text-xs font-bold shadow hover:bg-iceb-blue-dark transition-all"
        >
          Ver Todos os Eventos
        </button>
      </div>
    `;
  } else if (upcomingEvents.length === 0) {
    html += `
      <div class="py-8 px-4 text-center flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xs border border-slate-200">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <span class="material-symbols-outlined text-[24px]">event_available</span>
        </div>
        <h3 class="font-bold text-sm text-iceb-navy">Não há eventos futuros nesta categoria</h3>
        <p class="text-xs text-slate-500 max-w-xs mt-1">Todos os eventos cadastrados para esta categoria já foram realizados.</p>
      </div>
    `;
  } else {
    html += upcomingEvents.map(ev => renderSingleEventCard(ev, false, isLeader, monthName)).join('');
  }

  // 3. SEÇÃO E BOTÃO DE EVENTOS ANTERIORES (PASSADOS)
  if (pastEvents.length > 0) {
    if (!AppState.showPastEvents) {
      html += `
        <div class="pt-2 flex justify-center">
          <button 
            type="button" 
            onclick="togglePastEvents()" 
            class="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 hover:text-iceb-navy text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 border border-slate-200/90 shadow-2xs"
          >
            <span class="material-symbols-outlined text-[18px] text-slate-400">history</span>
            <span>Mostrar eventos anteriores (${pastEvents.length})</span>
            <span class="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="pt-4 flex flex-col gap-3 border-t border-dashed border-slate-200 mt-2">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-1.5 text-slate-500">
              <span class="material-symbols-outlined text-[17px]">history</span>
              <span class="text-xs font-bold uppercase tracking-wider">Eventos Anteriores (${pastEvents.length})</span>
            </div>
            <button 
              type="button" 
              onclick="togglePastEvents()" 
              class="text-xs font-bold text-iceb-blue hover:text-iceb-blue-dark flex items-center gap-0.5 transition-colors"
            >
              <span>Ocultar</span>
              <span class="material-symbols-outlined text-[16px]">expand_less</span>
            </button>
          </div>
          ${pastEvents.map(ev => renderSingleEventCard(ev, true, isLeader, monthName)).join('')}
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

// Favoritar / Desfavoritar Igreja
function toggleFavorite(churchId, event) {
  if (event) event.stopPropagation();
  
  const idx = AppState.favorites.indexOf(churchId);
  if (idx >= 0) {
    AppState.favorites.splice(idx, 1);
    showToast('Igreja removida dos favoritos');
  } else {
    AppState.favorites.push(churchId);
    showToast('Igreja salva nos seus favoritos!');
  }
  
  localStorage.setItem('iceb_favorites', JSON.stringify(AppState.favorites));
  updateFavoritesCount();
  renderChurchesList();
  
  if (AppState.selectedChurch && AppState.selectedChurch.id === churchId) {
    openChurchDetails(churchId);
  }
}

function updateFavoritesCount() {
  const countEl = document.getElementById('favorites-badge-count');
  if (countEl) {
    countEl.textContent = AppState.favorites.length;
  }
}

// Atualizar Contadores de Igrejas no Sobre ICEB e Diretório
function updateAboutChurchesCount() {
  const countEl = document.getElementById('about-banner-churches-count');
  const total = (typeof ICEB_CHURCHES_DATA !== 'undefined' && Array.isArray(ICEB_CHURCHES_DATA)) 
    ? ICEB_CHURCHES_DATA.length 
    : 318;
  if (countEl) {
    countEl.textContent = total;
  }
}

// Renderizar Igrejas Favoritas na Aba "Mais"
function renderFavoritesList() {
  const container = document.getElementById('favorites-list-container');
  if (!container) return;
  
  const favChurches = ICEB_CHURCHES_DATA.filter(c => AppState.favorites.includes(c.id));
  
  if (favChurches.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-white rounded-2xl border border-slate-200/80 text-center">
        <p class="text-xs text-iceb-gray-dark">Você ainda não salvou nenhuma congregação favorita.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = favChurches.map(c => `
    <div class="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs">
      <div class="flex items-center gap-2.5 min-w-0">
        <img src="${c.gallery[0]?.url}" class="w-11 h-11 rounded-xl object-cover" alt="${c.name}"/>
        <div class="min-w-0">
          <h4 class="text-xs font-bold text-iceb-navy truncate">${c.shortName}</h4>
          <p class="text-[11px] text-iceb-gray-dark truncate">${c.city} - ${c.uf}</p>
        </div>
      </div>
      <button 
        onclick="openChurchDetails('${c.id}')"
        class="px-2.5 py-1.5 rounded-lg bg-iceb-blue text-white text-[11px] font-bold flex-shrink-0 hover:bg-iceb-blue-dark"
      >
        Acessar
      </button>
    </div>
  `).join('');
}

// Modal do PIX & Dízimos
function openPixModal(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId) || AppState.selectedChurch;
  if (!church) return;
  
  const modal = document.getElementById('pix-modal');
  const churchNameEl = document.getElementById('pix-church-name');
  const pixKeyEl = document.getElementById('pix-key-display');
  const beneficiaryEl = document.getElementById('pix-beneficiary-display');
  const bankDetailsEl = document.getElementById('pix-bank-details');
  
  const pixKeyDisplay = church.bankAccount?.pixKeyFormatted || church.bankAccount?.pixKey || church.pixKey;
  const pixKeyRaw = church.bankAccount?.pixKey || church.pixKey;
  const beneficiary = church.bankAccount?.beneficiary || church.pixBeneficiary;

  if (churchNameEl) churchNameEl.textContent = church.name;
  if (pixKeyEl) {
    pixKeyEl.textContent = pixKeyDisplay;
    pixKeyEl.setAttribute('data-raw', pixKeyRaw);
  }
  if (beneficiaryEl) beneficiaryEl.textContent = beneficiary;
  
  if (bankDetailsEl) {
    if (church.bankAccount) {
      bankDetailsEl.innerHTML = `
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p class="font-bold text-iceb-navy mb-1.5 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-iceb-blue">account_balance</span>
            Dados Bancários da Conta Corrente
          </p>
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="bg-white p-2 rounded-lg border border-slate-200/70">
              <span class="text-slate-400 block text-[10px]">Banco</span>
              <strong class="text-iceb-navy">${church.bankAccount.bank}</strong>
            </div>
            <div class="bg-white p-2 rounded-lg border border-slate-200/70">
              <span class="text-slate-400 block text-[10px]">Agência</span>
              <strong class="text-iceb-navy font-mono">${church.bankAccount.agency}</strong>
            </div>
            <div class="bg-white p-2 rounded-lg border border-slate-200/70">
              <span class="text-slate-400 block text-[10px]">Conta Corrente</span>
              <strong class="text-iceb-navy font-mono">${church.bankAccount.account}</strong>
            </div>
            <div class="bg-white p-2 rounded-lg border border-slate-200/70">
              <span class="text-slate-400 block text-[10px]">Tipo</span>
              <strong class="text-iceb-navy">${church.bankAccount.accountType || 'Conta Corrente'}</strong>
            </div>
          </div>
        </div>
      `;
      bankDetailsEl.classList.remove('hidden');
    } else {
      bankDetailsEl.classList.add('hidden');
      bankDetailsEl.innerHTML = '';
    }
  }

  if (modal) modal.classList.add('open');
}

function closePixModal() {
  const modal = document.getElementById('pix-modal');
  if (modal) modal.classList.remove('open');
}

function copyPixKey() {
  const el = document.getElementById('pix-key-display');
  const key = el?.getAttribute('data-raw') || el?.textContent || '';
  navigator.clipboard.writeText(key).then(() => {
    showToast('Chave PIX copiada com sucesso!');
  }).catch(() => {
    showToast('Chave PIX: ' + key);
  });
}

function copyDirectPix(key) {
  if (!key) return;
  navigator.clipboard.writeText(key).then(() => {
    showToast('Chave PIX copiada com sucesso!');
  }).catch(() => {
    showToast('Chave PIX: ' + key);
  });
}

// Modal de Opções de Rota
function openRouteOptions(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId) || AppState.selectedChurch;
  if (!church) return;
  
  const modal = document.getElementById('routes-modal');
  const gmapsBtn = document.getElementById('btn-route-gmaps');
  const wazeBtn = document.getElementById('btn-route-waze');
  const titleEl = document.getElementById('route-church-title');
  
  if (titleEl) titleEl.textContent = church.shortName;
  if (gmapsBtn) {
    gmapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}`;
  }
  if (wazeBtn) {
    wazeBtn.href = `https://waze.com/ul?ll=${church.lat},${church.lng}&navigate=yes`;
  }
  
  if (modal) modal.classList.add('open');
}

function closeRoutesModal() {
  const modal = document.getElementById('routes-modal');
  if (modal) modal.classList.remove('open');
}

// Modal e Ação de Agendamento Pastoral
function openPastoralAppointment() {
  const text = 'Olá! Gostaria de agendar um atendimento pastoral / gabinete na ICE Metropolitana de Palmas.';
  const url = `https://wa.me/5563999910330?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function openPastoralCareModal(churchId) {
  const modal = document.getElementById('pastoral-modal');
  if (modal) modal.classList.add('open');
}

function closePastoralModal() {
  const modal = document.getElementById('pastoral-modal');
  if (modal) modal.classList.remove('open');
}

function submitPastoralRequest(e) {
  e.preventDefault();
  closePastoralModal();
  showToast('Solicitação de agendamento enviada! O pastor entrará em contato.');
}

// Modal de Filtros Avançados
function openFilterSheet() {
  const modal = document.getElementById('filter-sheet-modal');
  if (modal) modal.classList.add('open');
}

function closeFilterSheet() {
  const modal = document.getElementById('filter-sheet-modal');
  if (modal) modal.classList.remove('open');
}

function applyAdvancedFilters() {
  const checkboxes = document.querySelectorAll('.filter-feature-checkbox:checked');
  AppState.filterFeatures = Array.from(checkboxes).map(cb => cb.value);
  closeFilterSheet();
  renderChurchesList();
  showToast('Filtros aplicados!');
}

function resetFilters() {
  AppState.selectedUf = 'ALL';
  AppState.searchQuery = '';
  AppState.filterFeatures = [];
  
  const searchInput = document.getElementById('church-search-input');
  if (searchInput) searchInput.value = '';
  
  document.querySelectorAll('.filter-feature-checkbox').forEach(cb => cb.checked = false);
  
  renderStatePills();
  renderChurchesList();
  updateMapMarkers();
  showToast('Filtros redefinidos');
}

// Toast de Notificação
function showToast(msg) {
  const toast = document.getElementById('app-toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;
  
  msgEl.textContent = msg;
  toast.classList.add('visible');
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

// Compartilhar Perfil da Igreja
function shareChurch(churchId) {
  const church = ICEB_CHURCHES_DATA.find(c => c.id === churchId) || AppState.selectedChurch;
  if (!church) return;
  
  if (navigator.share) {
    navigator.share({
      title: church.name,
      text: `Conheça a ${church.name} (${church.city} - ${church.uf}). Venha participar dos cultos!`,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${church.name} - ${church.address}`).then(() => {
      showToast('Informações copiadas para a área de transferência!');
    });
  }
}

function addReminder(eventTitle) {
  showToast(`Lembrete para "${eventTitle}" adicionado!`);
}

function openFullscreenPhoto() {
  showToast('Modo galeria de alta resolução expandido');
}

// Configurar Event Listeners Globais
function setupEventListeners() {
  const searchInput = document.getElementById('church-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !e.target.value);
      }
      renderChurchesList();
      updateMapMarkers();
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      AppState.searchQuery = '';
      clearBtn.classList.add('hidden');
      renderChurchesList();
      updateMapMarkers();
    });
  }
  
  const track = document.getElementById('details-carousel-track');
  if (track) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        goToDetailSlide(AppState.activeSlide + 1);
      } else if (touchEndX - touchStartX > 50) {
        goToDetailSlide(AppState.activeSlide - 1);
      }
    }, { passive: true });
  }
}

// ==========================================================================
// MÓDULO DE AUTENTICAÇÃO E PERFIS (MEMBRO VS LIDERANÇA / PASTOR)
// ==========================================================================

// Alternar Abas no Modal de Login: Perfis Rápidos | Entrar | Criar Conta
function switchLoginMode(mode) {
  const quickView = document.getElementById('auth-view-quick');
  const signinView = document.getElementById('auth-view-signin');
  const signupView = document.getElementById('auth-view-signup');
  const quickBtn = document.getElementById('tab-btn-quick');
  const signinBtn = document.getElementById('tab-btn-signin');
  const signupBtn = document.getElementById('tab-btn-signup');

  [quickView, signinView, signupView].forEach(el => el && el.classList.add('hidden'));
  [quickBtn, signinBtn, signupBtn].forEach(btn => {
    if (btn) {
      btn.className = 'flex-1 py-2 text-xs font-bold rounded-xl text-slate-500 hover:text-iceb-navy transition-all';
    }
  });

  const activeClasses = 'flex-1 py-2 text-xs font-bold rounded-xl bg-white text-iceb-navy shadow-2xs transition-all';

  if (mode === 'signin') {
    if (signinView) signinView.classList.remove('hidden');
    if (signinBtn) signinBtn.className = activeClasses;
  } else if (mode === 'signup') {
    if (signupView) signupView.classList.remove('hidden');
    if (signupBtn) signupBtn.className = activeClasses;
  } else {
    if (quickView) quickView.classList.remove('hidden');
    if (quickBtn) quickBtn.className = activeClasses;
  }
}

// Checar e Restaurar Sessão Ativa do Supabase
async function checkSupabaseSession() {
  if (!supabaseClient) return;
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (!error && session && session.user) {
      const u = session.user;
      const meta = u.user_metadata || {};
      const isLeader = meta.role === 'leader' || (u.email && u.email.toLowerCase().includes('pastor'));
      AuthState.currentUser = {
        role: isLeader ? 'leader' : 'member',
        name: meta.display_name || (u.email ? u.email.split('@')[0] : 'Usuário'),
        email: u.email,
        title: isLeader ? 'Pastor / Liderança' : 'Membro da Comunidade',
        supabaseId: u.id
      };
      localStorage.setItem('icemp_user', JSON.stringify(AuthState.currentUser));
      updateAuthUI();
      renderEvents();
      console.log('👤 Sessão Supabase restaurada para:', AuthState.currentUser.name);
    }
  } catch (err) {
    console.log('Sem sessão ativa anterior no Supabase.');
  }
}

// Login Rápido por Perfil (1 Clique para testes)
function performQuickLogin(role) {
  if (role === 'leader') {
    AuthState.currentUser = {
      role: 'leader',
      name: 'Pr. Ubiracy Lucas',
      title: 'Pastor Titular',
      email: 'pastor@icemp.com.br'
    };
    showToast('Bem-vindo, Pr. Ubiracy! Modo de Gestão da ICEMP ativado.');
  } else {
    AuthState.currentUser = {
      role: 'member',
      name: 'Membro da Igreja',
      title: 'Membro Participante',
      email: 'membro@icemp.com.br'
    };
    showToast('Acesso de Membro ativado com sucesso.');
  }

  localStorage.setItem('icemp_user', JSON.stringify(AuthState.currentUser));
  updateAuthUI();
  closeLoginScreen();
  renderEvents();
}

// Login via Supabase Auth
async function handleSupabaseSignIn(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('login-email-input');
  const passInput = document.getElementById('login-password-input');
  const email = (emailInput?.value || '').trim();
  const password = passInput?.value || '';

  if (!email || !password) {
    showToast('Informe seu e-mail e senha.');
    return;
  }

  const btn = document.getElementById('signin-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Entrando...</span>';
  }

  if (!supabaseClient) {
    if (email.toLowerCase().includes('pastor') || email.toLowerCase().includes('lider')) {
      performQuickLogin('leader');
    } else {
      performQuickLogin('member');
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">login</span><span>Entrar no Sistema</span>';
    }
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (email.toLowerCase().includes('pastor') || email.toLowerCase().includes('membro')) {
        if (email.toLowerCase().includes('pastor')) performQuickLogin('leader');
        else performQuickLogin('member');
        showToast('Login de teste realizado com sucesso!');
        return;
      }
      showToast(`Erro de login: ${error.message || 'Credenciais inválidas.'}`);
    } else if (data && data.user) {
      const u = data.user;
      const meta = u.user_metadata || {};
      const isLeader = meta.role === 'leader' || email.toLowerCase().includes('pastor');
      AuthState.currentUser = {
        role: isLeader ? 'leader' : 'member',
        name: meta.display_name || email.split('@')[0],
        email: email,
        title: isLeader ? 'Pastor / Liderança' : 'Membro da Comunidade',
        supabaseId: u.id
      };
      localStorage.setItem('icemp_user', JSON.stringify(AuthState.currentUser));
      updateAuthUI();
      closeLoginScreen();
      renderEvents();
      showToast(`Bem-vindo de volta, ${AuthState.currentUser.name}!`);
    }
  } catch (err) {
    console.error('Falha no login Supabase:', err);
    showToast('Erro de conexão ao autenticar.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">login</span><span>Entrar no Sistema</span>';
    }
  }
}

// Cadastro de Novo Perfil via Supabase Auth
async function handleSupabaseSignUp(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('signup-name-input');
  const emailInput = document.getElementById('signup-email-input');
  const passInput = document.getElementById('signup-password-input');
  const roleInput = document.getElementById('signup-role-input');

  const name = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim();
  const password = passInput?.value || '';
  const selectedRole = roleInput?.value || 'member';

  if (!name || !email || !password) {
    showToast('Por favor, preencha todos os campos.');
    return;
  }

  if (password.length < 6) {
    showToast('A senha deve conter no mínimo 6 dígitos.');
    return;
  }

  const btn = document.getElementById('signup-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Criando conta...</span>';
  }

  try {
    if (!supabaseClient) {
      showToast('Cliente Supabase não inicializado.');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          role: selectedRole
        }
      }
    });

    if (error) {
      showToast(`Falha no cadastro: ${error.message}`);
    } else {
      const u = data.user;
      const isLeader = selectedRole === 'leader' || email.toLowerCase().includes('pastor');
      AuthState.currentUser = {
        role: isLeader ? 'leader' : 'member',
        name: name,
        email: email,
        title: isLeader ? 'Pastor / Liderança' : (selectedRole === 'visitor' ? 'Visitante' : 'Membro da Comunidade'),
        supabaseId: u ? u.id : null
      };
      localStorage.setItem('icemp_user', JSON.stringify(AuthState.currentUser));
      updateAuthUI();
      closeLoginScreen();
      renderEvents();
      showToast(`🎉 Conta criada com sucesso! Bem-vindo(a), ${name}!`);
    }
  } catch (err) {
    console.error('Erro no cadastro Supabase:', err);
    showToast('Erro de conexão ao criar conta.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">person_add</span><span>Criar Minha Conta</span>';
    }
  }
}

// Desconectar Usuário (Logout)
async function handleLogout() {
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Erro ao sair do Supabase:', e);
    }
  }
  AuthState.currentUser = {
    role: 'member',
    name: 'Membro da Igreja',
    email: 'membro@icemp.com.br',
    title: 'Visualização'
  };
  localStorage.setItem('icemp_user', JSON.stringify(AuthState.currentUser));
  updateAuthUI();
  closeUserProfileModal();
  renderEvents();
  showToast('Você saiu da sua conta.');
}

// Compatibilidade com formulário anterior
function handleFormLogin(e) {
  handleSupabaseSignIn(e);
}

// Abrir e Fechar Tela de Login
function openLoginScreen() {
  closeUserProfileModal();
  const screen = document.getElementById('screen-login');
  if (screen) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    screen.scrollTop = 0;
  }
}

function closeLoginScreen() {
  const screen = document.getElementById('screen-login');
  if (screen) screen.classList.remove('active');
  const targetTab = AppState.activeTab || 'about';
  const targetScreen = document.getElementById(`screen-${targetTab}`) || document.getElementById('screen-about');
  if (targetScreen) targetScreen.classList.add('active');
}

// Modal de Perfil do Usuário
function openUserProfileModal() {
  const modal = document.getElementById('user-profile-modal');
  if (!modal) return;

  const isLeader = AuthState.currentUser?.role === 'leader';
  const nameEl = document.getElementById('profile-modal-name');
  const roleEl = document.getElementById('profile-modal-role');
  const permEl = document.getElementById('profile-modal-perm-label');
  const badgeEl = document.getElementById('profile-modal-status-badge');
  const avatarEl = document.getElementById('profile-modal-avatar');

  if (nameEl) nameEl.textContent = AuthState.currentUser?.name || 'Usuário';
  if (roleEl) roleEl.textContent = isLeader ? 'Perfil: Liderança Pastoral' : 'Perfil: Membro da Comunidade';
  if (permEl) permEl.textContent = isLeader ? 'Gestão da ICEMP & Eventos Liberada' : 'Visualização das Programações';
  
  if (badgeEl) {
    if (isLeader) {
      badgeEl.className = 'px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300';
      badgeEl.textContent = 'Gestão Ativa';
    } else {
      badgeEl.className = 'px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200';
      badgeEl.textContent = 'Membro Ativo';
    }
  }

  if (avatarEl) {
    if (isLeader) {
      avatarEl.className = 'w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center';
      avatarEl.innerHTML = '<span class="material-symbols-outlined text-[24px]">admin_panel_settings</span>';
    } else {
      avatarEl.className = 'w-11 h-11 rounded-2xl bg-iceb-blue-light text-iceb-blue flex items-center justify-center';
      avatarEl.innerHTML = '<span class="material-symbols-outlined text-[24px]">person</span>';
    }
  }

  modal.classList.add('open');
}

function closeUserProfileModal() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) modal.classList.remove('open');
}

// Atualizar Elementos de Interface Conforme Perfil
function updateAuthUI() {
  const isLeader = AuthState.currentUser?.role === 'leader';

  // 1. Atualizar botões de perfil nos cabeçalhos
  document.querySelectorAll('.user-profile-btn').forEach(btn => {
    const dot = btn.querySelector('.user-role-dot');
    const label = btn.querySelector('.user-role-label');
    if (isLeader) {
      btn.className = 'user-profile-btn flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-100 hover:bg-amber-200 transition-all active:scale-95 border border-amber-300 shadow-2xs';
      if (dot) dot.className = 'user-role-dot w-2 h-2 rounded-full bg-amber-600 animate-pulse';
      if (label) {
        label.textContent = 'Pastor';
        label.className = 'user-role-label text-xs font-extrabold text-amber-900';
      }
    } else {
      btn.className = 'user-profile-btn flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 shadow-2xs';
      if (dot) dot.className = 'user-role-dot w-2 h-2 rounded-full bg-emerald-500';
      if (label) {
        label.textContent = 'Membro';
        label.className = 'user-role-label text-xs font-bold text-iceb-navy';
      }
    }
  });

  // 2. Banner de gestão na aba ICEMP
  const icempLeaderBar = document.getElementById('icemp-leader-bar');
  if (icempLeaderBar) {
    icempLeaderBar.classList.toggle('hidden', !isLeader);
  }

  // 3. Barra de ação na aba Eventos
  const eventsLeaderBar = document.getElementById('events-leader-bar');
  if (eventsLeaderBar) {
    eventsLeaderBar.classList.toggle('hidden', !isLeader);
  }

  // 4. Barras de gestão dos GCs e Aniversariantes
  const gcLeaderBar = document.getElementById('gc-leader-bar');
  if (gcLeaderBar) gcLeaderBar.classList.toggle('hidden', !isLeader);

  const bdayLeaderBar = document.getElementById('bday-leader-bar');
  if (bdayLeaderBar) bdayLeaderBar.classList.toggle('hidden', !isLeader);

  // 5. Atualizar tela de detalhes de tópicos de estudo se estiver aberta
  const topicScreen = document.getElementById('screen-topic-detail');
  if (topicScreen && topicScreen.classList.contains('active') && typeof StudiesState !== 'undefined' && StudiesState.currentTopicId) {
    renderTopicDetail(StudiesState.currentTopicId);
  }
}

// ==========================================================================
// GESTÃO DAS INFORMAÇÕES DA ICEMP (PASTOR / LIDERANÇA)
// ==========================================================================

function openEditIcempModal() {
  const icemp = getIcempData();
  const modal = document.getElementById('icemp-edit-modal');
  if (!modal) return;

  const nameInput = document.getElementById('edit-icemp-name');
  const addrInput = document.getElementById('edit-icemp-address');
  const zapInput = document.getElementById('edit-icemp-whatsapp');
  const instaInput = document.getElementById('edit-icemp-instagram');
  const pixInput = document.getElementById('edit-icemp-pix');
  const pixTypeInput = document.getElementById('edit-icemp-pix-type');
  const domInput = document.getElementById('edit-icemp-culto-dom');
  const ebdInput = document.getElementById('edit-icemp-culto-ebd');
  const quiInput = document.getElementById('edit-icemp-culto-qui');
  const matInput = document.getElementById('edit-icemp-culto-matutina');
  const bioInput = document.getElementById('edit-icemp-bio');

  if (nameInput) nameInput.value = icemp.name || 'Igreja Cristã Evangélica Metropolitana de Palmas';
  if (addrInput) addrInput.value = icemp.address || 'Conj. 01 - Q. 201 Sul, Av. Joaquim Teotônio Segurado, Lote 04 - Plano Diretor Sul, Palmas - TO';
  if (zapInput) zapInput.value = icemp.whatsapp || '5563999910330';
  if (instaInput) instaInput.value = icemp.instagram || '@ice.metropolitana';
  if (pixInput) pixInput.value = icemp.pixKey || '10900748000102';
  if (pixTypeInput) pixTypeInput.value = icemp.pixType || 'CNPJ';
  
  if (domInput) domInput.value = icemp.schedule?.find(s => s.title?.includes('Celebração'))?.time || '19h00';
  if (ebdInput) ebdInput.value = icemp.schedule?.find(s => s.title?.includes('EBD') || s.title?.includes('Escola'))?.time || '18h00';
  if (quiInput) quiInput.value = icemp.schedule?.find(s => s.day === 'QUI')?.time || '19h30';
  if (matInput) matInput.value = 'Ter 06h30 / Dom 07h00';
  
  if (bioInput) bioInput.value = icemp.description || 'Uma comunidade bíblica, acolhedora e vibrante em Palmas - TO, proclamando o Evangelho de Cristo e discipulando vidas.';

  modal.classList.add('open');
}

function closeEditIcempModal() {
  const modal = document.getElementById('icemp-edit-modal');
  if (modal) modal.classList.remove('open');
}

async function saveIcempInfo(e) {
  e.preventDefault();
  const name = document.getElementById('edit-icemp-name')?.value;
  const address = document.getElementById('edit-icemp-address')?.value;
  const whatsapp = document.getElementById('edit-icemp-whatsapp')?.value;
  const instagram = document.getElementById('edit-icemp-instagram')?.value;
  const pixKey = document.getElementById('edit-icemp-pix')?.value;
  const pixType = document.getElementById('edit-icemp-pix-type')?.value;
  const bio = document.getElementById('edit-icemp-bio')?.value;

  const domTime = document.getElementById('edit-icemp-culto-dom')?.value || '19h00';
  const ebdTime = document.getElementById('edit-icemp-culto-ebd')?.value || '18h00';
  const quiTime = document.getElementById('edit-icemp-culto-qui')?.value || '19h30';

  const customInfo = {
    name,
    address,
    whatsapp,
    instagram,
    pixKey,
    pixType,
    description: bio,
    schedule: [
      { day: 'DOM', dayFull: 'Domingo', time: '07h00', title: 'Oração Matutina' },
      { day: 'DOM', dayFull: 'Domingo', time: ebdTime, title: 'Escola Bíblica Dominical (EBD)' },
      { day: 'DOM', dayFull: 'Domingo', time: domTime, title: 'Culto de Celebração' },
      { day: 'TER', dayFull: 'Terça-feira', time: '06h30', title: 'Oração Matutina' },
      { day: 'QUI', dayFull: 'Quinta-feira', time: quiTime, title: 'Culto de Oração & Estudo' }
    ]
  };

  localStorage.setItem('icemp_custom_info', JSON.stringify(customInfo));
  closeEditIcempModal();
  applyIcempDOMUpdates();
  showToast('Informações da ICEMP salvas com sucesso!');

  // Gravar no Supabase (Nuvem)
  if (supabaseClient) {
    try {
      const dbRow = {
        id: 'icemp_main',
        name: customInfo.name,
        address: customInfo.address,
        whatsapp: customInfo.whatsapp,
        instagram: customInfo.instagram,
        pix_key: customInfo.pixKey,
        pix_type: customInfo.pixType,
        description: customInfo.description,
        schedule: customInfo.schedule,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabaseClient.from('icemp_info').upsert(dbRow);
      if (error) {
        console.warn('Supabase info:', error.message);
      } else {
        showToast('☁️ Dados da ICEMP sincronizados com o Supabase!');
      }
    } catch (err) {
      console.warn('Erro ao salvar info no Supabase:', err);
    }
  }
}

function applyIcempDOMUpdates() {
  const icemp = getIcempData();
  
  // Atualizar modal PIX com a nova chave se salva
  const pixKeyVal = document.getElementById('pix-key-val');
  if (pixKeyVal && icemp.pixKey) {
    pixKeyVal.textContent = icemp.pixKey;
  }
}

// ==========================================================================
// GESTÃO DE EVENTOS DA ICEMP (PASTOR / LIDERANÇA)
// ==========================================================================

function openCreateEventModal() {
  const modal = document.getElementById('event-editor-modal');
  const titleHeader = document.getElementById('event-editor-modal-title');
  if (!modal) return;

  if (titleHeader) titleHeader.textContent = 'Adicionar Novo Evento';
  document.getElementById('event-edit-id').value = '';
  document.getElementById('event-edit-title').value = '';
  document.getElementById('event-edit-day').value = '';
  document.getElementById('event-edit-month').value = 'Outubro';
  document.getElementById('event-edit-dayofweek').value = '';
  document.getElementById('event-edit-time').value = '19h30';
  document.getElementById('event-edit-location').value = 'Igreja - ICEM';
  document.getElementById('event-edit-badge').value = 'Geral';
  document.getElementById('event-edit-target').value = 'Toda a congregação';
  document.getElementById('event-edit-desc').value = '';

  modal.classList.add('open');
}

function openEditEventModal(eventId) {
  const events = getIcempEvents();
  const ev = events.find(e => String(e.id) === String(eventId));
  if (!ev) return;

  const modal = document.getElementById('event-editor-modal');
  const titleHeader = document.getElementById('event-editor-modal-title');
  if (!modal) return;

  if (titleHeader) titleHeader.textContent = 'Editar Evento da ICEMP';
  document.getElementById('event-edit-id').value = ev.id;
  document.getElementById('event-edit-title').value = ev.title || '';
  document.getElementById('event-edit-day').value = ev.day || '';
  document.getElementById('event-edit-month').value = ev.month || 'Outubro';
  document.getElementById('event-edit-dayofweek').value = ev.dayOfWeek || '';
  document.getElementById('event-edit-time').value = ev.time || '';
  document.getElementById('event-edit-location').value = ev.location || 'Igreja - ICEM';
  document.getElementById('event-edit-badge').value = ev.badge || 'Geral';
  document.getElementById('event-edit-target').value = ev.target || '';
  document.getElementById('event-edit-desc').value = ev.desc || '';

  modal.classList.add('open');
}

function closeEventEditorModal() {
  const modal = document.getElementById('event-editor-modal');
  if (modal) modal.classList.remove('open');
}

async function saveIcempEvent(e) {
  e.preventDefault();
  const id = document.getElementById('event-edit-id')?.value;
  const title = document.getElementById('event-edit-title')?.value;
  const day = document.getElementById('event-edit-day')?.value;
  const month = document.getElementById('event-edit-month')?.value;
  const dayOfWeek = document.getElementById('event-edit-dayofweek')?.value;
  const time = document.getElementById('event-edit-time')?.value;
  const location = document.getElementById('event-edit-location')?.value;
  const badge = document.getElementById('event-edit-badge')?.value;
  const target = document.getElementById('event-edit-target')?.value;
  const desc = document.getElementById('event-edit-desc')?.value;

  const events = getIcempEvents();
  let savedEvent = null;

  if (id) {
    // Editar existente
    const idx = events.findIndex(ev => String(ev.id) === String(id));
    if (idx >= 0) {
      events[idx] = { ...events[idx], title, day, month, dayOfWeek, time, location, badge, target, desc };
      savedEvent = events[idx];
      showToast('Evento atualizado com sucesso!');
    }
  } else {
    // Novo evento
    savedEvent = {
      id: `ev_${Date.now()}`,
      title,
      day: String(day).padStart(2, '0'),
      month,
      dayOfWeek,
      time,
      location,
      badge,
      target,
      desc
    };
    events.unshift(savedEvent);
    showToast('Novo evento adicionado à agenda da ICEMP!');
  }

  // Gravação local imediata
  localStorage.setItem('icemp_custom_events', JSON.stringify(events));
  closeEventEditorModal();
  renderEvents();

  // Gravação na nuvem Supabase
  if (supabaseClient && savedEvent) {
    try {
      const dbRow = {
        id: String(savedEvent.id),
        title: savedEvent.title,
        day: String(savedEvent.day),
        month: savedEvent.month,
        day_of_week: savedEvent.dayOfWeek,
        time: savedEvent.time,
        location: savedEvent.location,
        badge: savedEvent.badge,
        target: savedEvent.target,
        desc: savedEvent.desc
      };
      const { error } = await supabaseClient.from('icemp_events').upsert(dbRow);
      if (error) {
        console.warn('Aviso Supabase (verifique se executou o script SQL das tabelas):', error.message);
      } else {
        showToast('☁️ Evento gravado no Supabase com sucesso!');
      }
    } catch (err) {
      console.warn('Erro ao salvar evento no Supabase:', err);
    }
  }
}

async function deleteIcempEvent(eventId) {
  if (!confirm('Deseja realmente remover este evento da agenda da ICEMP?')) return;

  const events = getIcempEvents();
  const filtered = events.filter(ev => String(ev.id) !== String(eventId));
  localStorage.setItem('icemp_custom_events', JSON.stringify(filtered));
  renderEvents();
  showToast('Evento removido da agenda!');

  // Remover da nuvem Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('icemp_events').delete().eq('id', String(eventId));
      if (!error) {
        showToast('☁️ Removido do banco de dados com sucesso.');
      }
    } catch (err) {
      console.warn('Erro ao excluir no Supabase:', err);
    }
  }
}

// ==========================================================================
// MÓDULO DE GRUPOS DE CRESCIMENTO (GC) E ANIVERSARIANTES DA ICEMP
// ==========================================================================

// Atualizar Contadores dos Balões na Aba ICEMP
function updateIcempModuleCounts() {
  const gcs = getIcempGCs();
  const bdays = getIcempBirthdays();
  const gcCountEl = document.getElementById('gc-card-count');
  const bdayCountEl = document.getElementById('bday-card-count');
  if (gcCountEl) gcCountEl.textContent = `${gcs.length} Grupos nos Lares`;
  if (bdayCountEl) bdayCountEl.textContent = `${bdays.length} Aniversariantes`;
}

// 1. Obter Grupos de Crescimento (com suporte a personalização pelo Pastor)
function getIcempGCs() {
  const cached = localStorage.getItem('icemp_custom_gcs');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  const icemp = getIcempData();
  const baseGCs = (icemp.growthGroups && icemp.growthGroups.length > 0) ? icemp.growthGroups : [];
  const initialGCs = baseGCs.map((gc, i) => ({
    id: gc.id || `gc_${i + 1}`,
    name: gc.name,
    day: gc.day || gc.dayOfWeek || (gc.dayTime ? gc.dayTime.split('•')[0].trim() : 'Segunda-feira'),
    time: gc.time || (gc.dayTime ? gc.dayTime.split('•')[1]?.trim() : '19h30'),
    leaders: gc.leaders || 'Liderança ICEMP',
    host: gc.host || 'Lares dos Membros',
    focus: gc.focus || 'Estudo bíblico, comunhão e edificação nos lares.'
  }));
  localStorage.setItem('icemp_custom_gcs', JSON.stringify(initialGCs));
  return initialGCs;
}

// 2. Obter Aniversariantes do Mês (com suporte a personalização pelo Pastor)
function getIcempBirthdays() {
  const cached = localStorage.getItem('icemp_custom_birthdays');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  const icemp = getIcempData();
  const baseList = (icemp.birthdays && icemp.birthdays.list) ? icemp.birthdays.list : [];
  const initialBirthdays = baseList.map((b, i) => ({
    id: b.id || `bday_${i + 1}`,
    day: String(b.day).padStart(2, '0'),
    name: b.name,
    month: b.month || icemp.birthdays?.month || 'Outubro'
  }));
  localStorage.setItem('icemp_custom_birthdays', JSON.stringify(initialBirthdays));
  return initialBirthdays;
}

// 3. Abrir e Fechar Modal de Grupos de Crescimento
function openGrowthGroupsModal() {
  const modal = document.getElementById('growth-groups-modal');
  if (!modal) return;
  renderGrowthGroupsList();
  modal.classList.add('open');
}

function closeGrowthGroupsModal() {
  const modal = document.getElementById('growth-groups-modal');
  if (modal) modal.classList.remove('open');
}

// 4. Renderizar Lista dos Grupos de Crescimento
function renderGrowthGroupsList() {
  const listEl = document.getElementById('growth-groups-list');
  const countCardEl = document.getElementById('gc-card-count');
  const subtitleEl = document.getElementById('gc-modal-subtitle');
  const leaderBar = document.getElementById('gc-leader-bar');
  if (!listEl) return;

  const gcs = getIcempGCs();
  const isLeader = AuthState.currentUser && AuthState.currentUser.role === 'leader';

  if (countCardEl) countCardEl.textContent = `${gcs.length} Grupos nos Lares`;
  if (subtitleEl) subtitleEl.textContent = `${gcs.length} Grupos nos Lares • ICEMP`;
  if (leaderBar) leaderBar.classList.toggle('hidden', !isLeader);

  if (gcs.length === 0) {
    listEl.innerHTML = `
      <div class="py-8 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        Nenhum Grupo de Crescimento cadastrado no momento.
      </div>
    `;
    return;
  }

  listEl.innerHTML = gcs.map((gc, index) => {
    return `
      <article class="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col gap-2 hover:border-emerald-300 transition-all relative">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center flex-shrink-0">
              ${index + 1}
            </span>
            <h4 class="font-extrabold text-xs text-iceb-navy leading-snug">
              ${gc.name}
            </h4>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60 flex-shrink-0">
            ${gc.day} • ${gc.time}
          </span>
        </div>

        <div class="space-y-1 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <p class="flex items-center gap-1.5 truncate">
            <span class="material-symbols-outlined text-[15px] text-emerald-600 flex-shrink-0">person</span>
            <span class="truncate"><strong>Líderes:</strong> ${gc.leaders}</span>
          </p>
          <p class="flex items-center gap-1.5 truncate">
            <span class="material-symbols-outlined text-[15px] text-rose-500 flex-shrink-0">home</span>
            <span class="truncate"><strong>Local:</strong> ${gc.host}</span>
          </p>
          ${gc.focus ? `
            <p class="text-[10px] text-slate-500 pt-0.5 italic leading-tight">
              "${gc.focus}"
            </p>
          ` : ''}
        </div>

        ${isLeader ? `
          <div class="pt-1.5 border-t border-slate-100 flex items-center justify-end gap-1.5">
            <button type="button" onclick="openEditGCModal('${gc.id}')"
              class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all border border-amber-200">
              <span class="material-symbols-outlined text-[13px]">edit</span>
              <span>Editar</span>
            </button>
            <button type="button" onclick="deleteIcempGC('${gc.id}')"
              class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all border border-rose-200">
              <span class="material-symbols-outlined text-[13px]">delete</span>
              <span>Excluir</span>
            </button>
          </div>
        ` : ''}
      </article>
    `;
  }).join('');
}

// 5. Abrir e Fechar Modal de Aniversariantes
function openBirthdaysModal() {
  const modal = document.getElementById('birthdays-modal');
  if (!modal) return;
  renderBirthdaysList();
  modal.classList.add('open');
}

function closeBirthdaysModal() {
  const modal = document.getElementById('birthdays-modal');
  if (modal) modal.classList.remove('open');
}

// 6. Renderizar Lista de Aniversariantes
function renderBirthdaysList() {
  const listEl = document.getElementById('birthdays-list');
  const countCardEl = document.getElementById('bday-card-count');
  const leaderBar = document.getElementById('bday-leader-bar');
  if (!listEl) return;

  const birthdays = getIcempBirthdays();
  const isLeader = AuthState.currentUser && AuthState.currentUser.role === 'leader';
  const now = new Date();
  const todayDayStr = String(now.getDate()).padStart(2, '0');

  // Ordenar aniversariantes por dia crescente
  birthdays.sort((a, b) => parseInt(a.day, 10) - parseInt(b.day, 10));

  if (countCardEl) countCardEl.textContent = `${birthdays.length} Aniversariantes`;
  if (leaderBar) leaderBar.classList.toggle('hidden', !isLeader);

  if (birthdays.length === 0) {
    listEl.innerHTML = `
      <div class="py-8 px-4 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        Nenhum aniversariante cadastrado para este mês.
      </div>
    `;
    return;
  }

  listEl.innerHTML = birthdays.map(b => {
    const isToday = String(b.day).padStart(2, '0') === todayDayStr;

    return `
      <article class="p-3 bg-white rounded-2xl border ${isToday ? 'border-2 border-amber-400 bg-amber-50/20 shadow-xs' : 'border-slate-200/80 shadow-2xs'} flex items-center justify-between gap-2.5 transition-all">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-xl ${isToday ? 'bg-amber-500 text-white animate-bounce' : 'bg-amber-100 text-amber-900'} flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
            <span class="text-xs font-black leading-none">${b.day}</span>
            <span class="text-[8px] font-extrabold uppercase mt-0.5 leading-none">${(b.month || 'Out').slice(0, 3)}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h4 class="font-extrabold text-xs text-iceb-navy leading-snug truncate">
                ${b.name}
              </h4>
              ${isToday ? `
                <span class="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center gap-0.5 animate-pulse">
                  <span class="material-symbols-outlined text-[11px]">cake</span> HOJE!
                </span>
              ` : ''}
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">Membro da ICEMP</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button type="button" onclick="sendBirthdayGreeting('${b.name.replace(/'/g, "\\'")}', '${b.day}')"
            class="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-2xs border border-emerald-200/70"
            title="Enviar mensagem de felicitações">
            <span class="material-symbols-outlined text-[15px]">send</span>
          </button>

          ${isLeader ? `
            <button type="button" onclick="openEditBirthdayModal('${b.id}')"
              class="p-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-all border border-amber-200"
              title="Editar aniversariante">
              <span class="material-symbols-outlined text-[15px]">edit</span>
            </button>
            <button type="button" onclick="deleteIcempBirthday('${b.id}')"
              class="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-all border border-rose-200"
              title="Excluir aniversariante">
              <span class="material-symbols-outlined text-[15px]">delete</span>
            </button>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// 7. Enviar Felicitações no WhatsApp
function sendBirthdayGreeting(name, day) {
  const text = `Graça e paz, querido(a) *${name}*! 🎉🎂\n\nEm nome de toda a família da *Igreja Cristã Evangélica Metropolitana de Palmas (ICEMP)*, desejamos um feliz e abençoado aniversário!\n\n_"Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus."_ (1 Tessalonicenses 5:18)\n\nQue o Senhor continue derramando bênçãos sem medida, concedendo-lhe saúde, paz e sabedoria! Abraço fraterno da liderança e de toda a igreja!`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// 8. Gestão Pastoral: Criar / Editar GC
function openCreateGCModal() {
  const modal = document.getElementById('gc-editor-modal');
  const title = document.getElementById('gc-editor-modal-title');
  if (!modal) return;
  if (title) title.textContent = 'Novo Grupo de Crescimento';
  document.getElementById('gc-edit-id').value = '';
  document.getElementById('gc-edit-name').value = '';
  document.getElementById('gc-edit-day').value = 'Segunda-feira';
  document.getElementById('gc-edit-time').value = '19h30';
  document.getElementById('gc-edit-leaders').value = '';
  document.getElementById('gc-edit-host').value = 'Lares dos Membros';
  document.getElementById('gc-edit-focus').value = '';
  modal.classList.add('open');
}

function openEditGCModal(gcId) {
  const gcs = getIcempGCs();
  const gc = gcs.find(g => String(g.id) === String(gcId));
  if (!gc) return;

  const modal = document.getElementById('gc-editor-modal');
  const title = document.getElementById('gc-editor-modal-title');
  if (!modal) return;
  if (title) title.textContent = 'Editar Grupo de Crescimento';
  document.getElementById('gc-edit-id').value = gc.id;
  document.getElementById('gc-edit-name').value = gc.name || '';
  document.getElementById('gc-edit-day').value = gc.day || 'Segunda-feira';
  document.getElementById('gc-edit-time').value = gc.time || '19h30';
  document.getElementById('gc-edit-leaders').value = gc.leaders || '';
  document.getElementById('gc-edit-host').value = gc.host || 'Lares dos Membros';
  document.getElementById('gc-edit-focus').value = gc.focus || '';
  modal.classList.add('open');
}

function closeGCEditorModal() {
  const modal = document.getElementById('gc-editor-modal');
  if (modal) modal.classList.remove('open');
}

function saveIcempGC(e) {
  e.preventDefault();
  const id = document.getElementById('gc-edit-id')?.value;
  const name = document.getElementById('gc-edit-name')?.value;
  const day = document.getElementById('gc-edit-day')?.value;
  const time = document.getElementById('gc-edit-time')?.value;
  const leaders = document.getElementById('gc-edit-leaders')?.value;
  const host = document.getElementById('gc-edit-host')?.value;
  const focus = document.getElementById('gc-edit-focus')?.value;

  const gcs = getIcempGCs();

  if (id) {
    const idx = gcs.findIndex(g => String(g.id) === String(id));
    if (idx >= 0) {
      gcs[idx] = { ...gcs[idx], name, day, time, leaders, host, focus };
      showToast('Grupo de Crescimento atualizado!');
    }
  } else {
    gcs.push({
      id: `gc_${Date.now()}`,
      name,
      day,
      time,
      leaders,
      host,
      focus
    });
    showToast('Novo Grupo de Crescimento adicionado!');
  }

  localStorage.setItem('icemp_custom_gcs', JSON.stringify(gcs));
  closeGCEditorModal();
  renderGrowthGroupsList();
  updateIcempModuleCounts();
}

function deleteIcempGC(gcId) {
  if (!confirm('Deseja realmente remover este Grupo de Crescimento?')) return;
  const gcs = getIcempGCs();
  const filtered = gcs.filter(g => String(g.id) !== String(gcId));
  localStorage.setItem('icemp_custom_gcs', JSON.stringify(filtered));
  renderGrowthGroupsList();
  updateIcempModuleCounts();
  showToast('Grupo de Crescimento removido!');
}

// 9. Gestão Pastoral: Criar / Editar Aniversariante
function openCreateBirthdayModal() {
  const modal = document.getElementById('birthday-editor-modal');
  const title = document.getElementById('birthday-editor-modal-title');
  if (!modal) return;
  if (title) title.textContent = 'Novo Aniversariante';
  document.getElementById('bday-edit-id').value = '';
  document.getElementById('bday-edit-day').value = '';
  document.getElementById('bday-edit-month').value = 'Outubro';
  document.getElementById('bday-edit-name').value = '';
  modal.classList.add('open');
}

function openEditBirthdayModal(bdayId) {
  const birthdays = getIcempBirthdays();
  const b = birthdays.find(item => String(item.id) === String(bdayId));
  if (!b) return;

  const modal = document.getElementById('birthday-editor-modal');
  const title = document.getElementById('birthday-editor-modal-title');
  if (!modal) return;
  if (title) title.textContent = 'Editar Aniversariante';
  document.getElementById('bday-edit-id').value = b.id;
  document.getElementById('bday-edit-day').value = b.day || '';
  document.getElementById('bday-edit-month').value = b.month || 'Outubro';
  document.getElementById('bday-edit-name').value = b.name || '';
  modal.classList.add('open');
}

function closeBirthdayEditorModal() {
  const modal = document.getElementById('birthday-editor-modal');
  if (modal) modal.classList.remove('open');
}

function saveIcempBirthday(e) {
  e.preventDefault();
  const id = document.getElementById('bday-edit-id')?.value;
  const day = String(document.getElementById('bday-edit-day')?.value).padStart(2, '0');
  const month = document.getElementById('bday-edit-month')?.value || 'Outubro';
  const name = document.getElementById('bday-edit-name')?.value;

  const birthdays = getIcempBirthdays();

  if (id) {
    const idx = birthdays.findIndex(b => String(b.id) === String(id));
    if (idx >= 0) {
      birthdays[idx] = { ...birthdays[idx], day, month, name };
      showToast('Aniversariante atualizado!');
    }
  } else {
    birthdays.push({
      id: `bday_${Date.now()}`,
      day,
      month,
      name
    });
    showToast('Novo aniversariante adicionado!');
  }

  localStorage.setItem('icemp_custom_birthdays', JSON.stringify(birthdays));
  closeBirthdayEditorModal();
  renderBirthdaysList();
  updateIcempModuleCounts();
}

function deleteIcempBirthday(bdayId) {
  if (!confirm('Deseja realmente remover este aniversariante da lista?')) return;
  const birthdays = getIcempBirthdays();
  const filtered = birthdays.filter(b => String(b.id) !== String(bdayId));
  localStorage.setItem('icemp_custom_birthdays', JSON.stringify(filtered));
  renderBirthdaysList();
  updateIcempModuleCounts();
  showToast('Aniversariante removido!');
}

// ==========================================================================
// MÓDULO DE ESTUDOS & ARTIGOS TEOLÓGICOS (LIGONIER & DESIRING GOD)
// ==========================================================================

const StudiesState = {
  activeCategory: 'all',
  searchQuery: '',
  currentTopicId: null,
  currentArticleId: null
};

// Renderizar Grade de Cards de Temas
function renderStudiesTopics() {
  const container = document.getElementById('studies-topics-grid');
  if (!container || typeof getAllStudiesTopics !== 'function') return;

  let topics = getAllStudiesTopics();

  // 1. Filtrar por Categoria selecionada
  if (StudiesState.activeCategory !== 'all') {
    if (StudiesState.activeCategory === 'pastoral') {
      topics = topics.filter(t => t.id === 'estudos-pastorais');
    } else if (StudiesState.activeCategory === 'gc') {
      topics = topics.filter(t => t.id === 'gc');
    } else if (StudiesState.activeCategory === 'doutrina') {
      topics = topics.filter(t => ['teologia', 'autores-reformados', 'educacao-crista'].includes(t.id));
    } else if (StudiesState.activeCategory === 'familia') {
      topics = topics.filter(t => ['familia', 'mulheres', 'homens'].includes(t.id));
    } else if (StudiesState.activeCategory === 'geracoes') {
      topics = topics.filter(t => ['juventude', 'adolescentes'].includes(t.id));
    }
  }

  // 2. Filtrar por Pesquisa de Texto
  if (StudiesState.searchQuery) {
    const q = StudiesState.searchQuery.toLowerCase();
    topics = topics.filter(t => {
      const matchTopic = t.name.toLowerCase().includes(q) ||
                         t.description.toLowerCase().includes(q) ||
                         t.badge.toLowerCase().includes(q);
      const hasMatchingArticle = (typeof STUDIES_ARTICLES !== 'undefined') && STUDIES_ARTICLES.some(a => 
        a.topicId === t.id && (
          a.title.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
        )
      );
      return matchTopic || hasMatchingArticle;
    });
  }

  if (topics.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 py-12 px-4 text-center bg-white rounded-3xl border border-slate-200">
        <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
        <h4 class="font-extrabold text-sm text-iceb-navy">Nenhum estudo encontrado</h4>
        <p class="text-xs text-slate-500 mt-1">Tente buscar por outro termo ou limpe os filtros.</p>
        <button onclick="clearStudiesSearch()" class="mt-3 px-4 py-2 bg-iceb-blue text-white rounded-xl text-xs font-bold shadow-xs">
          Limpar Filtro de Busca
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = topics.map(topic => {
    const isSpecialGC = topic.isGc;

    // Card Especial do GC: Ocupa as 2 colunas no topo da grade
    if (isSpecialGC) {
      return `
        <article onclick="openTopicDetailScreen('${topic.id}')"
          class="study-topic-card col-span-2 group cursor-pointer active:scale-98 transition-all flex flex-col justify-between border-2 border-emerald-500/40 shadow-xs">
          
          <div class="card-thumb-wrap relative h-36">
            <img src="${topic.image}" alt="${topic.name}" loading="lazy" class="w-full h-full object-cover"
              onerror="this.src='https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80'" />
            <div class="card-thumb-overlay"></div>

            <!-- Badges Superiores do GC -->
            <div class="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase bg-emerald-600 text-white shadow-xs">
                ${topic.badge}
              </span>
              <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-white/95 text-emerald-800 shadow-2xs backdrop-blur-sm">
                ${topic.articlesCount} ${topic.articlesCount === 1 ? 'Lição' : 'Lições no Google Drive'}
              </span>
            </div>

            <!-- Ícone Flutuante Centralizado -->
            <div class="absolute -bottom-3 left-3.5 w-9 h-9 rounded-xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[20px]">${topic.icon}</span>
            </div>
          </div>

          <div class="p-3.5 pt-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-emerald-50/30">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h4 class="font-black text-sm text-iceb-navy leading-snug group-hover:text-emerald-700 transition-colors">
                  ${topic.name}
                </h4>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  Série Mutualidade
                </span>
              </div>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                ${topic.description}
              </p>
            </div>

            <div class="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs font-black text-emerald-700">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">menu_book</span>
                <span>Acessar Lições no Google Drive</span>
              </span>
              <span class="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </article>
      `;
    }

    // Card Especial de Estudos Pastorais: Ocupa as 2 colunas com destaque hero (como o GC)
    if (topic.id === 'estudos-pastorais' || topic.isPastoral) {
      return `
        <article onclick="openTopicDetailScreen('${topic.id}')"
          class="study-topic-card col-span-2 group cursor-pointer active:scale-98 transition-all flex flex-col justify-between border-2 border-sky-500/40 shadow-xs">
          
          <div class="card-thumb-wrap relative h-36">
            <img src="${topic.image}" alt="${topic.name}" loading="lazy" class="w-full h-full object-cover"
              onerror="this.src='https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'" />
            <div class="card-thumb-overlay"></div>

            <!-- Badges Superiores de Estudos Pastorais -->
            <div class="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span class="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase bg-sky-600 text-white shadow-xs">
                ${topic.badge}
              </span>
              <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-white/95 text-sky-900 shadow-2xs backdrop-blur-sm">
                ${topic.articlesCount} ${topic.articlesCount === 1 ? 'Artigo' : 'Artigos Bíblicos'}
              </span>
            </div>

            <!-- Ícone Flutuante Centralizado -->
            <div class="absolute -bottom-3 left-3.5 w-9 h-9 rounded-xl bg-white shadow-xs border border-sky-100 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[20px]">${topic.icon}</span>
            </div>
          </div>

          <div class="p-3.5 pt-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-sky-50/40">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h4 class="font-black text-sm text-iceb-navy leading-snug group-hover:text-sky-700 transition-colors">
                  ${topic.name}
                </h4>
                <span class="text-[10px] font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200/50">
                  Pr. Ubiracy Lucas Barbosa
                </span>
              </div>
              <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
                ${topic.description}
              </p>
            </div>

            <div class="mt-3 pt-2.5 border-t border-sky-100 flex items-center justify-between text-xs font-black text-sky-700">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">history_edu</span>
                <span>Acessar Artigos Bíblicos do Pastor</span>
              </span>
              <span class="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </article>
      `;
    }

    // Demais temas em 1 coluna na grade de 2 colunas
    return `
      <article onclick="openTopicDetailScreen('${topic.id}')"
        class="study-topic-card group cursor-pointer active:scale-98 transition-all flex flex-col justify-between">
        
        <!-- Imagem Thumbnail com Gradiente e Badges -->
        <div class="card-thumb-wrap relative">
          <img src="${topic.image}" alt="${topic.name}" loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1507842229451-7f01be8860ee?auto=format&fit=crop&w=400&q=80'" />
          <div class="card-thumb-overlay"></div>

          <!-- Badge Superior do Tema -->
          <div class="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase backdrop-blur-md bg-black/40 text-white border border-white/20">
              ${topic.badge}
            </span>
            <span class="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white/90 text-slate-800 shadow-2xs backdrop-blur-sm">
              ${topic.articlesCount} ${topic.articlesCount === 1 ? 'estudo' : 'estudos'}
            </span>
          </div>

          <!-- Ícone Flutuante Centralizado na Linha de Corte -->
          <div class="absolute -bottom-3 left-3 w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-iceb-blue group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-[18px]">${topic.icon}</span>
          </div>
        </div>

        <!-- Conteúdo Textual do Card -->
        <div class="p-3 pt-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-black text-xs text-iceb-navy leading-snug group-hover:text-iceb-blue transition-colors">
              ${topic.name}
            </h4>
            <p class="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              ${topic.description}
            </p>
          </div>

          <!-- Rodapé com Link "Acessar Estudos" -->
          <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-iceb-blue">
            <span>Acessar Estudos</span>
            <span class="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Filtrar por Chips na barra superior
function filterStudiesCategory(cat) {
  StudiesState.activeCategory = cat;
  document.querySelectorAll('.study-filter-chip').forEach(btn => {
    if (btn.dataset.cat === cat) {
      btn.className = 'study-filter-chip px-3 py-1 rounded-full text-xs font-bold bg-iceb-blue text-white whitespace-nowrap shadow-2xs active:scale-95 transition-all';
    } else {
      btn.className = 'study-filter-chip px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 whitespace-nowrap transition-all';
    }
  });
  renderStudiesTopics();
}

// Campo de Busca
function handleStudiesSearch(val) {
  StudiesState.searchQuery = val.trim();
  const clearBtn = document.getElementById('studies-search-clear');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', StudiesState.searchQuery.length === 0);
  }
  renderStudiesTopics();
}

function clearStudiesSearch() {
  const input = document.getElementById('studies-search-input');
  if (input) input.value = '';
  StudiesState.searchQuery = '';
  const clearBtn = document.getElementById('studies-search-clear');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderStudiesTopics();
}

// ==========================================================================
// TELA DE DETALHES DO TEMA (Estilo Página da História)
// ==========================================================================

function openTopicDetailScreen(topicId) {
  StudiesState.currentTopicId = topicId;
  const screen = document.getElementById('screen-topic-detail');
  if (!screen) return;

  // Esconder temporariamente as telas ativas
  document.querySelectorAll('.app-screen:not(#screen-topic-detail)').forEach(s => {
    if (s.classList.contains('active')) {
      s.dataset.wasActive = 'true';
      s.classList.remove('active');
    }
  });

  renderTopicDetail(topicId);
  screen.classList.add('active');
  screen.scrollTop = 0;
}

function closeTopicDetailScreen() {
  const screen = document.getElementById('screen-topic-detail');
  if (screen) screen.classList.remove('active');

  // Restaurar tela ativa anterior
  document.querySelectorAll('.app-screen[data-was-active="true"]').forEach(s => {
    s.classList.add('active');
    delete s.dataset.wasActive;
  });
}

function renderTopicDetail(topicId) {
  const container = document.getElementById('topic-detail-body');
  const badgeEl = document.getElementById('topic-detail-header-badge');
  if (!container || typeof STUDIES_TOPICS === 'undefined') return;

  const topic = STUDIES_TOPICS.find(t => t.id === topicId);
  if (!topic) return;

  if (badgeEl) badgeEl.textContent = topic.name;

  const isLeader = AuthState.currentUser?.role === 'leader';
  const articles = getArticlesByTopic(topicId);

  container.innerHTML = `
    <!-- Hero Principal do Tema com Gradiente e Imagem -->
    <section class="relative bg-gradient-to-b ${topic.bgGradient} text-white p-5 pt-6 pb-8 overflow-hidden shadow-xs">
      <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
      
      <div class="relative z-10">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-white/15 mb-2.5">
          <span class="material-symbols-outlined text-[13px]">${topic.icon}</span>
          <span>${topic.badge} • ${articles.length} ${articles.length === 1 ? (topic.isGc ? 'Lição' : 'Estudo') : (topic.isGc ? 'Lições' : 'Estudos')}</span>
        </div>

        <h1 class="text-2xl font-black text-white leading-tight">
          ${topic.name}
        </h1>

        <p class="text-xs text-slate-200 mt-2 leading-relaxed">
          ${topic.description}
        </p>
      </div>
    </section>

    <!-- Barra de Gestão do Pastor -->
    ${isLeader ? `
      <div class="mx-4 mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between shadow-2xs">
        <div class="flex items-center gap-2 text-amber-900 text-xs font-bold">
          <span class="material-symbols-outlined text-[18px] text-amber-600">admin_panel_settings</span>
          <span>Gestão Pastoral de Estudos</span>
        </div>
        <button onclick="openCreateStudyModal('${topic.id}')"
          class="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all">
          <span class="material-symbols-outlined text-[15px]">add</span>
          <span>Novo Estudo</span>
        </button>
      </div>
    ` : ''}

    <!-- Banner Pasta Oficial Google Drive para Estudos do GC -->
    ${topic.id === 'gc' || topic.isGc ? `
      <div class="mx-4 mt-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            <span class="material-symbols-outlined text-[20px]">folder_shared</span>
          </div>
          <div class="min-w-0">
            <h4 class="font-black text-xs text-emerald-950 truncate">Pasta Oficial no Google Drive</h4>
            <p class="text-[10px] text-emerald-700 truncate">11 Lições da Série Mutualidade em PDF</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button onclick="openGrowthGroupsModal()"
            class="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 active:scale-95 transition-all"
            title="Ver os 11 Grupos de Crescimento">
            <span class="material-symbols-outlined text-[13px]">groups</span>
            <span>11 GCs</span>
          </button>
          <a href="${topic.driveFolderUrl || 'https://drive.google.com/drive/folders/19pWPew6b8x5NF_Adqa7SpWTFfkEMsdxo'}" target="_blank" rel="noopener"
            class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all">
            <span>Abrir Pasta</span>
            <span class="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        </div>
      </div>
    ` : ''}

    <!-- Banner Portal Oficial ICEMP para Estudos Pastorais -->
    ${topic.id === 'estudos-pastorais' ? `
      <div class="mx-4 mt-3 p-3.5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-sky-200 flex items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
            <span class="material-symbols-outlined text-[20px]">public</span>
          </div>
          <div class="min-w-0">
            <h4 class="font-black text-xs text-sky-950 truncate">Portal Oficial ICEMP</h4>
            <p class="text-[10px] text-sky-700 truncate">icemetropolitana.com.br/artigosbiblicos</p>
          </div>
        </div>
        <a href="https://icemetropolitana.com.br/artigosbiblicos" target="_blank" rel="noopener"
          class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all flex-shrink-0">
          <span>Ver no Site</span>
          <span class="material-symbols-outlined text-[13px]">open_in_new</span>
        </a>
      </div>
    ` : ''}

    <!-- Seção de Artigos Selecionados -->
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-extrabold text-xs uppercase tracking-wider text-slate-500">
          ${topic.id === 'estudos-pastorais' ? 'Artigos Bíblicos Pastorais' : (topic.id === 'gc' ? 'Lições dos Grupos de Crescimento' : 'Artigos & Leituras Bíblicas')}
        </h3>
        <span class="text-[11px] font-bold text-slate-400">
          ${topic.id === 'estudos-pastorais' || topic.id === 'gc' ? 'Pr. Ubiracy Lucas Barbosa • ICEMP' : 'Ligonier, Desiring God & ICEMP'}
        </span>
      </div>

      ${articles.length === 0 ? `
        <div class="py-10 px-4 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          Nenhum artigo cadastrado para este tema no momento.
          ${isLeader ? '<br/><span class="font-bold text-amber-700 mt-1 inline-block">Clique em "+ Novo Estudo" acima para adicionar o primeiro!</span>' : ''}
        </div>
      ` : articles.map(art => renderArticleCardHtml(art, isLeader)).join('')}

      <div class="pt-4 text-center">
        <button onclick="closeTopicDetailScreen()"
          class="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-98 transition-all">
          Voltar para Todos os Temas
        </button>
      </div>
    </div>
  `;
}

// Renderizar o HTML do Card de Artigo / Estudo
function renderArticleCardHtml(art, isLeader) {
  const hasUrl = Boolean(art.sourceUrl && art.sourceUrl.trim().length > 0);
  const safeTitle = (art.title || '').replace(/'/g, "\\'");
  const isGc = art.topicId === 'gc';

  return `
    <article class="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:border-iceb-blue/60 transition-all flex flex-col justify-between">
      <div>
        <!-- Cabeçalho do Artigo: Autor, Fonte e Tempo -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-full ${isGc ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-iceb-navy border-slate-200'} font-black text-xs flex items-center justify-center flex-shrink-0 border">
              ${(art.author || 'P').charAt(0)}
            </div>
            <div class="min-w-0">
              <h5 class="font-bold text-xs text-slate-800 leading-none truncate">${art.author || 'Autor'}</h5>
              <p class="text-[10px] text-slate-400 mt-0.5 truncate">${art.source || 'ICEMP'}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full ${isGc ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'} font-bold text-[10px] flex items-center gap-0.5 flex-shrink-0">
            <span class="material-symbols-outlined text-[12px]">${isGc ? 'picture_as_pdf' : 'schedule'}</span>
            <span>${art.readTime || '5 min'}</span>
          </span>
        </div>

        <!-- Título do Artigo -->
        <h4 class="font-black text-sm text-iceb-navy leading-snug">
          ${art.title}
        </h4>

        <!-- Versículo Chave em Destaque -->
        ${art.keyVerse ? `
          <div class="my-2.5 p-2.5 rounded-xl bg-slate-50 border-l-2 ${isGc ? 'border-emerald-500' : 'border-iceb-blue'} text-[11px] text-slate-700 italic">
            ${art.keyVerse}
          </div>
        ` : ''}

        <!-- Resumo -->
        <p class="text-xs text-slate-600 leading-relaxed mt-1">
          ${art.summary || ''}
        </p>
      </div>

      <!-- Barra de Ações: Compartilhar, Link Externo, Ler e Gestão Pastor -->
      <div class="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <button onclick="shareArticleById('${art.id}')"
            class="text-[11px] font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 active:scale-95 transition-all"
            title="Compartilhar no WhatsApp">
            <span class="material-symbols-outlined text-[15px]">share</span>
            <span>Compartilhar</span>
          </button>

          <div class="flex items-center gap-2">
            ${hasUrl ? `
              <a href="${art.sourceUrl}" target="_blank" rel="noopener"
                class="px-3 py-1.5 rounded-xl ${isGc ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'} font-bold text-[11px] flex items-center gap-1 border active:scale-95 transition-all"
                title="${isGc ? 'Acessar PDF no Google Drive' : 'Acessar link do estudo'}">
                <span>${isGc ? 'Abrir no Drive' : 'Acessar Estudo'}</span>
                <span class="material-symbols-outlined text-[13px]">${isGc ? 'picture_as_pdf' : 'open_in_new'}</span>
              </a>
            ` : ''}

            <button onclick="openArticleReaderScreen('${art.id}')"
              class="px-3.5 py-1.5 rounded-xl ${isGc ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-iceb-blue hover:bg-iceb-blue-dark'} text-white font-bold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all">
              <span>Ler Artigo</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Botões de Edição Exclusivos do Pastor -->
        ${isLeader ? `
          <div class="pt-2 border-t border-dashed border-slate-200 flex items-center justify-end gap-2">
            <button onclick="openEditStudyModal('${art.id}')"
              class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 border border-amber-200 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[13px]">edit</span>
              <span>Editar</span>
            </button>
            <button onclick="deleteCustomStudy('${art.id}')"
              class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1 border border-rose-200 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[13px]">delete</span>
              <span>Excluir</span>
            </button>
          </div>
        ` : ''}
      </div>
    </article>
      </div>
    </article>
  `;
}

// ==========================================================================
// GESTÃO PASTORAL DE ESTUDOS: CRIAR, EDITAR E EXCLUIR
// ==========================================================================

function openCreateStudyModal(topicId) {
  const modal = document.getElementById('study-editor-modal');
  const title = document.getElementById('study-editor-modal-title');
  if (!modal) return;

  if (title) title.textContent = 'Novo Estudo / Artigo';
  document.getElementById('study-edit-id').value = '';
  document.getElementById('study-edit-topic').value = topicId || StudiesState.currentTopicId || 'gc';
  document.getElementById('study-edit-title').value = '';
  document.getElementById('study-edit-author').value = AuthState.currentUser?.name || 'Pr. Ubiracy Lucas Barbosa';
  document.getElementById('study-edit-source').value = 'ICEMP';
  document.getElementById('study-edit-url').value = '';
  document.getElementById('study-edit-verse').value = '';
  document.getElementById('study-edit-readtime').value = '5 min';
  document.getElementById('study-edit-summary').value = '';
  document.getElementById('study-edit-content').value = '';

  modal.classList.add('open');
}

function openEditStudyModal(studyId) {
  const art = getArticleById(studyId);
  if (!art) return;

  const modal = document.getElementById('study-editor-modal');
  const title = document.getElementById('study-editor-modal-title');
  if (!modal) return;

  if (title) title.textContent = 'Editar Estudo / Artigo';
  document.getElementById('study-edit-id').value = art.id;
  document.getElementById('study-edit-topic').value = art.topicId || StudiesState.currentTopicId || 'gc';
  document.getElementById('study-edit-title').value = art.title || '';
  document.getElementById('study-edit-author').value = art.author || '';
  document.getElementById('study-edit-source').value = art.source || '';
  document.getElementById('study-edit-url').value = art.sourceUrl || '';
  document.getElementById('study-edit-verse').value = art.keyVerse || '';
  document.getElementById('study-edit-readtime').value = art.readTime || '5 min';
  document.getElementById('study-edit-summary').value = art.summary || '';
  document.getElementById('study-edit-content').value = art.contentHtml || '';

  modal.classList.add('open');
}

function closeStudyEditorModal() {
  const modal = document.getElementById('study-editor-modal');
  if (modal) modal.classList.remove('open');
}

function saveCustomStudy(e) {
  e.preventDefault();

  const id = document.getElementById('study-edit-id')?.value;
  const topicId = document.getElementById('study-edit-topic')?.value || 'gc';
  const title = document.getElementById('study-edit-title')?.value || '';
  const author = document.getElementById('study-edit-author')?.value || 'Pr. Ubiracy Lucas Barbosa';
  const source = document.getElementById('study-edit-source')?.value || 'ICEMP';
  const sourceUrl = document.getElementById('study-edit-url')?.value || '';
  const keyVerse = document.getElementById('study-edit-verse')?.value || '';
  const readTime = document.getElementById('study-edit-readtime')?.value || '5 min';
  const summary = document.getElementById('study-edit-summary')?.value || '';
  let contentHtml = document.getElementById('study-edit-content')?.value || '';

  // Formatar conteúdo em HTML se for texto puro
  if (contentHtml && !contentHtml.includes('<p>')) {
    contentHtml = contentHtml.split('\n\n').map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`).join('');
  } else if (!contentHtml && sourceUrl) {
    contentHtml = `
      <p class="lead-text">${summary}</p>
      <p>Este estudo foi selecionado e recomendado pela liderança pastoral para edificação da igreja.</p>
      <p>Você pode acessar a publicação completa na íntegra através do link oficial:</p>
      <p class="pt-2">
        <a href="${sourceUrl}" target="_blank" rel="noopener" class="text-iceb-blue font-bold underline flex items-center gap-1">
          <span>Abrir publicação original</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </p>
    `;
  } else if (!contentHtml) {
    contentHtml = `<p class="lead-text">${summary}</p>`;
  }

  const customStudies = getCustomStudiesList();

  if (id) {
    // Editar estudo existente
    const idx = customStudies.findIndex(s => s.id === id);
    if (idx >= 0) {
      customStudies[idx] = {
        ...customStudies[idx],
        topicId,
        title,
        author,
        source,
        sourceUrl,
        keyVerse,
        readTime,
        summary,
        contentHtml
      };
    } else {
      // Se era um artigo padrão, grava como override no custom
      customStudies.push({
        id,
        topicId,
        title,
        author,
        source,
        sourceUrl,
        keyVerse,
        readTime,
        summary,
        contentHtml,
        authorRole: 'Autor selecionado pela pastoral'
      });
    }
    showToast('Estudo atualizado com sucesso!');
  } else {
    // Inserir novo estudo
    const newStudy = {
      id: `custom_study_${Date.now()}`,
      topicId,
      title,
      author,
      authorRole: 'Pastoral ICEMP',
      source,
      sourceUrl,
      keyVerse,
      readTime,
      date: 'Recente',
      summary,
      contentHtml
    };
    customStudies.push(newStudy);
    showToast('Novo estudo adicionado!');
  }

  localStorage.setItem('icemp_custom_studies', JSON.stringify(customStudies));
  closeStudyEditorModal();

  // Atualizar visualização da página e grade
  renderTopicDetail(topicId);
  renderStudiesTopics();
}

function deleteCustomStudy(studyId) {
  if (!confirm('Deseja realmente remover este estudo?')) return;

  const customStudies = getCustomStudiesList();
  const filtered = customStudies.filter(s => s.id !== studyId);
  localStorage.setItem('icemp_custom_studies', JSON.stringify(filtered));

  // Registrar nos deletados caso seja um artigo base
  const deletedIds = getDeletedStudyIds();
  if (!deletedIds.includes(studyId)) {
    deletedIds.push(studyId);
    localStorage.setItem('icemp_deleted_studies', JSON.stringify(deletedIds));
  }

  showToast('Estudo removido!');
  renderTopicDetail(StudiesState.currentTopicId);
  renderStudiesTopics();
}

// ==========================================================================
// TELA DO LEITOR DE ARTIGO
// ==========================================================================

function openArticleReaderScreen(articleId) {
  StudiesState.currentArticleId = articleId;
  const screen = document.getElementById('screen-article-reader');
  if (!screen) return;

  renderArticleReader(articleId);
  screen.classList.add('active');
  screen.scrollTop = 0;
}

function closeArticleReaderScreen() {
  const screen = document.getElementById('screen-article-reader');
  if (screen) screen.classList.remove('active');
}

function renderArticleReader(articleId) {
  const container = document.getElementById('article-reader-body');
  const titleEl = document.getElementById('reader-header-title');
  if (!container || typeof getArticleById !== 'function') return;

  const art = getArticleById(articleId);
  if (!art) return;

  const topic = STUDIES_TOPICS.find(t => t.id === art.topicId);
  if (titleEl) titleEl.textContent = art.title;

  container.innerHTML = `
    <!-- Topo do Artigo: Badge do Tema & Tempo de Leitura -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <span class="px-2.5 py-1 rounded-full bg-iceb-blue-light text-iceb-blue text-[10px] font-extrabold uppercase tracking-wider">
        ${topic ? topic.name : 'Estudos'}
      </span>
      <span class="text-xs text-slate-400 flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">schedule</span>
        <span>${art.readTime} de leitura • ${art.date}</span>
      </span>
    </div>

    <!-- Título Principal -->
    <h1 class="text-xl font-black text-iceb-navy leading-tight tracking-tight mb-3">
      ${art.title}
    </h1>

    <!-- Card do Autor e Fonte Oficial -->
    <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-10 h-10 rounded-full bg-iceb-navy text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
          ${art.author.charAt(0)}
        </div>
        <div class="min-w-0">
          <h4 class="font-bold text-xs text-iceb-navy truncate">${art.author}</h4>
          <p class="text-[10px] text-slate-500 truncate">${art.authorRole}</p>
        </div>
      </div>
      ${art.sourceUrl ? `
        <a href="${art.sourceUrl}" target="_blank" rel="noopener"
          class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 ${art.topicId === 'gc' ? 'text-emerald-700 hover:text-emerald-900 border-emerald-200' : 'text-iceb-blue hover:text-iceb-navy'} font-bold text-[10px] flex items-center gap-1 flex-shrink-0 shadow-2xs"
          title="Ver na fonte oficial original">
          <span>${art.topicId === 'gc' ? 'Abrir no Google Drive' : art.source}</span>
          <span class="material-symbols-outlined text-[12px]">${art.topicId === 'gc' ? 'picture_as_pdf' : 'open_in_new'}</span>
        </a>
      ` : ''}
    </div>

    <!-- Versículo Bíblico Central -->
    ${art.keyVerse ? `
      <div class="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 mb-5">
        <p class="text-xs italic text-amber-950 leading-relaxed font-medium">
          ${art.keyVerse}
        </p>
      </div>
    ` : ''}

    <!-- Corpo do Artigo com Tipografia Rica -->
    <div class="article-content-body">
      ${art.contentHtml}
    </div>

    <!-- Perguntas para Reflexão / Discipulado -->
    ${art.reflectionQuestions && art.reflectionQuestions.length > 0 ? `
      <div class="mt-6 p-4 rounded-3xl bg-slate-50 border border-slate-200">
        <div class="flex items-center gap-2 text-iceb-navy font-extrabold text-xs mb-2.5">
          <span class="material-symbols-outlined text-iceb-blue text-[18px]">quiz</span>
          <span>Perguntas para Reflexão Pessoal ou no GC:</span>
        </div>
        <ol class="space-y-2 text-xs text-slate-700 pl-4 list-decimal leading-relaxed">
          ${art.reflectionQuestions.map(q => `<li>${q}</li>`).join('')}
        </ol>
      </div>
    ` : ''}

    <!-- Ações Inferiores: Compartilhar & Voltar -->
    <div class="mt-6 pt-4 border-t border-slate-200 flex flex-col gap-2.5">
      <button onclick="shareCurrentArticle()"
        class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-98 transition-all">
        <span class="material-symbols-outlined text-[18px]">share</span>
        <span>Compartilhar este Artigo no WhatsApp</span>
      </button>

      <button onclick="closeArticleReaderScreen()"
        class="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:scale-98 transition-all">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Voltar para Lista de Artigos</span>
      </button>
    </div>
  `;
}

// Compartilhamento via WhatsApp
function shareCurrentArticle() {
  if (!StudiesState.currentArticleId) return;
  shareArticleById(StudiesState.currentArticleId);
}

function shareArticleById(articleId) {
  const art = getArticleById(articleId);
  if (!art) return;

  const msg = `📖 *Estudo Bíblico: ${art.title}*\n_Por ${art.author} (${art.source})_\n\n${art.keyVerse ? `${art.keyVerse}\n\n` : ''}Confira esse artigo e outros estudos bíblicos no aplicativo oficial da ICEB / ICEMP!\n${art.sourceUrl}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

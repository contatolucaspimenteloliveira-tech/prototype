(() => {
  const SUPABASE_URL = 'https://kriofoapvvumjukzeprp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yUpRvqk0Dnm0uWYokMSiRw_yVQaUDZE';
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzylmjkf8yluRHEIEkXsutnGRi4I3XIcpgalHZfYLNafXIp6De2UMQHuxweB6FfvQ0J/exec';
  const AUTH_INTENT_KEY = 'postos_auth_intent';

  let supabaseClient = null;
  let currentSession = null;
  let currentProfile = null;
  let currentAuthTab = 'records';
  let currentRecords = [];
  let adminStations = [];
  let adminDrivers = [];

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  }

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const lib = window.supabase || globalThis.supabase || null;
    if (!lib || typeof lib.createClient !== 'function') return null;
    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return supabaseClient;
  }

  function isAdmin() {
    return !!(currentProfile && currentProfile.perfil === 'admin');
  }

  function updateGateStatus(text) {
    const el = document.getElementById('auth-gate-status');
    if (el) el.textContent = text;
  }

  function setGateVisibility(visible) {
    const gate = document.getElementById('auth-gate');
    if (!gate) return;
    gate.classList.toggle('hidden', !visible);
    gate.classList.toggle('block', visible);
    document.body.style.overflow = visible ? 'hidden' : '';
  }

  function clearAuthParamsFromUrl() {
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      ['code', 'error', 'error_code', 'error_description', 'sb'].forEach((param) => url.searchParams.delete(param));
      window.history.replaceState({}, document.title, url.toString());
    } catch (_error) {}
  }

  function getAuthErrorFromLocation() {
    try {
      const url = new URL(window.location.href);
      const hashParams = url.hash ? new URLSearchParams(url.hash.replace(/^#/, '')) : null;
      const error = url.searchParams.get('error') || (hashParams && hashParams.get('error'));
      const description = url.searchParams.get('error_description') || (hashParams && hashParams.get('error_description'));
      return decodeURIComponent(description || error || '');
    } catch (_error) {
      return '';
    }
  }

  function getAuthCodeFromLocation() {
    try {
      return new URL(window.location.href).searchParams.get('code') || '';
    } catch (_error) {
      return '';
    }
  }

  function getPreferredRedirectUrl() {
    const origin = window.location.origin;
    const pathname = window.location.pathname || '';
    if (pathname.includes('/prototype/Postos')) return `${origin}/prototype/Postos/`;
    if (pathname.includes('/Postos')) return `${origin}/Postos/`;
    if (pathname.endsWith('/index.html')) return origin + pathname.replace(/index\.html$/, '');
    return pathname.endsWith('/') ? origin + pathname : `${origin}${pathname}/`;
  }

  function safeText(value, fallback = '') {
    return value === null || value === undefined || value === '' ? fallback : String(value);
  }

  function getUserDisplayName(user, profile) {
    if (profile && profile.nome) return profile.nome;
    if (user && user.user_metadata) {
      return user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.nome || user.email || 'Usuário';
    }
    return (user && user.email) || 'Usuário';
  }

  function formatCurrencyBr(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseCurrencyToNumber(value) {
    if (!value) return 0;
    const parsed = Number(String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function parseLitersToNumber(value) {
    if (!value) return 0;
    const parsed = Number(String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatDateBr(value) {
    if (!value) return '-';
    try {
      const normalized = String(value).length === 10 ? `${value}T00:00:00` : value;
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(normalized));
    } catch (_error) {
      return String(value);
    }
  }

  function setIntent(intent) {
    try { localStorage.setItem(AUTH_INTENT_KEY, intent); } catch (_error) {}
  }

  function consumeIntent() {
    try {
      const value = localStorage.getItem(AUTH_INTENT_KEY) || '';
      localStorage.removeItem(AUTH_INTENT_KEY);
      return value;
    } catch (_error) {
      return '';
    }
  }

  function showAuthError(message) {
    if (typeof window.showErrorMessage === 'function') window.showErrorMessage(message);
    else alert(message);
  }

  function showAuthSuccess(message) {
    if (typeof window.showSuccessMessage === 'function') window.showSuccessMessage(message);
    else alert(message);
  }

  function getBasePostosData() {
    const base = window.postosBaseData || window.postosData || {};
    try { return JSON.parse(JSON.stringify(base)); } catch (_error) { return {}; }
  }

  function getMergedPostosData() {
    const merged = getBasePostosData();
    adminStations.forEach((station) => {
      const city = safeText(station.cidade).trim();
      const name = safeText(station.nome).trim();
      if (!city || !name) return;
      if (!merged[city]) merged[city] = [];
      const exists = merged[city].some((item) => safeText(item.nome).trim().toLowerCase() === name.toLowerCase());
      if (!exists) merged[city].push({ nome: name, endereco: safeText(station.endereco, city), link: safeText(station.mapa_url) });
    });
    return merged;
  }

  function syncStationsIntoApp() {
    window.postosData = getMergedPostosData();
  }

  function populateCitySelect(selectedCity = '') {
    const citySelect = document.getElementById('fuel-city');
    if (!citySelect) return;
    const currentValue = selectedCity || citySelect.value || '';
    const cityNames = Object.keys(window.postosData || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    citySelect.innerHTML = '<option value="">Selecione uma cidade</option>' + cityNames.map((city) => `<option value="${city.replace(/"/g, '&quot;')}">${city}</option>`).join('');
    if (currentValue && cityNames.includes(currentValue)) citySelect.value = currentValue;
  }

  function populateStationSelect(cityName, selectedStation = '') {
    const stationSelect = document.getElementById('fuel-station');
    if (!stationSelect) return;
    const stations = cityName && window.postosData && window.postosData[cityName] ? window.postosData[cityName] : [];
    if (!stations.length) {
      stationSelect.innerHTML = '<option value="">Selecione uma cidade primeiro</option>';
      return;
    }
    stationSelect.innerHTML = '<option value="">Selecione um posto</option>' + stations.map((station) => {
      const name = safeText(station.nome);
      return `<option value="${name.replace(/"/g, '&quot;')}">${name}</option>`;
    }).join('');
    if (selectedStation) stationSelect.value = selectedStation;
  }

  function populateDriversDatalist() {
    const datalist = document.getElementById('drivers-datalist');
    if (!datalist) return;
    datalist.innerHTML = adminDrivers.map((driver) => {
      const name = safeText(driver.nome);
      const label = [safeText(driver.placa), safeText(driver.telefone)].filter(Boolean).join(' • ');
      return `<option value="${name.replace(/"/g, '&quot;')}" label="${label.replace(/"/g, '&quot;')}"></option>`;
    }).join('');
  }

  function updateAuthTabUi() {
    document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.authTab === currentAuthTab);
    });

    ['records', 'stations', 'drivers'].forEach((tabName) => {
      const panel = document.getElementById(`auth-tab-${tabName}`);
      if (!panel) return;
      const shouldShow = tabName === currentAuthTab && (tabName === 'records' || isAdmin());
      panel.classList.toggle('hidden', !shouldShow);
    });
  }

  function updateAuthUi() {
    const loginButton = document.getElementById('login-google-btn');
    const userPanel = document.getElementById('auth-user-panel');
    const userName = document.getElementById('auth-user-name');
    const panelUserName = document.getElementById('auth-panel-user-name');
    const badge = document.getElementById('auth-role-badge');
    const adminTabs = document.getElementById('auth-admin-tabs');
    if (!loginButton || !userPanel || !userName || !panelUserName || !badge) return;

    if (currentSession && currentSession.user) {
      const displayName = getUserDisplayName(currentSession.user, currentProfile);
      loginButton.classList.add('hidden');
      userPanel.classList.remove('hidden');
      userName.textContent = displayName;
      panelUserName.textContent = displayName;
      badge.classList.toggle('hidden', !isAdmin());
      if (adminTabs) adminTabs.classList.toggle('hidden', !isAdmin());
      if (!isAdmin()) currentAuthTab = 'records';
      updateAuthTabUi();
      setGateVisibility(false);
    } else {
      loginButton.classList.remove('hidden');
      userPanel.classList.add('hidden');
      badge.classList.add('hidden');
      if (adminTabs) adminTabs.classList.add('hidden');
      userName.textContent = 'Usuário';
      panelUserName.textContent = 'Usuário';
      currentAuthTab = 'records';
      updateAuthTabUi();
      renderHomeRecords([]);
      setGateVisibility(true);
    }
  }

  async function ensureProfile(user) {
    const client = getSupabaseClient();
    if (!client || !user) {
      currentProfile = null;
      return null;
    }

    const fallbackProfile = {
      id: user.id,
      nome: getUserDisplayName(user, null),
      email: user.email || '',
      perfil: 'motorista',
      status: 'ativo'
    };

    try {
      const upsertResult = await client.from('profiles').upsert(fallbackProfile, { onConflict: 'id' }).select().maybeSingle();
      if (!upsertResult.error && upsertResult.data) {
        currentProfile = upsertResult.data;
        return currentProfile;
      }
    } catch (error) {
      console.warn('Falha ao fazer upsert do perfil:', error);
    }

    try {
      const selectResult = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!selectResult.error && selectResult.data) {
        currentProfile = selectResult.data;
        return currentProfile;
      }
    } catch (error) {
      console.warn('Falha ao consultar perfil:', error);
    }

    currentProfile = fallbackProfile;
    return currentProfile;
  }

  async function refreshSessionState() {
    const client = getSupabaseClient();
    if (!client) {
      currentSession = null;
      currentProfile = null;
      updateAuthUi();
      return null;
    }

    try {
      const sessionResult = await client.auth.getSession();
      currentSession = sessionResult && sessionResult.data ? sessionResult.data.session : null;
      if (currentSession && currentSession.user) {
        currentProfile = { id: currentSession.user.id, nome: getUserDisplayName(currentSession.user, null), email: currentSession.user.email || '', perfil: 'motorista', status: 'ativo' };
        updateAuthUi();
        try {
          await withTimeout(ensureProfile(currentSession.user), 2500);
        } catch (profileError) {
          console.warn('Perfil não confirmou a tempo, seguindo com fallback:', profileError);
        }
      } else {
        currentProfile = null;
      }
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      currentSession = null;
      currentProfile = null;
    }

    updateAuthUi();
    return currentSession;
  }

  function requireAuth(intent) {
    if (currentSession && currentSession.user) return true;
    if (intent) setIntent(intent);
    updateGateStatus('Entre com Google para acessar o aplicativo.');
    setGateVisibility(true);
    return false;
  }

  function renderHomeRecords(records) {
    const summary = document.getElementById('home-records-summary');
    const list = document.getElementById('home-records-list');
    if (!summary || !list) return;

    const totalRegistros = records.length;
    const totalLitros = records.reduce((acc, item) => acc + parseLitersToNumber(item.litros), 0);
    const totalValor = records.reduce((acc, item) => acc + parseCurrencyToNumber(item.valor), 0);

    summary.innerHTML = `
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
        <span class="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Registros</span>
        <strong class="mt-2 block text-2xl font-bold text-slate-900">${totalRegistros}</strong>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
        <span class="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total em litros</span>
        <strong class="mt-2 block text-2xl font-bold text-slate-900">${totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
        <span class="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Total abastecido</span>
        <strong class="mt-2 block text-2xl font-bold text-slate-900">${formatCurrencyBr(totalValor)}</strong>
      </div>
    `;

    if (!currentSession || !currentSession.user) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Entre com sua conta para visualizar seus abastecimentos.</div>';
      return;
    }

    if (!records.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Nenhum abastecimento encontrado para este perfil.</div>';
      return;
    }

    const recentRecords = records.slice(0, 4);
    list.innerHTML = recentRecords.map((record) => {
      const valorFormatado = formatCurrencyBr(record.valor);
      const litrosFormatados = parseLitersToNumber(record.litros).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `
        <article class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h4 class="text-base font-bold text-slate-900">${safeText(record.posto, 'Posto não informado')}</h4>
              <p class="text-sm text-slate-500 mt-1">${safeText(record.cidade, 'Cidade não informada')} • ${formatDateBr(record.data_abastecimento)}</p>
            </div>
            <div class="inline-flex items-center justify-center rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              ${valorFormatado}
            </div>
          </div>
          <div class="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div class="rounded-xl bg-slate-50 px-3 py-2">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Motorista</span>
              <strong class="mt-1 block text-slate-800">${safeText(record.motorista, '-')}</strong>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">KM atual</span>
              <strong class="mt-1 block text-slate-800">${safeText(record.km_atual, '-')}</strong>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Litros</span>
              <strong class="mt-1 block text-slate-800">${litrosFormatados}</strong>
            </div>
            <div class="rounded-xl bg-slate-50 px-3 py-2">
              <span class="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Registro</span>
              <strong class="mt-1 block text-slate-800">${record.created_at ? formatDateBr(record.created_at) : '-'}</strong>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderRecords(records) {
    const summary = document.getElementById('auth-records-summary');
    const list = document.getElementById('auth-records-list');
    if (!summary || !list) return;

    const totalRegistros = records.length;
    const totalLitros = records.reduce((acc, item) => acc + parseLitersToNumber(item.litros), 0);
    const totalValor = records.reduce((acc, item) => acc + parseCurrencyToNumber(item.valor), 0);

    summary.innerHTML = `
      <div class="auth-summary-card"><span>Registros</span><strong>${totalRegistros}</strong></div>
      <div class="auth-summary-card"><span>Total em litros</span><strong>${totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
      <div class="auth-summary-card"><span>Total abastecido</span><strong>${formatCurrencyBr(totalValor)}</strong></div>
    `;

    if (!records.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Nenhum abastecimento encontrado para este perfil.</div>';
      return;
    }

    list.innerHTML = records.map((record) => {
      const valorFormatado = formatCurrencyBr(record.valor);
      const litrosFormatados = parseLitersToNumber(record.litros).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const createdAt = record.created_at ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(record.created_at)) : '-';
      const adminMeta = isAdmin() ? `<div class="auth-record-meta"><span>Usuário</span><strong>${safeText(record.profiles?.nome || record.profiles?.email || record.user_id, '-')}</strong></div>` : '';
      return `
        <article class="auth-record-card">
          <div class="auth-record-topline">
            <div>
              <div class="auth-record-title">${safeText(record.posto, 'Posto não informado')}</div>
              <div class="auth-record-subtitle">${safeText(record.cidade, 'Cidade não informada')} • ${formatDateBr(record.data_abastecimento)}</div>
            </div>
            <div class="auth-record-badge">${valorFormatado}</div>
          </div>
          <div class="auth-record-grid">
            <div class="auth-record-meta"><span>Motorista</span><strong>${safeText(record.motorista, '-')}</strong></div>
            <div class="auth-record-meta"><span>KM atual</span><strong>${safeText(record.km_atual, '-')}</strong></div>
            <div class="auth-record-meta"><span>Litros</span><strong>${litrosFormatados}</strong></div>
            <div class="auth-record-meta"><span>Registro online</span><strong>${createdAt}</strong></div>
            ${adminMeta}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderStations(stations) {
    const summary = document.getElementById('admin-stations-summary');
    const list = document.getElementById('admin-stations-list');
    if (!summary || !list) return;
    const uniqueCities = [...new Set(stations.map((item) => safeText(item.cidade).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    summary.innerHTML = `<span>${stations.length} posto(s)</span><span>${uniqueCities.length} cidade(s)</span>`;
    if (!stations.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-500">Nenhum posto adicional cadastrado.</div>';
      return;
    }
    list.innerHTML = stations.map((station) => `
      <article class="auth-admin-list-card">
        <div class="auth-admin-list-card__top"><div><h4>${safeText(station.nome, 'Posto sem nome')}</h4><p>${safeText(station.cidade, 'Cidade não informada')}</p></div><span class="auth-admin-chip">${safeText(station.status, 'ativo')}</span></div>
        <div class="auth-admin-list-card__meta"><span><strong>Endereço:</strong> ${safeText(station.endereco, 'Não informado')}</span><span><strong>Telefone:</strong> ${safeText(station.telefone, 'Não informado')}</span></div>
      </article>
    `).join('');
  }

  function renderDrivers(drivers) {
    const summary = document.getElementById('admin-drivers-summary');
    const list = document.getElementById('admin-drivers-list');
    if (!summary || !list) return;
    summary.innerHTML = `<span>${drivers.length} motorista(s)</span><span>${drivers.filter((item) => safeText(item.placa)).length} com placa vinculada</span>`;
    if (!drivers.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-500">Nenhum motorista cadastrado.</div>';
      return;
    }
    list.innerHTML = drivers.map((driver) => `
      <article class="auth-admin-list-card">
        <div class="auth-admin-list-card__top"><div><h4>${safeText(driver.nome, 'Motorista sem nome')}</h4><p>${safeText(driver.placa, 'Sem placa vinculada')}</p></div><span class="auth-admin-chip">${safeText(driver.cpf, 'Sem CPF')}</span></div>
        <div class="auth-admin-list-card__meta"><span><strong>Telefone:</strong> ${safeText(driver.telefone, 'Não informado')}</span><span><strong>Criado em:</strong> ${driver.created_at ? formatDateBr(driver.created_at) : '-'}</span></div>
      </article>
    `).join('');
  }

  async function fetchRecords() {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      currentRecords = [];
      renderRecords([]);
      renderHomeRecords([]);
      return [];
    }

    try {
      let query = client.from('fuel_records').select('*, profiles(nome, email)').order('data_abastecimento', { ascending: false }).order('created_at', { ascending: false });
      if (!isAdmin()) query = query.eq('user_id', currentSession.user.id);
      const result = await query;
      if (result.error) throw result.error;
      currentRecords = Array.isArray(result.data) ? result.data : [];
      renderRecords(currentRecords);
      renderHomeRecords(currentRecords);
      return currentRecords;
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
      currentRecords = [];
      renderRecords([]);
      renderHomeRecords([]);
      showAuthError('Não foi possível carregar o histórico agora.');
      return [];
    }
  }

  async function loadAdminStations() {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      adminStations = [];
      syncStationsIntoApp();
      renderStations(adminStations);
      populateCitySelect();
      populateStationSelect(document.getElementById('fuel-city')?.value || '');
      return [];
    }

    try {
      const result = await client.from('stations').select('*').order('cidade', { ascending: true }).order('nome', { ascending: true });
      if (result.error) throw result.error;
      adminStations = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.warn('Não foi possível carregar postos adicionais:', error);
      adminStations = [];
    }

    syncStationsIntoApp();
    populateCitySelect();
    populateStationSelect(document.getElementById('fuel-city')?.value || '');
    renderStations(adminStations);
    return adminStations;
  }

  async function loadDrivers() {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      adminDrivers = [];
      populateDriversDatalist();
      renderDrivers(adminDrivers);
      return [];
    }

    try {
      const result = await client.from('drivers').select('*').order('nome', { ascending: true });
      if (result.error) throw result.error;
      adminDrivers = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.warn('Não foi possível carregar motoristas:', error);
      adminDrivers = [];
    }

    populateDriversDatalist();
    renderDrivers(adminDrivers);
    return adminDrivers;
  }

  async function saveFuelRecord(payload) {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) return { skipped: true };
    const insertPayload = {
      user_id: currentSession.user.id,
      motorista: payload.motorista,
      cidade: payload.cidade,
      posto: payload.posto,
      km_atual: Number(payload.km_atual || 0),
      litros: Number(payload.litros || 0),
      valor: Number(payload.valor || 0),
      data_abastecimento: payload.data_abastecimento,
      comprovante_url: payload.comprovante_url || null
    };
    const result = await client.from('fuel_records').insert(insertPayload);
    if (result.error) throw result.error;
    return { ok: true };
  }

  async function saveStation(payload) {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) throw new Error('auth_required');
    const result = await client.from('stations').insert({
      cidade: safeText(payload.cidade).trim(),
      nome: safeText(payload.nome).trim(),
      endereco: safeText(payload.endereco).trim(),
      telefone: safeText(payload.telefone).trim(),
      mapa_url: safeText(payload.mapa_url).trim(),
      status: 'ativo'
    });
    if (result.error) throw result.error;
  }

  async function saveDriver(payload) {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) throw new Error('auth_required');
    const result = await client.from('drivers').insert({
      nome: safeText(payload.nome).trim(),
      cpf: safeText(payload.cpf).trim(),
      telefone: safeText(payload.telefone).trim(),
      placa: safeText(payload.placa).trim()
    });
    if (result.error) throw result.error;
  }

  function resetLoadingState() {
    for (let i = 1; i <= 5; i += 1) {
      const iconEl = document.getElementById(`step-${i}-icon`);
      const circle = iconEl ? iconEl.querySelector('div') : null;
      const spinner = document.getElementById(`step-${i}-spinner`);
      const checkmark = document.getElementById(`step-${i}-check`);
      if (circle) {
        circle.classList.remove('border-green-600', 'bg-green-50');
        circle.classList.add('border-gray-300');
      }
      if (spinner) spinner.classList.add('hidden');
      if (checkmark) checkmark.classList.add('hidden');
    }
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = '0%';
  }

  function closeAuthPanelInternal() {
    const modal = document.getElementById('auth-panel-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function applyAuthIntent() {
    const intent = consumeIntent();
    if (!intent || !currentSession || !currentSession.user) return;
    if (intent === 'history') return window.openAuthPanel();
    if (intent === 'fuel-form' && typeof window.openFuelFormMenu === 'function') return window.openFuelFormMenu();
    if (intent === 'dashboard' && typeof window.showDashboard === 'function') return window.showDashboard();
    if (intent === 'home' && typeof window.goToWelcome === 'function') return window.goToWelcome();
  }

  function installActionGuards() {
    if (typeof window.openFuelFormMenu === 'function') {
      const originalOpenFuelFormMenu = window.openFuelFormMenu;
      window.openFuelFormMenu = function guardedOpenFuelFormMenu() {
        if (!requireAuth('fuel-form')) return;
        const result = originalOpenFuelFormMenu.apply(this, arguments);
        populateCitySelect();
        populateStationSelect('');
        return result;
      };
    }

    if (typeof window.openFuelForm === 'function') {
      const originalOpenFuelForm = window.openFuelForm;
      window.openFuelForm = function guardedOpenFuelForm(postoNome, cidadeNome) {
        if (!requireAuth('fuel-form')) return;
        const result = originalOpenFuelForm.apply(this, arguments);
        populateCitySelect(cidadeNome || '');
        populateStationSelect(cidadeNome || '', postoNome || '');
        return result;
      };
    }

    if (typeof window.goToWelcome === 'function') {
      const originalGoToWelcome = window.goToWelcome;
      window.goToWelcome = function guardedGoToWelcome() {
        if (!requireAuth('home')) return;
        return originalGoToWelcome.apply(this, arguments);
      };
    }

    if (typeof window.showDashboard === 'function') {
      const originalShowDashboard = window.showDashboard;
      window.showDashboard = function guardedShowDashboard() {
        if (!requireAuth('dashboard')) return;
        return originalShowDashboard.apply(this, arguments);
      };
    }

    const citySelect = document.getElementById('fuel-city');
    if (citySelect) citySelect.addEventListener('change', function onAuthManagedCityChange() { populateStationSelect(this.value); });

    window.submitFuelForm = async function submitFuelFormWithAuth(e) {
      e.preventDefault();
      if (!requireAuth('fuel-form')) return;

      const motorista = document.getElementById('driver-name').value;
      const cidade = document.getElementById('fuel-city').value;
      const posto = document.getElementById('fuel-station').value;
      const kmAtual = document.getElementById('fuel-km').value.trim();
      const litros = document.getElementById('fuel-liters').value.trim();
      const valor = document.getElementById('fuel-value').value.trim();
      const data = document.getElementById('fuel-date').value;
      const fileInput = document.getElementById('fuel-photo');

      if (!kmAtual) return showAuthError('Informe o KM atual do veículo.');
      if (!litros) return showAuthError('Informe a quantidade de litros.');
      if (!valor) return showAuthError('Informe o valor do abastecimento.');
      if (!fileInput.files || !fileInput.files.length) return showAuthError('Selecione uma foto do comprovante.');

      const file = fileInput.files[0];
      const dataFormatada = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
      const whatsappMessage = `🚗 *NOVO REGISTRO DE ABASTECIMENTO*%0A%0A👤 *Motorista:* ${motorista}%0A📍 *Cidade:* ${cidade}%0A⛽ *Posto:* ${posto}%0A🧭 *KM Atual:* ${kmAtual}%0A🛢️ *Litros:* ${litros}%0A💵 *Valor:* ${valor}%0A📅 *Data:* ${dataFormatada}`;
      const whatsappUrl = `https://wa.me/27998041452?text=${whatsappMessage}`;

      document.getElementById('loading-modal').classList.remove('hidden');
      document.getElementById('fuel-form-modal').classList.add('hidden');

      const reader = new FileReader();
      reader.onload = async function onFileLoaded(fileData) {
        try {
          const progressPromise = window.simulateProgress();
          const sendFormData = new FormData();
          sendFormData.append('nome', motorista);
          sendFormData.append('kmAtual', kmAtual);
          sendFormData.append('litros', litros);
          sendFormData.append('valor', valor);
          sendFormData.append('image', fileData.target.result);
          await fetch(APPS_SCRIPT_URL, { method: 'POST', body: sendFormData, mode: 'no-cors' });

          try {
            await saveFuelRecord({ motorista, cidade, posto, km_atual: kmAtual, litros: parseLitersToNumber(litros), valor: parseCurrencyToNumber(valor), data_abastecimento: data, comprovante_url: 'upload_apps_script' });
          } catch (saveError) {
            console.error('Erro ao salvar no Supabase:', saveError);
          }

          await progressPromise;
          setTimeout(() => {
            fileInput.value = '';
            document.getElementById('fuel-form').reset();
            document.getElementById('loading-modal').classList.add('hidden');
            if (typeof window.closeFuelForm === 'function') window.closeFuelForm();
            resetLoadingState();
            fetchRecords();
            window.open(whatsappUrl, '_blank');
            showAuthSuccess('Abastecimento registrado com sucesso.');
          }, 300);
        } catch (error) {
          console.error('Erro ao enviar abastecimento:', error);
          showAuthError('Erro ao enviar o comprovante. Tente novamente.');
          document.getElementById('loading-modal').classList.add('hidden');
          document.getElementById('fuel-form-modal').classList.remove('hidden');
          resetLoadingState();
        }
      };
      reader.readAsDataURL(file);
    };
  }

  function bindAdminForms() {
    const stationForm = document.getElementById('admin-station-form');
    const driverForm = document.getElementById('admin-driver-form');

    if (stationForm) {
      stationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!isAdmin()) return showAuthError('Apenas administradores podem cadastrar postos.');
        try {
          await saveStation({
            cidade: document.getElementById('admin-station-city').value,
            nome: document.getElementById('admin-station-name').value,
            endereco: document.getElementById('admin-station-address').value,
            telefone: document.getElementById('admin-station-phone').value,
            mapa_url: document.getElementById('admin-station-map').value
          });
          stationForm.reset();
          await loadAdminStations();
          showAuthSuccess('Posto salvo com sucesso.');
        } catch (error) {
          console.error('Erro ao salvar posto:', error);
          showAuthError('Não foi possível salvar o posto. Confira as policies do Supabase para administradores.');
        }
      });
    }

    if (driverForm) {
      driverForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!isAdmin()) return showAuthError('Apenas administradores podem cadastrar motoristas.');
        try {
          await saveDriver({
            nome: document.getElementById('admin-driver-name').value,
            cpf: document.getElementById('admin-driver-cpf').value,
            telefone: document.getElementById('admin-driver-phone').value,
            placa: document.getElementById('admin-driver-plate').value
          });
          driverForm.reset();
          await loadDrivers();
          showAuthSuccess('Motorista salvo com sucesso.');
        } catch (error) {
          console.error('Erro ao salvar motorista:', error);
          showAuthError('Não foi possível salvar o motorista. Confira as policies do Supabase para administradores.');
        }
      });
    }
  }

  window.closeAuthPanel = closeAuthPanelInternal;
  window.switchAuthTab = function switchAuthTab(tabName) {
    if (tabName !== 'records' && !isAdmin()) return;
    currentAuthTab = tabName;
    updateAuthTabUi();
  };

  window.openAuthPanel = async function openAuthPanel() {
    if (!requireAuth('history')) return;
    const modal = document.getElementById('auth-panel-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    await window.refreshAuthPanel();
  };

  window.refreshAuthRecords = async function refreshAuthRecords() {
    return fetchRecords();
  };

  window.refreshAuthPanel = async function refreshAuthPanel() {
    if (!requireAuth('history')) return;
    await fetchRecords();
    await loadAdminStations();
    await loadDrivers();
    updateAuthTabUi();
  };

  window.signInWithGoogle = async function signInWithGoogle() {
    const client = getSupabaseClient();
    if (!client) return showAuthError('Não foi possível iniciar o login agora.');
    try {
      updateGateStatus('Redirecionando para o Google...');
      await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getPreferredRedirectUrl() } });
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      updateGateStatus('Falha ao iniciar o login. Tente novamente.');
      showAuthError('Não foi possível iniciar o login com Google.');
    }
  };

  window.signOutUser = async function signOutUser() {
    const client = getSupabaseClient();
    if (!client) return;
    try { await client.auth.signOut(); } catch (error) { console.error('Erro ao encerrar sessão:', error); }
    closeAuthPanelInternal();
    currentSession = null;
    currentProfile = null;
    currentRecords = [];
    adminStations = [];
    adminDrivers = [];
    syncStationsIntoApp();
    populateCitySelect();
    populateStationSelect('');
    populateDriversDatalist();
    updateAuthUi();
    updateGateStatus('Sessão encerrada. Entre novamente para continuar.');
    setGateVisibility(true);
  };

  async function bootstrapAuth() {
    const client = getSupabaseClient();
    installActionGuards();
    bindAdminForms();
    syncStationsIntoApp();
    populateCitySelect();
    populateStationSelect('');
    populateDriversDatalist();
    setGateVisibility(true);
    updateGateStatus('Verificando sua sessão...');

    if (!client) {
      console.warn('Supabase não disponível; módulo segue sem autenticação.');
      updateAuthUi();
      updateGateStatus('Não foi possível conectar ao login agora.');
      return;
    }

    const authError = getAuthErrorFromLocation();
    if (authError) {
      console.error('Erro retornado pelo callback OAuth:', authError);
      currentSession = null;
      currentProfile = null;
      updateAuthUi();
      updateGateStatus(`Falha no retorno do login: ${authError}`);
      showAuthError(`Não foi possível concluir o login com Google: ${authError}`);
      clearAuthParamsFromUrl();
      return;
    }

    const authCode = getAuthCodeFromLocation();
    if (authCode) {
      try {
        updateGateStatus('Concluindo seu login...');
        await withTimeout(client.auth.exchangeCodeForSession(authCode), 5000);
        clearAuthParamsFromUrl();
      } catch (exchangeError) {
        console.error('Erro ao trocar code por sessão:', exchangeError);
        currentSession = null;
        currentProfile = null;
        updateAuthUi();
        updateGateStatus('O login voltou, mas a sessão não foi concluída.');
        showAuthError('Não foi possível concluir a autenticação. Verifique as configurações e tente novamente.');
        return;
      }
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session || null;
      if (currentSession && currentSession.user) {
        currentProfile = { id: currentSession.user.id, nome: getUserDisplayName(currentSession.user, null), email: currentSession.user.email || '', perfil: 'motorista', status: 'ativo' };
        updateAuthUi();
        try {
          await withTimeout(ensureProfile(currentSession.user), 2500);
          await loadAdminStations();
          await loadDrivers();
        } catch (profileError) {
          console.warn('Perfil não confirmou no onAuthStateChange:', profileError);
        }
      } else {
        currentProfile = null;
        adminStations = [];
        adminDrivers = [];
      }
      updateAuthUi();
    });

    try {
      await withTimeout(refreshSessionState(), 3500);
      await loadAdminStations();
      await loadDrivers();
    } catch (sessionError) {
      console.error('Sessão demorou além do esperado:', sessionError);
      currentSession = null;
      currentProfile = null;
      updateAuthUi();
      updateGateStatus('Sessão não confirmada. Clique em Entrar com Google.');
    }

    updateGateStatus(currentSession && currentSession.user ? 'Sessão confirmada.' : 'Sessão não encontrada. Clique em Entrar com Google.');
    applyAuthIntent();
  }

  document.addEventListener('DOMContentLoaded', bootstrapAuth);
})();

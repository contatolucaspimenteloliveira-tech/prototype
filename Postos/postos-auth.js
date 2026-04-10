(() => {
  const SUPABASE_URL = 'https://kriofoapvvumjukzeprp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yUpRvqk0Dnm0uWYokMSiRw_yVQaUDZE';
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzylmjkf8yluRHEIEkXsutnGRi4I3XIcpgalHZfYLNafXIp6De2UMQHuxweB6FfvQ0J/exec';
  const AUTH_INTENT_KEY = 'postos_auth_intent';

  let supabaseClient = null;
  let currentSession = null;
  let currentProfile = null;
(() => {
  const SUPABASE_URL = 'https://kriofoapvvumjukzeprp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yUpRvqk0Dnm0uWYokMSiRw_yVQaUDZE';
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzylmjkf8yluRHEIEkXsutnGRi4I3XIcpgalHZfYLNafXIp6De2UMQHuxweB6FfvQ0J/exec';
  const AUTH_INTENT_KEY = 'postos_auth_intent';

  let supabaseClient = null;
  let currentSession = null;
  let currentProfile = null;

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), ms);
      })
    ]);
  }

  function getSupabaseLib() {
    return window.supabase || globalThis.supabase || null;
  }

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;

    const lib = getSupabaseLib();
    if (!lib || typeof lib.createClient !== 'function') {
      return null;
    }

    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return supabaseClient;
  }

  function updateGateStatus(text) {
    const status = document.getElementById('auth-gate-status');
    if (status) status.textContent = text;
  }

  function setGateVisibility(visible) {
    const gate = document.getElementById('auth-gate');
    if (!gate) return;

    if (visible) {
      gate.classList.remove('hidden');
      gate.classList.add('block');
      document.body.style.overflow = 'hidden';
    } else {
      gate.classList.add('hidden');
      gate.classList.remove('block');
      document.body.style.overflow = '';
    }
  }

  function clearAuthParamsFromUrl() {
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      url.searchParams.delete('error');
      url.searchParams.delete('error_code');
      url.searchParams.delete('error_description');
      url.searchParams.delete('sb');
      window.history.replaceState({}, document.title, url.toString());
    } catch (_error) {}
  }

  function getAuthErrorFromLocation() {
    try {
      const url = new URL(window.location.href);
      const hash = url.hash ? new URLSearchParams(url.hash.replace(/^#/, '')) : null;
      const search = url.searchParams;
      const error = search.get('error') || (hash && hash.get('error'));
      const description = search.get('error_description') || (hash && hash.get('error_description'));
      if (!error && !description) return '';
      return decodeURIComponent(description || error || '');
    } catch (_error) {
      return '';
    }
  }

  function safeText(value, fallback) {
    if (value === null || value === undefined || value === '') {
      return fallback || '';
    }
    return String(value);
  }

  function getUserDisplayName(user, profile) {
    if (profile && profile.nome) return profile.nome;
    if (user && user.user_metadata) {
      return user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.nome || user.email || 'Usuário';
    }
    return (user && user.email) || 'Usuário';
  }

  function formatCurrencyBr(value) {
    const numeric = Number(value || 0);
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseCurrencyToNumber(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function parseLitersToNumber(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatDateBr(value) {
    if (!value) return '-';
    try {
      const date = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (_error) {
      return String(value);
    }
  }

  function setIntent(intent) {
    try {
      localStorage.setItem(AUTH_INTENT_KEY, intent);
    } catch (_error) {}
  }

  function consumeIntent() {
    let intent = '';
    try {
      intent = localStorage.getItem(AUTH_INTENT_KEY) || '';
      localStorage.removeItem(AUTH_INTENT_KEY);
    } catch (_error) {}
    return intent;
  }

  function showAuthError(message) {
    if (typeof window.showErrorMessage === 'function') {
      window.showErrorMessage(message);
      return;
    }
    alert(message);
  }

  function showAuthSuccess(message) {
    if (typeof window.showSuccessMessage === 'function') {
      window.showSuccessMessage(message);
      return;
    }
    alert(message);
  }

  function updateAuthUi() {
    const loginButton = document.getElementById('login-google-btn');
    const userPanel = document.getElementById('auth-user-panel');
    const userName = document.getElementById('auth-user-name');
    const panelUserName = document.getElementById('auth-panel-user-name');
    const badge = document.getElementById('auth-role-badge');

    if (!loginButton || !userPanel || !userName || !panelUserName || !badge) return;

    if (currentSession && currentSession.user) {
      const displayName = getUserDisplayName(currentSession.user, currentProfile);
      loginButton.classList.add('hidden');
      userPanel.classList.remove('hidden');
      userName.textContent = displayName;
      panelUserName.textContent = displayName;

      if (currentProfile && currentProfile.perfil === 'admin') {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }

      setGateVisibility(false);
    } else {
      loginButton.classList.remove('hidden');
      userPanel.classList.add('hidden');
      badge.classList.add('hidden');
      userName.textContent = 'Usuário';
      panelUserName.textContent = 'Usuário';
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
      const upsertResult = await client
        .from('profiles')
        .upsert(fallbackProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (!upsertResult.error && upsertResult.data) {
        currentProfile = upsertResult.data;
        return currentProfile;
      }
    } catch (error) {
      console.warn('Falha ao fazer upsert do perfil:', error);
    }

    try {
      const selectResult = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

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
        currentProfile = {
          id: currentSession.user.id,
          nome: getUserDisplayName(currentSession.user, null),
          email: currentSession.user.email || '',
          perfil: 'motorista',
          status: 'ativo'
        };
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
    if (currentSession && currentSession.user) {
      return true;
    }

    if (intent) {
      setIntent(intent);
    }

    updateGateStatus('Entre com Google para acessar o aplicativo.');
    setGateVisibility(true);
    return false;
  }

  function renderRecords(records) {
    const summary = document.getElementById('auth-records-summary');
    const list = document.getElementById('auth-records-list');
    if (!summary || !list) return;

    const totalRegistros = records.length;
    const totalLitros = records.reduce((acc, item) => acc + parseLitersToNumber(item.litros), 0);
    const totalValor = records.reduce((acc, item) => acc + parseCurrencyToNumber(item.valor), 0);

    summary.innerHTML = `
      <div class="auth-summary-card">
        <span>Registros</span>
        <strong>${totalRegistros}</strong>
      </div>
      <div class="auth-summary-card">
        <span>Total em litros</span>
        <strong>${totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>
      <div class="auth-summary-card">
        <span>Total abastecido</span>
        <strong>${formatCurrencyBr(totalValor)}</strong>
      </div>
    `;

    if (!records.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Nenhum abastecimento encontrado para este usuário.</div>';
      return;
    }

    list.innerHTML = records.map((record) => {
      const valorFormatado = formatCurrencyBr(record.valor);
      const litrosFormatados = parseLitersToNumber(record.litros).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const createdAt = record.created_at ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(record.created_at)) : '-';

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
            <div class="auth-record-meta">
              <span>Motorista</span>
              <strong>${safeText(record.motorista, '-')}</strong>
            </div>
            <div class="auth-record-meta">
              <span>KM atual</span>
              <strong>${safeText(record.km_atual, '-')}</strong>
            </div>
            <div class="auth-record-meta">
              <span>Litros</span>
              <strong>${litrosFormatados}</strong>
            </div>
            <div class="auth-record-meta">
              <span>Registro online</span>
              <strong>${createdAt}</strong>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  async function fetchRecords() {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      renderRecords([]);
      return [];
    }

    try {
      let query = client
        .from('fuel_records')
        .select('*')
        .order('data_abastecimento', { ascending: false })
        .order('created_at', { ascending: false });

      if (!currentProfile || currentProfile.perfil !== 'admin') {
        query = query.eq('user_id', currentSession.user.id);
      }

      const result = await query;
      if (result.error) throw result.error;

      const records = Array.isArray(result.data) ? result.data : [];
      renderRecords(records);
      return records;
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
      renderRecords([]);
      showAuthError('Não foi possível carregar seu histórico agora.');
      return [];
    }
  }

  async function saveFuelRecord(payload) {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      return { skipped: true };
    }

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

  window.closeAuthPanel = closeAuthPanelInternal;

  window.openAuthPanel = async function openAuthPanel() {
    if (!requireAuth('history')) return;
    const modal = document.getElementById('auth-panel-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    await window.refreshAuthRecords();
  };

  window.refreshAuthRecords = async function refreshAuthRecords() {
    if (!requireAuth('history')) return;
    await fetchRecords();
  };

  window.signInWithGoogle = async function signInWithGoogle() {
    const client = getSupabaseClient();
    if (!client) {
      showAuthError('Não foi possível iniciar o login agora.');
      return;
    }

    try {
      updateGateStatus('Redirecionando para o Google...');
      await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
    } catch (error) {
      console.error('Erro ao iniciar login Google:', error);
      showAuthError('Não foi possível iniciar o login com Google.');
      updateGateStatus('Não foi possível iniciar o login com Google.');
    }
  };

  window.signOutUser = async function signOutUser() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair da sessão:', error);
    }

    currentSession = null;
    currentProfile = null;
    updateAuthUi();
    closeAuthPanelInternal();
    updateGateStatus('Sessão encerrada. Entre com Google para continuar.');
    showAuthSuccess('Sessão encerrada com sucesso.');
  };

  function applyAuthIntent() {
    const intent = consumeIntent();
    if (!intent) return;

    if (intent === 'fuel-form' && typeof window.openFuelFormMenu === 'function') {
      window.openFuelFormMenu();
    }

    if (intent === 'history') {
      window.openAuthPanel();
    }
  }

  function installActionGuards() {
    if (typeof window.openFuelFormMenu === 'function') {
      const originalOpenFuelFormMenu = window.openFuelFormMenu;
      window.openFuelFormMenu = function guardedOpenFuelFormMenu() {
        if (!requireAuth('fuel-form')) return;
        return originalOpenFuelFormMenu.apply(this, arguments);
      };
    }

    if (typeof window.openFuelForm === 'function') {
      const originalOpenFuelForm = window.openFuelForm;
      window.openFuelForm = function guardedOpenFuelForm() {
        if (!requireAuth('fuel-form')) return;
        return originalOpenFuelForm.apply(this, arguments);
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

      if (!kmAtual) {
        showAuthError('Informe o KM atual do veículo');
        return;
      }

      if (!litros) {
        showAuthError('Informe a quantidade de litros');
        return;
      }

      if (!valor) {
        showAuthError('Informe o valor do abastecimento');
        return;
      }

      if (!fileInput.files || fileInput.files.length === 0) {
        showAuthError('Por favor, selecione uma foto do comprovante');
        return;
      }

      const file = fileInput.files[0];
      const dateObj = new Date(data + 'T00:00:00');
      const dataFormatada = dateObj.toLocaleDateString('pt-BR');

      const mensagem = `🚗 *NOVO REGISTRO DE ABASTECIMENTO*%0A%0A👤 *Motorista:* ${motorista}%0A📍 *Cidade:* ${cidade}%0A⛽ *Posto:* ${posto}%0A🧭 *KM Atual:* ${kmAtual}%0A🛢️ *Litros:* ${litros}%0A💵 *Valor:* ${valor}%0A📅 *Data:* ${dataFormatada}`;
      const whatsappUrl = `https://wa.me/27998041452?text=${mensagem}`;

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

          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: sendFormData,
            mode: 'no-cors'
          });

          try {
            await saveFuelRecord({
              motorista,
              cidade,
              posto,
              km_atual: kmAtual,
              litros: parseLitersToNumber(litros),
              valor: parseCurrencyToNumber(valor),
              data_abastecimento: data,
              comprovante_url: 'upload_apps_script'
            });
          } catch (saveError) {
            console.error('Erro ao salvar no Supabase:', saveError);
          }

          await progressPromise;

          setTimeout(() => {
            fileInput.value = '';
            document.getElementById('fuel-form').reset();
            document.getElementById('loading-modal').classList.add('hidden');
            if (typeof window.closeFuelForm === 'function') {
              window.closeFuelForm();
            }
            resetLoadingState();
            fetchRecords();
            window.open(whatsappUrl, '_blank');
            showAuthSuccess('Abastecimento registrado com sucesso.');
          }, 300);
        } catch (error) {
          console.error('Erro ao enviar abastecimento:', error);
          showAuthError('Erro ao enviar foto. Tente novamente.');
          document.getElementById('loading-modal').classList.add('hidden');
          document.getElementById('fuel-form-modal').classList.remove('hidden');
          resetLoadingState();
        }
      };

      reader.readAsDataURL(file);
    };
  }

  async function bootstrapAuth() {
    const client = getSupabaseClient();
    installActionGuards();
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
      updateGateStatus('Não foi possível concluir o login. Tente novamente.');
      showAuthError('Não foi possível concluir o login com Google.');
      clearAuthParamsFromUrl();
      return;
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session || null;
      if (currentSession && currentSession.user) {
        currentProfile = {
          id: currentSession.user.id,
          nome: getUserDisplayName(currentSession.user, null),
          email: currentSession.user.email || '',
          perfil: 'motorista',
          status: 'ativo'
        };
        updateAuthUi();
        try {
          await withTimeout(ensureProfile(currentSession.user), 2500);
        } catch (profileError) {
          console.warn('Perfil não confirmou no onAuthStateChange:', profileError);
        }
      } else {
        currentProfile = null;
      }
      updateAuthUi();
    });

    try {
      await withTimeout(refreshSessionState(), 3500);
    } catch (sessionError) {
      console.error('Sessão demorou além do esperado:', sessionError);
      currentSession = null;
      currentProfile = null;
      updateAuthUi();
      updateGateStatus('Sessão não confirmada. Clique para entrar com Google.');
    }
    applyAuthIntent();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bootstrapAuth();
  });
})();

  function getSupabaseLib() {
    return window.supabase || globalThis.supabase || null;
  }

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;

    const lib = getSupabaseLib();
    if (!lib || typeof lib.createClient !== 'function') {
      return null;
    }

    supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return supabaseClient;
  }

  function updateGateStatus(text) {
    const status = document.getElementById('auth-gate-status');
    if (status) status.textContent = text;
  }

  function setGateVisibility(visible) {
    const gate = document.getElementById('auth-gate');
    if (!gate) return;

    if (visible) {
      gate.classList.remove('hidden');
      gate.classList.add('block');
      document.body.style.overflow = 'hidden';
    } else {
      gate.classList.add('hidden');
      gate.classList.remove('block');
      document.body.style.overflow = '';
    }
  }

  function safeText(value, fallback) {
    if (value === null || value === undefined || value === '') {
      return fallback || '';
    }
    return String(value);
  }

  function getUserDisplayName(user, profile) {
    if (profile && profile.nome) return profile.nome;
    if (user && user.user_metadata) {
      return user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.nome || user.email || 'Usuário';
    }
    return (user && user.email) || 'Usuário';
  }

  function formatCurrencyBr(value) {
    const numeric = Number(value || 0);
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseCurrencyToNumber(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function parseLitersToNumber(value) {
    if (!value) return 0;
    const normalized = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatDateBr(value) {
    if (!value) return '-';
    try {
      const date = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (_error) {
      return String(value);
    }
  }

  function setIntent(intent) {
    try {
      localStorage.setItem(AUTH_INTENT_KEY, intent);
    } catch (_error) {}
  }

  function consumeIntent() {
    let intent = '';
    try {
      intent = localStorage.getItem(AUTH_INTENT_KEY) || '';
      localStorage.removeItem(AUTH_INTENT_KEY);
    } catch (_error) {}
    return intent;
  }

  function showAuthError(message) {
    if (typeof window.showErrorMessage === 'function') {
      window.showErrorMessage(message);
      return;
    }
    alert(message);
  }

  function showAuthSuccess(message) {
    if (typeof window.showSuccessMessage === 'function') {
      window.showSuccessMessage(message);
      return;
    }
    alert(message);
  }

  function updateAuthUi() {
    const loginButton = document.getElementById('login-google-btn');
    const userPanel = document.getElementById('auth-user-panel');
    const userName = document.getElementById('auth-user-name');
    const panelUserName = document.getElementById('auth-panel-user-name');
    const badge = document.getElementById('auth-role-badge');

    if (!loginButton || !userPanel || !userName || !panelUserName || !badge) return;

    if (currentSession && currentSession.user) {
      const displayName = getUserDisplayName(currentSession.user, currentProfile);
      loginButton.classList.add('hidden');
      userPanel.classList.remove('hidden');
      userName.textContent = displayName;
      panelUserName.textContent = displayName;

      if (currentProfile && currentProfile.perfil === 'admin') {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }

      setGateVisibility(false);
    } else {
      loginButton.classList.remove('hidden');
      userPanel.classList.add('hidden');
      badge.classList.add('hidden');
      userName.textContent = 'Usuário';
      panelUserName.textContent = 'Usuário';
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
      const upsertResult = await client
        .from('profiles')
        .upsert(fallbackProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (!upsertResult.error && upsertResult.data) {
        currentProfile = upsertResult.data;
        return currentProfile;
      }
    } catch (error) {
      console.warn('Falha ao fazer upsert do perfil:', error);
    }

    try {
      const selectResult = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

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
        await ensureProfile(currentSession.user);
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
    if (currentSession && currentSession.user) {
      return true;
    }

    if (intent) {
      setIntent(intent);
    }

    updateGateStatus('Entre com Google para acessar o aplicativo.');
    setGateVisibility(true);
    return false;
  }

  function renderRecords(records) {
    const summary = document.getElementById('auth-records-summary');
    const list = document.getElementById('auth-records-list');
    if (!summary || !list) return;

    const totalRegistros = records.length;
    const totalLitros = records.reduce((acc, item) => acc + parseLitersToNumber(item.litros), 0);
    const totalValor = records.reduce((acc, item) => acc + parseCurrencyToNumber(item.valor), 0);

    summary.innerHTML = `
      <div class="auth-summary-card">
        <span>Registros</span>
        <strong>${totalRegistros}</strong>
      </div>
      <div class="auth-summary-card">
        <span>Total em litros</span>
        <strong>${totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>
      <div class="auth-summary-card">
        <span>Total abastecido</span>
        <strong>${formatCurrencyBr(totalValor)}</strong>
      </div>
    `;

    if (!records.length) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Nenhum abastecimento encontrado para este usuário.</div>';
      return;
    }

    list.innerHTML = records.map((record) => {
      const valorFormatado = formatCurrencyBr(record.valor);
      const litrosFormatados = parseLitersToNumber(record.litros).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const createdAt = record.created_at ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(record.created_at)) : '-';

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
            <div class="auth-record-meta">
              <span>Motorista</span>
              <strong>${safeText(record.motorista, '-')}</strong>
            </div>
            <div class="auth-record-meta">
              <span>KM atual</span>
              <strong>${safeText(record.km_atual, '-')}</strong>
            </div>
            <div class="auth-record-meta">
              <span>Litros</span>
              <strong>${litrosFormatados}</strong>
            </div>
            <div class="auth-record-meta">
              <span>Registro online</span>
              <strong>${createdAt}</strong>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  async function fetchRecords() {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      renderRecords([]);
      return [];
    }

    try {
      let query = client
        .from('fuel_records')
        .select('*')
        .order('data_abastecimento', { ascending: false })
        .order('created_at', { ascending: false });

      if (!currentProfile || currentProfile.perfil !== 'admin') {
        query = query.eq('user_id', currentSession.user.id);
      }

      const result = await query;
      if (result.error) throw result.error;

      const records = Array.isArray(result.data) ? result.data : [];
      renderRecords(records);
      return records;
    } catch (error) {
      console.error('Erro ao carregar abastecimentos:', error);
      renderRecords([]);
      showAuthError('Não foi possível carregar seu histórico agora.');
      return [];
    }
  }

  async function saveFuelRecord(payload) {
    const client = getSupabaseClient();
    if (!client || !currentSession || !currentSession.user) {
      return { skipped: true };
    }

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

  window.closeAuthPanel = closeAuthPanelInternal;

  window.openAuthPanel = async function openAuthPanel() {
    if (!requireAuth('history')) return;
    const modal = document.getElementById('auth-panel-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    await window.refreshAuthRecords();
  };

  window.refreshAuthRecords = async function refreshAuthRecords() {
    if (!requireAuth('history')) return;
    await fetchRecords();
  };

  window.signInWithGoogle = async function signInWithGoogle() {
    const client = getSupabaseClient();
    if (!client) {
      showAuthError('Não foi possível iniciar o login agora.');
      return;
    }

    try {
      updateGateStatus('Redirecionando para o Google...');
      await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
    } catch (error) {
      console.error('Erro ao iniciar login Google:', error);
      showAuthError('Não foi possível iniciar o login com Google.');
      updateGateStatus('Não foi possível iniciar o login com Google.');
    }
  };

  window.signOutUser = async function signOutUser() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair da sessão:', error);
    }

    currentSession = null;
    currentProfile = null;
    updateAuthUi();
    closeAuthPanelInternal();
    updateGateStatus('Sessão encerrada. Entre com Google para continuar.');
    showAuthSuccess('Sessão encerrada com sucesso.');
  };

  function applyAuthIntent() {
    const intent = consumeIntent();
    if (!intent) return;

    if (intent === 'fuel-form' && typeof window.openFuelFormMenu === 'function') {
      window.openFuelFormMenu();
    }

    if (intent === 'history') {
      window.openAuthPanel();
    }
  }

  function installActionGuards() {
    if (typeof window.openFuelFormMenu === 'function') {
      const originalOpenFuelFormMenu = window.openFuelFormMenu;
      window.openFuelFormMenu = function guardedOpenFuelFormMenu() {
        if (!requireAuth('fuel-form')) return;
        return originalOpenFuelFormMenu.apply(this, arguments);
      };
    }

    if (typeof window.openFuelForm === 'function') {
      const originalOpenFuelForm = window.openFuelForm;
      window.openFuelForm = function guardedOpenFuelForm() {
        if (!requireAuth('fuel-form')) return;
        return originalOpenFuelForm.apply(this, arguments);
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

      if (!kmAtual) {
        showAuthError('Informe o KM atual do veículo');
        return;
      }

      if (!litros) {
        showAuthError('Informe a quantidade de litros');
        return;
      }

      if (!valor) {
        showAuthError('Informe o valor do abastecimento');
        return;
      }

      if (!fileInput.files || fileInput.files.length === 0) {
        showAuthError('Por favor, selecione uma foto do comprovante');
        return;
      }

      const file = fileInput.files[0];
      const dateObj = new Date(data + 'T00:00:00');
      const dataFormatada = dateObj.toLocaleDateString('pt-BR');

      const mensagem = `🚗 *NOVO REGISTRO DE ABASTECIMENTO*%0A%0A👤 *Motorista:* ${motorista}%0A📍 *Cidade:* ${cidade}%0A⛽ *Posto:* ${posto}%0A🧭 *KM Atual:* ${kmAtual}%0A🛢️ *Litros:* ${litros}%0A💵 *Valor:* ${valor}%0A📅 *Data:* ${dataFormatada}`;
      const whatsappUrl = `https://wa.me/27998041452?text=${mensagem}`;

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

          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: sendFormData,
            mode: 'no-cors'
          });

          try {
            await saveFuelRecord({
              motorista,
              cidade,
              posto,
              km_atual: kmAtual,
              litros: parseLitersToNumber(litros),
              valor: parseCurrencyToNumber(valor),
              data_abastecimento: data,
              comprovante_url: 'upload_apps_script'
            });
          } catch (saveError) {
            console.error('Erro ao salvar no Supabase:', saveError);
          }

          await progressPromise;

          setTimeout(() => {
            fileInput.value = '';
            document.getElementById('fuel-form').reset();
            document.getElementById('loading-modal').classList.add('hidden');
            if (typeof window.closeFuelForm === 'function') {
              window.closeFuelForm();
            }
            resetLoadingState();
            fetchRecords();
            window.open(whatsappUrl, '_blank');
            showAuthSuccess('Abastecimento registrado com sucesso.');
          }, 300);
        } catch (error) {
          console.error('Erro ao enviar abastecimento:', error);
          showAuthError('Erro ao enviar foto. Tente novamente.');
          document.getElementById('loading-modal').classList.add('hidden');
          document.getElementById('fuel-form-modal').classList.remove('hidden');
          resetLoadingState();
        }
      };

      reader.readAsDataURL(file);
    };
  }

  async function bootstrapAuth() {
    const client = getSupabaseClient();
    installActionGuards();
    setGateVisibility(true);
    updateGateStatus('Verificando sua sessão...');

    if (!client) {
      console.warn('Supabase não disponível; módulo segue sem autenticação.');
      updateAuthUi();
      updateGateStatus('Não foi possível conectar ao login agora.');
      return;
    }

    client.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session || null;
      if (currentSession && currentSession.user) {
        await ensureProfile(currentSession.user);
      } else {
        currentProfile = null;
      }
      updateAuthUi();
    });

    await refreshSessionState();
    applyAuthIntent();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bootstrapAuth();
  });
})();

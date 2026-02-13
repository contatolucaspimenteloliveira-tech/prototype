// Página inicial (home)
const pages = {
  inicio: () => `
    <div class="mb-16">
      <h1 id="hero-title" class="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight text-center">
        <span class="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Gestão Empresarial</span>
        <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Completa e Inteligente</span>
      </h1>
      <p id="hero-subtitle" class="text-lg text-slate-300 mb-8 leading-relaxed text-center">Acesse um sistema desenvolvido especialmente para você, reunindo em um só lugar módulos financeiros, gestão de frotas e geração de documentos essenciais. Tudo pensado para oferecer praticidade, rapidez e mais eficiência no dia a dia do seu negócio.</p>
      <div class="flex justify-center">
        <a href="https://gaveblue.com/recibos" target="_blank" rel="noopener noreferrer" class="inline-flex px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl pulse-glow items-center gap-2 w-fit">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Testar Grátis - Gerador de Recibos
        </a>
      </div>
      <div class="flex justify-center items-center gap-2 mt-4">
        <div class="flex gap-1">
          <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg class="w-5 h-5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <span class="text-sm text-slate-300 font-medium">4.99/5</span>
      </div>
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onclick="window.open('https://gaveblue.com/recibos', '_blank')" class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-pointer transition-all hover:border-blue-500/70 hover:shadow-2xl active:scale-95 flex flex-col items-start justify-start relative h-full min-h-56">
          <span class="absolute top-4 right-4 px-3 py-1 bg-green-500/80 text-white text-xs font-semibold rounded-lg">Grátis</span>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 class="font-bold text-white text-lg mb-2">WeRecibos</h3>
          <p class="text-sm text-slate-400">Gere recibos profissionais em segundos</p>
        </button>

        <button onclick="window.open('https://gaveblue.com/relogio', '_blank')" class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-pointer transition-all hover:border-green-500/70 hover:shadow-2xl active:scale-95 flex flex-col items-start justify-start relative h-full min-h-56">
          <span class="absolute top-4 right-4 px-3 py-1 bg-green-500/80 text-white text-xs font-semibold rounded-lg">Grátis</span>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="font-bold text-white text-lg mb-2">WeTime</h3>
          <div id="wetime-display" class="text-2xl font-bold text-green-400 font-mono tracking-wider mb-2">00:00:00</div>
          <p class="text-sm text-slate-400">Relógio Online</p>
        </button>

        <button onclick="window.open('https://gaveblue.com/consultacep', '_blank')" class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-pointer transition-all hover:border-purple-500/70 hover:shadow-2xl active:scale-95 flex flex-col items-start justify-start relative h-full min-h-56">
          <span class="absolute top-4 right-4 px-3 py-1 bg-green-500/80 text-white text-xs font-semibold rounded-lg">Grátis</span>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 class="font-bold text-white text-lg mb-2">WeConsultas</h3>
          <p class="text-sm text-slate-400">Consulte CNPJ, CEP e muito mais</p>
        </button>

        <button onclick="window.open('https://gaveblue.com/testar-html', '_blank')" class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-pointer transition-all hover:border-cyan-500/70 hover:shadow-2xl active:scale-95 flex flex-col items-start justify-start relative h-full min-h-56">
          <span class="absolute top-4 right-4 px-3 py-1 bg-green-500/80 text-white text-xs font-semibold rounded-lg">Grátis</span>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
          <h3 class="font-bold text-white text-lg mb-2">WeDevs</h3>
          <p class="text-sm text-slate-400">Plataforma para desenvolvedores testar HTML</p>
        </button>

        <div class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-not-allowed flex flex-col items-start justify-start relative h-full min-h-56 opacity-60">
          <span class="absolute top-4 right-4 px-3 py-1 bg-slate-600/80 text-white text-xs font-semibold rounded-lg">Em Breve</span>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg class="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm3.5-9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zm-5 0a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/></svg>
          </div>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 class="font-bold text-slate-300 text-lg mb-2">WeFrotas</h3>
          <p class="text-sm text-slate-500">Gestão completa de frotas</p>
        </div>

        <div class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-not-allowed flex flex-col items-start justify-start relative h-full min-h-56 opacity-60">
          <span class="absolute top-4 right-4 px-3 py-1 bg-slate-600/80 text-white text-xs font-semibold rounded-lg">Em Breve</span>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg class="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm3.5-9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zm-5 0a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/></svg>
          </div>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="font-bold text-slate-300 text-lg mb-2">WeFinance</h3>
          <p class="text-sm text-slate-500">Módulo financeiro avançado</p>
        </div>

        <div class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-not-allowed flex flex-col items-start justify-start relative h-full min-h-56 opacity-60">
          <span class="absolute top-4 right-4 px-3 py-1 bg-slate-600/80 text-white text-xs font-semibold rounded-lg">Em Breve</span>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg class="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm3.5-9a1.5 1.5 0 1 1-1.5-1.5 1.5 5 0 0 1 1.5 1.5zm-5 0a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/></svg>
          </div>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h.01" /></svg>
          </div>
          <h3 class="font-bold text-slate-300 text-lg mb-2">WePeople</h3>
          <p class="text-sm text-slate-500">Gestão de recursos humanos</p>
        </div>

        <div class="feature-card card-gradient border border-slate-700/50 rounded-2xl p-8 cursor-not-allowed flex flex-col items-start justify-start relative h-full min-h-56 opacity-60">
          <span class="absolute top-4 right-4 px-3 py-1 bg-slate-600/80 text-white text-xs font-semibold rounded-lg">Em Breve</span>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg class="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm3.5-9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zm-5 0a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z"/></svg>
          </div>
          <div class="icon-container w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 class="font-bold text-slate-300 text-lg mb-2">WeDocs</h3>
          <p class="text-sm text-slate-500">Gerador de documentos</p>
        </div>
      </div>
    </div>

    <div class="mt-2">
      <h2 class="text-3xl font-bold mb-4 text-slate-200">Nossos Parceiros</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 items-center justify-center">
        <div class="border border-slate-600/50 rounded-xl p-6 flex items-center justify-center h-32 hover:border-slate-500 transition-all" style="background: linear-gradient(135deg, #e8f1ff 0%, #d4e6f9 50%, #c0d9f1 100%);">
          <img src="https://i.ibb.co/fGzJKxy8/Grupo-Covre-0000.png" alt="Grupo Covre" class="max-h-24 max-w-full object-contain" loading="lazy">
        </div>
        <div class="border border-slate-600/50 rounded-xl p-6 flex items-center justify-center h-32 hover:border-slate-500 transition-all" style="background: linear-gradient(135deg, #e8f1ff 0%, #d4e6f9 50%, #c0d9f1 100%);">
          <img src="https://i.imgur.com/vxKwUzB.png" alt="Parceiro 2" class="max-h-28 max-w-full object-contain" loading="lazy">
        </div>
        <a href="https://v0-graphic-design-site.vercel.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAP4GRBleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA01NjcwNjczNDMzNTI0MjcAAaexSP5OoLD8P_xSsRZG22fB_zsHEiO_tLP0SpzYN7Y90Dp2k674aBvQK64p5Q_aem_7ZTHnNm_86CRQNOMoRKzgg" target="_blank" rel="noopener noreferrer" class="border border-slate-600/50 rounded-xl flex items-center justify-center h-32 hover:border-slate-500 transition-all overflow-hidden cursor-pointer" style="background: linear-gradient(135deg, #e8f1ff 0%, #d4e6f9 50%, #c0d9f1 100%);">
          <img src="https://imgur.com/BU7PU0Y.png" alt="Parceiro 3" class="h-full w-full object-cover" loading="lazy">
        </a>
      </div>
    </div>
  `
};

function loadPage(pageName) {
  const mainContent = document.getElementById('main-content');
  const pageContent = pages[pageName] ? pages[pageName]() : pages['inicio']();
  mainContent.querySelector('.max-w-7xl').innerHTML = pageContent;

  // Se tiver WeTime display, atualiza relógio
  updateClock();
}

function goToSection(section) {
  loadPage(section);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Carrega página inicial ao abrir
loadPage('inicio');

// Mouse Glow Tracker Effect
const mouseGlow = document.getElementById('mouseGlow');
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

const isMobile = window.matchMedia('(max-width: 1023px)').matches;

if (!isMobile) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseGlow.classList.add('active');

    if (Math.random() > 0.7) {
      createSparkle(mouseX, mouseY);
    }
  });

  document.addEventListener('mouseleave', () => {
    mouseGlow.classList.remove('active');
  });

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
    sparkle.style.top = (y + (Math.random() - 0.5) * 40) + 'px';
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 800);
  }

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;

    mouseGlow.style.left = (glowX - 225) + 'px';
    mouseGlow.style.top = (glowY - 225) + 'px';

    requestAnimationFrame(updateGlow);
  }

  updateGlow();
}

// WeTime Clock
function updateClock() {
  const clockDisplay = document.getElementById('wetime-display');
  if (clockDisplay) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

updateClock();
setInterval(updateClock, 1000);

const defaultConfig = {
  company_name: 'GestãoPro',
  hero_title: 'Gestão Empresarial Completa e Inteligente',
  hero_subtitle: 'Acesse um sistema desenvolvido especialmente para você, reunindo em um só lugar módulos financeiros, gestão de frotas e geração de documentos essenciais. Tudo pensado para oferecer praticidade, rapidez e mais eficiência no dia a dia do seu negócio.',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6'
};

let config = { ...defaultConfig };

async function onConfigChange(newConfig) {
  config = { ...config, ...newConfig };

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const titleText = config.hero_title || defaultConfig.hero_title;
    const parts = titleText.split(' ');
    const midPoint = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, midPoint).join(' ');
    const secondLine = parts.slice(midPoint).join(' ');
    heroTitle.innerHTML = `
      <span class="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">${firstLine}</span>
      <br>
      <span class="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">${secondLine}</span>
    `;
  }

  const heroSubtitle = document.getElementById('hero-subtitle');
  if (heroSubtitle) {
    heroSubtitle.textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
  }
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      {
        get: () => config.primary_color || defaultConfig.primary_color,
        set: (value) => {
          config.primary_color = value;
          window.elementSdk.setConfig({ primary_color: value });
        }
      },
      {
        get: () => config.secondary_color || defaultConfig.secondary_color,
        set: (value) => {
          config.secondary_color = value;
          window.elementSdk.setConfig({ secondary_color: value });
        }
      }
    ],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ['company_name', config.company_name || defaultConfig.company_name],
    ['hero_title', config.hero_title || defaultConfig.hero_title],
    ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle]
  ]);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues
  });
}

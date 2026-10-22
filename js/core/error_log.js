// Registro local e exportável de erros do navegador, sem dados da carreira.
(function(){
  const STORAGE_KEY = 'afm_error_log_v1';
  const MAX_ENTRIES = 100;
  let memoryEntries = [];
  let useMemoryEntries = false;

  function sanitize(value){
    return String(value ?? '')
      .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
      .replace(/\b(password|senha|token|authorization|api[_-]?key)\b\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
      .replace(/https?:\/\/[^\s)]+/gi, url => url.split(/[?#]/, 1)[0])
      .slice(0, 500);
  }

  function read(){
    if(useMemoryEntries) return memoryEntries.slice(-MAX_ENTRIES);
    try {
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      memoryEntries = Array.isArray(entries) ? entries.slice(-MAX_ENTRIES) : [];
      return memoryEntries;
    } catch { useMemoryEntries = true; return memoryEntries.slice(-MAX_ENTRIES); }
  }

  function record(type, message, details = {}){
    const entry = {
      at: new Date().toISOString(),
      type: sanitize(type).slice(0, 40),
      message: sanitize(message),
      source: sanitize(details.source).slice(0, 300),
      line: Number(details.line) || 0,
      stack: sanitize(details.stack).slice(0, 500)
    };
    const current = read();
    const last = current[current.length - 1];
    // Evita duplicatas consecutivas do mesmo erro
    if (last && last.type === entry.type && last.message === entry.message) {
      return;
    }
    memoryEntries = [...current, entry].slice(-MAX_ENTRIES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryEntries));
      useMemoryEntries = false;
    } catch { useMemoryEntries = true; }
  }

  function errorDetails(value){
    if(value instanceof Error) return { message: `${value.name}: ${value.message}`, stack: value.stack || '' };
    return { message: typeof value === 'string' ? value : 'Falha assíncrona sem mensagem legível' };
  }

  window.addEventListener('error', event => {
    const detail = errorDetails(event.error || event.message);
    record('error', detail.message, { source: event.filename, line: event.lineno, stack: detail.stack });
  });

  window.addEventListener('unhandledrejection', event => {
    const detail = errorDetails(event.reason);
    record('unhandledrejection', detail.message, { stack: detail.stack });
  });

  if(typeof navigator !== 'undefined' && navigator.serviceWorker){
    navigator.serviceWorker.addEventListener('message', event => {
      if(event.data?.type === 'AFM_OFFLINE_CACHE_MISS'){
        record('offline-cache-miss', 'Arquivo do aplicativo indisponível sem conexão', { source: event.data.url });
      }
    });
  }

  const seenResourceFailures = new Set();
  const seenHandledFailures = new Set();
  document.addEventListener('error', event => {
    const target = event.target;
    const tag = target?.tagName?.toLowerCase();
    if(!['img', 'script', 'link', 'audio', 'video', 'source'].includes(tag)) return;
    const source = target.currentSrc || target.src || target.href;
    if(!source || seenResourceFailures.has(source)) return;
    seenResourceFailures.add(source);
    record('resource-load', 'Falha ao carregar recurso ' + tag, { source });
  }, true);

  window.AFMErrorLog = {
    getLogs: read,
    record,
    recordHandled(error, source){
      const detail = errorDetails(error);
      const key = `${source}:${detail.message}`;
      if(seenHandledFailures.has(key)) return false;
      seenHandledFailures.add(key);
      record('handled-error', detail.message, { source, stack: detail.stack });
      return true;
    },
    download(){
      const blob = new Blob([JSON.stringify(read(), null, 2) + '\n'], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `afm-errors-${new Date().toISOString().slice(0, 10)}.log`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };
})();

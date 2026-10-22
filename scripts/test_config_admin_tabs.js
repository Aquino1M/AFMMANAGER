// Teste de Restrição de Abas de Configuração (Acesso Exclusivo do Admin)
const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

// Verificação estática e lógica
console.log('1. Verificando presença da restrição de abas em configPage()...');
if (code.includes('if(!isAdminUser && (configTab === \'db\' || configTab === \'audit\'))')) {
  console.log('✅ Fallback de segurança para non-admin presente.');
} else {
  console.error('❌ Falha: Fallback de segurança não encontrado.');
  process.exit(1);
}

if (code.includes('${isAdminUser ? `') && code.includes('data-config-tab="db"') && code.includes('data-config-tab="audit"')) {
  console.log('✅ Renderização condicional das abas db e audit apenas para isAdminUser presente.');
} else {
  console.error('❌ Falha: Renderização condicional não encontrada.');
  process.exit(1);
}

if (code.includes('if((targetTab === \'db\' || targetTab === \'audit\') && !isAdm)')) {
  console.log('✅ Bloqueio no clique de evento bind presente.');
} else {
  console.error('❌ Falha: Bloqueio no clique não encontrado.');
  process.exit(1);
}

console.log('Todos os testes estáticos passaram com sucesso!');

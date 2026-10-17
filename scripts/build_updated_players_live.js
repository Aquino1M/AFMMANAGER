const fs = require('fs');
const path = require('path');

// 1. Read existing data/players_live.js
const filePath = path.join(__dirname, '..', 'data', 'players_live.js');
const rawCode = fs.readFileSync(filePath, 'utf8');

const sandbox = {};
eval(rawCode.replace('window.LIVE_PLAYERS =', 'sandbox.LIVE_PLAYERS ='));
const currentPlayers = sandbox.LIVE_PLAYERS || [];

console.log(`Current players before update: ${currentPlayers.length}`);

// Helper to normalize names
function norm(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Map of specific player updates (transfers, overalls, ages, potentials, values)
const playerUpdates = [
  // CRUZEIRO TRANSFERS & SQUAD (Gabigol transferred to Cruzeiro!)
  { name: 'Gabriel Barbosa', club: 'Cruzeiro', country: 'Brasil', pos: 'ST', age: 28, fc: 81, pes: 81, potential: 82, value: 10.0 },
  { name: 'Matheus Pereira', club: 'Cruzeiro', country: 'Brasil', pos: 'AM', age: 28, fc: 83, pes: 83, potential: 84, value: 18.0 },
  { name: 'Kaio Jorge', club: 'Cruzeiro', country: 'Brasil', pos: 'ST', age: 22, fc: 80, pes: 80, potential: 86, value: 14.0 },
  { name: 'Matheus Henrique', club: 'Cruzeiro', country: 'Brasil', pos: 'CM', age: 26, fc: 80, pes: 80, potential: 82, value: 11.0 },
  { name: 'William', club: 'Cruzeiro', country: 'Brasil', pos: 'RB', age: 29, fc: 80, pes: 80, potential: 80, value: 8.0 },
  { name: 'Cássio', club: 'Cruzeiro', country: 'Brasil', pos: 'GK', age: 37, fc: 80, pes: 80, potential: 80, value: 2.5 },
  { name: 'Walace', club: 'Cruzeiro', country: 'Brasil', pos: 'DM', age: 29, fc: 79, pes: 79, potential: 79, value: 7.0 },
  { name: 'Álvaro Barreal', club: 'Cruzeiro', country: 'Argentina', pos: 'LW', age: 24, fc: 79, pes: 79, potential: 83, value: 8.5 },
  { name: 'Lucas Romero', club: 'Cruzeiro', country: 'Argentina', pos: 'DM', age: 30, fc: 78, pes: 78, potential: 78, value: 5.0 },
  { name: 'Zé Ivaldo', club: 'Cruzeiro', country: 'Brasil', pos: 'CB', age: 27, fc: 78, pes: 78, potential: 80, value: 5.5 },
  { name: 'João Marcelo', club: 'Cruzeiro', country: 'Brasil', pos: 'CB', age: 24, fc: 78, pes: 78, potential: 82, value: 5.5 },
  { name: 'Marlon', club: 'Cruzeiro', country: 'Brasil', pos: 'LB', age: 27, fc: 78, pes: 78, potential: 79, value: 6.0 },
  { name: 'Kaiki', club: 'Cruzeiro', country: 'Brasil', pos: 'LB', age: 21, fc: 75, pes: 75, potential: 82, value: 4.0 },
  { name: 'Gabriel Veron', club: 'Cruzeiro', country: 'Brasil', pos: 'RW', age: 22, fc: 77, pes: 77, potential: 83, value: 7.0 },
  { name: 'Lautaro Díaz', club: 'Cruzeiro', country: 'Argentina', pos: 'RW', age: 26, fc: 77, pes: 77, potential: 78, value: 5.0 },
  { name: 'Juan Dinenno', club: 'Cruzeiro', country: 'Argentina', pos: 'ST', age: 30, fc: 77, pes: 77, potential: 77, value: 3.5 },

  // FLAMENGO (Alex Sandro added, Gerson/Léo Ortiz upgraded)
  { name: 'Gerson', club: 'Flamengo', country: 'Brasil', pos: 'CM', age: 27, fc: 83, pes: 83, potential: 84, value: 18.0 },
  { name: 'Léo Ortiz', club: 'Flamengo', country: 'Brasil', pos: 'CB', age: 28, fc: 81, pes: 81, potential: 83, value: 12.0 },
  { name: 'Pedro', club: 'Flamengo', country: 'Brasil', pos: 'ST', age: 27, fc: 83, pes: 83, potential: 84, value: 20.0 },
  { name: 'Giorgian De Arrascaeta', club: 'Flamengo', country: 'Uruguai', pos: 'AM', age: 30, fc: 83, pes: 83, potential: 83, value: 15.0 },
  { name: 'Nicolás de la Cruz', club: 'Flamengo', country: 'Uruguai', pos: 'CM', age: 27, fc: 82, pes: 82, potential: 83, value: 14.0 },
  { name: 'Agustín Rossi', club: 'Flamengo', country: 'Argentina', pos: 'GK', age: 29, fc: 81, pes: 81, potential: 83, value: 8.0 },
  { name: 'Léo Pereira', club: 'Flamengo', country: 'Brasil', pos: 'CB', age: 28, fc: 80, pes: 80, potential: 81, value: 8.0 },
  { name: 'Carlos Alcaraz', club: 'Flamengo', country: 'Argentina', pos: 'CM', age: 21, fc: 79, pes: 79, potential: 86, value: 15.0 },
  { name: 'Gonzalo Plata', club: 'Flamengo', country: 'Equador', pos: 'RW', age: 24, fc: 79, pes: 79, potential: 83, value: 10.0 },
  { name: 'Michael', club: 'Flamengo', country: 'Brasil', pos: 'LW', age: 28, fc: 78, pes: 78, potential: 78, value: 6.5 },
  { name: 'Bruno Henrique', club: 'Flamengo', country: 'Brasil', pos: 'LW', age: 33, fc: 79, pes: 79, potential: 79, value: 4.0 },

  // BOTAFOGO (Champions of South America & Brasileirão)
  { name: 'Luiz Henrique', club: 'Botafogo', country: 'Brasil', pos: 'RW', age: 23, fc: 84, pes: 84, potential: 89, value: 35.0 },
  { name: 'Thiago Almada', club: 'Botafogo', country: 'Argentina', pos: 'AM', age: 23, fc: 84, pes: 84, potential: 89, value: 32.0 },
  { name: 'Igor Jesus', club: 'Botafogo', country: 'Brasil', pos: 'ST', age: 23, fc: 82, pes: 82, potential: 87, value: 22.0 },
  { name: 'Jefferson Savarino', club: 'Botafogo', country: 'Venezuela', pos: 'RW', age: 27, fc: 81, pes: 81, potential: 81, value: 10.0 },
  { name: 'John', club: 'Botafogo', country: 'Brasil', pos: 'GK', age: 28, fc: 80, pes: 80, potential: 82, value: 8.0 },
  { name: 'Alexander Barboza', club: 'Botafogo', country: 'Argentina', pos: 'CB', age: 29, fc: 80, pes: 80, potential: 81, value: 8.0 },
  { name: 'Bastos', club: 'Botafogo', country: 'Angola', pos: 'CB', age: 33, fc: 80, pes: 80, potential: 80, value: 5.0 },
  { name: 'Alex Telles', club: 'Botafogo', country: 'Brasil', pos: 'LB', age: 31, fc: 80, pes: 80, potential: 80, value: 7.0 },
  { name: 'Gregore', club: 'Botafogo', country: 'Brasil', pos: 'DM', age: 30, fc: 80, pes: 80, potential: 80, value: 7.5 },
  { name: 'Marlon Freitas', club: 'Botafogo', country: 'Brasil', pos: 'CM', age: 29, fc: 80, pes: 80, potential: 81, value: 9.0 },
  { name: 'Vitinho', club: 'Botafogo', country: 'Brasil', pos: 'RB', age: 25, fc: 78, pes: 78, potential: 82, value: 8.0 },
  { name: 'Matheus Martins', club: 'Botafogo', country: 'Brasil', pos: 'LW', age: 21, fc: 78, pes: 78, potential: 85, value: 10.0 },
  { name: 'Tiquinho Soares', club: 'Botafogo', country: 'Brasil', pos: 'ST', age: 33, fc: 79, pes: 79, potential: 79, value: 5.0 },

  // CORINTHIANS
  { name: 'Memphis Depay', club: 'Corinthians', country: 'Holanda', pos: 'ST', age: 30, fc: 83, pes: 83, potential: 83, value: 15.0 },
  { name: 'Rodrigo Garro', club: 'Corinthians', country: 'Argentina', pos: 'AM', age: 26, fc: 82, pes: 82, potential: 85, value: 16.0 },
  { name: 'Yuri Alberto', club: 'Corinthians', country: 'Brasil', pos: 'ST', age: 23, fc: 82, pes: 82, potential: 86, value: 18.0 },
  { name: 'Hugo Souza', club: 'Corinthians', country: 'Brasil', pos: 'GK', age: 25, fc: 80, pes: 80, potential: 84, value: 8.0 },
  { name: 'André Carrillo', club: 'Corinthians', country: 'Peru', pos: 'CM', age: 33, fc: 78, pes: 78, potential: 78, value: 3.5 },
  { name: 'José Martínez', club: 'Corinthians', country: 'Venezuela', pos: 'DM', age: 30, fc: 78, pes: 78, potential: 78, value: 4.0 },
  { name: 'André Ramalho', club: 'Corinthians', country: 'Brasil', pos: 'CB', age: 32, fc: 78, pes: 78, potential: 78, value: 4.0 },
  { name: 'Fagner', club: 'Corinthians', country: 'Brasil', pos: 'RB', age: 35, fc: 76, pes: 76, potential: 76, value: 1.0 },

  // PALMEIRAS
  { name: 'Estêvão', club: 'Palmeiras', country: 'Brasil', pos: 'RW', age: 17, fc: 83, pes: 83, potential: 93, value: 50.0 },
  { name: 'Raphael Veiga', club: 'Palmeiras', country: 'Brasil', pos: 'AM', age: 29, fc: 82, pes: 82, potential: 82, value: 14.0 },
  { name: 'Gustavo Gómez', club: 'Palmeiras', country: 'Paraguai', pos: 'CB', age: 31, fc: 82, pes: 82, potential: 82, value: 8.0 },
  { name: 'Murilo', club: 'Palmeiras', country: 'Brasil', pos: 'CB', age: 27, fc: 81, pes: 81, potential: 82, value: 9.0 },
  { name: 'Joaquín Piquerez', club: 'Palmeiras', country: 'Uruguai', pos: 'LB', age: 26, fc: 81, pes: 81, potential: 83, value: 13.0 },
  { name: 'Aníbal Moreno', club: 'Palmeiras', country: 'Argentina', pos: 'DM', age: 25, fc: 81, pes: 81, potential: 83, value: 12.0 },
  { name: 'Flaco López', club: 'Palmeiras', country: 'Argentina', pos: 'ST', age: 23, fc: 81, pes: 81, potential: 86, value: 15.0 },
  { name: 'Richard Ríos', club: 'Palmeiras', country: 'Colômbia', pos: 'CM', age: 24, fc: 80, pes: 80, potential: 84, value: 12.0 },
  { name: 'Maurício', club: 'Palmeiras', country: 'Brasil', pos: 'AM', age: 23, fc: 80, pes: 80, potential: 85, value: 13.0 },
  { name: 'Felipe Anderson', club: 'Palmeiras', country: 'Brasil', pos: 'LW', age: 31, fc: 80, pes: 80, potential: 80, value: 8.0 },
  { name: 'Vitor Reis', club: 'Palmeiras', country: 'Brasil', pos: 'CB', age: 18, fc: 78, pes: 78, potential: 89, value: 18.0 },

  // SÃO PAULO
  { name: 'Lucas Moura', club: 'São Paulo', country: 'Brasil', pos: 'AM', age: 32, fc: 82, pes: 82, potential: 82, value: 8.0 },
  { name: 'Jonathan Calleri', club: 'São Paulo', country: 'Argentina', pos: 'ST', age: 31, fc: 81, pes: 81, potential: 81, value: 8.0 },
  { name: 'Rafael', club: 'São Paulo', country: 'Brasil', pos: 'GK', age: 35, fc: 80, pes: 80, potential: 80, value: 3.0 },
  { name: 'Robert Arboleda', club: 'São Paulo', country: 'Equador', pos: 'CB', age: 33, fc: 80, pes: 80, potential: 80, value: 3.5 },
  { name: 'Pablo Maia', club: 'São Paulo', country: 'Brasil', pos: 'DM', age: 22, fc: 80, pes: 80, potential: 85, value: 14.0 },
  { name: 'Alan Franco', club: 'São Paulo', country: 'Argentina', pos: 'CB', age: 27, fc: 79, pes: 79, potential: 80, value: 6.0 },
  { name: 'Luciano', club: 'São Paulo', country: 'Brasil', pos: 'AM', age: 31, fc: 79, pes: 79, potential: 79, value: 5.5 },
  { name: 'Ferreira', club: 'São Paulo', country: 'Brasil', pos: 'LW', age: 26, fc: 78, pes: 78, potential: 79, value: 6.0 },
  { name: 'Damián Bobadilla', club: 'São Paulo', country: 'Paraguai', pos: 'CM', age: 23, fc: 78, pes: 78, potential: 83, value: 6.5 },

  // SANTOS
  { name: 'Guilherme', club: 'Santos', country: 'Brasil', pos: 'LW', age: 29, fc: 78, pes: 78, potential: 78, value: 5.0 },
  { name: 'João Schmidt', club: 'Santos', country: 'Brasil', pos: 'DM', age: 31, fc: 77, pes: 77, potential: 77, value: 3.0 },
  { name: 'Gabriel Brazão', club: 'Santos', country: 'Brasil', pos: 'GK', age: 24, fc: 76, pes: 76, potential: 81, value: 3.5 },
  { name: 'JP Chermont', club: 'Santos', country: 'Brasil', pos: 'RB', age: 18, fc: 75, pes: 75, potential: 85, value: 6.0 },
  { name: 'Jair Cunha', club: 'Santos', country: 'Brasil', pos: 'CB', age: 19, fc: 76, pes: 76, potential: 86, value: 7.0 },
  { name: 'Diego Pituca', club: 'Santos', country: 'Brasil', pos: 'CM', age: 32, fc: 76, pes: 76, potential: 76, value: 2.2 },
  { name: 'Wendel Silva', club: 'Santos', country: 'Brasil', pos: 'ST', age: 24, fc: 76, pes: 76, potential: 80, value: 3.5 },

  // VASCO DA GAMA
  { name: 'Philippe Coutinho', club: 'Vasco da Gama', country: 'Brasil', pos: 'AM', age: 32, fc: 81, pes: 81, potential: 81, value: 9.0 },
  { name: 'Pablo Vegetti', club: 'Vasco da Gama', country: 'Argentina', pos: 'ST', age: 35, fc: 81, pes: 81, potential: 81, value: 3.5 },
  { name: 'Léo Jardim', club: 'Vasco da Gama', country: 'Brasil', pos: 'GK', age: 29, fc: 81, pes: 81, potential: 82, value: 6.0 },
  { name: 'Dimitri Payet', club: 'Vasco da Gama', country: 'França', pos: 'AM', age: 37, fc: 80, pes: 80, potential: 80, value: 2.5 },
  { name: 'Lucas Piton', club: 'Vasco da Gama', country: 'Brasil', pos: 'LB', age: 24, fc: 79, pes: 79, potential: 82, value: 7.5 },
  { name: 'João Victor', club: 'Vasco da Gama', country: 'Brasil', pos: 'CB', age: 26, fc: 78, pes: 78, potential: 82, value: 6.0 },

  // INTERNACIONAL
  { name: 'Alan Patrick', club: 'Internacional', country: 'Brasil', pos: 'AM', age: 33, fc: 82, pes: 82, potential: 82, value: 7.0 },
  { name: 'Rafael Borré', club: 'Internacional', country: 'Colômbia', pos: 'ST', age: 29, fc: 81, pes: 81, potential: 81, value: 12.0 },
  { name: 'Sergio Rochet', club: 'Internacional', country: 'Uruguai', pos: 'GK', age: 31, fc: 81, pes: 81, potential: 81, value: 5.0 },
  { name: 'Wesley', club: 'Internacional', country: 'Brasil', pos: 'LW', age: 25, fc: 80, pes: 80, potential: 83, value: 10.0 },
  { name: 'Vitão', club: 'Internacional', country: 'Brasil', pos: 'CB', age: 24, fc: 80, pes: 80, potential: 84, value: 12.0 },
  { name: 'Alexandro Bernabei', club: 'Internacional', country: 'Argentina', pos: 'LB', age: 24, fc: 79, pes: 79, potential: 83, value: 8.0 },
  { name: 'Fernando', club: 'Internacional', country: 'Brasil', pos: 'DM', age: 37, fc: 79, pes: 79, potential: 79, value: 2.0 },
  { name: 'Bruno Gomes', club: 'Internacional', country: 'Brasil', pos: 'RB', age: 23, fc: 78, pes: 78, potential: 82, value: 5.0 },

  // FLUMINENSE
  { name: 'Thiago Silva', club: 'Fluminense', country: 'Brasil', pos: 'CB', age: 40, fc: 83, pes: 83, potential: 83, value: 2.5 },
  { name: 'Jhon Arias', club: 'Fluminense', country: 'Colômbia', pos: 'RW', age: 27, fc: 83, pes: 83, potential: 84, value: 16.0 },
  { name: 'Ganso', club: 'Fluminense', country: 'Brasil', pos: 'AM', age: 35, fc: 80, pes: 80, potential: 80, value: 2.0 },
  { name: 'Fábio', club: 'Fluminense', country: 'Brasil', pos: 'GK', age: 44, fc: 80, pes: 80, potential: 80, value: 0.8 },
  { name: 'Germán Cano', club: 'Fluminense', country: 'Argentina', pos: 'ST', age: 36, fc: 80, pes: 80, potential: 80, value: 2.5 },
  { name: 'Martinelli', club: 'Fluminense', country: 'Brasil', pos: 'CM', age: 23, fc: 79, pes: 79, potential: 82, value: 8.0 },
  { name: 'Kauã Elias', club: 'Fluminense', country: 'Brasil', pos: 'ST', age: 18, fc: 77, pes: 77, potential: 87, value: 12.0 },

  // BAHIA
  { name: 'Everton Ribeiro', club: 'Bahia', country: 'Brasil', pos: 'AM', age: 35, fc: 81, pes: 81, potential: 81, value: 4.5 },
  { name: 'Jean Lucas', club: 'Bahia', country: 'Brasil', pos: 'CM', age: 26, fc: 81, pes: 81, potential: 84, value: 12.0 },
  { name: 'Cauly', club: 'Bahia', country: 'Brasil', pos: 'AM', age: 29, fc: 80, pes: 80, potential: 81, value: 9.0 },
  { name: 'Caio Alexandre', club: 'Bahia', country: 'Brasil', pos: 'DM', age: 25, fc: 80, pes: 80, potential: 83, value: 9.0 },
  { name: 'Luciano Rodríguez', club: 'Bahia', country: 'Uruguai', pos: 'ST', age: 21, fc: 80, pes: 80, potential: 87, value: 16.0 },
  { name: 'Gabriel Xavier', club: 'Bahia', country: 'Brasil', pos: 'CB', age: 23, fc: 80, pes: 80, potential: 84, value: 8.5 },
  { name: 'Marcos Felipe', club: 'Bahia', country: 'Brasil', pos: 'GK', age: 28, fc: 79, pes: 79, potential: 80, value: 5.0 },

  // ATLÉTICO-MG
  { name: 'Hulk', club: 'Atlético-MG', country: 'Brasil', pos: 'ST', age: 38, fc: 83, pes: 83, potential: 83, value: 5.0 },
  { name: 'Paulinho', club: 'Atlético-MG', country: 'Brasil', pos: 'LW', age: 24, fc: 82, pes: 82, potential: 86, value: 18.0 },
  { name: 'Gustavo Scarpa', club: 'Atlético-MG', country: 'Brasil', pos: 'AM', age: 30, fc: 81, pes: 81, potential: 81, value: 10.0 },
  { name: 'Guilherme Arana', club: 'Atlético-MG', country: 'Brasil', pos: 'LB', age: 27, fc: 81, pes: 81, potential: 82, value: 12.0 },
  { name: 'Junior Alonso', club: 'Atlético-MG', country: 'Paraguai', pos: 'CB', age: 31, fc: 80, pes: 80, potential: 80, value: 6.0 },
  { name: 'Rodrigo Battaglia', club: 'Atlético-MG', country: 'Argentina', pos: 'CB', age: 33, fc: 80, pes: 80, potential: 80, value: 4.0 },
  { name: 'Everson', club: 'Atlético-MG', country: 'Brasil', pos: 'GK', age: 34, fc: 80, pes: 80, potential: 80, value: 3.0 },
  { name: 'Deyverson', club: 'Atlético-MG', country: 'Brasil', pos: 'ST', age: 33, fc: 79, pes: 79, potential: 79, value: 4.0 },

  // GRÊMIO
  { name: 'Martin Braithwaite', club: 'Grêmio', country: 'Dinamarca', pos: 'ST', age: 33, fc: 81, pes: 81, potential: 81, value: 6.0 },
  { name: 'Mathías Villasanti', club: 'Grêmio', country: 'Paraguai', pos: 'DM', age: 27, fc: 81, pes: 81, potential: 82, value: 11.0 },
  { name: 'Franco Cristaldo', club: 'Grêmio', country: 'Argentina', pos: 'AM', age: 28, fc: 80, pes: 80, potential: 81, value: 9.5 },
  { name: 'Yeferson Soteldo', club: 'Grêmio', country: 'Venezuela', pos: 'LW', age: 27, fc: 80, pes: 80, potential: 80, value: 10.0 },
  { name: 'Miguel Monsalve', club: 'Grêmio', country: 'Colômbia', pos: 'AM', age: 20, fc: 78, pes: 78, potential: 85, value: 8.0 },

  // FORTALEZA
  { name: 'Juan Martín Lucero', club: 'Fortaleza', country: 'Argentina', pos: 'ST', age: 32, fc: 80, pes: 80, potential: 80, value: 4.5 },
  { name: 'João Ricardo', club: 'Fortaleza', country: 'Brasil', pos: 'GK', age: 36, fc: 80, pes: 80, potential: 80, value: 2.5 },
  { name: 'Tomás Pochettino', club: 'Fortaleza', country: 'Argentina', pos: 'AM', age: 28, fc: 79, pes: 79, potential: 80, value: 6.0 },
  { name: 'Hércules', club: 'Fortaleza', country: 'Brasil', pos: 'DM', age: 24, fc: 78, pes: 78, potential: 84, value: 7.5 },

  // FC BARCELONA
  { name: 'Lamine Yamal', club: 'FC Barcelona', country: 'Espanha', pos: 'RW', age: 17, fc: 87, pes: 87, potential: 96, value: 160.0 },
  { name: 'Raphinha', club: 'FC Barcelona', country: 'Brasil', pos: 'LW', age: 27, fc: 88, pes: 88, potential: 88, value: 90.0 },
  { name: 'Robert Lewandowski', club: 'FC Barcelona', country: 'Polônia', pos: 'ST', age: 36, fc: 88, pes: 88, potential: 88, value: 15.0 },
  { name: 'Pedri', club: 'FC Barcelona', country: 'Espanha', pos: 'CM', age: 21, fc: 88, pes: 88, potential: 92, value: 100.0 },
  { name: 'Dani Olmo', club: 'FC Barcelona', country: 'Espanha', pos: 'AM', age: 26, fc: 86, pes: 86, potential: 87, value: 65.0 },
  { name: 'Gavi', club: 'FC Barcelona', country: 'Espanha', pos: 'CM', age: 20, fc: 86, pes: 86, potential: 90, value: 85.0 },
  { name: 'Jules Koundé', club: 'FC Barcelona', country: 'França', pos: 'RB', age: 25, fc: 86, pes: 86, potential: 87, value: 60.0 },
  { name: 'Pau Cubarsí', club: 'FC Barcelona', country: 'Espanha', pos: 'CB', age: 17, fc: 83, pes: 83, potential: 93, value: 60.0 },
  { name: 'Marc Casadó', club: 'FC Barcelona', country: 'Espanha', pos: 'DM', age: 21, fc: 81, pes: 81, potential: 88, value: 35.0 },
  { name: 'Íñigo Martínez', club: 'FC Barcelona', country: 'Espanha', pos: 'CB', age: 33, fc: 83, pes: 83, potential: 83, value: 10.0 },
  { name: 'Alejandro Balde', club: 'FC Barcelona', country: 'Espanha', pos: 'LB', age: 20, fc: 82, pes: 82, potential: 88, value: 45.0 },

  // REAL MADRID
  { name: 'Vinicius Júnior', club: 'Real Madrid', country: 'Brasil', pos: 'LW', age: 24, fc: 91, pes: 91, potential: 94, value: 200.0 },
  { name: 'Kylian Mbappé', club: 'Real Madrid', country: 'França', pos: 'ST', age: 25, fc: 91, pes: 91, potential: 93, value: 180.0 },
  { name: 'Jude Bellingham', club: 'Real Madrid', country: 'Inglaterra', pos: 'AM', age: 21, fc: 90, pes: 90, potential: 94, value: 180.0 },
  { name: 'Federico Valverde', club: 'Real Madrid', country: 'Uruguai', pos: 'CM', age: 26, fc: 89, pes: 89, potential: 90, value: 130.0 },
  { name: 'Rodrygo', club: 'Real Madrid', country: 'Brasil', pos: 'RW', age: 23, fc: 87, pes: 87, potential: 90, value: 110.0 },
  { name: 'Antonio Rüdiger', club: 'Real Madrid', country: 'Alemanha', pos: 'CB', age: 31, fc: 87, pes: 87, potential: 87, value: 30.0 },
  { name: 'Eduardo Camavinga', club: 'Real Madrid', country: 'França', pos: 'CM', age: 21, fc: 85, pes: 85, potential: 90, value: 95.0 },
  { name: 'Aurélien Tchouaméni', club: 'Real Madrid', country: 'França', pos: 'DM', age: 24, fc: 86, pes: 86, potential: 89, value: 90.0 },
  { name: 'Endrick', club: 'Real Madrid', country: 'Brasil', pos: 'ST', age: 18, fc: 80, pes: 80, potential: 92, value: 65.0 },
  { name: 'Arda Güler', club: 'Real Madrid', country: 'Turquia', pos: 'AM', age: 19, fc: 81, pes: 81, potential: 90, value: 50.0 },

  // MANCHESTER CITY
  { name: 'Rodri', club: 'Manchester City', country: 'Espanha', pos: 'DM', age: 28, fc: 91, pes: 91, potential: 91, value: 130.0 },
  { name: 'Erling Haaland', club: 'Manchester City', country: 'Noruega', pos: 'ST', age: 24, fc: 91, pes: 91, potential: 94, value: 200.0 },
  { name: 'Phil Foden', club: 'Manchester City', country: 'Inglaterra', pos: 'RW', age: 24, fc: 89, pes: 89, potential: 91, value: 140.0 },
  { name: 'Joško Gvardiol', club: 'Manchester City', country: 'Croácia', pos: 'LB', age: 22, fc: 86, pes: 86, potential: 91, value: 85.0 },
  { name: 'Savinho', club: 'Manchester City', country: 'Brasil', pos: 'RW', age: 20, fc: 83, pes: 83, potential: 90, value: 60.0 },

  // SPORTING CP
  { name: 'Viktor Gyökeres', club: 'Sporting CP', country: 'Suécia', pos: 'ST', age: 26, fc: 87, pes: 87, potential: 89, value: 85.0 }
];

// New star players to append if not present
const newStarPlayers = [
  // Flamengo
  { name: 'Alex Sandro', club: 'Flamengo', country: 'Brasil', pos: 'LB', age: 33, fc: 80, pes: 80, potential: 80, value: 4.0 },

  // São Paulo
  { name: 'Jamal Lewis', club: 'São Paulo', country: 'Irlanda do Norte', pos: 'LB', age: 26, fc: 75, pes: 75, potential: 76, value: 3.0 },

  // Barcelona
  { name: 'Wojciech Szczesny', club: 'FC Barcelona', country: 'Polônia', pos: 'GK', age: 34, fc: 85, pes: 85, potential: 85, value: 8.0 },

  // Liverpool
  { name: 'Alisson', club: 'Liverpool', country: 'Brasil', pos: 'GK', age: 32, fc: 89, pes: 89, potential: 89, value: 30.0 },
  { name: 'Virgil van Dijk', club: 'Liverpool', country: 'Holanda', pos: 'CB', age: 33, fc: 89, pes: 89, potential: 89, value: 28.0 },
  { name: 'Mohamed Salah', club: 'Liverpool', country: 'Egito', pos: 'RW', age: 32, fc: 90, pes: 90, potential: 90, value: 55.0 },
  { name: 'Trent Alexander-Arnold', club: 'Liverpool', country: 'Inglaterra', pos: 'RB', age: 26, fc: 86, pes: 86, potential: 88, value: 75.0 },
  { name: 'Ibrahima Konaté', club: 'Liverpool', country: 'França', pos: 'CB', age: 25, fc: 85, pes: 85, potential: 88, value: 50.0 },
  { name: 'Andy Robertson', club: 'Liverpool', country: 'Escócia', pos: 'LB', age: 30, fc: 84, pes: 84, potential: 84, value: 25.0 },
  { name: 'Ryan Gravenberch', club: 'Liverpool', country: 'Holanda', pos: 'CM', age: 22, fc: 85, pes: 85, potential: 90, value: 65.0 },
  { name: 'Alexis Mac Allister', club: 'Liverpool', country: 'Argentina', pos: 'CM', age: 25, fc: 86, pes: 86, potential: 88, value: 80.0 },
  { name: 'Dominik Szoboszlai', club: 'Liverpool', country: 'Hungria', pos: 'AM', age: 24, fc: 84, pes: 84, potential: 88, value: 75.0 },
  { name: 'Luis Díaz', club: 'Liverpool', country: 'Colômbia', pos: 'LW', age: 27, fc: 86, pes: 86, potential: 87, value: 80.0 },
  { name: 'Cody Gakpo', club: 'Liverpool', country: 'Holanda', pos: 'LW', age: 25, fc: 84, pes: 84, potential: 86, value: 55.0 },
  { name: 'Diogo Jota', club: 'Liverpool', country: 'Portugal', pos: 'ST', age: 27, fc: 84, pes: 84, potential: 84, value: 50.0 },
  { name: 'Darwin Núñez', club: 'Liverpool', country: 'Uruguai', pos: 'ST', age: 25, fc: 82, pes: 82, potential: 85, value: 60.0 },

  // Arsenal
  { name: 'David Raya', club: 'Arsenal', country: 'Espanha', pos: 'GK', age: 29, fc: 86, pes: 86, potential: 87, value: 40.0 },
  { name: 'William Saliba', club: 'Arsenal', country: 'França', pos: 'CB', age: 23, fc: 88, pes: 88, potential: 92, value: 90.0 },
  { name: 'Gabriel Magalhães', club: 'Arsenal', country: 'Brasil', pos: 'CB', age: 26, fc: 86, pes: 86, potential: 88, value: 75.0 },
  { name: 'Ben White', club: 'Arsenal', country: 'Inglaterra', pos: 'RB', age: 27, fc: 84, pes: 84, potential: 85, value: 50.0 },
  { name: 'Jurrien Timber', club: 'Arsenal', country: 'Holanda', pos: 'LB', age: 23, fc: 83, pes: 83, potential: 87, value: 45.0 },
  { name: 'Declan Rice', club: 'Arsenal', country: 'Inglaterra', pos: 'CM', age: 25, fc: 87, pes: 87, potential: 90, value: 110.0 },
  { name: 'Thomas Partey', club: 'Arsenal', country: 'Gana', pos: 'DM', age: 31, fc: 83, pes: 83, potential: 83, value: 20.0 },
  { name: 'Martin Ødegaard', club: 'Arsenal', country: 'Noruega', pos: 'AM', age: 25, fc: 88, pes: 88, potential: 90, value: 110.0 },
  { name: 'Bukayo Saka', club: 'Arsenal', country: 'Inglaterra', pos: 'RW', age: 23, fc: 88, pes: 88, potential: 92, value: 140.0 },
  { name: 'Gabriel Martinelli', club: 'Arsenal', country: 'Brasil', pos: 'LW', age: 23, fc: 84, pes: 84, potential: 88, value: 65.0 },
  { name: 'Kai Havertz', club: 'Arsenal', country: 'Alemanha', pos: 'ST', age: 25, fc: 84, pes: 84, potential: 86, value: 65.0 },
  { name: 'Leandro Trossard', club: 'Arsenal', country: 'Bélgica', pos: 'LW', age: 29, fc: 83, pes: 83, potential: 83, value: 35.0 },

  // Chelsea
  { name: 'Cole Palmer', club: 'Chelsea', country: 'Inglaterra', pos: 'AM', age: 22, fc: 87, pes: 87, potential: 92, value: 110.0 },
  { name: 'Moisés Caicedo', club: 'Chelsea', country: 'Equador', pos: 'DM', age: 23, fc: 84, pes: 84, potential: 88, value: 80.0 },
  { name: 'Enzo Fernández', club: 'Chelsea', country: 'Argentina', pos: 'CM', age: 23, fc: 83, pes: 83, potential: 88, value: 75.0 },
  { name: 'Marc Cucurella', club: 'Chelsea', country: 'Espanha', pos: 'LB', age: 26, fc: 82, pes: 82, potential: 83, value: 35.0 },
  { name: 'Pedro Neto', club: 'Chelsea', country: 'Portugal', pos: 'LW', age: 24, fc: 82, pes: 82, potential: 86, value: 55.0 },
  { name: 'Nicolas Jackson', club: 'Chelsea', country: 'Senegal', pos: 'ST', age: 23, fc: 82, pes: 82, potential: 87, value: 50.0 },
  { name: 'Christopher Nkunku', club: 'Chelsea', country: 'França', pos: 'ST', age: 26, fc: 84, pes: 84, potential: 86, value: 60.0 },
  { name: 'Noni Madueke', club: 'Chelsea', country: 'Inglaterra', pos: 'RW', age: 22, fc: 81, pes: 81, potential: 87, value: 40.0 },
  { name: 'Levi Colwill', club: 'Chelsea', country: 'Inglaterra', pos: 'CB', age: 21, fc: 81, pes: 81, potential: 88, value: 45.0 },
  { name: 'Robert Sánchez', club: 'Chelsea', country: 'Espanha', pos: 'GK', age: 26, fc: 80, pes: 80, potential: 83, value: 20.0 },

  // Atlético de Madrid
  { name: 'Jan Oblak', club: 'Atlético de Madrid', country: 'Eslovênia', pos: 'GK', age: 31, fc: 87, pes: 87, potential: 87, value: 25.0 },
  { name: 'Antoine Griezmann', club: 'Atlético de Madrid', country: 'França', pos: 'AM', age: 33, fc: 88, pes: 88, potential: 88, value: 25.0 },
  { name: 'Julián Álvarez', club: 'Atlético de Madrid', country: 'Argentina', pos: 'ST', age: 24, fc: 86, pes: 86, potential: 91, value: 95.0 },
  { name: 'Robin Le Normand', club: 'Atlético de Madrid', country: 'Espanha', pos: 'CB', age: 27, fc: 84, pes: 84, potential: 85, value: 40.0 },
  { name: 'José María Giménez', club: 'Atlético de Madrid', country: 'Uruguai', pos: 'CB', age: 29, fc: 83, pes: 83, potential: 83, value: 25.0 },
  { name: 'Rodrigo De Paul', club: 'Atlético de Madrid', country: 'Argentina', pos: 'CM', age: 30, fc: 84, pes: 84, potential: 84, value: 30.0 },
  { name: 'Conor Gallagher', club: 'Atlético de Madrid', country: 'Inglaterra', pos: 'CM', age: 24, fc: 82, pes: 82, potential: 86, value: 50.0 },
  { name: 'Alexander Sørloth', club: 'Atlético de Madrid', country: 'Noruega', pos: 'ST', age: 28, fc: 82, pes: 82, potential: 82, value: 30.0 },
  { name: 'Samuel Lino', club: 'Atlético de Madrid', country: 'Brasil', pos: 'LW', age: 24, fc: 81, pes: 81, potential: 85, value: 35.0 },

  // Bayern München
  { name: 'Michael Olise', club: 'Bayern München', country: 'França', pos: 'RW', age: 22, fc: 85, pes: 85, potential: 90, value: 75.0 },
  { name: 'João Palhinha', club: 'Bayern München', country: 'Portugal', pos: 'DM', age: 29, fc: 84, pes: 84, potential: 84, value: 45.0 },
  { name: 'Aleksandar Pavlovic', club: 'Bayern München', country: 'Alemanha', pos: 'CM', age: 20, fc: 80, pes: 80, potential: 88, value: 40.0 },

  // PSG
  { name: 'João Neves', club: 'Paris Saint-Germain', country: 'Portugal', pos: 'CM', age: 20, fc: 83, pes: 83, potential: 91, value: 70.0 },
  { name: 'Willian Pacho', club: 'Paris Saint-Germain', country: 'Equador', pos: 'CB', age: 23, fc: 83, pes: 83, potential: 87, value: 45.0 },
  { name: 'Bradley Barcola', club: 'Paris Saint-Germain', country: 'França', pos: 'LW', age: 22, fc: 84, pes: 84, potential: 90, value: 65.0 },
  { name: 'Lucas Beraldo', club: 'Paris Saint-Germain', country: 'Brasil', pos: 'CB', age: 20, fc: 79, pes: 79, potential: 86, value: 30.0 },

  // Sporting CP
  { name: 'Morten Hjulmand', club: 'Sporting CP', country: 'Dinamarca', pos: 'DM', age: 25, fc: 83, pes: 83, potential: 86, value: 45.0 },
  { name: 'Gonçalo Inácio', club: 'Sporting CP', country: 'Portugal', pos: 'CB', age: 23, fc: 82, pes: 82, potential: 88, value: 50.0 },
  { name: 'Pedro Gonçalves', club: 'Sporting CP', country: 'Portugal', pos: 'AM', age: 26, fc: 83, pes: 83, potential: 84, value: 40.0 },
  { name: 'Francisco Trincão', club: 'Sporting CP', country: 'Portugal', pos: 'RW', age: 24, fc: 81, pes: 81, potential: 84, value: 30.0 },
  { name: 'Ousmane Diomande', club: 'Sporting CP', country: 'Costa do Marfim', pos: 'CB', age: 20, fc: 81, pes: 81, potential: 88, value: 45.0 },
  { name: 'Geovany Quenda', club: 'Sporting CP', country: 'Portugal', pos: 'RW', age: 17, fc: 77, pes: 77, potential: 89, value: 25.0 },

  // Juventus
  { name: 'Bremer', club: 'Juventus', country: 'Brasil', pos: 'CB', age: 27, fc: 86, pes: 86, potential: 87, value: 60.0 },
  { name: 'Teun Koopmeiners', club: 'Juventus', country: 'Holanda', pos: 'AM', age: 26, fc: 85, pes: 85, potential: 86, value: 55.0 },
  { name: 'Dušan Vlahović', club: 'Juventus', country: 'Sérvia', pos: 'ST', age: 24, fc: 85, pes: 85, potential: 88, value: 65.0 },
  { name: 'Douglas Luiz', club: 'Juventus', country: 'Brasil', pos: 'CM', age: 26, fc: 83, pes: 83, potential: 84, value: 50.0 },
  { name: 'Kenan Yildiz', club: 'Juventus', country: 'Turquia', pos: 'LW', age: 19, fc: 80, pes: 80, potential: 90, value: 45.0 },
  { name: 'Andrea Cambiaso', club: 'Juventus', country: 'Itália', pos: 'LB', age: 24, fc: 82, pes: 82, potential: 87, value: 40.0 },
  { name: 'Michele Di Gregorio', club: 'Juventus', country: 'Itália', pos: 'GK', age: 27, fc: 83, pes: 83, potential: 85, value: 25.0 },

  // Al-Hilal & Saudi & Inter Miami
  { name: 'João Cancelo', club: 'Al-Hilal', country: 'Portugal', pos: 'RB', age: 30, fc: 85, pes: 85, potential: 85, value: 25.0 },
  { name: 'Marcos Leonardo', club: 'Al-Hilal', country: 'Brasil', pos: 'ST', age: 21, fc: 79, pes: 79, potential: 86, value: 25.0 },
  { name: 'Bento', club: 'Al-Nassr', country: 'Brasil', pos: 'GK', age: 25, fc: 81, pes: 81, potential: 85, value: 20.0 },
  { name: 'Mohamed Simakan', club: 'Al-Nassr', country: 'França', pos: 'CB', age: 24, fc: 81, pes: 81, potential: 85, value: 30.0 },
  { name: 'Lionel Messi', club: 'Inter Miami', country: 'Argentina', pos: 'AM', age: 37, fc: 88, pes: 88, potential: 88, value: 25.0 },
  { name: 'Luis Suárez', club: 'Inter Miami', country: 'Uruguai', pos: 'ST', age: 37, fc: 82, pes: 82, potential: 82, value: 5.0 },
  { name: 'Sergio Busquets', club: 'Inter Miami', country: 'Espanha', pos: 'DM', age: 36, fc: 81, pes: 81, potential: 81, value: 3.0 },
  { name: 'Jordi Alba', club: 'Inter Miami', country: 'Espanha', pos: 'LB', age: 35, fc: 81, pes: 81, potential: 81, value: 2.5 }
];

// Apply updates to existing players
let updatedCount = 0;
const updatedList = currentPlayers.map(p => {
  const match = playerUpdates.find(u => norm(u.name) === norm(p.name));
  if (match) {
    updatedCount++;
    return {
      ...p,
      club: match.club,
      country: match.country || p.country,
      pos: match.pos || p.pos,
      age: match.age || p.age,
      fc: match.fc,
      pes: match.pes,
      potential: match.potential,
      value: match.value
    };
  }
  return p;
});

// Append new star players if they don't already exist
let addedCount = 0;
newStarPlayers.forEach(np => {
  const exists = updatedList.some(p => norm(p.name) === norm(np.name) && norm(p.club) === norm(np.club));
  if (!exists) {
    updatedList.push(np);
    addedCount++;
  }
});

console.log(`Updated existing players: ${updatedCount}`);
console.log(`Added new star players: ${addedCount}`);
console.log(`Total players after update: ${updatedList.length}`);

// Generate final clean JS file
let outCode = '// Banco oficial e autêntico de jogadores 100% reais do AFM Manager 2027\n';
outCode += '// Abrange Série A, Série B, Série C/D e Principais Clubes Mundiais com elencos reais\n';
outCode += '// Atualização oficial com elencos, overalls, idades, valores e transferências de 2026/2027\n';
outCode += 'window.LIVE_PLAYERS = [\n';

const lines = updatedList.map((p, idx) => {
  const comma = idx === updatedList.length - 1 ? '' : ',';
  return `  {name:'${p.name.replace(/'/g, "\\'")}',club:'${p.club.replace(/'/g, "\\'")}',country:'${p.country}',pos:'${p.pos}',age:${p.age},fc:${p.fc},pes:${p.pes},potential:${p.potential},value:${p.value}}${comma}`;
});

outCode += lines.join('\n') + '\n];\n\n';
outCode += 'window.PLAYER_DB_META = {\n';
outCode += "  source: 'afm-master-database-2027',\n";
outCode += `  updated: '${new Date().toISOString().slice(0, 10)}',\n`;
outCode += `  count: window.LIVE_PLAYERS.length,\n`;
outCode += "  note: 'Banco autêntico com elencos 100% reais de Série A, Série B, Estaduais e gigantes mundiais atualizados.'\n";
outCode += '};\n';

fs.writeFileSync(filePath, outCode, 'utf8');
console.log('Successfully wrote data/players_live.js!');

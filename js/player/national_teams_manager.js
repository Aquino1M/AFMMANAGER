/**
 * AFM MANAGER 2026 / 2027 — SISTEMA OFICIAL DE DATA FIFA & SELEÇÕES NACIONAIS
 * Módulo exclusivo para o Modo Carreira Jogador (Be a Pro).
 * 
 * Regras Invioláveis:
 * 1. Não duplica jogadores (mantém referências reais ao pack window.livePlayers e state.squad).
 * 2. Empréstimo virtual temporário durante a Data FIFA (onInternationalDuty: true).
 * 3. Leitura dinâmica do pack completo agrupado por nacionalidade.
 * 4. Isolamento estrito: zero impacto no Modo Treinador.
 */

(function(window){
  'use strict';

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // CONTROLADOR CENTRAL: SELEÇÕES & CONVOCAÇÃO (AFM_NATIONAL_TEAM)
  // =========================================================================
  const AFM_NATIONAL_TEAM = {
    NATIONS_DB: {
      "Brasil": {
        name: "Brasil",
        officialName: "SELEÇÃO BRASILEIRA",
        prepIn: "no Brasil",
        code: "BRA",
        flag: "🇧🇷",
        confed: "CONMEBOL • CBF",
        federation: "CBF",
        confederation: "CONMEBOL",
        coach: "Carlo Ancelotti",
        stadium: "Maracanã",
        rivals: ["Argentina", "Uruguai", "França", "Alemanha"],
        primaryColor: "#facc15",
        secondaryColor: "#16a34a",
        formation: "4-3-3",
        legends: [
          { name: "Neymar Jr", caps: 128, goals: 79 },
          { name: "Pelé", caps: 92, goals: 77 },
          { name: "Ronaldo Fenômeno", caps: 98, goals: 62 },
          { name: "Romário", caps: 70, goals: 55 },
          { name: "Zico", caps: 71, goals: 48 },
          { name: "Cafu", caps: 142, goals: 5 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 2, team: "Uruguai", flag: "🇺🇾", pts: 20, p: 10, gd: +8, zone: "Copa 2026" },
          { rank: 3, team: "Brasil", flag: "🇧🇷", pts: 19, p: 10, gd: +7, zone: "Copa 2026" },
          { rank: 4, team: "Colômbia", flag: "🇨🇴", pts: 18, p: 10, gd: +5, zone: "Copa 2026" },
          { rank: 5, team: "Equador", flag: "🇪🇨", pts: 16, p: 10, gd: +3, zone: "Copa 2026" },
          { rank: 6, team: "Paraguai", flag: "🇵🇾", pts: 13, p: 10, gd: 0, zone: "Copa 2026" }
        ]
      },
      "Argentina": {
        name: "Argentina",
        officialName: "SELEÇÃO ARGENTINA",
        prepIn: "na Argentina",
        code: "ARG",
        flag: "🇦🇷",
        confed: "CONMEBOL • AFA",
        federation: "AFA",
        confederation: "CONMEBOL",
        coach: "Lionel Scaloni",
        stadium: "Mâs Monumental",
        rivals: ["Brasil", "Uruguai", "Inglaterra", "França"],
        primaryColor: "#38bdf8",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Lionel Messi", caps: 191, goals: 112 },
          { name: "Gabriel Batistuta", caps: 78, goals: 56 },
          { name: "Sergio Agüero", caps: 101, goals: 41 },
          { name: "Diego Maradona", caps: 91, goals: 34 },
          { name: "Javier Mascherano", caps: 147, goals: 3 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 2, team: "Uruguai", flag: "🇺🇾", pts: 20, p: 10, gd: +8, zone: "Copa 2026" },
          { rank: 3, team: "Brasil", flag: "🇧🇷", pts: 19, p: 10, gd: +7, zone: "Copa 2026" },
          { rank: 4, team: "Colômbia", flag: "🇨🇴", pts: 18, p: 10, gd: +5, zone: "Copa 2026" },
          { rank: 5, team: "Equador", flag: "🇪🇨", pts: 16, p: 10, gd: +3, zone: "Copa 2026" },
          { rank: 6, team: "Paraguai", flag: "🇵🇾", pts: 13, p: 10, gd: 0, zone: "Copa 2026" }
        ]
      },
      "Portugal": {
        name: "Portugal",
        officialName: "SELEÇÃO PORTUGUESA",
        prepIn: "em Portugal",
        code: "POR",
        flag: "🇵🇹",
        confed: "UEFA • FPF",
        federation: "FPF",
        confederation: "UEFA",
        coach: "Jorge Jesus",
        stadium: "Estádio da Luz",
        rivals: ["Espanha", "França", "Brasil"],
        primaryColor: "#ef4444",
        secondaryColor: "#16a34a",
        formation: "4-3-3",
        legends: [
          { name: "Cristiano Ronaldo", caps: 217, goals: 135 },
          { name: "Pauleta", caps: 88, goals: 47 },
          { name: "Eusébio", caps: 64, goals: 41 },
          { name: "Luís Figo", caps: 127, goals: 32 },
          { name: "João Moutinho", caps: 146, goals: 7 }
        ],
        qualifiers: [
          { rank: 1, team: "Portugal", flag: "🇵🇹", pts: 24, p: 8, gd: +18, zone: "Copa 2026" },
          { rank: 2, team: "Eslováquia", flag: "🇸🇰", pts: 16, p: 8, gd: +6, zone: "Repescagem" },
          { rank: 3, team: "Luxemburgo", flag: "🇱🇺", pts: 11, p: 8, gd: -3, zone: "Eliminado" }
        ]
      },
      "França": {
        name: "França",
        officialName: "SELEÇÃO FRANCESA",
        prepIn: "na França",
        code: "FRA",
        flag: "🇫🇷",
        confed: "UEFA • FFF",
        federation: "FFF",
        confederation: "UEFA",
        coach: "Zinédine Zidane",
        stadium: "Stade de France",
        rivals: ["Brasil", "Argentina", "Itália", "Inglaterra", "Alemanha"],
        primaryColor: "#3b82f6",
        secondaryColor: "#ef4444",
        formation: "4-2-3-1",
        legends: [
          { name: "Olivier Giroud", caps: 137, goals: 57 },
          { name: "Kylian Mbappé", caps: 92, goals: 52 },
          { name: "Thierry Henry", caps: 123, goals: 51 },
          { name: "Antoine Griezmann", caps: 137, goals: 44 },
          { name: "Michel Platini", caps: 72, goals: 41 },
          { name: "Hugo Lloris", caps: 145, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "França", flag: "🇫🇷", pts: 22, p: 8, gd: +21, zone: "Copa 2026" },
          { rank: 2, team: "Holanda", flag: "🇳🇱", pts: 18, p: 8, gd: +10, zone: "Repescagem" },
          { rank: 3, team: "Grécia", flag: "🇬🇷", pts: 13, p: 8, gd: +2, zone: "Eliminado" }
        ]
      },
      "Espanha": {
        name: "Espanha",
        officialName: "SELEÇÃO ESPANHOLA",
        prepIn: "na Espanha",
        code: "ESP",
        flag: "🇪🇸",
        confed: "UEFA • RFEF",
        federation: "RFEF",
        confederation: "UEFA",
        coach: "Luis de la Fuente",
        stadium: "Santiago Bernabéu",
        rivals: ["Portugal", "França", "Itália", "Alemanha"],
        primaryColor: "#ef4444",
        secondaryColor: "#facc15",
        formation: "4-3-3",
        legends: [
          { name: "David Villa", caps: 98, goals: 59 },
          { name: "Raúl González", caps: 102, goals: 44 },
          { name: "Fernando Torres", caps: 110, goals: 38 },
          { name: "David Silva", caps: 125, goals: 35 },
          { name: "Sergio Ramos", caps: 180, goals: 23 },
          { name: "Iker Casillas", caps: 167, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "Espanha", flag: "🇪🇸", pts: 21, p: 8, gd: +20, zone: "Copa 2026" },
          { rank: 2, team: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", pts: 17, p: 8, gd: +9, zone: "Repescagem" },
          { rank: 3, team: "Noruega", flag: "🇳🇴", pts: 11, p: 8, gd: +2, zone: "Eliminado" }
        ]
      },
      "Alemanha": {
        name: "Alemanha",
        officialName: "SELEÇÃO ALEMÃ",
        prepIn: "na Alemanha",
        code: "GER",
        flag: "🇩🇪",
        confed: "UEFA • DFB",
        federation: "DFB",
        confederation: "UEFA",
        coach: "Jürgen Klopp",
        stadium: "Allianz Arena",
        rivals: ["Holanda", "Itália", "França", "Inglaterra", "Brasil"],
        primaryColor: "#ffffff",
        secondaryColor: "#000000",
        formation: "4-2-3-1",
        legends: [
          { name: "Miroslav Klose", caps: 137, goals: 71 },
          { name: "Gerd Müller", caps: 62, goals: 68 },
          { name: "Lukas Podolski", caps: 130, goals: 49 },
          { name: "Lothar Matthäus", caps: 150, goals: 23 }
        ],
        qualifiers: [
          { rank: 1, team: "Alemanha", flag: "🇩🇪", pts: 24, p: 8, gd: +23, zone: "Copa 2026" },
          { rank: 2, team: "Áustria", flag: "🇦🇹", pts: 16, p: 8, gd: +7, zone: "Repescagem" },
          { rank: 3, team: "Polônia", flag: "🇵🇱", pts: 12, p: 8, gd: +1, zone: "Eliminado" }
        ]
      },
      "Inglaterra": {
        name: "Inglaterra",
        officialName: "SELEÇÃO INGLESA",
        prepIn: "na Inglaterra",
        code: "ENG",
        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        confed: "UEFA • FA",
        federation: "FA",
        confederation: "UEFA",
        coach: "Thomas Tuchel",
        stadium: "Wembley",
        rivals: ["Alemanha", "Argentina", "Escócia", "França"],
        primaryColor: "#ffffff",
        secondaryColor: "#dc2626",
        formation: "4-2-3-1",
        legends: [
          { name: "Harry Kane", caps: 103, goals: 71 },
          { name: "Wayne Rooney", caps: 120, goals: 53 },
          { name: "Bobby Charlton", caps: 106, goals: 49 },
          { name: "Peter Shilton", caps: 125, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pts: 22, p: 8, gd: +18, zone: "Copa 2026" },
          { rank: 2, team: "Itália", flag: "🇮🇹", pts: 16, p: 8, gd: +6, zone: "Repescagem" },
          { rank: 3, team: "Ucrânia", flag: "🇺🇦", pts: 14, p: 8, gd: +3, zone: "Eliminado" }
        ]
      },
      "Itália": {
        name: "Itália",
        officialName: "SELEÇÃO ITALIANA",
        prepIn: "na Itália",
        code: "ITA",
        flag: "🇮🇹",
        confed: "UEFA • FIGC",
        federation: "FIGC",
        confederation: "UEFA",
        coach: "Roberto Mancini",
        stadium: "Stadio Olimpico",
        rivals: ["França", "Alemanha", "Espanha", "Brasil"],
        primaryColor: "#2563eb",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Luigi Riva", caps: 42, goals: 35 },
          { name: "Giuseppe Meazza", caps: 53, goals: 33 },
          { name: "Roberto Baggio", caps: 56, goals: 27 },
          { name: "Gianluigi Buffon", caps: 176, goals: 0 },
          { name: "Paolo Maldini", caps: 126, goals: 7 }
        ],
        qualifiers: [
          { rank: 1, team: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pts: 22, p: 8, gd: +18, zone: "Copa 2026" },
          { rank: 2, team: "Itália", flag: "🇮🇹", pts: 16, p: 8, gd: +6, zone: "Repescagem" },
          { rank: 3, team: "Ucrânia", flag: "🇺🇦", pts: 14, p: 8, gd: +3, zone: "Eliminado" }
        ]
      },
      "Uruguai": {
        name: "Uruguai",
        officialName: "SELEÇÃO URUGUAIA",
        prepIn: "no Uruguai",
        code: "URU",
        flag: "🇺🇾",
        confed: "CONMEBOL • AUF",
        federation: "AUF",
        confederation: "CONMEBOL",
        coach: "Diego Forlán",
        stadium: "Centenario",
        rivals: ["Brasil", "Argentina", "Chile"],
        primaryColor: "#38bdf8",
        secondaryColor: "#000000",
        formation: "4-3-3",
        legends: [
          { name: "Luis Suárez", caps: 143, goals: 69 },
          { name: "Edinson Cavani", caps: 136, goals: 58 },
          { name: "Diego Forlán", caps: 112, goals: 36 },
          { name: "Diego Godín", caps: 161, goals: 8 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 2, team: "Uruguai", flag: "🇺🇾", pts: 20, p: 10, gd: +8, zone: "Copa 2026" },
          { rank: 3, team: "Brasil", flag: "🇧🇷", pts: 19, p: 10, gd: +7, zone: "Copa 2026" },
          { rank: 4, team: "Colômbia", flag: "🇨🇴", pts: 18, p: 10, gd: +5, zone: "Copa 2026" },
          { rank: 5, team: "Equador", flag: "🇪🇨", pts: 16, p: 10, gd: +3, zone: "Copa 2026" },
          { rank: 6, team: "Paraguai", flag: "🇵🇾", pts: 13, p: 10, gd: 0, zone: "Copa 2026" }
        ]
      },
      "Holanda": {
        name: "Holanda",
        officialName: "SELEÇÃO HOLANDESA",
        prepIn: "na Holanda",
        code: "NED",
        flag: "🇳🇱",
        confed: "UEFA • KNVB",
        federation: "KNVB",
        confederation: "UEFA",
        coach: "Xavi Hernández",
        stadium: "Johan Cruijff Arena",
        rivals: ["Alemanha", "Bélgica", "Argentina"],
        primaryColor: "#f97316",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Robin van Persie", caps: 102, goals: 50 },
          { name: "Memphis Depay", caps: 98, goals: 46 },
          { name: "Klaas-Jan Huntelaar", caps: 76, goals: 42 },
          { name: "Dennis Bergkamp", caps: 79, goals: 37 }
        ],
        qualifiers: [
          { rank: 1, team: "França", flag: "🇫🇷", pts: 22, p: 8, gd: +21, zone: "Copa 2026" },
          { rank: 2, team: "Holanda", flag: "🇳🇱", pts: 18, p: 8, gd: +10, zone: "Repescagem" }
        ]
      },
      "Croácia": {
        name: "Croácia",
        officialName: "SELEÇÃO CROATA",
        prepIn: "na Croácia",
        code: "CRO",
        flag: "🇭🇷",
        confed: "UEFA • HNS",
        federation: "HNS",
        confederation: "UEFA",
        coach: "Slaven Bilić",
        stadium: "Maksimir",
        rivals: ["Sérvia", "França", "Brasil"],
        primaryColor: "#ef4444",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Davor Šuker", caps: 69, goals: 45 },
          { name: "Mario Mandžukić", caps: 89, goals: 33 },
          { name: "Luka Modrić", caps: 184, goals: 27 }
        ],
        qualifiers: [
          { rank: 1, team: "Croácia", flag: "🇭🇷", pts: 20, p: 8, gd: +11, zone: "Copa 2026" },
          { rank: 2, team: "Turquia", flag: "🇹🇷", pts: 17, p: 8, gd: +7, zone: "Repescagem" }
        ]
      },
      "Bélgica": {
        name: "Bélgica",
        officialName: "SELEÇÃO BELGA",
        prepIn: "na Bélgica",
        code: "BEL",
        flag: "🇧🇪",
        confed: "UEFA • RBFA",
        federation: "RBFA",
        confederation: "UEFA",
        coach: "Mark van Bommel",
        stadium: "Rei Balduíno",
        rivals: ["França", "Holanda", "Inglaterra"],
        primaryColor: "#dc2626",
        secondaryColor: "#000000",
        formation: "4-3-3",
        legends: [
          { name: "Romelu Lukaku", caps: 120, goals: 85 },
          { name: "Eden Hazard", caps: 126, goals: 33 },
          { name: "Kevin De Bruyne", caps: 109, goals: 30 },
          { name: "Jan Vertonghen", caps: 157, goals: 10 }
        ],
        qualifiers: [
          { rank: 1, team: "Bélgica", flag: "🇧🇪", pts: 20, p: 8, gd: +17, zone: "Copa 2026" },
          { rank: 2, team: "Áustria", flag: "🇦🇹", pts: 19, p: 8, gd: +9, zone: "Repescagem" }
        ]
      },
      "Colômbia": {
        name: "Colômbia",
        officialName: "SELEÇÃO COLOMBIANA",
        prepIn: "na Colômbia",
        code: "COL",
        flag: "🇨🇴",
        confed: "CONMEBOL • FCF",
        federation: "FCF",
        confederation: "CONMEBOL",
        coach: "Néstor Lorenzo",
        stadium: "Metropolitano Roberto Meléndez",
        rivals: ["Brasil", "Argentina", "Peru"],
        primaryColor: "#facc15",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Radamel Falcao", caps: 105, goals: 36 },
          { name: "James Rodríguez", caps: 112, goals: 29 },
          { name: "David Ospina", caps: 128, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 2, team: "Uruguai", flag: "🇺🇾", pts: 20, p: 10, gd: +8, zone: "Copa 2026" },
          { rank: 3, team: "Brasil", flag: "🇧🇷", pts: 19, p: 10, gd: +7, zone: "Copa 2026" },
          { rank: 4, team: "Colômbia", flag: "🇨🇴", pts: 18, p: 10, gd: +5, zone: "Copa 2026" }
        ]
      },
      "Paraguai": {
        name: "Paraguai",
        officialName: "SELEÇÃO PARAGUAIA",
        prepIn: "no Paraguai",
        code: "PAR",
        flag: "🇵🇾",
        confed: "CONMEBOL • APF",
        federation: "APF",
        confederation: "CONMEBOL",
        coach: "Gustavo Alfaro",
        stadium: "Defensores del Chaco",
        rivals: ["Brasil", "Argentina", "Uruguai"],
        primaryColor: "#dc2626",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Roque Santa Cruz", caps: 112, goals: 32 },
          { name: "José Saturnino Cardozo", caps: 82, goals: 25 },
          { name: "Paulo da Silva", caps: 148, goals: 3 },
          { name: "José Luis Chilavert", caps: 74, goals: 8 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 6, team: "Paraguai", flag: "🇵🇾", pts: 13, p: 10, gd: 0, zone: "Copa 2026" }
        ]
      },
      "Equador": {
        name: "Equador",
        officialName: "SELEÇÃO EQUATORIANA",
        prepIn: "no Equador",
        code: "ECU",
        flag: "🇪🇨",
        confed: "CONMEBOL • FEF",
        federation: "FEF",
        confederation: "CONMEBOL",
        coach: "Marcelo Gallardo",
        stadium: "Rodrigo Paz Delgado",
        rivals: ["Colômbia", "Peru", "Brasil"],
        primaryColor: "#facc15",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Enner Valencia", caps: 95, goals: 44 },
          { name: "Agustín Delgado", caps: 71, goals: 31 },
          { name: "Iván Hurtado", caps: 168, goals: 5 },
          { name: "Antonio Valencia", caps: 99, goals: 11 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 5, team: "Equador", flag: "🇪🇨", pts: 16, p: 10, gd: +3, zone: "Copa 2026" }
        ]
      },
      "Chile": {
        name: "Chile",
        officialName: "SELEÇÃO CHILENA",
        prepIn: "no Chile",
        code: "CHI",
        flag: "🇨🇱",
        confed: "CONMEBOL • FFCh",
        federation: "FFCh",
        confederation: "CONMEBOL",
        coach: "Nicolás Córdova",
        stadium: "Estadio Nacional de Chile",
        rivals: ["Peru", "Argentina", "Uruguai"],
        primaryColor: "#dc2626",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Alexis Sánchez", caps: 166, goals: 51 },
          { name: "Eduardo Vargas", caps: 118, goals: 45 },
          { name: "Marcelo Salas", caps: 70, goals: 37 },
          { name: "Arturo Vidal", caps: 144, goals: 34 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 9, team: "Chile", flag: "🇨🇱", pts: 8, p: 10, gd: -10, zone: "Eliminado" }
        ]
      },
      "Peru": {
        name: "Peru",
        officialName: "SELEÇÃO PERUANA",
        prepIn: "no Peru",
        code: "PER",
        flag: "🇵🇪",
        confed: "CONMEBOL • FPF",
        federation: "FPF",
        confederation: "CONMEBOL",
        coach: "Mano Menezes",
        stadium: "Estadio Nacional de Lima",
        rivals: ["Chile", "Equador", "Colômbia"],
        primaryColor: "#ffffff",
        secondaryColor: "#dc2626",
        formation: "4-3-3",
        legends: [
          { name: "Paolo Guerrero", caps: 124, goals: 40 },
          { name: "Jefferson Farfán", caps: 102, goals: 27 },
          { name: "Teófilo Cubillas", caps: 81, goals: 26 },
          { name: "Roberto Palacios", caps: 128, goals: 19 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 8, team: "Peru", flag: "🇵🇪", pts: 9, p: 10, gd: -8, zone: "Eliminado" }
        ]
      },
      "Venezuela": {
        name: "Venezuela",
        officialName: "SELEÇÃO VENEZUELANA",
        prepIn: "na Venezuela",
        code: "VEN",
        flag: "🇻🇪",
        confed: "CONMEBOL • FVF",
        federation: "FVF",
        confederation: "CONMEBOL",
        coach: "Oswaldo Vizcarrondo",
        stadium: "Monumental de Maturín",
        rivals: ["Colômbia", "Bolívia", "Equador"],
        primaryColor: "#7f1d1d",
        secondaryColor: "#facc15",
        formation: "4-3-3",
        legends: [
          { name: "Salomón Rondón", caps: 114, goals: 45 },
          { name: "Juan Arango", caps: 129, goals: 23 },
          { name: "Tomás Rincón", caps: 139, goals: 1 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 7, team: "Venezuela", flag: "🇻🇪", pts: 12, p: 10, gd: -2, zone: "Repescagem" }
        ]
      },
      "Bolívia": {
        name: "Bolívia",
        officialName: "SELEÇÃO BOLIVIANA",
        prepIn: "na Bolívia",
        code: "BOL",
        flag: "🇧🇴",
        confed: "CONMEBOL • FBF",
        federation: "FBF",
        confederation: "CONMEBOL",
        coach: "Óscar Villegas",
        stadium: "Hernando Siles",
        rivals: ["Peru", "Chile", "Paraguai"],
        primaryColor: "#15803d",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Marcelo Moreno", caps: 108, goals: 31 },
          { name: "Joaquín Botero", caps: 48, goals: 20 },
          { name: "Marco Etcheverry", caps: 71, goals: 13 }
        ],
        qualifiers: [
          { rank: 1, team: "Argentina", flag: "🇦🇷", pts: 25, p: 10, gd: +12, zone: "Copa 2026" },
          { rank: 7, team: "Bolívia", flag: "🇧🇴", pts: 12, p: 10, gd: -5, zone: "Repescagem" }
        ]
      },
      "Japão": {
        name: "Japão",
        officialName: "SELEÇÃO JAPONESA",
        prepIn: "no Japão",
        code: "JPN",
        flag: "🇯🇵",
        confed: "AFC • JFA",
        federation: "JFA",
        confederation: "AFC",
        coach: "Hajime Moriyasu",
        stadium: "Saitama Stadium 2002",
        rivals: ["Coreia do Sul", "Austrália", "Arábia Saudita"],
        primaryColor: "#1d4ed8",
        secondaryColor: "#ffffff",
        formation: "4-2-3-1",
        legends: [
          { name: "Kunishige Kamamoto", caps: 76, goals: 75 },
          { name: "Kazuyoshi Miura", caps: 89, goals: 55 },
          { name: "Keisuke Honda", caps: 98, goals: 37 },
          { name: "Yasuhito Endo", caps: 152, goals: 15 }
        ],
        qualifiers: [
          { rank: 1, team: "Japão", flag: "🇯🇵", pts: 24, p: 8, gd: +22, zone: "Copa 2026" },
          { rank: 2, team: "Austrália", flag: "🇦🇺", pts: 16, p: 8, gd: +8, zone: "Copa 2026" }
        ]
      },
      "Coreia do Sul": {
        name: "Coreia do Sul",
        officialName: "SELEÇÃO SUL-COREANA",
        prepIn: "na Coreia do Sul",
        code: "KOR",
        flag: "🇰🇷",
        confed: "AFC • KFA",
        federation: "KFA",
        confederation: "AFC",
        coach: "Robert Moreno",
        stadium: "Seoul World Cup Stadium",
        rivals: ["Japão", "Austrália", "Irã"],
        primaryColor: "#ef4444",
        secondaryColor: "#1e293b",
        formation: "4-2-3-1",
        legends: [
          { name: "Cha Bum-kun", caps: 136, goals: 58 },
          { name: "Heung-min Son", caps: 134, goals: 51 },
          { name: "Park Ji-sung", caps: 100, goals: 13 }
        ],
        qualifiers: [
          { rank: 1, team: "Coreia do Sul", flag: "🇰🇷", pts: 22, p: 8, gd: +16, zone: "Copa 2026" },
          { rank: 2, team: "Jordânia", flag: "🇯🇴", pts: 15, p: 8, gd: +6, zone: "Copa 2026" }
        ]
      },
      "Arábia Saudita": {
        name: "Arábia Saudita",
        officialName: "SELEÇÃO SAUDITA",
        prepIn: "na Arábia Saudita",
        code: "KSA",
        flag: "🇸🇦",
        confed: "AFC • SAFF",
        federation: "SAFF",
        confederation: "AFC",
        coach: "Georgios Donis",
        stadium: "King Fahd Sports City",
        rivals: ["Japão", "Austrália", "Catar"],
        primaryColor: "#16a34a",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Majed Abdullah", caps: 117, goals: 72 },
          { name: "Sami Al-Jaber", caps: 156, goals: 46 },
          { name: "Salem Al-Dawsari", caps: 92, goals: 24 }
        ],
        qualifiers: [
          { rank: 1, team: "Japão", flag: "🇯🇵", pts: 24, p: 8, gd: +22, zone: "Copa 2026" },
          { rank: 2, team: "Arábia Saudita", flag: "🇸🇦", pts: 16, p: 8, gd: +5, zone: "Copa 2026" }
        ]
      },
      "Austrália": {
        name: "Austrália",
        officialName: "SELEÇÃO AUSTRALIANA",
        prepIn: "na Austrália",
        code: "AUS",
        flag: "🇦🇺",
        confed: "AFC • FA",
        federation: "FA",
        confederation: "AFC",
        coach: "Tony Popovic",
        stadium: "Stadium Australia",
        rivals: ["Japão", "Coreia do Sul", "Arábia Saudita"],
        primaryColor: "#facc15",
        secondaryColor: "#15803d",
        formation: "4-2-3-1",
        legends: [
          { name: "Tim Cahill", caps: 108, goals: 50 },
          { name: "Mark Schwarzer", caps: 109, goals: 0 },
          { name: "Harry Kewell", caps: 58, goals: 17 }
        ],
        qualifiers: [
          { rank: 1, team: "Japão", flag: "🇯🇵", pts: 24, p: 8, gd: +22, zone: "Copa 2026" },
          { rank: 2, team: "Austrália", flag: "🇦🇺", pts: 16, p: 8, gd: +8, zone: "Copa 2026" }
        ]
      },
      "Estados Unidos": {
        name: "Estados Unidos",
        officialName: "SELEÇÃO NORTE-AMERICANA",
        prepIn: "nos Estados Unidos",
        code: "USA",
        flag: "🇺🇸",
        confed: "CONCACAF • USSF",
        federation: "USSF",
        confederation: "CONCACAF",
        coach: "Mauricio Pochettino",
        stadium: "MetLife Stadium",
        rivals: ["México", "Canadá"],
        primaryColor: "#ffffff",
        secondaryColor: "#1e3a8a",
        formation: "4-3-3",
        legends: [
          { name: "Clint Dempsey", caps: 141, goals: 57 },
          { name: "Landon Donovan", caps: 157, goals: 57 },
          { name: "Christian Pulisic", caps: 76, goals: 32 }
        ],
        qualifiers: [
          { rank: 1, team: "Estados Unidos", flag: "🇺🇸", pts: 25, p: 10, gd: +15, zone: "País-Sede 2026" },
          { rank: 2, team: "México", flag: "🇲🇽", pts: 22, p: 10, gd: +10, zone: "País-Sede 2026" }
        ]
      },
      "México": {
        name: "México",
        officialName: "SELEÇÃO MEXICANA",
        prepIn: "no México",
        code: "MEX",
        flag: "🇲🇽",
        confed: "CONCACAF • FMF",
        federation: "FMF",
        confederation: "CONCACAF",
        coach: "Rafael Márquez",
        stadium: "Estadio Azteca",
        rivals: ["Estados Unidos", "Canadá", "Argentina"],
        primaryColor: "#15803d",
        secondaryColor: "#dc2626",
        formation: "4-3-3",
        legends: [
          { name: "Javier Hernández", caps: 109, goals: 52 },
          { name: "Jared Borgetti", caps: 89, goals: 46 },
          { name: "Rafael Márquez", caps: 147, goals: 17 },
          { name: "Guillermo Ochoa", caps: 151, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "Estados Unidos", flag: "🇺🇸", pts: 25, p: 10, gd: +15, zone: "País-Sede 2026" },
          { rank: 2, team: "México", flag: "🇲🇽", pts: 22, p: 10, gd: +10, zone: "País-Sede 2026" }
        ]
      },
      "Canadá": {
        name: "Canadá",
        officialName: "SELEÇÃO CANADENSE",
        prepIn: "no Canadá",
        code: "CAN",
        flag: "🇨🇦",
        confed: "CONCACAF • CSA",
        federation: "CSA",
        confederation: "CONCACAF",
        coach: "Jesse Marsch",
        stadium: "BMO Field",
        rivals: ["Estados Unidos", "México"],
        primaryColor: "#dc2626",
        secondaryColor: "#ffffff",
        formation: "4-4-2",
        legends: [
          { name: "Jonathan David", caps: 62, goals: 32 },
          { name: "Cyle Larin", caps: 79, goals: 30 },
          { name: "Alphonso Davies", caps: 58, goals: 15 }
        ],
        qualifiers: [
          { rank: 1, team: "Estados Unidos", flag: "🇺🇸", pts: 25, p: 10, gd: +15, zone: "País-Sede 2026" },
          { rank: 3, team: "Canadá", flag: "🇨🇦", pts: 20, p: 10, gd: +8, zone: "País-Sede 2026" }
        ]
      },
      "Marrocos": {
        name: "Marrocos",
        officialName: "SELEÇÃO MARROQUINA",
        prepIn: "no Marrocos",
        code: "MAR",
        flag: "🇲🇦",
        confed: "CAF • FRMF",
        federation: "FRMF",
        confederation: "CAF",
        coach: "Mohamed Ouahbi",
        stadium: "Complexe Prince Moulay Abdellah",
        rivals: ["Espanha", "Egito", "Senegal"],
        primaryColor: "#dc2626",
        secondaryColor: "#15803d",
        formation: "4-3-3",
        legends: [
          { name: "Ahmed Faras", caps: 94, goals: 36 },
          { name: "Hakim Ziyech", caps: 64, goals: 25 },
          { name: "Achraf Hakimi", caps: 85, goals: 10 }
        ],
        qualifiers: [
          { rank: 1, team: "Marrocos", flag: "🇲🇦", pts: 24, p: 8, gd: +18, zone: "Copa 2026" }
        ]
      },
      "Senegal": {
        name: "Senegal",
        officialName: "SELEÇÃO SENEGALESA",
        prepIn: "no Senegal",
        code: "SEN",
        flag: "🇸🇳",
        confed: "CAF • FSF",
        federation: "FSF",
        confederation: "CAF",
        coach: "Patrick Vieira",
        stadium: "Stade Abdoulaye Wade",
        rivals: ["Marrocos", "Egito", "Nigéria"],
        primaryColor: "#16a34a",
        secondaryColor: "#facc15",
        formation: "4-3-3",
        legends: [
          { name: "Sadio Mané", caps: 111, goals: 45 },
          { name: "Henri Camara", caps: 99, goals: 29 },
          { name: "Idrissa Gueye", caps: 118, goals: 7 }
        ],
        qualifiers: [
          { rank: 1, team: "Senegal", flag: "🇸🇳", pts: 22, p: 8, gd: +14, zone: "Copa 2026" }
        ]
      },
      "Nigéria": {
        name: "Nigéria",
        officialName: "SELEÇÃO NIGERIANA",
        prepIn: "na Nigéria",
        code: "NGA",
        flag: "🇳🇬",
        confed: "CAF • NFF",
        federation: "NFF",
        confederation: "CAF",
        coach: "Éric Chelle",
        stadium: "Moshood Abiola Stadium",
        rivals: ["Camarões", "Gana", "Senegal"],
        primaryColor: "#16a34a",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Rashidi Yekini", caps: 62, goals: 37 },
          { name: "Victor Osimhen", caps: 41, goals: 26 },
          { name: "Jay-Jay Okocha", caps: 73, goals: 14 }
        ],
        qualifiers: [
          { rank: 1, team: "Nigéria", flag: "🇳🇬", pts: 19, p: 8, gd: +10, zone: "Copa 2026" }
        ]
      },
      "Egito": {
        name: "Egito",
        officialName: "SELEÇÃO EGÍPCIA",
        prepIn: "no Egito",
        code: "EGY",
        flag: "🇪🇬",
        confed: "CAF • EFA",
        federation: "EFA",
        confederation: "CAF",
        coach: "Ali Maher",
        stadium: "Cairo International Stadium",
        rivals: ["Marrocos", "Senegal", "Argélia"],
        primaryColor: "#dc2626",
        secondaryColor: "#000000",
        formation: "4-3-3",
        legends: [
          { name: "Hossam Hassan", caps: 176, goals: 68 },
          { name: "Mohamed Salah", caps: 105, goals: 60 },
          { name: "Ahmed Hassan", caps: 184, goals: 33 }
        ],
        qualifiers: [
          { rank: 1, team: "Egito", flag: "🇪🇬", pts: 22, p: 8, gd: +15, zone: "Copa 2026" }
        ]
      },
      "Suíça": {
        name: "Suíça",
        officialName: "SELEÇÃO SUÍÇA",
        prepIn: "na Suíça",
        code: "SUI",
        flag: "🇨🇭",
        confed: "UEFA • SFV",
        federation: "SFV",
        confederation: "UEFA",
        coach: "Murat Yakin",
        stadium: "St. Jakob-Park",
        rivals: ["Áustria", "Alemanha", "França"],
        primaryColor: "#dc2626",
        secondaryColor: "#ffffff",
        formation: "3-4-2-1",
        legends: [
          { name: "Alexander Frei", caps: 84, goals: 42 },
          { name: "Xherdan Shaqiri", caps: 125, goals: 32 },
          { name: "Granit Xhaka", caps: 135, goals: 14 }
        ],
        qualifiers: [
          { rank: 1, team: "Suíça", flag: "🇨🇭", pts: 19, p: 8, gd: +11, zone: "Copa 2026" }
        ]
      },
      "Dinamarca": {
        name: "Dinamarca",
        officialName: "SELEÇÃO DINAMARQUESA",
        prepIn: "na Dinamarca",
        code: "DEN",
        flag: "🇩🇰",
        confed: "UEFA • DBU",
        federation: "DBU",
        confederation: "UEFA",
        coach: "Brian Riemer",
        stadium: "Parken",
        rivals: ["Suécia", "Noruega", "Alemanha"],
        primaryColor: "#dc2626",
        secondaryColor: "#ffffff",
        formation: "4-3-3",
        legends: [
          { name: "Poul Nielsen", caps: 38, goals: 52 },
          { name: "Christian Eriksen", caps: 140, goals: 43 },
          { name: "Peter Schmeichel", caps: 129, goals: 1 }
        ],
        qualifiers: [
          { rank: 1, team: "Dinamarca", flag: "🇩🇰", pts: 20, p: 8, gd: +12, zone: "Copa 2026" }
        ]
      },
      "Noruega": {
        name: "Noruega",
        officialName: "SELEÇÃO NORUEGUESA",
        prepIn: "na Noruega",
        code: "NOR",
        flag: "🇳🇴",
        confed: "UEFA • NFF",
        federation: "NFF",
        confederation: "UEFA",
        coach: "Ståle Solbakken",
        stadium: "Ullevaal Stadion",
        rivals: ["Suécia", "Dinamarca"],
        primaryColor: "#dc2626",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Erling Haaland", caps: 41, goals: 40 },
          { name: "Jørgen Juve", caps: 45, goals: 33 },
          { name: "John Arne Riise", caps: 110, goals: 16 }
        ],
        qualifiers: [
          { rank: 1, team: "Noruega", flag: "🇳🇴", pts: 19, p: 8, gd: +13, zone: "Copa 2026" }
        ]
      },
      "Suécia": {
        name: "Suécia",
        officialName: "SELEÇÃO SUECA",
        prepIn: "na Suécia",
        code: "SWE",
        flag: "🇸🇪",
        confed: "UEFA • SvFF",
        federation: "SvFF",
        confederation: "UEFA",
        coach: "Graham Potter",
        stadium: "Strawberry Arena",
        rivals: ["Dinamarca", "Noruega"],
        primaryColor: "#facc15",
        secondaryColor: "#1d4ed8",
        formation: "4-3-3",
        legends: [
          { name: "Zlatan Ibrahimović", caps: 122, goals: 62 },
          { name: "Sven Rydell", caps: 43, goals: 49 },
          { name: "Henrik Larsson", caps: 106, goals: 37 }
        ],
        qualifiers: [
          { rank: 1, team: "Suécia", flag: "🇸🇪", pts: 18, p: 8, gd: +11, zone: "Copa 2026" }
        ]
      },
      "Polônia": {
        name: "Polônia",
        officialName: "SELEÇÃO POLONESA",
        prepIn: "na Polônia",
        code: "POL",
        flag: "🇵🇱",
        confed: "UEFA • PZPN",
        federation: "PZPN",
        confederation: "UEFA",
        coach: "Jan Urban",
        stadium: "PGE Narodowy",
        rivals: ["Alemanha", "Ucrânia", "Tchéquia"],
        primaryColor: "#ffffff",
        secondaryColor: "#dc2626",
        formation: "3-5-2",
        legends: [
          { name: "Robert Lewandowski", caps: 158, goals: 85 },
          { name: "Włodzimierz Lubański", caps: 75, goals: 48 },
          { name: "Grzegorz Lato", caps: 100, goals: 45 }
        ],
        qualifiers: [
          { rank: 1, team: "Alemanha", flag: "🇩🇪", pts: 24, p: 8, gd: +23, zone: "Copa 2026" },
          { rank: 2, team: "Polônia", flag: "🇵🇱", pts: 16, p: 8, gd: +7, zone: "Repescagem" }
        ]
      },
      "Turquia": {
        name: "Turquia",
        officialName: "SELEÇÃO TURCA",
        prepIn: "na Turquia",
        code: "TUR",
        flag: "🇹🇷",
        confed: "UEFA • TFF",
        federation: "TFF",
        confederation: "UEFA",
        coach: "Sergen Yalçın",
        stadium: "Atatürk Olympic Stadium",
        rivals: ["Grécia", "Croácia"],
        primaryColor: "#dc2626",
        secondaryColor: "#ffffff",
        formation: "4-2-3-1",
        legends: [
          { name: "Hakan Şükür", caps: 112, goals: 51 },
          { name: "Burak Yılmaz", caps: 77, goals: 31 },
          { name: "Rüştü Reçber", caps: 120, goals: 0 }
        ],
        qualifiers: [
          { rank: 1, team: "Turquia", flag: "🇹🇷", pts: 19, p: 8, gd: +10, zone: "Copa 2026" }
        ]
      },
      "Áustria": {
        name: "Áustria",
        officialName: "SELEÇÃO AUSTRÍACA",
        prepIn: "na Áustria",
        code: "AUT",
        flag: "🇦🇹",
        confed: "UEFA • ÖFB",
        federation: "ÖFB",
        confederation: "UEFA",
        coach: "Ralf Rangnick",
        stadium: "Ernst-Happel-Stadion",
        rivals: ["Alemanha", "Suíça"],
        primaryColor: "#dc2626",
        secondaryColor: "#ffffff",
        formation: "4-2-3-1",
        legends: [
          { name: "Toni Polster", caps: 95, goals: 44 },
          { name: "Marko Arnautović", caps: 121, goals: 39 },
          { name: "David Alaba", caps: 105, goals: 15 }
        ],
        qualifiers: [
          { rank: 1, team: "Áustria", flag: "🇦🇹", pts: 19, p: 8, gd: +11, zone: "Copa 2026" }
        ]
      },
      "Sérvia": {
        name: "Sérvia",
        officialName: "SELEÇÃO SÉRVIA",
        prepIn: "na Sérvia",
        code: "SRB",
        flag: "🇷🇸",
        confed: "UEFA • FSS",
        federation: "FSS",
        confederation: "UEFA",
        coach: "Veljko Paunović",
        stadium: "Rajko Mitić",
        rivals: ["Croácia", "Suíça"],
        primaryColor: "#dc2626",
        secondaryColor: "#1d4ed8",
        formation: "3-4-2-1",
        legends: [
          { name: "Aleksandar Mitrović", caps: 98, goals: 59 },
          { name: "Dušan Tadić", caps: 111, goals: 23 },
          { name: "Branislav Ivanović", caps: 105, goals: 13 }
        ],
        qualifiers: [
          { rank: 1, team: "Sérvia", flag: "🇷🇸", pts: 18, p: 8, gd: +8, zone: "Copa 2026" }
        ]
      }
    },

    getNationProfile: function(countryName) {
      const cleanRaw = String(countryName || "Brasil").trim();
      const norm = typeof normalizeNationality === 'function' ? normalizeNationality(cleanRaw) : cleanRaw;
      if (this.NATIONS_DB[norm]) return this.NATIONS_DB[norm];
      if (this.NATIONS_DB[cleanRaw]) return this.NATIONS_DB[cleanRaw];

      const clean = norm || cleanRaw || "Brasil";
      const upper = clean.toUpperCase();
      let prep = `em ${clean}`;
      let official = `SELEÇÃO ${upper}`;
      if (clean.endsWith('a') || clean.endsWith('ã')) {
        prep = `na ${clean}`;
      } else if (clean.endsWith('o') || clean.endsWith('os') || clean === 'Brasil') {
        prep = `no ${clean}`;
      }

      return {
        name: clean,
        officialName: official,
        prepIn: prep,
        code: clean.slice(0, 3).toUpperCase(),
        flag: "🏳️",
        confed: "FIFA • FEDERAÇÃO NACIONAL",
        federation: "FEDERAÇÃO",
        confederation: "FIFA",
        coach: "Selecionador Nacional",
        stadium: "Estádio Nacional",
        rivals: ["Rivais Continentais"],
        primaryColor: "#facc15",
        secondaryColor: "#38bdf8",
        formation: "4-3-3",
        legends: [
          { name: "Lenda Histórica", caps: 110, goals: 48 },
          { name: "Capitão Histórico", caps: 125, goals: 12 }
        ],
        qualifiers: [
          { rank: 1, team: clean, flag: "🏳️", pts: 18, p: 8, gd: +10, zone: "Copa 2026" },
          { rank: 2, team: "Rival Direto", flag: "🌎", pts: 15, p: 8, gd: +5, zone: "Copa 2026" }
        ]
      };
    },

    buildAvatarFallbackUri: function(playerName, bg = "#1e293b", fg = "#facc15") {
      const parts = String(playerName || "JG").trim().split(/\s+/);
      const initials = (parts[0]?.[0] || "J") + (parts[1]?.[0] || parts[0]?.[1] || "G");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="14" fill="${bg}"/><text x="40" y="48" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="${fg}" text-anchor="middle">${initials.toUpperCase()}</text></svg>`;
      return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    },

    computeCallUpScore: function(ovr, apps, goals, assists, avgRating, compPrestige = 1.0) {
      const base = Number(ovr || 50) * 1.0;
      const prest = Math.max(0.2, Number(compPrestige) || 1.0);
      const formBonus = (Number(avgRating || 6.5) - 6.0) * 8 * prest;
      const prodBonus = (Number(goals || 0) * 0.45 + Number(assists || 0) * 0.35 + Math.min(20, Number(apps || 0) * 0.25)) * prest;
      return Number((base + formBonus + prodBonus).toFixed(1));
    },

    ensureNationalData: function(state = (typeof window !== 'undefined' ? window.state : null)) {
      if (!state) return null;
      const pState = state.playerCareerState || state.player || {};
      const athlete = state.player || (pState.athlete) || {};

      pState.nationality = normalizeNationality(pState.nationality || athlete.nationality || "Brasil");
      pState.internationalCaps = Number(pState.internationalCaps || pState.internationalStats?.caps || 0);
      pState.internationalGoals = Number(pState.internationalGoals || pState.internationalStats?.goals || 0);
      pState.internationalAssists = Number(pState.internationalAssists || pState.internationalStats?.assists || 0);
      pState.internationalTrophies = Array.isArray(pState.internationalTrophies) 
        ? pState.internationalTrophies 
        : (pState.internationalStats?.titles || []);

      const currentRound = Number(state.round || 1);
      const fifaRounds = [6, 12, 18, 24, 30, 36];
      const nextFifaRound = fifaRounds.find(r => r >= currentRound) || (currentRound + 5);
      const roundsLeft = Math.max(0, nextFifaRound - currentRound);

      const nation = this.getNationProfile(pState.nationality);
      const opponentsByConfed = {
        "CONMEBOL • CBF": ["Argentina", "Uruguai", "Colômbia", "Chile", "Equador"],
        "CONMEBOL • AFA": ["Brasil", "Uruguai", "Colômbia", "Peru", "Paraguai"],
        "UEFA • FPF": ["Espanha", "França", "Alemanha", "Inglaterra", "Holanda"],
        "UEFA • FFF": ["Alemanha", "Itália", "Espanha", "Inglaterra", "Portugal"],
        "UEFA • RFEF": ["Portugal", "França", "Itália", "Alemanha", "Croácia"],
        "UEFA • DFB": ["Holanda", "França", "Espanha", "Itália", "Inglaterra"]
      };
      const pool = opponentsByConfed[nation.confed] || nation.rivals || ["Argentina", "França", "Alemanha", "Espanha"];
      const nextOpponent = pool[(nextFifaRound + currentRound) % pool.length] || "Argentina";

      pState.nationalContext = {
        nation,
        nextFifaRound,
        roundsLeft,
        nextOpponent,
        competition: nextFifaRound % 12 === 0 ? "Eliminatórias da Copa" : "Amistoso Internacional FIFA"
      };

      // Atualiza snapshots cacheados em saves existentes para refletir o técnico atual da seleção
      if (pState.lastCallUpData && pState.lastCallUpData.meta) {
        pState.lastCallUpData.meta = Object.assign({}, pState.lastCallUpData.meta, getNationalTeamMeta(pState.lastCallUpData.country || pState.nationality));
      }
      if (pState.fifaFixture) {
        if (pState.fifaFixture.userCallUp?.meta) {
          pState.fifaFixture.userCallUp.meta = Object.assign({}, pState.fifaFixture.userCallUp.meta, getNationalTeamMeta(pState.fifaFixture.homeCountry || pState.nationality));
        }
        if (pState.fifaFixture.oppCallUp?.meta) {
          pState.fifaFixture.oppCallUp.meta = Object.assign({}, pState.fifaFixture.oppCallUp.meta, getNationalTeamMeta(pState.fifaFixture.awayCountry));
        }
      }

      if (state.player) {
        state.player.nationality = pState.nationality;
        state.player.internationalCaps = pState.internationalCaps;
        state.player.internationalGoals = pState.internationalGoals;
        state.player.nationalContext = pState.nationalContext;
      }

      return pState.nationalContext;
    }
  };

  window.AFM_NATIONAL_TEAM = AFM_NATIONAL_TEAM;


  // =========================================================================
  // 1. CATÁLOGO OFICIAL DE SELEÇÕES NACIONAIS (FONTE ÚNICA DE VERDADE = NATIONS_DB)
  // =========================================================================
  const NATIONAL_TEAMS_CATALOG = Object.fromEntries(
    Object.entries(AFM_NATIONAL_TEAM.NATIONS_DB).map(([key, item]) => [
      key,
      Object.assign({}, item, {
        textBadge: item.federation || item.code
      })
    ])
  );

  // Mapeamento de sinônimos e nomes comuns para o catálogo padrão
  const NATIONALITY_SYNONYMS = {
    'brazil': 'Brasil',
    'brasil': 'Brasil',
    'brasileiro': 'Brasil',
    'brasileira': 'Brasil',
    'argentina': 'Argentina',
    'argentino': 'Argentina',
    'france': 'França',
    'frança': 'França',
    'frances': 'França',
    'francês': 'França',
    'portugal': 'Portugal',
    'portugues': 'Portugal',
    'português': 'Portugal',
    'england': 'Inglaterra',
    'inglaterra': 'Inglaterra',
    'ingles': 'Inglaterra',
    'inglês': 'Inglaterra',
    'spain': 'Espanha',
    'espanha': 'Espanha',
    'espanhol': 'Espanha',
    'uruguay': 'Uruguai',
    'uruguai': 'Uruguai',
    'uruguaio': 'Uruguai',
    'germany': 'Alemanha',
    'alemanha': 'Alemanha',
    'alemao': 'Alemanha',
    'alemão': 'Alemanha',
    'italy': 'Itália',
    'italia': 'Itália',
    'italiano': 'Itália',
    'netherlands': 'Holanda',
    'the netherlands': 'Holanda',
    'países baixos': 'Holanda',
    'paises baixos': 'Holanda',
    'holanda': 'Holanda',
    'holandes': 'Holanda',
    'holandês': 'Holanda',
    'colombia': 'Colômbia',
    'colômbia': 'Colômbia',
    'colombiano': 'Colômbia',
    'paraguay': 'Paraguai',
    'paraguai': 'Paraguai',
    'paraguaio': 'Paraguai',
    'ecuador': 'Equador',
    'equador': 'Equador',
    'equatoriano': 'Equador',
    'chile': 'Chile',
    'chileno': 'Chile',
    'peru': 'Peru',
    'peruano': 'Peru',
    'venezuela': 'Venezuela',
    'venezuelano': 'Venezuela',
    'bolivia': 'Bolívia',
    'bolívia': 'Bolívia',
    'boliviano': 'Bolívia',
    'united states': 'Estados Unidos',
    'usa': 'Estados Unidos',
    'estados unidos': 'Estados Unidos',
    'eua': 'Estados Unidos',
    'mexico': 'México',
    'méxico': 'México',
    'mexicano': 'México',
    'canada': 'Canadá',
    'canadá': 'Canadá',
    'canadense': 'Canadá',
    'japan': 'Japão',
    'japao': 'Japão',
    'japão': 'Japão',
    'japones': 'Japão',
    'japonês': 'Japão',
    'south korea': 'Coreia do Sul',
    'korea republic': 'Coreia do Sul',
    'republic of korea': 'Coreia do Sul',
    'coreia do sul': 'Coreia do Sul',
    'saudi arabia': 'Arábia Saudita',
    'arabia saudita': 'Arábia Saudita',
    'arábia saudita': 'Arábia Saudita',
    'australia': 'Austrália',
    'austrália': 'Austrália',
    'morocco': 'Marrocos',
    'marrocos': 'Marrocos',
    'senegal': 'Senegal',
    'nigeria': 'Nigéria',
    'nigéria': 'Nigéria',
    'egypt': 'Egito',
    'egito': 'Egito',
    'belgium': 'Bélgica',
    'belgica': 'Bélgica',
    'bélgica': 'Bélgica',
    'croatia': 'Croácia',
    'croacia': 'Croácia',
    'croácia': 'Croácia',
    'switzerland': 'Suíça',
    'suica': 'Suíça',
    'suíça': 'Suíça',
    'denmark': 'Dinamarca',
    'dinamarca': 'Dinamarca',
    'norway': 'Noruega',
    'noruega': 'Noruega',
    'sweden': 'Suécia',
    'suecia': 'Suécia',
    'suécia': 'Suécia',
    'poland': 'Polônia',
    'polonia': 'Polônia',
    'polônia': 'Polônia',
    'turkey': 'Turquia',
    'türkiye': 'Turquia',
    'turkiye': 'Turquia',
    'turquia': 'Turquia',
    'austria': 'Áustria',
    'áustria': 'Áustria',
    'serbia': 'Sérvia',
    'servia': 'Sérvia',
    'sérvia': 'Sérvia'
  };

  // =========================================================================
  // 2. DATAS FIFA OFICIAIS (CALENDÁRIO DA TEMPORADA)
  // =========================================================================
  const FIFA_WINDOWS_SCHEDULE = [
    {
      id: 'fifa_window_1',
      name: 'Data FIFA de Março',
      type: 'Eliminatórias / Amistosos',
      startMmDd: '03-24',
      matchMmDd: '03-27',
      endMmDd: '03-31',
      desc: 'Rodada Oficial de Eliminatórias e Amistosos Internacionais'
    },
    {
      id: 'fifa_window_2',
      name: 'Data FIFA de Junho',
      type: 'Preparação Internacional',
      startMmDd: '06-02',
      matchMmDd: '06-05',
      endMmDd: '06-09',
      desc: 'Testes de alto nível com confrontos entre seleções de diferentes continentes'
    },
    {
      id: 'fifa_window_3',
      name: 'Data FIFA de Setembro',
      type: 'Eliminatórias',
      startMmDd: '09-01',
      matchMmDd: '09-04',
      endMmDd: '09-08',
      desc: 'Disputa acirrada por vagas na Copa do Mundo'
    },
    {
      id: 'fifa_window_4',
      name: 'Data FIFA de Outubro',
      type: 'Eliminatórias',
      startMmDd: '10-06',
      matchMmDd: '10-09',
      endMmDd: '10-13',
      desc: 'Reta decisiva das Eliminatórias Continentais'
    },
    {
      id: 'fifa_window_5',
      name: 'Data FIFA de Novembro',
      type: 'Superclássico Internacional',
      startMmDd: '11-10',
      matchMmDd: '11-14',
      endMmDd: '11-18',
      desc: 'Encerramento do ano com confrontos históricos entre grandes seleções'
    }
  ];

  /**
   * Normaliza qualquer string de país para o catálogo oficial
   */
  function normalizeNationality(rawCountry, clubName = null){
    const clean = String(rawCountry || '').trim();
    const cleanLower = clean.toLowerCase();
    if(cleanLower && NATIONALITY_SYNONYMS[cleanLower]){
      return NATIONALITY_SYNONYMS[cleanLower];
    }
    for(const key of Object.keys(NATIONAL_TEAMS_CATALOG)){
      if(key.toLowerCase() === cleanLower){
        return key;
      }
    }
    // Se o país veio preenchido mas não está nas chaves diretas (ex: Marrocos, Senegal, Sérvia), mantém o país real
    if(clean && clean !== 'null' && clean !== 'undefined' && clean.length > 2){
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    // Dedução pelo clube APENAS caso o jogador não tenha país definido
    if(clubName){
      const cLower = String(clubName).toLowerCase();
      if(cLower.includes('boca') || cLower.includes('river') || cLower.includes('racing') || cLower.includes('independiente') || cLower.includes('san lorenzo')){
        return 'Argentina';
      }
      if(cLower.includes('inter miami') || cLower.includes('la galaxy') || cLower.includes('ny red bulls')){
        return 'Estados Unidos';
      }
      if(cLower.includes('benfica') || cLower.includes('porto') || cLower.includes('sporting')){
        return 'Portugal';
      }
      if(cLower.includes('real madrid') || cLower.includes('barcelona') || cLower.includes('atlético de madrid')){
        return 'Espanha';
      }
      if(cLower.includes('psg') || cLower.includes('paris') || cLower.includes('marseille') || cLower.includes('lyon')){
        return 'França';
      }
      if(cLower.includes('manchester') || cLower.includes('liverpool') || cLower.includes('arsenal') || cLower.includes('chelsea')){
        return 'Inglaterra';
      }
      if(cLower.includes('bayern') || cLower.includes('dortmund') || cLower.includes('leverkusen')){
        return 'Alemanha';
      }
    }
    return 'Brasil'; // Padrão base da liga se vazio
  }

  /**
   * Retorna os metadados da seleção nacional
   */
  function getNationalTeamMeta(countryName){
    const normName = normalizeNationality(countryName);
    const catalogMeta = NATIONAL_TEAMS_CATALOG[normName] || NATIONAL_TEAMS_CATALOG['Brasil'];
    const dbProfile = AFM_NATIONAL_TEAM.getNationProfile(normName);
    return Object.assign({}, catalogMeta, dbProfile);
  }

  /**
   * Converte a posição do atleta no setor macro de convocação:
   * 'GK' | 'DEF' | 'MID' | 'ATT'
   */
  function getPlayerSector(pos){
    const p = String(pos || '').trim().toUpperCase();
    if(p === 'GK' || p === 'GOL' || p === 'GL') return 'GK';
    if(['CB', 'LB', 'RB', 'LWB', 'RWB', 'ZAG', 'LE', 'LD', 'ZG', 'DF'].includes(p)) return 'DEF';
    if(['DM', 'CM', 'AM', 'LM', 'RM', 'VOL', 'MC', 'MEI', 'MD', 'ME'].includes(p)) return 'MID';
    return 'ATT'; // 'CF', 'ST', 'LW', 'RW', 'ATA', 'SA', 'PD', 'PE', etc.
  }

  /**
   * 2. ALGORITMO DE CONVOCAÇÃO POR DESEMPENHO (calculateCallUpScore)
   * Fórmula balanceada por OVR, desempenho da temporada e prestígio da competição
   */
  function calculateCallUpScore(player, gameState = null){
    if(!player) return 0;
    const ovr = Number(player.overall || player.ovr || player.fc || player.pes) || 60;
    
    // Estatísticas da temporada ativa
    const pCareer = gameState?.playerCareerState;
    const isCareerAthlete = Boolean(pCareer && ((gameState.controlledPlayerId != null && player.id === gameState.controlledPlayerId) || player.isControlled || player.name === pCareer.athleteName));
    const sStats = isCareerAthlete ? (pCareer.seasonStats || player.seasonStats || {}) : (player.seasonStats || {});
    const curSeasonStr = String(gameState?.season || '2026').slice(0, 4);
    const history = isCareerAthlete ? (pCareer.matchRatingHistory || []).filter(match => match.date && String(match.date).startsWith(curSeasonStr)) : [];
    
    const matches = isCareerAthlete
      ? Number(sStats.matches || sStats.games || history.length || 0)
      : Math.max(Number(sStats.matches || sStats.matchesPlayed) || 0, Number(player.matches) || 0);

    const goals = matches > 0
      ? (isCareerAthlete ? Number(sStats.goals || 0) : Math.max(Number(sStats.goals) || 0, Number(player.goals) || 0))
      : 0;

    const assists = matches > 0
      ? (isCareerAthlete ? Number(sStats.assists || 0) : Math.max(Number(sStats.assists) || 0, Number(player.assists) || 0))
      : 0;

    const avgRating = matches > 0
      ? Number(sStats.averageRating || sStats.avgRating || (history.length ? history.reduce((sum, match) => sum + (Number(match.rating) || 0), 0) / history.length : 0) || player.averageRating || player.rating || 6.5)
      : 6.5;

    const cleanSheets = matches > 0 ? Number(sStats.cleanSheets || player.cleanSheets || 0) : 0;
    const mvpCount = matches > 0 ? Number(sStats.mvpCount || player.mvpCount || 0) : 0;

    // Fator de prestígio da competição do clube
    let compPrestige = 1.0;
    if(isCareerAthlete){
      const currentCompId = String(gameState?.compId || '').toLowerCase();
      if(currentCompId.startsWith('bra-est-')) compPrestige = 0.25;
      else if(currentCompId === 'bra-d') compPrestige = 0.35;
      else if(currentCompId === 'bra-c') compPrestige = 0.50;
      else if(currentCompId === 'bra-b') compPrestige = 0.75;
      else if(currentCompId === 'bra-a' || currentCompId === 'bra-cup') compPrestige = 1.0;
      else if(['lib', 'sud'].includes(currentCompId)) compPrestige = 1.1;
      else if(['ucl', 'uel'].includes(currentCompId)) compPrestige = 1.25;
    }

    let score = (ovr * 1.0) +
                ((avgRating - 6.0) * 8.0 * compPrestige) +
                ((goals * 0.8 + assists * 0.6) * compPrestige) +
                ((matches * 0.3 + cleanSheets * 0.4 + mvpCount * 1.5) * compPrestige);

    // Bônus para atletas com convocações internacionais comprovadas
    if(isCareerAthlete){
      const caps = Number(pCareer.internationalStats?.caps || pCareer.internationalCaps || 0);
      if(caps > 0) score += Math.min(10, caps * 1.2);
    }

    return Math.round(score * 10) / 10;
  }

  /**
   * Varredura do pack completo agrupando os jogadores de uma nacionalidade
   * Nunca duplica jogadores e inclui o jogador do usuário se for do mesmo país.
   */
  function getPlayerPoolByNationality(countryName, gameState = null){
    const targetCountry = normalizeNationality(countryName);
    const map = new Map();

    function addPlayer(p, sourceClub){
      if(!p || !p.name) return;
      const pCountry = normalizeNationality(p.country || p.nationality, p.club || sourceClub);
      if(pCountry !== targetCountry) return;

      const pKey = String(p.id || p.tmId || (p.name + '_' + (p.club || sourceClub))).toLowerCase();
      if(map.has(pKey)) return;

      const ovr = Number(p.overall || p.ovr || p.fc || p.pes) || 65;
      const sector = getPlayerSector(p.pos || p.position);
      const isUser = Boolean(p.isControlled || (gameState?.controlledPlayerId != null && p.id === gameState.controlledPlayerId) || (gameState?.playerCareerState?.athleteName && p.name === gameState.playerCareerState.athleteName));

      // Estatísticas da temporada: se matches for 0, goals e assists são rigorosamente 0
      let pMatches = 0;
      let pGoals = 0;
      let pAssists = 0;
      let pRating = 6.5;

      if (isUser) {
        const pCareer = gameState?.playerCareerState;
        const sStats = pCareer?.seasonStats || {};
        pMatches = Number(sStats.matches || sStats.games || p.matches || p.games || 0);
        pGoals = pMatches > 0 ? Number(sStats.goals ?? p.goals ?? 0) : 0;
        pAssists = pMatches > 0 ? Number(sStats.assists ?? p.assists ?? 0) : 0;
        pRating = pMatches > 0 ? Number(sStats.avgRating || sStats.averageRating || p.averageRating || p.rating || 6.5) : 6.5;
      } else if (gameState && Number(gameState.round) > 1) {
        const curRound = Number(gameState.round);
        pMatches = Math.max(0, Math.min(curRound - 1, Math.floor((curRound - 1) * (0.8 + (ovr % 10) * 0.02))));
        if (pMatches > 0) {
          if (sector === 'ATT') {
            pGoals = Math.round(pMatches * (ovr / 95) * 0.45);
            pAssists = Math.round(pMatches * (ovr / 95) * 0.25);
          } else if (sector === 'MID') {
            pGoals = Math.round(pMatches * (ovr / 95) * 0.18);
            pAssists = Math.round(pMatches * (ovr / 95) * 0.35);
          } else if (sector === 'DEF') {
            pGoals = Math.round(pMatches * 0.05);
            pAssists = Math.round(pMatches * 0.12);
          }
          const baseRating = 6.4 + ((ovr - 70) * 0.025);
          pRating = Number(Math.max(6.0, Math.min(8.6, baseRating + (pGoals * 0.04))).toFixed(1));
        }
      }

      const pCandidate = {
        ...p,
        matches: pMatches,
        goals: pGoals,
        assists: pAssists,
        rating: pRating,
        avgRating: pRating,
        overall: ovr,
        ovr: ovr,
        pos: p.pos || p.position || 'ATA',
        sector: sector,
        isUser: isUser
      };

      map.set(pKey, {
        id: p.id || pKey,
        key: pKey,
        name: p.name,
        fullName: p.fullName || p.name,
        pos: pCandidate.pos,
        sector: sector,
        club: p.club || sourceClub || 'Clube',
        country: targetCountry,
        overall: ovr,
        ovr: ovr,
        age: Number(p.age) || 24,
        goals: pGoals,
        assists: pAssists,
        cleanSheets: Number(p.cleanSheets || p.seasonStats?.cleanSheets || 0),
        matches: pMatches,
        rating: pRating,
        avgRating: pRating,
        photo: p.photo || null,
        isUser: isUser,
        score: calculateCallUpScore(pCandidate, gameState),
        rawRef: p
      });
    }

    // 1. Jogadores do Elenco do Usuário (incluindo o próprio atleta controlado)
    if(gameState && Array.isArray(gameState.squad)){
      gameState.squad.forEach(p => addPlayer(p, gameState.club));
    }

    // 2. Pack Principal Mundial / Nacional (window.livePlayers)
    if(Array.isArray(window.livePlayers)){
      window.livePlayers.forEach(p => addPlayer(p, p.club));
    } else if(Array.isArray(window.LIVE_PLAYERS)){
      window.LIVE_PLAYERS.forEach(p => addPlayer(p, p.club));
    }

    // 3. Regens mundiais se houver no save
    if(gameState && Array.isArray(gameState.worldRegens)){
      gameState.worldRegens.forEach(p => addPlayer(p, p.club));
    }

    return Array.from(map.values());
  }

  /**
   * Gera a Convocação Oficial de 23 Jogadores para uma Seleção Nacional
   * - 3 Goleiros (GK)
   * - 8 Defensores (CB, LB, RB)
   * - 6 Meio-Campistas (DM, CM, AM)
   * - 6 Atacantes (LW, RW, CF, ST)
   */
  function generateNationalTeamCallUp(countryName, gameState = null){
    if(countryName && typeof countryName === 'object' && !gameState){
      gameState = countryName;
      countryName = gameState?.playerCareerState?.nationality || 'Brasil';
    } else if(countryName && typeof countryName === 'object' && typeof gameState === 'string'){
      const tmp = countryName;
      countryName = gameState;
      gameState = tmp;
    }
    const meta = getNationalTeamMeta(countryName);
    const pool = getPlayerPoolByNationality(meta.name, gameState);

    // Agrupa por setor e ordena por score decrescente
    const gks = pool.filter(p => p.sector === 'GK').sort((a,b) => b.score - a.score);
    const defs = pool.filter(p => p.sector === 'DEF').sort((a,b) => b.score - a.score);
    const mids = pool.filter(p => p.sector === 'MID').sort((a,b) => b.score - a.score);
    const atts = pool.filter(p => p.sector === 'ATT').sort((a,b) => b.score - a.score);

    // Regra de Piso de OVR para Convocação por Prestígio da Seleção Nacional (Regra 25):
    // Brasil e potências mundiais (Tier 1): mínimo 75 OVR.
    // Seleções médias (Tier 2): mínimo 68 OVR.
    // Seleções menores (Tier 3): mínimo 60 OVR.
    const tier1Nations = ['brasil', 'argentina', 'franca', 'espanha', 'inglaterra', 'alemanha', 'portugal', 'italia', 'holanda', 'belgica', 'uruguai'];
    const normCountry = normalizeNationality(meta.name).toLowerCase();
    const minCallUpOvr = tier1Nations.includes(normCountry) ? 75 : 68;

    // Filtra convocados respeitando o piso de OVR da seleção
    const eligibleGKs = gks.filter(p => Number(p.ovr) >= minCallUpOvr);
    const eligibleDefs = defs.filter(p => Number(p.ovr) >= minCallUpOvr);
    const eligibleMids = mids.filter(p => Number(p.ovr) >= minCallUpOvr);
    const eligibleAtts = atts.filter(p => Number(p.ovr) >= minCallUpOvr);

    const calledGKs = (eligibleGKs.length >= 3 ? eligibleGKs : gks).slice(0, 3);
    const calledDefs = (eligibleDefs.length >= 8 ? eligibleDefs : defs).slice(0, 8);
    const calledMids = (eligibleMids.length >= 6 ? eligibleMids : mids).slice(0, 6);
    const calledAtts = (eligibleAtts.length >= 6 ? eligibleAtts : atts).slice(0, 6);

    const fullSquad23 = [...calledGKs, ...calledDefs, ...calledMids, ...calledAtts];

    // Identifica se o usuário está entre os 23 e cumpre o piso de OVR
    const userAthlete = fullSquad23.find(p => p.isUser);
    const userMeetsOvr = userAthlete ? Number(userAthlete.ovr) >= minCallUpOvr : false;
    const isUserCalledUp = Boolean(userAthlete && userMeetsOvr);

    // Status do usuário no país
    let userSectorRanking = 999;
    let userStatus = 'Distante da Convocação';
    let userStatusColor = '#ef4444';

    if(gameState && (gameState.gameMode === 'player' || gameState.playerCareerState)){
      const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled);
      if(athlete){
        const userOvr = Number(athlete.ovr || athlete.overall || 45);
        const userSector = getPlayerSector(athlete.pos);
        const sectorPool = userSector === 'GK' ? gks : (userSector === 'DEF' ? defs : (userSector === 'MID' ? mids : atts));
        const userIdx = sectorPool.findIndex(p => p.isUser || p.id === athlete.id || p.name === athlete.name);
        userSectorRanking = userIdx >= 0 ? (userIdx + 1) : (sectorPool.length + 1);

        const sectorLimit = userSector === 'GK' ? 3 : (userSector === 'DEF' ? 8 : (userSector === 'MID' ? 6 : 6));
        const starterLimit = userSector === 'GK' ? 1 : (userSector === 'DEF' ? 4 : (userSector === 'MID' ? 3 : 3));

        if(userOvr < minCallUpOvr){
          userStatus = `🔴 Fora da Convocação (Mínimo ${minCallUpOvr} OVR p/ Seleção)`;
          userStatusColor = '#f87171';
        } else if(userSectorRanking <= starterLimit){
          userStatus = '⭐ Titular Absoluto da Seleção';
          userStatusColor = '#10b981';
        } else if(userSectorRanking <= sectorLimit){
          userStatus = '🟢 Convocado (Reserva Imediato)';
          userStatusColor = '#38bdf8';
        } else if(userSectorRanking <= sectorLimit + 8){
          userStatus = '🟡 No Radar (Pré-lista de Espera)';
          userStatusColor = '#facc15';
        } else {
          userStatus = '🔴 Fora da Convocação (Ganhe mais rodagem no clube)';
          userStatusColor = '#f87171';
        }
      }
    }

    return {
      country: meta.name,
      meta,
      fullSquad23,
      bySector: {
        GK: calledGKs,
        DEF: calledDefs,
        MID: calledMids,
        ATT: calledAtts
      },
      rankings: {
        GK: gks,
        DEF: defs,
        MID: mids,
        ATT: atts
      },
      isUserCalledUp,
      userAthlete,
      userSectorRanking,
      userStatus,
      userStatusColor,
      dateGenerated: gameState?.date || '2026-03-24'
    };
  }

  // =========================================================================
  // 3. GERENCIADOR DE DATA FIFA & EVENTO NO CALENDÁRIO
  // =========================================================================

  /**
   * Verifica se a data atual coincide com o início de uma Data FIFA
   */
  function checkFifaDateAdvance(gameState, currentDateIso, { announce = true } = {}){
    if(!gameState || (gameState.gameMode !== 'player' && !gameState.playerCareerState)) return null;
    const pCareer = gameState.playerCareerState || {};
    const userCountry = normalizeNationality(pCareer.nationality || 'Brasil');

    // Se já estiver na Data FIFA ativa, não redispara
    if(pCareer.isFifaWindowActive && pCareer.activeFifaWindowId){
      return null;
    }

    const dateStr = String(currentDateIso || gameState.date || gameState.currentDate || '2026-03-24');
    const mmDd = dateStr.length >= 10 ? dateStr.slice(5, 10) : '03-24';
    const windowDef = FIFA_WINDOWS_SCHEDULE.find(w => w.startMmDd === mmDd);
    if(!windowDef) return null;

    // Registra que a janela foi ativada
    pCareer.isFifaWindowActive = true;
    pCareer.activeFifaWindowId = windowDef.id;
    pCareer.activeFifaWindowDef = windowDef;

    // Gera convocação da seleção do usuário e do adversário histórico
    const userCallUp = generateNationalTeamCallUp(userCountry, gameState);
    pCareer.lastCallUpData = userCallUp;
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];

    // Escolhe adversário do rival pool
    const rivals = userCallUp.meta.rivals || ['Argentina', 'Uruguai'];
    const oppCountry = rivals[Math.floor(Math.random() * rivals.length)];
    const oppCallUp = generateNationalTeamCallUp(oppCountry, gameState);

    const userSector = getPlayerSector(pCareer.position);
    const userStarterLimit = userSector === 'GK' ? 1 : userSector === 'DEF' ? 4 : 3;
    pCareer.fifaFixture = {
      windowId: windowDef.id,
      windowName: windowDef.name,
      date: `${gameState.season || 2026}-${windowDef.matchMmDd}`,
      homeCountry: userCountry,
      awayCountry: oppCountry,
      userIsCalledUp: userCallUp.isUserCalledUp,
      userIsStarter: userCallUp.userSectorRanking <= userStarterLimit,
      stadium: userCallUp.meta.stadium,
      userCallUp,
      oppCallUp,
      played: false
    };

    // Notícias oficiais da convocação
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    if(userCallUp.isUserCalledUp){
      pCareer.onInternationalDuty = true;
      pCareer.marketValue = Math.round((pCareer.marketValue || 1000000) * 1.25); // +25% valorização imediata
      gameState.news.unshift(`${userCallUp.meta.flag} CONVOCAÇÃO OFICIAL: O técnico ${userCallUp.meta.coach} divulgou a lista dos 23 da ${userCountry} e convocou o jovem craque ${pCareer.athleteName}! O atleta se apresenta na concentração.`);
    } else {
      pCareer.onInternationalDuty = false;
      gameState.news.unshift(`📋 CONVOCAÇÃO DA ${userCountry.toUpperCase()}: ${userCallUp.meta.coach} chamou os 23 atletas para a ${windowDef.name}. ${pCareer.athleteName} segue no radar para os próximos compromissos.`);
    }

    // Dispara o modal visual de convocação oficial
    if(announce && typeof window.AFM_PlayerMode?.openCallUpAnnouncementModal === 'function'){
      window.AFM_PlayerMode.openCallUpAnnouncementModal(pCareer.fifaFixture, gameState);
    }

    return {
      pauseAdvance: true,
      windowDef,
      fixture: pCareer.fifaFixture
    };
  }

  function processCalendarDay(gameState, date){
    if(!gameState || (gameState.gameMode !== 'player' && !gameState.playerCareerState)) return null;
    const pCareer = gameState.playerCareerState || {};
    checkFifaDateAdvance(gameState, date, { announce: false });
    const fix = pCareer.fifaFixture;
    if(!fix || fix.played || String(date) < String(fix.date) || (String(date) === String(fix.date) && fix.userIsCalledUp)) return null;

    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    fix.played = true;
    fix.result = [homeGoals, awayGoals];
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];
    pCareer.nationalTeamHistory.unshift({
      date: fix.date,
      competition: fix.windowName,
      home: fix.homeCountry,
      away: fix.awayCountry,
      homeGoals,
      awayGoals,
      userCalledUp: Boolean(fix.userIsCalledUp),
      userPlayed: false
    });
    pCareer.nationalTeamHistory = pCareer.nationalTeamHistory.slice(0, 30);
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(`🇺🇳 ${fix.windowName}: ${fix.homeCountry} ${homeGoals} x ${awayGoals} ${fix.awayCountry}. ${fix.userIsCalledUp ? `${pCareer.athleteName} não entrou em campo.` : `${pCareer.athleteName} acompanhou a partida, pois não foi convocado.`}`);
    gameState.news = gameState.news.slice(0, 50);
    pCareer.isFifaWindowActive = false;
    pCareer.onInternationalDuty = false;
    return fix;
  }

  /**
   * Inicia a Partida Internacional da Data FIFA
   */
  function startNationalTeamMatch(gameState){
    if(!gameState || !gameState.playerCareerState?.fifaFixture) return;
    const fix = gameState.playerCareerState.fifaFixture;
    if(fix.played) return;

    const userCountry = fix.homeCountry;
    const oppCountry = fix.awayCountry;

    // Configura sessão de partida internacional temporária
    window.internationalMatchSession = {
      isInternational: true,
      home: userCountry,
      away: oppCountry,
      homeBadge: fix.userCallUp.meta.flag,
      awayBadge: fix.oppCallUp.meta.flag,
      date: fix.date,
      competitionName: fix.windowName,
      status: 'pending',
      userIsCalledUp: fix.userIsCalledUp,
      userIsStarter: fix.userIsStarter,
      fixture: fix
    };

    // Dispara a partida no motor de jogo oficial
    if(typeof window.startMatch === 'function'){
      window.startMatch();
    }
  }

  function simulateNationalTeamMatch(gameState){
    const fix = gameState?.playerCareerState?.fifaFixture;
    if(!fix || fix.played || String(gameState.date || '') < String(fix.date || '')) return;
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    const userParticipated = Boolean(fix.userIsCalledUp && (fix.userIsStarter || Math.random() < 0.35));
    const goals = userParticipated && homeGoals > 0 && Math.random() < 0.22 ? 1 : 0;
    const assists = userParticipated && homeGoals > goals && Math.random() < 0.2 ? 1 : 0;
    finishNationalTeamMatch({
      hg: homeGoals, ag: awayGoals, userParticipated,
      controlledAthleteGoals: goals, controlledAthleteAssists: assists,
      controlledAthleteRating: userParticipated ? Number((6 + Math.random() * 4).toFixed(1)) : 0
    }, gameState);
  }

  /**
   * Finaliza a Partida da Data FIFA e aplica recompensas / estatísticas
   */
  function finishNationalTeamMatch(userRes, gameState){
    if(userRes && typeof userRes === 'object' && userRes.playerCareerState){
      const tmp = userRes;
      userRes = gameState;
      gameState = tmp;
    }
    if(!gameState || !gameState.playerCareerState) return;
    const pCareer = gameState.playerCareerState;
    const fix = pCareer.fifaFixture || { userIsCalledUp: true, homeCountry: pCareer.nationality || 'Brasil', awayCountry: 'Adversário', date: gameState.date };
    if(fix.played) return;
    fix.played = true;
    const homeGoals = Number(userRes?.hg) || 0;
    const awayGoals = Number(userRes?.ag) || 0;
    pCareer.nationalTeamHistory = Array.isArray(pCareer.nationalTeamHistory) ? pCareer.nationalTeamHistory : [];
    const userParticipated = Boolean(fix.userIsCalledUp && userRes?.userParticipated !== false);
    pCareer.nationalTeamHistory.unshift({ date: fix.date, competition: fix.windowName, home: fix.homeCountry, away: fix.awayCountry, homeGoals, awayGoals, userCalledUp: Boolean(fix.userIsCalledUp), userPlayed: userParticipated });
    pCareer.nationalTeamHistory = pCareer.nationalTeamHistory.slice(0, 30);
    pCareer.internationalStats = pCareer.internationalStats || { caps: 0, goals: 0, assists: 0, titles: [], history: [] };
    const intStats = pCareer.internationalStats;

    if(userParticipated){
      intStats.caps = (intStats.caps || 0) + 1;
      const goalsInMatch = Number(userRes?.controlledAthleteGoals ?? userRes?.userGoals ?? userRes?.athleteStats?.goals ?? 0);
      const assistsInMatch = Number(userRes?.controlledAthleteAssists ?? userRes?.userAssists ?? userRes?.athleteStats?.assists ?? 0);
      intStats.goals = (intStats.goals || 0) + goalsInMatch;
      intStats.assists = (intStats.assists || 0) + assistsInMatch;

      // Bônus dobrado de XP por atuação pela Seleção (+250 XP base)
      const xpGain = 250 + (goalsInMatch * 100) + (assistsInMatch * 50);
      pCareer.xp = (pCareer.xp || 0) + xpGain;
      pCareer.personality = pCareer.personality || { maverick: 40, heartbeat: 40, virtuoso: 40 };
      pCareer.personality.virtuoso = (pCareer.personality.virtuoso || 40) + 20;
      if(goalsInMatch > 0) pCareer.personality.maverick = (pCareer.personality.maverick || 40) + 25;

      // Valorização de mercado internacional (+25% de valorização)
      pCareer.marketValue = Math.round((pCareer.marketValue || 50000) * 1.25);

      intStats.history.unshift({
        date: fix.date,
        match: `${fix.homeCountry} vs ${fix.awayCountry}`,
        result: `${userRes.hg} - ${userRes.ag}`,
        goals: goalsInMatch,
        assists: assistsInMatch,
        rating: userRes.controlledAthleteRating || 7.5
      });

    }
    gameState.news = Array.isArray(gameState.news) ? gameState.news : [];
    gameState.news.unshift(userParticipated
      ? `🌟 DATA FIFA: ${pCareer.athleteName} atuou pela ${fix.homeCountry} contra ${fix.awayCountry} (${homeGoals} x ${awayGoals}).`
      : `🇺🇳 DATA FIFA: ${fix.homeCountry} ${homeGoals} x ${awayGoals} ${fix.awayCountry}. ${fix.userIsCalledUp ? `${pCareer.athleteName} não entrou em campo.` : `${pCareer.athleteName} acompanhou a partida, pois não foi convocado.`}`);
    gameState.news = gameState.news.slice(0, 50);

    // Limpa a flag de Data FIFA e retorna para o clube
    pCareer.onInternationalDuty = false;
    pCareer.isFifaWindowActive = false;
    window.internationalMatchSession = null;

    if(typeof window.save === 'function') window.save();
    if(typeof window.render === 'function') window.render();
  }

  /**
   * Verifica se o nome passado corresponde a uma Seleção Nacional
   */
  function isNationalTeam(name){
    if(!name) return false;
    const clean = normalizeNationality(name);
    return Boolean(NATIONAL_TEAMS_CATALOG[clean]);
  }

  /**
   * Constrói o time da Seleção Nacional para a simulação ao vivo (11 titulares em 4-3-3)
   */
  function buildInternationalMatchTeam(countryName, isHomeSide, gameState, projFn){
    const normCountry = normalizeNationality(countryName);
    const meta = getNationalTeamMeta(normCountry);
    const callUp = generateNationalTeamCallUp(normCountry, gameState);
    const isUserTeam = Boolean(gameState?.playerCareerState && normalizeNationality(gameState.playerCareerState.nationality || 'Brasil') === normCountry);
    
    // 11 titulares na formação clássica 4-3-3: 1 GOL, 4 DEF, 3 MEI, 3 ATA
    const starters = [
      callUp.bySector.GK[0] || { name: 'Goleiro', pos: 'GK', ovr: 78 },
      callUp.bySector.DEF[0] || { name: 'Lat. Direito', pos: 'RB', ovr: 77 },
      callUp.bySector.DEF[1] || { name: 'Zagueiro 1', pos: 'CB', ovr: 79 },
      callUp.bySector.DEF[2] || { name: 'Zagueiro 2', pos: 'CB', ovr: 79 },
      callUp.bySector.DEF[3] || { name: 'Lat. Esquerdo', pos: 'LB', ovr: 77 },
      callUp.bySector.MID[0] || { name: 'Volante', pos: 'DM', ovr: 80 },
      callUp.bySector.MID[1] || { name: 'Meia Central', pos: 'CM', ovr: 81 },
      callUp.bySector.MID[2] || { name: 'Armador', pos: 'AM', ovr: 82 },
      callUp.bySector.ATT[0] || { name: 'Ponta Direita', pos: 'RW', ovr: 83 },
      callUp.bySector.ATT[1] || { name: 'Centroavante', pos: 'ST', ovr: 84 },
      callUp.bySector.ATT[2] || { name: 'Ponta Esquerda', pos: 'LW', ovr: 83 }
    ];

    // Se o atleta do usuário foi convocado e é titular no setor, escala entre os 11
    if(isUserTeam && callUp.isUserCalledUp){
      const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId || p.isControlled);
      if(athlete){
        const userSec = getPlayerSector(athlete.pos);
        const isStarter = callUp.userSectorRanking <= (userSec === 'GK' ? 1 : (userSec === 'DEF' ? 4 : 3));
        if(isStarter){
          let replaceIdx = 10;
          if(userSec === 'GK') replaceIdx = 0;
          else if(userSec === 'DEF') replaceIdx = 2;
          else if(userSec === 'MID') replaceIdx = 7;
          starters[replaceIdx] = {
            ...athlete,
            isUser: true,
            isControlledAthlete: true,
            sector: userSec
          };
        }
      }
    }

    const formKey = '4-3-3';
    const formDef = (typeof window.FORMATIONS !== 'undefined' && window.FORMATIONS[formKey]) || [
      { r: 'GK', x: 50, y: 89 },
      { r: 'RB', x: 88, y: 72 },
      { r: 'CB', x: 62, y: 75 },
      { r: 'CB', x: 38, y: 75 },
      { r: 'LB', x: 12, y: 72 },
      { r: 'DM', x: 50, y: 55 },
      { r: 'CM', x: 72, y: 46 },
      { r: 'AM', x: 28, y: 46 },
      { r: 'RW', x: 85, y: 22 },
      { r: 'ST', x: 50, y: 16 },
      { r: 'LW', x: 15, y: 22 }
    ];

    const players = [];
    for(let i = 0; i < 11; i++){
      const isGoalkeeper = (i === 0);
      const p = starters[i] || { name: `Atleta ${i+1}`, pos: formDef[i]?.r || 'CM', ovr: 75 };
      const slot = formDef[i] || { r: isGoalkeeper ? 'GK' : (p.pos || 'CM'), x: 50, y: isGoalkeeper ? 89 : 50 };
      const ovr = Number(p.ovr || p.overall) || 75;

      let baseXPct, baseYPct;
      if(isGoalkeeper){
        baseXPct = isHomeSide ? 3.5 : 96.5;
        baseYPct = 50;
      } else {
        const depth = (100 - slot.y) * 0.44;
        baseXPct = isHomeSide ? Math.max(10, Math.min(52, 3.5 + depth)) : Math.max(48, Math.min(90, 100 - (3.5 + depth)));
        const centeredY = slot.x - 50;
        baseYPct = Math.max(8, Math.min(92, 50 + centeredY));
      }

      const isControlled = Boolean(isUserTeam && (p.isUser || p.isControlledAthlete || (gameState && p.id === gameState.controlledPlayerId)));

      let shirtNum = parseInt(p.shirtNumber || p.jerseyNumber || p.number, 10);
      if(isNaN(shirtNum) || shirtNum < 1 || shirtNum > 99){
        shirtNum = isGoalkeeper ? 1 : (i === 10 ? 11 : i + 1);
      }

      players.push({
        type: 'PLAYER',
        id: `nat-${isHomeSide ? 'h' : 'a'}-${i}`,
        key: `nat:${normCountry}:${i}:${p.name}`,
        name: p.name.split(' ').pop() || p.name,
        fullName: p.name,
        isControlledAthlete: isControlled,
        pos: isGoalkeeper ? 'GK' : (slot.r || p.pos || 'CM'),
        shirtNumber: shirtNum,
        jerseyNumber: shirtNum,
        roleId: isGoalkeeper ? 'gk_sweeper' : 'std',
        roleName: isGoalkeeper ? 'Goleiro Líbero' : 'Titular da Seleção',
        roleFocus: 'Balanced',
        overall: ovr,
        stamina: 100,
        isGK: isGoalkeeper,
        canScore: !isGoalkeeper,
        canShoot: !isGoalkeeper,
        canAssist: true,
        isCaptain: (i === 1 || i === 2),
        team: isHomeSide ? 'home' : 'away',
        clubId: normCountry,
        teamId: isHomeSide ? 'home' : 'away',
        isUser: isUserTeam,
        photo: p.photo || null,
        x: baseXPct,
        y: baseYPct,
        baseX: baseXPct,
        baseY: baseYPct,
        targetX: baseXPct,
        targetY: baseYPct,
        vx: 0, vy: 0,
        animFrame: 0,
        hasBall: false
      });
    }

    return players;
  }

  // =========================================================================
  // 4. EXPORTAÇÃO GLOBAL
  // =========================================================================
  window.AFM_NationalTeams = {
    CATALOG: NATIONAL_TEAMS_CATALOG,
    normalizeNationality,
    getNationalTeamMeta,
    getCountryFlag: (countryName) => (getNationalTeamMeta(countryName)?.flag || '🇧🇷'),
    getPlayerSector,
    calculateCallUpScore,
    getPlayerPoolByNationality,
    generateNationalTeamCallUp,
    checkFifaDateAdvance,
    processCalendarDay,
    startNationalTeamMatch,
    simulateNationalTeamMatch,
    finishNationalTeamMatch,
    isNationalTeam,
    buildInternationalMatchTeam,
    getCountryBadge: (countryName, size = 32) => {
      const meta = NATIONAL_TEAMS_CATALOG[normalizeNationality(countryName)];
      if(!meta) return null;
      return `<span class="crest nat-flag-crest" style="font-size:${Math.round(size * 0.85)}px;line-height:1;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle" title="${esc(meta.name)}">${meta.flag}</span>`;
    }
  };

})(window);

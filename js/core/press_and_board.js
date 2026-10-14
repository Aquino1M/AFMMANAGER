// ==============================================================================
// AFM MANAGER 2027 — COLETIVAS DE IMPRENSA & DIRETORIA
// Arquivo: js/core/press_and_board.js
// ==============================================================================

(function (window) {
  'use strict';

  const PressAndBoardCore = {
    generatePressQuestions(state) {
      return [
        {
          id: 'press_1',
          question: 'Professor, qual a expectativa da comissão técnica para a sequência de jogos da temporada?',
          options: [
            { text: 'Estamos focados e prontos para competir no mais alto nível.', moraleDelta: +3 },
            { text: 'O calendário é exigente, mas confio plenamente no nosso elenco.', moraleDelta: +2 },
            { text: 'A cobrança é normal em clube grande, vamos buscar as vitórias.', moraleDelta: +1 }
          ]
        }
      ];
    }
  };

  window.AFM_PressAndBoard = PressAndBoardCore;
})(typeof window !== 'undefined' ? window : global);

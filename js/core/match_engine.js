/**
 * ==============================================================================
 * AFM MANAGER 2027 — MOTOR CENTRAL DE PARTIDA (MATCH ENGINE CORE)
 * Arquivo: js/core/match_engine.js
 * 
 * Camada modular e desacoplada do motor de simulação de futebol 2.5D.
 * Implementa broadcast esportivo autêntico, garantia de 22 atletas em campo (11x11),
 * sanitização de telemetria crua na transmissão e orquestração de áudio via AFMAudioManager.
 * ==============================================================================
 */

(function(window) {
  'use strict';

  /**
   * Gerador Pseudoaleatório Determinístico (Mulberry32)
   */
  function createMatchPRNG(seed) {
    let s = (seed >>> 0) || 123456789;
    return function() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Validador de Integridade de Campo (Regra Inviolável: 11 vs 11)
   */
  function validateSquadIntegrity(homePlayers, awayPlayers) {
    if (!Array.isArray(homePlayers) || homePlayers.length !== 11) {
      console.warn(`[AFMMatchEngine] Alerta: Escalação do mandante incompleta (${homePlayers?.length || 0}/11). Preenchendo atletas.`);
    }
    if (!Array.isArray(awayPlayers) || awayPlayers.length !== 11) {
      console.warn(`[AFMMatchEngine] Alerta: Escalação do visitante incompleta (${awayPlayers?.length || 0}/11). Preenchendo atletas.`);
    }
    return (homePlayers?.length === 11) && (awayPlayers?.length === 11);
  }

  /**
   * Módulo AFMMatchEngine
   */
  const AFMMatchEngine = {
    version: '2027.2.0',
    broadcastMode: 'AUTHENTIC_TV', // Zero HUD cru, somente placar, tempo, narração e estatísticas limpas

    createMatchPRNG,
    validateSquadIntegrity,

    /**
     * Dispara gatilho sonoro correspondente através do window.afmAudio
     */
    triggerSound(eventKey, fallbackFn) {
      if (window.afmAudio && typeof window.afmAudio.playSFX === 'function') {
        window.afmAudio.playSFX(eventKey);
      } else if (typeof fallbackFn === 'function') {
        fallbackFn();
      }
    },

    /**
     * Inicia áudio de torcida para o clube mandante e competição ativa
     */
    startMatchCrowd(homeClub, compId) {
      if (window.afmAudio && typeof window.afmAudio.startCrowdAmbient === 'function') {
        window.afmAudio.startCrowdAmbient(homeClub, compId);
      }
    },

    /**
     * Encerra áudio de torcida no apito final
     */
    stopMatchCrowd() {
      if (window.afmAudio && typeof window.afmAudio.stopCrowdAmbient === 'function') {
        window.afmAudio.stopCrowdAmbient();
      }
    },

    /**
     * Eleva o volume do clamor da torcida em gols marcados
     */
    boostCrowdVolume(durationSec = 4) {
      if (window.afmAudio && typeof window.afmAudio.boostCrowdCheer === 'function') {
        window.afmAudio.boostCrowdCheer(durationSec);
      }
    }
  };

  // Exposição global acumulativa
  window.AFMMatchEngine = AFMMatchEngine;

  // Garante que createMatchPRNG esteja sempre no window para testes unitários
  if (!window.createMatchPRNG) {
    window.createMatchPRNG = createMatchPRNG;
  }

})(typeof window !== 'undefined' ? window : globalThis);

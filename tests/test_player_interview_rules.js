const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
let activeModal = null;
global.document = {
  getElementById: id => id === 'afmPostMatchHubModal' ? activeModal : null,
  createElement: () => ({ style: {}, innerHTML: '', querySelector: () => ({ onclick: null }) }),
  body: { appendChild: element => { activeModal = element; } }
};
global.norm = value => String(value || '').toLowerCase();
vm.runInThisContext(fs.readFileSync('js/player/social_media_manager.js', 'utf8'), { filename: 'social_media_manager.js' });
vm.runInThisContext(fs.readFileSync('js/systems/day_advance_news_modal.js', 'utf8'), { filename: 'day_advance_news_modal.js' });

const gameState = {
  gameMode: 'player',
  club: 'Real Brasília',
  date: '2026-01-02',
  news: [],
  playerCareerState: { athleteName: 'João Craque', socialMedia: { feedPosts: [], followers: 1200 } }
};
const social = global.AFM_SocialMedia;

assert.equal(social.publishPlayerInterview(gameState, 'Boa partida.', { isMvp: false }), false, 'non-MVP must not give an interview');
assert.equal(gameState.news.length, 0, 'ineligible interview must not publish news');
assert.equal(social.publishPlayerInterview({ ...gameState, gameMode: 'manager' }, 'Boa partida.', { isMvp: true }), false, 'manager careers must not use the player interview');
assert.equal(social.publishPlayerInterview(gameState, 'Dedico ao grupo.', { isMvp: true, opponent: 'Brasiliense' }), true);
assert.match(gameState.news[0], /ENTREVISTA PÓS-JOGO.*Craque da Partida/);
assert.equal(gameState.playerCareerState.socialMedia.feedPosts[0].category, 'interview');
assert.match(gameState.playerCareerState.socialMedia.feedPosts[0].text, /Dedico ao grupo/);

gameState.playerCareerState.socialMedia.postedToday = true;
social.onDayAdvance(gameState, '2026-01-02');
assert.equal(gameState.playerCareerState.socialMedia.postedToday, false, 'a new calendar day must unlock posting');
assert.equal(gameState.playerCareerState.lastDailyNewsDate, '2026-01-02');
assert.equal(gameState.news.length, 2, 'daily athlete news should be generated once per date');
social.onDayAdvance(gameState, '2026-01-02');
assert.equal(gameState.news.length, 2, 'reprocessing the same date must not duplicate the news item');
const dailyPagePosts = gameState.playerCareerState.socialMedia.feedPosts.filter(post => post.category === 'gossip' || post.category === 'fans');
assert.equal(dailyPagePosts.length, 3, 'three world/page posts should be generated per day');
assert.equal(new Set(dailyPagePosts.map(post => post.id)).size, 3, 'daily posts need unique IDs');
const beforeBadMatchFollowers = gameState.playerCareerState.socialMedia.followers;
social.processPostMatchSocialImpact(gameState, { goalsFor: 0, goalsAgainst: 1 }, { played: true, opponent: 'Brasiliense', resultText: '0 x 1', rating: 5.4, goals: 0, assists: 0, isMvp: false });
assert(gameState.playerCareerState.socialMedia.feedPosts.some(post => post.category === 'press' && /0 x 1/.test(post.text) && /nota 5\.4/.test(post.text)), 'every appearance should publish the score and player rating');
assert(gameState.playerCareerState.socialMedia.feedPosts.some(post => post.category === 'fans' && post.handle.startsWith('@organizada_')), 'the organized fans should react to a poor performance');
assert(gameState.playerCareerState.socialMedia.followers < beforeBadMatchFollowers, 'a very poor performance may cost followers');
assert.equal(social.publishTransferProposal(gameState, { id: 'offer_test', type: 'transfer', newClub: 'Palmeiras' }), true);
assert(gameState.playerCareerState.socialMedia.feedPosts.some(post => post.id === 'post_offer_offer_test' && /Palmeiras/.test(post.text)), 'transfer proposals must appear in the feed');
const managerState = { gameMode: 'manager', playerCareerState: { socialMedia: { postedToday: true } } };
social.onDayAdvance(managerState, '2026-01-02');
assert.equal(managerState.playerCareerState.socialMedia.postedToday, true, 'player social processing must not affect manager mode');

global.state = gameState;
global.AFM_DayAdvanceNews.openPostMatchHubModal({ h: 'Real Brasília', a: 'Brasiliense', hg: 0, ag: 0 });
assert(!activeModal.innerHTML.includes('id="btnPostMatchInterview"'), 'player post-match hub must not offer the coach interview');
assert(activeModal.innerHTML.includes('Fim de jogo. O que você deseja fazer agora?'));
global.state = { gameMode: 'manager', club: 'Real Brasília', trust: {} };
global.AFM_DayAdvanceNews.openPostMatchHubModal({ h: 'Real Brasília', a: 'Brasiliense', hg: 0, ag: 0 });
assert(activeModal.innerHTML.includes('id="btnPostMatchInterview"'), 'manager post-match interview must remain available');

console.log('Player interview rules passed: MVP-only and news/FootGram publication.');

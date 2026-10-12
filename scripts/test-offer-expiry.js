const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const start = source.indexOf('function expireRoundLimitedOffers(');
const end = source.indexOf('\nfunction acceptEventConcert', start);
assert.ok(start >= 0 && end > start, 'expiry function boundaries exist');

const body = source.slice(start, end);
let saved = 0;
let bannerRenders = 0;
const context = {
  state: null,
  save(){ saved++; },
  renderHomeBidsBanner(){ bannerRenders++; },
  render(){ bannerRenders++; },
  document: { getElementById(){ return null; } },
  window: {},
  console
};
vm.createContext(context);
vm.runInContext(`${body}; this.expireRoundLimitedOffers = expireRoundLimitedOffers;`, context);

const state = context.state = {
  round: 10,
  news: ['CONVITE PARA EVENTO: Festival X', 'outra notícia'],
  incomingBids: [
    { id: 'old-offer', receivedRound: 10, expiresAfterRound: 12 },
    { id: 'legacy-offer' },
    { id: 'already-expired', receivedRound: 5, expiresAfterRound: 7 }
  ],
  stadiumClubRental: { club: 'Clube X', fee: 50000, receivedRound: 10, expiresAfterRound: 12 },
  stadiumEventProposal: { name: 'Festival X', fee: 100000, receivedRound: 10, expiresAfterRound: 12 }
};

let result = context.expireRoundLimitedOffers(10);
assert.equal(result.expiredBids, 1, 'only an offer already past its expiry is removed');
assert.ok(state.incomingBids.some(bid => bid.id === 'old-offer'));
assert.ok(state.incomingBids.some(bid => bid.id === 'legacy-offer'));
assert.equal(state.incomingBids.find(bid => bid.id === 'legacy-offer').expiresAfterRound, 13, 'legacy migration is bounded to one migration window');
assert.ok(state.stadiumClubRental, 'rental is actionable in receive round');
assert.ok(state.stadiumEventProposal, 'show is actionable in receive round');

// The two following rounds are full response opportunities; expire only after round N+2 ends.
context.expireRoundLimitedOffers(11);
context.expireRoundLimitedOffers(12);
assert.ok(state.incomingBids.some(bid => bid.id === 'old-offer'), 'bid remains available throughout rounds N+1 and N+2');
assert.ok(state.stadiumClubRental, 'rental remains available throughout rounds N+1 and N+2');
assert.ok(state.stadiumEventProposal, 'show remains available throughout rounds N+1 and N+2');
result = context.expireRoundLimitedOffers(13);
assert.equal(result.expiredBids, 1, 'only the dated bid expires after two full response rounds; migrated offer gets its single bounded window');
assert.equal(result.expiredRental, true);
assert.equal(result.expiredShow, true);
assert.equal(state.stadiumClubRental, null);
assert.equal(state.stadiumEventProposal, null);
assert.ok(!state.news.some(item => String(item).includes('CONVITE PARA EVENTO:') && String(item).includes('Festival X')));
assert.ok(state.news.some(item => String(item).includes('proposta(s) milionária(s) expiraram')));
assert.ok(state.news.some(item => String(item).includes('aluguel do estádio expirou')));
assert.ok(state.news.some(item => String(item).includes('convite para show')));
assert.ok(saved > 0 && bannerRenders > 0, 'expiration persists state and refreshes home bid banner');

const migratedExpiry = state.incomingBids.find(bid => bid.id === 'legacy-offer').expiresAfterRound;
const savedState = JSON.stringify(state);
const loadedState = JSON.parse(savedState);
context.state = loadedState;
context.expireRoundLimitedOffers(14);
assert.equal(loadedState.incomingBids.find(bid => bid.id === 'legacy-offer'), undefined, 'legacy offer expires after its one migration window rather than being renewed after load');
assert.equal(migratedExpiry, 13, 'legacy expiry round was recorded');

console.log('PASS: bids, show and rental survive N+1/N+2 and expire after two complete opportunity rounds.');
console.log('PASS: legacy metadata is migrated once, persisted, and is stable after save/load.');
console.log('PASS: unrelated offers remain; expiration records news and refreshes the banner.');

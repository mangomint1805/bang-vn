// Dữ liệu bài Bang! bản gốc – tiếng Việt
// Suit: S=♠ H=♥ D=♦ C=♣ ; rank: 2..10, J=11, Q=12, K=13, A=14

export const SUIT_SYMBOL = { S: '♠', H: '♥', D: '♦', C: '♣' };
export const SUIT_NAME = { S: 'Bích', H: 'Cơ', D: 'Rô', C: 'Chuồn' };

export function rankLabel(r) {
  return r === 11 ? 'J' : r === 12 ? 'Q' : r === 13 ? 'K' : r === 14 ? 'A' : String(r);
}

// Thông tin từng loại lá
export const CARD_INFO = {
  bang:       { name: 'Bắn!',            en: 'BANG!',          kind: 'brown', icon: '💥',
    desc: 'Bắn 1 người trong tầm súng. Họ phải đánh lá Hụt! nếu không sẽ mất 1 máu. Mỗi lượt chỉ bắn được 1 lần (trừ khi có Volcanic).' },
  missed:     { name: 'Hụt!',            en: 'Missed!',        kind: 'brown', icon: '💨',
    desc: 'Né một phát Bắn!. Chỉ dùng khi bị bắn.' },
  beer:       { name: 'Bia',             en: 'Beer',           kind: 'brown', icon: '🍺',
    desc: 'Hồi 1 máu (không vượt quá máu tối đa). Có thể dùng để cứu mạng khi sắp chết. Vô hiệu khi chỉ còn 2 người.' },
  panic:      { name: 'Hoảng loạn!',     en: 'Panic!',         kind: 'brown', icon: '😱',
    desc: 'Lấy 1 lá từ người cách bạn 1 khoảng cách (trên tay hoặc trên bàn).' },
  catbalou:   { name: 'Cat Balou',       en: 'Cat Balou',      kind: 'brown', icon: '🐈',
    desc: 'Bắt người bất kỳ bỏ 1 lá (trên tay hoặc trên bàn).' },
  stagecoach: { name: 'Xe ngựa',         en: 'Stagecoach',     kind: 'brown', icon: '🛺',
    desc: 'Rút 2 lá.' },
  wellsfargo: { name: 'Wells Fargo',     en: 'Wells Fargo',    kind: 'brown', icon: '💰',
    desc: 'Rút 3 lá.' },
  store:      { name: 'Tạp hóa',         en: 'General Store',  kind: 'brown', icon: '🏪',
    desc: 'Lật số lá bằng số người còn sống. Lần lượt từ bạn, mỗi người chọn 1 lá.' },
  saloon:     { name: 'Quán rượu',       en: 'Saloon',         kind: 'brown', icon: '🥃',
    desc: 'Tất cả người chơi còn sống hồi 1 máu.' },
  indians:    { name: 'Thổ dân!',        en: 'Indians!',       kind: 'brown', icon: '🏹',
    desc: 'Mọi người khác phải bỏ 1 lá Bắn! hoặc mất 1 máu.' },
  duel:       { name: 'Đấu súng',        en: 'Duel',           kind: 'brown', icon: '⚔️',
    desc: 'Thách đấu 1 người. Hai bên lần lượt bỏ lá Bắn! (đối thủ trước). Ai không bỏ được mất 1 máu.' },
  gatling:    { name: 'Súng Gatling',    en: 'Gatling',        kind: 'brown', icon: '🔫',
    desc: 'Bắn tất cả người khác cùng lúc. Mỗi người phải đánh Hụt! hoặc mất 1 máu.' },
  dynamite:   { name: 'Thuốc nổ',        en: 'Dynamite',       kind: 'blue',  icon: '🧨',
    desc: 'Đặt trước mặt mình. Đầu mỗi lượt, lật bài: nếu ra ♠ từ 2 đến 9, nổ mất 3 máu. Không thì chuyền sang người kế.' },
  jail:       { name: 'Nhà tù',          en: 'Jail',           kind: 'blue',  icon: '⛓️',
    desc: 'Đặt trước mặt người khác (không phải Cảnh sát trưởng). Đầu lượt họ lật bài: ra ♥ thì thoát, không thì mất lượt.' },
  barrel:     { name: 'Thùng rượu',      en: 'Barrel',         kind: 'blue',  icon: '🛢️',
    desc: 'Khi bị bắn, lật bài: ra ♥ thì coi như đã né.' },
  scope:      { name: 'Ống ngắm',        en: 'Scope',          kind: 'blue',  icon: '🔭',
    desc: 'Bạn nhìn người khác gần hơn 1 khoảng cách.' },
  mustang:    { name: 'Ngựa Mustang',    en: 'Mustang',        kind: 'blue',  icon: '🐎',
    desc: 'Người khác nhìn bạn xa hơn 1 khoảng cách.' },
  volcanic:   { name: 'Volcanic',        en: 'Volcanic',       kind: 'gun',   icon: '🔫', range: 1,
    desc: 'Súng tầm 1. Được bắn không giới hạn số lần mỗi lượt.' },
  schofield:  { name: 'Schofield',       en: 'Schofield',      kind: 'gun',   icon: '🔫', range: 2,
    desc: 'Súng tầm 2.' },
  remington:  { name: 'Remington',       en: 'Remington',      kind: 'gun',   icon: '🔫', range: 3,
    desc: 'Súng tầm 3.' },
  carabine:   { name: 'Rev. Carabine',   en: 'Rev. Carabine',  kind: 'gun',   icon: '🔫', range: 4,
    desc: 'Súng tầm 4.' },
  winchester: { name: 'Winchester',      en: 'Winchester',     kind: 'gun',   icon: '🔫', range: 5,
    desc: 'Súng tầm 5.' },
};

// Bộ bài 80 lá: [type, suit, rank]
const DECK_SPEC = [
  // Bắn! x25
  ['bang','S',14], ...[2,3,4,5,6,7,8,9,10,11,12,13,14].map(r => ['bang','D',r]),
  ...[2,3,4,5,6,7,8,9].map(r => ['bang','C',r]), ['bang','H',12], ['bang','H',13], ['bang','H',14],
  // Hụt! x12
  ...[2,3,4,5,6,7,8].map(r => ['missed','S',r]), ...[10,11,12,13,14].map(r => ['missed','C',r]),
  // Bia x6
  ...[6,7,8,9,10,11].map(r => ['beer','H',r]),
  // Hoảng loạn x4
  ['panic','H',11], ['panic','H',12], ['panic','H',14], ['panic','D',8],
  // Cat Balou x4
  ['catbalou','H',13], ['catbalou','D',9], ['catbalou','D',10], ['catbalou','D',11],
  // Xe ngựa x2
  ['stagecoach','S',9], ['stagecoach','S',9],
  // Wells Fargo x1
  ['wellsfargo','H',3],
  // Tạp hóa x2
  ['store','C',9], ['store','S',12],
  // Quán rượu x1
  ['saloon','H',5],
  // Thổ dân x2
  ['indians','D',13], ['indians','D',14],
  // Đấu súng x3
  ['duel','D',12], ['duel','S',11], ['duel','C',8],
  // Gatling x1
  ['gatling','H',10],
  // Thuốc nổ x1
  ['dynamite','H',2],
  // Nhà tù x3
  ['jail','S',10], ['jail','S',11], ['jail','H',4],
  // Thùng rượu x2
  ['barrel','S',12], ['barrel','S',13],
  // Ống ngắm x1
  ['scope','S',14],
  // Mustang x2
  ['mustang','H',8], ['mustang','H',9],
  // Súng
  ['volcanic','S',10], ['volcanic','C',10],
  ['schofield','C',13], ['schofield','C',12], ['schofield','S',13],
  ['remington','C',13],
  ['carabine','C',14],
  ['winchester','S',8],
];

export function buildDeck() {
  return DECK_SPEC.map(([type, suit, rank], i) => ({ id: 'c' + i, type, suit, rank }));
}

export const ROLES = {
  sheriff:  { name: 'Cảnh sát trưởng', en: 'Sheriff',  icon: '⭐', desc: 'Công khai. Tiêu diệt hết Tội phạm và Kẻ hai mặt. Được +1 máu.' },
  deputy:   { name: 'Phó cảnh sát',    en: 'Deputy',   icon: '🎖️', desc: 'Bảo vệ Cảnh sát trưởng, cùng thắng với Cảnh sát trưởng.' },
  outlaw:   { name: 'Tội phạm',        en: 'Outlaw',   icon: '🤠', desc: 'Giết Cảnh sát trưởng. Ai giết Tội phạm được rút 3 lá.' },
  renegade: { name: 'Kẻ hai mặt',      en: 'Renegade', icon: '🎭', desc: 'Phải là người sống sót cuối cùng.' },
};

export function rolesFor(n) {
  const r = { 4: ['sheriff','renegade','outlaw','outlaw'],
    5: ['sheriff','renegade','outlaw','outlaw','deputy'],
    6: ['sheriff','renegade','outlaw','outlaw','outlaw','deputy'],
    7: ['sheriff','renegade','outlaw','outlaw','outlaw','deputy','deputy'] };
  return r[n] ? [...r[n]] : null;
}

export const CHARACTERS = {
  bartcassidy:    { name: 'Bart Cassidy',     hp: 4, icon: '🩸', desc: 'Mỗi lần mất máu, rút 1 lá.' },
  blackjack:      { name: 'Black Jack',       hp: 4, icon: '🃏', desc: 'Khi rút bài đầu lượt, lật lá thứ 2 lên: nếu là ♥ hoặc ♦, rút thêm 1 lá.' },
  calamityjanet:  { name: 'Calamity Janet',   hp: 4, icon: '🔄', desc: 'Dùng Bắn! như Hụt! và Hụt! như Bắn!.' },
  elgringo:       { name: 'El Gringo',        hp: 3, icon: '🤏', desc: 'Mỗi khi bị người khác làm mất máu, lấy 1 lá ngẫu nhiên từ tay người đó.' },
  jessejones:     { name: 'Jesse Jones',      hp: 4, icon: '🕵️', desc: 'Đầu lượt, có thể rút lá đầu tiên từ tay 1 người chơi thay vì từ bộ bài.' },
  jourdonnais:    { name: 'Jourdonnais',      hp: 4, icon: '🛢️', desc: 'Luôn có sẵn 1 Thùng rượu.' },
  kitcarlson:     { name: 'Kit Carlson',      hp: 4, icon: '👀', desc: 'Đầu lượt, xem 3 lá trên cùng, giữ 2 lá, trả 1 lá về đầu bộ bài.' },
  luckyduke:      { name: 'Lucky Duke',       hp: 4, icon: '🍀', desc: 'Mỗi lần "lật bài", lật 2 lá và chọn lá có lợi.' },
  paulregret:     { name: 'Paul Regret',      hp: 3, icon: '🐎', desc: 'Luôn có sẵn 1 Ngựa Mustang.' },
  pedroramirez:   { name: 'Pedro Ramirez',    hp: 4, icon: '🗑️', desc: 'Đầu lượt, có thể rút lá đầu tiên từ chồng bài bỏ.' },
  rosedoolan:     { name: 'Rose Doolan',      hp: 4, icon: '🔭', desc: 'Luôn có sẵn 1 Ống ngắm.' },
  sidketchum:     { name: 'Sid Ketchum',      hp: 4, icon: '💊', desc: 'Bất cứ lúc nào, bỏ 2 lá trên tay để hồi 1 máu.' },
  slabthekiller:  { name: 'Slab the Killer',  hp: 4, icon: '☠️', desc: 'Người bị bạn bắn cần 2 lá Hụt! mới né được.' },
  suzylafayette:  { name: 'Suzy Lafayette',   hp: 4, icon: '✨', desc: 'Khi hết bài trên tay, rút ngay 1 lá.' },
  vulturesam:     { name: 'Vulture Sam',      hp: 4, icon: '🦅', desc: 'Khi có người bị loại, lấy toàn bộ bài của người đó.' },
  willythekid:    { name: 'Willy the Kid',    hp: 4, icon: '🔥', desc: 'Bắn không giới hạn số lần mỗi lượt.' },
};

export function cardName(c) { return CARD_INFO[c.type].name; }
export function cardLabel(c) { return `${CARD_INFO[c.type].name} ${SUIT_SYMBOL[c.suit]}${rankLabel(c.rank)}`; }

// Tranh cho lá bài, vai trò, nhân vật – tranh của Frederic Remington (1861–1909)
// và Charles M. Russell (1864–1926), public domain, nguồn Wikimedia Commons.
// Muốn đổi tranh: thay file trong thư mục img/ cùng tên.
// pos  = tiêu điểm (x% y%) – phần tranh được giữ khi cắt vào khung
// zoom = độ phóng cho avatar tròn quanh bàn (tranh rộng thì người nhỏ, cần phóng)

export const IMG = {
  // Lá bài
  bang: { pos: '35% 50%' }, missed: { pos: '42% 55%' }, beer: { pos: '50% 50%' }, panic: { pos: '40% 60%' },
  catbalou: { pos: '55% 55%' }, stagecoach: { pos: '50% 35%' }, wellsfargo: { pos: '45% 60%' }, store: { pos: '62% 45%' },
  saloon: { pos: '50% 55%' }, indians: { pos: '45% 50%' }, duel: { pos: '40% 60%' }, gatling: { pos: '50% 50%' },
  dynamite: { pos: '30% 50%' }, jail: { pos: '50% 30%' }, barrel: { pos: '45% 50%' }, scope: { pos: '68% 50%' },
  mustang: { pos: '55% 30%' }, volcanic: { pos: '35% 55%' }, schofield: { pos: '40% 50%' }, remington: { pos: '45% 55%' },
  carabine: { pos: '55% 35%' }, winchester: { pos: '45% 50%' },
  // Vai trò
  sheriff: { pos: '50% 30%' }, deputy: { pos: '50% 25%' }, outlaw: { pos: '45% 35%' }, renegade: { pos: '50% 45%' },
  // Nhân vật: [x%, y%] tiêu điểm khuôn mặt/người, zoom cho avatar
  bartcassidy:   { pos: '55% 38%', zoom: 2.6 },
  blackjack:     { pos: '55% 55%', zoom: 2.0 },
  calamityjanet: { pos: '45% 55%', zoom: 1.7 },
  elgringo:      { pos: '50% 14%', zoom: 2.4 },
  jessejones:    { pos: '45% 26%', zoom: 2.2 },
  jourdonnais:   { pos: '50% 20%', zoom: 2.6 },
  kitcarlson:    { pos: '55% 22%', zoom: 2.2 },
  luckyduke:     { pos: '52% 30%', zoom: 2.6 },
  paulregret:    { pos: '60% 30%', zoom: 2.0 },
  pedroramirez:  { pos: '48% 38%', zoom: 2.0 },
  rosedoolan:    { pos: '50% 52%', zoom: 2.0 },
  sidketchum:    { pos: '50% 32%', zoom: 1.5 },
  slabthekiller: { pos: '45% 38%', zoom: 2.4 },
  suzylafayette: { pos: '38% 55%', zoom: 2.0 },
  vulturesam:    { pos: '50% 48%', zoom: 2.0 },
  willythekid:   { pos: '48% 45%', zoom: 3.0 },
};

export function imgSrc(key) { return `img/${key}.jpg`; }
export function imgTag(key) {
  const pos = IMG[key]?.pos || '50% 50%';
  return `<img src="${imgSrc(key)}" alt="" loading="lazy" draggable="false" style="object-position:${pos}">`;
}
// Avatar tròn: phóng quanh tiêu điểm
export function avatarTag(key) {
  const c = IMG[key] || {}; const pos = c.pos || '50% 50%'; const z = c.zoom || 1.6;
  return `<img src="${imgSrc(key)}" alt="" draggable="false" style="object-position:${pos};transform:scale(${z});transform-origin:${pos}">`;
}

# BANG! Việt hóa – chơi online với bạn bè 🤠

Web game Bang! (bản gốc: 80 lá, 16 nhân vật, 4 vai trò) chơi 4–7 người ngay trên trình duyệt, không cần server.
Một người **tạo phòng** (máy đó chạy luật game), những người khác **vào bằng mã 5 ký tự** hoặc link mời. Thiếu người thì thêm bot.

**Chơi ngay:** https://mangomint1805.github.io/bang-vn/

## Tính năng
- Luật đầy đủ bản gốc, giao diện tiếng Việt, nhật ký ván đấu
- Bàn gỗ oval, lá bài minh hoạ bằng tranh Viễn Tây thật (Remington & Russell)
- 5 chủ đề: 🌵 Sa mạc · 🌙 Đêm trăng · 🥃 Quán rượu · 🌅 Hoàng hôn · ❄️ Mùa đông – mỗi chủ đề có hạt nền động riêng (bụi, sao đom đóm, khói, cỏ lăn, tuyết)
- Nhạc nền tự sinh theo chủ đề (huýt sáo kiểu spaghetti western, harmonica, piano quán rượu, guitar twang, hộp nhạc) – soạn bằng code, không dùng file nhạc
- Hiệu ứng: chia bài bay, vệt đạn + chớp nòng, Gatling quét, mũi tên Thổ dân, thuốc nổ rung màn hình, dấu "HỤT!", song sắt Nhà tù, lấp lánh hồi máu, pháo giấy khi thắng
- Thêm/xoá bot, rớt mạng vào lại đúng ghế (20 giây không về thì bot đánh thay)
- Chế độ chơi một mình với bot (offline)
- Hướng dẫn chơi đầy đủ ngay trong game (nút 📖), soạn theo sách luật chính thức của dV Giochi

## Chạy tại chỗ
ES module không chạy bằng `file://`, cần một web server bất kỳ:
```
python3 -m http.server 8000
```
rồi mở http://localhost:8000.

## Cấu trúc
| File | Vai trò |
|---|---|
| `js/cards.js` | Dữ liệu 80 lá, 16 nhân vật, 4 vai trò (tiếng Việt) |
| `js/engine.js` | Luật chơi thuần, không dính mạng/UI |
| `js/bot.js` | Bot |
| `js/net.js` | PeerJS: `Host` giữ state + chạy luật, `Client` gửi hành động |
| `js/main.js` | Giao diện bàn chơi, lá bài, hiệu ứng theo diễn biến |
| `js/fx.js` | Bài bay, đạn, nổ, pháo giấy, âm thanh hiệu ứng |
| `js/themes.js` | 5 chủ đề + hạt nền động |
| `js/music.js` | Nhạc nền tự sinh |
| `js/guide.js` | Hướng dẫn chơi trong game |
| `js/images.js` | Tranh cho từng lá / nhân vật, tiêu điểm cắt ảnh |
| `test/sim.mjs` | `node test/sim.mjs 500` – cho bot đánh nhau để kiểm tra luật |

## Hình ảnh
Tranh trong `img/` là của **Frederic Remington** (1861–1909) và **Charles M. Russell** (1864–1926),
thuộc phạm vi công cộng (public domain), lấy từ Wikimedia Commons.
Đổi tranh: thay file cùng tên trong `img/`, chỉnh tiêu điểm/độ phóng avatar trong `js/images.js`.

## Luật đã đơn giản hoá
- Thùng rượu và Bia cứu mạng dùng **tự động**.
- Kỹ năng Sid Ketchum chỉ dùng trong lượt của mình.
- Lucky Duke tự chọn lá có lợi khi "lật bài".

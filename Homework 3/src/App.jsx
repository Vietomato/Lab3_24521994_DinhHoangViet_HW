import { useState } from 'react';
import { createDrops, DEMO_NOTICE, standings, killEvents } from './data/fixtures.js';
import { validateFixtures } from './lib/validateFixtures.js';

const priceFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function App() {
  const [drops] = useState(() => createDrops(Date.now()));
  const errors = validateFixtures({ drops, standings, killEvents });
  return (
    <>
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <header className="site-header">
        <div className="container">
          <p className="eyebrow">Bản demo cộng đồng</p>
          <h1>PUBG Vietnam Airdrop Arena</h1>
          <p>Khám phá vé sự kiện, G-Coin và hoạt động của các đội tuyển.</p>
        </div>
      </header>
      <main id="main-content" className="container" tabIndex={-1}>
        <p className="demo-notice">
          {DEMO_NOTICE}
        </p>
        <section aria-labelledby="drops-heading">
          <h2 id="drops-heading">Airdrop vé &amp; G-Coin</h2>
          <p>Khu vực airdrop đang được chuẩn bị. Chức năng nhận vật phẩm chưa được kết nối.</p>
          {errors.length > 0 ? (
            <p role="status">Dữ liệu demo không hợp lệ: {errors.join(' ')}</p>
          ) : (
            <ul>
              {drops.map((drop) => (
                <li key={drop.id}>{drop.title} · {priceFormatter.format(drop.priceVnd)} · Kho mô phỏng: {drop.remainingStock}</li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="standings-heading">
          <h2 id="standings-heading">Bảng xếp hạng đội tuyển</h2>
          <p>Dữ liệu điểm mô phỏng đã sẵn sàng cho {standings.map((squad) => squad.squadName).join(', ')}. Bảng xếp hạng sẽ được kết nối sau.</p>
        </section>
        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading">Kill feed mô phỏng</h2>
          <p>Đã chuẩn bị {killEvents.length.toLocaleString('vi-VN')} sự kiện mô phỏng. Giao diện feed sẽ được kết nối sau.</p>
        </section>
      </main>
      <footer className="container site-footer">
        <p>PUBG Vietnam Airdrop Arena · Demo</p>
      </footer>
    </>
  );
}

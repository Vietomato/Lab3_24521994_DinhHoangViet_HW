import { useState } from 'react';
import { DEMO_NOTICE, standings, killEvents } from './data/fixtures.js';
import { createDemoSession } from './api/mockApi.js';
import { validateFixtures } from './lib/validateFixtures.js';
import DropCard from './components/DropCard.jsx';
import DemoControls from './components/DemoControls.jsx';

export default function App() {
  const [session, setSession] = useState(() => ({ ...createDemoSession(), version: 0 }));
  const [scenario, setScenario] = useState('success');
  const { drops, service } = session;
  const errors = validateFixtures({ drops, standings, killEvents });
  function resetDemo() {
    const freshSession = createDemoSession();
    setSession((current) => ({ ...freshSession, version: current.version + 1 }));
  }
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
          <p>Thời gian và kho bên dưới thuộc phiên mô phỏng này. Tồn kho chỉ tồn tại trong trình duyệt này.</p>
          <DemoControls scenario={scenario} onScenarioChange={setScenario} onReset={resetDemo} sessionVersion={session.version} />
          {errors.length > 0 ? (
            <p role="status">Dữ liệu demo không hợp lệ: {errors.join(' ')}</p>
          ) : (
            <div className="airdrop-grid">
              {drops.map((drop) => <DropCard key={`${session.version}-${drop.id}`} drop={drop} service={service} scenario={scenario} />)}
            </div>
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

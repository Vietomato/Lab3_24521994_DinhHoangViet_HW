import { useId, useRef, useState } from 'react';
import { FEED_ROW_HEIGHT, FEED_VIEWPORT_HEIGHT, filterKillEvents, getVirtualWindow } from '../lib/virtual.js';

export default function KillFeed({ events, squads }) {
  const filterId = useId();
  const helpId = useId();
  const viewport = useRef(null);
  const [squadId, setSquadId] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const filtered = filterKillEvents(events, squadId);
  const window = getVirtualWindow({ count: filtered.length, scrollTop });
  const rows = filtered.slice(window.start, window.end);

  function changeFilter(event) {
    if (viewport.current) viewport.current.scrollTop = 0;
    setScrollTop(0);
    setSquadId(event.target.value);
  }

  return (
    <>
      <p id={helpId}>Sự kiện hạ gục mô phỏng. Cuộn hoặc dùng phím mũi tên, Page Up, Page Down để xem; không phải diễn biến trực tiếp.</p>
      <div className="feed-controls">
        <label htmlFor={filterId}>Lọc sự kiện theo đội</label>
        <select id={filterId} value={squadId} onChange={changeFilter}>
          <option value="">Tất cả đội</option>
          {squads.map((squad) => <option key={squad.squadId} value={squad.squadId}>{squad.squadName}</option>)}
        </select>
      </div>
      <p>{filtered.length.toLocaleString('vi-VN')} sự kiện mô phỏng</p>
      <div ref={viewport} className="feed-viewport" tabIndex={0} role="region"
        aria-label="Kill feed mô phỏng, vùng cuộn" aria-describedby={helpId}
        style={{ height: FEED_VIEWPORT_HEIGHT }} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
        {filtered.length === 0 ? <p className="feed-empty">Không có sự kiện phù hợp.</p> : (
          <div style={{ height: window.totalHeight, position: 'relative' }}>
            <ul className="feed-list" style={{ position: 'absolute', top: window.offsetTop, width: '100%' }}>
              {rows.map((event, index) => (
                <li key={event.id} data-event-id={event.id} className="feed-row"
                  aria-posinset={window.start + index + 1} aria-setsize={filtered.length}
                  style={{ height: FEED_ROW_HEIGHT }}>
                  <span className="feed-line">{event.attacker} → {event.victim}</span>
                  <span className="feed-line feed-detail">{squads.find((squad) => squad.squadId === event.squadId)?.squadName ?? event.squadId} · {event.weapon}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

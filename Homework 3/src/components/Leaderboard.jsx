import { useId, useState } from 'react';
import { selectStandings, simulateStandingsRound } from '../lib/leaderboard.js';

export default function Leaderboard({ initialStandings }) {
  const searchId = useId();
  const metricId = useId();
  const directionId = useId();
  const helpId = useId();
  const [search, setSearch] = useState('');
  const [metric, setMetric] = useState('wwcdCount');
  const [direction, setDirection] = useState('desc');
  const [simulation, setSimulation] = useState(() => ({ standings: initialStandings, round: 0 }));
  const rows = selectStandings(simulation.standings, search, metric, direction);

  function refresh() {
    setSimulation((current) => ({
      round: current.round + 1,
      standings: simulateStandingsRound(current.standings, current.round + 1),
    }));
  }

  return (
    <>
      <p id={helpId}>Điểm mô phỏng, không phải kết quả thi đấu chính thức. Mỗi lần cập nhật thêm một vòng điểm giả lập.</p>
      <div className="leaderboard-controls">
        <div><label htmlFor={searchId}>Tìm đội tuyển</label><input id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div><label htmlFor={metricId}>Sắp xếp theo</label><select id={metricId} value={metric} onChange={(event) => setMetric(event.target.value)}>
          <option value="wwcdCount">WWCD — Số trận thắng</option>
          <option value="placementPts">Điểm thứ hạng</option>
          <option value="killPts">Điểm hạ gục</option>
        </select></div>
        <div><label htmlFor={directionId}>Thứ tự</label><select id={directionId} value={direction} onChange={(event) => setDirection(event.target.value)}>
          <option value="desc">Giảm dần</option><option value="asc">Tăng dần</option>
        </select></div>
        <button type="button" onClick={refresh} aria-describedby={helpId}>Cập nhật điểm mô phỏng</button>
      </div>
      <p role="status" aria-live="polite">{simulation.round > 0 ? `Đã cập nhật ${simulation.round} vòng điểm mô phỏng.` : ''}</p>
      <div className="table-scroll" role="region" aria-label="Bảng điểm mô phỏng, cuộn ngang nếu cần" tabIndex={0}>
        <table>
          <caption>Bảng điểm đội tuyển mô phỏng — {rows.length} đội</caption>
          <thead><tr><th scope="col">Đội tuyển</th>
            <th scope="col" aria-sort={metric === 'wwcdCount' ? direction === 'asc' ? 'ascending' : 'descending' : undefined}>WWCD</th>
            <th scope="col" aria-sort={metric === 'placementPts' ? direction === 'asc' ? 'ascending' : 'descending' : undefined}>Điểm thứ hạng</th>
            <th scope="col" aria-sort={metric === 'killPts' ? direction === 'asc' ? 'ascending' : 'descending' : undefined}>Điểm hạ gục</th>
          </tr></thead>
          <tbody>{rows.length ? rows.map((squad) => <tr key={squad.squadId}>
            <th scope="row">{squad.squadName}</th><td>{squad.wwcdCount}</td><td>{squad.placementPts}</td><td>{squad.killPts}</td>
          </tr>) : <tr><td colSpan={4}>Không tìm thấy đội tuyển phù hợp.</td></tr>}</tbody>
        </table>
      </div>
    </>
  );
}

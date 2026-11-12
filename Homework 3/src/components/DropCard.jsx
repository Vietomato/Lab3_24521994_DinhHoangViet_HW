import { useId } from 'react';
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer.js';
import { formatRemainingTime, getDropPhase } from '../lib/drop.js';
import { validateFixtures } from '../lib/validateFixtures.js';
import { useClaim } from '../hooks/useClaim.js';

const priceFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const phaseText = {
  WARMUP: 'Sắp mở — chờ thời điểm bắt đầu',
  AIRDROP_LIVE: 'Đang mở — còn vật phẩm mô phỏng',
  LOOTED_OUT: 'Đã hết vật phẩm mô phỏng',
  EXPIRED: 'Đã hết hạn — airdrop đã kết thúc',
};

/** @param {{ drop: import('../contracts.js').PubgCrateDrop, service: ReturnType<import('../api/mockApi.js').createMockClaimService>, scenario?: import('../contracts.js').ClaimScenario, serverOffsetMs?: number }} props */
export default function DropCard({ drop, service, scenario = 'success', serverOffsetMs = 0 }) {
  const headingId = useId();
  const helpId = useId();
  const feedbackId = useId();
  const claimState = useClaim({ drop, service, scenario, serverOffsetMs });
  // A single clock sample drives phase and both deadlines; opening zero never
  // implies perpetual eligibility. The hook continues ticking after opening.
  const { nowEpochMs, error } = usePubgAirdropTimer(drop?.dropEpochMs, serverOffsetMs);
  const dataErrors = validateFixtures({ drops: [drop], standings: [], killEvents: [] });
  const phase = error || dataErrors.length ? null : getDropPhase(drop, nowEpochMs, claimState.serverStock);
  const opening = phase === 'WARMUP';
  const remainingMs = phase === null ? null : Math.max(0,
    (opening ? drop.dropEpochMs : drop.expiresEpochMs) - nowEpochMs);

  return (
    <article className="drop-card" aria-labelledby={headingId}>
      <h3 id={headingId}>{typeof drop?.title === 'string' && drop.title.trim() ? drop.title : 'Airdrop không hợp lệ'}</h3>
      {phase === null ? (
        <p className="card-error">Không thể hiển thị airdrop: {error || dataErrors.join(' ') || 'Thời gian hoặc kho không hợp lệ.'}</p>
      ) : (
        <>
          <p className="phase-label" data-phase={phase}>{phaseText[phase]}</p>
          <dl className="drop-details">
            <div><dt>Giá mô phỏng</dt><dd>{priceFormatter.format(drop.priceVnd)}</dd></div>
            <div><dt>Kho mô phỏng{claimState.pending ? ' (tạm giữ 1)' : ''}</dt><dd>{claimState.displayedStock.toLocaleString('vi-VN')}</dd></div>
            <div>
              <dt>{opening ? 'Mở sau' : phase === 'EXPIRED' ? 'Đã hết hạn' : 'Hết hạn sau'}</dt>
              <dd className="countdown">{formatRemainingTime(remainingMs)}</dd>
            </div>
          </dl>
        </>
      )}
      <p id={helpId} className="claim-help">Nhận 1 vật phẩm mô phỏng. Không có giao dịch thật.</p>
      <p id={feedbackId} role="status" aria-live="polite" aria-atomic="true" className={claimState.status === 'error' ? 'card-error' : 'claim-feedback'}>{claimState.message}</p>
      <button type="button" disabled={!service || phase !== 'AIRDROP_LIVE' || claimState.pending}
        aria-describedby={`${helpId} ${feedbackId}`} onClick={claimState.claim}>
        {claimState.pending ? 'Đang xác nhận…' : 'Nhận vật phẩm mô phỏng'}
      </button>
    </article>
  );
}

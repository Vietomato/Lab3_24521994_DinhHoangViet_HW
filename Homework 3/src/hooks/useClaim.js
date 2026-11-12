import { useEffect, useRef, useState } from 'react';
import { getDropPhase } from '../lib/drop.js';
import { validateFixtures } from '../lib/validateFixtures.js';

const stockValue = (value) => Number.isInteger(value) && value >= 0;

/** One hook per drop per session. Remount on session/drop replacement. */
export function useClaim({ drop, service, scenario = 'success', serverOffsetMs = 0 }) {
  const [state, setState] = useState(() => ({
    serverStock: drop?.remainingStock, pending: false, status: 'idle', message: '',
  }));
  const lock = useRef(null);
  const session = useRef(null);

  useEffect(() => {
    const owner = {};
    session.current = owner;
    return () => {
      session.current = null;
      const operation = lock.current;
      lock.current = null;
      operation?.controller.abort();
    };
  }, [drop, service]);

  async function claim() {
    const now = Date.now() + serverOffsetMs;
    if (!session.current || lock.current || !service || !Number.isFinite(serverOffsetMs) ||
        validateFixtures({ drops: [drop], standings: [], killEvents: [] }).length ||
        getDropPhase(drop, now, state.serverStock) !== 'AIRDROP_LIVE') return;

    const operation = { owner: session.current, controller: new AbortController(), scenario };
    lock.current = operation; // Synchronous lock before state changes or awaits.
    const owns = () => session.current === operation.owner && lock.current === operation;
    setState((current) => ({ ...current, pending: true, status: 'pending', message: 'Đang xác nhận vật phẩm mô phỏng…' }));
    try {
      const claimId = crypto.randomUUID();
      const result = await service.claim({ dropId: drop.id, claimId, scenario: operation.scenario, signal: operation.controller.signal });
      if (!owns()) return;
      if (result.claimId !== claimId || !stockValue(result.remainingStock)) throw new Error('Phản hồi kho không hợp lệ.');
      setState((current) => ({ ...current, serverStock: result.remainingStock, status: 'success', message: 'Đã nhận 1 vật phẩm mô phỏng. Không có giao dịch thật.' }));
    } catch (error) {
      if (!owns()) return;
      setState((current) => ({
        ...current,
        serverStock: error?.status === 409 && stockValue(error.remainingStock) ? error.remainingStock : current.serverStock,
        status: 'error', message: error?.message || 'Không thể nhận vật phẩm. Vui lòng thử lại.',
      }));
    } finally {
      if (owns()) {
        lock.current = null;
        setState((current) => ({ ...current, pending: false }));
      }
    }
  }

  return { ...state, displayedStock: Math.max(0, state.serverStock - (state.pending ? 1 : 0)), claim };
}

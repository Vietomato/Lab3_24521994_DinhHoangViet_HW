const text = (value) => typeof value === 'string' && value.trim().length > 0;
const count = (value) => Number.isInteger(value) && value >= 0;
const timestamp = (value) => Number.isFinite(value) && Math.abs(value) <= 8.64e15;

/** Pure validation: return readable errors so the UI can fail safely inline. */
export function validateFixtures({ drops, standings, killEvents }) {
  const errors = [];
  function records(items, idField, label) {
    if (!Array.isArray(items)) {
      errors.push(`${label}: cần một danh sách.`);
      return [];
    }
    const ids = new Set();
    return items.filter((item) => {
      if (!item || typeof item !== 'object') {
        errors.push(`${label}: bản ghi không hợp lệ.`);
        return false;
      }
      if (!text(item[idField]) || ids.has(item[idField])) {
        errors.push(`${label}: ID thiếu hoặc trùng lặp.`);
      }
      ids.add(item[idField]);
      return true;
    });
  }
  const validDrops = records(drops, 'id', 'Airdrop');
  const validSquads = records(standings, 'squadId', 'Đội tuyển');
  const validEvents = records(killEvents, 'id', 'Kill feed');
  for (const drop of validDrops) {
    if (!text(drop.title) || !Number.isFinite(drop.priceVnd) || drop.priceVnd < 0 ||
        !count(drop.remainingStock) || !timestamp(drop.dropEpochMs) ||
        !timestamp(drop.expiresEpochMs) || drop.expiresEpochMs <= drop.dropEpochMs) {
      errors.push('Airdrop: tên, giá, kho hoặc thời hạn không hợp lệ.');
    }
  }
  for (const squad of validSquads) {
    if (!text(squad.squadName) || ![squad.wwcdCount, squad.placementPts, squad.killPts].every(count)) {
      errors.push('Đội tuyển: tên hoặc điểm không hợp lệ.');
    }
  }
  const squadIds = new Set(validSquads.map((squad) => squad.squadId));
  for (const event of validEvents) {
    if (!squadIds.has(event.squadId) || ![event.attacker, event.victim, event.weapon].every(text) ||
        event.attacker === event.victim) {
      errors.push('Kill feed: đội tuyển hoặc thông tin sự kiện không hợp lệ.');
    }
  }
  return errors;
}

const metrics = new Set(['wwcdCount', 'placementPts', 'killPts']);

/** Filter then sort a fresh array; ties always use ascending squadId. */
export function selectStandings(standings, search = '', metric = 'wwcdCount', direction = 'desc') {
  if (!metrics.has(metric) || !['asc', 'desc'].includes(direction)) {
    throw new TypeError('Invalid standings sort option.');
  }
  const query = search.trim().toLowerCase();
  const sign = direction === 'asc' ? 1 : -1;
  return standings.filter((squad) => squad.squadName.toLowerCase().includes(query))
    .sort((a, b) => sign * (a[metric] - b[metric]) ||
      (a.squadId < b.squadId ? -1 : a.squadId > b.squadId ? 1 : 0));
}

/** One deterministic simulated round: sample points, unrelated to kill feed. */
export function simulateStandingsRound(standings, round) {
  if (!Number.isSafeInteger(round) || round < 1) throw new TypeError('Round must be a positive integer.');
  return standings.map((squad, index) => ({
    ...squad,
    wwcdCount: squad.wwcdCount + (index === (round - 1) % standings.length ? 1 : 0),
    placementPts: squad.placementPts + (standings.length - index) * 2,
    killPts: squad.killPts + 1 + (round + index) % 7,
  }));
}

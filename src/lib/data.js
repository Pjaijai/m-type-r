export const ROUTE_DIRECTIONS = {
  FORWARD: "forward",
  REVERSE: "reverse",
};

// Each entry in line.segments is a real service pattern, e.g. the Tseung
// Kwan O Line runs North Point→Po Lam and North Point→LOHAS Park.
export function getLineRuns(line) {
  if (!line) return [];
  const stationById = new Map(
    line.stations.map((station) => [station.id, station]),
  );
  const segments =
    line.segments ?? [line.stations.map((station) => station.id)];
  return segments
    .map((stationIds, index) => {
      const stations = stationIds
        .map((id) => stationById.get(id))
        .filter(Boolean);
      return { index, stations };
    })
    .filter((run) => run.stations.length > 1);
}

export function getRunLabel(run, useZh) {
  if (!run?.stations.length) return "";
  const first = run.stations[0];
  const last = run.stations[run.stations.length - 1];
  return useZh
    ? `${first.nameZh} → ${last.nameZh}`
    : `${first.nameEn} → ${last.nameEn}`;
}

export function getPlayableStations(
  line,
  runIndex = 0,
  direction = ROUTE_DIRECTIONS.FORWARD,
) {
  const runs = getLineRuns(line);
  const stations = (runs[runIndex] ?? runs[0])?.stations ?? [];
  return direction === ROUTE_DIRECTIONS.REVERSE
    ? [...stations].reverse()
    : stations;
}

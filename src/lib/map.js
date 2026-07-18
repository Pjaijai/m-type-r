import { geoMercator, geoPath } from "d3-geo";

// Hong Kong is wider than tall, so the home map uses a landscape canvas.
export const MAP_VIEWBOX = [0, 0, 960, 620];

// Fit to the territory proper; keeps Victoria Harbour near the centre.
const HK_BOUNDS = {
  type: "Polygon",
  coordinates: [
    [
      [113.82, 22.15],
      [113.82, 22.57],
      [114.45, 22.57],
      [114.45, 22.15],
      [113.82, 22.15],
    ],
  ],
};

export function buildMapModel(boundaryFeature, lines) {
  const projection = geoMercator().fitExtent(
    [
      [24, 24],
      [936, 596],
    ],
    HK_BOUNDS,
  );
  const path = geoPath(projection);
  const boundaryPath = path(boundaryFeature);

  const routes = lines.map((line) => {
    const pointsById = new Map(
      line.stations.map((station) => [
        station.id,
        projection([station.lon, station.lat]),
      ]),
    );
    const segments = line.segments
      .map((stationIds) =>
        stationIds.map((id) => pointsById.get(id)).filter(Boolean),
      )
      .filter((points) => points.length > 1);
    const stations = line.stations.map((station) => ({
      ...station,
      point: pointsById.get(station.id),
    }));
    return { ...line, pointsById, segments, stations };
  });

  return { boundaryPath, routes };
}

export function getRouteViewBox(route, minimumWidth = 320, padding = 48) {
  if (!route) return MAP_VIEWBOX;
  const points = route.segments.flat();
  if (!points.length) return MAP_VIEWBOX;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX + padding * 2, minimumWidth);
  const height = Math.max(maxY - minY + padding * 2, width * 0.62);
  return [
    (minX + maxX - width) / 2,
    (minY + maxY - height) / 2,
    width,
    height,
  ];
}

export function pointsToString(points) {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

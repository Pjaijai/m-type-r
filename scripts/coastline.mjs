// Turns raw OSM natural=coastline ways into a land MultiPolygon clipped to
// the Hong Kong administrative boundary. OSM convention: walking a coastline
// way, land is on the LEFT, so stitched rings are counterclockwise and open
// chains are closed by walking the frame counterclockwise as well.
import polygonClipping from "polygon-clipping";

// Frame slightly larger than the fetch bbox so closure edges stay offshore
// of the map view; anything outside Hong Kong is removed by the admin clip.
const FRAME = { west: 113.75, south: 22.1, east: 114.55, north: 22.7 };

export function buildLand(osmData, adminMultiPolygon) {
  const chains = stitchChains(osmData);
  const rings = [];
  const open = [];
  for (const chain of chains) {
    const clipped = clipChainToFrame(chain);
    for (const piece of clipped) {
      if (isClosed(piece)) rings.push(piece);
      else open.push(piece);
    }
  }
  rings.push(...closeAlongFrame(open));
  const land = polygonClipping.intersection(
    rings.map((ring) => [ring]),
    adminMultiPolygon,
  );
  return land
    .map((polygon) =>
      polygon
        .map((ring) => simplifyRing(ring, 0.0003))
        .filter((ring) => ring.length >= 4 && Math.abs(ringArea(ring)) > 5e-7),
    )
    .filter((polygon) => polygon.length > 0);
}

function stitchChains(osmData) {
  const ways = osmData.elements.filter((element) => element.type === "way");
  const nodes = new Map(
    osmData.elements
      .filter((element) => element.type === "node")
      .map((node) => [node.id, [node.lon, node.lat]]),
  );
  const byFirst = new Map();
  const segments = ways.map((way) => ({ nodes: way.nodes, used: false }));
  for (const segment of segments) {
    const first = segment.nodes[0];
    if (!byFirst.has(first)) byFirst.set(first, []);
    byFirst.get(first).push(segment);
  }
  const chains = [];
  for (const segment of segments) {
    if (segment.used) continue;
    segment.used = true;
    const nodeIds = [...segment.nodes];
    // Follow end -> start links until the ring closes or no link exists.
    while (nodeIds[nodeIds.length - 1] !== nodeIds[0]) {
      const next = (byFirst.get(nodeIds[nodeIds.length - 1]) ?? []).find(
        (candidate) => !candidate.used,
      );
      if (!next) break;
      next.used = true;
      nodeIds.push(...next.nodes.slice(1));
    }
    const coordinates = nodeIds
      .map((id) => nodes.get(id))
      .filter(Boolean);
    if (coordinates.length > 1) chains.push(coordinates);
  }
  return chains;
}

const isClosed = (chain) =>
  chain[0][0] === chain[chain.length - 1][0] &&
  chain[0][1] === chain[chain.length - 1][1];

const inFrame = ([x, y]) =>
  x >= FRAME.west && x <= FRAME.east && y >= FRAME.south && y <= FRAME.north;

// Split a chain into the pieces inside the frame, inserting the exact
// frame-crossing points so open ends always sit on the frame border.
function clipChainToFrame(chain) {
  if (chain.every(inFrame)) return [chain];
  const pieces = [];
  let current = [];
  for (let i = 0; i < chain.length; i += 1) {
    const point = chain[i];
    const previous = chain[i - 1];
    if (inFrame(point)) {
      if (previous && !inFrame(previous))
        current.push(crossing(previous, point));
      current.push(point);
    } else if (previous && inFrame(previous)) {
      current.push(crossing(point, previous));
      if (current.length > 1) pieces.push(current);
      current = [];
    }
  }
  if (current.length > 1) pieces.push(current);
  return pieces;
}

// Intersection of the segment outside->inside with the frame border.
function crossing(outside, inside) {
  let [x1, y1] = outside;
  const [x2, y2] = inside;
  let t = 1;
  const consider = (tCandidate) => {
    if (tCandidate >= 0 && tCandidate <= 1) t = Math.min(t, tCandidate);
  };
  if (x1 < FRAME.west) consider((FRAME.west - x2) / (x1 - x2));
  if (x1 > FRAME.east) consider((FRAME.east - x2) / (x1 - x2));
  if (y1 < FRAME.south) consider((FRAME.south - y2) / (y1 - y2));
  if (y1 > FRAME.north) consider((FRAME.north - y2) / (y1 - y2));
  return [x2 + (x1 - x2) * t, y2 + (y1 - y2) * t];
}

// Position of a border point along the frame perimeter, walking
// counterclockwise from the southwest corner: S edge, E edge, N edge, W edge.
function perimeterPosition([x, y]) {
  const width = FRAME.east - FRAME.west;
  const height = FRAME.north - FRAME.south;
  const edges = [
    { distance: Math.abs(y - FRAME.south), position: x - FRAME.west },
    { distance: Math.abs(x - FRAME.east), position: width + (y - FRAME.south) },
    {
      distance: Math.abs(y - FRAME.north),
      position: width + height + (FRAME.east - x),
    },
    {
      distance: Math.abs(x - FRAME.west),
      position: 2 * width + height + (FRAME.north - y),
    },
  ];
  return edges.sort((a, b) => a.distance - b.distance)[0].position;
}

const CORNERS = [
  [FRAME.east, FRAME.south],
  [FRAME.east, FRAME.north],
  [FRAME.west, FRAME.north],
  [FRAME.west, FRAME.south],
];
const CORNER_POSITIONS = CORNERS.map(perimeterPosition);
const PERIMETER =
  2 * (FRAME.east - FRAME.west) + 2 * (FRAME.north - FRAME.south);

// Connect open chains into rings: from each chain's end, walk the frame
// counterclockwise (adding corners) to the nearest chain start ahead.
function closeAlongFrame(open) {
  if (!open.length) return [];
  const remaining = new Set(open);
  const rings = [];
  while (remaining.size) {
    const [start] = remaining;
    remaining.delete(start);
    const ring = [...start];
    let guard = open.length + 1;
    while (guard--) {
      const endPosition = perimeterPosition(ring[ring.length - 1]);
      let next = null;
      let bestDelta = Infinity;
      for (const chain of [start, ...remaining]) {
        const delta =
          (perimeterPosition(chain[0]) - endPosition + PERIMETER) % PERIMETER;
        if (delta < bestDelta) {
          bestDelta = delta;
          next = chain;
        }
      }
      for (const [index, position] of CORNER_POSITIONS.entries()) {
        const delta = (position - endPosition + PERIMETER) % PERIMETER;
        if (delta > 0 && delta < bestDelta) ring.push(CORNERS[index]);
      }
      // Corners must be appended in walking order, so re-sort the tail.
      sortAppendedCorners(ring, endPosition);
      if (next === start) {
        ring.push(start[0]);
        rings.push(ring);
        break;
      }
      remaining.delete(next);
      ring.push(...next);
    }
  }
  return rings;
}

function sortAppendedCorners(ring, fromPosition) {
  let tailStart = ring.length;
  while (
    tailStart > 0 &&
    CORNERS.some(
      (corner) =>
        corner[0] === ring[tailStart - 1][0] &&
        corner[1] === ring[tailStart - 1][1],
    )
  )
    tailStart -= 1;
  const tail = ring.splice(tailStart);
  tail.sort(
    (a, b) =>
      ((perimeterPosition(a) - fromPosition + PERIMETER) % PERIMETER) -
      ((perimeterPosition(b) - fromPosition + PERIMETER) % PERIMETER),
  );
  ring.push(...tail);
}

function ringArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1)
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return area / 2;
}

// Douglas–Peucker on a closed ring.
function simplifyRing(ring, tolerance) {
  const closed = isClosed(ring) ? ring : [...ring, ring[0]];
  const keep = new Array(closed.length).fill(false);
  keep[0] = keep[closed.length - 1] = true;
  const stack = [[0, closed.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDistance = 0;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const distance = pointToSegment(closed[i], closed[first], closed[last]);
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    if (maxDistance > tolerance) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return closed.filter((_, i) => keep[i]);
}

function pointToSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared
    ? Math.max(
        0,
        Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared),
      )
    : 0;
  const x = ax + t * dx;
  const y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

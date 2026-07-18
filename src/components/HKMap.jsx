import { useEffect, useRef, useState } from "react";
import { pointsToString } from "../lib/map";

const ZOOM_MS = 550;

// Animates viewBox changes so selecting a line glides into its route
// instead of jumping. Starts at the target, so mounting never animates.
function useAnimatedViewBox(target) {
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);
  const frameRef = useRef(0);
  const key = target.join(",");
  useEffect(() => {
    const from = currentRef.current;
    const to = key.split(",").map(Number);
    if (from.every((value, i) => value === to[i])) return undefined;
    const startedAt = performance.now();
    const tick = (now) => {
      const t = Math.min((now - startedAt) / ZOOM_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = from.map((value, i) => value + (to[i] - value) * eased);
      currentRef.current = next;
      setCurrent(next);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [key]);
  return current;
}

export function HKMap({
  mapModel,
  viewBox,
  selectedLineId = null,
  onSelectLine = null,
  overlayRoute = null,
  activeStationIds = null,
  currentStationId = null,
  completedStationIds = null,
  className = "",
}) {
  const [x, y, width, height] = useAnimatedViewBox(viewBox);
  const selectedRoute =
    overlayRoute ??
    mapModel.routes.find((route) => route.id === selectedLineId) ??
    null;
  const hasSelection = Boolean(selectedRoute);

  return (
    <svg
      className={`hk-map ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      role="img"
      aria-label="Hong Kong MTR map"
    >
      <path className="hk-land" d={mapModel.boundaryPath} />
      {mapModel.routes.map((route) => {
        const isSelected = !overlayRoute && route.id === selectedLineId;
        const dimmed = hasSelection && !isSelected;
        return (
          <g
            key={route.id}
            className={`hk-route${dimmed ? " dimmed" : ""}${isSelected ? " selected" : ""}`}
          >
            {route.segments.map((points, index) => (
              <polyline
                key={index}
                points={pointsToString(points)}
                stroke={route.color}
                strokeWidth={isSelected ? 4 : 2.6}
              />
            ))}
            {onSelectLine
              ? route.segments.map((points, index) => (
                  <polyline
                    key={`hit-${index}`}
                    className="hk-route-hit"
                    points={pointsToString(points)}
                    onClick={() => onSelectLine(route.id)}
                  />
                ))
              : null}
          </g>
        );
      })}
      {overlayRoute ? (
        <g className="hk-route selected">
          {overlayRoute.segments.map((points, index) => (
            <polyline
              key={index}
              points={pointsToString(points)}
              stroke={overlayRoute.color}
              strokeWidth={4}
            />
          ))}
        </g>
      ) : null}
      {selectedRoute && activeStationIds
        ? activeStationIds.map((stationId) => {
            const point = selectedRoute.pointsById.get(stationId);
            if (!point) return null;
            const isCurrent = stationId === currentStationId;
            const isDone = completedStationIds?.has(stationId);
            return (
              <circle
                key={stationId}
                className={`hk-station${isCurrent ? " current" : ""}${isDone ? " done" : ""}`}
                cx={point[0]}
                cy={point[1]}
                r={isCurrent ? 6 : 4}
                style={{ "--line-color": selectedRoute.color }}
              />
            );
          })
        : null}
      {selectedRoute && currentStationId
        ? (() => {
            const point = selectedRoute.pointsById.get(currentStationId);
            if (!point) return null;
            return (
              <g
                className="hk-train"
                style={{
                  transform: `translate(${point[0]}px, ${point[1]}px)`,
                }}
              >
                <circle r="11" fill="none" stroke={selectedRoute.color} />
              </g>
            );
          })()
        : null}
    </svg>
  );
}

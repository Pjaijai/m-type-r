import { pointsToString } from "../lib/map";

export function HKMap({
  mapModel,
  viewBox,
  selectedLineId = null,
  onSelectLine = null,
  activeStationIds = null,
  currentStationId = null,
  completedStationIds = null,
  className = "",
}) {
  const [x, y, width, height] = viewBox;
  const selectedRoute =
    mapModel.routes.find((route) => route.id === selectedLineId) ?? null;
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
        const isSelected = route.id === selectedLineId;
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

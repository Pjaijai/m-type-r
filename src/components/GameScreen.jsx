import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { HKMap } from "./HKMap";
import { getRouteViewBox } from "../lib/map";
import { TYPING_LANGUAGES } from "../lib/typing";
import { UI_LOCALES } from "../lib/i18n";

export function GameScreen({
  t,
  locale,
  mapModel,
  line,
  stations,
  mode,
  stationIndex,
  typedIndex,
  target,
  typingLanguage,
  compositionText,
  completed,
  remaining,
  elapsed,
  metrics,
  shake,
  onBack,
  onFocusTyping,
}) {
  const useZh = locale === UI_LOCALES.ZH;
  const route = mapModel.routes.find((r) => r.id === line.id);
  const viewBox = useMemo(() => getRouteViewBox(route), [route]);
  const station = stations[stationIndex];
  const nextStation = stations[(stationIndex + 1) % stations.length];
  const completedIds = useMemo(
    () => new Set(stations.slice(0, stationIndex).map((s) => s.id)),
    [stations, stationIndex],
  );
  const targetCharacters = [...target];

  return (
    /* The click handler only refocuses the hidden IME input for phones. */
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    <section
      className="game"
      style={{ "--line-color": line.color }}
      onClick={onFocusTyping}
    >
      <div className="game-top">
        <button type="button" className="back-button" onClick={onBack}>
          <ChevronLeft size={16} />
          {t("backToLines")}
        </button>
        <div className="game-line">
          <span className="line-chip" style={{ background: line.color }}>
            {line.code}
          </span>
          <strong>{useZh ? line.nameZh : line.nameEn}</strong>
        </div>
        <div className="game-timer" role="timer">
          {mode === "timed" ? (
            <>
              <small>{t("timeLeft")}</small>
              <strong>{remaining}s</strong>
            </>
          ) : (
            <>
              <small>{t("elapsed")}</small>
              <strong>{elapsed}s</strong>
            </>
          )}
        </div>
      </div>

      <div className="game-map">
        <HKMap
          mapModel={mapModel}
          viewBox={viewBox}
          selectedLineId={line.id}
          activeStationIds={stations.map((s) => s.id)}
          currentStationId={station?.id ?? null}
          completedStationIds={completedIds}
        />
      </div>

      <div className={`typing-panel${shake ? " shake" : ""}`}>
        <div className="station-names">
          <small>{t("station")}</small>
          <h2>
            {typingLanguage === TYPING_LANGUAGES.CHINESE
              ? station?.nameZh
              : station?.nameEn}
          </h2>
          <p>
            {typingLanguage === TYPING_LANGUAGES.CHINESE
              ? station?.nameEn
              : station?.nameZh}
          </p>
        </div>
        <div className="target" aria-live="polite">
          {targetCharacters.map((character, index) => (
            <span
              key={index}
              className={`target-char${index < typedIndex ? " typed" : ""}${
                index === typedIndex ? " current" : ""
              }`}
            >
              {character === " " ? " " : character}
            </span>
          ))}
        </div>
        {typingLanguage === TYPING_LANGUAGES.CHINESE ? (
          <div className="composition">
            {compositionText || " "}
          </div>
        ) : null}
        <p className="tap-hint">{t("tapToType")}</p>
      </div>

      <div className="game-stats">
        <div>
          <small>{metrics.speedUnit}</small>
          <strong>{metrics.speed}</strong>
        </div>
        <div>
          <small>{t("accuracy")}</small>
          <strong>{metrics.accuracy}%</strong>
        </div>
        <div>
          <small>{t("completedStations")}</small>
          <strong>
            {completed}
            {mode === "line" ? ` / ${stations.length}` : ""}
          </strong>
        </div>
        <div className="next-station">
          <small>{useZh ? "下一站" : "Next"}</small>
          <strong>{useZh ? nextStation?.nameZh : nextStation?.nameEn}</strong>
        </div>
      </div>
    </section>
  );
}

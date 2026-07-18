import { ArrowLeftRight, ChevronLeft, Play } from "lucide-react";
import { HKMap } from "./HKMap";
import { getRouteViewBox, MAP_VIEWBOX } from "../lib/map";
import { getLineRuns, getRunLabel, ROUTE_DIRECTIONS } from "../lib/data";
import { getPlayableStations } from "../lib/data";
import { TYPING_LANGUAGES } from "../lib/typing";
import { UI_LOCALES } from "../lib/i18n";

export function HomeScreen({
  t,
  locale,
  mapModel,
  lines,
  selectedLine,
  runIndex,
  onRunChange,
  direction,
  onDirectionChange,
  mode,
  onModeChange,
  typingLanguage,
  onTypingLanguageChange,
  onSelect,
  onClear,
  onStart,
}) {
  const useZh = locale === UI_LOCALES.ZH;
  const selectedRoute =
    mapModel.routes.find((route) => route.id === selectedLine?.id) ?? null;
  const viewBox = selectedRoute
    ? getRouteViewBox(selectedRoute)
    : MAP_VIEWBOX;
  const runs = selectedLine ? getLineRuns(selectedLine) : [];
  const playable = selectedLine
    ? getPlayableStations(selectedLine, runIndex, direction)
    : [];

  return (
    <section className="home">
      <div className="home-map">
        <HKMap
          mapModel={mapModel}
          viewBox={viewBox}
          selectedLineId={selectedLine?.id ?? null}
          onSelectLine={onSelect}
          activeStationIds={playable.map((station) => station.id)}
          currentStationId={null}
        />
      </div>
      <div className="home-panel">
        {!selectedLine ? (
          <>
            <h1>{t("appName")}</h1>
            <p className="tagline">{t("tagline")}</p>
            <h2>{t("chooseLine")}</h2>
            <ul className="line-list">
              {lines.map((line) => (
                <li key={line.id}>
                  <button
                    type="button"
                    className="line-button"
                    onClick={() => onSelect(line.id)}
                  >
                    <span
                      className="line-chip"
                      style={{ background: line.color }}
                    >
                      {line.code}
                    </span>
                    <span className="line-names">
                      <strong>{useZh ? line.nameZh : line.nameEn}</strong>
                      <small>{useZh ? line.nameEn : line.nameZh}</small>
                    </span>
                    <span className="line-count">
                      {line.stations.length} {t("stations")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="line-detail">
            <button type="button" className="back-button" onClick={onClear}>
              <ChevronLeft size={16} />
              {t("backToLines")}
            </button>
            <div
              className="line-heading"
              style={{ "--line-color": selectedLine.color }}
            >
              <span
                className="line-chip large"
                style={{ background: selectedLine.color }}
              >
                {selectedLine.code}
              </span>
              <div>
                <h1>{useZh ? selectedLine.nameZh : selectedLine.nameEn}</h1>
                <p>{useZh ? selectedLine.nameEn : selectedLine.nameZh}</p>
              </div>
            </div>

            {runs.length > 1 ? (
              <fieldset className="option-group">
                <legend>{t("run")}</legend>
                <div className="option-row">
                  {runs.map((run) => (
                    <button
                      key={run.index}
                      type="button"
                      className={`option-button${run.index === runIndex ? " active" : ""}`}
                      onClick={() => onRunChange(run.index)}
                    >
                      {getRunLabel(run, useZh)}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <fieldset className="option-group">
              <legend>{t("direction")}</legend>
              <button
                type="button"
                className="direction-button"
                onClick={() =>
                  onDirectionChange(
                    direction === ROUTE_DIRECTIONS.FORWARD
                      ? ROUTE_DIRECTIONS.REVERSE
                      : ROUTE_DIRECTIONS.FORWARD,
                  )
                }
              >
                <ArrowLeftRight size={15} />
                {playable.length
                  ? `${useZh ? playable[0].nameZh : playable[0].nameEn} → ${
                      useZh
                        ? playable[playable.length - 1].nameZh
                        : playable[playable.length - 1].nameEn
                    }`
                  : ""}
              </button>
            </fieldset>

            <fieldset className="option-group">
              <legend>{t("mode")}</legend>
              <div className="option-row">
                <button
                  type="button"
                  className={`option-button${mode === "timed" ? " active" : ""}`}
                  onClick={() => onModeChange("timed")}
                >
                  {t("modeTimed")}
                </button>
                <button
                  type="button"
                  className={`option-button${mode === "line" ? " active" : ""}`}
                  onClick={() => onModeChange("line")}
                >
                  {t("modeLine")}
                </button>
              </div>
            </fieldset>

            <fieldset className="option-group">
              <legend>{t("typingLanguage")}</legend>
              <div className="option-row">
                <button
                  type="button"
                  className={`option-button${
                    typingLanguage === TYPING_LANGUAGES.ENGLISH ? " active" : ""
                  }`}
                  onClick={() => onTypingLanguageChange(TYPING_LANGUAGES.ENGLISH)}
                >
                  {t("typingEn")}
                </button>
                <button
                  type="button"
                  className={`option-button${
                    typingLanguage === TYPING_LANGUAGES.CHINESE ? " active" : ""
                  }`}
                  onClick={() => onTypingLanguageChange(TYPING_LANGUAGES.CHINESE)}
                >
                  {t("typingZh")}
                </button>
              </div>
            </fieldset>

            <button
              type="button"
              className="start-button"
              style={{ "--line-color": selectedLine.color }}
              onClick={onStart}
            >
              <Play size={17} />
              {t("start")}
            </button>
            <p className="start-hint">{t("startHint")}</p>
          </div>
        )}
      </div>
    </section>
  );
}

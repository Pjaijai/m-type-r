import { ArrowLeftRight, ChevronLeft, Play } from "lucide-react";
import { HKMap } from "./HKMap";
import { getRouteViewBox, MAP_VIEWBOX } from "../lib/map";
import {
  getLineRuns,
  getPlayableStations,
  getRunLabel,
  ROUTE_DIRECTIONS,
} from "../lib/data";
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
    ? getRouteViewBox(selectedRoute, 320, 64)
    : MAP_VIEWBOX;
  const runs = selectedLine ? getLineRuns(selectedLine) : [];
  const playable = selectedLine
    ? getPlayableStations(selectedLine, runIndex, direction)
    : [];

  return (
    <section className="landing">
      <div className="landing-map">
        <HKMap
          mapModel={mapModel}
          viewBox={viewBox}
          selectedLineId={selectedLine?.id ?? null}
          onSelectLine={onSelect}
          activeStationIds={playable.map((station) => station.id)}
          currentStationId={null}
        />
      </div>
      <p className="landing-credits">
        <a href="https://opendata.mtr.com.hk/" target="_blank" rel="noreferrer">
          {t("stationsCredit")}
        </a>
        {" · "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          {t("mapCredit")}
        </a>
      </p>
      <div className="island">
        {!selectedLine ? (
          <>
            <div className="island-title">
              <h1>{t("appName")}</h1>
              <p>{t("tagline")}</p>
            </div>
            <div className="line-strip">
              {lines.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  className="line-pill"
                  style={{ "--line-color": line.color }}
                  onClick={() => onSelect(line.id)}
                >
                  <span className="line-chip" style={{ background: line.color }}>
                    {line.code}
                  </span>
                  {useZh ? line.nameZh : line.nameEn}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="island-head">
              <button
                type="button"
                className="back-button"
                onClick={onClear}
                aria-label={t("backToLines")}
              >
                <ChevronLeft size={18} />
              </button>
              <span
                className="line-chip large"
                style={{ background: selectedLine.color }}
              >
                {selectedLine.code}
              </span>
              <span className="line-names">
                <strong>{useZh ? selectedLine.nameZh : selectedLine.nameEn}</strong>
                <small>
                  {playable.length} {t("stations")}
                </small>
              </span>
              <button
                type="button"
                className="start-button"
                style={{ "--line-color": selectedLine.color }}
                onClick={onStart}
              >
                <Play size={15} />
                {t("start")}
              </button>
            </div>
            <div className="island-controls">
              {runs.length > 1 ? (
                <div className="island-group">
                  <span className="island-label">{t("run")}</span>
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
                </div>
              ) : null}
              <div className="island-group">
                <span className="island-label">{t("direction")}</span>
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
                  <ArrowLeftRight size={14} />
                  {playable.length
                    ? `${useZh ? playable[0].nameZh : playable[0].nameEn} → ${
                        useZh
                          ? playable[playable.length - 1].nameZh
                          : playable[playable.length - 1].nameEn
                      }`
                    : ""}
                </button>
              </div>
              <div className="island-group">
                <span className="island-label">{t("mode")}</span>
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
              </div>
              <div className="island-group">
                <span className="island-label">{t("typingLanguage")}</span>
                <div className="option-row">
                  <button
                    type="button"
                    className={`option-button${
                      typingLanguage === TYPING_LANGUAGES.ENGLISH ? " active" : ""
                    }`}
                    onClick={() =>
                      onTypingLanguageChange(TYPING_LANGUAGES.ENGLISH)
                    }
                  >
                    {t("typingEn")}
                  </button>
                  <button
                    type="button"
                    className={`option-button${
                      typingLanguage === TYPING_LANGUAGES.CHINESE ? " active" : ""
                    }`}
                    onClick={() =>
                      onTypingLanguageChange(TYPING_LANGUAGES.CHINESE)
                    }
                  >
                    {t("typingZh")}
                  </button>
                </div>
              </div>
            </div>
            <p className="start-hint">{t("startHint")}</p>
          </>
        )}
      </div>
    </section>
  );
}

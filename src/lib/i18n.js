export const UI_LOCALES = {
  EN: "en",
  ZH: "zh",
};

const STORAGE_KEY = "hk-mtr-typing-locale";

export const STRINGS = {
  en: {
    appName: "HK MTR TYPING",
    tagline: "Type your way along real MTR lines and station names.",
    chooseLine: "Choose a line",
    backToLines: "Back to lines",
    run: "Service pattern",
    direction: "Direction",
    forward: "Forward",
    reverse: "Reverse",
    mode: "Mode",
    modeTimed: "30s sprint",
    modeLine: "Full line",
    typingLanguage: "Typing",
    typingEn: "English",
    typingZh: "中文",
    start: "Start",
    startHint: "Press Enter to start · Esc to go back",
    journey: "Journey",
    journeyTitle: "Any two stations",
    journeyHint: "Pick a start and an end — interchanges are routed for you.",
    from: "From",
    to: "To",
    pickStation: "Choose a station",
    stations: "stations",
    station: "Next station",
    completedStations: "Stations",
    timeLeft: "Time left",
    elapsed: "Elapsed",
    accuracy: "Accuracy",
    resultTitle: "Terminus reached",
    retry: "Play again",
    backHome: "Choose another line",
    typingInstruction: "Type the station name shown.",
    tapToType: "Tap here to type",
    loading: "Loading MTR network…",
    loadError: "Failed to load map data",
    reload: "Reload",
    darkMode: "Toggle dark mode",
    uiLanguage: "切換中文介面",
    dataCredit: "Data",
    stationsCredit: "MTR Open Data (DATA.GOV.HK)",
    mapCredit: "© OpenStreetMap contributors",
    disclaimer: "Not an official MTR service. For typing practice only.",
  },
  zh: {
    appName: "港鐵打字",
    tagline: "沿真實港鐵路綫逐站輸入站名的打字遊戲。",
    chooseLine: "選擇路綫",
    backToLines: "返回選綫",
    run: "行車路綫",
    direction: "行駛方向",
    forward: "順行",
    reverse: "逆行",
    mode: "模式",
    modeTimed: "30 秒快打",
    modeLine: "全綫挑戰",
    typingLanguage: "輸入語言",
    typingEn: "English",
    typingZh: "中文",
    start: "開始",
    startHint: "按 Enter 開始 · Esc 返回",
    journey: "自由行程",
    journeyTitle: "任意兩站",
    journeyHint: "選擇起點和終點，轉綫會自動規劃。",
    from: "出發站",
    to: "終點站",
    pickStation: "選擇車站",
    stations: "個車站",
    station: "下一站",
    completedStations: "完成站數",
    timeLeft: "剩餘時間",
    elapsed: "經過時間",
    accuracy: "正確率",
    resultTitle: "已到達終點站",
    retry: "再玩一次",
    backHome: "重新選綫",
    typingInstruction: "輸入畫面顯示的站名。",
    tapToType: "點此輸入",
    loading: "正在載入港鐵路網…",
    loadError: "地圖資料載入失敗",
    reload: "重新載入",
    darkMode: "切換深色模式",
    uiLanguage: "Switch to English",
    dataCredit: "資料",
    stationsCredit: "港鐵開放數據（DATA.GOV.HK）",
    mapCredit: "© OpenStreetMap 貢獻者",
    disclaimer: "本網站並非港鐵官方服務，僅供打字練習使用。",
  },
};

export function getInitialLocale(storage, languages) {
  const saved = storage?.getItem(STORAGE_KEY);
  if (saved && Object.hasOwn(STRINGS, saved)) return saved;
  const preferred = languages?.[0] ?? "";
  return preferred.toLowerCase().startsWith("zh") ? UI_LOCALES.ZH : UI_LOCALES.EN;
}

export function persistLocale(storage, locale) {
  try {
    storage?.setItem(STORAGE_KEY, locale);
  } catch {
    // Private browsing may block storage; the toggle still works in-session.
  }
}

export function translate(locale, key) {
  return STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
}

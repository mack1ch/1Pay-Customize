/** Демо-логотип как на референс-скриншоте (Games). */
const gamesSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="32" viewBox="0 0 100 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9333ea"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs><rect width="100" height="32" rx="8" fill="url(#g)"/><text x="50" y="21" fill="#fff" font-family="system-ui,Arial Black,sans-serif" font-size="10" font-weight="800" text-anchor="middle" letter-spacing="0.12em">GAMES</text></svg>`;

export const MOCK_GAMES_LOGO_DATA_URL =
  `data:image/svg+xml,${encodeURIComponent(gamesSvg)}`;

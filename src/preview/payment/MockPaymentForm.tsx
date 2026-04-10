import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  computeSingleCardFormRadii,
  computeStackedCanvasFormRadii,
  computeSbpDesktopFormRadii,
  D_SINGLE_CARD_CONTENT_PAD,
  sbpMobileBankLogoSlotRadiusPx,
} from "../../domain/formRadiusModel";
import { fontStackFor } from "../../domain/fonts";
import { rgbaFromHex } from "../../domain/colorUtils";
import { mockPaymentContext } from "../../domain/defaults";
import { resolveButtonLabel } from "../../domain/buttonLabel";
import {
  type PreviewTheme,
  resolveDraftBorderRadius,
} from "../../state/previewTheme";
import type {
  AppearanceMode,
  FormCustomizationConfig,
  PaymentStatusKind,
  PreviewContentScreen,
} from "../../types/customization";
import { headerDescription, headerTitle } from "./previewText";
import styles from "./MockPaymentForm.module.css";

function legacyPfRadiusVars(
  rForm: number,
  rSection: number,
  rControl: number,
): CSSProperties {
  return {
    ["--pf-r0" as string]: `${rForm}px`,
    ["--pf-r1" as string]: `${rSection}px`,
    ["--pf-r2" as string]: `${rControl}px`,
  };
}

const MULTI_SBP_BG = "#222222";

function defaultDemoPan(mobile: boolean) {
  return mobile ? "0000 0000 0000 0000" : "4222 3333 4444 5555";
}
function defaultDemoMm(mobile: boolean) {
  return mobile ? "00" : "04";
}
function defaultDemoYy(mobile: boolean) {
  return mobile ? "00" : "30";
}
function defaultDemoCvv(mobile: boolean) {
  return mobile ? "123" : "333";
}

interface Props {
  theme: PreviewTheme;
  config: FormCustomizationConfig;
  device: "desktop" | "mobile";
  /** В конфигураторе: ширина под превью, высота по контенту (скролл у контейнера) */
  embedded?: boolean;
  previewScreen?: PreviewContentScreen;
  /** Редактируемые поля и кнопка оплаты ведут в демо-статус через колбэки */
  interactive?: boolean;
  onDemoPay?: () => void;
  /** С экрана статуса — вернуться к форме (для демо) */
  onDemoNavigateToForm?: () => void;
}

function viewportCls(embedded: boolean | undefined, isMobile: boolean) {
  return [
    styles.viewport,
    isMobile ? styles.viewportMobile : "",
    embedded ? styles.embedded : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function gradCls(embedded: boolean | undefined) {
  return [styles.gradCanvas, embedded ? styles.embeddedGrad : ""]
    .filter(Boolean)
    .join(" ");
}

/** Макет Figma 1:3748 (MIR BIN): стрелка 16px, подпись 12px Medium */
function SingleCardBackLink({ color }: { color: string }) {
  return (
    <button type="button" className={styles.singleCardBack} style={{ color }}>
      <span className={styles.singleCardBackChev} aria-hidden>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3.5L5.5 8l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Вернуться назад
    </button>
  );
}

function SingleCardLegalLine({
  accent,
  mutedColor,
}: {
  accent: string;
  mutedColor: string;
}) {
  return (
    <p className={styles.singleCardLegal}>
      <span style={{ color: mutedColor }}>Оплачивая, вы соглашаетесь с </span>
      <span style={{ color: accent, fontWeight: 600 }}>договором оферты</span>
    </p>
  );
}

function SingleCardFooterRow({
  pciColor,
  mutedColor,
}: {
  pciColor: string;
  mutedColor: string;
}) {
  return (
    <div className={styles.singleCardFooterRow}>
      <div className={styles.singleCardFooterLeft}>
        <div className={styles.singleCardLockWrap} aria-hidden>
          <svg
            className={styles.singleCardLockSvg}
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 7V5a4 4 0 118 0v2"
              stroke={pciColor}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <rect
              x="3"
              y="7"
              width="10"
              height="7"
              rx="1.5"
              stroke={pciColor}
              strokeWidth="1.2"
            />
          </svg>
        </div>
        <span style={{ color: mutedColor }}>
          Ваши данные под защитой PCI DSS
        </span>
      </div>
      <span style={{ color: mutedColor }}>
        Осталось {mockPaymentContext.timer}
      </span>
    </div>
  );
}

function MultiBackChevron({ compact }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? styles.multiBackChevronSm : styles.multiBackChevronLg}
      viewBox="0 0 8 14"
      aria-hidden
    >
      <path
        d="M6.5 1L1.5 7l5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MultiBackLink({
  compact,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        compact ? styles.multiBackCompact : styles.multiBack,
        onNavigate ? styles.demoClickable : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onNavigate}
    >
      <span className={styles.multiBackChevronWrap} aria-hidden>
        <MultiBackChevron compact={compact} />
      </span>
      Вернуться назад
    </button>
  );
}

function CornerBrand({
  logoUrl,
  textColor,
  primaryColor,
  multi,
  showPlaceholderWhenNoLogo,
}: {
  logoUrl: string | null;
  textColor: string;
  primaryColor: string;
  multi?: boolean;
  showPlaceholderWhenNoLogo: boolean;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={
          multi
            ? `${styles.cornerLogo} ${styles.multiCornerLogo}`
            : styles.cornerLogo
        }
      />
    );
  }
  if (!showPlaceholderWhenNoLogo) {
    return (
      <span
        className={
          multi
            ? `${styles.cornerLogoEmpty} ${styles.cornerLogoEmptyMulti}`
            : styles.cornerLogoEmpty
        }
        aria-hidden
      />
    );
  }
  return (
    <span
      className={multi ? `${styles.oneP} ${styles.onePMulti}` : styles.oneP}
      aria-hidden
    >
      <span style={{ color: textColor }}>1</span>
      <span style={{ color: primaryColor }}>P</span>
    </span>
  );
}

function MultiLegalLine({
  accent,
  layout,
  mutedColor,
}: {
  accent: string;
  layout: "mobile" | "desktop";
  mutedColor: string;
}) {
  if (layout === "mobile") {
  return (
      <p className={styles.multiLegal}>
        <span style={{ color: mutedColor }}>
          Нажимая «Оплатить», вы соглашаетесь{" "}
        </span>
        <span style={{ color: accent }}>с условиями</span>
    </p>
  );
}
  return (
    <p className={styles.multiLegal}>
      <span style={{ color: mutedColor }}>
        Оплачивая, вы соглашаетесь с{" "}
      </span>
      <span className={styles.multiLegalAccent} style={{ color: accent }}>
        договором оферты
      </span>
    </p>
  );
}

function MultiFooterRow({
  pciColor,
  mutedColor,
}: {
  pciColor: string;
  mutedColor: string;
}) {
  const footStyle = { color: mutedColor } as const;
  return (
    <div className={styles.multiFooterRow}>
      <div className={styles.multiPci}>
        <div className={styles.multiLockWrap} aria-hidden>
          <svg
            className={styles.multiLockGlyph}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 7V5a4 4 0 118 0v2"
              stroke={pciColor}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <rect
              x="3"
              y="7"
              width="10"
              height="7"
              rx="1.5"
              stroke={pciColor}
              strokeWidth="1.2"
            />
          </svg>
        </div>
        <span className={styles.multiFooterText} style={footStyle}>
          Ваши данные под защитой PCI DSS
        </span>
      </div>
      <span className={styles.multiFooterText} style={footStyle}>
        Осталось {mockPaymentContext.timer}
      </span>
    </div>
  );
}

/** Логотип «сбп» на тёмной кнопке (мультиформа, макет Figma) */
function MultiSbpWordmark() {
  return (
    <span className={styles.multiSbpWordmark} aria-hidden>
      сбп
    </span>
  );
}

function MultiHeaderBlock({
  config,
  appearanceMode,
  amountColor,
  titleTextColor,
  mutedTextColor,
  logoUrl,
  primaryColor,
}: {
  config: FormCustomizationConfig;
  appearanceMode: AppearanceMode;
  amountColor: string;
  titleTextColor: string;
  mutedTextColor: string;
  logoUrl: string | null;
  primaryColor: string;
}) {
  const titleLine = headerTitle(config, appearanceMode);
  const desc = headerDescription(config, appearanceMode);
  return (
    <div className={styles.multiHeaderInner}>
      <div className={styles.multiHeaderTop}>
        <div className={styles.multiAmount} style={{ color: amountColor }}>
          {mockPaymentContext.amountFormatted}
        </div>
        <CornerBrand
          logoUrl={logoUrl}
          textColor={amountColor}
          primaryColor={primaryColor}
          multi
          showPlaceholderWhenNoLogo={config.logoShowPlaceholder !== false}
        />
      </div>
      <div className={styles.multiHeaderMeta}>
        <div
          className={styles.multiMerchant}
          style={{ color: titleTextColor }}
        >
          {titleLine}
        </div>
        <div className={styles.multiDesc} style={{ color: mutedTextColor }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

const SBP_MOBILE_MOCK_BANKS = Array.from({ length: 8 }, () => "Сбербанк");

function splitAmountForSbpHeader(formatted: string): { num: string; cur: string } {
  const t = formatted.trim();
  const m = t.match(/^([\d\s\u00a0.,]+)\s*(.+)?$/);
  if (m) {
    return {
      num: m[1].replace(/\s/g, " ").trim(),
      cur: (m[2] ?? "₽").trim(),
    };
  }
  return { num: t, cur: "" };
}

/** Упрощённый знак СБП (макет 1P): три сегмента как в системном бейдже */
function SbpPaymentSystemBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="26"
      viewBox="0 0 28 26"
      aria-hidden
    >
      <path
        fill="#21A038"
        d="M2 3h16v10H2V3zm3 3v4h10V6H5z"
      />
      <path fill="#EF3124" d="M18 3h8v20h-8l4-10-4-10z" />
      <path fill="#005B99" d="M2 15h14v8H2v-8zm3 2v4h8v-4H5z" />
    </svg>
  );
}

function SbpQrTriggerGlyph({
  color = "#222222",
}: {
  color?: string;
}) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill={color}
        d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm8 2h2v2h-2v-2zm0-4h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-8h2v2h-2V9zm4 0h2v2h-2V9z"
      />
    </svg>
  );
}

function BankRowChevron({ color = "#222222" }: { color?: string }) {
  return (
    <svg
      className={styles.sbpNewRowChevron}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 5l8 7-8 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SbpMobileSearchIcon() {
  return (
    <svg
      className={styles.sbpMobileSearchIcon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM16.5 16.5L21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SbpTBankGlyph() {
  return (
    <div className={styles.sbpMobileTGlyph} aria-hidden>
      <span className={styles.sbpMobileTLetter}>Т</span>
    </div>
  );
}

const QR_DESKTOP_N = 29;
const QR_LOGO_HALF = 5;

/** Модуль 7×7 «глаз» QR (рамка + центр 3×3) */
function finderModule(localR: number, localC: number): boolean {
  if (localR < 0 || localR > 6 || localC < 0 || localC > 6) return false;
  const onBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
  if (onBorder) return true;
  const center3 = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
  return center3;
}

function FakeQrDesktop({
  logoUrl,
  primaryColor,
  multiTextColor,
  qrDarkModule,
  qrLightModule,
  badgeRadius,
  showPlaceholderWhenNoLogo,
}: {
  logoUrl: string | null;
  primaryColor: string;
  multiTextColor: string;
  qrDarkModule: string;
  qrLightModule: string;
  badgeRadius: number;
  showPlaceholderWhenNoLogo: boolean;
}) {
  const n = QR_DESKTOP_N;
  const mid = (n - 1) / 2;
  const cells: ReactNode[] = [];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      const inLogo =
        Math.abs(r - mid) < QR_LOGO_HALF && Math.abs(c - mid) < QR_LOGO_HALF;
      let dark = false;
      if (inLogo) {
        dark = false;
      } else if (r < 7 && c < 7) {
        dark = finderModule(r, c);
      } else if (r < 7 && c >= n - 7) {
        dark = finderModule(r, c - (n - 7));
      } else if (r >= n - 7 && c < 7) {
        dark = finderModule(r - (n - 7), c);
      } else {
        dark = (r * 17 + c * 31 + ((r * c) % 7)) % 3 !== 0;
      }
      cells.push(
        <div
          key={`${r}-${c}`}
          className={styles.qrDesktopCell}
          style={{ background: dark ? qrDarkModule : qrLightModule }}
        />,
      );
    }
  }
  const showBadge = Boolean(logoUrl) || showPlaceholderWhenNoLogo;

  return (
    <div className={styles.qrDesktopWrap}>
      <div className={styles.qrDesktopGrid}>{cells}</div>
      {showBadge ? (
        <div
          className={styles.qrDesktopBadge}
          style={{ borderRadius: `${badgeRadius}px` }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className={styles.qrDesktopBadgeImg} />
          ) : (
            <span className={styles.qrDesktopBadgeMark} aria-hidden>
              <span style={{ color: multiTextColor }}>1</span>
              <span style={{ color: primaryColor }}>P</span>
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SbpQrModal({
  open,
  onClose,
  config,
  appearanceMode,
  primaryColor,
  multiTextColor,
  mutedColor,
  qrDarkModule,
  qrLightModule,
  badgeRadius,
}: {
  open: boolean;
  onClose: () => void;
  config: FormCustomizationConfig;
  appearanceMode: AppearanceMode;
  primaryColor: string;
  multiTextColor: string;
  mutedColor: string;
  qrDarkModule: string;
  qrLightModule: string;
  badgeRadius: number;
}) {
  if (!open) return null;
  const titleLine = headerTitle(config, appearanceMode);
  const desc = headerDescription(config, appearanceMode);
  const { num, cur } = splitAmountForSbpHeader(mockPaymentContext.amountFormatted);
  return (
    <div
      className={styles.sbpQrModalRoot}
      role="dialog"
      aria-modal="true"
      aria-label="QR-код для оплаты"
    >
      <button
        type="button"
        className={styles.sbpQrModalBackdrop}
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className={styles.sbpQrModalPanel}>
        <div className={styles.sbpQrModalHeader}>
          <div className={styles.sbpQrModalHeaderText}>
            <p className={styles.sbpQrModalAmount} style={{ color: multiTextColor }}>
              <span className={styles.sbpQrModalAmountNum}>{num}</span>
              {cur ? (
                <span className={styles.sbpQrModalAmountCur}>{` ${cur}`}</span>
              ) : null}
            </p>
            <p className={styles.sbpQrModalMerchant} style={{ color: multiTextColor }}>
              {titleLine}
            </p>
            <p className={styles.sbpQrModalDesc} style={{ color: mutedColor }}>
              {desc}
            </p>
          </div>
          <button
            type="button"
            className={styles.sbpQrModalClose}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke={mutedColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className={styles.sbpQrModalQr}>
          <FakeQrDesktop
            logoUrl={config.logoDataUrl}
            primaryColor={primaryColor}
            multiTextColor={multiTextColor}
            qrDarkModule={qrDarkModule}
            qrLightModule={qrLightModule}
            badgeRadius={badgeRadius}
            showPlaceholderWhenNoLogo={config.logoShowPlaceholder !== false}
          />
        </div>
      </div>
    </div>
  );
}

function SbpDesktopOrderHeader({
  config,
  appearanceMode,
  amountColor,
  merchantColor,
  descColor,
}: {
  config: FormCustomizationConfig;
  appearanceMode: AppearanceMode;
  amountColor: string;
  merchantColor: string;
  descColor: string;
}) {
  const titleLine = headerTitle(config, appearanceMode);
  const desc = headerDescription(config, appearanceMode);
  return (
    <div className={styles.sbpDesktopHeaderRow}>
      <div className={styles.sbpDesktopHeaderCol}>
        <div className={styles.sbpDesktopAmount} style={{ color: amountColor }}>
          {mockPaymentContext.amountFormatted}
        </div>
        <div className={styles.sbpDesktopMeta}>
          <div
            className={styles.sbpDesktopMerchant}
            style={{ color: merchantColor }}
          >
            {titleLine}
          </div>
          <div className={styles.sbpDesktopDesc} style={{ color: descColor }}>
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusGlyph({
  kind,
  color,
}: {
  kind: PaymentStatusKind;
  color: string;
}) {
  const size = 46;
  switch (kind) {
    case "success":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M5 13l4 4L19 7"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "failure":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "processing":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M12 3a9 9 0 019 9"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "expired":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
          <path
            d="M12 8v4l2.5 1.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function MockStatusScreen({
  theme,
  device,
  embedded,
  statusKind,
  interactive,
  onNavigateToForm,
}: {
  theme: PreviewTheme;
  device: "desktop" | "mobile";
  embedded?: boolean;
  statusKind: PaymentStatusKind;
  interactive?: boolean;
  onNavigateToForm?: () => void;
}) {
  const st = theme.variant.statuses[statusKind];
  const title =
    st.title.trim() ||
    "Заголовок из API (title), если не задан в кастомизации";
  const description =
    st.description.trim() ||
    "Описание из API (description), если не задано в кастомизации";
  const isMobile = device === "mobile";
  const font = fontStackFor(theme.fontFamily);
  const baseRadius = resolveDraftBorderRadius(theme.borderRadius);
  const rStack = computeStackedCanvasFormRadii(baseRadius);
  const statusPanelR = rStack.rSection;
  const statusControlR = rStack.rControlPad24;
  const statusCtaR = rStack.rControlPad24;
  const shellBg = theme.appearanceMode === "dark" ? "#1E1E1E" : "#FFFFFF";

  const wrapStyle = {
    fontFamily: font,
    color: theme.variant.textColor,
    ...rStack.cssVars,
    ...legacyPfRadiusVars(
      rStack.rForm,
      rStack.rSection,
      rStack.rControlPad24,
    ),
    ["--pay-btn-radius" as string]: `${statusCtaR}px`,
  } as CSSProperties;

  return (
    <div
      className={[viewportCls(embedded, isMobile), styles.statusViewport]
        .filter(Boolean)
        .join(" ")}
      style={wrapStyle}
    >
      <div
        className={[gradCls(embedded), styles.statusGrad].filter(Boolean).join(" ")}
        style={{
          fontFamily: font,
          backgroundColor: "transparent",
          borderRadius: `${rStack.rForm}px`,
        }}
      >
        <div className={styles.statusStack}>
          <MultiBackLink
            onNavigate={
              interactive ? onNavigateToForm : undefined
            }
          />
          <div
            className={styles.statusCard}
              style={{
                background: shellBg,
                borderRadius: `${statusPanelR}px`,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
              }}
            >
            <div className={styles.statusInner}>
              <div
                className={styles.statusIconRing}
                style={{ background: st.iconBackdropColor }}
              >
                <StatusGlyph kind={statusKind} color={st.iconColor} />
              </div>
              <h2
                className={styles.statusTitle}
                style={{ color: st.titleColor }}
              >
                {title}
              </h2>
              <p
                className={styles.statusDesc}
                style={{ color: st.descriptionColor }}
              >
                {description}
              </p>
              <div
                className={styles.statusDetails}
                style={{
                  background: st.detailsCardBg,
                  borderRadius: `${statusControlR}px`,
                }}
              >
                <div className={styles.statusRow}>
                  <span style={{ color: st.detailsLabelColor }}>Сумма</span>
                  <span style={{ color: st.detailsValueColor }}>
                    {mockPaymentContext.amountFormatted}
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span style={{ color: st.detailsLabelColor }}>
                    Метод оплаты
                  </span>
                  <span style={{ color: st.detailsValueColor }}>СБП</span>
                </div>
                <div className={styles.statusRow}>
                  <span style={{ color: st.detailsLabelColor }}>
                    Дата оплаты
                  </span>
                  <span style={{ color: st.detailsValueColor }}>
                    17 марта 2026 в 13:23
                  </span>
                </div>
                <div className={styles.statusRow}>
                  <span style={{ color: st.detailsLabelColor }}>
                    Транзакция
                  </span>
                  <span
                    className={styles.statusTx}
                    style={{ color: st.detailsValueColor }}
                  >
                    58oCHjIXS6aSm48EIRknKdiDE96hs3xG
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.statusCta}
            style={{
              background: st.ctaBackground,
            }}
          >
            <span style={{ color: st.ctaTextColor }}>{st.ctaLabel}</span>
            <span style={{ color: st.ctaMutedColor }}>(8 сек)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function MockPaymentForm({
  theme,
  config,
  device,
  embedded,
  previewScreen,
  interactive,
  onDemoPay,
  onDemoNavigateToForm,
}: Props) {
  const screen = previewScreen ?? "form";
  const appearanceMode = theme.appearanceMode;
  const sbpStyle = theme.variant.sbp;
  const [sbpQrOpen, setSbpQrOpen] = useState(false);
  const isMobile = device === "mobile";

  const [demoPan, setDemoPan] = useState(() => defaultDemoPan(isMobile));
  const [demoMm, setDemoMm] = useState(() => defaultDemoMm(isMobile));
  const [demoYy, setDemoYy] = useState(() => defaultDemoYy(isMobile));
  const [demoCvv, setDemoCvv] = useState(() => defaultDemoCvv(isMobile));

  useEffect(() => {
    setDemoPan(defaultDemoPan(isMobile));
    setDemoMm(defaultDemoMm(isMobile));
    setDemoYy(defaultDemoYy(isMobile));
    setDemoCvv(defaultDemoCvv(isMobile));
  }, [isMobile]);

  const {
    effectiveTextColor: text,
    effectiveMutedTextColor: muted,
    effectiveSubtleTextColor: subtle,
    effectivePrimaryColor: primary,
    effectiveHoverColor: hover,
    effectiveActiveColor: active,
    effectiveGradientStart: g0,
    effectiveGradientEnd: g1,
    effectiveCardBackground: cardBg,
    effectiveCardBorderColor: cardBorder,
    effectiveOnPrimaryTextColor: onPrimaryText,
    effectiveInputBorderColor: inputBorder,
    effectiveInputFillColor: inputFill,
    fontFamily,
    logoDataUrl,
  } = theme;

  const multiText = text;

  if (screen !== "form") {
    return (
      <MockStatusScreen
        theme={theme}
        device={device}
        embedded={embedded}
        statusKind={screen}
        interactive={interactive}
        onNavigateToForm={onDemoNavigateToForm}
      />
    );
  }

  const font = fontStackFor(fontFamily);
  const baseRadius = resolveDraftBorderRadius(theme.borderRadius);
  const rSingle = computeSingleCardFormRadii(baseRadius);
  const rStack = computeStackedCanvasFormRadii(baseRadius);
  const rSbpDesk = computeSbpDesktopFormRadii(baseRadius);

  const btnLabel = resolveButtonLabel(
    theme.variant.buttonText,
    mockPaymentContext.amountShort,
  );

  const wrapStyleBase = {
    fontFamily: font,
    ["--pf-text" as string]: text,
    ["--pf-muted" as string]: muted,
    ["--pf-subtle" as string]: subtle,
    ["--pf-primary" as string]: primary,
    ["--pf-hover" as string]: hover,
    ["--pf-active" as string]: active,
    ["--pf-card" as string]: cardBg,
  } as CSSProperties;

  const cardChrome =
    cardBorder.trim().toUpperCase() === cardBg.trim().toUpperCase()
      ? {}
      : ({ border: `1px solid ${cardBorder}` } as const);

  if (config.formType === "sbp") {
    if (isMobile) {
      const sbpMobilePanelR = rStack.rSection;
      const sbpMobileCtrlR = rStack.rControlPad24;
      const sbpMobileBankLogoR =
        sbpMobileBankLogoSlotRadiusPx(sbpMobileCtrlR);
      const sbpMobilePayBtnR = rStack.rControlPad24;
      const sbpMobileWrap = {
        ...wrapStyleBase,
        color: multiText,
        ...rStack.cssVars,
        ...legacyPfRadiusVars(
          rStack.rForm,
          rStack.rSection,
          rStack.rControlPad24,
        ),
        ["--pay-btn-radius" as string]: `${sbpMobilePayBtnR}px`,
      } as CSSProperties;

      const { num, cur } = splitAmountForSbpHeader(
        mockPaymentContext.amountFormatted,
      );
      const sbpTitle = headerTitle(config, appearanceMode);
      const sbpDesc = headerDescription(config, appearanceMode);

      return (
        <div
          className={[viewportCls(embedded, isMobile), styles.sbpMobileViewport]
            .filter(Boolean)
            .join(" ")}
          style={sbpMobileWrap}
        >
          <div
            className={[gradCls(embedded), styles.sbpMobileGrad]
              .filter(Boolean)
              .join(" ")}
            style={{
              backgroundColor: "transparent",
              borderRadius: `${rStack.rForm}px`,
            }}
          >
            <div className={styles.sbpMobileColumn}>
              <MultiBackLink compact />
              <div className={styles.sbpNewStack}>
                <div
                  className={styles.sbpNewTopCard}
                  style={{
                    background: cardBg,
                    borderRadius: `${sbpMobilePanelR}px`,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                    ...cardChrome,
                  }}
                >
                  <div className={styles.sbpNewAmountRow}>
                    <p
                      className={styles.sbpNewAmountBig}
                      style={{ color: multiText }}
                    >
                      <span>{num}</span>
                      {cur ? (
                        <span className={styles.sbpNewAmountCurrency}>
                          {` ${cur}`}
                        </span>
                      ) : null}
                    </p>
                    <div className={styles.sbpNewHeaderBrand}>
                      <CornerBrand
                      logoUrl={logoDataUrl}
                        textColor={multiText}
                      primaryColor={primary}
                        showPlaceholderWhenNoLogo={
                          config.logoShowPlaceholder !== false
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.sbpNewOrderMeta}>
                    <p
                      className={styles.sbpNewMerchant}
                      style={{ color: multiText }}
                    >
                      {sbpTitle}
                    </p>
                    <p className={styles.sbpNewDesc} style={{ color: muted }}>
                      {sbpDesc}
                    </p>
                  </div>
                </div>
                <div
                  className={styles.sbpNewMainCard}
                  style={{
                    background: cardBg,
                    borderRadius: `${sbpMobilePanelR}px`,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                    ...cardChrome,
                  }}
                >
                  <div className={styles.sbpNewSearchRow}>
                    <div
                      className={styles.sbpNewSearch}
                      role="search"
                      aria-label="Поиск банка"
                      style={{
                        borderRadius: `${sbpMobileCtrlR}px`,
                        background: sbpStyle.searchFieldBg,
                      }}
                    >
                      <SbpMobileSearchIcon />
                      <span className={styles.sbpNewSearchPlaceholder}>
                        {sbpStyle.bankSearchPlaceholder}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.sbpNewQrBtn}
                      style={{
                        borderRadius: `${sbpMobileCtrlR}px`,
                        background: sbpStyle.searchFieldBg,
                      }}
                      aria-label="Показать QR-код"
                      onClick={() => setSbpQrOpen(true)}
                    >
                      <SbpQrTriggerGlyph color={multiText} />
                    </button>
                  </div>
                  <div className={styles.sbpNewBankList}>
                      {SBP_MOBILE_MOCK_BANKS.map((name, i) => (
                        <button
                          key={`${name}-${i}`}
                          type="button"
                        className={styles.sbpNewBankRow}
                        style={{
                          borderRadius: `${sbpMobileCtrlR}px`,
                          background: sbpStyle.bankRowBg,
                          border: `1px solid ${sbpStyle.bankRowBorder}`,
                        }}
                      >
                        <div className={styles.sbpNewBankLeft}>
                          <div
                            className={styles.sbpNewBankLogoSlot}
                            style={{
                              borderRadius: `${sbpMobileBankLogoR}px`,
                              background:
                                appearanceMode === "dark"
                                  ? sbpStyle.bankRowBg
                                  : "#FFFFFF",
                            }}
                          >
                              <SbpTBankGlyph />
                          </div>
                          <span
                            className={styles.sbpNewBankName}
                            style={{ color: multiText }}
                          >
                            {name}
                          </span>
                        </div>
                        <BankRowChevron color={multiText} />
                        </button>
                      ))}
                    </div>
                  {interactive ? (
                    <div className={styles.sbpDemoBar}>
                      <button
                        type="button"
                        className={styles.sbpDemoPayBtn}
                        style={{
                          background: primary,
                          color: onPrimaryText,
                          ["--btn-hover" as string]: hover,
                          ["--btn-active" as string]: active,
                        }}
                        onClick={() => onDemoPay?.()}
                      >
                        Демо: перейти к статусу
                      </button>
                  </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <SbpQrModal
            open={sbpQrOpen}
            onClose={() => setSbpQrOpen(false)}
            config={config}
            appearanceMode={appearanceMode}
            primaryColor={primary}
            multiTextColor={multiText}
            mutedColor={muted}
            qrDarkModule={sbpStyle.qrDarkModule}
            qrLightModule={sbpStyle.qrLightModule}
            badgeRadius={rStack.rControlPad24}
          />
        </div>
      );
    }

    const sbpDeskPayBtnR = rSbpDesk.rQrBadge;
    const sbpDeskWrap = {
      ...wrapStyleBase,
      color: multiText,
      ...rSbpDesk.cssVars,
      ...legacyPfRadiusVars(
        rSbpDesk.rForm,
        rSbpDesk.rSection,
        rSbpDesk.rQrBadge,
      ),
      ["--pay-btn-radius" as string]: `${sbpDeskPayBtnR}px`,
    } as CSSProperties;

    return (
      <div
        className={[viewportCls(embedded, isMobile), styles.sbpDesktopViewport]
          .filter(Boolean)
          .join(" ")}
        style={sbpDeskWrap}
      >
        <div
          className={[gradCls(embedded), styles.sbpDesktopPage]
            .filter(Boolean)
            .join(" ")}
          style={{
            backgroundColor: "transparent",
            borderRadius: `${rSbpDesk.rForm}px`,
          }}
        >
          <div className={styles.sbpDesktopColumn}>
            <MultiBackLink />
            <div
              className={styles.sbpDesktopCard}
              style={{
                background: cardBg,
                borderRadius: `${rSbpDesk.rSection}px`,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                ...cardChrome,
              }}
            >
              <div className={styles.sbpDesktopCardBlobs} aria-hidden>
                <div
                  className={`${styles.sbpDesktopBlobInner} ${styles.sbpDesktopBlobInnerBl}`}
                  style={{ background: rgbaFromHex(g0, 0.14) }}
                />
                <div
                  className={`${styles.sbpDesktopBlobInner} ${styles.sbpDesktopBlobInnerTr}`}
                  style={{ background: rgbaFromHex(g1, 0.14) }}
                />
              </div>
              <div className={styles.sbpDesktopCardContent}>
                <SbpDesktopOrderHeader
                  config={config}
                  appearanceMode={appearanceMode}
                  amountColor={text}
                  merchantColor={text}
                  descColor={muted}
                />
                <div className={styles.sbpDesktopQrStack}>
                  <button
                    type="button"
                    className={styles.sbpDesktopQrOpen}
                    aria-label="Показать QR-код крупно"
                    onClick={() => setSbpQrOpen(true)}
                  >
                  <FakeQrDesktop
                    logoUrl={logoDataUrl}
                    primaryColor={primary}
                      multiTextColor={multiText}
                      qrDarkModule={sbpStyle.qrDarkModule}
                      qrLightModule={sbpStyle.qrLightModule}
                    badgeRadius={rSbpDesk.rQrBadge}
                    showPlaceholderWhenNoLogo={
                      config.logoShowPlaceholder !== false
                    }
                  />
                  </button>
                  <div className={styles.sbpDesktopQrTextCol}>
                    <div className={styles.sbpDesktopQrCopy}>
                      <p
                        className={styles.sbpDesktopQrTitle}
                        style={{ color: text }}
                      >
                        {sbpStyle.instructionTitle}
                      </p>
                      <p
                        className={styles.sbpDesktopQrSub}
                        style={{ color: muted }}
                      >
                        {sbpStyle.instructionText}
                      </p>
                    </div>
                    <MultiLegalLine
                      accent={primary}
                      layout="desktop"
                      mutedColor={muted}
                    />
                  </div>
                </div>
                {interactive ? (
                  <div className={styles.sbpDemoBarDesktop}>
                    <button
                      type="button"
                      className={styles.sbpDemoPayBtn}
                      style={{
                        background: primary,
                        color: onPrimaryText,
                        ["--btn-hover" as string]: hover,
                        ["--btn-active" as string]: active,
                      }}
                      onClick={() => onDemoPay?.()}
                    >
                      Демо: перейти к статусу
                    </button>
                  </div>
                ) : null}
                <div className={styles.sbpDesktopDivider} />
                <MultiFooterRow pciColor={primary} mutedColor={muted} />
              </div>
            </div>
          </div>
        </div>
        <SbpQrModal
          open={sbpQrOpen}
          onClose={() => setSbpQrOpen(false)}
          config={config}
          appearanceMode={appearanceMode}
          primaryColor={primary}
          multiTextColor={multiText}
          mutedColor={muted}
          qrDarkModule={sbpStyle.qrDarkModule}
          qrLightModule={sbpStyle.qrLightModule}
          badgeRadius={rSbpDesk.rQrBadge}
        />
      </div>
    );
  }

  if (config.formType === "card") {
    const singleFieldR = rSingle.rControl;
    const singlePayBtnR = rSingle.rControl;
    const cardWrapStyle = {
      ...wrapStyleBase,
      ...rSingle.cssVars,
      ...legacyPfRadiusVars(
        rSingle.rForm,
        rSingle.rSection,
        rSingle.rControl,
      ),
      ["--pay-btn-radius" as string]: `${singlePayBtnR}px`,
    } as CSSProperties;
    const { num: amountNum, cur: amountCur } = splitAmountForSbpHeader(
      mockPaymentContext.amountFormatted,
    );
    const cardTitleLine = headerTitle(config, appearanceMode);
    const cardDescLine = headerDescription(config, appearanceMode);

    const qMarkShell =
      appearanceMode === "dark"
        ? {
            background: "rgba(255,255,255,0.06)",
            color: subtle,
          }
        : {
            background: "rgba(0,0,0,0.05)",
            color: subtle,
          };

    return (
      <div className={viewportCls(embedded, isMobile)} style={cardWrapStyle}>
        <div
          className={gradCls(embedded)}
          style={{ backgroundColor: "transparent" }}
        >
          <div className={styles.singleStack}>
            <SingleCardBackLink color={muted} />
            <div
              className={styles.oneCard}
              style={{
                background: cardBg,
                borderRadius: `${rSingle.rForm}px`,
                color: text,
                boxShadow:
                  "0 0 3px rgba(0,0,0,0.05), 0 12px 56px rgba(0,0,0,0.08)",
                ...cardChrome,
              }}
            >
              <div
                className={styles.singleCardInner}
                style={{ padding: D_SINGLE_CARD_CONTENT_PAD }}
              >
                <div className={styles.singleCardHead}>
                  <div className={styles.singleCardHeadRow}>
                    <div className={styles.singleCardHeadText}>
                      <p
                        className={styles.singleCardMerchant}
                        style={{ color: muted }}
                      >
                        {cardTitleLine}
                      </p>
                      <p
                        className={styles.singleCardAmount}
                        style={{ color: text }}
                      >
                        <span className={styles.singleCardAmountNum}>
                          {amountNum}
                        </span>
                        {amountCur ? (
                          <span className={styles.singleCardAmountCur}>
                            {` ${amountCur}`}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className={styles.singleCardCorner}>
                      <CornerBrand
                  logoUrl={logoDataUrl}
                        textColor={text}
                  primaryColor={primary}
                        showPlaceholderWhenNoLogo={
                          config.logoShowPlaceholder !== false
                        }
                      />
                    </div>
                  </div>
                  <p
                    className={styles.singleCardDesc}
                    style={{ color: muted }}
                  >
                    {cardDescLine}
                  </p>
                </div>

                <div className={styles.singleCardFields}>
                  <div className={styles.singleCardField}>
                  <label
                      className={styles.singleCardLabel}
                      style={{ color: muted }}
                  >
                    Номер карты
                  </label>
                  <div
                      className={styles.singleCardPan}
                    style={{
                        borderRadius: `${singleFieldR}px`,
                        borderColor: inputBorder,
                        background: inputFill,
                        color: text,
                      }}
                    >
                      {interactive ? (
                        <input
                          className={styles.singleCardPanInput}
                          style={{ borderRadius: singleFieldR }}
                          value={demoPan}
                          onChange={(e) => setDemoPan(e.target.value)}
                          autoComplete="off"
                          inputMode="numeric"
                          aria-label="Номер карты"
                        />
                      ) : (
                        <span className={styles.singleCardPanDigits}>
                          2242 4234 4325 4535
                        </span>
                      )}
                      <span
                        className={styles.singleCardMir}
                        style={{ color: primary }}
                      >
                      МИР
                    </span>
                  </div>
                </div>

                  <div className={styles.singleCardRow2}>
                    <div className={styles.singleCardCol}>
                    <label
                        className={styles.singleCardLabel}
                        style={{ color: muted }}
                    >
                        Годен до:
                    </label>
                      <div className={styles.singleCardExpRow}>
                      <div
                          className={styles.singleCardExpCell}
                        style={{
                            borderRadius: `${singleFieldR}px`,
                            borderColor: inputBorder,
                            background: inputFill,
                            color: subtle,
                          }}
                        >
                          {interactive ? (
                            <input
                              className={styles.singleCardExpInput}
                              style={{ borderRadius: singleFieldR }}
                              value={demoMm}
                              onChange={(e) => setDemoMm(e.target.value)}
                              autoComplete="off"
                              inputMode="numeric"
                              maxLength={2}
                              aria-label="Месяц"
                            />
                          ) : (
                            "ММ"
                          )}
                      </div>
                      <span
                          className={styles.singleCardSlash}
                          style={{ color: subtle }}
                      >
                        /
                      </span>
                      <div
                          className={styles.singleCardExpCell}
                        style={{
                            borderRadius: `${singleFieldR}px`,
                            borderColor: inputBorder,
                            background: inputFill,
                            color: subtle,
                          }}
                        >
                          {interactive ? (
                            <input
                              className={styles.singleCardExpInput}
                              style={{ borderRadius: singleFieldR }}
                              value={demoYy}
                              onChange={(e) => setDemoYy(e.target.value)}
                              autoComplete="off"
                              inputMode="numeric"
                              maxLength={2}
                              aria-label="Год"
                            />
                          ) : (
                            "ГГ"
                          )}
                      </div>
                    </div>
                  </div>
                    <div className={styles.singleCardCol}>
                    <label
                        className={styles.singleCardLabel}
                        style={{ color: muted }}
                    >
                        CVV / CVC
                    </label>
                    <div
                        className={styles.singleCardCvv}
                      style={{
                          borderRadius: `${singleFieldR}px`,
                          borderColor: inputBorder,
                          background: inputFill,
                          color: subtle,
                        }}
                      >
                        {interactive ? (
                          <input
                            className={styles.singleCardCvvInput}
                            style={{ borderRadius: singleFieldR }}
                            value={demoCvv}
                            onChange={(e) => setDemoCvv(e.target.value)}
                            autoComplete="off"
                            inputMode="numeric"
                            maxLength={4}
                            aria-label="CVV / CVC"
                          />
                        ) : (
                      <span>CVV</span>
                        )}
                        <span
                          className={styles.singleCardQMark}
                          style={qMarkShell}
                        >
                          ?
                        </span>
                    </div>
                  </div>
                </div>
                </div>

                <div className={styles.singleCardCta}>
                <button
                  type="button"
                    className={[
                      styles.singleCardPayBtn,
                      interactive ? styles.payBtnInteractive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  style={
                    {
                      background: primary,
                        color: onPrimaryText,
                      ["--btn-hover" as string]: hover,
                      ["--btn-active" as string]: active,
                    } as CSSProperties
                  }
                    onClick={interactive ? () => onDemoPay?.() : undefined}
                >
                  {btnLabel}
                </button>
                  <SingleCardLegalLine accent={primary} mutedColor={muted} />
                  <SingleCardFooterRow pciColor={primary} mutedColor={muted} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const m = config.multiformMethods;
  const showQuick = m.sbpQuick || m.payQuick;
  const showCard = m.card;
  const legalOnCard = showCard ? "card" : showQuick ? "quick" : "header";
  const legalLayout = isMobile ? "mobile" : "desktop";

  const multiPanelR = rStack.rSection;
  const multiFieldR = rStack.rControlPad24;
  const multiBtnR = rStack.rControlPad24;

  const multiWrapStyle = {
    ...wrapStyleBase,
    color: multiText,
    ...rStack.cssVars,
    ...legacyPfRadiusVars(
      rStack.rForm,
      rStack.rSection,
      rStack.rControlPad24,
    ),
    ["--pay-btn-radius" as string]: `${multiBtnR}px`,
  } as CSSProperties;

  const cardTopShell = {
    background: cardBg,
    borderRadius: `${multiPanelR}px`,
    color: multiText,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
    ...cardChrome,
  } as const;

  const cardFormShell = {
    background: cardBg,
    borderRadius: `${multiPanelR}px`,
    color: multiText,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
    ...cardChrome,
  } as const;

  const multiFieldShell = {
    borderRadius: `${multiFieldR}px`,
    background: inputFill,
    border: `1px solid ${inputBorder}`,
    boxSizing: "border-box" as const,
  } as const;

  const cardNumLine = interactive
    ? demoPan
    : isMobile
      ? "0000 0000 0000 0000"
      : "4222 3333 4444 5555";
  const expL = interactive ? demoMm : isMobile ? "00" : "04";
  const expR = interactive ? demoYy : isMobile ? "00" : "30";
  const cvvDemo = interactive ? demoCvv : isMobile ? "123" : "333";

  return (
    <div
      className={[viewportCls(embedded, isMobile), styles.multiViewport]
        .filter(Boolean)
        .join(" ")}
      style={multiWrapStyle}
    >
      <div
        className={[gradCls(embedded), styles.multiGradCanvas]
          .filter(Boolean)
          .join(" ")}
        style={{
          backgroundColor: "transparent",
          borderRadius: `${rStack.rForm}px`,
        }}
      >
        <div className={styles.multiStack}>
          <MultiBackLink compact={isMobile} />
          <div
            className={[
              styles.multiCardChain,
              isMobile ? styles.multiCardChainMobile : styles.multiCardChainDesktop,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div
              className={`${styles.panel} ${styles.multiPanel}`}
              style={cardTopShell}
            >
              <div className={styles.multiPadHeader}>
                <MultiHeaderBlock
                  config={config}
                  appearanceMode={appearanceMode}
                  amountColor={text}
                  titleTextColor={text}
                  mutedTextColor={muted}
                  logoUrl={logoDataUrl}
                  primaryColor={primary}
                />
                {legalOnCard === "header" ? (
                  <div className={styles.multiHeaderFooter}>
                    <MultiLegalLine
                      accent={primary}
                      layout={legalLayout}
                      mutedColor={muted}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            {showQuick ? (
              <div
                className={`${styles.panel} ${styles.multiPanel}`}
                style={cardTopShell}
              >
                <div
                  className={[
                    styles.multiPadQuick,
                    isMobile
                      ? styles.multiPadQuickMobile
                      : styles.multiPadQuickDesktop,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div
                    className={styles.multiSectionTitle}
                    style={{ color: text }}
                  >
                    Быстрая оплата
                  </div>
                  <div className={styles.multiQuickCol}>
                    {m.sbpQuick ? (
                      <button
                        type="button"
                        className={styles.multiSbpBtn}
                        style={{
                          background: MULTI_SBP_BG,
                        }}
                        aria-label="Оплата через СБП"
                      >
                        <SbpPaymentSystemBadge
                          className={styles.multiSbpBadge}
                        />
                        <MultiSbpWordmark />
                      </button>
                    ) : null}
                    {m.payQuick ? (
                      <button
                        type="button"
                        className={styles.multiPayQuick}
                        aria-label="Оплата через СберPay"
                      >
                        <span className={styles.payIcon} aria-hidden />
                        <span>Pay</span>
                      </button>
                    ) : null}
                  </div>
                  {legalOnCard === "quick" ? (
                    <div className={styles.multiQuickFooter}>
                      <MultiLegalLine
                        accent={primary}
                        layout={legalLayout}
                        mutedColor={muted}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {interactive && showQuick && !showCard ? (
              <div
                className={`${styles.panel} ${styles.multiPanel}`}
                style={cardTopShell}
              >
                <div
                  className={[
                    styles.multiPadQuick,
                    isMobile
                      ? styles.multiPadQuickMobile
                      : styles.multiPadQuickDesktop,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className={[
                      styles.multiSubmitBtn,
                      styles.payBtnInteractive,
                    ].join(" ")}
                    style={
                      {
                        background: primary,
                        color: onPrimaryText,
                        ["--btn-hover" as string]: hover,
                        ["--btn-active" as string]: active,
                      } as CSSProperties
                    }
                    onClick={() => onDemoPay?.()}
                  >
                    Демо: перейти к статусу
                  </button>
                </div>
              </div>
            ) : null}

            {showCard ? (
              <div
                className={`${styles.panel} ${styles.multiPanel}`}
                style={cardFormShell}
              >
                <div
                  className={[
                    styles.multiPadForm,
                    isMobile
                      ? styles.multiPadFormMobile
                      : styles.multiPadFormDesktop,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.multiFormFields}>
                    <div
                      className={styles.multiSectionTitle}
                      style={{ color: text }}
                    >
                      Оплата картой
                    </div>
                    <div className={styles.multiFieldsCol}>
                      <div className={styles.multiField}>
                        <label
                          className={styles.multiLabel}
                          style={{ color: muted }}
                        >
                          Номер
                        </label>
                        <div
                          className={styles.multiInputRow}
                          style={multiFieldShell}
                        >
                          {interactive ? (
                            <input
                              className={[
                                styles.multiDemoInput,
                                styles.multiInputText,
                                isMobile ? styles.multiInputGhost : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                          style={{
                                borderRadius: multiFieldR,
                                ...(isMobile ? {} : { color: text }),
                              }}
                              value={demoPan}
                              onChange={(e) => setDemoPan(e.target.value)}
                              autoComplete="off"
                              inputMode="numeric"
                              aria-label="Номер карты"
                            />
                          ) : (
                            <span
                              className={[
                                styles.multiInputText,
                                isMobile ? styles.multiInputGhost : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={isMobile ? undefined : { color: text }}
                            >
                              {cardNumLine}
                          </span>
                          )}
                          <span
                            className={`${styles.mir} ${styles.multiMirBadge}`}
                            style={{ color: primary }}
                          >
                            МИР
                          </span>
                        </div>
                      </div>
                      <div className={styles.multiRow2}>
                        <div className={styles.multiField}>
                          <label
                            className={[
                              styles.multiLabel,
                              isMobile ? styles.multiExpiryLabel : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            style={{ color: muted }}
                          >
                            Срок действия
                          </label>
                          <div
                            className={styles.multiExpCombined}
                            style={multiFieldShell}
                          >
                            {interactive ? (
                              <>
                                <input
                                  className={[
                                    styles.multiDemoInput,
                                    styles.multiInputText,
                                    isMobile ? styles.multiInputGhost : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                            style={{
                                borderRadius: multiFieldR,
                                ...(isMobile ? {} : { color: text }),
                              }}
                                  value={demoMm}
                                  onChange={(e) => setDemoMm(e.target.value)}
                                  autoComplete="off"
                                  inputMode="numeric"
                                  maxLength={2}
                                  aria-label="Месяц"
                                />
                                <span
                                  className={styles.multiExpSlash}
                                  style={{ color: subtle }}
                                >
                                  /
                                </span>
                                <input
                                  className={[
                                    styles.multiDemoInput,
                                    styles.multiInputText,
                                    isMobile ? styles.multiInputGhost : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  style={{
                                borderRadius: multiFieldR,
                                ...(isMobile ? {} : { color: text }),
                              }}
                                  value={demoYy}
                                  onChange={(e) => setDemoYy(e.target.value)}
                                  autoComplete="off"
                                  inputMode="numeric"
                                  maxLength={2}
                                  aria-label="Год"
                                />
                              </>
                            ) : (
                              <>
                                <span
                                  className={[
                                    styles.multiInputText,
                                    isMobile ? styles.multiInputGhost : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  style={isMobile ? undefined : { color: text }}
                                >
                                  {expL}
                                </span>
                                <span
                                  className={styles.multiExpSlash}
                                  style={{ color: subtle }}
                                >
                                  /
                                </span>
                                <span
                                  className={[
                                    styles.multiInputText,
                                    isMobile ? styles.multiInputGhost : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  style={isMobile ? undefined : { color: text }}
                                >
                                  {expR}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={styles.multiField}>
                          <label
                            className={styles.multiLabel}
                            style={{ color: muted }}
                          >
                            CVV / CVC
                          </label>
                          <div
                            className={styles.multiInputRow}
                            style={multiFieldShell}
                          >
                            {interactive ? (
                              <input
                                className={[
                                  styles.multiDemoInput,
                                  styles.multiInputText,
                                  isMobile ? styles.multiInputGhost : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                            style={{
                                borderRadius: multiFieldR,
                                ...(isMobile ? {} : { color: text }),
                              }}
                                value={demoCvv}
                                onChange={(e) => setDemoCvv(e.target.value)}
                                autoComplete="off"
                                inputMode="numeric"
                                maxLength={4}
                                aria-label="CVV / CVC"
                              />
                            ) : (
                              <span
                                className={[
                                  styles.multiInputText,
                                  isMobile ? styles.multiInputGhost : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                style={isMobile ? undefined : { color: text }}
                              >
                                {cvvDemo}
                              </span>
                            )}
                            <span
                              className={styles.multiQMark}
                              style={
                                appearanceMode === "dark"
                                  ? {
                                      background: "rgba(255,255,255,0.06)",
                                      color: subtle,
                                    }
                                  : undefined
                              }
                            >
                              ?
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.multiFormBottom}>
                    <div className={styles.multiCtaBlock}>
                      <button
                        type="button"
                        className={[
                          styles.multiSubmitBtn,
                          interactive ? styles.payBtnInteractive : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={
                          {
                            background: primary,
                            color: onPrimaryText,
                            ["--btn-hover" as string]: hover,
                            ["--btn-active" as string]: active,
                          } as CSSProperties
                        }
                        onClick={interactive ? () => onDemoPay?.() : undefined}
                      >
                        {btnLabel}
                      </button>
                      <MultiLegalLine
                        accent={primary}
                        layout={legalLayout}
                        mutedColor={muted}
                      />
                    </div>
                    {!isMobile ? (
                      <MultiFooterRow pciColor={primary} mutedColor={muted} />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

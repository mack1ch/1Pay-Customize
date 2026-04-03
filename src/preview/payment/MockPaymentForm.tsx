import type { CSSProperties, ReactNode } from "react";
import {
  clampFormBaseRadius,
  computeSingleCardFormRadii,
  computeStackedCanvasFormRadii,
  computeSbpDesktopFormRadii,
  D_SINGLE_CARD_CONTENT_PAD,
} from "../../domain/formRadiusModel";
import { fontStackFor } from "../../domain/fonts";
import { rgbaFromHex } from "../../domain/colorUtils";
import { defaultFormConfig, mockPaymentContext } from "../../domain/defaults";
import { resolveButtonLabel } from "../../domain/buttonLabel";
import type { PreviewTheme } from "../../state/previewTheme";
import type { FormCustomizationConfig } from "../../types/customization";
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

/** Мультиформа — значения из макета (ПК) */
const MULTI_TEXT = "#222222";
/** Карточки с формой — не заливаются «цветом фона» из настроек (он только для страницы) */
const FORM_CARD_BG = "#FFFFFF";
const MULTI_INPUT_BG = "#F6F6F6";
const MULTI_SBP_BG = "#222222";
const MULTI_FONT = "'Lato', system-ui, sans-serif";

interface Props {
  theme: PreviewTheme;
  config: FormCustomizationConfig;
  device: "desktop" | "mobile";
  /** В конфигураторе: ширина под превью, высота по контенту (скролл у контейнера) */
  embedded?: boolean;
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

function BackLink({ color }: { color: string }) {
  return (
    <button type="button" className={styles.back} style={{ color }}>
      <span className={styles.backChevron} aria-hidden>
        ‹
      </span>
      Вернуться назад
    </button>
  );
}

function MultiBackLink() {
  return (
    <button type="button" className={styles.multiBack}>
      <span className={styles.multiBackChevron} aria-hidden>
        ‹
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
}: {
  logoUrl: string | null;
  textColor: string;
  primaryColor: string;
  multi?: boolean;
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

function HeaderBlock({
  config,
  textColor,
  logoUrl,
  primaryColor,
}: {
  config: FormCustomizationConfig;
  textColor: string;
  logoUrl: string | null;
  primaryColor: string;
}) {
  const titleLine = headerTitle(config);
  const desc = headerDescription(config);
  return (
    <div className={styles.rowTop}>
      <div>
        <div className={styles.amount} style={{ color: textColor }}>
          {mockPaymentContext.amountFormatted}
        </div>
        <div className={styles.merchant} style={{ color: textColor }}>
          {titleLine}
        </div>
        <div className={styles.sub} style={{ color: `${textColor}99` }}>
          {desc}
        </div>
      </div>
      <CornerBrand
        logoUrl={logoUrl}
        textColor={textColor}
        primaryColor={primaryColor}
      />
    </div>
  );
}

function FooterRow({
  pciColor,
  textColor,
}: {
  pciColor: string;
  textColor: string;
}) {
  const soft = { color: textColor, opacity: 0.65 } as const;
  return (
    <div className={styles.footerRow}>
      <div className={styles.pci}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2L4 7v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-5z"
            fill={pciColor}
            opacity="0.95"
          />
        </svg>
        <span style={soft}>Ваши данные под защитой PCI DSS</span>
      </div>
      <span style={soft}>Осталось {mockPaymentContext.timer}</span>
    </div>
  );
}

function LegalLine({
  accent,
  textColor,
}: {
  accent: string;
  textColor: string;
}) {
  const soft = { color: textColor, opacity: 0.72 } as const;
  return (
    <p className={styles.legal}>
      <span style={soft}>Оплачивая, вы соглашаетесь с </span>
      <span style={{ color: accent }}>договором оферты</span>
      <span style={soft}>.</span>
    </p>
  );
}

function MultiLegalLine({ accent }: { accent: string }) {
  return (
    <p className={styles.multiLegal}>
      <span className={styles.multiLegalMuted}>
        Оплачивая, вы соглашаетесь с{" "}
      </span>
      <span style={{ color: accent }}>договором оферты</span>
      <span className={styles.multiLegalMuted}>.</span>
    </p>
  );
}

function MultiFooterRow({ pciColor }: { pciColor: string }) {
  return (
    <div className={styles.multiFooterRow}>
      <div className={styles.multiPci}>
        <div className={styles.multiLockWrap} aria-hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 7v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-5z"
              fill={pciColor}
            />
          </svg>
        </div>
        <span className={styles.multiFooterText}>
          Ваши данные под защитой PCI DSS
        </span>
      </div>
      <span className={styles.multiFooterText}>
        Осталось {mockPaymentContext.timer}
      </span>
    </div>
  );
}

function MultiHeaderBlock({
  config,
  logoUrl,
  primaryColor,
}: {
  config: FormCustomizationConfig;
  logoUrl: string | null;
  primaryColor: string;
}) {
  const titleLine = headerTitle(config);
  const desc = headerDescription(config);
  return (
    <div className={styles.multiHeaderInner}>
      <div className={styles.multiHeaderTop}>
        <div className={styles.multiAmount}>
          {mockPaymentContext.amountFormatted}
        </div>
        <CornerBrand
          logoUrl={logoUrl}
          textColor={MULTI_TEXT}
          primaryColor={primaryColor}
          multi
        />
      </div>
      <div className={styles.multiHeaderMeta}>
        <div className={styles.multiMerchant}>{titleLine}</div>
        <div className={styles.multiDesc}>{desc}</div>
      </div>
    </div>
  );
}

const SBP_MOBILE_MOCK_BANKS = [
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
  "Т-Банк",
];

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
  badgeRadius,
}: {
  logoUrl: string | null;
  primaryColor: string;
  badgeRadius: number;
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
          style={{ background: dark ? MULTI_TEXT : "#ffffff" }}
        />,
      );
    }
  }
  return (
    <div className={styles.qrDesktopWrap}>
      <div className={styles.qrDesktopGrid}>{cells}</div>
      <div
        className={styles.qrDesktopBadge}
        style={{ borderRadius: `${badgeRadius}px` }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="" className={styles.qrDesktopBadgeImg} />
        ) : (
          <span className={styles.qrDesktopBadgeMark} aria-hidden>
            <span style={{ color: MULTI_TEXT }}>1</span>
            <span style={{ color: primaryColor }}>P</span>
          </span>
        )}
      </div>
    </div>
  );
}

function SbpDesktopOrderHeader({
  config,
}: {
  config: FormCustomizationConfig;
}) {
  const titleLine = headerTitle(config);
  const desc = headerDescription(config);
  return (
    <div className={styles.sbpDesktopHeaderRow}>
      <div className={styles.sbpDesktopHeaderCol}>
        <div className={styles.sbpDesktopAmount}>
          {mockPaymentContext.amountFormatted}
        </div>
        <div className={styles.sbpDesktopMeta}>
          <div className={styles.sbpDesktopMerchant}>{titleLine}</div>
          <div className={styles.sbpDesktopDesc}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

export function MockPaymentForm({ theme, config, device, embedded }: Props) {
  const {
    effectiveTextColor: text,
    effectivePrimaryColor: primary,
    effectiveHoverColor: hover,
    effectiveActiveColor: active,
    effectiveGradientStart: g0,
    effectiveGradientEnd: g1,
    fontFamily,
    logoDataUrl,
  } = theme;

  const font = fontStackFor(fontFamily);
  const baseRadius = clampFormBaseRadius(
    Number.isFinite(Number(theme.borderRadius))
      ? Number(theme.borderRadius)
      : defaultFormConfig.borderRadius,
  );
  const rSingle = computeSingleCardFormRadii(baseRadius);
  const rStack = computeStackedCanvasFormRadii(baseRadius);
  const rSbpDesk = computeSbpDesktopFormRadii(baseRadius);

  const btnLabel = resolveButtonLabel(
    config.buttonText,
    mockPaymentContext.amountShort,
  );

  const wrapStyleBase = {
    fontFamily: font,
    ["--pf-text" as string]: text,
    ["--pf-primary" as string]: primary,
    ["--pf-hover" as string]: hover,
    ["--pf-active" as string]: active,
    ["--pf-card" as string]: FORM_CARD_BG,
  } as CSSProperties;

  const isMobile = device === "mobile";

  if (config.formType === "sbp") {
    if (isMobile) {
      const sbpMobileWrap = {
        ...wrapStyleBase,
        fontFamily: MULTI_FONT,
        color: MULTI_TEXT,
        ...rStack.cssVars,
        ...legacyPfRadiusVars(
          rStack.rForm,
          rStack.rSection,
          rStack.rControlPad24,
        ),
      } as CSSProperties;

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
              <MultiBackLink />
              <div className={styles.sbpMobileCards}>
                <div
                  className={styles.sbpMobileOrderCard}
                  style={{
                    background: FORM_CARD_BG,
                    borderRadius: rStack.rSection,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div className={styles.sbpMobileOrderPad}>
                    <MultiHeaderBlock
                      config={config}
                      logoUrl={logoDataUrl}
                      primaryColor={primary}
                    />
                  </div>
                </div>
                <div
                  className={styles.sbpMobileBankCard}
                  style={{
                    background: FORM_CARD_BG,
                    borderRadius: rStack.rSection,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <div className={styles.sbpMobileBankInner}>
                    <div
                      className={styles.sbpMobileSearch}
                      role="search"
                      aria-label="Поиск банка"
                      style={{ borderRadius: rStack.rControlPad14 }}
                    >
                      <SbpMobileSearchIcon />
                      <span className={styles.sbpMobileSearchPlaceholder}>
                        Поиск банка
                      </span>
                    </div>
                    <div className={styles.sbpMobileList}>
                      {SBP_MOBILE_MOCK_BANKS.map((name, i) => (
                        <button
                          key={`${name}-${i}`}
                          type="button"
                          className={styles.sbpMobileBankRow}
                          style={{ borderRadius: rStack.rControlPad14 }}
                        >
                          <div className={styles.sbpMobileBankLeft}>
                            <div className={styles.sbpMobileBankLogoSlot}>
                              <SbpTBankGlyph />
                            </div>
                            <span className={styles.sbpMobileBankName}>
                              {name}
                            </span>
                          </div>
                          <span
                            className={styles.sbpMobileRowChevron}
                            aria-hidden
                          >
                            ›
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const sbpDeskWrap = {
      ...wrapStyleBase,
      fontFamily: MULTI_FONT,
      color: MULTI_TEXT,
      ...rSbpDesk.cssVars,
      ...legacyPfRadiusVars(
        rSbpDesk.rForm,
        rSbpDesk.rSection,
        rSbpDesk.rQrBadge,
      ),
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
                background: FORM_CARD_BG,
                borderRadius: rSbpDesk.rSection,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
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
                <SbpDesktopOrderHeader config={config} />
                <div className={styles.sbpDesktopQrStack}>
                  <FakeQrDesktop
                    logoUrl={logoDataUrl}
                    primaryColor={primary}
                    badgeRadius={rSbpDesk.rQrBadge}
                  />
                  <div className={styles.sbpDesktopQrTextCol}>
                    <div className={styles.sbpDesktopQrCopy}>
                      <p className={styles.sbpDesktopQrTitle}>
                        Чтобы оплатить отсканируйте QR-код
                      </p>
                      <p className={styles.sbpDesktopQrSub}>
                        Откройте приложение банка и отсканируйте QR-Код для
                        оплаты.
                      </p>
                    </div>
                    <MultiLegalLine accent={primary} />
                  </div>
                </div>
                <div className={styles.sbpDesktopDivider} />
                <MultiFooterRow pciColor={primary} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (config.formType === "card") {
    const cardWrapStyle = {
      ...wrapStyleBase,
      ...rSingle.cssVars,
      ...legacyPfRadiusVars(
        rSingle.rForm,
        rSingle.rSection,
        rSingle.rControl,
      ),
    } as CSSProperties;

    return (
      <div className={viewportCls(embedded, isMobile)} style={cardWrapStyle}>
        <div
          className={gradCls(embedded)}
          style={{ backgroundColor: "transparent" }}
        >
          <div className={styles.singleStack}>
            <BackLink color={`${text}88`} />
            <div
              className={styles.oneCard}
              style={{
                background: FORM_CARD_BG,
                borderRadius: rSingle.rForm,
                color: text,
                boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
              }}
            >
              <div style={{ padding: D_SINGLE_CARD_CONTENT_PAD }}>
                <HeaderBlock
                  config={config}
                  textColor={text}
                  logoUrl={logoDataUrl}
                  primaryColor={primary}
                />
                <div className={styles.fieldBlock}>
                  <label
                    className={styles.inLabel}
                    style={{ color: `${text}88` }}
                  >
                    Номер карты
                  </label>
                  <div
                    className={styles.inputLike}
                    style={{
                      borderRadius: rSingle.rControl,
                      borderColor: `${text}22`,
                      color: `${text}cc`,
                    }}
                  >
                    <span>2242 4234 4325 4535</span>
                    <span className={styles.mir} style={{ color: primary }}>
                      МИР
                    </span>
                  </div>
                </div>
                <div className={styles.row2}>
                  <div className={styles.fieldBlock}>
                    <label
                      className={styles.inLabel}
                      style={{ color: `${text}88` }}
                    >
                      Годен до
                    </label>
                    <div className={styles.expRow}>
                      <div
                        className={styles.inputMini}
                        style={{
                          borderRadius: rSingle.rControl,
                          borderColor: `${text}22`,
                        }}
                      >
                        MM
                      </div>
                      <span
                        className={styles.slash}
                        style={{ color: `${text}55` }}
                      >
                        /
                      </span>
                      <div
                        className={styles.inputMini}
                        style={{
                          borderRadius: rSingle.rControl,
                          borderColor: `${text}22`,
                        }}
                      >
                        ГГ
                      </div>
                    </div>
                  </div>
                  <div className={styles.fieldBlock}>
                    <label
                      className={styles.inLabel}
                      style={{ color: `${text}88` }}
                    >
                      Цифры с задней стороны
                    </label>
                    <div
                      className={styles.inputLike}
                      style={{
                        borderRadius: rSingle.rControl,
                        borderColor: `${text}22`,
                        color: `${text}aa`,
                      }}
                    >
                      <span>CVV</span>
                      <span className={styles.qMark}>?</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.payBtn}
                  style={
                    {
                      background: primary,
                      borderRadius: rSingle.rControl,
                      ["--btn-hover" as string]: hover,
                      ["--btn-active" as string]: active,
                    } as CSSProperties
                  }
                >
                  {btnLabel}
                </button>
                <LegalLine accent={primary} textColor={text} />
                <FooterRow pciColor={primary} textColor={text} />
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

  const multiWrapStyle = {
    ...wrapStyleBase,
    fontFamily: MULTI_FONT,
    color: MULTI_TEXT,
    ...rStack.cssVars,
    ...legacyPfRadiusVars(
      rStack.rForm,
      rStack.rSection,
      rStack.rControlPad24,
    ),
  } as CSSProperties;

  const cardTopShell = {
    background: FORM_CARD_BG,
    borderRadius: rStack.rSection,
    color: MULTI_TEXT,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  } as const;

  const cardFormShell = {
    background: FORM_CARD_BG,
    borderRadius: rStack.rSection,
    color: MULTI_TEXT,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  } as const;

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
          <MultiBackLink />
          <div className={styles.multiCardChain}>
            <div
              className={`${styles.panel} ${styles.multiPanel}`}
              style={cardTopShell}
            >
              <div className={styles.multiPadHeader}>
                <MultiHeaderBlock
                  config={config}
                  logoUrl={logoDataUrl}
                  primaryColor={primary}
                />
                {legalOnCard === "header" ? (
                  <div className={styles.multiHeaderFooter}>
                    <MultiLegalLine accent={primary} />
                    <MultiFooterRow pciColor={primary} />
                  </div>
                ) : null}
              </div>
            </div>

            {showQuick ? (
              <div
                className={`${styles.panel} ${styles.multiPanel}`}
                style={cardTopShell}
              >
                <div className={styles.multiPadQuick}>
                  <div className={styles.multiSectionTitle}>Быстрая оплата</div>
                  <div className={styles.multiQuickCol}>
                    {m.sbpQuick ? (
                      <button
                        type="button"
                        className={styles.multiSbpBtn}
                        style={{
                          borderRadius: rStack.rControlPad24,
                          background: MULTI_SBP_BG,
                        }}
                      >
                        <span className={styles.sbpMark} aria-hidden />
                        <span>сбп</span>
                      </button>
                    ) : null}
                    {m.payQuick ? (
                      <button
                        type="button"
                        className={styles.multiPayQuick}
                        style={
                          {
                            borderRadius: rStack.rControlPad24,
                            background: `linear-gradient(90deg, ${primary} 0%, ${active} 100%)`,
                            ["--btn-hover" as string]: hover,
                            ["--btn-active" as string]: active,
                          } as CSSProperties
                        }
                      >
                        <span className={styles.payIcon} aria-hidden />
                        <span>Pay</span>
                      </button>
                    ) : null}
                  </div>
                  {legalOnCard === "quick" ? (
                    <div className={styles.multiQuickFooter}>
                      <MultiLegalLine accent={primary} />
                      <MultiFooterRow pciColor={primary} />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {showCard ? (
              <div
                className={`${styles.panel} ${styles.multiPanel}`}
                style={cardFormShell}
              >
                <div className={styles.multiPadForm}>
                  <div className={styles.multiFormFields}>
                    <div className={styles.multiSectionTitle}>
                      Оплата картой
                    </div>
                    <div className={styles.multiFieldsCol}>
                      <div className={styles.multiField}>
                        <label className={styles.multiLabel}>Номер карты</label>
                        <div
                          className={styles.multiInputRow}
                          style={{
                            borderRadius: rStack.rControlPad24,
                            background: MULTI_INPUT_BG,
                          }}
                        >
                          <span className={styles.multiInputText}>
                            4442 4234 4325 4535
                          </span>
                          <span
                            className={styles.mir}
                            style={{ color: primary }}
                          >
                            МИР
                          </span>
                        </div>
                      </div>
                      <div className={styles.multiRow2}>
                        <div className={styles.multiField}>
                          <label className={styles.multiLabel}>Годен до:</label>
                          <div
                            className={styles.multiExpCombined}
                            style={{
                              borderRadius: rStack.rControlPad24,
                              background: MULTI_INPUT_BG,
                            }}
                          >
                            <span className={styles.multiInputText}>07</span>
                            <span className={styles.multiExpSlash}>/</span>
                            <span className={styles.multiInputText}>26</span>
                          </div>
                        </div>
                        <div className={styles.multiField}>
                          <label className={styles.multiLabel}>
                            Цифры с задней стороны
                          </label>
                          <div
                            className={styles.multiInputRow}
                            style={{
                              borderRadius: rStack.rControlPad24,
                              background: MULTI_INPUT_BG,
                            }}
                          >
                            <span className={styles.multiInputText}>233</span>
                            <span className={styles.multiQMark}>?</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.multiFormBottom}>
                    <div className={styles.multiCtaBlock}>
                      <button
                        type="button"
                        className={styles.multiSubmitBtn}
                        style={
                          {
                            background: primary,
                            borderRadius: rStack.rControlPad24,
                            ["--btn-hover" as string]: hover,
                            ["--btn-active" as string]: active,
                          } as CSSProperties
                        }
                      >
                        {btnLabel}
                      </button>
                      <MultiLegalLine accent={primary} />
                    </div>
                    <MultiFooterRow pciColor={primary} />
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

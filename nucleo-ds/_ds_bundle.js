/* @ds-bundle: {"format":3,"namespace":"FolhaDesignSystem_e132f0","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Banner","sourcePath":"components/core/Banner.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"DeliveryTracking","sourcePath":"components/domain/DeliveryTracking.jsx"},{"name":"OrderTimeline","sourcePath":"components/domain/OrderTimeline.jsx"},{"name":"PedidoCard","sourcePath":"components/domain/PedidoCard.jsx"},{"name":"StatCard","sourcePath":"components/domain/StatCard.jsx"},{"name":"StrainCard","sourcePath":"components/domain/StrainCard.jsx"},{"name":"ORDER_STAGES","sourcePath":"components/domain/orderStatus.js"},{"name":"STATUS_TONE","sourcePath":"components/domain/orderStatus.js"},{"name":"STATUS_ICON","sourcePath":"components/domain/orderStatus.js"}],"sourceHashes":{"components/core/Avatar.jsx":"e9c205a70c08","components/core/Badge.jsx":"338d1cd165df","components/core/Banner.jsx":"200d2cd8e996","components/core/Button.jsx":"ea20694dede3","components/core/Card.jsx":"a267ca61e90b","components/core/Checkbox.jsx":"5b5fc18c7b6d","components/core/Icon.jsx":"81a53122aea1","components/core/Input.jsx":"00377ad83ebd","components/core/Select.jsx":"a0078e864af3","components/core/Switch.jsx":"d4931494862c","components/core/Tabs.jsx":"b7e565d6be95","components/domain/DeliveryTracking.jsx":"f8875af2a1c1","components/domain/OrderTimeline.jsx":"d915e1d71894","components/domain/PedidoCard.jsx":"9f574bd4dd54","components/domain/StatCard.jsx":"476afee79c4b","components/domain/StrainCard.jsx":"37a5bf5f9e90","components/domain/orderStatus.js":"b18e09e9c573","ui_kits/data.js":"1fe20d9bb8bc","ui_kits/operador/screens.jsx":"373c2ea948d9","ui_kits/paciente/screens.jsx":"383502b451f1"},"inlinedExternals":[],"unexposedExports":[{"name":"stageIndex","sourcePath":"components/domain/orderStatus.js"}]} */

(() => {

const __ds_ns = (window.FolhaDesignSystem_e132f0 = window.FolhaDesignSystem_e132f0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

/** User/patient avatar — image or initials. */
function Avatar({
  name = '',
  src,
  size = 40,
  tone = 'primary',
  style,
  ...rest
}) {
  const palettes = {
    primary: {
      bg: 'var(--green-100)',
      fg: 'var(--green-700)'
    },
    petrol: {
      bg: 'var(--petrol-100)',
      fg: 'var(--petrol-600)'
    },
    neutral: {
      bg: 'var(--neutral-200)',
      fg: 'var(--neutral-700)'
    }
  };
  const p = palettes[tone] || palettes.primary;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: p.bg,
      color: p.fg,
      fontWeight: 'var(--weight-semibold)',
      fontSize: Math.round(size * 0.4),
      fontFamily: 'var(--font-sans)',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  neutral: {
    bg: 'var(--neutral-100)',
    fg: 'var(--neutral-700)',
    dot: 'var(--neutral-400)'
  },
  primary: {
    bg: 'var(--color-primary-subtle)',
    fg: 'var(--green-700)',
    dot: 'var(--green-500)'
  },
  accent: {
    bg: '#E4F6EC',
    fg: 'var(--accent-600)',
    dot: 'var(--accent-500)'
  },
  success: {
    bg: 'var(--success-50)',
    fg: 'var(--success-600)',
    dot: 'var(--success-500)'
  },
  warning: {
    bg: 'var(--warning-50)',
    fg: 'var(--warning-600)',
    dot: 'var(--warning-500)'
  },
  error: {
    bg: 'var(--error-50)',
    fg: 'var(--error-600)',
    dot: 'var(--error-500)'
  },
  info: {
    bg: 'var(--info-50)',
    fg: 'var(--info-600)',
    dot: 'var(--info-500)'
  },
  petrol: {
    bg: 'var(--petrol-50)',
    fg: 'var(--petrol-600)',
    dot: 'var(--petrol-500)'
  }
};

/** Small status pill. Use a dot for live order/document states. */
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  size = 'md',
  style,
  ...rest
}) {
  const t = tones[tone] || tones.neutral;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sm ? 5 : 6,
      height: sm ? 22 : 26,
      padding: sm ? '0 8px' : '0 10px',
      background: t.bg,
      color: t.fg,
      borderRadius: 'var(--radius-pill)',
      font: 'var(--font-sans)',
      fontSize: sm ? '11px' : 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-snug)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: t.dot,
      flex: 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Banner.jsx
try { (() => {
const tones = {
  info: {
    bg: 'var(--info-50)',
    border: 'var(--info-500)',
    fg: 'var(--info-600)',
    icon: 'info'
  },
  success: {
    bg: 'var(--success-50)',
    border: 'var(--success-500)',
    fg: 'var(--success-600)',
    icon: 'check-circle-2'
  },
  warning: {
    bg: 'var(--warning-50)',
    border: 'var(--warning-500)',
    fg: 'var(--warning-600)',
    icon: 'alert-triangle'
  },
  error: {
    bg: 'var(--error-50)',
    border: 'var(--error-500)',
    fg: 'var(--error-600)',
    icon: 'alert-circle'
  },
  neutral: {
    bg: 'var(--neutral-50)',
    border: 'var(--neutral-300)',
    fg: 'var(--text-secondary)',
    icon: 'info'
  }
};

/** Inline banner / alert. Pass an `icon` node (e.g. <Icon name="shield-check" />) or omit. */
function Banner({
  children,
  title,
  tone = 'info',
  icon,
  onClose,
  style
}) {
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      gap: 12,
      padding: '14px 16px',
      background: t.bg,
      border: `1px solid ${t.border}33`,
      borderLeft: `3px solid ${t.border}`,
      borderRadius: 'var(--radius-md)',
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: t.border,
      flex: 'none',
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-primary)',
      marginBottom: 2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Fechar",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      padding: 2,
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Banner.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    padding: '0 14px',
    height: 36,
    fontSize: 'var(--text-sm)',
    gap: 6,
    radius: 'var(--radius-sm)'
  },
  md: {
    padding: '0 18px',
    height: 44,
    fontSize: 'var(--text-base)',
    gap: 8,
    radius: 'var(--radius-md)'
  },
  lg: {
    padding: '0 24px',
    height: 52,
    fontSize: 'var(--text-md)',
    gap: 10,
    radius: 'var(--radius-md)'
  }
};
const variants = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-primary)',
    '--hover-bg': 'var(--color-primary-hover)',
    '--active-bg': 'var(--color-primary-active)'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--surface-sunken)',
    '--active-bg': 'var(--neutral-200)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid transparent',
    boxShadow: 'none',
    '--hover-bg': 'var(--color-primary-subtle)',
    '--active-bg': 'var(--green-100)'
  },
  danger: {
    background: 'var(--color-error)',
    color: '#fff',
    border: '1px solid transparent',
    boxShadow: 'none',
    '--hover-bg': 'var(--error-600)',
    '--active-bg': 'var(--error-600)'
  }
};

/**
 * Núcleo primary action button. Sentence-case, verb-led labels.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  style,
  onClick,
  ...rest
}) {
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  const handleEnter = e => {
    if (!isDisabled) e.currentTarget.style.background = v['--hover-bg'];
  };
  const handleLeave = e => {
    if (!isDisabled) e.currentTarget.style.background = v.background;
  };
  const handleDown = e => {
    if (!isDisabled) e.currentTarget.style.background = v['--active-bg'];
  };
  const handleUp = e => {
    if (!isDisabled) e.currentTarget.style.background = v['--hover-bg'];
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onClick: onClick,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    onMouseDown: handleDown,
    onMouseUp: handleUp,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      font: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1,
      letterSpacing: 'var(--tracking-snug)',
      whiteSpace: 'nowrap',
      background: v.background,
      color: v.color,
      border: v.border,
      boxShadow: v.boxShadow,
      borderRadius: s.radius,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.55 : 1,
      transition: 'background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(Spinner, null) : leftIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, leftIcon), children, !loading && rightIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, rightIcon));
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      display: 'inline-block',
      animation: 'nucleo-spin 0.6s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes nucleo-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Card surface. The default Núcleo container: white, soft radius, hairline + discreet shadow. */
function Card({
  children,
  padding = 'var(--space-5)',
  interactive = false,
  elevated = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: hover ? 'var(--shadow-md)' : elevated ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
      padding,
      cursor: interactive ? 'pointer' : 'default',
      transform: hover ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
/** Checkbox with optional label. Controlled or uncontrolled. */
function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  id,
  style
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const boxId = id || React.useId();
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: boxId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1
    }
  }, /*#__PURE__*/React.createElement("button", {
    id: boxId,
    role: "checkbox",
    "aria-checked": on,
    onClick: toggle,
    disabled: disabled,
    style: {
      width: 20,
      height: 20,
      flex: 'none',
      borderRadius: 'var(--radius-xs)',
      padding: 0,
      background: on ? 'var(--color-primary)' : 'var(--surface-card)',
      border: `1.5px solid ${on ? 'var(--color-primary)' : 'var(--border-default)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    "stroke-width": "3.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Núcleo icon — thin wrapper over Lucide outline icons.
 * Requires the Lucide UMD script loaded on the page:
 *   <script src="https://unpkg.com/lucide@latest"></script>
 */
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = 'currentColor',
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const el = ref.current;
      if (!el || cancelled) return false;
      if (!window.lucide || !window.lucide.createIcons) return false;
      el.innerHTML = `<i data-lucide="${name}"></i>`;
      window.lucide.createIcons();
      const svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('stroke-width', strokeWidth);
        svg.style.display = 'block';
      }
      return true;
    };
    if (!paint()) {
      const id = setInterval(() => {
        if (paint()) clearInterval(id);
      }, 80);
      setTimeout(() => clearInterval(id), 4000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      color,
      flex: 'none',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with label, helper/error text and optional leading icon.
 */
function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingIcon,
  id,
  size = 'md',
  style,
  containerStyle,
  disabled,
  ...rest
}) {
  const inputId = id || React.useId();
  const [focused, setFocused] = React.useState(false);
  const heights = {
    sm: 38,
    md: 44,
    lg: 50
  };
  const h = heights[size] || 44;
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--color-accent)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 14px',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focused ? 'var(--focus-ring)' : 'var(--shadow-xs)',
      transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-tertiary)'
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: e => {
      setFocused(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      font: 'var(--font-body)',
      color: 'var(--text-primary)',
      height: '100%',
      ...style
    }
  }, rest)), trailingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-tertiary)'
    }
  }, trailingIcon)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body-sm)',
      color: error ? 'var(--color-error)' : 'var(--text-secondary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to match Núcleo inputs. */
function Select({
  label,
  hint,
  error,
  options = [],
  id,
  size = 'md',
  style,
  containerStyle,
  disabled,
  children,
  ...rest
}) {
  const selectId = id || React.useId();
  const [focused, setFocused] = React.useState(false);
  const heights = {
    sm: 38,
    md: 44,
    lg: 50
  };
  const h = heights[size] || 44;
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--color-accent)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: h,
      padding: '0 40px 0 14px',
      font: 'var(--font-body)',
      color: 'var(--text-primary)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focused ? 'var(--focus-ring)' : 'var(--shadow-xs)',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
      ...style
    }
  }, rest), children || options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-tertiary)",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    style: {
      position: 'absolute',
      right: 12,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body-sm)',
      color: error ? 'var(--color-error)' : 'var(--text-secondary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
/** Toggle switch — for settings and on/off preferences. */
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  id,
  style
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const switchId = id || React.useId();
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };
  const control = /*#__PURE__*/React.createElement("button", {
    role: "switch",
    "aria-checked": on,
    id: switchId,
    onClick: toggle,
    disabled: disabled,
    style: {
      width: 44,
      height: 26,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: on ? 'var(--color-primary)' : 'var(--neutral-300)',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      padding: 0,
      transition: 'background var(--duration-normal) var(--ease-standard)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--duration-normal) var(--ease-emphasized)'
    }
  }));
  if (!label) return control;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: switchId,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
/** Horizontal tab bar. Controlled via `value`/`onChange` or uncontrolled. */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value);
  const active = isControlled ? value : internal;
  const select = v => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border-subtle)',
      ...style
    }
  }, tabs.map(t => {
    const on = t.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      onClick: () => select(t.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        font: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        color: on ? 'var(--green-700)' : 'var(--text-secondary)',
        borderBottom: `2px solid ${on ? 'var(--color-primary)' : 'transparent'}`,
        marginBottom: -1,
        transition: 'color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)'
      }
    }, t.icon, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: '1px 7px',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--color-primary-subtle)' : 'var(--neutral-100)',
        color: on ? 'var(--green-700)' : 'var(--text-secondary)'
      }
    }, t.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/domain/StatCard.jsx
try { (() => {
/** Executive metric card for dashboards. */
function StatCard({
  label,
  value,
  unit,
  icon,
  delta,
  deltaTone = 'success',
  hint,
  style
}) {
  const deltaColors = {
    success: 'var(--success-600)',
    error: 'var(--error-600)',
    neutral: 'var(--text-secondary)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)'
    }
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-primary-subtle)',
      color: 'var(--color-primary)'
    }
  }, typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }) : icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-sans)',
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--weight-extra)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, unit)), (delta || hint) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--font-body-sm)'
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      color: deltaColors[deltaTone],
      fontWeight: 'var(--weight-semibold)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: deltaTone === 'error' ? 'trending-down' : 'trending-up',
    size: 15
  }), delta), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, hint)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/domain/StrainCard.jsx
try { (() => {
/**
 * Educational catalogue card for a product/strain. Netflix/Steam-style cover
 * with medicinal data (THC, CBD, terpenes, tags). Informational, never advisory.
 */
function StrainCard({
  nome,
  tipo,
  imagem,
  thc,
  cbd,
  terpenos = [],
  tags = [],
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
      transform: hover ? 'translateY(-3px)' : 'none',
      transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 150,
      position: 'relative',
      background: imagem ? `center/cover no-repeat url(${imagem})` : 'linear-gradient(135deg, var(--green-100), var(--petrol-100))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, !imagem && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "flask-conical",
    size: 40,
    color: "var(--green-500)"
  }), tipo && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "petrol",
    size: "sm"
  }, tipo))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-heading)',
      fontSize: 'var(--text-md)',
      color: 'var(--text-primary)'
    }
  }, nome), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "THC",
    value: thc
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "CBD",
    value: cbd
  })), terpenos.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--text-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      marginBottom: 6
    }
  }, "Terpenos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, terpenos.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-pill)',
      padding: '3px 10px'
    }
  }, t)))), tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: 12
    }
  }, tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: t,
    tone: "primary",
    size: "sm"
  }, t)))));
}
function Metric({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--text-tertiary)',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: 'var(--green-700)'
    }
  }, value));
}
Object.assign(__ds_scope, { StrainCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/StrainCard.jsx", error: String((e && e.message) || e) }); }

// components/domain/orderStatus.js
try { (() => {
// Núcleo — order lifecycle vocabulary. Single source of truth for status order + tone.
// Never paraphrase these labels in the UI.

const ORDER_STAGES = ['Solicitado', 'Em análise', 'Aprovado', 'Em separação', 'Pronto para retirada', 'Enviado', 'Entregue'];
const STATUS_TONE = {
  'Solicitado': 'neutral',
  'Em análise': 'warning',
  'Aprovado': 'primary',
  'Em separação': 'info',
  'Pronto para retirada': 'accent',
  'Enviado': 'petrol',
  'Entregue': 'success',
  'Recusado': 'error',
  'Cancelado': 'neutral'
};
const STATUS_ICON = {
  'Solicitado': 'file-plus',
  'Em análise': 'search-check',
  'Aprovado': 'check-circle-2',
  'Em separação': 'package',
  'Pronto para retirada': 'package-check',
  'Enviado': 'truck',
  'Entregue': 'home',
  'Recusado': 'x-circle'
};
function stageIndex(status) {
  return ORDER_STAGES.indexOf(status);
}
Object.assign(__ds_scope, { ORDER_STAGES, STATUS_TONE, STATUS_ICON, stageIndex });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/orderStatus.js", error: String((e && e.message) || e) }); }

// components/domain/DeliveryTracking.jsx
try { (() => {
/**
 * Delivery tracking panel — current status, ETA, tracking code, history.
 * Layout inspired by Mercado Livre / iFood, in the medical register.
 */
function DeliveryTracking({
  status,
  ultimaAtualizacao,
  previsao,
  codigo,
  historico = [],
  style
}) {
  const tone = __ds_scope.STATUS_TONE[status] || 'info';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-6)',
      background: 'var(--color-primary-subtle)',
      borderBottom: '1px solid var(--green-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--green-700)'
    }
  }, "Acompanhar entrega"), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: tone,
    dot: true
  }, status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    icon: "clock",
    label: "\xDAltima atualiza\xE7\xE3o",
    value: ultimaAtualizacao
  }), /*#__PURE__*/React.createElement(Field, {
    icon: "calendar-check",
    label: "Previs\xE3o",
    value: previsao
  }), /*#__PURE__*/React.createElement(Field, {
    icon: "hash",
    label: "C\xF3digo",
    value: codigo,
    mono: true
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, "Hist\xF3rico"), /*#__PURE__*/React.createElement("div", null, historico.map((h, i) => {
    const last = i === historico.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 14,
        minHeight: last ? 'auto' : 52
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        flex: 'none',
        marginTop: 4,
        background: i === 0 ? 'var(--color-primary)' : 'var(--neutral-300)',
        boxShadow: i === 0 ? '0 0 0 4px rgba(99,193,140,0.20)' : 'none'
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        background: 'var(--border-default)',
        marginTop: 2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-body)',
        fontWeight: i === 0 ? 600 : 400,
        color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)'
      }
    }, h.titulo), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-body-sm)',
        color: 'var(--text-tertiary)',
        marginTop: 1
      }
    }, h.quando, h.local ? ` · ${h.local}` : '')));
  }))));
}
function Field({
  icon,
  label,
  value,
  mono
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--green-600)',
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      font: mono ? 'var(--font-mono)' : 'var(--font-body-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, value)));
}
Object.assign(__ds_scope, { DeliveryTracking });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/DeliveryTracking.jsx", error: String((e && e.message) || e) }); }

// components/domain/OrderTimeline.jsx
try { (() => {
/**
 * Vertical order timeline — the central component of the system.
 * Shows the 7 lifecycle stages with the current position highlighted.
 */
function OrderTimeline({
  current,
  timestamps = {},
  stages = __ds_scope.ORDER_STAGES,
  style
}) {
  const currentIdx = __ds_scope.stageIndex(current);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, stages.map((stage, i) => {
    const done = i < currentIdx;
    const active = i === currentIdx;
    const last = i === stages.length - 1;
    const dotBg = done ? 'var(--color-primary)' : active ? 'var(--surface-card)' : 'var(--surface-card)';
    const dotBorder = done ? 'var(--color-primary)' : active ? 'var(--color-accent)' : 'var(--border-default)';
    const iconColor = done ? '#fff' : active ? 'var(--color-accent-strong)' : 'var(--text-tertiary)';
    const lineColor = i < currentIdx ? 'var(--color-primary)' : 'var(--border-default)';
    return /*#__PURE__*/React.createElement("div", {
      key: stage,
      style: {
        display: 'flex',
        gap: 14,
        minHeight: last ? 'auto' : 56
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dotBg,
        border: `2px solid ${dotBorder}`,
        boxShadow: active ? '0 0 0 4px rgba(99,193,140,0.20)' : 'none',
        transition: 'all var(--duration-normal) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: done ? 'check' : __ds_scope.STATUS_ICON[stage] || 'circle',
      size: 16,
      color: iconColor,
      strokeWidth: done ? 3 : 1.9
    })), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        background: lineColor,
        marginTop: 2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : 12,
        paddingTop: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-body)',
        fontWeight: active || done ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: active ? 'var(--green-700)' : done ? 'var(--text-primary)' : 'var(--text-tertiary)'
      }
    }, stage), timestamps[stage] && /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-body-sm)',
        color: 'var(--text-secondary)',
        marginTop: 1
      }
    }, timestamps[stage]), active && !timestamps[stage] && /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-body-sm)',
        color: 'var(--color-accent-strong)',
        marginTop: 1
      }
    }, "Em andamento")));
  }));
}
Object.assign(__ds_scope, { OrderTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/OrderTimeline.jsx", error: String((e && e.message) || e) }); }

// components/domain/PedidoCard.jsx
try { (() => {
/**
 * Order summary card (Pedido). Shows number, status, date, item count, delivery type.
 */
function PedidoCard({
  numero,
  status,
  data,
  itens,
  tipoEntrega,
  onClick,
  style
}) {
  const tone = __ds_scope.STATUS_TONE[status] || 'neutral';
  const entregaIcon = /retirada/i.test(tipoEntrega || '') ? 'store' : 'truck';
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      transform: hover ? 'translateY(-2px)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 2
    }
  }, "Pedido"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, numero)), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: tone,
    dot: true
  }, status)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Meta, {
    icon: "calendar",
    label: "Data",
    value: data
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: "boxes",
    label: "Itens",
    value: `${itens} ${itens === 1 ? 'item' : 'itens'}`
  }), /*#__PURE__*/React.createElement(Meta, {
    icon: entregaIcon,
    label: "Entrega",
    value: tipoEntrega
  })));
}
function Meta({
  icon,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 'var(--radius-sm)',
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)',
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, value)));
}
Object.assign(__ds_scope, { PedidoCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/PedidoCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/data.js
try { (() => {
// Núcleo — sample data for UI kits (white-label tenant: "Associação Vida Verde")
window.NUCLEO_DATA = {
  tenant: {
    nome: 'Associação Vida Verde',
    sigla: 'VV'
  },
  paciente: {
    nome: 'Maria Souza',
    email: 'maria.souza@email.com',
    associada: 'desde 2024'
  },
  pedidos: [{
    numero: '#PED-20482',
    status: 'Em separação',
    data: '15 jun 2026',
    itens: 3,
    tipoEntrega: 'Retirada na sede',
    timestamps: {
      'Solicitado': '12 jun · 09:14',
      'Em análise': '12 jun · 14:02',
      'Aprovado': '13 jun · 10:30'
    },
    produtos: [{
      nome: 'Óleo CBD 17% — 30ml',
      qtd: 1
    }, {
      nome: 'Charlotte\u2019s Web — flor 5g',
      qtd: 1
    }, {
      nome: 'Pomada CBD 500mg',
      qtd: 1
    }]
  }, {
    numero: '#PED-20455',
    status: 'Enviado',
    data: '08 jun 2026',
    itens: 2,
    tipoEntrega: 'Envio por correio',
    timestamps: {
      'Solicitado': '05 jun · 10:00',
      'Em análise': '05 jun · 15:20',
      'Aprovado': '06 jun · 09:00',
      'Em separação': '06 jun · 14:00',
      'Pronto para retirada': '07 jun · 11:00'
    }
  }, {
    numero: '#PED-20390',
    status: 'Entregue',
    data: '21 mai 2026',
    itens: 1,
    tipoEntrega: 'Retirada na sede'
  }, {
    numero: '#PED-20301',
    status: 'Entregue',
    data: '02 mai 2026',
    itens: 4,
    tipoEntrega: 'Envio por correio'
  }],
  tracking: {
    status: 'Enviado',
    ultimaAtualizacao: 'há 2 horas',
    previsao: '17 jun 2026',
    codigo: 'BR4821-9X7K',
    historico: [{
      titulo: 'Pedido enviado',
      quando: '15 jun · 16:40',
      local: 'Sede da associação'
    }, {
      titulo: 'Pronto para retirada',
      quando: '15 jun · 11:10',
      local: 'Estoque'
    }, {
      titulo: 'Em separação',
      quando: '14 jun · 09:30',
      local: 'Estoque'
    }, {
      titulo: 'Pedido aprovado',
      quando: '13 jun · 10:30'
    }, {
      titulo: 'Pedido solicitado',
      quando: '12 jun · 09:14'
    }]
  },
  catalogo: [{
    nome: 'Charlotte\u2019s Web',
    tipo: 'Full spectrum',
    thc: '< 0,3%',
    cbd: '17%',
    terpenos: ['Mirceno', 'Pineno', 'Cariofileno'],
    tags: ['Ansiedade', 'Epilepsia']
  }, {
    nome: 'ACDC',
    tipo: 'Híbrida',
    thc: '6%',
    cbd: '14%',
    terpenos: ['Mirceno', 'Pineno'],
    tags: ['Dor crônica', 'Foco']
  }, {
    nome: 'Harlequin',
    tipo: 'Sativa',
    thc: '5%',
    cbd: '10%',
    terpenos: ['Mirceno', 'Cariofileno'],
    tags: ['Inflamação']
  }, {
    nome: 'Cannatonic',
    tipo: 'Híbrida',
    thc: '7%',
    cbd: '12%',
    terpenos: ['Limoneno', 'Linalol'],
    tags: ['Ansiedade', 'Sono']
  }, {
    nome: 'Ringo\u2019s Gift',
    tipo: 'Full spectrum',
    thc: '1%',
    cbd: '20%',
    terpenos: ['Mirceno', 'Terpinoleno'],
    tags: ['TEA', 'Dor']
  }, {
    nome: 'Stephen Hawking Kush',
    tipo: 'Indica',
    thc: '5%',
    cbd: '12%',
    terpenos: ['Linalol', 'Mirceno'],
    tags: ['Sono', 'Relaxamento']
  }],
  documentos: [{
    nome: 'Receita médica',
    validade: 'válida até 12 dez 2026',
    status: 'Aprovado'
  }, {
    nome: 'Laudo médico (TEA)',
    validade: 'válido até 03 mar 2027',
    status: 'Aprovado'
  }, {
    nome: 'Autorização Anvisa',
    validade: 'renovar até 28 jun 2026',
    status: 'Em análise'
  }, {
    nome: 'Documento de identidade',
    validade: '—',
    status: 'Aprovado'
  }],
  // Operador / Diretoria
  fila: [{
    numero: '#PED-20488',
    paciente: 'João Lima',
    status: 'Solicitado',
    data: '15 jun',
    itens: 2,
    entrega: 'Retirada',
    doc: 'OK'
  }, {
    numero: '#PED-20487',
    paciente: 'Ana Reis',
    status: 'Em análise',
    data: '15 jun',
    itens: 1,
    entrega: 'Correio',
    doc: 'Pendente'
  }, {
    numero: '#PED-20485',
    paciente: 'Carlos Nunes',
    status: 'Em análise',
    data: '14 jun',
    itens: 4,
    entrega: 'Retirada',
    doc: 'OK'
  }, {
    numero: '#PED-20482',
    paciente: 'Maria Souza',
    status: 'Em separação',
    data: '14 jun',
    itens: 3,
    entrega: 'Retirada',
    doc: 'OK'
  }, {
    numero: '#PED-20480',
    paciente: 'Beatriz Alves',
    status: 'Aprovado',
    data: '14 jun',
    itens: 2,
    entrega: 'Correio',
    doc: 'OK'
  }, {
    numero: '#PED-20478',
    paciente: 'Rafael Dias',
    status: 'Pronto para retirada',
    data: '13 jun',
    itens: 1,
    entrega: 'Retirada',
    doc: 'OK'
  }, {
    numero: '#PED-20455',
    paciente: 'Sofia Mendes',
    status: 'Enviado',
    data: '13 jun',
    itens: 2,
    entrega: 'Correio',
    doc: 'OK'
  }, {
    numero: '#PED-20390',
    paciente: 'Pedro Castro',
    status: 'Entregue',
    data: '12 jun',
    itens: 1,
    entrega: 'Retirada',
    doc: 'OK'
  }],
  metrics: [{
    label: 'Pedidos no mês',
    value: '142',
    icon: 'package',
    delta: '+12%',
    hint: 'vs. maio'
  }, {
    label: 'Associados ativos',
    value: '1.284',
    icon: 'users',
    delta: '+38',
    hint: 'novos no mês'
  }, {
    label: 'Aguardando análise',
    value: '8',
    icon: 'clock',
    delta: '−3',
    deltaTone: 'neutral',
    hint: 'hoje'
  }, {
    label: 'Itens em estoque baixo',
    value: '3',
    icon: 'alert-triangle',
    delta: '+1',
    deltaTone: 'error',
    hint: 'repor'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/data.js", error: String((e && e.message) || e) }); }

// ui_kits/operador/screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const ONS = window.FolhaDesignSystem_e132f0;
const {
  Button,
  Icon,
  Badge,
  Card,
  Input,
  Select,
  Avatar,
  Tabs,
  Banner,
  Checkbox,
  OrderTimeline,
  StatCard
} = ONS;
const OD = window.NUCLEO_DATA;
const OLOGO = '../../assets/logo-mark.svg';
const OLOGO_LIGHT = '../../assets/logo-wordmark-light.svg';
const TONE = {
  'Solicitado': 'neutral',
  'Em análise': 'warning',
  'Aprovado': 'primary',
  'Em separação': 'info',
  'Pronto para retirada': 'accent',
  'Enviado': 'petrol',
  'Entregue': 'success',
  'Recusado': 'error'
};

/* ----------------------------------------------------------- App shell ---- */
function OperadorApp() {
  const [route, setRoute] = React.useState('dashboard');
  const [selected, setSelected] = React.useState(null);
  const nav = [{
    id: 'dashboard',
    label: 'Visão geral',
    icon: 'layout-dashboard'
  }, {
    id: 'pedidos',
    label: 'Pedidos',
    icon: 'inbox',
    count: 8
  }, {
    id: 'associados',
    label: 'Associados',
    icon: 'users'
  }, {
    id: 'estoque',
    label: 'Estoque',
    icon: 'boxes'
  }, {
    id: 'catalogo',
    label: 'Catálogo',
    icon: 'book-open'
  }, {
    id: 'documentos',
    label: 'Documentos',
    icon: 'file-check'
  }];
  const titles = {
    dashboard: 'Visão geral',
    pedidos: 'Pedidos',
    associados: 'Associados',
    estoque: 'Estoque',
    catalogo: 'Catálogo',
    documentos: 'Documentos'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flex: 'none',
      background: 'var(--petrol-700)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 18px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: OLOGO_LIGHT,
    alt: "N\xFAcleo",
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 8,
      letterSpacing: '0.02em'
    }
  }, OD.tenant.nome, " \xB7 Opera\xE7\xE3o")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      padding: '8px 12px',
      flex: 1
    }
  }, nav.map(n => {
    const on = route === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => {
        setRoute(n.id);
        setSelected(null);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        background: on ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: on ? '#fff' : 'rgba(255,255,255,0.7)',
        font: 'var(--font-body)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        transition: 'background var(--duration-fast) var(--ease-standard)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 19
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.count && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        background: 'var(--color-accent)',
        color: 'var(--green-900)',
        borderRadius: 'var(--radius-pill)',
        padding: '1px 8px'
      }
    }, n.count));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Lucas Operador",
    tone: "neutral"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600,
      color: '#fff'
    }
  }, "Lucas Andrade"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Operador")), /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 18,
    color: "rgba(255,255,255,0.5)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-height)',
      flex: 'none',
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--font-page-title)',
      fontSize: 'var(--text-lg)',
      flex: 1
    }
  }, titles[route]), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Buscar pedido, associado ou produto",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 18
    }),
    size: "sm"
  })), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "filter",
      size: 16
    })
  }, "Filtros"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 21
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: '24px 28px',
      minWidth: 0
    }
  }, route === 'dashboard' && /*#__PURE__*/React.createElement(DashboardScreen, {
    go: setRoute
  }), route === 'pedidos' && /*#__PURE__*/React.createElement(PedidosTable, {
    onOpen: setSelected
  }), route !== 'dashboard' && route !== 'pedidos' && /*#__PURE__*/React.createElement(Placeholder, {
    title: titles[route]
  }))), selected && /*#__PURE__*/React.createElement(PedidoDrawer, {
    pedido: selected,
    onClose: () => setSelected(null)
  }));
}

/* ------------------------------------------------------------ Dashboard ---- */
function DashboardScreen({
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }
  }, OD.metrics.map(m => /*#__PURE__*/React.createElement(StatCard, _extends({
    key: m.label
  }, m)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 18,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--font-heading)'
    }
  }, "Pedidos por status"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Junho 2026")), /*#__PURE__*/React.createElement(StatusBars, null)), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--font-heading)'
    }
  }, "Estoque baixo"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('estoque');
    },
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600
    }
  }, "Ver estoque")), [{
    nome: 'Óleo CBD 17% — 30ml',
    qtd: '4 un.',
    tone: 'error'
  }, {
    nome: 'Pomada CBD 500mg',
    qtd: '9 un.',
    tone: 'warning'
  }, {
    nome: 'Charlotte\u2019s Web — flor',
    qtd: '12 g',
    tone: 'warning'
  }].map(i => /*#__PURE__*/React.createElement("div", {
    key: i.nome,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: 'var(--font-body-sm)',
      fontWeight: 600
    }
  }, i.nome), /*#__PURE__*/React.createElement(Badge, {
    tone: i.tone,
    size: "sm"
  }, i.qtd))))));
}
function StatusBars() {
  const data = [{
    label: 'Solicitado',
    n: 18
  }, {
    label: 'Em análise',
    n: 8
  }, {
    label: 'Aprovado',
    n: 12
  }, {
    label: 'Em separação',
    n: 9
  }, {
    label: 'Pronto para retirada',
    n: 6
  }, {
    label: 'Enviado',
    n: 14
  }, {
    label: 'Entregue',
    n: 75
  }];
  const max = Math.max(...data.map(d => d.n));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 150,
      flex: 'none',
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, d.label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 10,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${d.n / max * 100}%`,
      height: '100%',
      background: 'var(--color-primary)',
      borderRadius: 'var(--radius-pill)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      textAlign: 'right',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600
    }
  }, d.n))));
}

/* ----------------------------------------------------------- Pedidos table - */
function PedidosTable({
  onOpen
}) {
  const [tab, setTab] = React.useState('todos');
  const tabs = [{
    value: 'todos',
    label: 'Todos',
    count: OD.fila.length
  }, {
    value: 'analise',
    label: 'Aguardando análise',
    count: 2
  }, {
    value: 'separacao',
    label: 'Em separação'
  }, {
    value: 'entregue',
    label: 'Entregues'
  }];
  const rows = OD.fila.filter(r => {
    if (tab === 'analise') return r.status === 'Em análise' || r.status === 'Solicitado';
    if (tab === 'separacao') return r.status === 'Em separação';
    if (tab === 'entregue') return r.status === 'Entregue';
    return true;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    tabs: tabs,
    value: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    })
  }, "Novo pedido")), /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)'
    }
  }, ['Pedido', 'Associado', 'Status', 'Itens', 'Entrega', 'Documento', 'Data', ''].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      textAlign: i === 3 ? 'center' : 'left',
      padding: '12px 16px',
      font: 'var(--font-label)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      whiteSpace: 'nowrap'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.numero,
    onClick: () => onOpen(r),
    style: {
      borderTop: '1px solid var(--border-subtle)',
      cursor: 'pointer'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--green-50)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap'
    }
  }, r.numero), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: r.paciente,
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, r.paciente))), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: TONE[r.status],
    dot: true
  }, r.status)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px',
      textAlign: 'center',
      font: 'var(--font-body-sm)'
    }
  }, r.itens), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px',
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap'
    }
  }, r.entrega), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: r.doc === 'OK' ? 'success' : 'warning',
    size: "sm"
  }, r.doc === 'OK' ? 'Verificado' : 'Pendente')), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px',
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)',
      whiteSpace: 'nowrap'
    }
  }, r.data), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '14px 16px',
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--text-tertiary)"
  }))))))));
}

/* ------------------------------------------------------------- Drawer ------ */
function PedidoDrawer({
  pedido,
  onClose
}) {
  const produtos = (D_LOOKUP(pedido.numero) || {}).produtos || [{
    nome: 'Óleo CBD 17% — 30ml',
    qtd: 1
  }, {
    nome: 'Pomada CBD 500mg',
    qtd: 1
  }];
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--surface-overlay)',
      zIndex: 40,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 440,
      maxWidth: '92vw',
      background: 'var(--surface-card)',
      height: '100vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'nucleo-slide var(--duration-slow) var(--ease-emphasized)'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes nucleo-slide{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-md)',
      fontWeight: 600
    }
  }, pedido.numero), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, pedido.paciente, " \xB7 ", pedido.data)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'var(--surface-sunken)',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      width: 34,
      height: 34,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: TONE[pedido.status],
    dot: true
  }, pedido.status), /*#__PURE__*/React.createElement(Badge, {
    tone: pedido.doc === 'OK' ? 'success' : 'warning',
    size: "sm"
  }, "Doc. ", pedido.doc === 'OK' ? 'verificado' : 'pendente')), pedido.doc !== 'OK' && /*#__PURE__*/React.createElement(Banner, {
    tone: "warning",
    title: "Documento pendente",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "alert-triangle",
      size: 18
    })
  }, "Aprove a receita do associado antes de avan\xE7ar o pedido."), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 12
    }
  }, "Produtos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, produtos.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pill",
    size: 18,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: 'var(--font-body-sm)',
      fontWeight: 600
    }
  }, p.nome), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, "\xD7", p.qtd))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 14
    }
  }, "Linha do tempo"), /*#__PURE__*/React.createElement(OrderTimeline, {
    current: pedido.status
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      gap: 10,
      padding: 20,
      borderTop: '1px solid var(--border-subtle)',
      position: 'sticky',
      bottom: 0,
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    size: "md",
    style: {
      flex: 'none'
    }
  }, "Recusar"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "Avan\xE7ar status"))));
}
function D_LOOKUP(numero) {
  return OD.pedidos.find(p => p.numero === numero);
}
function Placeholder({
  title
}) {
  return /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-8)",
    style: {
      textAlign: 'center',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "construction",
    size: 28,
    color: "var(--text-tertiary)",
    style: {
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-heading)',
      color: 'var(--text-primary)',
      marginBottom: 4
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)'
    }
  }, "Esta tela faz parte do kit completo. Demonstra\xE7\xE3o focada em Vis\xE3o geral e Pedidos."));
}
window.OperadorApp = OperadorApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/operador/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/paciente/screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const NS = window.FolhaDesignSystem_e132f0;
const {
  Button,
  Icon,
  Badge,
  Card,
  Input,
  Avatar,
  Tabs,
  Banner,
  PedidoCard,
  OrderTimeline,
  DeliveryTracking,
  StrainCard
} = NS;
const D = window.NUCLEO_DATA;
const LOGO = '../../assets/logo-mark.svg';

/* ----------------------------------------------------------- App shell ---- */
function PacienteApp() {
  const [route, setRoute] = React.useState('inicio');
  const nav = [{
    id: 'inicio',
    label: 'Início',
    icon: 'home'
  }, {
    id: 'pedidos',
    label: 'Meus pedidos',
    icon: 'package'
  }, {
    id: 'acompanhar',
    label: 'Acompanhar entrega',
    icon: 'truck'
  }, {
    id: 'catalogo',
    label: 'Catálogo',
    icon: 'book-open'
  }, {
    id: 'documentos',
    label: 'Documentos',
    icon: 'file-text'
  }];
  const titles = {
    inicio: 'Início',
    pedidos: 'Meus pedidos',
    acompanhar: 'Acompanhar entrega',
    catalogo: 'Catálogo educativo',
    documentos: 'Meus documentos'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flex: 'none',
      background: 'var(--surface-card)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '20px 20px 16px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: LOGO,
    alt: "",
    style: {
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-primary)'
    }
  }, D.tenant.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, "Portal do associado"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      padding: '8px 12px',
      flex: 1
    }
  }, nav.map(n => {
    const on = route === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => setRoute(n.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        background: on ? 'var(--color-primary-subtle)' : 'transparent',
        color: on ? 'var(--green-700)' : 'var(--text-secondary)',
        font: 'var(--font-body)',
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        transition: 'background var(--duration-fast) var(--ease-standard)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-sunken)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 19
    }), n.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.paciente.nome
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, D.paciente.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-tertiary)'
    }
  }, "Associada ", D.paciente.associada)), /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 18,
    color: "var(--text-tertiary)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--topbar-height)',
      flex: 'none',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--font-page-title)',
      fontSize: 'var(--text-lg)',
      flex: 1
    }
  }, titles[route]), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Buscar pedido ou produto",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 18
    }),
    size: "sm"
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      position: 'relative',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-secondary)',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 21
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--color-error)',
      border: '2px solid #fff'
    }
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: '28px 32px',
      maxWidth: 'var(--container-max)',
      width: '100%'
    }
  }, route === 'inicio' && /*#__PURE__*/React.createElement(InicioScreen, {
    go: setRoute
  }), route === 'pedidos' && /*#__PURE__*/React.createElement(PedidosScreen, null), route === 'acompanhar' && /*#__PURE__*/React.createElement(AcompanharScreen, null), route === 'catalogo' && /*#__PURE__*/React.createElement(CatalogoScreen, null), route === 'documentos' && /*#__PURE__*/React.createElement(DocumentosScreen, null))));
}

/* -------------------------------------------------------------- Screens ---- */
function InicioScreen({
  go
}) {
  const ativo = D.pedidos[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      color: 'var(--text-primary)'
    }
  }, "Ol\xE1, Maria \uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Voc\xEA tem 1 pedido em andamento e seus documentos est\xE3o em dia.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)'
    }
  }, "Pedido em andamento"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      marginTop: 2
    }
  }, ativo.numero)), /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    dot: true
  }, ativo.status)), /*#__PURE__*/React.createElement(OrderTimeline, {
    current: ativo.status,
    timestamps: ativo.timestamps
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "truck",
      size: 18
    }),
    onClick: () => go('acompanhar')
  }, "Acompanhar entrega"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => go('pedidos')
  }, "Ver detalhes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "success",
    title: "Documentos em dia",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shield-check",
      size: 18
    })
  }, "Sua receita \xE9 v\xE1lida at\xE9 12 dez 2026."), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 14
    }
  }, "Atalhos"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Quick, {
    icon: "plus",
    label: "Fazer pedido"
  }), /*#__PURE__*/React.createElement(Quick, {
    icon: "book-open",
    label: "Cat\xE1logo",
    onClick: () => go('catalogo')
  }), /*#__PURE__*/React.createElement(Quick, {
    icon: "file-text",
    label: "Documentos",
    onClick: () => go('documentos')
  }), /*#__PURE__*/React.createElement(Quick, {
    icon: "message-circle",
    label: "Falar com a associa\xE7\xE3o"
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--font-heading)'
    }
  }, "Pedidos recentes"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('pedidos');
    },
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600
    }
  }, "Ver todos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 16
    }
  }, D.pedidos.slice(0, 3).map(p => /*#__PURE__*/React.createElement(PedidoCard, _extends({
    key: p.numero
  }, p, {
    onClick: () => {}
  }))))));
}
function Quick({
  icon,
  label,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 14,
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all var(--duration-fast) var(--ease-standard)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--color-primary-subtle)';
      e.currentTarget.style.borderColor = 'var(--color-primary-border)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'var(--surface-card)';
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--color-primary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-body-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, label));
}
function PedidosScreen() {
  const [filter, setFilter] = React.useState('todos');
  const tabs = [{
    value: 'todos',
    label: 'Todos',
    count: D.pedidos.length
  }, {
    value: 'andamento',
    label: 'Em andamento'
  }, {
    value: 'entregue',
    label: 'Entregues'
  }];
  const list = D.pedidos.filter(p => filter === 'todos' ? true : filter === 'entregue' ? p.status === 'Entregue' : p.status !== 'Entregue');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    tabs: tabs,
    value: filter,
    onChange: setFilter
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 16
    }
  }, list.map(p => /*#__PURE__*/React.createElement(PedidoCard, _extends({
    key: p.numero
  }, p, {
    onClick: () => {}
  })))));
}
function AcompanharScreen() {
  const t = D.tracking;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(DeliveryTracking, t), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-6)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-label)',
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, "Etapas do pedido"), /*#__PURE__*/React.createElement(OrderTimeline, {
    current: t.status
  })));
}
function CatalogoScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "info",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 18
    })
  }, "As informa\xE7\xF5es abaixo s\xE3o educativas e n\xE3o substituem orienta\xE7\xE3o m\xE9dica."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 18
    }
  }, D.catalogo.map(s => /*#__PURE__*/React.createElement(StrainCard, _extends({
    key: s.nome
  }, s, {
    onClick: () => {}
  })))));
}
function DocumentosScreen() {
  const toneMap = {
    'Aprovado': 'success',
    'Em análise': 'warning',
    'Recusado': 'error'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      maxWidth: 720
    }
  }, D.documentos.map(doc => /*#__PURE__*/React.createElement(Card, {
    key: doc.nome,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, doc.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--font-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, doc.validade)), /*#__PURE__*/React.createElement(Badge, {
    tone: toneMap[doc.status],
    dot: true
  }, doc.status), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    rightIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 16
    })
  }, "Baixar"))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "upload",
      size: 18
    }),
    style: {
      alignSelf: 'flex-start'
    }
  }, "Enviar novo documento"));
}
window.PacienteApp = PacienteApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/paciente/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.DeliveryTracking = __ds_scope.DeliveryTracking;

__ds_ns.OrderTimeline = __ds_scope.OrderTimeline;

__ds_ns.PedidoCard = __ds_scope.PedidoCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.StrainCard = __ds_scope.StrainCard;

__ds_ns.ORDER_STAGES = __ds_scope.ORDER_STAGES;

__ds_ns.STATUS_TONE = __ds_scope.STATUS_TONE;

__ds_ns.STATUS_ICON = __ds_scope.STATUS_ICON;

})();

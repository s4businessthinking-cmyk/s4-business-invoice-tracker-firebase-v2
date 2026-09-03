function _m(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var rc = { exports: {} }, ss = {}, tc = { exports: {} }, Ye = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Rd;
function km() {
  if (Rd) return Ye;
  Rd = 1;
  var e = Symbol.for("react.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), o = Symbol.for("react.provider"), c = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), p = Symbol.for("react.lazy"), g = Symbol.iterator;
  function w(U) {
    return U === null || typeof U != "object" ? null : (U = g && U[g] || U["@@iterator"], typeof U == "function" ? U : null);
  }
  var k = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, _ = Object.assign, y = {};
  function E(U, F, X) {
    this.props = U, this.context = F, this.refs = y, this.updater = X || k;
  }
  E.prototype.isReactComponent = {}, E.prototype.setState = function(U, F) {
    if (typeof U != "object" && typeof U != "function" && U != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, U, F, "setState");
  }, E.prototype.forceUpdate = function(U) {
    this.updater.enqueueForceUpdate(this, U, "forceUpdate");
  };
  function A() {
  }
  A.prototype = E.prototype;
  function O(U, F, X) {
    this.props = U, this.context = F, this.refs = y, this.updater = X || k;
  }
  var N = O.prototype = new A();
  N.constructor = O, _(N, E.prototype), N.isPureReactComponent = !0;
  var V = Array.isArray, J = Object.prototype.hasOwnProperty, j = { current: null }, C = { key: !0, ref: !0, __self: !0, __source: !0 };
  function G(U, F, X) {
    var z, H = {}, ue = null, K = null;
    if (F != null) for (z in F.ref !== void 0 && (K = F.ref), F.key !== void 0 && (ue = "" + F.key), F) J.call(F, z) && !C.hasOwnProperty(z) && (H[z] = F[z]);
    var te = arguments.length - 2;
    if (te === 1) H.children = X;
    else if (1 < te) {
      for (var Z = Array(te), fe = 0; fe < te; fe++) Z[fe] = arguments[fe + 2];
      H.children = Z;
    }
    if (U && U.defaultProps) for (z in te = U.defaultProps, te) H[z] === void 0 && (H[z] = te[z]);
    return { $$typeof: e, type: U, key: ue, ref: K, props: H, _owner: j.current };
  }
  function B(U, F) {
    return { $$typeof: e, type: U.type, key: F, ref: U.ref, props: U.props, _owner: U._owner };
  }
  function le(U) {
    return typeof U == "object" && U !== null && U.$$typeof === e;
  }
  function re(U) {
    var F = { "=": "=0", ":": "=2" };
    return "$" + U.replace(/[=:]/g, function(X) {
      return F[X];
    });
  }
  var Q = /\/+/g;
  function pe(U, F) {
    return typeof U == "object" && U !== null && U.key != null ? re("" + U.key) : F.toString(36);
  }
  function Ce(U, F, X, z, H) {
    var ue = typeof U;
    (ue === "undefined" || ue === "boolean") && (U = null);
    var K = !1;
    if (U === null) K = !0;
    else switch (ue) {
      case "string":
      case "number":
        K = !0;
        break;
      case "object":
        switch (U.$$typeof) {
          case e:
          case n:
            K = !0;
        }
    }
    if (K) return K = U, H = H(K), U = z === "" ? "." + pe(K, 0) : z, V(H) ? (X = "", U != null && (X = U.replace(Q, "$&/") + "/"), Ce(H, F, X, "", function(fe) {
      return fe;
    })) : H != null && (le(H) && (H = B(H, X + (!H.key || K && K.key === H.key ? "" : ("" + H.key).replace(Q, "$&/") + "/") + U)), F.push(H)), 1;
    if (K = 0, z = z === "" ? "." : z + ":", V(U)) for (var te = 0; te < U.length; te++) {
      ue = U[te];
      var Z = z + pe(ue, te);
      K += Ce(ue, F, X, Z, H);
    }
    else if (Z = w(U), typeof Z == "function") for (U = Z.call(U), te = 0; !(ue = U.next()).done; ) ue = ue.value, Z = z + pe(ue, te++), K += Ce(ue, F, X, Z, H);
    else if (ue === "object") throw F = String(U), Error("Objects are not valid as a React child (found: " + (F === "[object Object]" ? "object with keys {" + Object.keys(U).join(", ") + "}" : F) + "). If you meant to render a collection of children, use an array instead.");
    return K;
  }
  function xe(U, F, X) {
    if (U == null) return U;
    var z = [], H = 0;
    return Ce(U, z, "", "", function(ue) {
      return F.call(X, ue, H++);
    }), z;
  }
  function we(U) {
    if (U._status === -1) {
      var F = U._result;
      F = F(), F.then(function(X) {
        (U._status === 0 || U._status === -1) && (U._status = 1, U._result = X);
      }, function(X) {
        (U._status === 0 || U._status === -1) && (U._status = 2, U._result = X);
      }), U._status === -1 && (U._status = 0, U._result = F);
    }
    if (U._status === 1) return U._result.default;
    throw U._result;
  }
  var ye = { current: null }, ge = { transition: null }, Y = { ReactCurrentDispatcher: ye, ReactCurrentBatchConfig: ge, ReactCurrentOwner: j };
  function he() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Ye.Children = { map: xe, forEach: function(U, F, X) {
    xe(U, function() {
      F.apply(this, arguments);
    }, X);
  }, count: function(U) {
    var F = 0;
    return xe(U, function() {
      F++;
    }), F;
  }, toArray: function(U) {
    return xe(U, function(F) {
      return F;
    }) || [];
  }, only: function(U) {
    if (!le(U)) throw Error("React.Children.only expected to receive a single React element child.");
    return U;
  } }, Ye.Component = E, Ye.Fragment = r, Ye.Profiler = i, Ye.PureComponent = O, Ye.StrictMode = s, Ye.Suspense = d, Ye.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Y, Ye.act = he, Ye.cloneElement = function(U, F, X) {
    if (U == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + U + ".");
    var z = _({}, U.props), H = U.key, ue = U.ref, K = U._owner;
    if (F != null) {
      if (F.ref !== void 0 && (ue = F.ref, K = j.current), F.key !== void 0 && (H = "" + F.key), U.type && U.type.defaultProps) var te = U.type.defaultProps;
      for (Z in F) J.call(F, Z) && !C.hasOwnProperty(Z) && (z[Z] = F[Z] === void 0 && te !== void 0 ? te[Z] : F[Z]);
    }
    var Z = arguments.length - 2;
    if (Z === 1) z.children = X;
    else if (1 < Z) {
      te = Array(Z);
      for (var fe = 0; fe < Z; fe++) te[fe] = arguments[fe + 2];
      z.children = te;
    }
    return { $$typeof: e, type: U.type, key: H, ref: ue, props: z, _owner: K };
  }, Ye.createContext = function(U) {
    return U = { $$typeof: c, _currentValue: U, _currentValue2: U, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, U.Provider = { $$typeof: o, _context: U }, U.Consumer = U;
  }, Ye.createElement = G, Ye.createFactory = function(U) {
    var F = G.bind(null, U);
    return F.type = U, F;
  }, Ye.createRef = function() {
    return { current: null };
  }, Ye.forwardRef = function(U) {
    return { $$typeof: u, render: U };
  }, Ye.isValidElement = le, Ye.lazy = function(U) {
    return { $$typeof: p, _payload: { _status: -1, _result: U }, _init: we };
  }, Ye.memo = function(U, F) {
    return { $$typeof: x, type: U, compare: F === void 0 ? null : F };
  }, Ye.startTransition = function(U) {
    var F = ge.transition;
    ge.transition = {};
    try {
      U();
    } finally {
      ge.transition = F;
    }
  }, Ye.unstable_act = he, Ye.useCallback = function(U, F) {
    return ye.current.useCallback(U, F);
  }, Ye.useContext = function(U) {
    return ye.current.useContext(U);
  }, Ye.useDebugValue = function() {
  }, Ye.useDeferredValue = function(U) {
    return ye.current.useDeferredValue(U);
  }, Ye.useEffect = function(U, F) {
    return ye.current.useEffect(U, F);
  }, Ye.useId = function() {
    return ye.current.useId();
  }, Ye.useImperativeHandle = function(U, F, X) {
    return ye.current.useImperativeHandle(U, F, X);
  }, Ye.useInsertionEffect = function(U, F) {
    return ye.current.useInsertionEffect(U, F);
  }, Ye.useLayoutEffect = function(U, F) {
    return ye.current.useLayoutEffect(U, F);
  }, Ye.useMemo = function(U, F) {
    return ye.current.useMemo(U, F);
  }, Ye.useReducer = function(U, F, X) {
    return ye.current.useReducer(U, F, X);
  }, Ye.useRef = function(U) {
    return ye.current.useRef(U);
  }, Ye.useState = function(U) {
    return ye.current.useState(U);
  }, Ye.useSyncExternalStore = function(U, F, X) {
    return ye.current.useSyncExternalStore(U, F, X);
  }, Ye.useTransition = function() {
    return ye.current.useTransition();
  }, Ye.version = "18.3.1", Ye;
}
var Dd;
function Oc() {
  return Dd || (Dd = 1, tc.exports = km()), tc.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Od;
function Em() {
  if (Od) return ss;
  Od = 1;
  var e = Oc(), n = Symbol.for("react.element"), r = Symbol.for("react.fragment"), s = Object.prototype.hasOwnProperty, i = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, o = { key: !0, ref: !0, __self: !0, __source: !0 };
  function c(u, d, x) {
    var p, g = {}, w = null, k = null;
    x !== void 0 && (w = "" + x), d.key !== void 0 && (w = "" + d.key), d.ref !== void 0 && (k = d.ref);
    for (p in d) s.call(d, p) && !o.hasOwnProperty(p) && (g[p] = d[p]);
    if (u && u.defaultProps) for (p in d = u.defaultProps, d) g[p] === void 0 && (g[p] = d[p]);
    return { $$typeof: n, type: u, key: w, ref: k, props: g, _owner: i.current };
  }
  return ss.Fragment = r, ss.jsx = c, ss.jsxs = c, ss;
}
var Pd;
function Sm() {
  return Pd || (Pd = 1, rc.exports = Em()), rc.exports;
}
var v = Sm(), Ae = Oc();
const Tm = /* @__PURE__ */ _m(Ae);
var Xl = {}, nc = { exports: {} }, wt = {}, ac = { exports: {} }, ic = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var bd;
function Cm() {
  return bd || (bd = 1, (function(e) {
    function n(ge, Y) {
      var he = ge.length;
      ge.push(Y);
      e: for (; 0 < he; ) {
        var U = he - 1 >>> 1, F = ge[U];
        if (0 < i(F, Y)) ge[U] = Y, ge[he] = F, he = U;
        else break e;
      }
    }
    function r(ge) {
      return ge.length === 0 ? null : ge[0];
    }
    function s(ge) {
      if (ge.length === 0) return null;
      var Y = ge[0], he = ge.pop();
      if (he !== Y) {
        ge[0] = he;
        e: for (var U = 0, F = ge.length, X = F >>> 1; U < X; ) {
          var z = 2 * (U + 1) - 1, H = ge[z], ue = z + 1, K = ge[ue];
          if (0 > i(H, he)) ue < F && 0 > i(K, H) ? (ge[U] = K, ge[ue] = he, U = ue) : (ge[U] = H, ge[z] = he, U = z);
          else if (ue < F && 0 > i(K, he)) ge[U] = K, ge[ue] = he, U = ue;
          else break e;
        }
      }
      return Y;
    }
    function i(ge, Y) {
      var he = ge.sortIndex - Y.sortIndex;
      return he !== 0 ? he : ge.id - Y.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var o = performance;
      e.unstable_now = function() {
        return o.now();
      };
    } else {
      var c = Date, u = c.now();
      e.unstable_now = function() {
        return c.now() - u;
      };
    }
    var d = [], x = [], p = 1, g = null, w = 3, k = !1, _ = !1, y = !1, E = typeof setTimeout == "function" ? setTimeout : null, A = typeof clearTimeout == "function" ? clearTimeout : null, O = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function N(ge) {
      for (var Y = r(x); Y !== null; ) {
        if (Y.callback === null) s(x);
        else if (Y.startTime <= ge) s(x), Y.sortIndex = Y.expirationTime, n(d, Y);
        else break;
        Y = r(x);
      }
    }
    function V(ge) {
      if (y = !1, N(ge), !_) if (r(d) !== null) _ = !0, we(J);
      else {
        var Y = r(x);
        Y !== null && ye(V, Y.startTime - ge);
      }
    }
    function J(ge, Y) {
      _ = !1, y && (y = !1, A(G), G = -1), k = !0;
      var he = w;
      try {
        for (N(Y), g = r(d); g !== null && (!(g.expirationTime > Y) || ge && !re()); ) {
          var U = g.callback;
          if (typeof U == "function") {
            g.callback = null, w = g.priorityLevel;
            var F = U(g.expirationTime <= Y);
            Y = e.unstable_now(), typeof F == "function" ? g.callback = F : g === r(d) && s(d), N(Y);
          } else s(d);
          g = r(d);
        }
        if (g !== null) var X = !0;
        else {
          var z = r(x);
          z !== null && ye(V, z.startTime - Y), X = !1;
        }
        return X;
      } finally {
        g = null, w = he, k = !1;
      }
    }
    var j = !1, C = null, G = -1, B = 5, le = -1;
    function re() {
      return !(e.unstable_now() - le < B);
    }
    function Q() {
      if (C !== null) {
        var ge = e.unstable_now();
        le = ge;
        var Y = !0;
        try {
          Y = C(!0, ge);
        } finally {
          Y ? pe() : (j = !1, C = null);
        }
      } else j = !1;
    }
    var pe;
    if (typeof O == "function") pe = function() {
      O(Q);
    };
    else if (typeof MessageChannel < "u") {
      var Ce = new MessageChannel(), xe = Ce.port2;
      Ce.port1.onmessage = Q, pe = function() {
        xe.postMessage(null);
      };
    } else pe = function() {
      E(Q, 0);
    };
    function we(ge) {
      C = ge, j || (j = !0, pe());
    }
    function ye(ge, Y) {
      G = E(function() {
        ge(e.unstable_now());
      }, Y);
    }
    e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(ge) {
      ge.callback = null;
    }, e.unstable_continueExecution = function() {
      _ || k || (_ = !0, we(J));
    }, e.unstable_forceFrameRate = function(ge) {
      0 > ge || 125 < ge ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : B = 0 < ge ? Math.floor(1e3 / ge) : 5;
    }, e.unstable_getCurrentPriorityLevel = function() {
      return w;
    }, e.unstable_getFirstCallbackNode = function() {
      return r(d);
    }, e.unstable_next = function(ge) {
      switch (w) {
        case 1:
        case 2:
        case 3:
          var Y = 3;
          break;
        default:
          Y = w;
      }
      var he = w;
      w = Y;
      try {
        return ge();
      } finally {
        w = he;
      }
    }, e.unstable_pauseExecution = function() {
    }, e.unstable_requestPaint = function() {
    }, e.unstable_runWithPriority = function(ge, Y) {
      switch (ge) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          ge = 3;
      }
      var he = w;
      w = ge;
      try {
        return Y();
      } finally {
        w = he;
      }
    }, e.unstable_scheduleCallback = function(ge, Y, he) {
      var U = e.unstable_now();
      switch (typeof he == "object" && he !== null ? (he = he.delay, he = typeof he == "number" && 0 < he ? U + he : U) : he = U, ge) {
        case 1:
          var F = -1;
          break;
        case 2:
          F = 250;
          break;
        case 5:
          F = 1073741823;
          break;
        case 4:
          F = 1e4;
          break;
        default:
          F = 5e3;
      }
      return F = he + F, ge = { id: p++, callback: Y, priorityLevel: ge, startTime: he, expirationTime: F, sortIndex: -1 }, he > U ? (ge.sortIndex = he, n(x, ge), r(d) === null && ge === r(x) && (y ? (A(G), G = -1) : y = !0, ye(V, he - U))) : (ge.sortIndex = F, n(d, ge), _ || k || (_ = !0, we(J))), ge;
    }, e.unstable_shouldYield = re, e.unstable_wrapCallback = function(ge) {
      var Y = w;
      return function() {
        var he = w;
        w = Y;
        try {
          return ge.apply(this, arguments);
        } finally {
          w = he;
        }
      };
    };
  })(ic)), ic;
}
var Id;
function Am() {
  return Id || (Id = 1, ac.exports = Cm()), ac.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ld;
function Fm() {
  if (Ld) return wt;
  Ld = 1;
  var e = Oc(), n = Am();
  function r(t) {
    for (var a = "https://reactjs.org/docs/error-decoder.html?invariant=" + t, l = 1; l < arguments.length; l++) a += "&args[]=" + encodeURIComponent(arguments[l]);
    return "Minified React error #" + t + "; visit " + a + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var s = /* @__PURE__ */ new Set(), i = {};
  function o(t, a) {
    c(t, a), c(t + "Capture", a);
  }
  function c(t, a) {
    for (i[t] = a, t = 0; t < a.length; t++) s.add(a[t]);
  }
  var u = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), d = Object.prototype.hasOwnProperty, x = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, p = {}, g = {};
  function w(t) {
    return d.call(g, t) ? !0 : d.call(p, t) ? !1 : x.test(t) ? g[t] = !0 : (p[t] = !0, !1);
  }
  function k(t, a, l, f) {
    if (l !== null && l.type === 0) return !1;
    switch (typeof a) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return f ? !1 : l !== null ? !l.acceptsBooleans : (t = t.toLowerCase().slice(0, 5), t !== "data-" && t !== "aria-");
      default:
        return !1;
    }
  }
  function _(t, a, l, f) {
    if (a === null || typeof a > "u" || k(t, a, l, f)) return !0;
    if (f) return !1;
    if (l !== null) switch (l.type) {
      case 3:
        return !a;
      case 4:
        return a === !1;
      case 5:
        return isNaN(a);
      case 6:
        return isNaN(a) || 1 > a;
    }
    return !1;
  }
  function y(t, a, l, f, h, m, S) {
    this.acceptsBooleans = a === 2 || a === 3 || a === 4, this.attributeName = f, this.attributeNamespace = h, this.mustUseProperty = l, this.propertyName = t, this.type = a, this.sanitizeURL = m, this.removeEmptyString = S;
  }
  var E = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t) {
    E[t] = new y(t, 0, !1, t, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(t) {
    var a = t[0];
    E[a] = new y(a, 1, !1, t[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(t) {
    E[t] = new y(t, 2, !1, t.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(t) {
    E[t] = new y(t, 2, !1, t, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t) {
    E[t] = new y(t, 3, !1, t.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(t) {
    E[t] = new y(t, 3, !0, t, null, !1, !1);
  }), ["capture", "download"].forEach(function(t) {
    E[t] = new y(t, 4, !1, t, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(t) {
    E[t] = new y(t, 6, !1, t, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(t) {
    E[t] = new y(t, 5, !1, t.toLowerCase(), null, !1, !1);
  });
  var A = /[\-:]([a-z])/g;
  function O(t) {
    return t[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t) {
    var a = t.replace(
      A,
      O
    );
    E[a] = new y(a, 1, !1, t, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t) {
    var a = t.replace(A, O);
    E[a] = new y(a, 1, !1, t, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(t) {
    var a = t.replace(A, O);
    E[a] = new y(a, 1, !1, t, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(t) {
    E[t] = new y(t, 1, !1, t.toLowerCase(), null, !1, !1);
  }), E.xlinkHref = new y("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(t) {
    E[t] = new y(t, 1, !1, t.toLowerCase(), null, !0, !0);
  });
  function N(t, a, l, f) {
    var h = E.hasOwnProperty(a) ? E[a] : null;
    (h !== null ? h.type !== 0 : f || !(2 < a.length) || a[0] !== "o" && a[0] !== "O" || a[1] !== "n" && a[1] !== "N") && (_(a, l, h, f) && (l = null), f || h === null ? w(a) && (l === null ? t.removeAttribute(a) : t.setAttribute(a, "" + l)) : h.mustUseProperty ? t[h.propertyName] = l === null ? h.type === 3 ? !1 : "" : l : (a = h.attributeName, f = h.attributeNamespace, l === null ? t.removeAttribute(a) : (h = h.type, l = h === 3 || h === 4 && l === !0 ? "" : "" + l, f ? t.setAttributeNS(f, a, l) : t.setAttribute(a, l))));
  }
  var V = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, J = Symbol.for("react.element"), j = Symbol.for("react.portal"), C = Symbol.for("react.fragment"), G = Symbol.for("react.strict_mode"), B = Symbol.for("react.profiler"), le = Symbol.for("react.provider"), re = Symbol.for("react.context"), Q = Symbol.for("react.forward_ref"), pe = Symbol.for("react.suspense"), Ce = Symbol.for("react.suspense_list"), xe = Symbol.for("react.memo"), we = Symbol.for("react.lazy"), ye = Symbol.for("react.offscreen"), ge = Symbol.iterator;
  function Y(t) {
    return t === null || typeof t != "object" ? null : (t = ge && t[ge] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  var he = Object.assign, U;
  function F(t) {
    if (U === void 0) try {
      throw Error();
    } catch (l) {
      var a = l.stack.trim().match(/\n( *(at )?)/);
      U = a && a[1] || "";
    }
    return `
` + U + t;
  }
  var X = !1;
  function z(t, a) {
    if (!t || X) return "";
    X = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (a) if (a = function() {
        throw Error();
      }, Object.defineProperty(a.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(a, []);
        } catch (ce) {
          var f = ce;
        }
        Reflect.construct(t, [], a);
      } else {
        try {
          a.call();
        } catch (ce) {
          f = ce;
        }
        t.call(a.prototype);
      }
      else {
        try {
          throw Error();
        } catch (ce) {
          f = ce;
        }
        t();
      }
    } catch (ce) {
      if (ce && f && typeof ce.stack == "string") {
        for (var h = ce.stack.split(`
`), m = f.stack.split(`
`), S = h.length - 1, M = m.length - 1; 1 <= S && 0 <= M && h[S] !== m[M]; ) M--;
        for (; 1 <= S && 0 <= M; S--, M--) if (h[S] !== m[M]) {
          if (S !== 1 || M !== 1)
            do
              if (S--, M--, 0 > M || h[S] !== m[M]) {
                var W = `
` + h[S].replace(" at new ", " at ");
                return t.displayName && W.includes("<anonymous>") && (W = W.replace("<anonymous>", t.displayName)), W;
              }
            while (1 <= S && 0 <= M);
          break;
        }
      }
    } finally {
      X = !1, Error.prepareStackTrace = l;
    }
    return (t = t ? t.displayName || t.name : "") ? F(t) : "";
  }
  function H(t) {
    switch (t.tag) {
      case 5:
        return F(t.type);
      case 16:
        return F("Lazy");
      case 13:
        return F("Suspense");
      case 19:
        return F("SuspenseList");
      case 0:
      case 2:
      case 15:
        return t = z(t.type, !1), t;
      case 11:
        return t = z(t.type.render, !1), t;
      case 1:
        return t = z(t.type, !0), t;
      default:
        return "";
    }
  }
  function ue(t) {
    if (t == null) return null;
    if (typeof t == "function") return t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case C:
        return "Fragment";
      case j:
        return "Portal";
      case B:
        return "Profiler";
      case G:
        return "StrictMode";
      case pe:
        return "Suspense";
      case Ce:
        return "SuspenseList";
    }
    if (typeof t == "object") switch (t.$$typeof) {
      case re:
        return (t.displayName || "Context") + ".Consumer";
      case le:
        return (t._context.displayName || "Context") + ".Provider";
      case Q:
        var a = t.render;
        return t = t.displayName, t || (t = a.displayName || a.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
      case xe:
        return a = t.displayName || null, a !== null ? a : ue(t.type) || "Memo";
      case we:
        a = t._payload, t = t._init;
        try {
          return ue(t(a));
        } catch {
        }
    }
    return null;
  }
  function K(t) {
    var a = t.type;
    switch (t.tag) {
      case 24:
        return "Cache";
      case 9:
        return (a.displayName || "Context") + ".Consumer";
      case 10:
        return (a._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return t = a.render, t = t.displayName || t.name || "", a.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return a;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ue(a);
      case 8:
        return a === G ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof a == "function") return a.displayName || a.name || null;
        if (typeof a == "string") return a;
    }
    return null;
  }
  function te(t) {
    switch (typeof t) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return t;
      case "object":
        return t;
      default:
        return "";
    }
  }
  function Z(t) {
    var a = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (a === "checkbox" || a === "radio");
  }
  function fe(t) {
    var a = Z(t) ? "checked" : "value", l = Object.getOwnPropertyDescriptor(t.constructor.prototype, a), f = "" + t[a];
    if (!t.hasOwnProperty(a) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var h = l.get, m = l.set;
      return Object.defineProperty(t, a, { configurable: !0, get: function() {
        return h.call(this);
      }, set: function(S) {
        f = "" + S, m.call(this, S);
      } }), Object.defineProperty(t, a, { enumerable: l.enumerable }), { getValue: function() {
        return f;
      }, setValue: function(S) {
        f = "" + S;
      }, stopTracking: function() {
        t._valueTracker = null, delete t[a];
      } };
    }
  }
  function Pe(t) {
    t._valueTracker || (t._valueTracker = fe(t));
  }
  function P(t) {
    if (!t) return !1;
    var a = t._valueTracker;
    if (!a) return !0;
    var l = a.getValue(), f = "";
    return t && (f = Z(t) ? t.checked ? "true" : "false" : t.value), t = f, t !== l ? (a.setValue(t), !0) : !1;
  }
  function Xe(t) {
    if (t = t || (typeof document < "u" ? document : void 0), typeof t > "u") return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  function je(t, a) {
    var l = a.checked;
    return he({}, a, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: l ?? t._wrapperState.initialChecked });
  }
  function Ke(t, a) {
    var l = a.defaultValue == null ? "" : a.defaultValue, f = a.checked != null ? a.checked : a.defaultChecked;
    l = te(a.value != null ? a.value : l), t._wrapperState = { initialChecked: f, initialValue: l, controlled: a.type === "checkbox" || a.type === "radio" ? a.checked != null : a.value != null };
  }
  function Ve(t, a) {
    a = a.checked, a != null && N(t, "checked", a, !1);
  }
  function Fe(t, a) {
    Ve(t, a);
    var l = te(a.value), f = a.type;
    if (l != null) f === "number" ? (l === 0 && t.value === "" || t.value != l) && (t.value = "" + l) : t.value !== "" + l && (t.value = "" + l);
    else if (f === "submit" || f === "reset") {
      t.removeAttribute("value");
      return;
    }
    a.hasOwnProperty("value") ? Gr(t, a.type, l) : a.hasOwnProperty("defaultValue") && Gr(t, a.type, te(a.defaultValue)), a.checked == null && a.defaultChecked != null && (t.defaultChecked = !!a.defaultChecked);
  }
  function ur(t, a, l) {
    if (a.hasOwnProperty("value") || a.hasOwnProperty("defaultValue")) {
      var f = a.type;
      if (!(f !== "submit" && f !== "reset" || a.value !== void 0 && a.value !== null)) return;
      a = "" + t._wrapperState.initialValue, l || a === t.value || (t.value = a), t.defaultValue = a;
    }
    l = t.name, l !== "" && (t.name = ""), t.defaultChecked = !!t._wrapperState.initialChecked, l !== "" && (t.name = l);
  }
  function Gr(t, a, l) {
    (a !== "number" || Xe(t.ownerDocument) !== t) && (l == null ? t.defaultValue = "" + t._wrapperState.initialValue : t.defaultValue !== "" + l && (t.defaultValue = "" + l));
  }
  var $r = Array.isArray;
  function Kr(t, a, l, f) {
    if (t = t.options, a) {
      a = {};
      for (var h = 0; h < l.length; h++) a["$" + l[h]] = !0;
      for (l = 0; l < t.length; l++) h = a.hasOwnProperty("$" + t[l].value), t[l].selected !== h && (t[l].selected = h), h && f && (t[l].defaultSelected = !0);
    } else {
      for (l = "" + te(l), a = null, h = 0; h < t.length; h++) {
        if (t[h].value === l) {
          t[h].selected = !0, f && (t[h].defaultSelected = !0);
          return;
        }
        a !== null || t[h].disabled || (a = t[h]);
      }
      a !== null && (a.selected = !0);
    }
  }
  function pn(t, a) {
    if (a.dangerouslySetInnerHTML != null) throw Error(r(91));
    return he({}, a, { value: void 0, defaultValue: void 0, children: "" + t._wrapperState.initialValue });
  }
  function Ht(t, a) {
    var l = a.value;
    if (l == null) {
      if (l = a.children, a = a.defaultValue, l != null) {
        if (a != null) throw Error(r(92));
        if ($r(l)) {
          if (1 < l.length) throw Error(r(93));
          l = l[0];
        }
        a = l;
      }
      a == null && (a = ""), l = a;
    }
    t._wrapperState = { initialValue: te(l) };
  }
  function Xr(t, a) {
    var l = te(a.value), f = te(a.defaultValue);
    l != null && (l = "" + l, l !== t.value && (t.value = l), a.defaultValue == null && t.defaultValue !== l && (t.defaultValue = l)), f != null && (t.defaultValue = "" + f);
  }
  function Nt(t) {
    var a = t.textContent;
    a === t._wrapperState.initialValue && a !== "" && a !== null && (t.value = a);
  }
  function Vt(t) {
    switch (t) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function xn(t, a) {
    return t == null || t === "http://www.w3.org/1999/xhtml" ? Vt(a) : t === "http://www.w3.org/2000/svg" && a === "foreignObject" ? "http://www.w3.org/1999/xhtml" : t;
  }
  var Er, _t = (function(t) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(a, l, f, h) {
      MSApp.execUnsafeLocalFunction(function() {
        return t(a, l, f, h);
      });
    } : t;
  })(function(t, a) {
    if (t.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in t) t.innerHTML = a;
    else {
      for (Er = Er || document.createElement("div"), Er.innerHTML = "<svg>" + a.valueOf().toString() + "</svg>", a = Er.firstChild; t.firstChild; ) t.removeChild(t.firstChild);
      for (; a.firstChild; ) t.appendChild(a.firstChild);
    }
  });
  function We(t, a) {
    if (a) {
      var l = t.firstChild;
      if (l && l === t.lastChild && l.nodeType === 3) {
        l.nodeValue = a;
        return;
      }
    }
    t.textContent = a;
  }
  var nr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, ht = ["Webkit", "ms", "Moz", "O"];
  Object.keys(nr).forEach(function(t) {
    ht.forEach(function(a) {
      a = a + t.charAt(0).toUpperCase() + t.substring(1), nr[a] = nr[t];
    });
  });
  function xr(t, a, l) {
    return a == null || typeof a == "boolean" || a === "" ? "" : l || typeof a != "number" || a === 0 || nr.hasOwnProperty(t) && nr[t] ? ("" + a).trim() : a + "px";
  }
  function tn(t, a) {
    t = t.style;
    for (var l in a) if (a.hasOwnProperty(l)) {
      var f = l.indexOf("--") === 0, h = xr(l, a[l], f);
      l === "float" && (l = "cssFloat"), f ? t.setProperty(l, h) : t[l] = h;
    }
  }
  var js = he({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function ki(t, a) {
    if (a) {
      if (js[t] && (a.children != null || a.dangerouslySetInnerHTML != null)) throw Error(r(137, t));
      if (a.dangerouslySetInnerHTML != null) {
        if (a.children != null) throw Error(r(60));
        if (typeof a.dangerouslySetInnerHTML != "object" || !("__html" in a.dangerouslySetInnerHTML)) throw Error(r(61));
      }
      if (a.style != null && typeof a.style != "object") throw Error(r(62));
    }
  }
  function Ei(t, a) {
    if (t.indexOf("-") === -1) return typeof a.is == "string";
    switch (t) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var ja = null;
  function Ua(t) {
    return t = t.target || t.srcElement || window, t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === 3 ? t.parentNode : t;
  }
  var za = null, On = null, Pn = null;
  function oa(t) {
    if (t = Gi(t)) {
      if (typeof za != "function") throw Error(r(280));
      var a = t.stateNode;
      a && (a = cl(a), za(t.stateNode, t.type, a));
    }
  }
  function Us(t) {
    On ? Pn ? Pn.push(t) : Pn = [t] : On = t;
  }
  function zs() {
    if (On) {
      var t = On, a = Pn;
      if (Pn = On = null, oa(t), a) for (t = 0; t < a.length; t++) oa(a[t]);
    }
  }
  function Hs(t, a) {
    return t(a);
  }
  function Vs() {
  }
  var Si = !1;
  function Ws(t, a, l) {
    if (Si) return t(a, l);
    Si = !0;
    try {
      return Hs(t, a, l);
    } finally {
      Si = !1, (On !== null || Pn !== null) && (Vs(), zs());
    }
  }
  function ca(t, a) {
    var l = t.stateNode;
    if (l === null) return null;
    var f = cl(l);
    if (f === null) return null;
    l = f[a];
    e: switch (a) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (f = !f.disabled) || (t = t.type, f = !(t === "button" || t === "input" || t === "select" || t === "textarea")), t = !f;
        break e;
      default:
        t = !1;
    }
    if (t) return null;
    if (l && typeof l != "function") throw Error(r(231, a, typeof l));
    return l;
  }
  var Ti = !1;
  if (u) try {
    var mn = {};
    Object.defineProperty(mn, "passive", { get: function() {
      Ti = !0;
    } }), window.addEventListener("test", mn, mn), window.removeEventListener("test", mn, mn);
  } catch {
    Ti = !1;
  }
  function _o(t, a, l, f, h, m, S, M, W) {
    var ce = Array.prototype.slice.call(arguments, 3);
    try {
      a.apply(l, ce);
    } catch (ve) {
      this.onError(ve);
    }
  }
  var ua = !1, Ha = null, T = !1, b = null, R = { onError: function(t) {
    ua = !0, Ha = t;
  } };
  function D(t, a, l, f, h, m, S, M, W) {
    ua = !1, Ha = null, _o.apply(R, arguments);
  }
  function I(t, a, l, f, h, m, S, M, W) {
    if (D.apply(this, arguments), ua) {
      if (ua) {
        var ce = Ha;
        ua = !1, Ha = null;
      } else throw Error(r(198));
      T || (T = !0, b = ce);
    }
  }
  function L(t) {
    var a = t, l = t;
    if (t.alternate) for (; a.return; ) a = a.return;
    else {
      t = a;
      do
        a = t, (a.flags & 4098) !== 0 && (l = a.return), t = a.return;
      while (t);
    }
    return a.tag === 3 ? l : null;
  }
  function ie(t) {
    if (t.tag === 13) {
      var a = t.memoizedState;
      if (a === null && (t = t.alternate, t !== null && (a = t.memoizedState)), a !== null) return a.dehydrated;
    }
    return null;
  }
  function de(t) {
    if (L(t) !== t) throw Error(r(188));
  }
  function ae(t) {
    var a = t.alternate;
    if (!a) {
      if (a = L(t), a === null) throw Error(r(188));
      return a !== t ? null : t;
    }
    for (var l = t, f = a; ; ) {
      var h = l.return;
      if (h === null) break;
      var m = h.alternate;
      if (m === null) {
        if (f = h.return, f !== null) {
          l = f;
          continue;
        }
        break;
      }
      if (h.child === m.child) {
        for (m = h.child; m; ) {
          if (m === l) return de(h), t;
          if (m === f) return de(h), a;
          m = m.sibling;
        }
        throw Error(r(188));
      }
      if (l.return !== f.return) l = h, f = m;
      else {
        for (var S = !1, M = h.child; M; ) {
          if (M === l) {
            S = !0, l = h, f = m;
            break;
          }
          if (M === f) {
            S = !0, f = h, l = m;
            break;
          }
          M = M.sibling;
        }
        if (!S) {
          for (M = m.child; M; ) {
            if (M === l) {
              S = !0, l = m, f = h;
              break;
            }
            if (M === f) {
              S = !0, f = m, l = h;
              break;
            }
            M = M.sibling;
          }
          if (!S) throw Error(r(189));
        }
      }
      if (l.alternate !== f) throw Error(r(190));
    }
    if (l.tag !== 3) throw Error(r(188));
    return l.stateNode.current === l ? t : a;
  }
  function se(t) {
    return t = ae(t), t !== null ? oe(t) : null;
  }
  function oe(t) {
    if (t.tag === 5 || t.tag === 6) return t;
    for (t = t.child; t !== null; ) {
      var a = oe(t);
      if (a !== null) return a;
      t = t.sibling;
    }
    return null;
  }
  var _e = n.unstable_scheduleCallback, Ne = n.unstable_cancelCallback, De = n.unstable_shouldYield, Se = n.unstable_requestPaint, Ee = n.unstable_now, He = n.unstable_getCurrentPriorityLevel, ar = n.unstable_ImmediatePriority, ir = n.unstable_UserBlockingPriority, wr = n.unstable_NormalPriority, fa = n.unstable_LowPriority, bn = n.unstable_IdlePriority, nn = null, br = null;
  function Ci(t) {
    if (br && typeof br.onCommitFiberRoot == "function") try {
      br.onCommitFiberRoot(nn, t, void 0, (t.current.flags & 128) === 128);
    } catch {
    }
  }
  var yr = Math.clz32 ? Math.clz32 : j1, M1 = Math.log, B1 = Math.LN2;
  function j1(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (M1(t) / B1 | 0) | 0;
  }
  var Gs = 64, $s = 4194304;
  function Ai(t) {
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return t & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return t;
    }
  }
  function Ks(t, a) {
    var l = t.pendingLanes;
    if (l === 0) return 0;
    var f = 0, h = t.suspendedLanes, m = t.pingedLanes, S = l & 268435455;
    if (S !== 0) {
      var M = S & ~h;
      M !== 0 ? f = Ai(M) : (m &= S, m !== 0 && (f = Ai(m)));
    } else S = l & ~h, S !== 0 ? f = Ai(S) : m !== 0 && (f = Ai(m));
    if (f === 0) return 0;
    if (a !== 0 && a !== f && (a & h) === 0 && (h = f & -f, m = a & -a, h >= m || h === 16 && (m & 4194240) !== 0)) return a;
    if ((f & 4) !== 0 && (f |= l & 16), a = t.entangledLanes, a !== 0) for (t = t.entanglements, a &= f; 0 < a; ) l = 31 - yr(a), h = 1 << l, f |= t[l], a &= ~h;
    return f;
  }
  function U1(t, a) {
    switch (t) {
      case 1:
      case 2:
      case 4:
        return a + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return a + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function z1(t, a) {
    for (var l = t.suspendedLanes, f = t.pingedLanes, h = t.expirationTimes, m = t.pendingLanes; 0 < m; ) {
      var S = 31 - yr(m), M = 1 << S, W = h[S];
      W === -1 ? ((M & l) === 0 || (M & f) !== 0) && (h[S] = U1(M, a)) : W <= a && (t.expiredLanes |= M), m &= ~M;
    }
  }
  function ko(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function su() {
    var t = Gs;
    return Gs <<= 1, (Gs & 4194240) === 0 && (Gs = 64), t;
  }
  function Eo(t) {
    for (var a = [], l = 0; 31 > l; l++) a.push(t);
    return a;
  }
  function Fi(t, a, l) {
    t.pendingLanes |= a, a !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, a = 31 - yr(a), t[a] = l;
  }
  function H1(t, a) {
    var l = t.pendingLanes & ~a;
    t.pendingLanes = a, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= a, t.mutableReadLanes &= a, t.entangledLanes &= a, a = t.entanglements;
    var f = t.eventTimes;
    for (t = t.expirationTimes; 0 < l; ) {
      var h = 31 - yr(l), m = 1 << h;
      a[h] = 0, f[h] = -1, t[h] = -1, l &= ~m;
    }
  }
  function So(t, a) {
    var l = t.entangledLanes |= a;
    for (t = t.entanglements; l; ) {
      var f = 31 - yr(l), h = 1 << f;
      h & a | t[f] & a && (t[f] |= a), l &= ~h;
    }
  }
  var tr = 0;
  function lu(t) {
    return t &= -t, 1 < t ? 4 < t ? (t & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var ou, To, cu, uu, fu, Co = !1, Xs = [], In = null, Ln = null, Mn = null, Ni = /* @__PURE__ */ new Map(), Ri = /* @__PURE__ */ new Map(), Bn = [], V1 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function du(t, a) {
    switch (t) {
      case "focusin":
      case "focusout":
        In = null;
        break;
      case "dragenter":
      case "dragleave":
        Ln = null;
        break;
      case "mouseover":
      case "mouseout":
        Mn = null;
        break;
      case "pointerover":
      case "pointerout":
        Ni.delete(a.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Ri.delete(a.pointerId);
    }
  }
  function Di(t, a, l, f, h, m) {
    return t === null || t.nativeEvent !== m ? (t = { blockedOn: a, domEventName: l, eventSystemFlags: f, nativeEvent: m, targetContainers: [h] }, a !== null && (a = Gi(a), a !== null && To(a)), t) : (t.eventSystemFlags |= f, a = t.targetContainers, h !== null && a.indexOf(h) === -1 && a.push(h), t);
  }
  function W1(t, a, l, f, h) {
    switch (a) {
      case "focusin":
        return In = Di(In, t, a, l, f, h), !0;
      case "dragenter":
        return Ln = Di(Ln, t, a, l, f, h), !0;
      case "mouseover":
        return Mn = Di(Mn, t, a, l, f, h), !0;
      case "pointerover":
        var m = h.pointerId;
        return Ni.set(m, Di(Ni.get(m) || null, t, a, l, f, h)), !0;
      case "gotpointercapture":
        return m = h.pointerId, Ri.set(m, Di(Ri.get(m) || null, t, a, l, f, h)), !0;
    }
    return !1;
  }
  function hu(t) {
    var a = da(t.target);
    if (a !== null) {
      var l = L(a);
      if (l !== null) {
        if (a = l.tag, a === 13) {
          if (a = ie(l), a !== null) {
            t.blockedOn = a, fu(t.priority, function() {
              cu(l);
            });
            return;
          }
        } else if (a === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          t.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    t.blockedOn = null;
  }
  function Ys(t) {
    if (t.blockedOn !== null) return !1;
    for (var a = t.targetContainers; 0 < a.length; ) {
      var l = Fo(t.domEventName, t.eventSystemFlags, a[0], t.nativeEvent);
      if (l === null) {
        l = t.nativeEvent;
        var f = new l.constructor(l.type, l);
        ja = f, l.target.dispatchEvent(f), ja = null;
      } else return a = Gi(l), a !== null && To(a), t.blockedOn = l, !1;
      a.shift();
    }
    return !0;
  }
  function pu(t, a, l) {
    Ys(t) && l.delete(a);
  }
  function G1() {
    Co = !1, In !== null && Ys(In) && (In = null), Ln !== null && Ys(Ln) && (Ln = null), Mn !== null && Ys(Mn) && (Mn = null), Ni.forEach(pu), Ri.forEach(pu);
  }
  function Oi(t, a) {
    t.blockedOn === a && (t.blockedOn = null, Co || (Co = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, G1)));
  }
  function Pi(t) {
    function a(h) {
      return Oi(h, t);
    }
    if (0 < Xs.length) {
      Oi(Xs[0], t);
      for (var l = 1; l < Xs.length; l++) {
        var f = Xs[l];
        f.blockedOn === t && (f.blockedOn = null);
      }
    }
    for (In !== null && Oi(In, t), Ln !== null && Oi(Ln, t), Mn !== null && Oi(Mn, t), Ni.forEach(a), Ri.forEach(a), l = 0; l < Bn.length; l++) f = Bn[l], f.blockedOn === t && (f.blockedOn = null);
    for (; 0 < Bn.length && (l = Bn[0], l.blockedOn === null); ) hu(l), l.blockedOn === null && Bn.shift();
  }
  var Va = V.ReactCurrentBatchConfig, Qs = !0;
  function $1(t, a, l, f) {
    var h = tr, m = Va.transition;
    Va.transition = null;
    try {
      tr = 1, Ao(t, a, l, f);
    } finally {
      tr = h, Va.transition = m;
    }
  }
  function K1(t, a, l, f) {
    var h = tr, m = Va.transition;
    Va.transition = null;
    try {
      tr = 4, Ao(t, a, l, f);
    } finally {
      tr = h, Va.transition = m;
    }
  }
  function Ao(t, a, l, f) {
    if (Qs) {
      var h = Fo(t, a, l, f);
      if (h === null) Go(t, a, f, qs, l), du(t, f);
      else if (W1(h, t, a, l, f)) f.stopPropagation();
      else if (du(t, f), a & 4 && -1 < V1.indexOf(t)) {
        for (; h !== null; ) {
          var m = Gi(h);
          if (m !== null && ou(m), m = Fo(t, a, l, f), m === null && Go(t, a, f, qs, l), m === h) break;
          h = m;
        }
        h !== null && f.stopPropagation();
      } else Go(t, a, f, null, l);
    }
  }
  var qs = null;
  function Fo(t, a, l, f) {
    if (qs = null, t = Ua(f), t = da(t), t !== null) if (a = L(t), a === null) t = null;
    else if (l = a.tag, l === 13) {
      if (t = ie(a), t !== null) return t;
      t = null;
    } else if (l === 3) {
      if (a.stateNode.current.memoizedState.isDehydrated) return a.tag === 3 ? a.stateNode.containerInfo : null;
      t = null;
    } else a !== t && (t = null);
    return qs = t, null;
  }
  function xu(t) {
    switch (t) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (He()) {
          case ar:
            return 1;
          case ir:
            return 4;
          case wr:
          case fa:
            return 16;
          case bn:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var jn = null, No = null, Js = null;
  function mu() {
    if (Js) return Js;
    var t, a = No, l = a.length, f, h = "value" in jn ? jn.value : jn.textContent, m = h.length;
    for (t = 0; t < l && a[t] === h[t]; t++) ;
    var S = l - t;
    for (f = 1; f <= S && a[l - f] === h[m - f]; f++) ;
    return Js = h.slice(t, 1 < f ? 1 - f : void 0);
  }
  function Zs(t) {
    var a = t.keyCode;
    return "charCode" in t ? (t = t.charCode, t === 0 && a === 13 && (t = 13)) : t = a, t === 10 && (t = 13), 32 <= t || t === 13 ? t : 0;
  }
  function el() {
    return !0;
  }
  function gu() {
    return !1;
  }
  function kt(t) {
    function a(l, f, h, m, S) {
      this._reactName = l, this._targetInst = h, this.type = f, this.nativeEvent = m, this.target = S, this.currentTarget = null;
      for (var M in t) t.hasOwnProperty(M) && (l = t[M], this[M] = l ? l(m) : m[M]);
      return this.isDefaultPrevented = (m.defaultPrevented != null ? m.defaultPrevented : m.returnValue === !1) ? el : gu, this.isPropagationStopped = gu, this;
    }
    return he(a.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var l = this.nativeEvent;
      l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = el);
    }, stopPropagation: function() {
      var l = this.nativeEvent;
      l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = el);
    }, persist: function() {
    }, isPersistent: el }), a;
  }
  var Wa = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(t) {
    return t.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, Ro = kt(Wa), bi = he({}, Wa, { view: 0, detail: 0 }), X1 = kt(bi), Do, Oo, Ii, rl = he({}, bi, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: bo, button: 0, buttons: 0, relatedTarget: function(t) {
    return t.relatedTarget === void 0 ? t.fromElement === t.srcElement ? t.toElement : t.fromElement : t.relatedTarget;
  }, movementX: function(t) {
    return "movementX" in t ? t.movementX : (t !== Ii && (Ii && t.type === "mousemove" ? (Do = t.screenX - Ii.screenX, Oo = t.screenY - Ii.screenY) : Oo = Do = 0, Ii = t), Do);
  }, movementY: function(t) {
    return "movementY" in t ? t.movementY : Oo;
  } }), vu = kt(rl), Y1 = he({}, rl, { dataTransfer: 0 }), Q1 = kt(Y1), q1 = he({}, bi, { relatedTarget: 0 }), Po = kt(q1), J1 = he({}, Wa, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Z1 = kt(J1), ex = he({}, Wa, { clipboardData: function(t) {
    return "clipboardData" in t ? t.clipboardData : window.clipboardData;
  } }), rx = kt(ex), tx = he({}, Wa, { data: 0 }), wu = kt(tx), nx = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, ax = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, ix = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function sx(t) {
    var a = this.nativeEvent;
    return a.getModifierState ? a.getModifierState(t) : (t = ix[t]) ? !!a[t] : !1;
  }
  function bo() {
    return sx;
  }
  var lx = he({}, bi, { key: function(t) {
    if (t.key) {
      var a = nx[t.key] || t.key;
      if (a !== "Unidentified") return a;
    }
    return t.type === "keypress" ? (t = Zs(t), t === 13 ? "Enter" : String.fromCharCode(t)) : t.type === "keydown" || t.type === "keyup" ? ax[t.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: bo, charCode: function(t) {
    return t.type === "keypress" ? Zs(t) : 0;
  }, keyCode: function(t) {
    return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  }, which: function(t) {
    return t.type === "keypress" ? Zs(t) : t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
  } }), ox = kt(lx), cx = he({}, rl, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), yu = kt(cx), ux = he({}, bi, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: bo }), fx = kt(ux), dx = he({}, Wa, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), hx = kt(dx), px = he({}, rl, {
    deltaX: function(t) {
      return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
    },
    deltaY: function(t) {
      return "deltaY" in t ? t.deltaY : "wheelDeltaY" in t ? -t.wheelDeltaY : "wheelDelta" in t ? -t.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), xx = kt(px), mx = [9, 13, 27, 32], Io = u && "CompositionEvent" in window, Li = null;
  u && "documentMode" in document && (Li = document.documentMode);
  var gx = u && "TextEvent" in window && !Li, _u = u && (!Io || Li && 8 < Li && 11 >= Li), ku = " ", Eu = !1;
  function Su(t, a) {
    switch (t) {
      case "keyup":
        return mx.indexOf(a.keyCode) !== -1;
      case "keydown":
        return a.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function Tu(t) {
    return t = t.detail, typeof t == "object" && "data" in t ? t.data : null;
  }
  var Ga = !1;
  function vx(t, a) {
    switch (t) {
      case "compositionend":
        return Tu(a);
      case "keypress":
        return a.which !== 32 ? null : (Eu = !0, ku);
      case "textInput":
        return t = a.data, t === ku && Eu ? null : t;
      default:
        return null;
    }
  }
  function wx(t, a) {
    if (Ga) return t === "compositionend" || !Io && Su(t, a) ? (t = mu(), Js = No = jn = null, Ga = !1, t) : null;
    switch (t) {
      case "paste":
        return null;
      case "keypress":
        if (!(a.ctrlKey || a.altKey || a.metaKey) || a.ctrlKey && a.altKey) {
          if (a.char && 1 < a.char.length) return a.char;
          if (a.which) return String.fromCharCode(a.which);
        }
        return null;
      case "compositionend":
        return _u && a.locale !== "ko" ? null : a.data;
      default:
        return null;
    }
  }
  var yx = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function Cu(t) {
    var a = t && t.nodeName && t.nodeName.toLowerCase();
    return a === "input" ? !!yx[t.type] : a === "textarea";
  }
  function Au(t, a, l, f) {
    Us(f), a = sl(a, "onChange"), 0 < a.length && (l = new Ro("onChange", "change", null, l, f), t.push({ event: l, listeners: a }));
  }
  var Mi = null, Bi = null;
  function _x(t) {
    Gu(t, 0);
  }
  function tl(t) {
    var a = Qa(t);
    if (P(a)) return t;
  }
  function kx(t, a) {
    if (t === "change") return a;
  }
  var Fu = !1;
  if (u) {
    var Lo;
    if (u) {
      var Mo = "oninput" in document;
      if (!Mo) {
        var Nu = document.createElement("div");
        Nu.setAttribute("oninput", "return;"), Mo = typeof Nu.oninput == "function";
      }
      Lo = Mo;
    } else Lo = !1;
    Fu = Lo && (!document.documentMode || 9 < document.documentMode);
  }
  function Ru() {
    Mi && (Mi.detachEvent("onpropertychange", Du), Bi = Mi = null);
  }
  function Du(t) {
    if (t.propertyName === "value" && tl(Bi)) {
      var a = [];
      Au(a, Bi, t, Ua(t)), Ws(_x, a);
    }
  }
  function Ex(t, a, l) {
    t === "focusin" ? (Ru(), Mi = a, Bi = l, Mi.attachEvent("onpropertychange", Du)) : t === "focusout" && Ru();
  }
  function Sx(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return tl(Bi);
  }
  function Tx(t, a) {
    if (t === "click") return tl(a);
  }
  function Cx(t, a) {
    if (t === "input" || t === "change") return tl(a);
  }
  function Ax(t, a) {
    return t === a && (t !== 0 || 1 / t === 1 / a) || t !== t && a !== a;
  }
  var Wt = typeof Object.is == "function" ? Object.is : Ax;
  function ji(t, a) {
    if (Wt(t, a)) return !0;
    if (typeof t != "object" || t === null || typeof a != "object" || a === null) return !1;
    var l = Object.keys(t), f = Object.keys(a);
    if (l.length !== f.length) return !1;
    for (f = 0; f < l.length; f++) {
      var h = l[f];
      if (!d.call(a, h) || !Wt(t[h], a[h])) return !1;
    }
    return !0;
  }
  function Ou(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function Pu(t, a) {
    var l = Ou(t);
    t = 0;
    for (var f; l; ) {
      if (l.nodeType === 3) {
        if (f = t + l.textContent.length, t <= a && f >= a) return { node: l, offset: a - t };
        t = f;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = Ou(l);
    }
  }
  function bu(t, a) {
    return t && a ? t === a ? !0 : t && t.nodeType === 3 ? !1 : a && a.nodeType === 3 ? bu(t, a.parentNode) : "contains" in t ? t.contains(a) : t.compareDocumentPosition ? !!(t.compareDocumentPosition(a) & 16) : !1 : !1;
  }
  function Iu() {
    for (var t = window, a = Xe(); a instanceof t.HTMLIFrameElement; ) {
      try {
        var l = typeof a.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) t = a.contentWindow;
      else break;
      a = Xe(t.document);
    }
    return a;
  }
  function Bo(t) {
    var a = t && t.nodeName && t.nodeName.toLowerCase();
    return a && (a === "input" && (t.type === "text" || t.type === "search" || t.type === "tel" || t.type === "url" || t.type === "password") || a === "textarea" || t.contentEditable === "true");
  }
  function Fx(t) {
    var a = Iu(), l = t.focusedElem, f = t.selectionRange;
    if (a !== l && l && l.ownerDocument && bu(l.ownerDocument.documentElement, l)) {
      if (f !== null && Bo(l)) {
        if (a = f.start, t = f.end, t === void 0 && (t = a), "selectionStart" in l) l.selectionStart = a, l.selectionEnd = Math.min(t, l.value.length);
        else if (t = (a = l.ownerDocument || document) && a.defaultView || window, t.getSelection) {
          t = t.getSelection();
          var h = l.textContent.length, m = Math.min(f.start, h);
          f = f.end === void 0 ? m : Math.min(f.end, h), !t.extend && m > f && (h = f, f = m, m = h), h = Pu(l, m);
          var S = Pu(
            l,
            f
          );
          h && S && (t.rangeCount !== 1 || t.anchorNode !== h.node || t.anchorOffset !== h.offset || t.focusNode !== S.node || t.focusOffset !== S.offset) && (a = a.createRange(), a.setStart(h.node, h.offset), t.removeAllRanges(), m > f ? (t.addRange(a), t.extend(S.node, S.offset)) : (a.setEnd(S.node, S.offset), t.addRange(a)));
        }
      }
      for (a = [], t = l; t = t.parentNode; ) t.nodeType === 1 && a.push({ element: t, left: t.scrollLeft, top: t.scrollTop });
      for (typeof l.focus == "function" && l.focus(), l = 0; l < a.length; l++) t = a[l], t.element.scrollLeft = t.left, t.element.scrollTop = t.top;
    }
  }
  var Nx = u && "documentMode" in document && 11 >= document.documentMode, $a = null, jo = null, Ui = null, Uo = !1;
  function Lu(t, a, l) {
    var f = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    Uo || $a == null || $a !== Xe(f) || (f = $a, "selectionStart" in f && Bo(f) ? f = { start: f.selectionStart, end: f.selectionEnd } : (f = (f.ownerDocument && f.ownerDocument.defaultView || window).getSelection(), f = { anchorNode: f.anchorNode, anchorOffset: f.anchorOffset, focusNode: f.focusNode, focusOffset: f.focusOffset }), Ui && ji(Ui, f) || (Ui = f, f = sl(jo, "onSelect"), 0 < f.length && (a = new Ro("onSelect", "select", null, a, l), t.push({ event: a, listeners: f }), a.target = $a)));
  }
  function nl(t, a) {
    var l = {};
    return l[t.toLowerCase()] = a.toLowerCase(), l["Webkit" + t] = "webkit" + a, l["Moz" + t] = "moz" + a, l;
  }
  var Ka = { animationend: nl("Animation", "AnimationEnd"), animationiteration: nl("Animation", "AnimationIteration"), animationstart: nl("Animation", "AnimationStart"), transitionend: nl("Transition", "TransitionEnd") }, zo = {}, Mu = {};
  u && (Mu = document.createElement("div").style, "AnimationEvent" in window || (delete Ka.animationend.animation, delete Ka.animationiteration.animation, delete Ka.animationstart.animation), "TransitionEvent" in window || delete Ka.transitionend.transition);
  function al(t) {
    if (zo[t]) return zo[t];
    if (!Ka[t]) return t;
    var a = Ka[t], l;
    for (l in a) if (a.hasOwnProperty(l) && l in Mu) return zo[t] = a[l];
    return t;
  }
  var Bu = al("animationend"), ju = al("animationiteration"), Uu = al("animationstart"), zu = al("transitionend"), Hu = /* @__PURE__ */ new Map(), Vu = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function Un(t, a) {
    Hu.set(t, a), o(a, [t]);
  }
  for (var Ho = 0; Ho < Vu.length; Ho++) {
    var Vo = Vu[Ho], Rx = Vo.toLowerCase(), Dx = Vo[0].toUpperCase() + Vo.slice(1);
    Un(Rx, "on" + Dx);
  }
  Un(Bu, "onAnimationEnd"), Un(ju, "onAnimationIteration"), Un(Uu, "onAnimationStart"), Un("dblclick", "onDoubleClick"), Un("focusin", "onFocus"), Un("focusout", "onBlur"), Un(zu, "onTransitionEnd"), c("onMouseEnter", ["mouseout", "mouseover"]), c("onMouseLeave", ["mouseout", "mouseover"]), c("onPointerEnter", ["pointerout", "pointerover"]), c("onPointerLeave", ["pointerout", "pointerover"]), o("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), o("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), o("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), o("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), o("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), o("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var zi = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Ox = new Set("cancel close invalid load scroll toggle".split(" ").concat(zi));
  function Wu(t, a, l) {
    var f = t.type || "unknown-event";
    t.currentTarget = l, I(f, a, void 0, t), t.currentTarget = null;
  }
  function Gu(t, a) {
    a = (a & 4) !== 0;
    for (var l = 0; l < t.length; l++) {
      var f = t[l], h = f.event;
      f = f.listeners;
      e: {
        var m = void 0;
        if (a) for (var S = f.length - 1; 0 <= S; S--) {
          var M = f[S], W = M.instance, ce = M.currentTarget;
          if (M = M.listener, W !== m && h.isPropagationStopped()) break e;
          Wu(h, M, ce), m = W;
        }
        else for (S = 0; S < f.length; S++) {
          if (M = f[S], W = M.instance, ce = M.currentTarget, M = M.listener, W !== m && h.isPropagationStopped()) break e;
          Wu(h, M, ce), m = W;
        }
      }
    }
    if (T) throw t = b, T = !1, b = null, t;
  }
  function or(t, a) {
    var l = a[qo];
    l === void 0 && (l = a[qo] = /* @__PURE__ */ new Set());
    var f = t + "__bubble";
    l.has(f) || ($u(a, t, 2, !1), l.add(f));
  }
  function Wo(t, a, l) {
    var f = 0;
    a && (f |= 4), $u(l, t, f, a);
  }
  var il = "_reactListening" + Math.random().toString(36).slice(2);
  function Hi(t) {
    if (!t[il]) {
      t[il] = !0, s.forEach(function(l) {
        l !== "selectionchange" && (Ox.has(l) || Wo(l, !1, t), Wo(l, !0, t));
      });
      var a = t.nodeType === 9 ? t : t.ownerDocument;
      a === null || a[il] || (a[il] = !0, Wo("selectionchange", !1, a));
    }
  }
  function $u(t, a, l, f) {
    switch (xu(a)) {
      case 1:
        var h = $1;
        break;
      case 4:
        h = K1;
        break;
      default:
        h = Ao;
    }
    l = h.bind(null, a, l, t), h = void 0, !Ti || a !== "touchstart" && a !== "touchmove" && a !== "wheel" || (h = !0), f ? h !== void 0 ? t.addEventListener(a, l, { capture: !0, passive: h }) : t.addEventListener(a, l, !0) : h !== void 0 ? t.addEventListener(a, l, { passive: h }) : t.addEventListener(a, l, !1);
  }
  function Go(t, a, l, f, h) {
    var m = f;
    if ((a & 1) === 0 && (a & 2) === 0 && f !== null) e: for (; ; ) {
      if (f === null) return;
      var S = f.tag;
      if (S === 3 || S === 4) {
        var M = f.stateNode.containerInfo;
        if (M === h || M.nodeType === 8 && M.parentNode === h) break;
        if (S === 4) for (S = f.return; S !== null; ) {
          var W = S.tag;
          if ((W === 3 || W === 4) && (W = S.stateNode.containerInfo, W === h || W.nodeType === 8 && W.parentNode === h)) return;
          S = S.return;
        }
        for (; M !== null; ) {
          if (S = da(M), S === null) return;
          if (W = S.tag, W === 5 || W === 6) {
            f = m = S;
            continue e;
          }
          M = M.parentNode;
        }
      }
      f = f.return;
    }
    Ws(function() {
      var ce = m, ve = Ua(l), ke = [];
      e: {
        var me = Hu.get(t);
        if (me !== void 0) {
          var Re = Ro, be = t;
          switch (t) {
            case "keypress":
              if (Zs(l) === 0) break e;
            case "keydown":
            case "keyup":
              Re = ox;
              break;
            case "focusin":
              be = "focus", Re = Po;
              break;
            case "focusout":
              be = "blur", Re = Po;
              break;
            case "beforeblur":
            case "afterblur":
              Re = Po;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              Re = vu;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              Re = Q1;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              Re = fx;
              break;
            case Bu:
            case ju:
            case Uu:
              Re = Z1;
              break;
            case zu:
              Re = hx;
              break;
            case "scroll":
              Re = X1;
              break;
            case "wheel":
              Re = xx;
              break;
            case "copy":
            case "cut":
            case "paste":
              Re = rx;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              Re = yu;
          }
          var Ie = (a & 4) !== 0, _r = !Ie && t === "scroll", ee = Ie ? me !== null ? me + "Capture" : null : me;
          Ie = [];
          for (var q = ce, ne; q !== null; ) {
            ne = q;
            var Te = ne.stateNode;
            if (ne.tag === 5 && Te !== null && (ne = Te, ee !== null && (Te = ca(q, ee), Te != null && Ie.push(Vi(q, Te, ne)))), _r) break;
            q = q.return;
          }
          0 < Ie.length && (me = new Re(me, be, null, l, ve), ke.push({ event: me, listeners: Ie }));
        }
      }
      if ((a & 7) === 0) {
        e: {
          if (me = t === "mouseover" || t === "pointerover", Re = t === "mouseout" || t === "pointerout", me && l !== ja && (be = l.relatedTarget || l.fromElement) && (da(be) || be[gn])) break e;
          if ((Re || me) && (me = ve.window === ve ? ve : (me = ve.ownerDocument) ? me.defaultView || me.parentWindow : window, Re ? (be = l.relatedTarget || l.toElement, Re = ce, be = be ? da(be) : null, be !== null && (_r = L(be), be !== _r || be.tag !== 5 && be.tag !== 6) && (be = null)) : (Re = null, be = ce), Re !== be)) {
            if (Ie = vu, Te = "onMouseLeave", ee = "onMouseEnter", q = "mouse", (t === "pointerout" || t === "pointerover") && (Ie = yu, Te = "onPointerLeave", ee = "onPointerEnter", q = "pointer"), _r = Re == null ? me : Qa(Re), ne = be == null ? me : Qa(be), me = new Ie(Te, q + "leave", Re, l, ve), me.target = _r, me.relatedTarget = ne, Te = null, da(ve) === ce && (Ie = new Ie(ee, q + "enter", be, l, ve), Ie.target = ne, Ie.relatedTarget = _r, Te = Ie), _r = Te, Re && be) r: {
              for (Ie = Re, ee = be, q = 0, ne = Ie; ne; ne = Xa(ne)) q++;
              for (ne = 0, Te = ee; Te; Te = Xa(Te)) ne++;
              for (; 0 < q - ne; ) Ie = Xa(Ie), q--;
              for (; 0 < ne - q; ) ee = Xa(ee), ne--;
              for (; q--; ) {
                if (Ie === ee || ee !== null && Ie === ee.alternate) break r;
                Ie = Xa(Ie), ee = Xa(ee);
              }
              Ie = null;
            }
            else Ie = null;
            Re !== null && Ku(ke, me, Re, Ie, !1), be !== null && _r !== null && Ku(ke, _r, be, Ie, !0);
          }
        }
        e: {
          if (me = ce ? Qa(ce) : window, Re = me.nodeName && me.nodeName.toLowerCase(), Re === "select" || Re === "input" && me.type === "file") var Le = kx;
          else if (Cu(me)) if (Fu) Le = Cx;
          else {
            Le = Sx;
            var Me = Ex;
          }
          else (Re = me.nodeName) && Re.toLowerCase() === "input" && (me.type === "checkbox" || me.type === "radio") && (Le = Tx);
          if (Le && (Le = Le(t, ce))) {
            Au(ke, Le, l, ve);
            break e;
          }
          Me && Me(t, me, ce), t === "focusout" && (Me = me._wrapperState) && Me.controlled && me.type === "number" && Gr(me, "number", me.value);
        }
        switch (Me = ce ? Qa(ce) : window, t) {
          case "focusin":
            (Cu(Me) || Me.contentEditable === "true") && ($a = Me, jo = ce, Ui = null);
            break;
          case "focusout":
            Ui = jo = $a = null;
            break;
          case "mousedown":
            Uo = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Uo = !1, Lu(ke, l, ve);
            break;
          case "selectionchange":
            if (Nx) break;
          case "keydown":
          case "keyup":
            Lu(ke, l, ve);
        }
        var Be;
        if (Io) e: {
          switch (t) {
            case "compositionstart":
              var ze = "onCompositionStart";
              break e;
            case "compositionend":
              ze = "onCompositionEnd";
              break e;
            case "compositionupdate":
              ze = "onCompositionUpdate";
              break e;
          }
          ze = void 0;
        }
        else Ga ? Su(t, l) && (ze = "onCompositionEnd") : t === "keydown" && l.keyCode === 229 && (ze = "onCompositionStart");
        ze && (_u && l.locale !== "ko" && (Ga || ze !== "onCompositionStart" ? ze === "onCompositionEnd" && Ga && (Be = mu()) : (jn = ve, No = "value" in jn ? jn.value : jn.textContent, Ga = !0)), Me = sl(ce, ze), 0 < Me.length && (ze = new wu(ze, t, null, l, ve), ke.push({ event: ze, listeners: Me }), Be ? ze.data = Be : (Be = Tu(l), Be !== null && (ze.data = Be)))), (Be = gx ? vx(t, l) : wx(t, l)) && (ce = sl(ce, "onBeforeInput"), 0 < ce.length && (ve = new wu("onBeforeInput", "beforeinput", null, l, ve), ke.push({ event: ve, listeners: ce }), ve.data = Be));
      }
      Gu(ke, a);
    });
  }
  function Vi(t, a, l) {
    return { instance: t, listener: a, currentTarget: l };
  }
  function sl(t, a) {
    for (var l = a + "Capture", f = []; t !== null; ) {
      var h = t, m = h.stateNode;
      h.tag === 5 && m !== null && (h = m, m = ca(t, l), m != null && f.unshift(Vi(t, m, h)), m = ca(t, a), m != null && f.push(Vi(t, m, h))), t = t.return;
    }
    return f;
  }
  function Xa(t) {
    if (t === null) return null;
    do
      t = t.return;
    while (t && t.tag !== 5);
    return t || null;
  }
  function Ku(t, a, l, f, h) {
    for (var m = a._reactName, S = []; l !== null && l !== f; ) {
      var M = l, W = M.alternate, ce = M.stateNode;
      if (W !== null && W === f) break;
      M.tag === 5 && ce !== null && (M = ce, h ? (W = ca(l, m), W != null && S.unshift(Vi(l, W, M))) : h || (W = ca(l, m), W != null && S.push(Vi(l, W, M)))), l = l.return;
    }
    S.length !== 0 && t.push({ event: a, listeners: S });
  }
  var Px = /\r\n?/g, bx = /\u0000|\uFFFD/g;
  function Xu(t) {
    return (typeof t == "string" ? t : "" + t).replace(Px, `
`).replace(bx, "");
  }
  function ll(t, a, l) {
    if (a = Xu(a), Xu(t) !== a && l) throw Error(r(425));
  }
  function ol() {
  }
  var $o = null, Ko = null;
  function Xo(t, a) {
    return t === "textarea" || t === "noscript" || typeof a.children == "string" || typeof a.children == "number" || typeof a.dangerouslySetInnerHTML == "object" && a.dangerouslySetInnerHTML !== null && a.dangerouslySetInnerHTML.__html != null;
  }
  var Yo = typeof setTimeout == "function" ? setTimeout : void 0, Ix = typeof clearTimeout == "function" ? clearTimeout : void 0, Yu = typeof Promise == "function" ? Promise : void 0, Lx = typeof queueMicrotask == "function" ? queueMicrotask : typeof Yu < "u" ? function(t) {
    return Yu.resolve(null).then(t).catch(Mx);
  } : Yo;
  function Mx(t) {
    setTimeout(function() {
      throw t;
    });
  }
  function Qo(t, a) {
    var l = a, f = 0;
    do {
      var h = l.nextSibling;
      if (t.removeChild(l), h && h.nodeType === 8) if (l = h.data, l === "/$") {
        if (f === 0) {
          t.removeChild(h), Pi(a);
          return;
        }
        f--;
      } else l !== "$" && l !== "$?" && l !== "$!" || f++;
      l = h;
    } while (l);
    Pi(a);
  }
  function zn(t) {
    for (; t != null; t = t.nextSibling) {
      var a = t.nodeType;
      if (a === 1 || a === 3) break;
      if (a === 8) {
        if (a = t.data, a === "$" || a === "$!" || a === "$?") break;
        if (a === "/$") return null;
      }
    }
    return t;
  }
  function Qu(t) {
    t = t.previousSibling;
    for (var a = 0; t; ) {
      if (t.nodeType === 8) {
        var l = t.data;
        if (l === "$" || l === "$!" || l === "$?") {
          if (a === 0) return t;
          a--;
        } else l === "/$" && a++;
      }
      t = t.previousSibling;
    }
    return null;
  }
  var Ya = Math.random().toString(36).slice(2), an = "__reactFiber$" + Ya, Wi = "__reactProps$" + Ya, gn = "__reactContainer$" + Ya, qo = "__reactEvents$" + Ya, Bx = "__reactListeners$" + Ya, jx = "__reactHandles$" + Ya;
  function da(t) {
    var a = t[an];
    if (a) return a;
    for (var l = t.parentNode; l; ) {
      if (a = l[gn] || l[an]) {
        if (l = a.alternate, a.child !== null || l !== null && l.child !== null) for (t = Qu(t); t !== null; ) {
          if (l = t[an]) return l;
          t = Qu(t);
        }
        return a;
      }
      t = l, l = t.parentNode;
    }
    return null;
  }
  function Gi(t) {
    return t = t[an] || t[gn], !t || t.tag !== 5 && t.tag !== 6 && t.tag !== 13 && t.tag !== 3 ? null : t;
  }
  function Qa(t) {
    if (t.tag === 5 || t.tag === 6) return t.stateNode;
    throw Error(r(33));
  }
  function cl(t) {
    return t[Wi] || null;
  }
  var Jo = [], qa = -1;
  function Hn(t) {
    return { current: t };
  }
  function cr(t) {
    0 > qa || (t.current = Jo[qa], Jo[qa] = null, qa--);
  }
  function sr(t, a) {
    qa++, Jo[qa] = t.current, t.current = a;
  }
  var Vn = {}, Yr = Hn(Vn), pt = Hn(!1), ha = Vn;
  function Ja(t, a) {
    var l = t.type.contextTypes;
    if (!l) return Vn;
    var f = t.stateNode;
    if (f && f.__reactInternalMemoizedUnmaskedChildContext === a) return f.__reactInternalMemoizedMaskedChildContext;
    var h = {}, m;
    for (m in l) h[m] = a[m];
    return f && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = a, t.__reactInternalMemoizedMaskedChildContext = h), h;
  }
  function xt(t) {
    return t = t.childContextTypes, t != null;
  }
  function ul() {
    cr(pt), cr(Yr);
  }
  function qu(t, a, l) {
    if (Yr.current !== Vn) throw Error(r(168));
    sr(Yr, a), sr(pt, l);
  }
  function Ju(t, a, l) {
    var f = t.stateNode;
    if (a = a.childContextTypes, typeof f.getChildContext != "function") return l;
    f = f.getChildContext();
    for (var h in f) if (!(h in a)) throw Error(r(108, K(t) || "Unknown", h));
    return he({}, l, f);
  }
  function fl(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || Vn, ha = Yr.current, sr(Yr, t), sr(pt, pt.current), !0;
  }
  function Zu(t, a, l) {
    var f = t.stateNode;
    if (!f) throw Error(r(169));
    l ? (t = Ju(t, a, ha), f.__reactInternalMemoizedMergedChildContext = t, cr(pt), cr(Yr), sr(Yr, t)) : cr(pt), sr(pt, l);
  }
  var vn = null, dl = !1, Zo = !1;
  function ef(t) {
    vn === null ? vn = [t] : vn.push(t);
  }
  function Ux(t) {
    dl = !0, ef(t);
  }
  function Wn() {
    if (!Zo && vn !== null) {
      Zo = !0;
      var t = 0, a = tr;
      try {
        var l = vn;
        for (tr = 1; t < l.length; t++) {
          var f = l[t];
          do
            f = f(!0);
          while (f !== null);
        }
        vn = null, dl = !1;
      } catch (h) {
        throw vn !== null && (vn = vn.slice(t + 1)), _e(ar, Wn), h;
      } finally {
        tr = a, Zo = !1;
      }
    }
    return null;
  }
  var Za = [], ei = 0, hl = null, pl = 0, Rt = [], Dt = 0, pa = null, wn = 1, yn = "";
  function xa(t, a) {
    Za[ei++] = pl, Za[ei++] = hl, hl = t, pl = a;
  }
  function rf(t, a, l) {
    Rt[Dt++] = wn, Rt[Dt++] = yn, Rt[Dt++] = pa, pa = t;
    var f = wn;
    t = yn;
    var h = 32 - yr(f) - 1;
    f &= ~(1 << h), l += 1;
    var m = 32 - yr(a) + h;
    if (30 < m) {
      var S = h - h % 5;
      m = (f & (1 << S) - 1).toString(32), f >>= S, h -= S, wn = 1 << 32 - yr(a) + h | l << h | f, yn = m + t;
    } else wn = 1 << m | l << h | f, yn = t;
  }
  function e0(t) {
    t.return !== null && (xa(t, 1), rf(t, 1, 0));
  }
  function r0(t) {
    for (; t === hl; ) hl = Za[--ei], Za[ei] = null, pl = Za[--ei], Za[ei] = null;
    for (; t === pa; ) pa = Rt[--Dt], Rt[Dt] = null, yn = Rt[--Dt], Rt[Dt] = null, wn = Rt[--Dt], Rt[Dt] = null;
  }
  var Et = null, St = null, fr = !1, Gt = null;
  function tf(t, a) {
    var l = It(5, null, null, 0);
    l.elementType = "DELETED", l.stateNode = a, l.return = t, a = t.deletions, a === null ? (t.deletions = [l], t.flags |= 16) : a.push(l);
  }
  function nf(t, a) {
    switch (t.tag) {
      case 5:
        var l = t.type;
        return a = a.nodeType !== 1 || l.toLowerCase() !== a.nodeName.toLowerCase() ? null : a, a !== null ? (t.stateNode = a, Et = t, St = zn(a.firstChild), !0) : !1;
      case 6:
        return a = t.pendingProps === "" || a.nodeType !== 3 ? null : a, a !== null ? (t.stateNode = a, Et = t, St = null, !0) : !1;
      case 13:
        return a = a.nodeType !== 8 ? null : a, a !== null ? (l = pa !== null ? { id: wn, overflow: yn } : null, t.memoizedState = { dehydrated: a, treeContext: l, retryLane: 1073741824 }, l = It(18, null, null, 0), l.stateNode = a, l.return = t, t.child = l, Et = t, St = null, !0) : !1;
      default:
        return !1;
    }
  }
  function t0(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function n0(t) {
    if (fr) {
      var a = St;
      if (a) {
        var l = a;
        if (!nf(t, a)) {
          if (t0(t)) throw Error(r(418));
          a = zn(l.nextSibling);
          var f = Et;
          a && nf(t, a) ? tf(f, l) : (t.flags = t.flags & -4097 | 2, fr = !1, Et = t);
        }
      } else {
        if (t0(t)) throw Error(r(418));
        t.flags = t.flags & -4097 | 2, fr = !1, Et = t;
      }
    }
  }
  function af(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; ) t = t.return;
    Et = t;
  }
  function xl(t) {
    if (t !== Et) return !1;
    if (!fr) return af(t), fr = !0, !1;
    var a;
    if ((a = t.tag !== 3) && !(a = t.tag !== 5) && (a = t.type, a = a !== "head" && a !== "body" && !Xo(t.type, t.memoizedProps)), a && (a = St)) {
      if (t0(t)) throw sf(), Error(r(418));
      for (; a; ) tf(t, a), a = zn(a.nextSibling);
    }
    if (af(t), t.tag === 13) {
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t) throw Error(r(317));
      e: {
        for (t = t.nextSibling, a = 0; t; ) {
          if (t.nodeType === 8) {
            var l = t.data;
            if (l === "/$") {
              if (a === 0) {
                St = zn(t.nextSibling);
                break e;
              }
              a--;
            } else l !== "$" && l !== "$!" && l !== "$?" || a++;
          }
          t = t.nextSibling;
        }
        St = null;
      }
    } else St = Et ? zn(t.stateNode.nextSibling) : null;
    return !0;
  }
  function sf() {
    for (var t = St; t; ) t = zn(t.nextSibling);
  }
  function ri() {
    St = Et = null, fr = !1;
  }
  function a0(t) {
    Gt === null ? Gt = [t] : Gt.push(t);
  }
  var zx = V.ReactCurrentBatchConfig;
  function $i(t, a, l) {
    if (t = l.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (l._owner) {
        if (l = l._owner, l) {
          if (l.tag !== 1) throw Error(r(309));
          var f = l.stateNode;
        }
        if (!f) throw Error(r(147, t));
        var h = f, m = "" + t;
        return a !== null && a.ref !== null && typeof a.ref == "function" && a.ref._stringRef === m ? a.ref : (a = function(S) {
          var M = h.refs;
          S === null ? delete M[m] : M[m] = S;
        }, a._stringRef = m, a);
      }
      if (typeof t != "string") throw Error(r(284));
      if (!l._owner) throw Error(r(290, t));
    }
    return t;
  }
  function ml(t, a) {
    throw t = Object.prototype.toString.call(a), Error(r(31, t === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : t));
  }
  function lf(t) {
    var a = t._init;
    return a(t._payload);
  }
  function of(t) {
    function a(ee, q) {
      if (t) {
        var ne = ee.deletions;
        ne === null ? (ee.deletions = [q], ee.flags |= 16) : ne.push(q);
      }
    }
    function l(ee, q) {
      if (!t) return null;
      for (; q !== null; ) a(ee, q), q = q.sibling;
      return null;
    }
    function f(ee, q) {
      for (ee = /* @__PURE__ */ new Map(); q !== null; ) q.key !== null ? ee.set(q.key, q) : ee.set(q.index, q), q = q.sibling;
      return ee;
    }
    function h(ee, q) {
      return ee = Jn(ee, q), ee.index = 0, ee.sibling = null, ee;
    }
    function m(ee, q, ne) {
      return ee.index = ne, t ? (ne = ee.alternate, ne !== null ? (ne = ne.index, ne < q ? (ee.flags |= 2, q) : ne) : (ee.flags |= 2, q)) : (ee.flags |= 1048576, q);
    }
    function S(ee) {
      return t && ee.alternate === null && (ee.flags |= 2), ee;
    }
    function M(ee, q, ne, Te) {
      return q === null || q.tag !== 6 ? (q = Y0(ne, ee.mode, Te), q.return = ee, q) : (q = h(q, ne), q.return = ee, q);
    }
    function W(ee, q, ne, Te) {
      var Le = ne.type;
      return Le === C ? ve(ee, q, ne.props.children, Te, ne.key) : q !== null && (q.elementType === Le || typeof Le == "object" && Le !== null && Le.$$typeof === we && lf(Le) === q.type) ? (Te = h(q, ne.props), Te.ref = $i(ee, q, ne), Te.return = ee, Te) : (Te = Ul(ne.type, ne.key, ne.props, null, ee.mode, Te), Te.ref = $i(ee, q, ne), Te.return = ee, Te);
    }
    function ce(ee, q, ne, Te) {
      return q === null || q.tag !== 4 || q.stateNode.containerInfo !== ne.containerInfo || q.stateNode.implementation !== ne.implementation ? (q = Q0(ne, ee.mode, Te), q.return = ee, q) : (q = h(q, ne.children || []), q.return = ee, q);
    }
    function ve(ee, q, ne, Te, Le) {
      return q === null || q.tag !== 7 ? (q = Ea(ne, ee.mode, Te, Le), q.return = ee, q) : (q = h(q, ne), q.return = ee, q);
    }
    function ke(ee, q, ne) {
      if (typeof q == "string" && q !== "" || typeof q == "number") return q = Y0("" + q, ee.mode, ne), q.return = ee, q;
      if (typeof q == "object" && q !== null) {
        switch (q.$$typeof) {
          case J:
            return ne = Ul(q.type, q.key, q.props, null, ee.mode, ne), ne.ref = $i(ee, null, q), ne.return = ee, ne;
          case j:
            return q = Q0(q, ee.mode, ne), q.return = ee, q;
          case we:
            var Te = q._init;
            return ke(ee, Te(q._payload), ne);
        }
        if ($r(q) || Y(q)) return q = Ea(q, ee.mode, ne, null), q.return = ee, q;
        ml(ee, q);
      }
      return null;
    }
    function me(ee, q, ne, Te) {
      var Le = q !== null ? q.key : null;
      if (typeof ne == "string" && ne !== "" || typeof ne == "number") return Le !== null ? null : M(ee, q, "" + ne, Te);
      if (typeof ne == "object" && ne !== null) {
        switch (ne.$$typeof) {
          case J:
            return ne.key === Le ? W(ee, q, ne, Te) : null;
          case j:
            return ne.key === Le ? ce(ee, q, ne, Te) : null;
          case we:
            return Le = ne._init, me(
              ee,
              q,
              Le(ne._payload),
              Te
            );
        }
        if ($r(ne) || Y(ne)) return Le !== null ? null : ve(ee, q, ne, Te, null);
        ml(ee, ne);
      }
      return null;
    }
    function Re(ee, q, ne, Te, Le) {
      if (typeof Te == "string" && Te !== "" || typeof Te == "number") return ee = ee.get(ne) || null, M(q, ee, "" + Te, Le);
      if (typeof Te == "object" && Te !== null) {
        switch (Te.$$typeof) {
          case J:
            return ee = ee.get(Te.key === null ? ne : Te.key) || null, W(q, ee, Te, Le);
          case j:
            return ee = ee.get(Te.key === null ? ne : Te.key) || null, ce(q, ee, Te, Le);
          case we:
            var Me = Te._init;
            return Re(ee, q, ne, Me(Te._payload), Le);
        }
        if ($r(Te) || Y(Te)) return ee = ee.get(ne) || null, ve(q, ee, Te, Le, null);
        ml(q, Te);
      }
      return null;
    }
    function be(ee, q, ne, Te) {
      for (var Le = null, Me = null, Be = q, ze = q = 0, Mr = null; Be !== null && ze < ne.length; ze++) {
        Be.index > ze ? (Mr = Be, Be = null) : Mr = Be.sibling;
        var rr = me(ee, Be, ne[ze], Te);
        if (rr === null) {
          Be === null && (Be = Mr);
          break;
        }
        t && Be && rr.alternate === null && a(ee, Be), q = m(rr, q, ze), Me === null ? Le = rr : Me.sibling = rr, Me = rr, Be = Mr;
      }
      if (ze === ne.length) return l(ee, Be), fr && xa(ee, ze), Le;
      if (Be === null) {
        for (; ze < ne.length; ze++) Be = ke(ee, ne[ze], Te), Be !== null && (q = m(Be, q, ze), Me === null ? Le = Be : Me.sibling = Be, Me = Be);
        return fr && xa(ee, ze), Le;
      }
      for (Be = f(ee, Be); ze < ne.length; ze++) Mr = Re(Be, ee, ze, ne[ze], Te), Mr !== null && (t && Mr.alternate !== null && Be.delete(Mr.key === null ? ze : Mr.key), q = m(Mr, q, ze), Me === null ? Le = Mr : Me.sibling = Mr, Me = Mr);
      return t && Be.forEach(function(Zn) {
        return a(ee, Zn);
      }), fr && xa(ee, ze), Le;
    }
    function Ie(ee, q, ne, Te) {
      var Le = Y(ne);
      if (typeof Le != "function") throw Error(r(150));
      if (ne = Le.call(ne), ne == null) throw Error(r(151));
      for (var Me = Le = null, Be = q, ze = q = 0, Mr = null, rr = ne.next(); Be !== null && !rr.done; ze++, rr = ne.next()) {
        Be.index > ze ? (Mr = Be, Be = null) : Mr = Be.sibling;
        var Zn = me(ee, Be, rr.value, Te);
        if (Zn === null) {
          Be === null && (Be = Mr);
          break;
        }
        t && Be && Zn.alternate === null && a(ee, Be), q = m(Zn, q, ze), Me === null ? Le = Zn : Me.sibling = Zn, Me = Zn, Be = Mr;
      }
      if (rr.done) return l(
        ee,
        Be
      ), fr && xa(ee, ze), Le;
      if (Be === null) {
        for (; !rr.done; ze++, rr = ne.next()) rr = ke(ee, rr.value, Te), rr !== null && (q = m(rr, q, ze), Me === null ? Le = rr : Me.sibling = rr, Me = rr);
        return fr && xa(ee, ze), Le;
      }
      for (Be = f(ee, Be); !rr.done; ze++, rr = ne.next()) rr = Re(Be, ee, ze, rr.value, Te), rr !== null && (t && rr.alternate !== null && Be.delete(rr.key === null ? ze : rr.key), q = m(rr, q, ze), Me === null ? Le = rr : Me.sibling = rr, Me = rr);
      return t && Be.forEach(function(ym) {
        return a(ee, ym);
      }), fr && xa(ee, ze), Le;
    }
    function _r(ee, q, ne, Te) {
      if (typeof ne == "object" && ne !== null && ne.type === C && ne.key === null && (ne = ne.props.children), typeof ne == "object" && ne !== null) {
        switch (ne.$$typeof) {
          case J:
            e: {
              for (var Le = ne.key, Me = q; Me !== null; ) {
                if (Me.key === Le) {
                  if (Le = ne.type, Le === C) {
                    if (Me.tag === 7) {
                      l(ee, Me.sibling), q = h(Me, ne.props.children), q.return = ee, ee = q;
                      break e;
                    }
                  } else if (Me.elementType === Le || typeof Le == "object" && Le !== null && Le.$$typeof === we && lf(Le) === Me.type) {
                    l(ee, Me.sibling), q = h(Me, ne.props), q.ref = $i(ee, Me, ne), q.return = ee, ee = q;
                    break e;
                  }
                  l(ee, Me);
                  break;
                } else a(ee, Me);
                Me = Me.sibling;
              }
              ne.type === C ? (q = Ea(ne.props.children, ee.mode, Te, ne.key), q.return = ee, ee = q) : (Te = Ul(ne.type, ne.key, ne.props, null, ee.mode, Te), Te.ref = $i(ee, q, ne), Te.return = ee, ee = Te);
            }
            return S(ee);
          case j:
            e: {
              for (Me = ne.key; q !== null; ) {
                if (q.key === Me) if (q.tag === 4 && q.stateNode.containerInfo === ne.containerInfo && q.stateNode.implementation === ne.implementation) {
                  l(ee, q.sibling), q = h(q, ne.children || []), q.return = ee, ee = q;
                  break e;
                } else {
                  l(ee, q);
                  break;
                }
                else a(ee, q);
                q = q.sibling;
              }
              q = Q0(ne, ee.mode, Te), q.return = ee, ee = q;
            }
            return S(ee);
          case we:
            return Me = ne._init, _r(ee, q, Me(ne._payload), Te);
        }
        if ($r(ne)) return be(ee, q, ne, Te);
        if (Y(ne)) return Ie(ee, q, ne, Te);
        ml(ee, ne);
      }
      return typeof ne == "string" && ne !== "" || typeof ne == "number" ? (ne = "" + ne, q !== null && q.tag === 6 ? (l(ee, q.sibling), q = h(q, ne), q.return = ee, ee = q) : (l(ee, q), q = Y0(ne, ee.mode, Te), q.return = ee, ee = q), S(ee)) : l(ee, q);
    }
    return _r;
  }
  var ti = of(!0), cf = of(!1), gl = Hn(null), vl = null, ni = null, i0 = null;
  function s0() {
    i0 = ni = vl = null;
  }
  function l0(t) {
    var a = gl.current;
    cr(gl), t._currentValue = a;
  }
  function o0(t, a, l) {
    for (; t !== null; ) {
      var f = t.alternate;
      if ((t.childLanes & a) !== a ? (t.childLanes |= a, f !== null && (f.childLanes |= a)) : f !== null && (f.childLanes & a) !== a && (f.childLanes |= a), t === l) break;
      t = t.return;
    }
  }
  function ai(t, a) {
    vl = t, i0 = ni = null, t = t.dependencies, t !== null && t.firstContext !== null && ((t.lanes & a) !== 0 && (mt = !0), t.firstContext = null);
  }
  function Ot(t) {
    var a = t._currentValue;
    if (i0 !== t) if (t = { context: t, memoizedValue: a, next: null }, ni === null) {
      if (vl === null) throw Error(r(308));
      ni = t, vl.dependencies = { lanes: 0, firstContext: t };
    } else ni = ni.next = t;
    return a;
  }
  var ma = null;
  function c0(t) {
    ma === null ? ma = [t] : ma.push(t);
  }
  function uf(t, a, l, f) {
    var h = a.interleaved;
    return h === null ? (l.next = l, c0(a)) : (l.next = h.next, h.next = l), a.interleaved = l, _n(t, f);
  }
  function _n(t, a) {
    t.lanes |= a;
    var l = t.alternate;
    for (l !== null && (l.lanes |= a), l = t, t = t.return; t !== null; ) t.childLanes |= a, l = t.alternate, l !== null && (l.childLanes |= a), l = t, t = t.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var Gn = !1;
  function u0(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function ff(t, a) {
    t = t.updateQueue, a.updateQueue === t && (a.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function kn(t, a) {
    return { eventTime: t, lane: a, tag: 0, payload: null, callback: null, next: null };
  }
  function $n(t, a, l) {
    var f = t.updateQueue;
    if (f === null) return null;
    if (f = f.shared, (Ze & 2) !== 0) {
      var h = f.pending;
      return h === null ? a.next = a : (a.next = h.next, h.next = a), f.pending = a, _n(t, l);
    }
    return h = f.interleaved, h === null ? (a.next = a, c0(f)) : (a.next = h.next, h.next = a), f.interleaved = a, _n(t, l);
  }
  function wl(t, a, l) {
    if (a = a.updateQueue, a !== null && (a = a.shared, (l & 4194240) !== 0)) {
      var f = a.lanes;
      f &= t.pendingLanes, l |= f, a.lanes = l, So(t, l);
    }
  }
  function df(t, a) {
    var l = t.updateQueue, f = t.alternate;
    if (f !== null && (f = f.updateQueue, l === f)) {
      var h = null, m = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var S = { eventTime: l.eventTime, lane: l.lane, tag: l.tag, payload: l.payload, callback: l.callback, next: null };
          m === null ? h = m = S : m = m.next = S, l = l.next;
        } while (l !== null);
        m === null ? h = m = a : m = m.next = a;
      } else h = m = a;
      l = { baseState: f.baseState, firstBaseUpdate: h, lastBaseUpdate: m, shared: f.shared, effects: f.effects }, t.updateQueue = l;
      return;
    }
    t = l.lastBaseUpdate, t === null ? l.firstBaseUpdate = a : t.next = a, l.lastBaseUpdate = a;
  }
  function yl(t, a, l, f) {
    var h = t.updateQueue;
    Gn = !1;
    var m = h.firstBaseUpdate, S = h.lastBaseUpdate, M = h.shared.pending;
    if (M !== null) {
      h.shared.pending = null;
      var W = M, ce = W.next;
      W.next = null, S === null ? m = ce : S.next = ce, S = W;
      var ve = t.alternate;
      ve !== null && (ve = ve.updateQueue, M = ve.lastBaseUpdate, M !== S && (M === null ? ve.firstBaseUpdate = ce : M.next = ce, ve.lastBaseUpdate = W));
    }
    if (m !== null) {
      var ke = h.baseState;
      S = 0, ve = ce = W = null, M = m;
      do {
        var me = M.lane, Re = M.eventTime;
        if ((f & me) === me) {
          ve !== null && (ve = ve.next = {
            eventTime: Re,
            lane: 0,
            tag: M.tag,
            payload: M.payload,
            callback: M.callback,
            next: null
          });
          e: {
            var be = t, Ie = M;
            switch (me = a, Re = l, Ie.tag) {
              case 1:
                if (be = Ie.payload, typeof be == "function") {
                  ke = be.call(Re, ke, me);
                  break e;
                }
                ke = be;
                break e;
              case 3:
                be.flags = be.flags & -65537 | 128;
              case 0:
                if (be = Ie.payload, me = typeof be == "function" ? be.call(Re, ke, me) : be, me == null) break e;
                ke = he({}, ke, me);
                break e;
              case 2:
                Gn = !0;
            }
          }
          M.callback !== null && M.lane !== 0 && (t.flags |= 64, me = h.effects, me === null ? h.effects = [M] : me.push(M));
        } else Re = { eventTime: Re, lane: me, tag: M.tag, payload: M.payload, callback: M.callback, next: null }, ve === null ? (ce = ve = Re, W = ke) : ve = ve.next = Re, S |= me;
        if (M = M.next, M === null) {
          if (M = h.shared.pending, M === null) break;
          me = M, M = me.next, me.next = null, h.lastBaseUpdate = me, h.shared.pending = null;
        }
      } while (!0);
      if (ve === null && (W = ke), h.baseState = W, h.firstBaseUpdate = ce, h.lastBaseUpdate = ve, a = h.shared.interleaved, a !== null) {
        h = a;
        do
          S |= h.lane, h = h.next;
        while (h !== a);
      } else m === null && (h.shared.lanes = 0);
      wa |= S, t.lanes = S, t.memoizedState = ke;
    }
  }
  function hf(t, a, l) {
    if (t = a.effects, a.effects = null, t !== null) for (a = 0; a < t.length; a++) {
      var f = t[a], h = f.callback;
      if (h !== null) {
        if (f.callback = null, f = l, typeof h != "function") throw Error(r(191, h));
        h.call(f);
      }
    }
  }
  var Ki = {}, sn = Hn(Ki), Xi = Hn(Ki), Yi = Hn(Ki);
  function ga(t) {
    if (t === Ki) throw Error(r(174));
    return t;
  }
  function f0(t, a) {
    switch (sr(Yi, a), sr(Xi, t), sr(sn, Ki), t = a.nodeType, t) {
      case 9:
      case 11:
        a = (a = a.documentElement) ? a.namespaceURI : xn(null, "");
        break;
      default:
        t = t === 8 ? a.parentNode : a, a = t.namespaceURI || null, t = t.tagName, a = xn(a, t);
    }
    cr(sn), sr(sn, a);
  }
  function ii() {
    cr(sn), cr(Xi), cr(Yi);
  }
  function pf(t) {
    ga(Yi.current);
    var a = ga(sn.current), l = xn(a, t.type);
    a !== l && (sr(Xi, t), sr(sn, l));
  }
  function d0(t) {
    Xi.current === t && (cr(sn), cr(Xi));
  }
  var hr = Hn(0);
  function _l(t) {
    for (var a = t; a !== null; ) {
      if (a.tag === 13) {
        var l = a.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || l.data === "$?" || l.data === "$!")) return a;
      } else if (a.tag === 19 && a.memoizedProps.revealOrder !== void 0) {
        if ((a.flags & 128) !== 0) return a;
      } else if (a.child !== null) {
        a.child.return = a, a = a.child;
        continue;
      }
      if (a === t) break;
      for (; a.sibling === null; ) {
        if (a.return === null || a.return === t) return null;
        a = a.return;
      }
      a.sibling.return = a.return, a = a.sibling;
    }
    return null;
  }
  var h0 = [];
  function p0() {
    for (var t = 0; t < h0.length; t++) h0[t]._workInProgressVersionPrimary = null;
    h0.length = 0;
  }
  var kl = V.ReactCurrentDispatcher, x0 = V.ReactCurrentBatchConfig, va = 0, pr = null, Fr = null, Ir = null, El = !1, Qi = !1, qi = 0, Hx = 0;
  function Qr() {
    throw Error(r(321));
  }
  function m0(t, a) {
    if (a === null) return !1;
    for (var l = 0; l < a.length && l < t.length; l++) if (!Wt(t[l], a[l])) return !1;
    return !0;
  }
  function g0(t, a, l, f, h, m) {
    if (va = m, pr = a, a.memoizedState = null, a.updateQueue = null, a.lanes = 0, kl.current = t === null || t.memoizedState === null ? $x : Kx, t = l(f, h), Qi) {
      m = 0;
      do {
        if (Qi = !1, qi = 0, 25 <= m) throw Error(r(301));
        m += 1, Ir = Fr = null, a.updateQueue = null, kl.current = Xx, t = l(f, h);
      } while (Qi);
    }
    if (kl.current = Cl, a = Fr !== null && Fr.next !== null, va = 0, Ir = Fr = pr = null, El = !1, a) throw Error(r(300));
    return t;
  }
  function v0() {
    var t = qi !== 0;
    return qi = 0, t;
  }
  function ln() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ir === null ? pr.memoizedState = Ir = t : Ir = Ir.next = t, Ir;
  }
  function Pt() {
    if (Fr === null) {
      var t = pr.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = Fr.next;
    var a = Ir === null ? pr.memoizedState : Ir.next;
    if (a !== null) Ir = a, Fr = t;
    else {
      if (t === null) throw Error(r(310));
      Fr = t, t = { memoizedState: Fr.memoizedState, baseState: Fr.baseState, baseQueue: Fr.baseQueue, queue: Fr.queue, next: null }, Ir === null ? pr.memoizedState = Ir = t : Ir = Ir.next = t;
    }
    return Ir;
  }
  function Ji(t, a) {
    return typeof a == "function" ? a(t) : a;
  }
  function w0(t) {
    var a = Pt(), l = a.queue;
    if (l === null) throw Error(r(311));
    l.lastRenderedReducer = t;
    var f = Fr, h = f.baseQueue, m = l.pending;
    if (m !== null) {
      if (h !== null) {
        var S = h.next;
        h.next = m.next, m.next = S;
      }
      f.baseQueue = h = m, l.pending = null;
    }
    if (h !== null) {
      m = h.next, f = f.baseState;
      var M = S = null, W = null, ce = m;
      do {
        var ve = ce.lane;
        if ((va & ve) === ve) W !== null && (W = W.next = { lane: 0, action: ce.action, hasEagerState: ce.hasEagerState, eagerState: ce.eagerState, next: null }), f = ce.hasEagerState ? ce.eagerState : t(f, ce.action);
        else {
          var ke = {
            lane: ve,
            action: ce.action,
            hasEagerState: ce.hasEagerState,
            eagerState: ce.eagerState,
            next: null
          };
          W === null ? (M = W = ke, S = f) : W = W.next = ke, pr.lanes |= ve, wa |= ve;
        }
        ce = ce.next;
      } while (ce !== null && ce !== m);
      W === null ? S = f : W.next = M, Wt(f, a.memoizedState) || (mt = !0), a.memoizedState = f, a.baseState = S, a.baseQueue = W, l.lastRenderedState = f;
    }
    if (t = l.interleaved, t !== null) {
      h = t;
      do
        m = h.lane, pr.lanes |= m, wa |= m, h = h.next;
      while (h !== t);
    } else h === null && (l.lanes = 0);
    return [a.memoizedState, l.dispatch];
  }
  function y0(t) {
    var a = Pt(), l = a.queue;
    if (l === null) throw Error(r(311));
    l.lastRenderedReducer = t;
    var f = l.dispatch, h = l.pending, m = a.memoizedState;
    if (h !== null) {
      l.pending = null;
      var S = h = h.next;
      do
        m = t(m, S.action), S = S.next;
      while (S !== h);
      Wt(m, a.memoizedState) || (mt = !0), a.memoizedState = m, a.baseQueue === null && (a.baseState = m), l.lastRenderedState = m;
    }
    return [m, f];
  }
  function xf() {
  }
  function mf(t, a) {
    var l = pr, f = Pt(), h = a(), m = !Wt(f.memoizedState, h);
    if (m && (f.memoizedState = h, mt = !0), f = f.queue, _0(wf.bind(null, l, f, t), [t]), f.getSnapshot !== a || m || Ir !== null && Ir.memoizedState.tag & 1) {
      if (l.flags |= 2048, Zi(9, vf.bind(null, l, f, h, a), void 0, null), Lr === null) throw Error(r(349));
      (va & 30) !== 0 || gf(l, a, h);
    }
    return h;
  }
  function gf(t, a, l) {
    t.flags |= 16384, t = { getSnapshot: a, value: l }, a = pr.updateQueue, a === null ? (a = { lastEffect: null, stores: null }, pr.updateQueue = a, a.stores = [t]) : (l = a.stores, l === null ? a.stores = [t] : l.push(t));
  }
  function vf(t, a, l, f) {
    a.value = l, a.getSnapshot = f, yf(a) && _f(t);
  }
  function wf(t, a, l) {
    return l(function() {
      yf(a) && _f(t);
    });
  }
  function yf(t) {
    var a = t.getSnapshot;
    t = t.value;
    try {
      var l = a();
      return !Wt(t, l);
    } catch {
      return !0;
    }
  }
  function _f(t) {
    var a = _n(t, 1);
    a !== null && Yt(a, t, 1, -1);
  }
  function kf(t) {
    var a = ln();
    return typeof t == "function" && (t = t()), a.memoizedState = a.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Ji, lastRenderedState: t }, a.queue = t, t = t.dispatch = Gx.bind(null, pr, t), [a.memoizedState, t];
  }
  function Zi(t, a, l, f) {
    return t = { tag: t, create: a, destroy: l, deps: f, next: null }, a = pr.updateQueue, a === null ? (a = { lastEffect: null, stores: null }, pr.updateQueue = a, a.lastEffect = t.next = t) : (l = a.lastEffect, l === null ? a.lastEffect = t.next = t : (f = l.next, l.next = t, t.next = f, a.lastEffect = t)), t;
  }
  function Ef() {
    return Pt().memoizedState;
  }
  function Sl(t, a, l, f) {
    var h = ln();
    pr.flags |= t, h.memoizedState = Zi(1 | a, l, void 0, f === void 0 ? null : f);
  }
  function Tl(t, a, l, f) {
    var h = Pt();
    f = f === void 0 ? null : f;
    var m = void 0;
    if (Fr !== null) {
      var S = Fr.memoizedState;
      if (m = S.destroy, f !== null && m0(f, S.deps)) {
        h.memoizedState = Zi(a, l, m, f);
        return;
      }
    }
    pr.flags |= t, h.memoizedState = Zi(1 | a, l, m, f);
  }
  function Sf(t, a) {
    return Sl(8390656, 8, t, a);
  }
  function _0(t, a) {
    return Tl(2048, 8, t, a);
  }
  function Tf(t, a) {
    return Tl(4, 2, t, a);
  }
  function Cf(t, a) {
    return Tl(4, 4, t, a);
  }
  function Af(t, a) {
    if (typeof a == "function") return t = t(), a(t), function() {
      a(null);
    };
    if (a != null) return t = t(), a.current = t, function() {
      a.current = null;
    };
  }
  function Ff(t, a, l) {
    return l = l != null ? l.concat([t]) : null, Tl(4, 4, Af.bind(null, a, t), l);
  }
  function k0() {
  }
  function Nf(t, a) {
    var l = Pt();
    a = a === void 0 ? null : a;
    var f = l.memoizedState;
    return f !== null && a !== null && m0(a, f[1]) ? f[0] : (l.memoizedState = [t, a], t);
  }
  function Rf(t, a) {
    var l = Pt();
    a = a === void 0 ? null : a;
    var f = l.memoizedState;
    return f !== null && a !== null && m0(a, f[1]) ? f[0] : (t = t(), l.memoizedState = [t, a], t);
  }
  function Df(t, a, l) {
    return (va & 21) === 0 ? (t.baseState && (t.baseState = !1, mt = !0), t.memoizedState = l) : (Wt(l, a) || (l = su(), pr.lanes |= l, wa |= l, t.baseState = !0), a);
  }
  function Vx(t, a) {
    var l = tr;
    tr = l !== 0 && 4 > l ? l : 4, t(!0);
    var f = x0.transition;
    x0.transition = {};
    try {
      t(!1), a();
    } finally {
      tr = l, x0.transition = f;
    }
  }
  function Of() {
    return Pt().memoizedState;
  }
  function Wx(t, a, l) {
    var f = Qn(t);
    if (l = { lane: f, action: l, hasEagerState: !1, eagerState: null, next: null }, Pf(t)) bf(a, l);
    else if (l = uf(t, a, l, f), l !== null) {
      var h = lt();
      Yt(l, t, f, h), If(l, a, f);
    }
  }
  function Gx(t, a, l) {
    var f = Qn(t), h = { lane: f, action: l, hasEagerState: !1, eagerState: null, next: null };
    if (Pf(t)) bf(a, h);
    else {
      var m = t.alternate;
      if (t.lanes === 0 && (m === null || m.lanes === 0) && (m = a.lastRenderedReducer, m !== null)) try {
        var S = a.lastRenderedState, M = m(S, l);
        if (h.hasEagerState = !0, h.eagerState = M, Wt(M, S)) {
          var W = a.interleaved;
          W === null ? (h.next = h, c0(a)) : (h.next = W.next, W.next = h), a.interleaved = h;
          return;
        }
      } catch {
      } finally {
      }
      l = uf(t, a, h, f), l !== null && (h = lt(), Yt(l, t, f, h), If(l, a, f));
    }
  }
  function Pf(t) {
    var a = t.alternate;
    return t === pr || a !== null && a === pr;
  }
  function bf(t, a) {
    Qi = El = !0;
    var l = t.pending;
    l === null ? a.next = a : (a.next = l.next, l.next = a), t.pending = a;
  }
  function If(t, a, l) {
    if ((l & 4194240) !== 0) {
      var f = a.lanes;
      f &= t.pendingLanes, l |= f, a.lanes = l, So(t, l);
    }
  }
  var Cl = { readContext: Ot, useCallback: Qr, useContext: Qr, useEffect: Qr, useImperativeHandle: Qr, useInsertionEffect: Qr, useLayoutEffect: Qr, useMemo: Qr, useReducer: Qr, useRef: Qr, useState: Qr, useDebugValue: Qr, useDeferredValue: Qr, useTransition: Qr, useMutableSource: Qr, useSyncExternalStore: Qr, useId: Qr, unstable_isNewReconciler: !1 }, $x = { readContext: Ot, useCallback: function(t, a) {
    return ln().memoizedState = [t, a === void 0 ? null : a], t;
  }, useContext: Ot, useEffect: Sf, useImperativeHandle: function(t, a, l) {
    return l = l != null ? l.concat([t]) : null, Sl(
      4194308,
      4,
      Af.bind(null, a, t),
      l
    );
  }, useLayoutEffect: function(t, a) {
    return Sl(4194308, 4, t, a);
  }, useInsertionEffect: function(t, a) {
    return Sl(4, 2, t, a);
  }, useMemo: function(t, a) {
    var l = ln();
    return a = a === void 0 ? null : a, t = t(), l.memoizedState = [t, a], t;
  }, useReducer: function(t, a, l) {
    var f = ln();
    return a = l !== void 0 ? l(a) : a, f.memoizedState = f.baseState = a, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: a }, f.queue = t, t = t.dispatch = Wx.bind(null, pr, t), [f.memoizedState, t];
  }, useRef: function(t) {
    var a = ln();
    return t = { current: t }, a.memoizedState = t;
  }, useState: kf, useDebugValue: k0, useDeferredValue: function(t) {
    return ln().memoizedState = t;
  }, useTransition: function() {
    var t = kf(!1), a = t[0];
    return t = Vx.bind(null, t[1]), ln().memoizedState = t, [a, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, a, l) {
    var f = pr, h = ln();
    if (fr) {
      if (l === void 0) throw Error(r(407));
      l = l();
    } else {
      if (l = a(), Lr === null) throw Error(r(349));
      (va & 30) !== 0 || gf(f, a, l);
    }
    h.memoizedState = l;
    var m = { value: l, getSnapshot: a };
    return h.queue = m, Sf(wf.bind(
      null,
      f,
      m,
      t
    ), [t]), f.flags |= 2048, Zi(9, vf.bind(null, f, m, l, a), void 0, null), l;
  }, useId: function() {
    var t = ln(), a = Lr.identifierPrefix;
    if (fr) {
      var l = yn, f = wn;
      l = (f & ~(1 << 32 - yr(f) - 1)).toString(32) + l, a = ":" + a + "R" + l, l = qi++, 0 < l && (a += "H" + l.toString(32)), a += ":";
    } else l = Hx++, a = ":" + a + "r" + l.toString(32) + ":";
    return t.memoizedState = a;
  }, unstable_isNewReconciler: !1 }, Kx = {
    readContext: Ot,
    useCallback: Nf,
    useContext: Ot,
    useEffect: _0,
    useImperativeHandle: Ff,
    useInsertionEffect: Tf,
    useLayoutEffect: Cf,
    useMemo: Rf,
    useReducer: w0,
    useRef: Ef,
    useState: function() {
      return w0(Ji);
    },
    useDebugValue: k0,
    useDeferredValue: function(t) {
      var a = Pt();
      return Df(a, Fr.memoizedState, t);
    },
    useTransition: function() {
      var t = w0(Ji)[0], a = Pt().memoizedState;
      return [t, a];
    },
    useMutableSource: xf,
    useSyncExternalStore: mf,
    useId: Of,
    unstable_isNewReconciler: !1
  }, Xx = { readContext: Ot, useCallback: Nf, useContext: Ot, useEffect: _0, useImperativeHandle: Ff, useInsertionEffect: Tf, useLayoutEffect: Cf, useMemo: Rf, useReducer: y0, useRef: Ef, useState: function() {
    return y0(Ji);
  }, useDebugValue: k0, useDeferredValue: function(t) {
    var a = Pt();
    return Fr === null ? a.memoizedState = t : Df(a, Fr.memoizedState, t);
  }, useTransition: function() {
    var t = y0(Ji)[0], a = Pt().memoizedState;
    return [t, a];
  }, useMutableSource: xf, useSyncExternalStore: mf, useId: Of, unstable_isNewReconciler: !1 };
  function $t(t, a) {
    if (t && t.defaultProps) {
      a = he({}, a), t = t.defaultProps;
      for (var l in t) a[l] === void 0 && (a[l] = t[l]);
      return a;
    }
    return a;
  }
  function E0(t, a, l, f) {
    a = t.memoizedState, l = l(f, a), l = l == null ? a : he({}, a, l), t.memoizedState = l, t.lanes === 0 && (t.updateQueue.baseState = l);
  }
  var Al = { isMounted: function(t) {
    return (t = t._reactInternals) ? L(t) === t : !1;
  }, enqueueSetState: function(t, a, l) {
    t = t._reactInternals;
    var f = lt(), h = Qn(t), m = kn(f, h);
    m.payload = a, l != null && (m.callback = l), a = $n(t, m, h), a !== null && (Yt(a, t, h, f), wl(a, t, h));
  }, enqueueReplaceState: function(t, a, l) {
    t = t._reactInternals;
    var f = lt(), h = Qn(t), m = kn(f, h);
    m.tag = 1, m.payload = a, l != null && (m.callback = l), a = $n(t, m, h), a !== null && (Yt(a, t, h, f), wl(a, t, h));
  }, enqueueForceUpdate: function(t, a) {
    t = t._reactInternals;
    var l = lt(), f = Qn(t), h = kn(l, f);
    h.tag = 2, a != null && (h.callback = a), a = $n(t, h, f), a !== null && (Yt(a, t, f, l), wl(a, t, f));
  } };
  function Lf(t, a, l, f, h, m, S) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(f, m, S) : a.prototype && a.prototype.isPureReactComponent ? !ji(l, f) || !ji(h, m) : !0;
  }
  function Mf(t, a, l) {
    var f = !1, h = Vn, m = a.contextType;
    return typeof m == "object" && m !== null ? m = Ot(m) : (h = xt(a) ? ha : Yr.current, f = a.contextTypes, m = (f = f != null) ? Ja(t, h) : Vn), a = new a(l, m), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Al, t.stateNode = a, a._reactInternals = t, f && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = h, t.__reactInternalMemoizedMaskedChildContext = m), a;
  }
  function Bf(t, a, l, f) {
    t = a.state, typeof a.componentWillReceiveProps == "function" && a.componentWillReceiveProps(l, f), typeof a.UNSAFE_componentWillReceiveProps == "function" && a.UNSAFE_componentWillReceiveProps(l, f), a.state !== t && Al.enqueueReplaceState(a, a.state, null);
  }
  function S0(t, a, l, f) {
    var h = t.stateNode;
    h.props = l, h.state = t.memoizedState, h.refs = {}, u0(t);
    var m = a.contextType;
    typeof m == "object" && m !== null ? h.context = Ot(m) : (m = xt(a) ? ha : Yr.current, h.context = Ja(t, m)), h.state = t.memoizedState, m = a.getDerivedStateFromProps, typeof m == "function" && (E0(t, a, m, l), h.state = t.memoizedState), typeof a.getDerivedStateFromProps == "function" || typeof h.getSnapshotBeforeUpdate == "function" || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (a = h.state, typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount(), a !== h.state && Al.enqueueReplaceState(h, h.state, null), yl(t, l, h, f), h.state = t.memoizedState), typeof h.componentDidMount == "function" && (t.flags |= 4194308);
  }
  function si(t, a) {
    try {
      var l = "", f = a;
      do
        l += H(f), f = f.return;
      while (f);
      var h = l;
    } catch (m) {
      h = `
Error generating stack: ` + m.message + `
` + m.stack;
    }
    return { value: t, source: a, stack: h, digest: null };
  }
  function T0(t, a, l) {
    return { value: t, source: null, stack: l ?? null, digest: a ?? null };
  }
  function C0(t, a) {
    try {
      console.error(a.value);
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  var Yx = typeof WeakMap == "function" ? WeakMap : Map;
  function jf(t, a, l) {
    l = kn(-1, l), l.tag = 3, l.payload = { element: null };
    var f = a.value;
    return l.callback = function() {
      bl || (bl = !0, z0 = f), C0(t, a);
    }, l;
  }
  function Uf(t, a, l) {
    l = kn(-1, l), l.tag = 3;
    var f = t.type.getDerivedStateFromError;
    if (typeof f == "function") {
      var h = a.value;
      l.payload = function() {
        return f(h);
      }, l.callback = function() {
        C0(t, a);
      };
    }
    var m = t.stateNode;
    return m !== null && typeof m.componentDidCatch == "function" && (l.callback = function() {
      C0(t, a), typeof f != "function" && (Xn === null ? Xn = /* @__PURE__ */ new Set([this]) : Xn.add(this));
      var S = a.stack;
      this.componentDidCatch(a.value, { componentStack: S !== null ? S : "" });
    }), l;
  }
  function zf(t, a, l) {
    var f = t.pingCache;
    if (f === null) {
      f = t.pingCache = new Yx();
      var h = /* @__PURE__ */ new Set();
      f.set(a, h);
    } else h = f.get(a), h === void 0 && (h = /* @__PURE__ */ new Set(), f.set(a, h));
    h.has(l) || (h.add(l), t = cm.bind(null, t, a, l), a.then(t, t));
  }
  function Hf(t) {
    do {
      var a;
      if ((a = t.tag === 13) && (a = t.memoizedState, a = a !== null ? a.dehydrated !== null : !0), a) return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function Vf(t, a, l, f, h) {
    return (t.mode & 1) === 0 ? (t === a ? t.flags |= 65536 : (t.flags |= 128, l.flags |= 131072, l.flags &= -52805, l.tag === 1 && (l.alternate === null ? l.tag = 17 : (a = kn(-1, 1), a.tag = 2, $n(l, a, 1))), l.lanes |= 1), t) : (t.flags |= 65536, t.lanes = h, t);
  }
  var Qx = V.ReactCurrentOwner, mt = !1;
  function st(t, a, l, f) {
    a.child = t === null ? cf(a, null, l, f) : ti(a, t.child, l, f);
  }
  function Wf(t, a, l, f, h) {
    l = l.render;
    var m = a.ref;
    return ai(a, h), f = g0(t, a, l, f, m, h), l = v0(), t !== null && !mt ? (a.updateQueue = t.updateQueue, a.flags &= -2053, t.lanes &= ~h, En(t, a, h)) : (fr && l && e0(a), a.flags |= 1, st(t, a, f, h), a.child);
  }
  function Gf(t, a, l, f, h) {
    if (t === null) {
      var m = l.type;
      return typeof m == "function" && !X0(m) && m.defaultProps === void 0 && l.compare === null && l.defaultProps === void 0 ? (a.tag = 15, a.type = m, $f(t, a, m, f, h)) : (t = Ul(l.type, null, f, a, a.mode, h), t.ref = a.ref, t.return = a, a.child = t);
    }
    if (m = t.child, (t.lanes & h) === 0) {
      var S = m.memoizedProps;
      if (l = l.compare, l = l !== null ? l : ji, l(S, f) && t.ref === a.ref) return En(t, a, h);
    }
    return a.flags |= 1, t = Jn(m, f), t.ref = a.ref, t.return = a, a.child = t;
  }
  function $f(t, a, l, f, h) {
    if (t !== null) {
      var m = t.memoizedProps;
      if (ji(m, f) && t.ref === a.ref) if (mt = !1, a.pendingProps = f = m, (t.lanes & h) !== 0) (t.flags & 131072) !== 0 && (mt = !0);
      else return a.lanes = t.lanes, En(t, a, h);
    }
    return A0(t, a, l, f, h);
  }
  function Kf(t, a, l) {
    var f = a.pendingProps, h = f.children, m = t !== null ? t.memoizedState : null;
    if (f.mode === "hidden") if ((a.mode & 1) === 0) a.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, sr(oi, Tt), Tt |= l;
    else {
      if ((l & 1073741824) === 0) return t = m !== null ? m.baseLanes | l : l, a.lanes = a.childLanes = 1073741824, a.memoizedState = { baseLanes: t, cachePool: null, transitions: null }, a.updateQueue = null, sr(oi, Tt), Tt |= t, null;
      a.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, f = m !== null ? m.baseLanes : l, sr(oi, Tt), Tt |= f;
    }
    else m !== null ? (f = m.baseLanes | l, a.memoizedState = null) : f = l, sr(oi, Tt), Tt |= f;
    return st(t, a, h, l), a.child;
  }
  function Xf(t, a) {
    var l = a.ref;
    (t === null && l !== null || t !== null && t.ref !== l) && (a.flags |= 512, a.flags |= 2097152);
  }
  function A0(t, a, l, f, h) {
    var m = xt(l) ? ha : Yr.current;
    return m = Ja(a, m), ai(a, h), l = g0(t, a, l, f, m, h), f = v0(), t !== null && !mt ? (a.updateQueue = t.updateQueue, a.flags &= -2053, t.lanes &= ~h, En(t, a, h)) : (fr && f && e0(a), a.flags |= 1, st(t, a, l, h), a.child);
  }
  function Yf(t, a, l, f, h) {
    if (xt(l)) {
      var m = !0;
      fl(a);
    } else m = !1;
    if (ai(a, h), a.stateNode === null) Nl(t, a), Mf(a, l, f), S0(a, l, f, h), f = !0;
    else if (t === null) {
      var S = a.stateNode, M = a.memoizedProps;
      S.props = M;
      var W = S.context, ce = l.contextType;
      typeof ce == "object" && ce !== null ? ce = Ot(ce) : (ce = xt(l) ? ha : Yr.current, ce = Ja(a, ce));
      var ve = l.getDerivedStateFromProps, ke = typeof ve == "function" || typeof S.getSnapshotBeforeUpdate == "function";
      ke || typeof S.UNSAFE_componentWillReceiveProps != "function" && typeof S.componentWillReceiveProps != "function" || (M !== f || W !== ce) && Bf(a, S, f, ce), Gn = !1;
      var me = a.memoizedState;
      S.state = me, yl(a, f, S, h), W = a.memoizedState, M !== f || me !== W || pt.current || Gn ? (typeof ve == "function" && (E0(a, l, ve, f), W = a.memoizedState), (M = Gn || Lf(a, l, M, f, me, W, ce)) ? (ke || typeof S.UNSAFE_componentWillMount != "function" && typeof S.componentWillMount != "function" || (typeof S.componentWillMount == "function" && S.componentWillMount(), typeof S.UNSAFE_componentWillMount == "function" && S.UNSAFE_componentWillMount()), typeof S.componentDidMount == "function" && (a.flags |= 4194308)) : (typeof S.componentDidMount == "function" && (a.flags |= 4194308), a.memoizedProps = f, a.memoizedState = W), S.props = f, S.state = W, S.context = ce, f = M) : (typeof S.componentDidMount == "function" && (a.flags |= 4194308), f = !1);
    } else {
      S = a.stateNode, ff(t, a), M = a.memoizedProps, ce = a.type === a.elementType ? M : $t(a.type, M), S.props = ce, ke = a.pendingProps, me = S.context, W = l.contextType, typeof W == "object" && W !== null ? W = Ot(W) : (W = xt(l) ? ha : Yr.current, W = Ja(a, W));
      var Re = l.getDerivedStateFromProps;
      (ve = typeof Re == "function" || typeof S.getSnapshotBeforeUpdate == "function") || typeof S.UNSAFE_componentWillReceiveProps != "function" && typeof S.componentWillReceiveProps != "function" || (M !== ke || me !== W) && Bf(a, S, f, W), Gn = !1, me = a.memoizedState, S.state = me, yl(a, f, S, h);
      var be = a.memoizedState;
      M !== ke || me !== be || pt.current || Gn ? (typeof Re == "function" && (E0(a, l, Re, f), be = a.memoizedState), (ce = Gn || Lf(a, l, ce, f, me, be, W) || !1) ? (ve || typeof S.UNSAFE_componentWillUpdate != "function" && typeof S.componentWillUpdate != "function" || (typeof S.componentWillUpdate == "function" && S.componentWillUpdate(f, be, W), typeof S.UNSAFE_componentWillUpdate == "function" && S.UNSAFE_componentWillUpdate(f, be, W)), typeof S.componentDidUpdate == "function" && (a.flags |= 4), typeof S.getSnapshotBeforeUpdate == "function" && (a.flags |= 1024)) : (typeof S.componentDidUpdate != "function" || M === t.memoizedProps && me === t.memoizedState || (a.flags |= 4), typeof S.getSnapshotBeforeUpdate != "function" || M === t.memoizedProps && me === t.memoizedState || (a.flags |= 1024), a.memoizedProps = f, a.memoizedState = be), S.props = f, S.state = be, S.context = W, f = ce) : (typeof S.componentDidUpdate != "function" || M === t.memoizedProps && me === t.memoizedState || (a.flags |= 4), typeof S.getSnapshotBeforeUpdate != "function" || M === t.memoizedProps && me === t.memoizedState || (a.flags |= 1024), f = !1);
    }
    return F0(t, a, l, f, m, h);
  }
  function F0(t, a, l, f, h, m) {
    Xf(t, a);
    var S = (a.flags & 128) !== 0;
    if (!f && !S) return h && Zu(a, l, !1), En(t, a, m);
    f = a.stateNode, Qx.current = a;
    var M = S && typeof l.getDerivedStateFromError != "function" ? null : f.render();
    return a.flags |= 1, t !== null && S ? (a.child = ti(a, t.child, null, m), a.child = ti(a, null, M, m)) : st(t, a, M, m), a.memoizedState = f.state, h && Zu(a, l, !0), a.child;
  }
  function Qf(t) {
    var a = t.stateNode;
    a.pendingContext ? qu(t, a.pendingContext, a.pendingContext !== a.context) : a.context && qu(t, a.context, !1), f0(t, a.containerInfo);
  }
  function qf(t, a, l, f, h) {
    return ri(), a0(h), a.flags |= 256, st(t, a, l, f), a.child;
  }
  var N0 = { dehydrated: null, treeContext: null, retryLane: 0 };
  function R0(t) {
    return { baseLanes: t, cachePool: null, transitions: null };
  }
  function Jf(t, a, l) {
    var f = a.pendingProps, h = hr.current, m = !1, S = (a.flags & 128) !== 0, M;
    if ((M = S) || (M = t !== null && t.memoizedState === null ? !1 : (h & 2) !== 0), M ? (m = !0, a.flags &= -129) : (t === null || t.memoizedState !== null) && (h |= 1), sr(hr, h & 1), t === null)
      return n0(a), t = a.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? ((a.mode & 1) === 0 ? a.lanes = 1 : t.data === "$!" ? a.lanes = 8 : a.lanes = 1073741824, null) : (S = f.children, t = f.fallback, m ? (f = a.mode, m = a.child, S = { mode: "hidden", children: S }, (f & 1) === 0 && m !== null ? (m.childLanes = 0, m.pendingProps = S) : m = zl(S, f, 0, null), t = Ea(t, f, l, null), m.return = a, t.return = a, m.sibling = t, a.child = m, a.child.memoizedState = R0(l), a.memoizedState = N0, t) : D0(a, S));
    if (h = t.memoizedState, h !== null && (M = h.dehydrated, M !== null)) return qx(t, a, S, f, M, h, l);
    if (m) {
      m = f.fallback, S = a.mode, h = t.child, M = h.sibling;
      var W = { mode: "hidden", children: f.children };
      return (S & 1) === 0 && a.child !== h ? (f = a.child, f.childLanes = 0, f.pendingProps = W, a.deletions = null) : (f = Jn(h, W), f.subtreeFlags = h.subtreeFlags & 14680064), M !== null ? m = Jn(M, m) : (m = Ea(m, S, l, null), m.flags |= 2), m.return = a, f.return = a, f.sibling = m, a.child = f, f = m, m = a.child, S = t.child.memoizedState, S = S === null ? R0(l) : { baseLanes: S.baseLanes | l, cachePool: null, transitions: S.transitions }, m.memoizedState = S, m.childLanes = t.childLanes & ~l, a.memoizedState = N0, f;
    }
    return m = t.child, t = m.sibling, f = Jn(m, { mode: "visible", children: f.children }), (a.mode & 1) === 0 && (f.lanes = l), f.return = a, f.sibling = null, t !== null && (l = a.deletions, l === null ? (a.deletions = [t], a.flags |= 16) : l.push(t)), a.child = f, a.memoizedState = null, f;
  }
  function D0(t, a) {
    return a = zl({ mode: "visible", children: a }, t.mode, 0, null), a.return = t, t.child = a;
  }
  function Fl(t, a, l, f) {
    return f !== null && a0(f), ti(a, t.child, null, l), t = D0(a, a.pendingProps.children), t.flags |= 2, a.memoizedState = null, t;
  }
  function qx(t, a, l, f, h, m, S) {
    if (l)
      return a.flags & 256 ? (a.flags &= -257, f = T0(Error(r(422))), Fl(t, a, S, f)) : a.memoizedState !== null ? (a.child = t.child, a.flags |= 128, null) : (m = f.fallback, h = a.mode, f = zl({ mode: "visible", children: f.children }, h, 0, null), m = Ea(m, h, S, null), m.flags |= 2, f.return = a, m.return = a, f.sibling = m, a.child = f, (a.mode & 1) !== 0 && ti(a, t.child, null, S), a.child.memoizedState = R0(S), a.memoizedState = N0, m);
    if ((a.mode & 1) === 0) return Fl(t, a, S, null);
    if (h.data === "$!") {
      if (f = h.nextSibling && h.nextSibling.dataset, f) var M = f.dgst;
      return f = M, m = Error(r(419)), f = T0(m, f, void 0), Fl(t, a, S, f);
    }
    if (M = (S & t.childLanes) !== 0, mt || M) {
      if (f = Lr, f !== null) {
        switch (S & -S) {
          case 4:
            h = 2;
            break;
          case 16:
            h = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            h = 32;
            break;
          case 536870912:
            h = 268435456;
            break;
          default:
            h = 0;
        }
        h = (h & (f.suspendedLanes | S)) !== 0 ? 0 : h, h !== 0 && h !== m.retryLane && (m.retryLane = h, _n(t, h), Yt(f, t, h, -1));
      }
      return K0(), f = T0(Error(r(421))), Fl(t, a, S, f);
    }
    return h.data === "$?" ? (a.flags |= 128, a.child = t.child, a = um.bind(null, t), h._reactRetry = a, null) : (t = m.treeContext, St = zn(h.nextSibling), Et = a, fr = !0, Gt = null, t !== null && (Rt[Dt++] = wn, Rt[Dt++] = yn, Rt[Dt++] = pa, wn = t.id, yn = t.overflow, pa = a), a = D0(a, f.children), a.flags |= 4096, a);
  }
  function Zf(t, a, l) {
    t.lanes |= a;
    var f = t.alternate;
    f !== null && (f.lanes |= a), o0(t.return, a, l);
  }
  function O0(t, a, l, f, h) {
    var m = t.memoizedState;
    m === null ? t.memoizedState = { isBackwards: a, rendering: null, renderingStartTime: 0, last: f, tail: l, tailMode: h } : (m.isBackwards = a, m.rendering = null, m.renderingStartTime = 0, m.last = f, m.tail = l, m.tailMode = h);
  }
  function ed(t, a, l) {
    var f = a.pendingProps, h = f.revealOrder, m = f.tail;
    if (st(t, a, f.children, l), f = hr.current, (f & 2) !== 0) f = f & 1 | 2, a.flags |= 128;
    else {
      if (t !== null && (t.flags & 128) !== 0) e: for (t = a.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && Zf(t, l, a);
        else if (t.tag === 19) Zf(t, l, a);
        else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === a) break e;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === a) break e;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      f &= 1;
    }
    if (sr(hr, f), (a.mode & 1) === 0) a.memoizedState = null;
    else switch (h) {
      case "forwards":
        for (l = a.child, h = null; l !== null; ) t = l.alternate, t !== null && _l(t) === null && (h = l), l = l.sibling;
        l = h, l === null ? (h = a.child, a.child = null) : (h = l.sibling, l.sibling = null), O0(a, !1, h, l, m);
        break;
      case "backwards":
        for (l = null, h = a.child, a.child = null; h !== null; ) {
          if (t = h.alternate, t !== null && _l(t) === null) {
            a.child = h;
            break;
          }
          t = h.sibling, h.sibling = l, l = h, h = t;
        }
        O0(a, !0, l, null, m);
        break;
      case "together":
        O0(a, !1, null, null, void 0);
        break;
      default:
        a.memoizedState = null;
    }
    return a.child;
  }
  function Nl(t, a) {
    (a.mode & 1) === 0 && t !== null && (t.alternate = null, a.alternate = null, a.flags |= 2);
  }
  function En(t, a, l) {
    if (t !== null && (a.dependencies = t.dependencies), wa |= a.lanes, (l & a.childLanes) === 0) return null;
    if (t !== null && a.child !== t.child) throw Error(r(153));
    if (a.child !== null) {
      for (t = a.child, l = Jn(t, t.pendingProps), a.child = l, l.return = a; t.sibling !== null; ) t = t.sibling, l = l.sibling = Jn(t, t.pendingProps), l.return = a;
      l.sibling = null;
    }
    return a.child;
  }
  function Jx(t, a, l) {
    switch (a.tag) {
      case 3:
        Qf(a), ri();
        break;
      case 5:
        pf(a);
        break;
      case 1:
        xt(a.type) && fl(a);
        break;
      case 4:
        f0(a, a.stateNode.containerInfo);
        break;
      case 10:
        var f = a.type._context, h = a.memoizedProps.value;
        sr(gl, f._currentValue), f._currentValue = h;
        break;
      case 13:
        if (f = a.memoizedState, f !== null)
          return f.dehydrated !== null ? (sr(hr, hr.current & 1), a.flags |= 128, null) : (l & a.child.childLanes) !== 0 ? Jf(t, a, l) : (sr(hr, hr.current & 1), t = En(t, a, l), t !== null ? t.sibling : null);
        sr(hr, hr.current & 1);
        break;
      case 19:
        if (f = (l & a.childLanes) !== 0, (t.flags & 128) !== 0) {
          if (f) return ed(t, a, l);
          a.flags |= 128;
        }
        if (h = a.memoizedState, h !== null && (h.rendering = null, h.tail = null, h.lastEffect = null), sr(hr, hr.current), f) break;
        return null;
      case 22:
      case 23:
        return a.lanes = 0, Kf(t, a, l);
    }
    return En(t, a, l);
  }
  var rd, P0, td, nd;
  rd = function(t, a) {
    for (var l = a.child; l !== null; ) {
      if (l.tag === 5 || l.tag === 6) t.appendChild(l.stateNode);
      else if (l.tag !== 4 && l.child !== null) {
        l.child.return = l, l = l.child;
        continue;
      }
      if (l === a) break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === a) return;
        l = l.return;
      }
      l.sibling.return = l.return, l = l.sibling;
    }
  }, P0 = function() {
  }, td = function(t, a, l, f) {
    var h = t.memoizedProps;
    if (h !== f) {
      t = a.stateNode, ga(sn.current);
      var m = null;
      switch (l) {
        case "input":
          h = je(t, h), f = je(t, f), m = [];
          break;
        case "select":
          h = he({}, h, { value: void 0 }), f = he({}, f, { value: void 0 }), m = [];
          break;
        case "textarea":
          h = pn(t, h), f = pn(t, f), m = [];
          break;
        default:
          typeof h.onClick != "function" && typeof f.onClick == "function" && (t.onclick = ol);
      }
      ki(l, f);
      var S;
      l = null;
      for (ce in h) if (!f.hasOwnProperty(ce) && h.hasOwnProperty(ce) && h[ce] != null) if (ce === "style") {
        var M = h[ce];
        for (S in M) M.hasOwnProperty(S) && (l || (l = {}), l[S] = "");
      } else ce !== "dangerouslySetInnerHTML" && ce !== "children" && ce !== "suppressContentEditableWarning" && ce !== "suppressHydrationWarning" && ce !== "autoFocus" && (i.hasOwnProperty(ce) ? m || (m = []) : (m = m || []).push(ce, null));
      for (ce in f) {
        var W = f[ce];
        if (M = h != null ? h[ce] : void 0, f.hasOwnProperty(ce) && W !== M && (W != null || M != null)) if (ce === "style") if (M) {
          for (S in M) !M.hasOwnProperty(S) || W && W.hasOwnProperty(S) || (l || (l = {}), l[S] = "");
          for (S in W) W.hasOwnProperty(S) && M[S] !== W[S] && (l || (l = {}), l[S] = W[S]);
        } else l || (m || (m = []), m.push(
          ce,
          l
        )), l = W;
        else ce === "dangerouslySetInnerHTML" ? (W = W ? W.__html : void 0, M = M ? M.__html : void 0, W != null && M !== W && (m = m || []).push(ce, W)) : ce === "children" ? typeof W != "string" && typeof W != "number" || (m = m || []).push(ce, "" + W) : ce !== "suppressContentEditableWarning" && ce !== "suppressHydrationWarning" && (i.hasOwnProperty(ce) ? (W != null && ce === "onScroll" && or("scroll", t), m || M === W || (m = [])) : (m = m || []).push(ce, W));
      }
      l && (m = m || []).push("style", l);
      var ce = m;
      (a.updateQueue = ce) && (a.flags |= 4);
    }
  }, nd = function(t, a, l, f) {
    l !== f && (a.flags |= 4);
  };
  function es(t, a) {
    if (!fr) switch (t.tailMode) {
      case "hidden":
        a = t.tail;
        for (var l = null; a !== null; ) a.alternate !== null && (l = a), a = a.sibling;
        l === null ? t.tail = null : l.sibling = null;
        break;
      case "collapsed":
        l = t.tail;
        for (var f = null; l !== null; ) l.alternate !== null && (f = l), l = l.sibling;
        f === null ? a || t.tail === null ? t.tail = null : t.tail.sibling = null : f.sibling = null;
    }
  }
  function qr(t) {
    var a = t.alternate !== null && t.alternate.child === t.child, l = 0, f = 0;
    if (a) for (var h = t.child; h !== null; ) l |= h.lanes | h.childLanes, f |= h.subtreeFlags & 14680064, f |= h.flags & 14680064, h.return = t, h = h.sibling;
    else for (h = t.child; h !== null; ) l |= h.lanes | h.childLanes, f |= h.subtreeFlags, f |= h.flags, h.return = t, h = h.sibling;
    return t.subtreeFlags |= f, t.childLanes = l, a;
  }
  function Zx(t, a, l) {
    var f = a.pendingProps;
    switch (r0(a), a.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return qr(a), null;
      case 1:
        return xt(a.type) && ul(), qr(a), null;
      case 3:
        return f = a.stateNode, ii(), cr(pt), cr(Yr), p0(), f.pendingContext && (f.context = f.pendingContext, f.pendingContext = null), (t === null || t.child === null) && (xl(a) ? a.flags |= 4 : t === null || t.memoizedState.isDehydrated && (a.flags & 256) === 0 || (a.flags |= 1024, Gt !== null && (W0(Gt), Gt = null))), P0(t, a), qr(a), null;
      case 5:
        d0(a);
        var h = ga(Yi.current);
        if (l = a.type, t !== null && a.stateNode != null) td(t, a, l, f, h), t.ref !== a.ref && (a.flags |= 512, a.flags |= 2097152);
        else {
          if (!f) {
            if (a.stateNode === null) throw Error(r(166));
            return qr(a), null;
          }
          if (t = ga(sn.current), xl(a)) {
            f = a.stateNode, l = a.type;
            var m = a.memoizedProps;
            switch (f[an] = a, f[Wi] = m, t = (a.mode & 1) !== 0, l) {
              case "dialog":
                or("cancel", f), or("close", f);
                break;
              case "iframe":
              case "object":
              case "embed":
                or("load", f);
                break;
              case "video":
              case "audio":
                for (h = 0; h < zi.length; h++) or(zi[h], f);
                break;
              case "source":
                or("error", f);
                break;
              case "img":
              case "image":
              case "link":
                or(
                  "error",
                  f
                ), or("load", f);
                break;
              case "details":
                or("toggle", f);
                break;
              case "input":
                Ke(f, m), or("invalid", f);
                break;
              case "select":
                f._wrapperState = { wasMultiple: !!m.multiple }, or("invalid", f);
                break;
              case "textarea":
                Ht(f, m), or("invalid", f);
            }
            ki(l, m), h = null;
            for (var S in m) if (m.hasOwnProperty(S)) {
              var M = m[S];
              S === "children" ? typeof M == "string" ? f.textContent !== M && (m.suppressHydrationWarning !== !0 && ll(f.textContent, M, t), h = ["children", M]) : typeof M == "number" && f.textContent !== "" + M && (m.suppressHydrationWarning !== !0 && ll(
                f.textContent,
                M,
                t
              ), h = ["children", "" + M]) : i.hasOwnProperty(S) && M != null && S === "onScroll" && or("scroll", f);
            }
            switch (l) {
              case "input":
                Pe(f), ur(f, m, !0);
                break;
              case "textarea":
                Pe(f), Nt(f);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof m.onClick == "function" && (f.onclick = ol);
            }
            f = h, a.updateQueue = f, f !== null && (a.flags |= 4);
          } else {
            S = h.nodeType === 9 ? h : h.ownerDocument, t === "http://www.w3.org/1999/xhtml" && (t = Vt(l)), t === "http://www.w3.org/1999/xhtml" ? l === "script" ? (t = S.createElement("div"), t.innerHTML = "<script><\/script>", t = t.removeChild(t.firstChild)) : typeof f.is == "string" ? t = S.createElement(l, { is: f.is }) : (t = S.createElement(l), l === "select" && (S = t, f.multiple ? S.multiple = !0 : f.size && (S.size = f.size))) : t = S.createElementNS(t, l), t[an] = a, t[Wi] = f, rd(t, a, !1, !1), a.stateNode = t;
            e: {
              switch (S = Ei(l, f), l) {
                case "dialog":
                  or("cancel", t), or("close", t), h = f;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  or("load", t), h = f;
                  break;
                case "video":
                case "audio":
                  for (h = 0; h < zi.length; h++) or(zi[h], t);
                  h = f;
                  break;
                case "source":
                  or("error", t), h = f;
                  break;
                case "img":
                case "image":
                case "link":
                  or(
                    "error",
                    t
                  ), or("load", t), h = f;
                  break;
                case "details":
                  or("toggle", t), h = f;
                  break;
                case "input":
                  Ke(t, f), h = je(t, f), or("invalid", t);
                  break;
                case "option":
                  h = f;
                  break;
                case "select":
                  t._wrapperState = { wasMultiple: !!f.multiple }, h = he({}, f, { value: void 0 }), or("invalid", t);
                  break;
                case "textarea":
                  Ht(t, f), h = pn(t, f), or("invalid", t);
                  break;
                default:
                  h = f;
              }
              ki(l, h), M = h;
              for (m in M) if (M.hasOwnProperty(m)) {
                var W = M[m];
                m === "style" ? tn(t, W) : m === "dangerouslySetInnerHTML" ? (W = W ? W.__html : void 0, W != null && _t(t, W)) : m === "children" ? typeof W == "string" ? (l !== "textarea" || W !== "") && We(t, W) : typeof W == "number" && We(t, "" + W) : m !== "suppressContentEditableWarning" && m !== "suppressHydrationWarning" && m !== "autoFocus" && (i.hasOwnProperty(m) ? W != null && m === "onScroll" && or("scroll", t) : W != null && N(t, m, W, S));
              }
              switch (l) {
                case "input":
                  Pe(t), ur(t, f, !1);
                  break;
                case "textarea":
                  Pe(t), Nt(t);
                  break;
                case "option":
                  f.value != null && t.setAttribute("value", "" + te(f.value));
                  break;
                case "select":
                  t.multiple = !!f.multiple, m = f.value, m != null ? Kr(t, !!f.multiple, m, !1) : f.defaultValue != null && Kr(
                    t,
                    !!f.multiple,
                    f.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof h.onClick == "function" && (t.onclick = ol);
              }
              switch (l) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  f = !!f.autoFocus;
                  break e;
                case "img":
                  f = !0;
                  break e;
                default:
                  f = !1;
              }
            }
            f && (a.flags |= 4);
          }
          a.ref !== null && (a.flags |= 512, a.flags |= 2097152);
        }
        return qr(a), null;
      case 6:
        if (t && a.stateNode != null) nd(t, a, t.memoizedProps, f);
        else {
          if (typeof f != "string" && a.stateNode === null) throw Error(r(166));
          if (l = ga(Yi.current), ga(sn.current), xl(a)) {
            if (f = a.stateNode, l = a.memoizedProps, f[an] = a, (m = f.nodeValue !== l) && (t = Et, t !== null)) switch (t.tag) {
              case 3:
                ll(f.nodeValue, l, (t.mode & 1) !== 0);
                break;
              case 5:
                t.memoizedProps.suppressHydrationWarning !== !0 && ll(f.nodeValue, l, (t.mode & 1) !== 0);
            }
            m && (a.flags |= 4);
          } else f = (l.nodeType === 9 ? l : l.ownerDocument).createTextNode(f), f[an] = a, a.stateNode = f;
        }
        return qr(a), null;
      case 13:
        if (cr(hr), f = a.memoizedState, t === null || t.memoizedState !== null && t.memoizedState.dehydrated !== null) {
          if (fr && St !== null && (a.mode & 1) !== 0 && (a.flags & 128) === 0) sf(), ri(), a.flags |= 98560, m = !1;
          else if (m = xl(a), f !== null && f.dehydrated !== null) {
            if (t === null) {
              if (!m) throw Error(r(318));
              if (m = a.memoizedState, m = m !== null ? m.dehydrated : null, !m) throw Error(r(317));
              m[an] = a;
            } else ri(), (a.flags & 128) === 0 && (a.memoizedState = null), a.flags |= 4;
            qr(a), m = !1;
          } else Gt !== null && (W0(Gt), Gt = null), m = !0;
          if (!m) return a.flags & 65536 ? a : null;
        }
        return (a.flags & 128) !== 0 ? (a.lanes = l, a) : (f = f !== null, f !== (t !== null && t.memoizedState !== null) && f && (a.child.flags |= 8192, (a.mode & 1) !== 0 && (t === null || (hr.current & 1) !== 0 ? Nr === 0 && (Nr = 3) : K0())), a.updateQueue !== null && (a.flags |= 4), qr(a), null);
      case 4:
        return ii(), P0(t, a), t === null && Hi(a.stateNode.containerInfo), qr(a), null;
      case 10:
        return l0(a.type._context), qr(a), null;
      case 17:
        return xt(a.type) && ul(), qr(a), null;
      case 19:
        if (cr(hr), m = a.memoizedState, m === null) return qr(a), null;
        if (f = (a.flags & 128) !== 0, S = m.rendering, S === null) if (f) es(m, !1);
        else {
          if (Nr !== 0 || t !== null && (t.flags & 128) !== 0) for (t = a.child; t !== null; ) {
            if (S = _l(t), S !== null) {
              for (a.flags |= 128, es(m, !1), f = S.updateQueue, f !== null && (a.updateQueue = f, a.flags |= 4), a.subtreeFlags = 0, f = l, l = a.child; l !== null; ) m = l, t = f, m.flags &= 14680066, S = m.alternate, S === null ? (m.childLanes = 0, m.lanes = t, m.child = null, m.subtreeFlags = 0, m.memoizedProps = null, m.memoizedState = null, m.updateQueue = null, m.dependencies = null, m.stateNode = null) : (m.childLanes = S.childLanes, m.lanes = S.lanes, m.child = S.child, m.subtreeFlags = 0, m.deletions = null, m.memoizedProps = S.memoizedProps, m.memoizedState = S.memoizedState, m.updateQueue = S.updateQueue, m.type = S.type, t = S.dependencies, m.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }), l = l.sibling;
              return sr(hr, hr.current & 1 | 2), a.child;
            }
            t = t.sibling;
          }
          m.tail !== null && Ee() > ci && (a.flags |= 128, f = !0, es(m, !1), a.lanes = 4194304);
        }
        else {
          if (!f) if (t = _l(S), t !== null) {
            if (a.flags |= 128, f = !0, l = t.updateQueue, l !== null && (a.updateQueue = l, a.flags |= 4), es(m, !0), m.tail === null && m.tailMode === "hidden" && !S.alternate && !fr) return qr(a), null;
          } else 2 * Ee() - m.renderingStartTime > ci && l !== 1073741824 && (a.flags |= 128, f = !0, es(m, !1), a.lanes = 4194304);
          m.isBackwards ? (S.sibling = a.child, a.child = S) : (l = m.last, l !== null ? l.sibling = S : a.child = S, m.last = S);
        }
        return m.tail !== null ? (a = m.tail, m.rendering = a, m.tail = a.sibling, m.renderingStartTime = Ee(), a.sibling = null, l = hr.current, sr(hr, f ? l & 1 | 2 : l & 1), a) : (qr(a), null);
      case 22:
      case 23:
        return $0(), f = a.memoizedState !== null, t !== null && t.memoizedState !== null !== f && (a.flags |= 8192), f && (a.mode & 1) !== 0 ? (Tt & 1073741824) !== 0 && (qr(a), a.subtreeFlags & 6 && (a.flags |= 8192)) : qr(a), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(r(156, a.tag));
  }
  function em(t, a) {
    switch (r0(a), a.tag) {
      case 1:
        return xt(a.type) && ul(), t = a.flags, t & 65536 ? (a.flags = t & -65537 | 128, a) : null;
      case 3:
        return ii(), cr(pt), cr(Yr), p0(), t = a.flags, (t & 65536) !== 0 && (t & 128) === 0 ? (a.flags = t & -65537 | 128, a) : null;
      case 5:
        return d0(a), null;
      case 13:
        if (cr(hr), t = a.memoizedState, t !== null && t.dehydrated !== null) {
          if (a.alternate === null) throw Error(r(340));
          ri();
        }
        return t = a.flags, t & 65536 ? (a.flags = t & -65537 | 128, a) : null;
      case 19:
        return cr(hr), null;
      case 4:
        return ii(), null;
      case 10:
        return l0(a.type._context), null;
      case 22:
      case 23:
        return $0(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Rl = !1, Jr = !1, rm = typeof WeakSet == "function" ? WeakSet : Set, Oe = null;
  function li(t, a) {
    var l = t.ref;
    if (l !== null) if (typeof l == "function") try {
      l(null);
    } catch (f) {
      mr(t, a, f);
    }
    else l.current = null;
  }
  function b0(t, a, l) {
    try {
      l();
    } catch (f) {
      mr(t, a, f);
    }
  }
  var ad = !1;
  function tm(t, a) {
    if ($o = Qs, t = Iu(), Bo(t)) {
      if ("selectionStart" in t) var l = { start: t.selectionStart, end: t.selectionEnd };
      else e: {
        l = (l = t.ownerDocument) && l.defaultView || window;
        var f = l.getSelection && l.getSelection();
        if (f && f.rangeCount !== 0) {
          l = f.anchorNode;
          var h = f.anchorOffset, m = f.focusNode;
          f = f.focusOffset;
          try {
            l.nodeType, m.nodeType;
          } catch {
            l = null;
            break e;
          }
          var S = 0, M = -1, W = -1, ce = 0, ve = 0, ke = t, me = null;
          r: for (; ; ) {
            for (var Re; ke !== l || h !== 0 && ke.nodeType !== 3 || (M = S + h), ke !== m || f !== 0 && ke.nodeType !== 3 || (W = S + f), ke.nodeType === 3 && (S += ke.nodeValue.length), (Re = ke.firstChild) !== null; )
              me = ke, ke = Re;
            for (; ; ) {
              if (ke === t) break r;
              if (me === l && ++ce === h && (M = S), me === m && ++ve === f && (W = S), (Re = ke.nextSibling) !== null) break;
              ke = me, me = ke.parentNode;
            }
            ke = Re;
          }
          l = M === -1 || W === -1 ? null : { start: M, end: W };
        } else l = null;
      }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (Ko = { focusedElem: t, selectionRange: l }, Qs = !1, Oe = a; Oe !== null; ) if (a = Oe, t = a.child, (a.subtreeFlags & 1028) !== 0 && t !== null) t.return = a, Oe = t;
    else for (; Oe !== null; ) {
      a = Oe;
      try {
        var be = a.alternate;
        if ((a.flags & 1024) !== 0) switch (a.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (be !== null) {
              var Ie = be.memoizedProps, _r = be.memoizedState, ee = a.stateNode, q = ee.getSnapshotBeforeUpdate(a.elementType === a.type ? Ie : $t(a.type, Ie), _r);
              ee.__reactInternalSnapshotBeforeUpdate = q;
            }
            break;
          case 3:
            var ne = a.stateNode.containerInfo;
            ne.nodeType === 1 ? ne.textContent = "" : ne.nodeType === 9 && ne.documentElement && ne.removeChild(ne.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(r(163));
        }
      } catch (Te) {
        mr(a, a.return, Te);
      }
      if (t = a.sibling, t !== null) {
        t.return = a.return, Oe = t;
        break;
      }
      Oe = a.return;
    }
    return be = ad, ad = !1, be;
  }
  function rs(t, a, l) {
    var f = a.updateQueue;
    if (f = f !== null ? f.lastEffect : null, f !== null) {
      var h = f = f.next;
      do {
        if ((h.tag & t) === t) {
          var m = h.destroy;
          h.destroy = void 0, m !== void 0 && b0(a, l, m);
        }
        h = h.next;
      } while (h !== f);
    }
  }
  function Dl(t, a) {
    if (a = a.updateQueue, a = a !== null ? a.lastEffect : null, a !== null) {
      var l = a = a.next;
      do {
        if ((l.tag & t) === t) {
          var f = l.create;
          l.destroy = f();
        }
        l = l.next;
      } while (l !== a);
    }
  }
  function I0(t) {
    var a = t.ref;
    if (a !== null) {
      var l = t.stateNode;
      switch (t.tag) {
        case 5:
          t = l;
          break;
        default:
          t = l;
      }
      typeof a == "function" ? a(t) : a.current = t;
    }
  }
  function id(t) {
    var a = t.alternate;
    a !== null && (t.alternate = null, id(a)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (a = t.stateNode, a !== null && (delete a[an], delete a[Wi], delete a[qo], delete a[Bx], delete a[jx])), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function sd(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function ld(t) {
    e: for (; ; ) {
      for (; t.sibling === null; ) {
        if (t.return === null || sd(t.return)) return null;
        t = t.return;
      }
      for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
        if (t.flags & 2 || t.child === null || t.tag === 4) continue e;
        t.child.return = t, t = t.child;
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function L0(t, a, l) {
    var f = t.tag;
    if (f === 5 || f === 6) t = t.stateNode, a ? l.nodeType === 8 ? l.parentNode.insertBefore(t, a) : l.insertBefore(t, a) : (l.nodeType === 8 ? (a = l.parentNode, a.insertBefore(t, l)) : (a = l, a.appendChild(t)), l = l._reactRootContainer, l != null || a.onclick !== null || (a.onclick = ol));
    else if (f !== 4 && (t = t.child, t !== null)) for (L0(t, a, l), t = t.sibling; t !== null; ) L0(t, a, l), t = t.sibling;
  }
  function M0(t, a, l) {
    var f = t.tag;
    if (f === 5 || f === 6) t = t.stateNode, a ? l.insertBefore(t, a) : l.appendChild(t);
    else if (f !== 4 && (t = t.child, t !== null)) for (M0(t, a, l), t = t.sibling; t !== null; ) M0(t, a, l), t = t.sibling;
  }
  var Ur = null, Kt = !1;
  function Kn(t, a, l) {
    for (l = l.child; l !== null; ) od(t, a, l), l = l.sibling;
  }
  function od(t, a, l) {
    if (br && typeof br.onCommitFiberUnmount == "function") try {
      br.onCommitFiberUnmount(nn, l);
    } catch {
    }
    switch (l.tag) {
      case 5:
        Jr || li(l, a);
      case 6:
        var f = Ur, h = Kt;
        Ur = null, Kn(t, a, l), Ur = f, Kt = h, Ur !== null && (Kt ? (t = Ur, l = l.stateNode, t.nodeType === 8 ? t.parentNode.removeChild(l) : t.removeChild(l)) : Ur.removeChild(l.stateNode));
        break;
      case 18:
        Ur !== null && (Kt ? (t = Ur, l = l.stateNode, t.nodeType === 8 ? Qo(t.parentNode, l) : t.nodeType === 1 && Qo(t, l), Pi(t)) : Qo(Ur, l.stateNode));
        break;
      case 4:
        f = Ur, h = Kt, Ur = l.stateNode.containerInfo, Kt = !0, Kn(t, a, l), Ur = f, Kt = h;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!Jr && (f = l.updateQueue, f !== null && (f = f.lastEffect, f !== null))) {
          h = f = f.next;
          do {
            var m = h, S = m.destroy;
            m = m.tag, S !== void 0 && ((m & 2) !== 0 || (m & 4) !== 0) && b0(l, a, S), h = h.next;
          } while (h !== f);
        }
        Kn(t, a, l);
        break;
      case 1:
        if (!Jr && (li(l, a), f = l.stateNode, typeof f.componentWillUnmount == "function")) try {
          f.props = l.memoizedProps, f.state = l.memoizedState, f.componentWillUnmount();
        } catch (M) {
          mr(l, a, M);
        }
        Kn(t, a, l);
        break;
      case 21:
        Kn(t, a, l);
        break;
      case 22:
        l.mode & 1 ? (Jr = (f = Jr) || l.memoizedState !== null, Kn(t, a, l), Jr = f) : Kn(t, a, l);
        break;
      default:
        Kn(t, a, l);
    }
  }
  function cd(t) {
    var a = t.updateQueue;
    if (a !== null) {
      t.updateQueue = null;
      var l = t.stateNode;
      l === null && (l = t.stateNode = new rm()), a.forEach(function(f) {
        var h = fm.bind(null, t, f);
        l.has(f) || (l.add(f), f.then(h, h));
      });
    }
  }
  function Xt(t, a) {
    var l = a.deletions;
    if (l !== null) for (var f = 0; f < l.length; f++) {
      var h = l[f];
      try {
        var m = t, S = a, M = S;
        e: for (; M !== null; ) {
          switch (M.tag) {
            case 5:
              Ur = M.stateNode, Kt = !1;
              break e;
            case 3:
              Ur = M.stateNode.containerInfo, Kt = !0;
              break e;
            case 4:
              Ur = M.stateNode.containerInfo, Kt = !0;
              break e;
          }
          M = M.return;
        }
        if (Ur === null) throw Error(r(160));
        od(m, S, h), Ur = null, Kt = !1;
        var W = h.alternate;
        W !== null && (W.return = null), h.return = null;
      } catch (ce) {
        mr(h, a, ce);
      }
    }
    if (a.subtreeFlags & 12854) for (a = a.child; a !== null; ) ud(a, t), a = a.sibling;
  }
  function ud(t, a) {
    var l = t.alternate, f = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Xt(a, t), on(t), f & 4) {
          try {
            rs(3, t, t.return), Dl(3, t);
          } catch (Ie) {
            mr(t, t.return, Ie);
          }
          try {
            rs(5, t, t.return);
          } catch (Ie) {
            mr(t, t.return, Ie);
          }
        }
        break;
      case 1:
        Xt(a, t), on(t), f & 512 && l !== null && li(l, l.return);
        break;
      case 5:
        if (Xt(a, t), on(t), f & 512 && l !== null && li(l, l.return), t.flags & 32) {
          var h = t.stateNode;
          try {
            We(h, "");
          } catch (Ie) {
            mr(t, t.return, Ie);
          }
        }
        if (f & 4 && (h = t.stateNode, h != null)) {
          var m = t.memoizedProps, S = l !== null ? l.memoizedProps : m, M = t.type, W = t.updateQueue;
          if (t.updateQueue = null, W !== null) try {
            M === "input" && m.type === "radio" && m.name != null && Ve(h, m), Ei(M, S);
            var ce = Ei(M, m);
            for (S = 0; S < W.length; S += 2) {
              var ve = W[S], ke = W[S + 1];
              ve === "style" ? tn(h, ke) : ve === "dangerouslySetInnerHTML" ? _t(h, ke) : ve === "children" ? We(h, ke) : N(h, ve, ke, ce);
            }
            switch (M) {
              case "input":
                Fe(h, m);
                break;
              case "textarea":
                Xr(h, m);
                break;
              case "select":
                var me = h._wrapperState.wasMultiple;
                h._wrapperState.wasMultiple = !!m.multiple;
                var Re = m.value;
                Re != null ? Kr(h, !!m.multiple, Re, !1) : me !== !!m.multiple && (m.defaultValue != null ? Kr(
                  h,
                  !!m.multiple,
                  m.defaultValue,
                  !0
                ) : Kr(h, !!m.multiple, m.multiple ? [] : "", !1));
            }
            h[Wi] = m;
          } catch (Ie) {
            mr(t, t.return, Ie);
          }
        }
        break;
      case 6:
        if (Xt(a, t), on(t), f & 4) {
          if (t.stateNode === null) throw Error(r(162));
          h = t.stateNode, m = t.memoizedProps;
          try {
            h.nodeValue = m;
          } catch (Ie) {
            mr(t, t.return, Ie);
          }
        }
        break;
      case 3:
        if (Xt(a, t), on(t), f & 4 && l !== null && l.memoizedState.isDehydrated) try {
          Pi(a.containerInfo);
        } catch (Ie) {
          mr(t, t.return, Ie);
        }
        break;
      case 4:
        Xt(a, t), on(t);
        break;
      case 13:
        Xt(a, t), on(t), h = t.child, h.flags & 8192 && (m = h.memoizedState !== null, h.stateNode.isHidden = m, !m || h.alternate !== null && h.alternate.memoizedState !== null || (U0 = Ee())), f & 4 && cd(t);
        break;
      case 22:
        if (ve = l !== null && l.memoizedState !== null, t.mode & 1 ? (Jr = (ce = Jr) || ve, Xt(a, t), Jr = ce) : Xt(a, t), on(t), f & 8192) {
          if (ce = t.memoizedState !== null, (t.stateNode.isHidden = ce) && !ve && (t.mode & 1) !== 0) for (Oe = t, ve = t.child; ve !== null; ) {
            for (ke = Oe = ve; Oe !== null; ) {
              switch (me = Oe, Re = me.child, me.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  rs(4, me, me.return);
                  break;
                case 1:
                  li(me, me.return);
                  var be = me.stateNode;
                  if (typeof be.componentWillUnmount == "function") {
                    f = me, l = me.return;
                    try {
                      a = f, be.props = a.memoizedProps, be.state = a.memoizedState, be.componentWillUnmount();
                    } catch (Ie) {
                      mr(f, l, Ie);
                    }
                  }
                  break;
                case 5:
                  li(me, me.return);
                  break;
                case 22:
                  if (me.memoizedState !== null) {
                    hd(ke);
                    continue;
                  }
              }
              Re !== null ? (Re.return = me, Oe = Re) : hd(ke);
            }
            ve = ve.sibling;
          }
          e: for (ve = null, ke = t; ; ) {
            if (ke.tag === 5) {
              if (ve === null) {
                ve = ke;
                try {
                  h = ke.stateNode, ce ? (m = h.style, typeof m.setProperty == "function" ? m.setProperty("display", "none", "important") : m.display = "none") : (M = ke.stateNode, W = ke.memoizedProps.style, S = W != null && W.hasOwnProperty("display") ? W.display : null, M.style.display = xr("display", S));
                } catch (Ie) {
                  mr(t, t.return, Ie);
                }
              }
            } else if (ke.tag === 6) {
              if (ve === null) try {
                ke.stateNode.nodeValue = ce ? "" : ke.memoizedProps;
              } catch (Ie) {
                mr(t, t.return, Ie);
              }
            } else if ((ke.tag !== 22 && ke.tag !== 23 || ke.memoizedState === null || ke === t) && ke.child !== null) {
              ke.child.return = ke, ke = ke.child;
              continue;
            }
            if (ke === t) break e;
            for (; ke.sibling === null; ) {
              if (ke.return === null || ke.return === t) break e;
              ve === ke && (ve = null), ke = ke.return;
            }
            ve === ke && (ve = null), ke.sibling.return = ke.return, ke = ke.sibling;
          }
        }
        break;
      case 19:
        Xt(a, t), on(t), f & 4 && cd(t);
        break;
      case 21:
        break;
      default:
        Xt(
          a,
          t
        ), on(t);
    }
  }
  function on(t) {
    var a = t.flags;
    if (a & 2) {
      try {
        e: {
          for (var l = t.return; l !== null; ) {
            if (sd(l)) {
              var f = l;
              break e;
            }
            l = l.return;
          }
          throw Error(r(160));
        }
        switch (f.tag) {
          case 5:
            var h = f.stateNode;
            f.flags & 32 && (We(h, ""), f.flags &= -33);
            var m = ld(t);
            M0(t, m, h);
            break;
          case 3:
          case 4:
            var S = f.stateNode.containerInfo, M = ld(t);
            L0(t, M, S);
            break;
          default:
            throw Error(r(161));
        }
      } catch (W) {
        mr(t, t.return, W);
      }
      t.flags &= -3;
    }
    a & 4096 && (t.flags &= -4097);
  }
  function nm(t, a, l) {
    Oe = t, fd(t);
  }
  function fd(t, a, l) {
    for (var f = (t.mode & 1) !== 0; Oe !== null; ) {
      var h = Oe, m = h.child;
      if (h.tag === 22 && f) {
        var S = h.memoizedState !== null || Rl;
        if (!S) {
          var M = h.alternate, W = M !== null && M.memoizedState !== null || Jr;
          M = Rl;
          var ce = Jr;
          if (Rl = S, (Jr = W) && !ce) for (Oe = h; Oe !== null; ) S = Oe, W = S.child, S.tag === 22 && S.memoizedState !== null ? pd(h) : W !== null ? (W.return = S, Oe = W) : pd(h);
          for (; m !== null; ) Oe = m, fd(m), m = m.sibling;
          Oe = h, Rl = M, Jr = ce;
        }
        dd(t);
      } else (h.subtreeFlags & 8772) !== 0 && m !== null ? (m.return = h, Oe = m) : dd(t);
    }
  }
  function dd(t) {
    for (; Oe !== null; ) {
      var a = Oe;
      if ((a.flags & 8772) !== 0) {
        var l = a.alternate;
        try {
          if ((a.flags & 8772) !== 0) switch (a.tag) {
            case 0:
            case 11:
            case 15:
              Jr || Dl(5, a);
              break;
            case 1:
              var f = a.stateNode;
              if (a.flags & 4 && !Jr) if (l === null) f.componentDidMount();
              else {
                var h = a.elementType === a.type ? l.memoizedProps : $t(a.type, l.memoizedProps);
                f.componentDidUpdate(h, l.memoizedState, f.__reactInternalSnapshotBeforeUpdate);
              }
              var m = a.updateQueue;
              m !== null && hf(a, m, f);
              break;
            case 3:
              var S = a.updateQueue;
              if (S !== null) {
                if (l = null, a.child !== null) switch (a.child.tag) {
                  case 5:
                    l = a.child.stateNode;
                    break;
                  case 1:
                    l = a.child.stateNode;
                }
                hf(a, S, l);
              }
              break;
            case 5:
              var M = a.stateNode;
              if (l === null && a.flags & 4) {
                l = M;
                var W = a.memoizedProps;
                switch (a.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    W.autoFocus && l.focus();
                    break;
                  case "img":
                    W.src && (l.src = W.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (a.memoizedState === null) {
                var ce = a.alternate;
                if (ce !== null) {
                  var ve = ce.memoizedState;
                  if (ve !== null) {
                    var ke = ve.dehydrated;
                    ke !== null && Pi(ke);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(r(163));
          }
          Jr || a.flags & 512 && I0(a);
        } catch (me) {
          mr(a, a.return, me);
        }
      }
      if (a === t) {
        Oe = null;
        break;
      }
      if (l = a.sibling, l !== null) {
        l.return = a.return, Oe = l;
        break;
      }
      Oe = a.return;
    }
  }
  function hd(t) {
    for (; Oe !== null; ) {
      var a = Oe;
      if (a === t) {
        Oe = null;
        break;
      }
      var l = a.sibling;
      if (l !== null) {
        l.return = a.return, Oe = l;
        break;
      }
      Oe = a.return;
    }
  }
  function pd(t) {
    for (; Oe !== null; ) {
      var a = Oe;
      try {
        switch (a.tag) {
          case 0:
          case 11:
          case 15:
            var l = a.return;
            try {
              Dl(4, a);
            } catch (W) {
              mr(a, l, W);
            }
            break;
          case 1:
            var f = a.stateNode;
            if (typeof f.componentDidMount == "function") {
              var h = a.return;
              try {
                f.componentDidMount();
              } catch (W) {
                mr(a, h, W);
              }
            }
            var m = a.return;
            try {
              I0(a);
            } catch (W) {
              mr(a, m, W);
            }
            break;
          case 5:
            var S = a.return;
            try {
              I0(a);
            } catch (W) {
              mr(a, S, W);
            }
        }
      } catch (W) {
        mr(a, a.return, W);
      }
      if (a === t) {
        Oe = null;
        break;
      }
      var M = a.sibling;
      if (M !== null) {
        M.return = a.return, Oe = M;
        break;
      }
      Oe = a.return;
    }
  }
  var am = Math.ceil, Ol = V.ReactCurrentDispatcher, B0 = V.ReactCurrentOwner, bt = V.ReactCurrentBatchConfig, Ze = 0, Lr = null, Sr = null, zr = 0, Tt = 0, oi = Hn(0), Nr = 0, ts = null, wa = 0, Pl = 0, j0 = 0, ns = null, gt = null, U0 = 0, ci = 1 / 0, Sn = null, bl = !1, z0 = null, Xn = null, Il = !1, Yn = null, Ll = 0, as = 0, H0 = null, Ml = -1, Bl = 0;
  function lt() {
    return (Ze & 6) !== 0 ? Ee() : Ml !== -1 ? Ml : Ml = Ee();
  }
  function Qn(t) {
    return (t.mode & 1) === 0 ? 1 : (Ze & 2) !== 0 && zr !== 0 ? zr & -zr : zx.transition !== null ? (Bl === 0 && (Bl = su()), Bl) : (t = tr, t !== 0 || (t = window.event, t = t === void 0 ? 16 : xu(t.type)), t);
  }
  function Yt(t, a, l, f) {
    if (50 < as) throw as = 0, H0 = null, Error(r(185));
    Fi(t, l, f), ((Ze & 2) === 0 || t !== Lr) && (t === Lr && ((Ze & 2) === 0 && (Pl |= l), Nr === 4 && qn(t, zr)), vt(t, f), l === 1 && Ze === 0 && (a.mode & 1) === 0 && (ci = Ee() + 500, dl && Wn()));
  }
  function vt(t, a) {
    var l = t.callbackNode;
    z1(t, a);
    var f = Ks(t, t === Lr ? zr : 0);
    if (f === 0) l !== null && Ne(l), t.callbackNode = null, t.callbackPriority = 0;
    else if (a = f & -f, t.callbackPriority !== a) {
      if (l != null && Ne(l), a === 1) t.tag === 0 ? Ux(md.bind(null, t)) : ef(md.bind(null, t)), Lx(function() {
        (Ze & 6) === 0 && Wn();
      }), l = null;
      else {
        switch (lu(f)) {
          case 1:
            l = ar;
            break;
          case 4:
            l = ir;
            break;
          case 16:
            l = wr;
            break;
          case 536870912:
            l = bn;
            break;
          default:
            l = wr;
        }
        l = Sd(l, xd.bind(null, t));
      }
      t.callbackPriority = a, t.callbackNode = l;
    }
  }
  function xd(t, a) {
    if (Ml = -1, Bl = 0, (Ze & 6) !== 0) throw Error(r(327));
    var l = t.callbackNode;
    if (ui() && t.callbackNode !== l) return null;
    var f = Ks(t, t === Lr ? zr : 0);
    if (f === 0) return null;
    if ((f & 30) !== 0 || (f & t.expiredLanes) !== 0 || a) a = jl(t, f);
    else {
      a = f;
      var h = Ze;
      Ze |= 2;
      var m = vd();
      (Lr !== t || zr !== a) && (Sn = null, ci = Ee() + 500, _a(t, a));
      do
        try {
          lm();
          break;
        } catch (M) {
          gd(t, M);
        }
      while (!0);
      s0(), Ol.current = m, Ze = h, Sr !== null ? a = 0 : (Lr = null, zr = 0, a = Nr);
    }
    if (a !== 0) {
      if (a === 2 && (h = ko(t), h !== 0 && (f = h, a = V0(t, h))), a === 1) throw l = ts, _a(t, 0), qn(t, f), vt(t, Ee()), l;
      if (a === 6) qn(t, f);
      else {
        if (h = t.current.alternate, (f & 30) === 0 && !im(h) && (a = jl(t, f), a === 2 && (m = ko(t), m !== 0 && (f = m, a = V0(t, m))), a === 1)) throw l = ts, _a(t, 0), qn(t, f), vt(t, Ee()), l;
        switch (t.finishedWork = h, t.finishedLanes = f, a) {
          case 0:
          case 1:
            throw Error(r(345));
          case 2:
            ka(t, gt, Sn);
            break;
          case 3:
            if (qn(t, f), (f & 130023424) === f && (a = U0 + 500 - Ee(), 10 < a)) {
              if (Ks(t, 0) !== 0) break;
              if (h = t.suspendedLanes, (h & f) !== f) {
                lt(), t.pingedLanes |= t.suspendedLanes & h;
                break;
              }
              t.timeoutHandle = Yo(ka.bind(null, t, gt, Sn), a);
              break;
            }
            ka(t, gt, Sn);
            break;
          case 4:
            if (qn(t, f), (f & 4194240) === f) break;
            for (a = t.eventTimes, h = -1; 0 < f; ) {
              var S = 31 - yr(f);
              m = 1 << S, S = a[S], S > h && (h = S), f &= ~m;
            }
            if (f = h, f = Ee() - f, f = (120 > f ? 120 : 480 > f ? 480 : 1080 > f ? 1080 : 1920 > f ? 1920 : 3e3 > f ? 3e3 : 4320 > f ? 4320 : 1960 * am(f / 1960)) - f, 10 < f) {
              t.timeoutHandle = Yo(ka.bind(null, t, gt, Sn), f);
              break;
            }
            ka(t, gt, Sn);
            break;
          case 5:
            ka(t, gt, Sn);
            break;
          default:
            throw Error(r(329));
        }
      }
    }
    return vt(t, Ee()), t.callbackNode === l ? xd.bind(null, t) : null;
  }
  function V0(t, a) {
    var l = ns;
    return t.current.memoizedState.isDehydrated && (_a(t, a).flags |= 256), t = jl(t, a), t !== 2 && (a = gt, gt = l, a !== null && W0(a)), t;
  }
  function W0(t) {
    gt === null ? gt = t : gt.push.apply(gt, t);
  }
  function im(t) {
    for (var a = t; ; ) {
      if (a.flags & 16384) {
        var l = a.updateQueue;
        if (l !== null && (l = l.stores, l !== null)) for (var f = 0; f < l.length; f++) {
          var h = l[f], m = h.getSnapshot;
          h = h.value;
          try {
            if (!Wt(m(), h)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (l = a.child, a.subtreeFlags & 16384 && l !== null) l.return = a, a = l;
      else {
        if (a === t) break;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === t) return !0;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
    }
    return !0;
  }
  function qn(t, a) {
    for (a &= ~j0, a &= ~Pl, t.suspendedLanes |= a, t.pingedLanes &= ~a, t = t.expirationTimes; 0 < a; ) {
      var l = 31 - yr(a), f = 1 << l;
      t[l] = -1, a &= ~f;
    }
  }
  function md(t) {
    if ((Ze & 6) !== 0) throw Error(r(327));
    ui();
    var a = Ks(t, 0);
    if ((a & 1) === 0) return vt(t, Ee()), null;
    var l = jl(t, a);
    if (t.tag !== 0 && l === 2) {
      var f = ko(t);
      f !== 0 && (a = f, l = V0(t, f));
    }
    if (l === 1) throw l = ts, _a(t, 0), qn(t, a), vt(t, Ee()), l;
    if (l === 6) throw Error(r(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = a, ka(t, gt, Sn), vt(t, Ee()), null;
  }
  function G0(t, a) {
    var l = Ze;
    Ze |= 1;
    try {
      return t(a);
    } finally {
      Ze = l, Ze === 0 && (ci = Ee() + 500, dl && Wn());
    }
  }
  function ya(t) {
    Yn !== null && Yn.tag === 0 && (Ze & 6) === 0 && ui();
    var a = Ze;
    Ze |= 1;
    var l = bt.transition, f = tr;
    try {
      if (bt.transition = null, tr = 1, t) return t();
    } finally {
      tr = f, bt.transition = l, Ze = a, (Ze & 6) === 0 && Wn();
    }
  }
  function $0() {
    Tt = oi.current, cr(oi);
  }
  function _a(t, a) {
    t.finishedWork = null, t.finishedLanes = 0;
    var l = t.timeoutHandle;
    if (l !== -1 && (t.timeoutHandle = -1, Ix(l)), Sr !== null) for (l = Sr.return; l !== null; ) {
      var f = l;
      switch (r0(f), f.tag) {
        case 1:
          f = f.type.childContextTypes, f != null && ul();
          break;
        case 3:
          ii(), cr(pt), cr(Yr), p0();
          break;
        case 5:
          d0(f);
          break;
        case 4:
          ii();
          break;
        case 13:
          cr(hr);
          break;
        case 19:
          cr(hr);
          break;
        case 10:
          l0(f.type._context);
          break;
        case 22:
        case 23:
          $0();
      }
      l = l.return;
    }
    if (Lr = t, Sr = t = Jn(t.current, null), zr = Tt = a, Nr = 0, ts = null, j0 = Pl = wa = 0, gt = ns = null, ma !== null) {
      for (a = 0; a < ma.length; a++) if (l = ma[a], f = l.interleaved, f !== null) {
        l.interleaved = null;
        var h = f.next, m = l.pending;
        if (m !== null) {
          var S = m.next;
          m.next = h, f.next = S;
        }
        l.pending = f;
      }
      ma = null;
    }
    return t;
  }
  function gd(t, a) {
    do {
      var l = Sr;
      try {
        if (s0(), kl.current = Cl, El) {
          for (var f = pr.memoizedState; f !== null; ) {
            var h = f.queue;
            h !== null && (h.pending = null), f = f.next;
          }
          El = !1;
        }
        if (va = 0, Ir = Fr = pr = null, Qi = !1, qi = 0, B0.current = null, l === null || l.return === null) {
          Nr = 1, ts = a, Sr = null;
          break;
        }
        e: {
          var m = t, S = l.return, M = l, W = a;
          if (a = zr, M.flags |= 32768, W !== null && typeof W == "object" && typeof W.then == "function") {
            var ce = W, ve = M, ke = ve.tag;
            if ((ve.mode & 1) === 0 && (ke === 0 || ke === 11 || ke === 15)) {
              var me = ve.alternate;
              me ? (ve.updateQueue = me.updateQueue, ve.memoizedState = me.memoizedState, ve.lanes = me.lanes) : (ve.updateQueue = null, ve.memoizedState = null);
            }
            var Re = Hf(S);
            if (Re !== null) {
              Re.flags &= -257, Vf(Re, S, M, m, a), Re.mode & 1 && zf(m, ce, a), a = Re, W = ce;
              var be = a.updateQueue;
              if (be === null) {
                var Ie = /* @__PURE__ */ new Set();
                Ie.add(W), a.updateQueue = Ie;
              } else be.add(W);
              break e;
            } else {
              if ((a & 1) === 0) {
                zf(m, ce, a), K0();
                break e;
              }
              W = Error(r(426));
            }
          } else if (fr && M.mode & 1) {
            var _r = Hf(S);
            if (_r !== null) {
              (_r.flags & 65536) === 0 && (_r.flags |= 256), Vf(_r, S, M, m, a), a0(si(W, M));
              break e;
            }
          }
          m = W = si(W, M), Nr !== 4 && (Nr = 2), ns === null ? ns = [m] : ns.push(m), m = S;
          do {
            switch (m.tag) {
              case 3:
                m.flags |= 65536, a &= -a, m.lanes |= a;
                var ee = jf(m, W, a);
                df(m, ee);
                break e;
              case 1:
                M = W;
                var q = m.type, ne = m.stateNode;
                if ((m.flags & 128) === 0 && (typeof q.getDerivedStateFromError == "function" || ne !== null && typeof ne.componentDidCatch == "function" && (Xn === null || !Xn.has(ne)))) {
                  m.flags |= 65536, a &= -a, m.lanes |= a;
                  var Te = Uf(m, M, a);
                  df(m, Te);
                  break e;
                }
            }
            m = m.return;
          } while (m !== null);
        }
        yd(l);
      } catch (Le) {
        a = Le, Sr === l && l !== null && (Sr = l = l.return);
        continue;
      }
      break;
    } while (!0);
  }
  function vd() {
    var t = Ol.current;
    return Ol.current = Cl, t === null ? Cl : t;
  }
  function K0() {
    (Nr === 0 || Nr === 3 || Nr === 2) && (Nr = 4), Lr === null || (wa & 268435455) === 0 && (Pl & 268435455) === 0 || qn(Lr, zr);
  }
  function jl(t, a) {
    var l = Ze;
    Ze |= 2;
    var f = vd();
    (Lr !== t || zr !== a) && (Sn = null, _a(t, a));
    do
      try {
        sm();
        break;
      } catch (h) {
        gd(t, h);
      }
    while (!0);
    if (s0(), Ze = l, Ol.current = f, Sr !== null) throw Error(r(261));
    return Lr = null, zr = 0, Nr;
  }
  function sm() {
    for (; Sr !== null; ) wd(Sr);
  }
  function lm() {
    for (; Sr !== null && !De(); ) wd(Sr);
  }
  function wd(t) {
    var a = Ed(t.alternate, t, Tt);
    t.memoizedProps = t.pendingProps, a === null ? yd(t) : Sr = a, B0.current = null;
  }
  function yd(t) {
    var a = t;
    do {
      var l = a.alternate;
      if (t = a.return, (a.flags & 32768) === 0) {
        if (l = Zx(l, a, Tt), l !== null) {
          Sr = l;
          return;
        }
      } else {
        if (l = em(l, a), l !== null) {
          l.flags &= 32767, Sr = l;
          return;
        }
        if (t !== null) t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null;
        else {
          Nr = 6, Sr = null;
          return;
        }
      }
      if (a = a.sibling, a !== null) {
        Sr = a;
        return;
      }
      Sr = a = t;
    } while (a !== null);
    Nr === 0 && (Nr = 5);
  }
  function ka(t, a, l) {
    var f = tr, h = bt.transition;
    try {
      bt.transition = null, tr = 1, om(t, a, l, f);
    } finally {
      bt.transition = h, tr = f;
    }
    return null;
  }
  function om(t, a, l, f) {
    do
      ui();
    while (Yn !== null);
    if ((Ze & 6) !== 0) throw Error(r(327));
    l = t.finishedWork;
    var h = t.finishedLanes;
    if (l === null) return null;
    if (t.finishedWork = null, t.finishedLanes = 0, l === t.current) throw Error(r(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var m = l.lanes | l.childLanes;
    if (H1(t, m), t === Lr && (Sr = Lr = null, zr = 0), (l.subtreeFlags & 2064) === 0 && (l.flags & 2064) === 0 || Il || (Il = !0, Sd(wr, function() {
      return ui(), null;
    })), m = (l.flags & 15990) !== 0, (l.subtreeFlags & 15990) !== 0 || m) {
      m = bt.transition, bt.transition = null;
      var S = tr;
      tr = 1;
      var M = Ze;
      Ze |= 4, B0.current = null, tm(t, l), ud(l, t), Fx(Ko), Qs = !!$o, Ko = $o = null, t.current = l, nm(l), Se(), Ze = M, tr = S, bt.transition = m;
    } else t.current = l;
    if (Il && (Il = !1, Yn = t, Ll = h), m = t.pendingLanes, m === 0 && (Xn = null), Ci(l.stateNode), vt(t, Ee()), a !== null) for (f = t.onRecoverableError, l = 0; l < a.length; l++) h = a[l], f(h.value, { componentStack: h.stack, digest: h.digest });
    if (bl) throw bl = !1, t = z0, z0 = null, t;
    return (Ll & 1) !== 0 && t.tag !== 0 && ui(), m = t.pendingLanes, (m & 1) !== 0 ? t === H0 ? as++ : (as = 0, H0 = t) : as = 0, Wn(), null;
  }
  function ui() {
    if (Yn !== null) {
      var t = lu(Ll), a = bt.transition, l = tr;
      try {
        if (bt.transition = null, tr = 16 > t ? 16 : t, Yn === null) var f = !1;
        else {
          if (t = Yn, Yn = null, Ll = 0, (Ze & 6) !== 0) throw Error(r(331));
          var h = Ze;
          for (Ze |= 4, Oe = t.current; Oe !== null; ) {
            var m = Oe, S = m.child;
            if ((Oe.flags & 16) !== 0) {
              var M = m.deletions;
              if (M !== null) {
                for (var W = 0; W < M.length; W++) {
                  var ce = M[W];
                  for (Oe = ce; Oe !== null; ) {
                    var ve = Oe;
                    switch (ve.tag) {
                      case 0:
                      case 11:
                      case 15:
                        rs(8, ve, m);
                    }
                    var ke = ve.child;
                    if (ke !== null) ke.return = ve, Oe = ke;
                    else for (; Oe !== null; ) {
                      ve = Oe;
                      var me = ve.sibling, Re = ve.return;
                      if (id(ve), ve === ce) {
                        Oe = null;
                        break;
                      }
                      if (me !== null) {
                        me.return = Re, Oe = me;
                        break;
                      }
                      Oe = Re;
                    }
                  }
                }
                var be = m.alternate;
                if (be !== null) {
                  var Ie = be.child;
                  if (Ie !== null) {
                    be.child = null;
                    do {
                      var _r = Ie.sibling;
                      Ie.sibling = null, Ie = _r;
                    } while (Ie !== null);
                  }
                }
                Oe = m;
              }
            }
            if ((m.subtreeFlags & 2064) !== 0 && S !== null) S.return = m, Oe = S;
            else e: for (; Oe !== null; ) {
              if (m = Oe, (m.flags & 2048) !== 0) switch (m.tag) {
                case 0:
                case 11:
                case 15:
                  rs(9, m, m.return);
              }
              var ee = m.sibling;
              if (ee !== null) {
                ee.return = m.return, Oe = ee;
                break e;
              }
              Oe = m.return;
            }
          }
          var q = t.current;
          for (Oe = q; Oe !== null; ) {
            S = Oe;
            var ne = S.child;
            if ((S.subtreeFlags & 2064) !== 0 && ne !== null) ne.return = S, Oe = ne;
            else e: for (S = q; Oe !== null; ) {
              if (M = Oe, (M.flags & 2048) !== 0) try {
                switch (M.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Dl(9, M);
                }
              } catch (Le) {
                mr(M, M.return, Le);
              }
              if (M === S) {
                Oe = null;
                break e;
              }
              var Te = M.sibling;
              if (Te !== null) {
                Te.return = M.return, Oe = Te;
                break e;
              }
              Oe = M.return;
            }
          }
          if (Ze = h, Wn(), br && typeof br.onPostCommitFiberRoot == "function") try {
            br.onPostCommitFiberRoot(nn, t);
          } catch {
          }
          f = !0;
        }
        return f;
      } finally {
        tr = l, bt.transition = a;
      }
    }
    return !1;
  }
  function _d(t, a, l) {
    a = si(l, a), a = jf(t, a, 1), t = $n(t, a, 1), a = lt(), t !== null && (Fi(t, 1, a), vt(t, a));
  }
  function mr(t, a, l) {
    if (t.tag === 3) _d(t, t, l);
    else for (; a !== null; ) {
      if (a.tag === 3) {
        _d(a, t, l);
        break;
      } else if (a.tag === 1) {
        var f = a.stateNode;
        if (typeof a.type.getDerivedStateFromError == "function" || typeof f.componentDidCatch == "function" && (Xn === null || !Xn.has(f))) {
          t = si(l, t), t = Uf(a, t, 1), a = $n(a, t, 1), t = lt(), a !== null && (Fi(a, 1, t), vt(a, t));
          break;
        }
      }
      a = a.return;
    }
  }
  function cm(t, a, l) {
    var f = t.pingCache;
    f !== null && f.delete(a), a = lt(), t.pingedLanes |= t.suspendedLanes & l, Lr === t && (zr & l) === l && (Nr === 4 || Nr === 3 && (zr & 130023424) === zr && 500 > Ee() - U0 ? _a(t, 0) : j0 |= l), vt(t, a);
  }
  function kd(t, a) {
    a === 0 && ((t.mode & 1) === 0 ? a = 1 : (a = $s, $s <<= 1, ($s & 130023424) === 0 && ($s = 4194304)));
    var l = lt();
    t = _n(t, a), t !== null && (Fi(t, a, l), vt(t, l));
  }
  function um(t) {
    var a = t.memoizedState, l = 0;
    a !== null && (l = a.retryLane), kd(t, l);
  }
  function fm(t, a) {
    var l = 0;
    switch (t.tag) {
      case 13:
        var f = t.stateNode, h = t.memoizedState;
        h !== null && (l = h.retryLane);
        break;
      case 19:
        f = t.stateNode;
        break;
      default:
        throw Error(r(314));
    }
    f !== null && f.delete(a), kd(t, l);
  }
  var Ed;
  Ed = function(t, a, l) {
    if (t !== null) if (t.memoizedProps !== a.pendingProps || pt.current) mt = !0;
    else {
      if ((t.lanes & l) === 0 && (a.flags & 128) === 0) return mt = !1, Jx(t, a, l);
      mt = (t.flags & 131072) !== 0;
    }
    else mt = !1, fr && (a.flags & 1048576) !== 0 && rf(a, pl, a.index);
    switch (a.lanes = 0, a.tag) {
      case 2:
        var f = a.type;
        Nl(t, a), t = a.pendingProps;
        var h = Ja(a, Yr.current);
        ai(a, l), h = g0(null, a, f, t, h, l);
        var m = v0();
        return a.flags |= 1, typeof h == "object" && h !== null && typeof h.render == "function" && h.$$typeof === void 0 ? (a.tag = 1, a.memoizedState = null, a.updateQueue = null, xt(f) ? (m = !0, fl(a)) : m = !1, a.memoizedState = h.state !== null && h.state !== void 0 ? h.state : null, u0(a), h.updater = Al, a.stateNode = h, h._reactInternals = a, S0(a, f, t, l), a = F0(null, a, f, !0, m, l)) : (a.tag = 0, fr && m && e0(a), st(null, a, h, l), a = a.child), a;
      case 16:
        f = a.elementType;
        e: {
          switch (Nl(t, a), t = a.pendingProps, h = f._init, f = h(f._payload), a.type = f, h = a.tag = hm(f), t = $t(f, t), h) {
            case 0:
              a = A0(null, a, f, t, l);
              break e;
            case 1:
              a = Yf(null, a, f, t, l);
              break e;
            case 11:
              a = Wf(null, a, f, t, l);
              break e;
            case 14:
              a = Gf(null, a, f, $t(f.type, t), l);
              break e;
          }
          throw Error(r(
            306,
            f,
            ""
          ));
        }
        return a;
      case 0:
        return f = a.type, h = a.pendingProps, h = a.elementType === f ? h : $t(f, h), A0(t, a, f, h, l);
      case 1:
        return f = a.type, h = a.pendingProps, h = a.elementType === f ? h : $t(f, h), Yf(t, a, f, h, l);
      case 3:
        e: {
          if (Qf(a), t === null) throw Error(r(387));
          f = a.pendingProps, m = a.memoizedState, h = m.element, ff(t, a), yl(a, f, null, l);
          var S = a.memoizedState;
          if (f = S.element, m.isDehydrated) if (m = { element: f, isDehydrated: !1, cache: S.cache, pendingSuspenseBoundaries: S.pendingSuspenseBoundaries, transitions: S.transitions }, a.updateQueue.baseState = m, a.memoizedState = m, a.flags & 256) {
            h = si(Error(r(423)), a), a = qf(t, a, f, l, h);
            break e;
          } else if (f !== h) {
            h = si(Error(r(424)), a), a = qf(t, a, f, l, h);
            break e;
          } else for (St = zn(a.stateNode.containerInfo.firstChild), Et = a, fr = !0, Gt = null, l = cf(a, null, f, l), a.child = l; l; ) l.flags = l.flags & -3 | 4096, l = l.sibling;
          else {
            if (ri(), f === h) {
              a = En(t, a, l);
              break e;
            }
            st(t, a, f, l);
          }
          a = a.child;
        }
        return a;
      case 5:
        return pf(a), t === null && n0(a), f = a.type, h = a.pendingProps, m = t !== null ? t.memoizedProps : null, S = h.children, Xo(f, h) ? S = null : m !== null && Xo(f, m) && (a.flags |= 32), Xf(t, a), st(t, a, S, l), a.child;
      case 6:
        return t === null && n0(a), null;
      case 13:
        return Jf(t, a, l);
      case 4:
        return f0(a, a.stateNode.containerInfo), f = a.pendingProps, t === null ? a.child = ti(a, null, f, l) : st(t, a, f, l), a.child;
      case 11:
        return f = a.type, h = a.pendingProps, h = a.elementType === f ? h : $t(f, h), Wf(t, a, f, h, l);
      case 7:
        return st(t, a, a.pendingProps, l), a.child;
      case 8:
        return st(t, a, a.pendingProps.children, l), a.child;
      case 12:
        return st(t, a, a.pendingProps.children, l), a.child;
      case 10:
        e: {
          if (f = a.type._context, h = a.pendingProps, m = a.memoizedProps, S = h.value, sr(gl, f._currentValue), f._currentValue = S, m !== null) if (Wt(m.value, S)) {
            if (m.children === h.children && !pt.current) {
              a = En(t, a, l);
              break e;
            }
          } else for (m = a.child, m !== null && (m.return = a); m !== null; ) {
            var M = m.dependencies;
            if (M !== null) {
              S = m.child;
              for (var W = M.firstContext; W !== null; ) {
                if (W.context === f) {
                  if (m.tag === 1) {
                    W = kn(-1, l & -l), W.tag = 2;
                    var ce = m.updateQueue;
                    if (ce !== null) {
                      ce = ce.shared;
                      var ve = ce.pending;
                      ve === null ? W.next = W : (W.next = ve.next, ve.next = W), ce.pending = W;
                    }
                  }
                  m.lanes |= l, W = m.alternate, W !== null && (W.lanes |= l), o0(
                    m.return,
                    l,
                    a
                  ), M.lanes |= l;
                  break;
                }
                W = W.next;
              }
            } else if (m.tag === 10) S = m.type === a.type ? null : m.child;
            else if (m.tag === 18) {
              if (S = m.return, S === null) throw Error(r(341));
              S.lanes |= l, M = S.alternate, M !== null && (M.lanes |= l), o0(S, l, a), S = m.sibling;
            } else S = m.child;
            if (S !== null) S.return = m;
            else for (S = m; S !== null; ) {
              if (S === a) {
                S = null;
                break;
              }
              if (m = S.sibling, m !== null) {
                m.return = S.return, S = m;
                break;
              }
              S = S.return;
            }
            m = S;
          }
          st(t, a, h.children, l), a = a.child;
        }
        return a;
      case 9:
        return h = a.type, f = a.pendingProps.children, ai(a, l), h = Ot(h), f = f(h), a.flags |= 1, st(t, a, f, l), a.child;
      case 14:
        return f = a.type, h = $t(f, a.pendingProps), h = $t(f.type, h), Gf(t, a, f, h, l);
      case 15:
        return $f(t, a, a.type, a.pendingProps, l);
      case 17:
        return f = a.type, h = a.pendingProps, h = a.elementType === f ? h : $t(f, h), Nl(t, a), a.tag = 1, xt(f) ? (t = !0, fl(a)) : t = !1, ai(a, l), Mf(a, f, h), S0(a, f, h, l), F0(null, a, f, !0, t, l);
      case 19:
        return ed(t, a, l);
      case 22:
        return Kf(t, a, l);
    }
    throw Error(r(156, a.tag));
  };
  function Sd(t, a) {
    return _e(t, a);
  }
  function dm(t, a, l, f) {
    this.tag = t, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = a, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = f, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function It(t, a, l, f) {
    return new dm(t, a, l, f);
  }
  function X0(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function hm(t) {
    if (typeof t == "function") return X0(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === Q) return 11;
      if (t === xe) return 14;
    }
    return 2;
  }
  function Jn(t, a) {
    var l = t.alternate;
    return l === null ? (l = It(t.tag, a, t.key, t.mode), l.elementType = t.elementType, l.type = t.type, l.stateNode = t.stateNode, l.alternate = t, t.alternate = l) : (l.pendingProps = a, l.type = t.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = t.flags & 14680064, l.childLanes = t.childLanes, l.lanes = t.lanes, l.child = t.child, l.memoizedProps = t.memoizedProps, l.memoizedState = t.memoizedState, l.updateQueue = t.updateQueue, a = t.dependencies, l.dependencies = a === null ? null : { lanes: a.lanes, firstContext: a.firstContext }, l.sibling = t.sibling, l.index = t.index, l.ref = t.ref, l;
  }
  function Ul(t, a, l, f, h, m) {
    var S = 2;
    if (f = t, typeof t == "function") X0(t) && (S = 1);
    else if (typeof t == "string") S = 5;
    else e: switch (t) {
      case C:
        return Ea(l.children, h, m, a);
      case G:
        S = 8, h |= 8;
        break;
      case B:
        return t = It(12, l, a, h | 2), t.elementType = B, t.lanes = m, t;
      case pe:
        return t = It(13, l, a, h), t.elementType = pe, t.lanes = m, t;
      case Ce:
        return t = It(19, l, a, h), t.elementType = Ce, t.lanes = m, t;
      case ye:
        return zl(l, h, m, a);
      default:
        if (typeof t == "object" && t !== null) switch (t.$$typeof) {
          case le:
            S = 10;
            break e;
          case re:
            S = 9;
            break e;
          case Q:
            S = 11;
            break e;
          case xe:
            S = 14;
            break e;
          case we:
            S = 16, f = null;
            break e;
        }
        throw Error(r(130, t == null ? t : typeof t, ""));
    }
    return a = It(S, l, a, h), a.elementType = t, a.type = f, a.lanes = m, a;
  }
  function Ea(t, a, l, f) {
    return t = It(7, t, f, a), t.lanes = l, t;
  }
  function zl(t, a, l, f) {
    return t = It(22, t, f, a), t.elementType = ye, t.lanes = l, t.stateNode = { isHidden: !1 }, t;
  }
  function Y0(t, a, l) {
    return t = It(6, t, null, a), t.lanes = l, t;
  }
  function Q0(t, a, l) {
    return a = It(4, t.children !== null ? t.children : [], t.key, a), a.lanes = l, a.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, a;
  }
  function pm(t, a, l, f, h) {
    this.tag = a, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Eo(0), this.expirationTimes = Eo(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Eo(0), this.identifierPrefix = f, this.onRecoverableError = h, this.mutableSourceEagerHydrationData = null;
  }
  function q0(t, a, l, f, h, m, S, M, W) {
    return t = new pm(t, a, l, M, W), a === 1 ? (a = 1, m === !0 && (a |= 8)) : a = 0, m = It(3, null, null, a), t.current = m, m.stateNode = t, m.memoizedState = { element: f, isDehydrated: l, cache: null, transitions: null, pendingSuspenseBoundaries: null }, u0(m), t;
  }
  function xm(t, a, l) {
    var f = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: j, key: f == null ? null : "" + f, children: t, containerInfo: a, implementation: l };
  }
  function Td(t) {
    if (!t) return Vn;
    t = t._reactInternals;
    e: {
      if (L(t) !== t || t.tag !== 1) throw Error(r(170));
      var a = t;
      do {
        switch (a.tag) {
          case 3:
            a = a.stateNode.context;
            break e;
          case 1:
            if (xt(a.type)) {
              a = a.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        a = a.return;
      } while (a !== null);
      throw Error(r(171));
    }
    if (t.tag === 1) {
      var l = t.type;
      if (xt(l)) return Ju(t, l, a);
    }
    return a;
  }
  function Cd(t, a, l, f, h, m, S, M, W) {
    return t = q0(l, f, !0, t, h, m, S, M, W), t.context = Td(null), l = t.current, f = lt(), h = Qn(l), m = kn(f, h), m.callback = a ?? null, $n(l, m, h), t.current.lanes = h, Fi(t, h, f), vt(t, f), t;
  }
  function Hl(t, a, l, f) {
    var h = a.current, m = lt(), S = Qn(h);
    return l = Td(l), a.context === null ? a.context = l : a.pendingContext = l, a = kn(m, S), a.payload = { element: t }, f = f === void 0 ? null : f, f !== null && (a.callback = f), t = $n(h, a, S), t !== null && (Yt(t, h, S, m), wl(t, h, S)), S;
  }
  function Vl(t) {
    if (t = t.current, !t.child) return null;
    switch (t.child.tag) {
      case 5:
        return t.child.stateNode;
      default:
        return t.child.stateNode;
    }
  }
  function Ad(t, a) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var l = t.retryLane;
      t.retryLane = l !== 0 && l < a ? l : a;
    }
  }
  function J0(t, a) {
    Ad(t, a), (t = t.alternate) && Ad(t, a);
  }
  function mm() {
    return null;
  }
  var Fd = typeof reportError == "function" ? reportError : function(t) {
    console.error(t);
  };
  function Z0(t) {
    this._internalRoot = t;
  }
  Wl.prototype.render = Z0.prototype.render = function(t) {
    var a = this._internalRoot;
    if (a === null) throw Error(r(409));
    Hl(t, a, null, null);
  }, Wl.prototype.unmount = Z0.prototype.unmount = function() {
    var t = this._internalRoot;
    if (t !== null) {
      this._internalRoot = null;
      var a = t.containerInfo;
      ya(function() {
        Hl(null, t, null, null);
      }), a[gn] = null;
    }
  };
  function Wl(t) {
    this._internalRoot = t;
  }
  Wl.prototype.unstable_scheduleHydration = function(t) {
    if (t) {
      var a = uu();
      t = { blockedOn: null, target: t, priority: a };
      for (var l = 0; l < Bn.length && a !== 0 && a < Bn[l].priority; l++) ;
      Bn.splice(l, 0, t), l === 0 && hu(t);
    }
  };
  function ec(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11);
  }
  function Gl(t) {
    return !(!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11 && (t.nodeType !== 8 || t.nodeValue !== " react-mount-point-unstable "));
  }
  function Nd() {
  }
  function gm(t, a, l, f, h) {
    if (h) {
      if (typeof f == "function") {
        var m = f;
        f = function() {
          var ce = Vl(S);
          m.call(ce);
        };
      }
      var S = Cd(a, f, t, 0, null, !1, !1, "", Nd);
      return t._reactRootContainer = S, t[gn] = S.current, Hi(t.nodeType === 8 ? t.parentNode : t), ya(), S;
    }
    for (; h = t.lastChild; ) t.removeChild(h);
    if (typeof f == "function") {
      var M = f;
      f = function() {
        var ce = Vl(W);
        M.call(ce);
      };
    }
    var W = q0(t, 0, !1, null, null, !1, !1, "", Nd);
    return t._reactRootContainer = W, t[gn] = W.current, Hi(t.nodeType === 8 ? t.parentNode : t), ya(function() {
      Hl(a, W, l, f);
    }), W;
  }
  function $l(t, a, l, f, h) {
    var m = l._reactRootContainer;
    if (m) {
      var S = m;
      if (typeof h == "function") {
        var M = h;
        h = function() {
          var W = Vl(S);
          M.call(W);
        };
      }
      Hl(a, S, t, h);
    } else S = gm(l, a, t, h, f);
    return Vl(S);
  }
  ou = function(t) {
    switch (t.tag) {
      case 3:
        var a = t.stateNode;
        if (a.current.memoizedState.isDehydrated) {
          var l = Ai(a.pendingLanes);
          l !== 0 && (So(a, l | 1), vt(a, Ee()), (Ze & 6) === 0 && (ci = Ee() + 500, Wn()));
        }
        break;
      case 13:
        ya(function() {
          var f = _n(t, 1);
          if (f !== null) {
            var h = lt();
            Yt(f, t, 1, h);
          }
        }), J0(t, 1);
    }
  }, To = function(t) {
    if (t.tag === 13) {
      var a = _n(t, 134217728);
      if (a !== null) {
        var l = lt();
        Yt(a, t, 134217728, l);
      }
      J0(t, 134217728);
    }
  }, cu = function(t) {
    if (t.tag === 13) {
      var a = Qn(t), l = _n(t, a);
      if (l !== null) {
        var f = lt();
        Yt(l, t, a, f);
      }
      J0(t, a);
    }
  }, uu = function() {
    return tr;
  }, fu = function(t, a) {
    var l = tr;
    try {
      return tr = t, a();
    } finally {
      tr = l;
    }
  }, za = function(t, a, l) {
    switch (a) {
      case "input":
        if (Fe(t, l), a = l.name, l.type === "radio" && a != null) {
          for (l = t; l.parentNode; ) l = l.parentNode;
          for (l = l.querySelectorAll("input[name=" + JSON.stringify("" + a) + '][type="radio"]'), a = 0; a < l.length; a++) {
            var f = l[a];
            if (f !== t && f.form === t.form) {
              var h = cl(f);
              if (!h) throw Error(r(90));
              P(f), Fe(f, h);
            }
          }
        }
        break;
      case "textarea":
        Xr(t, l);
        break;
      case "select":
        a = l.value, a != null && Kr(t, !!l.multiple, a, !1);
    }
  }, Hs = G0, Vs = ya;
  var vm = { usingClientEntryPoint: !1, Events: [Gi, Qa, cl, Us, zs, G0] }, is = { findFiberByHostInstance: da, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, wm = { bundleType: is.bundleType, version: is.version, rendererPackageName: is.rendererPackageName, rendererConfig: is.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: V.ReactCurrentDispatcher, findHostInstanceByFiber: function(t) {
    return t = se(t), t === null ? null : t.stateNode;
  }, findFiberByHostInstance: is.findFiberByHostInstance || mm, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Kl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Kl.isDisabled && Kl.supportsFiber) try {
      nn = Kl.inject(wm), br = Kl;
    } catch {
    }
  }
  return wt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = vm, wt.createPortal = function(t, a) {
    var l = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!ec(a)) throw Error(r(200));
    return xm(t, a, null, l);
  }, wt.createRoot = function(t, a) {
    if (!ec(t)) throw Error(r(299));
    var l = !1, f = "", h = Fd;
    return a != null && (a.unstable_strictMode === !0 && (l = !0), a.identifierPrefix !== void 0 && (f = a.identifierPrefix), a.onRecoverableError !== void 0 && (h = a.onRecoverableError)), a = q0(t, 1, !1, null, null, l, !1, f, h), t[gn] = a.current, Hi(t.nodeType === 8 ? t.parentNode : t), new Z0(a);
  }, wt.findDOMNode = function(t) {
    if (t == null) return null;
    if (t.nodeType === 1) return t;
    var a = t._reactInternals;
    if (a === void 0)
      throw typeof t.render == "function" ? Error(r(188)) : (t = Object.keys(t).join(","), Error(r(268, t)));
    return t = se(a), t = t === null ? null : t.stateNode, t;
  }, wt.flushSync = function(t) {
    return ya(t);
  }, wt.hydrate = function(t, a, l) {
    if (!Gl(a)) throw Error(r(200));
    return $l(null, t, a, !0, l);
  }, wt.hydrateRoot = function(t, a, l) {
    if (!ec(t)) throw Error(r(405));
    var f = l != null && l.hydratedSources || null, h = !1, m = "", S = Fd;
    if (l != null && (l.unstable_strictMode === !0 && (h = !0), l.identifierPrefix !== void 0 && (m = l.identifierPrefix), l.onRecoverableError !== void 0 && (S = l.onRecoverableError)), a = Cd(a, null, t, 1, l ?? null, h, !1, m, S), t[gn] = a.current, Hi(t), f) for (t = 0; t < f.length; t++) l = f[t], h = l._getVersion, h = h(l._source), a.mutableSourceEagerHydrationData == null ? a.mutableSourceEagerHydrationData = [l, h] : a.mutableSourceEagerHydrationData.push(
      l,
      h
    );
    return new Wl(a);
  }, wt.render = function(t, a, l) {
    if (!Gl(a)) throw Error(r(200));
    return $l(null, t, a, !1, l);
  }, wt.unmountComponentAtNode = function(t) {
    if (!Gl(t)) throw Error(r(40));
    return t._reactRootContainer ? (ya(function() {
      $l(null, null, t, !1, function() {
        t._reactRootContainer = null, t[gn] = null;
      });
    }), !0) : !1;
  }, wt.unstable_batchedUpdates = G0, wt.unstable_renderSubtreeIntoContainer = function(t, a, l, f) {
    if (!Gl(l)) throw Error(r(200));
    if (t == null || t._reactInternals === void 0) throw Error(r(38));
    return $l(t, a, l, !1, f);
  }, wt.version = "18.3.1-next-f1338f8080-20240426", wt;
}
var Md;
function Nm() {
  if (Md) return nc.exports;
  Md = 1;
  function e() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
      } catch (n) {
        console.error(n);
      }
  }
  return e(), nc.exports = Fm(), nc.exports;
}
var Bd;
function Rm() {
  if (Bd) return Xl;
  Bd = 1;
  var e = Nm();
  return Xl.createRoot = e.createRoot, Xl.hydrateRoot = e.hydrateRoot, Xl;
}
var Jh = Rm();
const Rr = {
  headerFrom: "#d9e7f7",
  headerTo: "#7ea1d4",
  border: "#7d94b7",
  panel: "#f3e6c8",
  body: "#f3e6c8",
  text: "#07101c"
}, Zh = `
.pm-root {
  background: ${Rr.body};
  color: ${Rr.text};
  padding: 0;
  font-family: Tahoma, "MS Sans Serif", Arial, sans-serif;
  font-size: 11px;
  border: 1px solid #7790b2;
  min-width: 760px;
  width: 100%;
  height: 100%;
  min-height: 489px;
  overflow: hidden;
}
.pm-root *, .pm-window * { box-sizing: border-box; }

.pm-reference-title {
  height: 22px;
  padding: 2px 5px;
  background: linear-gradient(180deg, #dce9f8 0%, #91acd2 58%, #789bcf 100%);
  border-bottom: 1px solid #6c87af;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #064e22;
  letter-spacing: .2px;
}
.pm-reference-title strong { font-size: 13px; }
.pm-reference-title span {
  align-self: flex-end;
  color: #1f2937;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0;
}
.pm-reference-grid {
  display: grid;
  grid-template-columns: minmax(280px, 38.3fr) minmax(315px, 40.2fr) minmax(180px, 21.5fr);
  grid-template-rows: minmax(344px, 1fr) 110px;
  gap: 4px;
  padding: 4px 4px 5px;
  height: calc(100% - 22px);
  overflow: hidden;
}
.pm-layout-two-col {
  grid-template-columns: minmax(620px, 1fr) minmax(250px, 320px);
  grid-template-rows: minmax(0, 1fr);
  height: calc(100vh - 88px);
  min-height: 520px;
}
.pm-layout-three-col {
  grid-template-columns: minmax(250px, 34fr) minmax(300px, 44fr) minmax(200px, 22fr);
  grid-template-rows: minmax(0, 1fr) auto;
  height: calc(100vh - 88px);
  min-height: 520px;
}
.pm-layout-three-col .pm-reference-left {
  grid-column: 1;
  grid-row: 1;
  min-height: 0;
  overflow: auto;
}
.pm-layout-three-col .pm-reference-middle {
  grid-column: 2;
  grid-row: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pm-layout-three-col .pm-reference-right {
  grid-column: 3;
  grid-row: 1 / span 2;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pm-layout-three-col .pm-actions {
  grid-column: 1 / 3;
  grid-row: 2;
  display: block;
  padding-top: 2px;
}
.pm-layout-three-col .pm-pricing-stack {
  flex: 0 0 auto;
}
.pm-layout-three-col .pm-middle-tools {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.pm-middle-tools-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  padding: 2px 1px 4px;
  flex: 1;
  align-content: start;
}
.pm-middle-tools-grid .pm-btn-secondary,
.pm-middle-tools-grid .pm-btn-danger {
  min-height: 28px;
  height: auto;
  white-space: normal;
  line-height: 12px;
  text-align: center;
  padding: 4px 6px;
}
.pm-middle-tools-wide {
  grid-column: span 1;
}
.pm-middle-tools-extra {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding: 0 1px 4px;
}
.pm-middle-tools-extra .pm-btn-secondary {
  min-height: 28px;
  height: auto;
  white-space: normal;
  line-height: 12px;
  text-align: center;
  padding: 4px 6px;
}
.pm-middle-tools-spacer {
  display: block;
  min-height: 28px;
}
.pm-layout-three-col .pm-price-panel {
  height: auto;
  min-height: 72px;
  flex: 0 0 auto;
}
.pm-actions--primary-only {
  display: block;
  grid-template-columns: none;
}
.pm-actions--primary-only .pm-primary-actions {
  width: 100%;
}
.pm-left-stack {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 2px;
}
.pm-layout-two-col .pm-reference-right {
  grid-column: 2;
  grid-row: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pm-list-search {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 42px;
  gap: 4px;
  align-items: center;
  padding: 2px 2px 0;
}
.pm-list-search .pm-label { margin: 0; padding: 0; }
.pm-layout-two-col .pm-actions {
  grid-column: auto;
  grid-row: auto;
  display: block;
  margin-top: 2px;
}
.pm-layout-two-col .pm-actions-left,
.pm-layout-two-col .pm-actions-middle {
  width: 100%;
}
.pm-layout-two-col .pm-primary-actions {
  margin-top: 4px;
}
.pm-reference-left, .pm-reference-middle, .pm-reference-right { min-width: 0; }
.pm-reference-left { grid-column: 1; grid-row: 1; }
.pm-reference-middle {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pm-reference-right {
  grid-column: 3;
  grid-row: 1 / span 2;
  min-height: 0;
}

.pm-panel {
  border: 1px solid ${Rr.border};
  border-radius: 0;
  background: transparent;
  min-width: 0;
  margin: 0;
  padding: 4px 5px 5px;
}
.pm-panel-legend {
  min-width: 156px;
  height: 14px;
  margin-left: 7px;
  padding: 1px 8px 2px;
  text-align: center;
  background: linear-gradient(180deg, #4b70c2, #315bb4);
  color: #fff;
  border: 1px solid #8ca4c8;
  font-size: 10px;
  font-weight: 400;
  line-height: 10px;
}
.pm-details-panel { width: 100%; height: 100%; padding-top: 2px; }
.pm-details-body { height: 100%; display: flex; flex-direction: column; justify-content: space-between; gap: 5px; }
.pm-form-row {
  display: grid;
  grid-template-columns: 81px minmax(0, 1fr);
  align-items: center;
  min-height: 20px;
}
.pm-form-row > .pm-label { padding-left: 1px; }
.pm-barcode-row { grid-template-columns: 81px minmax(0, .57fr) minmax(110px, .43fr); }
.pm-barcode-checks {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 8px;
  line-height: 11px;
}
.pm-ean-row { grid-template-columns: 81px minmax(0, .56fr) minmax(110px, .44fr); gap: 4px; }
.pm-unit-row { grid-template-columns: 81px minmax(0, 1fr) 91px; gap: 4px; }
.pm-shop-part-row { grid-template-columns: 81px minmax(0, 1fr) 91px; gap: 4px; }
.pm-arabic-row { grid-template-columns: 81px minmax(0, 1fr) 31px; gap: 3px; }
.pm-lang-btn {
  height: 23px;
  border: 1px solid #59789c;
  background: linear-gradient(90deg, #2d8dba 0 52%, #0aab60 52%);
  color: #fff;
  font: 10px Tahoma, sans-serif;
  cursor: pointer;
}

.pm-field { min-width: 0; }
.pm-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #07101c;
  margin: 0 0 2px;
  line-height: 11px;
}
.pm-input {
  width: 100%;
  height: 20px;
  border: 1px solid #8797a9;
  border-radius: 0;
  padding: 1px 4px;
  font: 11px Tahoma, "MS Sans Serif", Arial, sans-serif;
  background: #fff;
  color: ${Rr.text};
  outline: none;
  box-shadow: inset 1px 1px 1px rgba(0,0,0,.12);
}
.pm-input:focus { border-color: #315fa8; box-shadow: inset 1px 1px 1px rgba(0,0,0,.14), 0 0 0 1px #b8d4f5; }
.pm-input:disabled, .pm-input[readonly] { background: #e4e8ed; color: #475569; }
textarea.pm-input { resize: vertical; }
.pm-check { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; color: #07101c; white-space: nowrap; }
.pm-check input { margin: 0; width: 11px; height: 11px; }

.pm-btn, .pm-btn-secondary, .pm-btn-danger {
  min-height: 21px;
  padding: 2px 7px;
  font: 10px Tahoma, "MS Sans Serif", Arial, sans-serif;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: inset 1px 1px 0 rgba(255,255,255,.9), inset -1px -1px 0 rgba(35,64,104,.45);
}
.pm-btn, .pm-btn-secondary, .pm-btn-danger {
  border: 1px solid #41658e;
  background: linear-gradient(180deg, #f8fbff 0%, #d4e3f4 49%, #a8c5e6 51%, #e4effa 100%);
  color: #07101c;
}
.pm-btn:hover:enabled, .pm-btn-secondary:hover:enabled, .pm-btn-danger:hover:enabled {
  background: linear-gradient(180deg, #fff 0%, #e7f1fc 49%, #b9d5f1 51%, #f3f8fd 100%);
}
.pm-btn:active:enabled, .pm-btn-secondary:active:enabled, .pm-btn-danger:active:enabled { transform: translateY(1px); }
.pm-btn:disabled, .pm-btn-secondary:disabled, .pm-btn-danger:disabled { opacity: .45; cursor: not-allowed; }

.pm-pricing-stack { height: auto; flex: 0 0 auto; display: flex; flex-direction: column; gap: 4px; }
.pm-tax-row { display: grid; grid-template-columns: 46% 1fr; gap: 25px; height: 54px; }
.pm-tax-panel { height: 54px; }
.pm-tax-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
.pm-average-cost { display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center; padding-top: 8px; font-weight: 700; }
.pm-price-panel { height: 72px; padding-top: 3px; }
.pm-panel-body { padding: 0; }
.pm-price-panel .pm-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 16px; }
.pm-mrp-line { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px; align-items: center; }

.pm-selling-panel { min-height: 210px; flex: 1; padding-top: 2px; }
.pm-selling-panel .pm-panel-legend { min-width: 274px; text-align: left; margin-left: 0; }
.pm-selling-body { height: 100%; display: flex; flex-direction: column; gap: 3px; }
.pm-selling-panel.is-disabled .pm-selling-body {
  opacity: .46;
  filter: grayscale(.45);
}
.pm-selling-panel.is-disabled .pm-panel-legend::after {
  content: " — Disabled";
  color: #e4edf8;
}
.pm-selling-panel:not(.is-disabled) .pm-panel-legend::after {
  content: " — Enabled";
  color: #d8ffe5;
}
.pm-selling-top { display: grid; grid-template-columns: minmax(0, 1fr) 69px 109px; gap: 4px; align-items: end; }
.pm-selling-top > .pm-btn-secondary { height: 23px; }
.pm-link-btn {
  color: #244cb0;
  border: 0;
  background: none;
  padding: 0;
  font: 9px Tahoma, sans-serif;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
}
.pm-selling-top > .pm-link-btn { align-self: center; margin-top: 11px; }
.pm-selling-fields { display: grid; grid-template-columns: 27% 29% 22% 22%; gap: 3px; }
.pm-selling-alt { display: grid; grid-template-columns: 27% minmax(0, 1fr) 89px; gap: 3px; align-items: end; }
.pm-selling-alt > .pm-btn { height: 19px; min-height: 19px; }
.pm-selling-table { min-height: 88px; flex: 1; overflow: auto; }

.pm-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; background: #fff; }
.pm-table th {
  text-align: left;
  height: 14px;
  padding: 1px 3px;
  background: linear-gradient(180deg, #3f69bd, #2854ad);
  color: #fff;
  font-weight: 400;
  position: sticky;
  top: 0;
  z-index: 1;
  border-right: 1px solid #8fa8d0;
  border-bottom: 1px solid #23498f;
  white-space: nowrap;
  overflow: hidden;
}
.pm-table td {
  height: 13px;
  padding: 0 3px;
  border-bottom: 0;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
  color: #111827;
}
.pm-table tbody tr.pm-clickable { cursor: pointer; }
.pm-table tbody tr.pm-clickable:hover { background: #cfe0f5; }
.pm-table tbody tr.pm-selected { background: #8eafe0; }
.pm-table-wrap { border: 1px solid #7088aa; border-radius: 0; overflow: auto; background: #fff; }
.pm-empty { text-align: center; color: #64748b; padding: 18px 6px; font-size: 10px; }
.pm-link-danger { background: none; border: none; color: #dc2626; cursor: pointer; font-family: inherit; font-size: 11.5px; padding: 0; }
.pm-link-danger:hover { text-decoration: underline; }

.pm-list {
  height: 100%;
  border: 1px solid #6680a7;
  background: #fff;
  overflow: hidden;
}
.pm-layout-two-col .pm-list {
  flex: 1;
  min-height: 0;
  height: auto;
}
.pm-list-scroll { height: 100%; overflow: auto; background: #fff; }
.pm-list .pm-table { table-layout: fixed; }
.pm-list .pm-table th:nth-child(1) { width: 53%; }
.pm-list .pm-table th:nth-child(2) { width: 47%; }
.pm-list.pm-list--shop-parts .pm-table th:nth-child(1) { width: 46%; }
.pm-list.pm-list--shop-parts .pm-table th:nth-child(2) { width: 24%; }
.pm-list.pm-list--shop-parts .pm-table th:nth-child(3) { width: 30%; }
.pm-list .pm-table td {
  height: 13px;
  font-size: 9px;
  line-height: 11px;
  padding: 0 2px;
}

.pm-suggest {
  position: absolute; z-index: 30; left: 0; right: 0; top: 100%;
  margin-left: 81px;
  background: #fff; border: 1px solid #5f789b; max-height: 190px; overflow: auto;
  box-shadow: 0 6px 16px rgba(15,23,42,.22);
}
.pm-suggest button {
  display: block; width: 100%; text-align: left; padding: 4px 8px;
  font-size: 10px; font-family: inherit; background: none; border: none; cursor: pointer; color: ${Rr.text};
}
.pm-suggest button:hover { background: #eff6ff; }

.pm-actions {
  grid-column: 1 / 3;
  grid-row: 2;
  display: grid;
  grid-template-columns: 48.5% 51.5%;
  gap: 4px;
  min-width: 0;
}
.pm-actions-left, .pm-actions-middle { min-width: 0; display: flex; flex-direction: column; }
.pm-actions-left { justify-content: space-between; }
.pm-multi-rate-check { font-weight: 700; margin-top: 25px; }
.pm-master-tools { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 2px; }
.pm-master-tools .pm-btn-secondary { padding-left: 2px; padding-right: 2px; }
.pm-tool-wide { grid-column: 1 / span 2; }
.pm-tool-photo { grid-column: 3 / span 3; }
.pm-actions-middle { justify-content: space-between; padding: 0 3px; }
.pm-opening-tools { display: grid; grid-template-columns: 1.25fr .75fr; gap: 5px; padding-left: 126px; }
.pm-weighing-btn { align-self: flex-end; width: 73%; }
.pm-primary-actions { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 2px; height: 39px; }
.pm-primary-actions .pm-btn { height: 39px; line-height: 11px; white-space: normal; }

/* F10 Search Product window — based on product-SEARCH.zip and the supplied
   desktop screenshot. It deliberately uses a slightly greener/steel-blue
   palette so the search window remains visually distinct from Product Master. */
.pm-search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background: rgba(15, 31, 51, .48);
}
.pm-search-window {
  width: min(1100px, calc(100vw - 40px));
  height: min(760px, calc(100dvh - 24px));
  min-height: 540px;
  display: grid;
  grid-template-rows: 27px minmax(0, 1fr) auto;
  overflow: hidden;
  border: 2px solid #385d78;
  background: ${Rr.body};
  color: #08131d;
  font-family: Tahoma, "MS Sans Serif", Arial, sans-serif;
  box-shadow: 0 16px 45px rgba(0, 0, 0, .45);
}
.pm-search-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
  border-bottom: 1px solid #527791;
  background: linear-gradient(180deg, #edf7f8 0%, #b8d7dc 48%, #6fa6b2 100%);
  color: #07533d;
}
.pm-search-title strong { font-size: 13px; }
.pm-search-title button {
  width: 24px;
  height: 20px;
  padding: 0;
  border: 1px solid #477087;
  background: linear-gradient(180deg, #f8fdff, #a9cbd5);
  color: #173342;
  cursor: pointer;
  font: 11px Tahoma, sans-serif;
}
.pm-search-content {
  min-height: 0;
  display: grid;
  grid-template-rows: auto 23px minmax(0, 1fr);
  gap: 5px;
  padding: 10px 16px 0;
}
.pm-search-fields {
  position: relative;
  margin: 0;
  padding: 9px 10px 6px;
  border: 1px solid #7894aa;
  background: ${Rr.body};
}
.pm-search-fields legend {
  padding: 0 4px;
  font-size: 11px;
  font-weight: 700;
}
.pm-search-control-hint {
  position: absolute;
  top: -17px;
  right: 2px;
  color: #a11f28;
  font-size: 10px;
}
.pm-search-field-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px 11px;
}
.pm-search-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pm-search-field > span {
  font-size: 11px;
  font-weight: 700;
  text-decoration: underline;
  white-space: nowrap;
  overflow: hidden;
}
.pm-search-field input {
  width: 100%;
  height: 26px;
  padding: 2px 5px;
  border: 1px solid #758797;
  border-radius: 0;
  background: #fff;
  color: #08131d;
  font: 12px Tahoma, sans-serif;
  box-shadow: inset 1px 1px 1px rgba(0, 0, 0, .14);
  outline: none;
  pointer-events: auto;
  user-select: text;
}
.pm-search-field input:focus {
  border-color: #176d88;
  box-shadow: inset 1px 1px 1px rgba(0, 0, 0, .14), 0 0 0 1px #66b6c9;
}
.pm-search-command {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 43px;
  gap: 16px;
  align-items: end;
}
.pm-search-command button,
.pm-search-close {
  height: 27px;
  border: 1px solid #53758c;
  border-radius: 0;
  background: linear-gradient(180deg, #f8fdff 0%, #d9e8ef 48%, #abc8d7 52%, #eaf3f6 100%);
  color: #08131d;
  font: 700 12px Tahoma, sans-serif;
  cursor: pointer;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 rgba(38, 79, 99, .35);
}
.pm-search-command button:hover,
.pm-search-close:hover { filter: brightness(1.04); }
.pm-search-command .pm-search-lang {
  height: 34px;
  color: #fff;
  background: linear-gradient(90deg, #247eab 0 52%, #0aa45c 52%);
}
.pm-search-results-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  padding: 0 1px;
  font-size: 11px;
}
.pm-search-results-title span { font-size: 9px; color: #375468; }
.pm-search-grid-wrap {
  min-height: 0;
  overflow: auto;
  border: 1px solid #6f8799;
  background: #fff;
  outline: none;
}
.pm-search-grid-wrap:focus { box-shadow: 0 0 0 2px #3b91a5; }
.pm-search-grid {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 10px;
}
.pm-search-grid th {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 20px;
  padding: 2px 8px 2px 3px;
  border-right: 1px solid #9aa7ae;
  border-bottom: 1px solid #8a989f;
  background: linear-gradient(180deg, #f8fafb, #e1e5e7);
  text-align: left;
  white-space: nowrap;
  overflow: visible;
  font-weight: 700;
}
.pm-search-col-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pm-search-col-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 2;
}
.pm-search-grid td {
  height: 19px;
  padding: 2px 3px;
  border-right: 1px solid #aeb8bd;
  border-bottom: 1px solid #b8c0c4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pm-search-grid tbody tr { cursor: default; }
.pm-search-grid tbody tr:not(.pm-search-empty-row):hover { background: #d8edf1; }
.pm-search-grid tbody tr.is-selected { background: #86bdcb; color: #071d25; }
.pm-search-empty-row td {
  height: 90px;
  text-align: center;
  color: #647680;
}
.pm-search-footer {
  position: relative;
  min-height: 64px;
  padding: 4px 14px 7px 18px;
  border-top: 1px solid #7f98aa;
  background: ${Rr.body};
}
.pm-search-options {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 90px;
}
.pm-search-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}
.pm-search-options input { width: 13px; height: 13px; margin: 0; }
.pm-search-options span { margin-left: 9px; color: #a21f32; }
.pm-search-close {
  position: absolute;
  top: 4px;
  right: 14px;
  width: 61px;
}
.pm-search-columns-link {
  position: absolute;
  right: 14px;
  bottom: 5px;
  padding: 0;
  border: 0;
  background: none;
  color: #163d9d;
  font: 10px Tahoma, sans-serif;
  text-decoration: underline;
  cursor: pointer;
}
.pm-search-column-settings {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 5200;
  width: min(440px, calc(100vw - 24px));
  transform: translate(-50%, -50%);
  border: 2px solid #42687a;
  background: #bed4ce;
  box-shadow: 0 12px 35px rgba(0, 0, 0, .45);
  color: #07101c;
  font-family: Tahoma, "MS Sans Serif", Arial, sans-serif;
}
.pm-search-column-settings__title {
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 5px 2px 8px;
  background: linear-gradient(180deg, #e9f5ef, #79ae9c);
  border-bottom: 1px solid #4e796c;
}
.pm-search-column-settings__title strong { font-size: 12px; color: #075439; }
.pm-search-column-settings__title button {
  width: 22px;
  height: 20px;
  padding: 0;
  border: 1px solid #52766b;
  background: linear-gradient(180deg, #fff, #b7d4ca);
  cursor: pointer;
}
.pm-search-column-settings__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  grid-template-rows: minmax(220px, 1fr) auto auto;
  gap: 7px 8px;
  padding: 10px;
}
.pm-search-column-settings__list {
  min-height: 220px;
  overflow: auto;
  border: 2px solid #202020;
  background: #fff;
}
.pm-search-column-settings__head {
  height: 22px;
  padding: 3px 7px;
  background: #050505;
  color: #fff;
  text-align: center;
  font-weight: 700;
}
.pm-search-column-settings__list > button {
  width: 100%;
  display: block;
  padding: 2px 8px;
  border: 0;
  background: #fff;
  color: #07101c;
  text-align: left;
  font: 700 11px Tahoma, sans-serif;
  cursor: pointer;
}
.pm-search-column-settings__list > button:hover { background: #e2f1eb; }
.pm-search-column-settings__list > button.is-selected { background: #7fb09f; color: #042b1f; }
.pm-search-column-settings__arrows {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.pm-search-column-settings__arrows button {
  width: 38px;
  height: 42px;
  border: 1px solid #456d5f;
  background: linear-gradient(180deg, #f7fff8, #b9d7c7);
  color: #35b50f;
  font: 700 34px/34px Tahoma, sans-serif;
  cursor: pointer;
}
.pm-search-column-settings__width {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 45px minmax(0, 1fr) 50px;
  gap: 7px;
  align-items: center;
}
.pm-search-column-settings__width label { font-weight: 700; }
.pm-search-column-settings__width input {
  min-width: 0;
  height: 24px;
  border: 1px solid #728a82;
  background: #fff;
  font: 12px Tahoma, sans-serif;
}
.pm-search-column-settings__width button,
.pm-search-column-settings__actions button {
  height: 25px;
  border: 1px solid #52766b;
  background: linear-gradient(180deg, #fff, #b7d4ca);
  font: 11px Tahoma, sans-serif;
  cursor: pointer;
}
.pm-search-column-settings__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
}
.pm-search-column-settings__actions button { min-width: 58px; }
.pm-search-column-settings__actions button:last-child { margin-left: auto; }

/* Modal "window" system */
.pm-backdrop {
  position: fixed; inset: 0; z-index: 400; background: rgba(15,23,42,.45);
  display: flex; align-items: flex-start; justify-content: center; padding: 26px 12px; overflow: auto;
}
.pm-window {
  width: 100%; background: ${Rr.panel};
  border: 1px solid ${Rr.border}; border-radius: 6px;
  box-shadow: 0 18px 44px rgba(2,6,23,.5);
  color: ${Rr.text}; font-family: inherit;
}
.pm-window-title {
  background: linear-gradient(180deg, ${Rr.headerFrom}, ${Rr.headerTo});
  border-bottom: 1px solid ${Rr.border};
  padding: 6px 10px; border-radius: 6px 6px 0 0;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  font-size: 12.5px; font-weight: 700; color: #1e293b;
}
.pm-window-close {
  background: none; border: none; cursor: pointer; font-size: 14px;
  font-weight: 800; color: #334155; padding: 0 3px; line-height: 1; font-family: inherit;
}
.pm-window-close:hover { color: #dc2626; }
.pm-window-body { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.pm-window-foot { display: flex; justify-content: flex-end; gap: 7px; padding-top: 3px; }
.pm-hint { font-size: 11.5px; color: #475569; }
.pm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pm-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
.pm-grid-6 { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 7px; align-items: end; }
.pm-inline { display: grid; grid-template-columns: 1fr auto; gap: 7px; align-items: end; }
.pm-btn--primary { font-weight: 700; }
.pm-btn--danger { color: #8b1111; }

/* Additional Barcode confirmation and entry windows */
.pm-confirm-dialog {
  min-height: 74px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 13px;
  align-items: center;
  padding: 5px 9px;
  background: #d3e1f1;
  border: 1px solid #8da4c1;
}
.pm-confirm-dialog__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid #2f62a8;
  background: #fff;
  color: #24599f;
  font: 700 24px Georgia, serif;
}
.pm-confirm-dialog__message { font-size: 12px; line-height: 17px; }
.pm-confirm-dialog__actions { display: flex; justify-content: center; gap: 10px; }
.pm-confirm-dialog__actions .pm-btn { min-width: 70px; }
.pm-additional-barcodes {
  min-height: 270px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 84px;
  gap: 12px;
}
.pm-additional-barcodes__main { min-width: 0; display: flex; flex-direction: column; gap: 7px; }
.pm-additional-barcodes__input { display: grid; grid-template-columns: 86px minmax(0, 1fr); align-items: center; }
.pm-additional-barcodes__input .pm-label { margin: 0; }
.pm-additional-barcodes__actions { display: flex; flex-direction: column; gap: 8px; padding-top: 18px; }
.pm-additional-barcodes__actions .pm-btn { width: 100%; }
.pm-additional-barcodes__list,
.pm-master-list {
  min-height: 190px;
  flex: 1;
  overflow: auto;
  border: 1px solid #6d83a2;
  background: #fff;
}
.pm-additional-barcodes__head,
.pm-additional-barcodes__list > button,
.pm-master-list__head,
.pm-master-list > button {
  width: 100%;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  min-height: 22px;
  align-items: center;
  padding: 0;
  border: 0;
  border-bottom: 1px solid #bdc8d2;
  background: #fff;
  color: #07101c;
  text-align: left;
  font: 11px Tahoma, sans-serif;
}
.pm-additional-barcodes__head,
.pm-master-list__head {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(180deg, #f8fafc, #d9e1e8);
  font-weight: 700;
}
.pm-additional-barcodes__head span,
.pm-additional-barcodes__list > button span,
.pm-master-list__head span,
.pm-master-list > button span { height: 100%; padding: 4px 6px; border-right: 1px solid #aab7c4; }
.pm-additional-barcodes__list > button:hover,
.pm-master-list > button:hover { background: #d8e7f5; }
.pm-additional-barcodes__list > button.is-selected,
.pm-master-list > button.is-selected { background: #87afe0; }
.pm-additional-barcodes__empty { padding: 28px 8px; text-align: center; color: #607080; }

/* UNIT and CUSTOMER TYPE CREATION windows */
.pm-unit-master {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  gap: 11px 14px;
}
.pm-unit-master__form {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid #8197b5;
  background: #b8cce5;
}
.pm-unit-master__form > .pm-field {
  display: grid;
  grid-template-columns: 145px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}
.pm-unit-master__form > .pm-field .pm-label { margin: 0; }
.pm-unit-master__equals > .pm-label { margin-bottom: 4px; }
.pm-unit-master__equals > div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 7px; }
.pm-unit-master__print {
  white-space: normal;
  align-items: flex-start;
  font-size: 11px;
  line-height: 15px;
}
.pm-unit-master__print input { margin-top: 2px; }
.pm-unit-master__browser { min-width: 0; display: grid; grid-template-rows: auto 20px minmax(0, 1fr); gap: 3px; }
.pm-unit-master__browser > .pm-label span { color: #9a1d28; font-weight: 400; }
.pm-unit-master__browser .pm-master-list { min-height: 245px; }
.pm-master-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
}
.pm-master-actions .pm-btn { min-width: 68px; }
.pm-unit-master__actions { grid-column: 1 / -1; }
.pm-customer-master { display: flex; flex-direction: column; gap: 9px; }
.pm-customer-master > .pm-field {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}
.pm-customer-master > .pm-field .pm-label { margin: 0; }
.pm-customer-master__list { min-height: 190px; max-height: 260px; }

/* Per-shop configurable Shop Part Number pattern builder */
.pm-shop-part-format {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(230px, .65fr);
  gap: 12px;
}
.pm-shop-part-format__builder,
.pm-shop-part-format__preview {
  padding: 10px;
  border: 1px solid #8197b5;
  background: #b8cce5;
}
.pm-shop-part-format__builder { display: flex; flex-direction: column; gap: 11px; }
.pm-shop-part-format__tokens {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.pm-shop-part-format__tokens > span { width: 100%; font-weight: 700; }
.pm-shop-part-format__tokens .pm-btn-secondary { flex: 1; min-width: 82px; }
.pm-shop-part-format__options {
  display: grid;
  grid-template-columns: .65fr 1fr 1.15fr;
  gap: 8px;
}
.pm-shop-part-format__preview { display: flex; flex-direction: column; gap: 9px; }
.pm-shop-part-format__preview > strong {
  padding: 3px 6px;
  background: linear-gradient(180deg, #4b70c2, #315bb4);
  color: #fff;
  text-align: center;
}
.pm-shop-part-format__result {
  min-height: 40px;
  display: grid;
  place-items: center;
  padding: 6px;
  border: 2px inset #dbe8f5;
  background: #fff;
  color: #074b2c;
  font: 700 18px "Courier New", monospace;
  overflow-wrap: anywhere;
}
.pm-shop-part-format__examples {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 7px;
  border: 1px solid #8ca0b8;
  background: #d9e5f1;
  font-size: 10px;
}
.pm-shop-part-format__apply {
  grid-column: 1 / -1;
  white-space: normal;
  font-size: 11px;
  line-height: 15px;
}
.pm-shop-part-format > .pm-master-actions { grid-column: 1 / -1; }

@media (max-width: 759px) {
  .pm-root { min-width: 0; min-height: 0; height: auto; overflow: visible; }
  .pm-reference-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    overflow: visible;
  }
  .pm-reference-left, .pm-reference-middle, .pm-reference-right { width: 100%; }
  .pm-details-panel { height: auto; }
  .pm-selling-panel { height: auto; }
  .pm-list { height: 60vh; }
  .pm-actions { display: flex; flex-direction: column; min-height: 250px; }
  .pm-actions-left, .pm-actions-middle { min-height: 120px; }
  .pm-opening-tools { padding-left: 0; }
  .pm-input { padding: 7px; font-size: 14px; }
  .pm-btn, .pm-btn-secondary, .pm-btn-danger { padding: 9px 12px; font-size: 13px; }
  .pm-quick-bar { position: sticky; top: 0; z-index: 40; display: flex; gap: 7px; padding: 7px 0; background: ${Rr.body}; }
  .pm-quick-bar > button { flex: 1; }
  .pm-search-backdrop { padding: 0; align-items: stretch; }
  .pm-search-window {
    width: 100vw;
    height: 100dvh;
    min-height: 0;
    border-width: 0;
    grid-template-rows: 34px minmax(0, 1fr) auto;
  }
  .pm-search-title { padding: 4px 7px; }
  .pm-search-content {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 10px 8px 0;
  }
  .pm-search-fields { padding: 10px 7px 7px; }
  .pm-search-control-hint {
    position: static;
    display: block;
    margin-bottom: 6px;
    text-align: right;
  }
  .pm-search-field-grid { grid-template-columns: 1fr 1fr; gap: 7px; }
  .pm-search-field input { height: 36px; font-size: 14px; }
  .pm-search-command { grid-column: 1 / -1; }
  .pm-search-command button { height: 38px; font-size: 14px; }
  .pm-search-grid-wrap { min-height: 300px; height: 46dvh; flex: none; }
  .pm-search-footer { min-height: 91px; padding-left: 8px; }
  .pm-search-options { padding-right: 70px; }
  .pm-search-options label { align-items: flex-start; font-size: 11px; }
  .pm-search-options span { display: none; }
  .pm-search-columns-link { left: 8px; right: auto; }
  .pm-backdrop { align-items: flex-start; padding: 8px; }
  .pm-window { max-width: 100% !important; border-radius: 2px; }
  .pm-window-title { min-height: 35px; font-size: 14px; border-radius: 2px 2px 0 0; }
  .pm-window-close { min-width: 34px; min-height: 30px; font-size: 18px; }
  .pm-window-body { padding: 10px; }
  .pm-confirm-dialog { grid-template-columns: 38px minmax(0, 1fr); }
  .pm-confirm-dialog__message { font-size: 14px; }
  .pm-additional-barcodes { min-height: calc(100dvh - 90px); grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) auto; }
  .pm-additional-barcodes__actions { flex-direction: row; padding-top: 0; }
  .pm-additional-barcodes__actions .pm-btn { flex: 1; }
  .pm-additional-barcodes__input { grid-template-columns: 75px minmax(0, 1fr); }
  .pm-additional-barcodes__list { min-height: 45dvh; }
  .pm-unit-master { grid-template-columns: 1fr; }
  .pm-unit-master__form > .pm-field { grid-template-columns: 1fr; gap: 2px; }
  .pm-unit-master__form { gap: 8px; }
  .pm-unit-master__browser .pm-master-list { min-height: 38dvh; }
  .pm-unit-master__actions { grid-column: auto; position: sticky; bottom: 0; padding: 5px 0; background: ${Rr.panel}; }
  .pm-master-actions .pm-btn { min-width: 0; flex: 1; }
  .pm-customer-master > .pm-field { grid-template-columns: 1fr; gap: 2px; }
  .pm-customer-master__list { min-height: 45dvh; max-height: none; }
  .pm-shop-part-format { grid-template-columns: 1fr; }
  .pm-shop-part-format__options { grid-template-columns: 1fr; }
  .pm-shop-part-format__apply,
  .pm-shop-part-format > .pm-master-actions { grid-column: auto; }
}

.pm-clear-products { display: grid; gap: 14px; }
.pm-clear-products__warning {
  display: grid;
  gap: 5px;
  padding: 12px;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  background: #fef2f2;
  color: #7f1d1d;
}
.pm-clear-products__warning strong { font-size: 14px; }
.pm-clear-products__warning span { font-size: 12px; line-height: 1.45; }
.pm-clear-products__steps {
  margin: 0;
  padding-left: 22px;
  color: ${Rr.text};
  font-size: 12px;
  line-height: 1.65;
}
.pm-import-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 8px 0;
  padding: 8px 10px;
  border: 1px solid ${Rr.border};
  background: #f8fafc;
  color: ${Rr.text};
  font-size: 11px;
}
@media (min-width: 760px) { .pm-quick-bar { display: none; } }
`, Dm = ["Number", "Pcs", "Set", "Nos", "Kg", "Litre", "Ltr", "Box", "Pair", "Cm", "Mtr"];
function Om({
  form: e,
  upd: n,
  products: r,
  companies: s,
  masterUnits: i,
  onOpenMoreBarcodes: o,
  onOpenNewUnit: c,
  onPickSuggestion: u,
  onValidateIdentityCode: d,
  shopPartEnabled: x,
  hideArabicName: p = !1
}) {
  const [g, w] = Ae.useState("EN"), [k, _] = Ae.useState(!1), y = (C) => [...new Set(C.filter(Boolean).map(String))].sort(), E = Ae.useMemo(() => y(r.map((C) => C.productGroup)), [r]), A = Ae.useMemo(
    () => y([...s.map((C) => C.name), ...r.map((C) => C.company || C.brand)]),
    [r, s]
  ), O = Ae.useMemo(() => y(r.map((C) => C.category)), [r]), N = Ae.useMemo(
    () => y(r.filter((C) => !e.category || C.category === e.category).map((C) => C.subcategory)),
    [r, e.category]
  ), V = Ae.useMemo(
    () => y([...i != null && i.length ? i : Dm, ...e.customUnits || []]),
    [i, e.customUnits]
  ), J = Ae.useMemo(() => {
    const C = String(e.name || "").trim().toLowerCase();
    return C ? r.filter((G) => String(G.name || "").toLowerCase().includes(C)).slice(0, 8) : [];
  }, [r, e.name]), j = (C, G) => /* @__PURE__ */ v.jsx("datalist", { id: C, children: G.map((B) => /* @__PURE__ */ v.jsx("option", { value: B }, B)) });
  return /* @__PURE__ */ v.jsxs("fieldset", { className: "pm-panel pm-details-panel", children: [
    /* @__PURE__ */ v.jsx("legend", { className: "pm-panel-legend", children: "Product Details" }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-details-body", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", style: { position: "relative" }, children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Product Name" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            value: e.name || "",
            onChange: (C) => {
              n("name", C.target.value), _(!0);
            },
            onFocus: () => _(!0),
            onBlur: () => setTimeout(() => _(!1), 150)
          }
        ),
        k && J.length > 0 && /* @__PURE__ */ v.jsx("div", { className: "pm-suggest", children: J.map((C) => /* @__PURE__ */ v.jsx("button", { type: "button", onMouseDown: () => {
          u(C), _(!1);
        }, children: C.name }, C.id)) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Code / Model" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input pm-nav-control", enterKeyHint: "next", value: e.code || "", onChange: (C) => n("code", C.target.value) })
      ] }),
      x && /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Shop Part No" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input",
            value: e.shopPartNumber || "",
            readOnly: !0,
            title: "Configured in Settings → Utilities → Shop Part Number Settings.",
            placeholder: "Auto on Save"
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row pm-barcode-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Barcode" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            value: e.barcode || "",
            onChange: (C) => n("barcode", C.target.value),
            onBlur: () => {
              d("barcode", e.barcode) || n("barcode", "");
            }
          }
        ),
        /* @__PURE__ */ v.jsxs("div", { className: "pm-barcode-checks", children: [
          /* @__PURE__ */ v.jsxs("label", { className: "pm-check", children: [
            /* @__PURE__ */ v.jsx("input", { type: "checkbox", checked: !!e.weightBarcode, onChange: (C) => n("weightBarcode", C.target.checked) }),
            "Weight Barcode"
          ] }),
          /* @__PURE__ */ v.jsxs("label", { className: "pm-check", children: [
            /* @__PURE__ */ v.jsx("input", { type: "checkbox", checked: !!e.rateBarcode, onChange: (C) => n("rateBarcode", C.target.checked) }),
            "Rate Barcode"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row pm-ean-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "EAN Code" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            value: e.ean || "",
            onChange: (C) => n("ean", C.target.value),
            onBlur: () => {
              d("ean", e.ean) || n("ean", "");
            }
          }
        ),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: o, children: "More Barcodes..." })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Product Group" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            list: "pm-group-options",
            value: e.productGroup || "",
            onChange: (C) => n("productGroup", C.target.value)
          }
        ),
        j("pm-group-options", E)
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Company" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            list: "pm-company-options",
            value: e.company || e.brand || "",
            onChange: (C) => {
              n("company", C.target.value), n("brand", C.target.value);
            }
          }
        ),
        j("pm-company-options", A)
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Category" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            list: "pm-category-options",
            value: e.category || "",
            onChange: (C) => {
              n("category", C.target.value), n("subcategory", "");
            }
          }
        ),
        j("pm-category-options", O)
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Sub Category" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            list: "pm-subcategory-options",
            value: e.subcategory || "",
            onChange: (C) => n("subcategory", C.target.value)
          }
        ),
        j("pm-subcategory-options", N)
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsxs("label", { className: "pm-label", children: [
          "Commodity",
          /* @__PURE__ */ v.jsx("br", {}),
          "Code"
        ] }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input pm-nav-control", enterKeyHint: "next", value: e.commodityCode || "", onChange: (C) => n("commodityCode", C.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Description" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input pm-nav-control", enterKeyHint: "next", value: e.description || "", onChange: (C) => n("description", C.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row pm-unit-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Base Unit" }),
        /* @__PURE__ */ v.jsx("select", { className: "pm-input pm-nav-control", value: e.unit || "Pcs", onChange: (C) => n("unit", C.target.value), children: V.map((C) => /* @__PURE__ */ v.jsx("option", { value: C, children: C }, C)) }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: c, children: "Create New Unit" })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Product Type" }),
        /* @__PURE__ */ v.jsxs("select", { className: "pm-input pm-nav-control", value: e.productType || "Goods", onChange: (C) => n("productType", C.target.value), children: [
          /* @__PURE__ */ v.jsx("option", { value: "Goods", children: "Goods" }),
          /* @__PURE__ */ v.jsx("option", { value: "Service", children: "Service" })
        ] })
      ] }),
      !p && /* @__PURE__ */ v.jsxs("div", { className: "pm-form-row pm-arabic-row", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Arabic Name" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "done",
            dir: g === "AR" ? "rtl" : "ltr",
            value: e.arabicName || "",
            onChange: (C) => n("arabicName", C.target.value)
          }
        ),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-lang-btn", onClick: () => w(g === "EN" ? "AR" : "EN"), children: g })
      ] })
    ] })
  ] });
}
const sc = ["0", "5", "15"];
function jd(e) {
  const n = String(e ?? "0");
  return sc.includes(n) ? sc : [...sc, n];
}
function Pm({ form: e, upd: n }) {
  return /* @__PURE__ */ v.jsxs("div", { className: "pm-pricing-stack", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-tax-row", children: [
      /* @__PURE__ */ v.jsxs("fieldset", { className: "pm-panel pm-tax-panel", children: [
        /* @__PURE__ */ v.jsx("legend", { className: "pm-panel-legend", children: "Tax Settings" }),
        /* @__PURE__ */ v.jsxs("div", { className: "pm-tax-controls", children: [
          /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
            /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Sales VAT %" }),
            /* @__PURE__ */ v.jsx(
              "select",
              {
                className: "pm-input pm-nav-control",
                value: String(e.salesVat ?? "0"),
                onChange: (r) => {
                  const s = r.target.value;
                  n("salesVat", s), n("purchaseVat", s);
                },
                children: jd(e.salesVat).map((r) => /* @__PURE__ */ v.jsxs("option", { value: r, children: [
                  r,
                  "%"
                ] }, r))
              }
            )
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
            /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Purchase VAT %" }),
            /* @__PURE__ */ v.jsx("select", { className: "pm-input pm-nav-control", value: String(e.purchaseVat ?? "0"), onChange: (r) => n("purchaseVat", r.target.value), children: jd(e.purchaseVat).map((r) => /* @__PURE__ */ v.jsxs("option", { value: r, children: [
              r,
              "%"
            ] }, r)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-average-cost", children: [
        /* @__PURE__ */ v.jsx("span", { children: "Average Cost :" }),
        /* @__PURE__ */ v.jsx("strong", { children: e.averageCost || e.landingCost || "" })
      ] })
    ] }),
    /* @__PURE__ */ v.jsx("fieldset", { className: "pm-panel pm-price-panel", children: /* @__PURE__ */ v.jsx("div", { className: "pm-panel-body", children: /* @__PURE__ */ v.jsxs("div", { className: "pm-grid-3", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Landing Cost" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input pm-nav-control", enterKeyHint: "next", inputMode: "decimal", value: e.landingCost || "", onChange: (r) => n("landingCost", r.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Margin %" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input pm-nav-control", enterKeyHint: "next", inputMode: "decimal", value: e.marginPerc || "", onChange: (r) => n("marginPerc", r.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Margin Amount" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            inputMode: "decimal",
            style: { color: "#15803d", fontWeight: 700 },
            value: e.marginAmount || "",
            onChange: (r) => n("marginAmount", r.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "VAT Exclusive Rate" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            inputMode: "decimal",
            style: { color: "#15803d", fontWeight: 700 },
            value: e.vatExclusive || "",
            onChange: (r) => n("vatExclusive", r.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "VAT Inclusive Rate" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input pm-nav-control",
            enterKeyHint: "next",
            inputMode: "decimal",
            style: { color: "#0369a1", fontWeight: 700 },
            value: e.vatInclusive || "",
            onChange: (r) => n("vatInclusive", r.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "M.R.P" }),
        /* @__PURE__ */ v.jsxs("div", { className: "pm-mrp-line", children: [
          /* @__PURE__ */ v.jsx(
            "input",
            {
              className: "pm-input pm-nav-control",
              enterKeyHint: "next",
              inputMode: "decimal",
              value: e.mrp || "",
              onChange: (r) => n("mrp", r.target.value)
            }
          ),
          /* @__PURE__ */ v.jsxs("label", { className: "pm-check", children: [
            /* @__PURE__ */ v.jsx("input", { type: "checkbox", checked: !!e.vatOnMrp, onChange: (r) => n("vatOnMrp", r.target.checked) }),
            "VAT on MRP"
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
function bm({
  canClearAll: e,
  busy: n,
  onDefaultDiscount: r,
  onSetReorderLevel: s,
  onSetRack: i,
  onImport: o,
  onExport: c,
  onClearAndImport: u,
  onSpecification: d,
  onPhotoSetting: x
}) {
  return /* @__PURE__ */ v.jsxs("fieldset", { className: "pm-panel pm-middle-tools", children: [
    /* @__PURE__ */ v.jsx("legend", { className: "pm-panel-legend", children: "Product Tools" }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-middle-tools-grid", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Default Discount" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: s, children: "Set Reorder Level" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: i, children: "Set Rack" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: o, children: "Import" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: c, children: "Export" }),
      e ? /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-danger", onClick: u, disabled: n, children: "Clear & Import" }) : /* @__PURE__ */ v.jsx("span", { className: "pm-middle-tools-spacer", "aria-hidden": "true" })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-middle-tools-extra", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: d, children: "Product Specification" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: x, children: "Product Photo setting..." })
    ] })
  ] });
}
function Im({
  canDelete: e,
  hasProduct: n,
  busy: r,
  onNew: s,
  onSave: i,
  onDelete: o,
  onSearch: c,
  onClose: u,
  productMaintenanceActive: d,
  onPrintOpeningStockBarcodes: x,
  onOpeningStockEntry: p,
  onGenerateWeighingFile: g,
  showOpeningTools: w = !0,
  showWeighingExport: k = !0
}) {
  return /* @__PURE__ */ v.jsxs("div", { className: "pm-actions pm-actions--primary-only", children: [
    w && /* @__PURE__ */ v.jsxs("div", { className: "pm-opening-tools", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: x, children: "Print Opening stock Barcodes" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: p, children: "Opening Stock Entry" })
    ] }),
    k && /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary pm-weighing-btn", onClick: g, children: "Generate Data file for Weighing barcode machine" }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-primary-actions", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: s, children: "New" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: i, disabled: r || d, children: r ? "Saving..." : "Save" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: o, disabled: !n || !e, children: "Delete" }),
      /* @__PURE__ */ v.jsxs("button", { type: "button", className: "pm-btn", onClick: c, children: [
        "Search",
        /* @__PURE__ */ v.jsx("br", {}),
        "(F10)"
      ] }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: u, children: "Close" })
    ] })
  ] });
}
function Lm({
  rows: e,
  selectedId: n,
  onSelect: r,
  loading: s,
  shopPartEnabled: i
}) {
  const o = i ? 3 : 2;
  return /* @__PURE__ */ v.jsx("div", { className: `pm-list${i ? " pm-list--shop-parts" : ""}`, children: /* @__PURE__ */ v.jsx("div", { className: "pm-list-scroll", children: /* @__PURE__ */ v.jsxs("table", { className: "pm-table", children: [
    /* @__PURE__ */ v.jsx("thead", { children: /* @__PURE__ */ v.jsxs("tr", { children: [
      /* @__PURE__ */ v.jsx("th", { children: "Product Name" }),
      i && /* @__PURE__ */ v.jsx("th", { children: "Shop Part" }),
      /* @__PURE__ */ v.jsx("th", { children: "Code Model" })
    ] }) }),
    /* @__PURE__ */ v.jsxs("tbody", { children: [
      s && /* @__PURE__ */ v.jsx("tr", { children: /* @__PURE__ */ v.jsx("td", { colSpan: o, className: "pm-empty", children: "Loading..." }) }),
      !s && e.length === 0 && /* @__PURE__ */ v.jsx("tr", { children: /* @__PURE__ */ v.jsx("td", { colSpan: o, className: "pm-empty", children: "No products found" }) }),
      !s && e.map((c) => /* @__PURE__ */ v.jsxs(
        "tr",
        {
          className: `pm-clickable${n === c.id ? " pm-selected" : ""}`,
          onClick: () => r(c),
          children: [
            /* @__PURE__ */ v.jsx("td", { children: c.name }),
            i && /* @__PURE__ */ v.jsx("td", { style: { whiteSpace: "nowrap" }, title: c.shopPartNumber || "", children: c.shopPartNumber || "-" }),
            /* @__PURE__ */ v.jsx("td", { style: { whiteSpace: "nowrap" }, title: c.code || c.barcode || "", children: c.code || c.barcode || "-" })
          ]
        },
        c.id
      ))
    ] })
  ] }) }) });
}
const Ud = { xs: 320, sm: 400, md: 480, lg: 560, xl: 720 };
function jt({ title: e, onClose: n, children: r, width: s = "lg" }) {
  return Ae.useEffect(() => {
    const i = (o) => {
      o.key === "Escape" && (o.stopPropagation(), n());
    };
    return window.addEventListener("keydown", i, !0), () => window.removeEventListener("keydown", i, !0);
  }, [n]), /* @__PURE__ */ v.jsx("div", { className: "pm-backdrop", onMouseDown: (i) => {
    i.target === i.currentTarget && n();
  }, children: /* @__PURE__ */ v.jsxs("div", { className: "pm-window", style: { maxWidth: Ud[s] || Ud.lg }, onMouseDown: (i) => i.stopPropagation(), children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-title", children: [
      /* @__PURE__ */ v.jsx("span", { children: e }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-window-close", onClick: n, "aria-label": "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ v.jsx("div", { className: "pm-window-body", children: r })
  ] }) });
}
const lc = {
  id: "",
  category: "COUNT",
  name: "",
  symbol: "",
  alternateName: "",
  factor: "1",
  equalsUnit: "Number",
  printNameInBill: !1
}, zd = { id: "", name: "" }, Mm = ["AREA", "COUNT", "LENGTH", "VOLUME", "WEIGHT", "OTHER"], Hd = {
  Kg: { factor: "1000", equalsUnit: "Gram" },
  Gram: { factor: "1000", equalsUnit: "Milligram" },
  Litre: { factor: "1000", equalsUnit: "Millilitre" },
  Ltr: { factor: "1000", equalsUnit: "Millilitre" },
  Pair: { factor: "2", equalsUnit: "Number" },
  Cm: { factor: "10", equalsUnit: "Mm" },
  Mtr: { factor: "100", equalsUnit: "Cm" },
  Feet: { factor: "12", equalsUnit: "Inch" },
  "Sq.Feet": { factor: "144", equalsUnit: "Sq.Inch" },
  "Sq.Metre": { factor: "10000", equalsUnit: "Sq.Cm" },
  Dozen: { factor: "12", equalsUnit: "Number" },
  Ton: { factor: "1000", equalsUnit: "Kg" }
};
function Vd(e) {
  return Math.max(0, ...e.map((n) => Number(n.id) || 0)) + 1;
}
function Bm({ isUnit: e, records: n, onRecordsChange: r, onClose: s, notify: i }) {
  const [o, c] = Ae.useState(e ? lc : zd), [u, d] = Ae.useState(""), x = Ae.useRef(null);
  Ae.useEffect(() => {
    if (!e) return;
    const A = (O) => {
      var N;
      O.ctrlKey && O.key.toLowerCase() === "h" && (O.preventDefault(), (N = x.current) == null || N.focus());
    };
    return window.addEventListener("keydown", A), () => window.removeEventListener("keydown", A);
  }, [e]);
  const p = Ae.useMemo(() => {
    const A = u.trim().toLowerCase();
    return A ? n.filter((O) => [
      O.id,
      O.name,
      O.symbol,
      O.category
    ].some((N) => String(N || "").toLowerCase().includes(A))) : n;
  }, [n, u]), g = (A, O) => c((N) => ({ ...N, [A]: O }));
  function w() {
    c(e ? { ...lc } : { ...zd });
  }
  function k(A) {
    const O = Hd[A.symbol], N = e && O && (!A.factor || !A.equalsUnit || String(A.factor) === "1" && A.equalsUnit === "Number");
    c(N ? { ...A, ...O } : { ...A });
  }
  function _() {
    const A = String(o.name || "").trim(), O = String(o.symbol || "").trim();
    if (!A) return i(e ? "Unit name is required" : "Customer type is required", "err");
    if (e && !O) return i("Unit symbol is required", "err");
    if (n.find((j) => j.id === o.id ? !1 : e ? String(j.symbol).toLowerCase() === O.toLowerCase() : String(j.name).toLowerCase() === A.toLowerCase()))
      return i(`${e ? O : A} already exists`, "err");
    const V = e ? {
      ...lc,
      ...o,
      id: o.id || Vd(n),
      name: A,
      symbol: O,
      alternateName: String(o.alternateName || "").trim(),
      factor: String(o.factor || "1"),
      equalsUnit: o.equalsUnit || "Number"
    } : { id: o.id || Vd(n), name: A }, J = o.id ? n.map((j) => j.id === o.id ? V : j) : [...n, V];
    r(J), c(V), i(`${e ? "Unit" : "Customer type"} saved`);
  }
  function y() {
    o.id && (r(n.filter((A) => A.id !== o.id)), w(), i(`${e ? "Unit" : "Customer type"} deleted`));
  }
  if (!e)
    return /* @__PURE__ */ v.jsx(jt, { title: "CUSTOMER TYPE CREATION", onClose: s, width: "md", children: /* @__PURE__ */ v.jsxs("div", { className: "pm-customer-master", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Customer Type" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input",
            value: o.name,
            onChange: (A) => g("name", A.target.value),
            onKeyDown: (A) => {
              A.key === "Enter" && _();
            },
            autoFocus: !0
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-master-list pm-customer-master__list", children: [
        /* @__PURE__ */ v.jsxs("div", { className: "pm-master-list__head", children: [
          /* @__PURE__ */ v.jsx("span", { children: "ID" }),
          /* @__PURE__ */ v.jsx("span", { children: "Customer Type" })
        ] }),
        p.map((A) => /* @__PURE__ */ v.jsxs(
          "button",
          {
            type: "button",
            className: o.id === A.id ? "is-selected" : "",
            onClick: () => k(A),
            children: [
              /* @__PURE__ */ v.jsx("span", { children: A.id }),
              /* @__PURE__ */ v.jsx("span", { children: A.name })
            ]
          },
          A.id
        ))
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-master-actions", children: [
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: w, children: "New" }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--primary", onClick: _, children: "Save" }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--danger", onClick: y, disabled: !o.id, children: "Delete" }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: s, children: "Close" })
      ] })
    ] }) });
  const E = [...new Set([
    ...n.map((A) => A.symbol),
    ...Object.values(Hd).map((A) => A.equalsUnit)
  ].filter(Boolean))];
  return /* @__PURE__ */ v.jsx(jt, { title: "UNIT", onClose: s, width: "xl", children: /* @__PURE__ */ v.jsxs("div", { className: "pm-unit-master", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-unit-master__form", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Unit Category" }),
        /* @__PURE__ */ v.jsx("select", { className: "pm-input", value: o.category, onChange: (A) => g("category", A.target.value), autoFocus: !0, children: Mm.map((A) => /* @__PURE__ */ v.jsx("option", { value: A, children: A }, A)) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Unit Name" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: o.name, onChange: (A) => g("name", A.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Unit Symbols" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: o.symbol, onChange: (A) => g("symbol", A.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Alternate Unit Name in Bill" }),
        /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: o.alternateName, onChange: (A) => g("alternateName", A.target.value) })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-unit-master__equals", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "One Unit Equals" }),
        /* @__PURE__ */ v.jsxs("div", { children: [
          /* @__PURE__ */ v.jsx(
            "input",
            {
              className: "pm-input",
              type: "number",
              min: "0",
              step: "any",
              value: o.factor,
              onChange: (A) => g("factor", A.target.value)
            }
          ),
          /* @__PURE__ */ v.jsx("select", { className: "pm-input", value: o.equalsUnit, onChange: (A) => g("equalsUnit", A.target.value), children: E.map((A) => /* @__PURE__ */ v.jsx("option", { value: A, children: A }, A)) })
        ] })
      ] }),
      /* @__PURE__ */ v.jsxs("label", { className: "pm-check pm-unit-master__print", children: [
        /* @__PURE__ */ v.jsx(
          "input",
          {
            type: "checkbox",
            checked: !!o.printNameInBill,
            onChange: (A) => g("printNameInBill", A.target.checked)
          }
        ),
        "Print Unit name in Sales Bill Print instead of Unit symbol"
      ] })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-unit-master__browser", children: [
      /* @__PURE__ */ v.jsxs("label", { className: "pm-label", htmlFor: "pm-unit-search", children: [
        "Search ",
        /* @__PURE__ */ v.jsx("span", { children: "(Ctrl+H)" })
      ] }),
      /* @__PURE__ */ v.jsx(
        "input",
        {
          id: "pm-unit-search",
          ref: x,
          className: "pm-input",
          value: u,
          onChange: (A) => d(A.target.value)
        }
      ),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-master-list", children: [
        /* @__PURE__ */ v.jsxs("div", { className: "pm-master-list__head", children: [
          /* @__PURE__ */ v.jsx("span", { children: "ID" }),
          /* @__PURE__ */ v.jsx("span", { children: "Name" })
        ] }),
        p.map((A) => /* @__PURE__ */ v.jsxs(
          "button",
          {
            type: "button",
            className: o.id === A.id ? "is-selected" : "",
            onClick: () => k(A),
            children: [
              /* @__PURE__ */ v.jsx("span", { children: A.id }),
              /* @__PURE__ */ v.jsxs("span", { children: [
                A.name,
                A.symbol ? ` (${A.symbol})` : ""
              ] })
            ]
          },
          A.id
        ))
      ] })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-master-actions pm-unit-master__actions", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: w, children: "New" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--primary", onClick: _, children: "Save" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--danger", onClick: y, disabled: !o.id, children: "Delete" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: s, children: "Close" })
    ] })
  ] }) });
}
function jm({ form: e, products: n, currentProductId: r, upd: s, onClose: i, notify: o, onDuplicate: c }) {
  const u = Array.isArray(e.moreBarcodes) ? e.moreBarcodes.map(String) : [], [d, x] = Ae.useState(""), [p, g] = Ae.useState("");
  function w() {
    const _ = d.trim(), y = _.toLowerCase();
    if (!_) return o("Barcode is required", "err");
    if ([e.barcode, e.ean, ...u].map((O) => String(O || "").trim().toLowerCase()).filter(Boolean).includes(y)) {
      const O = `The number "${_}" is already entered in this product. The same number cannot be used in Barcode, EAN Code, or More Barcodes.`;
      return c == null || c(O), o(O, "err");
    }
    const A = n.find((O) => O.id !== r && [
      O.barcode,
      O.ean,
      ...Array.isArray(O.moreBarcodes) ? O.moreBarcodes : []
    ].map((N) => String(N || "").trim().toLowerCase()).includes(y));
    if (A) {
      const O = `The number "${_}" already belongs to product "${A.name}".`;
      return c == null || c(O), o(O, "err");
    }
    s("moreBarcodes", [...u, _]), x("");
  }
  function k(_) {
    s("moreBarcodes", u.filter((E) => E !== _)), g("");
    const y = e.moreBarcodeLabels && typeof e.moreBarcodeLabels == "object" ? e.moreBarcodeLabels : {};
    if (y[_]) {
      const E = { ...y };
      delete E[_], s("moreBarcodeLabels", E);
    }
  }
  return /* @__PURE__ */ v.jsx(jt, { title: "Additional Barcodes", onClose: i, width: "lg", children: /* @__PURE__ */ v.jsxs("div", { className: "pm-additional-barcodes", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-additional-barcodes__main", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field pm-additional-barcodes__input", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Barcode" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input",
            value: d,
            onChange: (_) => x(_.target.value),
            onKeyDown: (_) => {
              _.key === "Enter" && w();
            },
            autoFocus: !0
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-additional-barcodes__list", role: "listbox", "aria-label": "Additional barcodes", children: [
        /* @__PURE__ */ v.jsxs("div", { className: "pm-additional-barcodes__head", children: [
          /* @__PURE__ */ v.jsx("span", { children: "Sl.No." }),
          /* @__PURE__ */ v.jsx("span", { children: "Barcode" })
        ] }),
        u.length === 0 && /* @__PURE__ */ v.jsx("div", { className: "pm-additional-barcodes__empty", children: "No additional barcode entered." }),
        u.map((_, y) => /* @__PURE__ */ v.jsxs(
          "button",
          {
            type: "button",
            className: p === _ ? "is-selected" : "",
            onClick: () => g(_),
            role: "option",
            "aria-selected": p === _,
            children: [
              /* @__PURE__ */ v.jsx("span", { children: y + 1 }),
              /* @__PURE__ */ v.jsx("span", { children: _ })
            ]
          },
          _
        ))
      ] })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-additional-barcodes__actions", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--primary", onClick: w, children: "Add" }),
      /* @__PURE__ */ v.jsx(
        "button",
        {
          type: "button",
          className: "pm-btn pm-btn--danger",
          disabled: !p,
          onClick: () => k(p),
          children: "Delete"
        }
      ),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: i, children: "Close" })
    ] })
  ] }) });
}
function Um({ form: e, upd: n, onClose: r, notify: s }) {
  const [i, o] = Ae.useState(e.openingStock || ""), [c, u] = Ae.useState(e.openingRate || ""), [d, x] = Ae.useState(e.openingWarehouse || "");
  function p() {
    if (!String(i).trim()) return s("Quantity is required", "err");
    n("openingStock", String(i).trim()), n("openingRate", String(c).trim()), n("openingWarehouse", d.trim()), s("Opening stock set — press Save to store it"), r();
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Opening Stock Entry", onClose: r, width: "sm", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Opening Quantity *" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: i, onChange: (g) => o(g.target.value), autoFocus: !0 })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Rate" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: c, onChange: (g) => u(g.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Warehouse / Location" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: d, onChange: (g) => x(g.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Cancel" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: p, children: "Save" })
    ] })
  ] });
}
function zm({ form: e, upd: n, onClose: r, notify: s }) {
  const [i, o] = Ae.useState(e.reorderMin || ""), [c, u] = Ae.useState(e.reorderMax || ""), [d, x] = Ae.useState(e.reorderQty || "");
  function p() {
    n("reorderMin", String(i).trim()), n("reorderMax", String(c).trim()), n("reorderQty", String(d).trim()), s("Reorder level set — press Save to store it"), r();
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Set Reorder Level", onClose: r, width: "sm", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Min Stock Level" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: i, onChange: (g) => o(g.target.value), autoFocus: !0 })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Max Stock Level" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: c, onChange: (g) => u(g.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Reorder Quantity" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: d, onChange: (g) => x(g.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Cancel" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: p, children: "Save" })
    ] })
  ] });
}
function Hm({ form: e, upd: n, onClose: r, notify: s }) {
  const i = String(e.rackLocation || "").split("/").map((w) => w.trim()), [o, c] = Ae.useState(i[0] || ""), [u, d] = Ae.useState(i[1] || ""), [x, p] = Ae.useState(i[2] || "");
  function g() {
    const w = [o.trim(), u.trim(), x.trim()].filter(Boolean).join(" / ");
    n("rackLocation", w), s("Rack location set — press Save to store it"), r();
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Set Rack / Shelf / Bin Location", onClose: r, width: "sm", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Rack" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: o, onChange: (w) => c(w.target.value), autoFocus: !0 })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Shelf" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: u, onChange: (w) => d(w.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Bin" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", value: x, onChange: (w) => p(w.target.value) })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Cancel" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: g, children: "Save" })
    ] })
  ] });
}
function Vm({ form: e, upd: n, onClose: r }) {
  const [s, i] = Ae.useState(e.defaultDiscount || "");
  return /* @__PURE__ */ v.jsxs(jt, { title: "Default Discount", onClose: r, width: "xs", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Default Discount %" }),
      /* @__PURE__ */ v.jsx("input", { className: "pm-input", inputMode: "decimal", value: s, onChange: (o) => i(o.target.value), autoFocus: !0 })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Cancel" }),
      /* @__PURE__ */ v.jsx(
        "button",
        {
          type: "button",
          className: "pm-btn",
          onClick: () => {
            n("defaultDiscount", String(s).trim()), r();
          },
          children: "Apply"
        }
      )
    ] })
  ] });
}
function Wm(e) {
  return String(e || "").split(/\r?\n/).map((n) => n.trim()).filter(Boolean).map((n) => {
    const r = n.indexOf(":");
    return r < 0 ? { key: n, value: "" } : { key: n.slice(0, r).trim(), value: n.slice(r + 1).trim() };
  });
}
const Gm = (e) => e.map((n) => `${n.key}: ${n.value}`).join(`
`);
function $m({ form: e, upd: n, onClose: r, notify: s }) {
  const [i, o] = Ae.useState(() => Wm(e.specificationText)), [c, u] = Ae.useState(""), [d, x] = Ae.useState("");
  function p(w) {
    o(w), n("specificationText", Gm(w));
  }
  function g() {
    if (!c.trim()) return s("Spec name is required", "err");
    p([...i, { key: c.trim(), value: d.trim() }]), u(""), x("");
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Product Specification", onClose: r, width: "md", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-grid-2", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Spec (e.g. Size)" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input",
            value: c,
            onChange: (w) => u(w.target.value),
            onKeyDown: (w) => {
              w.key === "Enter" && g();
            },
            autoFocus: !0
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
        /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Value (e.g. Large)" }),
        /* @__PURE__ */ v.jsx(
          "input",
          {
            className: "pm-input",
            value: d,
            onChange: (w) => x(w.target.value),
            onKeyDown: (w) => {
              w.key === "Enter" && g();
            }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", style: { alignSelf: "flex-start" }, onClick: g, children: "+ Add Spec" }),
    /* @__PURE__ */ v.jsx("div", { className: "pm-table-wrap", style: { maxHeight: 200 }, children: /* @__PURE__ */ v.jsxs("table", { className: "pm-table", children: [
      /* @__PURE__ */ v.jsx("thead", { children: /* @__PURE__ */ v.jsxs("tr", { children: [
        /* @__PURE__ */ v.jsx("th", { children: "Spec" }),
        /* @__PURE__ */ v.jsx("th", { children: "Value" }),
        /* @__PURE__ */ v.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ v.jsxs("tbody", { children: [
        i.length === 0 && /* @__PURE__ */ v.jsx("tr", { children: /* @__PURE__ */ v.jsx("td", { colSpan: 3, className: "pm-empty", children: "No specifications added" }) }),
        i.map((w, k) => /* @__PURE__ */ v.jsxs("tr", { children: [
          /* @__PURE__ */ v.jsx("td", { children: w.key }),
          /* @__PURE__ */ v.jsx("td", { children: w.value || "-" }),
          /* @__PURE__ */ v.jsx("td", { style: { textAlign: "right" }, children: /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-link-danger", onClick: () => p(i.filter((_, y) => y !== k)), children: "Remove" }) })
        ] }, `${w.key}-${k}`))
      ] })
    ] }) }),
    /* @__PURE__ */ v.jsx("div", { className: "pm-window-foot", children: /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: r, children: "Done" }) })
  ] });
}
const Km = 400 * 1024;
function Xm({ form: e, upd: n, onClose: r, notify: s }) {
  const [i, o] = Ae.useState(e.photoUrl || ""), [c, u] = Ae.useState(e.photoUrl || "");
  function d(x) {
    var w;
    const p = (w = x.target.files) == null ? void 0 : w[0];
    if (x.target.value = "", !p) return;
    if (p.size > Km) {
      s("Image is larger than 400 KB — use a photo URL instead", "err");
      return;
    }
    const g = new FileReader();
    g.onload = () => {
      const k = String(g.result || "");
      o(k), u(k);
    }, g.readAsDataURL(p);
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Product Photo Setting", onClose: r, width: "md", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Photo URL" }),
      /* @__PURE__ */ v.jsx(
        "input",
        {
          className: "pm-input",
          value: i.startsWith("data:") ? "(uploaded image)" : i,
          readOnly: i.startsWith("data:"),
          onChange: (x) => {
            o(x.target.value), u(x.target.value);
          },
          placeholder: "https://..."
        }
      )
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("label", { className: "pm-label", children: "Or upload an image (max 400 KB, stored with the product)" }),
      /* @__PURE__ */ v.jsx("input", { type: "file", accept: "image/*", onChange: d, style: { fontSize: 12 } })
    ] }),
    c && /* @__PURE__ */ v.jsx(
      "img",
      {
        src: c,
        alt: "Product preview",
        style: { width: 130, height: 130, objectFit: "cover", border: "1px solid #94a3b8", borderRadius: 3, background: "#fff" }
      }
    ),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      i && /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-danger", onClick: () => {
        o(""), u(""), n("photoUrl", "");
      }, children: "Remove" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: r, children: "Cancel" }),
      /* @__PURE__ */ v.jsx(
        "button",
        {
          type: "button",
          className: "pm-btn",
          onClick: () => {
            n("photoUrl", i), s("Photo set — press Save to store it"), r();
          },
          children: "Apply"
        }
      )
    ] })
  ] });
}
/*! xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
var ep = 1252, Ym = [874, 932, 936, 949, 950, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1e4], Pc = {
  /*::[*/
  0: 1252,
  /* ANSI */
  /*::[*/
  1: 65001,
  /* DEFAULT */
  /*::[*/
  2: 65001,
  /* SYMBOL */
  /*::[*/
  77: 1e4,
  /* MAC */
  /*::[*/
  128: 932,
  /* SHIFTJIS */
  /*::[*/
  129: 949,
  /* HANGUL */
  /*::[*/
  130: 1361,
  /* JOHAB */
  /*::[*/
  134: 936,
  /* GB2312 */
  /*::[*/
  136: 950,
  /* CHINESEBIG5 */
  /*::[*/
  161: 1253,
  /* GREEK */
  /*::[*/
  162: 1254,
  /* TURKISH */
  /*::[*/
  163: 1258,
  /* VIETNAMESE */
  /*::[*/
  177: 1255,
  /* HEBREW */
  /*::[*/
  178: 1256,
  /* ARABIC */
  /*::[*/
  186: 1257,
  /* BALTIC */
  /*::[*/
  204: 1251,
  /* RUSSIAN */
  /*::[*/
  222: 874,
  /* THAI */
  /*::[*/
  238: 1250,
  /* EASTEUROPE */
  /*::[*/
  255: 1252,
  /* OEM */
  /*::[*/
  69: 6969
  /* MISC */
}, bc = function(e) {
  Ym.indexOf(e) != -1 && (ep = Pc[0] = e);
};
function Qm() {
  bc(1252);
}
var Zt = function(e) {
  bc(e);
};
function rp() {
  Zt(1200), Qm();
}
function Wd(e) {
  for (var n = [], r = 0, s = e.length; r < s; ++r) n[r] = e.charCodeAt(r);
  return n;
}
function qm(e) {
  for (var n = [], r = 0; r < e.length >> 1; ++r) n[r] = String.fromCharCode(e.charCodeAt(2 * r) + (e.charCodeAt(2 * r + 1) << 8));
  return n.join("");
}
function tp(e) {
  for (var n = [], r = 0; r < e.length >> 1; ++r) n[r] = String.fromCharCode(e.charCodeAt(2 * r + 1) + (e.charCodeAt(2 * r) << 8));
  return n.join("");
}
var os = function(e) {
  var n = e.charCodeAt(0), r = e.charCodeAt(1);
  return n == 255 && r == 254 ? qm(e.slice(2)) : n == 254 && r == 255 ? tp(e.slice(2)) : n == 65279 ? e.slice(1) : e;
}, Yl = function(n) {
  return String.fromCharCode(n);
}, Gd = function(n) {
  return String.fromCharCode(n);
}, Ss, ta = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function $d(e) {
  for (var n = "", r = 0, s = 0, i = 0, o = 0, c = 0, u = 0, d = 0, x = 0; x < e.length; )
    r = e.charCodeAt(x++), o = r >> 2, s = e.charCodeAt(x++), c = (r & 3) << 4 | s >> 4, i = e.charCodeAt(x++), u = (s & 15) << 2 | i >> 6, d = i & 63, isNaN(s) ? u = d = 64 : isNaN(i) && (d = 64), n += ta.charAt(o) + ta.charAt(c) + ta.charAt(u) + ta.charAt(d);
  return n;
}
function Ft(e) {
  var n = "", r = 0, s = 0, i = 0, o = 0, c = 0, u = 0, d = 0;
  e = e.replace(/[^\w\+\/\=]/g, "");
  for (var x = 0; x < e.length; )
    o = ta.indexOf(e.charAt(x++)), c = ta.indexOf(e.charAt(x++)), r = o << 2 | c >> 4, n += String.fromCharCode(r), u = ta.indexOf(e.charAt(x++)), s = (c & 15) << 4 | u >> 2, u !== 64 && (n += String.fromCharCode(s)), d = ta.indexOf(e.charAt(x++)), i = (u & 3) << 6 | d, d !== 64 && (n += String.fromCharCode(i));
  return n;
}
var Qe = /* @__PURE__ */ (function() {
  return typeof Buffer < "u" && typeof process < "u" && typeof process.versions < "u" && !!process.versions.node;
})(), Pa = /* @__PURE__ */ (function() {
  if (typeof Buffer < "u") {
    var e = !Buffer.from;
    if (!e) try {
      Buffer.from("foo", "utf8");
    } catch {
      e = !0;
    }
    return e ? function(n, r) {
      return r ? new Buffer(n, r) : new Buffer(n);
    } : Buffer.from.bind(Buffer);
  }
  return function() {
  };
})();
function ia(e) {
  return Qe ? Buffer.alloc ? Buffer.alloc(e) : new Buffer(e) : typeof Uint8Array < "u" ? new Uint8Array(e) : new Array(e);
}
function Kd(e) {
  return Qe ? Buffer.allocUnsafe ? Buffer.allocUnsafe(e) : new Buffer(e) : typeof Uint8Array < "u" ? new Uint8Array(e) : new Array(e);
}
var Jt = function(n) {
  return Qe ? Pa(n, "binary") : n.split("").map(function(r) {
    return r.charCodeAt(0) & 255;
  });
};
function ba(e) {
  if (Array.isArray(e)) return e.map(function(s) {
    return String.fromCharCode(s);
  }).join("");
  for (var n = [], r = 0; r < e.length; ++r) n[r] = String.fromCharCode(e[r]);
  return n.join("");
}
function Ic(e) {
  if (typeof ArrayBuffer > "u") throw new Error("Unsupported");
  if (e instanceof ArrayBuffer) return Ic(new Uint8Array(e));
  for (var n = new Array(e.length), r = 0; r < e.length; ++r) n[r] = e[r];
  return n;
}
var ra = Qe ? function(e) {
  return Buffer.concat(e.map(function(n) {
    return Buffer.isBuffer(n) ? n : Pa(n);
  }));
} : function(e) {
  if (typeof Uint8Array < "u") {
    var n = 0, r = 0;
    for (n = 0; n < e.length; ++n) r += e[n].length;
    var s = new Uint8Array(r), i = 0;
    for (n = 0, r = 0; n < e.length; r += i, ++n)
      if (i = e[n].length, e[n] instanceof Uint8Array) s.set(e[n], r);
      else {
        if (typeof e[n] == "string")
          throw "wtf";
        s.set(new Uint8Array(e[n]), r);
      }
    return s;
  }
  return [].concat.apply([], e.map(function(o) {
    return Array.isArray(o) ? o : [].slice.call(o);
  }));
};
function Jm(e) {
  for (var n = [], r = 0, s = e.length + 250, i = ia(e.length + 255), o = 0; o < e.length; ++o) {
    var c = e.charCodeAt(o);
    if (c < 128) i[r++] = c;
    else if (c < 2048)
      i[r++] = 192 | c >> 6 & 31, i[r++] = 128 | c & 63;
    else if (c >= 55296 && c < 57344) {
      c = (c & 1023) + 64;
      var u = e.charCodeAt(++o) & 1023;
      i[r++] = 240 | c >> 8 & 7, i[r++] = 128 | c >> 2 & 63, i[r++] = 128 | u >> 6 & 15 | (c & 3) << 4, i[r++] = 128 | u & 63;
    } else
      i[r++] = 224 | c >> 12 & 15, i[r++] = 128 | c >> 6 & 63, i[r++] = 128 | c & 63;
    r > s && (n.push(i.slice(0, r)), r = 0, i = ia(65535), s = 65530);
  }
  return n.push(i.slice(0, r)), ra(n);
}
var ft = /\u0000/g, cs = /[\u0001-\u0006]/g;
function pi(e) {
  for (var n = "", r = e.length - 1; r >= 0; ) n += e.charAt(r--);
  return n;
}
function en(e, n) {
  var r = "" + e;
  return r.length >= n ? r : gr("0", n - r.length) + r;
}
function Lc(e, n) {
  var r = "" + e;
  return r.length >= n ? r : gr(" ", n - r.length) + r;
}
function ao(e, n) {
  var r = "" + e;
  return r.length >= n ? r : r + gr(" ", n - r.length);
}
function Zm(e, n) {
  var r = "" + Math.round(e);
  return r.length >= n ? r : gr("0", n - r.length) + r;
}
function eg(e, n) {
  var r = "" + e;
  return r.length >= n ? r : gr("0", n - r.length) + r;
}
var Xd = /* @__PURE__ */ Math.pow(2, 32);
function fi(e, n) {
  if (e > Xd || e < -Xd) return Zm(e, n);
  var r = Math.round(e);
  return eg(r, n);
}
function io(e, n) {
  return n = n || 0, e.length >= 7 + n && (e.charCodeAt(n) | 32) === 103 && (e.charCodeAt(n + 1) | 32) === 101 && (e.charCodeAt(n + 2) | 32) === 110 && (e.charCodeAt(n + 3) | 32) === 101 && (e.charCodeAt(n + 4) | 32) === 114 && (e.charCodeAt(n + 5) | 32) === 97 && (e.charCodeAt(n + 6) | 32) === 108;
}
var Yd = [
  ["Sun", "Sunday"],
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"]
], oc = [
  ["J", "Jan", "January"],
  ["F", "Feb", "February"],
  ["M", "Mar", "March"],
  ["A", "Apr", "April"],
  ["M", "May", "May"],
  ["J", "Jun", "June"],
  ["J", "Jul", "July"],
  ["A", "Aug", "August"],
  ["S", "Sep", "September"],
  ["O", "Oct", "October"],
  ["N", "Nov", "November"],
  ["D", "Dec", "December"]
];
function rg(e) {
  return e || (e = {}), e[0] = "General", e[1] = "0", e[2] = "0.00", e[3] = "#,##0", e[4] = "#,##0.00", e[9] = "0%", e[10] = "0.00%", e[11] = "0.00E+00", e[12] = "# ?/?", e[13] = "# ??/??", e[14] = "m/d/yy", e[15] = "d-mmm-yy", e[16] = "d-mmm", e[17] = "mmm-yy", e[18] = "h:mm AM/PM", e[19] = "h:mm:ss AM/PM", e[20] = "h:mm", e[21] = "h:mm:ss", e[22] = "m/d/yy h:mm", e[37] = "#,##0 ;(#,##0)", e[38] = "#,##0 ;[Red](#,##0)", e[39] = "#,##0.00;(#,##0.00)", e[40] = "#,##0.00;[Red](#,##0.00)", e[45] = "mm:ss", e[46] = "[h]:mm:ss", e[47] = "mmss.0", e[48] = "##0.0E+0", e[49] = "@", e[56] = '"上午/下午 "hh"時"mm"分"ss"秒 "', e;
}
var $e = {
  0: "General",
  1: "0",
  2: "0.00",
  3: "#,##0",
  4: "#,##0.00",
  9: "0%",
  10: "0.00%",
  11: "0.00E+00",
  12: "# ?/?",
  13: "# ??/??",
  14: "m/d/yy",
  15: "d-mmm-yy",
  16: "d-mmm",
  17: "mmm-yy",
  18: "h:mm AM/PM",
  19: "h:mm:ss AM/PM",
  20: "h:mm",
  21: "h:mm:ss",
  22: "m/d/yy h:mm",
  37: "#,##0 ;(#,##0)",
  38: "#,##0 ;[Red](#,##0)",
  39: "#,##0.00;(#,##0.00)",
  40: "#,##0.00;[Red](#,##0.00)",
  45: "mm:ss",
  46: "[h]:mm:ss",
  47: "mmss.0",
  48: "##0.0E+0",
  49: "@",
  56: '"上午/下午 "hh"時"mm"分"ss"秒 "'
}, Qd = {
  5: 37,
  6: 38,
  7: 39,
  8: 40,
  //  5 -> 37 ...  8 -> 40
  23: 0,
  24: 0,
  25: 0,
  26: 0,
  // 23 ->  0 ... 26 ->  0
  27: 14,
  28: 14,
  29: 14,
  30: 14,
  31: 14,
  // 27 -> 14 ... 31 -> 14
  50: 14,
  51: 14,
  52: 14,
  53: 14,
  54: 14,
  // 50 -> 14 ... 58 -> 14
  55: 14,
  56: 14,
  57: 14,
  58: 14,
  59: 1,
  60: 2,
  61: 3,
  62: 4,
  // 59 ->  1 ... 62 ->  4
  67: 9,
  68: 10,
  // 67 ->  9 ... 68 -> 10
  69: 12,
  70: 13,
  71: 14,
  // 69 -> 12 ... 71 -> 14
  72: 14,
  73: 15,
  74: 16,
  75: 17,
  // 72 -> 14 ... 75 -> 17
  76: 20,
  77: 21,
  78: 22,
  // 76 -> 20 ... 78 -> 22
  79: 45,
  80: 46,
  81: 47,
  // 79 -> 45 ... 81 -> 47
  82: 0
  // 82 ->  0 ... 65536 -> 0 (omitted)
}, tg = {
  //  5 -- Currency,   0 decimal, black negative
  5: '"$"#,##0_);\\("$"#,##0\\)',
  63: '"$"#,##0_);\\("$"#,##0\\)',
  //  6 -- Currency,   0 decimal, red   negative
  6: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  64: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  //  7 -- Currency,   2 decimal, black negative
  7: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  65: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  //  8 -- Currency,   2 decimal, red   negative
  8: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  66: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  // 41 -- Accounting, 0 decimal, No Symbol
  41: '_(* #,##0_);_(* \\(#,##0\\);_(* "-"_);_(@_)',
  // 42 -- Accounting, 0 decimal, $  Symbol
  42: '_("$"* #,##0_);_("$"* \\(#,##0\\);_("$"* "-"_);_(@_)',
  // 43 -- Accounting, 2 decimal, No Symbol
  43: '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)',
  // 44 -- Accounting, 2 decimal, $  Symbol
  44: '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)'
};
function so(e, n, r) {
  for (var s = e < 0 ? -1 : 1, i = e * s, o = 0, c = 1, u = 0, d = 1, x = 0, p = 0, g = Math.floor(i); x < n && (g = Math.floor(i), u = g * c + o, p = g * x + d, !(i - g < 5e-8)); )
    i = 1 / (i - g), o = c, c = u, d = x, x = p;
  if (p > n && (x > n ? (p = d, u = o) : (p = x, u = c)), !r) return [0, s * u, p];
  var w = Math.floor(s * u / p);
  return [w, s * u - w * p, p];
}
function Ta(e, n, r) {
  if (e > 2958465 || e < 0) return null;
  var s = e | 0, i = Math.floor(86400 * (e - s)), o = 0, c = [], u = { D: s, T: i, u: 86400 * (e - s) - i, y: 0, m: 0, d: 0, H: 0, M: 0, S: 0, q: 0 };
  if (Math.abs(u.u) < 1e-6 && (u.u = 0), n && n.date1904 && (s += 1462), u.u > 0.9999 && (u.u = 0, ++i == 86400 && (u.T = i = 0, ++s, ++u.D)), s === 60)
    c = r ? [1317, 10, 29] : [1900, 2, 29], o = 3;
  else if (s === 0)
    c = r ? [1317, 8, 29] : [1900, 1, 0], o = 6;
  else {
    s > 60 && --s;
    var d = new Date(1900, 0, 1);
    d.setDate(d.getDate() + s - 1), c = [d.getFullYear(), d.getMonth() + 1, d.getDate()], o = d.getDay(), s < 60 && (o = (o + 6) % 7), r && (o = og(d, c));
  }
  return u.y = c[0], u.m = c[1], u.d = c[2], u.S = i % 60, i = Math.floor(i / 60), u.M = i % 60, i = Math.floor(i / 60), u.H = i, u.q = o, u;
}
var np = /* @__PURE__ */ new Date(1899, 11, 31, 0, 0, 0), ng = /* @__PURE__ */ np.getTime(), ag = /* @__PURE__ */ new Date(1900, 2, 1, 0, 0, 0);
function ap(e, n) {
  var r = /* @__PURE__ */ e.getTime();
  return n ? r -= 1461 * 24 * 60 * 60 * 1e3 : e >= ag && (r += 1440 * 60 * 1e3), (r - (ng + (/* @__PURE__ */ e.getTimezoneOffset() - /* @__PURE__ */ np.getTimezoneOffset()) * 6e4)) / (1440 * 60 * 1e3);
}
function Mc(e) {
  return e.indexOf(".") == -1 ? e : e.replace(/(?:\.0*|(\.\d*[1-9])0+)$/, "$1");
}
function ig(e) {
  return e.indexOf("E") == -1 ? e : e.replace(/(?:\.0*|(\.\d*[1-9])0+)[Ee]/, "$1E").replace(/(E[+-])(\d)$/, "$10$2");
}
function sg(e) {
  var n = e < 0 ? 12 : 11, r = Mc(e.toFixed(12));
  return r.length <= n || (r = e.toPrecision(10), r.length <= n) ? r : e.toExponential(5);
}
function lg(e) {
  var n = Mc(e.toFixed(11));
  return n.length > (e < 0 ? 12 : 11) || n === "0" || n === "-0" ? e.toPrecision(6) : n;
}
function Ts(e) {
  var n = Math.floor(Math.log(Math.abs(e)) * Math.LOG10E), r;
  return n >= -4 && n <= -1 ? r = e.toPrecision(10 + n) : Math.abs(n) <= 9 ? r = sg(e) : n === 10 ? r = e.toFixed(10).substr(0, 12) : r = lg(e), Mc(ig(r.toUpperCase()));
}
function Ra(e, n) {
  switch (typeof e) {
    case "string":
      return e;
    case "boolean":
      return e ? "TRUE" : "FALSE";
    case "number":
      return (e | 0) === e ? e.toString(10) : Ts(e);
    case "undefined":
      return "";
    case "object":
      if (e == null) return "";
      if (e instanceof Date) return Ut(14, ap(e, n && n.date1904), n);
  }
  throw new Error("unsupported value in General format: " + e);
}
function og(e, n) {
  n[0] -= 581;
  var r = e.getDay();
  return e < 60 && (r = (r + 6) % 7), r;
}
function cg(e, n, r, s) {
  var i = "", o = 0, c = 0, u = r.y, d, x = 0;
  switch (e) {
    case 98:
      u = r.y + 543;
    /* falls through */
    case 121:
      switch (n.length) {
        case 1:
        case 2:
          d = u % 100, x = 2;
          break;
        default:
          d = u % 1e4, x = 4;
          break;
      }
      break;
    case 109:
      switch (n.length) {
        case 1:
        case 2:
          d = r.m, x = n.length;
          break;
        case 3:
          return oc[r.m - 1][1];
        case 5:
          return oc[r.m - 1][0];
        default:
          return oc[r.m - 1][2];
      }
      break;
    case 100:
      switch (n.length) {
        case 1:
        case 2:
          d = r.d, x = n.length;
          break;
        case 3:
          return Yd[r.q][0];
        default:
          return Yd[r.q][1];
      }
      break;
    case 104:
      switch (n.length) {
        case 1:
        case 2:
          d = 1 + (r.H + 11) % 12, x = n.length;
          break;
        default:
          throw "bad hour format: " + n;
      }
      break;
    case 72:
      switch (n.length) {
        case 1:
        case 2:
          d = r.H, x = n.length;
          break;
        default:
          throw "bad hour format: " + n;
      }
      break;
    case 77:
      switch (n.length) {
        case 1:
        case 2:
          d = r.M, x = n.length;
          break;
        default:
          throw "bad minute format: " + n;
      }
      break;
    case 115:
      if (n != "s" && n != "ss" && n != ".0" && n != ".00" && n != ".000") throw "bad second format: " + n;
      return r.u === 0 && (n == "s" || n == "ss") ? en(r.S, n.length) : (s >= 2 ? c = s === 3 ? 1e3 : 100 : c = s === 1 ? 10 : 1, o = Math.round(c * (r.S + r.u)), o >= 60 * c && (o = 0), n === "s" ? o === 0 ? "0" : "" + o / c : (i = en(o, 2 + s), n === "ss" ? i.substr(0, 2) : "." + i.substr(2, n.length - 1)));
    case 90:
      switch (n) {
        case "[h]":
        case "[hh]":
          d = r.D * 24 + r.H;
          break;
        case "[m]":
        case "[mm]":
          d = (r.D * 24 + r.H) * 60 + r.M;
          break;
        case "[s]":
        case "[ss]":
          d = ((r.D * 24 + r.H) * 60 + r.M) * 60 + Math.round(r.S + r.u);
          break;
        default:
          throw "bad abstime format: " + n;
      }
      x = n.length === 3 ? 1 : 2;
      break;
    case 101:
      d = u, x = 1;
      break;
  }
  var p = x > 0 ? en(d, x) : "";
  return p;
}
function na(e) {
  var n = 3;
  if (e.length <= n) return e;
  for (var r = e.length % n, s = e.substr(0, r); r != e.length; r += n) s += (s.length > 0 ? "," : "") + e.substr(r, n);
  return s;
}
var ip = /%/g;
function ug(e, n, r) {
  var s = n.replace(ip, ""), i = n.length - s.length;
  return Fn(e, s, r * Math.pow(10, 2 * i)) + gr("%", i);
}
function fg(e, n, r) {
  for (var s = n.length - 1; n.charCodeAt(s - 1) === 44; ) --s;
  return Fn(e, n.substr(0, s), r / Math.pow(10, 3 * (n.length - s)));
}
function sp(e, n) {
  var r, s = e.indexOf("E") - e.indexOf(".") - 1;
  if (e.match(/^#+0.0E\+0$/)) {
    if (n == 0) return "0.0E+0";
    if (n < 0) return "-" + sp(e, -n);
    var i = e.indexOf(".");
    i === -1 && (i = e.indexOf("E"));
    var o = Math.floor(Math.log(n) * Math.LOG10E) % i;
    if (o < 0 && (o += i), r = (n / Math.pow(10, o)).toPrecision(s + 1 + (i + o) % i), r.indexOf("e") === -1) {
      var c = Math.floor(Math.log(n) * Math.LOG10E);
      for (r.indexOf(".") === -1 ? r = r.charAt(0) + "." + r.substr(1) + "E+" + (c - r.length + o) : r += "E+" + (c - o); r.substr(0, 2) === "0."; )
        r = r.charAt(0) + r.substr(2, i) + "." + r.substr(2 + i), r = r.replace(/^0+([1-9])/, "$1").replace(/^0+\./, "0.");
      r = r.replace(/\+-/, "-");
    }
    r = r.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function(u, d, x, p) {
      return d + x + p.substr(0, (i + o) % i) + "." + p.substr(o) + "E";
    });
  } else r = n.toExponential(s);
  return e.match(/E\+00$/) && r.match(/e[+-]\d$/) && (r = r.substr(0, r.length - 1) + "0" + r.charAt(r.length - 1)), e.match(/E\-/) && r.match(/e\+/) && (r = r.replace(/e\+/, "e")), r.replace("e", "E");
}
var lp = /# (\?+)( ?)\/( ?)(\d+)/;
function dg(e, n, r) {
  var s = parseInt(e[4], 10), i = Math.round(n * s), o = Math.floor(i / s), c = i - o * s, u = s;
  return r + (o === 0 ? "" : "" + o) + " " + (c === 0 ? gr(" ", e[1].length + 1 + e[4].length) : Lc(c, e[1].length) + e[2] + "/" + e[3] + en(u, e[4].length));
}
function hg(e, n, r) {
  return r + (n === 0 ? "" : "" + n) + gr(" ", e[1].length + 2 + e[4].length);
}
var op = /^#*0*\.([0#]+)/, cp = /\).*[0#]/, up = /\(###\) ###\\?-####/;
function ot(e) {
  for (var n = "", r, s = 0; s != e.length; ++s) switch (r = e.charCodeAt(s)) {
    case 35:
      break;
    case 63:
      n += " ";
      break;
    case 48:
      n += "0";
      break;
    default:
      n += String.fromCharCode(r);
  }
  return n;
}
function qd(e, n) {
  var r = Math.pow(10, n);
  return "" + Math.round(e * r) / r;
}
function Jd(e, n) {
  var r = e - Math.floor(e), s = Math.pow(10, n);
  return n < ("" + Math.round(r * s)).length ? 0 : Math.round(r * s);
}
function pg(e, n) {
  return n < ("" + Math.round((e - Math.floor(e)) * Math.pow(10, n))).length ? 1 : 0;
}
function xg(e) {
  return e < 2147483647 && e > -2147483648 ? "" + (e >= 0 ? e | 0 : e - 1 | 0) : "" + Math.floor(e);
}
function Mt(e, n, r) {
  if (e.charCodeAt(0) === 40 && !n.match(cp)) {
    var s = n.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
    return r >= 0 ? Mt("n", s, r) : "(" + Mt("n", s, -r) + ")";
  }
  if (n.charCodeAt(n.length - 1) === 44) return fg(e, n, r);
  if (n.indexOf("%") !== -1) return ug(e, n, r);
  if (n.indexOf("E") !== -1) return sp(n, r);
  if (n.charCodeAt(0) === 36) return "$" + Mt(e, n.substr(n.charAt(1) == " " ? 2 : 1), r);
  var i, o, c, u, d = Math.abs(r), x = r < 0 ? "-" : "";
  if (n.match(/^00+$/)) return x + fi(d, n.length);
  if (n.match(/^[#?]+$/))
    return i = fi(r, 0), i === "0" && (i = ""), i.length > n.length ? i : ot(n.substr(0, n.length - i.length)) + i;
  if (o = n.match(lp)) return dg(o, d, x);
  if (n.match(/^#+0+$/)) return x + fi(d, n.length - n.indexOf("0"));
  if (o = n.match(op))
    return i = qd(r, o[1].length).replace(/^([^\.]+)$/, "$1." + ot(o[1])).replace(/\.$/, "." + ot(o[1])).replace(/\.(\d*)$/, function(_, y) {
      return "." + y + gr("0", ot(
        /*::(*/
        o[1]
      ).length - y.length);
    }), n.indexOf("0.") !== -1 ? i : i.replace(/^0\./, ".");
  if (n = n.replace(/^#+([0.])/, "$1"), o = n.match(/^(0*)\.(#*)$/))
    return x + qd(d, o[2].length).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, o[1].length ? "0." : ".");
  if (o = n.match(/^#{1,3},##0(\.?)$/)) return x + na(fi(d, 0));
  if (o = n.match(/^#,##0\.([#0]*0)$/))
    return r < 0 ? "-" + Mt(e, n, -r) : na("" + (Math.floor(r) + pg(r, o[1].length))) + "." + en(Jd(r, o[1].length), o[1].length);
  if (o = n.match(/^#,#*,#0/)) return Mt(e, n.replace(/^#,#*,/, ""), r);
  if (o = n.match(/^([0#]+)(\\?-([0#]+))+$/))
    return i = pi(Mt(e, n.replace(/[\\-]/g, ""), r)), c = 0, pi(pi(n.replace(/\\/g, "")).replace(/[0#]/g, function(_) {
      return c < i.length ? i.charAt(c++) : _ === "0" ? "0" : "";
    }));
  if (n.match(up))
    return i = Mt(e, "##########", r), "(" + i.substr(0, 3) + ") " + i.substr(3, 3) + "-" + i.substr(6);
  var p = "";
  if (o = n.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))
    return c = Math.min(
      /*::String(*/
      o[4].length,
      7
    ), u = so(d, Math.pow(10, c) - 1, !1), i = "" + x, p = Fn(
      "n",
      /*::String(*/
      o[1],
      u[1]
    ), p.charAt(p.length - 1) == " " && (p = p.substr(0, p.length - 1) + "0"), i += p + /*::String(*/
    o[2] + "/" + /*::String(*/
    o[3], p = ao(u[2], c), p.length < o[4].length && (p = ot(o[4].substr(o[4].length - p.length)) + p), i += p, i;
  if (o = n.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))
    return c = Math.min(Math.max(o[1].length, o[4].length), 7), u = so(d, Math.pow(10, c) - 1, !0), x + (u[0] || (u[1] ? "" : "0")) + " " + (u[1] ? Lc(u[1], c) + o[2] + "/" + o[3] + ao(u[2], c) : gr(" ", 2 * c + 1 + o[2].length + o[3].length));
  if (o = n.match(/^[#0?]+$/))
    return i = fi(r, 0), n.length <= i.length ? i : ot(n.substr(0, n.length - i.length)) + i;
  if (o = n.match(/^([#0?]+)\.([#0]+)$/)) {
    i = "" + r.toFixed(Math.min(o[2].length, 10)).replace(/([^0])0+$/, "$1"), c = i.indexOf(".");
    var g = n.indexOf(".") - c, w = n.length - i.length - g;
    return ot(n.substr(0, g) + i + n.substr(n.length - w));
  }
  if (o = n.match(/^00,000\.([#0]*0)$/))
    return c = Jd(r, o[1].length), r < 0 ? "-" + Mt(e, n, -r) : na(xg(r)).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function(_) {
      return "00," + (_.length < 3 ? en(0, 3 - _.length) : "") + _;
    }) + "." + en(c, o[1].length);
  switch (n) {
    case "###,##0.00":
      return Mt(e, "#,##0.00", r);
    case "###,###":
    case "##,###":
    case "#,###":
      var k = na(fi(d, 0));
      return k !== "0" ? x + k : "";
    case "###,###.00":
      return Mt(e, "###,##0.00", r).replace(/^0\./, ".");
    case "#,###.00":
      return Mt(e, "#,##0.00", r).replace(/^0\./, ".");
  }
  throw new Error("unsupported format |" + n + "|");
}
function mg(e, n, r) {
  for (var s = n.length - 1; n.charCodeAt(s - 1) === 44; ) --s;
  return Fn(e, n.substr(0, s), r / Math.pow(10, 3 * (n.length - s)));
}
function gg(e, n, r) {
  var s = n.replace(ip, ""), i = n.length - s.length;
  return Fn(e, s, r * Math.pow(10, 2 * i)) + gr("%", i);
}
function fp(e, n) {
  var r, s = e.indexOf("E") - e.indexOf(".") - 1;
  if (e.match(/^#+0.0E\+0$/)) {
    if (n == 0) return "0.0E+0";
    if (n < 0) return "-" + fp(e, -n);
    var i = e.indexOf(".");
    i === -1 && (i = e.indexOf("E"));
    var o = Math.floor(Math.log(n) * Math.LOG10E) % i;
    if (o < 0 && (o += i), r = (n / Math.pow(10, o)).toPrecision(s + 1 + (i + o) % i), !r.match(/[Ee]/)) {
      var c = Math.floor(Math.log(n) * Math.LOG10E);
      r.indexOf(".") === -1 ? r = r.charAt(0) + "." + r.substr(1) + "E+" + (c - r.length + o) : r += "E+" + (c - o), r = r.replace(/\+-/, "-");
    }
    r = r.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function(u, d, x, p) {
      return d + x + p.substr(0, (i + o) % i) + "." + p.substr(o) + "E";
    });
  } else r = n.toExponential(s);
  return e.match(/E\+00$/) && r.match(/e[+-]\d$/) && (r = r.substr(0, r.length - 1) + "0" + r.charAt(r.length - 1)), e.match(/E\-/) && r.match(/e\+/) && (r = r.replace(/e\+/, "e")), r.replace("e", "E");
}
function un(e, n, r) {
  if (e.charCodeAt(0) === 40 && !n.match(cp)) {
    var s = n.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
    return r >= 0 ? un("n", s, r) : "(" + un("n", s, -r) + ")";
  }
  if (n.charCodeAt(n.length - 1) === 44) return mg(e, n, r);
  if (n.indexOf("%") !== -1) return gg(e, n, r);
  if (n.indexOf("E") !== -1) return fp(n, r);
  if (n.charCodeAt(0) === 36) return "$" + un(e, n.substr(n.charAt(1) == " " ? 2 : 1), r);
  var i, o, c, u, d = Math.abs(r), x = r < 0 ? "-" : "";
  if (n.match(/^00+$/)) return x + en(d, n.length);
  if (n.match(/^[#?]+$/))
    return i = "" + r, r === 0 && (i = ""), i.length > n.length ? i : ot(n.substr(0, n.length - i.length)) + i;
  if (o = n.match(lp)) return hg(o, d, x);
  if (n.match(/^#+0+$/)) return x + en(d, n.length - n.indexOf("0"));
  if (o = n.match(op))
    return i = ("" + r).replace(/^([^\.]+)$/, "$1." + ot(o[1])).replace(/\.$/, "." + ot(o[1])), i = i.replace(/\.(\d*)$/, function(_, y) {
      return "." + y + gr("0", ot(o[1]).length - y.length);
    }), n.indexOf("0.") !== -1 ? i : i.replace(/^0\./, ".");
  if (n = n.replace(/^#+([0.])/, "$1"), o = n.match(/^(0*)\.(#*)$/))
    return x + ("" + d).replace(/\.(\d*[1-9])0*$/, ".$1").replace(/^(-?\d*)$/, "$1.").replace(/^0\./, o[1].length ? "0." : ".");
  if (o = n.match(/^#{1,3},##0(\.?)$/)) return x + na("" + d);
  if (o = n.match(/^#,##0\.([#0]*0)$/))
    return r < 0 ? "-" + un(e, n, -r) : na("" + r) + "." + gr("0", o[1].length);
  if (o = n.match(/^#,#*,#0/)) return un(e, n.replace(/^#,#*,/, ""), r);
  if (o = n.match(/^([0#]+)(\\?-([0#]+))+$/))
    return i = pi(un(e, n.replace(/[\\-]/g, ""), r)), c = 0, pi(pi(n.replace(/\\/g, "")).replace(/[0#]/g, function(_) {
      return c < i.length ? i.charAt(c++) : _ === "0" ? "0" : "";
    }));
  if (n.match(up))
    return i = un(e, "##########", r), "(" + i.substr(0, 3) + ") " + i.substr(3, 3) + "-" + i.substr(6);
  var p = "";
  if (o = n.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/))
    return c = Math.min(
      /*::String(*/
      o[4].length,
      7
    ), u = so(d, Math.pow(10, c) - 1, !1), i = "" + x, p = Fn(
      "n",
      /*::String(*/
      o[1],
      u[1]
    ), p.charAt(p.length - 1) == " " && (p = p.substr(0, p.length - 1) + "0"), i += p + /*::String(*/
    o[2] + "/" + /*::String(*/
    o[3], p = ao(u[2], c), p.length < o[4].length && (p = ot(o[4].substr(o[4].length - p.length)) + p), i += p, i;
  if (o = n.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/))
    return c = Math.min(Math.max(o[1].length, o[4].length), 7), u = so(d, Math.pow(10, c) - 1, !0), x + (u[0] || (u[1] ? "" : "0")) + " " + (u[1] ? Lc(u[1], c) + o[2] + "/" + o[3] + ao(u[2], c) : gr(" ", 2 * c + 1 + o[2].length + o[3].length));
  if (o = n.match(/^[#0?]+$/))
    return i = "" + r, n.length <= i.length ? i : ot(n.substr(0, n.length - i.length)) + i;
  if (o = n.match(/^([#0]+)\.([#0]+)$/)) {
    i = "" + r.toFixed(Math.min(o[2].length, 10)).replace(/([^0])0+$/, "$1"), c = i.indexOf(".");
    var g = n.indexOf(".") - c, w = n.length - i.length - g;
    return ot(n.substr(0, g) + i + n.substr(n.length - w));
  }
  if (o = n.match(/^00,000\.([#0]*0)$/))
    return r < 0 ? "-" + un(e, n, -r) : na("" + r).replace(/^\d,\d{3}$/, "0$&").replace(/^\d*$/, function(_) {
      return "00," + (_.length < 3 ? en(0, 3 - _.length) : "") + _;
    }) + "." + en(0, o[1].length);
  switch (n) {
    case "###,###":
    case "##,###":
    case "#,###":
      var k = na("" + d);
      return k !== "0" ? x + k : "";
    default:
      if (n.match(/\.[0#?]*$/)) return un(e, n.slice(0, n.lastIndexOf(".")), r) + ot(n.slice(n.lastIndexOf(".")));
  }
  throw new Error("unsupported format |" + n + "|");
}
function Fn(e, n, r) {
  return (r | 0) === r ? un(e, n, r) : Mt(e, n, r);
}
function vg(e) {
  for (var n = [], r = !1, s = 0, i = 0; s < e.length; ++s) switch (
    /*cc=*/
    e.charCodeAt(s)
  ) {
    case 34:
      r = !r;
      break;
    case 95:
    case 42:
    case 92:
      ++s;
      break;
    case 59:
      n[n.length] = e.substr(i, s - i), i = s + 1;
  }
  if (n[n.length] = e.substr(i), r === !0) throw new Error("Format |" + e + "| unterminated string ");
  return n;
}
var dp = /\[[HhMmSs\u0E0A\u0E19\u0E17]*\]/;
function wi(e) {
  for (var n = 0, r = "", s = ""; n < e.length; )
    switch (r = e.charAt(n)) {
      case "G":
        io(e, n) && (n += 6), n++;
        break;
      case '"':
        for (
          ;
          /*cc=*/
          e.charCodeAt(++n) !== 34 && n < e.length;
        )
          ;
        ++n;
        break;
      case "\\":
        n += 2;
        break;
      case "_":
        n += 2;
        break;
      case "@":
        ++n;
        break;
      case "B":
      case "b":
        if (e.charAt(n + 1) === "1" || e.charAt(n + 1) === "2") return !0;
      /* falls through */
      case "M":
      case "D":
      case "Y":
      case "H":
      case "S":
      case "E":
      /* falls through */
      case "m":
      case "d":
      case "y":
      case "h":
      case "s":
      case "e":
      case "g":
        return !0;
      case "A":
      case "a":
      case "上":
        if (e.substr(n, 3).toUpperCase() === "A/P" || e.substr(n, 5).toUpperCase() === "AM/PM" || e.substr(n, 5).toUpperCase() === "上午/下午") return !0;
        ++n;
        break;
      case "[":
        for (s = r; e.charAt(n++) !== "]" && n < e.length; ) s += e.charAt(n);
        if (s.match(dp)) return !0;
        break;
      case ".":
      /* falls through */
      case "0":
      case "#":
        for (; n < e.length && ("0#?.,E+-%".indexOf(r = e.charAt(++n)) > -1 || r == "\\" && e.charAt(n + 1) == "-" && "0#".indexOf(e.charAt(n + 2)) > -1); )
          ;
        break;
      case "?":
        for (; e.charAt(++n) === r; )
          ;
        break;
      case "*":
        ++n, (e.charAt(n) == " " || e.charAt(n) == "*") && ++n;
        break;
      case "(":
      case ")":
        ++n;
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        for (; n < e.length && "0123456789".indexOf(e.charAt(++n)) > -1; )
          ;
        break;
      case " ":
        ++n;
        break;
      default:
        ++n;
        break;
    }
  return !1;
}
function wg(e, n, r, s) {
  for (var i = [], o = "", c = 0, u = "", d = "t", x, p, g, w = "H"; c < e.length; )
    switch (u = e.charAt(c)) {
      case "G":
        if (!io(e, c)) throw new Error("unrecognized character " + u + " in " + e);
        i[i.length] = { t: "G", v: "General" }, c += 7;
        break;
      case '"':
        for (o = ""; (g = e.charCodeAt(++c)) !== 34 && c < e.length; ) o += String.fromCharCode(g);
        i[i.length] = { t: "t", v: o }, ++c;
        break;
      case "\\":
        var k = e.charAt(++c), _ = k === "(" || k === ")" ? k : "t";
        i[i.length] = { t: _, v: k }, ++c;
        break;
      case "_":
        i[i.length] = { t: "t", v: " " }, c += 2;
        break;
      case "@":
        i[i.length] = { t: "T", v: n }, ++c;
        break;
      case "B":
      case "b":
        if (e.charAt(c + 1) === "1" || e.charAt(c + 1) === "2") {
          if (x == null && (x = Ta(n, r, e.charAt(c + 1) === "2"), x == null))
            return "";
          i[i.length] = { t: "X", v: e.substr(c, 2) }, d = u, c += 2;
          break;
        }
      /* falls through */
      case "M":
      case "D":
      case "Y":
      case "H":
      case "S":
      case "E":
        u = u.toLowerCase();
      /* falls through */
      case "m":
      case "d":
      case "y":
      case "h":
      case "s":
      case "e":
      case "g":
        if (n < 0 || x == null && (x = Ta(n, r), x == null))
          return "";
        for (o = u; ++c < e.length && e.charAt(c).toLowerCase() === u; ) o += u;
        u === "m" && d.toLowerCase() === "h" && (u = "M"), u === "h" && (u = w), i[i.length] = { t: u, v: o }, d = u;
        break;
      case "A":
      case "a":
      case "上":
        var y = { t: u, v: u };
        if (x == null && (x = Ta(n, r)), e.substr(c, 3).toUpperCase() === "A/P" ? (x != null && (y.v = x.H >= 12 ? "P" : "A"), y.t = "T", w = "h", c += 3) : e.substr(c, 5).toUpperCase() === "AM/PM" ? (x != null && (y.v = x.H >= 12 ? "PM" : "AM"), y.t = "T", c += 5, w = "h") : e.substr(c, 5).toUpperCase() === "上午/下午" ? (x != null && (y.v = x.H >= 12 ? "下午" : "上午"), y.t = "T", c += 5, w = "h") : (y.t = "t", ++c), x == null && y.t === "T") return "";
        i[i.length] = y, d = u;
        break;
      case "[":
        for (o = u; e.charAt(c++) !== "]" && c < e.length; ) o += e.charAt(c);
        if (o.slice(-1) !== "]") throw 'unterminated "[" block: |' + o + "|";
        if (o.match(dp)) {
          if (x == null && (x = Ta(n, r), x == null))
            return "";
          i[i.length] = { t: "Z", v: o.toLowerCase() }, d = o.charAt(1);
        } else o.indexOf("$") > -1 && (o = (o.match(/\$([^-\[\]]*)/) || [])[1] || "$", wi(e) || (i[i.length] = { t: "t", v: o }));
        break;
      /* Numbers */
      case ".":
        if (x != null) {
          for (o = u; ++c < e.length && (u = e.charAt(c)) === "0"; ) o += u;
          i[i.length] = { t: "s", v: o };
          break;
        }
      /* falls through */
      case "0":
      case "#":
        for (o = u; ++c < e.length && "0#?.,E+-%".indexOf(u = e.charAt(c)) > -1; ) o += u;
        i[i.length] = { t: "n", v: o };
        break;
      case "?":
        for (o = u; e.charAt(++c) === u; ) o += u;
        i[i.length] = { t: u, v: o }, d = u;
        break;
      case "*":
        ++c, (e.charAt(c) == " " || e.charAt(c) == "*") && ++c;
        break;
      // **
      case "(":
      case ")":
        i[i.length] = { t: s === 1 ? "t" : u, v: u }, ++c;
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        for (o = u; c < e.length && "0123456789".indexOf(e.charAt(++c)) > -1; ) o += e.charAt(c);
        i[i.length] = { t: "D", v: o };
        break;
      case " ":
        i[i.length] = { t: u, v: u }, ++c;
        break;
      case "$":
        i[i.length] = { t: "t", v: "$" }, ++c;
        break;
      default:
        if (",$-+/():!^&'~{}<>=€acfijklopqrtuvwxzP".indexOf(u) === -1) throw new Error("unrecognized character " + u + " in " + e);
        i[i.length] = { t: "t", v: u }, ++c;
        break;
    }
  var E = 0, A = 0, O;
  for (c = i.length - 1, d = "t"; c >= 0; --c)
    switch (i[c].t) {
      case "h":
      case "H":
        i[c].t = w, d = "h", E < 1 && (E = 1);
        break;
      case "s":
        (O = i[c].v.match(/\.0+$/)) && (A = Math.max(A, O[0].length - 1)), E < 3 && (E = 3);
      /* falls through */
      case "d":
      case "y":
      case "M":
      case "e":
        d = i[c].t;
        break;
      case "m":
        d === "s" && (i[c].t = "M", E < 2 && (E = 2));
        break;
      case "X":
        break;
      case "Z":
        E < 1 && i[c].v.match(/[Hh]/) && (E = 1), E < 2 && i[c].v.match(/[Mm]/) && (E = 2), E < 3 && i[c].v.match(/[Ss]/) && (E = 3);
    }
  switch (E) {
    case 0:
      break;
    case 1:
      x.u >= 0.5 && (x.u = 0, ++x.S), x.S >= 60 && (x.S = 0, ++x.M), x.M >= 60 && (x.M = 0, ++x.H);
      break;
    case 2:
      x.u >= 0.5 && (x.u = 0, ++x.S), x.S >= 60 && (x.S = 0, ++x.M);
      break;
  }
  var N = "", V;
  for (c = 0; c < i.length; ++c)
    switch (i[c].t) {
      case "t":
      case "T":
      case " ":
      case "D":
        break;
      case "X":
        i[c].v = "", i[c].t = ";";
        break;
      case "d":
      case "m":
      case "y":
      case "h":
      case "H":
      case "M":
      case "s":
      case "e":
      case "b":
      case "Z":
        i[c].v = cg(i[c].t.charCodeAt(0), i[c].v, x, A), i[c].t = "t";
        break;
      case "n":
      case "?":
        for (V = c + 1; i[V] != null && ((u = i[V].t) === "?" || u === "D" || (u === " " || u === "t") && i[V + 1] != null && (i[V + 1].t === "?" || i[V + 1].t === "t" && i[V + 1].v === "/") || i[c].t === "(" && (u === " " || u === "n" || u === ")") || u === "t" && (i[V].v === "/" || i[V].v === " " && i[V + 1] != null && i[V + 1].t == "?")); )
          i[c].v += i[V].v, i[V] = { v: "", t: ";" }, ++V;
        N += i[c].v, c = V - 1;
        break;
      case "G":
        i[c].t = "t", i[c].v = Ra(n, r);
        break;
    }
  var J = "", j, C;
  if (N.length > 0) {
    N.charCodeAt(0) == 40 ? (j = n < 0 && N.charCodeAt(0) === 45 ? -n : n, C = Fn("n", N, j)) : (j = n < 0 && s > 1 ? -n : n, C = Fn("n", N, j), j < 0 && i[0] && i[0].t == "t" && (C = C.substr(1), i[0].v = "-" + i[0].v)), V = C.length - 1;
    var G = i.length;
    for (c = 0; c < i.length; ++c) if (i[c] != null && i[c].t != "t" && i[c].v.indexOf(".") > -1) {
      G = c;
      break;
    }
    var B = i.length;
    if (G === i.length && C.indexOf("E") === -1) {
      for (c = i.length - 1; c >= 0; --c)
        i[c] == null || "n?".indexOf(i[c].t) === -1 || (V >= i[c].v.length - 1 ? (V -= i[c].v.length, i[c].v = C.substr(V + 1, i[c].v.length)) : V < 0 ? i[c].v = "" : (i[c].v = C.substr(0, V + 1), V = -1), i[c].t = "t", B = c);
      V >= 0 && B < i.length && (i[B].v = C.substr(0, V + 1) + i[B].v);
    } else if (G !== i.length && C.indexOf("E") === -1) {
      for (V = C.indexOf(".") - 1, c = G; c >= 0; --c)
        if (!(i[c] == null || "n?".indexOf(i[c].t) === -1)) {
          for (p = i[c].v.indexOf(".") > -1 && c === G ? i[c].v.indexOf(".") - 1 : i[c].v.length - 1, J = i[c].v.substr(p + 1); p >= 0; --p)
            V >= 0 && (i[c].v.charAt(p) === "0" || i[c].v.charAt(p) === "#") && (J = C.charAt(V--) + J);
          i[c].v = J, i[c].t = "t", B = c;
        }
      for (V >= 0 && B < i.length && (i[B].v = C.substr(0, V + 1) + i[B].v), V = C.indexOf(".") + 1, c = G; c < i.length; ++c)
        if (!(i[c] == null || "n?(".indexOf(i[c].t) === -1 && c !== G)) {
          for (p = i[c].v.indexOf(".") > -1 && c === G ? i[c].v.indexOf(".") + 1 : 0, J = i[c].v.substr(0, p); p < i[c].v.length; ++p)
            V < C.length && (J += C.charAt(V++));
          i[c].v = J, i[c].t = "t", B = c;
        }
    }
  }
  for (c = 0; c < i.length; ++c) i[c] != null && "n?".indexOf(i[c].t) > -1 && (j = s > 1 && n < 0 && c > 0 && i[c - 1].v === "-" ? -n : n, i[c].v = Fn(i[c].t, i[c].v, j), i[c].t = "t");
  var le = "";
  for (c = 0; c !== i.length; ++c) i[c] != null && (le += i[c].v);
  return le;
}
var Zd = /\[(=|>[=]?|<[>=]?)(-?\d+(?:\.\d*)?)\]/;
function eh(e, n) {
  if (n == null) return !1;
  var r = parseFloat(n[2]);
  switch (n[1]) {
    case "=":
      if (e == r) return !0;
      break;
    case ">":
      if (e > r) return !0;
      break;
    case "<":
      if (e < r) return !0;
      break;
    case "<>":
      if (e != r) return !0;
      break;
    case ">=":
      if (e >= r) return !0;
      break;
    case "<=":
      if (e <= r) return !0;
      break;
  }
  return !1;
}
function yg(e, n) {
  var r = vg(e), s = r.length, i = r[s - 1].indexOf("@");
  if (s < 4 && i > -1 && --s, r.length > 4) throw new Error("cannot find right format for |" + r.join("|") + "|");
  if (typeof n != "number") return [4, r.length === 4 || i > -1 ? r[r.length - 1] : "@"];
  switch (r.length) {
    case 1:
      r = i > -1 ? ["General", "General", "General", r[0]] : [r[0], r[0], r[0], "@"];
      break;
    case 2:
      r = i > -1 ? [r[0], r[0], r[0], r[1]] : [r[0], r[1], r[0], "@"];
      break;
    case 3:
      r = i > -1 ? [r[0], r[1], r[0], r[2]] : [r[0], r[1], r[2], "@"];
      break;
  }
  var o = n > 0 ? r[0] : n < 0 ? r[1] : r[2];
  if (r[0].indexOf("[") === -1 && r[1].indexOf("[") === -1) return [s, o];
  if (r[0].match(/\[[=<>]/) != null || r[1].match(/\[[=<>]/) != null) {
    var c = r[0].match(Zd), u = r[1].match(Zd);
    return eh(n, c) ? [s, r[0]] : eh(n, u) ? [s, r[1]] : [s, r[c != null && u != null ? 2 : 1]];
  }
  return [s, o];
}
function Ut(e, n, r) {
  r == null && (r = {});
  var s = "";
  switch (typeof e) {
    case "string":
      e == "m/d/yy" && r.dateNF ? s = r.dateNF : s = e;
      break;
    case "number":
      e == 14 && r.dateNF ? s = r.dateNF : s = (r.table != null ? r.table : $e)[e], s == null && (s = r.table && r.table[Qd[e]] || $e[Qd[e]]), s == null && (s = tg[e] || "General");
      break;
  }
  if (io(s, 0)) return Ra(n, r);
  n instanceof Date && (n = ap(n, r.date1904));
  var i = yg(s, n);
  if (io(i[1])) return Ra(n, r);
  if (n === !0) n = "TRUE";
  else if (n === !1) n = "FALSE";
  else if (n === "" || n == null) return "";
  return wg(i[1], n, r, i[0]);
}
function Fa(e, n) {
  if (typeof n != "number") {
    n = +n || -1;
    for (var r = 0; r < 392; ++r) {
      if ($e[r] == null) {
        n < 0 && (n = r);
        continue;
      }
      if ($e[r] == e) {
        n = r;
        break;
      }
    }
    n < 0 && (n = 391);
  }
  return $e[n] = e, n;
}
function hp() {
  $e = rg();
}
var _g = {
  5: '"$"#,##0_);\\("$"#,##0\\)',
  6: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  7: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  8: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  23: "General",
  24: "General",
  25: "General",
  26: "General",
  27: "m/d/yy",
  28: "m/d/yy",
  29: "m/d/yy",
  30: "m/d/yy",
  31: "m/d/yy",
  32: "h:mm:ss",
  33: "h:mm:ss",
  34: "h:mm:ss",
  35: "h:mm:ss",
  36: "m/d/yy",
  41: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)',
  42: '_("$"* #,##0_);_("$"* (#,##0);_("$"* "-"_);_(@_)',
  43: '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)',
  44: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
  50: "m/d/yy",
  51: "m/d/yy",
  52: "m/d/yy",
  53: "m/d/yy",
  54: "m/d/yy",
  55: "m/d/yy",
  56: "m/d/yy",
  57: "m/d/yy",
  58: "m/d/yy",
  59: "0",
  60: "0.00",
  61: "#,##0",
  62: "#,##0.00",
  63: '"$"#,##0_);\\("$"#,##0\\)',
  64: '"$"#,##0_);[Red]\\("$"#,##0\\)',
  65: '"$"#,##0.00_);\\("$"#,##0.00\\)',
  66: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
  67: "0%",
  68: "0.00%",
  69: "# ?/?",
  70: "# ??/??",
  71: "m/d/yy",
  72: "m/d/yy",
  73: "d-mmm-yy",
  74: "d-mmm",
  75: "mmm-yy",
  76: "h:mm",
  77: "h:mm:ss",
  78: "m/d/yy h:mm",
  79: "mm:ss",
  80: "[h]:mm:ss",
  81: "mmss.0"
}, pp = /[dD]+|[mM]+|[yYeE]+|[Hh]+|[Ss]+/g;
function kg(e) {
  var n = typeof e == "number" ? $e[e] : e;
  return n = n.replace(pp, "(\\d+)"), new RegExp("^" + n + "$");
}
function Eg(e, n, r) {
  var s = -1, i = -1, o = -1, c = -1, u = -1, d = -1;
  (n.match(pp) || []).forEach(function(g, w) {
    var k = parseInt(r[w + 1], 10);
    switch (g.toLowerCase().charAt(0)) {
      case "y":
        s = k;
        break;
      case "d":
        o = k;
        break;
      case "h":
        c = k;
        break;
      case "s":
        d = k;
        break;
      case "m":
        c >= 0 ? u = k : i = k;
        break;
    }
  }), d >= 0 && u == -1 && i >= 0 && (u = i, i = -1);
  var x = ("" + (s >= 0 ? s : (/* @__PURE__ */ new Date()).getFullYear())).slice(-4) + "-" + ("00" + (i >= 1 ? i : 1)).slice(-2) + "-" + ("00" + (o >= 1 ? o : 1)).slice(-2);
  x.length == 7 && (x = "0" + x), x.length == 8 && (x = "20" + x);
  var p = ("00" + (c >= 0 ? c : 0)).slice(-2) + ":" + ("00" + (u >= 0 ? u : 0)).slice(-2) + ":" + ("00" + (d >= 0 ? d : 0)).slice(-2);
  return c == -1 && u == -1 && d == -1 ? x : s == -1 && i == -1 && o == -1 ? p : x + "T" + p;
}
var Sg = /* @__PURE__ */ (function() {
  var e = {};
  e.version = "1.2.0";
  function n() {
    for (var C = 0, G = new Array(256), B = 0; B != 256; ++B)
      C = B, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, C = C & 1 ? -306674912 ^ C >>> 1 : C >>> 1, G[B] = C;
    return typeof Int32Array < "u" ? new Int32Array(G) : G;
  }
  var r = n();
  function s(C) {
    var G = 0, B = 0, le = 0, re = typeof Int32Array < "u" ? new Int32Array(4096) : new Array(4096);
    for (le = 0; le != 256; ++le) re[le] = C[le];
    for (le = 0; le != 256; ++le)
      for (B = C[le], G = 256 + le; G < 4096; G += 256) B = re[G] = B >>> 8 ^ C[B & 255];
    var Q = [];
    for (le = 1; le != 16; ++le) Q[le - 1] = typeof Int32Array < "u" ? re.subarray(le * 256, le * 256 + 256) : re.slice(le * 256, le * 256 + 256);
    return Q;
  }
  var i = s(r), o = i[0], c = i[1], u = i[2], d = i[3], x = i[4], p = i[5], g = i[6], w = i[7], k = i[8], _ = i[9], y = i[10], E = i[11], A = i[12], O = i[13], N = i[14];
  function V(C, G) {
    for (var B = G ^ -1, le = 0, re = C.length; le < re; ) B = B >>> 8 ^ r[(B ^ C.charCodeAt(le++)) & 255];
    return ~B;
  }
  function J(C, G) {
    for (var B = G ^ -1, le = C.length - 15, re = 0; re < le; ) B = N[C[re++] ^ B & 255] ^ O[C[re++] ^ B >> 8 & 255] ^ A[C[re++] ^ B >> 16 & 255] ^ E[C[re++] ^ B >>> 24] ^ y[C[re++]] ^ _[C[re++]] ^ k[C[re++]] ^ w[C[re++]] ^ g[C[re++]] ^ p[C[re++]] ^ x[C[re++]] ^ d[C[re++]] ^ u[C[re++]] ^ c[C[re++]] ^ o[C[re++]] ^ r[C[re++]];
    for (le += 15; re < le; ) B = B >>> 8 ^ r[(B ^ C[re++]) & 255];
    return ~B;
  }
  function j(C, G) {
    for (var B = G ^ -1, le = 0, re = C.length, Q = 0, pe = 0; le < re; )
      Q = C.charCodeAt(le++), Q < 128 ? B = B >>> 8 ^ r[(B ^ Q) & 255] : Q < 2048 ? (B = B >>> 8 ^ r[(B ^ (192 | Q >> 6 & 31)) & 255], B = B >>> 8 ^ r[(B ^ (128 | Q & 63)) & 255]) : Q >= 55296 && Q < 57344 ? (Q = (Q & 1023) + 64, pe = C.charCodeAt(le++) & 1023, B = B >>> 8 ^ r[(B ^ (240 | Q >> 8 & 7)) & 255], B = B >>> 8 ^ r[(B ^ (128 | Q >> 2 & 63)) & 255], B = B >>> 8 ^ r[(B ^ (128 | pe >> 6 & 15 | (Q & 3) << 4)) & 255], B = B >>> 8 ^ r[(B ^ (128 | pe & 63)) & 255]) : (B = B >>> 8 ^ r[(B ^ (224 | Q >> 12 & 15)) & 255], B = B >>> 8 ^ r[(B ^ (128 | Q >> 6 & 63)) & 255], B = B >>> 8 ^ r[(B ^ (128 | Q & 63)) & 255]);
    return ~B;
  }
  return e.table = r, e.bstr = V, e.buf = J, e.str = j, e;
})(), qe = /* @__PURE__ */ (function() {
  var n = {};
  n.version = "1.2.1";
  function r(T, b) {
    for (var R = T.split("/"), D = b.split("/"), I = 0, L = 0, ie = Math.min(R.length, D.length); I < ie; ++I) {
      if (L = R[I].length - D[I].length) return L;
      if (R[I] != D[I]) return R[I] < D[I] ? -1 : 1;
    }
    return R.length - D.length;
  }
  function s(T) {
    if (T.charAt(T.length - 1) == "/") return T.slice(0, -1).indexOf("/") === -1 ? T : s(T.slice(0, -1));
    var b = T.lastIndexOf("/");
    return b === -1 ? T : T.slice(0, b + 1);
  }
  function i(T) {
    if (T.charAt(T.length - 1) == "/") return i(T.slice(0, -1));
    var b = T.lastIndexOf("/");
    return b === -1 ? T : T.slice(b + 1);
  }
  function o(T, b) {
    typeof b == "string" && (b = new Date(b));
    var R = b.getHours();
    R = R << 6 | b.getMinutes(), R = R << 5 | b.getSeconds() >>> 1, T.write_shift(2, R);
    var D = b.getFullYear() - 1980;
    D = D << 4 | b.getMonth() + 1, D = D << 5 | b.getDate(), T.write_shift(2, D);
  }
  function c(T) {
    var b = T.read_shift(2) & 65535, R = T.read_shift(2) & 65535, D = /* @__PURE__ */ new Date(), I = R & 31;
    R >>>= 5;
    var L = R & 15;
    R >>>= 4, D.setMilliseconds(0), D.setFullYear(R + 1980), D.setMonth(L - 1), D.setDate(I);
    var ie = b & 31;
    b >>>= 5;
    var de = b & 63;
    return b >>>= 6, D.setHours(b), D.setMinutes(de), D.setSeconds(ie << 1), D;
  }
  function u(T) {
    Hr(T, 0);
    for (var b = (
      /*::(*/
      {}
    ), R = 0; T.l <= T.length - 4; ) {
      var D = T.read_shift(2), I = T.read_shift(2), L = T.l + I, ie = {};
      switch (D) {
        /* UNIX-style Timestamps */
        case 21589:
          R = T.read_shift(1), R & 1 && (ie.mtime = T.read_shift(4)), I > 5 && (R & 2 && (ie.atime = T.read_shift(4)), R & 4 && (ie.ctime = T.read_shift(4))), ie.mtime && (ie.mt = new Date(ie.mtime * 1e3));
          break;
      }
      T.l = L, b[D] = ie;
    }
    return b;
  }
  var d;
  function x() {
    return d || (d = {});
  }
  function p(T, b) {
    if (T[0] == 80 && T[1] == 75) return za(T, b);
    if ((T[0] | 32) == 109 && (T[1] | 32) == 105) return Ws(T, b);
    if (T.length < 512) throw new Error("CFB file size " + T.length + " < 512");
    var R = 3, D = 512, I = 0, L = 0, ie = 0, de = 0, ae = 0, se = [], oe = (
      /*::(*/
      T.slice(0, 512)
    );
    Hr(oe, 0);
    var _e = g(oe);
    switch (R = _e[0], R) {
      case 3:
        D = 512;
        break;
      case 4:
        D = 4096;
        break;
      case 0:
        if (_e[1] == 0) return za(T, b);
      /* falls through */
      default:
        throw new Error("Major Version: Expected 3 or 4 saw " + R);
    }
    D !== 512 && (oe = /*::(*/
    T.slice(0, D), Hr(
      oe,
      28
      /* blob.l */
    ));
    var Ne = T.slice(0, D);
    w(oe, R);
    var De = oe.read_shift(4, "i");
    if (R === 3 && De !== 0) throw new Error("# Directory Sectors: Expected 0 saw " + De);
    oe.l += 4, ie = oe.read_shift(4, "i"), oe.l += 4, oe.chk("00100000", "Mini Stream Cutoff Size: "), de = oe.read_shift(4, "i"), I = oe.read_shift(4, "i"), ae = oe.read_shift(4, "i"), L = oe.read_shift(4, "i");
    for (var Se = -1, Ee = 0; Ee < 109 && (Se = oe.read_shift(4, "i"), !(Se < 0)); ++Ee)
      se[Ee] = Se;
    var He = k(T, D);
    E(ae, L, He, D, se);
    var ar = O(He, ie, se, D);
    ar[ie].name = "!Directory", I > 0 && de !== pe && (ar[de].name = "!MiniFAT"), ar[se[0]].name = "!FAT", ar.fat_addrs = se, ar.ssz = D;
    var ir = {}, wr = [], fa = [], bn = [];
    N(ie, ar, He, wr, I, ir, fa, de), _(fa, bn, wr), wr.shift();
    var nn = {
      FileIndex: fa,
      FullPaths: bn
    };
    return b && b.raw && (nn.raw = { header: Ne, sectors: He }), nn;
  }
  function g(T) {
    if (T[T.l] == 80 && T[T.l + 1] == 75) return [0, 0];
    T.chk(Ce, "Header Signature: "), T.l += 16;
    var b = T.read_shift(2, "u");
    return [T.read_shift(2, "u"), b];
  }
  function w(T, b) {
    var R = 9;
    switch (T.l += 2, R = T.read_shift(2)) {
      case 9:
        if (b != 3) throw new Error("Sector Shift: Expected 9 saw " + R);
        break;
      case 12:
        if (b != 4) throw new Error("Sector Shift: Expected 12 saw " + R);
        break;
      default:
        throw new Error("Sector Shift: Expected 9 or 12 saw " + R);
    }
    T.chk("0600", "Mini Sector Shift: "), T.chk("000000000000", "Reserved: ");
  }
  function k(T, b) {
    for (var R = Math.ceil(T.length / b) - 1, D = [], I = 1; I < R; ++I) D[I - 1] = T.slice(I * b, (I + 1) * b);
    return D[R - 1] = T.slice(R * b), D;
  }
  function _(T, b, R) {
    for (var D = 0, I = 0, L = 0, ie = 0, de = 0, ae = R.length, se = [], oe = []; D < ae; ++D)
      se[D] = oe[D] = D, b[D] = R[D];
    for (; de < oe.length; ++de)
      D = oe[de], I = T[D].L, L = T[D].R, ie = T[D].C, se[D] === D && (I !== -1 && se[I] !== I && (se[D] = se[I]), L !== -1 && se[L] !== L && (se[D] = se[L])), ie !== -1 && (se[ie] = D), I !== -1 && D != se[D] && (se[I] = se[D], oe.lastIndexOf(I) < de && oe.push(I)), L !== -1 && D != se[D] && (se[L] = se[D], oe.lastIndexOf(L) < de && oe.push(L));
    for (D = 1; D < ae; ++D) se[D] === D && (L !== -1 && se[L] !== L ? se[D] = se[L] : I !== -1 && se[I] !== I && (se[D] = se[I]));
    for (D = 1; D < ae; ++D)
      if (T[D].type !== 0) {
        if (de = D, de != se[de]) do
          de = se[de], b[D] = b[de] + "/" + b[D];
        while (de !== 0 && se[de] !== -1 && de != se[de]);
        se[D] = -1;
      }
    for (b[0] += "/", D = 1; D < ae; ++D)
      T[D].type !== 2 && (b[D] += "/");
  }
  function y(T, b, R) {
    for (var D = T.start, I = T.size, L = [], ie = D; R && I > 0 && ie >= 0; )
      L.push(b.slice(ie * Q, ie * Q + Q)), I -= Q, ie = Sa(R, ie * 4);
    return L.length === 0 ? Dr(0) : ra(L).slice(0, T.size);
  }
  function E(T, b, R, D, I) {
    var L = pe;
    if (T === pe) {
      if (b !== 0) throw new Error("DIFAT chain shorter than expected");
    } else if (T !== -1) {
      var ie = R[T], de = (D >>> 2) - 1;
      if (!ie) return;
      for (var ae = 0; ae < de && (L = Sa(ie, ae * 4)) !== pe; ++ae)
        I.push(L);
      E(Sa(ie, D - 4), b - 1, R, D, I);
    }
  }
  function A(T, b, R, D, I) {
    var L = [], ie = [];
    I || (I = []);
    var de = D - 1, ae = 0, se = 0;
    for (ae = b; ae >= 0; ) {
      I[ae] = !0, L[L.length] = ae, ie.push(T[ae]);
      var oe = R[Math.floor(ae * 4 / D)];
      if (se = ae * 4 & de, D < 4 + se) throw new Error("FAT boundary crossed: " + ae + " 4 " + D);
      if (!T[oe]) break;
      ae = Sa(T[oe], se);
    }
    return { nodes: L, data: uh([ie]) };
  }
  function O(T, b, R, D) {
    var I = T.length, L = [], ie = [], de = [], ae = [], se = D - 1, oe = 0, _e = 0, Ne = 0, De = 0;
    for (oe = 0; oe < I; ++oe)
      if (de = [], Ne = oe + b, Ne >= I && (Ne -= I), !ie[Ne]) {
        ae = [];
        var Se = [];
        for (_e = Ne; _e >= 0; ) {
          Se[_e] = !0, ie[_e] = !0, de[de.length] = _e, ae.push(T[_e]);
          var Ee = R[Math.floor(_e * 4 / D)];
          if (De = _e * 4 & se, D < 4 + De) throw new Error("FAT boundary crossed: " + _e + " 4 " + D);
          if (!T[Ee] || (_e = Sa(T[Ee], De), Se[_e])) break;
        }
        L[Ne] = { nodes: de, data: uh([ae]) };
      }
    return L;
  }
  function N(T, b, R, D, I, L, ie, de) {
    for (var ae = 0, se = D.length ? 2 : 0, oe = b[T].data, _e = 0, Ne = 0, De; _e < oe.length; _e += 128) {
      var Se = (
        /*::(*/
        oe.slice(_e, _e + 128)
      );
      Hr(Se, 64), Ne = Se.read_shift(2), De = Hc(Se, 0, Ne - se), D.push(De);
      var Ee = {
        name: De,
        type: Se.read_shift(1),
        color: Se.read_shift(1),
        L: Se.read_shift(4, "i"),
        R: Se.read_shift(4, "i"),
        C: Se.read_shift(4, "i"),
        clsid: Se.read_shift(16),
        state: Se.read_shift(4, "i"),
        start: 0,
        size: 0
      }, He = Se.read_shift(2) + Se.read_shift(2) + Se.read_shift(2) + Se.read_shift(2);
      He !== 0 && (Ee.ct = V(Se, Se.l - 8));
      var ar = Se.read_shift(2) + Se.read_shift(2) + Se.read_shift(2) + Se.read_shift(2);
      ar !== 0 && (Ee.mt = V(Se, Se.l - 8)), Ee.start = Se.read_shift(4, "i"), Ee.size = Se.read_shift(4, "i"), Ee.size < 0 && Ee.start < 0 && (Ee.size = Ee.type = 0, Ee.start = pe, Ee.name = ""), Ee.type === 5 ? (ae = Ee.start, I > 0 && ae !== pe && (b[ae].name = "!StreamData")) : Ee.size >= 4096 ? (Ee.storage = "fat", b[Ee.start] === void 0 && (b[Ee.start] = A(R, Ee.start, b.fat_addrs, b.ssz)), b[Ee.start].name = Ee.name, Ee.content = b[Ee.start].data.slice(0, Ee.size)) : (Ee.storage = "minifat", Ee.size < 0 ? Ee.size = 0 : ae !== pe && Ee.start !== pe && b[ae] && (Ee.content = y(Ee, b[ae].data, (b[de] || {}).data))), Ee.content && Hr(Ee.content, 0), L[De] = Ee, ie.push(Ee);
    }
  }
  function V(T, b) {
    return new Date((Ct(T, b + 4) / 1e7 * Math.pow(2, 32) + Ct(T, b) / 1e7 - 11644473600) * 1e3);
  }
  function J(T, b) {
    return x(), p(d.readFileSync(T), b);
  }
  function j(T, b) {
    var R = b && b.type;
    switch (R || Qe && Buffer.isBuffer(T) && (R = "buffer"), R || "base64") {
      case "file":
        return J(T, b);
      case "base64":
        return p(Jt(Ft(T)), b);
      case "binary":
        return p(Jt(T), b);
    }
    return p(
      /*::typeof blob == 'string' ? new Buffer(blob, 'utf-8') : */
      T,
      b
    );
  }
  function C(T, b) {
    var R = b || {}, D = R.root || "Root Entry";
    if (T.FullPaths || (T.FullPaths = []), T.FileIndex || (T.FileIndex = []), T.FullPaths.length !== T.FileIndex.length) throw new Error("inconsistent CFB structure");
    T.FullPaths.length === 0 && (T.FullPaths[0] = D + "/", T.FileIndex[0] = { name: D, type: 5 }), R.CLSID && (T.FileIndex[0].clsid = R.CLSID), G(T);
  }
  function G(T) {
    var b = "Sh33tJ5";
    if (!qe.find(T, "/" + b)) {
      var R = Dr(4);
      R[0] = 55, R[1] = R[3] = 50, R[2] = 54, T.FileIndex.push({ name: b, type: 2, content: R, size: 4, L: 69, R: 69, C: 69 }), T.FullPaths.push(T.FullPaths[0] + b), B(T);
    }
  }
  function B(T, b) {
    C(T);
    for (var R = !1, D = !1, I = T.FullPaths.length - 1; I >= 0; --I) {
      var L = T.FileIndex[I];
      switch (L.type) {
        case 0:
          D ? R = !0 : (T.FileIndex.pop(), T.FullPaths.pop());
          break;
        case 1:
        case 2:
        case 5:
          D = !0, isNaN(L.R * L.L * L.C) && (R = !0), L.R > -1 && L.L > -1 && L.R == L.L && (R = !0);
          break;
        default:
          R = !0;
          break;
      }
    }
    if (!(!R && !b)) {
      var ie = new Date(1987, 1, 19), de = 0, ae = Object.create ? /* @__PURE__ */ Object.create(null) : {}, se = [];
      for (I = 0; I < T.FullPaths.length; ++I)
        ae[T.FullPaths[I]] = !0, T.FileIndex[I].type !== 0 && se.push([T.FullPaths[I], T.FileIndex[I]]);
      for (I = 0; I < se.length; ++I) {
        var oe = s(se[I][0]);
        D = ae[oe], D || (se.push([oe, {
          name: i(oe).replace("/", ""),
          type: 1,
          clsid: we,
          ct: ie,
          mt: ie,
          content: null
        }]), ae[oe] = !0);
      }
      for (se.sort(function(De, Se) {
        return r(De[0], Se[0]);
      }), T.FullPaths = [], T.FileIndex = [], I = 0; I < se.length; ++I)
        T.FullPaths[I] = se[I][0], T.FileIndex[I] = se[I][1];
      for (I = 0; I < se.length; ++I) {
        var _e = T.FileIndex[I], Ne = T.FullPaths[I];
        if (_e.name = i(Ne).replace("/", ""), _e.L = _e.R = _e.C = -(_e.color = 1), _e.size = _e.content ? _e.content.length : 0, _e.start = 0, _e.clsid = _e.clsid || we, I === 0)
          _e.C = se.length > 1 ? 1 : -1, _e.size = 0, _e.type = 5;
        else if (Ne.slice(-1) == "/") {
          for (de = I + 1; de < se.length && s(T.FullPaths[de]) != Ne; ++de) ;
          for (_e.C = de >= se.length ? -1 : de, de = I + 1; de < se.length && s(T.FullPaths[de]) != s(Ne); ++de) ;
          _e.R = de >= se.length ? -1 : de, _e.type = 1;
        } else
          s(T.FullPaths[I + 1] || "") == s(Ne) && (_e.R = I + 1), _e.type = 2;
      }
    }
  }
  function le(T, b) {
    var R = b || {};
    if (R.fileType == "mad") return ca(T, R);
    switch (B(T), R.fileType) {
      case "zip":
        return Pn(T, R);
    }
    var D = (function(De) {
      for (var Se = 0, Ee = 0, He = 0; He < De.FileIndex.length; ++He) {
        var ar = De.FileIndex[He];
        if (ar.content) {
          var ir = ar.content.length;
          ir > 0 && (ir < 4096 ? Se += ir + 63 >> 6 : Ee += ir + 511 >> 9);
        }
      }
      for (var wr = De.FullPaths.length + 3 >> 2, fa = Se + 7 >> 3, bn = Se + 127 >> 7, nn = fa + Ee + wr + bn, br = nn + 127 >> 7, Ci = br <= 109 ? 0 : Math.ceil((br - 109) / 127); nn + br + Ci + 127 >> 7 > br; ) Ci = ++br <= 109 ? 0 : Math.ceil((br - 109) / 127);
      var yr = [1, Ci, br, bn, wr, Ee, Se, 0];
      return De.FileIndex[0].size = Se << 6, yr[7] = (De.FileIndex[0].start = yr[0] + yr[1] + yr[2] + yr[3] + yr[4] + yr[5]) + (yr[6] + 7 >> 3), yr;
    })(T), I = Dr(D[7] << 9), L = 0, ie = 0;
    {
      for (L = 0; L < 8; ++L) I.write_shift(1, xe[L]);
      for (L = 0; L < 8; ++L) I.write_shift(2, 0);
      for (I.write_shift(2, 62), I.write_shift(2, 3), I.write_shift(2, 65534), I.write_shift(2, 9), I.write_shift(2, 6), L = 0; L < 3; ++L) I.write_shift(2, 0);
      for (I.write_shift(4, 0), I.write_shift(4, D[2]), I.write_shift(4, D[0] + D[1] + D[2] + D[3] - 1), I.write_shift(4, 0), I.write_shift(4, 4096), I.write_shift(4, D[3] ? D[0] + D[1] + D[2] - 1 : pe), I.write_shift(4, D[3]), I.write_shift(-4, D[1] ? D[0] - 1 : pe), I.write_shift(4, D[1]), L = 0; L < 109; ++L) I.write_shift(-4, L < D[2] ? D[1] + L : -1);
    }
    if (D[1])
      for (ie = 0; ie < D[1]; ++ie) {
        for (; L < 236 + ie * 127; ++L) I.write_shift(-4, L < D[2] ? D[1] + L : -1);
        I.write_shift(-4, ie === D[1] - 1 ? pe : ie + 1);
      }
    var de = function(De) {
      for (ie += De; L < ie - 1; ++L) I.write_shift(-4, L + 1);
      De && (++L, I.write_shift(-4, pe));
    };
    for (ie = L = 0, ie += D[1]; L < ie; ++L) I.write_shift(-4, ye.DIFSECT);
    for (ie += D[2]; L < ie; ++L) I.write_shift(-4, ye.FATSECT);
    de(D[3]), de(D[4]);
    for (var ae = 0, se = 0, oe = T.FileIndex[0]; ae < T.FileIndex.length; ++ae)
      oe = T.FileIndex[ae], oe.content && (se = oe.content.length, !(se < 4096) && (oe.start = ie, de(se + 511 >> 9)));
    for (de(D[6] + 7 >> 3); I.l & 511; ) I.write_shift(-4, ye.ENDOFCHAIN);
    for (ie = L = 0, ae = 0; ae < T.FileIndex.length; ++ae)
      oe = T.FileIndex[ae], oe.content && (se = oe.content.length, !(!se || se >= 4096) && (oe.start = ie, de(se + 63 >> 6)));
    for (; I.l & 511; ) I.write_shift(-4, ye.ENDOFCHAIN);
    for (L = 0; L < D[4] << 2; ++L) {
      var _e = T.FullPaths[L];
      if (!_e || _e.length === 0) {
        for (ae = 0; ae < 17; ++ae) I.write_shift(4, 0);
        for (ae = 0; ae < 3; ++ae) I.write_shift(4, -1);
        for (ae = 0; ae < 12; ++ae) I.write_shift(4, 0);
        continue;
      }
      oe = T.FileIndex[L], L === 0 && (oe.start = oe.size ? oe.start - 1 : pe);
      var Ne = L === 0 && R.root || oe.name;
      if (se = 2 * (Ne.length + 1), I.write_shift(64, Ne, "utf16le"), I.write_shift(2, se), I.write_shift(1, oe.type), I.write_shift(1, oe.color), I.write_shift(-4, oe.L), I.write_shift(-4, oe.R), I.write_shift(-4, oe.C), oe.clsid) I.write_shift(16, oe.clsid, "hex");
      else for (ae = 0; ae < 4; ++ae) I.write_shift(4, 0);
      I.write_shift(4, oe.state || 0), I.write_shift(4, 0), I.write_shift(4, 0), I.write_shift(4, 0), I.write_shift(4, 0), I.write_shift(4, oe.start), I.write_shift(4, oe.size), I.write_shift(4, 0);
    }
    for (L = 1; L < T.FileIndex.length; ++L)
      if (oe = T.FileIndex[L], oe.size >= 4096)
        if (I.l = oe.start + 1 << 9, Qe && Buffer.isBuffer(oe.content))
          oe.content.copy(I, I.l, 0, oe.size), I.l += oe.size + 511 & -512;
        else {
          for (ae = 0; ae < oe.size; ++ae) I.write_shift(1, oe.content[ae]);
          for (; ae & 511; ++ae) I.write_shift(1, 0);
        }
    for (L = 1; L < T.FileIndex.length; ++L)
      if (oe = T.FileIndex[L], oe.size > 0 && oe.size < 4096)
        if (Qe && Buffer.isBuffer(oe.content))
          oe.content.copy(I, I.l, 0, oe.size), I.l += oe.size + 63 & -64;
        else {
          for (ae = 0; ae < oe.size; ++ae) I.write_shift(1, oe.content[ae]);
          for (; ae & 63; ++ae) I.write_shift(1, 0);
        }
    if (Qe)
      I.l = I.length;
    else
      for (; I.l < I.length; ) I.write_shift(1, 0);
    return I;
  }
  function re(T, b) {
    var R = T.FullPaths.map(function(ae) {
      return ae.toUpperCase();
    }), D = R.map(function(ae) {
      var se = ae.split("/");
      return se[se.length - (ae.slice(-1) == "/" ? 2 : 1)];
    }), I = !1;
    b.charCodeAt(0) === 47 ? (I = !0, b = R[0].slice(0, -1) + b) : I = b.indexOf("/") !== -1;
    var L = b.toUpperCase(), ie = I === !0 ? R.indexOf(L) : D.indexOf(L);
    if (ie !== -1) return T.FileIndex[ie];
    var de = !L.match(cs);
    for (L = L.replace(ft, ""), de && (L = L.replace(cs, "!")), ie = 0; ie < R.length; ++ie)
      if ((de ? R[ie].replace(cs, "!") : R[ie]).replace(ft, "") == L || (de ? D[ie].replace(cs, "!") : D[ie]).replace(ft, "") == L) return T.FileIndex[ie];
    return null;
  }
  var Q = 64, pe = -2, Ce = "d0cf11e0a1b11ae1", xe = [208, 207, 17, 224, 161, 177, 26, 225], we = "00000000000000000000000000000000", ye = {
    /* 2.1 Compund File Sector Numbers and Types */
    MAXREGSECT: -6,
    DIFSECT: -4,
    FATSECT: -3,
    ENDOFCHAIN: pe,
    FREESECT: -1,
    /* 2.2 Compound File Header */
    HEADER_SIGNATURE: Ce,
    HEADER_MINOR_VERSION: "3e00",
    MAXREGSID: -6,
    NOSTREAM: -1,
    HEADER_CLSID: we,
    /* 2.6.1 Compound File Directory Entry */
    EntryTypes: ["unknown", "storage", "stream", "lockbytes", "property", "root"]
  };
  function ge(T, b, R) {
    x();
    var D = le(T, R);
    d.writeFileSync(b, D);
  }
  function Y(T) {
    for (var b = new Array(T.length), R = 0; R < T.length; ++R) b[R] = String.fromCharCode(T[R]);
    return b.join("");
  }
  function he(T, b) {
    var R = le(T, b);
    switch (b && b.type || "buffer") {
      case "file":
        return x(), d.writeFileSync(b.filename, R), R;
      case "binary":
        return typeof R == "string" ? R : Y(R);
      case "base64":
        return $d(typeof R == "string" ? R : Y(R));
      case "buffer":
        if (Qe) return Buffer.isBuffer(R) ? R : Pa(R);
      /* falls through */
      case "array":
        return typeof R == "string" ? Jt(R) : R;
    }
    return R;
  }
  var U;
  function F(T) {
    try {
      var b = T.InflateRaw, R = new b();
      if (R._processChunk(new Uint8Array([3, 0]), R._finishFlushFlag), R.bytesRead) U = T;
      else throw new Error("zlib does not expose bytesRead");
    } catch (D) {
      console.error("cannot use native zlib: " + (D.message || D));
    }
  }
  function X(T, b) {
    if (!U) return ja(T, b);
    var R = U.InflateRaw, D = new R(), I = D._processChunk(T.slice(T.l), D._finishFlushFlag);
    return T.l += D.bytesRead, I;
  }
  function z(T) {
    return U ? U.deflateRawSync(T) : We(T);
  }
  var H = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], ue = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], K = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  function te(T) {
    var b = (T << 1 | T << 11) & 139536 | (T << 5 | T << 15) & 558144;
    return (b >> 16 | b >> 8 | b) & 255;
  }
  for (var Z = typeof Uint8Array < "u", fe = Z ? new Uint8Array(256) : [], Pe = 0; Pe < 256; ++Pe) fe[Pe] = te(Pe);
  function P(T, b) {
    var R = fe[T & 255];
    return b <= 8 ? R >>> 8 - b : (R = R << 8 | fe[T >> 8 & 255], b <= 16 ? R >>> 16 - b : (R = R << 8 | fe[T >> 16 & 255], R >>> 24 - b));
  }
  function Xe(T, b) {
    var R = b & 7, D = b >>> 3;
    return (T[D] | (R <= 6 ? 0 : T[D + 1] << 8)) >>> R & 3;
  }
  function je(T, b) {
    var R = b & 7, D = b >>> 3;
    return (T[D] | (R <= 5 ? 0 : T[D + 1] << 8)) >>> R & 7;
  }
  function Ke(T, b) {
    var R = b & 7, D = b >>> 3;
    return (T[D] | (R <= 4 ? 0 : T[D + 1] << 8)) >>> R & 15;
  }
  function Ve(T, b) {
    var R = b & 7, D = b >>> 3;
    return (T[D] | (R <= 3 ? 0 : T[D + 1] << 8)) >>> R & 31;
  }
  function Fe(T, b) {
    var R = b & 7, D = b >>> 3;
    return (T[D] | (R <= 1 ? 0 : T[D + 1] << 8)) >>> R & 127;
  }
  function ur(T, b, R) {
    var D = b & 7, I = b >>> 3, L = (1 << R) - 1, ie = T[I] >>> D;
    return R < 8 - D || (ie |= T[I + 1] << 8 - D, R < 16 - D) || (ie |= T[I + 2] << 16 - D, R < 24 - D) || (ie |= T[I + 3] << 24 - D), ie & L;
  }
  function Gr(T, b, R) {
    var D = b & 7, I = b >>> 3;
    return D <= 5 ? T[I] |= (R & 7) << D : (T[I] |= R << D & 255, T[I + 1] = (R & 7) >> 8 - D), b + 3;
  }
  function $r(T, b, R) {
    var D = b & 7, I = b >>> 3;
    return R = (R & 1) << D, T[I] |= R, b + 1;
  }
  function Kr(T, b, R) {
    var D = b & 7, I = b >>> 3;
    return R <<= D, T[I] |= R & 255, R >>>= 8, T[I + 1] = R, b + 8;
  }
  function pn(T, b, R) {
    var D = b & 7, I = b >>> 3;
    return R <<= D, T[I] |= R & 255, R >>>= 8, T[I + 1] = R & 255, T[I + 2] = R >>> 8, b + 16;
  }
  function Ht(T, b) {
    var R = T.length, D = 2 * R > b ? 2 * R : b + 5, I = 0;
    if (R >= b) return T;
    if (Qe) {
      var L = Kd(D);
      if (T.copy) T.copy(L);
      else for (; I < T.length; ++I) L[I] = T[I];
      return L;
    } else if (Z) {
      var ie = new Uint8Array(D);
      if (ie.set) ie.set(T);
      else for (; I < R; ++I) ie[I] = T[I];
      return ie;
    }
    return T.length = D, T;
  }
  function Xr(T) {
    for (var b = new Array(T), R = 0; R < T; ++R) b[R] = 0;
    return b;
  }
  function Nt(T, b, R) {
    var D = 1, I = 0, L = 0, ie = 0, de = 0, ae = T.length, se = Z ? new Uint16Array(32) : Xr(32);
    for (L = 0; L < 32; ++L) se[L] = 0;
    for (L = ae; L < R; ++L) T[L] = 0;
    ae = T.length;
    var oe = Z ? new Uint16Array(ae) : Xr(ae);
    for (L = 0; L < ae; ++L)
      se[I = T[L]]++, D < I && (D = I), oe[L] = 0;
    for (se[0] = 0, L = 1; L <= D; ++L) se[L + 16] = de = de + se[L - 1] << 1;
    for (L = 0; L < ae; ++L)
      de = T[L], de != 0 && (oe[L] = se[de + 16]++);
    var _e = 0;
    for (L = 0; L < ae; ++L)
      if (_e = T[L], _e != 0)
        for (de = P(oe[L], D) >> D - _e, ie = (1 << D + 4 - _e) - 1; ie >= 0; --ie)
          b[de | ie << _e] = _e & 15 | L << 4;
    return D;
  }
  var Vt = Z ? new Uint16Array(512) : Xr(512), xn = Z ? new Uint16Array(32) : Xr(32);
  if (!Z) {
    for (var Er = 0; Er < 512; ++Er) Vt[Er] = 0;
    for (Er = 0; Er < 32; ++Er) xn[Er] = 0;
  }
  (function() {
    for (var T = [], b = 0; b < 32; b++) T.push(5);
    Nt(T, xn, 32);
    var R = [];
    for (b = 0; b <= 143; b++) R.push(8);
    for (; b <= 255; b++) R.push(9);
    for (; b <= 279; b++) R.push(7);
    for (; b <= 287; b++) R.push(8);
    Nt(R, Vt, 288);
  })();
  var _t = /* @__PURE__ */ (function() {
    for (var b = Z ? new Uint8Array(32768) : [], R = 0, D = 0; R < K.length - 1; ++R)
      for (; D < K[R + 1]; ++D) b[D] = R;
    for (; D < 32768; ++D) b[D] = 29;
    var I = Z ? new Uint8Array(259) : [];
    for (R = 0, D = 0; R < ue.length - 1; ++R)
      for (; D < ue[R + 1]; ++D) I[D] = R;
    function L(de, ae) {
      for (var se = 0; se < de.length; ) {
        var oe = Math.min(65535, de.length - se), _e = se + oe == de.length;
        for (ae.write_shift(1, +_e), ae.write_shift(2, oe), ae.write_shift(2, ~oe & 65535); oe-- > 0; ) ae[ae.l++] = de[se++];
      }
      return ae.l;
    }
    function ie(de, ae) {
      for (var se = 0, oe = 0, _e = Z ? new Uint16Array(32768) : []; oe < de.length; ) {
        var Ne = (
          /* data.length - boff; */
          Math.min(65535, de.length - oe)
        );
        if (Ne < 10) {
          for (se = Gr(ae, se, +(oe + Ne == de.length)), se & 7 && (se += 8 - (se & 7)), ae.l = se / 8 | 0, ae.write_shift(2, Ne), ae.write_shift(2, ~Ne & 65535); Ne-- > 0; ) ae[ae.l++] = de[oe++];
          se = ae.l * 8;
          continue;
        }
        se = Gr(ae, se, +(oe + Ne == de.length) + 2);
        for (var De = 0; Ne-- > 0; ) {
          var Se = de[oe];
          De = (De << 5 ^ Se) & 32767;
          var Ee = -1, He = 0;
          if ((Ee = _e[De]) && (Ee |= oe & -32768, Ee > oe && (Ee -= 32768), Ee < oe))
            for (; de[Ee + He] == de[oe + He] && He < 250; ) ++He;
          if (He > 2) {
            Se = I[He], Se <= 22 ? se = Kr(ae, se, fe[Se + 1] >> 1) - 1 : (Kr(ae, se, 3), se += 5, Kr(ae, se, fe[Se - 23] >> 5), se += 3);
            var ar = Se < 8 ? 0 : Se - 4 >> 2;
            ar > 0 && (pn(ae, se, He - ue[Se]), se += ar), Se = b[oe - Ee], se = Kr(ae, se, fe[Se] >> 3), se -= 3;
            var ir = Se < 4 ? 0 : Se - 2 >> 1;
            ir > 0 && (pn(ae, se, oe - Ee - K[Se]), se += ir);
            for (var wr = 0; wr < He; ++wr)
              _e[De] = oe & 32767, De = (De << 5 ^ de[oe]) & 32767, ++oe;
            Ne -= He - 1;
          } else
            Se <= 143 ? Se = Se + 48 : se = $r(ae, se, 1), se = Kr(ae, se, fe[Se]), _e[De] = oe & 32767, ++oe;
        }
        se = Kr(ae, se, 0) - 1;
      }
      return ae.l = (se + 7) / 8 | 0, ae.l;
    }
    return function(ae, se) {
      return ae.length < 8 ? L(ae, se) : ie(ae, se);
    };
  })();
  function We(T) {
    var b = Dr(50 + Math.floor(T.length * 1.1)), R = _t(T, b);
    return b.slice(0, R);
  }
  var nr = Z ? new Uint16Array(32768) : Xr(32768), ht = Z ? new Uint16Array(32768) : Xr(32768), xr = Z ? new Uint16Array(128) : Xr(128), tn = 1, js = 1;
  function ki(T, b) {
    var R = Ve(T, b) + 257;
    b += 5;
    var D = Ve(T, b) + 1;
    b += 5;
    var I = Ke(T, b) + 4;
    b += 4;
    for (var L = 0, ie = Z ? new Uint8Array(19) : Xr(19), de = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ae = 1, se = Z ? new Uint8Array(8) : Xr(8), oe = Z ? new Uint8Array(8) : Xr(8), _e = ie.length, Ne = 0; Ne < I; ++Ne)
      ie[H[Ne]] = L = je(T, b), ae < L && (ae = L), se[L]++, b += 3;
    var De = 0;
    for (se[0] = 0, Ne = 1; Ne <= ae; ++Ne) oe[Ne] = De = De + se[Ne - 1] << 1;
    for (Ne = 0; Ne < _e; ++Ne) (De = ie[Ne]) != 0 && (de[Ne] = oe[De]++);
    var Se = 0;
    for (Ne = 0; Ne < _e; ++Ne)
      if (Se = ie[Ne], Se != 0) {
        De = fe[de[Ne]] >> 8 - Se;
        for (var Ee = (1 << 7 - Se) - 1; Ee >= 0; --Ee) xr[De | Ee << Se] = Se & 7 | Ne << 3;
      }
    var He = [];
    for (ae = 1; He.length < R + D; )
      switch (De = xr[Fe(T, b)], b += De & 7, De >>>= 3) {
        case 16:
          for (L = 3 + Xe(T, b), b += 2, De = He[He.length - 1]; L-- > 0; ) He.push(De);
          break;
        case 17:
          for (L = 3 + je(T, b), b += 3; L-- > 0; ) He.push(0);
          break;
        case 18:
          for (L = 11 + Fe(T, b), b += 7; L-- > 0; ) He.push(0);
          break;
        default:
          He.push(De), ae < De && (ae = De);
          break;
      }
    var ar = He.slice(0, R), ir = He.slice(R);
    for (Ne = R; Ne < 286; ++Ne) ar[Ne] = 0;
    for (Ne = D; Ne < 30; ++Ne) ir[Ne] = 0;
    return tn = Nt(ar, nr, 286), js = Nt(ir, ht, 30), b;
  }
  function Ei(T, b) {
    if (T[0] == 3 && !(T[1] & 3))
      return [ia(b), 2];
    for (var R = 0, D = 0, I = Kd(b || 1 << 18), L = 0, ie = I.length >>> 0, de = 0, ae = 0; (D & 1) == 0; ) {
      if (D = je(T, R), R += 3, D >>> 1)
        D >> 1 == 1 ? (de = 9, ae = 5) : (R = ki(T, R), de = tn, ae = js);
      else {
        R & 7 && (R += 8 - (R & 7));
        var se = T[R >>> 3] | T[(R >>> 3) + 1] << 8;
        if (R += 32, se > 0)
          for (!b && ie < L + se && (I = Ht(I, L + se), ie = I.length); se-- > 0; )
            I[L++] = T[R >>> 3], R += 8;
        continue;
      }
      for (; ; ) {
        !b && ie < L + 32767 && (I = Ht(I, L + 32767), ie = I.length);
        var oe = ur(T, R, de), _e = D >>> 1 == 1 ? Vt[oe] : nr[oe];
        if (R += _e & 15, _e >>>= 4, (_e >>> 8 & 255) === 0) I[L++] = _e;
        else {
          if (_e == 256) break;
          _e -= 257;
          var Ne = _e < 8 ? 0 : _e - 4 >> 2;
          Ne > 5 && (Ne = 0);
          var De = L + ue[_e];
          Ne > 0 && (De += ur(T, R, Ne), R += Ne), oe = ur(T, R, ae), _e = D >>> 1 == 1 ? xn[oe] : ht[oe], R += _e & 15, _e >>>= 4;
          var Se = _e < 4 ? 0 : _e - 2 >> 1, Ee = K[_e];
          for (Se > 0 && (Ee += ur(T, R, Se), R += Se), !b && ie < De && (I = Ht(I, De + 100), ie = I.length); L < De; )
            I[L] = I[L - Ee], ++L;
        }
      }
    }
    return b ? [I, R + 7 >>> 3] : [I.slice(0, L), R + 7 >>> 3];
  }
  function ja(T, b) {
    var R = T.slice(T.l || 0), D = Ei(R, b);
    return T.l += D[1], D[0];
  }
  function Ua(T, b) {
    if (T)
      typeof console < "u" && console.error(b);
    else throw new Error(b);
  }
  function za(T, b) {
    var R = (
      /*::(*/
      T
    );
    Hr(R, 0);
    var D = [], I = [], L = {
      FileIndex: D,
      FullPaths: I
    };
    C(L, { root: b.root });
    for (var ie = R.length - 4; (R[ie] != 80 || R[ie + 1] != 75 || R[ie + 2] != 5 || R[ie + 3] != 6) && ie >= 0; ) --ie;
    R.l = ie + 4, R.l += 4;
    var de = R.read_shift(2);
    R.l += 6;
    var ae = R.read_shift(4);
    for (R.l = ae, ie = 0; ie < de; ++ie) {
      R.l += 20;
      var se = R.read_shift(4), oe = R.read_shift(4), _e = R.read_shift(2), Ne = R.read_shift(2), De = R.read_shift(2);
      R.l += 8;
      var Se = R.read_shift(4), Ee = u(
        /*::(*/
        R.slice(R.l + _e, R.l + _e + Ne)
        /*:: :any)*/
      );
      R.l += _e + Ne + De;
      var He = R.l;
      R.l = Se + 4, On(R, se, oe, L, Ee), R.l = He;
    }
    return L;
  }
  function On(T, b, R, D, I) {
    T.l += 2;
    var L = T.read_shift(2), ie = T.read_shift(2), de = c(T);
    if (L & 8257) throw new Error("Unsupported ZIP encryption");
    for (var ae = T.read_shift(4), se = T.read_shift(4), oe = T.read_shift(4), _e = T.read_shift(2), Ne = T.read_shift(2), De = "", Se = 0; Se < _e; ++Se) De += String.fromCharCode(T[T.l++]);
    if (Ne) {
      var Ee = u(
        /*::(*/
        T.slice(T.l, T.l + Ne)
        /*:: :any)*/
      );
      (Ee[21589] || {}).mt && (de = Ee[21589].mt), ((I || {})[21589] || {}).mt && (de = I[21589].mt);
    }
    T.l += Ne;
    var He = T.slice(T.l, T.l + se);
    switch (ie) {
      case 8:
        He = X(T, oe);
        break;
      case 0:
        break;
      // TODO: scan for magic number
      default:
        throw new Error("Unsupported ZIP Compression method " + ie);
    }
    var ar = !1;
    L & 8 && (ae = T.read_shift(4), ae == 134695760 && (ae = T.read_shift(4), ar = !0), se = T.read_shift(4), oe = T.read_shift(4)), se != b && Ua(ar, "Bad compressed size: " + b + " != " + se), oe != R && Ua(ar, "Bad uncompressed size: " + R + " != " + oe), mn(D, De, He, { unsafe: !0, mt: de });
  }
  function Pn(T, b) {
    var R = b || {}, D = [], I = [], L = Dr(1), ie = R.compression ? 8 : 0, de = 0, ae = 0, se = 0, oe = 0, _e = 0, Ne = T.FullPaths[0], De = Ne, Se = T.FileIndex[0], Ee = [], He = 0;
    for (ae = 1; ae < T.FullPaths.length; ++ae)
      if (De = T.FullPaths[ae].slice(Ne.length), Se = T.FileIndex[ae], !(!Se.size || !Se.content || De == "Sh33tJ5")) {
        var ar = oe, ir = Dr(De.length);
        for (se = 0; se < De.length; ++se) ir.write_shift(1, De.charCodeAt(se) & 127);
        ir = ir.slice(0, ir.l), Ee[_e] = Sg.buf(
          /*::((*/
          Se.content,
          0
        );
        var wr = Se.content;
        ie == 8 && (wr = z(wr)), L = Dr(30), L.write_shift(4, 67324752), L.write_shift(2, 20), L.write_shift(2, de), L.write_shift(2, ie), Se.mt ? o(L, Se.mt) : L.write_shift(4, 0), L.write_shift(-4, Ee[_e]), L.write_shift(4, wr.length), L.write_shift(
          4,
          /*::(*/
          Se.content.length
        ), L.write_shift(2, ir.length), L.write_shift(2, 0), oe += L.length, D.push(L), oe += ir.length, D.push(ir), oe += wr.length, D.push(wr), L = Dr(46), L.write_shift(4, 33639248), L.write_shift(2, 0), L.write_shift(2, 20), L.write_shift(2, de), L.write_shift(2, ie), L.write_shift(4, 0), L.write_shift(-4, Ee[_e]), L.write_shift(4, wr.length), L.write_shift(
          4,
          /*::(*/
          Se.content.length
        ), L.write_shift(2, ir.length), L.write_shift(2, 0), L.write_shift(2, 0), L.write_shift(2, 0), L.write_shift(2, 0), L.write_shift(4, 0), L.write_shift(4, ar), He += L.l, I.push(L), He += ir.length, I.push(ir), ++_e;
      }
    return L = Dr(22), L.write_shift(4, 101010256), L.write_shift(2, 0), L.write_shift(2, 0), L.write_shift(2, _e), L.write_shift(2, _e), L.write_shift(4, He), L.write_shift(4, oe), L.write_shift(2, 0), ra([ra(D), ra(I), L]);
  }
  var oa = {
    htm: "text/html",
    xml: "text/xml",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    mso: "application/x-mso",
    thmx: "application/vnd.ms-officetheme",
    sh33tj5: "application/octet-stream"
  };
  function Us(T, b) {
    if (T.ctype) return T.ctype;
    var R = T.name || "", D = R.match(/\.([^\.]+)$/);
    return D && oa[D[1]] || b && (D = (R = b).match(/[\.\\]([^\.\\])+$/), D && oa[D[1]]) ? oa[D[1]] : "application/octet-stream";
  }
  function zs(T) {
    for (var b = $d(T), R = [], D = 0; D < b.length; D += 76) R.push(b.slice(D, D + 76));
    return R.join(`\r
`) + `\r
`;
  }
  function Hs(T) {
    var b = T.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF=]/g, function(se) {
      var oe = se.charCodeAt(0).toString(16).toUpperCase();
      return "=" + (oe.length == 1 ? "0" + oe : oe);
    });
    b = b.replace(/ $/mg, "=20").replace(/\t$/mg, "=09"), b.charAt(0) == `
` && (b = "=0D" + b.slice(1)), b = b.replace(/\r(?!\n)/mg, "=0D").replace(/\n\n/mg, `
=0A`).replace(/([^\r\n])\n/mg, "$1=0A");
    for (var R = [], D = b.split(`\r
`), I = 0; I < D.length; ++I) {
      var L = D[I];
      if (L.length == 0) {
        R.push("");
        continue;
      }
      for (var ie = 0; ie < L.length; ) {
        var de = 76, ae = L.slice(ie, ie + de);
        ae.charAt(de - 1) == "=" ? de-- : ae.charAt(de - 2) == "=" ? de -= 2 : ae.charAt(de - 3) == "=" && (de -= 3), ae = L.slice(ie, ie + de), ie += de, ie < L.length && (ae += "="), R.push(ae);
      }
    }
    return R.join(`\r
`);
  }
  function Vs(T) {
    for (var b = [], R = 0; R < T.length; ++R) {
      for (var D = T[R]; R <= T.length && D.charAt(D.length - 1) == "="; ) D = D.slice(0, D.length - 1) + T[++R];
      b.push(D);
    }
    for (var I = 0; I < b.length; ++I) b[I] = b[I].replace(/[=][0-9A-Fa-f]{2}/g, function(L) {
      return String.fromCharCode(parseInt(L.slice(1), 16));
    });
    return Jt(b.join(`\r
`));
  }
  function Si(T, b, R) {
    for (var D = "", I = "", L = "", ie, de = 0; de < 10; ++de) {
      var ae = b[de];
      if (!ae || ae.match(/^\s*$/)) break;
      var se = ae.match(/^(.*?):\s*([^\s].*)$/);
      if (se) switch (se[1].toLowerCase()) {
        case "content-location":
          D = se[2].trim();
          break;
        case "content-type":
          L = se[2].trim();
          break;
        case "content-transfer-encoding":
          I = se[2].trim();
          break;
      }
    }
    switch (++de, I.toLowerCase()) {
      case "base64":
        ie = Jt(Ft(b.slice(de).join("")));
        break;
      case "quoted-printable":
        ie = Vs(b.slice(de));
        break;
      default:
        throw new Error("Unsupported Content-Transfer-Encoding " + I);
    }
    var oe = mn(T, D.slice(R.length), ie, { unsafe: !0 });
    L && (oe.ctype = L);
  }
  function Ws(T, b) {
    if (Y(T.slice(0, 13)).toLowerCase() != "mime-version:") throw new Error("Unsupported MAD header");
    var R = b && b.root || "", D = (Qe && Buffer.isBuffer(T) ? T.toString("binary") : Y(T)).split(`\r
`), I = 0, L = "";
    for (I = 0; I < D.length; ++I)
      if (L = D[I], !!/^Content-Location:/i.test(L) && (L = L.slice(L.indexOf("file")), R || (R = L.slice(0, L.lastIndexOf("/") + 1)), L.slice(0, R.length) != R))
        for (; R.length > 0 && (R = R.slice(0, R.length - 1), R = R.slice(0, R.lastIndexOf("/") + 1), L.slice(0, R.length) != R); )
          ;
    var ie = (D[1] || "").match(/boundary="(.*?)"/);
    if (!ie) throw new Error("MAD cannot find boundary");
    var de = "--" + (ie[1] || ""), ae = [], se = [], oe = {
      FileIndex: ae,
      FullPaths: se
    };
    C(oe);
    var _e, Ne = 0;
    for (I = 0; I < D.length; ++I) {
      var De = D[I];
      De !== de && De !== de + "--" || (Ne++ && Si(oe, D.slice(_e, I), R), _e = I);
    }
    return oe;
  }
  function ca(T, b) {
    var R = b || {}, D = R.boundary || "SheetJS";
    D = "------=" + D;
    for (var I = [
      "MIME-Version: 1.0",
      'Content-Type: multipart/related; boundary="' + D.slice(2) + '"',
      "",
      "",
      ""
    ], L = T.FullPaths[0], ie = L, de = T.FileIndex[0], ae = 1; ae < T.FullPaths.length; ++ae)
      if (ie = T.FullPaths[ae].slice(L.length), de = T.FileIndex[ae], !(!de.size || !de.content || ie == "Sh33tJ5")) {
        ie = ie.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF]/g, function(He) {
          return "_x" + He.charCodeAt(0).toString(16) + "_";
        }).replace(/[\u0080-\uFFFF]/g, function(He) {
          return "_u" + He.charCodeAt(0).toString(16) + "_";
        });
        for (var se = de.content, oe = Qe && Buffer.isBuffer(se) ? se.toString("binary") : Y(se), _e = 0, Ne = Math.min(1024, oe.length), De = 0, Se = 0; Se <= Ne; ++Se) (De = oe.charCodeAt(Se)) >= 32 && De < 128 && ++_e;
        var Ee = _e >= Ne * 4 / 5;
        I.push(D), I.push("Content-Location: " + (R.root || "file:///C:/SheetJS/") + ie), I.push("Content-Transfer-Encoding: " + (Ee ? "quoted-printable" : "base64")), I.push("Content-Type: " + Us(de, ie)), I.push(""), I.push(Ee ? Hs(oe) : zs(oe));
      }
    return I.push(D + `--\r
`), I.join(`\r
`);
  }
  function Ti(T) {
    var b = {};
    return C(b, T), b;
  }
  function mn(T, b, R, D) {
    var I = D && D.unsafe;
    I || C(T);
    var L = !I && qe.find(T, b);
    if (!L) {
      var ie = T.FullPaths[0];
      b.slice(0, ie.length) == ie ? ie = b : (ie.slice(-1) != "/" && (ie += "/"), ie = (ie + b).replace("//", "/")), L = { name: i(b), type: 2 }, T.FileIndex.push(L), T.FullPaths.push(ie), I || qe.utils.cfb_gc(T);
    }
    return L.content = R, L.size = R ? R.length : 0, D && (D.CLSID && (L.clsid = D.CLSID), D.mt && (L.mt = D.mt), D.ct && (L.ct = D.ct)), L;
  }
  function _o(T, b) {
    C(T);
    var R = qe.find(T, b);
    if (R) {
      for (var D = 0; D < T.FileIndex.length; ++D) if (T.FileIndex[D] == R)
        return T.FileIndex.splice(D, 1), T.FullPaths.splice(D, 1), !0;
    }
    return !1;
  }
  function ua(T, b, R) {
    C(T);
    var D = qe.find(T, b);
    if (D) {
      for (var I = 0; I < T.FileIndex.length; ++I) if (T.FileIndex[I] == D)
        return T.FileIndex[I].name = i(R), T.FullPaths[I] = R, !0;
    }
    return !1;
  }
  function Ha(T) {
    B(T, !0);
  }
  return n.find = re, n.read = j, n.parse = p, n.write = he, n.writeFile = ge, n.utils = {
    cfb_new: Ti,
    cfb_add: mn,
    cfb_del: _o,
    cfb_mov: ua,
    cfb_gc: Ha,
    ReadShift: hs,
    CheckField: Lp,
    prep_blob: Hr,
    bconcat: ra,
    use_zlib: F,
    _deflateRaw: We,
    _inflateRaw: ja,
    consts: ye
  }, n;
})();
function Tg(e) {
  if (typeof Deno < "u") return Deno.readFileSync(e);
  if (typeof $ < "u" && typeof File < "u" && typeof Folder < "u") try {
    var n = File(e);
    n.open("r"), n.encoding = "binary";
    var r = n.read();
    return n.close(), r;
  } catch (s) {
    if (!s.message || !s.message.match(/onstruct/)) throw s;
  }
  throw new Error("Cannot access file " + e);
}
function fn(e) {
  for (var n = Object.keys(e), r = [], s = 0; s < n.length; ++s) Object.prototype.hasOwnProperty.call(e, n[s]) && r.push(n[s]);
  return r;
}
function Bc(e) {
  for (var n = [], r = fn(e), s = 0; s !== r.length; ++s) n[e[r[s]]] = r[s];
  return n;
}
var lo = /* @__PURE__ */ new Date(1899, 11, 30, 0, 0, 0);
function dt(e, n) {
  var r = /* @__PURE__ */ e.getTime(), s = /* @__PURE__ */ lo.getTime() + (/* @__PURE__ */ e.getTimezoneOffset() - /* @__PURE__ */ lo.getTimezoneOffset()) * 6e4;
  return (r - s) / (1440 * 60 * 1e3);
}
var xp = /* @__PURE__ */ new Date(), Cg = /* @__PURE__ */ lo.getTime() + (/* @__PURE__ */ xp.getTimezoneOffset() - /* @__PURE__ */ lo.getTimezoneOffset()) * 6e4, rh = /* @__PURE__ */ xp.getTimezoneOffset();
function go(e) {
  var n = /* @__PURE__ */ new Date();
  return n.setTime(e * 24 * 60 * 60 * 1e3 + Cg), n.getTimezoneOffset() !== rh && n.setTime(n.getTime() + (n.getTimezoneOffset() - rh) * 6e4), n;
}
function Ag(e) {
  var n = 0, r = 0, s = !1, i = e.match(/P([0-9\.]+Y)?([0-9\.]+M)?([0-9\.]+D)?T([0-9\.]+H)?([0-9\.]+M)?([0-9\.]+S)?/);
  if (!i) throw new Error("|" + e + "| is not an ISO8601 Duration");
  for (var o = 1; o != i.length; ++o)
    if (i[o]) {
      switch (r = 1, o > 3 && (s = !0), i[o].slice(i[o].length - 1)) {
        case "Y":
          throw new Error("Unsupported ISO Duration Field: " + i[o].slice(i[o].length - 1));
        case "D":
          r *= 24;
        /* falls through */
        case "H":
          r *= 60;
        /* falls through */
        case "M":
          if (s) r *= 60;
          else throw new Error("Unsupported ISO Duration Field: M");
      }
      n += r * parseInt(i[o], 10);
    }
  return n;
}
var th = /* @__PURE__ */ new Date("2017-02-19T19:06:09.000Z"), mp = /* @__PURE__ */ isNaN(/* @__PURE__ */ th.getFullYear()) ? /* @__PURE__ */ new Date("2/19/17") : th, Fg = /* @__PURE__ */ mp.getFullYear() == 2017;
function jr(e, n) {
  var r = new Date(e);
  if (Fg)
    return n > 0 ? r.setTime(r.getTime() + r.getTimezoneOffset() * 60 * 1e3) : n < 0 && r.setTime(r.getTime() - r.getTimezoneOffset() * 60 * 1e3), r;
  if (e instanceof Date) return e;
  if (mp.getFullYear() == 1917 && !isNaN(r.getFullYear())) {
    var s = r.getFullYear();
    return e.indexOf("" + s) > -1 || r.setFullYear(r.getFullYear() + 100), r;
  }
  var i = e.match(/\d+/g) || ["2017", "2", "19", "0", "0", "0"], o = new Date(+i[0], +i[1] - 1, +i[2], +i[3] || 0, +i[4] || 0, +i[5] || 0);
  return e.indexOf("Z") > -1 && (o = new Date(o.getTime() - o.getTimezoneOffset() * 60 * 1e3)), o;
}
function Da(e, n) {
  if (Qe && Buffer.isBuffer(e)) {
    if (n) {
      if (e[0] == 255 && e[1] == 254) return fs(e.slice(2).toString("utf16le"));
      if (e[1] == 254 && e[2] == 255) return fs(tp(e.slice(2).toString("binary")));
    }
    return e.toString("binary");
  }
  if (typeof TextDecoder < "u") try {
    if (n) {
      if (e[0] == 255 && e[1] == 254) return fs(new TextDecoder("utf-16le").decode(e.slice(2)));
      if (e[0] == 254 && e[1] == 255) return fs(new TextDecoder("utf-16be").decode(e.slice(2)));
    }
    var r = {
      "€": "",
      "‚": "",
      ƒ: "",
      "„": "",
      "…": "",
      "†": "",
      "‡": "",
      "ˆ": "",
      "‰": "",
      Š: "",
      "‹": "",
      Œ: "",
      Ž: "",
      "‘": "",
      "’": "",
      "“": "",
      "”": "",
      "•": "",
      "–": "",
      "—": "",
      "˜": "",
      "™": "",
      š: "",
      "›": "",
      œ: "",
      ž: "",
      Ÿ: ""
    };
    return Array.isArray(e) && (e = new Uint8Array(e)), new TextDecoder("latin1").decode(e).replace(/[€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, function(o) {
      return r[o] || o;
    });
  } catch {
  }
  for (var s = [], i = 0; i != e.length; ++i) s.push(String.fromCharCode(e[i]));
  return s.join("");
}
function Vr(e) {
  if (typeof JSON < "u" && !Array.isArray(e)) return JSON.parse(JSON.stringify(e));
  if (typeof e != "object" || e == null) return e;
  if (e instanceof Date) return new Date(e.getTime());
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (n[r] = Vr(e[r]));
  return n;
}
function gr(e, n) {
  for (var r = ""; r.length < n; ) r += e;
  return r;
}
function rn(e) {
  var n = Number(e);
  if (!isNaN(n)) return isFinite(n) ? n : NaN;
  if (!/\d/.test(e)) return n;
  var r = 1, s = e.replace(/([\d]),([\d])/g, "$1$2").replace(/[$]/g, "").replace(/[%]/g, function() {
    return r *= 100, "";
  });
  return !isNaN(n = Number(s)) || (s = s.replace(/[(](.*)[)]/, function(i, o) {
    return r = -r, o;
  }), !isNaN(n = Number(s))) ? n / r : n;
}
var Ng = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function gi(e) {
  var n = new Date(e), r = /* @__PURE__ */ new Date(NaN), s = n.getYear(), i = n.getMonth(), o = n.getDate();
  if (isNaN(o)) return r;
  var c = e.toLowerCase();
  if (c.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)) {
    if (c = c.replace(/[^a-z]/g, "").replace(/([^a-z]|^)[ap]m?([^a-z]|$)/, ""), c.length > 3 && Ng.indexOf(c) == -1) return r;
  } else if (c.match(/[a-z]/)) return r;
  return s < 0 || s > 8099 ? r : (i > 0 || o > 1) && s != 101 ? n : e.match(/[^-0-9:,\/\\]/) ? r : n;
}
var Rg = /* @__PURE__ */ (function() {
  var e = "abacaba".split(/(:?b)/i).length == 5;
  return function(r, s, i) {
    if (e || typeof s == "string") return r.split(s);
    for (var o = r.split(s), c = [o[0]], u = 1; u < o.length; ++u)
      c.push(i), c.push(o[u]);
    return c;
  };
})();
function gp(e) {
  return e ? e.content && e.type ? Da(e.content, !0) : e.data ? os(e.data) : e.asNodeBuffer && Qe ? os(e.asNodeBuffer().toString("binary")) : e.asBinary ? os(e.asBinary()) : e._data && e._data.getContent ? os(Da(Array.prototype.slice.call(e._data.getContent(), 0))) : null : null;
}
function vp(e) {
  if (!e) return null;
  if (e.data) return Wd(e.data);
  if (e.asNodeBuffer && Qe) return e.asNodeBuffer();
  if (e._data && e._data.getContent) {
    var n = e._data.getContent();
    return typeof n == "string" ? Wd(n) : Array.prototype.slice.call(n);
  }
  return e.content && e.type ? e.content : null;
}
function Dg(e) {
  return e && e.name.slice(-4) === ".bin" ? vp(e) : gp(e);
}
function Bt(e, n) {
  for (var r = e.FullPaths || fn(e.files), s = n.toLowerCase().replace(/[\/]/g, "\\"), i = s.replace(/\\/g, "/"), o = 0; o < r.length; ++o) {
    var c = r[o].replace(/^Root Entry[\/]/, "").toLowerCase();
    if (s == c || i == c) return e.files ? e.files[r[o]] : e.FileIndex[o];
  }
  return null;
}
function jc(e, n) {
  var r = Bt(e, n);
  if (r == null) throw new Error("Cannot find file " + n + " in zip");
  return r;
}
function Cr(e, n, r) {
  if (!r) return Dg(jc(e, n));
  if (!n) return null;
  try {
    return Cr(e, n);
  } catch {
    return null;
  }
}
function At(e, n, r) {
  if (!r) return gp(jc(e, n));
  if (!n) return null;
  try {
    return At(e, n);
  } catch {
    return null;
  }
}
function Og(e, n, r) {
  return vp(jc(e, n));
}
function nh(e) {
  for (var n = e.FullPaths || fn(e.files), r = [], s = 0; s < n.length; ++s) n[s].slice(-1) != "/" && r.push(n[s].replace(/^Root Entry[\/]/, ""));
  return r.sort();
}
function Pg(e, n, r) {
  if (e.FullPaths) {
    if (typeof r == "string") {
      var s;
      return Qe ? s = Pa(r) : s = Jm(r), qe.utils.cfb_add(e, n, s);
    }
    qe.utils.cfb_add(e, n, r);
  } else e.file(n, r);
}
function wp(e, n) {
  switch (n.type) {
    case "base64":
      return qe.read(e, { type: "base64" });
    case "binary":
      return qe.read(e, { type: "binary" });
    case "buffer":
    case "array":
      return qe.read(e, { type: "buffer" });
  }
  throw new Error("Unrecognized type " + n.type);
}
function us(e, n) {
  if (e.charAt(0) == "/") return e.slice(1);
  var r = n.split("/");
  n.slice(-1) != "/" && r.pop();
  for (var s = e.split("/"); s.length !== 0; ) {
    var i = s.shift();
    i === ".." ? r.pop() : i !== "." && r.push(i);
  }
  return r.join("/");
}
var yp = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r
`, bg = /([^"\s?>\/]+)\s*=\s*((?:")([^"]*)(?:")|(?:')([^']*)(?:')|([^'">\s]+))/g, ah = /<[\/\?]?[a-zA-Z0-9:_-]+(?:\s+[^"\s?>\/]+\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s=]+))*\s*[\/\?]?>/mg, Ig = /<[^>]*>/g, it = /* @__PURE__ */ yp.match(ah) ? ah : Ig, Lg = /<\w*:/, Mg = /<(\/?)\w+:/;
function Ue(e, n, r) {
  for (var s = {}, i = 0, o = 0; i !== e.length && !((o = e.charCodeAt(i)) === 32 || o === 10 || o === 13); ++i) ;
  if (n || (s[0] = e.slice(0, i)), i === e.length) return s;
  var c = e.match(bg), u = 0, d = "", x = 0, p = "", g = "", w = 1;
  if (c) for (x = 0; x != c.length; ++x) {
    for (g = c[x], o = 0; o != g.length && g.charCodeAt(o) !== 61; ++o) ;
    for (p = g.slice(0, o).trim(); g.charCodeAt(o + 1) == 32; ) ++o;
    for (w = (i = g.charCodeAt(o + 1)) == 34 || i == 39 ? 1 : 0, d = g.slice(o + 1 + w, g.length - w), u = 0; u != p.length && p.charCodeAt(u) !== 58; ++u) ;
    if (u === p.length)
      p.indexOf("_") > 0 && (p = p.slice(0, p.indexOf("_"))), s[p] = d, s[p.toLowerCase()] = d;
    else {
      var k = (u === 5 && p.slice(0, 5) === "xmlns" ? "xmlns" : "") + p.slice(u + 1);
      if (s[k] && p.slice(u - 3, u) == "ext") continue;
      s[k] = d, s[k.toLowerCase()] = d;
    }
  }
  return s;
}
function dn(e) {
  return e.replace(Mg, "<$1");
}
var _p = {
  "&quot;": '"',
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&amp;": "&"
}, Bg = /* @__PURE__ */ Bc(_p), er = /* @__PURE__ */ (function() {
  var e = /&(?:quot|apos|gt|lt|amp|#x?([\da-fA-F]+));/ig, n = /_x([\da-fA-F]{4})_/ig;
  return function r(s) {
    var i = s + "", o = i.indexOf("<![CDATA[");
    if (o == -1) return i.replace(e, function(u, d) {
      return _p[u] || String.fromCharCode(parseInt(d, u.indexOf("x") > -1 ? 16 : 10)) || u;
    }).replace(n, function(u, d) {
      return String.fromCharCode(parseInt(d, 16));
    });
    var c = i.indexOf("]]>");
    return r(i.slice(0, o)) + i.slice(o + 9, c) + r(i.slice(c + 3));
  };
})(), jg = /[&<>'"]/g, Ug = /[\u0000-\u001f]/g;
function Uc(e) {
  var n = e + "";
  return n.replace(jg, function(r) {
    return Bg[r];
  }).replace(/\n/g, "<br/>").replace(Ug, function(r) {
    return "&#x" + ("000" + r.charCodeAt(0).toString(16)).slice(-4) + ";";
  });
}
var ih = /* @__PURE__ */ (function() {
  var e = /&#(\d+);/g;
  function n(r, s) {
    return String.fromCharCode(parseInt(s, 10));
  }
  return function(s) {
    return s.replace(e, n);
  };
})();
function dr(e) {
  switch (e) {
    case 1:
    case !0:
    case "1":
    case "true":
    case "TRUE":
      return !0;
    /* case '0': case 'false': case 'FALSE':*/
    default:
      return !1;
  }
}
function cc(e) {
  for (var n = "", r = 0, s = 0, i = 0, o = 0, c = 0, u = 0; r < e.length; ) {
    if (s = e.charCodeAt(r++), s < 128) {
      n += String.fromCharCode(s);
      continue;
    }
    if (i = e.charCodeAt(r++), s > 191 && s < 224) {
      c = (s & 31) << 6, c |= i & 63, n += String.fromCharCode(c);
      continue;
    }
    if (o = e.charCodeAt(r++), s < 240) {
      n += String.fromCharCode((s & 15) << 12 | (i & 63) << 6 | o & 63);
      continue;
    }
    c = e.charCodeAt(r++), u = ((s & 7) << 18 | (i & 63) << 12 | (o & 63) << 6 | c & 63) - 65536, n += String.fromCharCode(55296 + (u >>> 10 & 1023)), n += String.fromCharCode(56320 + (u & 1023));
  }
  return n;
}
function sh(e) {
  var n = ia(2 * e.length), r, s, i = 1, o = 0, c = 0, u;
  for (s = 0; s < e.length; s += i)
    i = 1, (u = e.charCodeAt(s)) < 128 ? r = u : u < 224 ? (r = (u & 31) * 64 + (e.charCodeAt(s + 1) & 63), i = 2) : u < 240 ? (r = (u & 15) * 4096 + (e.charCodeAt(s + 1) & 63) * 64 + (e.charCodeAt(s + 2) & 63), i = 3) : (i = 4, r = (u & 7) * 262144 + (e.charCodeAt(s + 1) & 63) * 4096 + (e.charCodeAt(s + 2) & 63) * 64 + (e.charCodeAt(s + 3) & 63), r -= 65536, c = 55296 + (r >>> 10 & 1023), r = 56320 + (r & 1023)), c !== 0 && (n[o++] = c & 255, n[o++] = c >>> 8, c = 0), n[o++] = r % 256, n[o++] = r >>> 8;
  return n.slice(0, o).toString("ucs2");
}
function lh(e) {
  return Pa(e, "binary").toString("utf8");
}
var Ql = "foo bar bazâð£", lr = Qe && (/* @__PURE__ */ lh(Ql) == /* @__PURE__ */ cc(Ql) && lh || /* @__PURE__ */ sh(Ql) == /* @__PURE__ */ cc(Ql) && sh) || cc, fs = Qe ? function(e) {
  return Pa(e, "utf8").toString("binary");
} : function(e) {
  for (var n = [], r = 0, s = 0, i = 0; r < e.length; )
    switch (s = e.charCodeAt(r++), !0) {
      case s < 128:
        n.push(String.fromCharCode(s));
        break;
      case s < 2048:
        n.push(String.fromCharCode(192 + (s >> 6))), n.push(String.fromCharCode(128 + (s & 63)));
        break;
      case (s >= 55296 && s < 57344):
        s -= 55296, i = e.charCodeAt(r++) - 56320 + (s << 10), n.push(String.fromCharCode(240 + (i >> 18 & 7))), n.push(String.fromCharCode(144 + (i >> 12 & 63))), n.push(String.fromCharCode(128 + (i >> 6 & 63))), n.push(String.fromCharCode(128 + (i & 63)));
        break;
      default:
        n.push(String.fromCharCode(224 + (s >> 12))), n.push(String.fromCharCode(128 + (s >> 6 & 63))), n.push(String.fromCharCode(128 + (s & 63)));
    }
  return n.join("");
}, Cs = /* @__PURE__ */ (function() {
  var e = {};
  return function(r, s) {
    var i = r + "|" + (s || "");
    return e[i] ? e[i] : e[i] = new RegExp("<(?:\\w+:)?" + r + '(?: xml:space="preserve")?(?:[^>]*)>([\\s\\S]*?)</(?:\\w+:)?' + r + ">", s || "");
  };
})(), kp = /* @__PURE__ */ (function() {
  var e = [
    ["nbsp", " "],
    ["middot", "·"],
    ["quot", '"'],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["amp", "&"]
  ].map(function(n) {
    return [new RegExp("&" + n[0] + ";", "ig"), n[1]];
  });
  return function(r) {
    for (var s = r.replace(/^[\t\n\r ]+/, "").replace(/[\t\n\r ]+$/, "").replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/[\t\n\r ]+/g, " ").replace(/<\s*[bB][rR]\s*\/?>/g, `
`).replace(/<[^>]*>/g, ""), i = 0; i < e.length; ++i) s = s.replace(e[i][0], e[i][1]);
    return s;
  };
})(), zg = /* @__PURE__ */ (function() {
  var e = {};
  return function(r) {
    return e[r] !== void 0 ? e[r] : e[r] = new RegExp("<(?:vt:)?" + r + ">([\\s\\S]*?)</(?:vt:)?" + r + ">", "g");
  };
})(), Hg = /<\/?(?:vt:)?variant>/g, Vg = /<(?:vt:)([^>]*)>([\s\S]*)</;
function oh(e, n) {
  var r = Ue(e), s = e.match(zg(r.baseType)) || [], i = [];
  if (s.length != r.size) {
    if (n.WTF) throw new Error("unexpected vector length " + s.length + " != " + r.size);
    return i;
  }
  return s.forEach(function(o) {
    var c = o.replace(Hg, "").match(Vg);
    c && i.push({ v: lr(c[2]), t: c[1] });
  }), i;
}
var Wg = /(^\s|\s$|\n)/;
function Gg(e) {
  return fn(e).map(function(n) {
    return " " + n + '="' + e[n] + '"';
  }).join("");
}
function $g(e, n, r) {
  return "<" + e + (r != null ? Gg(r) : "") + (n != null ? (n.match(Wg) ? ' xml:space="preserve"' : "") + ">" + n + "</" + e : "/") + ">";
}
function zc(e) {
  if (Qe && /*::typeof Buffer !== "undefined" && d != null && d instanceof Buffer &&*/
  Buffer.isBuffer(e)) return e.toString("utf8");
  if (typeof e == "string") return e;
  if (typeof Uint8Array < "u" && e instanceof Uint8Array) return lr(ba(Ic(e)));
  throw new Error("Bad input format: expected Buffer or string");
}
var As = /<(\/?)([^\s?><!\/:]*:|)([^\s?<>:\/]+)(?:[\s?:\/][^>]*)?>/mg, Kg = {
  CT: "http://schemas.openxmlformats.org/package/2006/content-types"
}, Xg = [
  "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
  "http://purl.oclc.org/ooxml/spreadsheetml/main",
  "http://schemas.microsoft.com/office/excel/2006/main",
  "http://schemas.microsoft.com/office/excel/2006/2"
];
function Yg(e, n) {
  for (var r = 1 - 2 * (e[n + 7] >>> 7), s = ((e[n + 7] & 127) << 4) + (e[n + 6] >>> 4 & 15), i = e[n + 6] & 15, o = 5; o >= 0; --o) i = i * 256 + e[n + o];
  return s == 2047 ? i == 0 ? r * (1 / 0) : NaN : (s == 0 ? s = -1022 : (s -= 1023, i += Math.pow(2, 52)), r * Math.pow(2, s - 52) * i);
}
function Qg(e, n, r) {
  var s = (n < 0 || 1 / n == -1 / 0 ? 1 : 0) << 7, i = 0, o = 0, c = s ? -n : n;
  isFinite(c) ? c == 0 ? i = o = 0 : (i = Math.floor(Math.log(c) / Math.LN2), o = c * Math.pow(2, 52 - i), i <= -1023 && (!isFinite(o) || o < Math.pow(2, 52)) ? i = -1022 : (o -= Math.pow(2, 52), i += 1023)) : (i = 2047, o = isNaN(n) ? 26985 : 0);
  for (var u = 0; u <= 5; ++u, o /= 256) e[r + u] = o & 255;
  e[r + 6] = (i & 15) << 4 | o & 15, e[r + 7] = i >> 4 | s;
}
var ch = function(e) {
  for (var n = [], r = 10240, s = 0; s < e[0].length; ++s) if (e[0][s]) for (var i = 0, o = e[0][s].length; i < o; i += r) n.push.apply(n, e[0][s].slice(i, i + r));
  return n;
}, uh = Qe ? function(e) {
  return e[0].length > 0 && Buffer.isBuffer(e[0][0]) ? Buffer.concat(e[0].map(function(n) {
    return Buffer.isBuffer(n) ? n : Pa(n);
  })) : ch(e);
} : ch, fh = function(e, n, r) {
  for (var s = [], i = n; i < r; i += 2) s.push(String.fromCharCode(Tn(e, i)));
  return s.join("").replace(ft, "");
}, Hc = Qe ? function(e, n, r) {
  return Buffer.isBuffer(e) ? e.toString("utf16le", n, r).replace(ft, "") : fh(e, n, r);
} : fh, dh = function(e, n, r) {
  for (var s = [], i = n; i < n + r; ++i) s.push(("0" + e[i].toString(16)).slice(-2));
  return s.join("");
}, Ep = Qe ? function(e, n, r) {
  return Buffer.isBuffer(e) ? e.toString("hex", n, n + r) : dh(e, n, r);
} : dh, hh = function(e, n, r) {
  for (var s = [], i = n; i < r; i++) s.push(String.fromCharCode(di(e, i)));
  return s.join("");
}, Ps = Qe ? function(n, r, s) {
  return Buffer.isBuffer(n) ? n.toString("utf8", r, s) : hh(n, r, s);
} : hh, Sp = function(e, n) {
  var r = Ct(e, n);
  return r > 0 ? Ps(e, n + 4, n + 4 + r - 1) : "";
}, Tp = Sp, Cp = function(e, n) {
  var r = Ct(e, n);
  return r > 0 ? Ps(e, n + 4, n + 4 + r - 1) : "";
}, Ap = Cp, Fp = function(e, n) {
  var r = 2 * Ct(e, n);
  return r > 0 ? Ps(e, n + 4, n + 4 + r - 1) : "";
}, Np = Fp, Rp = function(n, r) {
  var s = Ct(n, r);
  return s > 0 ? Hc(n, r + 4, r + 4 + s) : "";
}, Dp = Rp, Op = function(e, n) {
  var r = Ct(e, n);
  return r > 0 ? Ps(e, n + 4, n + 4 + r) : "";
}, Pp = Op, bp = function(e, n) {
  return Yg(e, n);
}, oo = bp, Ip = function(n) {
  return Array.isArray(n) || typeof Uint8Array < "u" && n instanceof Uint8Array;
};
Qe && (Tp = function(n, r) {
  if (!Buffer.isBuffer(n)) return Sp(n, r);
  var s = n.readUInt32LE(r);
  return s > 0 ? n.toString("utf8", r + 4, r + 4 + s - 1) : "";
}, Ap = function(n, r) {
  if (!Buffer.isBuffer(n)) return Cp(n, r);
  var s = n.readUInt32LE(r);
  return s > 0 ? n.toString("utf8", r + 4, r + 4 + s - 1) : "";
}, Np = function(n, r) {
  if (!Buffer.isBuffer(n)) return Fp(n, r);
  var s = 2 * n.readUInt32LE(r);
  return n.toString("utf16le", r + 4, r + 4 + s - 1);
}, Dp = function(n, r) {
  if (!Buffer.isBuffer(n)) return Rp(n, r);
  var s = n.readUInt32LE(r);
  return n.toString("utf16le", r + 4, r + 4 + s);
}, Pp = function(n, r) {
  if (!Buffer.isBuffer(n)) return Op(n, r);
  var s = n.readUInt32LE(r);
  return n.toString("utf8", r + 4, r + 4 + s);
}, oo = function(n, r) {
  return Buffer.isBuffer(n) ? n.readDoubleLE(r) : bp(n, r);
}, Ip = function(n) {
  return Buffer.isBuffer(n) || Array.isArray(n) || typeof Uint8Array < "u" && n instanceof Uint8Array;
});
var di = function(e, n) {
  return e[n];
}, Tn = function(e, n) {
  return e[n + 1] * 256 + e[n];
}, qg = function(e, n) {
  var r = e[n + 1] * 256 + e[n];
  return r < 32768 ? r : (65535 - r + 1) * -1;
}, Ct = function(e, n) {
  return e[n + 3] * (1 << 24) + (e[n + 2] << 16) + (e[n + 1] << 8) + e[n];
}, Sa = function(e, n) {
  return e[n + 3] << 24 | e[n + 2] << 16 | e[n + 1] << 8 | e[n];
}, Jg = function(e, n) {
  return e[n] << 24 | e[n + 1] << 16 | e[n + 2] << 8 | e[n + 3];
};
function hs(e, n) {
  var r = "", s, i, o = [], c, u, d, x;
  switch (n) {
    case "dbcs":
      if (x = this.l, Qe && Buffer.isBuffer(this)) r = this.slice(this.l, this.l + 2 * e).toString("utf16le");
      else for (d = 0; d < e; ++d)
        r += String.fromCharCode(Tn(this, x)), x += 2;
      e *= 2;
      break;
    case "utf8":
      r = Ps(this, this.l, this.l + e);
      break;
    case "utf16le":
      e *= 2, r = Hc(this, this.l, this.l + e);
      break;
    case "wstr":
      return hs.call(this, e, "dbcs");
    /* [MS-OLEDS] 2.1.4 LengthPrefixedAnsiString */
    case "lpstr-ansi":
      r = Tp(this, this.l), e = 4 + Ct(this, this.l);
      break;
    case "lpstr-cp":
      r = Ap(this, this.l), e = 4 + Ct(this, this.l);
      break;
    /* [MS-OLEDS] 2.1.5 LengthPrefixedUnicodeString */
    case "lpwstr":
      r = Np(this, this.l), e = 4 + 2 * Ct(this, this.l);
      break;
    /* [MS-OFFCRYPTO] 2.1.2 Length-Prefixed Padded Unicode String (UNICODE-LP-P4) */
    case "lpp4":
      e = 4 + Ct(this, this.l), r = Dp(this, this.l), e & 2 && (e += 2);
      break;
    /* [MS-OFFCRYPTO] 2.1.3 Length-Prefixed UTF-8 String (UTF-8-LP-P4) */
    case "8lpp4":
      e = 4 + Ct(this, this.l), r = Pp(this, this.l), e & 3 && (e += 4 - (e & 3));
      break;
    case "cstr":
      for (e = 0, r = ""; (c = di(this, this.l + e++)) !== 0; ) o.push(Yl(c));
      r = o.join("");
      break;
    case "_wstr":
      for (e = 0, r = ""; (c = Tn(this, this.l + e)) !== 0; )
        o.push(Yl(c)), e += 2;
      e += 2, r = o.join("");
      break;
    /* sbcs and dbcs support continue records in the SST way TODO codepages */
    case "dbcs-cont":
      for (r = "", x = this.l, d = 0; d < e; ++d) {
        if (this.lens && this.lens.indexOf(x) !== -1)
          return c = di(this, x), this.l = x + 1, u = hs.call(this, e - d, c ? "dbcs-cont" : "sbcs-cont"), o.join("") + u;
        o.push(Yl(Tn(this, x))), x += 2;
      }
      r = o.join(""), e *= 2;
      break;
    case "cpstr":
    /* falls through */
    case "sbcs-cont":
      for (r = "", x = this.l, d = 0; d != e; ++d) {
        if (this.lens && this.lens.indexOf(x) !== -1)
          return c = di(this, x), this.l = x + 1, u = hs.call(this, e - d, c ? "dbcs-cont" : "sbcs-cont"), o.join("") + u;
        o.push(Yl(di(this, x))), x += 1;
      }
      r = o.join("");
      break;
    default:
      switch (e) {
        case 1:
          return s = di(this, this.l), this.l++, s;
        case 2:
          return s = (n === "i" ? qg : Tn)(this, this.l), this.l += 2, s;
        case 4:
        case -4:
          return n === "i" || (this[this.l + 3] & 128) === 0 ? (s = (e > 0 ? Sa : Jg)(this, this.l), this.l += 4, s) : (i = Ct(this, this.l), this.l += 4, i);
        case 8:
        case -8:
          if (n === "f")
            return e == 8 ? i = oo(this, this.l) : i = oo([this[this.l + 7], this[this.l + 6], this[this.l + 5], this[this.l + 4], this[this.l + 3], this[this.l + 2], this[this.l + 1], this[this.l + 0]], 0), this.l += 8, i;
          e = 8;
        /* falls through */
        case 16:
          r = Ep(this, this.l, e);
          break;
      }
  }
  return this.l += e, r;
}
var Zg = function(e, n, r) {
  e[r] = n & 255, e[r + 1] = n >>> 8 & 255, e[r + 2] = n >>> 16 & 255, e[r + 3] = n >>> 24 & 255;
}, ev = function(e, n, r) {
  e[r] = n & 255, e[r + 1] = n >> 8 & 255, e[r + 2] = n >> 16 & 255, e[r + 3] = n >> 24 & 255;
}, rv = function(e, n, r) {
  e[r] = n & 255, e[r + 1] = n >>> 8 & 255;
};
function tv(e, n, r) {
  var s = 0, i = 0;
  if (r === "dbcs") {
    for (i = 0; i != n.length; ++i) rv(this, n.charCodeAt(i), this.l + 2 * i);
    s = 2 * n.length;
  } else if (r === "sbcs") {
    for (n = n.replace(/[^\x00-\x7F]/g, "_"), i = 0; i != n.length; ++i) this[this.l + i] = n.charCodeAt(i) & 255;
    s = n.length;
  } else if (r === "hex") {
    for (; i < e; ++i)
      this[this.l++] = parseInt(n.slice(2 * i, 2 * i + 2), 16) || 0;
    return this;
  } else if (r === "utf16le") {
    var o = Math.min(this.l + e, this.length);
    for (i = 0; i < Math.min(n.length, e); ++i) {
      var c = n.charCodeAt(i);
      this[this.l++] = c & 255, this[this.l++] = c >> 8;
    }
    for (; this.l < o; ) this[this.l++] = 0;
    return this;
  } else switch (e) {
    case 1:
      s = 1, this[this.l] = n & 255;
      break;
    case 2:
      s = 2, this[this.l] = n & 255, n >>>= 8, this[this.l + 1] = n & 255;
      break;
    case 3:
      s = 3, this[this.l] = n & 255, n >>>= 8, this[this.l + 1] = n & 255, n >>>= 8, this[this.l + 2] = n & 255;
      break;
    case 4:
      s = 4, Zg(this, n, this.l);
      break;
    case 8:
      if (s = 8, r === "f") {
        Qg(this, n, this.l);
        break;
      }
    /* falls through */
    case 16:
      break;
    case -4:
      s = 4, ev(this, n, this.l);
      break;
  }
  return this.l += s, this;
}
function Lp(e, n) {
  var r = Ep(this, this.l, e.length >> 1);
  if (r !== e) throw new Error(n + "Expected " + e + " saw " + r);
  this.l += e.length >> 1;
}
function Hr(e, n) {
  e.l = n, e.read_shift = /*::(*/
  hs, e.chk = Lp, e.write_shift = tv;
}
function at(e, n) {
  e.l += n;
}
function Dr(e) {
  var n = ia(e);
  return Hr(n, 0), n;
}
function Dn(e, n, r) {
  if (e) {
    var s, i, o;
    Hr(e, e.l || 0);
    for (var c = e.length, u = 0, d = 0; e.l < c; ) {
      u = e.read_shift(1), u & 128 && (u = (u & 127) + ((e.read_shift(1) & 127) << 7));
      var x = xo[u] || xo[65535];
      for (s = e.read_shift(1), o = s & 127, i = 1; i < 4 && s & 128; ++i) o += ((s = e.read_shift(1)) & 127) << 7 * i;
      d = e.l + o;
      var p = x.f && x.f(e, o, r);
      if (e.l = d, n(p, x, u)) return;
    }
  }
}
function yc() {
  var e = [], n = Qe ? 256 : 2048, r = function(x) {
    var p = Dr(x);
    return Hr(p, 0), p;
  }, s = r(n), i = function() {
    s && (s.length > s.l && (s = s.slice(0, s.l), s.l = s.length), s.length > 0 && e.push(s), s = null);
  }, o = function(x) {
    return s && x < s.length - s.l ? s : (i(), s = r(Math.max(x + 1, n)));
  }, c = function() {
    return i(), ra(e);
  }, u = function(x) {
    i(), s = x, s.l == null && (s.l = s.length), o(n);
  };
  return { next: o, push: u, end: c, _bufs: e };
}
function ps(e, n, r) {
  var s = Vr(e);
  if (n.s ? (s.cRel && (s.c += n.s.c), s.rRel && (s.r += n.s.r)) : (s.cRel && (s.c += n.c), s.rRel && (s.r += n.r)), !r || r.biff < 12) {
    for (; s.c >= 256; ) s.c -= 256;
    for (; s.r >= 65536; ) s.r -= 65536;
  }
  return s;
}
function ph(e, n, r) {
  var s = Vr(e);
  return s.s = ps(s.s, n.s, r), s.e = ps(s.e, n.s, r), s;
}
function xs(e, n) {
  if (e.cRel && e.c < 0)
    for (e = Vr(e); e.c < 0; ) e.c += n > 8 ? 16384 : 256;
  if (e.rRel && e.r < 0)
    for (e = Vr(e); e.r < 0; ) e.r += n > 8 ? 1048576 : n > 5 ? 65536 : 16384;
  var r = Ge(e);
  return !e.cRel && e.cRel != null && (r = iv(r)), !e.rRel && e.rRel != null && (r = nv(r)), r;
}
function uc(e, n) {
  return e.s.r == 0 && !e.s.rRel && e.e.r == (n.biff >= 12 ? 1048575 : n.biff >= 8 ? 65536 : 16384) && !e.e.rRel ? (e.s.cRel ? "" : "$") + Or(e.s.c) + ":" + (e.e.cRel ? "" : "$") + Or(e.e.c) : e.s.c == 0 && !e.s.cRel && e.e.c == (n.biff >= 12 ? 16383 : 255) && !e.e.cRel ? (e.s.rRel ? "" : "$") + Wr(e.s.r) + ":" + (e.e.rRel ? "" : "$") + Wr(e.e.r) : xs(e.s, n.biff) + ":" + xs(e.e, n.biff);
}
function Vc(e) {
  return parseInt(av(e), 10) - 1;
}
function Wr(e) {
  return "" + (e + 1);
}
function nv(e) {
  return e.replace(/([A-Z]|^)(\d+)$/, "$1$$$2");
}
function av(e) {
  return e.replace(/\$(\d+)$/, "$1");
}
function Wc(e) {
  for (var n = sv(e), r = 0, s = 0; s !== n.length; ++s) r = 26 * r + n.charCodeAt(s) - 64;
  return r - 1;
}
function Or(e) {
  if (e < 0) throw new Error("invalid column " + e);
  var n = "";
  for (++e; e; e = Math.floor((e - 1) / 26)) n = String.fromCharCode((e - 1) % 26 + 65) + n;
  return n;
}
function iv(e) {
  return e.replace(/^([A-Z])/, "$$$1");
}
function sv(e) {
  return e.replace(/^\$([A-Z])/, "$1");
}
function lv(e) {
  return e.replace(/(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",");
}
function ut(e) {
  for (var n = 0, r = 0, s = 0; s < e.length; ++s) {
    var i = e.charCodeAt(s);
    i >= 48 && i <= 57 ? n = 10 * n + (i - 48) : i >= 65 && i <= 90 && (r = 26 * r + (i - 64));
  }
  return { c: r - 1, r: n - 1 };
}
function Ge(e) {
  for (var n = e.c + 1, r = ""; n; n = (n - 1) / 26 | 0) r = String.fromCharCode((n - 1) % 26 + 65) + r;
  return r + (e.r + 1);
}
function yi(e) {
  var n = e.indexOf(":");
  return n == -1 ? { s: ut(e), e: ut(e) } : { s: ut(e.slice(0, n)), e: ut(e.slice(n + 1)) };
}
function Je(e, n) {
  return typeof n > "u" || typeof n == "number" ? Je(e.s, e.e) : (typeof e != "string" && (e = Ge(e)), typeof n != "string" && (n = Ge(n)), e == n ? e : e + ":" + n);
}
function vr(e) {
  var n = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } }, r = 0, s = 0, i = 0, o = e.length;
  for (r = 0; s < o && !((i = e.charCodeAt(s) - 64) < 1 || i > 26); ++s)
    r = 26 * r + i;
  for (n.s.c = --r, r = 0; s < o && !((i = e.charCodeAt(s) - 48) < 0 || i > 9); ++s)
    r = 10 * r + i;
  if (n.s.r = --r, s === o || i != 10)
    return n.e.c = n.s.c, n.e.r = n.s.r, n;
  for (++s, r = 0; s != o && !((i = e.charCodeAt(s) - 64) < 1 || i > 26); ++s)
    r = 26 * r + i;
  for (n.e.c = --r, r = 0; s != o && !((i = e.charCodeAt(s) - 48) < 0 || i > 9); ++s)
    r = 10 * r + i;
  return n.e.r = --r, n;
}
function xh(e, n) {
  var r = e.t == "d" && n instanceof Date;
  if (e.z != null) try {
    return e.w = Ut(e.z, r ? dt(n) : n);
  } catch {
  }
  try {
    return e.w = Ut((e.XF || {}).numFmtId || (r ? 14 : 0), r ? dt(n) : n);
  } catch {
    return "" + n;
  }
}
function Rn(e, n, r) {
  return e == null || e.t == null || e.t == "z" ? "" : e.w !== void 0 ? e.w : (e.t == "d" && !e.z && r && r.dateNF && (e.z = r.dateNF), e.t == "e" ? Ma[e.v] || e.v : n == null ? xh(e, e.v) : xh(e, n));
}
function la(e, n) {
  var r = n && n.sheet ? n.sheet : "Sheet1", s = {};
  return s[r] = e, { SheetNames: [r], Sheets: s };
}
function Mp(e, n, r) {
  var s = r || {}, i = e ? Array.isArray(e) : s.dense, o = e || (i ? [] : {}), c = 0, u = 0;
  if (o && s.origin != null) {
    if (typeof s.origin == "number") c = s.origin;
    else {
      var d = typeof s.origin == "string" ? ut(s.origin) : s.origin;
      c = d.r, u = d.c;
    }
    o["!ref"] || (o["!ref"] = "A1:A1");
  }
  var x = { s: { c: 1e7, r: 1e7 }, e: { c: 0, r: 0 } };
  if (o["!ref"]) {
    var p = vr(o["!ref"]);
    x.s.c = p.s.c, x.s.r = p.s.r, x.e.c = Math.max(x.e.c, p.e.c), x.e.r = Math.max(x.e.r, p.e.r), c == -1 && (x.e.r = c = p.e.r + 1);
  }
  for (var g = 0; g != n.length; ++g)
    if (n[g]) {
      if (!Array.isArray(n[g])) throw new Error("aoa_to_sheet expects an array of arrays");
      for (var w = 0; w != n[g].length; ++w)
        if (!(typeof n[g][w] > "u")) {
          var k = { v: n[g][w] }, _ = c + g, y = u + w;
          if (x.s.r > _ && (x.s.r = _), x.s.c > y && (x.s.c = y), x.e.r < _ && (x.e.r = _), x.e.c < y && (x.e.c = y), n[g][w] && typeof n[g][w] == "object" && !Array.isArray(n[g][w]) && !(n[g][w] instanceof Date)) k = n[g][w];
          else if (Array.isArray(k.v) && (k.f = n[g][w][1], k.v = k.v[0]), k.v === null)
            if (k.f) k.t = "n";
            else if (s.nullError)
              k.t = "e", k.v = 0;
            else if (s.sheetStubs) k.t = "z";
            else continue;
          else typeof k.v == "number" ? k.t = "n" : typeof k.v == "boolean" ? k.t = "b" : k.v instanceof Date ? (k.z = s.dateNF || $e[14], s.cellDates ? (k.t = "d", k.w = Ut(k.z, dt(k.v))) : (k.t = "n", k.v = dt(k.v), k.w = Ut(k.z, k.v))) : k.t = "s";
          if (i)
            o[_] || (o[_] = []), o[_][y] && o[_][y].z && (k.z = o[_][y].z), o[_][y] = k;
          else {
            var E = Ge({ c: y, r: _ });
            o[E] && o[E].z && (k.z = o[E].z), o[E] = k;
          }
        }
    }
  return x.s.c < 1e7 && (o["!ref"] = Je(x)), o;
}
function _i(e, n) {
  return Mp(null, e, n);
}
function ov(e) {
  return e.read_shift(4, "i");
}
function nt(e) {
  var n = e.read_shift(4);
  return n === 0 ? "" : e.read_shift(n, "dbcs");
}
function cv(e) {
  return { ich: e.read_shift(2), ifnt: e.read_shift(2) };
}
function Gc(e, n) {
  var r = e.l, s = e.read_shift(1), i = nt(e), o = [], c = { t: i, h: i };
  if ((s & 1) !== 0) {
    for (var u = e.read_shift(4), d = 0; d != u; ++d) o.push(cv(e));
    c.r = o;
  } else c.r = [{ ich: 0, ifnt: 0 }];
  return e.l = r + n, c;
}
var uv = Gc;
function zt(e) {
  var n = e.read_shift(4), r = e.read_shift(2);
  return r += e.read_shift(1) << 16, e.l++, { c: n, iStyleRef: r };
}
function Ia(e) {
  var n = e.read_shift(2);
  return n += e.read_shift(1) << 16, e.l++, { c: -1, iStyleRef: n };
}
var fv = nt;
function $c(e) {
  var n = e.read_shift(4);
  return n === 0 || n === 4294967295 ? "" : e.read_shift(n, "dbcs");
}
var dv = nt, _c = $c;
function Kc(e) {
  var n = e.slice(e.l, e.l + 4), r = n[0] & 1, s = n[0] & 2;
  e.l += 4;
  var i = s === 0 ? oo([0, 0, 0, 0, n[0] & 252, n[1], n[2], n[3]], 0) : Sa(n, 0) >> 2;
  return r ? i / 100 : i;
}
function Bp(e) {
  var n = { s: {}, e: {} };
  return n.s.r = e.read_shift(4), n.e.r = e.read_shift(4), n.s.c = e.read_shift(4), n.e.c = e.read_shift(4), n;
}
var La = Bp;
function rt(e) {
  if (e.length - e.l < 8) throw "XLS Xnum Buffer underflow";
  return e.read_shift(8, "f");
}
function hv(e) {
  var n = {}, r = e.read_shift(1), s = r >>> 1, i = e.read_shift(1), o = e.read_shift(2, "i"), c = e.read_shift(1), u = e.read_shift(1), d = e.read_shift(1);
  switch (e.l++, s) {
    case 0:
      n.auto = 1;
      break;
    case 1:
      n.index = i;
      var x = Na[i];
      x && (n.rgb = Ns(x));
      break;
    case 2:
      n.rgb = Ns([c, u, d]);
      break;
    case 3:
      n.theme = i;
      break;
  }
  return o != 0 && (n.tint = o > 0 ? o / 32767 : o / 32768), n;
}
function pv(e) {
  var n = e.read_shift(1);
  e.l++;
  var r = {
    fBold: n & 1,
    fItalic: n & 2,
    fUnderline: n & 4,
    fStrikeout: n & 8,
    fOutline: n & 16,
    fShadow: n & 32,
    fCondense: n & 64,
    fExtend: n & 128
  };
  return r;
}
function jp(e, n) {
  var r = { 2: "BITMAP", 3: "METAFILEPICT", 8: "DIB", 14: "ENHMETAFILE" }, s = e.read_shift(4);
  switch (s) {
    case 0:
      return "";
    case 4294967295:
    case 4294967294:
      return r[e.read_shift(4)] || "";
  }
  if (s > 400) throw new Error("Unsupported Clipboard: " + s.toString(16));
  return e.l -= 4, e.read_shift(0, n == 1 ? "lpstr" : "lpwstr");
}
function xv(e) {
  return jp(e, 1);
}
function mv(e) {
  return jp(e, 2);
}
var Xc = 2, yt = 3, ql = 11, mh = 12, co = 19, Jl = 64, gv = 65, vv = 71, wv = 4108, yv = 4126, Br = 80, Up = 81, _v = [Br, Up], kv = {
  /*::[*/
  1: { n: "CodePage", t: Xc },
  /*::[*/
  2: { n: "Category", t: Br },
  /*::[*/
  3: { n: "PresentationFormat", t: Br },
  /*::[*/
  4: { n: "ByteCount", t: yt },
  /*::[*/
  5: { n: "LineCount", t: yt },
  /*::[*/
  6: { n: "ParagraphCount", t: yt },
  /*::[*/
  7: { n: "SlideCount", t: yt },
  /*::[*/
  8: { n: "NoteCount", t: yt },
  /*::[*/
  9: { n: "HiddenCount", t: yt },
  /*::[*/
  10: { n: "MultimediaClipCount", t: yt },
  /*::[*/
  11: { n: "ScaleCrop", t: ql },
  /*::[*/
  12: {
    n: "HeadingPairs",
    t: wv
    /* VT_VECTOR | VT_VARIANT */
  },
  /*::[*/
  13: {
    n: "TitlesOfParts",
    t: yv
    /* VT_VECTOR | VT_LPSTR */
  },
  /*::[*/
  14: { n: "Manager", t: Br },
  /*::[*/
  15: { n: "Company", t: Br },
  /*::[*/
  16: { n: "LinksUpToDate", t: ql },
  /*::[*/
  17: { n: "CharacterCount", t: yt },
  /*::[*/
  19: { n: "SharedDoc", t: ql },
  /*::[*/
  22: { n: "HyperlinksChanged", t: ql },
  /*::[*/
  23: { n: "AppVersion", t: yt, p: "version" },
  /*::[*/
  24: { n: "DigSig", t: gv },
  /*::[*/
  26: { n: "ContentType", t: Br },
  /*::[*/
  27: { n: "ContentStatus", t: Br },
  /*::[*/
  28: { n: "Language", t: Br },
  /*::[*/
  29: { n: "Version", t: Br },
  /*::[*/
  255: {},
  /* [MS-OLEPS] 2.18 */
  /*::[*/
  2147483648: { n: "Locale", t: co },
  /*::[*/
  2147483651: { n: "Behavior", t: co },
  /*::[*/
  1919054434: {}
}, Ev = {
  /*::[*/
  1: { n: "CodePage", t: Xc },
  /*::[*/
  2: { n: "Title", t: Br },
  /*::[*/
  3: { n: "Subject", t: Br },
  /*::[*/
  4: { n: "Author", t: Br },
  /*::[*/
  5: { n: "Keywords", t: Br },
  /*::[*/
  6: { n: "Comments", t: Br },
  /*::[*/
  7: { n: "Template", t: Br },
  /*::[*/
  8: { n: "LastAuthor", t: Br },
  /*::[*/
  9: { n: "RevNumber", t: Br },
  /*::[*/
  10: { n: "EditTime", t: Jl },
  /*::[*/
  11: { n: "LastPrinted", t: Jl },
  /*::[*/
  12: { n: "CreatedDate", t: Jl },
  /*::[*/
  13: { n: "ModifiedDate", t: Jl },
  /*::[*/
  14: { n: "PageCount", t: yt },
  /*::[*/
  15: { n: "WordCount", t: yt },
  /*::[*/
  16: { n: "CharCount", t: yt },
  /*::[*/
  17: { n: "Thumbnail", t: vv },
  /*::[*/
  18: { n: "Application", t: Br },
  /*::[*/
  19: { n: "DocSecurity", t: yt },
  /*::[*/
  255: {},
  /* [MS-OLEPS] 2.18 */
  /*::[*/
  2147483648: { n: "Locale", t: co },
  /*::[*/
  2147483651: { n: "Behavior", t: co },
  /*::[*/
  1919054434: {}
}, gh = {
  /*::[*/
  1: "US",
  // United States
  /*::[*/
  2: "CA",
  // Canada
  /*::[*/
  3: "",
  // Latin America (except Brazil)
  /*::[*/
  7: "RU",
  // Russia
  /*::[*/
  20: "EG",
  // Egypt
  /*::[*/
  30: "GR",
  // Greece
  /*::[*/
  31: "NL",
  // Netherlands
  /*::[*/
  32: "BE",
  // Belgium
  /*::[*/
  33: "FR",
  // France
  /*::[*/
  34: "ES",
  // Spain
  /*::[*/
  36: "HU",
  // Hungary
  /*::[*/
  39: "IT",
  // Italy
  /*::[*/
  41: "CH",
  // Switzerland
  /*::[*/
  43: "AT",
  // Austria
  /*::[*/
  44: "GB",
  // United Kingdom
  /*::[*/
  45: "DK",
  // Denmark
  /*::[*/
  46: "SE",
  // Sweden
  /*::[*/
  47: "NO",
  // Norway
  /*::[*/
  48: "PL",
  // Poland
  /*::[*/
  49: "DE",
  // Germany
  /*::[*/
  52: "MX",
  // Mexico
  /*::[*/
  55: "BR",
  // Brazil
  /*::[*/
  61: "AU",
  // Australia
  /*::[*/
  64: "NZ",
  // New Zealand
  /*::[*/
  66: "TH",
  // Thailand
  /*::[*/
  81: "JP",
  // Japan
  /*::[*/
  82: "KR",
  // Korea
  /*::[*/
  84: "VN",
  // Viet Nam
  /*::[*/
  86: "CN",
  // China
  /*::[*/
  90: "TR",
  // Turkey
  /*::[*/
  105: "JS",
  // Ramastan
  /*::[*/
  213: "DZ",
  // Algeria
  /*::[*/
  216: "MA",
  // Morocco
  /*::[*/
  218: "LY",
  // Libya
  /*::[*/
  351: "PT",
  // Portugal
  /*::[*/
  354: "IS",
  // Iceland
  /*::[*/
  358: "FI",
  // Finland
  /*::[*/
  420: "CZ",
  // Czech Republic
  /*::[*/
  886: "TW",
  // Taiwan
  /*::[*/
  961: "LB",
  // Lebanon
  /*::[*/
  962: "JO",
  // Jordan
  /*::[*/
  963: "SY",
  // Syria
  /*::[*/
  964: "IQ",
  // Iraq
  /*::[*/
  965: "KW",
  // Kuwait
  /*::[*/
  966: "SA",
  // Saudi Arabia
  /*::[*/
  971: "AE",
  // United Arab Emirates
  /*::[*/
  972: "IL",
  // Israel
  /*::[*/
  974: "QA",
  // Qatar
  /*::[*/
  981: "IR",
  // Iran
  /*::[*/
  65535: "US"
  // United States
}, Sv = [
  null,
  "solid",
  "mediumGray",
  "darkGray",
  "lightGray",
  "darkHorizontal",
  "darkVertical",
  "darkDown",
  "darkUp",
  "darkGrid",
  "darkTrellis",
  "lightHorizontal",
  "lightVertical",
  "lightDown",
  "lightUp",
  "lightGrid",
  "lightTrellis",
  "gray125",
  "gray0625"
];
function Tv(e) {
  return e.map(function(n) {
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  });
}
var Cv = /* @__PURE__ */ Tv([
  /* Color Constants */
  0,
  16777215,
  16711680,
  65280,
  255,
  16776960,
  16711935,
  65535,
  /* Overridable Defaults */
  0,
  16777215,
  16711680,
  65280,
  255,
  16776960,
  16711935,
  65535,
  8388608,
  32768,
  128,
  8421376,
  8388736,
  32896,
  12632256,
  8421504,
  10066431,
  10040166,
  16777164,
  13434879,
  6684774,
  16744576,
  26316,
  13421823,
  128,
  16711935,
  16776960,
  65535,
  8388736,
  8388608,
  32896,
  255,
  52479,
  13434879,
  13434828,
  16777113,
  10079487,
  16751052,
  13408767,
  16764057,
  3368703,
  3394764,
  10079232,
  16763904,
  16750848,
  16737792,
  6710937,
  9868950,
  13158,
  3381606,
  13056,
  3355392,
  10040064,
  10040166,
  3355545,
  3355443,
  /* Other entries to appease BIFF8/12 */
  16777215,
  /* 0x40 icvForeground ?? */
  0,
  /* 0x41 icvBackground ?? */
  0,
  /* 0x42 icvFrame ?? */
  0,
  /* 0x43 icv3D ?? */
  0,
  /* 0x44 icv3DText ?? */
  0,
  /* 0x45 icv3DHilite ?? */
  0,
  /* 0x46 icv3DShadow ?? */
  0,
  /* 0x47 icvHilite ?? */
  0,
  /* 0x48 icvCtlText ?? */
  0,
  /* 0x49 icvCtlScrl ?? */
  0,
  /* 0x4A icvCtlInv ?? */
  0,
  /* 0x4B icvCtlBody ?? */
  0,
  /* 0x4C icvCtlFrame ?? */
  0,
  /* 0x4D icvCtlFore ?? */
  0,
  /* 0x4E icvCtlBack ?? */
  0,
  /* 0x4F icvCtlNeutral */
  0,
  /* 0x50 icvInfoBk ?? */
  0
  /* 0x51 icvInfoText ?? */
]), Na = /* @__PURE__ */ Vr(Cv), Ma = {
  /*::[*/
  0: "#NULL!",
  /*::[*/
  7: "#DIV/0!",
  /*::[*/
  15: "#VALUE!",
  /*::[*/
  23: "#REF!",
  /*::[*/
  29: "#NAME?",
  /*::[*/
  36: "#NUM!",
  /*::[*/
  42: "#N/A",
  /*::[*/
  43: "#GETTING_DATA",
  /*::[*/
  255: "#WTF?"
}, zp = {
  "#NULL!": 0,
  "#DIV/0!": 7,
  "#VALUE!": 15,
  "#REF!": 23,
  "#NAME?": 29,
  "#NUM!": 36,
  "#N/A": 42,
  "#GETTING_DATA": 43,
  "#WTF?": 255
}, vh = {
  /* Workbook */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": "workbooks",
  "application/vnd.ms-excel.sheet.macroEnabled.main+xml": "workbooks",
  "application/vnd.ms-excel.sheet.binary.macroEnabled.main": "workbooks",
  "application/vnd.ms-excel.addin.macroEnabled.main+xml": "workbooks",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": "workbooks",
  /* Worksheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": "sheets",
  "application/vnd.ms-excel.worksheet": "sheets",
  "application/vnd.ms-excel.binIndexWs": "TODO",
  /* Binary Index */
  /* Chartsheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": "charts",
  "application/vnd.ms-excel.chartsheet": "charts",
  /* Macrosheet */
  "application/vnd.ms-excel.macrosheet+xml": "macros",
  "application/vnd.ms-excel.macrosheet": "macros",
  "application/vnd.ms-excel.intlmacrosheet": "TODO",
  "application/vnd.ms-excel.binIndexMs": "TODO",
  /* Binary Index */
  /* Dialogsheet */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": "dialogs",
  "application/vnd.ms-excel.dialogsheet": "dialogs",
  /* Shared Strings */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml": "strs",
  "application/vnd.ms-excel.sharedStrings": "strs",
  /* Styles */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": "styles",
  "application/vnd.ms-excel.styles": "styles",
  /* File Properties */
  "application/vnd.openxmlformats-package.core-properties+xml": "coreprops",
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": "custprops",
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": "extprops",
  /* Custom Data Properties */
  "application/vnd.openxmlformats-officedocument.customXmlProperties+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.customProperty": "TODO",
  /* Comments */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": "comments",
  "application/vnd.ms-excel.comments": "comments",
  "application/vnd.ms-excel.threadedcomments+xml": "threadedcomments",
  "application/vnd.ms-excel.person+xml": "people",
  /* Metadata (Stock/Geography and Dynamic Array) */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml": "metadata",
  "application/vnd.ms-excel.sheetMetadata": "metadata",
  /* PivotTable */
  "application/vnd.ms-excel.pivotTable": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml": "TODO",
  /* Chart Objects */
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": "TODO",
  /* Chart Colors */
  "application/vnd.ms-office.chartcolorstyle+xml": "TODO",
  /* Chart Style */
  "application/vnd.ms-office.chartstyle+xml": "TODO",
  /* Chart Advanced */
  "application/vnd.ms-office.chartex+xml": "TODO",
  /* Calculation Chain */
  "application/vnd.ms-excel.calcChain": "calcchains",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml": "calcchains",
  /* Printer Settings */
  "application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings": "TODO",
  /* ActiveX */
  "application/vnd.ms-office.activeX": "TODO",
  "application/vnd.ms-office.activeX+xml": "TODO",
  /* Custom Toolbars */
  "application/vnd.ms-excel.attachedToolbars": "TODO",
  /* External Data Connections */
  "application/vnd.ms-excel.connections": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": "TODO",
  /* External Links */
  "application/vnd.ms-excel.externalLink": "links",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml": "links",
  /* PivotCache */
  "application/vnd.ms-excel.pivotCacheDefinition": "TODO",
  "application/vnd.ms-excel.pivotCacheRecords": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml": "TODO",
  /* Query Table */
  "application/vnd.ms-excel.queryTable": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml": "TODO",
  /* Shared Workbook */
  "application/vnd.ms-excel.userNames": "TODO",
  "application/vnd.ms-excel.revisionHeaders": "TODO",
  "application/vnd.ms-excel.revisionLog": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml": "TODO",
  /* Single Cell Table */
  "application/vnd.ms-excel.tableSingleCells": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml": "TODO",
  /* Slicer */
  "application/vnd.ms-excel.slicer": "TODO",
  "application/vnd.ms-excel.slicerCache": "TODO",
  "application/vnd.ms-excel.slicer+xml": "TODO",
  "application/vnd.ms-excel.slicerCache+xml": "TODO",
  /* Sort Map */
  "application/vnd.ms-excel.wsSortMap": "TODO",
  /* Table */
  "application/vnd.ms-excel.table": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": "TODO",
  /* Themes */
  "application/vnd.openxmlformats-officedocument.theme+xml": "themes",
  /* Theme Override */
  "application/vnd.openxmlformats-officedocument.themeOverride+xml": "TODO",
  /* Timeline */
  "application/vnd.ms-excel.Timeline+xml": "TODO",
  /* verify */
  "application/vnd.ms-excel.TimelineCache+xml": "TODO",
  /* verify */
  /* VBA */
  "application/vnd.ms-office.vbaProject": "vba",
  "application/vnd.ms-office.vbaProjectSignature": "TODO",
  /* Volatile Dependencies */
  "application/vnd.ms-office.volatileDependencies": "TODO",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml": "TODO",
  /* Control Properties */
  "application/vnd.ms-excel.controlproperties+xml": "TODO",
  /* Data Model */
  "application/vnd.openxmlformats-officedocument.model+data": "TODO",
  /* Survey */
  "application/vnd.ms-excel.Survey+xml": "TODO",
  /* Drawing */
  "application/vnd.openxmlformats-officedocument.drawing+xml": "drawings",
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml": "TODO",
  "application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml": "TODO",
  /* VML */
  "application/vnd.openxmlformats-officedocument.vmlDrawing": "TODO",
  "application/vnd.openxmlformats-package.relationships+xml": "rels",
  "application/vnd.openxmlformats-officedocument.oleObject": "TODO",
  /* Image */
  "image/png": "TODO",
  sheet: "js"
};
function Av() {
  return {
    workbooks: [],
    sheets: [],
    charts: [],
    dialogs: [],
    macros: [],
    rels: [],
    strs: [],
    comments: [],
    threadedcomments: [],
    links: [],
    coreprops: [],
    extprops: [],
    custprops: [],
    themes: [],
    styles: [],
    calcchains: [],
    vba: [],
    drawings: [],
    metadata: [],
    people: [],
    TODO: [],
    xmlns: ""
  };
}
function Fv(e) {
  var n = Av();
  if (!e || !e.match) return n;
  var r = {};
  if ((e.match(it) || []).forEach(function(s) {
    var i = Ue(s);
    switch (i[0].replace(Lg, "<")) {
      case "<?xml":
        break;
      case "<Types":
        n.xmlns = i["xmlns" + (i[0].match(/<(\w+):/) || ["", ""])[1]];
        break;
      case "<Default":
        r[i.Extension] = i.ContentType;
        break;
      case "<Override":
        n[vh[i.ContentType]] !== void 0 && n[vh[i.ContentType]].push(i.PartName);
        break;
    }
  }), n.xmlns !== Kg.CT) throw new Error("Unknown Namespace: " + n.xmlns);
  return n.calcchain = n.calcchains.length > 0 ? n.calcchains[0] : "", n.sst = n.strs.length > 0 ? n.strs[0] : "", n.style = n.styles.length > 0 ? n.styles[0] : "", n.defaults = r, delete n.calcchains, n;
}
var hi = {
  WB: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  SHEET: "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  HLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
  VML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
  XPATH: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath",
  XMISS: "http://schemas.microsoft.com/office/2006/relationships/xlExternalLinkPath/xlPathMissing",
  XLINK: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
  CXML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
  CXMLP: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
  CMNT: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
  CORE_PROPS: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
  EXT_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties",
  CUST_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties",
  SST: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
  STY: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
  THEME: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
  CHART: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
  CHARTEX: "http://schemas.microsoft.com/office/2014/relationships/chartEx",
  CS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartsheet",
  WS: [
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet"
  ],
  DS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/dialogsheet",
  MS: "http://schemas.microsoft.com/office/2006/relationships/xlMacrosheet",
  IMG: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
  DRAW: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
  XLMETA: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sheetMetadata",
  TCMNT: "http://schemas.microsoft.com/office/2017/10/relationships/threadedComment",
  PEOPLE: "http://schemas.microsoft.com/office/2017/10/relationships/person",
  VBA: "http://schemas.microsoft.com/office/2006/relationships/vbaProject"
};
function kc(e) {
  var n = e.lastIndexOf("/");
  return e.slice(0, n + 1) + "_rels/" + e.slice(n + 1) + ".rels";
}
function ms(e, n) {
  var r = { "!id": {} };
  if (!e) return r;
  n.charAt(0) !== "/" && (n = "/" + n);
  var s = {};
  return (e.match(it) || []).forEach(function(i) {
    var o = Ue(i);
    if (o[0] === "<Relationship") {
      var c = {};
      c.Type = o.Type, c.Target = o.Target, c.Id = o.Id, o.TargetMode && (c.TargetMode = o.TargetMode);
      var u = o.TargetMode === "External" ? o.Target : us(o.Target, n);
      r[u] = c, s[o.Id] = c;
    }
  }), r["!id"] = s, r;
}
var Nv = "application/vnd.oasis.opendocument.spreadsheet";
function Rv(e, n) {
  for (var r = zc(e), s, i; s = As.exec(r); ) switch (s[3]) {
    case "manifest":
      break;
    // 4.2 <manifest:manifest>
    case "file-entry":
      if (i = Ue(s[0], !1), i.path == "/" && i.type !== Nv) throw new Error("This OpenDocument is not a spreadsheet");
      break;
    case "encryption-data":
    // 4.4 <manifest:encryption-data>
    case "algorithm":
    // 4.5 <manifest:algorithm>
    case "start-key-generation":
    // 4.6 <manifest:start-key-generation>
    case "key-derivation":
      throw new Error("Unsupported ODS Encryption");
    default:
      if (n && n.WTF) throw s;
  }
}
var gs = [
  ["cp:category", "Category"],
  ["cp:contentStatus", "ContentStatus"],
  ["cp:keywords", "Keywords"],
  ["cp:lastModifiedBy", "LastAuthor"],
  ["cp:lastPrinted", "LastPrinted"],
  ["cp:revision", "RevNumber"],
  ["cp:version", "Version"],
  ["dc:creator", "Author"],
  ["dc:description", "Comments"],
  ["dc:identifier", "Identifier"],
  ["dc:language", "Language"],
  ["dc:subject", "Subject"],
  ["dc:title", "Title"],
  ["dcterms:created", "CreatedDate", "date"],
  ["dcterms:modified", "ModifiedDate", "date"]
], Dv = /* @__PURE__ */ (function() {
  for (var e = new Array(gs.length), n = 0; n < gs.length; ++n) {
    var r = gs[n], s = "(?:" + r[0].slice(0, r[0].indexOf(":")) + ":)" + r[0].slice(r[0].indexOf(":") + 1);
    e[n] = new RegExp("<" + s + "[^>]*>([\\s\\S]*?)</" + s + ">");
  }
  return e;
})();
function Hp(e) {
  var n = {};
  e = lr(e);
  for (var r = 0; r < gs.length; ++r) {
    var s = gs[r], i = e.match(Dv[r]);
    i != null && i.length > 0 && (n[s[1]] = er(i[1])), s[2] === "date" && n[s[1]] && (n[s[1]] = jr(n[s[1]]));
  }
  return n;
}
var Ov = [
  ["Application", "Application", "string"],
  ["AppVersion", "AppVersion", "string"],
  ["Company", "Company", "string"],
  ["DocSecurity", "DocSecurity", "string"],
  ["Manager", "Manager", "string"],
  ["HyperlinksChanged", "HyperlinksChanged", "bool"],
  ["SharedDoc", "SharedDoc", "bool"],
  ["LinksUpToDate", "LinksUpToDate", "bool"],
  ["ScaleCrop", "ScaleCrop", "bool"],
  ["HeadingPairs", "HeadingPairs", "raw"],
  ["TitlesOfParts", "TitlesOfParts", "raw"]
];
function Vp(e, n, r, s) {
  var i = [];
  if (typeof e == "string") i = oh(e, s);
  else for (var o = 0; o < e.length; ++o) i = i.concat(e[o].map(function(p) {
    return { v: p };
  }));
  var c = typeof n == "string" ? oh(n, s).map(function(p) {
    return p.v;
  }) : n, u = 0, d = 0;
  if (c.length > 0) for (var x = 0; x !== i.length; x += 2) {
    switch (d = +i[x + 1].v, i[x].v) {
      case "Worksheets":
      case "工作表":
      case "Листы":
      case "أوراق العمل":
      case "ワークシート":
      case "גליונות עבודה":
      case "Arbeitsblätter":
      case "Çalışma Sayfaları":
      case "Feuilles de calcul":
      case "Fogli di lavoro":
      case "Folhas de cálculo":
      case "Planilhas":
      case "Regneark":
      case "Hojas de cálculo":
      case "Werkbladen":
        r.Worksheets = d, r.SheetNames = c.slice(u, u + d);
        break;
      case "Named Ranges":
      case "Rangos con nombre":
      case "名前付き一覧":
      case "Benannte Bereiche":
      case "Navngivne områder":
        r.NamedRanges = d, r.DefinedNames = c.slice(u, u + d);
        break;
      case "Charts":
      case "Diagramme":
        r.Chartsheets = d, r.ChartNames = c.slice(u, u + d);
        break;
    }
    u += d;
  }
}
function Pv(e, n, r) {
  var s = {};
  return n || (n = {}), e = lr(e), Ov.forEach(function(i) {
    var o = (e.match(Cs(i[0])) || [])[1];
    switch (i[2]) {
      case "string":
        o && (n[i[1]] = er(o));
        break;
      case "bool":
        n[i[1]] = o === "true";
        break;
      case "raw":
        var c = e.match(new RegExp("<" + i[0] + "[^>]*>([\\s\\S]*?)</" + i[0] + ">"));
        c && c.length > 0 && (s[i[1]] = c[1]);
        break;
    }
  }), s.HeadingPairs && s.TitlesOfParts && Vp(s.HeadingPairs, s.TitlesOfParts, n, r), n;
}
var bv = /<[^>]+>[^<]*/g;
function Iv(e, n) {
  var r = {}, s = "", i = e.match(bv);
  if (i) for (var o = 0; o != i.length; ++o) {
    var c = i[o], u = Ue(c);
    switch (u[0]) {
      case "<?xml":
        break;
      case "<Properties":
        break;
      case "<property":
        s = er(u.name);
        break;
      case "</property>":
        s = null;
        break;
      default:
        if (c.indexOf("<vt:") === 0) {
          var d = c.split(">"), x = d[0].slice(4), p = d[1];
          switch (x) {
            case "lpstr":
            case "bstr":
            case "lpwstr":
              r[s] = er(p);
              break;
            case "bool":
              r[s] = dr(p);
              break;
            case "i1":
            case "i2":
            case "i4":
            case "i8":
            case "int":
            case "uint":
              r[s] = parseInt(p, 10);
              break;
            case "r4":
            case "r8":
            case "decimal":
              r[s] = parseFloat(p);
              break;
            case "filetime":
            case "date":
              r[s] = jr(p);
              break;
            case "cy":
            case "error":
              r[s] = er(p);
              break;
            default:
              if (x.slice(-1) == "/") break;
              n.WTF && typeof console < "u" && console.warn("Unexpected", c, x, d);
          }
        } else if (c.slice(0, 2) !== "</") {
          if (n.WTF) throw new Error(c);
        }
    }
  }
  return r;
}
var Lv = {
  Title: "Title",
  Subject: "Subject",
  Author: "Author",
  Keywords: "Keywords",
  Comments: "Description",
  LastAuthor: "LastAuthor",
  RevNumber: "Revision",
  Application: "AppName",
  /* TotalTime: 'TotalTime', */
  LastPrinted: "LastPrinted",
  CreatedDate: "Created",
  ModifiedDate: "LastSaved",
  /* Pages */
  /* Words */
  /* Characters */
  Category: "Category",
  /* PresentationFormat */
  Manager: "Manager",
  Company: "Company",
  /* Guid */
  /* HyperlinkBase */
  /* Bytes */
  /* Lines */
  /* Paragraphs */
  /* CharactersWithSpaces */
  AppVersion: "Version",
  ContentStatus: "ContentStatus",
  /* NOTE: missing from schema */
  Identifier: "Identifier",
  /* NOTE: missing from schema */
  Language: "Language"
  /* NOTE: missing from schema */
}, fc;
function Mv(e, n, r) {
  fc || (fc = Bc(Lv)), n = fc[n] || n, e[n] = r;
}
function Yc(e) {
  var n = e.read_shift(4), r = e.read_shift(4);
  return new Date((r / 1e7 * Math.pow(2, 32) + n / 1e7 - 11644473600) * 1e3).toISOString().replace(/\.000/, "");
}
function Wp(e, n, r) {
  var s = e.l, i = e.read_shift(0, "lpstr-cp");
  if (r) for (; e.l - s & 3; ) ++e.l;
  return i;
}
function Gp(e, n, r) {
  var s = e.read_shift(0, "lpwstr");
  return s;
}
function $p(e, n, r) {
  return n === 31 ? Gp(e) : Wp(e, n, r);
}
function Ec(e, n, r) {
  return $p(e, n, r === !1 ? 0 : 4);
}
function Bv(e, n) {
  if (!n) throw new Error("VtUnalignedString must have positive length");
  return $p(e, n, 0);
}
function jv(e) {
  for (var n = e.read_shift(4), r = [], s = 0; s != n; ++s) {
    var i = e.l;
    r[s] = e.read_shift(0, "lpwstr").replace(ft, ""), e.l - i & 2 && (e.l += 2);
  }
  return r;
}
function Uv(e) {
  for (var n = e.read_shift(4), r = [], s = 0; s != n; ++s) r[s] = e.read_shift(0, "lpstr-cp").replace(ft, "");
  return r;
}
function zv(e) {
  var n = e.l, r = uo(e, Up);
  e[e.l] == 0 && e[e.l + 1] == 0 && e.l - n & 2 && (e.l += 2);
  var s = uo(e, yt);
  return [r, s];
}
function Hv(e) {
  for (var n = e.read_shift(4), r = [], s = 0; s < n / 2; ++s) r.push(zv(e));
  return r;
}
function wh(e, n) {
  for (var r = e.read_shift(4), s = {}, i = 0; i != r; ++i) {
    var o = e.read_shift(4), c = e.read_shift(4);
    s[o] = e.read_shift(c, n === 1200 ? "utf16le" : "utf8").replace(ft, "").replace(cs, "!"), n === 1200 && c % 2 && (e.l += 2);
  }
  return e.l & 3 && (e.l = e.l >> 3 << 2), s;
}
function Kp(e) {
  var n = e.read_shift(4), r = e.slice(e.l, e.l + n);
  return e.l += n, (n & 3) > 0 && (e.l += 4 - (n & 3) & 3), r;
}
function Vv(e) {
  var n = {};
  return n.Size = e.read_shift(4), e.l += n.Size + 3 - (n.Size - 1) % 4, n;
}
function uo(e, n, r) {
  var s = e.read_shift(2), i, o = r || {};
  if (e.l += 2, n !== mh && s !== n && _v.indexOf(n) === -1 && !((n & 65534) == 4126 && (s & 65534) == 4126))
    throw new Error("Expected type " + n + " saw " + s);
  switch (n === mh ? s : n) {
    case 2:
      return i = e.read_shift(2, "i"), o.raw || (e.l += 2), i;
    case 3:
      return i = e.read_shift(4, "i"), i;
    case 11:
      return e.read_shift(4) !== 0;
    case 19:
      return i = e.read_shift(4), i;
    case 30:
      return Wp(e, s, 4).replace(ft, "");
    case 31:
      return Gp(e);
    case 64:
      return Yc(e);
    case 65:
      return Kp(e);
    case 71:
      return Vv(e);
    case 80:
      return Ec(e, s, !o.raw).replace(ft, "");
    case 81:
      return Bv(
        e,
        s
        /*, 4*/
      ).replace(ft, "");
    case 4108:
      return Hv(e);
    case 4126:
    case 4127:
      return s == 4127 ? jv(e) : Uv(e);
    default:
      throw new Error("TypedPropertyValue unrecognized type " + n + " " + s);
  }
}
function yh(e, n) {
  var r = e.l, s = e.read_shift(4), i = e.read_shift(4), o = [], c = 0, u = 0, d = -1, x = {};
  for (c = 0; c != i; ++c) {
    var p = e.read_shift(4), g = e.read_shift(4);
    o[c] = [p, g + r];
  }
  o.sort(function(O, N) {
    return O[1] - N[1];
  });
  var w = {};
  for (c = 0; c != i; ++c) {
    if (e.l !== o[c][1]) {
      var k = !0;
      if (c > 0 && n) switch (n[o[c - 1][0]].t) {
        case 2:
          e.l + 2 === o[c][1] && (e.l += 2, k = !1);
          break;
        case 80:
          e.l <= o[c][1] && (e.l = o[c][1], k = !1);
          break;
        case 4108:
          e.l <= o[c][1] && (e.l = o[c][1], k = !1);
          break;
      }
      if ((!n || c == 0) && e.l <= o[c][1] && (k = !1, e.l = o[c][1]), k) throw new Error("Read Error: Expected address " + o[c][1] + " at " + e.l + " :" + c);
    }
    if (n) {
      var _ = n[o[c][0]];
      if (w[_.n] = uo(e, _.t, { raw: !0 }), _.p === "version" && (w[_.n] = String(w[_.n] >> 16) + "." + ("0000" + String(w[_.n] & 65535)).slice(-4)), _.n == "CodePage") switch (w[_.n]) {
        case 0:
          w[_.n] = 1252;
        /* falls through */
        case 874:
        case 932:
        case 936:
        case 949:
        case 950:
        case 1250:
        case 1251:
        case 1253:
        case 1254:
        case 1255:
        case 1256:
        case 1257:
        case 1258:
        case 1e4:
        case 1200:
        case 1201:
        case 1252:
        case 65e3:
        case -536:
        case 65001:
        case -535:
          Zt(u = w[_.n] >>> 0 & 65535);
          break;
        default:
          throw new Error("Unsupported CodePage: " + w[_.n]);
      }
    } else if (o[c][0] === 1) {
      if (u = w.CodePage = uo(e, Xc), Zt(u), d !== -1) {
        var y = e.l;
        e.l = o[d][1], x = wh(e, u), e.l = y;
      }
    } else if (o[c][0] === 0) {
      if (u === 0) {
        d = c, e.l = o[c + 1][1];
        continue;
      }
      x = wh(e, u);
    } else {
      var E = x[o[c][0]], A;
      switch (e[e.l]) {
        case 65:
          e.l += 4, A = Kp(e);
          break;
        case 30:
          e.l += 4, A = Ec(e, e[e.l - 4]).replace(/\u0000+$/, "");
          break;
        case 31:
          e.l += 4, A = Ec(e, e[e.l - 4]).replace(/\u0000+$/, "");
          break;
        case 3:
          e.l += 4, A = e.read_shift(4, "i");
          break;
        case 19:
          e.l += 4, A = e.read_shift(4);
          break;
        case 5:
          e.l += 4, A = e.read_shift(8, "f");
          break;
        case 11:
          e.l += 4, A = kr(e, 4);
          break;
        case 64:
          e.l += 4, A = jr(Yc(e));
          break;
        default:
          throw new Error("unparsed value: " + e[e.l]);
      }
      w[E] = A;
    }
  }
  return e.l = r + s, w;
}
function _h(e, n, r) {
  var s = e.content;
  if (!s) return {};
  Hr(s, 0);
  var i, o, c, u, d = 0;
  s.chk("feff", "Byte Order: "), s.read_shift(2);
  var x = s.read_shift(4), p = s.read_shift(16);
  if (p !== qe.utils.consts.HEADER_CLSID && p !== r) throw new Error("Bad PropertySet CLSID " + p);
  if (i = s.read_shift(4), i !== 1 && i !== 2) throw new Error("Unrecognized #Sets: " + i);
  if (o = s.read_shift(16), u = s.read_shift(4), i === 1 && u !== s.l) throw new Error("Length mismatch: " + u + " !== " + s.l);
  i === 2 && (c = s.read_shift(16), d = s.read_shift(4));
  var g = yh(s, n), w = { SystemIdentifier: x };
  for (var k in g) w[k] = g[k];
  if (w.FMTID = o, i === 1) return w;
  if (d - s.l == 2 && (s.l += 2), s.l !== d) throw new Error("Length mismatch 2: " + s.l + " !== " + d);
  var _;
  try {
    _ = yh(s, null);
  } catch {
  }
  for (k in _) w[k] = _[k];
  return w.FMTID = [o, c], w;
}
function ea(e, n) {
  return e.read_shift(n), null;
}
function Wv(e, n, r) {
  for (var s = [], i = e.l + n; e.l < i; ) s.push(r(e, i - e.l));
  if (i !== e.l) throw new Error("Slurp error");
  return s;
}
function kr(e, n) {
  return e.read_shift(n) === 1;
}
function Ar(e) {
  return e.read_shift(2, "u");
}
function Xp(e, n) {
  return Wv(e, n, Ar);
}
function Gv(e) {
  var n = e.read_shift(1), r = e.read_shift(1);
  return r === 1 ? n : n === 1;
}
function bs(e, n, r) {
  var s = e.read_shift(r && r.biff >= 12 ? 2 : 1), i = "sbcs-cont";
  if (r && r.biff >= 8, !r || r.biff == 8) {
    var o = e.read_shift(1);
    o && (i = "dbcs-cont");
  } else r.biff == 12 && (i = "wstr");
  r.biff >= 2 && r.biff <= 5 && (i = "cpstr");
  var c = s ? e.read_shift(s, i) : "";
  return c;
}
function $v(e) {
  var n = e.read_shift(2), r = e.read_shift(1), s = r & 4, i = r & 8, o = 1 + (r & 1), c = 0, u, d = {};
  i && (c = e.read_shift(2)), s && (u = e.read_shift(4));
  var x = o == 2 ? "dbcs-cont" : "sbcs-cont", p = n === 0 ? "" : e.read_shift(n, x);
  return i && (e.l += 4 * c), s && (e.l += u), d.t = p, i || (d.raw = "<t>" + d.t + "</t>", d.r = d.t), d;
}
function Oa(e, n, r) {
  var s;
  if (r) {
    if (r.biff >= 2 && r.biff <= 5) return e.read_shift(n, "cpstr");
    if (r.biff >= 12) return e.read_shift(n, "dbcs-cont");
  }
  var i = e.read_shift(1);
  return i === 0 ? s = e.read_shift(n, "sbcs-cont") : s = e.read_shift(n, "dbcs-cont"), s;
}
function Is(e, n, r) {
  var s = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return s === 0 ? (e.l++, "") : Oa(e, s, r);
}
function Ba(e, n, r) {
  if (r.biff > 5) return Is(e, n, r);
  var s = e.read_shift(1);
  return s === 0 ? (e.l++, "") : e.read_shift(s, r.biff <= 4 || !e.lens ? "cpstr" : "sbcs-cont");
}
function Kv(e) {
  var n = e.read_shift(1);
  e.l++;
  var r = e.read_shift(2);
  return e.l += 2, [n, r];
}
function Xv(e) {
  var n = e.read_shift(4), r = e.l, s = !1;
  n > 24 && (e.l += n - 24, e.read_shift(16) === "795881f43b1d7f48af2c825dc4852763" && (s = !0), e.l = r);
  var i = e.read_shift((s ? n - 24 : n) >> 1, "utf16le").replace(ft, "");
  return s && (e.l += 24), i;
}
function Yv(e) {
  for (var n = e.read_shift(2), r = ""; n-- > 0; ) r += "../";
  var s = e.read_shift(0, "lpstr-ansi");
  if (e.l += 2, e.read_shift(2) != 57005) throw new Error("Bad FileMoniker");
  var i = e.read_shift(4);
  if (i === 0) return r + s.replace(/\\/g, "/");
  var o = e.read_shift(4);
  if (e.read_shift(2) != 3) throw new Error("Bad FileMoniker");
  var c = e.read_shift(o >> 1, "utf16le").replace(ft, "");
  return r + c;
}
function Qv(e, n) {
  var r = e.read_shift(16);
  switch (r) {
    case "e0c9ea79f9bace118c8200aa004ba90b":
      return Xv(e);
    case "0303000000000000c000000000000046":
      return Yv(e);
    default:
      throw new Error("Unsupported Moniker " + r);
  }
}
function Zl(e) {
  var n = e.read_shift(4), r = n > 0 ? e.read_shift(n, "utf16le").replace(ft, "") : "";
  return r;
}
function qv(e, n) {
  var r = e.l + n, s = e.read_shift(4);
  if (s !== 2) throw new Error("Unrecognized streamVersion: " + s);
  var i = e.read_shift(2);
  e.l += 2;
  var o, c, u, d, x = "", p, g;
  i & 16 && (o = Zl(e, r - e.l)), i & 128 && (c = Zl(e, r - e.l)), (i & 257) === 257 && (u = Zl(e, r - e.l)), (i & 257) === 1 && (d = Qv(e, r - e.l)), i & 8 && (x = Zl(e, r - e.l)), i & 32 && (p = e.read_shift(16)), i & 64 && (g = Yc(
    e
    /*, 8*/
  )), e.l = r;
  var w = c || u || d || "";
  w && x && (w += "#" + x), w || (w = "#" + x), i & 2 && w.charAt(0) == "/" && w.charAt(1) != "/" && (w = "file://" + w);
  var k = { Target: w };
  return p && (k.guid = p), g && (k.time = g), o && (k.Tooltip = o), k;
}
function Yp(e) {
  var n = e.read_shift(1), r = e.read_shift(1), s = e.read_shift(1), i = e.read_shift(1);
  return [n, r, s, i];
}
function Qp(e, n) {
  var r = Yp(e);
  return r[3] = 0, r;
}
function hn(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(2);
  return { r: n, c: r, ixfe: s };
}
function Jv(e) {
  var n = e.read_shift(2), r = e.read_shift(2);
  return e.l += 8, { type: n, flags: r };
}
function Zv(e, n, r) {
  return n === 0 ? "" : Ba(e, n, r);
}
function e2(e, n, r) {
  var s = r.biff > 8 ? 4 : 2, i = e.read_shift(s), o = e.read_shift(s, "i"), c = e.read_shift(s, "i");
  return [i, o, c];
}
function qp(e) {
  var n = e.read_shift(2), r = Kc(e);
  return [n, r];
}
function r2(e, n, r) {
  e.l += 4, n -= 4;
  var s = e.l + n, i = bs(e, n, r), o = e.read_shift(2);
  if (s -= e.l, o !== s) throw new Error("Malformed AddinUdf: padding = " + s + " != " + o);
  return e.l += o, i;
}
function vo(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(2), i = e.read_shift(2);
  return { s: { c: s, r: n }, e: { c: i, r } };
}
function Jp(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(1), i = e.read_shift(1);
  return { s: { c: s, r: n }, e: { c: i, r } };
}
var t2 = Jp;
function Zp(e) {
  e.l += 4;
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(2);
  return e.l += 12, [r, n, s];
}
function n2(e) {
  var n = {};
  return e.l += 4, e.l += 16, n.fSharedNote = e.read_shift(2), e.l += 4, n;
}
function a2(e) {
  var n = {};
  return e.l += 4, e.cf = e.read_shift(2), n;
}
function Zr(e) {
  e.l += 2, e.l += e.read_shift(2);
}
var i2 = {
  /*::[*/
  0: Zr,
  /* FtEnd */
  /*::[*/
  4: Zr,
  /* FtMacro */
  /*::[*/
  5: Zr,
  /* FtButton */
  /*::[*/
  6: Zr,
  /* FtGmo */
  /*::[*/
  7: a2,
  /* FtCf */
  /*::[*/
  8: Zr,
  /* FtPioGrbit */
  /*::[*/
  9: Zr,
  /* FtPictFmla */
  /*::[*/
  10: Zr,
  /* FtCbls */
  /*::[*/
  11: Zr,
  /* FtRbo */
  /*::[*/
  12: Zr,
  /* FtSbs */
  /*::[*/
  13: n2,
  /* FtNts */
  /*::[*/
  14: Zr,
  /* FtSbsFmla */
  /*::[*/
  15: Zr,
  /* FtGboData */
  /*::[*/
  16: Zr,
  /* FtEdoData */
  /*::[*/
  17: Zr,
  /* FtRboData */
  /*::[*/
  18: Zr,
  /* FtCblsData */
  /*::[*/
  19: Zr,
  /* FtLbsData */
  /*::[*/
  20: Zr,
  /* FtCblsFmla */
  /*::[*/
  21: Zp
};
function s2(e, n) {
  for (var r = e.l + n, s = []; e.l < r; ) {
    var i = e.read_shift(2);
    e.l -= 2;
    try {
      s.push(i2[i](e, r - e.l));
    } catch {
      return e.l = r, s;
    }
  }
  return e.l != r && (e.l = r), s;
}
function eo(e, n) {
  var r = { BIFFVer: 0, dt: 0 };
  switch (r.BIFFVer = e.read_shift(2), n -= 2, n >= 2 && (r.dt = e.read_shift(2), e.l -= 2), r.BIFFVer) {
    case 1536:
    /* BIFF8 */
    case 1280:
    /* BIFF5 */
    case 1024:
    /* BIFF4 */
    case 768:
    /* BIFF3 */
    case 512:
    /* BIFF2 */
    case 2:
    case 7:
      break;
    default:
      if (n > 6) throw new Error("Unexpected BIFF Ver " + r.BIFFVer);
  }
  return e.read_shift(n), r;
}
function l2(e, n) {
  return n === 0 || e.read_shift(2), 1200;
}
function o2(e, n, r) {
  if (r.enc)
    return e.l += n, "";
  var s = e.l, i = Ba(e, 0, r);
  return e.read_shift(n + s - e.l), i;
}
function c2(e, n, r) {
  var s = r && r.biff == 8 || n == 2 ? e.read_shift(2) : (e.l += n, 0);
  return { fDialog: s & 16, fBelow: s & 64, fRight: s & 128 };
}
function u2(e, n, r) {
  var s = e.read_shift(4), i = e.read_shift(1) & 3, o = e.read_shift(1);
  switch (o) {
    case 0:
      o = "Worksheet";
      break;
    case 1:
      o = "Macrosheet";
      break;
    case 2:
      o = "Chartsheet";
      break;
    case 6:
      o = "VBAModule";
      break;
  }
  var c = bs(e, 0, r);
  return c.length === 0 && (c = "Sheet1"), { pos: s, hs: i, dt: o, name: c };
}
function f2(e, n) {
  for (var r = e.l + n, s = e.read_shift(4), i = e.read_shift(4), o = [], c = 0; c != i && e.l < r; ++c)
    o.push($v(e));
  return o.Count = s, o.Unique = i, o;
}
function d2(e, n) {
  var r = {};
  return r.dsst = e.read_shift(2), e.l += n - 2, r;
}
function h2(e) {
  var n = {};
  n.r = e.read_shift(2), n.c = e.read_shift(2), n.cnt = e.read_shift(2) - n.c;
  var r = e.read_shift(2);
  e.l += 4;
  var s = e.read_shift(1);
  return e.l += 3, s & 7 && (n.level = s & 7), s & 32 && (n.hidden = !0), s & 64 && (n.hpt = r / 20), n;
}
function p2(e) {
  var n = Jv(e);
  if (n.type != 2211) throw new Error("Invalid Future Record " + n.type);
  var r = e.read_shift(4);
  return r !== 0;
}
function x2(e) {
  return e.read_shift(2), e.read_shift(4);
}
function kh(e, n, r) {
  var s = 0;
  r && r.biff == 2 || (s = e.read_shift(2));
  var i = e.read_shift(2);
  r && r.biff == 2 && (s = 1 - (i >> 15), i &= 32767);
  var o = { Unsynced: s & 1, DyZero: (s & 2) >> 1, ExAsc: (s & 4) >> 2, ExDsc: (s & 8) >> 3 };
  return [o, i];
}
function m2(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(2), i = e.read_shift(2), o = e.read_shift(2), c = e.read_shift(2), u = e.read_shift(2), d = e.read_shift(2), x = e.read_shift(2);
  return {
    Pos: [n, r],
    Dim: [s, i],
    Flags: o,
    CurTab: c,
    FirstTab: u,
    Selected: d,
    TabRatio: x
  };
}
function g2(e, n, r) {
  if (r && r.biff >= 2 && r.biff < 5) return {};
  var s = e.read_shift(2);
  return { RTL: s & 64 };
}
function v2() {
}
function w2(e, n, r) {
  var s = {
    dyHeight: e.read_shift(2),
    fl: e.read_shift(2)
  };
  switch (r && r.biff || 8) {
    case 2:
      break;
    case 3:
    case 4:
      e.l += 2;
      break;
    default:
      e.l += 10;
      break;
  }
  return s.name = bs(e, 0, r), s;
}
function y2(e) {
  var n = hn(e);
  return n.isst = e.read_shift(4), n;
}
function _2(e, n, r) {
  r.biffguess && r.biff == 2 && (r.biff = 5);
  var s = e.l + n, i = hn(e);
  r.biff == 2 && e.l++;
  var o = Is(e, s - e.l, r);
  return i.val = o, i;
}
function k2(e, n, r) {
  var s = e.read_shift(2), i = Ba(e, 0, r);
  return [s, i];
}
var E2 = Ba;
function Eh(e, n, r) {
  var s = e.l + n, i = r.biff == 8 || !r.biff ? 4 : 2, o = e.read_shift(i), c = e.read_shift(i), u = e.read_shift(2), d = e.read_shift(2);
  return e.l = s, { s: { r: o, c: u }, e: { r: c, c: d } };
}
function S2(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = qp(e);
  return { r: n, c: r, ixfe: s[0], rknum: s[1] };
}
function T2(e, n) {
  for (var r = e.l + n - 2, s = e.read_shift(2), i = e.read_shift(2), o = []; e.l < r; ) o.push(qp(e));
  if (e.l !== r) throw new Error("MulRK read error");
  var c = e.read_shift(2);
  if (o.length != c - i + 1) throw new Error("MulRK length mismatch");
  return { r: s, c: i, C: c, rkrec: o };
}
function C2(e, n) {
  for (var r = e.l + n - 2, s = e.read_shift(2), i = e.read_shift(2), o = []; e.l < r; ) o.push(e.read_shift(2));
  if (e.l !== r) throw new Error("MulBlank read error");
  var c = e.read_shift(2);
  if (o.length != c - i + 1) throw new Error("MulBlank length mismatch");
  return { r: s, c: i, C: c, ixfe: o };
}
function A2(e, n, r, s) {
  var i = {}, o = e.read_shift(4), c = e.read_shift(4), u = e.read_shift(4), d = e.read_shift(2);
  return i.patternType = Sv[u >> 26], s.cellStyles && (i.alc = o & 7, i.fWrap = o >> 3 & 1, i.alcV = o >> 4 & 7, i.fJustLast = o >> 7 & 1, i.trot = o >> 8 & 255, i.cIndent = o >> 16 & 15, i.fShrinkToFit = o >> 20 & 1, i.iReadOrder = o >> 22 & 2, i.fAtrNum = o >> 26 & 1, i.fAtrFnt = o >> 27 & 1, i.fAtrAlc = o >> 28 & 1, i.fAtrBdr = o >> 29 & 1, i.fAtrPat = o >> 30 & 1, i.fAtrProt = o >> 31 & 1, i.dgLeft = c & 15, i.dgRight = c >> 4 & 15, i.dgTop = c >> 8 & 15, i.dgBottom = c >> 12 & 15, i.icvLeft = c >> 16 & 127, i.icvRight = c >> 23 & 127, i.grbitDiag = c >> 30 & 3, i.icvTop = u & 127, i.icvBottom = u >> 7 & 127, i.icvDiag = u >> 14 & 127, i.dgDiag = u >> 21 & 15, i.icvFore = d & 127, i.icvBack = d >> 7 & 127, i.fsxButton = d >> 14 & 1), i;
}
function F2(e, n, r) {
  var s = {};
  return s.ifnt = e.read_shift(2), s.numFmtId = e.read_shift(2), s.flags = e.read_shift(2), s.fStyle = s.flags >> 2 & 1, n -= 6, s.data = A2(e, n, s.fStyle, r), s;
}
function N2(e) {
  e.l += 4;
  var n = [e.read_shift(2), e.read_shift(2)];
  if (n[0] !== 0 && n[0]--, n[1] !== 0 && n[1]--, n[0] > 7 || n[1] > 7) throw new Error("Bad Gutters: " + n.join("|"));
  return n;
}
function Sh(e, n, r) {
  var s = hn(e);
  (r.biff == 2 || n == 9) && ++e.l;
  var i = Gv(e);
  return s.val = i, s.t = i === !0 || i === !1 ? "b" : "e", s;
}
function R2(e, n, r) {
  r.biffguess && r.biff == 2 && (r.biff = 5);
  var s = hn(e), i = rt(e);
  return s.val = i, s;
}
var Th = Zv;
function D2(e, n, r) {
  var s = e.l + n, i = e.read_shift(2), o = e.read_shift(2);
  if (r.sbcch = o, o == 1025 || o == 14849) return [o, i];
  if (o < 1 || o > 255) throw new Error("Unexpected SupBook type: " + o);
  for (var c = Oa(e, o), u = []; s > e.l; ) u.push(Is(e));
  return [o, i, c, u];
}
function Ch(e, n, r) {
  var s = e.read_shift(2), i, o = {
    fBuiltIn: s & 1,
    fWantAdvise: s >>> 1 & 1,
    fWantPict: s >>> 2 & 1,
    fOle: s >>> 3 & 1,
    fOleLink: s >>> 4 & 1,
    cf: s >>> 5 & 1023,
    fIcon: s >>> 15 & 1
  };
  return r.sbcch === 14849 && (i = r2(e, n - 2, r)), o.body = i || e.read_shift(n - 2), typeof i == "string" && (o.Name = i), o;
}
var O2 = [
  "_xlnm.Consolidate_Area",
  "_xlnm.Auto_Open",
  "_xlnm.Auto_Close",
  "_xlnm.Extract",
  "_xlnm.Database",
  "_xlnm.Criteria",
  "_xlnm.Print_Area",
  "_xlnm.Print_Titles",
  "_xlnm.Recorder",
  "_xlnm.Data_Form",
  "_xlnm.Auto_Activate",
  "_xlnm.Auto_Deactivate",
  "_xlnm.Sheet_Title",
  "_xlnm._FilterDatabase"
];
function Ah(e, n, r) {
  var s = e.l + n, i = e.read_shift(2), o = e.read_shift(1), c = e.read_shift(1), u = e.read_shift(r && r.biff == 2 ? 1 : 2), d = 0;
  (!r || r.biff >= 5) && (r.biff != 5 && (e.l += 2), d = e.read_shift(2), r.biff == 5 && (e.l += 2), e.l += 4);
  var x = Oa(e, c, r);
  i & 32 && (x = O2[x.charCodeAt(0)]);
  var p = s - e.l;
  r && r.biff == 2 && --p;
  var g = s == e.l || u === 0 || !(p > 0) ? [] : hk(e, p, r, u);
  return {
    chKey: o,
    Name: x,
    itab: d,
    rgce: g
  };
}
function e1(e, n, r) {
  if (r.biff < 8) return P2(e, n, r);
  for (var s = [], i = e.l + n, o = e.read_shift(r.biff > 8 ? 4 : 2); o-- !== 0; ) s.push(e2(e, r.biff > 8 ? 12 : 6, r));
  if (e.l != i) throw new Error("Bad ExternSheet: " + e.l + " != " + i);
  return s;
}
function P2(e, n, r) {
  e[e.l + 1] == 3 && e[e.l]++;
  var s = bs(e, n, r);
  return s.charCodeAt(0) == 3 ? s.slice(1) : s;
}
function b2(e, n, r) {
  if (r.biff < 8) {
    e.l += n;
    return;
  }
  var s = e.read_shift(2), i = e.read_shift(2), o = Oa(e, s, r), c = Oa(e, i, r);
  return [o, c];
}
function I2(e, n, r) {
  var s = Jp(e);
  e.l++;
  var i = e.read_shift(1);
  return n -= 8, [pk(e, n, r), i, s];
}
function Fh(e, n, r) {
  var s = t2(e);
  switch (r.biff) {
    case 2:
      e.l++, n -= 7;
      break;
    case 3:
    case 4:
      e.l += 2, n -= 8;
      break;
    default:
      e.l += 6, n -= 12;
  }
  return [s, fk(e, n, r)];
}
function L2(e) {
  var n = e.read_shift(4) !== 0, r = e.read_shift(4) !== 0, s = e.read_shift(4);
  return [n, r, s];
}
function M2(e, n, r) {
  if (!(r.biff < 8)) {
    var s = e.read_shift(2), i = e.read_shift(2), o = e.read_shift(2), c = e.read_shift(2), u = Ba(e, 0, r);
    return r.biff < 8 && e.read_shift(1), [{ r: s, c: i }, u, c, o];
  }
}
function B2(e, n, r) {
  return M2(e, n, r);
}
function j2(e, n) {
  for (var r = [], s = e.read_shift(2); s--; ) r.push(vo(e));
  return r;
}
function U2(e, n, r) {
  if (r && r.biff < 8) return H2(e, n, r);
  var s = Zp(e), i = s2(e, n - 22, s[1]);
  return { cmo: s, ft: i };
}
var z2 = {
  8: function(e, n) {
    var r = e.l + n;
    e.l += 10;
    var s = e.read_shift(2);
    e.l += 4, e.l += 2, e.l += 2, e.l += 2, e.l += 4;
    var i = e.read_shift(1);
    return e.l += i, e.l = r, { fmt: s };
  }
};
function H2(e, n, r) {
  e.l += 4;
  var s = e.read_shift(2), i = e.read_shift(2), o = e.read_shift(2);
  e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 2, e.l += 6, n -= 36;
  var c = [];
  return c.push((z2[s] || at)(e, n, r)), { cmo: [i, s, o], ft: c };
}
function V2(e, n, r) {
  var s = e.l, i = "";
  try {
    e.l += 4;
    var o = (r.lastobj || { cmo: [0, 0] }).cmo[1], c;
    [0, 5, 7, 11, 12, 14].indexOf(o) == -1 ? e.l += 6 : c = Kv(e, 6, r);
    var u = e.read_shift(2);
    e.read_shift(2), Ar(e, 2);
    var d = e.read_shift(2);
    e.l += d;
    for (var x = 1; x < e.lens.length - 1; ++x) {
      if (e.l - s != e.lens[x]) throw new Error("TxO: bad continue record");
      var p = e[e.l], g = Oa(e, e.lens[x + 1] - e.lens[x] - 1);
      if (i += g, i.length >= (p ? u : 2 * u)) break;
    }
    if (i.length !== u && i.length !== u * 2)
      throw new Error("cchText: " + u + " != " + i.length);
    return e.l = s + n, { t: i };
  } catch {
    return e.l = s + n, { t: i };
  }
}
function W2(e, n) {
  var r = vo(e);
  e.l += 16;
  var s = qv(e, n - 24);
  return [r, s];
}
function G2(e, n) {
  e.read_shift(2);
  var r = vo(e), s = e.read_shift((n - 10) / 2, "dbcs-cont");
  return s = s.replace(ft, ""), [r, s];
}
function $2(e) {
  var n = [0, 0], r;
  return r = e.read_shift(2), n[0] = gh[r] || r, r = e.read_shift(2), n[1] = gh[r] || r, n;
}
function K2(e) {
  for (var n = e.read_shift(2), r = []; n-- > 0; ) r.push(Qp(e));
  return r;
}
function X2(e) {
  for (var n = e.read_shift(2), r = []; n-- > 0; ) r.push(Qp(e));
  return r;
}
function Y2(e) {
  e.l += 2;
  var n = { cxfs: 0, crc: 0 };
  return n.cxfs = e.read_shift(2), n.crc = e.read_shift(4), n;
}
function r1(e, n, r) {
  if (!r.cellStyles) return at(e, n);
  var s = r && r.biff >= 12 ? 4 : 2, i = e.read_shift(s), o = e.read_shift(s), c = e.read_shift(s), u = e.read_shift(s), d = e.read_shift(2);
  s == 2 && (e.l += 2);
  var x = { s: i, e: o, w: c, ixfe: u, flags: d };
  return (r.biff >= 5 || !r.biff) && (x.level = d >> 8 & 7), x;
}
function Q2(e, n) {
  var r = {};
  return n < 32 || (e.l += 16, r.header = rt(e), r.footer = rt(e), e.l += 2), r;
}
function q2(e, n, r) {
  var s = { area: !1 };
  if (r.biff != 5)
    return e.l += n, s;
  var i = e.read_shift(1);
  return e.l += 3, i & 16 && (s.area = !0), s;
}
var J2 = hn, Z2 = Xp, ew = Is;
function rw(e) {
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(4), i = { fmt: n, env: r, len: s, data: e.slice(e.l, e.l + s) };
  return e.l += s, i;
}
function tw(e, n, r) {
  r.biffguess && r.biff == 5 && (r.biff = 2);
  var s = hn(e);
  ++e.l;
  var i = Ba(e, n - 7, r);
  return s.t = "str", s.val = i, s;
}
function nw(e) {
  var n = hn(e);
  ++e.l;
  var r = rt(e);
  return n.t = "n", n.val = r, n;
}
function aw(e) {
  var n = hn(e);
  ++e.l;
  var r = e.read_shift(2);
  return n.t = "n", n.val = r, n;
}
function iw(e) {
  var n = e.read_shift(1);
  return n === 0 ? (e.l++, "") : e.read_shift(n, "sbcs-cont");
}
function sw(e, n) {
  e.l += 6, e.l += 2, e.l += 1, e.l += 3, e.l += 1, e.l += n - 13;
}
function lw(e, n, r) {
  var s = e.l + n, i = hn(e), o = e.read_shift(2), c = Oa(e, o, r);
  return e.l = s, i.t = "str", i.val = c, i;
}
var ow = [2, 3, 48, 49, 131, 139, 140, 245], Nh = /* @__PURE__ */ (function() {
  var e = {
    /* Code Pages Supported by Visual FoxPro */
    /*::[*/
    1: 437,
    /*::[*/
    2: 850,
    /*::[*/
    3: 1252,
    /*::[*/
    4: 1e4,
    /*::[*/
    100: 852,
    /*::[*/
    101: 866,
    /*::[*/
    102: 865,
    /*::[*/
    103: 861,
    /*::[*/
    104: 895,
    /*::[*/
    105: 620,
    /*::[*/
    106: 737,
    /*::[*/
    107: 857,
    /*::[*/
    120: 950,
    /*::[*/
    121: 949,
    /*::[*/
    122: 936,
    /*::[*/
    123: 932,
    /*::[*/
    124: 874,
    /*::[*/
    125: 1255,
    /*::[*/
    126: 1256,
    /*::[*/
    150: 10007,
    /*::[*/
    151: 10029,
    /*::[*/
    152: 10006,
    /*::[*/
    200: 1250,
    /*::[*/
    201: 1251,
    /*::[*/
    202: 1254,
    /*::[*/
    203: 1253,
    /* shapefile DBF extension */
    /*::[*/
    0: 20127,
    /*::[*/
    8: 865,
    /*::[*/
    9: 437,
    /*::[*/
    10: 850,
    /*::[*/
    11: 437,
    /*::[*/
    13: 437,
    /*::[*/
    14: 850,
    /*::[*/
    15: 437,
    /*::[*/
    16: 850,
    /*::[*/
    17: 437,
    /*::[*/
    18: 850,
    /*::[*/
    19: 932,
    /*::[*/
    20: 850,
    /*::[*/
    21: 437,
    /*::[*/
    22: 850,
    /*::[*/
    23: 865,
    /*::[*/
    24: 437,
    /*::[*/
    25: 437,
    /*::[*/
    26: 850,
    /*::[*/
    27: 437,
    /*::[*/
    28: 863,
    /*::[*/
    29: 850,
    /*::[*/
    31: 852,
    /*::[*/
    34: 852,
    /*::[*/
    35: 852,
    /*::[*/
    36: 860,
    /*::[*/
    37: 850,
    /*::[*/
    38: 866,
    /*::[*/
    55: 850,
    /*::[*/
    64: 852,
    /*::[*/
    77: 936,
    /*::[*/
    78: 949,
    /*::[*/
    79: 950,
    /*::[*/
    80: 874,
    /*::[*/
    87: 1252,
    /*::[*/
    88: 1252,
    /*::[*/
    89: 1252,
    /*::[*/
    108: 863,
    /*::[*/
    134: 737,
    /*::[*/
    135: 852,
    /*::[*/
    136: 857,
    /*::[*/
    204: 1257,
    /*::[*/
    255: 16969
  }, n = Bc({
    /*::[*/
    1: 437,
    /*::[*/
    2: 850,
    /*::[*/
    3: 1252,
    /*::[*/
    4: 1e4,
    /*::[*/
    100: 852,
    /*::[*/
    101: 866,
    /*::[*/
    102: 865,
    /*::[*/
    103: 861,
    /*::[*/
    104: 895,
    /*::[*/
    105: 620,
    /*::[*/
    106: 737,
    /*::[*/
    107: 857,
    /*::[*/
    120: 950,
    /*::[*/
    121: 949,
    /*::[*/
    122: 936,
    /*::[*/
    123: 932,
    /*::[*/
    124: 874,
    /*::[*/
    125: 1255,
    /*::[*/
    126: 1256,
    /*::[*/
    150: 10007,
    /*::[*/
    151: 10029,
    /*::[*/
    152: 10006,
    /*::[*/
    200: 1250,
    /*::[*/
    201: 1251,
    /*::[*/
    202: 1254,
    /*::[*/
    203: 1253,
    /*::[*/
    0: 20127
  });
  function r(u, d) {
    var x = [], p = ia(1);
    switch (d.type) {
      case "base64":
        p = Jt(Ft(u));
        break;
      case "binary":
        p = Jt(u);
        break;
      case "buffer":
      case "array":
        p = u;
        break;
    }
    Hr(p, 0);
    var g = p.read_shift(1), w = !!(g & 136), k = !1, _ = !1;
    switch (g) {
      case 2:
        break;
      // dBASE II
      case 3:
        break;
      // dBASE III
      case 48:
        k = !0, w = !0;
        break;
      // VFP
      case 49:
        k = !0, w = !0;
        break;
      // VFP with autoincrement
      // 0x43 dBASE IV SQL table files
      // 0x63 dBASE IV SQL system files
      case 131:
        break;
      // dBASE III with memo
      case 139:
        break;
      // dBASE IV with memo
      case 140:
        _ = !0;
        break;
      // dBASE Level 7 with memo
      // case 0xCB dBASE IV SQL table files with memo
      case 245:
        break;
      // FoxPro 2.x with memo
      // case 0xFB FoxBASE
      default:
        throw new Error("DBF Unsupported Version: " + g.toString(16));
    }
    var y = 0, E = 521;
    g == 2 && (y = p.read_shift(2)), p.l += 3, g != 2 && (y = p.read_shift(4)), y > 1048576 && (y = 1e6), g != 2 && (E = p.read_shift(2));
    var A = p.read_shift(2), O = d.codepage || 1252;
    g != 2 && (p.l += 16, p.read_shift(1), p[p.l] !== 0 && (O = e[p[p.l]]), p.l += 1, p.l += 2), _ && (p.l += 36);
    for (var N = [], V = {}, J = Math.min(p.length, g == 2 ? 521 : E - 10 - (k ? 264 : 0)), j = _ ? 32 : 11; p.l < J && p[p.l] != 13; )
      switch (V = {}, V.name = Ss.utils.decode(O, p.slice(p.l, p.l + j)).replace(/[\u0000\r\n].*$/g, ""), p.l += j, V.type = String.fromCharCode(p.read_shift(1)), g != 2 && !_ && (V.offset = p.read_shift(4)), V.len = p.read_shift(1), g == 2 && (V.offset = p.read_shift(2)), V.dec = p.read_shift(1), V.name.length && N.push(V), g != 2 && (p.l += _ ? 13 : 14), V.type) {
        case "B":
          (!k || V.len != 8) && d.WTF && console.log("Skipping " + V.name + ":" + V.type);
          break;
        case "G":
        // General (FoxPro and dBASE L7)
        case "P":
          d.WTF && console.log("Skipping " + V.name + ":" + V.type);
          break;
        case "+":
        // Autoincrement (dBASE L7 only)
        case "0":
        // _NullFlags (VFP only)
        case "@":
        // Timestamp (dBASE L7 only)
        case "C":
        // Character (dBASE II)
        case "D":
        // Date (dBASE III)
        case "F":
        // Float (dBASE IV)
        case "I":
        // Long (VFP and dBASE L7)
        case "L":
        // Logical (dBASE II)
        case "M":
        // Memo (dBASE III)
        case "N":
        // Number (dBASE II)
        case "O":
        // Double (dBASE L7 only)
        case "T":
        // Datetime (VFP only)
        case "Y":
          break;
        default:
          throw new Error("Unknown Field Type: " + V.type);
      }
    if (p[p.l] !== 13 && (p.l = E - 1), p.read_shift(1) !== 13) throw new Error("DBF Terminator not found " + p.l + " " + p[p.l]);
    p.l = E;
    var C = 0, G = 0;
    for (x[0] = [], G = 0; G != N.length; ++G) x[0][G] = N[G].name;
    for (; y-- > 0; ) {
      if (p[p.l] === 42) {
        p.l += A;
        continue;
      }
      for (++p.l, x[++C] = [], G = 0, G = 0; G != N.length; ++G) {
        var B = p.slice(p.l, p.l + N[G].len);
        p.l += N[G].len, Hr(B, 0);
        var le = Ss.utils.decode(O, B);
        switch (N[G].type) {
          case "C":
            le.trim().length && (x[C][G] = le.replace(/\s+$/, ""));
            break;
          case "D":
            le.length === 8 ? x[C][G] = new Date(+le.slice(0, 4), +le.slice(4, 6) - 1, +le.slice(6, 8)) : x[C][G] = le;
            break;
          case "F":
            x[C][G] = parseFloat(le.trim());
            break;
          case "+":
          case "I":
            x[C][G] = _ ? B.read_shift(-4, "i") ^ 2147483648 : B.read_shift(4, "i");
            break;
          case "L":
            switch (le.trim().toUpperCase()) {
              case "Y":
              case "T":
                x[C][G] = !0;
                break;
              case "N":
              case "F":
                x[C][G] = !1;
                break;
              case "":
              case "?":
                break;
              default:
                throw new Error("DBF Unrecognized L:|" + le + "|");
            }
            break;
          case "M":
            if (!w) throw new Error("DBF Unexpected MEMO for type " + g.toString(16));
            x[C][G] = "##MEMO##" + (_ ? parseInt(le.trim(), 10) : B.read_shift(4));
            break;
          case "N":
            le = le.replace(/\u0000/g, "").trim(), le && le != "." && (x[C][G] = +le || 0);
            break;
          case "@":
            x[C][G] = new Date(B.read_shift(-8, "f") - 621356832e5);
            break;
          case "T":
            x[C][G] = new Date((B.read_shift(4) - 2440588) * 864e5 + B.read_shift(4));
            break;
          case "Y":
            x[C][G] = B.read_shift(4, "i") / 1e4 + B.read_shift(4, "i") / 1e4 * Math.pow(2, 32);
            break;
          case "O":
            x[C][G] = -B.read_shift(-8, "f");
            break;
          case "B":
            if (k && N[G].len == 8) {
              x[C][G] = B.read_shift(8, "f");
              break;
            }
          /* falls through */
          case "G":
          case "P":
            B.l += N[G].len;
            break;
          case "0":
            if (N[G].name === "_NullFlags") break;
          /* falls through */
          default:
            throw new Error("DBF Unsupported data type " + N[G].type);
        }
      }
    }
    if (g != 2 && p.l < p.length && p[p.l++] != 26) throw new Error("DBF EOF Marker missing " + (p.l - 1) + " of " + p.length + " " + p[p.l - 1].toString(16));
    return d && d.sheetRows && (x = x.slice(0, d.sheetRows)), d.DBF = N, x;
  }
  function s(u, d) {
    var x = d || {};
    x.dateNF || (x.dateNF = "yyyymmdd");
    var p = _i(r(u, x), x);
    return p["!cols"] = x.DBF.map(function(g) {
      return {
        wch: g.len,
        DBF: g
      };
    }), delete x.DBF, p;
  }
  function i(u, d) {
    try {
      return la(s(u, d), d);
    } catch (x) {
      if (d && d.WTF) throw x;
    }
    return { SheetNames: [], Sheets: {} };
  }
  var o = { B: 8, C: 250, L: 1, D: 8, "?": 0, "": 0 };
  function c(u, d) {
    var x = d || {};
    if (+x.codepage >= 0 && Zt(+x.codepage), x.type == "string") throw new Error("Cannot write DBF to JS string");
    var p = yc(), g = Rc(u, { header: 1, raw: !0, cellDates: !0 }), w = g[0], k = g.slice(1), _ = u["!cols"] || [], y = 0, E = 0, A = 0, O = 1;
    for (y = 0; y < w.length; ++y) {
      if (((_[y] || {}).DBF || {}).name) {
        w[y] = _[y].DBF.name, ++A;
        continue;
      }
      if (w[y] != null) {
        if (++A, typeof w[y] == "number" && (w[y] = w[y].toString(10)), typeof w[y] != "string") throw new Error("DBF Invalid column name " + w[y] + " |" + typeof w[y] + "|");
        if (w.indexOf(w[y]) !== y) {
          for (E = 0; E < 1024; ++E)
            if (w.indexOf(w[y] + "_" + E) == -1) {
              w[y] += "_" + E;
              break;
            }
        }
      }
    }
    var N = vr(u["!ref"]), V = [], J = [], j = [];
    for (y = 0; y <= N.e.c - N.s.c; ++y) {
      var C = "", G = "", B = 0, le = [];
      for (E = 0; E < k.length; ++E)
        k[E][y] != null && le.push(k[E][y]);
      if (le.length == 0 || w[y] == null) {
        V[y] = "?";
        continue;
      }
      for (E = 0; E < le.length; ++E) {
        switch (typeof le[E]) {
          /* TODO: check if L2 compat is desired */
          case "number":
            G = "B";
            break;
          case "string":
            G = "C";
            break;
          case "boolean":
            G = "L";
            break;
          case "object":
            G = le[E] instanceof Date ? "D" : "C";
            break;
          default:
            G = "C";
        }
        B = Math.max(B, String(le[E]).length), C = C && C != G ? "C" : G;
      }
      B > 250 && (B = 250), G = ((_[y] || {}).DBF || {}).type, G == "C" && _[y].DBF.len > B && (B = _[y].DBF.len), C == "B" && G == "N" && (C = "N", j[y] = _[y].DBF.dec, B = _[y].DBF.len), J[y] = C == "C" || G == "N" ? B : o[C] || 0, O += J[y], V[y] = C;
    }
    var re = p.next(32);
    for (re.write_shift(4, 318902576), re.write_shift(4, k.length), re.write_shift(2, 296 + 32 * A), re.write_shift(2, O), y = 0; y < 4; ++y) re.write_shift(4, 0);
    for (re.write_shift(4, 0 | (+n[
      /*::String(*/
      ep
      /*::)*/
    ] || 3) << 8), y = 0, E = 0; y < w.length; ++y)
      if (w[y] != null) {
        var Q = p.next(32), pe = (w[y].slice(-10) + "\0\0\0\0\0\0\0\0\0\0\0").slice(0, 11);
        Q.write_shift(1, pe, "sbcs"), Q.write_shift(1, V[y] == "?" ? "C" : V[y], "sbcs"), Q.write_shift(4, E), Q.write_shift(1, J[y] || o[V[y]] || 0), Q.write_shift(1, j[y] || 0), Q.write_shift(1, 2), Q.write_shift(4, 0), Q.write_shift(1, 0), Q.write_shift(4, 0), Q.write_shift(4, 0), E += J[y] || o[V[y]] || 0;
      }
    var Ce = p.next(264);
    for (Ce.write_shift(4, 13), y = 0; y < 65; ++y) Ce.write_shift(4, 0);
    for (y = 0; y < k.length; ++y) {
      var xe = p.next(O);
      for (xe.write_shift(1, 0), E = 0; E < w.length; ++E)
        if (w[E] != null)
          switch (V[E]) {
            case "L":
              xe.write_shift(1, k[y][E] == null ? 63 : k[y][E] ? 84 : 70);
              break;
            case "B":
              xe.write_shift(8, k[y][E] || 0, "f");
              break;
            case "N":
              var we = "0";
              for (typeof k[y][E] == "number" && (we = k[y][E].toFixed(j[E] || 0)), A = 0; A < J[E] - we.length; ++A) xe.write_shift(1, 32);
              xe.write_shift(1, we, "sbcs");
              break;
            case "D":
              k[y][E] ? (xe.write_shift(4, ("0000" + k[y][E].getFullYear()).slice(-4), "sbcs"), xe.write_shift(2, ("00" + (k[y][E].getMonth() + 1)).slice(-2), "sbcs"), xe.write_shift(2, ("00" + k[y][E].getDate()).slice(-2), "sbcs")) : xe.write_shift(8, "00000000", "sbcs");
              break;
            case "C":
              var ye = String(k[y][E] != null ? k[y][E] : "").slice(0, J[E]);
              for (xe.write_shift(1, ye, "sbcs"), A = 0; A < J[E] - ye.length; ++A) xe.write_shift(1, 32);
              break;
          }
    }
    return p.next(1).write_shift(1, 26), p.end();
  }
  return {
    to_workbook: i,
    to_sheet: s,
    from_sheet: c
  };
})(), cw = /* @__PURE__ */ (function() {
  var e = {
    AA: "À",
    BA: "Á",
    CA: "Â",
    DA: 195,
    HA: "Ä",
    JA: 197,
    AE: "È",
    BE: "É",
    CE: "Ê",
    HE: "Ë",
    AI: "Ì",
    BI: "Í",
    CI: "Î",
    HI: "Ï",
    AO: "Ò",
    BO: "Ó",
    CO: "Ô",
    DO: 213,
    HO: "Ö",
    AU: "Ù",
    BU: "Ú",
    CU: "Û",
    HU: "Ü",
    Aa: "à",
    Ba: "á",
    Ca: "â",
    Da: 227,
    Ha: "ä",
    Ja: 229,
    Ae: "è",
    Be: "é",
    Ce: "ê",
    He: "ë",
    Ai: "ì",
    Bi: "í",
    Ci: "î",
    Hi: "ï",
    Ao: "ò",
    Bo: "ó",
    Co: "ô",
    Do: 245,
    Ho: "ö",
    Au: "ù",
    Bu: "ú",
    Cu: "û",
    Hu: "ü",
    KC: "Ç",
    Kc: "ç",
    q: "æ",
    z: "œ",
    a: "Æ",
    j: "Œ",
    DN: 209,
    Dn: 241,
    Hy: 255,
    S: 169,
    c: 170,
    R: 174,
    "B ": 180,
    /*::[*/
    0: 176,
    /*::[*/
    1: 177,
    /*::[*/
    2: 178,
    /*::[*/
    3: 179,
    /*::[*/
    5: 181,
    /*::[*/
    6: 182,
    /*::[*/
    7: 183,
    Q: 185,
    k: 186,
    b: 208,
    i: 216,
    l: 222,
    s: 240,
    y: 248,
    "!": 161,
    '"': 162,
    "#": 163,
    "(": 164,
    "%": 165,
    "'": 167,
    "H ": 168,
    "+": 171,
    ";": 187,
    "<": 188,
    "=": 189,
    ">": 190,
    "?": 191,
    "{": 223
  }, n = new RegExp("\x1BN(" + fn(e).join("|").replace(/\|\|\|/, "|\\||").replace(/([?()+])/g, "\\$1") + "|\\|)", "gm"), r = function(w, k) {
    var _ = e[k];
    return typeof _ == "number" ? Gd(_) : _;
  }, s = function(w, k, _) {
    var y = k.charCodeAt(0) - 32 << 4 | _.charCodeAt(0) - 48;
    return y == 59 ? w : Gd(y);
  };
  e["|"] = 254;
  function i(w, k) {
    switch (k.type) {
      case "base64":
        return o(Ft(w), k);
      case "binary":
        return o(w, k);
      case "buffer":
        return o(Qe && Buffer.isBuffer(w) ? w.toString("binary") : ba(w), k);
      case "array":
        return o(Da(w), k);
    }
    throw new Error("Unrecognized type " + k.type);
  }
  function o(w, k) {
    var _ = w.split(/[\n\r]+/), y = -1, E = -1, A = 0, O = 0, N = [], V = [], J = null, j = {}, C = [], G = [], B = [], le = 0, re;
    for (+k.codepage >= 0 && Zt(+k.codepage); A !== _.length; ++A) {
      le = 0;
      var Q = _[A].trim().replace(/\x1B([\x20-\x2F])([\x30-\x3F])/g, s).replace(n, r), pe = Q.replace(/;;/g, "\0").split(";").map(function(H) {
        return H.replace(/\u0000/g, ";");
      }), Ce = pe[0], xe;
      if (Q.length > 0) switch (Ce) {
        case "ID":
          break;
        /* header */
        case "E":
          break;
        /* EOF */
        case "B":
          break;
        /* dimensions */
        case "O":
          break;
        /* options? */
        case "W":
          break;
        /* window? */
        case "P":
          pe[1].charAt(0) == "P" && V.push(Q.slice(3).replace(/;;/g, ";"));
          break;
        case "C":
          var we = !1, ye = !1, ge = !1, Y = !1, he = -1, U = -1;
          for (O = 1; O < pe.length; ++O) switch (pe[O].charAt(0)) {
            case "A":
              break;
            // TODO: comment
            case "X":
              E = parseInt(pe[O].slice(1)) - 1, ye = !0;
              break;
            case "Y":
              for (y = parseInt(pe[O].slice(1)) - 1, ye || (E = 0), re = N.length; re <= y; ++re) N[re] = [];
              break;
            case "K":
              xe = pe[O].slice(1), xe.charAt(0) === '"' ? xe = xe.slice(1, xe.length - 1) : xe === "TRUE" ? xe = !0 : xe === "FALSE" ? xe = !1 : isNaN(rn(xe)) ? isNaN(gi(xe).getDate()) || (xe = jr(xe)) : (xe = rn(xe), J !== null && wi(J) && (xe = go(xe))), we = !0;
              break;
            case "E":
              Y = !0;
              var F = xi(pe[O].slice(1), { r: y, c: E });
              N[y][E] = [N[y][E], F];
              break;
            case "S":
              ge = !0, N[y][E] = [N[y][E], "S5S"];
              break;
            case "G":
              break;
            // unknown
            case "R":
              he = parseInt(pe[O].slice(1)) - 1;
              break;
            case "C":
              U = parseInt(pe[O].slice(1)) - 1;
              break;
            default:
              if (k && k.WTF) throw new Error("SYLK bad record " + Q);
          }
          if (we && (N[y][E] && N[y][E].length == 2 ? N[y][E][0] = xe : N[y][E] = xe, J = null), ge) {
            if (Y) throw new Error("SYLK shared formula cannot have own formula");
            var X = he > -1 && N[he][U];
            if (!X || !X[1]) throw new Error("SYLK shared formula cannot find base");
            N[y][E][1] = f1(X[1], { r: y - he, c: E - U });
          }
          break;
        case "F":
          var z = 0;
          for (O = 1; O < pe.length; ++O) switch (pe[O].charAt(0)) {
            case "X":
              E = parseInt(pe[O].slice(1)) - 1, ++z;
              break;
            case "Y":
              for (y = parseInt(pe[O].slice(1)) - 1, re = N.length; re <= y; ++re) N[re] = [];
              break;
            case "M":
              le = parseInt(pe[O].slice(1)) / 20;
              break;
            case "F":
              break;
            /* ??? */
            case "G":
              break;
            /* hide grid */
            case "P":
              J = V[parseInt(pe[O].slice(1))];
              break;
            case "S":
              break;
            /* cell style */
            case "D":
              break;
            /* column */
            case "N":
              break;
            /* font */
            case "W":
              for (B = pe[O].slice(1).split(" "), re = parseInt(B[0], 10); re <= parseInt(B[1], 10); ++re)
                le = parseInt(B[2], 10), G[re - 1] = le === 0 ? { hidden: !0 } : { wch: le }, vi(G[re - 1]);
              break;
            case "C":
              E = parseInt(pe[O].slice(1)) - 1, G[E] || (G[E] = {});
              break;
            case "R":
              y = parseInt(pe[O].slice(1)) - 1, C[y] || (C[y] = {}), le > 0 ? (C[y].hpt = le, C[y].hpx = Rs(le)) : le === 0 && (C[y].hidden = !0);
              break;
            default:
              if (k && k.WTF) throw new Error("SYLK bad record " + Q);
          }
          z < 1 && (J = null);
          break;
        default:
          if (k && k.WTF) throw new Error("SYLK bad record " + Q);
      }
    }
    return C.length > 0 && (j["!rows"] = C), G.length > 0 && (j["!cols"] = G), k && k.sheetRows && (N = N.slice(0, k.sheetRows)), [N, j];
  }
  function c(w, k) {
    var _ = i(w, k), y = _[0], E = _[1], A = _i(y, k);
    return fn(E).forEach(function(O) {
      A[O] = E[O];
    }), A;
  }
  function u(w, k) {
    return la(c(w, k), k);
  }
  function d(w, k, _, y) {
    var E = "C;Y" + (_ + 1) + ";X" + (y + 1) + ";K";
    switch (w.t) {
      case "n":
        E += w.v || 0, w.f && !w.F && (E += ";E" + Yy(w.f, { r: _, c: y }));
        break;
      case "b":
        E += w.v ? "TRUE" : "FALSE";
        break;
      case "e":
        E += w.w || w.v;
        break;
      case "d":
        E += '"' + (w.w || w.v) + '"';
        break;
      case "s":
        E += '"' + w.v.replace(/"/g, "").replace(/;/g, ";;") + '"';
        break;
    }
    return E;
  }
  function x(w, k) {
    k.forEach(function(_, y) {
      var E = "F;W" + (y + 1) + " " + (y + 1) + " ";
      _.hidden ? E += "0" : (typeof _.width == "number" && !_.wpx && (_.wpx = ho(_.width)), typeof _.wpx == "number" && !_.wch && (_.wch = po(_.wpx)), typeof _.wch == "number" && (E += Math.round(_.wch))), E.charAt(E.length - 1) != " " && w.push(E);
    });
  }
  function p(w, k) {
    k.forEach(function(_, y) {
      var E = "F;";
      _.hidden ? E += "M0;" : _.hpt ? E += "M" + 20 * _.hpt + ";" : _.hpx && (E += "M" + 20 * o1(_.hpx) + ";"), E.length > 2 && w.push(E + "R" + (y + 1));
    });
  }
  function g(w, k) {
    var _ = ["ID;PWXL;N;E"], y = [], E = vr(w["!ref"]), A, O = Array.isArray(w), N = `\r
`;
    _.push("P;PGeneral"), _.push("F;P0;DG0G8;M255"), w["!cols"] && x(_, w["!cols"]), w["!rows"] && p(_, w["!rows"]), _.push("B;Y" + (E.e.r - E.s.r + 1) + ";X" + (E.e.c - E.s.c + 1) + ";D" + [E.s.c, E.s.r, E.e.c, E.e.r].join(" "));
    for (var V = E.s.r; V <= E.e.r; ++V)
      for (var J = E.s.c; J <= E.e.c; ++J) {
        var j = Ge({ r: V, c: J });
        A = O ? (w[V] || [])[J] : w[j], !(!A || A.v == null && (!A.f || A.F)) && y.push(d(A, w, V, J));
      }
    return _.join(N) + N + y.join(N) + N + "E" + N;
  }
  return {
    to_workbook: u,
    to_sheet: c,
    from_sheet: g
  };
})(), uw = /* @__PURE__ */ (function() {
  function e(o, c) {
    switch (c.type) {
      case "base64":
        return n(Ft(o), c);
      case "binary":
        return n(o, c);
      case "buffer":
        return n(Qe && Buffer.isBuffer(o) ? o.toString("binary") : ba(o), c);
      case "array":
        return n(Da(o), c);
    }
    throw new Error("Unrecognized type " + c.type);
  }
  function n(o, c) {
    for (var u = o.split(`
`), d = -1, x = -1, p = 0, g = []; p !== u.length; ++p) {
      if (u[p].trim() === "BOT") {
        g[++d] = [], x = 0;
        continue;
      }
      if (!(d < 0)) {
        var w = u[p].trim().split(","), k = w[0], _ = w[1];
        ++p;
        for (var y = u[p] || ""; (y.match(/["]/g) || []).length & 1 && p < u.length - 1; ) y += `
` + u[++p];
        switch (y = y.trim(), +k) {
          case -1:
            if (y === "BOT") {
              g[++d] = [], x = 0;
              continue;
            } else if (y !== "EOD") throw new Error("Unrecognized DIF special command " + y);
            break;
          case 0:
            y === "TRUE" ? g[d][x] = !0 : y === "FALSE" ? g[d][x] = !1 : isNaN(rn(_)) ? isNaN(gi(_).getDate()) ? g[d][x] = _ : g[d][x] = jr(_) : g[d][x] = rn(_), ++x;
            break;
          case 1:
            y = y.slice(1, y.length - 1), y = y.replace(/""/g, '"'), y && y.match(/^=".*"$/) && (y = y.slice(2, -1)), g[d][x++] = y !== "" ? y : null;
            break;
        }
        if (y === "EOD") break;
      }
    }
    return c && c.sheetRows && (g = g.slice(0, c.sheetRows)), g;
  }
  function r(o, c) {
    return _i(e(o, c), c);
  }
  function s(o, c) {
    return la(r(o, c), c);
  }
  var i = /* @__PURE__ */ (function() {
    var o = function(d, x, p, g, w) {
      d.push(x), d.push(p + "," + g), d.push('"' + w.replace(/"/g, '""') + '"');
    }, c = function(d, x, p, g) {
      d.push(x + "," + p), d.push(x == 1 ? '"' + g.replace(/"/g, '""') + '"' : g);
    };
    return function(d) {
      var x = [], p = vr(d["!ref"]), g, w = Array.isArray(d);
      o(x, "TABLE", 0, 1, "sheetjs"), o(x, "VECTORS", 0, p.e.r - p.s.r + 1, ""), o(x, "TUPLES", 0, p.e.c - p.s.c + 1, ""), o(x, "DATA", 0, 0, "");
      for (var k = p.s.r; k <= p.e.r; ++k) {
        c(x, -1, 0, "BOT");
        for (var _ = p.s.c; _ <= p.e.c; ++_) {
          var y = Ge({ r: k, c: _ });
          if (g = w ? (d[k] || [])[_] : d[y], !g) {
            c(x, 1, 0, "");
            continue;
          }
          switch (g.t) {
            case "n":
              var E = g.w;
              !E && g.v != null && (E = g.v), E == null ? g.f && !g.F ? c(x, 1, 0, "=" + g.f) : c(x, 1, 0, "") : c(x, 0, E, "V");
              break;
            case "b":
              c(x, 0, g.v ? 1 : 0, g.v ? "TRUE" : "FALSE");
              break;
            case "s":
              c(x, 1, 0, isNaN(g.v) ? g.v : '="' + g.v + '"');
              break;
            case "d":
              g.w || (g.w = Ut(g.z || $e[14], dt(jr(g.v)))), c(x, 0, g.w, "V");
              break;
            default:
              c(x, 1, 0, "");
          }
        }
      }
      c(x, -1, 0, "EOD");
      var A = `\r
`, O = x.join(A);
      return O;
    };
  })();
  return {
    to_workbook: s,
    to_sheet: r,
    from_sheet: i
  };
})(), fw = /* @__PURE__ */ (function() {
  function e(g) {
    return g.replace(/\\b/g, "\\").replace(/\\c/g, ":").replace(/\\n/g, `
`);
  }
  function n(g) {
    return g.replace(/\\/g, "\\b").replace(/:/g, "\\c").replace(/\n/g, "\\n");
  }
  function r(g, w) {
    for (var k = g.split(`
`), _ = -1, y = -1, E = 0, A = []; E !== k.length; ++E) {
      var O = k[E].trim().split(":");
      if (O[0] === "cell") {
        var N = ut(O[1]);
        if (A.length <= N.r) for (_ = A.length; _ <= N.r; ++_) A[_] || (A[_] = []);
        switch (_ = N.r, y = N.c, O[2]) {
          case "t":
            A[_][y] = e(O[3]);
            break;
          case "v":
            A[_][y] = +O[3];
            break;
          case "vtf":
            var V = O[O.length - 1];
          /* falls through */
          case "vtc":
            switch (O[3]) {
              case "nl":
                A[_][y] = !!+O[4];
                break;
              default:
                A[_][y] = +O[4];
                break;
            }
            O[2] == "vtf" && (A[_][y] = [A[_][y], V]);
        }
      }
    }
    return w && w.sheetRows && (A = A.slice(0, w.sheetRows)), A;
  }
  function s(g, w) {
    return _i(r(g, w), w);
  }
  function i(g, w) {
    return la(s(g, w), w);
  }
  var o = [
    "socialcalc:version:1.5",
    "MIME-Version: 1.0",
    "Content-Type: multipart/mixed; boundary=SocialCalcSpreadsheetControlSave"
  ].join(`
`), c = [
    "--SocialCalcSpreadsheetControlSave",
    "Content-type: text/plain; charset=UTF-8"
  ].join(`
`) + `
`, u = [
    "# SocialCalc Spreadsheet Control Save",
    "part:sheet"
  ].join(`
`), d = "--SocialCalcSpreadsheetControlSave--";
  function x(g) {
    if (!g || !g["!ref"]) return "";
    for (var w = [], k = [], _, y = "", E = yi(g["!ref"]), A = Array.isArray(g), O = E.s.r; O <= E.e.r; ++O)
      for (var N = E.s.c; N <= E.e.c; ++N)
        if (y = Ge({ r: O, c: N }), _ = A ? (g[O] || [])[N] : g[y], !(!_ || _.v == null || _.t === "z")) {
          switch (k = ["cell", y, "t"], _.t) {
            case "s":
            case "str":
              k.push(n(_.v));
              break;
            case "n":
              _.f ? (k[2] = "vtf", k[3] = "n", k[4] = _.v, k[5] = n(_.f)) : (k[2] = "v", k[3] = _.v);
              break;
            case "b":
              k[2] = "vt" + (_.f ? "f" : "c"), k[3] = "nl", k[4] = _.v ? "1" : "0", k[5] = n(_.f || (_.v ? "TRUE" : "FALSE"));
              break;
            case "d":
              var V = dt(jr(_.v));
              k[2] = "vtc", k[3] = "nd", k[4] = "" + V, k[5] = _.w || Ut(_.z || $e[14], V);
              break;
            case "e":
              continue;
          }
          w.push(k.join(":"));
        }
    return w.push("sheet:c:" + (E.e.c - E.s.c + 1) + ":r:" + (E.e.r - E.s.r + 1) + ":tvf:1"), w.push("valueformat:1:text-wiki"), w.join(`
`);
  }
  function p(g) {
    return [o, c, u, c, x(g), d].join(`
`);
  }
  return {
    to_workbook: i,
    to_sheet: s,
    from_sheet: p
  };
})(), Fs = /* @__PURE__ */ (function() {
  function e(p, g, w, k, _) {
    _.raw ? g[w][k] = p : p === "" || (p === "TRUE" ? g[w][k] = !0 : p === "FALSE" ? g[w][k] = !1 : isNaN(rn(p)) ? isNaN(gi(p).getDate()) ? g[w][k] = p : g[w][k] = jr(p) : g[w][k] = rn(p));
  }
  function n(p, g) {
    var w = g || {}, k = [];
    if (!p || p.length === 0) return k;
    for (var _ = p.split(/[\r\n]/), y = _.length - 1; y >= 0 && _[y].length === 0; ) --y;
    for (var E = 10, A = 0, O = 0; O <= y; ++O)
      A = _[O].indexOf(" "), A == -1 ? A = _[O].length : A++, E = Math.max(E, A);
    for (O = 0; O <= y; ++O) {
      k[O] = [];
      var N = 0;
      for (e(_[O].slice(0, E).trim(), k, O, N, w), N = 1; N <= (_[O].length - E) / 10 + 1; ++N)
        e(_[O].slice(E + (N - 1) * 10, E + N * 10).trim(), k, O, N, w);
    }
    return w.sheetRows && (k = k.slice(0, w.sheetRows)), k;
  }
  var r = {
    /*::[*/
    44: ",",
    /*::[*/
    9: "	",
    /*::[*/
    59: ";",
    /*::[*/
    124: "|"
  }, s = {
    /*::[*/
    44: 3,
    /*::[*/
    9: 2,
    /*::[*/
    59: 1,
    /*::[*/
    124: 0
  };
  function i(p) {
    for (var g = {}, w = !1, k = 0, _ = 0; k < p.length; ++k)
      (_ = p.charCodeAt(k)) == 34 ? w = !w : !w && _ in r && (g[_] = (g[_] || 0) + 1);
    _ = [];
    for (k in g) Object.prototype.hasOwnProperty.call(g, k) && _.push([g[k], k]);
    if (!_.length) {
      g = s;
      for (k in g) Object.prototype.hasOwnProperty.call(g, k) && _.push([g[k], k]);
    }
    return _.sort(function(y, E) {
      return y[0] - E[0] || s[y[1]] - s[E[1]];
    }), r[_.pop()[1]] || 44;
  }
  function o(p, g) {
    var w = g || {}, k = "", _ = w.dense ? [] : {}, y = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
    p.slice(0, 4) == "sep=" ? p.charCodeAt(5) == 13 && p.charCodeAt(6) == 10 ? (k = p.charAt(4), p = p.slice(7)) : p.charCodeAt(5) == 13 || p.charCodeAt(5) == 10 ? (k = p.charAt(4), p = p.slice(6)) : k = i(p.slice(0, 1024)) : w && w.FS ? k = w.FS : k = i(p.slice(0, 1024));
    var E = 0, A = 0, O = 0, N = 0, V = 0, J = k.charCodeAt(0), j = !1, C = 0, G = p.charCodeAt(0);
    p = p.replace(/\r\n/mg, `
`);
    var B = w.dateNF != null ? kg(w.dateNF) : null;
    function le() {
      var re = p.slice(N, V), Q = {};
      if (re.charAt(0) == '"' && re.charAt(re.length - 1) == '"' && (re = re.slice(1, -1).replace(/""/g, '"')), re.length === 0) Q.t = "z";
      else if (w.raw)
        Q.t = "s", Q.v = re;
      else if (re.trim().length === 0)
        Q.t = "s", Q.v = re;
      else if (re.charCodeAt(0) == 61)
        re.charCodeAt(1) == 34 && re.charCodeAt(re.length - 1) == 34 ? (Q.t = "s", Q.v = re.slice(2, -1).replace(/""/g, '"')) : qy(re) ? (Q.t = "n", Q.f = re.slice(1)) : (Q.t = "s", Q.v = re);
      else if (re == "TRUE")
        Q.t = "b", Q.v = !0;
      else if (re == "FALSE")
        Q.t = "b", Q.v = !1;
      else if (!isNaN(O = rn(re)))
        Q.t = "n", w.cellText !== !1 && (Q.w = re), Q.v = O;
      else if (!isNaN(gi(re).getDate()) || B && re.match(B)) {
        Q.z = w.dateNF || $e[14];
        var pe = 0;
        B && re.match(B) && (re = Eg(re, w.dateNF, re.match(B) || []), pe = 1), w.cellDates ? (Q.t = "d", Q.v = jr(re, pe)) : (Q.t = "n", Q.v = dt(jr(re, pe))), w.cellText !== !1 && (Q.w = Ut(Q.z, Q.v instanceof Date ? dt(Q.v) : Q.v)), w.cellNF || delete Q.z;
      } else
        Q.t = "s", Q.v = re;
      if (Q.t == "z" || (w.dense ? (_[E] || (_[E] = []), _[E][A] = Q) : _[Ge({ c: A, r: E })] = Q), N = V + 1, G = p.charCodeAt(N), y.e.c < A && (y.e.c = A), y.e.r < E && (y.e.r = E), C == J) ++A;
      else if (A = 0, ++E, w.sheetRows && w.sheetRows <= E) return !0;
    }
    e: for (; V < p.length; ++V) switch (C = p.charCodeAt(V)) {
      case 34:
        G === 34 && (j = !j);
        break;
      case J:
      case 10:
      case 13:
        if (!j && le()) break e;
        break;
    }
    return V - N > 0 && le(), _["!ref"] = Je(y), _;
  }
  function c(p, g) {
    return !(g && g.PRN) || g.FS || p.slice(0, 4) == "sep=" || p.indexOf("	") >= 0 || p.indexOf(",") >= 0 || p.indexOf(";") >= 0 ? o(p, g) : _i(n(p, g), g);
  }
  function u(p, g) {
    var w = "", k = g.type == "string" ? [0, 0, 0, 0] : nu(p, g);
    switch (g.type) {
      case "base64":
        w = Ft(p);
        break;
      case "binary":
        w = p;
        break;
      case "buffer":
        g.codepage == 65001 ? w = p.toString("utf8") : g.codepage && typeof Ss < "u" || (w = Qe && Buffer.isBuffer(p) ? p.toString("binary") : ba(p));
        break;
      case "array":
        w = Da(p);
        break;
      case "string":
        w = p;
        break;
      default:
        throw new Error("Unrecognized type " + g.type);
    }
    return k[0] == 239 && k[1] == 187 && k[2] == 191 ? w = lr(w.slice(3)) : g.type != "string" && g.type != "buffer" && g.codepage == 65001 ? w = lr(w) : g.type == "binary" && typeof Ss < "u", w.slice(0, 19) == "socialcalc:version:" ? fw.to_sheet(g.type == "string" ? w : lr(w), g) : c(w, g);
  }
  function d(p, g) {
    return la(u(p, g), g);
  }
  function x(p) {
    for (var g = [], w = vr(p["!ref"]), k, _ = Array.isArray(p), y = w.s.r; y <= w.e.r; ++y) {
      for (var E = [], A = w.s.c; A <= w.e.c; ++A) {
        var O = Ge({ r: y, c: A });
        if (k = _ ? (p[y] || [])[A] : p[O], !k || k.v == null) {
          E.push("          ");
          continue;
        }
        for (var N = (k.w || (Rn(k), k.w) || "").slice(0, 10); N.length < 10; ) N += " ";
        E.push(N + (A === 0 ? " " : ""));
      }
      g.push(E.join(""));
    }
    return g.join(`
`);
  }
  return {
    to_workbook: d,
    to_sheet: u,
    from_sheet: x
  };
})();
function dw(e, n) {
  var r = n || {}, s = !!r.WTF;
  r.WTF = !0;
  try {
    var i = cw.to_workbook(e, r);
    return r.WTF = s, i;
  } catch (o) {
    if (r.WTF = s, !o.message.match(/SYLK bad record ID/) && s) throw o;
    return Fs.to_workbook(e, n);
  }
}
var vs = /* @__PURE__ */ (function() {
  function e(F, X, z) {
    if (F) {
      Hr(F, F.l || 0);
      for (var H = z.Enum || he; F.l < F.length; ) {
        var ue = F.read_shift(2), K = H[ue] || H[65535], te = F.read_shift(2), Z = F.l + te, fe = K.f && K.f(F, te, z);
        if (F.l = Z, X(fe, K, ue)) return;
      }
    }
  }
  function n(F, X) {
    switch (X.type) {
      case "base64":
        return r(Jt(Ft(F)), X);
      case "binary":
        return r(Jt(F), X);
      case "buffer":
      case "array":
        return r(F, X);
    }
    throw "Unsupported type " + X.type;
  }
  function r(F, X) {
    if (!F) return F;
    var z = X || {}, H = z.dense ? [] : {}, ue = "Sheet1", K = "", te = 0, Z = {}, fe = [], Pe = [], P = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, Xe = z.sheetRows || 0;
    if (F[2] == 0 && (F[3] == 8 || F[3] == 9) && F.length >= 16 && F[14] == 5 && F[15] === 108)
      throw new Error("Unsupported Works 3 for Mac file");
    if (F[2] == 2)
      z.Enum = he, e(F, function(Fe, ur, Gr) {
        switch (Gr) {
          case 0:
            z.vers = Fe, Fe >= 4096 && (z.qpro = !0);
            break;
          case 6:
            P = Fe;
            break;
          /* RANGE */
          case 204:
            Fe && (K = Fe);
            break;
          /* SHEETNAMECS */
          case 222:
            K = Fe;
            break;
          /* SHEETNAMELP */
          case 15:
          /* LABEL */
          case 51:
            z.qpro || (Fe[1].v = Fe[1].v.slice(1));
          /* falls through */
          case 13:
          /* INTEGER */
          case 14:
          /* NUMBER */
          case 16:
            Gr == 14 && (Fe[2] & 112) == 112 && (Fe[2] & 15) > 1 && (Fe[2] & 15) < 15 && (Fe[1].z = z.dateNF || $e[14], z.cellDates && (Fe[1].t = "d", Fe[1].v = go(Fe[1].v))), z.qpro && Fe[3] > te && (H["!ref"] = Je(P), Z[ue] = H, fe.push(ue), H = z.dense ? [] : {}, P = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, te = Fe[3], ue = K || "Sheet" + (te + 1), K = "");
            var $r = z.dense ? (H[Fe[0].r] || [])[Fe[0].c] : H[Ge(Fe[0])];
            if ($r) {
              $r.t = Fe[1].t, $r.v = Fe[1].v, Fe[1].z != null && ($r.z = Fe[1].z), Fe[1].f != null && ($r.f = Fe[1].f);
              break;
            }
            z.dense ? (H[Fe[0].r] || (H[Fe[0].r] = []), H[Fe[0].r][Fe[0].c] = Fe[1]) : H[Ge(Fe[0])] = Fe[1];
            break;
        }
      }, z);
    else if (F[2] == 26 || F[2] == 14)
      z.Enum = U, F[2] == 14 && (z.qpro = !0, F.l = 0), e(F, function(Fe, ur, Gr) {
        switch (Gr) {
          case 204:
            ue = Fe;
            break;
          /* SHEETNAMECS */
          case 22:
            Fe[1].v = Fe[1].v.slice(1);
          /* falls through */
          case 23:
          /* NUMBER17 */
          case 24:
          /* NUMBER18 */
          case 25:
          /* FORMULA19 */
          case 37:
          /* NUMBER25 */
          case 39:
          /* NUMBER27 */
          case 40:
            if (Fe[3] > te && (H["!ref"] = Je(P), Z[ue] = H, fe.push(ue), H = z.dense ? [] : {}, P = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, te = Fe[3], ue = "Sheet" + (te + 1)), Xe > 0 && Fe[0].r >= Xe) break;
            z.dense ? (H[Fe[0].r] || (H[Fe[0].r] = []), H[Fe[0].r][Fe[0].c] = Fe[1]) : H[Ge(Fe[0])] = Fe[1], P.e.c < Fe[0].c && (P.e.c = Fe[0].c), P.e.r < Fe[0].r && (P.e.r = Fe[0].r);
            break;
          case 27:
            Fe[14e3] && (Pe[Fe[14e3][0]] = Fe[14e3][1]);
            break;
          case 1537:
            Pe[Fe[0]] = Fe[1], Fe[0] == te && (ue = Fe[1]);
            break;
        }
      }, z);
    else throw new Error("Unrecognized LOTUS BOF " + F[2]);
    if (H["!ref"] = Je(P), Z[K || ue] = H, fe.push(K || ue), !Pe.length) return { SheetNames: fe, Sheets: Z };
    for (var je = {}, Ke = [], Ve = 0; Ve < Pe.length; ++Ve) Z[fe[Ve]] ? (Ke.push(Pe[Ve] || fe[Ve]), je[Pe[Ve]] = Z[Pe[Ve]] || Z[fe[Ve]]) : (Ke.push(Pe[Ve]), je[Pe[Ve]] = { "!ref": "A1" });
    return { SheetNames: Ke, Sheets: je };
  }
  function s(F, X) {
    var z = X || {};
    if (+z.codepage >= 0 && Zt(+z.codepage), z.type == "string") throw new Error("Cannot write WK1 to JS string");
    var H = yc(), ue = vr(F["!ref"]), K = Array.isArray(F), te = [];
    qt(H, 0, o(1030)), qt(H, 6, d(ue));
    for (var Z = Math.min(ue.e.r, 8191), fe = ue.s.r; fe <= Z; ++fe)
      for (var Pe = Wr(fe), P = ue.s.c; P <= ue.e.c; ++P) {
        fe === ue.s.r && (te[P] = Or(P));
        var Xe = te[P] + Pe, je = K ? (F[fe] || [])[P] : F[Xe];
        if (!(!je || je.t == "z"))
          if (je.t == "n")
            (je.v | 0) == je.v && je.v >= -32768 && je.v <= 32767 ? qt(H, 13, k(fe, P, je.v)) : qt(H, 14, y(fe, P, je.v));
          else {
            var Ke = Rn(je);
            qt(H, 15, g(fe, P, Ke.slice(0, 239)));
          }
      }
    return qt(H, 1), H.end();
  }
  function i(F, X) {
    var z = X || {};
    if (+z.codepage >= 0 && Zt(+z.codepage), z.type == "string") throw new Error("Cannot write WK3 to JS string");
    var H = yc();
    qt(H, 0, c(F));
    for (var ue = 0, K = 0; ue < F.SheetNames.length; ++ue) (F.Sheets[F.SheetNames[ue]] || {})["!ref"] && qt(H, 27, Y(F.SheetNames[ue], K++));
    var te = 0;
    for (ue = 0; ue < F.SheetNames.length; ++ue) {
      var Z = F.Sheets[F.SheetNames[ue]];
      if (!(!Z || !Z["!ref"])) {
        for (var fe = vr(Z["!ref"]), Pe = Array.isArray(Z), P = [], Xe = Math.min(fe.e.r, 8191), je = fe.s.r; je <= Xe; ++je)
          for (var Ke = Wr(je), Ve = fe.s.c; Ve <= fe.e.c; ++Ve) {
            je === fe.s.r && (P[Ve] = Or(Ve));
            var Fe = P[Ve] + Ke, ur = Pe ? (Z[je] || [])[Ve] : Z[Fe];
            if (!(!ur || ur.t == "z"))
              if (ur.t == "n")
                qt(H, 23, le(je, Ve, te, ur.v));
              else {
                var Gr = Rn(ur);
                qt(H, 22, C(je, Ve, te, Gr.slice(0, 239)));
              }
          }
        ++te;
      }
    }
    return qt(H, 1), H.end();
  }
  function o(F) {
    var X = Dr(2);
    return X.write_shift(2, F), X;
  }
  function c(F) {
    var X = Dr(26);
    X.write_shift(2, 4096), X.write_shift(2, 4), X.write_shift(4, 0);
    for (var z = 0, H = 0, ue = 0, K = 0; K < F.SheetNames.length; ++K) {
      var te = F.SheetNames[K], Z = F.Sheets[te];
      if (!(!Z || !Z["!ref"])) {
        ++ue;
        var fe = yi(Z["!ref"]);
        z < fe.e.r && (z = fe.e.r), H < fe.e.c && (H = fe.e.c);
      }
    }
    return z > 8191 && (z = 8191), X.write_shift(2, z), X.write_shift(1, ue), X.write_shift(1, H), X.write_shift(2, 0), X.write_shift(2, 0), X.write_shift(1, 1), X.write_shift(1, 2), X.write_shift(4, 0), X.write_shift(4, 0), X;
  }
  function u(F, X, z) {
    var H = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
    return X == 8 && z.qpro ? (H.s.c = F.read_shift(1), F.l++, H.s.r = F.read_shift(2), H.e.c = F.read_shift(1), F.l++, H.e.r = F.read_shift(2), H) : (H.s.c = F.read_shift(2), H.s.r = F.read_shift(2), X == 12 && z.qpro && (F.l += 2), H.e.c = F.read_shift(2), H.e.r = F.read_shift(2), X == 12 && z.qpro && (F.l += 2), H.s.c == 65535 && (H.s.c = H.e.c = H.s.r = H.e.r = 0), H);
  }
  function d(F) {
    var X = Dr(8);
    return X.write_shift(2, F.s.c), X.write_shift(2, F.s.r), X.write_shift(2, F.e.c), X.write_shift(2, F.e.r), X;
  }
  function x(F, X, z) {
    var H = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0, 0];
    return z.qpro && z.vers != 20768 ? (H[0].c = F.read_shift(1), H[3] = F.read_shift(1), H[0].r = F.read_shift(2), F.l += 2) : (H[2] = F.read_shift(1), H[0].c = F.read_shift(2), H[0].r = F.read_shift(2)), H;
  }
  function p(F, X, z) {
    var H = F.l + X, ue = x(F, X, z);
    if (ue[1].t = "s", z.vers == 20768) {
      F.l++;
      var K = F.read_shift(1);
      return ue[1].v = F.read_shift(K, "utf8"), ue;
    }
    return z.qpro && F.l++, ue[1].v = F.read_shift(H - F.l, "cstr"), ue;
  }
  function g(F, X, z) {
    var H = Dr(7 + z.length);
    H.write_shift(1, 255), H.write_shift(2, X), H.write_shift(2, F), H.write_shift(1, 39);
    for (var ue = 0; ue < H.length; ++ue) {
      var K = z.charCodeAt(ue);
      H.write_shift(1, K >= 128 ? 95 : K);
    }
    return H.write_shift(1, 0), H;
  }
  function w(F, X, z) {
    var H = x(F, X, z);
    return H[1].v = F.read_shift(2, "i"), H;
  }
  function k(F, X, z) {
    var H = Dr(7);
    return H.write_shift(1, 255), H.write_shift(2, X), H.write_shift(2, F), H.write_shift(2, z, "i"), H;
  }
  function _(F, X, z) {
    var H = x(F, X, z);
    return H[1].v = F.read_shift(8, "f"), H;
  }
  function y(F, X, z) {
    var H = Dr(13);
    return H.write_shift(1, 255), H.write_shift(2, X), H.write_shift(2, F), H.write_shift(8, z, "f"), H;
  }
  function E(F, X, z) {
    var H = F.l + X, ue = x(F, X, z);
    if (ue[1].v = F.read_shift(8, "f"), z.qpro) F.l = H;
    else {
      var K = F.read_shift(2);
      V(F.slice(F.l, F.l + K), ue), F.l += K;
    }
    return ue;
  }
  function A(F, X, z) {
    var H = X & 32768;
    return X &= -32769, X = (H ? F : 0) + (X >= 8192 ? X - 16384 : X), (H ? "" : "$") + (z ? Or(X) : Wr(X));
  }
  var O = {
    51: ["FALSE", 0],
    52: ["TRUE", 0],
    70: ["LEN", 1],
    80: ["SUM", 69],
    81: ["AVERAGEA", 69],
    82: ["COUNTA", 69],
    83: ["MINA", 69],
    84: ["MAXA", 69],
    111: ["T", 1]
  }, N = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "",
    "+",
    "-",
    "*",
    "/",
    "^",
    "=",
    "<>",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "<=",
    ">=",
    "<",
    ">",
    "",
    "",
    "",
    "",
    // eslint-disable-line no-mixed-spaces-and-tabs
    "&",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
    // eslint-disable-line no-mixed-spaces-and-tabs
  ];
  function V(F, X) {
    Hr(F, 0);
    for (var z = [], H = 0, ue = "", K = "", te = "", Z = ""; F.l < F.length; ) {
      var fe = F[F.l++];
      switch (fe) {
        case 0:
          z.push(F.read_shift(8, "f"));
          break;
        case 1:
          K = A(X[0].c, F.read_shift(2), !0), ue = A(X[0].r, F.read_shift(2), !1), z.push(K + ue);
          break;
        case 2:
          {
            var Pe = A(X[0].c, F.read_shift(2), !0), P = A(X[0].r, F.read_shift(2), !1);
            K = A(X[0].c, F.read_shift(2), !0), ue = A(X[0].r, F.read_shift(2), !1), z.push(Pe + P + ":" + K + ue);
          }
          break;
        case 3:
          if (F.l < F.length) {
            console.error("WK1 premature formula end");
            return;
          }
          break;
        case 4:
          z.push("(" + z.pop() + ")");
          break;
        case 5:
          z.push(F.read_shift(2));
          break;
        case 6:
          {
            for (var Xe = ""; fe = F[F.l++]; ) Xe += String.fromCharCode(fe);
            z.push('"' + Xe.replace(/"/g, '""') + '"');
          }
          break;
        case 8:
          z.push("-" + z.pop());
          break;
        case 23:
          z.push("+" + z.pop());
          break;
        case 22:
          z.push("NOT(" + z.pop() + ")");
          break;
        case 20:
        case 21:
          Z = z.pop(), te = z.pop(), z.push(["AND", "OR"][fe - 20] + "(" + te + "," + Z + ")");
          break;
        default:
          if (fe < 32 && N[fe])
            Z = z.pop(), te = z.pop(), z.push(te + N[fe] + Z);
          else if (O[fe]) {
            if (H = O[fe][1], H == 69 && (H = F[F.l++]), H > z.length) {
              console.error("WK1 bad formula parse 0x" + fe.toString(16) + ":|" + z.join("|") + "|");
              return;
            }
            var je = z.slice(-H);
            z.length -= H, z.push(O[fe][0] + "(" + je.join(",") + ")");
          } else return fe <= 7 ? console.error("WK1 invalid opcode " + fe.toString(16)) : fe <= 24 ? console.error("WK1 unsupported op " + fe.toString(16)) : fe <= 30 ? console.error("WK1 invalid opcode " + fe.toString(16)) : fe <= 115 ? console.error("WK1 unsupported function opcode " + fe.toString(16)) : console.error("WK1 unrecognized opcode " + fe.toString(16));
      }
    }
    z.length == 1 ? X[1].f = "" + z[0] : console.error("WK1 bad formula parse |" + z.join("|") + "|");
  }
  function J(F) {
    var X = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0];
    return X[0].r = F.read_shift(2), X[3] = F[F.l++], X[0].c = F[F.l++], X;
  }
  function j(F, X) {
    var z = J(F);
    return z[1].t = "s", z[1].v = F.read_shift(X - 4, "cstr"), z;
  }
  function C(F, X, z, H) {
    var ue = Dr(6 + H.length);
    ue.write_shift(2, F), ue.write_shift(1, z), ue.write_shift(1, X), ue.write_shift(1, 39);
    for (var K = 0; K < H.length; ++K) {
      var te = H.charCodeAt(K);
      ue.write_shift(1, te >= 128 ? 95 : te);
    }
    return ue.write_shift(1, 0), ue;
  }
  function G(F, X) {
    var z = J(F);
    z[1].v = F.read_shift(2);
    var H = z[1].v >> 1;
    if (z[1].v & 1)
      switch (H & 7) {
        case 0:
          H = (H >> 3) * 5e3;
          break;
        case 1:
          H = (H >> 3) * 500;
          break;
        case 2:
          H = (H >> 3) / 20;
          break;
        case 3:
          H = (H >> 3) / 200;
          break;
        case 4:
          H = (H >> 3) / 2e3;
          break;
        case 5:
          H = (H >> 3) / 2e4;
          break;
        case 6:
          H = (H >> 3) / 16;
          break;
        case 7:
          H = (H >> 3) / 64;
          break;
      }
    return z[1].v = H, z;
  }
  function B(F, X) {
    var z = J(F), H = F.read_shift(4), ue = F.read_shift(4), K = F.read_shift(2);
    if (K == 65535)
      return H === 0 && ue === 3221225472 ? (z[1].t = "e", z[1].v = 15) : H === 0 && ue === 3489660928 ? (z[1].t = "e", z[1].v = 42) : z[1].v = 0, z;
    var te = K & 32768;
    return K = (K & 32767) - 16446, z[1].v = (1 - te * 2) * (ue * Math.pow(2, K + 32) + H * Math.pow(2, K)), z;
  }
  function le(F, X, z, H) {
    var ue = Dr(14);
    if (ue.write_shift(2, F), ue.write_shift(1, z), ue.write_shift(1, X), H == 0)
      return ue.write_shift(4, 0), ue.write_shift(4, 0), ue.write_shift(2, 65535), ue;
    var K = 0, te = 0, Z = 0, fe = 0;
    return H < 0 && (K = 1, H = -H), te = Math.log2(H) | 0, H /= Math.pow(2, te - 31), fe = H >>> 0, (fe & 2147483648) == 0 && (H /= 2, ++te, fe = H >>> 0), H -= fe, fe |= 2147483648, fe >>>= 0, H *= Math.pow(2, 32), Z = H >>> 0, ue.write_shift(4, Z), ue.write_shift(4, fe), te += 16383 + (K ? 32768 : 0), ue.write_shift(2, te), ue;
  }
  function re(F, X) {
    var z = B(F);
    return F.l += X - 14, z;
  }
  function Q(F, X) {
    var z = J(F), H = F.read_shift(4);
    return z[1].v = H >> 6, z;
  }
  function pe(F, X) {
    var z = J(F), H = F.read_shift(8, "f");
    return z[1].v = H, z;
  }
  function Ce(F, X) {
    var z = pe(F);
    return F.l += X - 10, z;
  }
  function xe(F, X) {
    return F[F.l + X - 1] == 0 ? F.read_shift(X, "cstr") : "";
  }
  function we(F, X) {
    var z = F[F.l++];
    z > X - 1 && (z = X - 1);
    for (var H = ""; H.length < z; ) H += String.fromCharCode(F[F.l++]);
    return H;
  }
  function ye(F, X, z) {
    if (!(!z.qpro || X < 21)) {
      var H = F.read_shift(1);
      F.l += 17, F.l += 1, F.l += 2;
      var ue = F.read_shift(X - 21, "cstr");
      return [H, ue];
    }
  }
  function ge(F, X) {
    for (var z = {}, H = F.l + X; F.l < H; ) {
      var ue = F.read_shift(2);
      if (ue == 14e3) {
        for (z[ue] = [0, ""], z[ue][0] = F.read_shift(2); F[F.l]; )
          z[ue][1] += String.fromCharCode(F[F.l]), F.l++;
        F.l++;
      }
    }
    return z;
  }
  function Y(F, X) {
    var z = Dr(5 + F.length);
    z.write_shift(2, 14e3), z.write_shift(2, X);
    for (var H = 0; H < F.length; ++H) {
      var ue = F.charCodeAt(H);
      z[z.l++] = ue > 127 ? 95 : ue;
    }
    return z[z.l++] = 0, z;
  }
  var he = {
    /*::[*/
    0: { n: "BOF", f: Ar },
    /*::[*/
    1: { n: "EOF" },
    /*::[*/
    2: { n: "CALCMODE" },
    /*::[*/
    3: { n: "CALCORDER" },
    /*::[*/
    4: { n: "SPLIT" },
    /*::[*/
    5: { n: "SYNC" },
    /*::[*/
    6: { n: "RANGE", f: u },
    /*::[*/
    7: { n: "WINDOW1" },
    /*::[*/
    8: { n: "COLW1" },
    /*::[*/
    9: { n: "WINTWO" },
    /*::[*/
    10: { n: "COLW2" },
    /*::[*/
    11: { n: "NAME" },
    /*::[*/
    12: { n: "BLANK" },
    /*::[*/
    13: { n: "INTEGER", f: w },
    /*::[*/
    14: { n: "NUMBER", f: _ },
    /*::[*/
    15: { n: "LABEL", f: p },
    /*::[*/
    16: { n: "FORMULA", f: E },
    /*::[*/
    24: { n: "TABLE" },
    /*::[*/
    25: { n: "ORANGE" },
    /*::[*/
    26: { n: "PRANGE" },
    /*::[*/
    27: { n: "SRANGE" },
    /*::[*/
    28: { n: "FRANGE" },
    /*::[*/
    29: { n: "KRANGE1" },
    /*::[*/
    32: { n: "HRANGE" },
    /*::[*/
    35: { n: "KRANGE2" },
    /*::[*/
    36: { n: "PROTEC" },
    /*::[*/
    37: { n: "FOOTER" },
    /*::[*/
    38: { n: "HEADER" },
    /*::[*/
    39: { n: "SETUP" },
    /*::[*/
    40: { n: "MARGINS" },
    /*::[*/
    41: { n: "LABELFMT" },
    /*::[*/
    42: { n: "TITLES" },
    /*::[*/
    43: { n: "SHEETJS" },
    /*::[*/
    45: { n: "GRAPH" },
    /*::[*/
    46: { n: "NGRAPH" },
    /*::[*/
    47: { n: "CALCCOUNT" },
    /*::[*/
    48: { n: "UNFORMATTED" },
    /*::[*/
    49: { n: "CURSORW12" },
    /*::[*/
    50: { n: "WINDOW" },
    /*::[*/
    51: { n: "STRING", f: p },
    /*::[*/
    55: { n: "PASSWORD" },
    /*::[*/
    56: { n: "LOCKED" },
    /*::[*/
    60: { n: "QUERY" },
    /*::[*/
    61: { n: "QUERYNAME" },
    /*::[*/
    62: { n: "PRINT" },
    /*::[*/
    63: { n: "PRINTNAME" },
    /*::[*/
    64: { n: "GRAPH2" },
    /*::[*/
    65: { n: "GRAPHNAME" },
    /*::[*/
    66: { n: "ZOOM" },
    /*::[*/
    67: { n: "SYMSPLIT" },
    /*::[*/
    68: { n: "NSROWS" },
    /*::[*/
    69: { n: "NSCOLS" },
    /*::[*/
    70: { n: "RULER" },
    /*::[*/
    71: { n: "NNAME" },
    /*::[*/
    72: { n: "ACOMM" },
    /*::[*/
    73: { n: "AMACRO" },
    /*::[*/
    74: { n: "PARSE" },
    /*::[*/
    102: { n: "PRANGES??" },
    /*::[*/
    103: { n: "RRANGES??" },
    /*::[*/
    104: { n: "FNAME??" },
    /*::[*/
    105: { n: "MRANGES??" },
    /*::[*/
    204: { n: "SHEETNAMECS", f: xe },
    /*::[*/
    222: { n: "SHEETNAMELP", f: we },
    /*::[*/
    65535: { n: "" }
  }, U = {
    /*::[*/
    0: { n: "BOF" },
    /*::[*/
    1: { n: "EOF" },
    /*::[*/
    2: { n: "PASSWORD" },
    /*::[*/
    3: { n: "CALCSET" },
    /*::[*/
    4: { n: "WINDOWSET" },
    /*::[*/
    5: { n: "SHEETCELLPTR" },
    /*::[*/
    6: { n: "SHEETLAYOUT" },
    /*::[*/
    7: { n: "COLUMNWIDTH" },
    /*::[*/
    8: { n: "HIDDENCOLUMN" },
    /*::[*/
    9: { n: "USERRANGE" },
    /*::[*/
    10: { n: "SYSTEMRANGE" },
    /*::[*/
    11: { n: "ZEROFORCE" },
    /*::[*/
    12: { n: "SORTKEYDIR" },
    /*::[*/
    13: { n: "FILESEAL" },
    /*::[*/
    14: { n: "DATAFILLNUMS" },
    /*::[*/
    15: { n: "PRINTMAIN" },
    /*::[*/
    16: { n: "PRINTSTRING" },
    /*::[*/
    17: { n: "GRAPHMAIN" },
    /*::[*/
    18: { n: "GRAPHSTRING" },
    /*::[*/
    19: { n: "??" },
    /*::[*/
    20: { n: "ERRCELL" },
    /*::[*/
    21: { n: "NACELL" },
    /*::[*/
    22: { n: "LABEL16", f: j },
    /*::[*/
    23: { n: "NUMBER17", f: B },
    /*::[*/
    24: { n: "NUMBER18", f: G },
    /*::[*/
    25: { n: "FORMULA19", f: re },
    /*::[*/
    26: { n: "FORMULA1A" },
    /*::[*/
    27: { n: "XFORMAT", f: ge },
    /*::[*/
    28: { n: "DTLABELMISC" },
    /*::[*/
    29: { n: "DTLABELCELL" },
    /*::[*/
    30: { n: "GRAPHWINDOW" },
    /*::[*/
    31: { n: "CPA" },
    /*::[*/
    32: { n: "LPLAUTO" },
    /*::[*/
    33: { n: "QUERY" },
    /*::[*/
    34: { n: "HIDDENSHEET" },
    /*::[*/
    35: { n: "??" },
    /*::[*/
    37: { n: "NUMBER25", f: Q },
    /*::[*/
    38: { n: "??" },
    /*::[*/
    39: { n: "NUMBER27", f: pe },
    /*::[*/
    40: { n: "FORMULA28", f: Ce },
    /*::[*/
    142: { n: "??" },
    /*::[*/
    147: { n: "??" },
    /*::[*/
    150: { n: "??" },
    /*::[*/
    151: { n: "??" },
    /*::[*/
    152: { n: "??" },
    /*::[*/
    153: { n: "??" },
    /*::[*/
    154: { n: "??" },
    /*::[*/
    155: { n: "??" },
    /*::[*/
    156: { n: "??" },
    /*::[*/
    163: { n: "??" },
    /*::[*/
    174: { n: "??" },
    /*::[*/
    175: { n: "??" },
    /*::[*/
    176: { n: "??" },
    /*::[*/
    177: { n: "??" },
    /*::[*/
    184: { n: "??" },
    /*::[*/
    185: { n: "??" },
    /*::[*/
    186: { n: "??" },
    /*::[*/
    187: { n: "??" },
    /*::[*/
    188: { n: "??" },
    /*::[*/
    195: { n: "??" },
    /*::[*/
    201: { n: "??" },
    /*::[*/
    204: { n: "SHEETNAMECS", f: xe },
    /*::[*/
    205: { n: "??" },
    /*::[*/
    206: { n: "??" },
    /*::[*/
    207: { n: "??" },
    /*::[*/
    208: { n: "??" },
    /*::[*/
    256: { n: "??" },
    /*::[*/
    259: { n: "??" },
    /*::[*/
    260: { n: "??" },
    /*::[*/
    261: { n: "??" },
    /*::[*/
    262: { n: "??" },
    /*::[*/
    263: { n: "??" },
    /*::[*/
    265: { n: "??" },
    /*::[*/
    266: { n: "??" },
    /*::[*/
    267: { n: "??" },
    /*::[*/
    268: { n: "??" },
    /*::[*/
    270: { n: "??" },
    /*::[*/
    271: { n: "??" },
    /*::[*/
    384: { n: "??" },
    /*::[*/
    389: { n: "??" },
    /*::[*/
    390: { n: "??" },
    /*::[*/
    393: { n: "??" },
    /*::[*/
    396: { n: "??" },
    /*::[*/
    512: { n: "??" },
    /*::[*/
    514: { n: "??" },
    /*::[*/
    513: { n: "??" },
    /*::[*/
    516: { n: "??" },
    /*::[*/
    517: { n: "??" },
    /*::[*/
    640: { n: "??" },
    /*::[*/
    641: { n: "??" },
    /*::[*/
    642: { n: "??" },
    /*::[*/
    643: { n: "??" },
    /*::[*/
    644: { n: "??" },
    /*::[*/
    645: { n: "??" },
    /*::[*/
    646: { n: "??" },
    /*::[*/
    647: { n: "??" },
    /*::[*/
    648: { n: "??" },
    /*::[*/
    658: { n: "??" },
    /*::[*/
    659: { n: "??" },
    /*::[*/
    660: { n: "??" },
    /*::[*/
    661: { n: "??" },
    /*::[*/
    662: { n: "??" },
    /*::[*/
    665: { n: "??" },
    /*::[*/
    666: { n: "??" },
    /*::[*/
    768: { n: "??" },
    /*::[*/
    772: { n: "??" },
    /*::[*/
    1537: { n: "SHEETINFOQP", f: ye },
    /*::[*/
    1600: { n: "??" },
    /*::[*/
    1602: { n: "??" },
    /*::[*/
    1793: { n: "??" },
    /*::[*/
    1794: { n: "??" },
    /*::[*/
    1795: { n: "??" },
    /*::[*/
    1796: { n: "??" },
    /*::[*/
    1920: { n: "??" },
    /*::[*/
    2048: { n: "??" },
    /*::[*/
    2049: { n: "??" },
    /*::[*/
    2052: { n: "??" },
    /*::[*/
    2688: { n: "??" },
    /*::[*/
    10998: { n: "??" },
    /*::[*/
    12849: { n: "??" },
    /*::[*/
    28233: { n: "??" },
    /*::[*/
    28484: { n: "??" },
    /*::[*/
    65535: { n: "" }
  };
  return {
    sheet_to_wk1: s,
    book_to_wk3: i,
    to_workbook: n
  };
})();
function hw(e) {
  var n = {}, r = e.match(it), s = 0, i = !1;
  if (r) for (; s != r.length; ++s) {
    var o = Ue(r[s]);
    switch (o[0].replace(/\w*:/g, "")) {
      /* 18.8.12 condense CT_BooleanProperty */
      /* ** not required . */
      case "<condense":
        break;
      /* 18.8.17 extend CT_BooleanProperty */
      /* ** not required . */
      case "<extend":
        break;
      /* 18.8.36 shadow CT_BooleanProperty */
      /* ** not required . */
      case "<shadow":
        if (!o.val) break;
      /* falls through */
      case "<shadow>":
      case "<shadow/>":
        n.shadow = 1;
        break;
      case "</shadow>":
        break;
      /* 18.4.1 charset CT_IntProperty TODO */
      case "<charset":
        if (o.val == "1") break;
        n.cp = Pc[parseInt(o.val, 10)];
        break;
      /* 18.4.2 outline CT_BooleanProperty TODO */
      case "<outline":
        if (!o.val) break;
      /* falls through */
      case "<outline>":
      case "<outline/>":
        n.outline = 1;
        break;
      case "</outline>":
        break;
      /* 18.4.5 rFont CT_FontName */
      case "<rFont":
        n.name = o.val;
        break;
      /* 18.4.11 sz CT_FontSize */
      case "<sz":
        n.sz = o.val;
        break;
      /* 18.4.10 strike CT_BooleanProperty */
      case "<strike":
        if (!o.val) break;
      /* falls through */
      case "<strike>":
      case "<strike/>":
        n.strike = 1;
        break;
      case "</strike>":
        break;
      /* 18.4.13 u CT_UnderlineProperty */
      case "<u":
        if (!o.val) break;
        switch (o.val) {
          case "double":
            n.uval = "double";
            break;
          case "singleAccounting":
            n.uval = "single-accounting";
            break;
          case "doubleAccounting":
            n.uval = "double-accounting";
            break;
        }
      /* falls through */
      case "<u>":
      case "<u/>":
        n.u = 1;
        break;
      case "</u>":
        break;
      /* 18.8.2 b */
      case "<b":
        if (o.val == "0") break;
      /* falls through */
      case "<b>":
      case "<b/>":
        n.b = 1;
        break;
      case "</b>":
        break;
      /* 18.8.26 i */
      case "<i":
        if (o.val == "0") break;
      /* falls through */
      case "<i>":
      case "<i/>":
        n.i = 1;
        break;
      case "</i>":
        break;
      /* 18.3.1.15 color CT_Color TODO: tint, theme, auto, indexed */
      case "<color":
        o.rgb && (n.color = o.rgb.slice(2, 8));
        break;
      case "<color>":
      case "<color/>":
      case "</color>":
        break;
      /* 18.8.18 family ST_FontFamily */
      case "<family":
        n.family = o.val;
        break;
      case "<family>":
      case "<family/>":
      case "</family>":
        break;
      /* 18.4.14 vertAlign CT_VerticalAlignFontProperty TODO */
      case "<vertAlign":
        n.valign = o.val;
        break;
      case "<vertAlign>":
      case "<vertAlign/>":
      case "</vertAlign>":
        break;
      /* 18.8.35 scheme CT_FontScheme TODO */
      case "<scheme":
        break;
      case "<scheme>":
      case "<scheme/>":
      case "</scheme>":
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
        break;
      case "<ext":
        i = !0;
        break;
      case "</ext>":
        i = !1;
        break;
      default:
        if (o[0].charCodeAt(1) !== 47 && !i) throw new Error("Unrecognized rich format " + o[0]);
    }
  }
  return n;
}
var pw = /* @__PURE__ */ (function() {
  var e = Cs("t"), n = Cs("rPr");
  function r(o) {
    var c = o.match(e);
    if (!c) return { t: "s", v: "" };
    var u = { t: "s", v: er(c[1]) }, d = o.match(n);
    return d && (u.s = hw(d[1])), u;
  }
  var s = /<(?:\w+:)?r>/g, i = /<\/(?:\w+:)?r>/;
  return function(c) {
    return c.replace(s, "").split(i).map(r).filter(function(u) {
      return u.v;
    });
  };
})(), xw = /* @__PURE__ */ (function() {
  var n = /(\r\n|\n)/g;
  function r(i, o, c) {
    var u = [];
    i.u && u.push("text-decoration: underline;"), i.uval && u.push("text-underline-style:" + i.uval + ";"), i.sz && u.push("font-size:" + i.sz + "pt;"), i.outline && u.push("text-effect: outline;"), i.shadow && u.push("text-shadow: auto;"), o.push('<span style="' + u.join("") + '">'), i.b && (o.push("<b>"), c.push("</b>")), i.i && (o.push("<i>"), c.push("</i>")), i.strike && (o.push("<s>"), c.push("</s>"));
    var d = i.valign || "";
    return d == "superscript" || d == "super" ? d = "sup" : d == "subscript" && (d = "sub"), d != "" && (o.push("<" + d + ">"), c.push("</" + d + ">")), c.push("</span>"), i;
  }
  function s(i) {
    var o = [[], i.v, []];
    return i.v ? (i.s && r(i.s, o[0], o[2]), o[0].join("") + o[1].replace(n, "<br/>") + o[2].join("")) : "";
  }
  return function(o) {
    return o.map(s).join("");
  };
})(), mw = /<(?:\w+:)?t[^>]*>([^<]*)<\/(?:\w+:)?t>/g, gw = /<(?:\w+:)?r>/, vw = /<(?:\w+:)?rPh.*?>([\s\S]*?)<\/(?:\w+:)?rPh>/g;
function Qc(e, n) {
  var r = n ? n.cellHTML : !0, s = {};
  return e ? (e.match(/^\s*<(?:\w+:)?t[^>]*>/) ? (s.t = er(lr(e.slice(e.indexOf(">") + 1).split(/<\/(?:\w+:)?t>/)[0] || "")), s.r = lr(e), r && (s.h = Uc(s.t))) : (
    /*y = */
    e.match(gw) && (s.r = lr(e), s.t = er(lr((e.replace(vw, "").match(mw) || []).join("").replace(it, ""))), r && (s.h = xw(pw(s.r))))
  ), s) : { t: "" };
}
var ww = /<(?:\w+:)?sst([^>]*)>([\s\S]*)<\/(?:\w+:)?sst>/, yw = /<(?:\w+:)?(?:si|sstItem)>/g, _w = /<\/(?:\w+:)?(?:si|sstItem)>/;
function kw(e, n) {
  var r = [], s = "";
  if (!e) return r;
  var i = e.match(ww);
  if (i) {
    s = i[2].replace(yw, "").split(_w);
    for (var o = 0; o != s.length; ++o) {
      var c = Qc(s[o].trim(), n);
      c != null && (r[r.length] = c);
    }
    i = Ue(i[1]), r.Count = i.count, r.Unique = i.uniqueCount;
  }
  return r;
}
function Ew(e) {
  return [e.read_shift(4), e.read_shift(4)];
}
function Sw(e, n) {
  var r = [], s = !1;
  return Dn(e, function(o, c, u) {
    switch (u) {
      case 159:
        r.Count = o[0], r.Unique = o[1];
        break;
      case 19:
        r.push(o);
        break;
      case 160:
        return !0;
      case 35:
        s = !0;
        break;
      case 36:
        s = !1;
        break;
      default:
        if (c.T, !s || n.WTF) throw new Error("Unexpected record 0x" + u.toString(16));
    }
  }), r;
}
function t1(e) {
  for (var n = [], r = e.split(""), s = 0; s < r.length; ++s) n[s] = r[s].charCodeAt(0);
  return n;
}
function Nn(e, n) {
  var r = {};
  return r.Major = e.read_shift(2), r.Minor = e.read_shift(2), n >= 4 && (e.l += n - 4), r;
}
function Tw(e) {
  var n = {};
  return n.id = e.read_shift(0, "lpp4"), n.R = Nn(e, 4), n.U = Nn(e, 4), n.W = Nn(e, 4), n;
}
function Cw(e) {
  for (var n = e.read_shift(4), r = e.l + n - 4, s = {}, i = e.read_shift(4), o = []; i-- > 0; ) o.push({ t: e.read_shift(4), v: e.read_shift(0, "lpp4") });
  if (s.name = e.read_shift(0, "lpp4"), s.comps = o, e.l != r) throw new Error("Bad DataSpaceMapEntry: " + e.l + " != " + r);
  return s;
}
function Aw(e) {
  var n = [];
  e.l += 4;
  for (var r = e.read_shift(4); r-- > 0; ) n.push(Cw(e));
  return n;
}
function Fw(e) {
  var n = [];
  e.l += 4;
  for (var r = e.read_shift(4); r-- > 0; ) n.push(e.read_shift(0, "lpp4"));
  return n;
}
function Nw(e) {
  var n = {};
  return e.read_shift(4), e.l += 4, n.id = e.read_shift(0, "lpp4"), n.name = e.read_shift(0, "lpp4"), n.R = Nn(e, 4), n.U = Nn(e, 4), n.W = Nn(e, 4), n;
}
function Rw(e) {
  var n = Nw(e);
  if (n.ename = e.read_shift(0, "8lpp4"), n.blksz = e.read_shift(4), n.cmode = e.read_shift(4), e.read_shift(4) != 4) throw new Error("Bad !Primary record");
  return n;
}
function n1(e, n) {
  var r = e.l + n, s = {};
  s.Flags = e.read_shift(4) & 63, e.l += 4, s.AlgID = e.read_shift(4);
  var i = !1;
  switch (s.AlgID) {
    case 26126:
    case 26127:
    case 26128:
      i = s.Flags == 36;
      break;
    case 26625:
      i = s.Flags == 4;
      break;
    case 0:
      i = s.Flags == 16 || s.Flags == 4 || s.Flags == 36;
      break;
    default:
      throw "Unrecognized encryption algorithm: " + s.AlgID;
  }
  if (!i) throw new Error("Encryption Flags/AlgID mismatch");
  return s.AlgIDHash = e.read_shift(4), s.KeySize = e.read_shift(4), s.ProviderType = e.read_shift(4), e.l += 8, s.CSPName = e.read_shift(r - e.l >> 1, "utf16le"), e.l = r, s;
}
function a1(e, n) {
  var r = {}, s = e.l + n;
  return e.l += 4, r.Salt = e.slice(e.l, e.l + 16), e.l += 16, r.Verifier = e.slice(e.l, e.l + 16), e.l += 16, e.read_shift(4), r.VerifierHash = e.slice(e.l, s), e.l = s, r;
}
function Dw(e) {
  var n = Nn(e);
  switch (n.Minor) {
    case 2:
      return [n.Minor, Ow(e)];
    case 3:
      return [n.Minor, Pw()];
    case 4:
      return [n.Minor, bw(e)];
  }
  throw new Error("ECMA-376 Encrypted file unrecognized Version: " + n.Minor);
}
function Ow(e) {
  var n = e.read_shift(4);
  if ((n & 63) != 36) throw new Error("EncryptionInfo mismatch");
  var r = e.read_shift(4), s = n1(e, r), i = a1(e, e.length - e.l);
  return { t: "Std", h: s, v: i };
}
function Pw() {
  throw new Error("File is password-protected: ECMA-376 Extensible");
}
function bw(e) {
  var n = ["saltSize", "blockSize", "keyBits", "hashSize", "cipherAlgorithm", "cipherChaining", "hashAlgorithm", "saltValue"];
  e.l += 4;
  var r = e.read_shift(e.length - e.l, "utf8"), s = {};
  return r.replace(it, function(o) {
    var c = Ue(o);
    switch (dn(c[0])) {
      case "<?xml":
        break;
      case "<encryption":
      case "</encryption>":
        break;
      case "<keyData":
        n.forEach(function(u) {
          s[u] = c[u];
        });
        break;
      case "<dataIntegrity":
        s.encryptedHmacKey = c.encryptedHmacKey, s.encryptedHmacValue = c.encryptedHmacValue;
        break;
      case "<keyEncryptors>":
      case "<keyEncryptors":
        s.encs = [];
        break;
      case "</keyEncryptors>":
        break;
      case "<keyEncryptor":
        s.uri = c.uri;
        break;
      case "</keyEncryptor>":
        break;
      case "<encryptedKey":
        s.encs.push(c);
        break;
      default:
        throw c[0];
    }
  }), s;
}
function Iw(e, n) {
  var r = {}, s = r.EncryptionVersionInfo = Nn(e, 4);
  if (n -= 4, s.Minor != 2) throw new Error("unrecognized minor version code: " + s.Minor);
  if (s.Major > 4 || s.Major < 2) throw new Error("unrecognized major version code: " + s.Major);
  r.Flags = e.read_shift(4), n -= 4;
  var i = e.read_shift(4);
  return n -= 4, r.EncryptionHeader = n1(e, i), n -= i, r.EncryptionVerifier = a1(e, n), r;
}
function Lw(e) {
  var n = {}, r = n.EncryptionVersionInfo = Nn(e, 4);
  if (r.Major != 1 || r.Minor != 1) throw "unrecognized version code " + r.Major + " : " + r.Minor;
  return n.Salt = e.read_shift(16), n.EncryptedVerifier = e.read_shift(16), n.EncryptedVerifierHash = e.read_shift(16), n;
}
function Mw(e) {
  var n = 0, r, s = t1(e), i = s.length + 1, o, c, u, d, x;
  for (r = ia(i), r[0] = s.length, o = 1; o != i; ++o) r[o] = s[o - 1];
  for (o = i - 1; o >= 0; --o)
    c = r[o], u = (n & 16384) === 0 ? 0 : 1, d = n << 1 & 32767, x = u | d, n = x ^ c;
  return n ^ 52811;
}
var i1 = /* @__PURE__ */ (function() {
  var e = [187, 255, 255, 186, 255, 255, 185, 128, 0, 190, 15, 0, 191, 15, 0], n = [57840, 7439, 52380, 33984, 4364, 3600, 61902, 12606, 6258, 57657, 54287, 34041, 10252, 43370, 20163], r = [44796, 19929, 39858, 10053, 20106, 40212, 10761, 31585, 63170, 64933, 60267, 50935, 40399, 11199, 17763, 35526, 1453, 2906, 5812, 11624, 23248, 885, 1770, 3540, 7080, 14160, 28320, 56640, 55369, 41139, 20807, 41614, 21821, 43642, 17621, 28485, 56970, 44341, 19019, 38038, 14605, 29210, 60195, 50791, 40175, 10751, 21502, 43004, 24537, 18387, 36774, 3949, 7898, 15796, 31592, 63184, 47201, 24803, 49606, 37805, 14203, 28406, 56812, 17824, 35648, 1697, 3394, 6788, 13576, 27152, 43601, 17539, 35078, 557, 1114, 2228, 4456, 30388, 60776, 51953, 34243, 7079, 14158, 28316, 14128, 28256, 56512, 43425, 17251, 34502, 7597, 13105, 26210, 52420, 35241, 883, 1766, 3532, 4129, 8258, 16516, 33032, 4657, 9314, 18628], s = function(c) {
    return (c / 2 | c * 128) & 255;
  }, i = function(c, u) {
    return s(c ^ u);
  }, o = function(c) {
    for (var u = n[c.length - 1], d = 104, x = c.length - 1; x >= 0; --x)
      for (var p = c[x], g = 0; g != 7; ++g)
        p & 64 && (u ^= r[d]), p *= 2, --d;
    return u;
  };
  return function(c) {
    for (var u = t1(c), d = o(u), x = u.length, p = ia(16), g = 0; g != 16; ++g) p[g] = 0;
    var w, k, _;
    for ((x & 1) === 1 && (w = d >> 8, p[x] = i(e[0], w), --x, w = d & 255, k = u[u.length - 1], p[x] = i(k, w)); x > 0; )
      --x, w = d >> 8, p[x] = i(u[x], w), --x, w = d & 255, p[x] = i(u[x], w);
    for (x = 15, _ = 15 - u.length; _ > 0; )
      w = d >> 8, p[x] = i(e[_], w), --x, --_, w = d & 255, p[x] = i(u[x], w), --x, --_;
    return p;
  };
})(), Bw = function(e, n, r, s, i) {
  i || (i = n), s || (s = i1(e));
  var o, c;
  for (o = 0; o != n.length; ++o)
    c = n[o], c ^= s[r], c = (c >> 5 | c << 3) & 255, i[o] = c, ++r;
  return [i, r, s];
}, jw = function(e) {
  var n = 0, r = i1(e);
  return function(s) {
    var i = Bw("", s, n, r);
    return n = i[1], i[0];
  };
};
function Uw(e, n, r, s) {
  var i = { key: Ar(e), verificationBytes: Ar(e) };
  return r.password && (i.verifier = Mw(r.password)), s.valid = i.verificationBytes === i.verifier, s.valid && (s.insitu = jw(r.password)), i;
}
function zw(e, n, r) {
  var s = r || {};
  return s.Info = e.read_shift(2), e.l -= 2, s.Info === 1 ? s.Data = Lw(e) : s.Data = Iw(e, n), s;
}
function Hw(e, n, r) {
  var s = { Type: r.biff >= 8 ? e.read_shift(2) : 0 };
  return s.Type ? zw(e, n - 2, s) : Uw(e, r.biff >= 8 ? n : n - 2, r, s), s;
}
var Vw = /* @__PURE__ */ (function() {
  function e(i, o) {
    switch (o.type) {
      case "base64":
        return n(Ft(i), o);
      case "binary":
        return n(i, o);
      case "buffer":
        return n(Qe && Buffer.isBuffer(i) ? i.toString("binary") : ba(i), o);
      case "array":
        return n(Da(i), o);
    }
    throw new Error("Unrecognized type " + o.type);
  }
  function n(i, o) {
    var c = o || {}, u = c.dense ? [] : {}, d = i.match(/\\trowd.*?\\row\b/g);
    if (!d.length) throw new Error("RTF missing table");
    var x = { s: { c: 0, r: 0 }, e: { c: 0, r: d.length - 1 } };
    return d.forEach(function(p, g) {
      Array.isArray(u) && (u[g] = []);
      for (var w = /\\\w+\b/g, k = 0, _, y = -1; _ = w.exec(p); ) {
        switch (_[0]) {
          case "\\cell":
            var E = p.slice(k, w.lastIndex - _[0].length);
            if (E[0] == " " && (E = E.slice(1)), ++y, E.length) {
              var A = { v: E, t: "s" };
              Array.isArray(u) ? u[g][y] = A : u[Ge({ r: g, c: y })] = A;
            }
            break;
        }
        k = w.lastIndex;
      }
      y > x.e.c && (x.e.c = y);
    }), u["!ref"] = Je(x), u;
  }
  function r(i, o) {
    return la(e(i, o), o);
  }
  function s(i) {
    for (var o = ["{\\rtf1\\ansi"], c = vr(i["!ref"]), u, d = Array.isArray(i), x = c.s.r; x <= c.e.r; ++x) {
      o.push("\\trowd\\trautofit1");
      for (var p = c.s.c; p <= c.e.c; ++p) o.push("\\cellx" + (p + 1));
      for (o.push("\\pard\\intbl"), p = c.s.c; p <= c.e.c; ++p) {
        var g = Ge({ r: x, c: p });
        u = d ? (i[x] || [])[p] : i[g], !(!u || u.v == null && (!u.f || u.F)) && (o.push(" " + (u.w || (Rn(u), u.w))), o.push("\\cell"));
      }
      o.push("\\pard\\intbl\\row");
    }
    return o.join("") + "}";
  }
  return {
    to_workbook: r,
    to_sheet: e,
    from_sheet: s
  };
})();
function Ww(e) {
  var n = e.slice(e[0] === "#" ? 1 : 0).slice(0, 6);
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}
function Ns(e) {
  for (var n = 0, r = 1; n != 3; ++n) r = r * 256 + (e[n] > 255 ? 255 : e[n] < 0 ? 0 : e[n]);
  return r.toString(16).toUpperCase().slice(1);
}
function Gw(e) {
  var n = e[0] / 255, r = e[1] / 255, s = e[2] / 255, i = Math.max(n, r, s), o = Math.min(n, r, s), c = i - o;
  if (c === 0) return [0, 0, n];
  var u = 0, d = 0, x = i + o;
  switch (d = c / (x > 1 ? 2 - x : x), i) {
    case n:
      u = ((r - s) / c + 6) % 6;
      break;
    case r:
      u = (s - n) / c + 2;
      break;
    case s:
      u = (n - r) / c + 4;
      break;
  }
  return [u / 6, d, x / 2];
}
function $w(e) {
  var n = e[0], r = e[1], s = e[2], i = r * 2 * (s < 0.5 ? s : 1 - s), o = s - i / 2, c = [o, o, o], u = 6 * n, d;
  if (r !== 0) switch (u | 0) {
    case 0:
    case 6:
      d = i * u, c[0] += i, c[1] += d;
      break;
    case 1:
      d = i * (2 - u), c[0] += d, c[1] += i;
      break;
    case 2:
      d = i * (u - 2), c[1] += i, c[2] += d;
      break;
    case 3:
      d = i * (4 - u), c[1] += d, c[2] += i;
      break;
    case 4:
      d = i * (u - 4), c[2] += i, c[0] += d;
      break;
    case 5:
      d = i * (6 - u), c[2] += d, c[0] += i;
      break;
  }
  for (var x = 0; x != 3; ++x) c[x] = Math.round(c[x] * 255);
  return c;
}
function fo(e, n) {
  if (n === 0) return e;
  var r = Gw(Ww(e));
  return n < 0 ? r[2] = r[2] * (1 + n) : r[2] = 1 - (1 - r[2]) * (1 - n), Ns($w(r));
}
var s1 = 6, Kw = 15, Xw = 1, ct = s1;
function ho(e) {
  return Math.floor((e + Math.round(128 / ct) / 256) * ct);
}
function po(e) {
  return Math.floor((e - 5) / ct * 100 + 0.5) / 100;
}
function Sc(e) {
  return Math.round((e * ct + 5) / ct * 256) / 256;
}
function dc(e) {
  return Sc(po(ho(e)));
}
function qc(e) {
  var n = Math.abs(e - dc(e)), r = ct;
  if (n > 5e-3) for (ct = Xw; ct < Kw; ++ct) Math.abs(e - dc(e)) <= n && (n = Math.abs(e - dc(e)), r = ct);
  ct = r;
}
function vi(e) {
  e.width ? (e.wpx = ho(e.width), e.wch = po(e.wpx), e.MDW = ct) : e.wpx ? (e.wch = po(e.wpx), e.width = Sc(e.wch), e.MDW = ct) : typeof e.wch == "number" && (e.width = Sc(e.wch), e.wpx = ho(e.width), e.MDW = ct), e.customWidth && delete e.customWidth;
}
var Yw = 96, l1 = Yw;
function o1(e) {
  return e * 96 / l1;
}
function Rs(e) {
  return e * l1 / 96;
}
var Qw = {
  None: "none",
  Solid: "solid",
  Gray50: "mediumGray",
  Gray75: "darkGray",
  Gray25: "lightGray",
  HorzStripe: "darkHorizontal",
  VertStripe: "darkVertical",
  ReverseDiagStripe: "darkDown",
  DiagStripe: "darkUp",
  DiagCross: "darkGrid",
  ThickDiagCross: "darkTrellis",
  ThinHorzStripe: "lightHorizontal",
  ThinVertStripe: "lightVertical",
  ThinReverseDiagStripe: "lightDown",
  ThinHorzCross: "lightGrid"
};
function qw(e, n, r, s) {
  n.Borders = [];
  var i = {}, o = !1;
  (e[0].match(it) || []).forEach(function(c) {
    var u = Ue(c);
    switch (dn(u[0])) {
      case "<borders":
      case "<borders>":
      case "</borders>":
        break;
      /* 18.8.4 border CT_Border */
      case "<border":
      case "<border>":
      case "<border/>":
        i = /*::(*/
        {}, u.diagonalUp && (i.diagonalUp = dr(u.diagonalUp)), u.diagonalDown && (i.diagonalDown = dr(u.diagonalDown)), n.Borders.push(i);
        break;
      case "</border>":
        break;
      /* note: not in spec, appears to be CT_BorderPr */
      case "<left/>":
        break;
      case "<left":
      case "<left>":
        break;
      case "</left>":
        break;
      /* note: not in spec, appears to be CT_BorderPr */
      case "<right/>":
        break;
      case "<right":
      case "<right>":
        break;
      case "</right>":
        break;
      /* 18.8.43 top CT_BorderPr */
      case "<top/>":
        break;
      case "<top":
      case "<top>":
        break;
      case "</top>":
        break;
      /* 18.8.6 bottom CT_BorderPr */
      case "<bottom/>":
        break;
      case "<bottom":
      case "<bottom>":
        break;
      case "</bottom>":
        break;
      /* 18.8.13 diagonal CT_BorderPr */
      case "<diagonal":
      case "<diagonal>":
      case "<diagonal/>":
        break;
      case "</diagonal>":
        break;
      /* 18.8.25 horizontal CT_BorderPr */
      case "<horizontal":
      case "<horizontal>":
      case "<horizontal/>":
        break;
      case "</horizontal>":
        break;
      /* 18.8.44 vertical CT_BorderPr */
      case "<vertical":
      case "<vertical>":
      case "<vertical/>":
        break;
      case "</vertical>":
        break;
      /* 18.8.37 start CT_BorderPr */
      case "<start":
      case "<start>":
      case "<start/>":
        break;
      case "</start>":
        break;
      /* 18.8.16 end CT_BorderPr */
      case "<end":
      case "<end>":
      case "<end/>":
        break;
      case "</end>":
        break;
      /* 18.8.? color CT_Color */
      case "<color":
      case "<color>":
        break;
      case "<color/>":
      case "</color>":
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
        break;
      case "<ext":
        o = !0;
        break;
      case "</ext>":
        o = !1;
        break;
      default:
        if (s && s.WTF && !o)
          throw new Error("unrecognized " + u[0] + " in borders");
    }
  });
}
function Jw(e, n, r, s) {
  n.Fills = [];
  var i = {}, o = !1;
  (e[0].match(it) || []).forEach(function(c) {
    var u = Ue(c);
    switch (dn(u[0])) {
      case "<fills":
      case "<fills>":
      case "</fills>":
        break;
      /* 18.8.20 fill CT_Fill */
      case "<fill>":
      case "<fill":
      case "<fill/>":
        i = {}, n.Fills.push(i);
        break;
      case "</fill>":
        break;
      /* 18.8.24 gradientFill CT_GradientFill */
      case "<gradientFill>":
        break;
      case "<gradientFill":
      case "</gradientFill>":
        n.Fills.push(i), i = {};
        break;
      /* 18.8.32 patternFill CT_PatternFill */
      case "<patternFill":
      case "<patternFill>":
        u.patternType && (i.patternType = u.patternType);
        break;
      case "<patternFill/>":
      case "</patternFill>":
        break;
      /* 18.8.3 bgColor CT_Color */
      case "<bgColor":
        i.bgColor || (i.bgColor = {}), u.indexed && (i.bgColor.indexed = parseInt(u.indexed, 10)), u.theme && (i.bgColor.theme = parseInt(u.theme, 10)), u.tint && (i.bgColor.tint = parseFloat(u.tint)), u.rgb && (i.bgColor.rgb = u.rgb.slice(-6));
        break;
      case "<bgColor/>":
      case "</bgColor>":
        break;
      /* 18.8.19 fgColor CT_Color */
      case "<fgColor":
        i.fgColor || (i.fgColor = {}), u.theme && (i.fgColor.theme = parseInt(u.theme, 10)), u.tint && (i.fgColor.tint = parseFloat(u.tint)), u.rgb != null && (i.fgColor.rgb = u.rgb.slice(-6));
        break;
      case "<fgColor/>":
      case "</fgColor>":
        break;
      /* 18.8.38 stop CT_GradientStop */
      case "<stop":
      case "<stop/>":
        break;
      case "</stop>":
        break;
      /* 18.8.? color CT_Color */
      case "<color":
      case "<color/>":
        break;
      case "</color>":
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
        break;
      case "<ext":
        o = !0;
        break;
      case "</ext>":
        o = !1;
        break;
      default:
        if (s && s.WTF && !o)
          throw new Error("unrecognized " + u[0] + " in fills");
    }
  });
}
function Zw(e, n, r, s) {
  n.Fonts = [];
  var i = {}, o = !1;
  (e[0].match(it) || []).forEach(function(c) {
    var u = Ue(c);
    switch (dn(u[0])) {
      case "<fonts":
      case "<fonts>":
      case "</fonts>":
        break;
      /* 18.8.22 font CT_Font */
      case "<font":
      case "<font>":
        break;
      case "</font>":
      case "<font/>":
        n.Fonts.push(i), i = {};
        break;
      /* 18.8.29 name CT_FontName */
      case "<name":
        u.val && (i.name = lr(u.val));
        break;
      case "<name/>":
      case "</name>":
        break;
      /* 18.8.2  b CT_BooleanProperty */
      case "<b":
        i.bold = u.val ? dr(u.val) : 1;
        break;
      case "<b/>":
        i.bold = 1;
        break;
      /* 18.8.26 i CT_BooleanProperty */
      case "<i":
        i.italic = u.val ? dr(u.val) : 1;
        break;
      case "<i/>":
        i.italic = 1;
        break;
      /* 18.4.13 u CT_UnderlineProperty */
      case "<u":
        switch (u.val) {
          case "none":
            i.underline = 0;
            break;
          case "single":
            i.underline = 1;
            break;
          case "double":
            i.underline = 2;
            break;
          case "singleAccounting":
            i.underline = 33;
            break;
          case "doubleAccounting":
            i.underline = 34;
            break;
        }
        break;
      case "<u/>":
        i.underline = 1;
        break;
      /* 18.4.10 strike CT_BooleanProperty */
      case "<strike":
        i.strike = u.val ? dr(u.val) : 1;
        break;
      case "<strike/>":
        i.strike = 1;
        break;
      /* 18.4.2  outline CT_BooleanProperty */
      case "<outline":
        i.outline = u.val ? dr(u.val) : 1;
        break;
      case "<outline/>":
        i.outline = 1;
        break;
      /* 18.8.36 shadow CT_BooleanProperty */
      case "<shadow":
        i.shadow = u.val ? dr(u.val) : 1;
        break;
      case "<shadow/>":
        i.shadow = 1;
        break;
      /* 18.8.12 condense CT_BooleanProperty */
      case "<condense":
        i.condense = u.val ? dr(u.val) : 1;
        break;
      case "<condense/>":
        i.condense = 1;
        break;
      /* 18.8.17 extend CT_BooleanProperty */
      case "<extend":
        i.extend = u.val ? dr(u.val) : 1;
        break;
      case "<extend/>":
        i.extend = 1;
        break;
      /* 18.4.11 sz CT_FontSize */
      case "<sz":
        u.val && (i.sz = +u.val);
        break;
      case "<sz/>":
      case "</sz>":
        break;
      /* 18.4.14 vertAlign CT_VerticalAlignFontProperty */
      case "<vertAlign":
        u.val && (i.vertAlign = u.val);
        break;
      case "<vertAlign/>":
      case "</vertAlign>":
        break;
      /* 18.8.18 family CT_FontFamily */
      case "<family":
        u.val && (i.family = parseInt(u.val, 10));
        break;
      case "<family/>":
      case "</family>":
        break;
      /* 18.8.35 scheme CT_FontScheme */
      case "<scheme":
        u.val && (i.scheme = u.val);
        break;
      case "<scheme/>":
      case "</scheme>":
        break;
      /* 18.4.1 charset CT_IntProperty */
      case "<charset":
        if (u.val == "1") break;
        u.codepage = Pc[parseInt(u.val, 10)];
        break;
      /* 18.?.? color CT_Color */
      case "<color":
        if (i.color || (i.color = {}), u.auto && (i.color.auto = dr(u.auto)), u.rgb) i.color.rgb = u.rgb.slice(-6);
        else if (u.indexed) {
          i.color.index = parseInt(u.indexed, 10);
          var d = Na[i.color.index];
          i.color.index == 81 && (d = Na[1]), d || (d = Na[1]), i.color.rgb = d[0].toString(16) + d[1].toString(16) + d[2].toString(16);
        } else u.theme && (i.color.theme = parseInt(u.theme, 10), u.tint && (i.color.tint = parseFloat(u.tint)), u.theme && r.themeElements && r.themeElements.clrScheme && (i.color.rgb = fo(r.themeElements.clrScheme[i.color.theme].rgb, i.color.tint || 0)));
        break;
      case "<color/>":
      case "</color>":
        break;
      /* note: sometimes mc:AlternateContent appears bare */
      case "<AlternateContent":
        o = !0;
        break;
      case "</AlternateContent>":
        o = !1;
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
        break;
      case "<ext":
        o = !0;
        break;
      case "</ext>":
        o = !1;
        break;
      default:
        if (s && s.WTF && !o)
          throw new Error("unrecognized " + u[0] + " in fonts");
    }
  });
}
function ey(e, n, r) {
  n.NumberFmt = [];
  for (var s = fn($e), i = 0; i < s.length; ++i) n.NumberFmt[s[i]] = $e[s[i]];
  var o = e[0].match(it);
  if (o)
    for (i = 0; i < o.length; ++i) {
      var c = Ue(o[i]);
      switch (dn(c[0])) {
        case "<numFmts":
        case "</numFmts>":
        case "<numFmts/>":
        case "<numFmts>":
          break;
        case "<numFmt":
          {
            var u = er(lr(c.formatCode)), d = parseInt(c.numFmtId, 10);
            if (n.NumberFmt[d] = u, d > 0) {
              if (d > 392) {
                for (d = 392; d > 60 && n.NumberFmt[d] != null; --d) ;
                n.NumberFmt[d] = u;
              }
              Fa(u, d);
            }
          }
          break;
        case "</numFmt>":
          break;
        default:
          if (r.WTF) throw new Error("unrecognized " + c[0] + " in numFmts");
      }
    }
}
var ro = ["numFmtId", "fillId", "fontId", "borderId", "xfId"], to = ["applyAlignment", "applyBorder", "applyFill", "applyFont", "applyNumberFormat", "applyProtection", "pivotButton", "quotePrefix"];
function ry(e, n, r) {
  n.CellXf = [];
  var s, i = !1;
  (e[0].match(it) || []).forEach(function(o) {
    var c = Ue(o), u = 0;
    switch (dn(c[0])) {
      case "<cellXfs":
      case "<cellXfs>":
      case "<cellXfs/>":
      case "</cellXfs>":
        break;
      /* 18.8.45 xf CT_Xf */
      case "<xf":
      case "<xf/>":
        for (s = c, delete s[0], u = 0; u < ro.length; ++u) s[ro[u]] && (s[ro[u]] = parseInt(s[ro[u]], 10));
        for (u = 0; u < to.length; ++u) s[to[u]] && (s[to[u]] = dr(s[to[u]]));
        if (n.NumberFmt && s.numFmtId > 392) {
          for (u = 392; u > 60; --u) if (n.NumberFmt[s.numFmtId] == n.NumberFmt[u]) {
            s.numFmtId = u;
            break;
          }
        }
        n.CellXf.push(s);
        break;
      case "</xf>":
        break;
      /* 18.8.1 alignment CT_CellAlignment */
      case "<alignment":
      case "<alignment/>":
        var d = {};
        c.vertical && (d.vertical = c.vertical), c.horizontal && (d.horizontal = c.horizontal), c.textRotation != null && (d.textRotation = c.textRotation), c.indent && (d.indent = c.indent), c.wrapText && (d.wrapText = dr(c.wrapText)), s.alignment = d;
        break;
      case "</alignment>":
        break;
      /* 18.8.33 protection CT_CellProtection */
      case "<protection":
        break;
      case "</protection>":
      case "<protection/>":
        break;
      /* note: sometimes mc:AlternateContent appears bare */
      case "<AlternateContent":
        i = !0;
        break;
      case "</AlternateContent>":
        i = !1;
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
        break;
      case "<ext":
        i = !0;
        break;
      case "</ext>":
        i = !1;
        break;
      default:
        if (r && r.WTF && !i)
          throw new Error("unrecognized " + c[0] + " in cellXfs");
    }
  });
}
var ty = /* @__PURE__ */ (function() {
  var n = /<(?:\w+:)?numFmts([^>]*)>[\S\s]*?<\/(?:\w+:)?numFmts>/, r = /<(?:\w+:)?cellXfs([^>]*)>[\S\s]*?<\/(?:\w+:)?cellXfs>/, s = /<(?:\w+:)?fills([^>]*)>[\S\s]*?<\/(?:\w+:)?fills>/, i = /<(?:\w+:)?fonts([^>]*)>[\S\s]*?<\/(?:\w+:)?fonts>/, o = /<(?:\w+:)?borders([^>]*)>[\S\s]*?<\/(?:\w+:)?borders>/;
  return function(u, d, x) {
    var p = {};
    if (!u) return p;
    u = u.replace(/<!--([\s\S]*?)-->/mg, "").replace(/<!DOCTYPE[^\[]*\[[^\]]*\]>/gm, "");
    var g;
    return (g = u.match(n)) && ey(g, p, x), (g = u.match(i)) && Zw(g, p, d, x), (g = u.match(s)) && Jw(g, p, d, x), (g = u.match(o)) && qw(g, p, d, x), (g = u.match(r)) && ry(g, p, x), p;
  };
})();
function ny(e, n) {
  var r = e.read_shift(2), s = nt(e);
  return [r, s];
}
function ay(e, n, r) {
  var s = {};
  s.sz = e.read_shift(2) / 20;
  var i = pv(e);
  i.fItalic && (s.italic = 1), i.fCondense && (s.condense = 1), i.fExtend && (s.extend = 1), i.fShadow && (s.shadow = 1), i.fOutline && (s.outline = 1), i.fStrikeout && (s.strike = 1);
  var o = e.read_shift(2);
  switch (o === 700 && (s.bold = 1), e.read_shift(2)) {
    /* case 0: out.vertAlign = "baseline"; break; */
    case 1:
      s.vertAlign = "superscript";
      break;
    case 2:
      s.vertAlign = "subscript";
      break;
  }
  var c = e.read_shift(1);
  c != 0 && (s.underline = c);
  var u = e.read_shift(1);
  u > 0 && (s.family = u);
  var d = e.read_shift(1);
  switch (d > 0 && (s.charset = d), e.l++, s.color = hv(e), e.read_shift(1)) {
    /* case 0: out.scheme = "none": break; */
    case 1:
      s.scheme = "major";
      break;
    case 2:
      s.scheme = "minor";
      break;
  }
  return s.name = nt(e), s;
}
var iy = at;
function sy(e, n) {
  var r = e.l + n, s = e.read_shift(2), i = e.read_shift(2);
  return e.l = r, { ixfe: s, numFmtId: i };
}
var ly = at;
function oy(e, n, r) {
  var s = {};
  s.NumberFmt = [];
  for (var i in $e) s.NumberFmt[i] = $e[i];
  s.CellXf = [], s.Fonts = [];
  var o = [], c = !1;
  return Dn(e, function(d, x, p) {
    switch (p) {
      case 44:
        s.NumberFmt[d[0]] = d[1], Fa(d[1], d[0]);
        break;
      case 43:
        s.Fonts.push(d), d.color.theme != null && n && n.themeElements && n.themeElements.clrScheme && (d.color.rgb = fo(n.themeElements.clrScheme[d.color.theme].rgb, d.color.tint || 0));
        break;
      case 1025:
        break;
      case 45:
        break;
      case 46:
        break;
      case 47:
        o[o.length - 1] == 617 && s.CellXf.push(d);
        break;
      case 48:
      /* BrtStyle */
      case 507:
      /* BrtDXF */
      case 572:
      /* BrtMRUColor */
      case 475:
        break;
      case 1171:
      /* BrtDXF14 */
      case 2102:
      /* BrtDXF15 */
      case 1130:
      /* BrtSlicerStyleElement */
      case 512:
      /* BrtTableStyleElement */
      case 2095:
      /* BrtTimelineStyleElement */
      case 3072:
        break;
      case 35:
        c = !0;
        break;
      case 36:
        c = !1;
        break;
      case 37:
        o.push(p), c = !0;
        break;
      case 38:
        o.pop(), c = !1;
        break;
      default:
        if (x.T > 0) o.push(p);
        else if (x.T < 0) o.pop();
        else if (!c || r.WTF && o[o.length - 1] != 37) throw new Error("Unexpected record 0x" + p.toString(16));
    }
  }), s;
}
var cy = [
  "</a:lt1>",
  "</a:dk1>",
  "</a:lt2>",
  "</a:dk2>",
  "</a:accent1>",
  "</a:accent2>",
  "</a:accent3>",
  "</a:accent4>",
  "</a:accent5>",
  "</a:accent6>",
  "</a:hlink>",
  "</a:folHlink>"
];
function uy(e, n, r) {
  n.themeElements.clrScheme = [];
  var s = {};
  (e[0].match(it) || []).forEach(function(i) {
    var o = Ue(i);
    switch (o[0]) {
      /* 20.1.6.2 clrScheme (Color Scheme) CT_ColorScheme */
      case "<a:clrScheme":
      case "</a:clrScheme>":
        break;
      /* 20.1.2.3.32 srgbClr CT_SRgbColor */
      case "<a:srgbClr":
        s.rgb = o.val;
        break;
      /* 20.1.2.3.33 sysClr CT_SystemColor */
      case "<a:sysClr":
        s.rgb = o.lastClr;
        break;
      /* 20.1.4.1.1 accent1 (Accent 1) */
      /* 20.1.4.1.2 accent2 (Accent 2) */
      /* 20.1.4.1.3 accent3 (Accent 3) */
      /* 20.1.4.1.4 accent4 (Accent 4) */
      /* 20.1.4.1.5 accent5 (Accent 5) */
      /* 20.1.4.1.6 accent6 (Accent 6) */
      /* 20.1.4.1.9 dk1 (Dark 1) */
      /* 20.1.4.1.10 dk2 (Dark 2) */
      /* 20.1.4.1.15 folHlink (Followed Hyperlink) */
      /* 20.1.4.1.19 hlink (Hyperlink) */
      /* 20.1.4.1.22 lt1 (Light 1) */
      /* 20.1.4.1.23 lt2 (Light 2) */
      case "<a:dk1>":
      case "</a:dk1>":
      case "<a:lt1>":
      case "</a:lt1>":
      case "<a:dk2>":
      case "</a:dk2>":
      case "<a:lt2>":
      case "</a:lt2>":
      case "<a:accent1>":
      case "</a:accent1>":
      case "<a:accent2>":
      case "</a:accent2>":
      case "<a:accent3>":
      case "</a:accent3>":
      case "<a:accent4>":
      case "</a:accent4>":
      case "<a:accent5>":
      case "</a:accent5>":
      case "<a:accent6>":
      case "</a:accent6>":
      case "<a:hlink>":
      case "</a:hlink>":
      case "<a:folHlink>":
      case "</a:folHlink>":
        o[0].charAt(1) === "/" ? (n.themeElements.clrScheme[cy.indexOf(o[0])] = s, s = {}) : s.name = o[0].slice(3, o[0].length - 1);
        break;
      default:
        if (r && r.WTF) throw new Error("Unrecognized " + o[0] + " in clrScheme");
    }
  });
}
function fy() {
}
function dy() {
}
var hy = /<a:clrScheme([^>]*)>[\s\S]*<\/a:clrScheme>/, py = /<a:fontScheme([^>]*)>[\s\S]*<\/a:fontScheme>/, xy = /<a:fmtScheme([^>]*)>[\s\S]*<\/a:fmtScheme>/;
function my(e, n, r) {
  n.themeElements = {};
  var s;
  [
    /* clrScheme CT_ColorScheme */
    ["clrScheme", hy, uy],
    /* fontScheme CT_FontScheme */
    ["fontScheme", py, fy],
    /* fmtScheme CT_StyleMatrix */
    ["fmtScheme", xy, dy]
  ].forEach(function(i) {
    if (!(s = e.match(i[1]))) throw new Error(i[0] + " not found in themeElements");
    i[2](s, n, r);
  });
}
var gy = /<a:themeElements([^>]*)>[\s\S]*<\/a:themeElements>/;
function c1(e, n) {
  (!e || e.length === 0) && (e = vy());
  var r, s = {};
  if (!(r = e.match(gy))) throw new Error("themeElements not found in theme");
  return my(r[0], s, n), s.raw = e, s;
}
function vy(e, n) {
  var r = [yp];
  return r[r.length] = '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">', r[r.length] = "<a:themeElements>", r[r.length] = '<a:clrScheme name="Office">', r[r.length] = '<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>', r[r.length] = '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>', r[r.length] = '<a:dk2><a:srgbClr val="1F497D"/></a:dk2>', r[r.length] = '<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>', r[r.length] = '<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>', r[r.length] = '<a:accent2><a:srgbClr val="C0504D"/></a:accent2>', r[r.length] = '<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>', r[r.length] = '<a:accent4><a:srgbClr val="8064A2"/></a:accent4>', r[r.length] = '<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>', r[r.length] = '<a:accent6><a:srgbClr val="F79646"/></a:accent6>', r[r.length] = '<a:hlink><a:srgbClr val="0000FF"/></a:hlink>', r[r.length] = '<a:folHlink><a:srgbClr val="800080"/></a:folHlink>', r[r.length] = "</a:clrScheme>", r[r.length] = '<a:fontScheme name="Office">', r[r.length] = "<a:majorFont>", r[r.length] = '<a:latin typeface="Cambria"/>', r[r.length] = '<a:ea typeface=""/>', r[r.length] = '<a:cs typeface=""/>', r[r.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>', r[r.length] = '<a:font script="Hang" typeface="맑은 고딕"/>', r[r.length] = '<a:font script="Hans" typeface="宋体"/>', r[r.length] = '<a:font script="Hant" typeface="新細明體"/>', r[r.length] = '<a:font script="Arab" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Hebr" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Thai" typeface="Tahoma"/>', r[r.length] = '<a:font script="Ethi" typeface="Nyala"/>', r[r.length] = '<a:font script="Beng" typeface="Vrinda"/>', r[r.length] = '<a:font script="Gujr" typeface="Shruti"/>', r[r.length] = '<a:font script="Khmr" typeface="MoolBoran"/>', r[r.length] = '<a:font script="Knda" typeface="Tunga"/>', r[r.length] = '<a:font script="Guru" typeface="Raavi"/>', r[r.length] = '<a:font script="Cans" typeface="Euphemia"/>', r[r.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>', r[r.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>', r[r.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>', r[r.length] = '<a:font script="Thaa" typeface="MV Boli"/>', r[r.length] = '<a:font script="Deva" typeface="Mangal"/>', r[r.length] = '<a:font script="Telu" typeface="Gautami"/>', r[r.length] = '<a:font script="Taml" typeface="Latha"/>', r[r.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>', r[r.length] = '<a:font script="Orya" typeface="Kalinga"/>', r[r.length] = '<a:font script="Mlym" typeface="Kartika"/>', r[r.length] = '<a:font script="Laoo" typeface="DokChampa"/>', r[r.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>', r[r.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>', r[r.length] = '<a:font script="Viet" typeface="Times New Roman"/>', r[r.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>', r[r.length] = '<a:font script="Geor" typeface="Sylfaen"/>', r[r.length] = "</a:majorFont>", r[r.length] = "<a:minorFont>", r[r.length] = '<a:latin typeface="Calibri"/>', r[r.length] = '<a:ea typeface=""/>', r[r.length] = '<a:cs typeface=""/>', r[r.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>', r[r.length] = '<a:font script="Hang" typeface="맑은 고딕"/>', r[r.length] = '<a:font script="Hans" typeface="宋体"/>', r[r.length] = '<a:font script="Hant" typeface="新細明體"/>', r[r.length] = '<a:font script="Arab" typeface="Arial"/>', r[r.length] = '<a:font script="Hebr" typeface="Arial"/>', r[r.length] = '<a:font script="Thai" typeface="Tahoma"/>', r[r.length] = '<a:font script="Ethi" typeface="Nyala"/>', r[r.length] = '<a:font script="Beng" typeface="Vrinda"/>', r[r.length] = '<a:font script="Gujr" typeface="Shruti"/>', r[r.length] = '<a:font script="Khmr" typeface="DaunPenh"/>', r[r.length] = '<a:font script="Knda" typeface="Tunga"/>', r[r.length] = '<a:font script="Guru" typeface="Raavi"/>', r[r.length] = '<a:font script="Cans" typeface="Euphemia"/>', r[r.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>', r[r.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>', r[r.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>', r[r.length] = '<a:font script="Thaa" typeface="MV Boli"/>', r[r.length] = '<a:font script="Deva" typeface="Mangal"/>', r[r.length] = '<a:font script="Telu" typeface="Gautami"/>', r[r.length] = '<a:font script="Taml" typeface="Latha"/>', r[r.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>', r[r.length] = '<a:font script="Orya" typeface="Kalinga"/>', r[r.length] = '<a:font script="Mlym" typeface="Kartika"/>', r[r.length] = '<a:font script="Laoo" typeface="DokChampa"/>', r[r.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>', r[r.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>', r[r.length] = '<a:font script="Viet" typeface="Arial"/>', r[r.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>', r[r.length] = '<a:font script="Geor" typeface="Sylfaen"/>', r[r.length] = "</a:minorFont>", r[r.length] = "</a:fontScheme>", r[r.length] = '<a:fmtScheme name="Office">', r[r.length] = "<a:fillStyleLst>", r[r.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>', r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:lin ang="16200000" scaled="1"/>', r[r.length] = "</a:gradFill>", r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:lin ang="16200000" scaled="0"/>', r[r.length] = "</a:gradFill>", r[r.length] = "</a:fillStyleLst>", r[r.length] = "<a:lnStyleLst>", r[r.length] = '<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = '<a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = '<a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>', r[r.length] = "</a:lnStyleLst>", r[r.length] = "<a:effectStyleLst>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = "</a:effectStyle>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = "</a:effectStyle>", r[r.length] = "<a:effectStyle>", r[r.length] = "<a:effectLst>", r[r.length] = '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>', r[r.length] = "</a:effectLst>", r[r.length] = '<a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d>', r[r.length] = '<a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d>', r[r.length] = "</a:effectStyle>", r[r.length] = "</a:effectStyleLst>", r[r.length] = "<a:bgFillStyleLst>", r[r.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>', r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path>', r[r.length] = "</a:gradFill>", r[r.length] = '<a:gradFill rotWithShape="1">', r[r.length] = "<a:gsLst>", r[r.length] = '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs>', r[r.length] = '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs>', r[r.length] = "</a:gsLst>", r[r.length] = '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>', r[r.length] = "</a:gradFill>", r[r.length] = "</a:bgFillStyleLst>", r[r.length] = "</a:fmtScheme>", r[r.length] = "</a:themeElements>", r[r.length] = "<a:objectDefaults>", r[r.length] = "<a:spDef>", r[r.length] = '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style>', r[r.length] = "</a:spDef>", r[r.length] = "<a:lnDef>", r[r.length] = '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style>', r[r.length] = "</a:lnDef>", r[r.length] = "</a:objectDefaults>", r[r.length] = "<a:extraClrSchemeLst/>", r[r.length] = "</a:theme>", r.join("");
}
function wy(e, n, r) {
  var s = e.l + n, i = e.read_shift(4);
  if (i !== 124226) {
    if (!r.cellStyles) {
      e.l = s;
      return;
    }
    var o = e.slice(e.l);
    e.l = s;
    var c;
    try {
      c = wp(o, { type: "array" });
    } catch {
      return;
    }
    var u = At(c, "theme/theme/theme1.xml", !0);
    if (u)
      return c1(u, r);
  }
}
function yy(e) {
  return e.read_shift(4);
}
function _y(e) {
  var n = {};
  switch (n.xclrType = e.read_shift(2), n.nTintShade = e.read_shift(2), n.xclrType) {
    case 0:
      e.l += 4;
      break;
    case 1:
      n.xclrValue = ky(e, 4);
      break;
    case 2:
      n.xclrValue = Yp(e);
      break;
    case 3:
      n.xclrValue = yy(e);
      break;
    case 4:
      e.l += 4;
      break;
  }
  return e.l += 8, n;
}
function ky(e, n) {
  return at(e, n);
}
function Ey(e, n) {
  return at(e, n);
}
function Sy(e) {
  var n = e.read_shift(2), r = e.read_shift(2) - 4, s = [n];
  switch (n) {
    case 4:
    case 5:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 13:
      s[1] = _y(e);
      break;
    case 6:
      s[1] = Ey(e, r);
      break;
    case 14:
    case 15:
      s[1] = e.read_shift(r === 1 ? 1 : 2);
      break;
    default:
      throw new Error("Unrecognized ExtProp type: " + n + " " + r);
  }
  return s;
}
function Ty(e, n) {
  var r = e.l + n;
  e.l += 2;
  var s = e.read_shift(2);
  e.l += 2;
  for (var i = e.read_shift(2), o = []; i-- > 0; ) o.push(Sy(e, r - e.l));
  return { ixfe: s, ext: o };
}
function Cy(e, n) {
  n.forEach(function(r) {
    r[0];
  });
}
function Ay(e, n) {
  return {
    flags: e.read_shift(4),
    version: e.read_shift(4),
    name: nt(e)
  };
}
function Fy(e) {
  for (var n = [], r = e.read_shift(4); r-- > 0; )
    n.push([e.read_shift(4), e.read_shift(4)]);
  return n;
}
function Ny(e) {
  return e.l += 4, e.read_shift(4) != 0;
}
function Ry(e, n, r) {
  var s = { Types: [], Cell: [], Value: [] }, i = r || {}, o = [], c = !1, u = 2;
  return Dn(e, function(d, x, p) {
    switch (p) {
      case 335:
        s.Types.push({ name: d.name });
        break;
      case 51:
        d.forEach(function(g) {
          u == 1 ? s.Cell.push({ type: s.Types[g[0] - 1].name, index: g[1] }) : u == 0 && s.Value.push({ type: s.Types[g[0] - 1].name, index: g[1] });
        });
        break;
      case 337:
        u = d ? 1 : 0;
        break;
      case 338:
        u = 2;
        break;
      case 35:
        o.push(p), c = !0;
        break;
      case 36:
        o.pop(), c = !1;
        break;
      default:
        if (!x.T) {
          if (!c || i.WTF && o[o.length - 1] != 35)
            throw new Error("Unexpected record 0x" + p.toString(16));
        }
    }
  }), s;
}
function Dy(e, n, r) {
  var s = { Types: [], Cell: [], Value: [] };
  if (!e)
    return s;
  var i = !1, o = 2, c;
  return e.replace(it, function(u) {
    var d = Ue(u);
    switch (dn(d[0])) {
      case "<?xml":
        break;
      case "<metadata":
      case "</metadata>":
        break;
      case "<metadataTypes":
      case "</metadataTypes>":
        break;
      case "<metadataType":
        s.Types.push({ name: d.name });
        break;
      case "</metadataType>":
        break;
      case "<futureMetadata":
        for (var x = 0; x < s.Types.length; ++x)
          s.Types[x].name == d.name && (c = s.Types[x]);
        break;
      case "</futureMetadata>":
        break;
      case "<bk>":
        break;
      case "</bk>":
        break;
      case "<rc":
        o == 1 ? s.Cell.push({ type: s.Types[d.t - 1].name, index: +d.v }) : o == 0 && s.Value.push({ type: s.Types[d.t - 1].name, index: +d.v });
        break;
      case "</rc>":
        break;
      case "<cellMetadata":
        o = 1;
        break;
      case "</cellMetadata>":
        o = 2;
        break;
      case "<valueMetadata":
        o = 0;
        break;
      case "</valueMetadata>":
        o = 2;
        break;
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
      case "<extLst/>":
        break;
      case "<ext":
        i = !0;
        break;
      case "</ext>":
        i = !1;
        break;
      case "<rvb":
        if (!c)
          break;
        c.offsets || (c.offsets = []), c.offsets.push(+d.i);
        break;
      default:
        if (!i && r.WTF)
          throw new Error("unrecognized " + d[0] + " in metadata");
    }
    return u;
  }), s;
}
function Oy(e) {
  var n = [];
  if (!e) return n;
  var r = 1;
  return (e.match(it) || []).forEach(function(s) {
    var i = Ue(s);
    switch (i[0]) {
      case "<?xml":
        break;
      /* 18.6.2  calcChain CT_CalcChain 1 */
      case "<calcChain":
      case "<calcChain>":
      case "</calcChain>":
        break;
      /* 18.6.1  c CT_CalcCell 1 */
      case "<c":
        delete i[0], i.i ? r = i.i : i.i = r, n.push(i);
        break;
    }
  }), n;
}
function Py(e) {
  var n = {};
  n.i = e.read_shift(4);
  var r = {};
  r.r = e.read_shift(4), r.c = e.read_shift(4), n.r = Ge(r);
  var s = e.read_shift(1);
  return s & 2 && (n.l = "1"), s & 8 && (n.a = "1"), n;
}
function by(e, n, r) {
  var s = [];
  return Dn(e, function(o, c, u) {
    switch (u) {
      case 63:
        s.push(o);
        break;
      default:
        if (!c.T) throw new Error("Unexpected record 0x" + u.toString(16));
    }
  }), s;
}
function Iy(e, n, r, s) {
  if (!e) return e;
  var i = s || {}, o = !1;
  Dn(e, function(u, d, x) {
    switch (x) {
      case 359:
      /* 'BrtSupTabs' */
      case 363:
      /* 'BrtExternTableStart' */
      case 364:
      /* 'BrtExternTableEnd' */
      case 366:
      /* 'BrtExternRowHdr' */
      case 367:
      /* 'BrtExternCellBlank' */
      case 368:
      /* 'BrtExternCellReal' */
      case 369:
      /* 'BrtExternCellBool' */
      case 370:
      /* 'BrtExternCellError' */
      case 371:
      /* 'BrtExternCellString' */
      case 472:
      /* 'BrtExternValueMeta' */
      case 577:
      /* 'BrtSupNameStart' */
      case 578:
      /* 'BrtSupNameValueStart' */
      case 579:
      /* 'BrtSupNameValueEnd' */
      case 580:
      /* 'BrtSupNameNum' */
      case 581:
      /* 'BrtSupNameErr' */
      case 582:
      /* 'BrtSupNameSt' */
      case 583:
      /* 'BrtSupNameNil' */
      case 584:
      /* 'BrtSupNameBool' */
      case 585:
      /* 'BrtSupNameFmla' */
      case 586:
      /* 'BrtSupNameBits' */
      case 587:
        break;
      case 35:
        o = !0;
        break;
      case 36:
        o = !1;
        break;
      default:
        if (!d.T) {
          if (!o || i.WTF) throw new Error("Unexpected record 0x" + x.toString(16));
        }
    }
  }, i);
}
function Ly(e, n) {
  if (!e) return "??";
  var r = (e.match(/<c:chart [^>]*r:id="([^"]*)"/) || ["", ""])[1];
  return n["!id"][r].Target;
}
function Rh(e, n, r, s) {
  var i = Array.isArray(e), o;
  n.forEach(function(c) {
    var u = ut(c.ref);
    if (i ? (e[u.r] || (e[u.r] = []), o = e[u.r][u.c]) : o = e[c.ref], !o) {
      o = { t: "z" }, i ? e[u.r][u.c] = o : e[c.ref] = o;
      var d = vr(e["!ref"] || "BDWGO1000001:A1");
      d.s.r > u.r && (d.s.r = u.r), d.e.r < u.r && (d.e.r = u.r), d.s.c > u.c && (d.s.c = u.c), d.e.c < u.c && (d.e.c = u.c);
      var x = Je(d);
      x !== e["!ref"] && (e["!ref"] = x);
    }
    o.c || (o.c = []);
    var p = { a: c.author, t: c.t, r: c.r, T: r };
    c.h && (p.h = c.h);
    for (var g = o.c.length - 1; g >= 0; --g) {
      if (!r && o.c[g].T) return;
      r && !o.c[g].T && o.c.splice(g, 1);
    }
    if (r && s) {
      for (g = 0; g < s.length; ++g)
        if (p.a == s[g].id) {
          p.a = s[g].name || p.a;
          break;
        }
    }
    o.c.push(p);
  });
}
function My(e, n) {
  if (e.match(/<(?:\w+:)?comments *\/>/)) return [];
  var r = [], s = [], i = e.match(/<(?:\w+:)?authors>([\s\S]*)<\/(?:\w+:)?authors>/);
  i && i[1] && i[1].split(/<\/\w*:?author>/).forEach(function(c) {
    if (!(c === "" || c.trim() === "")) {
      var u = c.match(/<(?:\w+:)?author[^>]*>(.*)/);
      u && r.push(u[1]);
    }
  });
  var o = e.match(/<(?:\w+:)?commentList>([\s\S]*)<\/(?:\w+:)?commentList>/);
  return o && o[1] && o[1].split(/<\/\w*:?comment>/).forEach(function(c) {
    if (!(c === "" || c.trim() === "")) {
      var u = c.match(/<(?:\w+:)?comment[^>]*>/);
      if (u) {
        var d = Ue(u[0]), x = { author: d.authorId && r[d.authorId] || "sheetjsghost", ref: d.ref, guid: d.guid }, p = ut(d.ref);
        if (!(n.sheetRows && n.sheetRows <= p.r)) {
          var g = c.match(/<(?:\w+:)?text>([\s\S]*)<\/(?:\w+:)?text>/), w = !!g && !!g[1] && Qc(g[1]) || { r: "", t: "", h: "" };
          x.r = w.r, w.r == "<t></t>" && (w.t = w.h = ""), x.t = (w.t || "").replace(/\r\n/g, `
`).replace(/\r/g, `
`), n.cellHTML && (x.h = w.h), s.push(x);
        }
      }
    }
  }), s;
}
function By(e, n) {
  var r = [], s = !1, i = {}, o = 0;
  return e.replace(it, function(u, d) {
    var x = Ue(u);
    switch (dn(x[0])) {
      case "<?xml":
        break;
      /* 2.6.207 ThreadedComments CT_ThreadedComments */
      case "<ThreadedComments":
        break;
      case "</ThreadedComments>":
        break;
      /* 2.6.205 threadedComment CT_ThreadedComment */
      case "<threadedComment":
        i = { author: x.personId, guid: x.id, ref: x.ref, T: 1 };
        break;
      case "</threadedComment>":
        i.t != null && r.push(i);
        break;
      case "<text>":
      case "<text":
        o = d + u.length;
        break;
      case "</text>":
        i.t = e.slice(o, d).replace(/\r\n/g, `
`).replace(/\r/g, `
`);
        break;
      /* 2.6.206 mentions CT_ThreadedCommentMentions TODO */
      case "<mentions":
      case "<mentions>":
        s = !0;
        break;
      case "</mentions>":
        s = !1;
        break;
      /* 2.6.202 mention CT_Mention TODO */
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
      case "<extLst/>":
        break;
      /* 18.2.7  ext CT_Extension + */
      case "<ext":
        s = !0;
        break;
      case "</ext>":
        s = !1;
        break;
      default:
        if (!s && n.WTF) throw new Error("unrecognized " + x[0] + " in threaded comments");
    }
    return u;
  }), r;
}
function jy(e, n) {
  var r = [], s = !1;
  return e.replace(it, function(o) {
    var c = Ue(o);
    switch (dn(c[0])) {
      case "<?xml":
        break;
      /* 2.4.85 personList CT_PersonList */
      case "<personList":
        break;
      case "</personList>":
        break;
      /* 2.6.203 person CT_Person TODO: providers */
      case "<person":
        r.push({ name: c.displayname, id: c.id });
        break;
      case "</person>":
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
      case "<extLst/>":
        break;
      /* 18.2.7  ext CT_Extension + */
      case "<ext":
        s = !0;
        break;
      case "</ext>":
        s = !1;
        break;
      default:
        if (!s && n.WTF) throw new Error("unrecognized " + c[0] + " in threaded comments");
    }
    return o;
  }), r;
}
function Uy(e) {
  var n = {};
  n.iauthor = e.read_shift(4);
  var r = La(e);
  return n.rfx = r.s, n.ref = Ge(r.s), e.l += 16, n;
}
var zy = nt;
function Hy(e, n) {
  var r = [], s = [], i = {}, o = !1;
  return Dn(e, function(u, d, x) {
    switch (x) {
      case 632:
        s.push(u);
        break;
      case 635:
        i = u;
        break;
      case 637:
        i.t = u.t, i.h = u.h, i.r = u.r;
        break;
      case 636:
        if (i.author = s[i.iauthor], delete i.iauthor, n.sheetRows && i.rfx && n.sheetRows <= i.rfx.r) break;
        i.t || (i.t = ""), delete i.rfx, r.push(i);
        break;
      case 3072:
        break;
      case 35:
        o = !0;
        break;
      case 36:
        o = !1;
        break;
      case 37:
        break;
      case 38:
        break;
      default:
        if (!d.T) {
          if (!o || n.WTF) throw new Error("Unexpected record 0x" + x.toString(16));
        }
    }
  }), r;
}
var Vy = "application/vnd.ms-office.vbaProject";
function Wy(e) {
  var n = qe.utils.cfb_new({ root: "R" });
  return e.FullPaths.forEach(function(r, s) {
    if (!(r.slice(-1) === "/" || !r.match(/_VBA_PROJECT_CUR/))) {
      var i = r.replace(/^[^\/]*/, "R").replace(/\/_VBA_PROJECT_CUR\u0000*/, "");
      qe.utils.cfb_add(n, i, e.FileIndex[s].content);
    }
  }), qe.write(n);
}
function Gy() {
  return { "!type": "dialog" };
}
function $y() {
  return { "!type": "dialog" };
}
function Ky() {
  return { "!type": "macro" };
}
function Xy() {
  return { "!type": "macro" };
}
var xi = /* @__PURE__ */ (function() {
  var e = /(^|[^A-Za-z_])R(\[?-?\d+\]|[1-9]\d*|)C(\[?-?\d+\]|[1-9]\d*|)(?![A-Za-z0-9_])/g, n = { r: 0, c: 0 };
  function r(s, i, o, c) {
    var u = !1, d = !1;
    o.length == 0 ? d = !0 : o.charAt(0) == "[" && (d = !0, o = o.slice(1, -1)), c.length == 0 ? u = !0 : c.charAt(0) == "[" && (u = !0, c = c.slice(1, -1));
    var x = o.length > 0 ? parseInt(o, 10) | 0 : 0, p = c.length > 0 ? parseInt(c, 10) | 0 : 0;
    return u ? p += n.c : --p, d ? x += n.r : --x, i + (u ? "" : "$") + Or(p) + (d ? "" : "$") + Wr(x);
  }
  return function(i, o) {
    return n = o, i.replace(e, r);
  };
})(), u1 = /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)(10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6]|[1-9]\d{0,5})(?![_.\(A-Za-z0-9])/g, Yy = /* @__PURE__ */ (function() {
  return function(n, r) {
    return n.replace(u1, function(s, i, o, c, u, d) {
      var x = Wc(c) - (o ? 0 : r.c), p = Vc(d) - (u ? 0 : r.r), g = p == 0 ? "" : u ? p + 1 : "[" + p + "]", w = x == 0 ? "" : o ? x + 1 : "[" + x + "]";
      return i + "R" + g + "C" + w;
    });
  };
})();
function f1(e, n) {
  return e.replace(u1, function(r, s, i, o, c, u) {
    return s + (i == "$" ? i + o : Or(Wc(o) + n.c)) + (c == "$" ? c + u : Wr(Vc(u) + n.r));
  });
}
function Qy(e, n, r) {
  var s = yi(n), i = s.s, o = ut(r), c = { r: o.r - i.r, c: o.c - i.c };
  return f1(e, c);
}
function qy(e) {
  return e.length != 1;
}
function Dh(e) {
  return e.replace(/_xlfn\./g, "");
}
function Tr(e) {
  e.l += 1;
}
function sa(e, n) {
  var r = e.read_shift(2);
  return [r & 16383, r >> 14 & 1, r >> 15 & 1];
}
function d1(e, n, r) {
  var s = 2;
  if (r) {
    if (r.biff >= 2 && r.biff <= 5) return h1(e);
    r.biff == 12 && (s = 4);
  }
  var i = e.read_shift(s), o = e.read_shift(s), c = sa(e), u = sa(e);
  return { s: { r: i, c: c[0], cRel: c[1], rRel: c[2] }, e: { r: o, c: u[0], cRel: u[1], rRel: u[2] } };
}
function h1(e) {
  var n = sa(e), r = sa(e), s = e.read_shift(1), i = e.read_shift(1);
  return { s: { r: n[0], c: s, cRel: n[1], rRel: n[2] }, e: { r: r[0], c: i, cRel: r[1], rRel: r[2] } };
}
function Jy(e, n, r) {
  if (r.biff < 8) return h1(e);
  var s = e.read_shift(r.biff == 12 ? 4 : 2), i = e.read_shift(r.biff == 12 ? 4 : 2), o = sa(e), c = sa(e);
  return { s: { r: s, c: o[0], cRel: o[1], rRel: o[2] }, e: { r: i, c: c[0], cRel: c[1], rRel: c[2] } };
}
function p1(e, n, r) {
  if (r && r.biff >= 2 && r.biff <= 5) return Zy(e);
  var s = e.read_shift(r && r.biff == 12 ? 4 : 2), i = sa(e);
  return { r: s, c: i[0], cRel: i[1], rRel: i[2] };
}
function Zy(e) {
  var n = sa(e), r = e.read_shift(1);
  return { r: n[0], c: r, cRel: n[1], rRel: n[2] };
}
function e_(e) {
  var n = e.read_shift(2), r = e.read_shift(2);
  return { r: n, c: r & 255, fQuoted: !!(r & 16384), cRel: r >> 15, rRel: r >> 15 };
}
function r_(e, n, r) {
  var s = r && r.biff ? r.biff : 8;
  if (s >= 2 && s <= 5) return t_(e);
  var i = e.read_shift(s >= 12 ? 4 : 2), o = e.read_shift(2), c = (o & 16384) >> 14, u = (o & 32768) >> 15;
  if (o &= 16383, u == 1) for (; i > 524287; ) i -= 1048576;
  if (c == 1) for (; o > 8191; ) o = o - 16384;
  return { r: i, c: o, cRel: c, rRel: u };
}
function t_(e) {
  var n = e.read_shift(2), r = e.read_shift(1), s = (n & 32768) >> 15, i = (n & 16384) >> 14;
  return n &= 16383, s == 1 && n >= 8192 && (n = n - 16384), i == 1 && r >= 128 && (r = r - 256), { r: n, c: r, cRel: i, rRel: s };
}
function n_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5, i = d1(e, r.biff >= 2 && r.biff <= 5 ? 6 : 8, r);
  return [s, i];
}
function a_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5, i = e.read_shift(2, "i"), o = 8;
  if (r) switch (r.biff) {
    case 5:
      e.l += 12, o = 6;
      break;
    case 12:
      o = 12;
      break;
  }
  var c = d1(e, o, r);
  return [s, i, c];
}
function i_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5;
  return e.l += r && r.biff > 8 ? 12 : r.biff < 8 ? 6 : 8, [s];
}
function s_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5, i = e.read_shift(2), o = 8;
  if (r) switch (r.biff) {
    case 5:
      e.l += 12, o = 6;
      break;
    case 12:
      o = 12;
      break;
  }
  return e.l += o, [s, i];
}
function l_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5, i = Jy(e, n - 1, r);
  return [s, i];
}
function o_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5;
  return e.l += r.biff == 2 ? 6 : r.biff == 12 ? 14 : 7, [s];
}
function Oh(e) {
  var n = e[e.l + 1] & 1, r = 1;
  return e.l += 4, [n, r];
}
function c_(e, n, r) {
  e.l += 2;
  for (var s = e.read_shift(r && r.biff == 2 ? 1 : 2), i = [], o = 0; o <= s; ++o) i.push(e.read_shift(r && r.biff == 2 ? 1 : 2));
  return i;
}
function u_(e, n, r) {
  var s = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [s, e.read_shift(r && r.biff == 2 ? 1 : 2)];
}
function f_(e, n, r) {
  var s = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [s, e.read_shift(r && r.biff == 2 ? 1 : 2)];
}
function d_(e) {
  var n = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += 2, [n, e.read_shift(2)];
}
function h_(e, n, r) {
  var s = e[e.l + 1] & 255 ? 1 : 0;
  return e.l += r && r.biff == 2 ? 3 : 4, [s];
}
function x1(e) {
  var n = e.read_shift(1), r = e.read_shift(1);
  return [n, r];
}
function p_(e) {
  return e.read_shift(2), x1(e);
}
function x_(e) {
  return e.read_shift(2), x1(e);
}
function m_(e, n, r) {
  var s = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = p1(e, 0, r);
  return [s, i];
}
function g_(e, n, r) {
  var s = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = r_(e, 0, r);
  return [s, i];
}
function v_(e, n, r) {
  var s = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = e.read_shift(2);
  r && r.biff == 5 && (e.l += 12);
  var o = p1(e, 0, r);
  return [s, i, o];
}
function w_(e, n, r) {
  var s = (e[e.l] & 96) >> 5;
  e.l += 1;
  var i = e.read_shift(r && r.biff <= 3 ? 1 : 2);
  return [yk[i], v1[i], s];
}
function y_(e, n, r) {
  var s = e[e.l++], i = e.read_shift(1), o = r && r.biff <= 3 ? [s == 88 ? -1 : 0, e.read_shift(1)] : __(e);
  return [i, (o[0] === 0 ? v1 : wk)[o[1]]];
}
function __(e) {
  return [e[e.l + 1] >> 7, e.read_shift(2) & 32767];
}
function k_(e, n, r) {
  e.l += r && r.biff == 2 ? 3 : 4;
}
function E_(e, n, r) {
  if (e.l++, r && r.biff == 12) return [e.read_shift(4, "i"), 0];
  var s = e.read_shift(2), i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [s, i];
}
function S_(e) {
  return e.l++, Ma[e.read_shift(1)];
}
function T_(e) {
  return e.l++, e.read_shift(2);
}
function C_(e) {
  return e.l++, e.read_shift(1) !== 0;
}
function A_(e) {
  return e.l++, rt(e);
}
function F_(e, n, r) {
  return e.l++, bs(e, n - 1, r);
}
function N_(e, n) {
  var r = [e.read_shift(1)];
  if (n == 12) switch (r[0]) {
    case 2:
      r[0] = 4;
      break;
    /* SerBool */
    case 4:
      r[0] = 16;
      break;
    /* SerErr */
    case 0:
      r[0] = 1;
      break;
    /* SerNum */
    case 1:
      r[0] = 2;
      break;
  }
  switch (r[0]) {
    case 4:
      r[1] = kr(e, 1) ? "TRUE" : "FALSE", n != 12 && (e.l += 7);
      break;
    case 37:
    /* appears to be an alias */
    case 16:
      r[1] = Ma[e[e.l]], e.l += n == 12 ? 4 : 8;
      break;
    case 0:
      e.l += 8;
      break;
    case 1:
      r[1] = rt(e);
      break;
    case 2:
      r[1] = Ba(e, 0, { biff: n > 0 && n < 8 ? 2 : n });
      break;
    default:
      throw new Error("Bad SerAr: " + r[0]);
  }
  return r;
}
function R_(e, n, r) {
  for (var s = e.read_shift(r.biff == 12 ? 4 : 2), i = [], o = 0; o != s; ++o) i.push((r.biff == 12 ? La : vo)(e));
  return i;
}
function D_(e, n, r) {
  var s = 0, i = 0;
  r.biff == 12 ? (s = e.read_shift(4), i = e.read_shift(4)) : (i = 1 + e.read_shift(1), s = 1 + e.read_shift(2)), r.biff >= 2 && r.biff < 8 && (--s, --i == 0 && (i = 256));
  for (var o = 0, c = []; o != s && (c[o] = []); ++o)
    for (var u = 0; u != i; ++u) c[o][u] = N_(e, r.biff);
  return c;
}
function O_(e, n, r) {
  var s = e.read_shift(1) >>> 5 & 3, i = !r || r.biff >= 8 ? 4 : 2, o = e.read_shift(i);
  switch (r.biff) {
    case 2:
      e.l += 5;
      break;
    case 3:
    case 4:
      e.l += 8;
      break;
    case 5:
      e.l += 12;
      break;
  }
  return [s, 0, o];
}
function P_(e, n, r) {
  if (r.biff == 5) return b_(e);
  var s = e.read_shift(1) >>> 5 & 3, i = e.read_shift(2), o = e.read_shift(4);
  return [s, i, o];
}
function b_(e) {
  var n = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2, "i");
  e.l += 8;
  var s = e.read_shift(2);
  return e.l += 12, [n, r, s];
}
function I_(e, n, r) {
  var s = e.read_shift(1) >>> 5 & 3;
  e.l += r && r.biff == 2 ? 3 : 4;
  var i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [s, i];
}
function L_(e, n, r) {
  var s = e.read_shift(1) >>> 5 & 3, i = e.read_shift(r && r.biff == 2 ? 1 : 2);
  return [s, i];
}
function M_(e, n, r) {
  var s = e.read_shift(1) >>> 5 & 3;
  return e.l += 4, r.biff < 8 && e.l--, r.biff == 12 && (e.l += 2), [s];
}
function B_(e, n, r) {
  var s = (e[e.l++] & 96) >> 5, i = e.read_shift(2), o = 4;
  if (r) switch (r.biff) {
    case 5:
      o = 15;
      break;
    case 12:
      o = 6;
      break;
  }
  return e.l += o, [s, i];
}
var j_ = at, U_ = at, z_ = at;
function Ls(e, n, r) {
  return e.l += 2, [e_(e)];
}
function Jc(e) {
  return e.l += 6, [];
}
var H_ = Ls, V_ = Jc, W_ = Jc, G_ = Ls;
function m1(e) {
  return e.l += 2, [Ar(e), e.read_shift(2) & 1];
}
var $_ = Ls, K_ = m1, X_ = Jc, Y_ = Ls, Q_ = Ls, q_ = [
  "Data",
  "All",
  "Headers",
  "??",
  "?Data2",
  "??",
  "?DataHeaders",
  "??",
  "Totals",
  "??",
  "??",
  "??",
  "?DataTotals",
  "??",
  "??",
  "??",
  "?Current"
];
function J_(e) {
  e.l += 2;
  var n = e.read_shift(2), r = e.read_shift(2), s = e.read_shift(4), i = e.read_shift(2), o = e.read_shift(2), c = q_[r >> 2 & 31];
  return { ixti: n, coltype: r & 3, rt: c, idx: s, c: i, C: o };
}
function Z_(e) {
  return e.l += 2, [e.read_shift(4)];
}
function ek(e, n, r) {
  return e.l += 5, e.l += 2, e.l += r.biff == 2 ? 1 : 4, ["PTGSHEET"];
}
function rk(e, n, r) {
  return e.l += r.biff == 2 ? 4 : 5, ["PTGENDSHEET"];
}
function tk(e) {
  var n = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2);
  return [n, r];
}
function nk(e) {
  var n = e.read_shift(1) >>> 5 & 3, r = e.read_shift(2);
  return [n, r];
}
function ak(e) {
  return e.l += 4, [0, 0];
}
var Ph = {
  /*::[*/
  1: { n: "PtgExp", f: E_ },
  /*::[*/
  2: { n: "PtgTbl", f: z_ },
  /*::[*/
  3: { n: "PtgAdd", f: Tr },
  /*::[*/
  4: { n: "PtgSub", f: Tr },
  /*::[*/
  5: { n: "PtgMul", f: Tr },
  /*::[*/
  6: { n: "PtgDiv", f: Tr },
  /*::[*/
  7: { n: "PtgPower", f: Tr },
  /*::[*/
  8: { n: "PtgConcat", f: Tr },
  /*::[*/
  9: { n: "PtgLt", f: Tr },
  /*::[*/
  10: { n: "PtgLe", f: Tr },
  /*::[*/
  11: { n: "PtgEq", f: Tr },
  /*::[*/
  12: { n: "PtgGe", f: Tr },
  /*::[*/
  13: { n: "PtgGt", f: Tr },
  /*::[*/
  14: { n: "PtgNe", f: Tr },
  /*::[*/
  15: { n: "PtgIsect", f: Tr },
  /*::[*/
  16: { n: "PtgUnion", f: Tr },
  /*::[*/
  17: { n: "PtgRange", f: Tr },
  /*::[*/
  18: { n: "PtgUplus", f: Tr },
  /*::[*/
  19: { n: "PtgUminus", f: Tr },
  /*::[*/
  20: { n: "PtgPercent", f: Tr },
  /*::[*/
  21: { n: "PtgParen", f: Tr },
  /*::[*/
  22: { n: "PtgMissArg", f: Tr },
  /*::[*/
  23: { n: "PtgStr", f: F_ },
  /*::[*/
  26: { n: "PtgSheet", f: ek },
  /*::[*/
  27: { n: "PtgEndSheet", f: rk },
  /*::[*/
  28: { n: "PtgErr", f: S_ },
  /*::[*/
  29: { n: "PtgBool", f: C_ },
  /*::[*/
  30: { n: "PtgInt", f: T_ },
  /*::[*/
  31: { n: "PtgNum", f: A_ },
  /*::[*/
  32: { n: "PtgArray", f: o_ },
  /*::[*/
  33: { n: "PtgFunc", f: w_ },
  /*::[*/
  34: { n: "PtgFuncVar", f: y_ },
  /*::[*/
  35: { n: "PtgName", f: O_ },
  /*::[*/
  36: { n: "PtgRef", f: m_ },
  /*::[*/
  37: { n: "PtgArea", f: n_ },
  /*::[*/
  38: { n: "PtgMemArea", f: I_ },
  /*::[*/
  39: { n: "PtgMemErr", f: j_ },
  /*::[*/
  40: { n: "PtgMemNoMem", f: U_ },
  /*::[*/
  41: { n: "PtgMemFunc", f: L_ },
  /*::[*/
  42: { n: "PtgRefErr", f: M_ },
  /*::[*/
  43: { n: "PtgAreaErr", f: i_ },
  /*::[*/
  44: { n: "PtgRefN", f: g_ },
  /*::[*/
  45: { n: "PtgAreaN", f: l_ },
  /*::[*/
  46: { n: "PtgMemAreaN", f: tk },
  /*::[*/
  47: { n: "PtgMemNoMemN", f: nk },
  /*::[*/
  57: { n: "PtgNameX", f: P_ },
  /*::[*/
  58: { n: "PtgRef3d", f: v_ },
  /*::[*/
  59: { n: "PtgArea3d", f: a_ },
  /*::[*/
  60: { n: "PtgRefErr3d", f: B_ },
  /*::[*/
  61: { n: "PtgAreaErr3d", f: s_ },
  /*::[*/
  255: {}
}, ik = {
  /*::[*/
  64: 32,
  /*::[*/
  96: 32,
  /*::[*/
  65: 33,
  /*::[*/
  97: 33,
  /*::[*/
  66: 34,
  /*::[*/
  98: 34,
  /*::[*/
  67: 35,
  /*::[*/
  99: 35,
  /*::[*/
  68: 36,
  /*::[*/
  100: 36,
  /*::[*/
  69: 37,
  /*::[*/
  101: 37,
  /*::[*/
  70: 38,
  /*::[*/
  102: 38,
  /*::[*/
  71: 39,
  /*::[*/
  103: 39,
  /*::[*/
  72: 40,
  /*::[*/
  104: 40,
  /*::[*/
  73: 41,
  /*::[*/
  105: 41,
  /*::[*/
  74: 42,
  /*::[*/
  106: 42,
  /*::[*/
  75: 43,
  /*::[*/
  107: 43,
  /*::[*/
  76: 44,
  /*::[*/
  108: 44,
  /*::[*/
  77: 45,
  /*::[*/
  109: 45,
  /*::[*/
  78: 46,
  /*::[*/
  110: 46,
  /*::[*/
  79: 47,
  /*::[*/
  111: 47,
  /*::[*/
  88: 34,
  /*::[*/
  120: 34,
  /*::[*/
  89: 57,
  /*::[*/
  121: 57,
  /*::[*/
  90: 58,
  /*::[*/
  122: 58,
  /*::[*/
  91: 59,
  /*::[*/
  123: 59,
  /*::[*/
  92: 60,
  /*::[*/
  124: 60,
  /*::[*/
  93: 61,
  /*::[*/
  125: 61
}, sk = {
  /*::[*/
  1: { n: "PtgElfLel", f: m1 },
  /*::[*/
  2: { n: "PtgElfRw", f: Y_ },
  /*::[*/
  3: { n: "PtgElfCol", f: H_ },
  /*::[*/
  6: { n: "PtgElfRwV", f: Q_ },
  /*::[*/
  7: { n: "PtgElfColV", f: G_ },
  /*::[*/
  10: { n: "PtgElfRadical", f: $_ },
  /*::[*/
  11: { n: "PtgElfRadicalS", f: X_ },
  /*::[*/
  13: { n: "PtgElfColS", f: V_ },
  /*::[*/
  15: { n: "PtgElfColSV", f: W_ },
  /*::[*/
  16: { n: "PtgElfRadicalLel", f: K_ },
  /*::[*/
  25: { n: "PtgList", f: J_ },
  /*::[*/
  29: { n: "PtgSxName", f: Z_ },
  /*::[*/
  255: {}
}, lk = {
  /*::[*/
  0: { n: "PtgAttrNoop", f: ak },
  /*::[*/
  1: { n: "PtgAttrSemi", f: h_ },
  /*::[*/
  2: { n: "PtgAttrIf", f: f_ },
  /*::[*/
  4: { n: "PtgAttrChoose", f: c_ },
  /*::[*/
  8: { n: "PtgAttrGoto", f: u_ },
  /*::[*/
  16: { n: "PtgAttrSum", f: k_ },
  /*::[*/
  32: { n: "PtgAttrBaxcel", f: Oh },
  /*::[*/
  33: { n: "PtgAttrBaxcel", f: Oh },
  /*::[*/
  64: { n: "PtgAttrSpace", f: p_ },
  /*::[*/
  65: { n: "PtgAttrSpaceSemi", f: x_ },
  /*::[*/
  128: { n: "PtgAttrIfError", f: d_ },
  /*::[*/
  255: {}
};
function Ms(e, n, r, s) {
  if (s.biff < 8) return at(e, n);
  for (var i = e.l + n, o = [], c = 0; c !== r.length; ++c)
    switch (r[c][0]) {
      case "PtgArray":
        r[c][1] = D_(e, 0, s), o.push(r[c][1]);
        break;
      case "PtgMemArea":
        r[c][2] = R_(e, r[c][1], s), o.push(r[c][2]);
        break;
      case "PtgExp":
        s && s.biff == 12 && (r[c][1][1] = e.read_shift(4), o.push(r[c][1]));
        break;
      case "PtgList":
      /* TODO: PtgList -> PtgExtraList */
      case "PtgElfRadicalS":
      /* TODO: PtgElfRadicalS -> PtgExtraElf */
      case "PtgElfColS":
      /* TODO: PtgElfColS -> PtgExtraElf */
      case "PtgElfColSV":
        throw "Unsupported " + r[c][0];
    }
  return n = i - e.l, n !== 0 && o.push(at(e, n)), o;
}
function Bs(e, n, r) {
  for (var s = e.l + n, i, o, c = []; s != e.l; )
    n = s - e.l, o = e[e.l], i = Ph[o] || Ph[ik[o]], (o === 24 || o === 25) && (i = (o === 24 ? sk : lk)[e[e.l + 1]]), !i || !i.f ? at(e, n) : c.push([i.n, i.f(e, n, r)]);
  return c;
}
function ok(e) {
  for (var n = [], r = 0; r < e.length; ++r) {
    for (var s = e[r], i = [], o = 0; o < s.length; ++o) {
      var c = s[o];
      if (c) switch (c[0]) {
        // TODO: handle embedded quotes
        case 2:
          i.push('"' + c[1].replace(/"/g, '""') + '"');
          break;
        default:
          i.push(c[1]);
      }
      else i.push("");
    }
    n.push(i.join(","));
  }
  return n.join(";");
}
var ck = {
  PtgAdd: "+",
  PtgConcat: "&",
  PtgDiv: "/",
  PtgEq: "=",
  PtgGe: ">=",
  PtgGt: ">",
  PtgLe: "<=",
  PtgLt: "<",
  PtgMul: "*",
  PtgNe: "<>",
  PtgPower: "^",
  PtgSub: "-"
};
function uk(e, n) {
  if (!e && !(n && n.biff <= 5 && n.biff >= 2)) throw new Error("empty sheet name");
  return /[^\w\u4E00-\u9FFF\u3040-\u30FF]/.test(e) ? "'" + e + "'" : e;
}
function g1(e, n, r) {
  if (!e) return "SH33TJSERR0";
  if (r.biff > 8 && (!e.XTI || !e.XTI[n])) return e.SheetNames[n];
  if (!e.XTI) return "SH33TJSERR6";
  var s = e.XTI[n];
  if (r.biff < 8)
    return n > 1e4 && (n -= 65536), n < 0 && (n = -n), n == 0 ? "" : e.XTI[n - 1];
  if (!s) return "SH33TJSERR1";
  var i = "";
  if (r.biff > 8) switch (e[s[0]][0]) {
    case 357:
      return i = s[1] == -1 ? "#REF" : e.SheetNames[s[1]], s[1] == s[2] ? i : i + ":" + e.SheetNames[s[2]];
    case 358:
      return r.SID != null ? e.SheetNames[r.SID] : "SH33TJSSAME" + e[s[0]][0];
    case 355:
    /* 'BrtSupBookSrc' */
    /* falls through */
    default:
      return "SH33TJSSRC" + e[s[0]][0];
  }
  switch (e[s[0]][0][0]) {
    case 1025:
      return i = s[1] == -1 ? "#REF" : e.SheetNames[s[1]] || "SH33TJSERR3", s[1] == s[2] ? i : i + ":" + e.SheetNames[s[2]];
    case 14849:
      return e[s[0]].slice(1).map(function(o) {
        return o.Name;
      }).join(";;");
    //return "SH33TJSERR8";
    default:
      return e[s[0]][0][3] ? (i = s[1] == -1 ? "#REF" : e[s[0]][0][3][s[1]] || "SH33TJSERR4", s[1] == s[2] ? i : i + ":" + e[s[0]][0][3][s[2]]) : "SH33TJSERR2";
  }
}
function bh(e, n, r) {
  var s = g1(e, n, r);
  return s == "#REF" ? s : uk(s, r);
}
function et(e, n, r, s, i) {
  var o = i && i.biff || 8, c = (
    /*range != null ? range :*/
    { s: { c: 0, r: 0 } }
  ), u = [], d, x, p, g = 0, w = 0, k, _ = "";
  if (!e[0] || !e[0][0]) return "";
  for (var y = -1, E = "", A = 0, O = e[0].length; A < O; ++A) {
    var N = e[0][A];
    switch (N[0]) {
      case "PtgUminus":
        u.push("-" + u.pop());
        break;
      case "PtgUplus":
        u.push("+" + u.pop());
        break;
      case "PtgPercent":
        u.push(u.pop() + "%");
        break;
      case "PtgAdd":
      /* [MS-XLS] 2.5.198.26 */
      case "PtgConcat":
      /* [MS-XLS] 2.5.198.43 */
      case "PtgDiv":
      /* [MS-XLS] 2.5.198.45 */
      case "PtgEq":
      /* [MS-XLS] 2.5.198.56 */
      case "PtgGe":
      /* [MS-XLS] 2.5.198.64 */
      case "PtgGt":
      /* [MS-XLS] 2.5.198.65 */
      case "PtgLe":
      /* [MS-XLS] 2.5.198.68 */
      case "PtgLt":
      /* [MS-XLS] 2.5.198.69 */
      case "PtgMul":
      /* [MS-XLS] 2.5.198.75 */
      case "PtgNe":
      /* [MS-XLS] 2.5.198.78 */
      case "PtgPower":
      /* [MS-XLS] 2.5.198.82 */
      case "PtgSub":
        if (d = u.pop(), x = u.pop(), y >= 0) {
          switch (e[0][y][1][0]) {
            case 0:
              E = gr(" ", e[0][y][1][1]);
              break;
            case 1:
              E = gr("\r", e[0][y][1][1]);
              break;
            default:
              if (E = "", i.WTF) throw new Error("Unexpected PtgAttrSpaceType " + e[0][y][1][0]);
          }
          x = x + E, y = -1;
        }
        u.push(x + ck[N[0]] + d);
        break;
      case "PtgIsect":
        d = u.pop(), x = u.pop(), u.push(x + " " + d);
        break;
      case "PtgUnion":
        d = u.pop(), x = u.pop(), u.push(x + "," + d);
        break;
      case "PtgRange":
        d = u.pop(), x = u.pop(), u.push(x + ":" + d);
        break;
      case "PtgAttrChoose":
        break;
      case "PtgAttrGoto":
        break;
      case "PtgAttrIf":
        break;
      case "PtgAttrIfError":
        break;
      case "PtgRef":
        p = ps(N[1][1], c, i), u.push(xs(p, o));
        break;
      case "PtgRefN":
        p = r ? ps(N[1][1], r, i) : N[1][1], u.push(xs(p, o));
        break;
      case "PtgRef3d":
        g = /*::Number(*/
        N[1][1], p = ps(N[1][2], c, i), _ = bh(s, g, i), u.push(_ + "!" + xs(p, o));
        break;
      case "PtgFunc":
      /* [MS-XLS] 2.5.198.62 */
      case "PtgFuncVar":
        var V = N[1][0], J = N[1][1];
        V || (V = 0), V &= 127;
        var j = V == 0 ? [] : u.slice(-V);
        u.length -= V, J === "User" && (J = j.shift()), u.push(J + "(" + j.join(",") + ")");
        break;
      case "PtgBool":
        u.push(N[1] ? "TRUE" : "FALSE");
        break;
      case "PtgInt":
        u.push(
          /*::String(*/
          N[1]
          /*::)*/
        );
        break;
      case "PtgNum":
        u.push(String(N[1]));
        break;
      case "PtgStr":
        u.push('"' + N[1].replace(/"/g, '""') + '"');
        break;
      case "PtgErr":
        u.push(
          /*::String(*/
          N[1]
          /*::)*/
        );
        break;
      case "PtgAreaN":
        k = ph(N[1][1], r ? { s: r } : c, i), u.push(uc(k, i));
        break;
      case "PtgArea":
        k = ph(N[1][1], c, i), u.push(uc(k, i));
        break;
      case "PtgArea3d":
        g = /*::Number(*/
        N[1][1], k = N[1][2], _ = bh(s, g, i), u.push(_ + "!" + uc(k, i));
        break;
      case "PtgAttrSum":
        u.push("SUM(" + u.pop() + ")");
        break;
      case "PtgAttrBaxcel":
      /* [MS-XLS] 2.5.198.33 */
      case "PtgAttrSemi":
        break;
      case "PtgName":
        w = N[1][2];
        var C = (s.names || [])[w - 1] || (s[0] || [])[w], G = C ? C.Name : "SH33TJSNAME" + String(w);
        G && G.slice(0, 6) == "_xlfn." && !i.xlfn && (G = G.slice(6)), u.push(G);
        break;
      case "PtgNameX":
        var B = N[1][1];
        w = N[1][2];
        var le;
        if (i.biff <= 5)
          B < 0 && (B = -B), s[B] && (le = s[B][w]);
        else {
          var re = "";
          if (((s[B] || [])[0] || [])[0] == 14849 || (((s[B] || [])[0] || [])[0] == 1025 ? s[B][w] && s[B][w].itab > 0 && (re = s.SheetNames[s[B][w].itab - 1] + "!") : re = s.SheetNames[w - 1] + "!"), s[B] && s[B][w]) re += s[B][w].Name;
          else if (s[0] && s[0][w]) re += s[0][w].Name;
          else {
            var Q = (g1(s, B, i) || "").split(";;");
            Q[w - 1] ? re = Q[w - 1] : re += "SH33TJSERRX";
          }
          u.push(re);
          break;
        }
        le || (le = { Name: "SH33TJSERRY" }), u.push(le.Name);
        break;
      case "PtgParen":
        var pe = "(", Ce = ")";
        if (y >= 0) {
          switch (E = "", e[0][y][1][0]) {
            // $FlowIgnore
            case 2:
              pe = gr(" ", e[0][y][1][1]) + pe;
              break;
            // $FlowIgnore
            case 3:
              pe = gr("\r", e[0][y][1][1]) + pe;
              break;
            // $FlowIgnore
            case 4:
              Ce = gr(" ", e[0][y][1][1]) + Ce;
              break;
            // $FlowIgnore
            case 5:
              Ce = gr("\r", e[0][y][1][1]) + Ce;
              break;
            default:
              if (i.WTF) throw new Error("Unexpected PtgAttrSpaceType " + e[0][y][1][0]);
          }
          y = -1;
        }
        u.push(pe + u.pop() + Ce);
        break;
      case "PtgRefErr":
        u.push("#REF!");
        break;
      case "PtgRefErr3d":
        u.push("#REF!");
        break;
      case "PtgExp":
        p = { c: N[1][1], r: N[1][0] };
        var xe = { c: r.c, r: r.r };
        if (s.sharedf[Ge(p)]) {
          var we = s.sharedf[Ge(p)];
          u.push(et(we, c, xe, s, i));
        } else {
          var ye = !1;
          for (d = 0; d != s.arrayf.length; ++d)
            if (x = s.arrayf[d], !(p.c < x[0].s.c || p.c > x[0].e.c) && !(p.r < x[0].s.r || p.r > x[0].e.r)) {
              u.push(et(x[1], c, xe, s, i)), ye = !0;
              break;
            }
          ye || u.push(
            /*::String(*/
            N[1]
            /*::)*/
          );
        }
        break;
      case "PtgArray":
        u.push("{" + ok(
          /*::(*/
          N[1]
          /*:: :any)*/
        ) + "}");
        break;
      case "PtgMemArea":
        break;
      case "PtgAttrSpace":
      /* [MS-XLS] 2.5.198.38 */
      case "PtgAttrSpaceSemi":
        y = A;
        break;
      case "PtgTbl":
        break;
      case "PtgMemErr":
        break;
      case "PtgMissArg":
        u.push("");
        break;
      case "PtgAreaErr":
        u.push("#REF!");
        break;
      case "PtgAreaErr3d":
        u.push("#REF!");
        break;
      case "PtgList":
        u.push("Table" + N[1].idx + "[#" + N[1].rt + "]");
        break;
      case "PtgMemAreaN":
      case "PtgMemNoMemN":
      case "PtgAttrNoop":
      case "PtgSheet":
      case "PtgEndSheet":
        break;
      case "PtgMemFunc":
        break;
      case "PtgMemNoMem":
        break;
      case "PtgElfCol":
      /* [MS-XLS] 2.5.198.46 */
      case "PtgElfColS":
      /* [MS-XLS] 2.5.198.47 */
      case "PtgElfColSV":
      /* [MS-XLS] 2.5.198.48 */
      case "PtgElfColV":
      /* [MS-XLS] 2.5.198.49 */
      case "PtgElfLel":
      /* [MS-XLS] 2.5.198.50 */
      case "PtgElfRadical":
      /* [MS-XLS] 2.5.198.51 */
      case "PtgElfRadicalLel":
      /* [MS-XLS] 2.5.198.52 */
      case "PtgElfRadicalS":
      /* [MS-XLS] 2.5.198.53 */
      case "PtgElfRw":
      /* [MS-XLS] 2.5.198.54 */
      case "PtgElfRwV":
        throw new Error("Unsupported ELFs");
      case "PtgSxName":
        throw new Error("Unrecognized Formula Token: " + String(N));
      default:
        throw new Error("Unrecognized Formula Token: " + String(N));
    }
    var ge = ["PtgAttrSpace", "PtgAttrSpaceSemi", "PtgAttrGoto"];
    if (i.biff != 3 && y >= 0 && ge.indexOf(e[0][A][0]) == -1) {
      N = e[0][y];
      var Y = !0;
      switch (N[1][0]) {
        /* note: some bad XLSB files omit the PtgParen */
        case 4:
          Y = !1;
        /* falls through */
        case 0:
          E = gr(" ", N[1][1]);
          break;
        case 5:
          Y = !1;
        /* falls through */
        case 1:
          E = gr("\r", N[1][1]);
          break;
        default:
          if (E = "", i.WTF) throw new Error("Unexpected PtgAttrSpaceType " + N[1][0]);
      }
      u.push((Y ? E : "") + u.pop() + (Y ? "" : E)), y = -1;
    }
  }
  if (u.length > 1 && i.WTF) throw new Error("bad formula stack");
  return u[0];
}
function fk(e, n, r) {
  var s = e.l + n, i = r.biff == 2 ? 1 : 2, o, c = e.read_shift(i);
  if (c == 65535) return [[], at(e, n - 2)];
  var u = Bs(e, c, r);
  return n !== c + i && (o = Ms(e, n - c - i, u, r)), e.l = s, [u, o];
}
function dk(e, n, r) {
  var s = e.l + n, i = r.biff == 2 ? 1 : 2, o, c = e.read_shift(i);
  if (c == 65535) return [[], at(e, n - 2)];
  var u = Bs(e, c, r);
  return n !== c + i && (o = Ms(e, n - c - i, u, r)), e.l = s, [u, o];
}
function hk(e, n, r, s) {
  var i = e.l + n, o = Bs(e, s, r), c;
  return i !== e.l && (c = Ms(e, i - e.l, o, r)), [o, c];
}
function pk(e, n, r) {
  var s = e.l + n, i, o = e.read_shift(2), c = Bs(e, o, r);
  return o == 65535 ? [[], at(e, n - 2)] : (n !== o + 2 && (i = Ms(e, s - o - 2, c, r)), [c, i]);
}
function xk(e) {
  var n;
  if (Tn(e, e.l + 6) !== 65535) return [rt(e), "n"];
  switch (e[e.l]) {
    case 0:
      return e.l += 8, ["String", "s"];
    case 1:
      return n = e[e.l + 2] === 1, e.l += 8, [n, "b"];
    case 2:
      return n = e[e.l + 2], e.l += 8, [n, "e"];
    case 3:
      return e.l += 8, ["", "s"];
  }
  return [];
}
function hc(e, n, r) {
  var s = e.l + n, i = hn(e);
  r.biff == 2 && ++e.l;
  var o = xk(e), c = e.read_shift(1);
  r.biff != 2 && (e.read_shift(1), r.biff >= 5 && e.read_shift(4));
  var u = dk(e, s - e.l, r);
  return { cell: i, val: o[0], formula: u, shared: c >> 3 & 1, tt: o[1] };
}
function wo(e, n, r) {
  var s = e.read_shift(4), i = Bs(e, s, r), o = e.read_shift(4), c = o > 0 ? Ms(e, o, i, r) : null;
  return [i, c];
}
var mk = wo, yo = wo, gk = wo, vk = wo, wk = {
  0: "BEEP",
  1: "OPEN",
  2: "OPEN.LINKS",
  3: "CLOSE.ALL",
  4: "SAVE",
  5: "SAVE.AS",
  6: "FILE.DELETE",
  7: "PAGE.SETUP",
  8: "PRINT",
  9: "PRINTER.SETUP",
  10: "QUIT",
  11: "NEW.WINDOW",
  12: "ARRANGE.ALL",
  13: "WINDOW.SIZE",
  14: "WINDOW.MOVE",
  15: "FULL",
  16: "CLOSE",
  17: "RUN",
  22: "SET.PRINT.AREA",
  23: "SET.PRINT.TITLES",
  24: "SET.PAGE.BREAK",
  25: "REMOVE.PAGE.BREAK",
  26: "FONT",
  27: "DISPLAY",
  28: "PROTECT.DOCUMENT",
  29: "PRECISION",
  30: "A1.R1C1",
  31: "CALCULATE.NOW",
  32: "CALCULATION",
  34: "DATA.FIND",
  35: "EXTRACT",
  36: "DATA.DELETE",
  37: "SET.DATABASE",
  38: "SET.CRITERIA",
  39: "SORT",
  40: "DATA.SERIES",
  41: "TABLE",
  42: "FORMAT.NUMBER",
  43: "ALIGNMENT",
  44: "STYLE",
  45: "BORDER",
  46: "CELL.PROTECTION",
  47: "COLUMN.WIDTH",
  48: "UNDO",
  49: "CUT",
  50: "COPY",
  51: "PASTE",
  52: "CLEAR",
  53: "PASTE.SPECIAL",
  54: "EDIT.DELETE",
  55: "INSERT",
  56: "FILL.RIGHT",
  57: "FILL.DOWN",
  61: "DEFINE.NAME",
  62: "CREATE.NAMES",
  63: "FORMULA.GOTO",
  64: "FORMULA.FIND",
  65: "SELECT.LAST.CELL",
  66: "SHOW.ACTIVE.CELL",
  67: "GALLERY.AREA",
  68: "GALLERY.BAR",
  69: "GALLERY.COLUMN",
  70: "GALLERY.LINE",
  71: "GALLERY.PIE",
  72: "GALLERY.SCATTER",
  73: "COMBINATION",
  74: "PREFERRED",
  75: "ADD.OVERLAY",
  76: "GRIDLINES",
  77: "SET.PREFERRED",
  78: "AXES",
  79: "LEGEND",
  80: "ATTACH.TEXT",
  81: "ADD.ARROW",
  82: "SELECT.CHART",
  83: "SELECT.PLOT.AREA",
  84: "PATTERNS",
  85: "MAIN.CHART",
  86: "OVERLAY",
  87: "SCALE",
  88: "FORMAT.LEGEND",
  89: "FORMAT.TEXT",
  90: "EDIT.REPEAT",
  91: "PARSE",
  92: "JUSTIFY",
  93: "HIDE",
  94: "UNHIDE",
  95: "WORKSPACE",
  96: "FORMULA",
  97: "FORMULA.FILL",
  98: "FORMULA.ARRAY",
  99: "DATA.FIND.NEXT",
  100: "DATA.FIND.PREV",
  101: "FORMULA.FIND.NEXT",
  102: "FORMULA.FIND.PREV",
  103: "ACTIVATE",
  104: "ACTIVATE.NEXT",
  105: "ACTIVATE.PREV",
  106: "UNLOCKED.NEXT",
  107: "UNLOCKED.PREV",
  108: "COPY.PICTURE",
  109: "SELECT",
  110: "DELETE.NAME",
  111: "DELETE.FORMAT",
  112: "VLINE",
  113: "HLINE",
  114: "VPAGE",
  115: "HPAGE",
  116: "VSCROLL",
  117: "HSCROLL",
  118: "ALERT",
  119: "NEW",
  120: "CANCEL.COPY",
  121: "SHOW.CLIPBOARD",
  122: "MESSAGE",
  124: "PASTE.LINK",
  125: "APP.ACTIVATE",
  126: "DELETE.ARROW",
  127: "ROW.HEIGHT",
  128: "FORMAT.MOVE",
  129: "FORMAT.SIZE",
  130: "FORMULA.REPLACE",
  131: "SEND.KEYS",
  132: "SELECT.SPECIAL",
  133: "APPLY.NAMES",
  134: "REPLACE.FONT",
  135: "FREEZE.PANES",
  136: "SHOW.INFO",
  137: "SPLIT",
  138: "ON.WINDOW",
  139: "ON.DATA",
  140: "DISABLE.INPUT",
  142: "OUTLINE",
  143: "LIST.NAMES",
  144: "FILE.CLOSE",
  145: "SAVE.WORKBOOK",
  146: "DATA.FORM",
  147: "COPY.CHART",
  148: "ON.TIME",
  149: "WAIT",
  150: "FORMAT.FONT",
  151: "FILL.UP",
  152: "FILL.LEFT",
  153: "DELETE.OVERLAY",
  155: "SHORT.MENUS",
  159: "SET.UPDATE.STATUS",
  161: "COLOR.PALETTE",
  162: "DELETE.STYLE",
  163: "WINDOW.RESTORE",
  164: "WINDOW.MAXIMIZE",
  166: "CHANGE.LINK",
  167: "CALCULATE.DOCUMENT",
  168: "ON.KEY",
  169: "APP.RESTORE",
  170: "APP.MOVE",
  171: "APP.SIZE",
  172: "APP.MINIMIZE",
  173: "APP.MAXIMIZE",
  174: "BRING.TO.FRONT",
  175: "SEND.TO.BACK",
  185: "MAIN.CHART.TYPE",
  186: "OVERLAY.CHART.TYPE",
  187: "SELECT.END",
  188: "OPEN.MAIL",
  189: "SEND.MAIL",
  190: "STANDARD.FONT",
  191: "CONSOLIDATE",
  192: "SORT.SPECIAL",
  193: "GALLERY.3D.AREA",
  194: "GALLERY.3D.COLUMN",
  195: "GALLERY.3D.LINE",
  196: "GALLERY.3D.PIE",
  197: "VIEW.3D",
  198: "GOAL.SEEK",
  199: "WORKGROUP",
  200: "FILL.GROUP",
  201: "UPDATE.LINK",
  202: "PROMOTE",
  203: "DEMOTE",
  204: "SHOW.DETAIL",
  206: "UNGROUP",
  207: "OBJECT.PROPERTIES",
  208: "SAVE.NEW.OBJECT",
  209: "SHARE",
  210: "SHARE.NAME",
  211: "DUPLICATE",
  212: "APPLY.STYLE",
  213: "ASSIGN.TO.OBJECT",
  214: "OBJECT.PROTECTION",
  215: "HIDE.OBJECT",
  216: "SET.EXTRACT",
  217: "CREATE.PUBLISHER",
  218: "SUBSCRIBE.TO",
  219: "ATTRIBUTES",
  220: "SHOW.TOOLBAR",
  222: "PRINT.PREVIEW",
  223: "EDIT.COLOR",
  224: "SHOW.LEVELS",
  225: "FORMAT.MAIN",
  226: "FORMAT.OVERLAY",
  227: "ON.RECALC",
  228: "EDIT.SERIES",
  229: "DEFINE.STYLE",
  240: "LINE.PRINT",
  243: "ENTER.DATA",
  249: "GALLERY.RADAR",
  250: "MERGE.STYLES",
  251: "EDITION.OPTIONS",
  252: "PASTE.PICTURE",
  253: "PASTE.PICTURE.LINK",
  254: "SPELLING",
  256: "ZOOM",
  259: "INSERT.OBJECT",
  260: "WINDOW.MINIMIZE",
  265: "SOUND.NOTE",
  266: "SOUND.PLAY",
  267: "FORMAT.SHAPE",
  268: "EXTEND.POLYGON",
  269: "FORMAT.AUTO",
  272: "GALLERY.3D.BAR",
  273: "GALLERY.3D.SURFACE",
  274: "FILL.AUTO",
  276: "CUSTOMIZE.TOOLBAR",
  277: "ADD.TOOL",
  278: "EDIT.OBJECT",
  279: "ON.DOUBLECLICK",
  280: "ON.ENTRY",
  281: "WORKBOOK.ADD",
  282: "WORKBOOK.MOVE",
  283: "WORKBOOK.COPY",
  284: "WORKBOOK.OPTIONS",
  285: "SAVE.WORKSPACE",
  288: "CHART.WIZARD",
  289: "DELETE.TOOL",
  290: "MOVE.TOOL",
  291: "WORKBOOK.SELECT",
  292: "WORKBOOK.ACTIVATE",
  293: "ASSIGN.TO.TOOL",
  295: "COPY.TOOL",
  296: "RESET.TOOL",
  297: "CONSTRAIN.NUMERIC",
  298: "PASTE.TOOL",
  302: "WORKBOOK.NEW",
  305: "SCENARIO.CELLS",
  306: "SCENARIO.DELETE",
  307: "SCENARIO.ADD",
  308: "SCENARIO.EDIT",
  309: "SCENARIO.SHOW",
  310: "SCENARIO.SHOW.NEXT",
  311: "SCENARIO.SUMMARY",
  312: "PIVOT.TABLE.WIZARD",
  313: "PIVOT.FIELD.PROPERTIES",
  314: "PIVOT.FIELD",
  315: "PIVOT.ITEM",
  316: "PIVOT.ADD.FIELDS",
  318: "OPTIONS.CALCULATION",
  319: "OPTIONS.EDIT",
  320: "OPTIONS.VIEW",
  321: "ADDIN.MANAGER",
  322: "MENU.EDITOR",
  323: "ATTACH.TOOLBARS",
  324: "VBAActivate",
  325: "OPTIONS.CHART",
  328: "VBA.INSERT.FILE",
  330: "VBA.PROCEDURE.DEFINITION",
  336: "ROUTING.SLIP",
  338: "ROUTE.DOCUMENT",
  339: "MAIL.LOGON",
  342: "INSERT.PICTURE",
  343: "EDIT.TOOL",
  344: "GALLERY.DOUGHNUT",
  350: "CHART.TREND",
  352: "PIVOT.ITEM.PROPERTIES",
  354: "WORKBOOK.INSERT",
  355: "OPTIONS.TRANSITION",
  356: "OPTIONS.GENERAL",
  370: "FILTER.ADVANCED",
  373: "MAIL.ADD.MAILER",
  374: "MAIL.DELETE.MAILER",
  375: "MAIL.REPLY",
  376: "MAIL.REPLY.ALL",
  377: "MAIL.FORWARD",
  378: "MAIL.NEXT.LETTER",
  379: "DATA.LABEL",
  380: "INSERT.TITLE",
  381: "FONT.PROPERTIES",
  382: "MACRO.OPTIONS",
  383: "WORKBOOK.HIDE",
  384: "WORKBOOK.UNHIDE",
  385: "WORKBOOK.DELETE",
  386: "WORKBOOK.NAME",
  388: "GALLERY.CUSTOM",
  390: "ADD.CHART.AUTOFORMAT",
  391: "DELETE.CHART.AUTOFORMAT",
  392: "CHART.ADD.DATA",
  393: "AUTO.OUTLINE",
  394: "TAB.ORDER",
  395: "SHOW.DIALOG",
  396: "SELECT.ALL",
  397: "UNGROUP.SHEETS",
  398: "SUBTOTAL.CREATE",
  399: "SUBTOTAL.REMOVE",
  400: "RENAME.OBJECT",
  412: "WORKBOOK.SCROLL",
  413: "WORKBOOK.NEXT",
  414: "WORKBOOK.PREV",
  415: "WORKBOOK.TAB.SPLIT",
  416: "FULL.SCREEN",
  417: "WORKBOOK.PROTECT",
  420: "SCROLLBAR.PROPERTIES",
  421: "PIVOT.SHOW.PAGES",
  422: "TEXT.TO.COLUMNS",
  423: "FORMAT.CHARTTYPE",
  424: "LINK.FORMAT",
  425: "TRACER.DISPLAY",
  430: "TRACER.NAVIGATE",
  431: "TRACER.CLEAR",
  432: "TRACER.ERROR",
  433: "PIVOT.FIELD.GROUP",
  434: "PIVOT.FIELD.UNGROUP",
  435: "CHECKBOX.PROPERTIES",
  436: "LABEL.PROPERTIES",
  437: "LISTBOX.PROPERTIES",
  438: "EDITBOX.PROPERTIES",
  439: "PIVOT.REFRESH",
  440: "LINK.COMBO",
  441: "OPEN.TEXT",
  442: "HIDE.DIALOG",
  443: "SET.DIALOG.FOCUS",
  444: "ENABLE.OBJECT",
  445: "PUSHBUTTON.PROPERTIES",
  446: "SET.DIALOG.DEFAULT",
  447: "FILTER",
  448: "FILTER.SHOW.ALL",
  449: "CLEAR.OUTLINE",
  450: "FUNCTION.WIZARD",
  451: "ADD.LIST.ITEM",
  452: "SET.LIST.ITEM",
  453: "REMOVE.LIST.ITEM",
  454: "SELECT.LIST.ITEM",
  455: "SET.CONTROL.VALUE",
  456: "SAVE.COPY.AS",
  458: "OPTIONS.LISTS.ADD",
  459: "OPTIONS.LISTS.DELETE",
  460: "SERIES.AXES",
  461: "SERIES.X",
  462: "SERIES.Y",
  463: "ERRORBAR.X",
  464: "ERRORBAR.Y",
  465: "FORMAT.CHART",
  466: "SERIES.ORDER",
  467: "MAIL.LOGOFF",
  468: "CLEAR.ROUTING.SLIP",
  469: "APP.ACTIVATE.MICROSOFT",
  470: "MAIL.EDIT.MAILER",
  471: "ON.SHEET",
  472: "STANDARD.WIDTH",
  473: "SCENARIO.MERGE",
  474: "SUMMARY.INFO",
  475: "FIND.FILE",
  476: "ACTIVE.CELL.FONT",
  477: "ENABLE.TIPWIZARD",
  478: "VBA.MAKE.ADDIN",
  480: "INSERTDATATABLE",
  481: "WORKGROUP.OPTIONS",
  482: "MAIL.SEND.MAILER",
  485: "AUTOCORRECT",
  489: "POST.DOCUMENT",
  491: "PICKLIST",
  493: "VIEW.SHOW",
  494: "VIEW.DEFINE",
  495: "VIEW.DELETE",
  509: "SHEET.BACKGROUND",
  510: "INSERT.MAP.OBJECT",
  511: "OPTIONS.MENONO",
  517: "MSOCHECKS",
  518: "NORMAL",
  519: "LAYOUT",
  520: "RM.PRINT.AREA",
  521: "CLEAR.PRINT.AREA",
  522: "ADD.PRINT.AREA",
  523: "MOVE.BRK",
  545: "HIDECURR.NOTE",
  546: "HIDEALL.NOTES",
  547: "DELETE.NOTE",
  548: "TRAVERSE.NOTES",
  549: "ACTIVATE.NOTES",
  620: "PROTECT.REVISIONS",
  621: "UNPROTECT.REVISIONS",
  647: "OPTIONS.ME",
  653: "WEB.PUBLISH",
  667: "NEWWEBQUERY",
  673: "PIVOT.TABLE.CHART",
  753: "OPTIONS.SAVE",
  755: "OPTIONS.SPELL",
  808: "HIDEALL.INKANNOTS"
}, v1 = {
  0: "COUNT",
  1: "IF",
  2: "ISNA",
  3: "ISERROR",
  4: "SUM",
  5: "AVERAGE",
  6: "MIN",
  7: "MAX",
  8: "ROW",
  9: "COLUMN",
  10: "NA",
  11: "NPV",
  12: "STDEV",
  13: "DOLLAR",
  14: "FIXED",
  15: "SIN",
  16: "COS",
  17: "TAN",
  18: "ATAN",
  19: "PI",
  20: "SQRT",
  21: "EXP",
  22: "LN",
  23: "LOG10",
  24: "ABS",
  25: "INT",
  26: "SIGN",
  27: "ROUND",
  28: "LOOKUP",
  29: "INDEX",
  30: "REPT",
  31: "MID",
  32: "LEN",
  33: "VALUE",
  34: "TRUE",
  35: "FALSE",
  36: "AND",
  37: "OR",
  38: "NOT",
  39: "MOD",
  40: "DCOUNT",
  41: "DSUM",
  42: "DAVERAGE",
  43: "DMIN",
  44: "DMAX",
  45: "DSTDEV",
  46: "VAR",
  47: "DVAR",
  48: "TEXT",
  49: "LINEST",
  50: "TREND",
  51: "LOGEST",
  52: "GROWTH",
  53: "GOTO",
  54: "HALT",
  55: "RETURN",
  56: "PV",
  57: "FV",
  58: "NPER",
  59: "PMT",
  60: "RATE",
  61: "MIRR",
  62: "IRR",
  63: "RAND",
  64: "MATCH",
  65: "DATE",
  66: "TIME",
  67: "DAY",
  68: "MONTH",
  69: "YEAR",
  70: "WEEKDAY",
  71: "HOUR",
  72: "MINUTE",
  73: "SECOND",
  74: "NOW",
  75: "AREAS",
  76: "ROWS",
  77: "COLUMNS",
  78: "OFFSET",
  79: "ABSREF",
  80: "RELREF",
  81: "ARGUMENT",
  82: "SEARCH",
  83: "TRANSPOSE",
  84: "ERROR",
  85: "STEP",
  86: "TYPE",
  87: "ECHO",
  88: "SET.NAME",
  89: "CALLER",
  90: "DEREF",
  91: "WINDOWS",
  92: "SERIES",
  93: "DOCUMENTS",
  94: "ACTIVE.CELL",
  95: "SELECTION",
  96: "RESULT",
  97: "ATAN2",
  98: "ASIN",
  99: "ACOS",
  100: "CHOOSE",
  101: "HLOOKUP",
  102: "VLOOKUP",
  103: "LINKS",
  104: "INPUT",
  105: "ISREF",
  106: "GET.FORMULA",
  107: "GET.NAME",
  108: "SET.VALUE",
  109: "LOG",
  110: "EXEC",
  111: "CHAR",
  112: "LOWER",
  113: "UPPER",
  114: "PROPER",
  115: "LEFT",
  116: "RIGHT",
  117: "EXACT",
  118: "TRIM",
  119: "REPLACE",
  120: "SUBSTITUTE",
  121: "CODE",
  122: "NAMES",
  123: "DIRECTORY",
  124: "FIND",
  125: "CELL",
  126: "ISERR",
  127: "ISTEXT",
  128: "ISNUMBER",
  129: "ISBLANK",
  130: "T",
  131: "N",
  132: "FOPEN",
  133: "FCLOSE",
  134: "FSIZE",
  135: "FREADLN",
  136: "FREAD",
  137: "FWRITELN",
  138: "FWRITE",
  139: "FPOS",
  140: "DATEVALUE",
  141: "TIMEVALUE",
  142: "SLN",
  143: "SYD",
  144: "DDB",
  145: "GET.DEF",
  146: "REFTEXT",
  147: "TEXTREF",
  148: "INDIRECT",
  149: "REGISTER",
  150: "CALL",
  151: "ADD.BAR",
  152: "ADD.MENU",
  153: "ADD.COMMAND",
  154: "ENABLE.COMMAND",
  155: "CHECK.COMMAND",
  156: "RENAME.COMMAND",
  157: "SHOW.BAR",
  158: "DELETE.MENU",
  159: "DELETE.COMMAND",
  160: "GET.CHART.ITEM",
  161: "DIALOG.BOX",
  162: "CLEAN",
  163: "MDETERM",
  164: "MINVERSE",
  165: "MMULT",
  166: "FILES",
  167: "IPMT",
  168: "PPMT",
  169: "COUNTA",
  170: "CANCEL.KEY",
  171: "FOR",
  172: "WHILE",
  173: "BREAK",
  174: "NEXT",
  175: "INITIATE",
  176: "REQUEST",
  177: "POKE",
  178: "EXECUTE",
  179: "TERMINATE",
  180: "RESTART",
  181: "HELP",
  182: "GET.BAR",
  183: "PRODUCT",
  184: "FACT",
  185: "GET.CELL",
  186: "GET.WORKSPACE",
  187: "GET.WINDOW",
  188: "GET.DOCUMENT",
  189: "DPRODUCT",
  190: "ISNONTEXT",
  191: "GET.NOTE",
  192: "NOTE",
  193: "STDEVP",
  194: "VARP",
  195: "DSTDEVP",
  196: "DVARP",
  197: "TRUNC",
  198: "ISLOGICAL",
  199: "DCOUNTA",
  200: "DELETE.BAR",
  201: "UNREGISTER",
  204: "USDOLLAR",
  205: "FINDB",
  206: "SEARCHB",
  207: "REPLACEB",
  208: "LEFTB",
  209: "RIGHTB",
  210: "MIDB",
  211: "LENB",
  212: "ROUNDUP",
  213: "ROUNDDOWN",
  214: "ASC",
  215: "DBCS",
  216: "RANK",
  219: "ADDRESS",
  220: "DAYS360",
  221: "TODAY",
  222: "VDB",
  223: "ELSE",
  224: "ELSE.IF",
  225: "END.IF",
  226: "FOR.CELL",
  227: "MEDIAN",
  228: "SUMPRODUCT",
  229: "SINH",
  230: "COSH",
  231: "TANH",
  232: "ASINH",
  233: "ACOSH",
  234: "ATANH",
  235: "DGET",
  236: "CREATE.OBJECT",
  237: "VOLATILE",
  238: "LAST.ERROR",
  239: "CUSTOM.UNDO",
  240: "CUSTOM.REPEAT",
  241: "FORMULA.CONVERT",
  242: "GET.LINK.INFO",
  243: "TEXT.BOX",
  244: "INFO",
  245: "GROUP",
  246: "GET.OBJECT",
  247: "DB",
  248: "PAUSE",
  251: "RESUME",
  252: "FREQUENCY",
  253: "ADD.TOOLBAR",
  254: "DELETE.TOOLBAR",
  255: "User",
  256: "RESET.TOOLBAR",
  257: "EVALUATE",
  258: "GET.TOOLBAR",
  259: "GET.TOOL",
  260: "SPELLING.CHECK",
  261: "ERROR.TYPE",
  262: "APP.TITLE",
  263: "WINDOW.TITLE",
  264: "SAVE.TOOLBAR",
  265: "ENABLE.TOOL",
  266: "PRESS.TOOL",
  267: "REGISTER.ID",
  268: "GET.WORKBOOK",
  269: "AVEDEV",
  270: "BETADIST",
  271: "GAMMALN",
  272: "BETAINV",
  273: "BINOMDIST",
  274: "CHIDIST",
  275: "CHIINV",
  276: "COMBIN",
  277: "CONFIDENCE",
  278: "CRITBINOM",
  279: "EVEN",
  280: "EXPONDIST",
  281: "FDIST",
  282: "FINV",
  283: "FISHER",
  284: "FISHERINV",
  285: "FLOOR",
  286: "GAMMADIST",
  287: "GAMMAINV",
  288: "CEILING",
  289: "HYPGEOMDIST",
  290: "LOGNORMDIST",
  291: "LOGINV",
  292: "NEGBINOMDIST",
  293: "NORMDIST",
  294: "NORMSDIST",
  295: "NORMINV",
  296: "NORMSINV",
  297: "STANDARDIZE",
  298: "ODD",
  299: "PERMUT",
  300: "POISSON",
  301: "TDIST",
  302: "WEIBULL",
  303: "SUMXMY2",
  304: "SUMX2MY2",
  305: "SUMX2PY2",
  306: "CHITEST",
  307: "CORREL",
  308: "COVAR",
  309: "FORECAST",
  310: "FTEST",
  311: "INTERCEPT",
  312: "PEARSON",
  313: "RSQ",
  314: "STEYX",
  315: "SLOPE",
  316: "TTEST",
  317: "PROB",
  318: "DEVSQ",
  319: "GEOMEAN",
  320: "HARMEAN",
  321: "SUMSQ",
  322: "KURT",
  323: "SKEW",
  324: "ZTEST",
  325: "LARGE",
  326: "SMALL",
  327: "QUARTILE",
  328: "PERCENTILE",
  329: "PERCENTRANK",
  330: "MODE",
  331: "TRIMMEAN",
  332: "TINV",
  334: "MOVIE.COMMAND",
  335: "GET.MOVIE",
  336: "CONCATENATE",
  337: "POWER",
  338: "PIVOT.ADD.DATA",
  339: "GET.PIVOT.TABLE",
  340: "GET.PIVOT.FIELD",
  341: "GET.PIVOT.ITEM",
  342: "RADIANS",
  343: "DEGREES",
  344: "SUBTOTAL",
  345: "SUMIF",
  346: "COUNTIF",
  347: "COUNTBLANK",
  348: "SCENARIO.GET",
  349: "OPTIONS.LISTS.GET",
  350: "ISPMT",
  351: "DATEDIF",
  352: "DATESTRING",
  353: "NUMBERSTRING",
  354: "ROMAN",
  355: "OPEN.DIALOG",
  356: "SAVE.DIALOG",
  357: "VIEW.GET",
  358: "GETPIVOTDATA",
  359: "HYPERLINK",
  360: "PHONETIC",
  361: "AVERAGEA",
  362: "MAXA",
  363: "MINA",
  364: "STDEVPA",
  365: "VARPA",
  366: "STDEVA",
  367: "VARA",
  368: "BAHTTEXT",
  369: "THAIDAYOFWEEK",
  370: "THAIDIGIT",
  371: "THAIMONTHOFYEAR",
  372: "THAINUMSOUND",
  373: "THAINUMSTRING",
  374: "THAISTRINGLENGTH",
  375: "ISTHAIDIGIT",
  376: "ROUNDBAHTDOWN",
  377: "ROUNDBAHTUP",
  378: "THAIYEAR",
  379: "RTD",
  380: "CUBEVALUE",
  381: "CUBEMEMBER",
  382: "CUBEMEMBERPROPERTY",
  383: "CUBERANKEDMEMBER",
  384: "HEX2BIN",
  385: "HEX2DEC",
  386: "HEX2OCT",
  387: "DEC2BIN",
  388: "DEC2HEX",
  389: "DEC2OCT",
  390: "OCT2BIN",
  391: "OCT2HEX",
  392: "OCT2DEC",
  393: "BIN2DEC",
  394: "BIN2OCT",
  395: "BIN2HEX",
  396: "IMSUB",
  397: "IMDIV",
  398: "IMPOWER",
  399: "IMABS",
  400: "IMSQRT",
  401: "IMLN",
  402: "IMLOG2",
  403: "IMLOG10",
  404: "IMSIN",
  405: "IMCOS",
  406: "IMEXP",
  407: "IMARGUMENT",
  408: "IMCONJUGATE",
  409: "IMAGINARY",
  410: "IMREAL",
  411: "COMPLEX",
  412: "IMSUM",
  413: "IMPRODUCT",
  414: "SERIESSUM",
  415: "FACTDOUBLE",
  416: "SQRTPI",
  417: "QUOTIENT",
  418: "DELTA",
  419: "GESTEP",
  420: "ISEVEN",
  421: "ISODD",
  422: "MROUND",
  423: "ERF",
  424: "ERFC",
  425: "BESSELJ",
  426: "BESSELK",
  427: "BESSELY",
  428: "BESSELI",
  429: "XIRR",
  430: "XNPV",
  431: "PRICEMAT",
  432: "YIELDMAT",
  433: "INTRATE",
  434: "RECEIVED",
  435: "DISC",
  436: "PRICEDISC",
  437: "YIELDDISC",
  438: "TBILLEQ",
  439: "TBILLPRICE",
  440: "TBILLYIELD",
  441: "PRICE",
  442: "YIELD",
  443: "DOLLARDE",
  444: "DOLLARFR",
  445: "NOMINAL",
  446: "EFFECT",
  447: "CUMPRINC",
  448: "CUMIPMT",
  449: "EDATE",
  450: "EOMONTH",
  451: "YEARFRAC",
  452: "COUPDAYBS",
  453: "COUPDAYS",
  454: "COUPDAYSNC",
  455: "COUPNCD",
  456: "COUPNUM",
  457: "COUPPCD",
  458: "DURATION",
  459: "MDURATION",
  460: "ODDLPRICE",
  461: "ODDLYIELD",
  462: "ODDFPRICE",
  463: "ODDFYIELD",
  464: "RANDBETWEEN",
  465: "WEEKNUM",
  466: "AMORDEGRC",
  467: "AMORLINC",
  468: "CONVERT",
  724: "SHEETJS",
  469: "ACCRINT",
  470: "ACCRINTM",
  471: "WORKDAY",
  472: "NETWORKDAYS",
  473: "GCD",
  474: "MULTINOMIAL",
  475: "LCM",
  476: "FVSCHEDULE",
  477: "CUBEKPIMEMBER",
  478: "CUBESET",
  479: "CUBESETCOUNT",
  480: "IFERROR",
  481: "COUNTIFS",
  482: "SUMIFS",
  483: "AVERAGEIF",
  484: "AVERAGEIFS"
}, yk = {
  2: 1,
  3: 1,
  10: 0,
  15: 1,
  16: 1,
  17: 1,
  18: 1,
  19: 0,
  20: 1,
  21: 1,
  22: 1,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 2,
  30: 2,
  31: 3,
  32: 1,
  33: 1,
  34: 0,
  35: 0,
  38: 1,
  39: 2,
  40: 3,
  41: 3,
  42: 3,
  43: 3,
  44: 3,
  45: 3,
  47: 3,
  48: 2,
  53: 1,
  61: 3,
  63: 0,
  65: 3,
  66: 3,
  67: 1,
  68: 1,
  69: 1,
  70: 1,
  71: 1,
  72: 1,
  73: 1,
  74: 0,
  75: 1,
  76: 1,
  77: 1,
  79: 2,
  80: 2,
  83: 1,
  85: 0,
  86: 1,
  89: 0,
  90: 1,
  94: 0,
  95: 0,
  97: 2,
  98: 1,
  99: 1,
  101: 3,
  102: 3,
  105: 1,
  106: 1,
  108: 2,
  111: 1,
  112: 1,
  113: 1,
  114: 1,
  117: 2,
  118: 1,
  119: 4,
  121: 1,
  126: 1,
  127: 1,
  128: 1,
  129: 1,
  130: 1,
  131: 1,
  133: 1,
  134: 1,
  135: 1,
  136: 2,
  137: 2,
  138: 2,
  140: 1,
  141: 1,
  142: 3,
  143: 4,
  144: 4,
  161: 1,
  162: 1,
  163: 1,
  164: 1,
  165: 2,
  172: 1,
  175: 2,
  176: 2,
  177: 3,
  178: 2,
  179: 1,
  184: 1,
  186: 1,
  189: 3,
  190: 1,
  195: 3,
  196: 3,
  197: 1,
  198: 1,
  199: 3,
  201: 1,
  207: 4,
  210: 3,
  211: 1,
  212: 2,
  213: 2,
  214: 1,
  215: 1,
  225: 0,
  229: 1,
  230: 1,
  231: 1,
  232: 1,
  233: 1,
  234: 1,
  235: 3,
  244: 1,
  247: 4,
  252: 2,
  257: 1,
  261: 1,
  271: 1,
  273: 4,
  274: 2,
  275: 2,
  276: 2,
  277: 3,
  278: 3,
  279: 1,
  280: 3,
  281: 3,
  282: 3,
  283: 1,
  284: 1,
  285: 2,
  286: 4,
  287: 3,
  288: 2,
  289: 4,
  290: 3,
  291: 3,
  292: 3,
  293: 4,
  294: 1,
  295: 3,
  296: 1,
  297: 3,
  298: 1,
  299: 2,
  300: 3,
  301: 3,
  302: 4,
  303: 2,
  304: 2,
  305: 2,
  306: 2,
  307: 2,
  308: 2,
  309: 3,
  310: 2,
  311: 2,
  312: 2,
  313: 2,
  314: 2,
  315: 2,
  316: 4,
  325: 2,
  326: 2,
  327: 2,
  328: 2,
  331: 2,
  332: 2,
  337: 2,
  342: 1,
  343: 1,
  346: 2,
  347: 1,
  350: 4,
  351: 3,
  352: 1,
  353: 2,
  360: 1,
  368: 1,
  369: 1,
  370: 1,
  371: 1,
  372: 1,
  373: 1,
  374: 1,
  375: 1,
  376: 1,
  377: 1,
  378: 1,
  382: 3,
  385: 1,
  392: 1,
  393: 1,
  396: 2,
  397: 2,
  398: 2,
  399: 1,
  400: 1,
  401: 1,
  402: 1,
  403: 1,
  404: 1,
  405: 1,
  406: 1,
  407: 1,
  408: 1,
  409: 1,
  410: 1,
  414: 4,
  415: 1,
  416: 1,
  417: 2,
  420: 1,
  421: 1,
  422: 2,
  424: 1,
  425: 2,
  426: 2,
  427: 2,
  428: 2,
  430: 3,
  438: 3,
  439: 3,
  440: 3,
  443: 2,
  444: 2,
  445: 2,
  446: 2,
  447: 6,
  448: 6,
  449: 2,
  450: 2,
  464: 2,
  468: 3,
  476: 2,
  479: 1,
  480: 2,
  65535: 0
};
function Ih(e) {
  return e.slice(0, 3) == "of:" && (e = e.slice(3)), e.charCodeAt(0) == 61 && (e = e.slice(1), e.charCodeAt(0) == 61 && (e = e.slice(1))), e = e.replace(/COM\.MICROSOFT\./g, ""), e = e.replace(/\[((?:\.[A-Z]+[0-9]+)(?::\.[A-Z]+[0-9]+)?)\]/g, function(n, r) {
    return r.replace(/\./g, "");
  }), e = e.replace(/\[.(#[A-Z]*[?!])\]/g, "$1"), e.replace(/[;~]/g, ",").replace(/\|/g, ";");
}
function pc(e) {
  var n = e.split(":"), r = n[0].split(".")[0];
  return [r, n[0].split(".")[1] + (n.length > 1 ? ":" + (n[1].split(".")[1] || n[1].split(".")[0]) : "")];
}
var ws = {}, mi = {};
function ys(e, n) {
  if (e) {
    var r = [0.7, 0.7, 0.75, 0.75, 0.3, 0.3];
    n == "xlml" && (r = [1, 1, 1, 1, 0.5, 0.5]), e.left == null && (e.left = r[0]), e.right == null && (e.right = r[1]), e.top == null && (e.top = r[2]), e.bottom == null && (e.bottom = r[3]), e.header == null && (e.header = r[4]), e.footer == null && (e.footer = r[5]);
  }
}
function w1(e, n, r, s, i, o) {
  try {
    s.cellNF && (e.z = $e[n]);
  } catch (u) {
    if (s.WTF) throw u;
  }
  if (!(e.t === "z" && !s.cellStyles)) {
    if (e.t === "d" && typeof e.v == "string" && (e.v = jr(e.v)), (!s || s.cellText !== !1) && e.t !== "z") try {
      if ($e[n] == null && Fa(_g[n] || "General", n), e.t === "e") e.w = e.w || Ma[e.v];
      else if (n === 0)
        if (e.t === "n")
          (e.v | 0) === e.v ? e.w = e.v.toString(10) : e.w = Ts(e.v);
        else if (e.t === "d") {
          var c = dt(e.v);
          (c | 0) === c ? e.w = c.toString(10) : e.w = Ts(c);
        } else {
          if (e.v === void 0) return "";
          e.w = Ra(e.v, mi);
        }
      else e.t === "d" ? e.w = Ut(n, dt(e.v), mi) : e.w = Ut(n, e.v, mi);
    } catch (u) {
      if (s.WTF) throw u;
    }
    if (s.cellStyles && r != null)
      try {
        e.s = o.Fills[r], e.s.fgColor && e.s.fgColor.theme && !e.s.fgColor.rgb && (e.s.fgColor.rgb = fo(i.themeElements.clrScheme[e.s.fgColor.theme].rgb, e.s.fgColor.tint || 0), s.WTF && (e.s.fgColor.raw_rgb = i.themeElements.clrScheme[e.s.fgColor.theme].rgb)), e.s.bgColor && e.s.bgColor.theme && (e.s.bgColor.rgb = fo(i.themeElements.clrScheme[e.s.bgColor.theme].rgb, e.s.bgColor.tint || 0), s.WTF && (e.s.bgColor.raw_rgb = i.themeElements.clrScheme[e.s.bgColor.theme].rgb));
      } catch (u) {
        if (s.WTF && o.Fills) throw u;
      }
  }
}
function _k(e, n) {
  var r = vr(n);
  r.s.r <= r.e.r && r.s.c <= r.e.c && r.s.r >= 0 && r.s.c >= 0 && (e["!ref"] = Je(r));
}
var kk = /<(?:\w:)?mergeCell ref="[A-Z0-9:]+"\s*[\/]?>/g, Ek = /<(?:\w+:)?sheetData[^>]*>([\s\S]*)<\/(?:\w+:)?sheetData>/, Sk = /<(?:\w:)?hyperlink [^>]*>/mg, Tk = /"(\w*:\w*)"/, Ck = /<(?:\w:)?col\b[^>]*[\/]?>/g, Ak = /<(?:\w:)?autoFilter[^>]*([\/]|>([\s\S]*)<\/(?:\w:)?autoFilter)>/g, Fk = /<(?:\w:)?pageMargins[^>]*\/>/g, y1 = /<(?:\w:)?sheetPr\b(?:[^>a-z][^>]*)?\/>/, Nk = /<(?:\w:)?sheetPr[^>]*(?:[\/]|>([\s\S]*)<\/(?:\w:)?sheetPr)>/, Rk = /<(?:\w:)?sheetViews[^>]*(?:[\/]|>([\s\S]*)<\/(?:\w:)?sheetViews)>/;
function Dk(e, n, r, s, i, o, c) {
  if (!e) return e;
  s || (s = { "!id": {} });
  var u = n.dense ? [] : {}, d = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } }, x = "", p = "", g = e.match(Ek);
  g ? (x = e.slice(0, g.index), p = e.slice(g.index + g[0].length)) : x = p = e;
  var w = x.match(y1);
  w ? Zc(w[0], u, i, r) : (w = x.match(Nk)) && Ok(w[0], w[1] || "", u, i, r);
  var k = (x.match(/<(?:\w*:)?dimension/) || { index: -1 }).index;
  if (k > 0) {
    var _ = x.slice(k, k + 50).match(Tk);
    _ && _k(u, _[1]);
  }
  var y = x.match(Rk);
  y && y[1] && Bk(y[1], i);
  var E = [];
  if (n.cellStyles) {
    var A = x.match(Ck);
    A && Ik(E, A);
  }
  g && jk(g[1], u, n, d, o, c);
  var O = p.match(Ak);
  O && (u["!autofilter"] = Lk(O[0]));
  var N = [], V = p.match(kk);
  if (V) for (k = 0; k != V.length; ++k)
    N[k] = vr(V[k].slice(V[k].indexOf('"') + 1));
  var J = p.match(Sk);
  J && Pk(u, J, s);
  var j = p.match(Fk);
  if (j && (u["!margins"] = bk(Ue(j[0]))), !u["!ref"] && d.e.c >= d.s.c && d.e.r >= d.s.r && (u["!ref"] = Je(d)), n.sheetRows > 0 && u["!ref"]) {
    var C = vr(u["!ref"]);
    n.sheetRows <= +C.e.r && (C.e.r = n.sheetRows - 1, C.e.r > d.e.r && (C.e.r = d.e.r), C.e.r < C.s.r && (C.s.r = C.e.r), C.e.c > d.e.c && (C.e.c = d.e.c), C.e.c < C.s.c && (C.s.c = C.e.c), u["!fullref"] = u["!ref"], u["!ref"] = Je(C));
  }
  return E.length > 0 && (u["!cols"] = E), N.length > 0 && (u["!merges"] = N), u;
}
function Zc(e, n, r, s) {
  var i = Ue(e);
  r.Sheets[s] || (r.Sheets[s] = {}), i.codeName && (r.Sheets[s].CodeName = er(lr(i.codeName)));
}
function Ok(e, n, r, s, i) {
  Zc(e.slice(0, e.indexOf(">")), r, s, i);
}
function Pk(e, n, r) {
  for (var s = Array.isArray(e), i = 0; i != n.length; ++i) {
    var o = Ue(lr(n[i]), !0);
    if (!o.ref) return;
    var c = ((r || {})["!id"] || [])[o.id];
    c ? (o.Target = c.Target, o.location && (o.Target += "#" + er(o.location))) : (o.Target = "#" + er(o.location), c = { Target: o.Target, TargetMode: "Internal" }), o.Rel = c, o.tooltip && (o.Tooltip = o.tooltip, delete o.tooltip);
    for (var u = vr(o.ref), d = u.s.r; d <= u.e.r; ++d) for (var x = u.s.c; x <= u.e.c; ++x) {
      var p = Ge({ c: x, r: d });
      s ? (e[d] || (e[d] = []), e[d][x] || (e[d][x] = { t: "z", v: void 0 }), e[d][x].l = o) : (e[p] || (e[p] = { t: "z", v: void 0 }), e[p].l = o);
    }
  }
}
function bk(e) {
  var n = {};
  return ["left", "right", "top", "bottom", "header", "footer"].forEach(function(r) {
    e[r] && (n[r] = parseFloat(e[r]));
  }), n;
}
function Ik(e, n) {
  for (var r = !1, s = 0; s != n.length; ++s) {
    var i = Ue(n[s], !0);
    i.hidden && (i.hidden = dr(i.hidden));
    var o = parseInt(i.min, 10) - 1, c = parseInt(i.max, 10) - 1;
    for (i.outlineLevel && (i.level = +i.outlineLevel || 0), delete i.min, delete i.max, i.width = +i.width, !r && i.width && (r = !0, qc(i.width)), vi(i); o <= c; ) e[o++] = Vr(i);
  }
}
function Lk(e) {
  var n = { ref: (e.match(/ref="([^"]*)"/) || [])[1] };
  return n;
}
var Mk = /<(?:\w:)?sheetView(?:[^>a-z][^>]*)?\/?>/;
function Bk(e, n) {
  n.Views || (n.Views = [{}]), (e.match(Mk) || []).forEach(function(r, s) {
    var i = Ue(r);
    n.Views[s] || (n.Views[s] = {}), +i.zoomScale && (n.Views[s].zoom = +i.zoomScale), dr(i.rightToLeft) && (n.Views[s].RTL = !0);
  });
}
var jk = /* @__PURE__ */ (function() {
  var e = /<(?:\w+:)?c[ \/>]/, n = /<\/(?:\w+:)?row>/, r = /r=["']([^"']*)["']/, s = /<(?:\w+:)?is>([\S\s]*?)<\/(?:\w+:)?is>/, i = /ref=["']([^"']*)["']/, o = Cs("v"), c = Cs("f");
  return function(d, x, p, g, w, k) {
    for (var _ = 0, y = "", E = [], A = [], O = 0, N = 0, V = 0, J = "", j, C, G = 0, B = 0, le, re, Q = 0, pe = 0, Ce = Array.isArray(k.CellXf), xe, we = [], ye = [], ge = Array.isArray(x), Y = [], he = {}, U = !1, F = !!p.sheetStubs, X = d.split(n), z = 0, H = X.length; z != H; ++z) {
      y = X[z].trim();
      var ue = y.length;
      if (ue !== 0) {
        var K = 0;
        e: for (_ = 0; _ < ue; ++_) switch (
          /*x.charCodeAt(ri)*/
          y[_]
        ) {
          case ">":
            if (
              /*x.charCodeAt(ri-1) != 47*/
              y[_ - 1] != "/"
            ) {
              ++_;
              break e;
            }
            if (p && p.cellStyles) {
              if (C = Ue(y.slice(K, _), !0), G = C.r != null ? parseInt(C.r, 10) : G + 1, B = -1, p.sheetRows && p.sheetRows < G) continue;
              he = {}, U = !1, C.ht && (U = !0, he.hpt = parseFloat(C.ht), he.hpx = Rs(he.hpt)), C.hidden == "1" && (U = !0, he.hidden = !0), C.outlineLevel != null && (U = !0, he.level = +C.outlineLevel), U && (Y[G - 1] = he);
            }
            break;
          case "<":
            K = _;
            break;
        }
        if (K >= _) break;
        if (C = Ue(y.slice(K, _), !0), G = C.r != null ? parseInt(C.r, 10) : G + 1, B = -1, !(p.sheetRows && p.sheetRows < G)) {
          g.s.r > G - 1 && (g.s.r = G - 1), g.e.r < G - 1 && (g.e.r = G - 1), p && p.cellStyles && (he = {}, U = !1, C.ht && (U = !0, he.hpt = parseFloat(C.ht), he.hpx = Rs(he.hpt)), C.hidden == "1" && (U = !0, he.hidden = !0), C.outlineLevel != null && (U = !0, he.level = +C.outlineLevel), U && (Y[G - 1] = he)), E = y.slice(_).split(e);
          for (var te = 0; te != E.length && E[te].trim().charAt(0) == "<"; ++te) ;
          for (E = E.slice(te), _ = 0; _ != E.length; ++_)
            if (y = E[_].trim(), y.length !== 0) {
              if (A = y.match(r), O = _, N = 0, V = 0, y = "<c " + (y.slice(0, 1) == "<" ? ">" : "") + y, A != null && A.length === 2) {
                for (O = 0, J = A[1], N = 0; N != J.length && !((V = J.charCodeAt(N) - 64) < 1 || V > 26); ++N)
                  O = 26 * O + V;
                --O, B = O;
              } else ++B;
              for (N = 0; N != y.length && y.charCodeAt(N) !== 62; ++N) ;
              if (++N, C = Ue(y.slice(0, N), !0), C.r || (C.r = Ge({ r: G - 1, c: B })), J = y.slice(N), j = { t: "" }, (A = J.match(o)) != null && /*::cref != null && */
              A[1] !== "" && (j.v = er(A[1])), p.cellFormula) {
                if ((A = J.match(c)) != null && /*::cref != null && */
                A[1] !== "") {
                  if (j.f = er(lr(A[1])).replace(/\r\n/g, `
`), p.xlfn || (j.f = Dh(j.f)), /*::cref != null && cref[0] != null && */
                  A[0].indexOf('t="array"') > -1)
                    j.F = (J.match(i) || [])[1], j.F.indexOf(":") > -1 && we.push([vr(j.F), j.F]);
                  else if (
                    /*::cref != null && cref[0] != null && */
                    A[0].indexOf('t="shared"') > -1
                  ) {
                    re = Ue(A[0]);
                    var Z = er(lr(A[1]));
                    p.xlfn || (Z = Dh(Z)), ye[parseInt(re.si, 10)] = [re, Z, C.r];
                  }
                } else (A = J.match(/<f[^>]*\/>/)) && (re = Ue(A[0]), ye[re.si] && (j.f = Qy(ye[re.si][1], ye[re.si][2], C.r)));
                var fe = ut(C.r);
                for (N = 0; N < we.length; ++N)
                  fe.r >= we[N][0].s.r && fe.r <= we[N][0].e.r && fe.c >= we[N][0].s.c && fe.c <= we[N][0].e.c && (j.F = we[N][1]);
              }
              if (C.t == null && j.v === void 0)
                if (j.f || j.F)
                  j.v = 0, j.t = "n";
                else if (F) j.t = "z";
                else continue;
              else j.t = C.t || "n";
              switch (g.s.c > B && (g.s.c = B), g.e.c < B && (g.e.c = B), j.t) {
                case "n":
                  if (j.v == "" || j.v == null) {
                    if (!F) continue;
                    j.t = "z";
                  } else j.v = parseFloat(j.v);
                  break;
                case "s":
                  if (typeof j.v > "u") {
                    if (!F) continue;
                    j.t = "z";
                  } else
                    le = ws[parseInt(j.v, 10)], j.v = le.t, j.r = le.r, p.cellHTML && (j.h = le.h);
                  break;
                case "str":
                  j.t = "s", j.v = j.v != null ? lr(j.v) : "", p.cellHTML && (j.h = Uc(j.v));
                  break;
                case "inlineStr":
                  A = J.match(s), j.t = "s", A != null && (le = Qc(A[1])) ? (j.v = le.t, p.cellHTML && (j.h = le.h)) : j.v = "";
                  break;
                case "b":
                  j.v = dr(j.v);
                  break;
                case "d":
                  p.cellDates ? j.v = jr(j.v, 1) : (j.v = dt(jr(j.v, 1)), j.t = "n");
                  break;
                /* error string in .w, number in .v */
                case "e":
                  (!p || p.cellText !== !1) && (j.w = j.v), j.v = zp[j.v];
                  break;
              }
              if (Q = pe = 0, xe = null, Ce && C.s !== void 0 && (xe = k.CellXf[C.s], xe != null && (xe.numFmtId != null && (Q = xe.numFmtId), p.cellStyles && xe.fillId != null && (pe = xe.fillId))), w1(j, Q, pe, p, w, k), p.cellDates && Ce && j.t == "n" && wi($e[Q]) && (j.t = "d", j.v = go(j.v)), C.cm && p.xlmeta) {
                var Pe = (p.xlmeta.Cell || [])[+C.cm - 1];
                Pe && Pe.type == "XLDAPR" && (j.D = !0);
              }
              if (ge) {
                var P = ut(C.r);
                x[P.r] || (x[P.r] = []), x[P.r][P.c] = j;
              } else x[C.r] = j;
            }
        }
      }
    }
    Y.length > 0 && (x["!rows"] = Y);
  };
})();
function Uk(e, n) {
  var r = {}, s = e.l + n;
  r.r = e.read_shift(4), e.l += 4;
  var i = e.read_shift(2);
  e.l += 1;
  var o = e.read_shift(1);
  return e.l = s, o & 7 && (r.level = o & 7), o & 16 && (r.hidden = !0), o & 32 && (r.hpt = i / 20), r;
}
var zk = La;
function Hk() {
}
function Vk(e, n) {
  var r = {}, s = e[e.l];
  return ++e.l, r.above = !(s & 64), r.left = !(s & 128), e.l += 18, r.name = fv(e), r;
}
function Wk(e) {
  var n = zt(e);
  return [n];
}
function Gk(e) {
  var n = Ia(e);
  return [n];
}
function $k(e) {
  var n = zt(e), r = e.read_shift(1);
  return [n, r, "b"];
}
function Kk(e) {
  var n = Ia(e), r = e.read_shift(1);
  return [n, r, "b"];
}
function Xk(e) {
  var n = zt(e), r = e.read_shift(1);
  return [n, r, "e"];
}
function Yk(e) {
  var n = Ia(e), r = e.read_shift(1);
  return [n, r, "e"];
}
function Qk(e) {
  var n = zt(e), r = e.read_shift(4);
  return [n, r, "s"];
}
function qk(e) {
  var n = Ia(e), r = e.read_shift(4);
  return [n, r, "s"];
}
function Jk(e) {
  var n = zt(e), r = rt(e);
  return [n, r, "n"];
}
function _1(e) {
  var n = Ia(e), r = rt(e);
  return [n, r, "n"];
}
function Zk(e) {
  var n = zt(e), r = Kc(e);
  return [n, r, "n"];
}
function eE(e) {
  var n = Ia(e), r = Kc(e);
  return [n, r, "n"];
}
function rE(e) {
  var n = zt(e), r = Gc(e);
  return [n, r, "is"];
}
function tE(e) {
  var n = zt(e), r = nt(e);
  return [n, r, "str"];
}
function nE(e) {
  var n = Ia(e), r = nt(e);
  return [n, r, "str"];
}
function aE(e, n, r) {
  var s = e.l + n, i = zt(e);
  i.r = r["!row"];
  var o = e.read_shift(1), c = [i, o, "b"];
  if (r.cellFormula) {
    e.l += 2;
    var u = yo(e, s - e.l, r);
    c[3] = et(u, null, i, r.supbooks, r);
  } else e.l = s;
  return c;
}
function iE(e, n, r) {
  var s = e.l + n, i = zt(e);
  i.r = r["!row"];
  var o = e.read_shift(1), c = [i, o, "e"];
  if (r.cellFormula) {
    e.l += 2;
    var u = yo(e, s - e.l, r);
    c[3] = et(u, null, i, r.supbooks, r);
  } else e.l = s;
  return c;
}
function sE(e, n, r) {
  var s = e.l + n, i = zt(e);
  i.r = r["!row"];
  var o = rt(e), c = [i, o, "n"];
  if (r.cellFormula) {
    e.l += 2;
    var u = yo(e, s - e.l, r);
    c[3] = et(u, null, i, r.supbooks, r);
  } else e.l = s;
  return c;
}
function lE(e, n, r) {
  var s = e.l + n, i = zt(e);
  i.r = r["!row"];
  var o = nt(e), c = [i, o, "str"];
  if (r.cellFormula) {
    e.l += 2;
    var u = yo(e, s - e.l, r);
    c[3] = et(u, null, i, r.supbooks, r);
  } else e.l = s;
  return c;
}
var oE = La;
function cE(e, n) {
  var r = e.l + n, s = La(e), i = $c(e), o = nt(e), c = nt(e), u = nt(e);
  e.l = r;
  var d = { rfx: s, relId: i, loc: o, display: u };
  return c && (d.Tooltip = c), d;
}
function uE() {
}
function fE(e, n, r) {
  var s = e.l + n, i = Bp(e), o = e.read_shift(1), c = [i];
  if (c[2] = o, r.cellFormula) {
    var u = mk(e, s - e.l, r);
    c[1] = u;
  } else e.l = s;
  return c;
}
function dE(e, n, r) {
  var s = e.l + n, i = La(e), o = [i];
  if (r.cellFormula) {
    var c = vk(e, s - e.l, r);
    o[1] = c, e.l = s;
  } else e.l = s;
  return o;
}
var hE = ["left", "right", "top", "bottom", "header", "footer"];
function pE(e) {
  var n = {};
  return hE.forEach(function(r) {
    n[r] = rt(e);
  }), n;
}
function xE(e) {
  var n = e.read_shift(2);
  return e.l += 28, { RTL: n & 32 };
}
function mE() {
}
function gE() {
}
function vE(e, n, r, s, i, o, c) {
  if (!e) return e;
  var u = n || {};
  s || (s = { "!id": {} });
  var d = u.dense ? [] : {}, x, p = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } }, g = !1, w = !1, k, _, y, E, A, O, N, V, J, j = [];
  u.biff = 12, u["!row"] = 0;
  var C = 0, G = !1, B = [], le = {}, re = u.supbooks || /*::(*/
  i.supbooks || [[]];
  if (re.sharedf = le, re.arrayf = B, re.SheetNames = i.SheetNames || i.Sheets.map(function(ge) {
    return ge.name;
  }), !u.supbooks && (u.supbooks = re, i.Names))
    for (var Q = 0; Q < i.Names.length; ++Q) re[0][Q + 1] = i.Names[Q];
  var pe = [], Ce = [], xe = !1;
  xo[16] = { n: "BrtShortReal", f: _1 };
  var we;
  if (Dn(e, function(Y, he, U) {
    if (!w)
      switch (U) {
        case 148:
          x = Y;
          break;
        case 0:
          k = Y, u.sheetRows && u.sheetRows <= k.r && (w = !0), V = Wr(E = k.r), u["!row"] = k.r, (Y.hidden || Y.hpt || Y.level != null) && (Y.hpt && (Y.hpx = Rs(Y.hpt)), Ce[Y.r] = Y);
          break;
        case 2:
        /* 'BrtCellRk' */
        case 3:
        /* 'BrtCellError' */
        case 4:
        /* 'BrtCellBool' */
        case 5:
        /* 'BrtCellReal' */
        case 6:
        /* 'BrtCellSt' */
        case 7:
        /* 'BrtCellIsst' */
        case 8:
        /* 'BrtFmlaString' */
        case 9:
        /* 'BrtFmlaNum' */
        case 10:
        /* 'BrtFmlaBool' */
        case 11:
        /* 'BrtFmlaError' */
        case 13:
        /* 'BrtShortRk' */
        case 14:
        /* 'BrtShortError' */
        case 15:
        /* 'BrtShortBool' */
        case 16:
        /* 'BrtShortReal' */
        case 17:
        /* 'BrtShortSt' */
        case 18:
        /* 'BrtShortIsst' */
        case 62:
          switch (_ = { t: Y[2] }, Y[2]) {
            case "n":
              _.v = Y[1];
              break;
            case "s":
              N = ws[Y[1]], _.v = N.t, _.r = N.r;
              break;
            case "b":
              _.v = !!Y[1];
              break;
            case "e":
              _.v = Y[1], u.cellText !== !1 && (_.w = Ma[_.v]);
              break;
            case "str":
              _.t = "s", _.v = Y[1];
              break;
            case "is":
              _.t = "s", _.v = Y[1].t;
              break;
          }
          if ((y = c.CellXf[Y[0].iStyleRef]) && w1(_, y.numFmtId, null, u, o, c), A = Y[0].c == -1 ? A + 1 : Y[0].c, u.dense ? (d[E] || (d[E] = []), d[E][A] = _) : d[Or(A) + V] = _, u.cellFormula) {
            for (G = !1, C = 0; C < B.length; ++C) {
              var F = B[C];
              k.r >= F[0].s.r && k.r <= F[0].e.r && A >= F[0].s.c && A <= F[0].e.c && (_.F = Je(F[0]), G = !0);
            }
            !G && Y.length > 3 && (_.f = Y[3]);
          }
          if (p.s.r > k.r && (p.s.r = k.r), p.s.c > A && (p.s.c = A), p.e.r < k.r && (p.e.r = k.r), p.e.c < A && (p.e.c = A), u.cellDates && y && _.t == "n" && wi($e[y.numFmtId])) {
            var X = Ta(_.v);
            X && (_.t = "d", _.v = new Date(X.y, X.m - 1, X.d, X.H, X.M, X.S, X.u));
          }
          we && (we.type == "XLDAPR" && (_.D = !0), we = void 0);
          break;
        case 1:
        /* 'BrtCellBlank' */
        case 12:
          if (!u.sheetStubs || g) break;
          _ = { t: "z", v: void 0 }, A = Y[0].c == -1 ? A + 1 : Y[0].c, u.dense ? (d[E] || (d[E] = []), d[E][A] = _) : d[Or(A) + V] = _, p.s.r > k.r && (p.s.r = k.r), p.s.c > A && (p.s.c = A), p.e.r < k.r && (p.e.r = k.r), p.e.c < A && (p.e.c = A), we && (we.type == "XLDAPR" && (_.D = !0), we = void 0);
          break;
        case 176:
          j.push(Y);
          break;
        case 49:
          we = ((u.xlmeta || {}).Cell || [])[Y - 1];
          break;
        case 494:
          var z = s["!id"][Y.relId];
          for (z ? (Y.Target = z.Target, Y.loc && (Y.Target += "#" + Y.loc), Y.Rel = z) : Y.relId == "" && (Y.Target = "#" + Y.loc), E = Y.rfx.s.r; E <= Y.rfx.e.r; ++E) for (A = Y.rfx.s.c; A <= Y.rfx.e.c; ++A)
            u.dense ? (d[E] || (d[E] = []), d[E][A] || (d[E][A] = { t: "z", v: void 0 }), d[E][A].l = Y) : (O = Ge({ c: A, r: E }), d[O] || (d[O] = { t: "z", v: void 0 }), d[O].l = Y);
          break;
        case 426:
          if (!u.cellFormula) break;
          B.push(Y), J = u.dense ? d[E][A] : d[Or(A) + V], J.f = et(Y[1], p, { r: k.r, c: A }, re, u), J.F = Je(Y[0]);
          break;
        case 427:
          if (!u.cellFormula) break;
          le[Ge(Y[0].s)] = Y[1], J = u.dense ? d[E][A] : d[Or(A) + V], J.f = et(Y[1], p, { r: k.r, c: A }, re, u);
          break;
        /* identical to 'ColInfo' in XLS */
        case 60:
          if (!u.cellStyles) break;
          for (; Y.e >= Y.s; )
            pe[Y.e--] = { width: Y.w / 256, hidden: !!(Y.flags & 1), level: Y.level }, xe || (xe = !0, qc(Y.w / 256)), vi(pe[Y.e + 1]);
          break;
        case 161:
          d["!autofilter"] = { ref: Je(Y) };
          break;
        case 476:
          d["!margins"] = Y;
          break;
        case 147:
          i.Sheets[r] || (i.Sheets[r] = {}), Y.name && (i.Sheets[r].CodeName = Y.name), (Y.above || Y.left) && (d["!outline"] = { above: Y.above, left: Y.left });
          break;
        case 137:
          i.Views || (i.Views = [{}]), i.Views[0] || (i.Views[0] = {}), Y.RTL && (i.Views[0].RTL = !0);
          break;
        case 485:
          break;
        case 64:
        /* 'BrtDVal' */
        case 1053:
          break;
        case 151:
          break;
        case 152:
        /* 'BrtSel' */
        case 175:
        /* 'BrtAFilterDateGroupItem' */
        case 644:
        /* 'BrtActiveX' */
        case 625:
        /* 'BrtBigName' */
        case 562:
        /* 'BrtBkHim' */
        case 396:
        /* 'BrtBrk' */
        case 1112:
        /* 'BrtCFIcon' */
        case 1146:
        /* 'BrtCFRuleExt' */
        case 471:
        /* 'BrtCFVO' */
        case 1050:
        /* 'BrtCFVO14' */
        case 649:
        /* 'BrtCellIgnoreEC' */
        case 1105:
        /* 'BrtCellIgnoreEC14' */
        case 589:
        /* 'BrtCellSmartTagProperty' */
        case 607:
        /* 'BrtCellWatch' */
        case 564:
        /* 'BrtColor' */
        case 1055:
        /* 'BrtColor14' */
        case 168:
        /* 'BrtColorFilter' */
        case 174:
        /* 'BrtCustomFilter' */
        case 1180:
        /* 'BrtCustomFilter14' */
        case 499:
        /* 'BrtDRef' */
        case 507:
        /* 'BrtDXF' */
        case 550:
        /* 'BrtDrawing' */
        case 171:
        /* 'BrtDynamicFilter' */
        case 167:
        /* 'BrtFilter' */
        case 1177:
        /* 'BrtFilter14' */
        case 169:
        /* 'BrtIconFilter' */
        case 1181:
        /* 'BrtIconFilter14' */
        case 551:
        /* 'BrtLegacyDrawing' */
        case 552:
        /* 'BrtLegacyDrawingHF' */
        case 661:
        /* 'BrtListPart' */
        case 639:
        /* 'BrtOleObject' */
        case 478:
        /* 'BrtPageSetup' */
        case 537:
        /* 'BrtPhoneticInfo' */
        case 477:
        /* 'BrtPrintOptions' */
        case 536:
        /* 'BrtRangeProtection' */
        case 1103:
        /* 'BrtRangeProtection14' */
        case 680:
        /* 'BrtRangeProtectionIso' */
        case 1104:
        /* 'BrtRangeProtectionIso14' */
        case 1024:
        /* 'BrtRwDescent' */
        case 663:
        /* 'BrtSheetCalcProp' */
        case 535:
        /* 'BrtSheetProtection' */
        case 678:
        /* 'BrtSheetProtectionIso' */
        case 504:
        /* 'BrtSlc' */
        case 1043:
        /* 'BrtSparkline' */
        case 428:
        /* 'BrtTable' */
        case 170:
        /* 'BrtTop10Filter' */
        case 3072:
        /* 'BrtUid' */
        case 50:
        /* 'BrtValueMeta' */
        case 2070:
        /* 'BrtWebExtension' */
        case 1045:
          break;
        case 35:
          g = !0;
          break;
        case 36:
          g = !1;
          break;
        case 37:
          g = !0;
          break;
        case 38:
          g = !1;
          break;
        default:
          if (!he.T) {
            if (!g || u.WTF) throw new Error("Unexpected record 0x" + U.toString(16));
          }
      }
  }, u), delete u.supbooks, delete u["!row"], !d["!ref"] && (p.s.r < 2e6 || x && (x.e.r > 0 || x.e.c > 0 || x.s.r > 0 || x.s.c > 0)) && (d["!ref"] = Je(x || p)), u.sheetRows && d["!ref"]) {
    var ye = vr(d["!ref"]);
    u.sheetRows <= +ye.e.r && (ye.e.r = u.sheetRows - 1, ye.e.r > p.e.r && (ye.e.r = p.e.r), ye.e.r < ye.s.r && (ye.s.r = ye.e.r), ye.e.c > p.e.c && (ye.e.c = p.e.c), ye.e.c < ye.s.c && (ye.s.c = ye.e.c), d["!fullref"] = d["!ref"], d["!ref"] = Je(ye));
  }
  return j.length > 0 && (d["!merges"] = j), pe.length > 0 && (d["!cols"] = pe), Ce.length > 0 && (d["!rows"] = Ce), d;
}
function wE(e) {
  var n = [], r = e.match(/^<c:numCache>/), s;
  (e.match(/<c:pt idx="(\d*)">(.*?)<\/c:pt>/mg) || []).forEach(function(o) {
    var c = o.match(/<c:pt idx="(\d*?)"><c:v>(.*)<\/c:v><\/c:pt>/);
    c && (n[+c[1]] = r ? +c[2] : c[2]);
  });
  var i = er((e.match(/<c:formatCode>([\s\S]*?)<\/c:formatCode>/) || ["", "General"])[1]);
  return (e.match(/<c:f>(.*?)<\/c:f>/mg) || []).forEach(function(o) {
    s = o.replace(/<.*?>/g, "");
  }), [n, i, s];
}
function yE(e, n, r, s, i, o) {
  var c = o || { "!type": "chart" };
  if (!e) return o;
  var u = 0, d = 0, x = "A", p = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } };
  return (e.match(/<c:numCache>[\s\S]*?<\/c:numCache>/gm) || []).forEach(function(g) {
    var w = wE(g);
    p.s.r = p.s.c = 0, p.e.c = u, x = Or(u), w[0].forEach(function(k, _) {
      c[x + Wr(_)] = { t: "n", v: k, z: w[1] }, d = _;
    }), p.e.r < d && (p.e.r = d), ++u;
  }), u > 0 && (c["!ref"] = Je(p)), c;
}
function _E(e, n, r, s, i) {
  if (!e) return e;
  s || (s = { "!id": {} });
  var o = { "!type": "chart", "!drawel": null, "!rel": "" }, c, u = e.match(y1);
  return u && Zc(u[0], o, i, r), (c = e.match(/drawing r:id="(.*?)"/)) && (o["!rel"] = c[1]), s["!id"][o["!rel"]] && (o["!drawel"] = s["!id"][o["!rel"]]), o;
}
function kE(e, n) {
  e.l += 10;
  var r = nt(e);
  return { name: r };
}
function EE(e, n, r, s, i) {
  if (!e) return e;
  s || (s = { "!id": {} });
  var o = { "!type": "chart", "!drawel": null, "!rel": "" }, c = !1;
  return Dn(e, function(d, x, p) {
    switch (p) {
      case 550:
        o["!rel"] = d;
        break;
      case 651:
        i.Sheets[r] || (i.Sheets[r] = {}), d.name && (i.Sheets[r].CodeName = d.name);
        break;
      case 562:
      /* 'BrtBkHim' */
      case 652:
      /* 'BrtCsPageSetup' */
      case 669:
      /* 'BrtCsProtection' */
      case 679:
      /* 'BrtCsProtectionIso' */
      case 551:
      /* 'BrtLegacyDrawing' */
      case 552:
      /* 'BrtLegacyDrawingHF' */
      case 476:
      /* 'BrtMargins' */
      case 3072:
        break;
      case 35:
        c = !0;
        break;
      case 36:
        c = !1;
        break;
      case 37:
        break;
      case 38:
        break;
      default:
        if (!(x.T > 0)) {
          if (!(x.T < 0)) {
            if (!c || n.WTF) throw new Error("Unexpected record 0x" + p.toString(16));
          }
        }
    }
  }, n), s["!id"][o["!rel"]] && (o["!drawel"] = s["!id"][o["!rel"]]), o;
}
var k1 = [
  ["allowRefreshQuery", !1, "bool"],
  ["autoCompressPictures", !0, "bool"],
  ["backupFile", !1, "bool"],
  ["checkCompatibility", !1, "bool"],
  ["CodeName", ""],
  ["date1904", !1, "bool"],
  ["defaultThemeVersion", 0, "int"],
  ["filterPrivacy", !1, "bool"],
  ["hidePivotFieldList", !1, "bool"],
  ["promptedSolutions", !1, "bool"],
  ["publishItems", !1, "bool"],
  ["refreshAllConnections", !1, "bool"],
  ["saveExternalLinkValues", !0, "bool"],
  ["showBorderUnselectedTables", !0, "bool"],
  ["showInkAnnotation", !0, "bool"],
  ["showObjects", "all"],
  ["showPivotChartFilter", !1, "bool"],
  ["updateLinks", "userSet"]
], SE = [
  ["activeTab", 0, "int"],
  ["autoFilterDateGrouping", !0, "bool"],
  ["firstSheet", 0, "int"],
  ["minimized", !1, "bool"],
  ["showHorizontalScroll", !0, "bool"],
  ["showSheetTabs", !0, "bool"],
  ["showVerticalScroll", !0, "bool"],
  ["tabRatio", 600, "int"],
  ["visibility", "visible"]
  //window{Height,Width}, {x,y}Window
], TE = [
  //['state', 'visible']
], CE = [
  ["calcCompleted", "true"],
  ["calcMode", "auto"],
  ["calcOnSave", "true"],
  ["concurrentCalc", "true"],
  ["fullCalcOnLoad", "false"],
  ["fullPrecision", "true"],
  ["iterate", "false"],
  ["iterateCount", "100"],
  ["iterateDelta", "0.001"],
  ["refMode", "A1"]
];
function Lh(e, n) {
  for (var r = 0; r != e.length; ++r)
    for (var s = e[r], i = 0; i != n.length; ++i) {
      var o = n[i];
      if (s[o[0]] == null) s[o[0]] = o[1];
      else switch (o[2]) {
        case "bool":
          typeof s[o[0]] == "string" && (s[o[0]] = dr(s[o[0]]));
          break;
        case "int":
          typeof s[o[0]] == "string" && (s[o[0]] = parseInt(s[o[0]], 10));
          break;
      }
    }
}
function Mh(e, n) {
  for (var r = 0; r != n.length; ++r) {
    var s = n[r];
    if (e[s[0]] == null) e[s[0]] = s[1];
    else switch (s[2]) {
      case "bool":
        typeof e[s[0]] == "string" && (e[s[0]] = dr(e[s[0]]));
        break;
      case "int":
        typeof e[s[0]] == "string" && (e[s[0]] = parseInt(e[s[0]], 10));
        break;
    }
  }
}
function E1(e) {
  Mh(e.WBProps, k1), Mh(e.CalcPr, CE), Lh(e.WBView, SE), Lh(e.Sheets, TE), mi.date1904 = dr(e.WBProps.date1904);
}
var AE = /* @__PURE__ */ "][*?/\\".split("");
function FE(e, n) {
  if (e.length > 31)
    throw new Error("Sheet names cannot exceed 31 chars");
  var r = !0;
  return AE.forEach(function(s) {
    if (e.indexOf(s) != -1)
      throw new Error("Sheet name cannot contain : \\ / ? * [ ]");
  }), r;
}
var NE = /<\w+:workbook/;
function RE(e, n) {
  if (!e) throw new Error("Could not find file");
  var r = (
    /*::(*/
    { AppVersion: {}, WBProps: {}, WBView: [], Sheets: [], CalcPr: {}, Names: [], xmlns: "" }
  ), s = !1, i = "xmlns", o = {}, c = 0;
  if (e.replace(it, function(d, x) {
    var p = Ue(d);
    switch (dn(p[0])) {
      case "<?xml":
        break;
      /* 18.2.27 workbook CT_Workbook 1 */
      case "<workbook":
        d.match(NE) && (i = "xmlns" + d.match(/<(\w+):/)[1]), r.xmlns = p[i];
        break;
      case "</workbook>":
        break;
      /* 18.2.13 fileVersion CT_FileVersion ? */
      case "<fileVersion":
        delete p[0], r.AppVersion = p;
        break;
      case "<fileVersion/>":
      case "</fileVersion>":
        break;
      /* 18.2.12 fileSharing CT_FileSharing ? */
      case "<fileSharing":
        break;
      case "<fileSharing/>":
        break;
      /* 18.2.28 workbookPr CT_WorkbookPr ? */
      case "<workbookPr":
      case "<workbookPr/>":
        k1.forEach(function(g) {
          if (p[g[0]] != null)
            switch (g[2]) {
              case "bool":
                r.WBProps[g[0]] = dr(p[g[0]]);
                break;
              case "int":
                r.WBProps[g[0]] = parseInt(p[g[0]], 10);
                break;
              default:
                r.WBProps[g[0]] = p[g[0]];
            }
        }), p.codeName && (r.WBProps.CodeName = lr(p.codeName));
        break;
      case "</workbookPr>":
        break;
      /* 18.2.29 workbookProtection CT_WorkbookProtection ? */
      case "<workbookProtection":
        break;
      case "<workbookProtection/>":
        break;
      /* 18.2.1  bookViews CT_BookViews ? */
      case "<bookViews":
      case "<bookViews>":
      case "</bookViews>":
        break;
      /* 18.2.30   workbookView CT_BookView + */
      case "<workbookView":
      case "<workbookView/>":
        delete p[0], r.WBView.push(p);
        break;
      case "</workbookView>":
        break;
      /* 18.2.20 sheets CT_Sheets 1 */
      case "<sheets":
      case "<sheets>":
      case "</sheets>":
        break;
      // aggregate sheet
      /* 18.2.19   sheet CT_Sheet + */
      case "<sheet":
        switch (p.state) {
          case "hidden":
            p.Hidden = 1;
            break;
          case "veryHidden":
            p.Hidden = 2;
            break;
          default:
            p.Hidden = 0;
        }
        delete p.state, p.name = er(lr(p.name)), delete p[0], r.Sheets.push(p);
        break;
      case "</sheet>":
        break;
      /* 18.2.15 functionGroups CT_FunctionGroups ? */
      case "<functionGroups":
      case "<functionGroups/>":
        break;
      /* 18.2.14   functionGroup CT_FunctionGroup + */
      case "<functionGroup":
        break;
      /* 18.2.9  externalReferences CT_ExternalReferences ? */
      case "<externalReferences":
      case "</externalReferences>":
      case "<externalReferences>":
        break;
      /* 18.2.8    externalReference CT_ExternalReference + */
      case "<externalReference":
        break;
      /* 18.2.6  definedNames CT_DefinedNames ? */
      case "<definedNames/>":
        break;
      case "<definedNames>":
      case "<definedNames":
        s = !0;
        break;
      case "</definedNames>":
        s = !1;
        break;
      /* 18.2.5    definedName CT_DefinedName + */
      case "<definedName":
        o = {}, o.Name = lr(p.name), p.comment && (o.Comment = p.comment), p.localSheetId && (o.Sheet = +p.localSheetId), dr(p.hidden || "0") && (o.Hidden = !0), c = x + d.length;
        break;
      case "</definedName>":
        o.Ref = er(lr(e.slice(c, x))), r.Names.push(o);
        break;
      case "<definedName/>":
        break;
      /* 18.2.2  calcPr CT_CalcPr ? */
      case "<calcPr":
        delete p[0], r.CalcPr = p;
        break;
      case "<calcPr/>":
        delete p[0], r.CalcPr = p;
        break;
      case "</calcPr>":
        break;
      /* 18.2.16 oleSize CT_OleSize ? (ref required) */
      case "<oleSize":
        break;
      /* 18.2.4  customWorkbookViews CT_CustomWorkbookViews ? */
      case "<customWorkbookViews>":
      case "</customWorkbookViews>":
      case "<customWorkbookViews":
        break;
      /* 18.2.3  customWorkbookView CT_CustomWorkbookView + */
      case "<customWorkbookView":
      case "</customWorkbookView>":
        break;
      /* 18.2.18 pivotCaches CT_PivotCaches ? */
      case "<pivotCaches>":
      case "</pivotCaches>":
      case "<pivotCaches":
        break;
      /* 18.2.17 pivotCache CT_PivotCache ? */
      case "<pivotCache":
        break;
      /* 18.2.21 smartTagPr CT_SmartTagPr ? */
      case "<smartTagPr":
      case "<smartTagPr/>":
        break;
      /* 18.2.23 smartTagTypes CT_SmartTagTypes ? */
      case "<smartTagTypes":
      case "<smartTagTypes>":
      case "</smartTagTypes>":
        break;
      /* 18.2.22 smartTagType CT_SmartTagType ? */
      case "<smartTagType":
        break;
      /* 18.2.24 webPublishing CT_WebPublishing ? */
      case "<webPublishing":
      case "<webPublishing/>":
        break;
      /* 18.2.11 fileRecoveryPr CT_FileRecoveryPr ? */
      case "<fileRecoveryPr":
      case "<fileRecoveryPr/>":
        break;
      /* 18.2.26 webPublishObjects CT_WebPublishObjects ? */
      case "<webPublishObjects>":
      case "<webPublishObjects":
      case "</webPublishObjects>":
        break;
      /* 18.2.25 webPublishObject CT_WebPublishObject ? */
      case "<webPublishObject":
        break;
      /* 18.2.10 extLst CT_ExtensionList ? */
      case "<extLst":
      case "<extLst>":
      case "</extLst>":
      case "<extLst/>":
        break;
      /* 18.2.7  ext CT_Extension + */
      case "<ext":
        s = !0;
        break;
      //TODO: check with versions of excel
      case "</ext>":
        s = !1;
        break;
      /* Others */
      case "<ArchID":
        break;
      case "<AlternateContent":
      case "<AlternateContent>":
        s = !0;
        break;
      case "</AlternateContent>":
        s = !1;
        break;
      /* TODO */
      case "<revisionPtr":
        break;
      default:
        if (!s && n.WTF) throw new Error("unrecognized " + p[0] + " in workbook");
    }
    return d;
  }), Xg.indexOf(r.xmlns) === -1) throw new Error("Unknown Namespace: " + r.xmlns);
  return E1(r), r;
}
function DE(e, n) {
  var r = {};
  return r.Hidden = e.read_shift(4), r.iTabID = e.read_shift(4), r.strRelID = _c(e), r.name = nt(e), r;
}
function OE(e, n) {
  var r = {}, s = e.read_shift(4);
  r.defaultThemeVersion = e.read_shift(4);
  var i = n > 8 ? nt(e) : "";
  return i.length > 0 && (r.CodeName = i), r.autoCompressPictures = !!(s & 65536), r.backupFile = !!(s & 64), r.checkCompatibility = !!(s & 4096), r.date1904 = !!(s & 1), r.filterPrivacy = !!(s & 8), r.hidePivotFieldList = !!(s & 1024), r.promptedSolutions = !!(s & 16), r.publishItems = !!(s & 2048), r.refreshAllConnections = !!(s & 262144), r.saveExternalLinkValues = !!(s & 128), r.showBorderUnselectedTables = !!(s & 4), r.showInkAnnotation = !!(s & 32), r.showObjects = ["all", "placeholders", "none"][s >> 13 & 3], r.showPivotChartFilter = !!(s & 32768), r.updateLinks = ["userSet", "never", "always"][s >> 8 & 3], r;
}
function PE(e, n) {
  var r = {};
  return e.read_shift(4), r.ArchID = e.read_shift(4), e.l += n - 8, r;
}
function bE(e, n, r) {
  var s = e.l + n;
  e.l += 4, e.l += 1;
  var i = e.read_shift(4), o = dv(e), c = gk(e, 0, r), u = $c(e);
  e.l = s;
  var d = { Name: o, Ptg: c };
  return i < 268435455 && (d.Sheet = i), u && (d.Comment = u), d;
}
function IE(e, n) {
  var r = { AppVersion: {}, WBProps: {}, WBView: [], Sheets: [], CalcPr: {}, xmlns: "" }, s = [], i = !1;
  n || (n = {}), n.biff = 12;
  var o = [], c = [[]];
  return c.SheetNames = [], c.XTI = [], xo[16] = { n: "BrtFRTArchID$", f: PE }, Dn(e, function(d, x, p) {
    switch (p) {
      case 156:
        c.SheetNames.push(d.name), r.Sheets.push(d);
        break;
      case 153:
        r.WBProps = d;
        break;
      case 39:
        d.Sheet != null && (n.SID = d.Sheet), d.Ref = et(d.Ptg, null, null, c, n), delete n.SID, delete d.Ptg, o.push(d);
        break;
      case 1036:
        break;
      case 357:
      /* 'BrtSupSelf' */
      case 358:
      /* 'BrtSupSame' */
      case 355:
      /* 'BrtSupBookSrc' */
      case 667:
        c[0].length ? c.push([p, d]) : c[0] = [p, d], c[c.length - 1].XTI = [];
        break;
      case 362:
        c.length === 0 && (c[0] = [], c[0].XTI = []), c[c.length - 1].XTI = c[c.length - 1].XTI.concat(d), c.XTI = c.XTI.concat(d);
        break;
      case 361:
        break;
      case 2071:
      /* 'BrtAbsPath15' */
      case 158:
      /* 'BrtBookView' */
      case 143:
      /* 'BrtBeginBundleShs' */
      case 664:
      /* 'BrtBeginFnGroup' */
      case 353:
        break;
      /* case 'BrtModelTimeGroupingCalcCol' */
      case 3072:
      /* 'BrtUid' */
      case 3073:
      /* 'BrtRevisionPtr' */
      case 534:
      /* 'BrtBookProtection' */
      case 677:
      /* 'BrtBookProtectionIso' */
      case 157:
      /* 'BrtCalcProp' */
      case 610:
      /* 'BrtCrashRecErr' */
      case 2050:
      /* 'BrtDecoupledPivotCacheID' */
      case 155:
      /* 'BrtFileRecover' */
      case 548:
      /* 'BrtFileSharing' */
      case 676:
      /* 'BrtFileSharingIso' */
      case 128:
      /* 'BrtFileVersion' */
      case 665:
      /* 'BrtFnGroup' */
      case 2128:
      /* 'BrtModelRelationship' */
      case 2125:
      /* 'BrtModelTable' */
      case 549:
      /* 'BrtOleSize' */
      case 2053:
      /* 'BrtPivotTableRef' */
      case 596:
      /* 'BrtSmartTagType' */
      case 2076:
      /* 'BrtTableSlicerCacheID' */
      case 2075:
      /* 'BrtTableSlicerCacheIDs' */
      case 2082:
      /* 'BrtTimelineCachePivotCacheID' */
      case 397:
      /* 'BrtUserBookView' */
      case 154:
      /* 'BrtWbFactoid' */
      case 1117:
      /* 'BrtWbProp14' */
      case 553:
      /* 'BrtWebOpt' */
      case 2091:
        break;
      case 35:
        s.push(p), i = !0;
        break;
      case 36:
        s.pop(), i = !1;
        break;
      case 37:
        s.push(p), i = !0;
        break;
      case 38:
        s.pop(), i = !1;
        break;
      case 16:
        break;
      default:
        if (!x.T) {
          if (!i || n.WTF && s[s.length - 1] != 37 && s[s.length - 1] != 35) throw new Error("Unexpected record 0x" + p.toString(16));
        }
    }
  }, n), E1(r), r.Names = o, r.supbooks = c, r;
}
function LE(e, n, r) {
  return n.slice(-4) === ".bin" ? IE(e, r) : RE(e, r);
}
function ME(e, n, r, s, i, o, c, u) {
  return n.slice(-4) === ".bin" ? vE(e, s, r, i, o, c, u) : Dk(e, s, r, i, o, c, u);
}
function BE(e, n, r, s, i, o, c, u) {
  return n.slice(-4) === ".bin" ? EE(e, s, r, i, o) : _E(e, s, r, i, o);
}
function jE(e, n, r, s, i, o, c, u) {
  return n.slice(-4) === ".bin" ? Ky() : Xy();
}
function UE(e, n, r, s, i, o, c, u) {
  return n.slice(-4) === ".bin" ? Gy() : $y();
}
function zE(e, n, r, s) {
  return n.slice(-4) === ".bin" ? oy(e, r, s) : ty(e, r, s);
}
function HE(e, n, r) {
  return c1(e, r);
}
function VE(e, n, r) {
  return n.slice(-4) === ".bin" ? Sw(e, r) : kw(e, r);
}
function WE(e, n, r) {
  return n.slice(-4) === ".bin" ? Hy(e, r) : My(e, r);
}
function GE(e, n, r) {
  return n.slice(-4) === ".bin" ? by(e) : Oy(e);
}
function $E(e, n, r, s) {
  return r.slice(-4) === ".bin" ? Iy(e, n, r, s) : void 0;
}
function KE(e, n, r) {
  return n.slice(-4) === ".bin" ? Ry(e, n, r) : Dy(e, n, r);
}
var S1 = /([\w:]+)=((?:")([^"]*)(?:")|(?:')([^']*)(?:'))/g, T1 = /([\w:]+)=((?:")(?:[^"]*)(?:")|(?:')(?:[^']*)(?:'))/;
function Qt(e, n) {
  var r = e.split(/\s+/), s = [];
  if (s[0] = r[0], r.length === 1) return s;
  var i = e.match(S1), o, c, u, d;
  if (i) for (d = 0; d != i.length; ++d)
    o = i[d].match(T1), (c = o[1].indexOf(":")) === -1 ? s[o[1]] = o[2].slice(1, o[2].length - 1) : (o[1].slice(0, 6) === "xmlns:" ? u = "xmlns" + o[1].slice(6) : u = o[1].slice(c + 1), s[u] = o[2].slice(1, o[2].length - 1));
  return s;
}
function XE(e) {
  var n = e.split(/\s+/), r = {};
  if (n.length === 1) return r;
  var s = e.match(S1), i, o, c, u;
  if (s) for (u = 0; u != s.length; ++u)
    i = s[u].match(T1), (o = i[1].indexOf(":")) === -1 ? r[i[1]] = i[2].slice(1, i[2].length - 1) : (i[1].slice(0, 6) === "xmlns:" ? c = "xmlns" + i[1].slice(6) : c = i[1].slice(o + 1), r[c] = i[2].slice(1, i[2].length - 1));
  return r;
}
var _s;
function YE(e, n) {
  var r = _s[e] || er(e);
  return r === "General" ? Ra(n) : Ut(r, n);
}
function QE(e, n, r, s) {
  var i = s;
  switch ((r[0].match(/dt:dt="([\w.]+)"/) || ["", ""])[1]) {
    case "boolean":
      i = dr(s);
      break;
    case "i2":
    case "int":
      i = parseInt(s, 10);
      break;
    case "r4":
    case "float":
      i = parseFloat(s);
      break;
    case "date":
    case "dateTime.tz":
      i = jr(s);
      break;
    case "i8":
    case "string":
    case "fixed":
    case "uuid":
    case "bin.base64":
      break;
    default:
      throw new Error("bad custprop:" + r[0]);
  }
  e[er(n)] = i;
}
function qE(e, n, r) {
  if (e.t !== "z") {
    if (!r || r.cellText !== !1) try {
      e.t === "e" ? e.w = e.w || Ma[e.v] : n === "General" ? e.t === "n" ? (e.v | 0) === e.v ? e.w = e.v.toString(10) : e.w = Ts(e.v) : e.w = Ra(e.v) : e.w = YE(n || "General", e.v);
    } catch (o) {
      if (r.WTF) throw o;
    }
    try {
      var s = _s[n] || n || "General";
      if (r.cellNF && (e.z = s), r.cellDates && e.t == "n" && wi(s)) {
        var i = Ta(e.v);
        i && (e.t = "d", e.v = new Date(i.y, i.m - 1, i.d, i.H, i.M, i.S, i.u));
      }
    } catch (o) {
      if (r.WTF) throw o;
    }
  }
}
function JE(e, n, r) {
  if (r.cellStyles && n.Interior) {
    var s = n.Interior;
    s.Pattern && (s.patternType = Qw[s.Pattern] || s.Pattern);
  }
  e[n.ID] = n;
}
function ZE(e, n, r, s, i, o, c, u, d, x) {
  var p = "General", g = s.StyleID, w = {};
  x = x || {};
  var k = [], _ = 0;
  for (g === void 0 && u && (g = u.StyleID), g === void 0 && c && (g = c.StyleID); o[g] !== void 0 && (o[g].nf && (p = o[g].nf), o[g].Interior && k.push(o[g].Interior), !!o[g].Parent); )
    g = o[g].Parent;
  switch (r.Type) {
    case "Boolean":
      s.t = "b", s.v = dr(e);
      break;
    case "String":
      s.t = "s", s.r = ih(er(e)), s.v = e.indexOf("<") > -1 ? er(n || e).replace(/<.*?>/g, "") : s.r;
      break;
    case "DateTime":
      e.slice(-1) != "Z" && (e += "Z"), s.v = (jr(e) - new Date(Date.UTC(1899, 11, 30))) / (1440 * 60 * 1e3), s.v !== s.v ? s.v = er(e) : s.v < 60 && (s.v = s.v - 1), (!p || p == "General") && (p = "yyyy-mm-dd");
    /* falls through */
    case "Number":
      s.v === void 0 && (s.v = +e), s.t || (s.t = "n");
      break;
    case "Error":
      s.t = "e", s.v = zp[e], x.cellText !== !1 && (s.w = e);
      break;
    default:
      e == "" && n == "" ? s.t = "z" : (s.t = "s", s.v = ih(n || e));
      break;
  }
  if (qE(s, p, x), x.cellFormula !== !1)
    if (s.Formula) {
      var y = er(s.Formula);
      y.charCodeAt(0) == 61 && (y = y.slice(1)), s.f = xi(y, i), delete s.Formula, s.ArrayRange == "RC" ? s.F = xi("RC:RC", i) : s.ArrayRange && (s.F = xi(s.ArrayRange, i), d.push([vr(s.F), s.F]));
    } else
      for (_ = 0; _ < d.length; ++_)
        i.r >= d[_][0].s.r && i.r <= d[_][0].e.r && i.c >= d[_][0].s.c && i.c <= d[_][0].e.c && (s.F = d[_][1]);
  x.cellStyles && (k.forEach(function(E) {
    !w.patternType && E.patternType && (w.patternType = E.patternType);
  }), s.s = w), s.StyleID !== void 0 && (s.ixfe = s.StyleID);
}
function e4(e) {
  e.t = e.v || "", e.t = e.t.replace(/\r\n/g, `
`).replace(/\r/g, `
`), e.v = e.w = e.ixfe = void 0;
}
function xc(e, n) {
  var r = n || {};
  hp();
  var s = os(zc(e));
  (r.type == "binary" || r.type == "array" || r.type == "base64") && (s = lr(s));
  var i = s.slice(0, 1024).toLowerCase(), o = !1;
  if (i = i.replace(/".*?"/g, ""), (i.indexOf(">") & 1023) > Math.min(i.indexOf(",") & 1023, i.indexOf(";") & 1023)) {
    var c = Vr(r);
    return c.type = "string", Fs.to_workbook(s, c);
  }
  if (i.indexOf("<?xml") == -1 && ["html", "table", "head", "meta", "script", "style", "div"].forEach(function(ur) {
    i.indexOf("<" + ur) >= 0 && (o = !0);
  }), o) return c4(s, r);
  _s = {
    "General Number": "General",
    "General Date": $e[22],
    "Long Date": "dddd, mmmm dd, yyyy",
    "Medium Date": $e[15],
    "Short Date": $e[14],
    "Long Time": $e[19],
    "Medium Time": $e[18],
    "Short Time": $e[20],
    Currency: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
    Fixed: $e[2],
    Standard: $e[4],
    Percent: $e[10],
    Scientific: $e[11],
    "Yes/No": '"Yes";"Yes";"No";@',
    "True/False": '"True";"True";"False";@',
    "On/Off": '"Yes";"Yes";"No";@'
  };
  var u, d = [], x, p = {}, g = [], w = r.dense ? [] : {}, k = "", _ = {}, y = {}, E = Qt('<Data ss:Type="String">'), A = 0, O = 0, N = 0, V = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } }, J = {}, j = {}, C = "", G = 0, B = [], le = {}, re = {}, Q = 0, pe = [], Ce = [], xe = {}, we = [], ye, ge = !1, Y = [], he = [], U = {}, F = 0, X = 0, z = { Sheets: [], WBProps: { date1904: !1 } }, H = {};
  As.lastIndex = 0, s = s.replace(/<!--([\s\S]*?)-->/mg, "");
  for (var ue = ""; u = As.exec(s); ) switch (u[3] = (ue = u[3]).toLowerCase()) {
    case "data":
      if (ue == "data") {
        if (u[1] === "/") {
          if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
        } else u[0].charAt(u[0].length - 2) !== "/" && d.push([u[3], !0]);
        break;
      }
      if (d[d.length - 1][1]) break;
      u[1] === "/" ? ZE(s.slice(A, u.index), C, E, d[d.length - 1][0] == /*"Comment"*/
      "comment" ? xe : _, { c: O, r: N }, J, we[O], y, Y, r) : (C = "", E = Qt(u[0]), A = u.index + u[0].length);
      break;
    case "cell":
      if (u[1] === "/")
        if (Ce.length > 0 && (_.c = Ce), (!r.sheetRows || r.sheetRows > N) && _.v !== void 0 && (r.dense ? (w[N] || (w[N] = []), w[N][O] = _) : w[Or(O) + Wr(N)] = _), _.HRef && (_.l = { Target: er(_.HRef) }, _.HRefScreenTip && (_.l.Tooltip = _.HRefScreenTip), delete _.HRef, delete _.HRefScreenTip), (_.MergeAcross || _.MergeDown) && (F = O + (parseInt(_.MergeAcross, 10) | 0), X = N + (parseInt(_.MergeDown, 10) | 0), B.push({ s: { c: O, r: N }, e: { c: F, r: X } })), !r.sheetStubs)
          _.MergeAcross ? O = F + 1 : ++O;
        else if (_.MergeAcross || _.MergeDown) {
          for (var K = O; K <= F; ++K)
            for (var te = N; te <= X; ++te)
              (K > O || te > N) && (r.dense ? (w[te] || (w[te] = []), w[te][K] = { t: "z" }) : w[Or(K) + Wr(te)] = { t: "z" });
          O = F + 1;
        } else ++O;
      else
        _ = XE(u[0]), _.Index && (O = +_.Index - 1), O < V.s.c && (V.s.c = O), O > V.e.c && (V.e.c = O), u[0].slice(-2) === "/>" && ++O, Ce = [];
      break;
    case "row":
      u[1] === "/" || u[0].slice(-2) === "/>" ? (N < V.s.r && (V.s.r = N), N > V.e.r && (V.e.r = N), u[0].slice(-2) === "/>" && (y = Qt(u[0]), y.Index && (N = +y.Index - 1)), O = 0, ++N) : (y = Qt(u[0]), y.Index && (N = +y.Index - 1), U = {}, (y.AutoFitHeight == "0" || y.Height) && (U.hpx = parseInt(y.Height, 10), U.hpt = o1(U.hpx), he[N] = U), y.Hidden == "1" && (U.hidden = !0, he[N] = U));
      break;
    case "worksheet":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
        g.push(k), V.s.r <= V.e.r && V.s.c <= V.e.c && (w["!ref"] = Je(V), r.sheetRows && r.sheetRows <= V.e.r && (w["!fullref"] = w["!ref"], V.e.r = r.sheetRows - 1, w["!ref"] = Je(V))), B.length && (w["!merges"] = B), we.length > 0 && (w["!cols"] = we), he.length > 0 && (w["!rows"] = he), p[k] = w;
      } else
        V = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } }, N = O = 0, d.push([u[3], !1]), x = Qt(u[0]), k = er(x.Name), w = r.dense ? [] : {}, B = [], Y = [], he = [], H = { name: k, Hidden: 0 }, z.Sheets.push(H);
      break;
    case "table":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
      } else {
        if (u[0].slice(-2) == "/>") break;
        d.push([u[3], !1]), we = [], ge = !1;
      }
      break;
    case "style":
      u[1] === "/" ? JE(J, j, r) : j = Qt(u[0]);
      break;
    case "numberformat":
      j.nf = er(Qt(u[0]).Format || "General"), _s[j.nf] && (j.nf = _s[j.nf]);
      for (var Z = 0; Z != 392 && $e[Z] != j.nf; ++Z) ;
      if (Z == 392) {
        for (Z = 57; Z != 392; ++Z) if ($e[Z] == null) {
          Fa(j.nf, Z);
          break;
        }
      }
      break;
    case "column":
      if (d[d.length - 1][0] !== /*'Table'*/
      "table") break;
      if (ye = Qt(u[0]), ye.Hidden && (ye.hidden = !0, delete ye.Hidden), ye.Width && (ye.wpx = parseInt(ye.Width, 10)), !ge && ye.wpx > 10) {
        ge = !0, ct = s1;
        for (var fe = 0; fe < we.length; ++fe) we[fe] && vi(we[fe]);
      }
      ge && vi(ye), we[ye.Index - 1 || we.length] = ye;
      for (var Pe = 0; Pe < +ye.Span; ++Pe) we[we.length] = Vr(ye);
      break;
    case "namedrange":
      if (u[1] === "/") break;
      z.Names || (z.Names = []);
      var P = Ue(u[0]), Xe = {
        Name: P.Name,
        Ref: xi(P.RefersTo.slice(1), { r: 0, c: 0 })
      };
      z.Sheets.length > 0 && (Xe.Sheet = z.Sheets.length - 1), z.Names.push(Xe);
      break;
    case "namedcell":
      break;
    case "b":
      break;
    case "i":
      break;
    case "u":
      break;
    case "s":
      break;
    case "em":
      break;
    case "h2":
      break;
    case "h3":
      break;
    case "sub":
      break;
    case "sup":
      break;
    case "span":
      break;
    case "alignment":
      break;
    case "borders":
      break;
    case "border":
      break;
    case "font":
      if (u[0].slice(-2) === "/>") break;
      u[1] === "/" ? C += s.slice(G, u.index) : G = u.index + u[0].length;
      break;
    case "interior":
      if (!r.cellStyles) break;
      j.Interior = Qt(u[0]);
      break;
    case "protection":
      break;
    case "author":
    case "title":
    case "description":
    case "created":
    case "keywords":
    case "subject":
    case "category":
    case "company":
    case "lastauthor":
    case "lastsaved":
    case "lastprinted":
    case "version":
    case "revision":
    case "totaltime":
    case "hyperlinkbase":
    case "manager":
    case "contentstatus":
    case "identifier":
    case "language":
    case "appname":
      if (u[0].slice(-2) === "/>") break;
      u[1] === "/" ? Mv(le, ue, s.slice(Q, u.index)) : Q = u.index + u[0].length;
      break;
    case "paragraphs":
      break;
    case "styles":
    case "workbook":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
      } else d.push([u[3], !1]);
      break;
    case "comment":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
        e4(xe), Ce.push(xe);
      } else
        d.push([u[3], !1]), x = Qt(u[0]), xe = { a: x.Author };
      break;
    case "autofilter":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
      } else if (u[0].charAt(u[0].length - 2) !== "/") {
        var je = Qt(u[0]);
        w["!autofilter"] = { ref: xi(je.Range).replace(/\$/g, "") }, d.push([u[3], !0]);
      }
      break;
    case "name":
      break;
    case "datavalidation":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
      } else
        u[0].charAt(u[0].length - 2) !== "/" && d.push([u[3], !0]);
      break;
    case "pixelsperinch":
      break;
    case "componentoptions":
    case "documentproperties":
    case "customdocumentproperties":
    case "officedocumentsettings":
    case "pivottable":
    case "pivotcache":
    case "names":
    case "mapinfo":
    case "pagebreaks":
    case "querytable":
    case "sorting":
    case "schema":
    //case 'data' /*case 'data'*/:
    case "conditionalformatting":
    case "smarttagtype":
    case "smarttags":
    case "excelworkbook":
    case "workbookoptions":
    case "worksheetoptions":
      if (u[1] === "/") {
        if ((x = d.pop())[0] !== u[3]) throw new Error("Bad state: " + x.join("|"));
      } else u[0].charAt(u[0].length - 2) !== "/" && d.push([u[3], !0]);
      break;
    case "null":
      break;
    default:
      if (d.length == 0 && u[3] == "document" || d.length == 0 && u[3] == "uof") return Vh(s, r);
      var Ke = !0;
      switch (d[d.length - 1][0]) {
        /* OfficeDocumentSettings */
        case "officedocumentsettings":
          switch (u[3]) {
            case "allowpng":
              break;
            case "removepersonalinformation":
              break;
            case "downloadcomponents":
              break;
            case "locationofcomponents":
              break;
            case "colors":
              break;
            case "color":
              break;
            case "index":
              break;
            case "rgb":
              break;
            case "targetscreensize":
              break;
            case "readonlyrecommended":
              break;
            default:
              Ke = !1;
          }
          break;
        /* ComponentOptions */
        case "componentoptions":
          switch (u[3]) {
            case "toolbar":
              break;
            case "hideofficelogo":
              break;
            case "spreadsheetautofit":
              break;
            case "label":
              break;
            case "caption":
              break;
            case "maxheight":
              break;
            case "maxwidth":
              break;
            case "nextsheetnumber":
              break;
            default:
              Ke = !1;
          }
          break;
        /* ExcelWorkbook */
        case "excelworkbook":
          switch (u[3]) {
            case "date1904":
              z.WBProps.date1904 = !0;
              break;
            case "windowheight":
              break;
            case "windowwidth":
              break;
            case "windowtopx":
              break;
            case "windowtopy":
              break;
            case "tabratio":
              break;
            case "protectstructure":
              break;
            case "protectwindow":
              break;
            case "protectwindows":
              break;
            case "activesheet":
              break;
            case "displayinknotes":
              break;
            case "firstvisiblesheet":
              break;
            case "supbook":
              break;
            case "sheetname":
              break;
            case "sheetindex":
              break;
            case "sheetindexfirst":
              break;
            case "sheetindexlast":
              break;
            case "dll":
              break;
            case "acceptlabelsinformulas":
              break;
            case "donotsavelinkvalues":
              break;
            case "iteration":
              break;
            case "maxiterations":
              break;
            case "maxchange":
              break;
            case "path":
              break;
            case "xct":
              break;
            case "count":
              break;
            case "selectedsheets":
              break;
            case "calculation":
              break;
            case "uncalced":
              break;
            case "startupprompt":
              break;
            case "crn":
              break;
            case "externname":
              break;
            case "formula":
              break;
            case "colfirst":
              break;
            case "collast":
              break;
            case "wantadvise":
              break;
            case "boolean":
              break;
            case "error":
              break;
            case "text":
              break;
            case "ole":
              break;
            case "noautorecover":
              break;
            case "publishobjects":
              break;
            case "donotcalculatebeforesave":
              break;
            case "number":
              break;
            case "refmoder1c1":
              break;
            case "embedsavesmarttags":
              break;
            default:
              Ke = !1;
          }
          break;
        /* WorkbookOptions */
        case "workbookoptions":
          switch (u[3]) {
            case "owcversion":
              break;
            case "height":
              break;
            case "width":
              break;
            default:
              Ke = !1;
          }
          break;
        /* WorksheetOptions */
        case "worksheetoptions":
          switch (u[3]) {
            case "visible":
              if (u[0].slice(-2) !== "/>") if (u[1] === "/") switch (s.slice(Q, u.index)) {
                case "SheetHidden":
                  H.Hidden = 1;
                  break;
                case "SheetVeryHidden":
                  H.Hidden = 2;
                  break;
              }
              else Q = u.index + u[0].length;
              break;
            case "header":
              w["!margins"] || ys(w["!margins"] = {}, "xlml"), isNaN(+Ue(u[0]).Margin) || (w["!margins"].header = +Ue(u[0]).Margin);
              break;
            case "footer":
              w["!margins"] || ys(w["!margins"] = {}, "xlml"), isNaN(+Ue(u[0]).Margin) || (w["!margins"].footer = +Ue(u[0]).Margin);
              break;
            case "pagemargins":
              var Ve = Ue(u[0]);
              w["!margins"] || ys(w["!margins"] = {}, "xlml"), isNaN(+Ve.Top) || (w["!margins"].top = +Ve.Top), isNaN(+Ve.Left) || (w["!margins"].left = +Ve.Left), isNaN(+Ve.Right) || (w["!margins"].right = +Ve.Right), isNaN(+Ve.Bottom) || (w["!margins"].bottom = +Ve.Bottom);
              break;
            case "displayrighttoleft":
              z.Views || (z.Views = []), z.Views[0] || (z.Views[0] = {}), z.Views[0].RTL = !0;
              break;
            case "freezepanes":
              break;
            case "frozennosplit":
              break;
            case "splithorizontal":
            case "splitvertical":
              break;
            case "donotdisplaygridlines":
              break;
            case "activerow":
              break;
            case "activecol":
              break;
            case "toprowbottompane":
              break;
            case "leftcolumnrightpane":
              break;
            case "unsynced":
              break;
            case "print":
              break;
            case "printerrors":
              break;
            case "panes":
              break;
            case "scale":
              break;
            case "pane":
              break;
            case "number":
              break;
            case "layout":
              break;
            case "pagesetup":
              break;
            case "selected":
              break;
            case "protectobjects":
              break;
            case "enableselection":
              break;
            case "protectscenarios":
              break;
            case "validprinterinfo":
              break;
            case "horizontalresolution":
              break;
            case "verticalresolution":
              break;
            case "numberofcopies":
              break;
            case "activepane":
              break;
            case "toprowvisible":
              break;
            case "leftcolumnvisible":
              break;
            case "fittopage":
              break;
            case "rangeselection":
              break;
            case "papersizeindex":
              break;
            case "pagelayoutzoom":
              break;
            case "pagebreakzoom":
              break;
            case "filteron":
              break;
            case "fitwidth":
              break;
            case "fitheight":
              break;
            case "commentslayout":
              break;
            case "zoom":
              break;
            case "lefttoright":
              break;
            case "gridlines":
              break;
            case "allowsort":
              break;
            case "allowfilter":
              break;
            case "allowinsertrows":
              break;
            case "allowdeleterows":
              break;
            case "allowinsertcols":
              break;
            case "allowdeletecols":
              break;
            case "allowinserthyperlinks":
              break;
            case "allowformatcells":
              break;
            case "allowsizecols":
              break;
            case "allowsizerows":
              break;
            case "nosummaryrowsbelowdetail":
              w["!outline"] || (w["!outline"] = {}), w["!outline"].above = !0;
              break;
            case "tabcolorindex":
              break;
            case "donotdisplayheadings":
              break;
            case "showpagelayoutzoom":
              break;
            case "nosummarycolumnsrightdetail":
              w["!outline"] || (w["!outline"] = {}), w["!outline"].left = !0;
              break;
            case "blackandwhite":
              break;
            case "donotdisplayzeros":
              break;
            case "displaypagebreak":
              break;
            case "rowcolheadings":
              break;
            case "donotdisplayoutline":
              break;
            case "noorientation":
              break;
            case "allowusepivottables":
              break;
            case "zeroheight":
              break;
            case "viewablerange":
              break;
            case "selection":
              break;
            case "protectcontents":
              break;
            default:
              Ke = !1;
          }
          break;
        /* PivotTable */
        case "pivottable":
        case "pivotcache":
          switch (u[3]) {
            case "immediateitemsondrop":
              break;
            case "showpagemultipleitemlabel":
              break;
            case "compactrowindent":
              break;
            case "location":
              break;
            case "pivotfield":
              break;
            case "orientation":
              break;
            case "layoutform":
              break;
            case "layoutsubtotallocation":
              break;
            case "layoutcompactrow":
              break;
            case "position":
              break;
            case "pivotitem":
              break;
            case "datatype":
              break;
            case "datafield":
              break;
            case "sourcename":
              break;
            case "parentfield":
              break;
            case "ptlineitems":
              break;
            case "ptlineitem":
              break;
            case "countofsameitems":
              break;
            case "item":
              break;
            case "itemtype":
              break;
            case "ptsource":
              break;
            case "cacheindex":
              break;
            case "consolidationreference":
              break;
            case "filename":
              break;
            case "reference":
              break;
            case "nocolumngrand":
              break;
            case "norowgrand":
              break;
            case "blanklineafteritems":
              break;
            case "hidden":
              break;
            case "subtotal":
              break;
            case "basefield":
              break;
            case "mapchilditems":
              break;
            case "function":
              break;
            case "refreshonfileopen":
              break;
            case "printsettitles":
              break;
            case "mergelabels":
              break;
            case "defaultversion":
              break;
            case "refreshname":
              break;
            case "refreshdate":
              break;
            case "refreshdatecopy":
              break;
            case "versionlastrefresh":
              break;
            case "versionlastupdate":
              break;
            case "versionupdateablemin":
              break;
            case "versionrefreshablemin":
              break;
            case "calculation":
              break;
            default:
              Ke = !1;
          }
          break;
        /* PageBreaks */
        case "pagebreaks":
          switch (u[3]) {
            case "colbreaks":
              break;
            case "colbreak":
              break;
            case "rowbreaks":
              break;
            case "rowbreak":
              break;
            case "colstart":
              break;
            case "colend":
              break;
            case "rowend":
              break;
            default:
              Ke = !1;
          }
          break;
        /* AutoFilter */
        case "autofilter":
          switch (u[3]) {
            case "autofiltercolumn":
              break;
            case "autofiltercondition":
              break;
            case "autofilterand":
              break;
            case "autofilteror":
              break;
            default:
              Ke = !1;
          }
          break;
        /* QueryTable */
        case "querytable":
          switch (u[3]) {
            case "id":
              break;
            case "autoformatfont":
              break;
            case "autoformatpattern":
              break;
            case "querysource":
              break;
            case "querytype":
              break;
            case "enableredirections":
              break;
            case "refreshedinxl9":
              break;
            case "urlstring":
              break;
            case "htmltables":
              break;
            case "connection":
              break;
            case "commandtext":
              break;
            case "refreshinfo":
              break;
            case "notitles":
              break;
            case "nextid":
              break;
            case "columninfo":
              break;
            case "overwritecells":
              break;
            case "donotpromptforfile":
              break;
            case "textwizardsettings":
              break;
            case "source":
              break;
            case "number":
              break;
            case "decimal":
              break;
            case "thousandseparator":
              break;
            case "trailingminusnumbers":
              break;
            case "formatsettings":
              break;
            case "fieldtype":
              break;
            case "delimiters":
              break;
            case "tab":
              break;
            case "comma":
              break;
            case "autoformatname":
              break;
            case "versionlastedit":
              break;
            case "versionlastrefresh":
              break;
            default:
              Ke = !1;
          }
          break;
        case "datavalidation":
          switch (u[3]) {
            case "range":
              break;
            case "type":
              break;
            case "min":
              break;
            case "max":
              break;
            case "sort":
              break;
            case "descending":
              break;
            case "order":
              break;
            case "casesensitive":
              break;
            case "value":
              break;
            case "errorstyle":
              break;
            case "errormessage":
              break;
            case "errortitle":
              break;
            case "inputmessage":
              break;
            case "inputtitle":
              break;
            case "combohide":
              break;
            case "inputhide":
              break;
            case "condition":
              break;
            case "qualifier":
              break;
            case "useblank":
              break;
            case "value1":
              break;
            case "value2":
              break;
            case "format":
              break;
            case "cellrangelist":
              break;
            default:
              Ke = !1;
          }
          break;
        case "sorting":
        case "conditionalformatting":
          switch (u[3]) {
            case "range":
              break;
            case "type":
              break;
            case "min":
              break;
            case "max":
              break;
            case "sort":
              break;
            case "descending":
              break;
            case "order":
              break;
            case "casesensitive":
              break;
            case "value":
              break;
            case "errorstyle":
              break;
            case "errormessage":
              break;
            case "errortitle":
              break;
            case "cellrangelist":
              break;
            case "inputmessage":
              break;
            case "inputtitle":
              break;
            case "combohide":
              break;
            case "inputhide":
              break;
            case "condition":
              break;
            case "qualifier":
              break;
            case "useblank":
              break;
            case "value1":
              break;
            case "value2":
              break;
            case "format":
              break;
            default:
              Ke = !1;
          }
          break;
        /* MapInfo (schema) */
        case "mapinfo":
        case "schema":
        case "data":
          switch (u[3]) {
            case "map":
              break;
            case "entry":
              break;
            case "range":
              break;
            case "xpath":
              break;
            case "field":
              break;
            case "xsdtype":
              break;
            case "filteron":
              break;
            case "aggregate":
              break;
            case "elementtype":
              break;
            case "attributetype":
              break;
            /* These are from xsd (XML Schema Definition) */
            case "schema":
            case "element":
            case "complextype":
            case "datatype":
            case "all":
            case "attribute":
            case "extends":
              break;
            case "row":
              break;
            default:
              Ke = !1;
          }
          break;
        /* SmartTags (can be anything) */
        case "smarttags":
          break;
        default:
          Ke = !1;
          break;
      }
      if (Ke || u[3].match(/!\[CDATA/)) break;
      if (!d[d.length - 1][1]) throw "Unrecognized tag: " + u[3] + "|" + d.join("|");
      if (d[d.length - 1][0] === /*'CustomDocumentProperties'*/
      "customdocumentproperties") {
        if (u[0].slice(-2) === "/>") break;
        u[1] === "/" ? QE(re, ue, pe, s.slice(Q, u.index)) : (pe = u, Q = u.index + u[0].length);
        break;
      }
      if (r.WTF) throw "Unrecognized tag: " + u[3] + "|" + d.join("|");
  }
  var Fe = {};
  return !r.bookSheets && !r.bookProps && (Fe.Sheets = p), Fe.SheetNames = g, Fe.Workbook = z, Fe.SSF = Vr($e), Fe.Props = le, Fe.Custprops = re, Fe;
}
function Tc(e, n) {
  switch (tu(n = n || {}), n.type || "base64") {
    case "base64":
      return xc(Ft(e), n);
    case "binary":
    case "buffer":
    case "file":
      return xc(e, n);
    case "array":
      return xc(ba(e), n);
  }
}
function r4(e) {
  var n = {}, r = e.content;
  if (r.l = 28, n.AnsiUserType = r.read_shift(0, "lpstr-ansi"), n.AnsiClipboardFormat = xv(r), r.length - r.l <= 4) return n;
  var s = r.read_shift(4);
  if (s == 0 || s > 40 || (r.l -= 4, n.Reserved1 = r.read_shift(0, "lpstr-ansi"), r.length - r.l <= 4) || (s = r.read_shift(4), s !== 1907505652) || (n.UnicodeClipboardFormat = mv(r), s = r.read_shift(4), s == 0 || s > 40)) return n;
  r.l -= 4, n.Reserved2 = r.read_shift(0, "lpwstr");
}
var t4 = [60, 1084, 2066, 2165, 2175];
function n4(e, n, r, s, i) {
  var o = s, c = [], u = r.slice(r.l, r.l + o);
  if (i && i.enc && i.enc.insitu && u.length > 0) switch (e) {
    case 9:
    case 521:
    case 1033:
    case 2057:
    case 47:
    case 405:
    case 225:
    case 406:
    case 312:
    case 404:
    case 10:
      break;
    case 133:
      break;
    default:
      i.enc.insitu(u);
  }
  c.push(u), r.l += o;
  for (var d = Tn(r, r.l), x = Cc[d], p = 0; x != null && t4.indexOf(d) > -1; )
    o = Tn(r, r.l + 2), p = r.l + 4, d == 2066 ? p += 4 : (d == 2165 || d == 2175) && (p += 12), u = r.slice(p, r.l + 4 + o), c.push(u), r.l += 4 + o, x = Cc[d = Tn(r, r.l)];
  var g = ra(c);
  Hr(g, 0);
  var w = 0;
  g.lens = [];
  for (var k = 0; k < c.length; ++k)
    g.lens.push(w), w += c[k].length;
  if (g.length < s) throw "XLS Record 0x" + e.toString(16) + " Truncated: " + g.length + " < " + s;
  return n.f(g, g.length, i);
}
function cn(e, n, r) {
  if (e.t !== "z" && e.XF) {
    var s = 0;
    try {
      s = e.z || e.XF.numFmtId || 0, n.cellNF && (e.z = $e[s]);
    } catch (o) {
      if (n.WTF) throw o;
    }
    if (!n || n.cellText !== !1) try {
      e.t === "e" ? e.w = e.w || Ma[e.v] : s === 0 || s == "General" ? e.t === "n" ? (e.v | 0) === e.v ? e.w = e.v.toString(10) : e.w = Ts(e.v) : e.w = Ra(e.v) : e.w = Ut(s, e.v, { date1904: !!r, dateNF: n && n.dateNF });
    } catch (o) {
      if (n.WTF) throw o;
    }
    if (n.cellDates && s && e.t == "n" && wi($e[s] || String(s))) {
      var i = Ta(e.v);
      i && (e.t = "d", e.v = new Date(i.y, i.m - 1, i.d, i.H, i.M, i.S, i.u));
    }
  }
}
function no(e, n, r) {
  return { v: e, ixfe: n, t: r };
}
function a4(e, n) {
  var r = { opts: {} }, s = {}, i = n.dense ? [] : {}, o = {}, c = {}, u = null, d = [], x = "", p = {}, g, w = "", k, _, y, E, A = {}, O = [], N, V, J = [], j = [], C = { Sheets: [], WBProps: { date1904: !1 }, Views: [{}] }, G = {}, B = function(We) {
    return We < 8 ? Na[We] : We < 64 && j[We - 8] || Na[We];
  }, le = function(We, nr, ht) {
    var xr = nr.XF.data;
    if (!(!xr || !xr.patternType || !ht || !ht.cellStyles)) {
      nr.s = {}, nr.s.patternType = xr.patternType;
      var tn;
      (tn = Ns(B(xr.icvFore))) && (nr.s.fgColor = { rgb: tn }), (tn = Ns(B(xr.icvBack))) && (nr.s.bgColor = { rgb: tn });
    }
  }, re = function(We, nr, ht) {
    if (!(U > 1) && !(ht.sheetRows && We.r >= ht.sheetRows)) {
      if (ht.cellStyles && nr.XF && nr.XF.data && le(We, nr, ht), delete nr.ixfe, delete nr.XF, g = We, w = Ge(We), (!c || !c.s || !c.e) && (c = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }), We.r < c.s.r && (c.s.r = We.r), We.c < c.s.c && (c.s.c = We.c), We.r + 1 > c.e.r && (c.e.r = We.r + 1), We.c + 1 > c.e.c && (c.e.c = We.c + 1), ht.cellFormula && nr.f) {
        for (var xr = 0; xr < O.length; ++xr)
          if (!(O[xr][0].s.c > We.c || O[xr][0].s.r > We.r) && !(O[xr][0].e.c < We.c || O[xr][0].e.r < We.r)) {
            nr.F = Je(O[xr][0]), (O[xr][0].s.c != We.c || O[xr][0].s.r != We.r) && delete nr.f, nr.f && (nr.f = "" + et(O[xr][1], c, We, Y, Q));
            break;
          }
      }
      ht.dense ? (i[We.r] || (i[We.r] = []), i[We.r][We.c] = nr) : i[w] = nr;
    }
  }, Q = {
    enc: !1,
    // encrypted
    sbcch: 0,
    // cch in the preceding SupBook
    snames: [],
    // sheetnames
    sharedf: A,
    // shared formulae by address
    arrayf: O,
    // array formulae array
    rrtabid: [],
    // RRTabId
    lastuser: "",
    // Last User from WriteAccess
    biff: 8,
    // BIFF version
    codepage: 0,
    // CP from CodePage record
    winlocked: 0,
    // fLockWn from WinProtect
    cellStyles: !!n && !!n.cellStyles,
    WTF: !!n && !!n.wtf
  };
  n.password && (Q.password = n.password);
  var pe, Ce = [], xe = [], we = [], ye = [], ge = !1, Y = [];
  Y.SheetNames = Q.snames, Y.sharedf = Q.sharedf, Y.arrayf = Q.arrayf, Y.names = [], Y.XTI = [];
  var he = 0, U = 0, F = 0, X = [], z = [], H;
  Q.codepage = 1200, Zt(1200);
  for (var ue = !1; e.l < e.length - 1; ) {
    var K = e.l, te = e.read_shift(2);
    if (te === 0 && he === 10) break;
    var Z = e.l === e.length ? 0 : e.read_shift(2), fe = Cc[te];
    if (fe && fe.f) {
      if (n.bookSheets && he === 133 && te !== 133)
        break;
      if (he = te, fe.r === 2 || fe.r == 12) {
        var Pe = e.read_shift(2);
        if (Z -= 2, !Q.enc && Pe !== te && ((Pe & 255) << 8 | Pe >> 8) !== te) throw new Error("rt mismatch: " + Pe + "!=" + te);
        fe.r == 12 && (e.l += 10, Z -= 10);
      }
      var P = {};
      if (te === 10 ? P = /*::(*/
      fe.f(e, Z, Q) : P = /*::(*/
      n4(te, fe, e, Z, Q), U == 0 && [9, 521, 1033, 2057].indexOf(he) === -1) continue;
      switch (te) {
        case 34:
          r.opts.Date1904 = C.WBProps.date1904 = P;
          break;
        case 134:
          r.opts.WriteProtect = !0;
          break;
        case 47:
          if (Q.enc || (e.l = 0), Q.enc = P, !n.password) throw new Error("File is password-protected");
          if (P.valid == null) throw new Error("Encryption scheme unsupported");
          if (!P.valid) throw new Error("Password is incorrect");
          break;
        case 92:
          Q.lastuser = P;
          break;
        case 66:
          var Xe = Number(P);
          switch (Xe) {
            case 21010:
              Xe = 1200;
              break;
            case 32768:
              Xe = 1e4;
              break;
            case 32769:
              Xe = 1252;
              break;
          }
          Zt(Q.codepage = Xe), ue = !0;
          break;
        case 317:
          Q.rrtabid = P;
          break;
        case 25:
          Q.winlocked = P;
          break;
        case 439:
          r.opts.RefreshAll = P;
          break;
        case 12:
          r.opts.CalcCount = P;
          break;
        case 16:
          r.opts.CalcDelta = P;
          break;
        case 17:
          r.opts.CalcIter = P;
          break;
        case 13:
          r.opts.CalcMode = P;
          break;
        case 14:
          r.opts.CalcPrecision = P;
          break;
        case 95:
          r.opts.CalcSaveRecalc = P;
          break;
        case 15:
          Q.CalcRefMode = P;
          break;
        // TODO: implement R1C1
        case 2211:
          r.opts.FullCalc = P;
          break;
        case 129:
          P.fDialog && (i["!type"] = "dialog"), P.fBelow || ((i["!outline"] || (i["!outline"] = {})).above = !0), P.fRight || ((i["!outline"] || (i["!outline"] = {})).left = !0);
          break;
        // TODO
        case 224:
          J.push(P);
          break;
        case 430:
          Y.push([P]), Y[Y.length - 1].XTI = [];
          break;
        case 35:
        case 547:
          Y[Y.length - 1].push(P);
          break;
        case 24:
        case 536:
          H = {
            Name: P.Name,
            Ref: et(P.rgce, c, null, Y, Q)
          }, P.itab > 0 && (H.Sheet = P.itab - 1), Y.names.push(H), Y[0] || (Y[0] = [], Y[0].XTI = []), Y[Y.length - 1].push(P), P.Name == "_xlnm._FilterDatabase" && P.itab > 0 && P.rgce && P.rgce[0] && P.rgce[0][0] && P.rgce[0][0][0] == "PtgArea3d" && (z[P.itab - 1] = { ref: Je(P.rgce[0][0][1][2]) });
          break;
        case 22:
          Q.ExternCount = P;
          break;
        case 23:
          Y.length == 0 && (Y[0] = [], Y[0].XTI = []), Y[Y.length - 1].XTI = Y[Y.length - 1].XTI.concat(P), Y.XTI = Y.XTI.concat(P);
          break;
        case 2196:
          if (Q.biff < 8) break;
          H != null && (H.Comment = P[1]);
          break;
        case 18:
          i["!protect"] = P;
          break;
        /* for sheet or book */
        case 19:
          P !== 0 && Q.WTF && console.error("Password verifier: " + P);
          break;
        case 133:
          o[P.pos] = P, Q.snames.push(P.name);
          break;
        case 10:
          {
            if (--U) break;
            if (c.e) {
              if (c.e.r > 0 && c.e.c > 0) {
                if (c.e.r--, c.e.c--, i["!ref"] = Je(c), n.sheetRows && n.sheetRows <= c.e.r) {
                  var je = c.e.r;
                  c.e.r = n.sheetRows - 1, i["!fullref"] = i["!ref"], i["!ref"] = Je(c), c.e.r = je;
                }
                c.e.r++, c.e.c++;
              }
              Ce.length > 0 && (i["!merges"] = Ce), xe.length > 0 && (i["!objects"] = xe), we.length > 0 && (i["!cols"] = we), ye.length > 0 && (i["!rows"] = ye), C.Sheets.push(G);
            }
            x === "" ? p = i : s[x] = i, i = n.dense ? [] : {};
          }
          break;
        case 9:
        case 521:
        case 1033:
        case 2057:
          {
            if (Q.biff === 8 && (Q.biff = {
              /*::[*/
              9: 2,
              /*::[*/
              521: 3,
              /*::[*/
              1033: 4
            }[te] || {
              /*::[*/
              512: 2,
              /*::[*/
              768: 3,
              /*::[*/
              1024: 4,
              /*::[*/
              1280: 5,
              /*::[*/
              1536: 8,
              /*::[*/
              2: 2,
              /*::[*/
              7: 2
            }[P.BIFFVer] || 8), Q.biffguess = P.BIFFVer == 0, P.BIFFVer == 0 && P.dt == 4096 && (Q.biff = 5, ue = !0, Zt(Q.codepage = 28591)), Q.biff == 8 && P.BIFFVer == 0 && P.dt == 16 && (Q.biff = 2), U++) break;
            if (i = n.dense ? [] : {}, Q.biff < 8 && !ue && (ue = !0, Zt(Q.codepage = n.codepage || 1252)), Q.biff < 5 || P.BIFFVer == 0 && P.dt == 4096) {
              x === "" && (x = "Sheet1"), c = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
              var Ke = { pos: e.l - Z, name: x };
              o[Ke.pos] = Ke, Q.snames.push(x);
            } else x = (o[K] || { name: "" }).name;
            P.dt == 32 && (i["!type"] = "chart"), P.dt == 64 && (i["!type"] = "macro"), Ce = [], xe = [], Q.arrayf = O = [], we = [], ye = [], ge = !1, G = { Hidden: (o[K] || { hs: 0 }).hs, name: x };
          }
          break;
        case 515:
        case 3:
        case 2:
          i["!type"] == "chart" && (n.dense ? (i[P.r] || [])[P.c] : i[Ge({ c: P.c, r: P.r })]) && ++P.c, N = { ixfe: P.ixfe, XF: J[P.ixfe] || {}, v: P.val, t: "n" }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n);
          break;
        case 5:
        case 517:
          N = { ixfe: P.ixfe, XF: J[P.ixfe], v: P.val, t: P.t }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n);
          break;
        case 638:
          N = { ixfe: P.ixfe, XF: J[P.ixfe], v: P.rknum, t: "n" }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n);
          break;
        case 189:
          for (var Ve = P.c; Ve <= P.C; ++Ve) {
            var Fe = P.rkrec[Ve - P.c][0];
            N = { ixfe: Fe, XF: J[Fe], v: P.rkrec[Ve - P.c][1], t: "n" }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: Ve, r: P.r }, N, n);
          }
          break;
        case 6:
        case 518:
        case 1030:
          {
            if (P.val == "String") {
              u = P;
              break;
            }
            if (N = no(P.val, P.cell.ixfe, P.tt), N.XF = J[N.ixfe], n.cellFormula) {
              var ur = P.formula;
              if (ur && ur[0] && ur[0][0] && ur[0][0][0] == "PtgExp") {
                var Gr = ur[0][0][1][0], $r = ur[0][0][1][1], Kr = Ge({ r: Gr, c: $r });
                A[Kr] ? N.f = "" + et(P.formula, c, P.cell, Y, Q) : N.F = ((n.dense ? (i[Gr] || [])[$r] : i[Kr]) || {}).F;
              } else N.f = "" + et(P.formula, c, P.cell, Y, Q);
            }
            F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re(P.cell, N, n), u = P;
          }
          break;
        case 7:
        case 519:
          if (u)
            u.val = P, N = no(P, u.cell.ixfe, "s"), N.XF = J[N.ixfe], n.cellFormula && (N.f = "" + et(u.formula, c, u.cell, Y, Q)), F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re(u.cell, N, n), u = null;
          else throw new Error("String record expects Formula");
          break;
        case 33:
        case 545:
          {
            O.push(P);
            var pn = Ge(P[0].s);
            if (k = n.dense ? (i[P[0].s.r] || [])[P[0].s.c] : i[pn], n.cellFormula && k) {
              if (!u || !pn || !k) break;
              k.f = "" + et(P[1], c, P[0], Y, Q), k.F = Je(P[0]);
            }
          }
          break;
        case 1212:
          {
            if (!n.cellFormula) break;
            if (w) {
              if (!u) break;
              A[Ge(u.cell)] = P[0], k = n.dense ? (i[u.cell.r] || [])[u.cell.c] : i[Ge(u.cell)], (k || {}).f = "" + et(P[0], c, g, Y, Q);
            }
          }
          break;
        case 253:
          N = no(d[P.isst].t, P.ixfe, "s"), d[P.isst].h && (N.h = d[P.isst].h), N.XF = J[N.ixfe], F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n);
          break;
        case 513:
          n.sheetStubs && (N = { ixfe: P.ixfe, XF: J[P.ixfe], t: "z" }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n));
          break;
        case 190:
          if (n.sheetStubs)
            for (var Ht = P.c; Ht <= P.C; ++Ht) {
              var Xr = P.ixfe[Ht - P.c];
              N = { ixfe: Xr, XF: J[Xr], t: "z" }, F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: Ht, r: P.r }, N, n);
            }
          break;
        case 214:
        case 516:
        case 4:
          N = no(P.val, P.ixfe, "s"), N.XF = J[N.ixfe], F > 0 && (N.z = X[N.ixfe >> 8 & 63]), cn(N, n, r.opts.Date1904), re({ c: P.c, r: P.r }, N, n);
          break;
        case 0:
        case 512:
          U === 1 && (c = P);
          break;
        case 252:
          d = P;
          break;
        case 1054:
          if (Q.biff == 4) {
            X[F++] = P[1];
            for (var Nt = 0; Nt < F + 163 && $e[Nt] != P[1]; ++Nt) ;
            Nt >= 163 && Fa(P[1], F + 163);
          } else Fa(P[1], P[0]);
          break;
        case 30:
          {
            X[F++] = P;
            for (var Vt = 0; Vt < F + 163 && $e[Vt] != P; ++Vt) ;
            Vt >= 163 && Fa(P, F + 163);
          }
          break;
        case 229:
          Ce = Ce.concat(P);
          break;
        case 93:
          xe[P.cmo[0]] = Q.lastobj = P;
          break;
        case 438:
          Q.lastobj.TxO = P;
          break;
        case 127:
          Q.lastobj.ImData = P;
          break;
        case 440:
          for (E = P[0].s.r; E <= P[0].e.r; ++E)
            for (y = P[0].s.c; y <= P[0].e.c; ++y)
              k = n.dense ? (i[E] || [])[y] : i[Ge({ c: y, r: E })], k && (k.l = P[1]);
          break;
        case 2048:
          for (E = P[0].s.r; E <= P[0].e.r; ++E)
            for (y = P[0].s.c; y <= P[0].e.c; ++y)
              k = n.dense ? (i[E] || [])[y] : i[Ge({ c: y, r: E })], k && k.l && (k.l.Tooltip = P[1]);
          break;
        case 28:
          {
            if (Q.biff <= 5 && Q.biff >= 2) break;
            k = n.dense ? (i[P[0].r] || [])[P[0].c] : i[Ge(P[0])];
            var xn = xe[P[2]];
            k || (n.dense ? (i[P[0].r] || (i[P[0].r] = []), k = i[P[0].r][P[0].c] = { t: "z" }) : k = i[Ge(P[0])] = { t: "z" }, c.e.r = Math.max(c.e.r, P[0].r), c.s.r = Math.min(c.s.r, P[0].r), c.e.c = Math.max(c.e.c, P[0].c), c.s.c = Math.min(c.s.c, P[0].c)), k.c || (k.c = []), _ = { a: P[1], t: xn.TxO.t }, k.c.push(_);
          }
          break;
        case 2173:
          Cy(J[P.ixfe], P.ext);
          break;
        case 125:
          {
            if (!Q.cellStyles) break;
            for (; P.e >= P.s; )
              we[P.e--] = { width: P.w / 256, level: P.level || 0, hidden: !!(P.flags & 1) }, ge || (ge = !0, qc(P.w / 256)), vi(we[P.e + 1]);
          }
          break;
        case 520:
          {
            var Er = {};
            P.level != null && (ye[P.r] = Er, Er.level = P.level), P.hidden && (ye[P.r] = Er, Er.hidden = !0), P.hpt && (ye[P.r] = Er, Er.hpt = P.hpt, Er.hpx = Rs(P.hpt));
          }
          break;
        case 38:
        case 39:
        case 40:
        case 41:
          i["!margins"] || ys(i["!margins"] = {}), i["!margins"][{ 38: "left", 39: "right", 40: "top", 41: "bottom" }[te]] = P;
          break;
        case 161:
          i["!margins"] || ys(i["!margins"] = {}), i["!margins"].header = P.header, i["!margins"].footer = P.footer;
          break;
        case 574:
          P.RTL && (C.Views[0].RTL = !0);
          break;
        case 146:
          j = P;
          break;
        case 2198:
          pe = P;
          break;
        case 140:
          V = P;
          break;
        case 442:
          x ? G.CodeName = P || G.name : C.WBProps.CodeName = P || "ThisWorkbook";
          break;
      }
    } else
      fe || console.error("Missing Info for XLS Record 0x" + te.toString(16)), e.l += Z;
  }
  return r.SheetNames = fn(o).sort(function(_t, We) {
    return Number(_t) - Number(We);
  }).map(function(_t) {
    return o[_t].name;
  }), n.bookSheets || (r.Sheets = s), !r.SheetNames.length && p["!ref"] ? (r.SheetNames.push("Sheet1"), r.Sheets && (r.Sheets.Sheet1 = p)) : r.Preamble = p, r.Sheets && z.forEach(function(_t, We) {
    r.Sheets[r.SheetNames[We]]["!autofilter"] = _t;
  }), r.Strings = d, r.SSF = Vr($e), Q.enc && (r.Encryption = Q.enc), pe && (r.Themes = pe), r.Metadata = {}, V !== void 0 && (r.Metadata.Country = V), Y.names.length > 0 && (C.Names = Y.names), r.Workbook = C, r;
}
var Bh = {
  SI: "e0859ff2f94f6810ab9108002b27b3d9",
  DSI: "02d5cdd59c2e1b10939708002b2cf9ae",
  UDI: "05d5cdd59c2e1b10939708002b2cf9ae"
};
function i4(e, n, r) {
  var s = qe.find(e, "/!DocumentSummaryInformation");
  if (s && s.size > 0) try {
    var i = _h(s, kv, Bh.DSI);
    for (var o in i) n[o] = i[o];
  } catch (x) {
    if (r.WTF) throw x;
  }
  var c = qe.find(e, "/!SummaryInformation");
  if (c && c.size > 0) try {
    var u = _h(c, Ev, Bh.SI);
    for (var d in u) n[d] == null && (n[d] = u[d]);
  } catch (x) {
    if (r.WTF) throw x;
  }
  n.HeadingPairs && n.TitlesOfParts && (Vp(n.HeadingPairs, n.TitlesOfParts, n, r), delete n.HeadingPairs, delete n.TitlesOfParts);
}
function C1(e, n) {
  n || (n = {}), tu(n), rp(), n.codepage && bc(n.codepage);
  var r, s;
  if (e.FullPaths) {
    if (qe.find(e, "/encryption")) throw new Error("File is password-protected");
    r = qe.find(e, "!CompObj"), s = qe.find(e, "/Workbook") || qe.find(e, "/Book");
  } else {
    switch (n.type) {
      case "base64":
        e = Jt(Ft(e));
        break;
      case "binary":
        e = Jt(e);
        break;
      case "buffer":
        break;
      case "array":
        Array.isArray(e) || (e = Array.prototype.slice.call(e));
        break;
    }
    Hr(e, 0), s = { content: e };
  }
  var i, o;
  if (r && r4(r), n.bookProps && !n.bookSheets) i = {};
  else {
    var c = Qe ? "buffer" : "array";
    if (s && s.content) i = a4(s.content, n);
    else if ((o = qe.find(e, "PerfectOffice_MAIN")) && o.content) i = vs.to_workbook(o.content, (n.type = c, n));
    else if ((o = qe.find(e, "NativeContent_MAIN")) && o.content) i = vs.to_workbook(o.content, (n.type = c, n));
    else throw (o = qe.find(e, "MN0")) && o.content ? new Error("Unsupported Works 4 for Mac file") : new Error("Cannot find Workbook stream");
    n.bookVBA && e.FullPaths && qe.find(e, "/_VBA_PROJECT_CUR/VBA/dir") && (i.vbaraw = Wy(e));
  }
  var u = {};
  return e.FullPaths && i4(
    /*::((*/
    e,
    u,
    n
  ), i.Props = i.Custprops = u, n.bookFiles && (i.cfb = e), i;
}
var xo = {
  /*::[*/
  0: {
    /* n:"BrtRowHdr", */
    f: Uk
  },
  /*::[*/
  1: {
    /* n:"BrtCellBlank", */
    f: Wk
  },
  /*::[*/
  2: {
    /* n:"BrtCellRk", */
    f: Zk
  },
  /*::[*/
  3: {
    /* n:"BrtCellError", */
    f: Xk
  },
  /*::[*/
  4: {
    /* n:"BrtCellBool", */
    f: $k
  },
  /*::[*/
  5: {
    /* n:"BrtCellReal", */
    f: Jk
  },
  /*::[*/
  6: {
    /* n:"BrtCellSt", */
    f: tE
  },
  /*::[*/
  7: {
    /* n:"BrtCellIsst", */
    f: Qk
  },
  /*::[*/
  8: {
    /* n:"BrtFmlaString", */
    f: lE
  },
  /*::[*/
  9: {
    /* n:"BrtFmlaNum", */
    f: sE
  },
  /*::[*/
  10: {
    /* n:"BrtFmlaBool", */
    f: aE
  },
  /*::[*/
  11: {
    /* n:"BrtFmlaError", */
    f: iE
  },
  /*::[*/
  12: {
    /* n:"BrtShortBlank", */
    f: Gk
  },
  /*::[*/
  13: {
    /* n:"BrtShortRk", */
    f: eE
  },
  /*::[*/
  14: {
    /* n:"BrtShortError", */
    f: Yk
  },
  /*::[*/
  15: {
    /* n:"BrtShortBool", */
    f: Kk
  },
  /*::[*/
  16: {
    /* n:"BrtShortReal", */
    f: _1
  },
  /*::[*/
  17: {
    /* n:"BrtShortSt", */
    f: nE
  },
  /*::[*/
  18: {
    /* n:"BrtShortIsst", */
    f: qk
  },
  /*::[*/
  19: {
    /* n:"BrtSSTItem", */
    f: Gc
  },
  /*::[*/
  20: {
    /* n:"BrtPCDIMissing" */
  },
  /*::[*/
  21: {
    /* n:"BrtPCDINumber" */
  },
  /*::[*/
  22: {
    /* n:"BrtPCDIBoolean" */
  },
  /*::[*/
  23: {
    /* n:"BrtPCDIError" */
  },
  /*::[*/
  24: {
    /* n:"BrtPCDIString" */
  },
  /*::[*/
  25: {
    /* n:"BrtPCDIDatetime" */
  },
  /*::[*/
  26: {
    /* n:"BrtPCDIIndex" */
  },
  /*::[*/
  27: {
    /* n:"BrtPCDIAMissing" */
  },
  /*::[*/
  28: {
    /* n:"BrtPCDIANumber" */
  },
  /*::[*/
  29: {
    /* n:"BrtPCDIABoolean" */
  },
  /*::[*/
  30: {
    /* n:"BrtPCDIAError" */
  },
  /*::[*/
  31: {
    /* n:"BrtPCDIAString" */
  },
  /*::[*/
  32: {
    /* n:"BrtPCDIADatetime" */
  },
  /*::[*/
  33: {
    /* n:"BrtPCRRecord" */
  },
  /*::[*/
  34: {
    /* n:"BrtPCRRecordDt" */
  },
  /*::[*/
  35: {
    /* n:"BrtFRTBegin", */
    T: 1
  },
  /*::[*/
  36: {
    /* n:"BrtFRTEnd", */
    T: -1
  },
  /*::[*/
  37: {
    /* n:"BrtACBegin", */
    T: 1
  },
  /*::[*/
  38: {
    /* n:"BrtACEnd", */
    T: -1
  },
  /*::[*/
  39: {
    /* n:"BrtName", */
    f: bE
  },
  /*::[*/
  40: {
    /* n:"BrtIndexRowBlock" */
  },
  /*::[*/
  42: {
    /* n:"BrtIndexBlock" */
  },
  /*::[*/
  43: {
    /* n:"BrtFont", */
    f: ay
  },
  /*::[*/
  44: {
    /* n:"BrtFmt", */
    f: ny
  },
  /*::[*/
  45: {
    /* n:"BrtFill", */
    f: iy
  },
  /*::[*/
  46: {
    /* n:"BrtBorder", */
    f: ly
  },
  /*::[*/
  47: {
    /* n:"BrtXF", */
    f: sy
  },
  /*::[*/
  48: {
    /* n:"BrtStyle" */
  },
  /*::[*/
  49: {
    /* n:"BrtCellMeta", */
    f: ov
  },
  /*::[*/
  50: {
    /* n:"BrtValueMeta" */
  },
  /*::[*/
  51: {
    /* n:"BrtMdb" */
    f: Fy
  },
  /*::[*/
  52: {
    /* n:"BrtBeginFmd", */
    T: 1
  },
  /*::[*/
  53: {
    /* n:"BrtEndFmd", */
    T: -1
  },
  /*::[*/
  54: {
    /* n:"BrtBeginMdx", */
    T: 1
  },
  /*::[*/
  55: {
    /* n:"BrtEndMdx", */
    T: -1
  },
  /*::[*/
  56: {
    /* n:"BrtBeginMdxTuple", */
    T: 1
  },
  /*::[*/
  57: {
    /* n:"BrtEndMdxTuple", */
    T: -1
  },
  /*::[*/
  58: {
    /* n:"BrtMdxMbrIstr" */
  },
  /*::[*/
  59: {
    /* n:"BrtStr" */
  },
  /*::[*/
  60: {
    /* n:"BrtColInfo", */
    f: r1
  },
  /*::[*/
  62: {
    /* n:"BrtCellRString", */
    f: rE
  },
  /*::[*/
  63: {
    /* n:"BrtCalcChainItem$", */
    f: Py
  },
  /*::[*/
  64: {
    /* n:"BrtDVal", */
    f: mE
  },
  /*::[*/
  65: {
    /* n:"BrtSxvcellNum" */
  },
  /*::[*/
  66: {
    /* n:"BrtSxvcellStr" */
  },
  /*::[*/
  67: {
    /* n:"BrtSxvcellBool" */
  },
  /*::[*/
  68: {
    /* n:"BrtSxvcellErr" */
  },
  /*::[*/
  69: {
    /* n:"BrtSxvcellDate" */
  },
  /*::[*/
  70: {
    /* n:"BrtSxvcellNil" */
  },
  /*::[*/
  128: {
    /* n:"BrtFileVersion" */
  },
  /*::[*/
  129: {
    /* n:"BrtBeginSheet", */
    T: 1
  },
  /*::[*/
  130: {
    /* n:"BrtEndSheet", */
    T: -1
  },
  /*::[*/
  131: {
    /* n:"BrtBeginBook", */
    T: 1,
    f: at,
    p: 0
  },
  /*::[*/
  132: {
    /* n:"BrtEndBook", */
    T: -1
  },
  /*::[*/
  133: {
    /* n:"BrtBeginWsViews", */
    T: 1
  },
  /*::[*/
  134: {
    /* n:"BrtEndWsViews", */
    T: -1
  },
  /*::[*/
  135: {
    /* n:"BrtBeginBookViews", */
    T: 1
  },
  /*::[*/
  136: {
    /* n:"BrtEndBookViews", */
    T: -1
  },
  /*::[*/
  137: {
    /* n:"BrtBeginWsView", */
    T: 1,
    f: xE
  },
  /*::[*/
  138: {
    /* n:"BrtEndWsView", */
    T: -1
  },
  /*::[*/
  139: {
    /* n:"BrtBeginCsViews", */
    T: 1
  },
  /*::[*/
  140: {
    /* n:"BrtEndCsViews", */
    T: -1
  },
  /*::[*/
  141: {
    /* n:"BrtBeginCsView", */
    T: 1
  },
  /*::[*/
  142: {
    /* n:"BrtEndCsView", */
    T: -1
  },
  /*::[*/
  143: {
    /* n:"BrtBeginBundleShs", */
    T: 1
  },
  /*::[*/
  144: {
    /* n:"BrtEndBundleShs", */
    T: -1
  },
  /*::[*/
  145: {
    /* n:"BrtBeginSheetData", */
    T: 1
  },
  /*::[*/
  146: {
    /* n:"BrtEndSheetData", */
    T: -1
  },
  /*::[*/
  147: {
    /* n:"BrtWsProp", */
    f: Vk
  },
  /*::[*/
  148: {
    /* n:"BrtWsDim", */
    f: zk,
    p: 16
  },
  /*::[*/
  151: {
    /* n:"BrtPane", */
    f: uE
  },
  /*::[*/
  152: {
    /* n:"BrtSel" */
  },
  /*::[*/
  153: {
    /* n:"BrtWbProp", */
    f: OE
  },
  /*::[*/
  154: {
    /* n:"BrtWbFactoid" */
  },
  /*::[*/
  155: {
    /* n:"BrtFileRecover" */
  },
  /*::[*/
  156: {
    /* n:"BrtBundleSh", */
    f: DE
  },
  /*::[*/
  157: {
    /* n:"BrtCalcProp" */
  },
  /*::[*/
  158: {
    /* n:"BrtBookView" */
  },
  /*::[*/
  159: {
    /* n:"BrtBeginSst", */
    T: 1,
    f: Ew
  },
  /*::[*/
  160: {
    /* n:"BrtEndSst", */
    T: -1
  },
  /*::[*/
  161: {
    /* n:"BrtBeginAFilter", */
    T: 1,
    f: La
  },
  /*::[*/
  162: {
    /* n:"BrtEndAFilter", */
    T: -1
  },
  /*::[*/
  163: {
    /* n:"BrtBeginFilterColumn", */
    T: 1
  },
  /*::[*/
  164: {
    /* n:"BrtEndFilterColumn", */
    T: -1
  },
  /*::[*/
  165: {
    /* n:"BrtBeginFilters", */
    T: 1
  },
  /*::[*/
  166: {
    /* n:"BrtEndFilters", */
    T: -1
  },
  /*::[*/
  167: {
    /* n:"BrtFilter" */
  },
  /*::[*/
  168: {
    /* n:"BrtColorFilter" */
  },
  /*::[*/
  169: {
    /* n:"BrtIconFilter" */
  },
  /*::[*/
  170: {
    /* n:"BrtTop10Filter" */
  },
  /*::[*/
  171: {
    /* n:"BrtDynamicFilter" */
  },
  /*::[*/
  172: {
    /* n:"BrtBeginCustomFilters", */
    T: 1
  },
  /*::[*/
  173: {
    /* n:"BrtEndCustomFilters", */
    T: -1
  },
  /*::[*/
  174: {
    /* n:"BrtCustomFilter" */
  },
  /*::[*/
  175: {
    /* n:"BrtAFilterDateGroupItem" */
  },
  /*::[*/
  176: {
    /* n:"BrtMergeCell", */
    f: oE
  },
  /*::[*/
  177: {
    /* n:"BrtBeginMergeCells", */
    T: 1
  },
  /*::[*/
  178: {
    /* n:"BrtEndMergeCells", */
    T: -1
  },
  /*::[*/
  179: {
    /* n:"BrtBeginPivotCacheDef", */
    T: 1
  },
  /*::[*/
  180: {
    /* n:"BrtEndPivotCacheDef", */
    T: -1
  },
  /*::[*/
  181: {
    /* n:"BrtBeginPCDFields", */
    T: 1
  },
  /*::[*/
  182: {
    /* n:"BrtEndPCDFields", */
    T: -1
  },
  /*::[*/
  183: {
    /* n:"BrtBeginPCDField", */
    T: 1
  },
  /*::[*/
  184: {
    /* n:"BrtEndPCDField", */
    T: -1
  },
  /*::[*/
  185: {
    /* n:"BrtBeginPCDSource", */
    T: 1
  },
  /*::[*/
  186: {
    /* n:"BrtEndPCDSource", */
    T: -1
  },
  /*::[*/
  187: {
    /* n:"BrtBeginPCDSRange", */
    T: 1
  },
  /*::[*/
  188: {
    /* n:"BrtEndPCDSRange", */
    T: -1
  },
  /*::[*/
  189: {
    /* n:"BrtBeginPCDFAtbl", */
    T: 1
  },
  /*::[*/
  190: {
    /* n:"BrtEndPCDFAtbl", */
    T: -1
  },
  /*::[*/
  191: {
    /* n:"BrtBeginPCDIRun", */
    T: 1
  },
  /*::[*/
  192: {
    /* n:"BrtEndPCDIRun", */
    T: -1
  },
  /*::[*/
  193: {
    /* n:"BrtBeginPivotCacheRecords", */
    T: 1
  },
  /*::[*/
  194: {
    /* n:"BrtEndPivotCacheRecords", */
    T: -1
  },
  /*::[*/
  195: {
    /* n:"BrtBeginPCDHierarchies", */
    T: 1
  },
  /*::[*/
  196: {
    /* n:"BrtEndPCDHierarchies", */
    T: -1
  },
  /*::[*/
  197: {
    /* n:"BrtBeginPCDHierarchy", */
    T: 1
  },
  /*::[*/
  198: {
    /* n:"BrtEndPCDHierarchy", */
    T: -1
  },
  /*::[*/
  199: {
    /* n:"BrtBeginPCDHFieldsUsage", */
    T: 1
  },
  /*::[*/
  200: {
    /* n:"BrtEndPCDHFieldsUsage", */
    T: -1
  },
  /*::[*/
  201: {
    /* n:"BrtBeginExtConnection", */
    T: 1
  },
  /*::[*/
  202: {
    /* n:"BrtEndExtConnection", */
    T: -1
  },
  /*::[*/
  203: {
    /* n:"BrtBeginECDbProps", */
    T: 1
  },
  /*::[*/
  204: {
    /* n:"BrtEndECDbProps", */
    T: -1
  },
  /*::[*/
  205: {
    /* n:"BrtBeginECOlapProps", */
    T: 1
  },
  /*::[*/
  206: {
    /* n:"BrtEndECOlapProps", */
    T: -1
  },
  /*::[*/
  207: {
    /* n:"BrtBeginPCDSConsol", */
    T: 1
  },
  /*::[*/
  208: {
    /* n:"BrtEndPCDSConsol", */
    T: -1
  },
  /*::[*/
  209: {
    /* n:"BrtBeginPCDSCPages", */
    T: 1
  },
  /*::[*/
  210: {
    /* n:"BrtEndPCDSCPages", */
    T: -1
  },
  /*::[*/
  211: {
    /* n:"BrtBeginPCDSCPage", */
    T: 1
  },
  /*::[*/
  212: {
    /* n:"BrtEndPCDSCPage", */
    T: -1
  },
  /*::[*/
  213: {
    /* n:"BrtBeginPCDSCPItem", */
    T: 1
  },
  /*::[*/
  214: {
    /* n:"BrtEndPCDSCPItem", */
    T: -1
  },
  /*::[*/
  215: {
    /* n:"BrtBeginPCDSCSets", */
    T: 1
  },
  /*::[*/
  216: {
    /* n:"BrtEndPCDSCSets", */
    T: -1
  },
  /*::[*/
  217: {
    /* n:"BrtBeginPCDSCSet", */
    T: 1
  },
  /*::[*/
  218: {
    /* n:"BrtEndPCDSCSet", */
    T: -1
  },
  /*::[*/
  219: {
    /* n:"BrtBeginPCDFGroup", */
    T: 1
  },
  /*::[*/
  220: {
    /* n:"BrtEndPCDFGroup", */
    T: -1
  },
  /*::[*/
  221: {
    /* n:"BrtBeginPCDFGItems", */
    T: 1
  },
  /*::[*/
  222: {
    /* n:"BrtEndPCDFGItems", */
    T: -1
  },
  /*::[*/
  223: {
    /* n:"BrtBeginPCDFGRange", */
    T: 1
  },
  /*::[*/
  224: {
    /* n:"BrtEndPCDFGRange", */
    T: -1
  },
  /*::[*/
  225: {
    /* n:"BrtBeginPCDFGDiscrete", */
    T: 1
  },
  /*::[*/
  226: {
    /* n:"BrtEndPCDFGDiscrete", */
    T: -1
  },
  /*::[*/
  227: {
    /* n:"BrtBeginPCDSDTupleCache", */
    T: 1
  },
  /*::[*/
  228: {
    /* n:"BrtEndPCDSDTupleCache", */
    T: -1
  },
  /*::[*/
  229: {
    /* n:"BrtBeginPCDSDTCEntries", */
    T: 1
  },
  /*::[*/
  230: {
    /* n:"BrtEndPCDSDTCEntries", */
    T: -1
  },
  /*::[*/
  231: {
    /* n:"BrtBeginPCDSDTCEMembers", */
    T: 1
  },
  /*::[*/
  232: {
    /* n:"BrtEndPCDSDTCEMembers", */
    T: -1
  },
  /*::[*/
  233: {
    /* n:"BrtBeginPCDSDTCEMember", */
    T: 1
  },
  /*::[*/
  234: {
    /* n:"BrtEndPCDSDTCEMember", */
    T: -1
  },
  /*::[*/
  235: {
    /* n:"BrtBeginPCDSDTCQueries", */
    T: 1
  },
  /*::[*/
  236: {
    /* n:"BrtEndPCDSDTCQueries", */
    T: -1
  },
  /*::[*/
  237: {
    /* n:"BrtBeginPCDSDTCQuery", */
    T: 1
  },
  /*::[*/
  238: {
    /* n:"BrtEndPCDSDTCQuery", */
    T: -1
  },
  /*::[*/
  239: {
    /* n:"BrtBeginPCDSDTCSets", */
    T: 1
  },
  /*::[*/
  240: {
    /* n:"BrtEndPCDSDTCSets", */
    T: -1
  },
  /*::[*/
  241: {
    /* n:"BrtBeginPCDSDTCSet", */
    T: 1
  },
  /*::[*/
  242: {
    /* n:"BrtEndPCDSDTCSet", */
    T: -1
  },
  /*::[*/
  243: {
    /* n:"BrtBeginPCDCalcItems", */
    T: 1
  },
  /*::[*/
  244: {
    /* n:"BrtEndPCDCalcItems", */
    T: -1
  },
  /*::[*/
  245: {
    /* n:"BrtBeginPCDCalcItem", */
    T: 1
  },
  /*::[*/
  246: {
    /* n:"BrtEndPCDCalcItem", */
    T: -1
  },
  /*::[*/
  247: {
    /* n:"BrtBeginPRule", */
    T: 1
  },
  /*::[*/
  248: {
    /* n:"BrtEndPRule", */
    T: -1
  },
  /*::[*/
  249: {
    /* n:"BrtBeginPRFilters", */
    T: 1
  },
  /*::[*/
  250: {
    /* n:"BrtEndPRFilters", */
    T: -1
  },
  /*::[*/
  251: {
    /* n:"BrtBeginPRFilter", */
    T: 1
  },
  /*::[*/
  252: {
    /* n:"BrtEndPRFilter", */
    T: -1
  },
  /*::[*/
  253: {
    /* n:"BrtBeginPNames", */
    T: 1
  },
  /*::[*/
  254: {
    /* n:"BrtEndPNames", */
    T: -1
  },
  /*::[*/
  255: {
    /* n:"BrtBeginPName", */
    T: 1
  },
  /*::[*/
  256: {
    /* n:"BrtEndPName", */
    T: -1
  },
  /*::[*/
  257: {
    /* n:"BrtBeginPNPairs", */
    T: 1
  },
  /*::[*/
  258: {
    /* n:"BrtEndPNPairs", */
    T: -1
  },
  /*::[*/
  259: {
    /* n:"BrtBeginPNPair", */
    T: 1
  },
  /*::[*/
  260: {
    /* n:"BrtEndPNPair", */
    T: -1
  },
  /*::[*/
  261: {
    /* n:"BrtBeginECWebProps", */
    T: 1
  },
  /*::[*/
  262: {
    /* n:"BrtEndECWebProps", */
    T: -1
  },
  /*::[*/
  263: {
    /* n:"BrtBeginEcWpTables", */
    T: 1
  },
  /*::[*/
  264: {
    /* n:"BrtEndECWPTables", */
    T: -1
  },
  /*::[*/
  265: {
    /* n:"BrtBeginECParams", */
    T: 1
  },
  /*::[*/
  266: {
    /* n:"BrtEndECParams", */
    T: -1
  },
  /*::[*/
  267: {
    /* n:"BrtBeginECParam", */
    T: 1
  },
  /*::[*/
  268: {
    /* n:"BrtEndECParam", */
    T: -1
  },
  /*::[*/
  269: {
    /* n:"BrtBeginPCDKPIs", */
    T: 1
  },
  /*::[*/
  270: {
    /* n:"BrtEndPCDKPIs", */
    T: -1
  },
  /*::[*/
  271: {
    /* n:"BrtBeginPCDKPI", */
    T: 1
  },
  /*::[*/
  272: {
    /* n:"BrtEndPCDKPI", */
    T: -1
  },
  /*::[*/
  273: {
    /* n:"BrtBeginDims", */
    T: 1
  },
  /*::[*/
  274: {
    /* n:"BrtEndDims", */
    T: -1
  },
  /*::[*/
  275: {
    /* n:"BrtBeginDim", */
    T: 1
  },
  /*::[*/
  276: {
    /* n:"BrtEndDim", */
    T: -1
  },
  /*::[*/
  277: {
    /* n:"BrtIndexPartEnd" */
  },
  /*::[*/
  278: {
    /* n:"BrtBeginStyleSheet", */
    T: 1
  },
  /*::[*/
  279: {
    /* n:"BrtEndStyleSheet", */
    T: -1
  },
  /*::[*/
  280: {
    /* n:"BrtBeginSXView", */
    T: 1
  },
  /*::[*/
  281: {
    /* n:"BrtEndSXVI", */
    T: -1
  },
  /*::[*/
  282: {
    /* n:"BrtBeginSXVI", */
    T: 1
  },
  /*::[*/
  283: {
    /* n:"BrtBeginSXVIs", */
    T: 1
  },
  /*::[*/
  284: {
    /* n:"BrtEndSXVIs", */
    T: -1
  },
  /*::[*/
  285: {
    /* n:"BrtBeginSXVD", */
    T: 1
  },
  /*::[*/
  286: {
    /* n:"BrtEndSXVD", */
    T: -1
  },
  /*::[*/
  287: {
    /* n:"BrtBeginSXVDs", */
    T: 1
  },
  /*::[*/
  288: {
    /* n:"BrtEndSXVDs", */
    T: -1
  },
  /*::[*/
  289: {
    /* n:"BrtBeginSXPI", */
    T: 1
  },
  /*::[*/
  290: {
    /* n:"BrtEndSXPI", */
    T: -1
  },
  /*::[*/
  291: {
    /* n:"BrtBeginSXPIs", */
    T: 1
  },
  /*::[*/
  292: {
    /* n:"BrtEndSXPIs", */
    T: -1
  },
  /*::[*/
  293: {
    /* n:"BrtBeginSXDI", */
    T: 1
  },
  /*::[*/
  294: {
    /* n:"BrtEndSXDI", */
    T: -1
  },
  /*::[*/
  295: {
    /* n:"BrtBeginSXDIs", */
    T: 1
  },
  /*::[*/
  296: {
    /* n:"BrtEndSXDIs", */
    T: -1
  },
  /*::[*/
  297: {
    /* n:"BrtBeginSXLI", */
    T: 1
  },
  /*::[*/
  298: {
    /* n:"BrtEndSXLI", */
    T: -1
  },
  /*::[*/
  299: {
    /* n:"BrtBeginSXLIRws", */
    T: 1
  },
  /*::[*/
  300: {
    /* n:"BrtEndSXLIRws", */
    T: -1
  },
  /*::[*/
  301: {
    /* n:"BrtBeginSXLICols", */
    T: 1
  },
  /*::[*/
  302: {
    /* n:"BrtEndSXLICols", */
    T: -1
  },
  /*::[*/
  303: {
    /* n:"BrtBeginSXFormat", */
    T: 1
  },
  /*::[*/
  304: {
    /* n:"BrtEndSXFormat", */
    T: -1
  },
  /*::[*/
  305: {
    /* n:"BrtBeginSXFormats", */
    T: 1
  },
  /*::[*/
  306: {
    /* n:"BrtEndSxFormats", */
    T: -1
  },
  /*::[*/
  307: {
    /* n:"BrtBeginSxSelect", */
    T: 1
  },
  /*::[*/
  308: {
    /* n:"BrtEndSxSelect", */
    T: -1
  },
  /*::[*/
  309: {
    /* n:"BrtBeginISXVDRws", */
    T: 1
  },
  /*::[*/
  310: {
    /* n:"BrtEndISXVDRws", */
    T: -1
  },
  /*::[*/
  311: {
    /* n:"BrtBeginISXVDCols", */
    T: 1
  },
  /*::[*/
  312: {
    /* n:"BrtEndISXVDCols", */
    T: -1
  },
  /*::[*/
  313: {
    /* n:"BrtEndSXLocation", */
    T: -1
  },
  /*::[*/
  314: {
    /* n:"BrtBeginSXLocation", */
    T: 1
  },
  /*::[*/
  315: {
    /* n:"BrtEndSXView", */
    T: -1
  },
  /*::[*/
  316: {
    /* n:"BrtBeginSXTHs", */
    T: 1
  },
  /*::[*/
  317: {
    /* n:"BrtEndSXTHs", */
    T: -1
  },
  /*::[*/
  318: {
    /* n:"BrtBeginSXTH", */
    T: 1
  },
  /*::[*/
  319: {
    /* n:"BrtEndSXTH", */
    T: -1
  },
  /*::[*/
  320: {
    /* n:"BrtBeginISXTHRws", */
    T: 1
  },
  /*::[*/
  321: {
    /* n:"BrtEndISXTHRws", */
    T: -1
  },
  /*::[*/
  322: {
    /* n:"BrtBeginISXTHCols", */
    T: 1
  },
  /*::[*/
  323: {
    /* n:"BrtEndISXTHCols", */
    T: -1
  },
  /*::[*/
  324: {
    /* n:"BrtBeginSXTDMPS", */
    T: 1
  },
  /*::[*/
  325: {
    /* n:"BrtEndSXTDMPs", */
    T: -1
  },
  /*::[*/
  326: {
    /* n:"BrtBeginSXTDMP", */
    T: 1
  },
  /*::[*/
  327: {
    /* n:"BrtEndSXTDMP", */
    T: -1
  },
  /*::[*/
  328: {
    /* n:"BrtBeginSXTHItems", */
    T: 1
  },
  /*::[*/
  329: {
    /* n:"BrtEndSXTHItems", */
    T: -1
  },
  /*::[*/
  330: {
    /* n:"BrtBeginSXTHItem", */
    T: 1
  },
  /*::[*/
  331: {
    /* n:"BrtEndSXTHItem", */
    T: -1
  },
  /*::[*/
  332: {
    /* n:"BrtBeginMetadata", */
    T: 1
  },
  /*::[*/
  333: {
    /* n:"BrtEndMetadata", */
    T: -1
  },
  /*::[*/
  334: {
    /* n:"BrtBeginEsmdtinfo", */
    T: 1
  },
  /*::[*/
  335: {
    /* n:"BrtMdtinfo", */
    f: Ay
  },
  /*::[*/
  336: {
    /* n:"BrtEndEsmdtinfo", */
    T: -1
  },
  /*::[*/
  337: {
    /* n:"BrtBeginEsmdb", */
    f: Ny,
    T: 1
  },
  /*::[*/
  338: {
    /* n:"BrtEndEsmdb", */
    T: -1
  },
  /*::[*/
  339: {
    /* n:"BrtBeginEsfmd", */
    T: 1
  },
  /*::[*/
  340: {
    /* n:"BrtEndEsfmd", */
    T: -1
  },
  /*::[*/
  341: {
    /* n:"BrtBeginSingleCells", */
    T: 1
  },
  /*::[*/
  342: {
    /* n:"BrtEndSingleCells", */
    T: -1
  },
  /*::[*/
  343: {
    /* n:"BrtBeginList", */
    T: 1
  },
  /*::[*/
  344: {
    /* n:"BrtEndList", */
    T: -1
  },
  /*::[*/
  345: {
    /* n:"BrtBeginListCols", */
    T: 1
  },
  /*::[*/
  346: {
    /* n:"BrtEndListCols", */
    T: -1
  },
  /*::[*/
  347: {
    /* n:"BrtBeginListCol", */
    T: 1
  },
  /*::[*/
  348: {
    /* n:"BrtEndListCol", */
    T: -1
  },
  /*::[*/
  349: {
    /* n:"BrtBeginListXmlCPr", */
    T: 1
  },
  /*::[*/
  350: {
    /* n:"BrtEndListXmlCPr", */
    T: -1
  },
  /*::[*/
  351: {
    /* n:"BrtListCCFmla" */
  },
  /*::[*/
  352: {
    /* n:"BrtListTrFmla" */
  },
  /*::[*/
  353: {
    /* n:"BrtBeginExternals", */
    T: 1
  },
  /*::[*/
  354: {
    /* n:"BrtEndExternals", */
    T: -1
  },
  /*::[*/
  355: {
    /* n:"BrtSupBookSrc", */
    f: _c
  },
  /*::[*/
  357: {
    /* n:"BrtSupSelf" */
  },
  /*::[*/
  358: {
    /* n:"BrtSupSame" */
  },
  /*::[*/
  359: {
    /* n:"BrtSupTabs" */
  },
  /*::[*/
  360: {
    /* n:"BrtBeginSupBook", */
    T: 1
  },
  /*::[*/
  361: {
    /* n:"BrtPlaceholderName" */
  },
  /*::[*/
  362: {
    /* n:"BrtExternSheet", */
    f: e1
  },
  /*::[*/
  363: {
    /* n:"BrtExternTableStart" */
  },
  /*::[*/
  364: {
    /* n:"BrtExternTableEnd" */
  },
  /*::[*/
  366: {
    /* n:"BrtExternRowHdr" */
  },
  /*::[*/
  367: {
    /* n:"BrtExternCellBlank" */
  },
  /*::[*/
  368: {
    /* n:"BrtExternCellReal" */
  },
  /*::[*/
  369: {
    /* n:"BrtExternCellBool" */
  },
  /*::[*/
  370: {
    /* n:"BrtExternCellError" */
  },
  /*::[*/
  371: {
    /* n:"BrtExternCellString" */
  },
  /*::[*/
  372: {
    /* n:"BrtBeginEsmdx", */
    T: 1
  },
  /*::[*/
  373: {
    /* n:"BrtEndEsmdx", */
    T: -1
  },
  /*::[*/
  374: {
    /* n:"BrtBeginMdxSet", */
    T: 1
  },
  /*::[*/
  375: {
    /* n:"BrtEndMdxSet", */
    T: -1
  },
  /*::[*/
  376: {
    /* n:"BrtBeginMdxMbrProp", */
    T: 1
  },
  /*::[*/
  377: {
    /* n:"BrtEndMdxMbrProp", */
    T: -1
  },
  /*::[*/
  378: {
    /* n:"BrtBeginMdxKPI", */
    T: 1
  },
  /*::[*/
  379: {
    /* n:"BrtEndMdxKPI", */
    T: -1
  },
  /*::[*/
  380: {
    /* n:"BrtBeginEsstr", */
    T: 1
  },
  /*::[*/
  381: {
    /* n:"BrtEndEsstr", */
    T: -1
  },
  /*::[*/
  382: {
    /* n:"BrtBeginPRFItem", */
    T: 1
  },
  /*::[*/
  383: {
    /* n:"BrtEndPRFItem", */
    T: -1
  },
  /*::[*/
  384: {
    /* n:"BrtBeginPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  385: {
    /* n:"BrtEndPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  386: {
    /* n:"BrtBeginPivotCacheID", */
    T: 1
  },
  /*::[*/
  387: {
    /* n:"BrtEndPivotCacheID", */
    T: -1
  },
  /*::[*/
  388: {
    /* n:"BrtBeginISXVIs", */
    T: 1
  },
  /*::[*/
  389: {
    /* n:"BrtEndISXVIs", */
    T: -1
  },
  /*::[*/
  390: {
    /* n:"BrtBeginColInfos", */
    T: 1
  },
  /*::[*/
  391: {
    /* n:"BrtEndColInfos", */
    T: -1
  },
  /*::[*/
  392: {
    /* n:"BrtBeginRwBrk", */
    T: 1
  },
  /*::[*/
  393: {
    /* n:"BrtEndRwBrk", */
    T: -1
  },
  /*::[*/
  394: {
    /* n:"BrtBeginColBrk", */
    T: 1
  },
  /*::[*/
  395: {
    /* n:"BrtEndColBrk", */
    T: -1
  },
  /*::[*/
  396: {
    /* n:"BrtBrk" */
  },
  /*::[*/
  397: {
    /* n:"BrtUserBookView" */
  },
  /*::[*/
  398: {
    /* n:"BrtInfo" */
  },
  /*::[*/
  399: {
    /* n:"BrtCUsr" */
  },
  /*::[*/
  400: {
    /* n:"BrtUsr" */
  },
  /*::[*/
  401: {
    /* n:"BrtBeginUsers", */
    T: 1
  },
  /*::[*/
  403: {
    /* n:"BrtEOF" */
  },
  /*::[*/
  404: {
    /* n:"BrtUCR" */
  },
  /*::[*/
  405: {
    /* n:"BrtRRInsDel" */
  },
  /*::[*/
  406: {
    /* n:"BrtRREndInsDel" */
  },
  /*::[*/
  407: {
    /* n:"BrtRRMove" */
  },
  /*::[*/
  408: {
    /* n:"BrtRREndMove" */
  },
  /*::[*/
  409: {
    /* n:"BrtRRChgCell" */
  },
  /*::[*/
  410: {
    /* n:"BrtRREndChgCell" */
  },
  /*::[*/
  411: {
    /* n:"BrtRRHeader" */
  },
  /*::[*/
  412: {
    /* n:"BrtRRUserView" */
  },
  /*::[*/
  413: {
    /* n:"BrtRRRenSheet" */
  },
  /*::[*/
  414: {
    /* n:"BrtRRInsertSh" */
  },
  /*::[*/
  415: {
    /* n:"BrtRRDefName" */
  },
  /*::[*/
  416: {
    /* n:"BrtRRNote" */
  },
  /*::[*/
  417: {
    /* n:"BrtRRConflict" */
  },
  /*::[*/
  418: {
    /* n:"BrtRRTQSIF" */
  },
  /*::[*/
  419: {
    /* n:"BrtRRFormat" */
  },
  /*::[*/
  420: {
    /* n:"BrtRREndFormat" */
  },
  /*::[*/
  421: {
    /* n:"BrtRRAutoFmt" */
  },
  /*::[*/
  422: {
    /* n:"BrtBeginUserShViews", */
    T: 1
  },
  /*::[*/
  423: {
    /* n:"BrtBeginUserShView", */
    T: 1
  },
  /*::[*/
  424: {
    /* n:"BrtEndUserShView", */
    T: -1
  },
  /*::[*/
  425: {
    /* n:"BrtEndUserShViews", */
    T: -1
  },
  /*::[*/
  426: {
    /* n:"BrtArrFmla", */
    f: fE
  },
  /*::[*/
  427: {
    /* n:"BrtShrFmla", */
    f: dE
  },
  /*::[*/
  428: {
    /* n:"BrtTable" */
  },
  /*::[*/
  429: {
    /* n:"BrtBeginExtConnections", */
    T: 1
  },
  /*::[*/
  430: {
    /* n:"BrtEndExtConnections", */
    T: -1
  },
  /*::[*/
  431: {
    /* n:"BrtBeginPCDCalcMems", */
    T: 1
  },
  /*::[*/
  432: {
    /* n:"BrtEndPCDCalcMems", */
    T: -1
  },
  /*::[*/
  433: {
    /* n:"BrtBeginPCDCalcMem", */
    T: 1
  },
  /*::[*/
  434: {
    /* n:"BrtEndPCDCalcMem", */
    T: -1
  },
  /*::[*/
  435: {
    /* n:"BrtBeginPCDHGLevels", */
    T: 1
  },
  /*::[*/
  436: {
    /* n:"BrtEndPCDHGLevels", */
    T: -1
  },
  /*::[*/
  437: {
    /* n:"BrtBeginPCDHGLevel", */
    T: 1
  },
  /*::[*/
  438: {
    /* n:"BrtEndPCDHGLevel", */
    T: -1
  },
  /*::[*/
  439: {
    /* n:"BrtBeginPCDHGLGroups", */
    T: 1
  },
  /*::[*/
  440: {
    /* n:"BrtEndPCDHGLGroups", */
    T: -1
  },
  /*::[*/
  441: {
    /* n:"BrtBeginPCDHGLGroup", */
    T: 1
  },
  /*::[*/
  442: {
    /* n:"BrtEndPCDHGLGroup", */
    T: -1
  },
  /*::[*/
  443: {
    /* n:"BrtBeginPCDHGLGMembers", */
    T: 1
  },
  /*::[*/
  444: {
    /* n:"BrtEndPCDHGLGMembers", */
    T: -1
  },
  /*::[*/
  445: {
    /* n:"BrtBeginPCDHGLGMember", */
    T: 1
  },
  /*::[*/
  446: {
    /* n:"BrtEndPCDHGLGMember", */
    T: -1
  },
  /*::[*/
  447: {
    /* n:"BrtBeginQSI", */
    T: 1
  },
  /*::[*/
  448: {
    /* n:"BrtEndQSI", */
    T: -1
  },
  /*::[*/
  449: {
    /* n:"BrtBeginQSIR", */
    T: 1
  },
  /*::[*/
  450: {
    /* n:"BrtEndQSIR", */
    T: -1
  },
  /*::[*/
  451: {
    /* n:"BrtBeginDeletedNames", */
    T: 1
  },
  /*::[*/
  452: {
    /* n:"BrtEndDeletedNames", */
    T: -1
  },
  /*::[*/
  453: {
    /* n:"BrtBeginDeletedName", */
    T: 1
  },
  /*::[*/
  454: {
    /* n:"BrtEndDeletedName", */
    T: -1
  },
  /*::[*/
  455: {
    /* n:"BrtBeginQSIFs", */
    T: 1
  },
  /*::[*/
  456: {
    /* n:"BrtEndQSIFs", */
    T: -1
  },
  /*::[*/
  457: {
    /* n:"BrtBeginQSIF", */
    T: 1
  },
  /*::[*/
  458: {
    /* n:"BrtEndQSIF", */
    T: -1
  },
  /*::[*/
  459: {
    /* n:"BrtBeginAutoSortScope", */
    T: 1
  },
  /*::[*/
  460: {
    /* n:"BrtEndAutoSortScope", */
    T: -1
  },
  /*::[*/
  461: {
    /* n:"BrtBeginConditionalFormatting", */
    T: 1
  },
  /*::[*/
  462: {
    /* n:"BrtEndConditionalFormatting", */
    T: -1
  },
  /*::[*/
  463: {
    /* n:"BrtBeginCFRule", */
    T: 1
  },
  /*::[*/
  464: {
    /* n:"BrtEndCFRule", */
    T: -1
  },
  /*::[*/
  465: {
    /* n:"BrtBeginIconSet", */
    T: 1
  },
  /*::[*/
  466: {
    /* n:"BrtEndIconSet", */
    T: -1
  },
  /*::[*/
  467: {
    /* n:"BrtBeginDatabar", */
    T: 1
  },
  /*::[*/
  468: {
    /* n:"BrtEndDatabar", */
    T: -1
  },
  /*::[*/
  469: {
    /* n:"BrtBeginColorScale", */
    T: 1
  },
  /*::[*/
  470: {
    /* n:"BrtEndColorScale", */
    T: -1
  },
  /*::[*/
  471: {
    /* n:"BrtCFVO" */
  },
  /*::[*/
  472: {
    /* n:"BrtExternValueMeta" */
  },
  /*::[*/
  473: {
    /* n:"BrtBeginColorPalette", */
    T: 1
  },
  /*::[*/
  474: {
    /* n:"BrtEndColorPalette", */
    T: -1
  },
  /*::[*/
  475: {
    /* n:"BrtIndexedColor" */
  },
  /*::[*/
  476: {
    /* n:"BrtMargins", */
    f: pE
  },
  /*::[*/
  477: {
    /* n:"BrtPrintOptions" */
  },
  /*::[*/
  478: {
    /* n:"BrtPageSetup" */
  },
  /*::[*/
  479: {
    /* n:"BrtBeginHeaderFooter", */
    T: 1
  },
  /*::[*/
  480: {
    /* n:"BrtEndHeaderFooter", */
    T: -1
  },
  /*::[*/
  481: {
    /* n:"BrtBeginSXCrtFormat", */
    T: 1
  },
  /*::[*/
  482: {
    /* n:"BrtEndSXCrtFormat", */
    T: -1
  },
  /*::[*/
  483: {
    /* n:"BrtBeginSXCrtFormats", */
    T: 1
  },
  /*::[*/
  484: {
    /* n:"BrtEndSXCrtFormats", */
    T: -1
  },
  /*::[*/
  485: {
    /* n:"BrtWsFmtInfo", */
    f: Hk
  },
  /*::[*/
  486: {
    /* n:"BrtBeginMgs", */
    T: 1
  },
  /*::[*/
  487: {
    /* n:"BrtEndMGs", */
    T: -1
  },
  /*::[*/
  488: {
    /* n:"BrtBeginMGMaps", */
    T: 1
  },
  /*::[*/
  489: {
    /* n:"BrtEndMGMaps", */
    T: -1
  },
  /*::[*/
  490: {
    /* n:"BrtBeginMG", */
    T: 1
  },
  /*::[*/
  491: {
    /* n:"BrtEndMG", */
    T: -1
  },
  /*::[*/
  492: {
    /* n:"BrtBeginMap", */
    T: 1
  },
  /*::[*/
  493: {
    /* n:"BrtEndMap", */
    T: -1
  },
  /*::[*/
  494: {
    /* n:"BrtHLink", */
    f: cE
  },
  /*::[*/
  495: {
    /* n:"BrtBeginDCon", */
    T: 1
  },
  /*::[*/
  496: {
    /* n:"BrtEndDCon", */
    T: -1
  },
  /*::[*/
  497: {
    /* n:"BrtBeginDRefs", */
    T: 1
  },
  /*::[*/
  498: {
    /* n:"BrtEndDRefs", */
    T: -1
  },
  /*::[*/
  499: {
    /* n:"BrtDRef" */
  },
  /*::[*/
  500: {
    /* n:"BrtBeginScenMan", */
    T: 1
  },
  /*::[*/
  501: {
    /* n:"BrtEndScenMan", */
    T: -1
  },
  /*::[*/
  502: {
    /* n:"BrtBeginSct", */
    T: 1
  },
  /*::[*/
  503: {
    /* n:"BrtEndSct", */
    T: -1
  },
  /*::[*/
  504: {
    /* n:"BrtSlc" */
  },
  /*::[*/
  505: {
    /* n:"BrtBeginDXFs", */
    T: 1
  },
  /*::[*/
  506: {
    /* n:"BrtEndDXFs", */
    T: -1
  },
  /*::[*/
  507: {
    /* n:"BrtDXF" */
  },
  /*::[*/
  508: {
    /* n:"BrtBeginTableStyles", */
    T: 1
  },
  /*::[*/
  509: {
    /* n:"BrtEndTableStyles", */
    T: -1
  },
  /*::[*/
  510: {
    /* n:"BrtBeginTableStyle", */
    T: 1
  },
  /*::[*/
  511: {
    /* n:"BrtEndTableStyle", */
    T: -1
  },
  /*::[*/
  512: {
    /* n:"BrtTableStyleElement" */
  },
  /*::[*/
  513: {
    /* n:"BrtTableStyleClient" */
  },
  /*::[*/
  514: {
    /* n:"BrtBeginVolDeps", */
    T: 1
  },
  /*::[*/
  515: {
    /* n:"BrtEndVolDeps", */
    T: -1
  },
  /*::[*/
  516: {
    /* n:"BrtBeginVolType", */
    T: 1
  },
  /*::[*/
  517: {
    /* n:"BrtEndVolType", */
    T: -1
  },
  /*::[*/
  518: {
    /* n:"BrtBeginVolMain", */
    T: 1
  },
  /*::[*/
  519: {
    /* n:"BrtEndVolMain", */
    T: -1
  },
  /*::[*/
  520: {
    /* n:"BrtBeginVolTopic", */
    T: 1
  },
  /*::[*/
  521: {
    /* n:"BrtEndVolTopic", */
    T: -1
  },
  /*::[*/
  522: {
    /* n:"BrtVolSubtopic" */
  },
  /*::[*/
  523: {
    /* n:"BrtVolRef" */
  },
  /*::[*/
  524: {
    /* n:"BrtVolNum" */
  },
  /*::[*/
  525: {
    /* n:"BrtVolErr" */
  },
  /*::[*/
  526: {
    /* n:"BrtVolStr" */
  },
  /*::[*/
  527: {
    /* n:"BrtVolBool" */
  },
  /*::[*/
  528: {
    /* n:"BrtBeginCalcChain$", */
    T: 1
  },
  /*::[*/
  529: {
    /* n:"BrtEndCalcChain$", */
    T: -1
  },
  /*::[*/
  530: {
    /* n:"BrtBeginSortState", */
    T: 1
  },
  /*::[*/
  531: {
    /* n:"BrtEndSortState", */
    T: -1
  },
  /*::[*/
  532: {
    /* n:"BrtBeginSortCond", */
    T: 1
  },
  /*::[*/
  533: {
    /* n:"BrtEndSortCond", */
    T: -1
  },
  /*::[*/
  534: {
    /* n:"BrtBookProtection" */
  },
  /*::[*/
  535: {
    /* n:"BrtSheetProtection" */
  },
  /*::[*/
  536: {
    /* n:"BrtRangeProtection" */
  },
  /*::[*/
  537: {
    /* n:"BrtPhoneticInfo" */
  },
  /*::[*/
  538: {
    /* n:"BrtBeginECTxtWiz", */
    T: 1
  },
  /*::[*/
  539: {
    /* n:"BrtEndECTxtWiz", */
    T: -1
  },
  /*::[*/
  540: {
    /* n:"BrtBeginECTWFldInfoLst", */
    T: 1
  },
  /*::[*/
  541: {
    /* n:"BrtEndECTWFldInfoLst", */
    T: -1
  },
  /*::[*/
  542: {
    /* n:"BrtBeginECTwFldInfo", */
    T: 1
  },
  /*::[*/
  548: {
    /* n:"BrtFileSharing" */
  },
  /*::[*/
  549: {
    /* n:"BrtOleSize" */
  },
  /*::[*/
  550: {
    /* n:"BrtDrawing", */
    f: _c
  },
  /*::[*/
  551: {
    /* n:"BrtLegacyDrawing" */
  },
  /*::[*/
  552: {
    /* n:"BrtLegacyDrawingHF" */
  },
  /*::[*/
  553: {
    /* n:"BrtWebOpt" */
  },
  /*::[*/
  554: {
    /* n:"BrtBeginWebPubItems", */
    T: 1
  },
  /*::[*/
  555: {
    /* n:"BrtEndWebPubItems", */
    T: -1
  },
  /*::[*/
  556: {
    /* n:"BrtBeginWebPubItem", */
    T: 1
  },
  /*::[*/
  557: {
    /* n:"BrtEndWebPubItem", */
    T: -1
  },
  /*::[*/
  558: {
    /* n:"BrtBeginSXCondFmt", */
    T: 1
  },
  /*::[*/
  559: {
    /* n:"BrtEndSXCondFmt", */
    T: -1
  },
  /*::[*/
  560: {
    /* n:"BrtBeginSXCondFmts", */
    T: 1
  },
  /*::[*/
  561: {
    /* n:"BrtEndSXCondFmts", */
    T: -1
  },
  /*::[*/
  562: {
    /* n:"BrtBkHim" */
  },
  /*::[*/
  564: {
    /* n:"BrtColor" */
  },
  /*::[*/
  565: {
    /* n:"BrtBeginIndexedColors", */
    T: 1
  },
  /*::[*/
  566: {
    /* n:"BrtEndIndexedColors", */
    T: -1
  },
  /*::[*/
  569: {
    /* n:"BrtBeginMRUColors", */
    T: 1
  },
  /*::[*/
  570: {
    /* n:"BrtEndMRUColors", */
    T: -1
  },
  /*::[*/
  572: {
    /* n:"BrtMRUColor" */
  },
  /*::[*/
  573: {
    /* n:"BrtBeginDVals", */
    T: 1
  },
  /*::[*/
  574: {
    /* n:"BrtEndDVals", */
    T: -1
  },
  /*::[*/
  577: {
    /* n:"BrtSupNameStart" */
  },
  /*::[*/
  578: {
    /* n:"BrtSupNameValueStart" */
  },
  /*::[*/
  579: {
    /* n:"BrtSupNameValueEnd" */
  },
  /*::[*/
  580: {
    /* n:"BrtSupNameNum" */
  },
  /*::[*/
  581: {
    /* n:"BrtSupNameErr" */
  },
  /*::[*/
  582: {
    /* n:"BrtSupNameSt" */
  },
  /*::[*/
  583: {
    /* n:"BrtSupNameNil" */
  },
  /*::[*/
  584: {
    /* n:"BrtSupNameBool" */
  },
  /*::[*/
  585: {
    /* n:"BrtSupNameFmla" */
  },
  /*::[*/
  586: {
    /* n:"BrtSupNameBits" */
  },
  /*::[*/
  587: {
    /* n:"BrtSupNameEnd" */
  },
  /*::[*/
  588: {
    /* n:"BrtEndSupBook", */
    T: -1
  },
  /*::[*/
  589: {
    /* n:"BrtCellSmartTagProperty" */
  },
  /*::[*/
  590: {
    /* n:"BrtBeginCellSmartTag", */
    T: 1
  },
  /*::[*/
  591: {
    /* n:"BrtEndCellSmartTag", */
    T: -1
  },
  /*::[*/
  592: {
    /* n:"BrtBeginCellSmartTags", */
    T: 1
  },
  /*::[*/
  593: {
    /* n:"BrtEndCellSmartTags", */
    T: -1
  },
  /*::[*/
  594: {
    /* n:"BrtBeginSmartTags", */
    T: 1
  },
  /*::[*/
  595: {
    /* n:"BrtEndSmartTags", */
    T: -1
  },
  /*::[*/
  596: {
    /* n:"BrtSmartTagType" */
  },
  /*::[*/
  597: {
    /* n:"BrtBeginSmartTagTypes", */
    T: 1
  },
  /*::[*/
  598: {
    /* n:"BrtEndSmartTagTypes", */
    T: -1
  },
  /*::[*/
  599: {
    /* n:"BrtBeginSXFilters", */
    T: 1
  },
  /*::[*/
  600: {
    /* n:"BrtEndSXFilters", */
    T: -1
  },
  /*::[*/
  601: {
    /* n:"BrtBeginSXFILTER", */
    T: 1
  },
  /*::[*/
  602: {
    /* n:"BrtEndSXFilter", */
    T: -1
  },
  /*::[*/
  603: {
    /* n:"BrtBeginFills", */
    T: 1
  },
  /*::[*/
  604: {
    /* n:"BrtEndFills", */
    T: -1
  },
  /*::[*/
  605: {
    /* n:"BrtBeginCellWatches", */
    T: 1
  },
  /*::[*/
  606: {
    /* n:"BrtEndCellWatches", */
    T: -1
  },
  /*::[*/
  607: {
    /* n:"BrtCellWatch" */
  },
  /*::[*/
  608: {
    /* n:"BrtBeginCRErrs", */
    T: 1
  },
  /*::[*/
  609: {
    /* n:"BrtEndCRErrs", */
    T: -1
  },
  /*::[*/
  610: {
    /* n:"BrtCrashRecErr" */
  },
  /*::[*/
  611: {
    /* n:"BrtBeginFonts", */
    T: 1
  },
  /*::[*/
  612: {
    /* n:"BrtEndFonts", */
    T: -1
  },
  /*::[*/
  613: {
    /* n:"BrtBeginBorders", */
    T: 1
  },
  /*::[*/
  614: {
    /* n:"BrtEndBorders", */
    T: -1
  },
  /*::[*/
  615: {
    /* n:"BrtBeginFmts", */
    T: 1
  },
  /*::[*/
  616: {
    /* n:"BrtEndFmts", */
    T: -1
  },
  /*::[*/
  617: {
    /* n:"BrtBeginCellXFs", */
    T: 1
  },
  /*::[*/
  618: {
    /* n:"BrtEndCellXFs", */
    T: -1
  },
  /*::[*/
  619: {
    /* n:"BrtBeginStyles", */
    T: 1
  },
  /*::[*/
  620: {
    /* n:"BrtEndStyles", */
    T: -1
  },
  /*::[*/
  625: {
    /* n:"BrtBigName" */
  },
  /*::[*/
  626: {
    /* n:"BrtBeginCellStyleXFs", */
    T: 1
  },
  /*::[*/
  627: {
    /* n:"BrtEndCellStyleXFs", */
    T: -1
  },
  /*::[*/
  628: {
    /* n:"BrtBeginComments", */
    T: 1
  },
  /*::[*/
  629: {
    /* n:"BrtEndComments", */
    T: -1
  },
  /*::[*/
  630: {
    /* n:"BrtBeginCommentAuthors", */
    T: 1
  },
  /*::[*/
  631: {
    /* n:"BrtEndCommentAuthors", */
    T: -1
  },
  /*::[*/
  632: {
    /* n:"BrtCommentAuthor", */
    f: zy
  },
  /*::[*/
  633: {
    /* n:"BrtBeginCommentList", */
    T: 1
  },
  /*::[*/
  634: {
    /* n:"BrtEndCommentList", */
    T: -1
  },
  /*::[*/
  635: {
    /* n:"BrtBeginComment", */
    T: 1,
    f: Uy
  },
  /*::[*/
  636: {
    /* n:"BrtEndComment", */
    T: -1
  },
  /*::[*/
  637: {
    /* n:"BrtCommentText", */
    f: uv
  },
  /*::[*/
  638: {
    /* n:"BrtBeginOleObjects", */
    T: 1
  },
  /*::[*/
  639: {
    /* n:"BrtOleObject" */
  },
  /*::[*/
  640: {
    /* n:"BrtEndOleObjects", */
    T: -1
  },
  /*::[*/
  641: {
    /* n:"BrtBeginSxrules", */
    T: 1
  },
  /*::[*/
  642: {
    /* n:"BrtEndSxRules", */
    T: -1
  },
  /*::[*/
  643: {
    /* n:"BrtBeginActiveXControls", */
    T: 1
  },
  /*::[*/
  644: {
    /* n:"BrtActiveX" */
  },
  /*::[*/
  645: {
    /* n:"BrtEndActiveXControls", */
    T: -1
  },
  /*::[*/
  646: {
    /* n:"BrtBeginPCDSDTCEMembersSortBy", */
    T: 1
  },
  /*::[*/
  648: {
    /* n:"BrtBeginCellIgnoreECs", */
    T: 1
  },
  /*::[*/
  649: {
    /* n:"BrtCellIgnoreEC" */
  },
  /*::[*/
  650: {
    /* n:"BrtEndCellIgnoreECs", */
    T: -1
  },
  /*::[*/
  651: {
    /* n:"BrtCsProp", */
    f: kE
  },
  /*::[*/
  652: {
    /* n:"BrtCsPageSetup" */
  },
  /*::[*/
  653: {
    /* n:"BrtBeginUserCsViews", */
    T: 1
  },
  /*::[*/
  654: {
    /* n:"BrtEndUserCsViews", */
    T: -1
  },
  /*::[*/
  655: {
    /* n:"BrtBeginUserCsView", */
    T: 1
  },
  /*::[*/
  656: {
    /* n:"BrtEndUserCsView", */
    T: -1
  },
  /*::[*/
  657: {
    /* n:"BrtBeginPcdSFCIEntries", */
    T: 1
  },
  /*::[*/
  658: {
    /* n:"BrtEndPCDSFCIEntries", */
    T: -1
  },
  /*::[*/
  659: {
    /* n:"BrtPCDSFCIEntry" */
  },
  /*::[*/
  660: {
    /* n:"BrtBeginListParts", */
    T: 1
  },
  /*::[*/
  661: {
    /* n:"BrtListPart" */
  },
  /*::[*/
  662: {
    /* n:"BrtEndListParts", */
    T: -1
  },
  /*::[*/
  663: {
    /* n:"BrtSheetCalcProp" */
  },
  /*::[*/
  664: {
    /* n:"BrtBeginFnGroup", */
    T: 1
  },
  /*::[*/
  665: {
    /* n:"BrtFnGroup" */
  },
  /*::[*/
  666: {
    /* n:"BrtEndFnGroup", */
    T: -1
  },
  /*::[*/
  667: {
    /* n:"BrtSupAddin" */
  },
  /*::[*/
  668: {
    /* n:"BrtSXTDMPOrder" */
  },
  /*::[*/
  669: {
    /* n:"BrtCsProtection" */
  },
  /*::[*/
  671: {
    /* n:"BrtBeginWsSortMap", */
    T: 1
  },
  /*::[*/
  672: {
    /* n:"BrtEndWsSortMap", */
    T: -1
  },
  /*::[*/
  673: {
    /* n:"BrtBeginRRSort", */
    T: 1
  },
  /*::[*/
  674: {
    /* n:"BrtEndRRSort", */
    T: -1
  },
  /*::[*/
  675: {
    /* n:"BrtRRSortItem" */
  },
  /*::[*/
  676: {
    /* n:"BrtFileSharingIso" */
  },
  /*::[*/
  677: {
    /* n:"BrtBookProtectionIso" */
  },
  /*::[*/
  678: {
    /* n:"BrtSheetProtectionIso" */
  },
  /*::[*/
  679: {
    /* n:"BrtCsProtectionIso" */
  },
  /*::[*/
  680: {
    /* n:"BrtRangeProtectionIso" */
  },
  /*::[*/
  681: {
    /* n:"BrtDValList" */
  },
  /*::[*/
  1024: {
    /* n:"BrtRwDescent" */
  },
  /*::[*/
  1025: {
    /* n:"BrtKnownFonts" */
  },
  /*::[*/
  1026: {
    /* n:"BrtBeginSXTupleSet", */
    T: 1
  },
  /*::[*/
  1027: {
    /* n:"BrtEndSXTupleSet", */
    T: -1
  },
  /*::[*/
  1028: {
    /* n:"BrtBeginSXTupleSetHeader", */
    T: 1
  },
  /*::[*/
  1029: {
    /* n:"BrtEndSXTupleSetHeader", */
    T: -1
  },
  /*::[*/
  1030: {
    /* n:"BrtSXTupleSetHeaderItem" */
  },
  /*::[*/
  1031: {
    /* n:"BrtBeginSXTupleSetData", */
    T: 1
  },
  /*::[*/
  1032: {
    /* n:"BrtEndSXTupleSetData", */
    T: -1
  },
  /*::[*/
  1033: {
    /* n:"BrtBeginSXTupleSetRow", */
    T: 1
  },
  /*::[*/
  1034: {
    /* n:"BrtEndSXTupleSetRow", */
    T: -1
  },
  /*::[*/
  1035: {
    /* n:"BrtSXTupleSetRowItem" */
  },
  /*::[*/
  1036: {
    /* n:"BrtNameExt" */
  },
  /*::[*/
  1037: {
    /* n:"BrtPCDH14" */
  },
  /*::[*/
  1038: {
    /* n:"BrtBeginPCDCalcMem14", */
    T: 1
  },
  /*::[*/
  1039: {
    /* n:"BrtEndPCDCalcMem14", */
    T: -1
  },
  /*::[*/
  1040: {
    /* n:"BrtSXTH14" */
  },
  /*::[*/
  1041: {
    /* n:"BrtBeginSparklineGroup", */
    T: 1
  },
  /*::[*/
  1042: {
    /* n:"BrtEndSparklineGroup", */
    T: -1
  },
  /*::[*/
  1043: {
    /* n:"BrtSparkline" */
  },
  /*::[*/
  1044: {
    /* n:"BrtSXDI14" */
  },
  /*::[*/
  1045: {
    /* n:"BrtWsFmtInfoEx14" */
  },
  /*::[*/
  1046: {
    /* n:"BrtBeginConditionalFormatting14", */
    T: 1
  },
  /*::[*/
  1047: {
    /* n:"BrtEndConditionalFormatting14", */
    T: -1
  },
  /*::[*/
  1048: {
    /* n:"BrtBeginCFRule14", */
    T: 1
  },
  /*::[*/
  1049: {
    /* n:"BrtEndCFRule14", */
    T: -1
  },
  /*::[*/
  1050: {
    /* n:"BrtCFVO14" */
  },
  /*::[*/
  1051: {
    /* n:"BrtBeginDatabar14", */
    T: 1
  },
  /*::[*/
  1052: {
    /* n:"BrtBeginIconSet14", */
    T: 1
  },
  /*::[*/
  1053: {
    /* n:"BrtDVal14", */
    f: gE
  },
  /*::[*/
  1054: {
    /* n:"BrtBeginDVals14", */
    T: 1
  },
  /*::[*/
  1055: {
    /* n:"BrtColor14" */
  },
  /*::[*/
  1056: {
    /* n:"BrtBeginSparklines", */
    T: 1
  },
  /*::[*/
  1057: {
    /* n:"BrtEndSparklines", */
    T: -1
  },
  /*::[*/
  1058: {
    /* n:"BrtBeginSparklineGroups", */
    T: 1
  },
  /*::[*/
  1059: {
    /* n:"BrtEndSparklineGroups", */
    T: -1
  },
  /*::[*/
  1061: {
    /* n:"BrtSXVD14" */
  },
  /*::[*/
  1062: {
    /* n:"BrtBeginSXView14", */
    T: 1
  },
  /*::[*/
  1063: {
    /* n:"BrtEndSXView14", */
    T: -1
  },
  /*::[*/
  1064: {
    /* n:"BrtBeginSXView16", */
    T: 1
  },
  /*::[*/
  1065: {
    /* n:"BrtEndSXView16", */
    T: -1
  },
  /*::[*/
  1066: {
    /* n:"BrtBeginPCD14", */
    T: 1
  },
  /*::[*/
  1067: {
    /* n:"BrtEndPCD14", */
    T: -1
  },
  /*::[*/
  1068: {
    /* n:"BrtBeginExtConn14", */
    T: 1
  },
  /*::[*/
  1069: {
    /* n:"BrtEndExtConn14", */
    T: -1
  },
  /*::[*/
  1070: {
    /* n:"BrtBeginSlicerCacheIDs", */
    T: 1
  },
  /*::[*/
  1071: {
    /* n:"BrtEndSlicerCacheIDs", */
    T: -1
  },
  /*::[*/
  1072: {
    /* n:"BrtBeginSlicerCacheID", */
    T: 1
  },
  /*::[*/
  1073: {
    /* n:"BrtEndSlicerCacheID", */
    T: -1
  },
  /*::[*/
  1075: {
    /* n:"BrtBeginSlicerCache", */
    T: 1
  },
  /*::[*/
  1076: {
    /* n:"BrtEndSlicerCache", */
    T: -1
  },
  /*::[*/
  1077: {
    /* n:"BrtBeginSlicerCacheDef", */
    T: 1
  },
  /*::[*/
  1078: {
    /* n:"BrtEndSlicerCacheDef", */
    T: -1
  },
  /*::[*/
  1079: {
    /* n:"BrtBeginSlicersEx", */
    T: 1
  },
  /*::[*/
  1080: {
    /* n:"BrtEndSlicersEx", */
    T: -1
  },
  /*::[*/
  1081: {
    /* n:"BrtBeginSlicerEx", */
    T: 1
  },
  /*::[*/
  1082: {
    /* n:"BrtEndSlicerEx", */
    T: -1
  },
  /*::[*/
  1083: {
    /* n:"BrtBeginSlicer", */
    T: 1
  },
  /*::[*/
  1084: {
    /* n:"BrtEndSlicer", */
    T: -1
  },
  /*::[*/
  1085: {
    /* n:"BrtSlicerCachePivotTables" */
  },
  /*::[*/
  1086: {
    /* n:"BrtBeginSlicerCacheOlapImpl", */
    T: 1
  },
  /*::[*/
  1087: {
    /* n:"BrtEndSlicerCacheOlapImpl", */
    T: -1
  },
  /*::[*/
  1088: {
    /* n:"BrtBeginSlicerCacheLevelsData", */
    T: 1
  },
  /*::[*/
  1089: {
    /* n:"BrtEndSlicerCacheLevelsData", */
    T: -1
  },
  /*::[*/
  1090: {
    /* n:"BrtBeginSlicerCacheLevelData", */
    T: 1
  },
  /*::[*/
  1091: {
    /* n:"BrtEndSlicerCacheLevelData", */
    T: -1
  },
  /*::[*/
  1092: {
    /* n:"BrtBeginSlicerCacheSiRanges", */
    T: 1
  },
  /*::[*/
  1093: {
    /* n:"BrtEndSlicerCacheSiRanges", */
    T: -1
  },
  /*::[*/
  1094: {
    /* n:"BrtBeginSlicerCacheSiRange", */
    T: 1
  },
  /*::[*/
  1095: {
    /* n:"BrtEndSlicerCacheSiRange", */
    T: -1
  },
  /*::[*/
  1096: {
    /* n:"BrtSlicerCacheOlapItem" */
  },
  /*::[*/
  1097: {
    /* n:"BrtBeginSlicerCacheSelections", */
    T: 1
  },
  /*::[*/
  1098: {
    /* n:"BrtSlicerCacheSelection" */
  },
  /*::[*/
  1099: {
    /* n:"BrtEndSlicerCacheSelections", */
    T: -1
  },
  /*::[*/
  1100: {
    /* n:"BrtBeginSlicerCacheNative", */
    T: 1
  },
  /*::[*/
  1101: {
    /* n:"BrtEndSlicerCacheNative", */
    T: -1
  },
  /*::[*/
  1102: {
    /* n:"BrtSlicerCacheNativeItem" */
  },
  /*::[*/
  1103: {
    /* n:"BrtRangeProtection14" */
  },
  /*::[*/
  1104: {
    /* n:"BrtRangeProtectionIso14" */
  },
  /*::[*/
  1105: {
    /* n:"BrtCellIgnoreEC14" */
  },
  /*::[*/
  1111: {
    /* n:"BrtList14" */
  },
  /*::[*/
  1112: {
    /* n:"BrtCFIcon" */
  },
  /*::[*/
  1113: {
    /* n:"BrtBeginSlicerCachesPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  1114: {
    /* n:"BrtEndSlicerCachesPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  1115: {
    /* n:"BrtBeginSlicers", */
    T: 1
  },
  /*::[*/
  1116: {
    /* n:"BrtEndSlicers", */
    T: -1
  },
  /*::[*/
  1117: {
    /* n:"BrtWbProp14" */
  },
  /*::[*/
  1118: {
    /* n:"BrtBeginSXEdit", */
    T: 1
  },
  /*::[*/
  1119: {
    /* n:"BrtEndSXEdit", */
    T: -1
  },
  /*::[*/
  1120: {
    /* n:"BrtBeginSXEdits", */
    T: 1
  },
  /*::[*/
  1121: {
    /* n:"BrtEndSXEdits", */
    T: -1
  },
  /*::[*/
  1122: {
    /* n:"BrtBeginSXChange", */
    T: 1
  },
  /*::[*/
  1123: {
    /* n:"BrtEndSXChange", */
    T: -1
  },
  /*::[*/
  1124: {
    /* n:"BrtBeginSXChanges", */
    T: 1
  },
  /*::[*/
  1125: {
    /* n:"BrtEndSXChanges", */
    T: -1
  },
  /*::[*/
  1126: {
    /* n:"BrtSXTupleItems" */
  },
  /*::[*/
  1128: {
    /* n:"BrtBeginSlicerStyle", */
    T: 1
  },
  /*::[*/
  1129: {
    /* n:"BrtEndSlicerStyle", */
    T: -1
  },
  /*::[*/
  1130: {
    /* n:"BrtSlicerStyleElement" */
  },
  /*::[*/
  1131: {
    /* n:"BrtBeginStyleSheetExt14", */
    T: 1
  },
  /*::[*/
  1132: {
    /* n:"BrtEndStyleSheetExt14", */
    T: -1
  },
  /*::[*/
  1133: {
    /* n:"BrtBeginSlicerCachesPivotCacheID", */
    T: 1
  },
  /*::[*/
  1134: {
    /* n:"BrtEndSlicerCachesPivotCacheID", */
    T: -1
  },
  /*::[*/
  1135: {
    /* n:"BrtBeginConditionalFormattings", */
    T: 1
  },
  /*::[*/
  1136: {
    /* n:"BrtEndConditionalFormattings", */
    T: -1
  },
  /*::[*/
  1137: {
    /* n:"BrtBeginPCDCalcMemExt", */
    T: 1
  },
  /*::[*/
  1138: {
    /* n:"BrtEndPCDCalcMemExt", */
    T: -1
  },
  /*::[*/
  1139: {
    /* n:"BrtBeginPCDCalcMemsExt", */
    T: 1
  },
  /*::[*/
  1140: {
    /* n:"BrtEndPCDCalcMemsExt", */
    T: -1
  },
  /*::[*/
  1141: {
    /* n:"BrtPCDField14" */
  },
  /*::[*/
  1142: {
    /* n:"BrtBeginSlicerStyles", */
    T: 1
  },
  /*::[*/
  1143: {
    /* n:"BrtEndSlicerStyles", */
    T: -1
  },
  /*::[*/
  1144: {
    /* n:"BrtBeginSlicerStyleElements", */
    T: 1
  },
  /*::[*/
  1145: {
    /* n:"BrtEndSlicerStyleElements", */
    T: -1
  },
  /*::[*/
  1146: {
    /* n:"BrtCFRuleExt" */
  },
  /*::[*/
  1147: {
    /* n:"BrtBeginSXCondFmt14", */
    T: 1
  },
  /*::[*/
  1148: {
    /* n:"BrtEndSXCondFmt14", */
    T: -1
  },
  /*::[*/
  1149: {
    /* n:"BrtBeginSXCondFmts14", */
    T: 1
  },
  /*::[*/
  1150: {
    /* n:"BrtEndSXCondFmts14", */
    T: -1
  },
  /*::[*/
  1152: {
    /* n:"BrtBeginSortCond14", */
    T: 1
  },
  /*::[*/
  1153: {
    /* n:"BrtEndSortCond14", */
    T: -1
  },
  /*::[*/
  1154: {
    /* n:"BrtEndDVals14", */
    T: -1
  },
  /*::[*/
  1155: {
    /* n:"BrtEndIconSet14", */
    T: -1
  },
  /*::[*/
  1156: {
    /* n:"BrtEndDatabar14", */
    T: -1
  },
  /*::[*/
  1157: {
    /* n:"BrtBeginColorScale14", */
    T: 1
  },
  /*::[*/
  1158: {
    /* n:"BrtEndColorScale14", */
    T: -1
  },
  /*::[*/
  1159: {
    /* n:"BrtBeginSxrules14", */
    T: 1
  },
  /*::[*/
  1160: {
    /* n:"BrtEndSxrules14", */
    T: -1
  },
  /*::[*/
  1161: {
    /* n:"BrtBeginPRule14", */
    T: 1
  },
  /*::[*/
  1162: {
    /* n:"BrtEndPRule14", */
    T: -1
  },
  /*::[*/
  1163: {
    /* n:"BrtBeginPRFilters14", */
    T: 1
  },
  /*::[*/
  1164: {
    /* n:"BrtEndPRFilters14", */
    T: -1
  },
  /*::[*/
  1165: {
    /* n:"BrtBeginPRFilter14", */
    T: 1
  },
  /*::[*/
  1166: {
    /* n:"BrtEndPRFilter14", */
    T: -1
  },
  /*::[*/
  1167: {
    /* n:"BrtBeginPRFItem14", */
    T: 1
  },
  /*::[*/
  1168: {
    /* n:"BrtEndPRFItem14", */
    T: -1
  },
  /*::[*/
  1169: {
    /* n:"BrtBeginCellIgnoreECs14", */
    T: 1
  },
  /*::[*/
  1170: {
    /* n:"BrtEndCellIgnoreECs14", */
    T: -1
  },
  /*::[*/
  1171: {
    /* n:"BrtDxf14" */
  },
  /*::[*/
  1172: {
    /* n:"BrtBeginDxF14s", */
    T: 1
  },
  /*::[*/
  1173: {
    /* n:"BrtEndDxf14s", */
    T: -1
  },
  /*::[*/
  1177: {
    /* n:"BrtFilter14" */
  },
  /*::[*/
  1178: {
    /* n:"BrtBeginCustomFilters14", */
    T: 1
  },
  /*::[*/
  1180: {
    /* n:"BrtCustomFilter14" */
  },
  /*::[*/
  1181: {
    /* n:"BrtIconFilter14" */
  },
  /*::[*/
  1182: {
    /* n:"BrtPivotCacheConnectionName" */
  },
  /*::[*/
  2048: {
    /* n:"BrtBeginDecoupledPivotCacheIDs", */
    T: 1
  },
  /*::[*/
  2049: {
    /* n:"BrtEndDecoupledPivotCacheIDs", */
    T: -1
  },
  /*::[*/
  2050: {
    /* n:"BrtDecoupledPivotCacheID" */
  },
  /*::[*/
  2051: {
    /* n:"BrtBeginPivotTableRefs", */
    T: 1
  },
  /*::[*/
  2052: {
    /* n:"BrtEndPivotTableRefs", */
    T: -1
  },
  /*::[*/
  2053: {
    /* n:"BrtPivotTableRef" */
  },
  /*::[*/
  2054: {
    /* n:"BrtSlicerCacheBookPivotTables" */
  },
  /*::[*/
  2055: {
    /* n:"BrtBeginSxvcells", */
    T: 1
  },
  /*::[*/
  2056: {
    /* n:"BrtEndSxvcells", */
    T: -1
  },
  /*::[*/
  2057: {
    /* n:"BrtBeginSxRow", */
    T: 1
  },
  /*::[*/
  2058: {
    /* n:"BrtEndSxRow", */
    T: -1
  },
  /*::[*/
  2060: {
    /* n:"BrtPcdCalcMem15" */
  },
  /*::[*/
  2067: {
    /* n:"BrtQsi15" */
  },
  /*::[*/
  2068: {
    /* n:"BrtBeginWebExtensions", */
    T: 1
  },
  /*::[*/
  2069: {
    /* n:"BrtEndWebExtensions", */
    T: -1
  },
  /*::[*/
  2070: {
    /* n:"BrtWebExtension" */
  },
  /*::[*/
  2071: {
    /* n:"BrtAbsPath15" */
  },
  /*::[*/
  2072: {
    /* n:"BrtBeginPivotTableUISettings", */
    T: 1
  },
  /*::[*/
  2073: {
    /* n:"BrtEndPivotTableUISettings", */
    T: -1
  },
  /*::[*/
  2075: {
    /* n:"BrtTableSlicerCacheIDs" */
  },
  /*::[*/
  2076: {
    /* n:"BrtTableSlicerCacheID" */
  },
  /*::[*/
  2077: {
    /* n:"BrtBeginTableSlicerCache", */
    T: 1
  },
  /*::[*/
  2078: {
    /* n:"BrtEndTableSlicerCache", */
    T: -1
  },
  /*::[*/
  2079: {
    /* n:"BrtSxFilter15" */
  },
  /*::[*/
  2080: {
    /* n:"BrtBeginTimelineCachePivotCacheIDs", */
    T: 1
  },
  /*::[*/
  2081: {
    /* n:"BrtEndTimelineCachePivotCacheIDs", */
    T: -1
  },
  /*::[*/
  2082: {
    /* n:"BrtTimelineCachePivotCacheID" */
  },
  /*::[*/
  2083: {
    /* n:"BrtBeginTimelineCacheIDs", */
    T: 1
  },
  /*::[*/
  2084: {
    /* n:"BrtEndTimelineCacheIDs", */
    T: -1
  },
  /*::[*/
  2085: {
    /* n:"BrtBeginTimelineCacheID", */
    T: 1
  },
  /*::[*/
  2086: {
    /* n:"BrtEndTimelineCacheID", */
    T: -1
  },
  /*::[*/
  2087: {
    /* n:"BrtBeginTimelinesEx", */
    T: 1
  },
  /*::[*/
  2088: {
    /* n:"BrtEndTimelinesEx", */
    T: -1
  },
  /*::[*/
  2089: {
    /* n:"BrtBeginTimelineEx", */
    T: 1
  },
  /*::[*/
  2090: {
    /* n:"BrtEndTimelineEx", */
    T: -1
  },
  /*::[*/
  2091: {
    /* n:"BrtWorkBookPr15" */
  },
  /*::[*/
  2092: {
    /* n:"BrtPCDH15" */
  },
  /*::[*/
  2093: {
    /* n:"BrtBeginTimelineStyle", */
    T: 1
  },
  /*::[*/
  2094: {
    /* n:"BrtEndTimelineStyle", */
    T: -1
  },
  /*::[*/
  2095: {
    /* n:"BrtTimelineStyleElement" */
  },
  /*::[*/
  2096: {
    /* n:"BrtBeginTimelineStylesheetExt15", */
    T: 1
  },
  /*::[*/
  2097: {
    /* n:"BrtEndTimelineStylesheetExt15", */
    T: -1
  },
  /*::[*/
  2098: {
    /* n:"BrtBeginTimelineStyles", */
    T: 1
  },
  /*::[*/
  2099: {
    /* n:"BrtEndTimelineStyles", */
    T: -1
  },
  /*::[*/
  2100: {
    /* n:"BrtBeginTimelineStyleElements", */
    T: 1
  },
  /*::[*/
  2101: {
    /* n:"BrtEndTimelineStyleElements", */
    T: -1
  },
  /*::[*/
  2102: {
    /* n:"BrtDxf15" */
  },
  /*::[*/
  2103: {
    /* n:"BrtBeginDxfs15", */
    T: 1
  },
  /*::[*/
  2104: {
    /* n:"BrtEndDxfs15", */
    T: -1
  },
  /*::[*/
  2105: {
    /* n:"BrtSlicerCacheHideItemsWithNoData" */
  },
  /*::[*/
  2106: {
    /* n:"BrtBeginItemUniqueNames", */
    T: 1
  },
  /*::[*/
  2107: {
    /* n:"BrtEndItemUniqueNames", */
    T: -1
  },
  /*::[*/
  2108: {
    /* n:"BrtItemUniqueName" */
  },
  /*::[*/
  2109: {
    /* n:"BrtBeginExtConn15", */
    T: 1
  },
  /*::[*/
  2110: {
    /* n:"BrtEndExtConn15", */
    T: -1
  },
  /*::[*/
  2111: {
    /* n:"BrtBeginOledbPr15", */
    T: 1
  },
  /*::[*/
  2112: {
    /* n:"BrtEndOledbPr15", */
    T: -1
  },
  /*::[*/
  2113: {
    /* n:"BrtBeginDataFeedPr15", */
    T: 1
  },
  /*::[*/
  2114: {
    /* n:"BrtEndDataFeedPr15", */
    T: -1
  },
  /*::[*/
  2115: {
    /* n:"BrtTextPr15" */
  },
  /*::[*/
  2116: {
    /* n:"BrtRangePr15" */
  },
  /*::[*/
  2117: {
    /* n:"BrtDbCommand15" */
  },
  /*::[*/
  2118: {
    /* n:"BrtBeginDbTables15", */
    T: 1
  },
  /*::[*/
  2119: {
    /* n:"BrtEndDbTables15", */
    T: -1
  },
  /*::[*/
  2120: {
    /* n:"BrtDbTable15" */
  },
  /*::[*/
  2121: {
    /* n:"BrtBeginDataModel", */
    T: 1
  },
  /*::[*/
  2122: {
    /* n:"BrtEndDataModel", */
    T: -1
  },
  /*::[*/
  2123: {
    /* n:"BrtBeginModelTables", */
    T: 1
  },
  /*::[*/
  2124: {
    /* n:"BrtEndModelTables", */
    T: -1
  },
  /*::[*/
  2125: {
    /* n:"BrtModelTable" */
  },
  /*::[*/
  2126: {
    /* n:"BrtBeginModelRelationships", */
    T: 1
  },
  /*::[*/
  2127: {
    /* n:"BrtEndModelRelationships", */
    T: -1
  },
  /*::[*/
  2128: {
    /* n:"BrtModelRelationship" */
  },
  /*::[*/
  2129: {
    /* n:"BrtBeginECTxtWiz15", */
    T: 1
  },
  /*::[*/
  2130: {
    /* n:"BrtEndECTxtWiz15", */
    T: -1
  },
  /*::[*/
  2131: {
    /* n:"BrtBeginECTWFldInfoLst15", */
    T: 1
  },
  /*::[*/
  2132: {
    /* n:"BrtEndECTWFldInfoLst15", */
    T: -1
  },
  /*::[*/
  2133: {
    /* n:"BrtBeginECTWFldInfo15", */
    T: 1
  },
  /*::[*/
  2134: {
    /* n:"BrtFieldListActiveItem" */
  },
  /*::[*/
  2135: {
    /* n:"BrtPivotCacheIdVersion" */
  },
  /*::[*/
  2136: {
    /* n:"BrtSXDI15" */
  },
  /*::[*/
  2137: {
    /* n:"BrtBeginModelTimeGroupings", */
    T: 1
  },
  /*::[*/
  2138: {
    /* n:"BrtEndModelTimeGroupings", */
    T: -1
  },
  /*::[*/
  2139: {
    /* n:"BrtBeginModelTimeGrouping", */
    T: 1
  },
  /*::[*/
  2140: {
    /* n:"BrtEndModelTimeGrouping", */
    T: -1
  },
  /*::[*/
  2141: {
    /* n:"BrtModelTimeGroupingCalcCol" */
  },
  /*::[*/
  3072: {
    /* n:"BrtUid" */
  },
  /*::[*/
  3073: {
    /* n:"BrtRevisionPtr" */
  },
  /*::[*/
  4096: {
    /* n:"BrtBeginDynamicArrayPr", */
    T: 1
  },
  /*::[*/
  4097: {
    /* n:"BrtEndDynamicArrayPr", */
    T: -1
  },
  /*::[*/
  5002: {
    /* n:"BrtBeginRichValueBlock", */
    T: 1
  },
  /*::[*/
  5003: {
    /* n:"BrtEndRichValueBlock", */
    T: -1
  },
  /*::[*/
  5081: {
    /* n:"BrtBeginRichFilters", */
    T: 1
  },
  /*::[*/
  5082: {
    /* n:"BrtEndRichFilters", */
    T: -1
  },
  /*::[*/
  5083: {
    /* n:"BrtRichFilter" */
  },
  /*::[*/
  5084: {
    /* n:"BrtBeginRichFilterColumn", */
    T: 1
  },
  /*::[*/
  5085: {
    /* n:"BrtEndRichFilterColumn", */
    T: -1
  },
  /*::[*/
  5086: {
    /* n:"BrtBeginCustomRichFilters", */
    T: 1
  },
  /*::[*/
  5087: {
    /* n:"BrtEndCustomRichFilters", */
    T: -1
  },
  /*::[*/
  5088: {
    /* n:"BrtCustomRichFilter" */
  },
  /*::[*/
  5089: {
    /* n:"BrtTop10RichFilter" */
  },
  /*::[*/
  5090: {
    /* n:"BrtDynamicRichFilter" */
  },
  /*::[*/
  5092: {
    /* n:"BrtBeginRichSortCondition", */
    T: 1
  },
  /*::[*/
  5093: {
    /* n:"BrtEndRichSortCondition", */
    T: -1
  },
  /*::[*/
  5094: {
    /* n:"BrtRichFilterDateGroupItem" */
  },
  /*::[*/
  5095: {
    /* n:"BrtBeginCalcFeatures", */
    T: 1
  },
  /*::[*/
  5096: {
    /* n:"BrtEndCalcFeatures", */
    T: -1
  },
  /*::[*/
  5097: {
    /* n:"BrtCalcFeature" */
  },
  /*::[*/
  5099: {
    /* n:"BrtExternalLinksPr" */
  },
  /*::[*/
  65535: { n: "" }
}, Cc = {
  /* [MS-XLS] 2.3 Record Enumeration 2021-08-17 */
  /*::[*/
  6: {
    /* n:"Formula", */
    f: hc
  },
  /*::[*/
  10: {
    /* n:"EOF", */
    f: ea
  },
  /*::[*/
  12: {
    /* n:"CalcCount", */
    f: Ar
  },
  //
  /*::[*/
  13: {
    /* n:"CalcMode", */
    f: Ar
  },
  //
  /*::[*/
  14: {
    /* n:"CalcPrecision", */
    f: kr
  },
  //
  /*::[*/
  15: {
    /* n:"CalcRefMode", */
    f: kr
  },
  //
  /*::[*/
  16: {
    /* n:"CalcDelta", */
    f: rt
  },
  //
  /*::[*/
  17: {
    /* n:"CalcIter", */
    f: kr
  },
  //
  /*::[*/
  18: {
    /* n:"Protect", */
    f: kr
  },
  /*::[*/
  19: {
    /* n:"Password", */
    f: Ar
  },
  /*::[*/
  20: {
    /* n:"Header", */
    f: Th
  },
  /*::[*/
  21: {
    /* n:"Footer", */
    f: Th
  },
  /*::[*/
  23: {
    /* n:"ExternSheet", */
    f: e1
  },
  /*::[*/
  24: {
    /* n:"Lbl", */
    f: Ah
  },
  /*::[*/
  25: {
    /* n:"WinProtect", */
    f: kr
  },
  /*::[*/
  26: {
    /* n:"VerticalPageBreaks", */
  },
  /*::[*/
  27: {
    /* n:"HorizontalPageBreaks", */
  },
  /*::[*/
  28: {
    /* n:"Note", */
    f: B2
  },
  /*::[*/
  29: {
    /* n:"Selection", */
  },
  /*::[*/
  34: {
    /* n:"Date1904", */
    f: kr
  },
  /*::[*/
  35: {
    /* n:"ExternName", */
    f: Ch
  },
  /*::[*/
  38: {
    /* n:"LeftMargin", */
    f: rt
  },
  // *
  /*::[*/
  39: {
    /* n:"RightMargin", */
    f: rt
  },
  // *
  /*::[*/
  40: {
    /* n:"TopMargin", */
    f: rt
  },
  // *
  /*::[*/
  41: {
    /* n:"BottomMargin", */
    f: rt
  },
  // *
  /*::[*/
  42: {
    /* n:"PrintRowCol", */
    f: kr
  },
  /*::[*/
  43: {
    /* n:"PrintGrid", */
    f: kr
  },
  /*::[*/
  47: {
    /* n:"FilePass", */
    f: Hw
  },
  /*::[*/
  49: {
    /* n:"Font", */
    f: w2
  },
  /*::[*/
  51: {
    /* n:"PrintSize", */
    f: Ar
  },
  /*::[*/
  60: {
    /* n:"Continue", */
  },
  /*::[*/
  61: {
    /* n:"Window1", */
    f: m2
  },
  /*::[*/
  64: {
    /* n:"Backup", */
    f: kr
  },
  /*::[*/
  65: {
    /* n:"Pane", */
    f: v2
  },
  /*::[*/
  66: {
    /* n:"CodePage", */
    f: Ar
  },
  /*::[*/
  77: {
    /* n:"Pls", */
  },
  /*::[*/
  80: {
    /* n:"DCon", */
  },
  /*::[*/
  81: {
    /* n:"DConRef", */
  },
  /*::[*/
  82: {
    /* n:"DConName", */
  },
  /*::[*/
  85: {
    /* n:"DefColWidth", */
    f: Ar
  },
  /*::[*/
  89: {
    /* n:"XCT", */
  },
  /*::[*/
  90: {
    /* n:"CRN", */
  },
  /*::[*/
  91: {
    /* n:"FileSharing", */
  },
  /*::[*/
  92: {
    /* n:"WriteAccess", */
    f: o2
  },
  /*::[*/
  93: {
    /* n:"Obj", */
    f: U2
  },
  /*::[*/
  94: {
    /* n:"Uncalced", */
  },
  /*::[*/
  95: {
    /* n:"CalcSaveRecalc", */
    f: kr
  },
  //
  /*::[*/
  96: {
    /* n:"Template", */
  },
  /*::[*/
  97: {
    /* n:"Intl", */
  },
  /*::[*/
  99: {
    /* n:"ObjProtect", */
    f: kr
  },
  /*::[*/
  125: {
    /* n:"ColInfo", */
    f: r1
  },
  /*::[*/
  128: {
    /* n:"Guts", */
    f: N2
  },
  /*::[*/
  129: {
    /* n:"WsBool", */
    f: c2
  },
  /*::[*/
  130: {
    /* n:"GridSet", */
    f: Ar
  },
  /*::[*/
  131: {
    /* n:"HCenter", */
    f: kr
  },
  /*::[*/
  132: {
    /* n:"VCenter", */
    f: kr
  },
  /*::[*/
  133: {
    /* n:"BoundSheet8", */
    f: u2
  },
  /*::[*/
  134: {
    /* n:"WriteProtect", */
  },
  /*::[*/
  140: {
    /* n:"Country", */
    f: $2
  },
  /*::[*/
  141: {
    /* n:"HideObj", */
    f: Ar
  },
  /*::[*/
  144: {
    /* n:"Sort", */
  },
  /*::[*/
  146: {
    /* n:"Palette", */
    f: X2
  },
  /*::[*/
  151: {
    /* n:"Sync", */
  },
  /*::[*/
  152: {
    /* n:"LPr", */
  },
  /*::[*/
  153: {
    /* n:"DxGCol", */
  },
  /*::[*/
  154: {
    /* n:"FnGroupName", */
  },
  /*::[*/
  155: {
    /* n:"FilterMode", */
  },
  /*::[*/
  156: {
    /* n:"BuiltInFnGroupCount", */
    f: Ar
  },
  /*::[*/
  157: {
    /* n:"AutoFilterInfo", */
  },
  /*::[*/
  158: {
    /* n:"AutoFilter", */
  },
  /*::[*/
  160: {
    /* n:"Scl", */
    f: Z2
  },
  /*::[*/
  161: {
    /* n:"Setup", */
    f: Q2
  },
  /*::[*/
  174: {
    /* n:"ScenMan", */
  },
  /*::[*/
  175: {
    /* n:"SCENARIO", */
  },
  /*::[*/
  176: {
    /* n:"SxView", */
  },
  /*::[*/
  177: {
    /* n:"Sxvd", */
  },
  /*::[*/
  178: {
    /* n:"SXVI", */
  },
  /*::[*/
  180: {
    /* n:"SxIvd", */
  },
  /*::[*/
  181: {
    /* n:"SXLI", */
  },
  /*::[*/
  182: {
    /* n:"SXPI", */
  },
  /*::[*/
  184: {
    /* n:"DocRoute", */
  },
  /*::[*/
  185: {
    /* n:"RecipName", */
  },
  /*::[*/
  189: {
    /* n:"MulRk", */
    f: T2
  },
  /*::[*/
  190: {
    /* n:"MulBlank", */
    f: C2
  },
  /*::[*/
  193: {
    /* n:"Mms", */
    f: ea
  },
  /*::[*/
  197: {
    /* n:"SXDI", */
  },
  /*::[*/
  198: {
    /* n:"SXDB", */
  },
  /*::[*/
  199: {
    /* n:"SXFDB", */
  },
  /*::[*/
  200: {
    /* n:"SXDBB", */
  },
  /*::[*/
  201: {
    /* n:"SXNum", */
  },
  /*::[*/
  202: {
    /* n:"SxBool", */
    f: kr
  },
  /*::[*/
  203: {
    /* n:"SxErr", */
  },
  /*::[*/
  204: {
    /* n:"SXInt", */
  },
  /*::[*/
  205: {
    /* n:"SXString", */
  },
  /*::[*/
  206: {
    /* n:"SXDtr", */
  },
  /*::[*/
  207: {
    /* n:"SxNil", */
  },
  /*::[*/
  208: {
    /* n:"SXTbl", */
  },
  /*::[*/
  209: {
    /* n:"SXTBRGIITM", */
  },
  /*::[*/
  210: {
    /* n:"SxTbpg", */
  },
  /*::[*/
  211: {
    /* n:"ObProj", */
  },
  /*::[*/
  213: {
    /* n:"SXStreamID", */
  },
  /*::[*/
  215: {
    /* n:"DBCell", */
  },
  /*::[*/
  216: {
    /* n:"SXRng", */
  },
  /*::[*/
  217: {
    /* n:"SxIsxoper", */
  },
  /*::[*/
  218: {
    /* n:"BookBool", */
    f: Ar
  },
  /*::[*/
  220: {
    /* n:"DbOrParamQry", */
  },
  /*::[*/
  221: {
    /* n:"ScenarioProtect", */
    f: kr
  },
  /*::[*/
  222: {
    /* n:"OleObjectSize", */
  },
  /*::[*/
  224: {
    /* n:"XF", */
    f: F2
  },
  /*::[*/
  225: {
    /* n:"InterfaceHdr", */
    f: l2
  },
  /*::[*/
  226: {
    /* n:"InterfaceEnd", */
    f: ea
  },
  /*::[*/
  227: {
    /* n:"SXVS", */
  },
  /*::[*/
  229: {
    /* n:"MergeCells", */
    f: j2
  },
  /*::[*/
  233: {
    /* n:"BkHim", */
  },
  /*::[*/
  235: {
    /* n:"MsoDrawingGroup", */
  },
  /*::[*/
  236: {
    /* n:"MsoDrawing", */
  },
  /*::[*/
  237: {
    /* n:"MsoDrawingSelection", */
  },
  /*::[*/
  239: {
    /* n:"PhoneticInfo", */
  },
  /*::[*/
  240: {
    /* n:"SxRule", */
  },
  /*::[*/
  241: {
    /* n:"SXEx", */
  },
  /*::[*/
  242: {
    /* n:"SxFilt", */
  },
  /*::[*/
  244: {
    /* n:"SxDXF", */
  },
  /*::[*/
  245: {
    /* n:"SxItm", */
  },
  /*::[*/
  246: {
    /* n:"SxName", */
  },
  /*::[*/
  247: {
    /* n:"SxSelect", */
  },
  /*::[*/
  248: {
    /* n:"SXPair", */
  },
  /*::[*/
  249: {
    /* n:"SxFmla", */
  },
  /*::[*/
  251: {
    /* n:"SxFormat", */
  },
  /*::[*/
  252: {
    /* n:"SST", */
    f: f2
  },
  /*::[*/
  253: {
    /* n:"LabelSst", */
    f: y2
  },
  /*::[*/
  255: {
    /* n:"ExtSST", */
    f: d2
  },
  /*::[*/
  256: {
    /* n:"SXVDEx", */
  },
  /*::[*/
  259: {
    /* n:"SXFormula", */
  },
  /*::[*/
  290: {
    /* n:"SXDBEx", */
  },
  /*::[*/
  311: {
    /* n:"RRDInsDel", */
  },
  /*::[*/
  312: {
    /* n:"RRDHead", */
  },
  /*::[*/
  315: {
    /* n:"RRDChgCell", */
  },
  /*::[*/
  317: {
    /* n:"RRTabId", */
    f: Xp
  },
  /*::[*/
  318: {
    /* n:"RRDRenSheet", */
  },
  /*::[*/
  319: {
    /* n:"RRSort", */
  },
  /*::[*/
  320: {
    /* n:"RRDMove", */
  },
  /*::[*/
  330: {
    /* n:"RRFormat", */
  },
  /*::[*/
  331: {
    /* n:"RRAutoFmt", */
  },
  /*::[*/
  333: {
    /* n:"RRInsertSh", */
  },
  /*::[*/
  334: {
    /* n:"RRDMoveBegin", */
  },
  /*::[*/
  335: {
    /* n:"RRDMoveEnd", */
  },
  /*::[*/
  336: {
    /* n:"RRDInsDelBegin", */
  },
  /*::[*/
  337: {
    /* n:"RRDInsDelEnd", */
  },
  /*::[*/
  338: {
    /* n:"RRDConflict", */
  },
  /*::[*/
  339: {
    /* n:"RRDDefName", */
  },
  /*::[*/
  340: {
    /* n:"RRDRstEtxp", */
  },
  /*::[*/
  351: {
    /* n:"LRng", */
  },
  /*::[*/
  352: {
    /* n:"UsesELFs", */
    f: kr
  },
  /*::[*/
  353: {
    /* n:"DSF", */
    f: ea
  },
  /*::[*/
  401: {
    /* n:"CUsr", */
  },
  /*::[*/
  402: {
    /* n:"CbUsr", */
  },
  /*::[*/
  403: {
    /* n:"UsrInfo", */
  },
  /*::[*/
  404: {
    /* n:"UsrExcl", */
  },
  /*::[*/
  405: {
    /* n:"FileLock", */
  },
  /*::[*/
  406: {
    /* n:"RRDInfo", */
  },
  /*::[*/
  407: {
    /* n:"BCUsrs", */
  },
  /*::[*/
  408: {
    /* n:"UsrChk", */
  },
  /*::[*/
  425: {
    /* n:"UserBView", */
  },
  /*::[*/
  426: {
    /* n:"UserSViewBegin", */
  },
  /*::[*/
  427: {
    /* n:"UserSViewEnd", */
  },
  /*::[*/
  428: {
    /* n:"RRDUserView", */
  },
  /*::[*/
  429: {
    /* n:"Qsi", */
  },
  /*::[*/
  430: {
    /* n:"SupBook", */
    f: D2
  },
  /*::[*/
  431: {
    /* n:"Prot4Rev", */
    f: kr
  },
  /*::[*/
  432: {
    /* n:"CondFmt", */
  },
  /*::[*/
  433: {
    /* n:"CF", */
  },
  /*::[*/
  434: {
    /* n:"DVal", */
  },
  /*::[*/
  437: {
    /* n:"DConBin", */
  },
  /*::[*/
  438: {
    /* n:"TxO", */
    f: V2
  },
  /*::[*/
  439: {
    /* n:"RefreshAll", */
    f: kr
  },
  //
  /*::[*/
  440: {
    /* n:"HLink", */
    f: W2
  },
  /*::[*/
  441: {
    /* n:"Lel", */
  },
  /*::[*/
  442: {
    /* n:"CodeName", */
    f: Is
  },
  /*::[*/
  443: {
    /* n:"SXFDBType", */
  },
  /*::[*/
  444: {
    /* n:"Prot4RevPass", */
    f: Ar
  },
  /*::[*/
  445: {
    /* n:"ObNoMacros", */
  },
  /*::[*/
  446: {
    /* n:"Dv", */
  },
  /*::[*/
  448: {
    /* n:"Excel9File", */
    f: ea
  },
  /*::[*/
  449: {
    /* n:"RecalcId", */
    f: x2,
    r: 2
  },
  /*::[*/
  450: {
    /* n:"EntExU2", */
    f: ea
  },
  /*::[*/
  512: {
    /* n:"Dimensions", */
    f: Eh
  },
  /*::[*/
  513: {
    /* n:"Blank", */
    f: J2
  },
  /*::[*/
  515: {
    /* n:"Number", */
    f: R2
  },
  /*::[*/
  516: {
    /* n:"Label", */
    f: _2
  },
  /*::[*/
  517: {
    /* n:"BoolErr", */
    f: Sh
  },
  /*::[*/
  519: {
    /* n:"String", */
    f: ew
  },
  /*::[*/
  520: {
    /* n:"Row", */
    f: h2
  },
  /*::[*/
  523: {
    /* n:"Index", */
  },
  /*::[*/
  545: {
    /* n:"Array", */
    f: Fh
  },
  /*::[*/
  549: {
    /* n:"DefaultRowHeight", */
    f: kh
  },
  /*::[*/
  566: {
    /* n:"Table", */
  },
  /*::[*/
  574: {
    /* n:"Window2", */
    f: g2
  },
  /*::[*/
  638: {
    /* n:"RK", */
    f: S2
  },
  /*::[*/
  659: {
    /* n:"Style", */
  },
  /*::[*/
  1048: {
    /* n:"BigName", */
  },
  /*::[*/
  1054: {
    /* n:"Format", */
    f: k2
  },
  /*::[*/
  1084: {
    /* n:"ContinueBigName", */
  },
  /*::[*/
  1212: {
    /* n:"ShrFmla", */
    f: I2
  },
  /*::[*/
  2048: {
    /* n:"HLinkTooltip", */
    f: G2
  },
  /*::[*/
  2049: {
    /* n:"WebPub", */
  },
  /*::[*/
  2050: {
    /* n:"QsiSXTag", */
  },
  /*::[*/
  2051: {
    /* n:"DBQueryExt", */
  },
  /*::[*/
  2052: {
    /* n:"ExtString", */
  },
  /*::[*/
  2053: {
    /* n:"TxtQry", */
  },
  /*::[*/
  2054: {
    /* n:"Qsir", */
  },
  /*::[*/
  2055: {
    /* n:"Qsif", */
  },
  /*::[*/
  2056: {
    /* n:"RRDTQSIF", */
  },
  /*::[*/
  2057: {
    /* n:"BOF", */
    f: eo
  },
  /*::[*/
  2058: {
    /* n:"OleDbConn", */
  },
  /*::[*/
  2059: {
    /* n:"WOpt", */
  },
  /*::[*/
  2060: {
    /* n:"SXViewEx", */
  },
  /*::[*/
  2061: {
    /* n:"SXTH", */
  },
  /*::[*/
  2062: {
    /* n:"SXPIEx", */
  },
  /*::[*/
  2063: {
    /* n:"SXVDTEx", */
  },
  /*::[*/
  2064: {
    /* n:"SXViewEx9", */
  },
  /*::[*/
  2066: {
    /* n:"ContinueFrt", */
  },
  /*::[*/
  2067: {
    /* n:"RealTimeData", */
  },
  /*::[*/
  2128: {
    /* n:"ChartFrtInfo", */
  },
  /*::[*/
  2129: {
    /* n:"FrtWrapper", */
  },
  /*::[*/
  2130: {
    /* n:"StartBlock", */
  },
  /*::[*/
  2131: {
    /* n:"EndBlock", */
  },
  /*::[*/
  2132: {
    /* n:"StartObject", */
  },
  /*::[*/
  2133: {
    /* n:"EndObject", */
  },
  /*::[*/
  2134: {
    /* n:"CatLab", */
  },
  /*::[*/
  2135: {
    /* n:"YMult", */
  },
  /*::[*/
  2136: {
    /* n:"SXViewLink", */
  },
  /*::[*/
  2137: {
    /* n:"PivotChartBits", */
  },
  /*::[*/
  2138: {
    /* n:"FrtFontList", */
  },
  /*::[*/
  2146: {
    /* n:"SheetExt", */
  },
  /*::[*/
  2147: {
    /* n:"BookExt", */
    r: 12
  },
  /*::[*/
  2148: {
    /* n:"SXAddl", */
  },
  /*::[*/
  2149: {
    /* n:"CrErr", */
  },
  /*::[*/
  2150: {
    /* n:"HFPicture", */
  },
  /*::[*/
  2151: {
    /* n:"FeatHdr", */
    f: ea
  },
  /*::[*/
  2152: {
    /* n:"Feat", */
  },
  /*::[*/
  2154: {
    /* n:"DataLabExt", */
  },
  /*::[*/
  2155: {
    /* n:"DataLabExtContents", */
  },
  /*::[*/
  2156: {
    /* n:"CellWatch", */
  },
  /*::[*/
  2161: {
    /* n:"FeatHdr11", */
  },
  /*::[*/
  2162: {
    /* n:"Feature11", */
  },
  /*::[*/
  2164: {
    /* n:"DropDownObjIds", */
  },
  /*::[*/
  2165: {
    /* n:"ContinueFrt11", */
  },
  /*::[*/
  2166: {
    /* n:"DConn", */
  },
  /*::[*/
  2167: {
    /* n:"List12", */
  },
  /*::[*/
  2168: {
    /* n:"Feature12", */
  },
  /*::[*/
  2169: {
    /* n:"CondFmt12", */
  },
  /*::[*/
  2170: {
    /* n:"CF12", */
  },
  /*::[*/
  2171: {
    /* n:"CFEx", */
  },
  /*::[*/
  2172: {
    /* n:"XFCRC", */
    f: Y2,
    r: 12
  },
  /*::[*/
  2173: {
    /* n:"XFExt", */
    f: Ty,
    r: 12
  },
  /*::[*/
  2174: {
    /* n:"AutoFilter12", */
  },
  /*::[*/
  2175: {
    /* n:"ContinueFrt12", */
  },
  /*::[*/
  2180: {
    /* n:"MDTInfo", */
  },
  /*::[*/
  2181: {
    /* n:"MDXStr", */
  },
  /*::[*/
  2182: {
    /* n:"MDXTuple", */
  },
  /*::[*/
  2183: {
    /* n:"MDXSet", */
  },
  /*::[*/
  2184: {
    /* n:"MDXProp", */
  },
  /*::[*/
  2185: {
    /* n:"MDXKPI", */
  },
  /*::[*/
  2186: {
    /* n:"MDB", */
  },
  /*::[*/
  2187: {
    /* n:"PLV", */
  },
  /*::[*/
  2188: {
    /* n:"Compat12", */
    f: kr,
    r: 12
  },
  /*::[*/
  2189: {
    /* n:"DXF", */
  },
  /*::[*/
  2190: {
    /* n:"TableStyles", */
    r: 12
  },
  /*::[*/
  2191: {
    /* n:"TableStyle", */
  },
  /*::[*/
  2192: {
    /* n:"TableStyleElement", */
  },
  /*::[*/
  2194: {
    /* n:"StyleExt", */
  },
  /*::[*/
  2195: {
    /* n:"NamePublish", */
  },
  /*::[*/
  2196: {
    /* n:"NameCmt", */
    f: b2,
    r: 12
  },
  /*::[*/
  2197: {
    /* n:"SortData", */
  },
  /*::[*/
  2198: {
    /* n:"Theme", */
    f: wy,
    r: 12
  },
  /*::[*/
  2199: {
    /* n:"GUIDTypeLib", */
  },
  /*::[*/
  2200: {
    /* n:"FnGrp12", */
  },
  /*::[*/
  2201: {
    /* n:"NameFnGrp12", */
  },
  /*::[*/
  2202: {
    /* n:"MTRSettings", */
    f: L2,
    r: 12
  },
  /*::[*/
  2203: {
    /* n:"CompressPictures", */
    f: ea
  },
  /*::[*/
  2204: {
    /* n:"HeaderFooter", */
  },
  /*::[*/
  2205: {
    /* n:"CrtLayout12", */
  },
  /*::[*/
  2206: {
    /* n:"CrtMlFrt", */
  },
  /*::[*/
  2207: {
    /* n:"CrtMlFrtContinue", */
  },
  /*::[*/
  2211: {
    /* n:"ForceFullCalculation", */
    f: p2
  },
  /*::[*/
  2212: {
    /* n:"ShapePropsStream", */
  },
  /*::[*/
  2213: {
    /* n:"TextPropsStream", */
  },
  /*::[*/
  2214: {
    /* n:"RichTextStream", */
  },
  /*::[*/
  2215: {
    /* n:"CrtLayout12A", */
  },
  /*::[*/
  4097: {
    /* n:"Units", */
  },
  /*::[*/
  4098: {
    /* n:"Chart", */
  },
  /*::[*/
  4099: {
    /* n:"Series", */
  },
  /*::[*/
  4102: {
    /* n:"DataFormat", */
  },
  /*::[*/
  4103: {
    /* n:"LineFormat", */
  },
  /*::[*/
  4105: {
    /* n:"MarkerFormat", */
  },
  /*::[*/
  4106: {
    /* n:"AreaFormat", */
  },
  /*::[*/
  4107: {
    /* n:"PieFormat", */
  },
  /*::[*/
  4108: {
    /* n:"AttachedLabel", */
  },
  /*::[*/
  4109: {
    /* n:"SeriesText", */
  },
  /*::[*/
  4116: {
    /* n:"ChartFormat", */
  },
  /*::[*/
  4117: {
    /* n:"Legend", */
  },
  /*::[*/
  4118: {
    /* n:"SeriesList", */
  },
  /*::[*/
  4119: {
    /* n:"Bar", */
  },
  /*::[*/
  4120: {
    /* n:"Line", */
  },
  /*::[*/
  4121: {
    /* n:"Pie", */
  },
  /*::[*/
  4122: {
    /* n:"Area", */
  },
  /*::[*/
  4123: {
    /* n:"Scatter", */
  },
  /*::[*/
  4124: {
    /* n:"CrtLine", */
  },
  /*::[*/
  4125: {
    /* n:"Axis", */
  },
  /*::[*/
  4126: {
    /* n:"Tick", */
  },
  /*::[*/
  4127: {
    /* n:"ValueRange", */
  },
  /*::[*/
  4128: {
    /* n:"CatSerRange", */
  },
  /*::[*/
  4129: {
    /* n:"AxisLine", */
  },
  /*::[*/
  4130: {
    /* n:"CrtLink", */
  },
  /*::[*/
  4132: {
    /* n:"DefaultText", */
  },
  /*::[*/
  4133: {
    /* n:"Text", */
  },
  /*::[*/
  4134: {
    /* n:"FontX", */
    f: Ar
  },
  /*::[*/
  4135: {
    /* n:"ObjectLink", */
  },
  /*::[*/
  4146: {
    /* n:"Frame", */
  },
  /*::[*/
  4147: {
    /* n:"Begin", */
  },
  /*::[*/
  4148: {
    /* n:"End", */
  },
  /*::[*/
  4149: {
    /* n:"PlotArea", */
  },
  /*::[*/
  4154: {
    /* n:"Chart3d", */
  },
  /*::[*/
  4156: {
    /* n:"PicF", */
  },
  /*::[*/
  4157: {
    /* n:"DropBar", */
  },
  /*::[*/
  4158: {
    /* n:"Radar", */
  },
  /*::[*/
  4159: {
    /* n:"Surf", */
  },
  /*::[*/
  4160: {
    /* n:"RadarArea", */
  },
  /*::[*/
  4161: {
    /* n:"AxisParent", */
  },
  /*::[*/
  4163: {
    /* n:"LegendException", */
  },
  /*::[*/
  4164: {
    /* n:"ShtProps", */
    f: q2
  },
  /*::[*/
  4165: {
    /* n:"SerToCrt", */
  },
  /*::[*/
  4166: {
    /* n:"AxesUsed", */
  },
  /*::[*/
  4168: {
    /* n:"SBaseRef", */
  },
  /*::[*/
  4170: {
    /* n:"SerParent", */
  },
  /*::[*/
  4171: {
    /* n:"SerAuxTrend", */
  },
  /*::[*/
  4174: {
    /* n:"IFmtRecord", */
  },
  /*::[*/
  4175: {
    /* n:"Pos", */
  },
  /*::[*/
  4176: {
    /* n:"AlRuns", */
  },
  /*::[*/
  4177: {
    /* n:"BRAI", */
  },
  /*::[*/
  4187: {
    /* n:"SerAuxErrBar", */
  },
  /*::[*/
  4188: {
    /* n:"ClrtClient", */
    f: K2
  },
  /*::[*/
  4189: {
    /* n:"SerFmt", */
  },
  /*::[*/
  4191: {
    /* n:"Chart3DBarShape", */
  },
  /*::[*/
  4192: {
    /* n:"Fbi", */
  },
  /*::[*/
  4193: {
    /* n:"BopPop", */
  },
  /*::[*/
  4194: {
    /* n:"AxcExt", */
  },
  /*::[*/
  4195: {
    /* n:"Dat", */
  },
  /*::[*/
  4196: {
    /* n:"PlotGrowth", */
  },
  /*::[*/
  4197: {
    /* n:"SIIndex", */
  },
  /*::[*/
  4198: {
    /* n:"GelFrame", */
  },
  /*::[*/
  4199: {
    /* n:"BopPopCustom", */
  },
  /*::[*/
  4200: {
    /* n:"Fbi2", */
  },
  /*::[*/
  0: {
    /* n:"Dimensions", */
    f: Eh
  },
  /*::[*/
  1: {
    /* n:"BIFF2BLANK", */
  },
  /*::[*/
  2: {
    /* n:"BIFF2INT", */
    f: aw
  },
  /*::[*/
  3: {
    /* n:"BIFF2NUM", */
    f: nw
  },
  /*::[*/
  4: {
    /* n:"BIFF2STR", */
    f: tw
  },
  /*::[*/
  5: {
    /* n:"BoolErr", */
    f: Sh
  },
  /*::[*/
  7: {
    /* n:"String", */
    f: iw
  },
  /*::[*/
  8: {
    /* n:"BIFF2ROW", */
  },
  /*::[*/
  9: {
    /* n:"BOF", */
    f: eo
  },
  /*::[*/
  11: {
    /* n:"Index", */
  },
  /*::[*/
  22: {
    /* n:"ExternCount", */
    f: Ar
  },
  /*::[*/
  30: {
    /* n:"BIFF2FORMAT", */
    f: E2
  },
  /*::[*/
  31: {
    /* n:"BIFF2FMTCNT", */
  },
  /* 16-bit cnt of BIFF2FORMAT records */
  /*::[*/
  32: {
    /* n:"BIFF2COLINFO", */
  },
  /*::[*/
  33: {
    /* n:"Array", */
    f: Fh
  },
  /*::[*/
  36: {
    /* n:"COLWIDTH", */
  },
  /*::[*/
  37: {
    /* n:"DefaultRowHeight", */
    f: kh
  },
  // 0x2c ??
  // 0x2d ??
  // 0x2e ??
  // 0x30 FONTCOUNT: number of fonts
  /*::[*/
  50: {
    /* n:"BIFF2FONTXTRA", */
    f: sw
  },
  // 0x35: INFOOPTS
  // 0x36: TABLE (BIFF2 only)
  // 0x37: TABLE2 (BIFF2 only)
  // 0x38: WNDESK
  // 0x39 ??
  // 0x3a: BEGINPREF
  // 0x3b: ENDPREF
  /*::[*/
  62: {
    /* n:"BIFF2WINDOW2", */
  },
  // 0x3f ??
  // 0x46: SHOWSCROLL
  // 0x47: SHOWFORMULA
  // 0x48: STATUSBAR
  // 0x49: SHORTMENUS
  // 0x4A:
  // 0x4B:
  // 0x4C:
  // 0x4E:
  // 0x4F:
  // 0x58: TOOLBAR (BIFF3)
  /* - - - */
  /*::[*/
  52: {
    /* n:"DDEObjName", */
  },
  /*::[*/
  67: {
    /* n:"BIFF2XF", */
  },
  /*::[*/
  68: {
    /* n:"BIFF2XFINDEX", */
    f: Ar
  },
  /*::[*/
  69: {
    /* n:"BIFF2FONTCLR", */
  },
  /*::[*/
  86: {
    /* n:"BIFF4FMTCNT", */
  },
  /* 16-bit cnt, similar to BIFF2 */
  /*::[*/
  126: {
    /* n:"RK", */
  },
  /* Not necessarily same as 0x027e */
  /*::[*/
  127: {
    /* n:"ImData", */
    f: rw
  },
  /*::[*/
  135: {
    /* n:"Addin", */
  },
  /*::[*/
  136: {
    /* n:"Edg", */
  },
  /*::[*/
  137: {
    /* n:"Pub", */
  },
  // 0x8A
  // 0x8B LH: alternate menu key flag (BIFF3/4)
  // 0x8E
  // 0x8F
  /*::[*/
  145: {
    /* n:"Sub", */
  },
  // 0x93 STYLE
  /*::[*/
  148: {
    /* n:"LHRecord", */
  },
  /*::[*/
  149: {
    /* n:"LHNGraph", */
  },
  /*::[*/
  150: {
    /* n:"Sound", */
  },
  // 0xA2 FNPROTO: function prototypes (BIFF4)
  // 0xA3
  // 0xA8
  /*::[*/
  169: {
    /* n:"CoordList", */
  },
  /*::[*/
  171: {
    /* n:"GCW", */
  },
  /*::[*/
  188: {
    /* n:"ShrFmla", */
  },
  /* Not necessarily same as 0x04bc */
  /*::[*/
  191: {
    /* n:"ToolbarHdr", */
  },
  /*::[*/
  192: {
    /* n:"ToolbarEnd", */
  },
  /*::[*/
  194: {
    /* n:"AddMenu", */
  },
  /*::[*/
  195: {
    /* n:"DelMenu", */
  },
  /*::[*/
  214: {
    /* n:"RString", */
    f: lw
  },
  /*::[*/
  223: {
    /* n:"UDDesc", */
  },
  /*::[*/
  234: {
    /* n:"TabIdConf", */
  },
  /*::[*/
  354: {
    /* n:"XL5Modify", */
  },
  /*::[*/
  421: {
    /* n:"FileSharing2", */
  },
  /*::[*/
  518: {
    /* n:"Formula", */
    f: hc
  },
  /*::[*/
  521: {
    /* n:"BOF", */
    f: eo
  },
  /*::[*/
  536: {
    /* n:"Lbl", */
    f: Ah
  },
  /*::[*/
  547: {
    /* n:"ExternName", */
    f: Ch
  },
  /*::[*/
  561: {
    /* n:"Font", */
  },
  /*::[*/
  579: {
    /* n:"BIFF3XF", */
  },
  /*::[*/
  1030: {
    /* n:"Formula", */
    f: hc
  },
  /*::[*/
  1033: {
    /* n:"BOF", */
    f: eo
  },
  /*::[*/
  1091: {
    /* n:"BIFF4XF", */
  },
  /*::[*/
  2157: {
    /* n:"FeatInfo", */
  },
  /*::[*/
  2163: {
    /* n:"FeatInfo11", */
  },
  /*::[*/
  2177: {
    /* n:"SXAddl12", */
  },
  /*::[*/
  2240: {
    /* n:"AutoWebPub", */
  },
  /*::[*/
  2241: {
    /* n:"ListObj", */
  },
  /*::[*/
  2242: {
    /* n:"ListField", */
  },
  /*::[*/
  2243: {
    /* n:"ListDV", */
  },
  /*::[*/
  2244: {
    /* n:"ListCondFmt", */
  },
  /*::[*/
  2245: {
    /* n:"ListCF", */
  },
  /*::[*/
  2246: {
    /* n:"FMQry", */
  },
  /*::[*/
  2247: {
    /* n:"FMSQry", */
  },
  /*::[*/
  2248: {
    /* n:"PLV", */
  },
  /*::[*/
  2249: {
    /* n:"LnExt", */
  },
  /*::[*/
  2250: {
    /* n:"MkrExt", */
  },
  /*::[*/
  2251: {
    /* n:"CrtCoopt", */
  },
  /*::[*/
  2262: {
    /* n:"FRTArchId$", */
    r: 12
  },
  /*::[*/
  29282: {}
};
function qt(e, n, r, s) {
  var i = n;
  if (!isNaN(i)) {
    var o = (r || []).length || 0, c = e.next(4);
    c.write_shift(2, i), c.write_shift(2, o), /*:: len != null &&*/
    o > 0 && Ip(r) && e.push(r);
  }
}
function jh(e, n) {
  var r = n || {}, s = r.dense ? [] : {};
  e = e.replace(/<!--.*?-->/g, "");
  var i = e.match(/<table/i);
  if (!i) throw new Error("Invalid HTML: could not find <table>");
  var o = e.match(/<\/table/i), c = i.index, u = o && o.index || e.length, d = Rg(e.slice(c, u), /(:?<tr[^>]*>)/i, "<tr>"), x = -1, p = 0, g = 0, w = 0, k = { s: { r: 1e7, c: 1e7 }, e: { r: 0, c: 0 } }, _ = [];
  for (c = 0; c < d.length; ++c) {
    var y = d[c].trim(), E = y.slice(0, 3).toLowerCase();
    if (E == "<tr") {
      if (++x, r.sheetRows && r.sheetRows <= x) {
        --x;
        break;
      }
      p = 0;
      continue;
    }
    if (!(E != "<td" && E != "<th")) {
      var A = y.split(/<\/t[dh]>/i);
      for (u = 0; u < A.length; ++u) {
        var O = A[u].trim();
        if (O.match(/<t[dh]/i)) {
          for (var N = O, V = 0; N.charAt(0) == "<" && (V = N.indexOf(">")) > -1; ) N = N.slice(V + 1);
          for (var J = 0; J < _.length; ++J) {
            var j = _[J];
            j.s.c == p && j.s.r < x && x <= j.e.r && (p = j.e.c + 1, J = -1);
          }
          var C = Ue(O.slice(0, O.indexOf(">")));
          w = C.colspan ? +C.colspan : 1, ((g = +C.rowspan) > 1 || w > 1) && _.push({ s: { r: x, c: p }, e: { r: x + (g || 1) - 1, c: p + w - 1 } });
          var G = C.t || C["data-t"] || "";
          if (!N.length) {
            p += w;
            continue;
          }
          if (N = kp(N), k.s.r > x && (k.s.r = x), k.e.r < x && (k.e.r = x), k.s.c > p && (k.s.c = p), k.e.c < p && (k.e.c = p), !N.length) {
            p += w;
            continue;
          }
          var B = { t: "s", v: N };
          r.raw || !N.trim().length || G == "s" || (N === "TRUE" ? B = { t: "b", v: !0 } : N === "FALSE" ? B = { t: "b", v: !1 } : isNaN(rn(N)) ? isNaN(gi(N).getDate()) || (B = { t: "d", v: jr(N) }, r.cellDates || (B = { t: "n", v: dt(B.v) }), B.z = r.dateNF || $e[14]) : B = { t: "n", v: rn(N) }), r.dense ? (s[x] || (s[x] = []), s[x][p] = B) : s[Ge({ r: x, c: p })] = B, p += w;
        }
      }
    }
  }
  return s["!ref"] = Je(k), _.length && (s["!merges"] = _), s;
}
function s4(e, n, r, s) {
  for (var i = e["!merges"] || [], o = [], c = n.s.c; c <= n.e.c; ++c) {
    for (var u = 0, d = 0, x = 0; x < i.length; ++x)
      if (!(i[x].s.r > r || i[x].s.c > c) && !(i[x].e.r < r || i[x].e.c < c)) {
        if (i[x].s.r < r || i[x].s.c < c) {
          u = -1;
          break;
        }
        u = i[x].e.r - i[x].s.r + 1, d = i[x].e.c - i[x].s.c + 1;
        break;
      }
    if (!(u < 0)) {
      var p = Ge({ r, c }), g = s.dense ? (e[r] || [])[c] : e[p], w = g && g.v != null && (g.h || Uc(g.w || (Rn(g), g.w) || "")) || "", k = {};
      u > 1 && (k.rowspan = u), d > 1 && (k.colspan = d), s.editable ? w = '<span contenteditable="true">' + w + "</span>" : g && (k["data-t"] = g && g.t || "z", g.v != null && (k["data-v"] = g.v), g.z != null && (k["data-z"] = g.z), g.l && (g.l.Target || "#").charAt(0) != "#" && (w = '<a href="' + g.l.Target + '">' + w + "</a>")), k.id = (s.id || "sjs") + "-" + p, o.push($g("td", w, k));
    }
  }
  var _ = "<tr>";
  return _ + o.join("") + "</tr>";
}
var l4 = '<html><head><meta charset="utf-8"/><title>SheetJS Table Export</title></head><body>', o4 = "</body></html>";
function c4(e, n) {
  var r = e.match(/<table[\s\S]*?>[\s\S]*?<\/table>/gi);
  if (!r || r.length == 0) throw new Error("Invalid HTML: could not find <table>");
  if (r.length == 1) return la(jh(r[0], n), n);
  var s = au();
  return r.forEach(function(i, o) {
    iu(s, jh(i, n), "Sheet" + (o + 1));
  }), s;
}
function u4(e, n, r) {
  var s = [];
  return s.join("") + "<table" + (r && r.id ? ' id="' + r.id + '"' : "") + ">";
}
function f4(e, n) {
  var r = n || {}, s = r.header != null ? r.header : l4, i = r.footer != null ? r.footer : o4, o = [s], c = yi(e["!ref"]);
  r.dense = Array.isArray(e), o.push(u4(e, c, r));
  for (var u = c.s.r; u <= c.e.r; ++u) o.push(s4(e, c, u, r));
  return o.push("</table>" + i), o.join("");
}
function A1(e, n, r) {
  var s = r || {}, i = 0, o = 0;
  if (s.origin != null)
    if (typeof s.origin == "number") i = s.origin;
    else {
      var c = typeof s.origin == "string" ? ut(s.origin) : s.origin;
      i = c.r, o = c.c;
    }
  var u = n.getElementsByTagName("tr"), d = Math.min(s.sheetRows || 1e7, u.length), x = { s: { r: 0, c: 0 }, e: { r: i, c: o } };
  if (e["!ref"]) {
    var p = yi(e["!ref"]);
    x.s.r = Math.min(x.s.r, p.s.r), x.s.c = Math.min(x.s.c, p.s.c), x.e.r = Math.max(x.e.r, p.e.r), x.e.c = Math.max(x.e.c, p.e.c), i == -1 && (x.e.r = i = p.e.r + 1);
  }
  var g = [], w = 0, k = e["!rows"] || (e["!rows"] = []), _ = 0, y = 0, E = 0, A = 0, O = 0, N = 0;
  for (e["!cols"] || (e["!cols"] = []); _ < u.length && y < d; ++_) {
    var V = u[_];
    if (Uh(V)) {
      if (s.display) continue;
      k[y] = { hidden: !0 };
    }
    var J = V.children;
    for (E = A = 0; E < J.length; ++E) {
      var j = J[E];
      if (!(s.display && Uh(j))) {
        var C = j.hasAttribute("data-v") ? j.getAttribute("data-v") : j.hasAttribute("v") ? j.getAttribute("v") : kp(j.innerHTML), G = j.getAttribute("data-z") || j.getAttribute("z");
        for (w = 0; w < g.length; ++w) {
          var B = g[w];
          B.s.c == A + o && B.s.r < y + i && y + i <= B.e.r && (A = B.e.c + 1 - o, w = -1);
        }
        N = +j.getAttribute("colspan") || 1, ((O = +j.getAttribute("rowspan") || 1) > 1 || N > 1) && g.push({ s: { r: y + i, c: A + o }, e: { r: y + i + (O || 1) - 1, c: A + o + (N || 1) - 1 } });
        var le = { t: "s", v: C }, re = j.getAttribute("data-t") || j.getAttribute("t") || "";
        C != null && (C.length == 0 ? le.t = re || "z" : s.raw || C.trim().length == 0 || re == "s" || (C === "TRUE" ? le = { t: "b", v: !0 } : C === "FALSE" ? le = { t: "b", v: !1 } : isNaN(rn(C)) ? isNaN(gi(C).getDate()) || (le = { t: "d", v: jr(C) }, s.cellDates || (le = { t: "n", v: dt(le.v) }), le.z = s.dateNF || $e[14]) : le = { t: "n", v: rn(C) })), le.z === void 0 && G != null && (le.z = G);
        var Q = "", pe = j.getElementsByTagName("A");
        if (pe && pe.length) for (var Ce = 0; Ce < pe.length && !(pe[Ce].hasAttribute("href") && (Q = pe[Ce].getAttribute("href"), Q.charAt(0) != "#")); ++Ce) ;
        Q && Q.charAt(0) != "#" && (le.l = { Target: Q }), s.dense ? (e[y + i] || (e[y + i] = []), e[y + i][A + o] = le) : e[Ge({ c: A + o, r: y + i })] = le, x.e.c < A + o && (x.e.c = A + o), A += N;
      }
    }
    ++y;
  }
  return g.length && (e["!merges"] = (e["!merges"] || []).concat(g)), x.e.r = Math.max(x.e.r, y - 1 + i), e["!ref"] = Je(x), y >= d && (e["!fullref"] = Je((x.e.r = u.length - _ + y - 1 + i, x))), e;
}
function F1(e, n) {
  var r = n || {}, s = r.dense ? [] : {};
  return A1(s, e, n);
}
function d4(e, n) {
  return la(F1(e, n), n);
}
function Uh(e) {
  var n = "", r = h4(e);
  return r && (n = r(e).getPropertyValue("display")), n || (n = e.style && e.style.display), n === "none";
}
function h4(e) {
  return e.ownerDocument.defaultView && typeof e.ownerDocument.defaultView.getComputedStyle == "function" ? e.ownerDocument.defaultView.getComputedStyle : typeof getComputedStyle == "function" ? getComputedStyle : null;
}
function p4(e) {
  var n = e.replace(/[\t\r\n]/g, " ").trim().replace(/ +/g, " ").replace(/<text:s\/>/g, " ").replace(/<text:s text:c="(\d+)"\/>/g, function(s, i) {
    return Array(parseInt(i, 10) + 1).join(" ");
  }).replace(/<text:tab[^>]*\/>/g, "	").replace(/<text:line-break\/>/g, `
`), r = er(n.replace(/<[^>]*>/g, ""));
  return [r];
}
var zh = {
  /* ods name: [short ssf fmt, long ssf fmt] */
  day: ["d", "dd"],
  month: ["m", "mm"],
  year: ["y", "yy"],
  hours: ["h", "hh"],
  minutes: ["m", "mm"],
  seconds: ["s", "ss"],
  "am-pm": ["A/P", "AM/PM"],
  "day-of-week": ["ddd", "dddd"],
  era: ["e", "ee"],
  /* there is no native representation of LO "Q" format */
  quarter: ["\\Qm", 'm\\"th quarter"']
};
function N1(e, n) {
  var r = n || {}, s = zc(e), i = [], o, c, u = { name: "" }, d = "", x = 0, p, g, w = {}, k = [], _ = r.dense ? [] : {}, y, E, A = { value: "" }, O = "", N = 0, V = [], J = -1, j = -1, C = { s: { r: 1e6, c: 1e7 }, e: { r: 0, c: 0 } }, G = 0, B = {}, le = [], re = {}, Q = 0, pe = 0, Ce = [], xe = 1, we = 1, ye = [], ge = { Names: [] }, Y = {}, he = ["", ""], U = [], F = {}, X = "", z = 0, H = !1, ue = !1, K = 0;
  for (As.lastIndex = 0, s = s.replace(/<!--([\s\S]*?)-->/mg, "").replace(/<!DOCTYPE[^\[]*\[[^\]]*\]>/gm, ""); y = As.exec(s); ) switch (y[3] = y[3].replace(/_.*$/, "")) {
    case "table":
    case "工作表":
      y[1] === "/" ? (C.e.c >= C.s.c && C.e.r >= C.s.r ? _["!ref"] = Je(C) : _["!ref"] = "A1:A1", r.sheetRows > 0 && r.sheetRows <= C.e.r && (_["!fullref"] = _["!ref"], C.e.r = r.sheetRows - 1, _["!ref"] = Je(C)), le.length && (_["!merges"] = le), Ce.length && (_["!rows"] = Ce), p.name = p.名称 || p.name, typeof JSON < "u" && JSON.stringify(p), k.push(p.name), w[p.name] = _, ue = !1) : y[0].charAt(y[0].length - 2) !== "/" && (p = Ue(y[0], !1), J = j = -1, C.s.r = C.s.c = 1e7, C.e.r = C.e.c = 0, _ = r.dense ? [] : {}, le = [], Ce = [], ue = !0);
      break;
    case "table-row-group":
      y[1] === "/" ? --G : ++G;
      break;
    case "table-row":
    case "行":
      if (y[1] === "/") {
        J += xe, xe = 1;
        break;
      }
      if (g = Ue(y[0], !1), g.行号 ? J = g.行号 - 1 : J == -1 && (J = 0), xe = +g["number-rows-repeated"] || 1, xe < 10) for (K = 0; K < xe; ++K) G > 0 && (Ce[J + K] = { level: G });
      j = -1;
      break;
    case "covered-table-cell":
      y[1] !== "/" && ++j, r.sheetStubs && (r.dense ? (_[J] || (_[J] = []), _[J][j] = { t: "z" }) : _[Ge({ r: J, c: j })] = { t: "z" }), O = "", V = [];
      break;
    /* stub */
    case "table-cell":
    case "数据":
      if (y[0].charAt(y[0].length - 2) === "/")
        ++j, A = Ue(y[0], !1), we = parseInt(A["number-columns-repeated"] || "1", 10), E = {
          t: "z",
          v: null
          /*:: , z:null, w:"",c:[]*/
        }, A.formula && r.cellFormula != !1 && (E.f = Ih(er(A.formula))), (A.数据类型 || A["value-type"]) == "string" && (E.t = "s", E.v = er(A["string-value"] || ""), r.dense ? (_[J] || (_[J] = []), _[J][j] = E) : _[Ge({ r: J, c: j })] = E), j += we - 1;
      else if (y[1] !== "/") {
        ++j, O = "", N = 0, V = [], we = 1;
        var te = xe ? J + xe - 1 : J;
        if (j > C.e.c && (C.e.c = j), j < C.s.c && (C.s.c = j), J < C.s.r && (C.s.r = J), te > C.e.r && (C.e.r = te), A = Ue(y[0], !1), U = [], F = {}, E = {
          t: A.数据类型 || A["value-type"],
          v: null
          /*:: , z:null, w:"",c:[]*/
        }, r.cellFormula)
          if (A.formula && (A.formula = er(A.formula)), A["number-matrix-columns-spanned"] && A["number-matrix-rows-spanned"] && (Q = parseInt(A["number-matrix-rows-spanned"], 10) || 0, pe = parseInt(A["number-matrix-columns-spanned"], 10) || 0, re = { s: { r: J, c: j }, e: { r: J + Q - 1, c: j + pe - 1 } }, E.F = Je(re), ye.push([re, E.F])), A.formula) E.f = Ih(A.formula);
          else for (K = 0; K < ye.length; ++K)
            J >= ye[K][0].s.r && J <= ye[K][0].e.r && j >= ye[K][0].s.c && j <= ye[K][0].e.c && (E.F = ye[K][1]);
        switch ((A["number-columns-spanned"] || A["number-rows-spanned"]) && (Q = parseInt(A["number-rows-spanned"], 10) || 0, pe = parseInt(A["number-columns-spanned"], 10) || 0, re = { s: { r: J, c: j }, e: { r: J + Q - 1, c: j + pe - 1 } }, le.push(re)), A["number-columns-repeated"] && (we = parseInt(A["number-columns-repeated"], 10)), E.t) {
          case "boolean":
            E.t = "b", E.v = dr(A["boolean-value"]);
            break;
          case "float":
            E.t = "n", E.v = parseFloat(A.value);
            break;
          case "percentage":
            E.t = "n", E.v = parseFloat(A.value);
            break;
          case "currency":
            E.t = "n", E.v = parseFloat(A.value);
            break;
          case "date":
            E.t = "d", E.v = jr(A["date-value"]), r.cellDates || (E.t = "n", E.v = dt(E.v)), E.z = "m/d/yy";
            break;
          case "time":
            E.t = "n", E.v = Ag(A["time-value"]) / 86400, r.cellDates && (E.t = "d", E.v = go(E.v)), E.z = "HH:MM:SS";
            break;
          case "number":
            E.t = "n", E.v = parseFloat(A.数据数值);
            break;
          default:
            if (E.t === "string" || E.t === "text" || !E.t)
              E.t = "s", A["string-value"] != null && (O = er(A["string-value"]), V = []);
            else throw new Error("Unsupported value type " + E.t);
        }
      } else {
        if (H = !1, E.t === "s" && (E.v = O || "", V.length && (E.R = V), H = N == 0), Y.Target && (E.l = Y), U.length > 0 && (E.c = U, U = []), O && r.cellText !== !1 && (E.w = O), H && (E.t = "z", delete E.v), (!H || r.sheetStubs) && !(r.sheetRows && r.sheetRows <= J))
          for (var Z = 0; Z < xe; ++Z) {
            if (we = parseInt(A["number-columns-repeated"] || "1", 10), r.dense)
              for (_[J + Z] || (_[J + Z] = []), _[J + Z][j] = Z == 0 ? E : Vr(E); --we > 0; ) _[J + Z][j + we] = Vr(E);
            else
              for (_[Ge({ r: J + Z, c: j })] = E; --we > 0; ) _[Ge({ r: J + Z, c: j + we })] = Vr(E);
            C.e.c <= j && (C.e.c = j);
          }
        we = parseInt(A["number-columns-repeated"] || "1", 10), j += we - 1, we = 0, E = {
          /*:: t:"", v:null, z:null, w:"",c:[]*/
        }, O = "", V = [];
      }
      Y = {};
      break;
    // 9.1.4 <table:table-cell>
    /* pure state */
    case "document":
    // TODO: <office:document> is the root for FODS
    case "document-content":
    case "电子表格文档":
    // 3.1.3.2 <office:document-content>
    case "spreadsheet":
    case "主体":
    // 3.7 <office:spreadsheet>
    case "scripts":
    // 3.12 <office:scripts>
    case "styles":
    // TODO <office:styles>
    case "font-face-decls":
    // 3.14 <office:font-face-decls>
    case "master-styles":
      if (y[1] === "/") {
        if ((o = i.pop())[0] !== y[3]) throw "Bad state: " + o;
      } else y[0].charAt(y[0].length - 2) !== "/" && i.push([y[3], !0]);
      break;
    case "annotation":
      if (y[1] === "/") {
        if ((o = i.pop())[0] !== y[3]) throw "Bad state: " + o;
        F.t = O, V.length && (F.R = V), F.a = X, U.push(F);
      } else y[0].charAt(y[0].length - 2) !== "/" && i.push([y[3], !1]);
      X = "", z = 0, O = "", N = 0, V = [];
      break;
    case "creator":
      y[1] === "/" ? X = s.slice(z, y.index) : z = y.index + y[0].length;
      break;
    /* ignore state */
    case "meta":
    case "元数据":
    // TODO: <office:meta> <uof:元数据> FODS/UOF
    case "settings":
    // TODO: <office:settings>
    case "config-item-set":
    // TODO: <office:config-item-set>
    case "config-item-map-indexed":
    // TODO: <office:config-item-map-indexed>
    case "config-item-map-entry":
    // TODO: <office:config-item-map-entry>
    case "config-item-map-named":
    // TODO: <office:config-item-map-entry>
    case "shapes":
    // 9.2.8 <table:shapes>
    case "frame":
    // 10.4.2 <draw:frame>
    case "text-box":
    // 10.4.3 <draw:text-box>
    case "image":
    // 10.4.4 <draw:image>
    case "data-pilot-tables":
    // 9.6.2 <table:data-pilot-tables>
    case "list-style":
    // 16.30 <text:list-style>
    case "form":
    // 13.13 <form:form>
    case "dde-links":
    // 9.8 <table:dde-links>
    case "event-listeners":
    // TODO
    case "chart":
      if (y[1] === "/") {
        if ((o = i.pop())[0] !== y[3]) throw "Bad state: " + o;
      } else y[0].charAt(y[0].length - 2) !== "/" && i.push([y[3], !1]);
      O = "", N = 0, V = [];
      break;
    case "scientific-number":
      break;
    case "currency-symbol":
      break;
    case "currency-style":
      break;
    case "number-style":
    // 16.27.2 <number:number-style>
    case "percentage-style":
    // 16.27.9 <number:percentage-style>
    case "date-style":
    // 16.27.10 <number:date-style>
    case "time-style":
      if (y[1] === "/") {
        if (B[u.name] = d, (o = i.pop())[0] !== y[3]) throw "Bad state: " + o;
      } else y[0].charAt(y[0].length - 2) !== "/" && (d = "", u = Ue(y[0], !1), i.push([y[3], !0]));
      break;
    case "script":
      break;
    // 3.13 <office:script>
    case "libraries":
      break;
    // TODO: <ooo:libraries>
    case "automatic-styles":
      break;
    // 3.15.3 <office:automatic-styles>
    case "default-style":
    // TODO: <style:default-style>
    case "page-layout":
      break;
    // TODO: <style:page-layout>
    case "style":
      break;
    case "map":
      break;
    // 16.3 <style:map>
    case "font-face":
      break;
    // 16.21 <style:font-face>
    case "paragraph-properties":
      break;
    // 17.6 <style:paragraph-properties>
    case "table-properties":
      break;
    // 17.15 <style:table-properties>
    case "table-column-properties":
      break;
    // 17.16 <style:table-column-properties>
    case "table-row-properties":
      break;
    // 17.17 <style:table-row-properties>
    case "table-cell-properties":
      break;
    // 17.18 <style:table-cell-properties>
    case "number":
      switch (i[i.length - 1][0]) {
        case "time-style":
        case "date-style":
          c = Ue(y[0], !1), d += zh[y[3]][c.style === "long" ? 1 : 0];
          break;
      }
      break;
    case "fraction":
      break;
    // TODO 16.27.6 <number:fraction>
    case "day":
    // 16.27.11 <number:day>
    case "month":
    // 16.27.12 <number:month>
    case "year":
    // 16.27.13 <number:year>
    case "era":
    // 16.27.14 <number:era>
    case "day-of-week":
    // 16.27.15 <number:day-of-week>
    case "week-of-year":
    // 16.27.16 <number:week-of-year>
    case "quarter":
    // 16.27.17 <number:quarter>
    case "hours":
    // 16.27.19 <number:hours>
    case "minutes":
    // 16.27.20 <number:minutes>
    case "seconds":
    // 16.27.21 <number:seconds>
    case "am-pm":
      switch (i[i.length - 1][0]) {
        case "time-style":
        case "date-style":
          c = Ue(y[0], !1), d += zh[y[3]][c.style === "long" ? 1 : 0];
          break;
      }
      break;
    case "boolean-style":
      break;
    // 16.27.23 <number:boolean-style>
    case "boolean":
      break;
    // 16.27.24 <number:boolean>
    case "text-style":
      break;
    // 16.27.25 <number:text-style>
    case "text":
      if (y[0].slice(-2) === "/>") break;
      if (y[1] === "/") switch (i[i.length - 1][0]) {
        case "number-style":
        case "date-style":
        case "time-style":
          d += s.slice(x, y.index);
          break;
      }
      else x = y.index + y[0].length;
      break;
    case "named-range":
      c = Ue(y[0], !1), he = pc(c["cell-range-address"]);
      var fe = { Name: c.name, Ref: he[0] + "!" + he[1] };
      ue && (fe.Sheet = k.length), ge.Names.push(fe);
      break;
    case "text-content":
      break;
    // 16.27.27 <number:text-content>
    case "text-properties":
      break;
    // 16.27.27 <style:text-properties>
    case "embedded-text":
      break;
    // 16.27.4 <number:embedded-text>
    case "body":
    case "电子表格":
      break;
    // 3.3 16.9.6 19.726.3
    case "forms":
      break;
    // 12.25.2 13.2
    case "table-column":
      break;
    // 9.1.6 <table:table-column>
    case "table-header-rows":
      break;
    // 9.1.7 <table:table-header-rows>
    case "table-rows":
      break;
    // 9.1.12 <table:table-rows>
    /* TODO: outline levels */
    case "table-column-group":
      break;
    // 9.1.10 <table:table-column-group>
    case "table-header-columns":
      break;
    // 9.1.11 <table:table-header-columns>
    case "table-columns":
      break;
    // 9.1.12 <table:table-columns>
    case "null-date":
      break;
    // 9.4.2 <table:null-date> TODO: date1904
    case "graphic-properties":
      break;
    // 17.21 <style:graphic-properties>
    case "calculation-settings":
      break;
    // 9.4.1 <table:calculation-settings>
    case "named-expressions":
      break;
    // 9.4.11 <table:named-expressions>
    case "label-range":
      break;
    // 9.4.9 <table:label-range>
    case "label-ranges":
      break;
    // 9.4.10 <table:label-ranges>
    case "named-expression":
      break;
    // 9.4.13 <table:named-expression>
    case "sort":
      break;
    // 9.4.19 <table:sort>
    case "sort-by":
      break;
    // 9.4.20 <table:sort-by>
    case "sort-groups":
      break;
    // 9.4.22 <table:sort-groups>
    case "tab":
      break;
    // 6.1.4 <text:tab>
    case "line-break":
      break;
    // 6.1.5 <text:line-break>
    case "span":
      break;
    // 6.1.7 <text:span>
    case "p":
    case "文本串":
      if (["master-styles"].indexOf(i[i.length - 1][0]) > -1) break;
      if (y[1] === "/" && (!A || !A["string-value"])) {
        var Pe = p4(s.slice(N, y.index));
        O = (O.length > 0 ? O + `
` : "") + Pe[0];
      } else
        Ue(y[0], !1), N = y.index + y[0].length;
      break;
    // <text:p>
    case "s":
      break;
    // <text:s>
    case "database-range":
      if (y[1] === "/") break;
      try {
        he = pc(Ue(y[0])["target-range-address"]), w[he[0]]["!autofilter"] = { ref: he[1] };
      } catch {
      }
      break;
    case "date":
      break;
    // <*:date>
    case "object":
      break;
    // 10.4.6.2 <draw:object>
    case "title":
    case "标题":
      break;
    // <*:title> OR <uof:标题>
    case "desc":
      break;
    // <*:desc>
    case "binary-data":
      break;
    // 10.4.5 TODO: b64 blob
    /* 9.2 Advanced Tables */
    case "table-source":
      break;
    // 9.2.6
    case "scenario":
      break;
    // 9.2.6
    case "iteration":
      break;
    // 9.4.3 <table:iteration>
    case "content-validations":
      break;
    // 9.4.4 <table:
    case "content-validation":
      break;
    // 9.4.5 <table:
    case "help-message":
      break;
    // 9.4.6 <table:
    case "error-message":
      break;
    // 9.4.7 <table:
    case "database-ranges":
      break;
    // 9.4.14 <table:database-ranges>
    case "filter":
      break;
    // 9.5.2 <table:filter>
    case "filter-and":
      break;
    // 9.5.3 <table:filter-and>
    case "filter-or":
      break;
    // 9.5.4 <table:filter-or>
    case "filter-condition":
      break;
    // 9.5.5 <table:filter-condition>
    case "list-level-style-bullet":
      break;
    // 16.31 <text:
    case "list-level-style-number":
      break;
    // 16.32 <text:
    case "list-level-properties":
      break;
    // 17.19 <style:
    /* 7.3 Document Fields */
    case "sender-firstname":
    // 7.3.6.2
    case "sender-lastname":
    // 7.3.6.3
    case "sender-initials":
    // 7.3.6.4
    case "sender-title":
    // 7.3.6.5
    case "sender-position":
    // 7.3.6.6
    case "sender-email":
    // 7.3.6.7
    case "sender-phone-private":
    // 7.3.6.8
    case "sender-fax":
    // 7.3.6.9
    case "sender-company":
    // 7.3.6.10
    case "sender-phone-work":
    // 7.3.6.11
    case "sender-street":
    // 7.3.6.12
    case "sender-city":
    // 7.3.6.13
    case "sender-postal-code":
    // 7.3.6.14
    case "sender-country":
    // 7.3.6.15
    case "sender-state-or-province":
    // 7.3.6.16
    case "author-name":
    // 7.3.7.1
    case "author-initials":
    // 7.3.7.2
    case "chapter":
    // 7.3.8
    case "file-name":
    // 7.3.9
    case "template-name":
    // 7.3.9
    case "sheet-name":
      break;
    case "event-listener":
      break;
    /* TODO: FODS Properties */
    case "initial-creator":
    case "creation-date":
    case "print-date":
    case "generator":
    case "document-statistic":
    case "user-defined":
    case "editing-duration":
    case "editing-cycles":
      break;
    /* TODO: FODS Config */
    case "config-item":
      break;
    /* TODO: style tokens */
    case "page-number":
      break;
    // TODO <text:page-number>
    case "page-count":
      break;
    // TODO <text:page-count>
    case "time":
      break;
    // TODO <text:time>
    /* 9.3 Advanced Table Cells */
    case "cell-range-source":
      break;
    // 9.3.1 <table:
    case "detective":
      break;
    // 9.3.2 <table:
    case "operation":
      break;
    // 9.3.3 <table:
    case "highlighted-range":
      break;
    // 9.3.4 <table:
    /* 9.6 Data Pilot Tables <table: */
    case "data-pilot-table":
    // 9.6.3
    case "source-cell-range":
    // 9.6.5
    case "source-service":
    // 9.6.6
    case "data-pilot-field":
    // 9.6.7
    case "data-pilot-level":
    // 9.6.8
    case "data-pilot-subtotals":
    // 9.6.9
    case "data-pilot-subtotal":
    // 9.6.10
    case "data-pilot-members":
    // 9.6.11
    case "data-pilot-member":
    // 9.6.12
    case "data-pilot-display-info":
    // 9.6.13
    case "data-pilot-sort-info":
    // 9.6.14
    case "data-pilot-layout-info":
    // 9.6.15
    case "data-pilot-field-reference":
    // 9.6.16
    case "data-pilot-groups":
    // 9.6.17
    case "data-pilot-group":
    // 9.6.18
    case "data-pilot-group-member":
      break;
    /* 10.3 Drawing Shapes */
    case "rect":
      break;
    /* 14.6 DDE Connections */
    case "dde-connection-decls":
    // 14.6.2 <text:
    case "dde-connection-decl":
    // 14.6.3 <text:
    case "dde-link":
    // 14.6.4 <table:
    case "dde-source":
      break;
    case "properties":
      break;
    // 13.7 <form:properties>
    case "property":
      break;
    // 13.8 <form:property>
    case "a":
      if (y[1] !== "/") {
        if (Y = Ue(y[0], !1), !Y.href) break;
        Y.Target = er(Y.href), delete Y.href, Y.Target.charAt(0) == "#" && Y.Target.indexOf(".") > -1 ? (he = pc(Y.Target.slice(1)), Y.Target = "#" + he[0] + "!" + he[1]) : Y.Target.match(/^\.\.[\\\/]/) && (Y.Target = Y.Target.slice(3));
      }
      break;
    /* non-standard */
    case "table-protection":
      break;
    case "data-pilot-grand-total":
      break;
    // <table:
    case "office-document-common-attrs":
      break;
    // bare
    default:
      switch (y[2]) {
        case "dc:":
        // TODO: properties
        case "calcext:":
        // ignore undocumented extensions
        case "loext:":
        // ignore undocumented extensions
        case "ooo:":
        // ignore undocumented extensions
        case "chartooo:":
        // ignore undocumented extensions
        case "draw:":
        // TODO: drawing
        case "style:":
        // TODO: styles
        case "chart:":
        // TODO: charts
        case "form:":
        // TODO: forms
        case "uof:":
        // TODO: uof
        case "表:":
        // TODO: uof
        case "字:":
          break;
        default:
          if (r.WTF) throw new Error(y);
      }
  }
  var P = {
    Sheets: w,
    SheetNames: k,
    Workbook: ge
  };
  return r.bookSheets && delete /*::(*/
  P.Sheets, P;
}
function Hh(e, n) {
  n = n || {}, Bt(e, "META-INF/manifest.xml") && Rv(Cr(e, "META-INF/manifest.xml"), n);
  var r = At(e, "content.xml");
  if (!r) throw new Error("Missing content.xml in ODS / UOF file");
  var s = N1(lr(r), n);
  return Bt(e, "meta.xml") && (s.Props = Hp(Cr(e, "meta.xml"))), s;
}
function Vh(e, n) {
  return N1(e, n);
}
/*! sheetjs (C) 2013-present SheetJS -- http://sheetjs.com */
function eu(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Ac(e) {
  return typeof TextDecoder < "u" ? new TextDecoder().decode(e) : lr(ba(e));
}
function Fc(e) {
  var n = e.reduce(function(i, o) {
    return i + o.length;
  }, 0), r = new Uint8Array(n), s = 0;
  return e.forEach(function(i) {
    r.set(i, s), s += i.length;
  }), r;
}
function Wh(e) {
  return e -= e >> 1 & 1431655765, e = (e & 858993459) + (e >> 2 & 858993459), (e + (e >> 4) & 252645135) * 16843009 >>> 24;
}
function x4(e, n) {
  for (var r = (e[n + 15] & 127) << 7 | e[n + 14] >> 1, s = e[n + 14] & 1, i = n + 13; i >= n; --i)
    s = s * 256 + e[i];
  return (e[n + 15] & 128 ? -s : s) * Math.pow(10, r - 6176);
}
function Ds(e, n) {
  var r = n ? n[0] : 0, s = e[r] & 127;
  e:
    if (e[r++] >= 128 && (s |= (e[r] & 127) << 7, e[r++] < 128 || (s |= (e[r] & 127) << 14, e[r++] < 128) || (s |= (e[r] & 127) << 21, e[r++] < 128) || (s += (e[r] & 127) * Math.pow(2, 28), ++r, e[r++] < 128) || (s += (e[r] & 127) * Math.pow(2, 35), ++r, e[r++] < 128) || (s += (e[r] & 127) * Math.pow(2, 42), ++r, e[r++] < 128)))
      break e;
  return n && (n[0] = r), s;
}
function Pr(e) {
  var n = 0, r = e[n] & 127;
  e:
    if (e[n++] >= 128) {
      if (r |= (e[n] & 127) << 7, e[n++] < 128 || (r |= (e[n] & 127) << 14, e[n++] < 128) || (r |= (e[n] & 127) << 21, e[n++] < 128))
        break e;
      r |= (e[n] & 127) << 28;
    }
  return r;
}
function tt(e) {
  for (var n = [], r = [0]; r[0] < e.length; ) {
    var s = r[0], i = Ds(e, r), o = i & 7;
    i = Math.floor(i / 8);
    var c = 0, u;
    if (i == 0)
      break;
    switch (o) {
      case 0:
        {
          for (var d = r[0]; e[r[0]++] >= 128; )
            ;
          u = e.slice(d, r[0]);
        }
        break;
      case 5:
        c = 4, u = e.slice(r[0], r[0] + c), r[0] += c;
        break;
      case 1:
        c = 8, u = e.slice(r[0], r[0] + c), r[0] += c;
        break;
      case 2:
        c = Ds(e, r), u = e.slice(r[0], r[0] + c), r[0] += c;
        break;
      case 3:
      case 4:
      default:
        throw new Error("PB Type ".concat(o, " for Field ").concat(i, " at offset ").concat(s));
    }
    var x = { data: u, type: o };
    n[i] == null ? n[i] = [x] : n[i].push(x);
  }
  return n;
}
function ru(e, n) {
  return (e == null ? void 0 : e.map(function(r) {
    return n(r.data);
  })) || [];
}
function m4(e) {
  for (var n, r = [], s = [0]; s[0] < e.length; ) {
    var i = Ds(e, s), o = tt(e.slice(s[0], s[0] + i));
    s[0] += i;
    var c = {
      id: Pr(o[1][0].data),
      messages: []
    };
    o[2].forEach(function(u) {
      var d = tt(u.data), x = Pr(d[3][0].data);
      c.messages.push({
        meta: d,
        data: e.slice(s[0], s[0] + x)
      }), s[0] += x;
    }), (n = o[3]) != null && n[0] && (c.merge = Pr(o[3][0].data) >>> 0 > 0), r.push(c);
  }
  return r;
}
function g4(e, n) {
  if (e != 0)
    throw new Error("Unexpected Snappy chunk type ".concat(e));
  for (var r = [0], s = Ds(n, r), i = []; r[0] < n.length; ) {
    var o = n[r[0]] & 3;
    if (o == 0) {
      var c = n[r[0]++] >> 2;
      if (c < 60)
        ++c;
      else {
        var u = c - 59;
        c = n[r[0]], u > 1 && (c |= n[r[0] + 1] << 8), u > 2 && (c |= n[r[0] + 2] << 16), u > 3 && (c |= n[r[0] + 3] << 24), c >>>= 0, c++, r[0] += u;
      }
      i.push(n.slice(r[0], r[0] + c)), r[0] += c;
      continue;
    } else {
      var d = 0, x = 0;
      if (o == 1 ? (x = (n[r[0]] >> 2 & 7) + 4, d = (n[r[0]++] & 224) << 3, d |= n[r[0]++]) : (x = (n[r[0]++] >> 2) + 1, o == 2 ? (d = n[r[0]] | n[r[0] + 1] << 8, r[0] += 2) : (d = (n[r[0]] | n[r[0] + 1] << 8 | n[r[0] + 2] << 16 | n[r[0] + 3] << 24) >>> 0, r[0] += 4)), i = [Fc(i)], d == 0)
        throw new Error("Invalid offset 0");
      if (d > i[0].length)
        throw new Error("Invalid offset beyond length");
      if (x >= d)
        for (i.push(i[0].slice(-d)), x -= d; x >= i[i.length - 1].length; )
          i.push(i[i.length - 1]), x -= i[i.length - 1].length;
      i.push(i[0].slice(-d, -d + x));
    }
  }
  var p = Fc(i);
  if (p.length != s)
    throw new Error("Unexpected length: ".concat(p.length, " != ").concat(s));
  return p;
}
function v4(e) {
  for (var n = [], r = 0; r < e.length; ) {
    var s = e[r++], i = e[r] | e[r + 1] << 8 | e[r + 2] << 16;
    r += 3, n.push(g4(s, e.slice(r, r + i))), r += i;
  }
  if (r !== e.length)
    throw new Error("data is not a valid framed stream!");
  return Fc(n);
}
function w4(e, n, r, s) {
  var i = eu(e), o = i.getUint32(4, !0), c = (s > 1 ? 12 : 8) + Wh(o & (s > 1 ? 3470 : 398)) * 4, u = -1, d = -1, x = NaN, p = new Date(2001, 0, 1);
  o & 512 && (u = i.getUint32(c, !0), c += 4), c += Wh(o & (s > 1 ? 12288 : 4096)) * 4, o & 16 && (d = i.getUint32(c, !0), c += 4), o & 32 && (x = i.getFloat64(c, !0), c += 8), o & 64 && (p.setTime(p.getTime() + i.getFloat64(c, !0) * 1e3), c += 8);
  var g;
  switch (e[2]) {
    case 0:
      break;
    case 2:
      g = { t: "n", v: x };
      break;
    case 3:
      g = { t: "s", v: n[d] };
      break;
    case 5:
      g = { t: "d", v: p };
      break;
    case 6:
      g = { t: "b", v: x > 0 };
      break;
    case 7:
      g = { t: "n", v: x / 86400 };
      break;
    case 8:
      g = { t: "e", v: 0 };
      break;
    case 9:
      if (u > -1)
        g = { t: "s", v: r[u] };
      else if (d > -1)
        g = { t: "s", v: n[d] };
      else if (!isNaN(x))
        g = { t: "n", v: x };
      else
        throw new Error("Unsupported cell type ".concat(e.slice(0, 4)));
      break;
    default:
      throw new Error("Unsupported cell type ".concat(e.slice(0, 4)));
  }
  return g;
}
function y4(e, n, r) {
  var s = eu(e), i = s.getUint32(8, !0), o = 12, c = -1, u = -1, d = NaN, x = NaN, p = new Date(2001, 0, 1);
  i & 1 && (d = x4(e, o), o += 16), i & 2 && (x = s.getFloat64(o, !0), o += 8), i & 4 && (p.setTime(p.getTime() + s.getFloat64(o, !0) * 1e3), o += 8), i & 8 && (u = s.getUint32(o, !0), o += 4), i & 16 && (c = s.getUint32(o, !0), o += 4);
  var g;
  switch (e[1]) {
    case 0:
      break;
    case 2:
      g = { t: "n", v: d };
      break;
    case 3:
      g = { t: "s", v: n[u] };
      break;
    case 5:
      g = { t: "d", v: p };
      break;
    case 6:
      g = { t: "b", v: x > 0 };
      break;
    case 7:
      g = { t: "n", v: x / 86400 };
      break;
    case 8:
      g = { t: "e", v: 0 };
      break;
    case 9:
      if (c > -1)
        g = { t: "s", v: r[c] };
      else
        throw new Error("Unsupported cell type ".concat(e[1], " : ").concat(i & 31, " : ").concat(e.slice(0, 4)));
      break;
    case 10:
      g = { t: "n", v: d };
      break;
    default:
      throw new Error("Unsupported cell type ".concat(e[1], " : ").concat(i & 31, " : ").concat(e.slice(0, 4)));
  }
  return g;
}
function _4(e, n, r) {
  switch (e[0]) {
    case 0:
    case 1:
    case 2:
    case 3:
      return w4(e, n, r, e[0]);
    case 5:
      return y4(e, n, r);
    default:
      throw new Error("Unsupported payload version ".concat(e[0]));
  }
}
function aa(e) {
  var n = tt(e);
  return Ds(n[1][0].data);
}
function Gh(e, n) {
  var r = tt(n.data), s = Pr(r[1][0].data), i = r[3], o = [];
  return (i || []).forEach(function(c) {
    var u = tt(c.data), d = Pr(u[1][0].data) >>> 0;
    switch (s) {
      case 1:
        o[d] = Ac(u[3][0].data);
        break;
      case 8:
        {
          var x = e[aa(u[9][0].data)][0], p = tt(x.data), g = e[aa(p[1][0].data)][0], w = Pr(g.meta[1][0].data);
          if (w != 2001)
            throw new Error("2000 unexpected reference to ".concat(w));
          var k = tt(g.data);
          o[d] = k[3].map(function(_) {
            return Ac(_.data);
          }).join("");
        }
        break;
    }
  }), o;
}
function k4(e, n) {
  var r, s, i, o, c, u, d, x, p, g, w, k, _, y, E = tt(e), A = Pr(E[1][0].data) >>> 0, O = Pr(E[2][0].data) >>> 0, N = ((s = (r = E[8]) == null ? void 0 : r[0]) == null ? void 0 : s.data) && Pr(E[8][0].data) > 0 || !1, V, J;
  if ((o = (i = E[7]) == null ? void 0 : i[0]) != null && o.data && n != 0)
    V = (u = (c = E[7]) == null ? void 0 : c[0]) == null ? void 0 : u.data, J = (x = (d = E[6]) == null ? void 0 : d[0]) == null ? void 0 : x.data;
  else if ((g = (p = E[4]) == null ? void 0 : p[0]) != null && g.data && n != 1)
    V = (k = (w = E[4]) == null ? void 0 : w[0]) == null ? void 0 : k.data, J = (y = (_ = E[3]) == null ? void 0 : _[0]) == null ? void 0 : y.data;
  else
    throw "NUMBERS Tile missing ".concat(n, " cell storage");
  for (var j = N ? 4 : 1, C = eu(V), G = [], B = 0; B < V.length / 2; ++B) {
    var le = C.getUint16(B * 2, !0);
    le < 65535 && G.push([B, le]);
  }
  if (G.length != O)
    throw "Expected ".concat(O, " cells, found ").concat(G.length);
  var re = [];
  for (B = 0; B < G.length - 1; ++B)
    re[G[B][0]] = J.subarray(G[B][1] * j, G[B + 1][1] * j);
  return G.length >= 1 && (re[G[G.length - 1][0]] = J.subarray(G[G.length - 1][1] * j)), { R: A, cells: re };
}
function E4(e, n) {
  var r, s = tt(n.data), i = (r = s == null ? void 0 : s[7]) != null && r[0] ? Pr(s[7][0].data) >>> 0 > 0 ? 1 : 0 : -1, o = ru(s[5], function(c) {
    return k4(c, i);
  });
  return {
    nrows: Pr(s[4][0].data) >>> 0,
    data: o.reduce(function(c, u) {
      return c[u.R] || (c[u.R] = []), u.cells.forEach(function(d, x) {
        if (c[u.R][x])
          throw new Error("Duplicate cell r=".concat(u.R, " c=").concat(x));
        c[u.R][x] = d;
      }), c;
    }, [])
  };
}
function S4(e, n, r) {
  var s, i = tt(n.data), o = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
  if (o.e.r = (Pr(i[6][0].data) >>> 0) - 1, o.e.r < 0)
    throw new Error("Invalid row varint ".concat(i[6][0].data));
  if (o.e.c = (Pr(i[7][0].data) >>> 0) - 1, o.e.c < 0)
    throw new Error("Invalid col varint ".concat(i[7][0].data));
  r["!ref"] = Je(o);
  var c = tt(i[4][0].data), u = Gh(e, e[aa(c[4][0].data)][0]), d = (s = c[17]) != null && s[0] ? Gh(e, e[aa(c[17][0].data)][0]) : [], x = tt(c[3][0].data), p = 0;
  x[1].forEach(function(g) {
    var w = tt(g.data), k = e[aa(w[2][0].data)][0], _ = Pr(k.meta[1][0].data);
    if (_ != 6002)
      throw new Error("6001 unexpected reference to ".concat(_));
    var y = E4(e, k);
    y.data.forEach(function(E, A) {
      E.forEach(function(O, N) {
        var V = Ge({ r: p + A, c: N }), J = _4(O, u, d);
        J && (r[V] = J);
      });
    }), p += y.nrows;
  });
}
function T4(e, n) {
  var r = tt(n.data), s = { "!ref": "A1" }, i = e[aa(r[2][0].data)], o = Pr(i[0].meta[1][0].data);
  if (o != 6001)
    throw new Error("6000 unexpected reference to ".concat(o));
  return S4(e, i[0], s), s;
}
function C4(e, n) {
  var r, s = tt(n.data), i = {
    name: (r = s[1]) != null && r[0] ? Ac(s[1][0].data) : "",
    sheets: []
  }, o = ru(s[2], aa);
  return o.forEach(function(c) {
    e[c].forEach(function(u) {
      var d = Pr(u.meta[1][0].data);
      d == 6e3 && i.sheets.push(T4(e, u));
    });
  }), i;
}
function A4(e, n) {
  var r = au(), s = tt(n.data), i = ru(s[1], aa);
  if (i.forEach(function(o) {
    e[o].forEach(function(c) {
      var u = Pr(c.meta[1][0].data);
      if (u == 2) {
        var d = C4(e, c);
        d.sheets.forEach(function(x, p) {
          iu(r, x, p == 0 ? d.name : d.name + "_" + p, !0);
        });
      }
    });
  }), r.SheetNames.length == 0)
    throw new Error("Empty NUMBERS file");
  return r;
}
function mc(e) {
  var n, r, s, i, o = {}, c = [];
  if (e.FullPaths.forEach(function(d) {
    if (d.match(/\.iwpv2/))
      throw new Error("Unsupported password protection");
  }), e.FileIndex.forEach(function(d) {
    if (d.name.match(/\.iwa$/)) {
      var x;
      try {
        x = v4(d.content);
      } catch (g) {
        return console.log("?? " + d.content.length + " " + (g.message || g));
      }
      var p;
      try {
        p = m4(x);
      } catch (g) {
        return console.log("## " + (g.message || g));
      }
      p.forEach(function(g) {
        o[g.id] = g.messages, c.push(g.id);
      });
    }
  }), !c.length)
    throw new Error("File has no messages");
  var u = ((i = (s = (r = (n = o == null ? void 0 : o[1]) == null ? void 0 : n[0]) == null ? void 0 : r.meta) == null ? void 0 : s[1]) == null ? void 0 : i[0].data) && Pr(o[1][0].meta[1][0].data) == 1 && o[1][0];
  if (u || c.forEach(function(d) {
    o[d].forEach(function(x) {
      var p = Pr(x.meta[1][0].data) >>> 0;
      if (p == 1)
        if (!u)
          u = x;
        else
          throw new Error("Document has multiple roots");
    });
  }), !u)
    throw new Error("Cannot find Document root");
  return A4(o, u);
}
function F4(e) {
  return function(r) {
    for (var s = 0; s != e.length; ++s) {
      var i = e[s];
      r[i[0]] === void 0 && (r[i[0]] = i[1]), i[2] === "n" && (r[i[0]] = Number(r[i[0]]));
    }
  };
}
function tu(e) {
  F4([
    ["cellNF", !1],
    /* emit cell number format string as .z */
    ["cellHTML", !0],
    /* emit html string as .h */
    ["cellFormula", !0],
    /* emit formulae as .f */
    ["cellStyles", !1],
    /* emits style/theme as .s */
    ["cellText", !0],
    /* emit formatted text as .w */
    ["cellDates", !1],
    /* emit date cells with type `d` */
    ["sheetStubs", !1],
    /* emit empty cells */
    ["sheetRows", 0, "n"],
    /* read n rows (0 = read all rows) */
    ["bookDeps", !1],
    /* parse calculation chains */
    ["bookSheets", !1],
    /* only try to get sheet names (no Sheets) */
    ["bookProps", !1],
    /* only try to get properties (no Sheets) */
    ["bookFiles", !1],
    /* include raw file structure (keys, files, cfb) */
    ["bookVBA", !1],
    /* include vba raw data (vbaraw) */
    ["password", ""],
    /* password */
    ["WTF", !1]
    /* WTF mode (throws errors) */
  ])(e);
}
function N4(e) {
  return hi.WS.indexOf(e) > -1 ? "sheet" : e == hi.CS ? "chart" : e == hi.DS ? "dialog" : e == hi.MS ? "macro" : e && e.length ? e : "sheet";
}
function R4(e, n) {
  if (!e) return 0;
  try {
    e = n.map(function(s) {
      return s.id || (s.id = s.strRelID), [s.name, e["!id"][s.id].Target, N4(e["!id"][s.id].Type)];
    });
  } catch {
    return null;
  }
  return !e || e.length === 0 ? null : e;
}
function D4(e, n, r, s, i, o, c, u, d, x, p, g) {
  try {
    o[s] = ms(At(e, r, !0), n);
    var w = Cr(e, n), k;
    switch (u) {
      case "sheet":
        k = ME(w, n, i, d, o[s], x, p, g);
        break;
      case "chart":
        if (k = BE(w, n, i, d, o[s], x, p, g), !k || !k["!drawel"]) break;
        var _ = us(k["!drawel"].Target, n), y = kc(_), E = Ly(At(e, _, !0), ms(At(e, y, !0), _)), A = us(E, _), O = kc(A);
        k = yE(At(e, A, !0), A, d, ms(At(e, O, !0), A), x, k);
        break;
      case "macro":
        k = jE(w, n, i, d, o[s], x, p, g);
        break;
      case "dialog":
        k = UE(w, n, i, d, o[s], x, p, g);
        break;
      default:
        throw new Error("Unrecognized sheet type " + u);
    }
    c[s] = k;
    var N = [];
    o && o[s] && fn(o[s]).forEach(function(V) {
      var J = "";
      if (o[s][V].Type == hi.CMNT) {
        J = us(o[s][V].Target, n);
        var j = WE(Cr(e, J, !0), J, d);
        if (!j || !j.length) return;
        Rh(k, j, !1);
      }
      o[s][V].Type == hi.TCMNT && (J = us(o[s][V].Target, n), N = N.concat(By(Cr(e, J, !0), d)));
    }), N && N.length && Rh(k, N, !0, d.people || []);
  } catch (V) {
    if (d.WTF) throw V;
  }
}
function Lt(e) {
  return e.charAt(0) == "/" ? e.slice(1) : e;
}
function O4(e, n) {
  if (hp(), n = n || {}, tu(n), Bt(e, "META-INF/manifest.xml") || Bt(e, "objectdata.xml")) return Hh(e, n);
  if (Bt(e, "Index/Document.iwa")) {
    if (typeof Uint8Array > "u") throw new Error("NUMBERS file parsing requires Uint8Array support");
    if (typeof mc < "u") {
      if (e.FileIndex) return mc(e);
      var r = qe.utils.cfb_new();
      return nh(e).forEach(function(Ce) {
        Pg(r, Ce, Og(e, Ce));
      }), mc(r);
    }
    throw new Error("Unsupported NUMBERS file");
  }
  if (!Bt(e, "[Content_Types].xml"))
    throw Bt(e, "index.xml.gz") ? new Error("Unsupported NUMBERS 08 file") : Bt(e, "index.xml") ? new Error("Unsupported NUMBERS 09 file") : new Error("Unsupported ZIP file");
  var s = nh(e), i = Fv(At(e, "[Content_Types].xml")), o = !1, c, u;
  if (i.workbooks.length === 0 && (u = "xl/workbook.xml", Cr(e, u, !0) && i.workbooks.push(u)), i.workbooks.length === 0) {
    if (u = "xl/workbook.bin", !Cr(e, u, !0)) throw new Error("Could not find workbook");
    i.workbooks.push(u), o = !0;
  }
  i.workbooks[0].slice(-3) == "bin" && (o = !0);
  var d = {}, x = {};
  if (!n.bookSheets && !n.bookProps) {
    if (ws = [], i.sst) try {
      ws = VE(Cr(e, Lt(i.sst)), i.sst, n);
    } catch (Ce) {
      if (n.WTF) throw Ce;
    }
    n.cellStyles && i.themes.length && (d = HE(At(e, i.themes[0].replace(/^\//, ""), !0) || "", i.themes[0], n)), i.style && (x = zE(Cr(e, Lt(i.style)), i.style, d, n));
  }
  i.links.map(function(Ce) {
    try {
      var xe = ms(At(e, kc(Lt(Ce))), Ce);
      return $E(Cr(e, Lt(Ce)), xe, Ce, n);
    } catch {
    }
  });
  var p = LE(Cr(e, Lt(i.workbooks[0])), i.workbooks[0], n), g = {}, w = "";
  i.coreprops.length && (w = Cr(e, Lt(i.coreprops[0]), !0), w && (g = Hp(w)), i.extprops.length !== 0 && (w = Cr(e, Lt(i.extprops[0]), !0), w && Pv(w, g, n)));
  var k = {};
  (!n.bookSheets || n.bookProps) && i.custprops.length !== 0 && (w = At(e, Lt(i.custprops[0]), !0), w && (k = Iv(w, n)));
  var _ = {};
  if ((n.bookSheets || n.bookProps) && (p.Sheets ? c = p.Sheets.map(function(xe) {
    return xe.name;
  }) : g.Worksheets && g.SheetNames.length > 0 && (c = g.SheetNames), n.bookProps && (_.Props = g, _.Custprops = k), n.bookSheets && typeof c < "u" && (_.SheetNames = c), n.bookSheets ? _.SheetNames : n.bookProps))
    return _;
  c = {};
  var y = {};
  n.bookDeps && i.calcchain && (y = GE(Cr(e, Lt(i.calcchain)), i.calcchain));
  var E = 0, A = {}, O, N;
  {
    var V = p.Sheets;
    g.Worksheets = V.length, g.SheetNames = [];
    for (var J = 0; J != V.length; ++J)
      g.SheetNames[J] = V[J].name;
  }
  var j = o ? "bin" : "xml", C = i.workbooks[0].lastIndexOf("/"), G = (i.workbooks[0].slice(0, C + 1) + "_rels/" + i.workbooks[0].slice(C + 1) + ".rels").replace(/^\//, "");
  Bt(e, G) || (G = "xl/_rels/workbook." + j + ".rels");
  var B = ms(At(e, G, !0), G.replace(/_rels.*/, "s5s"));
  (i.metadata || []).length >= 1 && (n.xlmeta = KE(Cr(e, Lt(i.metadata[0])), i.metadata[0], n)), (i.people || []).length >= 1 && (n.people = jy(Cr(e, Lt(i.people[0])), n)), B && (B = R4(B, p.Sheets));
  var le = Cr(e, "xl/worksheets/sheet.xml", !0) ? 1 : 0;
  e: for (E = 0; E != g.Worksheets; ++E) {
    var re = "sheet";
    if (B && B[E] ? (O = "xl/" + B[E][1].replace(/[\/]?xl\//, ""), Bt(e, O) || (O = B[E][1]), Bt(e, O) || (O = G.replace(/_rels\/.*$/, "") + B[E][1]), re = B[E][2]) : (O = "xl/worksheets/sheet" + (E + 1 - le) + "." + j, O = O.replace(/sheet0\./, "sheet.")), N = O.replace(/^(.*)(\/)([^\/]*)$/, "$1/_rels/$3.rels"), n && n.sheets != null) switch (typeof n.sheets) {
      case "number":
        if (E != n.sheets) continue e;
        break;
      case "string":
        if (g.SheetNames[E].toLowerCase() != n.sheets.toLowerCase()) continue e;
        break;
      default:
        if (Array.isArray && Array.isArray(n.sheets)) {
          for (var Q = !1, pe = 0; pe != n.sheets.length; ++pe)
            typeof n.sheets[pe] == "number" && n.sheets[pe] == E && (Q = 1), typeof n.sheets[pe] == "string" && n.sheets[pe].toLowerCase() == g.SheetNames[E].toLowerCase() && (Q = 1);
          if (!Q) continue e;
        }
    }
    D4(e, O, N, g.SheetNames[E], E, A, c, re, n, p, d, x);
  }
  return _ = {
    Directory: i,
    Workbook: p,
    Props: g,
    Custprops: k,
    Deps: y,
    Sheets: c,
    SheetNames: g.SheetNames,
    Strings: ws,
    Styles: x,
    Themes: d,
    SSF: Vr($e)
  }, n && n.bookFiles && (e.files ? (_.keys = s, _.files = e.files) : (_.keys = [], _.files = {}, e.FullPaths.forEach(function(Ce, xe) {
    Ce = Ce.replace(/^Root Entry[\/]/, ""), _.keys.push(Ce), _.files[Ce] = e.FileIndex[xe];
  }))), n && n.bookVBA && (i.vba.length > 0 ? _.vbaraw = Cr(e, Lt(i.vba[0]), !0) : i.defaults && i.defaults.bin === Vy && (_.vbaraw = Cr(e, "xl/vbaProject.bin", !0))), _;
}
function P4(e, n) {
  var r = n || {}, s = "Workbook", i = qe.find(e, s);
  try {
    if (s = "/!DataSpaces/Version", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
    if (Tw(i.content), s = "/!DataSpaces/DataSpaceMap", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
    var o = Aw(i.content);
    if (o.length !== 1 || o[0].comps.length !== 1 || o[0].comps[0].t !== 0 || o[0].name !== "StrongEncryptionDataSpace" || o[0].comps[0].v !== "EncryptedPackage")
      throw new Error("ECMA-376 Encrypted file bad " + s);
    if (s = "/!DataSpaces/DataSpaceInfo/StrongEncryptionDataSpace", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
    var c = Fw(i.content);
    if (c.length != 1 || c[0] != "StrongEncryptionTransform")
      throw new Error("ECMA-376 Encrypted file bad " + s);
    if (s = "/!DataSpaces/TransformInfo/StrongEncryptionTransform/!Primary", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
    Rw(i.content);
  } catch {
  }
  if (s = "/EncryptionInfo", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
  var u = Dw(i.content);
  if (s = "/EncryptedPackage", i = qe.find(e, s), !i || !i.content) throw new Error("ECMA-376 Encrypted file missing " + s);
  if (u[0] == 4 && typeof decrypt_agile < "u") return decrypt_agile(u[1], i.content, r.password || "", r);
  if (u[0] == 2 && typeof decrypt_std76 < "u") return decrypt_std76(u[1], i.content, r.password || "", r);
  throw new Error("File is password-protected");
}
function nu(e, n) {
  var r = "";
  switch ((n || {}).type || "base64") {
    case "buffer":
      return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
    case "base64":
      r = Ft(e.slice(0, 12));
      break;
    case "binary":
      r = e;
      break;
    case "array":
      return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
    default:
      throw new Error("Unrecognized type " + (n && n.type || "undefined"));
  }
  return [r.charCodeAt(0), r.charCodeAt(1), r.charCodeAt(2), r.charCodeAt(3), r.charCodeAt(4), r.charCodeAt(5), r.charCodeAt(6), r.charCodeAt(7)];
}
function b4(e, n) {
  return qe.find(e, "EncryptedPackage") ? P4(e, n) : C1(e, n);
}
function I4(e, n) {
  var r, s = e, i = n || {};
  return i.type || (i.type = Qe && Buffer.isBuffer(e) ? "buffer" : "base64"), r = wp(s, i), O4(r, i);
}
function R1(e, n) {
  var r = 0;
  e: for (; r < e.length; ) switch (e.charCodeAt(r)) {
    case 10:
    case 13:
    case 32:
      ++r;
      break;
    case 60:
      return Tc(e.slice(r), n);
    default:
      break e;
  }
  return Fs.to_workbook(e, n);
}
function L4(e, n) {
  var r = "", s = nu(e, n);
  switch (n.type) {
    case "base64":
      r = Ft(e);
      break;
    case "binary":
      r = e;
      break;
    case "buffer":
      r = e.toString("binary");
      break;
    case "array":
      r = Da(e);
      break;
    default:
      throw new Error("Unrecognized type " + n.type);
  }
  return s[0] == 239 && s[1] == 187 && s[2] == 191 && (r = lr(r)), n.type = "binary", R1(r, n);
}
function M4(e, n) {
  var r = e;
  return n.type == "base64" && (r = Ft(r)), r = Ss.utils.decode(1200, r.slice(2), "str"), n.type = "binary", R1(r, n);
}
function B4(e) {
  return e.match(/[^\x00-\x7F]/) ? fs(e) : e;
}
function gc(e, n, r, s) {
  return s ? (r.type = "string", Fs.to_workbook(e, r)) : Fs.to_workbook(n, r);
}
function Nc(e, n) {
  rp();
  var r = n || {};
  if (typeof ArrayBuffer < "u" && e instanceof ArrayBuffer) return Nc(new Uint8Array(e), (r = Vr(r), r.type = "array", r));
  typeof Uint8Array < "u" && e instanceof Uint8Array && !r.type && (r.type = typeof Deno < "u" ? "buffer" : "array");
  var s = e, i = [0, 0, 0, 0], o = !1;
  if (r.cellStyles && (r.cellNF = !0, r.sheetStubs = !0), mi = {}, r.dateNF && (mi.dateNF = r.dateNF), r.type || (r.type = Qe && Buffer.isBuffer(e) ? "buffer" : "base64"), r.type == "file" && (r.type = Qe ? "buffer" : "binary", s = Tg(e), typeof Uint8Array < "u" && !Qe && (r.type = "array")), r.type == "string" && (o = !0, r.type = "binary", r.codepage = 65001, s = B4(e)), r.type == "array" && typeof Uint8Array < "u" && e instanceof Uint8Array && typeof ArrayBuffer < "u") {
    var c = new ArrayBuffer(3), u = new Uint8Array(c);
    if (u.foo = "bar", !u.foo)
      return r = Vr(r), r.type = "array", Nc(Ic(s), r);
  }
  switch ((i = nu(s, r))[0]) {
    case 208:
      if (i[1] === 207 && i[2] === 17 && i[3] === 224 && i[4] === 161 && i[5] === 177 && i[6] === 26 && i[7] === 225) return b4(qe.read(s, r), r);
      break;
    case 9:
      if (i[1] <= 8) return C1(s, r);
      break;
    case 60:
      return Tc(s, r);
    case 73:
      if (i[1] === 73 && i[2] === 42 && i[3] === 0) throw new Error("TIFF Image File is not a spreadsheet");
      if (i[1] === 68) return dw(s, r);
      break;
    case 84:
      if (i[1] === 65 && i[2] === 66 && i[3] === 76) return uw.to_workbook(s, r);
      break;
    case 80:
      return i[1] === 75 && i[2] < 9 && i[3] < 9 ? I4(s, r) : gc(e, s, r, o);
    case 239:
      return i[3] === 60 ? Tc(s, r) : gc(e, s, r, o);
    case 255:
      if (i[1] === 254)
        return M4(s, r);
      if (i[1] === 0 && i[2] === 2 && i[3] === 0) return vs.to_workbook(s, r);
      break;
    case 0:
      if (i[1] === 0 && (i[2] >= 2 && i[3] === 0 || i[2] === 0 && (i[3] === 8 || i[3] === 9)))
        return vs.to_workbook(s, r);
      break;
    case 3:
    case 131:
    case 139:
    case 140:
      return Nh.to_workbook(s, r);
    case 123:
      if (i[1] === 92 && i[2] === 114 && i[3] === 116) return Vw.to_workbook(s, r);
      break;
    case 10:
    case 13:
    case 32:
      return L4(s, r);
    case 137:
      if (i[1] === 80 && i[2] === 78 && i[3] === 71) throw new Error("PNG Image File is not a spreadsheet");
      break;
  }
  return ow.indexOf(i[0]) > -1 && i[2] <= 12 && i[3] <= 31 ? Nh.to_workbook(s, r) : gc(e, s, r, o);
}
function j4(e, n, r, s, i, o, c, u) {
  var d = Wr(r), x = u.defval, p = u.raw || !Object.prototype.hasOwnProperty.call(u, "raw"), g = !0, w = i === 1 ? [] : {};
  if (i !== 1)
    if (Object.defineProperty) try {
      Object.defineProperty(w, "__rowNum__", { value: r, enumerable: !1 });
    } catch {
      w.__rowNum__ = r;
    }
    else w.__rowNum__ = r;
  if (!c || e[r]) for (var k = n.s.c; k <= n.e.c; ++k) {
    var _ = c ? e[r][k] : e[s[k] + d];
    if (_ === void 0 || _.t === void 0) {
      if (x === void 0) continue;
      o[k] != null && (w[o[k]] = x);
      continue;
    }
    var y = _.v;
    switch (_.t) {
      case "z":
        if (y == null) break;
        continue;
      case "e":
        y = y == 0 ? null : void 0;
        break;
      case "s":
      case "d":
      case "b":
      case "n":
        break;
      default:
        throw new Error("unrecognized type " + _.t);
    }
    if (o[k] != null) {
      if (y == null)
        if (_.t == "e" && y === null) w[o[k]] = null;
        else if (x !== void 0) w[o[k]] = x;
        else if (p && y === null) w[o[k]] = null;
        else continue;
      else
        w[o[k]] = p && (_.t !== "n" || _.t === "n" && u.rawNumbers !== !1) ? y : Rn(_, y, u);
      y != null && (g = !1);
    }
  }
  return { row: w, isempty: g };
}
function Rc(e, n) {
  if (e == null || e["!ref"] == null) return [];
  var r = { t: "n", v: 0 }, s = 0, i = 1, o = [], c = 0, u = "", d = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }, x = n || {}, p = x.range != null ? x.range : e["!ref"];
  switch (x.header === 1 ? s = 1 : x.header === "A" ? s = 2 : Array.isArray(x.header) ? s = 3 : x.header == null && (s = 0), typeof p) {
    case "string":
      d = vr(p);
      break;
    case "number":
      d = vr(e["!ref"]), d.s.r = p;
      break;
    default:
      d = p;
  }
  s > 0 && (i = 0);
  var g = Wr(d.s.r), w = [], k = [], _ = 0, y = 0, E = Array.isArray(e), A = d.s.r, O = 0, N = {};
  E && !e[A] && (e[A] = []);
  var V = x.skipHidden && e["!cols"] || [], J = x.skipHidden && e["!rows"] || [];
  for (O = d.s.c; O <= d.e.c; ++O)
    if (!(V[O] || {}).hidden)
      switch (w[O] = Or(O), r = E ? e[A][O] : e[w[O] + g], s) {
        case 1:
          o[O] = O - d.s.c;
          break;
        case 2:
          o[O] = w[O];
          break;
        case 3:
          o[O] = x.header[O - d.s.c];
          break;
        default:
          if (r == null && (r = { w: "__EMPTY", t: "s" }), u = c = Rn(r, null, x), y = N[c] || 0, !y) N[c] = 1;
          else {
            do
              u = c + "_" + y++;
            while (N[u]);
            N[c] = y, N[u] = 1;
          }
          o[O] = u;
      }
  for (A = d.s.r + i; A <= d.e.r; ++A)
    if (!(J[A] || {}).hidden) {
      var j = j4(e, d, A, w, s, o, E, x);
      (j.isempty === !1 || (s === 1 ? x.blankrows !== !1 : x.blankrows)) && (k[_++] = j.row);
    }
  return k.length = _, k;
}
var $h = /"/g;
function U4(e, n, r, s, i, o, c, u) {
  for (var d = !0, x = [], p = "", g = Wr(r), w = n.s.c; w <= n.e.c; ++w)
    if (s[w]) {
      var k = u.dense ? (e[r] || [])[w] : e[s[w] + g];
      if (k == null) p = "";
      else if (k.v != null) {
        d = !1, p = "" + (u.rawNumbers && k.t == "n" ? k.v : Rn(k, null, u));
        for (var _ = 0, y = 0; _ !== p.length; ++_) if ((y = p.charCodeAt(_)) === i || y === o || y === 34 || u.forceQuotes) {
          p = '"' + p.replace($h, '""') + '"';
          break;
        }
        p == "ID" && (p = '"ID"');
      } else k.f != null && !k.F ? (d = !1, p = "=" + k.f, p.indexOf(",") >= 0 && (p = '"' + p.replace($h, '""') + '"')) : p = "";
      x.push(p);
    }
  return u.blankrows === !1 && d ? null : x.join(c);
}
function D1(e, n) {
  var r = [], s = n ?? {};
  if (e == null || e["!ref"] == null) return "";
  var i = vr(e["!ref"]), o = s.FS !== void 0 ? s.FS : ",", c = o.charCodeAt(0), u = s.RS !== void 0 ? s.RS : `
`, d = u.charCodeAt(0), x = new RegExp((o == "|" ? "\\|" : o) + "+$"), p = "", g = [];
  s.dense = Array.isArray(e);
  for (var w = s.skipHidden && e["!cols"] || [], k = s.skipHidden && e["!rows"] || [], _ = i.s.c; _ <= i.e.c; ++_) (w[_] || {}).hidden || (g[_] = Or(_));
  for (var y = 0, E = i.s.r; E <= i.e.r; ++E)
    (k[E] || {}).hidden || (p = U4(e, i, E, g, c, d, o, s), p != null && (s.strip && (p = p.replace(x, "")), (p || s.blankrows !== !1) && r.push((y++ ? u : "") + p)));
  return delete s.dense, r.join("");
}
function z4(e, n) {
  n || (n = {}), n.FS = "	", n.RS = `
`;
  var r = D1(e, n);
  return r;
}
function H4(e) {
  var n = "", r, s = "";
  if (e == null || e["!ref"] == null) return [];
  var i = vr(e["!ref"]), o = "", c = [], u, d = [], x = Array.isArray(e);
  for (u = i.s.c; u <= i.e.c; ++u) c[u] = Or(u);
  for (var p = i.s.r; p <= i.e.r; ++p)
    for (o = Wr(p), u = i.s.c; u <= i.e.c; ++u)
      if (n = c[u] + o, r = x ? (e[p] || [])[u] : e[n], s = "", r !== void 0) {
        if (r.F != null) {
          if (n = r.F, !r.f) continue;
          s = r.f, n.indexOf(":") == -1 && (n = n + ":" + n);
        }
        if (r.f != null) s = r.f;
        else {
          if (r.t == "z") continue;
          if (r.t == "n" && r.v != null) s = "" + r.v;
          else if (r.t == "b") s = r.v ? "TRUE" : "FALSE";
          else if (r.w !== void 0) s = "'" + r.w;
          else {
            if (r.v === void 0) continue;
            r.t == "s" ? s = "'" + r.v : s = "" + r.v;
          }
        }
        d[d.length] = n + "=" + s;
      }
  return d;
}
function O1(e, n, r) {
  var s = r || {}, i = +!s.skipHeader, o = e || {}, c = 0, u = 0;
  if (o && s.origin != null)
    if (typeof s.origin == "number") c = s.origin;
    else {
      var d = typeof s.origin == "string" ? ut(s.origin) : s.origin;
      c = d.r, u = d.c;
    }
  var x, p = { s: { c: 0, r: 0 }, e: { c: u, r: c + n.length - 1 + i } };
  if (o["!ref"]) {
    var g = vr(o["!ref"]);
    p.e.c = Math.max(p.e.c, g.e.c), p.e.r = Math.max(p.e.r, g.e.r), c == -1 && (c = g.e.r + 1, p.e.r = c + n.length - 1 + i);
  } else
    c == -1 && (c = 0, p.e.r = n.length - 1 + i);
  var w = s.header || [], k = 0;
  n.forEach(function(y, E) {
    fn(y).forEach(function(A) {
      (k = w.indexOf(A)) == -1 && (w[k = w.length] = A);
      var O = y[A], N = "z", V = "", J = Ge({ c: u + k, r: c + E + i });
      x = Os(o, J), O && typeof O == "object" && !(O instanceof Date) ? o[J] = O : (typeof O == "number" ? N = "n" : typeof O == "boolean" ? N = "b" : typeof O == "string" ? N = "s" : O instanceof Date ? (N = "d", s.cellDates || (N = "n", O = dt(O)), V = s.dateNF || $e[14]) : O === null && s.nullError && (N = "e", O = 0), x ? (x.t = N, x.v = O, delete x.w, delete x.R, V && (x.z = V)) : o[J] = x = { t: N, v: O }, V && (x.z = V));
    });
  }), p.e.c = Math.max(p.e.c, u + w.length - 1);
  var _ = Wr(c);
  if (i) for (k = 0; k < w.length; ++k) o[Or(k + u) + _] = { t: "s", v: w[k] };
  return o["!ref"] = Je(p), o;
}
function V4(e, n) {
  return O1(null, e, n);
}
function Os(e, n, r) {
  if (typeof n == "string") {
    if (Array.isArray(e)) {
      var s = ut(n);
      return e[s.r] || (e[s.r] = []), e[s.r][s.c] || (e[s.r][s.c] = { t: "z" });
    }
    return e[n] || (e[n] = { t: "z" });
  }
  return typeof n != "number" ? Os(e, Ge(n)) : Os(e, Ge({ r: n, c: r || 0 }));
}
function W4(e, n) {
  if (typeof n == "number") {
    if (n >= 0 && e.SheetNames.length > n) return n;
    throw new Error("Cannot find sheet # " + n);
  } else if (typeof n == "string") {
    var r = e.SheetNames.indexOf(n);
    if (r > -1) return r;
    throw new Error("Cannot find sheet name |" + n + "|");
  } else throw new Error("Cannot find sheet |" + n + "|");
}
function au() {
  return { SheetNames: [], Sheets: {} };
}
function iu(e, n, r, s) {
  var i = 1;
  if (!r) for (; i <= 65535 && e.SheetNames.indexOf(r = "Sheet" + i) != -1; ++i, r = void 0) ;
  if (!r || e.SheetNames.length >= 65535) throw new Error("Too many worksheets");
  if (s && e.SheetNames.indexOf(r) >= 0) {
    var o = r.match(/(^.*?)(\d+)$/);
    i = o && +o[2] || 0;
    var c = o && o[1] || r;
    for (++i; i <= 65535 && e.SheetNames.indexOf(r = c + i) != -1; ++i) ;
  }
  if (FE(r), e.SheetNames.indexOf(r) >= 0) throw new Error("Worksheet with name |" + r + "| already exists!");
  return e.SheetNames.push(r), e.Sheets[r] = n, r;
}
function G4(e, n, r) {
  e.Workbook || (e.Workbook = {}), e.Workbook.Sheets || (e.Workbook.Sheets = []);
  var s = W4(e, n);
  switch (e.Workbook.Sheets[s] || (e.Workbook.Sheets[s] = {}), r) {
    case 0:
    case 1:
    case 2:
      break;
    default:
      throw new Error("Bad sheet visibility setting " + r);
  }
  e.Workbook.Sheets[s].Hidden = r;
}
function $4(e, n) {
  return e.z = n, e;
}
function P1(e, n, r) {
  return n ? (e.l = { Target: n }, r && (e.l.Tooltip = r)) : delete e.l, e;
}
function K4(e, n, r) {
  return P1(e, "#" + n, r);
}
function X4(e, n, r) {
  e.c || (e.c = []), e.c.push({ t: n, a: r || "SheetJS" });
}
function Y4(e, n, r, s) {
  for (var i = typeof n != "string" ? n : vr(n), o = typeof n == "string" ? n : Je(n), c = i.s.r; c <= i.e.r; ++c) for (var u = i.s.c; u <= i.e.c; ++u) {
    var d = Os(e, c, u);
    d.t = "n", d.F = o, delete d.v, c == i.s.r && u == i.s.c && (d.f = r, s && (d.D = !0));
  }
  return e;
}
var Kh = {
  encode_col: Or,
  encode_row: Wr,
  encode_cell: Ge,
  encode_range: Je,
  decode_col: Wc,
  decode_row: Vc,
  split_cell: lv,
  decode_cell: ut,
  decode_range: yi,
  format_cell: Rn,
  sheet_add_aoa: Mp,
  sheet_add_json: O1,
  sheet_add_dom: A1,
  aoa_to_sheet: _i,
  json_to_sheet: V4,
  table_to_sheet: F1,
  table_to_book: d4,
  sheet_to_csv: D1,
  sheet_to_txt: z4,
  sheet_to_json: Rc,
  sheet_to_html: f4,
  sheet_to_formulae: H4,
  sheet_to_row_object_array: Rc,
  sheet_get_cell: Os,
  book_new: au,
  book_append_sheet: iu,
  book_set_sheet_visibility: G4,
  cell_set_number_format: $4,
  cell_set_hyperlink: P1,
  cell_set_internal_link: K4,
  cell_add_comment: X4,
  sheet_set_array_formula: Y4,
  consts: {
    SHEET_VISIBLE: 0,
    SHEET_HIDDEN: 1,
    SHEET_VERY_HIDDEN: 2
  }
};
function Q4(e) {
  const n = [",", "	", ";"], r = new Map(n.map((i) => [i, 0]));
  let s = !1;
  for (let i = 0; i < e.length; i += 1) {
    const o = e[i];
    if (o === '"' && e[i + 1] === '"') {
      i += 1;
      continue;
    }
    if (o === '"') s = !s;
    else {
      if (!s && (o === `
` || o === "\r")) break;
      !s && r.has(o) && r.set(o, r.get(o) + 1);
    }
  }
  return n.sort((i, o) => r.get(o) - r.get(i))[0];
}
function q4(e, n) {
  const r = [];
  let s = [], i = "", o = !1;
  const c = () => {
    s.push(i.trim()), i = "";
  }, u = () => {
    c(), s.some((d) => d !== "") && r.push(s), s = [];
  };
  for (let d = 0; d < e.length; d += 1) {
    const x = e[d];
    x === '"' && o && e[d + 1] === '"' ? (i += '"', d += 1) : x === '"' ? o = !o : x === n && !o ? c() : (x === `
` || x === "\r") && !o ? (x === "\r" && e[d + 1] === `
` && (d += 1), u()) : i += x;
  }
  return (i || s.length) && u(), r;
}
function J4(e) {
  const n = String(e || "").replace(/^\uFEFF/, ""), r = Q4(n), s = q4(n, r);
  if (s.length < 2) return { headers: [], rows: [], delimiter: r };
  const i = /* @__PURE__ */ new Map(), o = s[0].map((u, d) => {
    const x = String(u || "").trim() || `Column ${d + 1}`, p = (i.get(x.toLowerCase()) || 0) + 1;
    return i.set(x.toLowerCase(), p), p === 1 ? x : `${x} (${p})`;
  }), c = s.slice(1).map((u) => {
    const d = {};
    return o.forEach((x, p) => {
      d[x] = u[p] ?? "";
    }), d;
  });
  return { headers: o, rows: c, delimiter: r };
}
function ds(e) {
  return e == null ? "" : e instanceof Date && !Number.isNaN(e.getTime()) ? e.toISOString().slice(0, 10) : String(e).trim();
}
function Z4(e) {
  return String(e || "").toLowerCase().replace(/[^a-z0-9%]/g, "");
}
function eS(e = []) {
  const n = e.map((r) => Z4(r)).join(" ");
  return /productname|productcode|shoppart|barcode/.test(n);
}
function rS(e) {
  if (!Array.isArray(e) || !e.length) return { headers: [], rows: [] };
  const n = Math.max(0, e.findIndex(eS)), r = e[n] || [];
  if (!r.some((c) => ds(c))) return { headers: [], rows: [] };
  const s = /* @__PURE__ */ new Map(), i = r.map((c, u) => {
    const d = ds(c) || `Column ${u + 1}`, x = d.toLowerCase(), p = (s.get(x) || 0) + 1;
    return s.set(x, p), p === 1 ? d : `${d} (${p})`;
  }), o = e.slice(n + 1).filter((c) => (c || []).some((u) => ds(u))).map((c) => Object.fromEntries(i.map((u, d) => [u, ds(c == null ? void 0 : c[d])])));
  return { headers: i, rows: o };
}
function tS(e) {
  return e.length >= 8 && e[0] === 208 && e[1] === 207 && e[2] === 17 && e[3] === 224;
}
function nS(e) {
  return e.length >= 4 && e[0] === 80 && e[1] === 75;
}
function aS(e) {
  const n = Nc(e, { type: "array", cellDates: !0, raw: !1 }), r = n.SheetNames.find((i) => Kh.sheet_to_json(n.Sheets[i], { header: 1, defval: "" }).some((c) => Array.isArray(c) && c.some((u) => ds(u)))) || n.SheetNames[0], s = Kh.sheet_to_json(n.Sheets[r], {
    header: 1,
    defval: "",
    raw: !1,
    blankrows: !1
  });
  return rS(s);
}
function iS(e) {
  const n = new TextDecoder("utf-8").decode(e).replace(/^\uFEFF/, "");
  if ((n.match(/\uFFFD/g) || []).length < 20) return n;
  try {
    return new TextDecoder("windows-1256").decode(e);
  } catch {
    return n;
  }
}
async function sS(e) {
  const n = await e.arrayBuffer(), r = new Uint8Array(n), s = String(e.name || ""), i = /\.xlsx?$/i.test(s);
  if (tS(r) || nS(r) || i) {
    const c = aS(n);
    if (!c.headers.length || !c.rows.length)
      throw new Error("No product rows found in the Excel file");
    return c;
  }
  const o = J4(iS(n));
  if (!o.headers.length || !o.rows.length)
    throw new Error("No data rows found in the file");
  return o;
}
const lS = [
  { value: "", label: "-- Ignore --" },
  { value: "id", label: "Product ID" },
  { value: "name", label: "Product Name *" },
  { value: "shopPartNumber", label: "Shop Part Number" },
  { value: "shopPartSerial", label: "Shop Part Serial" },
  { value: "shopPartFormatKey", label: "Shop Part Format Key" },
  { value: "originalPartKey", label: "Original Part Key" },
  { value: "shopPartGroupKey", label: "Shop Part Group Key" },
  { value: "code", label: "Code / Model (Original Part No)" },
  { value: "barcode", label: "Barcode" },
  { value: "ean", label: "EAN Code" },
  { value: "productGroup", label: "Product Group" },
  { value: "company", label: "Company" },
  { value: "category", label: "Category" },
  { value: "subcategory", label: "Sub Category" },
  { value: "commodityCode", label: "Commodity Code" },
  { value: "unit", label: "Base Unit" },
  { value: "productType", label: "Product Type" },
  { value: "arabicName", label: "Arabic Name" },
  { value: "salesVat", label: "Sales VAT %" },
  { value: "purchaseVat", label: "Purchase VAT %" },
  { value: "landingCost", label: "Landing Cost" },
  { value: "marginPerc", label: "Margin %" },
  { value: "marginAmount", label: "Margin Amount" },
  { value: "vatExclusive", label: "VAT Exclusive Rate" },
  { value: "vatInclusive", label: "VAT Inclusive Rate" },
  { value: "vatOnMrp", label: "VAT on MRP" },
  { value: "averageCost", label: "Average Cost" },
  { value: "mrp", label: "M.R.P" },
  { value: "openingStock", label: "Opening Stock" },
  { value: "openingRate", label: "Opening Rate" },
  { value: "openingWarehouse", label: "Warehouse" },
  { value: "rackLocation", label: "Rack" },
  { value: "defaultDiscount", label: "Default Discount" },
  { value: "reorderMin", label: "Reorder Min" },
  { value: "reorderMax", label: "Reorder Max" },
  { value: "reorderQty", label: "Reorder Qty" },
  { value: "weightBarcode", label: "Weight Barcode" },
  { value: "rateBarcode", label: "Rate Barcode" },
  { value: "moreBarcodes", label: "More Barcodes (; separated)" },
  { value: "unitPrices", label: "Unit Prices JSON" },
  { value: "customUnits", label: "Custom Units JSON" },
  { value: "unitDefinitions", label: "Unit Definitions JSON" },
  { value: "customerTypes", label: "Customer Types JSON" },
  { value: "multiCustomerRatesEnabled", label: "Multi Customer Rates Enabled" },
  { value: "specificationText", label: "Specification Text" },
  { value: "photoUrl", label: "Photo URL" },
  { value: "description", label: "Description" }
], oS = {
  id: ["productid"],
  name: ["productname", "name", "item"],
  shopPartNumber: ["shoppartnumber", "shoppartno"],
  shopPartSerial: ["shoppartserial"],
  shopPartFormatKey: ["shoppartformatkey"],
  originalPartKey: ["originalpartkey"],
  shopPartGroupKey: ["shoppartgroupkey"],
  code: ["codemodel", "productcode", "code", "model"],
  barcode: ["barcode"],
  ean: ["ean"],
  productGroup: ["productgroup", "group"],
  company: ["company", "brand"],
  category: ["category"],
  subcategory: ["subcategory", "subcat"],
  commodityCode: ["commoditycode", "commcode"],
  unit: ["baseunit", "unit"],
  productType: ["producttype"],
  arabicName: ["arabicname", "arabic"],
  salesVat: ["salesvat", "vatperc", "vatpercent", "vat%"],
  purchaseVat: ["purchasevat"],
  landingCost: ["landingcost", "landing", "cost"],
  marginPerc: ["marginpercent", "margin%", "margin"],
  marginAmount: ["marginamount"],
  vatExclusive: ["vatexclusiverate", "vatexclusive", "exclusive"],
  vatInclusive: ["vatinclusiverate", "vatinclusive", "inclusive"],
  vatOnMrp: ["vatonmrp"],
  averageCost: ["averagecost"],
  mrp: ["mrp"],
  openingStock: ["openingstock", "openingqty", "stock"],
  openingRate: ["openingrate"],
  openingWarehouse: ["warehouse", "openingwarehouse"],
  rackLocation: ["rack", "racklocation"],
  defaultDiscount: ["defaultdiscount", "discount"],
  reorderMin: ["reordermin", "minstock", "minimumstock"],
  reorderMax: ["reordermax", "maxstock", "maximumstock"],
  reorderQty: ["reorderqty", "reorderquantity"],
  weightBarcode: ["weightbarcode"],
  rateBarcode: ["ratebarcode"],
  moreBarcodes: ["morebarcodes", "additionalbarcodes"],
  unitPrices: ["unitprices", "unitpricesjson", "sellingrates"],
  customUnits: ["customunits", "customunitsjson"],
  unitDefinitions: ["unitdefinitions", "unitdefinitionsjson"],
  customerTypes: ["customertypes", "customertypesjson"],
  multiCustomerRatesEnabled: ["multicustomerratesenabled"],
  specificationText: ["specificationtext", "specification"],
  photoUrl: ["photourl", "photo"],
  description: ["description", "remarks"]
};
function vc(e) {
  return String(e || "").toLowerCase().replace(/[^a-z0-9%]/g, "");
}
function cS(e) {
  const n = {}, r = /* @__PURE__ */ new Set(), s = Object.entries(oS);
  return e.forEach((i) => {
    const o = vc(i), u = s.find(
      ([d, x]) => !r.has(d) && x.some((p) => o === vc(p))
    ) || s.find(
      ([d, x]) => !r.has(d) && x.some((p) => {
        const g = vc(p);
        return g.length >= 4 && (o.includes(g) || g.includes(o));
      })
    );
    u && (n[i] = u[0], r.add(u[0]));
  }), n;
}
function uS({ onImport: e, onClose: n, notify: r, replacementMode: s = !1 }) {
  var J;
  const [i, o] = Ae.useState("upload"), [c, u] = Ae.useState([]), [d, x] = Ae.useState([]), [p, g] = Ae.useState({}), [w, k] = Ae.useState(!1), [_, y] = Ae.useState(null), E = () => {
    w || s && i !== "result" && !window.confirm("No new products have been imported. Finish replacement with an empty Product Master?") || n();
  }, A = Ae.useMemo(() => d.map((j) => {
    const C = {};
    return Object.entries(p).forEach(([G, B]) => {
      B && (C[B] = String(j[G] ?? "").trim());
    }), C;
  }), [p, d]), O = Ae.useMemo(() => {
    const j = /* @__PURE__ */ new Set();
    let C = 0, G = 0, B = 0;
    return A.forEach((le) => {
      String(le.name || "").trim() || (C += 1);
      const re = [le.barcode, le.ean, ...String(le.moreBarcodes || "").split(/[;,|]/)].map((Q) => String(Q || "").trim().toLowerCase()).filter(Boolean);
      (re.some((Q) => j.has(Q)) || new Set(re).size !== re.length) && (G += 1), re.forEach((Q) => j.add(Q)), ["unitPrices", "customUnits", "unitDefinitions", "customerTypes"].forEach((Q) => {
        if (le[Q])
          try {
            Array.isArray(JSON.parse(le[Q])) || (B += 1);
          } catch {
            B += 1;
          }
      });
    }), {
      valid: A.filter((le) => String(le.name || "").trim()).length,
      missingName: C,
      duplicateCodes: G,
      invalidJson: B
    };
  }, [A]);
  async function N(j) {
    var G;
    const C = (G = j.target.files) == null ? void 0 : G[0];
    if (j.target.value = "", !!C) {
      k(!0);
      try {
        const B = await sS(C);
        if (!B.headers.length || !B.rows.length) throw new Error("No data rows found in the file");
        u(B.headers), x(B.rows), g(cS(B.headers)), o("map");
      } catch (B) {
        r(B.message || "Failed to read file", "err");
      } finally {
        k(!1);
      }
    }
  }
  async function V() {
    if (!Object.values(p).includes("name"))
      return r("Map a column to Product Name before importing", "err");
    const j = Object.values(p).filter(Boolean);
    if (new Set(j).size !== j.length)
      return r("The same Product Master field cannot be mapped more than once", "err");
    k(!0);
    try {
      y(await e(A.filter((C) => String(C.name || "").trim()))), o("result");
    } catch (C) {
      r(C.message || "Import failed", "err");
    } finally {
      k(!1);
    }
  }
  return /* @__PURE__ */ v.jsxs(jt, { title: "Import Products", onClose: E, width: "xl", children: [
    i === "upload" && /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
      /* @__PURE__ */ v.jsxs("p", { className: "pm-hint", children: [
        s ? "The old Product Master is cleared and sync is locked. " : "",
        "Choose an Excel (.xls / .xlsx), CSV, TSV, or semicolon-delimited text file."
      ] }),
      /* @__PURE__ */ v.jsx("input", { type: "file", accept: ".xls,.xlsx,.csv,.tsv,.txt,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/tab-separated-values", onChange: N, style: { fontSize: 12 } }),
      w && /* @__PURE__ */ v.jsx("p", { className: "pm-hint", children: "Reading file..." })
    ] }),
    i === "map" && /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
      /* @__PURE__ */ v.jsxs("p", { className: "pm-hint", children: [
        d.length,
        " rows detected. Map each column from your file to a Product Master field."
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-import-preview", children: [
        /* @__PURE__ */ v.jsxs("span", { children: [
          "Ready: ",
          /* @__PURE__ */ v.jsx("strong", { children: O.valid })
        ] }),
        /* @__PURE__ */ v.jsxs("span", { children: [
          "Missing name: ",
          /* @__PURE__ */ v.jsx("strong", { children: O.missingName })
        ] }),
        /* @__PURE__ */ v.jsxs("span", { children: [
          "Duplicate barcode rows: ",
          /* @__PURE__ */ v.jsx("strong", { children: O.duplicateCodes })
        ] }),
        /* @__PURE__ */ v.jsxs("span", { children: [
          "Invalid JSON values: ",
          /* @__PURE__ */ v.jsx("strong", { children: O.invalidJson })
        ] })
      ] }),
      /* @__PURE__ */ v.jsx("div", { className: "pm-table-wrap", style: { maxHeight: 300 }, children: /* @__PURE__ */ v.jsxs("table", { className: "pm-table", children: [
        /* @__PURE__ */ v.jsx("thead", { children: /* @__PURE__ */ v.jsxs("tr", { children: [
          /* @__PURE__ */ v.jsx("th", { children: "Source Column" }),
          /* @__PURE__ */ v.jsx("th", { children: "Sample" }),
          /* @__PURE__ */ v.jsx("th", { children: "Maps To" })
        ] }) }),
        /* @__PURE__ */ v.jsx("tbody", { children: c.map((j) => {
          var C;
          return /* @__PURE__ */ v.jsxs("tr", { children: [
            /* @__PURE__ */ v.jsx("td", { style: { fontWeight: 600 }, children: j }),
            /* @__PURE__ */ v.jsx("td", { style: { color: "#64748b" }, children: String(((C = d[0]) == null ? void 0 : C[j]) ?? "") }),
            /* @__PURE__ */ v.jsx("td", { children: /* @__PURE__ */ v.jsx(
              "select",
              {
                className: "pm-input",
                value: p[j] || "",
                onChange: (G) => g((B) => ({ ...B, [j]: G.target.value })),
                children: lS.map((G) => /* @__PURE__ */ v.jsx("option", { value: G.value, children: G.label }, G.value))
              }
            ) })
          ] }, j);
        }) })
      ] }) }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: E, disabled: w, children: "Cancel" }),
        /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: V, disabled: w, children: w ? "Importing..." : `Import ${d.length} rows` })
      ] })
    ] }),
    i === "result" && _ && /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
      /* @__PURE__ */ v.jsxs("div", { style: { display: "flex", gap: 16, fontSize: 12.5, fontWeight: 700 }, children: [
        /* @__PURE__ */ v.jsxs("span", { style: { color: "#15803d" }, children: [
          "Created: ",
          _.created
        ] }),
        /* @__PURE__ */ v.jsxs("span", { style: { color: "#b91c1c" }, children: [
          "Skipped: ",
          _.skipped
        ] })
      ] }),
      ((J = _.errors) == null ? void 0 : J.length) > 0 && /* @__PURE__ */ v.jsx("div", { className: "pm-table-wrap", style: { maxHeight: 240 }, children: /* @__PURE__ */ v.jsxs("table", { className: "pm-table", children: [
        /* @__PURE__ */ v.jsx("thead", { children: /* @__PURE__ */ v.jsxs("tr", { children: [
          /* @__PURE__ */ v.jsx("th", { children: "Row" }),
          /* @__PURE__ */ v.jsx("th", { children: "Reason" })
        ] }) }),
        /* @__PURE__ */ v.jsx("tbody", { children: _.errors.map((j, C) => /* @__PURE__ */ v.jsxs("tr", { children: [
          /* @__PURE__ */ v.jsx("td", { children: j.row }),
          /* @__PURE__ */ v.jsx("td", { style: { color: "#b91c1c" }, children: j.reason })
        ] }, C)) })
      ] }) }),
      /* @__PURE__ */ v.jsx("div", { className: "pm-window-foot", children: /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: E, children: "Close" }) })
    ] })
  ] });
}
const fS = {
  productName: "",
  productCode: "",
  shopPartNumber: "",
  barcode: "",
  ean: "",
  alternateCodes: "",
  company: "",
  category: "",
  subCategory: "",
  productGroup: "",
  commodityCode: "",
  mrp: ""
}, Dc = [
  { key: "productName", label: "Product Name", width: 180 },
  { key: "productCode", label: "Product Code", width: 240 },
  { key: "shopPartNumber", label: "Shop Part No", width: 110 },
  { key: "barcode", label: "Barcode", width: 130 },
  { key: "ean", label: "EAN", width: 115 },
  { key: "company", label: "Company Name", width: 135 },
  { key: "category", label: "Category Name", width: 120 },
  { key: "subCategory", label: "Subcategory Name", width: 130 },
  { key: "commodityCode", label: "Comm Code", width: 100 },
  { key: "landingCost", label: "Landing Cost", width: 95 },
  { key: "vatExclusive", label: "VAT Excl Rate", width: 95 },
  { key: "vatInclusive", label: "VAT Incl Rate", width: 95 },
  { key: "mrp", label: "M R P", width: 85 }
], ks = () => Dc.map((e) => ({ ...e })), dS = () => {
  try {
    const e = JSON.parse(localStorage.getItem("s4-product-search-columns-v2") || localStorage.getItem("s4-product-search-columns") || "[]");
    if (!Array.isArray(e) || e.length !== Dc.length) return ks();
    const n = new Map(Dc.map((r) => [r.key, r]));
    return e.some((r) => !n.has(r.key)) ? ks() : e.map((r) => {
      const s = n.get(r.key);
      let i = Math.max(50, Math.min(800, Number(r.width) || s.width));
      return r.key === "productCode" && i <= 115 && (i = s.width), { ...s, width: i };
    });
  } catch {
    return ks();
  }
}, Xh = (e) => String(e ?? "").trim().toLowerCase();
function hS(e) {
  return [
    e.code,
    e.barcode,
    e.ean,
    ...Array.isArray(e.moreBarcodes) ? e.moreBarcodes : [],
    ...Array.isArray(e.unitPrices) ? e.unitPrices.map((n) => n.barcode) : []
  ].filter(Boolean);
}
function b1({ products: e, shopPartEnabled: n = !0, onSelect: r, onClose: s, initialFields: i = {} }) {
  var ue;
  const [o, c] = Ae.useState({ ...fS, ...i }), [u, d] = Ae.useState([]), [x, p] = Ae.useState(!0), [g, w] = Ae.useState(!0), [k, _] = Ae.useState("EN"), [y, E] = Ae.useState(!1), [A, O] = Ae.useState(dS), [N, V] = Ae.useState(ks), [J, j] = Ae.useState("productName"), [C, G] = Ae.useState(null), B = Ae.useRef(null), le = Ae.useRef(null), re = Ae.useRef(A), Q = Ae.useMemo(
    () => A.filter((K) => n || K.key !== "shopPartNumber"),
    [A, n]
  ), pe = Ae.useMemo(
    () => Object.values(o).some((K) => String(K).trim()),
    [o]
  );
  function Ce(K, te) {
    const Z = Xh(K).replace(/\s+/g, " "), fe = Xh(te).replace(/\s+/g, " ");
    return fe ? x ? Z.includes(fe) : Z.startsWith(fe) : !0;
  }
  function xe({ allowEmpty: K = !0, nextFields: te = o } = {}) {
    if (!Object.values(te).some((P) => String(P).trim()) && !K) {
      d([]), G(null);
      return;
    }
    const Pe = (Array.isArray(e) ? e : []).filter((P) => {
      const Xe = hS(P);
      return Ce(P.name, te.productName) && Ce(P.code, te.productCode) && (!n || Ce(P.shopPartNumber, te.shopPartNumber)) && (!te.barcode || Xe.some((je) => Ce(je, te.barcode))) && Ce(P.ean, te.ean) && (!te.alternateCodes || Xe.some((je) => Ce(je, te.alternateCodes))) && Ce(P.company || P.brand, te.company) && Ce(P.category, te.category) && Ce(P.subcategory, te.subCategory) && Ce(P.productGroup, te.productGroup) && Ce(P.commodityCode, te.commodityCode) && Ce(P.mrp, te.mrp);
    });
    d(Pe.slice(0, 500)), G(null);
  }
  Ae.useEffect(() => {
    var K;
    (K = B.current) == null || K.focus();
  }, []), Ae.useEffect(() => {
    re.current = A;
  }, [A]), Ae.useEffect(() => {
    if (!g) return;
    const K = setTimeout(() => xe({ allowEmpty: !1 }), 220);
    return () => clearTimeout(K);
  }, [o, g, x, e]), Ae.useEffect(() => {
    const K = (te) => {
      var Z, fe, Pe;
      if (te.key === "Escape") {
        te.preventDefault(), te.stopPropagation(), y ? E(!1) : s();
        return;
      }
      if (te.key === "Control") {
        const P = String(((Z = te.target) == null ? void 0 : Z.tagName) || "").toLowerCase();
        if (P === "input" || P === "textarea" || P === "select" || (fe = te.target) != null && fe.isContentEditable)
          return;
        (Pe = le.current) == null || Pe.focus();
      }
    };
    return window.addEventListener("keydown", K, !0), () => window.removeEventListener("keydown", K, !0);
  }, [s, y]);
  const we = (K, te) => c((Z) => ({ ...Z, [K]: te })), ye = (K) => {
    r(K), s();
  }, ge = () => {
    var K;
    V(A.map((te) => ({ ...te }))), j(((K = A[0]) == null ? void 0 : K.key) || "productName"), E(!0);
  }, Y = (K) => {
    V((te) => {
      const Z = te.findIndex((P) => P.key === J), fe = Z + K;
      if (Z < 0 || fe < 0 || fe >= te.length) return te;
      const Pe = [...te];
      return [Pe[Z], Pe[fe]] = [Pe[fe], Pe[Z]], Pe;
    });
  }, he = (K) => {
    V((te) => te.map((Z) => Z.key === J ? { ...Z, width: K } : Z));
  }, U = () => {
    const K = N.map((te) => ({
      ...te,
      width: Math.max(50, Math.min(800, Number(te.width) || 50))
    }));
    O(K), localStorage.setItem("s4-product-search-columns-v2", JSON.stringify(K)), E(!1);
  }, F = (K) => {
    O(K), localStorage.setItem("s4-product-search-columns-v2", JSON.stringify(K));
  }, X = (K, te) => {
    var Xe;
    K.preventDefault(), K.stopPropagation();
    const Z = K.clientX, fe = Number((Xe = A.find((je) => je.key === te)) == null ? void 0 : Xe.width) || 80, Pe = (je) => {
      const Ke = Math.max(50, Math.min(800, fe + (je.clientX - Z)));
      O((Ve) => Ve.map((Fe) => Fe.key === te ? { ...Fe, width: Ke } : Fe));
    }, P = () => {
      window.removeEventListener("mousemove", Pe), window.removeEventListener("mouseup", P), F(re.current);
    };
    window.addEventListener("mousemove", Pe), window.addEventListener("mouseup", P);
  }, z = (K, te) => ({
    productName: K.name,
    productCode: K.code,
    shopPartNumber: K.shopPartNumber,
    barcode: K.barcode,
    ean: K.ean,
    company: K.company || K.brand,
    category: K.category,
    subCategory: K.subcategory,
    commodityCode: K.commodityCode,
    landingCost: K.landingCost,
    vatExclusive: K.vatExclusive,
    vatInclusive: K.vatInclusive,
    mrp: K.mrp
  })[te] || "", H = [
    ["productName", "Product Name"],
    ["productCode", "Product Code"],
    ["shopPartNumber", "Shop Part No"],
    ["barcode", "Barcode / Additional Barcodes"],
    ["ean", "EAN"],
    ["alternateCodes", "Alternate Codes"],
    ["company", "Company"],
    ["category", "Category"],
    ["subCategory", "Sub Category"],
    ["productGroup", "Product Group"],
    ["commodityCode", "Commodity Code"],
    ["mrp", "M.R.P"]
  ].filter(([K]) => n || K !== "shopPartNumber");
  return /* @__PURE__ */ v.jsx("div", { className: "pm-search-backdrop", onMouseDown: (K) => {
    K.target === K.currentTarget && s();
  }, children: /* @__PURE__ */ v.jsxs("section", { className: "pm-search-window", onMouseDown: (K) => K.stopPropagation(), children: [
    /* @__PURE__ */ v.jsxs("header", { className: "pm-search-title", children: [
      /* @__PURE__ */ v.jsx("strong", { children: "Search Product" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", "aria-label": "Close Search", onClick: s, children: "✕" })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-search-content", children: [
      /* @__PURE__ */ v.jsxs("fieldset", { className: "pm-search-fields", children: [
        /* @__PURE__ */ v.jsx("legend", { children: "Type any part of the data to search in any of the following fields" }),
        /* @__PURE__ */ v.jsx("span", { className: "pm-search-control-hint", children: "Press Control key to move focus in Search list Grid" }),
        /* @__PURE__ */ v.jsxs("div", { className: "pm-search-field-grid", children: [
          H.map(([K, te], Z) => /* @__PURE__ */ v.jsxs("label", { className: "pm-search-field", children: [
            /* @__PURE__ */ v.jsx("span", { children: te }),
            /* @__PURE__ */ v.jsx(
              "input",
              {
                ref: Z === 0 ? B : void 0,
                type: "text",
                autoComplete: "off",
                spellCheck: !1,
                value: o[K] ?? "",
                onChange: (fe) => we(K, fe.target.value),
                onInput: (fe) => we(K, fe.target.value),
                onKeyDown: (fe) => {
                  fe.key === "Enter" && (fe.preventDefault(), xe({ nextFields: { ...o, [K]: fe.currentTarget.value } }));
                }
              }
            )
          ] }, K)),
          /* @__PURE__ */ v.jsxs("div", { className: "pm-search-command", children: [
            /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => xe(), children: "Search" }),
            /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-search-lang", onClick: () => _(k === "EN" ? "AR" : "EN"), children: k })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-search-results-title", children: [
        /* @__PURE__ */ v.jsx("strong", { children: "Search Result" }),
        u.length > 0 && /* @__PURE__ */ v.jsxs("span", { children: [
          u.length,
          u.length === 500 ? "+" : "",
          " products"
        ] })
      ] }),
      /* @__PURE__ */ v.jsx("div", { ref: le, tabIndex: 0, className: "pm-search-grid-wrap", children: /* @__PURE__ */ v.jsxs(
        "table",
        {
          className: "pm-search-grid",
          style: { minWidth: Q.reduce((K, te) => K + Number(te.width), 0) },
          children: [
            /* @__PURE__ */ v.jsx("thead", { children: /* @__PURE__ */ v.jsx("tr", { children: Q.map((K) => /* @__PURE__ */ v.jsxs("th", { style: { width: Number(K.width) }, children: [
              /* @__PURE__ */ v.jsx("span", { className: "pm-search-col-label", children: K.label }),
              /* @__PURE__ */ v.jsx(
                "span",
                {
                  className: "pm-search-col-resizer",
                  onMouseDown: (te) => X(te, K.key),
                  title: "Drag to resize column"
                }
              )
            ] }, K.key)) }) }),
            /* @__PURE__ */ v.jsxs("tbody", { children: [
              u.map((K) => /* @__PURE__ */ v.jsx(
                "tr",
                {
                  className: C === K.id ? "is-selected" : "",
                  onClick: () => {
                    var te;
                    (te = window.matchMedia) != null && te.call(window, "(pointer: coarse)").matches ? ye(K) : G(K.id);
                  },
                  onDoubleClick: () => ye(K),
                  title: "Double-click to recall this product in Product Master (tap once on mobile)",
                  children: Q.map((te) => {
                    const Z = z(K, te.key);
                    return /* @__PURE__ */ v.jsx("td", { style: { width: Number(te.width) }, title: String(Z || ""), children: Z }, te.key);
                  })
                },
                K.id
              )),
              !u.length && /* @__PURE__ */ v.jsx("tr", { className: "pm-search-empty-row", children: /* @__PURE__ */ v.jsx("td", { colSpan: Q.length, children: pe ? "No matching products" : "Enter search criteria above, or press Search" }) })
            ] })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ v.jsxs("footer", { className: "pm-search-footer", children: [
      /* @__PURE__ */ v.jsxs("div", { className: "pm-search-options", children: [
        /* @__PURE__ */ v.jsxs("label", { children: [
          /* @__PURE__ */ v.jsx("input", { type: "checkbox", checked: x, onChange: (K) => p(K.target.checked) }),
          /* @__PURE__ */ v.jsx("strong", { children: "Extended Search" }),
          /* @__PURE__ */ v.jsx("span", { children: "(Will display all products containing the search text in any part of the field)" })
        ] }),
        /* @__PURE__ */ v.jsxs("label", { children: [
          /* @__PURE__ */ v.jsx("input", { type: "checkbox", checked: g, onChange: (K) => w(K.target.checked) }),
          /* @__PURE__ */ v.jsx("strong", { children: "Auto Search while typing in text box" })
        ] })
      ] }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-search-close", onClick: s, children: "Close" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-search-columns-link", onClick: ge, children: "Click here to change the Search List Column Settings" }),
      y && /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings", role: "dialog", "aria-label": "Column Settings", children: [
        /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__title", children: [
          /* @__PURE__ */ v.jsx("strong", { children: "Column Settings" }),
          /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => E(!1), "aria-label": "Close", children: "✕" })
        ] }),
        /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__body", children: [
          /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__list", children: [
            /* @__PURE__ */ v.jsx("div", { className: "pm-search-column-settings__head", children: "Field List" }),
            N.filter((K) => n || K.key !== "shopPartNumber").map((K) => /* @__PURE__ */ v.jsx(
              "button",
              {
                type: "button",
                className: J === K.key ? "is-selected" : "",
                onClick: () => j(K.key),
                children: K.label
              },
              K.key
            ))
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__arrows", children: [
            /* @__PURE__ */ v.jsx("button", { type: "button", title: "Move column up", onClick: () => Y(-1), children: "↑" }),
            /* @__PURE__ */ v.jsx("button", { type: "button", title: "Move column down", onClick: () => Y(1), children: "↓" })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__width", children: [
            /* @__PURE__ */ v.jsx("label", { htmlFor: "pm-search-column-width", children: "Width" }),
            /* @__PURE__ */ v.jsx(
              "input",
              {
                id: "pm-search-column-width",
                type: "number",
                min: "50",
                max: "800",
                value: ((ue = N.find((K) => K.key === J)) == null ? void 0 : ue.width) ?? "",
                onChange: (K) => he(K.target.value)
              }
            ),
            /* @__PURE__ */ v.jsx("button", { type: "button", onClick: U, children: "OK" })
          ] }),
          /* @__PURE__ */ v.jsxs("div", { className: "pm-search-column-settings__actions", children: [
            /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => {
              const K = ks();
              V(K), j(K[0].key);
            }, children: "Reset" }),
            /* @__PURE__ */ v.jsx("button", { type: "button", onClick: () => E(!1), children: "Close" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function pS({ onYes: e, onClose: n }) {
  return /* @__PURE__ */ v.jsxs(jt, { title: "Additional Barcode", width: "sm", onClose: n, children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-confirm-dialog", children: [
      /* @__PURE__ */ v.jsx("div", { className: "pm-confirm-dialog__icon", "aria-hidden": "true", children: "?" }),
      /* @__PURE__ */ v.jsx("div", { className: "pm-confirm-dialog__message", children: "Do you want to enter additional barcode for this product?" })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-confirm-dialog__actions", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn pm-btn--primary", autoFocus: !0, onClick: e, children: "Yes" }),
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn", onClick: n, children: "No" })
    ] })
  ] });
}
function xS({
  productCount: e,
  busy: n,
  onClear: r,
  onClose: s
}) {
  const [i, o] = Ae.useState(""), c = i.trim().toUpperCase() === "CLEAR";
  return /* @__PURE__ */ v.jsx(jt, { title: "Clear & Import Product Master", width: "md", onClose: () => {
    n || s();
  }, children: /* @__PURE__ */ v.jsxs("div", { className: "pm-clear-products", children: [
    /* @__PURE__ */ v.jsxs("div", { className: "pm-clear-products__warning", children: [
      /* @__PURE__ */ v.jsx("strong", { children: "This will replace the current Product Master." }),
      /* @__PURE__ */ v.jsx("span", { children: "A CSV backup will download first. Then this shop's local and Firebase products will be deleted and verified before the Import window opens." })
    ] }),
    /* @__PURE__ */ v.jsxs("ul", { className: "pm-clear-products__steps", children: [
      /* @__PURE__ */ v.jsxs("li", { children: [
        "Current products: ",
        /* @__PURE__ */ v.jsx("strong", { children: e })
      ] }),
      /* @__PURE__ */ v.jsx("li", { children: "Internet connection and Shop Owner access are required." }),
      /* @__PURE__ */ v.jsx("li", { children: "Product sync on other devices will be locked during replacement." })
    ] }),
    /* @__PURE__ */ v.jsxs("label", { className: "pm-field", children: [
      /* @__PURE__ */ v.jsx("span", { children: "Type CLEAR to continue" }),
      /* @__PURE__ */ v.jsx(
        "input",
        {
          className: "pm-input",
          value: i,
          onChange: (u) => o(u.target.value),
          disabled: n,
          autoFocus: !0
        }
      )
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-window-foot", children: [
      /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: s, disabled: n, children: "Cancel" }),
      /* @__PURE__ */ v.jsx(
        "button",
        {
          type: "button",
          className: "pm-btn pm-btn--danger",
          onClick: r,
          disabled: !c || n,
          children: n ? "Backing up and clearing..." : "Download Backup & Clear"
        }
      )
    ] })
  ] }) });
}
const mS = [
  ["COUNT", "Number", "Number", "1", "Number"],
  ["COUNT", "Pieces", "Pcs", "1", "Number"],
  ["COUNT", "Set", "Set", "1", "Number"],
  ["COUNT", "Numbers", "Nos", "1", "Number"],
  ["WEIGHT", "Kilogram", "Kg", "1000", "Gram"],
  ["WEIGHT", "Gram", "Gram", "1000", "Milligram"],
  ["WEIGHT", "Milligram", "Milligram", "1", "Milligram"],
  ["VOLUME", "Litre", "Litre", "1000", "Millilitre"],
  ["VOLUME", "Litre", "Ltr", "1000", "Millilitre"],
  ["VOLUME", "Millilitre", "Millilitre", "1", "Millilitre"],
  ["COUNT", "Box", "Box", "1", "Number"],
  ["COUNT", "Pair", "Pair", "2", "Number"],
  ["LENGTH", "Centimetre", "Cm", "10", "Mm"],
  ["LENGTH", "Metre", "Mtr", "100", "Cm"],
  ["LENGTH", "Millimetre", "Mm", "1", "Mm"],
  ["LENGTH", "Feet", "Feet", "12", "Inch"],
  ["LENGTH", "Inch", "Inch", "1", "Inch"],
  ["AREA", "Square Feet", "Sq.Feet", "144", "Sq.Inch"],
  ["AREA", "Square Inch", "Sq.Inch", "1", "Sq.Inch"],
  ["AREA", "Square Metre", "Sq.Metre", "10000", "Sq.Cm"],
  ["AREA", "Square Centimetre", "Sq.Cm", "1", "Sq.Cm"],
  ["COUNT", "Dozen", "Dozen", "12", "Number"],
  ["WEIGHT", "Ton", "Ton", "1000", "Kg"]
].map(([e, n, r, s, i], o) => ({
  id: o + 1,
  category: e,
  name: n,
  symbol: r,
  alternateName: "",
  factor: s,
  equalsUnit: i,
  printNameInBill: !1
}));
function gS(e, n, r, s, i = []) {
  let o = [];
  try {
    const p = JSON.parse(localStorage.getItem(e) || "[]");
    if (Array.isArray(p) && (o = p), !o.length && e.includes("-default") === !1) {
      const g = s === "symbol" ? "s4-product-master-units" : "s4-product-master-customer-types", w = JSON.parse(localStorage.getItem(g) || "[]");
      Array.isArray(w) && (o = w);
    }
  } catch {
    o = [];
  }
  const c = (o.length ? o : n).map((p) => ({ ...p })), u = new Set(c.map((p) => String(p[s] || "").toLowerCase()));
  let d = Math.max(0, ...c.map((p) => Number(p.id) || 0));
  i.forEach((p) => {
    if (!p || typeof p != "object") return;
    const g = String(p[s] || "").trim();
    if (!g) return;
    const w = c.findIndex((k) => String(k[s] || "").toLowerCase() === g.toLowerCase());
    if (w >= 0) {
      c[w] = { ...c[w], ...p, id: c[w].id };
      return;
    }
    d += 1, c.push({ ...p, id: d }), u.add(g.toLowerCase());
  });
  const x = r.map((p) => String(p || "").trim()).filter((p) => p && !u.has(p.toLowerCase())).map((p) => (u.add(p.toLowerCase()), d += 1, { id: d, category: "OTHER", name: p, symbol: p, alternateName: "", factor: "1", equalsUnit: "Number", printNameInBill: !1 }));
  return [...c, ...x];
}
function vS({
  shopId: e,
  products: n,
  filteredProducts: r,
  productsLoading: s,
  companies: i,
  form: o,
  upd: c,
  selectedId: u,
  canDelete: d,
  saving: x,
  onNew: p,
  onSave: g,
  onDelete: w,
  onClose: k,
  onSelectProduct: _,
  onExport: y,
  onImportRecords: E,
  onClearAll: A,
  clearingProducts: O,
  replacementActive: N,
  onFinishReplacement: V,
  productMaintenanceActive: J,
  onGenerateWeighingFile: j,
  onPrintBarcodes: C,
  notify: G,
  shopPartEnabled: B,
  listQuery: le = "",
  onListQueryChange: re,
  showOpeningTools: Q = !0,
  showWeighingExport: pe = !0,
  hideArabicName: Ce = !1
}) {
  const [xe, we] = Ae.useState(null), [ye, ge] = Ae.useState(() => gS(
    `s4-product-master-units-${e || "default"}`,
    mS,
    [...o.customUnits || [], ...n.flatMap((Z) => Z.customUnits || [])],
    "symbol",
    [...o.unitDefinitions || [], ...n.flatMap((Z) => Z.unitDefinitions || [])]
  )), Y = Ae.useRef(g), he = Ae.useRef(k), U = Ae.useRef(xe), F = Ae.useRef(null);
  Ae.useEffect(() => {
    Y.current = g;
  }, [g]), Ae.useEffect(() => {
    he.current = k;
  }, [k]), Ae.useEffect(() => {
    U.current = xe;
  }, [xe]), Ae.useEffect(() => {
    localStorage.setItem(`s4-product-master-units-${e || "default"}`, JSON.stringify(ye));
  }, [e, ye]), Ae.useEffect(() => {
    const Z = (fe) => {
      var Xe, je;
      const Pe = String(((Xe = fe.target) == null ? void 0 : Xe.tagName) || "").toLowerCase(), P = Pe === "input" || Pe === "textarea" || Pe === "select" || ((je = fe.target) == null ? void 0 : je.isContentEditable);
      if (fe.key === "Escape" && !U.current) {
        fe.preventDefault(), he.current();
        return;
      }
      if (fe.key === "F10") {
        fe.preventDefault(), we("search");
        return;
      }
      !U.current && !P && (fe.ctrlKey || fe.metaKey) && fe.key.toLowerCase() === "s" && (fe.preventDefault(), Y.current());
    };
    return window.addEventListener("keydown", Z), () => window.removeEventListener("keydown", Z);
  }, []);
  const X = () => we(null);
  function z(Z) {
    window.alert(`Duplicate Barcode / EAN

${Z}`);
  }
  function H(Z, fe) {
    const Pe = String(fe || "").trim();
    if (!Pe) return !0;
    const P = Pe.toLowerCase();
    if ([
      ...Z === "barcode" ? [] : [o.barcode],
      ...Z === "ean" ? [] : [o.ean],
      ...Array.isArray(o.moreBarcodes) ? o.moreBarcodes : []
    ].map((Ke) => String(Ke || "").trim().toLowerCase()).filter(Boolean).includes(P))
      return z(`The number "${Pe}" is already entered in this product. The same number cannot be used in Barcode, EAN Code, or More Barcodes.`), !1;
    const je = n.find((Ke) => Ke.id !== u && [
      Ke.barcode,
      Ke.ean,
      ...Array.isArray(Ke.moreBarcodes) ? Ke.moreBarcodes : []
    ].map((Ve) => String(Ve || "").trim().toLowerCase()).includes(P));
    return je ? (z(`The number "${Pe}" already belongs to product "${je.name}".`), !1) : !0;
  }
  async function ue() {
    const Z = await (A == null ? void 0 : A());
    Z != null && Z.ok && we("import");
  }
  async function K() {
    N && await (V == null ? void 0 : V()), X();
  }
  function te(Z) {
    var P, Xe;
    if (Z.key !== "Enter" || Z.shiftKey || Z.ctrlKey || Z.altKey || Z.metaKey || (P = Z.nativeEvent) != null && P.isComposing || !Z.target.matches(".pm-nav-control")) return;
    Z.preventDefault();
    const fe = [...F.current.querySelectorAll(".pm-nav-control:not(:disabled)")], Pe = fe[fe.indexOf(Z.target) + 1];
    if (!Pe) {
      Z.target.blur();
      return;
    }
    Pe.focus(), (Xe = window.matchMedia) != null && Xe.call(window, "(pointer: coarse)").matches && Pe.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return /* @__PURE__ */ v.jsxs("div", { ref: F, className: "pm-root", onKeyDown: te, children: [
    /* @__PURE__ */ v.jsx("style", { children: Zh }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-reference-title", children: [
      /* @__PURE__ */ v.jsx("strong", { children: "PRODUCT MASTER" }),
      /* @__PURE__ */ v.jsxs("span", { children: [
        n.length,
        " products",
        J ? " · Replacement lock active" : ""
      ] })
    ] }),
    /* @__PURE__ */ v.jsxs("div", { className: "pm-reference-grid pm-layout-three-col", children: [
      /* @__PURE__ */ v.jsx("div", { className: "pm-reference-left", children: /* @__PURE__ */ v.jsx(
        Om,
        {
          form: o,
          upd: c,
          products: n,
          companies: i,
          masterUnits: ye.map((Z) => Z.symbol),
          onOpenMoreBarcodes: () => we("confirmMoreBarcodes"),
          onOpenNewUnit: () => we("newUnit"),
          onPickSuggestion: _,
          onValidateIdentityCode: H,
          shopPartEnabled: B,
          hideArabicName: Ce
        }
      ) }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-reference-middle", children: [
        /* @__PURE__ */ v.jsx(Pm, { form: o, upd: c }),
        /* @__PURE__ */ v.jsx(
          bm,
          {
            canClearAll: d,
            busy: x || O,
            onDefaultDiscount: () => we("defaultDiscount"),
            onSetReorderLevel: () => we("reorderLevel"),
            onSetRack: () => we("rack"),
            onImport: () => we("import"),
            onExport: y,
            onClearAndImport: () => we("clearProducts"),
            onSpecification: () => we("specification"),
            onPhotoSetting: () => we("photo")
          }
        )
      ] }),
      /* @__PURE__ */ v.jsxs("div", { className: "pm-reference-right", children: [
        /* @__PURE__ */ v.jsxs("div", { className: "pm-list-search", children: [
          /* @__PURE__ */ v.jsx("label", { className: "pm-label", htmlFor: "pmListSearch", children: "Search" }),
          /* @__PURE__ */ v.jsx(
            "input",
            {
              id: "pmListSearch",
              className: "pm-input",
              placeholder: "Name, code, barcode, shop part...",
              value: le,
              onChange: (Z) => re == null ? void 0 : re(Z.target.value)
            }
          ),
          /* @__PURE__ */ v.jsx("button", { type: "button", className: "pm-btn-secondary", onClick: () => we("search"), children: "F10" })
        ] }),
        /* @__PURE__ */ v.jsx(
          Lm,
          {
            rows: r,
            selectedId: u,
            onSelect: _,
            loading: s,
            shopPartEnabled: B
          }
        )
      ] }),
      /* @__PURE__ */ v.jsx(
        Im,
        {
          canDelete: d,
          hasProduct: !!u,
          busy: x,
          productMaintenanceActive: J,
          onNew: p,
          onSave: g,
          onDelete: w,
          onClose: k,
          onSearch: () => we("search"),
          onOpeningStockEntry: Q ? () => we("openingStock") : void 0,
          onPrintOpeningStockBarcodes: Q ? () => C(r.filter((Z) => parseFloat(Z.openingStock || 0) > 0)) : void 0,
          onGenerateWeighingFile: pe ? j : void 0,
          showOpeningTools: Q,
          showWeighingExport: pe
        }
      )
    ] }),
    xe === "newUnit" && /* @__PURE__ */ v.jsx(
      Bm,
      {
        isUnit: !0,
        records: ye,
        notify: G,
        onClose: X,
        onRecordsChange: (Z) => {
          ge(Z), c("customUnits", Z.map((fe) => fe.symbol)), c("unitDefinitions", Z);
        }
      }
    ),
    xe === "confirmMoreBarcodes" && /* @__PURE__ */ v.jsx(
      pS,
      {
        onClose: X,
        onYes: () => we("moreBarcodes")
      }
    ),
    xe === "moreBarcodes" && /* @__PURE__ */ v.jsx(
      jm,
      {
        form: o,
        products: n,
        currentProductId: u,
        upd: c,
        notify: G,
        onDuplicate: z,
        onClose: X
      }
    ),
    xe === "openingStock" && /* @__PURE__ */ v.jsx(Um, { form: o, upd: c, notify: G, onClose: X }),
    xe === "reorderLevel" && /* @__PURE__ */ v.jsx(zm, { form: o, upd: c, notify: G, onClose: X }),
    xe === "rack" && /* @__PURE__ */ v.jsx(Hm, { form: o, upd: c, notify: G, onClose: X }),
    xe === "defaultDiscount" && /* @__PURE__ */ v.jsx(Vm, { form: o, upd: c, onClose: X }),
    xe === "specification" && /* @__PURE__ */ v.jsx($m, { form: o, upd: c, notify: G, onClose: X }),
    xe === "photo" && /* @__PURE__ */ v.jsx(Xm, { form: o, upd: c, notify: G, onClose: X }),
    xe === "clearProducts" && /* @__PURE__ */ v.jsx(
      xS,
      {
        productCount: n.length,
        busy: O,
        onClear: ue,
        onClose: X
      }
    ),
    xe === "import" && /* @__PURE__ */ v.jsx(
      uS,
      {
        onImport: E,
        notify: G,
        replacementMode: N,
        onClose: K
      }
    ),
    xe === "search" && /* @__PURE__ */ v.jsx(
      b1,
      {
        products: n,
        shopPartEnabled: B,
        onSelect: _,
        onClose: X
      }
    )
  ] });
}
const wS = "SP-", wc = 6, Es = Object.freeze({
  pattern: "SP-{SERIAL6}",
  caseStyle: "upper",
  collisionSeparator: "-"
});
function yS(e) {
  const n = String(e || "").toUpperCase().match(/[A-Z0-9]+/g) || [];
  if (!n.length) return "";
  const r = (c) => /^\d{1,3}(MM|CM|M|IN|PK|V|W|A|LTR|L)$/i.test(c) || /^\d{1,3}V\d*$/i.test(c);
  if (n.length >= 2 && /^[A-Z]{1,10}$/.test(n[0]) && (/^\d{3,}$/.test(n[1]) || /[A-Z]/.test(n[1]) && /\d/.test(n[1]) && n[1].length >= 4))
    return `${n[0]}${n[1]}`;
  if (/^\d{4,}$/.test(n[0]))
    return n[1] && /[A-Z]/.test(n[1]) && /\d/.test(n[1]) && /^[A-Z0-9]{2,}$/.test(n[1]) ? `${n[0]}${n[1]}` : n[1] && /^\d{3,}$/.test(n[1]) && n[0].length <= 6 ? `${n[0]}${n[1]}` : n[0];
  const s = n.find((c) => !(/[A-Z]/.test(c) && /\d/.test(c)) || r(c) ? !1 : c.length >= 5 ? !0 : c.length >= 4 && /\d{3,}/.test(c));
  if (s) return s;
  const i = n.find((c) => /^\d+$/.test(c) && c.length >= 6);
  if (i) return i;
  const o = n.find((c) => /^[A-Z]{3,}$/.test(c));
  return o || n.find((c) => c.length >= 3 && !r(c)) || n[0];
}
function _S(e = {}) {
  const n = String(e.pattern || Es.pattern).trim().slice(0, 80), r = ["upper", "lower", "asis"].includes(e.caseStyle) ? e.caseStyle : Es.caseStyle, s = String(e.collisionSeparator ?? "-").slice(0, 3);
  return {
    pattern: n || Es.pattern,
    caseStyle: r,
    collisionSeparator: s
  };
}
function Yh(e) {
  return String(e || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function Qh(e, n = 1) {
  return (String(e || "").toUpperCase().match(/[A-Z0-9]+/g) || []).slice(0, Math.max(1, Math.min(6, n))).join("") || "ITEM";
}
function kS(e, n = "", r = Es, s = {}) {
  const i = _S(r), o = yS(n) || String(n || "").trim().replace(/[^A-Za-z0-9]/g, ""), c = Yh(s.brand || s.company), u = String(s.name || s.productName || "").trim(), d = String(s.code || n || "").trim(), x = Yh(u), p = Math.max(1, Number(e) || 1);
  let w = i.pattern.replace(
    /\{(ORIGINAL|FIRST|LAST|SERIAL|BRAND|COMPANY|NAMEWORD|NAME|CODEWORD)(\d{0,2})\}/gi,
    (k, _, y) => {
      const E = _.toUpperCase();
      if (E === "BRAND" || E === "COMPANY") {
        const O = c || "GEN", N = y ? Math.max(1, Math.min(30, Number(y) || O.length)) : O.length;
        return O.slice(0, N);
      }
      if (E === "NAMEWORD")
        return Qh(u, Number(y) || 1);
      if (E === "CODEWORD")
        return Qh(d, Number(y) || 1);
      if (E === "NAME") {
        const O = x || "ITEM", N = y ? Math.max(1, Math.min(30, Number(y) || O.length)) : Math.min(16, O.length);
        return O.slice(0, N);
      }
      const A = Math.max(1, Math.min(30, Number(y) || (E === "SERIAL" ? wc : o.length || 1)));
      return E === "SERIAL" ? String(p).padStart(A, "0") : E === "FIRST" ? o.slice(0, A) : E === "LAST" ? o.slice(-A) : o;
    }
  ).replace(/\s+/g, "") || `${wS}${String(p).padStart(wc, "0")}`;
  return !o && !/\{SERIAL\d*\}/i.test(i.pattern) && (w = `${w}${i.collisionSeparator}${String(p).padStart(wc, "0")}`), i.caseStyle === "upper" ? w.toUpperCase() : i.caseStyle === "lower" ? w.toLowerCase() : w;
}
function ES(e) {
  const n = String(e || "").trim(), r = n.match(/^SP-(\d+)$/i);
  if (r) return Number(r[1]) || 0;
  const s = [...n.matchAll(/(\d+)/g)].map((o) => o[1]);
  if (!s.length) return 0;
  const i = s.filter((o) => o.length >= 4).sort((o, c) => c.length - o.length)[0];
  return Number(i || s[s.length - 1]) || 0;
}
function SS(e) {
  return e.reduce(
    (n, r) => Math.max(
      n,
      Number(r == null ? void 0 : r.shopPartSerial) || ES(r == null ? void 0 : r.shopPartNumber)
    ),
    0
  ) + 1;
}
const mo = {
  name: "",
  code: "",
  shopPartNumber: "",
  barcode: "",
  weightBarcode: !1,
  rateBarcode: !1,
  ean: "",
  moreBarcodes: [],
  productGroup: "",
  company: "",
  brand: "",
  category: "",
  subcategory: "",
  commodityCode: "",
  description: "",
  unit: "Pcs",
  productType: "Goods",
  salesVat: "5",
  purchaseVat: "5",
  landingCost: "",
  marginPerc: "",
  marginAmount: "",
  vatExclusive: "",
  vatInclusive: "",
  mrp: "",
  vatOnMrp: !1,
  averageCost: "",
  multiCustomerRatesEnabled: !1,
  unitPrices: [],
  customUnits: [],
  unitDefinitions: [],
  customerTypes: [],
  defaultDiscount: "",
  reorderMin: "",
  reorderMax: "",
  reorderQty: "",
  rackLocation: "",
  openingStock: "",
  openingRate: "",
  openingWarehouse: "",
  specificationText: "",
  photoUrl: "",
  notes: ""
};
function ls(e) {
  const n = Number(e);
  return Number.isFinite(n) ? n : 0;
}
function qh(e) {
  return e ? {
    ...mo,
    ...e,
    salesVat: String(e.salesVat ?? e.vat ?? "5"),
    purchaseVat: String(e.purchaseVat ?? e.vat ?? "5"),
    vatInclusive: e.vatInclusive ?? e.price ?? "",
    moreBarcodes: Array.isArray(e.moreBarcodes) ? e.moreBarcodes : [],
    unitPrices: Array.isArray(e.unitPrices) ? e.unitPrices : []
  } : { ...mo };
}
function TS(e) {
  const n = ls(e.vatInclusive) || ls(e.vatExclusive) || ls(e.landingCost) || 0, r = ls(e.salesVat) || ls(e.vat) || 5;
  return {
    ...e,
    price: n,
    vat: r,
    brand: e.company || e.brand || ""
  };
}
function I1({ api: e }) {
  const [n, r] = Ae.useState({ ...mo }), [s, i] = Ae.useState(""), [o, c] = Ae.useState(""), [u, d] = Ae.useState(!1), [x, p] = Ae.useState(!1), g = e.products || [], w = e.companies || [], k = Ae.useMemo(() => {
    const C = String(o || "").trim().toLowerCase();
    return C ? g.filter((G) => `${G.name || ""} ${G.code || ""} ${G.barcode || ""} ${G.shopPartNumber || ""} ${G.category || ""} ${G.company || ""}`.toLowerCase().includes(C)) : g;
  }, [g, o]), _ = Ae.useCallback((C, G) => {
    r((B) => ({ ...B, [C]: G }));
  }, []), y = Ae.useCallback((C, G) => {
    var B;
    (B = e.notify) == null || B.call(e, C, G);
  }, [e]), E = Ae.useCallback(() => {
    i(""), r({
      ...mo,
      salesVat: String(e.defaultVat ?? "5"),
      purchaseVat: String(e.defaultVat ?? "5")
    });
  }, [e.defaultVat]);
  Tm.useEffect(() => {
    e.startNewOnMount && E();
  }, [e.startNewOnMount, E]);
  const A = Ae.useCallback((C) => {
    C && (i(C.id || ""), r(qh(C)));
  }, []), O = Ae.useCallback(async () => {
    var G;
    if (!String(n.name || "").trim()) {
      y("Product name required", "err");
      return;
    }
    d(!0);
    try {
      let B = TS(n);
      if (e.shopPartEnabled && !String(B.shopPartNumber || "").trim()) {
        const re = SS(g), Q = e.shopPartFormat || Es;
        B.shopPartNumber = kS(re, B.code || B.name, Q, B), B.shopPartSerial = re, r((pe) => ({ ...pe, shopPartNumber: B.shopPartNumber, shopPartSerial: re }));
      }
      const le = await ((G = e.onSave) == null ? void 0 : G.call(e, B, s));
      le != null && le.id && (i(le.id), r(qh(le))), y("Product saved", "ok");
    } catch (B) {
      y(String((B == null ? void 0 : B.message) || B), "err");
    } finally {
      d(!1);
    }
  }, [e, n, g, s, y]), N = Ae.useCallback(async () => {
    var C;
    if (s && window.confirm(`Delete product "${n.name}"?`))
      try {
        await ((C = e.onDelete) == null ? void 0 : C.call(e, s)), E(), y("Product deleted", "ok");
      } catch (G) {
        y(String((G == null ? void 0 : G.message) || G), "err");
      }
  }, [e, n.name, E, s, y]), V = Ae.useCallback(() => {
    var C;
    return (C = e.onExport) == null ? void 0 : C.call(e, g);
  }, [e, g]), J = Ae.useCallback(async (C) => {
    var G;
    return (G = e.onImportRecords) == null ? void 0 : G.call(e, C);
  }, [e]), j = Ae.useCallback(async () => {
    var C;
    p(!0);
    try {
      return await ((C = e.onClearAll) == null ? void 0 : C.call(e));
    } finally {
      p(!1);
    }
  }, [e]);
  return /* @__PURE__ */ v.jsx(
    vS,
    {
      shopId: e.shopId || "default",
      products: g,
      filteredProducts: k,
      productsLoading: !!e.loading,
      companies: w,
      form: n,
      upd: _,
      selectedId: s,
      canDelete: !!e.canDelete,
      saving: u,
      onNew: E,
      onSave: O,
      onDelete: N,
      onClose: () => {
        var C;
        return (C = e.onClose) == null ? void 0 : C.call(e);
      },
      onSelectProduct: A,
      onExport: V,
      onImportRecords: J,
      onClearAll: j,
      clearingProducts: x,
      replacementActive: !!e.replacementActive,
      onFinishReplacement: e.onFinishReplacement,
      productMaintenanceActive: !!e.productMaintenanceActive,
      onGenerateWeighingFile: e.onGenerateWeighingFile,
      onPrintBarcodes: e.onPrintBarcodes,
      notify: y,
      shopPartEnabled: !!e.shopPartEnabled,
      listQuery: o,
      onListQueryChange: c,
      showOpeningTools: !1,
      showWeighingExport: !1,
      hideArabicName: !0
    }
  );
}
function L1({ api: e }) {
  return /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
    /* @__PURE__ */ v.jsx("style", { children: Zh }),
    /* @__PURE__ */ v.jsx(
      b1,
      {
        products: e.products || [],
        shopPartEnabled: e.shopPartEnabled !== !1,
        initialFields: e.initialFields || {},
        onSelect: (n) => {
          var r;
          return (r = e.onSelect) == null ? void 0 : r.call(e, n);
        },
        onClose: () => {
          var n;
          return (n = e.onClose) == null ? void 0 : n.call(e);
        }
      }
    )
  ] });
}
let Cn = null, An = null, Ca = null, Aa = null;
function CS(e, n) {
  if (!e) throw new Error("Product Master mount element missing");
  Ca = n, Cn || (Cn = Jh.createRoot(e)), Cn.render(/* @__PURE__ */ v.jsx(I1, { api: Ca }));
}
function AS(e) {
  Ca = e || Ca, Cn && Ca && Cn.render(/* @__PURE__ */ v.jsx(I1, { api: Ca }));
}
function FS() {
  Cn == null || Cn.unmount(), Cn = null, Ca = null;
}
function NS(e, n) {
  if (!e) throw new Error("Product Search mount element missing");
  Aa = n, An || (An = Jh.createRoot(e)), An.render(/* @__PURE__ */ v.jsx(L1, { api: Aa }));
}
function RS(e) {
  Aa = e || Aa, An && Aa && An.render(/* @__PURE__ */ v.jsx(L1, { api: Aa }));
}
function DS() {
  An == null || An.unmount(), An = null, Aa = null;
}
export {
  CS as mountProductMaster,
  NS as mountProductSearch,
  AS as refreshProductMaster,
  RS as refreshProductSearch,
  FS as unmountProductMaster,
  DS as unmountProductSearch
};

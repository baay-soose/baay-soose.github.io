// Intégration de New Relic Browser pour la surveillance des performances
// Insérer ce script juste après la balise <head> dans index.html

// Configuration de base
window.NREUM || (NREUM = {}), __nr_require = function (t, e, n) { function r(n) { if (!e[n]) { var o = e[n] = { exports: {} }; t[n][0].call(o.exports, function (e) { var o = t[n][1][e]; return r(o || e) }, o, o.exports) } return e[n].exports } if ("function" == typeof __nr_require) return __nr_require; for (var o = 0; o < n.length; o++)r(n[o]); return r }({ 1: [function (t, e, n) { function r(t) { try { c.console && console.log(t) } catch (e) { } } var o, i = t("ee"), a = t(19), c = {}; try { o = localStorage.getItem("__nr_flags").split(","), console && "function" == typeof console.log && (c.console = !0, o.indexOf("dev") !== -1 && (c.dev = !0), o.indexOf("nr_dev") !== -1 && (c.nrDev = !0)) } catch (s) { } c.nrDev && i.on("internal-error", function (t) { r(t.stack) }), c.dev && i.on("fn-err", function (t, e, n) { r(n.stack) }), c.dev && (r("NR AGENT IN DEVELOPMENT MODE"), r("flags: " + a(c, function (t, e) { return t }).join(", "))) }, {}], 2: [function (t, e, n) { function r(t, e, n, r, o) { try { h ? h -= 1 : i("err", [o || new UncaughtException(t, e, n)]) } catch (c) { try { i("ierr", [c, s.now(), !0]) } catch (u) { } } return "function" == typeof f && f.apply(this, a(arguments)) } function UncaughtException(t, e, n) { this.message = t || "Uncaught error with no additional information", this.sourceURL = e, this.line = n } function o(t) { i("err", [t, s.now()]) } var i = t("handle"), a = t(20), c = t("ee"), s = t("loader"), f = window.onerror, u = !1, h = 0; s.features.err = !0, t(1), window.onerror = r; try { throw new Error } catch (d) { "stack" in d && (t(12), t(11), "addEventListener" in window && t(6), s.xhrWrappable && t(13), u = !0) } c.on("fn-start", function (t, e, n) { u && (h += 1) }), c.on("fn-err", function (t, e, n) { u && (this.thrown = !0, o(n)) }), c.on("fn-end", function () { u && !this.thrown && h > 0 && (h -= 1) }), c.on("internal-error", function (t) { i("ierr", [t, s.now(), !0]) }) }, {}] }, {}, []);

// Code de configuration New Relic
// Remplacer YOUR_ACCOUNT_ID avec votre ID de compte New Relic
// Remplacer LICENSE_KEY avec votre clé de licence New Relic
(function () {
    const appID = '6626252';
    const licenseKey = 'NRAK-UXEXXB22E15OK6YXUA9ERBF0XU9';

    // Configuration de l'application
    const appName = 'baay-soose.github.io';
    const appVersion = '1.0.0';

    // Initialisation de la surveillance
    if (window.newrelic) {
        window.newrelic.setApplicationVersion(appVersion);
        window.newrelic.setCustomAttribute('appName', appName);

        // Mesurer le temps de chargement
        window.addEventListener('load', function () {
            if (window.performance) {
                const pageLoad = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                window.newrelic.setPageViewName(document.title);
                window.newrelic.setCustomAttribute('pageLoadTime', pageLoad);
            }
        });

        // Suivre les clics sur les liens
        document.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                window.newrelic.addPageAction('linkClick', {
                    href: event.target.href,
                    text: event.target.textContent.trim()
                });
            }
        });
    }
})();

// Fonction pour ajouter des événements de surveillance personnalisés
function trackUserInteraction(action, attributes) {
    if (window.newrelic) {
        window.newrelic.addPageAction(action, attributes || {});
    }
}

// Fonction pour signaler des erreurs manuellement
function reportError(error, context) {
    if (window.newrelic) {
        window.newrelic.noticeError(error, context || {});
    }
}
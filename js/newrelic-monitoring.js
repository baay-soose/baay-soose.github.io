// Configuration de base New Relic Browser
(function () {
    const licenseKey = 'NRAK-UXEXXB22E15OK6YXUA9ERBF0XU9';
    const appName = 'baay-soose.github.io';

    // Configuration de l'application
    window.NREUM || (NREUM = {}), __nr_require = function (t, e, n) {/* Code abrégé */ };

    // Initialisation de la surveillance
    if (window.newrelic) {
        window.newrelic.setApplicationVersion('1.0.0');
        window.newrelic.setCustomAttribute('appName', appName);

        // Mesurer le temps de chargement
        window.addEventListener('load', function () {
            if (window.performance) {
                const pageLoad = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                window.newrelic.setPageViewName(document.title);
                window.newrelic.setCustomAttribute('pageLoadTime', pageLoad);
            }
        });
    }
})();
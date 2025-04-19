// tests/selenium/runAllTests.js
const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Configuration de Mocha
const mochaOptions = {
    timeout: config.timeout,
    reporter: config.reporters.junit ? 'mocha-junit-reporter' : 'spec',
    reporterOptions: config.reporters.junit ? {
        mochaFile: config.reporters.junitFile,
        properties: {
            BUILD_NUMBER: process.env.BUILD_NUMBER || 'local-build',
            JOB_NAME: process.env.JOB_NAME || 'selenium-tests'
        }
    } : {},
    slow: 10000,
    bail: false // Continuer les tests m�me apr�s un �chec
};

// Cr�er une instance de Mocha avec les options
const mocha = new Mocha(mochaOptions);

// Cr�er les dossiers n�cessaires
const testResultsDir = path.dirname(config.reporters.junitFile);
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

if (config.screenshotOnError) {
    if (!fs.existsSync(config.screenshotPath)) {
        fs.mkdirSync(config.screenshotPath, { recursive: true });
    }
}

// Ajouter tous les fichiers de test
const testDir = path.join(__dirname);
fs.readdirSync(testDir)
    .filter(file => {
        // Inclure uniquement les fichiers qui se terminent par Test.js
        // et qui ne sont pas des fichiers de configuration
        return file.endsWith('Test.js') &&
            !file.startsWith('base') &&
            !file.startsWith('config') &&
            !file.startsWith('run');
    })
    .forEach(file => {
        console.log(`Ajout du test: ${file}`);
        mocha.addFile(path.join(testDir, file));
    });

// Afficher la configuration des tests
console.log('=================================');
console.log('Configuration des tests Selenium:');
console.log('=================================');
console.log(`Base URL: ${config.baseUrl}`);
console.log(`Mode headless: ${config.headless}`);
console.log(`Timeout: ${config.timeout / 1000} secondes`);
console.log(`Nombre de tests: ${mocha.files.length}`);
console.log('=================================\n');

// Ex�cuter les tests
console.log('D�marrage des tests...\n');

mocha.run(failures => {
    if (failures) {
        console.error(`\n${failures} tests ont �chou�.`);
        process.exitCode = 1;
    } else {
        console.log('\nTous les tests ont r�ussi !');
        process.exitCode = 0;
    }

    // Afficher le chemin du rapport JUnit si g�n�r�
    if (config.reporters.junit) {
        console.log(`\nRapport JUnit g�n�r�: ${config.reporters.junitFile}`);
    }

    // Afficher le chemin des captures d'�cran si pr�sentes
    if (config.screenshotOnError && fs.existsSync(config.screenshotPath)) {
        const screenshots = fs.readdirSync(config.screenshotPath);
        if (screenshots.length > 0) {
            console.log(`\nCaptures d'�cran g�n�r�es dans: ${config.screenshotPath}`);
            screenshots.forEach(file => console.log(`  - ${file}`));
        }
    }
});
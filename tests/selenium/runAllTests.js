// tests/selenium/runAllTests.js
const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { spawn } = require('child_process');

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
    bail: false
};

// Créer une instance de Mocha avec les options
const mocha = new Mocha(mochaOptions);

// Créer les dossiers nécessaires
const testResultsDir = path.dirname(config.reporters.junitFile);
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

if (config.screenshotOnError) {
    if (!fs.existsSync(config.screenshotPath)) {
        fs.mkdirSync(config.screenshotPath, { recursive: true });
    }
}

// Démarrer le serveur web
console.log(`Démarrage du serveur sur le port ${config.port}...`);
const server = spawn('node', [path.join(__dirname, 'startServer.js')], {
    stdio: 'inherit'
});

// Attendre que le serveur démarre
setTimeout(() => {
    // Ajouter tous les fichiers de test SAUF formTest.js
    const testDir = path.join(__dirname);
    fs.readdirSync(testDir)
        .filter(file => {
            return file.endsWith('Test.js') &&
                !file.startsWith('base') &&
                !file.startsWith('config') &&
                !file.startsWith('run') &&
                file !== 'formTest.js'; // Exclure formTest.js
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

    // Exécuter les tests
    console.log('Démarrage des tests...\n');

    mocha.run(failures => {
        if (failures) {
            console.error(`\n${failures} tests ont échoué.`);
            process.exitCode = 1;
        } else {
            console.log('\nTous les tests ont réussi !');
            process.exitCode = 0;
        }

        // Afficher le chemin du rapport JUnit si généré
        if (config.reporters.junit) {
            console.log(`\nRapport JUnit généré: ${config.reporters.junitFile}`);
        }

        // Afficher le chemin des captures d'écran si présentes
        if (config.screenshotOnError && fs.existsSync(config.screenshotPath)) {
            const screenshots = fs.readdirSync(config.screenshotPath);
            if (screenshots.length > 0) {
                console.log(`\nCaptures d'écran générées dans: ${config.screenshotPath}`);
                screenshots.forEach(file => console.log(`  - ${file}`));
            }
        }

        // Arrêter le serveur web
        console.log('\nArrêt du serveur...');
        server.kill();
        process.exit(process.exitCode);
    });
}, 3000); // Attendre 3 secondes que le serveur démarre
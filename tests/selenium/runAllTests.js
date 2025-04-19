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

// D�marrer le serveur web
console.log(`D�marrage du serveur sur le port ${config.port}...`);
const server = spawn('node', [path.join(__dirname, 'startServer.js')], {
    stdio: 'inherit'
});

// Attendre que le serveur d�marre
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

        // Arr�ter le serveur web
        console.log('\nArr�t du serveur...');
        server.kill();
        process.exit(process.exitCode);
    });
}, 3000); // Attendre 3 secondes que le serveur d�marre
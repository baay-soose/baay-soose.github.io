// tests/selenium/runAllTests.js
const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { spawn } = require('child_process');

// Configuration de Mocha avec logging am�lior�
const mochaOptions = {
    timeout: config.timeout,
    reporter: 'spec',  // Utiliser spec pour voir plus de d�tails
    reporterOptions: {
        output: 'test-results/selenium-output.txt'  // Capturer aussi la sortie console
    },
    slow: 10000,
    bail: false
};

// Si on veut aussi le rapport JUnit
const mocha = new Mocha(mochaOptions);

// Rediriger les logs vers un fichier
const logFile = fs.createWriteStream('test-results/test-log.txt', { flags: 'w' });
const originalConsoleLog = console.log;
console.log = function () {
    logFile.write(Array.from(arguments).join(' ') + '\n');
    originalConsoleLog.apply(console, arguments);
};

// Cr�er les dossiers n�cessaires
const testResultsDir = path.dirname('test-results/selenium-junit.xml');
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

// Gestion des erreurs du serveur
server.on('error', (err) => {
    console.error('Erreur lors du d�marrage du serveur:', err);
});

// Attendre que le serveur d�marre
setTimeout(() => {
    // Ajouter tous les fichiers de test
    const testDir = path.join(__dirname);
    fs.readdirSync(testDir)
        .filter(file => {
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
        // G�n�rer aussi un rapport JUnit
        const junitReporter = new Mocha.reporters.JUnit(mocha.suite, {
            reporterOptions: {
                mochaFile: 'test-results/selenium-junit.xml'
            }
        });

        if (failures) {
            console.error(`\n${failures} tests ont �chou�.`);
            process.exitCode = 1;
        } else {
            console.log('\nTous les tests ont r�ussi !');
            process.exitCode = 0;
        }

        // Afficher le chemin du rapport JUnit si g�n�r�
        console.log(`\nRapport JUnit g�n�r�: test-results/selenium-junit.xml`);

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
        logFile.end();
        process.exit(process.exitCode);
    });
}, 3000);
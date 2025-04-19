// tests/selenium/baseTest.js
const { Builder, Browser, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const config = require('./config');
const fs = require('fs');
const path = require('path');

class BaseTest {
    constructor() {
        this.driver = null;
    }

    async setup() {
        console.log('Initialisation du driver Chrome...');
        console.log(`Environnement: ${process.platform}`);
        console.log(`Dossier de travail: ${process.cwd()}`);

        try {
            const options = new chrome.Options();

            // Options spécifiques pour Jenkins/Windows
            config.chromeOptions().forEach(arg => {
                console.log(`Ajout de l'option Chrome: ${arg}`);
                options.addArguments(arg);
            });

            // Options supplémentaires pour Jenkins
            options.addArguments('--disable-infobars');
            options.addArguments('--ignore-certificate-errors');
            options.addArguments('--start-maximized');
            options.addArguments('--disable-gpu');
            options.addArguments('--no-sandbox');
            options.addArguments('--disable-setuid-sandbox');

            // Pour Jenkins, spécifier explicitement les chemins si nécessaire
            if (process.env.CHROMEDRIVER_PATH) {
                console.log(`Utilisation de ChromeDriver: ${process.env.CHROMEDRIVER_PATH}`);
                process.env.PATH = `${process.env.CHROMEDRIVER_PATH};${process.env.PATH}`;
            }

            console.log('Création du driver...');

            // Essayer de créer le driver avec un délai
            let attempts = 0;
            let lastError;

            while (attempts < 3) {
                try {
                    this.driver = await new Builder()
                        .forBrowser(Browser.CHROME)
                        .setChromeOptions(options)
                        .build();
                    break;
                } catch (e) {
                    lastError = e;
                    attempts++;
                    console.log(`Tentative ${attempts} échouée: ${e.message}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            if (!this.driver && lastError) {
                throw lastError;
            }

            console.log('Driver créé avec succès');

            // Configuration des timeouts
            await this.driver.manage().setTimeouts({
                implicit: 10000,
                pageLoad: 30000,
                script: 30000
            });

            console.log('Timeouts configurés');

            // Vérifier que le driver fonctionne
            await this.driver.getTitle();
            console.log('Driver testé avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'initialisation du driver:', error);
            console.error('Stack trace:', error.stack);

            // Vérifier si Chrome est installé
            try {
                const { execSync } = require('child_process');
                const chromeCheck = execSync('where chrome || where google-chrome || echo Chrome not found').toString();
                console.log('Vérification Chrome:', chromeCheck);
            } catch (e) {
                console.error('Impossible de vérifier l\'installation de Chrome:', e.message);
            }

            // Vérifier si ChromeDriver est accessible
            try {
                const { execSync } = require('child_process');
                const driverCheck = execSync('npx chromedriver --version || echo ChromeDriver not found').toString();
                console.log('Vérification ChromeDriver:', driverCheck);
            } catch (e) {
                console.error('Impossible de vérifier ChromeDriver:', e.message);
            }

            throw error;
        }
    }

    async teardown() {
        console.log('Nettoyage du driver...');
        if (this.driver) {
            try {
                // Capturer une dernière capture d'écran avant de fermer
                const screenshot = await this.driver.takeScreenshot();
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = path.join('screenshots', `teardown-${timestamp}.png`);

                // S'assurer que le dossier screenshots existe
                if (!fs.existsSync('screenshots')) {
                    fs.mkdirSync('screenshots');
                }

                fs.writeFileSync(filename, screenshot, 'base64');
                console.log(`Capture d'écran finale sauvegardée: ${filename}`);
            } catch (e) {
                console.error('Erreur lors de la capture d\'écran finale:', e.message);
            }

            try {
                await this.driver.quit();
                console.log('Driver fermé avec succès');
            } catch (e) {
                console.error('Erreur lors de la fermeture du driver:', e.message);
            }
        }
    }

    getDriver() {
        return this.driver;
    }
}

module.exports = BaseTest;
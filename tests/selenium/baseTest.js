// tests/selenium/baseTest.js
const { Builder, Browser, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const config = require('./config');
const fs = require('fs');

class BaseTest {
    constructor() {
        this.driver = null;
    }

    async setup() {
        console.log('Initialisation du driver Chrome...');

        try {
            const options = new chrome.Options();
            config.chromeOptions().forEach(arg => {
                console.log(`Ajout de l'option Chrome: ${arg}`);
                options.addArguments(arg);
            });

            // Ajouter des options supplémentaires pour la stabilité
            options.addArguments('--disable-infobars');
            options.addArguments('--ignore-certificate-errors');
            options.addArguments('--start-maximized');

            console.log('Création du driver...');

            this.driver = await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options)
                .build();

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

            // Capturer une trace complète de l'erreur
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }

            // Vérifier si Chrome est installé
            try {
                const { execSync } = require('child_process');
                execSync('where chrome || where google-chrome');
                console.log('Chrome est installé');
            } catch (e) {
                console.error('Chrome n\'est pas trouvé dans le PATH');
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
                const filename = `screenshots/teardown-${timestamp}.png`;
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
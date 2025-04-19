// tests/selenium/baseTest.js
const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

class BaseTest {
    constructor() {
        this.driver = null;
    }

    async setup() {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');

        this.driver = await new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(options)
            .build();

        await this.driver.manage().setTimeouts({ implicit: 10000 });
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    getDriver() {
        return this.driver;
    }
}

module.exports = BaseTest;
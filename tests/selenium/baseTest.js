// tests/selenium/baseTest.js
const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const config = require('./config');

class BaseTest {
    constructor() {
        this.driver = null;
    }

    async setup() {
        const options = new chrome.Options();
        config.chromeOptions().forEach(arg => options.addArguments(arg));

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
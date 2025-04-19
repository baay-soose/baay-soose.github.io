// tests/selenium/mocha.config.js
module.exports = {
    reporter: 'mocha-junit-reporter',
    reporterOptions: {
        mochaFile: './test-results/selenium-junit-[hash].xml',
        properties: {
            BUILD_NUMBER: process.env.BUILD_NUMBER || 'local-build',
            JOB_NAME: process.env.JOB_NAME || 'selenium-tests'
        }
    },
    timeout: 30000,
    slow: 10000
};

// Mise à jour du package.json pour inclure le reporter
{
    "name": "baay-soose-tests",
        "version": "1.0.0",
            "description": "Tests Selenium pour baay-soose.github.io",
                "scripts": {
        "test": "mocha tests/selenium/**/*.js --timeout 30000",
            "test:selenium": "mocha tests/selenium/**/*.js --timeout 30000 --reporter mocha-junit-reporter --reporter-options mochaFile=test-results/selenium-junit.xml",
                "test:headless": "cross-env HEADLESS=true mocha tests/selenium/**/*.js --timeout 30000",
                    "test:single": "mocha"
    },
    "devDependencies": {
        "mocha": "^10.2.0",
            "selenium-webdriver": "^4.15.0",
                "chromedriver": "^119.0.1",
                    "cross-env": "^7.0.3",
                        "assert": "^2.1.0",
                            "mocha-junit-reporter": "^2.2.1"
    }
}
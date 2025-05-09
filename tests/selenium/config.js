module.exports = {
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.TEST_PORT || 8081}`,
    timeout: 60000,  // Augment� � 60 secondes
    headless: process.env.HEADLESS === 'true' || !!process.env.JENKINS_HOME || !!process.env.BUILD_ID,
    port: process.env.TEST_PORT || 8081,
    windowSize: {
        width: 1024,
        height: 720
    },
    chromeOptions: function () {
        const options = [];
        if (this.headless) {
            options.push('--headless');
        }
        options.push(
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',  // Ajout� pour �viter des probl�mes sur certains environnements
            '--disable-dev-shm-usage',
            '--disable-extensions',
            `--window-size=${this.windowSize.width},${this.windowSize.height}`
        );
        return options;
    },
    reporters: {
        console: true,
        junit: true,
        junitFile: 'test-results/selenium-junit.xml'
    },
    screenshotOnError: true,
    screenshotPath: 'screenshots'
};
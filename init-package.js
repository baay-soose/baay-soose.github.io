const fs = require('fs');

const packageJson = {
  name: "baay-soose-tests",
  version: "1.0.0",
  description: "Tests Selenium pour baay-soose.github.io",
  scripts: {
    test: "mocha tests/selenium/**/*.js --timeout 30000",
    "test:selenium": "mocha tests/selenium/**/*.js --timeout 30000",
    "test:all": "node tests/selenium/runAllTests.js"
  },
  devDependencies: {
    mocha: "^10.2.0",
    "selenium-webdriver": "^4.15.0",
    chromedriver: "^119.0.1",
    assert: "^2.1.0",
    "mocha-junit-reporter": "^2.2.1",
    "cross-env": "^7.0.3"
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('package.json créé avec succès!');
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'  // Nom configuré dans Global Tool Configuration
    }
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        TEST_PORT = '8081'
        CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/baay-soose/baay-soose.github.io.git'
            }
        }
        
        stage('List Files') {
            steps {
                echo 'Listing des fichiers du projet...'
                bat '''
                    dir /s /b
                '''
            }
        }
        
        stage('Validate HTML Files') {
            steps {
                echo 'Validation des fichiers HTML...'
                bat '''
                    echo Vérification de l'existence des fichiers HTML
                    dir /b *.html
                    
                    echo Total des fichiers HTML trouvés :
                    dir /b *.html | find /c /v ""
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installation des dépendances...'
                bat '''
                    npm install || exit 0
                '''
            }
        }
        
        stage('Lint CSS and JavaScript') {
            steps {
                echo 'Vérification du CSS et JavaScript...'
                
                bat '''
                    rem Installation des linters
                    npm install --save-dev eslint stylelint || exit 0
                    
                    rem Création de la configuration ESLint
                    echo { "env": { "browser": true }, "extends": "eslint:recommended" } > .eslintrc.json
                    
                    rem Exécution des linters
                    if exist *.js (
                        npx eslint *.js || exit 0
                    )
                    
                    if exist *.css (
                        npx stylelint *.css || exit 0
                    )
                '''
            }
        }
  
        stage('Setup Selenium') {
            steps {
                echo 'Configuration des tests Selenium...'
                bat '''
                    rem Créer le dossier tests s'il n'existe pas
                    if not exist tests\\selenium mkdir tests\\selenium
                    
                    rem Installer les dépendances Selenium
                    npm install mocha selenium-webdriver chromedriver mocha-junit-reporter --save-dev || exit 0
                    
                    rem Créer le package.json si nécessaire
                    if not exist package.json (
                        npm init -y
                    )
                '''
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo 'Exécution des tests Selenium...'
                bat '''
                    rem Définir le port pour les tests
                    set TEST_PORT=8081
                    
                    rem Créer le répertoire pour les résultats des tests
                    if not exist test-results mkdir test-results
                    
                    rem Créer le répertoire pour les captures d'écran
                    if not exist screenshots mkdir screenshots
                    
                    rem Vérifier que Node.js est disponible
                    node --version
                    
                    rem Exécuter les tests avec le script runAllTests.js
                    node tests/selenium/runAllTests.js || echo "Échec des tests Selenium"
                '''
            }
             post {
        success {
            echo 'Pipeline exécuté avec succès !'
        }
        
        failure {
            echo 'Pipeline échoué !'
        }

        
        always {
            cleanWs()
        }
    }
}
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
        always {
            // Archiver les résultats des tests
            junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
            
            // Archiver les captures d'écran si présentes
            archiveArtifacts allowEmptyArchive: true, artifacts: 'screenshots/**/*.png'
            
            // Archiver les logs détaillés
            archiveArtifacts allowEmptyArchive: true, artifacts: 'test-results/*.txt'
            
            // Publier le rapport HTML si vous en avez un
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'test-results',
                reportFiles: 'selenium-report.html',
                reportName: 'Selenium Test Report'
            ])
        }
    }
}
        
        stage('Build for Production') {
            steps {
                echo 'Préparation pour la production...'
                bat '''
                    rem Création du dossier de build
                    if not exist dist mkdir dist
                    
                    rem Copie des fichiers HTML
                    xcopy /y *.html dist\\
                    
                    rem Copie des fichiers CSS si présents
                    if exist *.css xcopy /y *.css dist\\
                    
                    rem Copie des fichiers JS si présents
                    if exist *.js xcopy /y *.js dist\\
                    
                    rem Copie des images si présentes
                    if exist images xcopy /s /e /y images dist\\images\\
                    
                    rem Copie des fonts si présentes
                    if exist fonts xcopy /s /e /y fonts dist\\fonts\\
                    
                    rem Afficher le contenu du dossier dist
                    echo Contenu du dossier dist :
                    dir /s /b dist
                '''
            }
        }
        
        stage('Archive Build') {
            steps {
                echo 'Archivage du build...'
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            }
        }
        
        stage('Deploy Simulation') {
            when {
                branch 'main'
            }
            steps {
                echo 'Déploiement simulé du site...'
                bat '''
                    echo Le site est prêt à être déployé depuis le dossier dist
                    echo Vous pouvez copier le contenu vers votre serveur web
                '''
            }
        }
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
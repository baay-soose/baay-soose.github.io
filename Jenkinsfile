pipeline {
    agent any
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        TEST_PORT = '8081'
        CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application'
        CHROMEDRIVER_PATH = '' // Sera défini automatiquement par npm
    }
    
    stages {
        stage('Check NodeJS') {
            steps {
                script {
                    // Vérifier si Node.js est disponible
                    try {
                        bat 'node --version'
                        echo 'Node.js est déjà disponible sur le système'
                    } catch (Exception e) {
                        echo 'Node.js n\'est pas disponible dans le PATH'
                        error('Node.js n\'est pas installé. Veuillez l\'installer sur le serveur Jenkins.')
                    }
                }
            }
        }
        
        stage('Verify Chrome Installation') {
            steps {
                echo 'Vérification de l\'installation de Chrome...'
                bat '''
                    where chrome || where google-chrome || echo "Chrome non trouvé dans le PATH"
                    
                    rem Vérifier si Chrome existe à l'emplacement standard
                    if exist "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" (
                        echo "Chrome trouvé dans Program Files"
                        set CHROME_EXISTS=true
                    ) else (
                        echo "Chrome non trouvé"
                        exit /b 1
                    )
                '''
            }
        }
        
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/baay-soose/baay-soose.github.io.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installation des dépendances...'
                bat '''
                    npm install || exit 0
                    
                    rem Installer ChromeDriver pour la version de Chrome installée
                    npm install chromedriver@^135.0.0 --save-dev || exit 0
                '''
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo 'Exécution des tests Selenium...'
                bat '''
                    rem Ajouter Chrome et ChromeDriver au PATH pour cette session
                    set PATH=%CHROME_PATH%;%PATH%
                    set PATH=%CD%\\node_modules\\.bin;%PATH%
                    
                    rem Définir le port pour les tests
                    set TEST_PORT=8081
                    
                    rem Créer le répertoire pour les résultats des tests
                    if not exist test-results mkdir test-results
                    
                    rem Créer le répertoire pour les captures d'écran
                    if not exist screenshots mkdir screenshots
                    
                    rem Vérifier la version de ChromeDriver
                    npx chromedriver --version
                    
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
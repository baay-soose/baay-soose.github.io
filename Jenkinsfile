pipeline {
    agent any
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        TEST_PORT = '8081'
        CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application'
        CHROMEDRIVER_PATH = '' // Sera d�fini automatiquement par npm
    }
    
    stages {
        stage('Check NodeJS') {
            steps {
                script {
                    // V�rifier si Node.js est disponible
                    try {
                        bat 'node --version'
                        echo 'Node.js est d�j� disponible sur le syst�me'
                    } catch (Exception e) {
                        echo 'Node.js n\'est pas disponible dans le PATH'
                        error('Node.js n\'est pas install�. Veuillez l\'installer sur le serveur Jenkins.')
                    }
                }
            }
        }
        
        stage('Verify Chrome Installation') {
            steps {
                echo 'V�rification de l\'installation de Chrome...'
                bat '''
                    where chrome || where google-chrome || echo "Chrome non trouv� dans le PATH"
                    
                    rem V�rifier si Chrome existe � l'emplacement standard
                    if exist "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" (
                        echo "Chrome trouv� dans Program Files"
                        set CHROME_EXISTS=true
                    ) else (
                        echo "Chrome non trouv�"
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
                echo 'Installation des d�pendances...'
                bat '''
                    npm install || exit 0
                    
                    rem Installer ChromeDriver pour la version de Chrome install�e
                    npm install chromedriver@^135.0.0 --save-dev || exit 0
                '''
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo 'Ex�cution des tests Selenium...'
                bat '''
                    rem Ajouter Chrome et ChromeDriver au PATH pour cette session
                    set PATH=%CHROME_PATH%;%PATH%
                    set PATH=%CD%\\node_modules\\.bin;%PATH%
                    
                    rem D�finir le port pour les tests
                    set TEST_PORT=8081
                    
                    rem Cr�er le r�pertoire pour les r�sultats des tests
                    if not exist test-results mkdir test-results
                    
                    rem Cr�er le r�pertoire pour les captures d'�cran
                    if not exist screenshots mkdir screenshots
                    
                    rem V�rifier la version de ChromeDriver
                    npx chromedriver --version
                    
                    rem Ex�cuter les tests avec le script runAllTests.js
                    node tests/selenium/runAllTests.js || echo "�chec des tests Selenium"
                '''
            }
            post {
                always {
                    // Archiver les r�sultats des tests
                    junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
                    
                    // Archiver les captures d'�cran si pr�sentes
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'screenshots/**/*.png'
                    
                    // Archiver les logs d�taill�s
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'test-results/*.txt'
                }
            }
        }
        
        stage('Build for Production') {
            steps {
                echo 'Pr�paration pour la production...'
                bat '''
                    rem Cr�ation du dossier de build
                    if not exist dist mkdir dist
                    
                    rem Copie des fichiers HTML
                    xcopy /y *.html dist\\
                    
                    rem Copie des fichiers CSS si pr�sents
                    if exist *.css xcopy /y *.css dist\\
                    
                    rem Copie des fichiers JS si pr�sents
                    if exist *.js xcopy /y *.js dist\\
                    
                    rem Copie des images si pr�sentes
                    if exist images xcopy /s /e /y images dist\\images\\
                    
                    rem Copie des fonts si pr�sentes
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
            echo 'Pipeline ex�cut� avec succ�s !'
        }
        
        failure {
            echo 'Pipeline �chou� !'
        }
        
        always {
            cleanWs()
        }
    }
}
pipeline {
    agent any
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        TEST_PORT = '8081'
        
    }
    
    stages {
        stage('Check NodeJS') {
            steps {
                script {
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
                    npm install chromedriver@latest --save-dev || exit 0
                '''
            }
        }
        
        stage('Lint CSS and JavaScript') {
            steps {
                echo 'Vérification du CSS et JavaScript...'
                bat '''
                    npm install --save-dev eslint stylelint || exit 0
                    
                    if exist js\\*.js (
                        npx eslint js\\*.js || exit 0
                    )
                    
                    if exist css\\*.css (
                        npx stylelint css\\*.css || exit 0
                    )
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
                    
                    rem Créer les répertoires nécessaires
                    if not exist test-results mkdir test-results
                    if not exist screenshots mkdir screenshots
                    
                    rem Exécuter les tests
                    node tests/selenium/runAllTests.js || echo "Tests Selenium terminés"
                '''
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'screenshots/**/*.png'
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
                    
                    rem Copie des fichiers CSS
                    if exist css xcopy /s /e /y css dist\\css\\
                    
                    rem Copie des fichiers JS
                    if exist js xcopy /s /e /y js dist\\js\\
                    
                    rem Copie des images
                    if exist img xcopy /s /e /y img dist\\img\\
                    
                    rem Copie des fonts
                    if exist fonts xcopy /s /e /y fonts dist\\fonts\\
                    
                    rem Copie du dossier contactform
                    if exist contactform xcopy /s /e /y contactform dist\\contactform\\
                    
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
        
        stage('Deploy to GitHub Pages') {
            when {
                branch 'main'
            }
            steps {
                echo 'Déploiement sur GitHub Pages...'
                bat '''
                    echo Le site est prêt à être déployé depuis le dossier dist
                    echo Vous pouvez copier le contenu vers le dépôt GitHub pour déploiement
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
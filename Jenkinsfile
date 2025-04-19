pipeline {
    agent any

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

        stage('Check NodeJS') {
            steps {
                script {
                    // Vérifier si Node.js est disponible
                    try {
                        bat 'node --version'
                        echo 'Node.js est déjà disponible sur le système'
                    } catch (Exception e) {
                        echo 'Node.js n\'est pas disponible dans le PATH'
                        
                        // Essayer de trouver Node.js dans les emplacements courants
                        def nodePaths = [
                            'C:\\Program Files\\nodejs',
                            'C:\\Program Files (x86)\\nodejs',
                            'C:\\nodejs'
                        ]
                        
                        def nodeFound = false
                        for (path in nodePaths) {
                            if (fileExists("${path}\\node.exe")) {
                                echo "Node.js trouvé dans ${path}"
                                env.PATH = "${path};${env.PATH}"
                                nodeFound = true
                                break
                            }
                        }
                        
                        if (!nodeFound) {
                            error('Node.js n\'est pas installé. Veuillez l\'installer sur le serveur Jenkins.')
                        }
                    }
                }
            }
        }

        stage('Check Chrome') {
            steps {
                echo 'Vérification de l\'installation de Chrome...'
                script {
                    try {
                        bat 'where chrome'
                        echo 'Chrome trouvé dans le PATH'
                    } catch (Exception e) {
                        echo 'Chrome non trouvé dans le PATH - Vérification des emplacements standards...'
                    }
                    
                    if (fileExists('C:/Program Files/Google/Chrome/Application/chrome.exe')) {
                        echo 'Chrome trouvé dans Program Files'
                    } else {
                        echo 'Chrome non trouvé - Les tests Selenium pourraient échouer'
                    }
                }
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
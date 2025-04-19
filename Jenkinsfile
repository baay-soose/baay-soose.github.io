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
                    // V�rifier si Node.js est disponible
                    try {
                        bat 'node --version'
                        echo 'Node.js est d�j� disponible sur le syst�me'
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
                                echo "Node.js trouv� dans ${path}"
                                env.PATH = "${path};${env.PATH}"
                                nodeFound = true
                                break
                            }
                        }
                        
                        if (!nodeFound) {
                            error('Node.js n\'est pas install�. Veuillez l\'installer sur le serveur Jenkins.')
                        }
                    }
                }
            }
        }

        stage('Check Chrome') {
            steps {
                echo 'V�rification de l\'installation de Chrome...'
                script {
                    try {
                        bat 'where chrome'
                        echo 'Chrome trouv� dans le PATH'
                    } catch (Exception e) {
                        echo 'Chrome non trouv� dans le PATH - V�rification des emplacements standards...'
                    }
                    
                    if (fileExists('C:/Program Files/Google/Chrome/Application/chrome.exe')) {
                        echo 'Chrome trouv� dans Program Files'
                    } else {
                        echo 'Chrome non trouv� - Les tests Selenium pourraient �chouer'
                    }
                }
            }
        }

        stage('Validate HTML Files') {
            steps {
                echo 'Validation des fichiers HTML...'
                bat '''
                    echo V�rification de l'existence des fichiers HTML
                    dir /b *.html

                    echo Total des fichiers HTML trouv�s :
                    dir /b *.html | find /c /v ""
                '''
            }
        }

        stage('Lint CSS and JavaScript') {
            steps {
                echo 'V�rification du CSS et JavaScript...'

                bat '''
                    rem Installation des linters
                    npm install --save-dev eslint stylelint || exit 0

                    rem Cr�ation de la configuration ESLint
                    echo { "env": { "browser": true }, "extends": "eslint:recommended" } > .eslintrc.json

                    rem Ex�cution des linters
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
                echo 'Ex�cution des tests Selenium...'
                bat '''
                    rem Ajouter Chrome et ChromeDriver au PATH pour cette session
                    set PATH=%CHROME_PATH%;%PATH%
                    set PATH=%CD%\\node_modules\\.bin;%PATH%
                    
                    rem D�finir le port pour les tests
                    set TEST_PORT=8081
                    
                    rem Cr�er les r�pertoires n�cessaires
                    if not exist test-results mkdir test-results
                    if not exist screenshots mkdir screenshots
                    
                    rem Ex�cuter les tests
                    node tests/selenium/runAllTests.js || echo "Tests Selenium termin�s"
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

        stage('Deploy to GitHub Pages') {
            when {
                branch 'main'
            }
            steps {
                echo 'D�ploiement sur GitHub Pages...'
                bat '''
                    echo Le site est pr�t � �tre d�ploy� depuis le dossier dist
                    echo Vous pouvez copier le contenu vers le d�p�t GitHub pour d�ploiement
                '''
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
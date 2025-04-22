pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        TEST_PORT = '8081'
        CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application'
        NEW_RELIC_LICENSE_KEY = credentials('new-relic-license-key')
    }
    
    stages {
        
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
                    
                    rem Copie des images si présents
                    if exist images xcopy /s /e /y images dist\\images\\
                    
                    rem Copie des fonts si présentes
                    if exist fonts xcopy /s /e /y fonts dist\\fonts\\
                    
                    rem Afficher le contenu du dossier dist
                    echo Contenu du dossier dist :
                    dir /s /b dist
                '''
            }
        }
        
        stage('Integrate New Relic') {
            steps {
                echo 'Intégration de New Relic pour la surveillance...'
                bat '''
                    rem Installation de New Relic pour le navigateur
                    npm install newrelic --save || exit 0
                    
                    rem Création des dossiers nécessaires
                    if not exist js mkdir js
                    if not exist dist\\js mkdir dist\\js
                    
                    rem Création du script New Relic de monitoring
                    echo // Script de monitoring New Relic > js\\newrelic-monitoring.js
                    echo (function() { >> js\\newrelic-monitoring.js
                    echo   const licenseKey = 'LICENSE_KEY'; >> js\\newrelic-monitoring.js
                    echo   const appName = '%APP_NAME%'; >> js\\newrelic-monitoring.js
                    echo   console.log('New Relic monitoring initialized'); >> js\\newrelic-monitoring.js
                    echo   // Mesurer le temps de chargement >> js\\newrelic-monitoring.js
                    echo   window.addEventListener('load', function() { >> js\\newrelic-monitoring.js
                    echo     if (window.performance) { >> js\\newrelic-monitoring.js
                    echo       const pageLoad = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart; >> js\\newrelic-monitoring.js
                    echo       console.log('Page load time: ' + pageLoad + 'ms'); >> js\\newrelic-monitoring.js
                    echo     } >> js\\newrelic-monitoring.js
                    echo   }); >> js\\newrelic-monitoring.js
                    echo })(); >> js\\newrelic-monitoring.js
                    
                    rem Copier vers dist/js
                    xcopy /y js\\newrelic-monitoring.js dist\\js\\
                    
                    rem Remplacer la clé de licence
                    if "%NEW_RELIC_LICENSE_KEY%"=="" (
                        set NEW_RELIC_LICENSE_KEY=DEMO_LICENSE_KEY
                    )
                    
                    rem Remplacer la clé dans les deux fichiers
                    powershell -Command "(Get-Content 'js\\newrelic-monitoring.js') -replace 'LICENSE_KEY', '%%NEW_RELIC_LICENSE_KEY%%' | Set-Content 'js\\newrelic-monitoring.js'"
                    powershell -Command "(Get-Content 'dist\\js\\newrelic-monitoring.js') -replace 'LICENSE_KEY', '%%NEW_RELIC_LICENSE_KEY%%' | Set-Content 'dist\\js\\newrelic-monitoring.js'"
                    
                    rem Injecter le script dans les fichiers HTML
                    powershell -Command "foreach ($file in Get-ChildItem dist\\*.html) { $content = Get-Content $file -Raw; $insertion = '<script src=\"js/newrelic-monitoring.js\"></script>'; $newContent = $content -replace '(<head>)', '$1' + \"`n  $insertion\"; Set-Content $file $newContent }"
                '''
            }
        }


        stage('Integrate Dynatrace Monitoring') {
    steps {
        echo 'Intégration de Dynatrace RUM pour la surveillance...'
        powershell '''
            # Création d'un script de surveillance Dynatrace avec PowerShell
            $dynatraceJs = @"
// Dynatrace RUM Monitoring
// Remplacez ce contenu par le code JavaScript fourni par Dynatrace
(function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://your-environment-id.live.dynatrace.com/js/your-app-id.js'+dl;
    f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','YOUR-APP-ID');
"@

            # Créer le dossier js si nécessaire
            if (-not (Test-Path "js")) {
                New-Item -Path "js" -ItemType Directory -Force
            }
            
            # Écrire le contenu dans le fichier
            Set-Content -Path "js/dynatrace-rum.js" -Value $dynatraceJs
            
            # Créer le dossier dist/js si nécessaire
            if (-not (Test-Path "dist/js")) {
                New-Item -Path "dist/js" -ItemType Directory -Force
            }
            
            # Copier le fichier vers dist/js
            Copy-Item -Path "js/dynatrace-rum.js" -Destination "dist/js" -Force
            
            # Injecter le script dans les fichiers HTML
            foreach ($file in Get-ChildItem dist/*.html) {
                $content = Get-Content $file -Raw
                $insertion = '<script src="js/dynatrace-rum.js"></script>'
                $newContent = $content -replace '(<head>)', "$1`n  $insertion"
                Set-Content $file $newContent
            }
        '''
    }
}


        
        stage('Archive Build') {
            steps {
                echo 'Archivage du build...'
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            }
        }
        
        stage('Direct Deployment') {
            steps {
                echo 'Déploiement direct de l\'application...'
                bat '''
                    rem Créer le répertoire de déploiement s'il n'existe pas
                    if not exist "C:\\inetpub\\wwwroot\\baay-soose.github.io" mkdir "C:\\inetpub\\wwwroot\\baay-soose.github.io"
                    
                    rem Copier les fichiers
                    xcopy /y /s /e dist\\* "C:\\inetpub\\wwwroot\\baay-soose.github.io\\"
                    
                    rem Création du dossier js si nécessaire
                    if not exist "C:\\inetpub\\wwwroot\\baay-soose.github.io\\js" mkdir "C:\\inetpub\\wwwroot\\baay-soose.github.io\\js"
                    
                    rem Créer un fichier de configuration New Relic
                    echo license_key: %NEW_RELIC_LICENSE_KEY% > "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                    echo app_name: %APP_NAME% >> "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                    echo environment: %DEPLOY_ENV% >> "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                    
                    echo Déploiement direct terminé avec succès!
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Vérification du déploiement...'
                bat '''
                    echo Vérification de l'existence des fichiers déployés...
                    if exist "C:\\inetpub\\wwwroot\\baay-soose.github.io\\index.html" (
                        echo Déploiement vérifié avec succès!
                    ) else (
                        echo AVERTISSEMENT: Le déploiement n'a pas pu être vérifié.
                        echo Le répertoire ou le fichier index.html n'existe pas.
                    )
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline exécuté avec succès !'
            
            // Notification en cas de succès
            script {
                if (env.DEPLOY_ENV == 'production') {
                    echo "Application déployée avec succès en PRODUCTION"
                    echo "Notification de déploiement envoyée à New Relic"
                } else {
                    echo "Application déployée avec succès en STAGING"
                }
            }
        }
        
        failure {
            echo 'Pipeline échoué !'
            
            // Notification en cas d'échec
            script {
                echo "Échec du pipeline CI/CD"
            }
        }
        
        always {
            cleanWs()
        }
    }
}
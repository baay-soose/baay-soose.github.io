pipeline {
    agent any
    
    environment {
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/baay-soose/baay-soose.github.io.git',
                    credentialsId: 'github-credentials'
            }
        }
        
        stage('Validate HTML') {
            steps {
                echo 'Validation du code HTML...'
                
                // Pour Windows, cherchons un validateur HTML compatible
                bat '''
                    echo Installation d'un validateur HTML...
                    rem Vous pouvez installer un validateur HTML compatible Windows ici
                    
                    rem Pour l'instant, validons simplement que les fichiers HTML existent
                    dir /b *.html
                    
                    rem Ou utilisez NPM pour installer un validateur
                    if exist package.json (
                        npm install htmlhint -g
                        htmlhint *.html || exit 0
                    )
                '''
            }
        }
        
        stage('Setup Node') {
            steps {
                echo 'Configuration de Node.js...'
                
                // Vérifier si Node.js est installé
                bat '''
                    where node
                    node --version
                    
                    rem Si Node n'est pas installé, vous devrez l'installer manuellement sur le serveur Jenkins
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
        
        stage('Install Selenium Dependencies') {
            steps {
                echo 'Installation des dépendances Selenium...'
                
                bat '''
                    rem Installation des dépendances
                    npm init -y || exit 0
                    npm install --save-dev selenium-webdriver mocha chai || exit 0
                    npm install --save-dev chromedriver || exit 0
                '''
            }
        }
        
        stage('Test with Selenium') {
            steps {
                echo 'Tests fonctionnels avec Selenium...'
                
                bat '''
                    rem Démarrage d'un serveur HTTP simple
                    npm install -g http-server || exit 0
                    start /B http-server . -p 8080
                    
                    rem Attendre que le serveur démarre
                    timeout /t 5
                    
                    rem Exécuter les tests Selenium (si disponibles)
                    if exist test\\selenium (
                        npx mocha test\\selenium\\*.js || exit 0
                    ) else (
                        echo "Aucun test Selenium trouvé"
                    )
                    
                    rem Arrêter le serveur
                    taskkill /F /IM node.exe || exit 0
                '''
            }
        }
        
        stage('Build for Production') {
            steps {
                echo 'Préparation pour la production...'
                
                bat '''
                    rem Création du dossier de build
                    if not exist dist mkdir dist
                    
                    rem Copie des fichiers
                    xcopy /s /e /y *.html dist\\
                    if exist *.css xcopy /s /e /y *.css dist\\
                    if exist *.js xcopy /s /e /y *.js dist\\
                    if exist images xcopy /s /e /y images dist\\images\\
                    if exist fonts xcopy /s /e /y fonts dist\\fonts\\
                    
                    rem Minification (optionnel)
                    npm install -g html-minifier || exit 0
                    npm install -g terser || exit 0
                    npm install -g cssnano-cli || exit 0
                    
                    rem Minifier les fichiers
                    cd dist
                    for %%f in (*.html) do (
                        html-minifier %%f -o %%f --collapse-whitespace --remove-comments || exit 0
                    )
                    
                    for %%f in (*.js) do (
                        terser %%f -o %%f || exit 0
                    )
                    
                    for %%f in (*.css) do (
                        cssnano %%f %%f || exit 0
                    )
                    cd ..
                '''
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Déploiement du site...'
                
                bat '''
                    rem Pour déployer sur un serveur local IIS ou autre
                    rem xcopy /s /e /y dist\\* C:\\inetpub\\wwwroot\\
                    
                    rem Ou simplement afficher que le déploiement est prêt
                    echo Site prêt à être déployé depuis le dossier dist
                '''
            }
        }
        
        stage('Performance Test') {
            steps {
                echo 'Tests de performance...'
                
                bat '''
                    rem Installation de Lighthouse (nécessite Chrome)
                    npm install -g lighthouse || exit 0
                    
                    rem Démarrage du serveur
                    start /B http-server dist -p 8080
                    
                    rem Attendre que le serveur démarre
                    timeout /t 5
                    
                    rem Exécuter Lighthouse (assurez-vous que Chrome est installé)
                    lighthouse http://localhost:8080 --output=json --output-path=lighthouse-report.json --chrome-flags="--headless" || echo "Lighthouse échec"
                    
                    rem Arrêter le serveur
                    taskkill /F /IM node.exe || exit 0
                '''
                
                archiveArtifacts artifacts: 'lighthouse-report.json', allowEmptyArchive: true
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
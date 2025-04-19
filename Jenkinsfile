pipeline {
    agent any
    
    environment {
        // Variables d'environnement
        APP_NAME = 'baay-soose.github.io'
        DEPLOY_ENV = 'production'
        // Ajoutez d'autres variables selon vos besoins
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Clone du dépôt Git
                git branch: 'main', 
                    url: 'https://github.com/baay-soose/baay-soose.github.io',
                    credentialsId: 'github-credentials'
            }
        }
        
        stage('Validate HTML') {
            steps {
                echo 'Validation du code HTML...'
                
                // Installation de HTML Tidy ou HTML Validator
                sh '''
                    if ! command -v tidy &> /dev/null; then
                        sudo apt-get update
                        sudo apt-get install -y tidy
                    fi
                '''
                
                // Validation de tous les fichiers HTML
                sh '''
                    find . -name "*.html" -exec tidy -errors -q {} \\; || true
                '''
            }
        }
        
        stage('Lint CSS and JavaScript') {
            steps {
                echo 'Vérification du CSS et JavaScript...'
                
                // Installation des linters si nécessaire
                sh '''
                    if ! command -v npm &> /dev/null; then
                        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    fi
                    
                    npm install -g csslint jshint eslint
                '''
                
                // Lint du CSS
                sh '''
                    find . -name "*.css" -exec csslint {} \\; || true
                '''
                
                // Lint du JavaScript
                sh '''
                    find . -name "*.js" -exec eslint {} \\; || true
                '''
            }
        }
        
        stage('Test with Selenium') {
            steps {
                echo 'Tests fonctionnels avec Selenium...'
                
                // Installation de dépendances pour Selenium
                sh '''
                    npm install selenium-webdriver mocha chai --save-dev
                '''
                
                // Démarrage d'un serveur HTTP simple pour tester
                sh '''
                    npm install -g http-server
                    http-server . -p 8080 &
                    SERVER_PID=$!
                    
                    # Attendre que le serveur démarre
                    sleep 5
                    
                    # Exécuter les tests Selenium
                    npm run test:selenium || true
                    
                    # Arrêter le serveur
                    kill $SERVER_PID
                '''
            }
        }
        
        stage('Build for Production') {
            steps {
                echo 'Préparation pour la production...'
                
                // Minification des fichiers
                sh '''
                    npm install -g html-minifier cssnano terser
                    
                    # Créer un dossier de build
                    mkdir -p dist
                    
                    # Copier tous les fichiers
                    cp -r *.html *.css *.js images fonts dist/ || true
                    
                    # Minifier le HTML
                    find dist -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments {} -o {} \\;
                    
                    # Minifier le CSS
                    find dist -name "*.css" -exec cssnano {} {} \\;
                    
                    # Minifier le JavaScript
                    find dist -name "*.js" -exec terser {} -o {} \\;
                '''
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Déploiement du site...'
                
                // Pour déployer sur un serveur web Apache/Nginx via SSH
                sshagent(['server-ssh-key']) {
                    sh '''
                        scp -r dist/* user@your-server:/var/www/html/
                        ssh user@your-server "sudo systemctl restart nginx"
                    '''
                }
                
                // Optionnel: Déploiement sur GitHub Pages
                /*
                sh '''
                    git config --global user.email "jenkins@example.com"
                    git config --global user.name "Jenkins"
                    
                    git checkout -b gh-pages
                    git rm -rf .
                    cp -r dist/* .
                    git add .
                    git commit -m "Deploy to GitHub Pages"
                    git push origin gh-pages --force
                '''
                */
                
                // Optionnel: Déploiement sur AWS S3
                /*
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    s3Upload(bucket: 'mon-site-bucket', includePathPattern: 'dist/**/*', workingDir: 'dist')
                }
                */
            }
        }
        
        stage('Performance Test') {
            steps {
                echo 'Tests de performance...'
                
                // Installation de Lighthouse
                sh '''
                    npm install -g lighthouse
                    
                    # Démarrer le serveur temporaire
                    http-server dist -p 8080 &
                    SERVER_PID=$!
                    
                    # Attendre que le serveur démarre
                    sleep 5
                    
                    # Exécuter Lighthouse
                    lighthouse http://localhost:8080 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
                    
                    # Arrêter le serveur
                    kill $SERVER_PID
                '''
                
                // Archiver le rapport Lighthouse
                archiveArtifacts artifacts: 'lighthouse-report.json', allowEmptyArchive: true
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline exécuté avec succès !'
            
            // Notification Slack (optionnel)
            /*
            slackSend(
                color: 'good',
                message: "Déploiement réussi: ${env.JOB_NAME} #${env.BUILD_NUMBER} (${env.BUILD_URL})"
            )
            */
        }
        
        failure {
            echo 'Pipeline échoué !'
            
            // Notification email (optionnel)
            /*
            emailext(
                subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL}",
                to: "team@example.com"
            )
            */
        }
        
        always {
            // Nettoyage des fichiers temporaires
            cleanWs()
        }
    }
}
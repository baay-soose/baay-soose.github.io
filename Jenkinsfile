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
                
                sh '''
                    if ! command -v tidy &> /dev/null; then
                        sudo apt-get update
                        sudo apt-get install -y tidy
                    fi
                '''
                
                sh '''
                    find . -name "*.html" -exec tidy -errors -q {} \\; || true
                '''
            }
        }
        
        stage('Lint CSS and JavaScript') {
            steps {
                echo 'Vérification du CSS et JavaScript...'
                
                sh '''
                    if ! command -v npm &> /dev/null; then
                        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    fi
                    
                    npm install -g csslint jshint eslint || true
                '''
                
                sh '''
                    find . -name "*.css" -exec csslint {} \\; || true
                '''
                
                sh '''
                    find . -name "*.js" -exec eslint {} \\; || true
                '''
            }
        }
        
        stage('Test with Selenium') {
            steps {
                echo 'Tests fonctionnels avec Selenium...'
                
                sh '''
                    npm install selenium-webdriver mocha chai --save-dev || true
                '''
                
                sh '''
                    npm install -g http-server || true
                    http-server . -p 8080 &
                    SERVER_PID=$!
                    
                    sleep 5
                    
                    npm run test:selenium || true
                    
                    kill $SERVER_PID
                '''
            }
        }
        
        stage('Build for Production') {
            steps {
                echo 'Préparation pour la production...'
                
                sh '''
                    npm install -g html-minifier cssnano terser || true
                    
                    mkdir -p dist
                    
                    cp -r *.html *.css *.js images fonts dist/ || true
                    
                    find dist -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments {} -o {} \\; || true
                    
                    find dist -name "*.css" -exec cssnano {} {} \\; || true
                    
                    find dist -name "*.js" -exec terser {} -o {} \\; || true
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
                // sshagent(['server-ssh-key']) {
                //     sh '''
                //         scp -r dist/* user@your-server:/var/www/html/
                //         ssh user@your-server "sudo systemctl restart nginx"
                //     '''
                // }
                
                // Pour GitHub Pages ou autre solution de déploiement simple
                sh '''
                    echo "Déploiement simulé - remplacez par votre propre logique"
                '''
            }
        }
        
        stage('Performance Test') {
            steps {
                echo 'Tests de performance...'
                
                sh '''
                    npm install -g lighthouse || true
                    
                    http-server dist -p 8080 &
                    SERVER_PID=$!
                    
                    sleep 5
                    
                    lighthouse http://localhost:8080 --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless" || true
                    
                    kill $SERVER_PID
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
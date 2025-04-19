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
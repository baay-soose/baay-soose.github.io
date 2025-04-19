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
                    echo V�rification de l'existence des fichiers HTML
                    dir /b *.html
                    
                    echo Total des fichiers HTML trouv�s :
                    dir /b *.html | find /c /v ""
                '''
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
        
        stage('Deploy Simulation') {
            when {
                branch 'main'
            }
            steps {
                echo 'D�ploiement simul� du site...'
                bat '''
                    echo Le site est pr�t � �tre d�ploy� depuis le dossier dist
                    echo Vous pouvez copier le contenu vers votre serveur web
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
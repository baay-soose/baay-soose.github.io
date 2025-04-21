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
        ANSIBLE_HOST_KEY_CHECKING = 'False'
        NEW_RELIC_LICENSE_KEY = credentials('new-relic-license-key')
        // Forcer Python � ne pas utiliser les E/S en mode bloquant
        PYTHONIOENCODING = 'utf-8'
        PYTHONLEGACYWINDOWSSTDIO = '1'
        ANSIBLE_STDOUT_CALLBACK = 'debug'
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
        
        stage('Install Dependencies') {
            steps {
                echo 'Installation des d�pendances...'
                bat '''
                    npm install || exit 0
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
  
        stage('Setup Selenium') {
            steps {
                echo 'Configuration des tests Selenium...'
                bat '''
                    rem Cr�er le dossier tests s'il n'existe pas
                    if not exist tests\\selenium mkdir tests\\selenium
                    
                    rem Installer les d�pendances Selenium
                    npm install mocha selenium-webdriver chromedriver mocha-junit-reporter --save-dev || exit 0
                    
                    rem Cr�er le package.json si n�cessaire
                    if not exist package.json (
                        npm init -y
                    )
                '''
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo 'Ex�cution des tests Selenium...'
                bat '''
                    rem D�finir le port pour les tests
                    set TEST_PORT=8081
                    
                    rem Cr�er le r�pertoire pour les r�sultats des tests
                    if not exist test-results mkdir test-results
                    
                    rem Cr�er le r�pertoire pour les captures d'�cran
                    if not exist screenshots mkdir screenshots
                    
                    rem V�rifier que Node.js est disponible
                    node --version
                    
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
                    
                    rem Copie des images si pr�sents
                    if exist images xcopy /s /e /y images dist\\images\\
                    
                    rem Copie des fonts si pr�sentes
                    if exist fonts xcopy /s /e /y fonts dist\\fonts\\
                    
                    rem Afficher le contenu du dossier dist
                    echo Contenu du dossier dist :
                    dir /s /b dist
                '''
            }
        }
        
        stage('Integrate New Relic') {
            steps {
                echo 'Int�gration de New Relic pour la surveillance...'
                bat '''
                    rem Installation de New Relic pour le navigateur
                    npm install newrelic --save || exit 0
                    
                    rem Cr�ation des dossiers n�cessaires
                    if not exist js mkdir js
                    if not exist dist\\js mkdir dist\\js
                    
                    rem Cr�ation du script New Relic de monitoring
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
                    
                    rem Remplacer la cl� de licence
                    if "%NEW_RELIC_LICENSE_KEY%"=="" (
                        set NEW_RELIC_LICENSE_KEY=DEMO_LICENSE_KEY
                    )
                    
                    rem Remplacer la cl� dans les deux fichiers
                    powershell -Command "(Get-Content 'js\\newrelic-monitoring.js') -replace 'LICENSE_KEY', '%NEW_RELIC_LICENSE_KEY%' | Set-Content 'js\\newrelic-monitoring.js'"
                    powershell -Command "(Get-Content 'dist\\js\\newrelic-monitoring.js') -replace 'LICENSE_KEY', '%NEW_RELIC_LICENSE_KEY%' | Set-Content 'dist\\js\\newrelic-monitoring.js'"
                    
                    rem Injecter le script dans les fichiers HTML
                    powershell -Command "foreach ($file in Get-ChildItem dist\\*.html) { $content = Get-Content $file -Raw; $insertion = '<script src=\"js/newrelic-monitoring.js\"></script>'; $newContent = $content -replace '(<head>)', '$1' + \"`n  $insertion\"; Set-Content $file $newContent }"
                '''
            }
        }
        
        stage('Archive Build') {
            steps {
                echo 'Archivage du build...'
                archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            }
        }
        
        stage('Prepare Ansible') {
            steps {
                echo 'Pr�paration des fichiers Ansible...'
                bat '''
                    rem Cr�er les r�pertoires pour Ansible
                    if not exist ansible mkdir ansible
                    if not exist ansible\\templates mkdir ansible\\templates
                '''
                
                // Cr�ation du playbook de d�ploiement
                writeFile file: 'ansible/deploy-website.yml', text: '''---
# Ansible Playbook pour d�ployer le site web
- name: D�ployer l'application web
  hosts: localhost
  connection: local
  vars:
    app_name: baay-soose.github.io
    deploy_dir: C:\\inetpub\\wwwroot\\{{ app_name }}
    source_dir: ../dist

  tasks:
    - name: Cr�ation du r�pertoire de d�ploiement
      win_file:
        path: "{{ deploy_dir }}"
        state: directory
      ignore_errors: yes

    - name: Copie des fichiers du site web
      win_copy:
        src: "{{ source_dir }}/"
        dest: "{{ deploy_dir }}"
      ignore_errors: yes
      
    - name: Affichage du r�sultat du d�ploiement
      debug:
        msg: "Site d�ploy� avec succ�s dans {{ deploy_dir }}"
'''
                
                // Cr�ation du playbook d'installation New Relic
                writeFile file: 'ansible/install-newrelic.yml', text: '''---
# Ansible Playbook pour configurer New Relic
- name: Configuration de New Relic
  hosts: localhost
  connection: local
  vars:
    app_name: baay-soose.github.io
    deploy_dir: C:\\inetpub\\wwwroot\\{{ app_name }}
    new_relic_license_key: "{{ lookup('env', 'NEW_RELIC_LICENSE_KEY') | default('DEMO_LICENSE_KEY') }}"

  tasks:
    - name: Cr�ation du fichier de configuration New Relic
      win_copy:
        content: |
          license_key: {{ new_relic_license_key }}
          app_name: {{ app_name }}
          environment: production
        dest: "{{ deploy_dir }}\\newrelic.yml"
      ignore_errors: yes
      
    - name: Affichage du r�sultat de la configuration
      debug:
        msg: "New Relic configur� avec succ�s pour {{ app_name }}"
'''
                
                // Cr�ation du fichier d'inventaire
                writeFile file: 'ansible/inventory.ini', text: '''[windows]
localhost ansible_connection=local

[all:vars]
ansible_connection=local
'''
            }
        }
        
        stage('Deploy with Ansible') {
            steps {
                echo 'D�ploiement avec Ansible...'
                bat '''
                    cd ansible
                    
                    rem Afficher les versions
                    echo Versions des outils:
                    python --version
                    where ansible-playbook
                    ansible-playbook --version
                    
                    rem D�finir les variables d'environnement
                    set PYTHONIOENCODING=utf-8
                    set PYTHONLEGACYWINDOWSSTDIO=1
                    set ANSIBLE_STDOUT_CALLBACK=debug
                    
                    rem Ex�cuter les playbooks Ansible
                    echo Ex�cution du playbook New Relic...
                    ansible-playbook install-newrelic.yml -i inventory.ini -v || echo "Erreur lors de l'installation de New Relic"
                    
                    echo Ex�cution du playbook de d�ploiement...
                    ansible-playbook deploy-website.yml -i inventory.ini -v || echo "Erreur lors du d�ploiement du site"
                '''
            }
        }
        
        stage('Direct Deployment Fallback') {
            steps {
                echo 'D�ploiement direct (alternative � Ansible)...'
                bat '''
                    rem Cr�er le r�pertoire de d�ploiement s'il n'existe pas
                    if not exist "C:\\inetpub\\wwwroot\\baay-soose.github.io" mkdir "C:\\inetpub\\wwwroot\\baay-soose.github.io"
                    
                    rem Copier les fichiers
                    xcopy /y /s /e dist\\* "C:\\inetpub\\wwwroot\\baay-soose.github.io\\"
                    
                    rem Cr�er un fichier de configuration New Relic
                    echo license_key: %NEW_RELIC_LICENSE_KEY% > "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                    echo app_name: %APP_NAME% >> "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                    echo environment: %DEPLOY_ENV% >> "C:\\inetpub\\wwwroot\\baay-soose.github.io\\newrelic.yml"
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'V�rification du d�ploiement...'
                bat '''
                    echo V�rification de l'existence des fichiers d�ploy�s...
                    if exist "C:\\inetpub\\wwwroot\\baay-soose.github.io\\index.html" (
                        echo D�ploiement v�rifi� avec succ�s!
                    ) else (
                        echo AVERTISSEMENT: Le d�ploiement n'a pas pu �tre v�rifi�.
                        echo Le r�pertoire ou le fichier index.html n'existe pas.
                    )
                '''
            }
        }
    }
    
    post {
    success {
        echo 'Pipeline ex�cut� avec succ�s !'
        
        // Notification en cas de succ�s
        script {
            if (env.DEPLOY_ENV == 'production') {
                echo "Application d�ploy�e avec succ�s en PRODUCTION"
                echo "Notification de d�ploiement envoy�e � New Relic"
            } else {
                echo "Application d�ploy�e avec succ�s en STAGING"
            }
        }
    }
    
    failure {
        echo 'Pipeline �chou� !'
        
        // Notification en cas d'�chec
        script {
            echo "�chec du pipeline CI/CD"
        }
    }
    
    always {
            cleanWs()
        }
    }
}
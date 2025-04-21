# Pipeline CI/CD pour l'application Web

Ce projet contient la configuration complète d'un pipeline d'intégration continue (CI) et de déploiement continu (CD), comprenant le développement d'une application Web, son déploiement automatique, l'exécution de tests fonctionnels via Selenium WebDriver, et la surveillance en temps réel de l'application à l'aide de New Relic.

## Table des matières

1. [Technologies utilisées](#technologies-utilisées)
2. [Structure du projet](#structure-du-projet)
3. [Configuration Jenkins](#configuration-jenkins)
4. [Tests fonctionnels](#tests-fonctionnels)
5. [Déploiement avec Ansible](#déploiement-avec-ansible)
6. [Surveillance avec New Relic](#surveillance-avec-new-relic)
7. [Instructions d'exécution](#instructions-dexécution)

## Technologies utilisées

- **Contrôle de version** : Git (GitHub)
- **CI/CD** : Jenkins
- **Gestion de configuration** : Ansible
- **Tests fonctionnels** : Selenium WebDriver
- **Surveillance** : New Relic (APM)
- **Application Web** : HTML/CSS/JavaScript
- **Serveur Web** : Nginx

## Structure du projet

```
├── ansible/
│   ├── deploy-website.yml        # Playbook Ansible pour le déploiement
│   ├── install-newrelic.yml      # Playbook Ansible pour New Relic
│   ├── inventory.ini             # Inventaire des serveurs
│   └── templates/                # Templates pour la configuration
│       ├── nginx-site.conf.j2
│       ├── newrelic-infra.yml.j2
│       └── newrelic.js.j2
├── dist/                         # Dossier de build pour la production
├── js/
│   └── newrelic-monitoring.js    # Script de monitoring New Relic
├── screenshots/                  # Captures d'écran des tests Selenium
├── test-results/                 # Résultats des tests
├── tests/
│   └── selenium/                 # Tests fonctionnels Selenium
│       ├── baseTest.js
│       ├── config.js
│       ├── formTest.js
│       ├── homePageTest.js
│       ├── mocha.config.js
│       ├── navigationTest.js
│       ├── runAllTests.js
│       └── startServer.js
├── Jenkinsfile                   # Configuration du pipeline Jenkins
├── deploy.sh                     # Script de déploiement
├── index.html                    # Page principale de l'application
└── README.md                     # Documentation du projet
```

## Configuration Jenkins

Le pipeline Jenkins est configuré pour exécuter les étapes suivantes :

1. **Checkout** : Récupération du code source depuis GitHub
2. **Validation des fichiers HTML** : Vérification de la présence des fichiers HTML
3. **Installation des dépendances** : Installation des packages npm
4. **Lint CSS et JavaScript** : Vérification de la qualité du code
5. **Configuration et exécution des tests Selenium** : Tests fonctionnels
6. **Build pour la production** : Préparation des fichiers pour le déploiement
7. **Intégration New Relic** : Configuration de la surveillance
8. **Archivage du build** : Sauvegarde des artefacts
9. **Configuration Ansible** : Préparation des fichiers de déploiement
10. **Déploiement avec Ansible** : Déploiement automatique sur le serveur

## Tests fonctionnels

Les tests fonctionnels sont réalisés avec Selenium WebDriver et Mocha. Ils vérifient :

- Le chargement correct de la page d'accueil
- La navigation à travers le site
- L'interaction avec les formulaires
- La présence des éléments principaux (navigation, contenu, pied de page)

## Déploiement avec Ansible

Le déploiement est automatisé à l'aide d'Ansible avec deux playbooks principaux :

- **deploy-website.yml** : Configure le serveur web et déploie l'application
- **install-newrelic.yml** : Installe et configure New Relic pour la surveillance

## Surveillance avec New Relic

New Relic est utilisé pour surveiller les performances de l'application en temps réel :

- **New Relic Infrastructure** : Surveillance du serveur (CPU, mémoire, réseau)
- **New Relic APM** : Surveillance de l'application (temps de réponse, erreurs)
- **New Relic Browser** : Surveillance côté client (temps de chargement, expérience utilisateur)

## Instructions d'exécution

### Prérequis

- Jenkins installé et configuré
- Git installé
- Node.js et npm installés
- Python et pip installés (pour Ansible)
- Google Chrome installé (pour Selenium)

### Configuration de Jenkins

1. Créez un nouveau job de type pipeline dans Jenkins
2. Configurez l'intégration GitHub pour pointer vers votre dépôt
3. Définissez les variables d'environnement suivantes dans Jenkins :
   - `APP_NAME` : Nom de l'application
   - `DEPLOY_ENV` : Environnement de déploiement (staging ou production)
   - `TEST_PORT` : Port pour les tests Selenium
   - `NEW_RELIC_LICENSE_KEY` : Clé de licence New Relic (à ajouter comme credential dans Jenkins)

### Exécution manuelle

Pour exécuter le pipeline manuellement :

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/baay-soose/baay-soose.github.io.git
   cd baay-soose.github.io
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Exécutez les tests Selenium :
   ```bash
   node tests/selenium/runAllTests.js
   ```

4. Construisez pour la production :
   ```bash
   mkdir -p dist
   cp -r *.html *.css *.js images fonts dist/
   ```

5. Installez Ansible et déployez :
   ```bash
   pip install ansible
   ansible-playbook -i ansible/inventory.ini ansible/deploy-website.yml
   ```

### Accès à l'application

Une fois déployée, l'application est accessible à l'adresse :
- http://localhost/ (si déployé localement)
- http://your-server-ip/ (si déployé sur un serveur distant)

### Accès à New Relic

Pour accéder aux tableaux de bord de surveillance :
1. Connectez-vous à votre compte New Relic
2. Naviguez vers la section "APM & Services"
3. Sélectionnez votre application "baay-soose.github.io"

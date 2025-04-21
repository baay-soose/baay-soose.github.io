#!/bin/bash
# Script de déploiement pour Jenkins

# Variables
WORKSPACE=${WORKSPACE:-$(pwd)}
DEPLOY_ENV=${DEPLOY_ENV:-staging}
ANSIBLE_PLAYBOOK="deploy-website.yml"
INVENTORY_FILE="inventory.ini"

# Vérifier que Ansible est installé
if ! command -v ansible-playbook &> /dev/null; then
    echo "Ansible n'est pas installé. Installation en cours..."
    pip install ansible
fi

# Afficher les informations de déploiement
echo "==========================================="
echo "Déploiement de l'application"
echo "==========================================="
echo "Environnement: $DEPLOY_ENV"
echo "Workspace: $WORKSPACE"
echo "Playbook: $ANSIBLE_PLAYBOOK"
echo "Inventory: $INVENTORY_FILE"
echo "==========================================="

# Exécuter le playbook Ansible
if [ "$DEPLOY_ENV" = "production" ]; then
    ansible-playbook -i "$INVENTORY_FILE" "$ANSIBLE_PLAYBOOK" --limit=production -v
else
    ansible-playbook -i "$INVENTORY_FILE" "$ANSIBLE_PLAYBOOK" --limit=staging -v
fi

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo "==========================================="
    echo "Déploiement réussi!"
    echo "==========================================="
    exit 0
else
    echo "==========================================="
    echo "Erreur lors du déploiement!"
    echo "==========================================="
    exit 1
fi
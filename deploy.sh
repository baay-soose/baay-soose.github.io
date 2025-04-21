#!/bin/bash
# Script de d�ploiement pour Jenkins

# Variables
WORKSPACE=${WORKSPACE:-$(pwd)}
DEPLOY_ENV=${DEPLOY_ENV:-staging}
ANSIBLE_PLAYBOOK="deploy-website.yml"
INVENTORY_FILE="inventory.ini"

# V�rifier que Ansible est install�
if ! command -v ansible-playbook &> /dev/null; then
    echo "Ansible n'est pas install�. Installation en cours..."
    pip install ansible
fi

# Afficher les informations de d�ploiement
echo "==========================================="
echo "D�ploiement de l'application"
echo "==========================================="
echo "Environnement: $DEPLOY_ENV"
echo "Workspace: $WORKSPACE"
echo "Playbook: $ANSIBLE_PLAYBOOK"
echo "Inventory: $INVENTORY_FILE"
echo "==========================================="

# Ex�cuter le playbook Ansible
if [ "$DEPLOY_ENV" = "production" ]; then
    ansible-playbook -i "$INVENTORY_FILE" "$ANSIBLE_PLAYBOOK" --limit=production -v
else
    ansible-playbook -i "$INVENTORY_FILE" "$ANSIBLE_PLAYBOOK" --limit=staging -v
fi

# V�rifier le r�sultat
if [ $? -eq 0 ]; then
    echo "==========================================="
    echo "D�ploiement r�ussi!"
    echo "==========================================="
    exit 0
else
    echo "==========================================="
    echo "Erreur lors du d�ploiement!"
    echo "==========================================="
    exit 1
fi
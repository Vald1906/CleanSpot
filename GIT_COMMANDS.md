# Historique des commandes Git - CleanSpot

Voici la liste des commandes Git utilisées pour la gestion des branches `event` et `dev` :

## 1. Création et travail sur la branche `event`
```bash
# Vérification de l'état initial
git status && git branch

# Création de la branche 'event' et indexation des fichiers
git checkout -b event && git add .

# Correction (retrait d'un fichier indésirable) et commit
git reset build_log.txt
git commit -m "feat: harmonisation graphique de la page event, sidebar de filtres et correction des couleurs"

# Envoi vers le dépôt distant
git push origin event
```

## 2. Fusion vers la branche `dev`
```bash
# Vérification des branches existantes
git branch -a

# Basculement sur master et création de la branche 'dev' à partir de master
git checkout master
git checkout -b dev

# Fusion des changements de la branche 'event' dans 'dev' (Fast-forward)
git merge event

# Envoi de la branche 'dev' vers le dépôt distant
git push origin dev
```

> [!NOTE]  
> En cas d'erreur de connexion DNS (`Could not resolve host: github.com`), les commandes de `push` ont été relancées jusqu'au succès.

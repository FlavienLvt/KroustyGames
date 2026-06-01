# Utiliser une image Node.js comme base
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (y compris devDependencies)
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port utilisé par le serveur backend
EXPOSE 5000

# Commande pour démarrer le serveur backend
CMD ["npm", "run", "dev"]
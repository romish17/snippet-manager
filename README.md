# 📝 DevSnippet Manager

Une application moderne de gestion de snippets de code, prompts IA, clés de registre Windows et notes en Markdown. Interface élégante avec thèmes personnalisables et architecture full-stack avec React et MySQL.

## ✨ Fonctionnalités

- **📋 Gestion de Snippets**: Stockez et organisez vos snippets de code avec coloration syntaxique
- **🤖 Prompts IA**: Gérez vos prompts pour les LLMs
- **🔧 Registre Windows**: Stockez et exportez des clés de registre (.reg, .ps1, .bat)
- **📓 Notes Markdown**: Créez et organisez vos notes
- **🎨 Thèmes**: 3 thèmes disponibles (Standard, Syntax, Cyberpunk 2077)
- **🔍 Recherche**: Recherche instantanée dans tous vos snippets
- **📦 Export**: Exportation individuelle ou par lot
- **🔒 Mode Admin**: Protection des modifications avec mode visualisation seule
- **🎯 Tags**: Organisation par tags personnalisés
- **💾 Base de données**: Persistence avec MySQL

## 🚀 Démarrage rapide avec Docker

### Prérequis

- Docker
- Docker Compose

### Installation

1. Clonez le repository:
```bash
git clone <your-repo-url>
cd snippet-manager
```

2. Lancez l'application avec Docker Compose:
```bash
docker-compose up -d
```

3. Accédez à l'application:
```
http://localhost:3000
```

L'application démarre avec:
- **Frontend + Backend**: Port 3000
- **MySQL**: Port 3306 (accessible localement si besoin)

### Arrêter l'application

```bash
docker-compose down
```

### Arrêter et supprimer les données

```bash
docker-compose down -v
```

## 🛠️ Développement local (sans Docker)

### Prérequis

- Node.js 18+
- MySQL 8.0+

### Installation

1. Installez les dépendances:
```bash
npm install
```

2. Configurez la base de données MySQL:
```sql
CREATE DATABASE devsnippets;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON devsnippets.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

3. Créez un fichier `.env` (optionnel):
```env
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=devsnippets
```

4. Lancez le mode développement:
```bash
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend
npm start
```

5. Accédez à l'application:
```
http://localhost:5173 (dev) ou http://localhost:3000 (production)
```

### Build pour la production

```bash
npm run build
npm start
```

## 📚 Structure du projet

```
snippet-manager/
├── components/          # Composants React
│   ├── EditModal.tsx   # Modal d'édition
│   ├── ViewModal.tsx   # Modal de visualisation
│   ├── ItemCard.tsx    # Carte d'affichage snippet
│   └── ItemListView.tsx # Vue liste
├── services/           # Services
│   ├── storageService.ts    # Gestion du storage
│   └── exportService.ts     # Export de fichiers
├── server.js           # Serveur Express + API
├── App.tsx             # Composant principal
├── types.ts            # Types TypeScript
├── constants.ts        # Constantes
├── Dockerfile          # Configuration Docker
└── docker-compose.yml  # Orchestration Docker
```

## 🎨 Thèmes disponibles

- **Standard**: Thème sombre classique
- **Syntax**: Inspiré des éditeurs de code
- **Cyberpunk 2077**: Style futuriste avec couleurs néon

## 🔐 Mode Admin

- **Vue seule**: Visualisation et copie uniquement
- **Mode Admin**: Création, édition et suppression d'éléments

Cliquez sur l'icône 👁️/🛡️ dans la navbar pour basculer entre les modes.

## 📦 Export de données

### Snippets de code et prompts
- Export individuel en fichier .txt ou .md
- Export multiple en archive .zip

### Clés de registre Windows
- Export en .reg (Windows Registry Editor)
- Export en .ps1 (PowerShell script)
- Export en .bat (Batch script)

## 🗄️ API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/items` | Récupère tous les snippets |
| POST | `/api/sync` | Synchronise tous les snippets |

## 🔧 Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DB_HOST` | `localhost` | Hôte MySQL |
| `DB_USER` | `root` | Utilisateur MySQL |
| `DB_PASSWORD` | `` | Mot de passe MySQL |
| `DB_NAME` | `devsnippets` | Nom de la base |

## 🐳 Configuration Docker

### docker-compose.yml

Le fichier configure:
- Service `app`: Application Node.js (port 3000)
- Service `db`: MySQL 8.0 (port 3306)
- Volume persistant pour les données MySQL

### Rebuild après modifications

```bash
docker-compose up -d --build
```

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

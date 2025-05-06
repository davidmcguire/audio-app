# Audio App Development Workflow

Welcome to the Audio App project! This guide will walk you through the basic steps to make changes, test them locally, and share them with the team. This guide is designed to be friendly for beginners with minimal coding experience.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

1.  **Git:** For version control. [Installation Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
    - After installation, verify it works by opening your terminal/command prompt and typing: `git --version`
    - You should see a version number like `git version 2.40.0`

2.  **Docker Desktop:** For running the application locally in containers. [Installation Guide](https://www.docker.com/products/docker-desktop/)
    - After installation, verify by running: `docker --version` and `docker compose version`
    - Make sure Docker Desktop application is running (check for its icon in your taskbar/menu bar)

3.  **A Code Editor:** Such as VS Code, Sublime Text, or Atom.
    - For beginners, VS Code is recommended: [Download VS Code](https://code.visualstudio.com/)

4.  **A GitHub Account:** You'll need this to access the repository and submit changes.
    - [Sign up for GitHub](https://github.com/signup) if you don't have an account

## Development Steps

Follow these steps to contribute to the project:

### 1. Clone the Repository (First Time Only)

If you haven't already downloaded the code to your computer, you'll need to clone it from GitHub:

```bash
# Clone the repository (SSH method - requires SSH key setup)
git clone git@github.com:davidmcguire/audio-app.git

# Navigate to the project directory
cd audio-app
```

If you're new to Git, the HTTPS method is simpler (you'll be prompted for your GitHub username and password):

```bash
# Clone with HTTPS (recommended for beginners)
git clone https://github.com/davidmcguire/audio-app.git

# Navigate to the project directory
cd audio-app
```

### 2. Set Up Environment Files

Before going further, you need to set up environment files that contain configuration settings for the application:

#### Server Environment (.env file):

1. Navigate to the server directory: `cd server`
2. Create a file named exactly `.env` (including the dot)
3. Add the following content to the file:

```
NODE_ENV=development
PORT=5001
MONGODB_URI=your_mongodb_connection_string
# Add other variables your application needs (check server.js or existing .env.example)
```

- **Important for MongoDB:** If you don't have a MongoDB connection string, you can:
  - Use MongoDB Atlas (free tier): [Sign up here](https://www.mongodb.com/cloud/atlas/register)
  - Create a new cluster and get a connection string that looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
  - Replace the placeholder in your `.env` file

4. Return to the project root: `cd ..`

#### Client Environment (if needed):

If your frontend needs environment variables:

1. Navigate to the client directory: `cd client`
2. Create a file named `.env`
3. Add any variables the frontend needs, for example:
```
REACT_APP_API_URL=http://localhost:5001/api
```
4. Return to the project root: `cd ..`

### 3. Get the Latest Code

Before making any changes, ensure you have the most up-to-date version of the code:

```bash
# Make sure you are on the main branch
# The "main branch" is the primary version of the code
git checkout main

# Pull the latest changes from the remote repository
git pull origin main
```

*(If you are working on a feature, you might be on a different branch, e.g., `git checkout my-feature-branch` and `git pull origin my-feature-branch`)*

### 4. Create a New Branch (Optional but Recommended)

Creating a branch lets you make changes without affecting the main code, like working on a separate copy.

```bash
# Create a new branch named something descriptive (e.g., add-user-profile)
git checkout -b your-branch-name
```

For example: `git checkout -b fix-login-button`

### 5. Make Your Code Changes

Open the project in your code editor and make the necessary changes to the files.

*   The **frontend (client)** code is in the `client/` directory. This controls what users see in their browser.
*   The **backend (server)** code is in the `server/` directory. This handles data processing and database operations.

**Tip for beginners:** 
- To open the project in VS Code, you can use: `code .` from the project root in terminal
- Make small, focused changes and test frequently
- Take notes about what you changed in case you need to explain it later

### 6. Test Your Changes Locally with Docker Compose

After making your changes, you need to test them locally to ensure everything works as expected.

1.  **Build and Run the Application:**
    Open your terminal, navigate to the root directory of the project (where the `docker-compose.yml` file is), and run:

    ```bash
    docker compose up --build
    ```
    *   `--build`: This flag tells Docker Compose to rebuild the Docker images if any code or Dockerfile changes were made. This is important to pick up your new code.
    *   You can add `-d` (`docker compose up --build -d`) to run the containers in the background.

    **Note:** The first build may take several minutes as it downloads and installs all dependencies.

2.  **Access the Application:**
    *   Open your web browser and go to `http://localhost` (or `http://localhost:80`).
    *   The **backend API** will be running on `http://localhost:5001`.

3.  **Check Logs:**
    If something isn't working, check the logs from the containers:

    ```bash
    # View logs for all services (press Ctrl+C to stop watching logs)
    docker compose logs -f

    # View logs for a specific service (e.g., server)
    docker compose logs -f server
    ```

4.  **Stop the Application:**
    When you're done testing, stop the containers:

    ```bash
    # If running in the foreground (without -d), press Ctrl+C in the terminal.
    # If running in the background (with -d), run:
    docker compose down
    ```

### 7. Commit Your Changes

Once you are happy with your changes and have tested them, it's time to commit them to Git.

1.  **Stage Your Changes:**
    Add the files you've changed to the staging area.

    ```bash
    # Check which files you've changed
    git status

    # Add specific files
    git add client/src/App.js server/routes/users.js

    # Or add all changed files (use with caution, review changes first)
    git add .
    ```

2.  **Commit the Changes:**
    Write a clear and concise commit message describing what you did.

    ```bash
    git commit -m "Add feature X for user profiles"
    ```
    *   Example good commit message: `feat: Add user login functionality`
    *   Example good commit message: `fix: Correct calculation error in payment module`

### 8. Push Your Changes to GitHub

Now, share your committed changes with the remote repository on GitHub.

```bash
# Push your branch to the remote repository (origin)
git push origin your-branch-name
```

For example: `git push origin fix-login-button`

If this is your first time pushing to GitHub, you may be prompted to log in.

### 9. Create a Pull Request (PR)

A Pull Request is how you ask project maintainers to review and merge your changes into the main codebase.

1. Go to the GitHub repository in your web browser: `https://github.com/davidmcguire/audio-app`
2. You should see a banner about your recently pushed branch with a "Compare & pull request" button. Click it.
3. If you don't see the banner, click the "Pull requests" tab, then click "New pull request"
4. Select your branch from the dropdown menu to compare with the main branch.
5. Give your PR a clear title and description that explains:
   - What changes you made
   - Why you made them
   - How to test them
6. Click "Create pull request"

Your changes will then be reviewed, and once approved, they can be merged into the main codebase.

## Troubleshooting Common Issues

### Environment File Issues
- **Problem:** The application can't find environment variables
- **Solution:** Double-check that:
  - Your `.env` files exist in the right locations (server/.env, client/.env)
  - The file names include the dot (`.env` not just `env`)
  - Environment variables are named exactly as expected (check the application code)

### Docker Issues
* **Permission Denied?** If you get permission errors running Docker commands on Linux, you might need to add your user to the `docker` group or run commands with `sudo` (not recommended for daily use).
* **Port Conflicts?** If `docker compose up` fails because a port is already in use, make sure no other applications on your computer are using ports 80 or 5001. You can change the port mappings in the `docker-compose.yml` file if needed (e.g., `"8080:80"`).
* **Old Containers/Images?** Sometimes, Docker can have old or corrupted containers/images. You can try cleaning them up:
  ```bash
  docker compose down --volumes # Stop and remove containers, networks, and volumes
  docker system prune --force # Remove unused Docker artifacts (use with caution!)
  ```
* **"Cannot connect to the Docker daemon":** Make sure Docker Desktop is running.

### Git Issues
* **"fatal: not a git repository":** Make sure you're in the correct directory.
* **Merge conflicts:** If Git says you have conflicts, you need to resolve them manually. Ask for help or look up guides on resolving Git conflicts.

That's it! Happy coding! If you get stuck, don't hesitate to ask for help from other team members.

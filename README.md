# Health Tracker — Multi-Version DevOps Deployment (v1, v2, v3)

**Student Register Number:** `24MIS0130`  
**Topic:** `Health Tracker`  
**Reference:** Lab Allotment Document (Page 1)

---

## 📋 Project Specifications & Version Breakdown

| Version | Feature Name | Description | Localhost Port | NodePort | Docker Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **v1** | **Enter Data** | Input patient biometric values (Heart Rate, Systolic/Diastolic BP, Glucose, Steps, Temperature) with validation and instant feedback. | `http://localhost:8081` | `30001` | `24mis0130/health-tracker:v1` |
| **v2** | **View** | Display historical records ledger, real-time search/filter, delete action, and quick health metric summary cards. | `http://localhost:8082` | `30002` | `24mis0130/health-tracker:v2` |
| **v3** | **Chart** | Show simple time-series interactive graphs (Heart Rate, Blood Pressure trends, Daily Steps) with clinical indicator evaluations. | `http://localhost:8083` | `30003` | `24mis0130/health-tracker:v3` |

---

## 🏗️ Architecture & DevOps Workflow

```
[ VS Code (Local Development) ]
        │
        ├── Branch: v1  ──> feat(v1): Enter Data (Input health values)
        ├── Branch: v2  ──> feat(v2): View (Display records)
        ├── Branch: v3  ──> feat(v3): Chart (Show simple graph)
        └── Branch: main ──> Complete DevOps Suite
                 │
                 ▼
        [ GitHub Repository ]
                 │ (Webhook / Poll SCM)
                 ▼
        [ Jenkins CI/CD Pipeline ]
                 │
                 ├── Stage 1: Checkout Source Code
                 ├── Stage 2: Quality & Smoke Tests
                 ├── Stage 3: Docker Build (v1, v2, v3)
                 ├── Stage 4: DockerHub Push (Tagged v1, v2, v3)
                 └── Stage 5: Deploy to Kubernetes Cluster
                             │
                             ▼
                 [ Kubernetes Cluster ]
                 ├── Deployment 1: health-tracker-v1 (Port 8081 / NodePort 30001)
                 ├── Deployment 2: health-tracker-v2 (Port 8082 / NodePort 30002)
                 └── Deployment 3: health-tracker-v3 (Port 8083 / NodePort 30003)
```

---

## 🚀 Step-by-Step Implementation Guide

### Step 1: Open and Develop in VS Code
1. Open Visual Studio Code.
2. Open this project directory:
   ```bash
   code /Users/abijithpa/.gemini/antigravity/scratch/health-tracker-24MIS0130
   ```
3. The directory structure is organized as:
   ```
   health-tracker-24MIS0130/
   ├── versions/
   │   ├── v1/                # v1: Enter Data
   │   ├── v2/                # v2: View Records
   │   └── v3/                # v3: Chart & Graphs
   ├── k8s/                   # Kubernetes Manifests
   │   ├── v1-manifest.yaml
   │   ├── v2-manifest.yaml
   │   ├── v3-manifest.yaml
   │   └── health-tracker-all.yaml
   ├── scripts/               # Automation scripts
   ├── docker-compose.yml     # Local multi-version runner
   ├── Jenkinsfile            # Jenkins Declarative Pipeline
   └── README.md
   ```

---

### Step 2: Push to GitHub with Separate Branches / Commits
The repository is already initialized with distinct commits and branches (`v1`, `v2`, `v3`, `main`).

To connect to your GitHub repository:
```bash
# 1. Create a repository on GitHub (e.g., named 'health-tracker-24MIS0130')
# 2. Add your GitHub remote:
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/health-tracker-24MIS0130.git

# 3. Push all branches to GitHub:
git push -u origin v1
git push -u origin v2
git push -u origin v3
git push -u origin main
```

---

### Step 3: Containerize Using Docker (Tagged v1, v2, v3)

You can build and tag the Docker images using the provided script or standard Docker commands:

#### Option A: Using the Automated Script
```bash
./scripts/build-and-run-docker.sh <YOUR_DOCKERHUB_USERNAME>
```

#### Option B: Manual Docker Commands
```bash
# Build & tag v1
docker build -t <YOUR_DOCKERHUB_USERNAME>/health-tracker:v1 -f versions/v1/Dockerfile versions/v1

# Build & tag v2
docker build -t <YOUR_DOCKERHUB_USERNAME>/health-tracker:v2 -f versions/v2/Dockerfile versions/v2

# Build & tag v3
docker build -t <YOUR_DOCKERHUB_USERNAME>/health-tracker:v3 -f versions/v3/Dockerfile versions/v3
```

---

### Step 4: Push Images to DockerHub

```bash
# 1. Login to DockerHub
docker login

# 2. Push images with tags v1, v2, v3
docker push <YOUR_DOCKERHUB_USERNAME>/health-tracker:v1
docker push <YOUR_DOCKERHUB_USERNAME>/health-tracker:v2
docker push <YOUR_DOCKERHUB_USERNAME>/health-tracker:v3
```
*(Or run `./scripts/push-to-dockerhub.sh <YOUR_DOCKERHUB_USERNAME>`)*

---

### Step 5: Jenkins Pipeline Configuration

1. In Jenkins Web UI (`http://localhost:8080`):
   - Click **New Item** → Enter name `Health-Tracker-24MIS0130` → Select **Pipeline** → Click **OK**.
2. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/<YOUR_GITHUB_USERNAME>/health-tracker-24MIS0130.git`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
3. Credentials:
   - Add DockerHub credentials with ID: `dockerhub-credentials` (Username & Password).
4. Click **Build with Parameters** → Select `all` (or specific version) → Click **Build**.

---

### Step 6: Deploy in Kubernetes (3 Deployments & 3 Services)

Deploy all three versions into your Kubernetes cluster (Docker Desktop Kubernetes, Minikube, or Kind):

```bash
# Deploy all 3 versions at once
kubectl apply -f k8s/health-tracker-all.yaml

# Verify deployments
kubectl get deployments -l app=health-tracker

# Verify running pods
kubectl get pods -l app=health-tracker -o wide

# Verify services
kubectl get services -l app=health-tracker
```

---

### Step 7: Access via Localhost (Different Ports)

#### Direct NodePort Access:
- **v1 (Enter Data):** [http://localhost:30001](http://localhost:30001)
- **v2 (View Records):** [http://localhost:30002](http://localhost:30002)
- **v3 (Chart & Graph):** [http://localhost:30003](http://localhost:30003)

#### Port Forwarding (if using standard ports 8081, 8082, 8083):
```bash
kubectl port-forward svc/health-tracker-v1-service 8081:8081 &
kubectl port-forward svc/health-tracker-v2-service 8082:8082 &
kubectl port-forward svc/health-tracker-v3-service 8083:8083 &
```

Now access simultaneously in your browser:
- **Version 1 (Enter Data):** [http://localhost:8081](http://localhost:8081)
- **Version 2 (View Records):** [http://localhost:8082](http://localhost:8082)
- **Version 3 (Chart & Graph):** [http://localhost:8083](http://localhost:8083)

#### Docker Compose Alternative:
```bash
docker compose up -d
```
All 3 versions will immediately be accessible on ports `8081`, `8082`, and `8083`.

---

## 📸 Screenshots Checklist for Lab Evaluation

1. **VS Code:** Showing the three version codebases (`versions/v1`, `v2`, `v3`) and terminal.
2. **Git Branches:** `git branch -a` and `git log --graph --oneline` showing `v1`, `v2`, `v3`, `main`.
3. **GitHub:** Repository page showing branches `v1`, `v2`, `v3`, `main` and commit history.
4. **Jenkins Pipeline:** Jenkins stage view showing green checks for Checkout, Test, Docker Build, DockerHub Push, and Kubernetes Deploy.
5. **DockerHub:** Public repository showing tagged images: `:v1`, `:v2`, `:v3`.
6. **Kubernetes:** Terminal output of `kubectl get deployments,pods,services`.
7. **Browser Output (v1):** `http://localhost:8081` showing Data Entry form and status feedback.
8. **Browser Output (v2):** `http://localhost:8082` showing Records Ledger table, search, and delete features.
9. **Browser Output (v3):** `http://localhost:8083` showing interactive Time-Series graphs, trends, and analytics.

---
**Maintained by:** 24MIS0130  
**Course:** DevOps Continuous Integration & Continuous Deployment

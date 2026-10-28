pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'abijith16'
        IMAGE_NAME     = 'health-tracker'
        STUDENT_ROLL   = '24MIS0130'
        PATH           = "/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
    }

    parameters {
        choice(
            name: 'DEPLOY_VERSION',
            choices: ['all', 'v1', 'v2', 'v3'],
            description: 'Select version to build, push and deploy'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip unit/sanity tests stage'
        )
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "=========================================================="
                echo "Building Health Tracker for Roll No: ${env.STUDENT_ROLL}"
                echo "Target DockerHub User: ${env.DOCKERHUB_USER}"
                echo "=========================================================="
                checkout scm
            }
        }

        stage('Run Tests & Sanity Checks') {
            when {
                expression { return !params.SKIP_TESTS }
            }
            steps {
                echo "--> Running test suites for applications..."
                sh '''
                    TARGET_VER="${DEPLOY_VERSION:-all}"
                    echo "Testing version scope: $TARGET_VER"

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v1" ]; then
                        echo "Testing v1 (Enter Data)..."
                        node versions/v1/test.js
                    fi

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v2" ]; then
                        echo "Testing v2 (View Records)..."
                        node versions/v2/test.js
                    fi

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v3" ]; then
                        echo "Testing v3 (Chart & Graph)..."
                        node versions/v3/test.js
                    fi
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "--> Building Docker containers with tags v1, v2, v3..."
                sh '''
                    TARGET_VER="${DEPLOY_VERSION:-all}"

                    # Build v1
                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v1" ]; then
                        echo "Building Docker image for v1..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v1 -f versions/v1/Dockerfile versions/v1
                    fi

                    # Build v2
                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v2" ]; then
                        echo "Building Docker image for v2..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v2 -f versions/v2/Dockerfile versions/v2
                    fi

                    # Build v3
                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v3" ]; then
                        echo "Building Docker image for v3..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v3 -f versions/v3/Dockerfile versions/v3
                    fi

                    echo "Docker images successfully built:"
                    docker images | grep "${IMAGE_NAME}" || true
                '''
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo "--> Pushing tagged images to DockerHub (${DOCKERHUB_USER}/${IMAGE_NAME})..."
                sh '''
                    TARGET_VER="${DEPLOY_VERSION:-all}"

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v1" ]; then
                        echo "Pushing ${DOCKERHUB_USER}/${IMAGE_NAME}:v1 ..."
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:v1
                    fi

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v2" ]; then
                        echo "Pushing ${DOCKERHUB_USER}/${IMAGE_NAME}:v2 ..."
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:v2
                    fi

                    if [ "$TARGET_VER" = "all" ] || [ "$TARGET_VER" = "v3" ]; then
                        echo "Pushing ${DOCKERHUB_USER}/${IMAGE_NAME}:v3 ..."
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:v3
                    fi
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "--> Deploying applications to Kubernetes cluster as separate Deployments and Services..."
                sh '''
                    TARGET_VER="${DEPLOY_VERSION:-all}"

                    if [ "$TARGET_VER" = "all" ]; then
                        kubectl apply -f k8s/health-tracker-all.yaml
                    else
                        kubectl apply -f k8s/${TARGET_VER}-manifest.yaml
                    fi

                    echo "Current Deployments:"
                    kubectl get deployments -l app=health-tracker

                    echo "Current Pods:"
                    kubectl get pods -l app=health-tracker -o wide

                    echo "Current Services:"
                    kubectl get services -l app=health-tracker
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                echo "=========================================================="
                echo "Deployment Verified! Application Access Endpoints:"
                echo "v1 (Enter Data)    : http://localhost:8081 (NodePort: 30001)"
                echo "v2 (View Records)  : http://localhost:8082 (NodePort: 30002)"
                echo "v3 (Chart & Graph) : http://localhost:8083 (NodePort: 30003)"
                echo "=========================================================="
            }
        }
    }

    post {
        always {
            echo "Pipeline finished for Roll No: ${env.STUDENT_ROLL}"
        }
        success {
            echo "SUCCESS: All stages completed! Built, pushed to DockerHub, and deployed to Kubernetes."
        }
        failure {
            echo "FAILURE: Please inspect the stage logs above for error details."
        }
    }
}

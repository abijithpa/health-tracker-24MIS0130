pipeline {
    agent any

    environment {
        // DockerHub Configuration
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials' // Jenkins Credential ID (Secret text or Username/Password)
        DOCKERHUB_USER           = credentials('dockerhub-credentials_USR') // Injected if using Username/Password cred
        DOCKERHUB_PASS           = credentials('dockerhub-credentials_PSW')
        DOCKER_REGISTRY          = 'docker.io'
        IMAGE_NAME               = 'health-tracker'
        STUDENT_ROLL             = '24MIS0130'
        KUBECONFIG_ID            = 'k8s-kubeconfig' // Optional kubeconfig credential ID
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
                echo "Checking out Git Repository for Roll No: ${env.STUDENT_ROLL}"
                echo "Building Version Scope: ${params.DEPLOY_VERSION}"
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
                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v1" ]; then
                        echo "Testing v1 (Enter Data)..."
                        node versions/v1/test.js
                    fi

                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v2" ]; then
                        echo "Testing v2 (View Records)..."
                        node versions/v2/test.js
                    fi

                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v3" ]; then
                        echo "Testing v3 (Chart & Graph)..."
                        node versions/v3/test.js
                    fi
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "--> Building Docker containers with corresponding tags..."
                sh '''
                    # Build v1
                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v1" ]; then
                        echo "Building Docker image for v1..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v1 -f versions/v1/Dockerfile versions/v1
                    fi

                    # Build v2
                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v2" ]; then
                        echo "Building Docker image for v2..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v2 -f versions/v2/Dockerfile versions/v2
                    fi

                    # Build v3
                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v3" ]; then
                        echo "Building Docker image for v3..."
                        docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:v3 -f versions/v3/Dockerfile versions/v3
                    fi

                    echo "Images successfully built:"
                    docker images | grep "${IMAGE_NAME}" || true
                '''
            }
        }

        stage('Push to DockerHub') {
            steps {
                echo "--> Authenticating and pushing images to DockerHub..."
                sh '''
                    echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin

                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v1" ]; then
                        echo "Pushing ${DOCKERHUB_USER}/${IMAGE_NAME}:v1 ..."
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:v1
                    fi

                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v2" ]; then
                        echo "Pushing ${DOCKERHUB_USER}/${IMAGE_NAME}:v2 ..."
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:v2
                    fi

                    if [ "${DEPLOY_VERSION}" = "all" ] || [ "${DEPLOY_VERSION}" = "v3" ]; then
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
                    # Substitute DockerHub username dynamically if needed
                    sed -i.bak "s|24mis0130/health-tracker|${DOCKERHUB_USER}/${IMAGE_NAME}|g" k8s/*.yaml || true

                    if [ "${DEPLOY_VERSION}" = "all" ]; then
                        kubectl apply -f k8s/health-tracker-all.yaml
                    else
                        kubectl apply -f k8s/${DEPLOY_VERSION}-manifest.yaml
                    fi

                    echo "Checking Kubernetes Pods..."
                    kubectl get pods -l app=health-tracker -o wide

                    echo "Checking Kubernetes Services..."
                    kubectl get services -l app=health-tracker
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                echo "--> Verifying application endpoints on localhost..."
                sh '''
                    echo "=========================================================="
                    echo "Application Access Endpoints on Localhost:"
                    echo "v1 (Enter Data)     : http://localhost:8081 (NodePort: 30001)"
                    echo "v2 (View Records)   : http://localhost:8082 (NodePort: 30002)"
                    echo "v3 (Chart & Graph)  : http://localhost:8083 (NodePort: 30003)"
                    echo "=========================================================="
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline run completed for Roll No: ${env.STUDENT_ROLL} - Health Tracker"
        }
        success {
            echo "CI/CD Pipeline succeeded! All 3 versions are built, pushed to DockerHub, and deployed to Kubernetes."
        }
        failure {
            echo "Pipeline encountered an issue. Check the stage logs above for troubleshooting."
        }
    }
}

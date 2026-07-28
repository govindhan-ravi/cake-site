pipeline {
    agent any
    options {
        skipDefaultCheckout() // Prevents the automatic checkout at the start
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner' // Ensure SonarQube Scanner is configured in Global Tool Configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        IMAGE_NAME = 'govindhan1234/cake-site-2'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        AWS_REGION = 'us-east-1'
        EKS_CLUSTER_NAME = 'sap-dev-terraform-eks-cluster'
        AWS_CREDENTIALS_ID = 'aws-credentials' // Jenkins credential ID for AWS access
    }

    stages {
        stage('Git Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    def nodeHome = tool 'node'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('ESLint') {
            steps {
                script {
                    def nodeHome = tool 'node'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                echo 'Running ESLint...'
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                script {
                    def nodeHome = tool 'node'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                echo 'Running tests...'
                sh 'npm test -- --watchAll=false'
            }
        }

        stage('SonarQube Scan') {
            steps {
                echo 'Skipping SonarQube Scan because server is down...'
                // withSonarQubeEnv('sonar-server') {
                //     withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                //         sh "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.login=\$SONAR_TOKEN"
                //     }
                // }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Skipping Quality Gate because SonarQube is down...'
                // waitForQualityGate abortPipeline: true
            }
        }

        stage('Trivy FS Scan') {
            steps {
                echo 'Skipping Trivy File System Scan per user request...'
                // sh 'trivy fs . --severity HIGH,CRITICAL'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker Image...'
                sh "docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Trivy Image Scan') {
            steps {
                echo 'Skipping Docker Image Scan per user request...'
                // sh "trivy image ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} --severity HIGH,CRITICAL"
            }
        }

        stage('Docker Push') {
            steps {
                echo 'Pushing Docker Image to Registry...'
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                echo 'Deploying to Amazon EKS...'
                withCredentials([aws(credentialsId: env.AWS_CREDENTIALS_ID, accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh """
                        aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}
                        kubectl apply -f k8s/
                        kubectl set image deployment/cake-site-deployment cake-site=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Success: The pipeline finished successfully!'
        }
        failure {
            echo 'Failure: The pipeline failed.'
        }
    }
}

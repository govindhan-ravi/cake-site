pipeline {
    agent any
    
    options {
        skipDefaultCheckout() // Prevents the automatic checkout at the start
    }

    tools {
        nodejs 'node' // Ensure Node.js is configured in Global Tool Configuration
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner' // Ensure SonarQube Scanner is configured in Global Tool Configuration
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
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('ESLint') {
            steps {
                echo 'Running ESLint...'
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm test -- --watchAll=false'
            }
        }

        stage('SonarQube Scan') {
            steps {
                echo 'Starting SonarQube Scan...'
                withSonarQubeEnv('sonar-server') { // Ensure SonarQube server is configured in Jenkins
                    sh "${SCANNER_HOME}/bin/sonar-scanner"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Waiting for Quality Gate status...'
                waitForQualityGate abortPipeline: true
            }
        }

        stage('Trivy FS Scan') {
            steps {
                echo 'Running Trivy File System Scan...'
                sh 'trivy fs . --severity HIGH,CRITICAL'
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

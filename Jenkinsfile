pipeline {

    agent any
    
    tools {
        nodejs "nodejs"
    }

    stages {
    
        stage('Build Code') {
            steps {
                sh 'rm -rf dist'
                sh "echo 'Build...'"
                sh 'npm install'
                sh 'npm run prod'
            }
        }


        stage('Docker Build Operation UI') {
            steps {
                sh 'docker build -t lifelong-operation-ui:v1.0.0-b.3-a.3 .'  
            }
        }
        
        stage('Tag Docker Image Operation UI') {
            steps {
                sh 'docker image tag lifelong-operation-ui:v1.0.0-b.3-a.3 hubcpa.ar.co.th:5000/lifelong-operation-ui:v1.0.0-b.3-a.3'
            }
        }
        
        stage('Login Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'hubcpa.ar.co.th', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login hubcpa.ar.co.th:5000 -u "$DOCKER_USER" --password-stdin'
                }
            }
        }
        
        stage('Push Docker Image Operation UI') {
            steps {
                sh 'docker push hubcpa.ar.co.th:5000/lifelong-operation-ui:v1.0.0-b.3-a.3'
            }
        }
            
        stage('Apply to k8s') {
            steps {
                withKubeConfig([credentialsId: 'swu-config-sit']) {
                    sh 'kubectl apply -f lifelong-operation-ui.yml'
                }
            }
        }


    }

}

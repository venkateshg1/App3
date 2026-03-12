pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = "273354646339"
        AWS_REGION = "us-east-1"
        ECR_REPO = "demo"
        IMAGE_TAG = "latest"
        ECR_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        EKS_CLUSTER_NAME = "demo-cluster"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/venkateshg1/App3.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $ECR_URI/$ECR_REPO:$IMAGE_TAG .
                '''
            }
        }

        stage('Login to AWS ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
                    sh '''
                    aws ecr get-login-password --region $AWS_REGION \
                    | docker login --username AWS --password-stdin $ECR_URI
                    '''
                }
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                sh '''
                docker push $ECR_URI/$ECR_REPO:$IMAGE_TAG
                '''
            }
        }

        stage('Create EKS Cluster (if not exists)') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
                    sh '''
                    # Check if cluster exists
                    CLUSTER_EXISTS=$(aws eks list-clusters --region $AWS_REGION | grep -w $EKS_CLUSTER_NAME || true)
                    if [ -z "$CLUSTER_EXISTS" ]; then
                        echo "Creating EKS cluster: $EKS_CLUSTER_NAME ..."
                        eksctl create cluster \
                            --name $EKS_CLUSTER_NAME \
                            --version 1.29 \
                            --region $AWS_REGION \
                            --nodegroup-name demo-nodes \
                            --node-type t3.medium \
                            --nodes 2 \
                            --nodes-min 1 \
                            --nodes-max 3 \
                            --managed
                    else
                        echo "Cluster $EKS_CLUSTER_NAME already exists."
                    fi
                    '''
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-creds']]) {
                    sh '''
                    aws eks --region $AWS_REGION update-kubeconfig --name $EKS_CLUSTER_NAME
                    kubectl apply -f Deployment.yml
                    '''
                }
            }
        }

    }

    post {
        success {
            echo "Pipeline completed successfully! App deployed to EKS."
        }
        failure {
            echo "Pipeline failed. Check logs for details."
        }
    }
}

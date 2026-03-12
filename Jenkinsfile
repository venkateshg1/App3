pipeline {
agent any

environment {
    AWS_ACCOUNT_ID = "273354646339"
    AWS_REGION = "us-east-1"
    ECR_REPO = "demo"
    IMAGE_TAG = "latest"
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
        sh '''
        aws ecr get-login-password --region $AWS_REGION \
        | docker login --username AWS \
        --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
        '''
    }
}

    stage('Tag Docker Image') {
        steps {
            sh '''
            docker tag $ECR_REPO:$IMAGE_TAG \
            $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
            '''
        }
    }

    stage('Push Image to ECR') {
        steps {
            sh '''
            docker push \
            $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:$IMAGE_TAG
            '''
        }
    }


    stage('Deploy to EKS') {
        steps {
            sh '''
            aws eks --region $AWS_REGION update-kubeconfig --name my-eks-cluster
            kubectl apply -f Deployment.yml
            '''
        }
    }

}
}

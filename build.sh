set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=spotback
# image name
IMAGE=matching-service
docker build -t $USERNAME/$IMAGE:latest .
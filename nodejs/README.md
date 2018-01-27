### benchmarking-ec NodeJS applications for Gcloud IoT

This contains a nodejs application to publish messages to a PubSub in Google Cloud IOT Core. 
To run this you need have a Registry with at least one Device and a topic created in Google IoT Core. Remember to create public/private key pair for you gcloud interaction. And you will need to add your machine as authorized user to access the IoT services. Follow the instructions in this Documentaiotn to create the registry: 
https://cloud.google.com/iot/docs/quickstart

Follow the commands to get it run:

'''npm install'''

Run the following command to create a subscription to the registry's Pub/Sub topic, substituting your project ID:

'''
gcloud beta pubsub subscriptions create \
    projects/PROJECT_ID/subscriptions/my-subscription \
    --topic=projects/PROJECT_ID/topics/my-device-events
'''

Run the following command to connect a virtual device to Cloud IoT Core using the MQTT bridge, substituting your project ID:

'''
node cloudiot_mqtt_example_nodejs.js \
    --projectId=PROJECT_ID \
    --registryId=my-registry \
    --deviceId=my-device \
    --privateKeyFile=rsa_private.pem \
    --numMessages=25 \
    --algorithm=RS256
'''


Next? You may want to listen the messages, we have a well prepared example here to follow: https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/6-pubsub/worker.js 

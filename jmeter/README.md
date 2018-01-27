PREREQUISITES

- Jmeter 3.3 package with plugins - https://jmeter-plugins.org/downloads/old/
- Java 8
- NodeJs
- Required Certificates/keys. We have provided our keys in the ../keys and ../keys/aws folder, for the sake of easily reporducing the test. But you can also create one, refer to this page: https://www.blazemeter.com/blog/how-set-your-jmeter-load-test-use-client-side-certificates


HOW TO?
- git clone
- download https://github.com/emqtt/mqtt-jmeter
- add it to the Jmeter root lib/ext

- Run mqtt_example/cloudiot_mqtt_example_nodejs.js with the correct parameters
```
node cloudiot_mqtt_example_nodejs.js --projectId=eciot-191612 --cloudRegion=us-central1 --registryId=test --deviceId=mac --privateKeyFile=rsa_private.pem --algorithm=RS256
```
- copy the JWT token logged in the console
- Open .jmx file, and paste the password that is matched to that client ID 

- Run jmeter on the targetted .jmx file
```
{JMETER PATH}/bin/jmeter -n -t test.jmx
```

REPORTS CREATED BY JMETER 
https://drive.google.com/drive/u/1/folders/1YRqLHGgEtq-OskrEpAdqznbluMWwH0Xx




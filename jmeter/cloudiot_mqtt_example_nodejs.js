/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START iot_mqtt_include]
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
// [END iot_mqtt_include]

console.log('Google Cloud IoT Core MQTT example.');
var argv = require(`yargs`)
    .options({
      projectId: {
        default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
        description: 'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
        requiresArg: true,
        type: 'string'
      },
      cloudRegion: {
        default: 'us-central1',
        description: 'GCP cloud region.',
        requiresArg: true,
        type: 'string'
      },
      registryId: {
        description: 'Cloud IoT registry ID.',
        requiresArg: true,
        demandOption: true,
        type: 'string'
      },
      deviceId: {
        description: 'Cloud IoT device ID.',
        requiresArg: true,
        demandOption: true,
        type: 'string'
      },
      privateKeyFile: {
        description: 'Path to private key file.',
        requiresArg: true,
        demandOption: true,
        type: 'string'
      },
      algorithm: {
        description: 'Encryption algorithm to generate the JWT.',
        requiresArg: true,
        demandOption: true,
        choices: ['RS256', 'ES256'],
        type: 'string'
      },
      numMessages: {
        default: 100,
        description: 'Number of messages to publish.',
        requiresArg: true,
        type: 'number'
      },
      tokenExpMins: {
        default: 20,
        description: 'Minutes to JWT token expiration.',
        requiresArg: true,
        type: 'number'
      },
      mqttBridgeHostname: {
        default: 'mqtt.googleapis.com',
        description: 'MQTT bridge hostname.',
        requiresArg: true,
        type: 'string'
      },
      mqttBridgePort: {
        default: 8883,
        description: 'MQTT bridge port.',
        requiresArg: true,
        type: 'number'
      },
      messageType: {
        default: 'events',
        description: 'Message type to publish.',
        requiresArg: true,
        choices: ['events', 'state'],
        type: 'string'
      }
    })
    .example(`node $0 cloudiot_mqtt_example_nodejs.js --projectId=blue-jet-123 --registryId=my-registry --deviceId=my-node-device --privateKeyFile=../rsa_private.pem --algorithm=RS256`)
    .wrap(120)
    .recommendCommands()
    .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
    .help()
    .strict()
    .argv;

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
// [START iot_mqtt_jwt]
function createJwt (projectId, privateKeyFile, algorithm) {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    'iat': parseInt(Date.now() / 1000),
    'exp': parseInt(Date.now() / 1000) + 20 * 60,  // 20 minutes
    'aud': projectId
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, { algorithm: algorithm });
}
// [END iot_mqtt_jwt]

// Publish numMessages messages asynchronously, starting from message
// messageCount.
// [START iot_mqtt_publish]
function publishAsync (messageCount, numMessages) {
  const payload = `${argv.registryId}/${argv.deviceId}-payload-${messageCount}`;
  // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
  // Cloud IoT Core also supports qos=0 for at most once delivery.
  console.log('Publishing message:', payload);
  console.log("this is the topic " + mqttTopic)

  client.publish(mqttTopic, payload, { qos: 1 });

  const delayMs = argv.messageType === 'events' ? 1000 : 2000;
  if (messageCount < numMessages) {
    // If we have published fewer than numMessage messages, publish payload
    // messageCount + 1 in 1 second.
    // [START iot_mqtt_jwt_refresh]
    setTimeout(function () {
      let secsFromIssue = parseInt(Date.now() / 1000) - iatTime;
      if (secsFromIssue > argv.tokenExpMins * 60) {
        iatTime = parseInt(Date.now() / 1000);
        console.log(`\tRefreshing token after ${secsFromIssue} seconds.`);

        client.end();
        connectionArgs.password = createJwt(argv.projectId, argv.privateKeyFile, argv.algorithm);
        console.log("asdasdkajsndkjanskdjnaksjdnasjkd");
        client = mqtt.connect(connectionArgs);

        client.on('connect', (success) => {
          console.log('connect to meeee please');
          if (success) {
            publishAsync(1, argv.numMessages);
          } else {
            console.log('Client not connected...');
          }
        });

        client.on('close', () => {
          console.log('close');
        });

        client.on('error', (err) => {
          console.log('error', err);
        });

        client.on('message', (topic, message, packet) => {
          console.log('message received: ', Buffer.from(message, 'base64').toString('ascii'));
        });

        client.on('packetsend', () => {
          // Note: logging packet send is very verbose
        });
      }
      publishAsync(messageCount + 1, numMessages);
    }, delayMs);
    // [END iot_mqtt_jwt_refresh]
  } else {
    // Otherwise, close the connection.
    console.log('Closing connection to MQTT. Goodbye!');
    client.end();
  }
}
// [END iot_mqtt_publish]

// [START iot_mqtt_run]
// The mqttClientId is a unique string that identifies this device. For Google
// Cloud IoT Core, it must be in the format below.
const mqttClientId = `projects/${argv.projectId}/locations/${argv.cloudRegion}/registries/${argv.registryId}/devices/${argv.deviceId}`;

// With Google Cloud IoT Core, the username field is ignored, however it must be
// non-empty. The password field is used to transmit a JWT to authorize the
// device. The "mqtts" protocol causes the library to connect using SSL, which
// is required for Cloud IoT Core.
let connectionArgs = {
  host: argv.mqttBridgeHostname,
  port: argv.mqttBridgePort,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(argv.projectId, argv.privateKeyFile, argv.algorithm),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method'
};

// Create a client, and connect to the Google MQTT bridge.
let iatTime = parseInt(Date.now() / 1000);
let client = mqtt.connect(connectionArgs);

// Subscribe to the /devices/{device-id}/config topic to receive config updates.
client.subscribe(`/devices/${argv.deviceId}/config`);

// The MQTT topic that this device will publish data to. The MQTT
// topic name is required to be in the format below. The topic name must end in
// 'state' to publish state and 'events' to publish telemetry. Note that this is
// not the same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${argv.deviceId}/${argv.messageType}`;

client.on('connect', (success) => {
  console.log("password " +connectionArgs.password)
  console.log('connect to themm mee');
  if (success) {
    publishAsync(1, argv.numMessages);
  } else {
    console.log('Client not connected...');
  }
});

client.on('close', () => {
  console.log('close');
});

client.on('error', (err) => {
  console.log('error', err);
});

client.on('message', (topic, message, packet) => {
  console.log('message received: ', Buffer.from(message, 'base64').toString('ascii'));
});

client.on('packetsend', () => {
  // Note: logging packet send is very verbose
});

// Once all of the messages have been published, the connection to Google Cloud
// IoT will be closed and the process will exit. See the publishAsync method.
// [END iot_mqtt_run]

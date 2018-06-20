module.exports = function (RED) {
    function WebNode(config) {
        RED.nodes.createNode(this, n);
        var node = this;

        // Retrieve the config node
        this.vapidConfiguration = RED.nodes.getNode(config.vapidConfiguration);

        this.on('input', function (msg) {
            try {
                node.status({ fill: "blue", shape: "dot", text: " " })

                var payload;
                if ((msg.notification != null) && (typeof msg.notification === "object")) {
                    payload = JSON.stringify(msg.notification)
                }

                if (msg.tokens && msg.tokens.length > 0) {
                    var webPush = require('web-push');
                    webPush.setVapidDetails(
                      node.vapidConfiguration.subject,
                      node.vapidConfiguration.publicKey,
                      node.vapidConfiguration.privateKey
                    )

                    function sendNotification(subscription, payload, options) {
                        return new Promise(function (fulfill, reject) {
                            webPush.sendNotification(subscription, payload).then(function (response) {
                                fulfill({
                                    sent: {
                                        endpoint: subscription.endpoint
                                    }
                                });
                            }).catch(function (err) {
                                fulfill({
                                    failed: JSON.parse(JSON.stringify(err)) // for some reason it only puts the message without this
                                })
                            })
                        })
                    }

                    var calls = []

                    for (var i = 0; i < msg.tokens.length; i++) {
                        calls.push(sendNotification(msg.tokens[i], payload, options))
                    }

                    Promise.all(calls).then(function (results) {
                        msg.result = {
                            sent: results.reduce((prev, current) => {
                                if (current.sent) {
                                    prev.push(current.sent)
                                }
                                return prev
                            }, []),
                            failed: results.reduce((prev, current) => {
                                if (current.failed) {
                                    prev.push(current.failed)
                                }
                                return prev
                            }, [])
                        }
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: msg.result.sent.length + " sent, " + msg.result.failed.length + " failed."
                        })
                        node.send(msg)
                    })

                } else {
                    throw new Error("Missing recipient");
                }

            } catch (err) {
                node.status({ fill: "red", shape: "dot", text: err.message })
                node.error(err);
                return;
            }
        });

        this.on('close', function () {
            node.status({});
        });
    }
    RED.nodes.registerType("web-push", WebNode);
}

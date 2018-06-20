module.exports = function (RED) {
  class WebNode {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.webPush = require('web-push');

      // Retrieve the config node
      const vapidConfig = RED.nodes.getNode(config.vapidConfiguration);
      this.webPush.setVapidDetails(
        vapidConfig.subject,
        vapidConfig.publicKey,
        vapidConfig.privateKey
      );

      this.on('input', this.onInput.bind(this))
      this.on('close', this.onClose.bind(this))
    }

    onInput(msg) {
      try {
        this.status({ fill: "blue", shape: "dot", text: " " })

        let payload
        if ((msg.notification != null) && (typeof msg.notification === "object")) {
            payload = JSON.stringify(msg.notification)
        }

        const tokens = msg.tokens || []

        if (tokens.length == 0) {
          this.warn('No recipients in msg.tokens')
        }

        const calls = tokens.map((token) => (
          this.webPush.sendNotification(token, payload).catch(e => e)
        ))

        Promise.all(calls).then(results => {
          let success = 0
          let errors = 0
          results.map(result => {
            if (result.statusCode === 201 || result.statusCode === 200) {
              success++
            } else {
              errors++
              this.warn(result)
            }
          })
          this.status({
            fill: success > 0 ? "green" : "yellow",
            shape: "dot",
            text: success + " sent, " + errors + " failed."
          })
        })
      } catch (err) {
        this.status({ fill: "red", shape: "dot", text: err.message })
        this.error(err)
      }
    }

    onClose() {
      this.status({})
    }
  }

  RED.nodes.registerType("web-push", WebNode);
}

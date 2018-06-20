module.exports = function (RED) {
  const fs = require('fs')
  class UpdateToken {
    constructor(config) {
      RED.nodes.createNode(this, config);

      this.tokenFilename = RED.nodes.getNode(config.tokens).filename;
      this.mode = config.mode;

      this.on('input', this.onInput.bind(this))
    }

    loadTokens() {
      let file
      try {
        file = fs.readFileSync(this.tokenFilename, {encoding: 'utf8'})
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Handle new file
          this.log('Starting new token file')
          file = ''
        } else {
          throw err;
        }
      }
      return file.split('\n').filter((line) => !!line).map(JSON.parse)
    }

    dumpTokens(tokens) {
      const body = tokens.map(JSON.stringify).join('\n')
      fs.writeFileSync(this.tokenFilename, body, {encoding: 'utf8'})
    }

    onInput(msg) {
      const token = msg.payload
      const existingTokens = this.loadTokens()

      const found = existingTokens.findIndex(
        t => t.endpoint == token.endpoint
      )

      if (this.mode == 'remove') {
        if (found !== -1) {
          existingTokens.splice(found, 1)
          msg.statusCode = 200
        } else {
          msg.statusCode = 404
        }
      } else {
        if (found !== -1) {
          existingTokens[found] = token
          msg.statusCode = 201
        } else {
          existingTokens.push(token)
          msg.statusCode = 200
        }
      }

      this.dumpTokens(existingTokens)

      msg.payload = '';
      this.send(msg)
    }
  }

  RED.nodes.registerType('update-token', UpdateToken);
}

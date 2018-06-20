module.exports = function(RED) {
    function PushTokenStorage(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.filename = n.filename;
    }
    RED.nodes.registerType('push-token-storage', PushTokenStorage);
}

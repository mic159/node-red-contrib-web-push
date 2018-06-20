module.exports = function(RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.publicKey = n.publicKey;
        this.privateKey = n.privateKey;
    }
    RED.nodes.registerType("vapid-configuration",RemoteServerNode);
}

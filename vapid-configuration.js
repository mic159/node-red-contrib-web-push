module.exports = function(RED) {
    function VapidConfiguration(n) {
        RED.nodes.createNode(this,n);
        this.subject = n.subject;
        this.publicKey = n.publicKey;
        this.privateKey = n.privateKey;
    }
    RED.nodes.registerType("vapid-configuration", VapidConfiguration);
}

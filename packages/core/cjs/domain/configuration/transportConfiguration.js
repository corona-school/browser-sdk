"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTransportConfiguration = void 0;
var polyfills_1 = require("../../tools/utils/polyfills");
var endpointBuilder_1 = require("./endpointBuilder");
var tags_1 = require("./tags");
var intakeSites_1 = require("./intakeSites");
function computeTransportConfiguration(initConfiguration) {
    var tags = (0, tags_1.buildTags)(initConfiguration);
    var endpointBuilders = computeEndpointBuilders(initConfiguration, tags);
    var intakeUrlPrefixes = (0, polyfills_1.objectValues)(endpointBuilders).map(function (builder) { return builder.urlPrefix; });
    var replicaConfiguration = computeReplicaConfiguration(initConfiguration, intakeUrlPrefixes, tags);
    return (0, polyfills_1.assign)({
        isIntakeUrl: function (url) { return intakeUrlPrefixes.some(function (intakeEndpoint) { return url.indexOf(intakeEndpoint) === 0; }); },
        replica: replicaConfiguration,
        site: initConfiguration.site || intakeSites_1.INTAKE_SITE_US1,
    }, endpointBuilders);
}
exports.computeTransportConfiguration = computeTransportConfiguration;
function computeEndpointBuilders(initConfiguration, tags) {
    return {
        logsEndpointBuilder: (0, endpointBuilder_1.createEndpointBuilder)(initConfiguration, 'logs', tags),
        rumEndpointBuilder: (0, endpointBuilder_1.createEndpointBuilder)(initConfiguration, 'rum', tags),
        sessionReplayEndpointBuilder: (0, endpointBuilder_1.createEndpointBuilder)(initConfiguration, 'sessionReplay', tags),
    };
}
function computeReplicaConfiguration(initConfiguration, intakeUrlPrefixes, tags) {
    if (!initConfiguration.replica) {
        return;
    }
    var replicaConfiguration = (0, polyfills_1.assign)({}, initConfiguration, {
        site: intakeSites_1.INTAKE_SITE_US1,
        clientToken: initConfiguration.replica.clientToken,
    });
    var replicaEndpointBuilders = {
        logsEndpointBuilder: (0, endpointBuilder_1.createEndpointBuilder)(replicaConfiguration, 'logs', tags),
        rumEndpointBuilder: (0, endpointBuilder_1.createEndpointBuilder)(replicaConfiguration, 'rum', tags),
    };
    intakeUrlPrefixes.push.apply(intakeUrlPrefixes, (0, polyfills_1.objectValues)(replicaEndpointBuilders).map(function (builder) { return builder.urlPrefix; }));
    return (0, polyfills_1.assign)({ applicationId: initConfiguration.replica.applicationId }, replicaEndpointBuilders);
}
//# sourceMappingURL=transportConfiguration.js.map
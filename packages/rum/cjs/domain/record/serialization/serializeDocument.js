"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDocument = void 0;
var serializeNode_1 = require("./serializeNode");
function serializeDocument(document, configuration, serializationContext) {
    // We are sure that Documents are never ignored, so this function never returns null
    return (0, serializeNode_1.serializeNodeWithId)(document, {
        serializationContext: serializationContext,
        parentNodePrivacyLevel: configuration.defaultPrivacyLevel,
        configuration: configuration,
    });
}
exports.serializeDocument = serializeDocument;
//# sourceMappingURL=serializeDocument.js.map
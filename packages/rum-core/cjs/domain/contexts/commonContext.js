"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommonContext = void 0;
function buildCommonContext(globalContextManager, userContextManager, recorderApi) {
    return {
        context: globalContextManager.getContext(),
        user: userContextManager.getContext(),
        hasReplay: recorderApi.isRecording() ? true : undefined,
    };
}
exports.buildCommonContext = buildCommonContext;
//# sourceMappingURL=commonContext.js.map
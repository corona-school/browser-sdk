import { instrumentMethodAndCallOriginal } from '@datadog/browser-core';
import { getSerializedNodeId, hasSerializedNode } from '../serialization';
export function initStyleSheetObserver(cb) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (styleSheet && hasSerializedNode(styleSheet.ownerNode)) {
            callback(getSerializedNodeId(styleSheet.ownerNode));
        }
    }
    var instrumentationStoppers = [
        instrumentMethodAndCallOriginal(CSSStyleSheet.prototype, 'insertRule', {
            before: function (rule, index) {
                checkStyleSheetAndCallback(this, function (id) { return cb({ id: id, adds: [{ rule: rule, index: index }] }); });
            },
        }),
        instrumentMethodAndCallOriginal(CSSStyleSheet.prototype, 'deleteRule', {
            before: function (index) {
                checkStyleSheetAndCallback(this, function (id) { return cb({ id: id, removes: [{ index: index }] }); });
            },
        }),
    ];
    if (typeof CSSGroupingRule !== 'undefined') {
        instrumentGroupingCSSRuleClass(CSSGroupingRule);
    }
    else {
        instrumentGroupingCSSRuleClass(CSSMediaRule);
        instrumentGroupingCSSRuleClass(CSSSupportsRule);
    }
    function instrumentGroupingCSSRuleClass(cls) {
        instrumentationStoppers.push(instrumentMethodAndCallOriginal(cls.prototype, 'insertRule', {
            before: function (rule, index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = getPathToNestedCSSRule(_this);
                    if (path) {
                        path.push(index || 0);
                        cb({ id: id, adds: [{ rule: rule, index: path }] });
                    }
                });
            },
        }), instrumentMethodAndCallOriginal(cls.prototype, 'deleteRule', {
            before: function (index) {
                var _this = this;
                checkStyleSheetAndCallback(this.parentStyleSheet, function (id) {
                    var path = getPathToNestedCSSRule(_this);
                    if (path) {
                        path.push(index);
                        cb({ id: id, removes: [{ index: path }] });
                    }
                });
            },
        }));
    }
    return function () { return instrumentationStoppers.forEach(function (stopper) { return stopper.stop(); }); };
}
export function getPathToNestedCSSRule(rule) {
    var path = [];
    var currentRule = rule;
    while (currentRule.parentRule) {
        var rules_1 = Array.from(currentRule.parentRule.cssRules);
        var index_1 = rules_1.indexOf(currentRule);
        path.unshift(index_1);
        currentRule = currentRule.parentRule;
    }
    // A rule may not be attached to a stylesheet
    if (!currentRule.parentStyleSheet) {
        return;
    }
    var rules = Array.from(currentRule.parentStyleSheet.cssRules);
    var index = rules.indexOf(currentRule);
    path.unshift(index);
    return path;
}
//# sourceMappingURL=styleSheetObserver.js.map
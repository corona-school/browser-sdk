"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnIfCustomerDataLimitReached = exports.CUSTOMER_DATA_BYTES_LIMIT = void 0;
var byteUtils_1 = require("../utils/byteUtils");
var display_1 = require("../display");
// RUM and logs batch bytes limit is 16KB
// ensure that we leave room for other event attributes and maintain a decent amount of event per batch
// (3KB (customer data) + 1KB (other attributes)) * 4 (events per batch) = 16KB
exports.CUSTOMER_DATA_BYTES_LIMIT = 3 * byteUtils_1.ONE_KIBI_BYTE;
function warnIfCustomerDataLimitReached(bytesCount, customerDataType) {
    if (bytesCount > exports.CUSTOMER_DATA_BYTES_LIMIT) {
        display_1.display.warn("The ".concat(customerDataType, " data exceeds the recommended ").concat(exports.CUSTOMER_DATA_BYTES_LIMIT / byteUtils_1.ONE_KIBI_BYTE, "KiB threshold. More details: https://docs.datadoghq.com/real_user_monitoring/browser/troubleshooting/#customer-data-exceeds-the-recommended-3kib-warning"));
        return true;
    }
    return false;
}
exports.warnIfCustomerDataLimitReached = warnIfCustomerDataLimitReached;
//# sourceMappingURL=heavyCustomerDataWarning.js.map
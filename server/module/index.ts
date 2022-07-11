import { registerModule } from "../base/toModule";
import { getFileList } from "../base/tool/base"

module.exports = {
    init: getFileList(__dirname, (fileName) => {
        let module = require('./' + fileName);
        registerModule(fileName, module);
    })
};
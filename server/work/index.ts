import { getFileList } from "../base/tool/base"

module.exports = {
    init: getFileList(__dirname, (fileName) => {
        require('./' + fileName);
    })
};
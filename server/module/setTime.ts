let setTime = {
    update(req: any, args: any, cb: (rst?: any) => void) {
        if (typeof args == 'string') args = JSON.parse(args);
        if (!args.newDate) {
            throw "请选择时间";
        }

        if (typeof args.newDate != "string") {
            throw "格式有误";
        }

        let newDate = args.newDate;
        let child_process = require("child_process");
        let cmd = `date -s "${newDate}"`;
        child_process.exec(cmd, function(error: any, stdout: any, stderr: any) {
            if (error) {
                console.error(error);
                cb(0);
            } else {
                cb(1);
            }
        })
    }
}

module.exports = setTime;
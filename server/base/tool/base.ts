import { getChildrenlist } from "./file";
//初始化 自动注册同级文件
export function getFileList(modulePath: string, handler?: (fileName: string) => void) {
    getChildrenlist(modulePath, (fileList) => {
        if (fileList && fileList.length) {
            fileList.filter((item) => {
                let fileName = item.split('.')[0];
                if (fileName && fileName != 'index') {
                    try {
                        if (handler) handler(fileName);
                    } catch (error) {
                        console.error(error);
                    }
                }
            })
        }
    })
}

export function exec(cmd: string, cb: (rst?: any) => void) {
    const childProcess = require('child_process');
    const exec = childProcess.exec;
    // if (process.platform !== 'linux') return cb();
    exec(cmd, function (err: any, stdout: any, stderr: any) {
        if (err) {
            console.error(err);
            cb();
        } else {
            let data = stdout ? stdout : stderr;
            cb(data);
        }
    })
}


import string from "../string";

const fs = require("fs");

export function writeFile(path: string, content: string) {
    fs.writeFileSync(path, content);
}

export function appendFile(path: string, content: string) {
    fs.appendFile(path, content);
}

export function readFile(path: string) {
    let content = fs.readFileSync(path, 'utf8');
    return content
}

export function isExists(path: string, cb: (status: Boolean) => void) {
    fs.access(path, fs.constants.F_OK, (err: any) => {
        if (err) {
            cb(false)
        } else {
            cb(true)
        }
    });
}

export function getChildrenlist(path: string, cb: (fileList: any[]) => void) {
    fs.readdir(path, (err: any, files: any) => {
        if (err) {
            throw(err);
        } else {
            console.log(files);
            cb(files);
        }
    })
}

export function moveContent(oldPath: string, newPath: string, cb: () => void) {
    try {
        let content = readFile(oldPath);
        writeFile(newPath, content);
        fs.unlink(oldPath, function (err: any) {
            if (err) {
                throw err;
            }
            cb()
        })
    } catch(e) {
        console.error('文件不存在');
    }  
}
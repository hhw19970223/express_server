var express = require('express');
var router = express.Router();

const exec_map: any = {
    exec: require('child_process').exec,
    path: require('path'),
    exec_sh(arg: any, cb: (data?: any) => void) {
        if (typeof arg == 'string') arg = JSON.parse(arg);
        let sh_name: string = arg.name;
        if (!sh_name) throw "请选择执行文件";
        if (sh_name.indexOf('.sh') == -1) sh_name += ".sh"
        const command = './' + sh_name;
        const sh_path = arg.path || "/root";
        this.exec(command, { cwd: sh_path }, (err: any, stdout: any, stderr: any) => {
            if (err) {
                console.error(err);
                throw "执行过程遇到报错"
            } else {
                let data = stdout ? stdout : stderr;
                cb(data);
            }
        })

    }
}

router.get('/exec', function (req: any, res: any, next: any) {
    let args = req.query;
    try {
        exec_map.exec_sh(args, (d: any) => {
            res.send(d);
        })
    } catch (e) {
        res.send(e);
    }
});

router.post('/exec', function (req: any, res: any, next: any) {
    let args = req.body;
    try {
        exec_map.exec_sh(args, (d: any) => {
            res.send(d);
        })
    } catch (e) {
        res.send(e);
    }
});
module.exports = router;
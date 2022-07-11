import { exec } from '../base/tool/base'
let appDo = {
    getList(req: any, args: any, cb: (rst?: any) => void) {
        if (typeof args == 'string') args = JSON.parse(args);
        let teamX = args.teamX;
        let cmd = "pm2 l";
        exec(cmd, (rst: any) => {
            if (!rst) return cb();
            
            let list: String[] = [];
            rst.split('\n').filter((line: string) => {
                line = line.replace(/│/g, "");
                let arr = line.trim().split(/\s+/);
                if (arr[1] && arr[1].indexOf(teamX) > -1 && list.indexOf(arr[1]) == -1) {
                    list.push(arr[1]);
                }
            })
            return cb(list);
        })
    },
    restart(req: any, args: any, cb: (rst?: any) => void) {
        if (typeof args == 'string') args = JSON.parse(args);
        if (!args.name) throw("缺少参数");
        let cmd = `pm2 restart ${args.name}`;
        exec(cmd, (rst: any) => {
            if (!rst) throw("重启失败");
            else {
                return cb();
            }
        })
    },
}

module.exports = appDo;
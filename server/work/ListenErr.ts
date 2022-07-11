import EventEmitter from "../base/eventEmitter/index";
import { exec } from "../base/tool/base";
import { pushWx_markdown } from "../base/wx/index";

class LintenErr extends EventEmitter {
    private _pm2: any;
    private _pm2_path: string;
    constructor() {
        super();
        this._pm2_path = "";//pm2路径不存在就从全局nodeModule下取
        this.init();
    }

    public init() {
        let self = this;
        const path = require("path");
        let promise: Promise<string> = new Promise(function (resolve, reject) {
            if (self._pm2_path) {
                resolve(self._pm2_path);
            } else {
                exec("npm root -g", function(rst) {
                    rst = rst.split('\n')[0];
                    self._pm2_path = path.join(rst, 'pm2');
                    resolve(self._pm2_path);
                })
            }
        });

        promise.then((rst: string) => {
            const API = require(path.join(rst, "lib/API.js"));
            let pm2 = self._pm2 = new API();
            pm2.connect(function () {
                // const PM2ioHandler = require(path.join(rst, 'lib/API/pm2-plus/PM2IO'));
                // PM2ioHandler.usePM2Client(pm2);
                self._inject(pm2);
            });          
        }, (err) => {
            console.error(err);
        })
        
    }

    // 监听日志
    private _inject(pm2: any) {
        var self = this;
        const cron_wxPush = require('../cron/Cron_wxPush');
        const my_config = require('../../my-config.js');
        pm2.Client.launchBus(function (err: any, bus: any, socket: any) {
            bus.on('log:*', function (type: string, packet: any) {
                let errData = packet.data || ''
                if (type == 'err' && self._filter(errData, packet.process.name)) {
                    let msg = 'pm2报错日志：\n' +
                        `>[进程信息]:<font color="info">** ${packet.process.name}**</font>\n` +
                        ` >[发生时间]:<font color="info">** ${new Date().toLocaleString()}**</font>\n` +
                        ` >[错误日志]:<font color="warning">**${errData}**</font>`;

                    cron_wxPush.add(() => {
                        return pushWx_markdown(msg, my_config.wxKey_pm2Log);
                    })
                }
            });
        });
    }

    // 过滤
    private _filter(errData: string, name: string): boolean {
        if (!errData)
            return false;
        if (errData.indexOf("Cannot read property 'exec' of undefined") > -1) return false;
        if (errData.indexOf("connect ECONNREFUSED") > -1) return false;
        if (name == "pm2-logrotate") return false;
        if (errData.indexOf("of undefined") == -1 && errData.indexOf("HHW") == -1 && errData.indexOf("Error") == -1) {
            return false;
        }
        return true;
    }
}

const lintenErr = new LintenErr();

module.exports = lintenErr;
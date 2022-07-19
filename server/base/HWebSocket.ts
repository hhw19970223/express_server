/// <reference path="./eventEmitter.ts" />
/// <reference path="./toModule.ts" />
/**
 * https://socket.io/docs/v4/server-options/
 */
module H.Ws {
    let server_ws: any;
    let wsCollectList: HWebSocket[] = [];//记入所有ws连接
    
    /** 创建socket服务 */
    export function createWs(server_http: any) {
        const { Server } = require("socket.io");
        server_ws = new Server(server_http, {
            // allowRequest: async (req: any, cb: (err?: any, rst?: any) => void) => {
            //     cb(null, true);
            // },
            cors: true
        });
        server_ws.on('connection', function (client: any) {
            //client.handshake.query;
            new H.Ws.HWebSocket(client);
        });
    }

    /** 创建WebSocket类并继承事件类 */
    export class HWebSocket extends EventEmitter {
        private client: any;
        constructor(client: any) {
            super();
            let self = this;
            self.client = client;
            wsCollectList.push(self);

            client.on('message', function (msg: string) {
                self.dataHandle(msg);
            });
            client.on('disconnect', function (msg: string) {
                self.close();
            });
            client.on('error', function (msg: string) {
                self.close();
            });
        }

        //发送错误日志
        sendErr(msg: any) {
            this.send(JSON.stringify({ "errMsg": msg }));
        }

        /**
         * 发送数据
        */
        send(message: any) {
            if (message && typeof message == 'object') {
                message = JSON.stringify(message);
            }
            this.client.emit("message", message);
        }

        /** 删除断开连接 */
        close() {
            let idx = wsCollectList.indexOf(this);
            if (idx > -1) {
                wsCollectList.splice(idx, 1);
            }
        }

        /**
         * 广播信息
         */
        brocast(message: any) {
            wsCollectList.forEach(function (ws: HWebSocket) {
                ws.send(message);
            })
        }


        /**
         * socket有数据过来的处理
         */
        dataHandle(data: any) {
            let self = this;
            if (data) {//处理前端的请求数据
                try {
                    data = JSON.parse(data);
                    if (data["module"] && data["method"]) {
                        if (!self.req) self.req = {};
                        doModuleMethod(self.req, data["module"], data["method"], data["args"], (rst) => {

                        })
                    } else {

                    }
                } catch (e: any) {
                    self.sendErr(e.message || e);
                }
            } else {

            }
        }
    }    
}
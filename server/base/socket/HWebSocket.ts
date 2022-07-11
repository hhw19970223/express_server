
import EventEmitter from "../eventEmitter/index";
import wsCollector from "./index";
import { doModuleMethod } from "../toModule/index";

// 创建WebSocket类并继承事件类
class HWebSocket extends EventEmitter {
    constructor(socket: any) {
        super();
        let self = this;
        self.name = null;
        self.ip = null;
        self.req = null;
        self.state = "OPEN";//当前WebSocket状态
        self.pingTimes = 0;
        self.socket = socket;
        self.receiver = null;
        self.interval = null;
        self.init();
        self.checkHeartBeat();
        wsCollector.wsCollectList.push(self);
    }

    //发送错误日志
    sendErr(msg: any) {
        this.send(JSON.stringify({"errMsg": msg}));
    }

    /**
     * 发送数据
    */
    send(message: any) {
        if (this.state !== "OPEN") return;

        this.socket.write(encodeFrame(message));
    }

    getCollectlength() {
        return wsCollector.wsCollectList.length;
    }

    /**
     * 关闭链接
     */
    close(reason: any) {
        if (this.state == "CLOSE") return;

        let index = wsCollector.wsCollectList.indexOf(this);
        if (index > -1) {
            wsCollector.wsCollectList.splice(index, 1);
            console.log("socket已关闭");
        }
        
        // clearInterval(this.interval);//清除定时器
      
        // let msg = JSON.stringify({"onlineNum": this.getCollectlength()})
        // this.brocast(msg);
        this.emit('close', reason);
        this.state = "CLOSE";
        this.socket.destroy();
    }


    /**
     * 广播信息
     */
    brocast(message: any) {
        wsCollector.wsCollectList.forEach(function (ws: any) {
            if (ws && ws.state == "OPEN") {
                ws.send(message);
            }
        });
    }

    /**
     * 对socket进行事件绑定
     */
    init() {
        let self = this;

        this.socket.on('data', function (data: any) {
            // console.log("客户端发来的数据");
            self.dataHandle(data);
        });

        this.socket.on('close', function (e: any) {
            console.log("socket已关闭");
            self.close(e);
        });

        this.socket.on('error', function (e: any) {
            console.log("socket连接发生错误");
            self.close(e);
        });
    }

    /**
     * socket有数据过来的处理
     */
    dataHandle(data: any) {
        let self = this;
        let receiver: any = self.receiver;

        if (!receiver) {
            receiver = decodeFrame(data);

            if (receiver.opcode === 8) { // 关闭码
                self.close(new Error("client closed"));
                return;
            } else if (receiver.opcode === 9) { // ping码
                self.sendPong();
                return;
            } else if (receiver.opcode === 10) { // pong码
                self.pingTimes = 0;
                return;
            }

            self.receiver = receiver;

        } else {
            // 将新来的数据跟此前的数据合并
            receiver.payloadData = Buffer.concat(
                [receiver.payloadData, data],
                receiver.payloadData.length + data.length
            );

            // 更新数据剩余数
            receiver.remains -= data.length;
        }

        // 如果无剩余数据，则将receiver置为空
        if (receiver.remains <= 0) {
            receiver = parseData(self.receiver);

            if (receiver && typeof receiver == 'object') {//处理前端的请求数据
                try {
                    if (receiver["module"] && receiver["method"]) {
                        if (!self.req) self.req = {};
                        doModuleMethod(self.req, receiver["module"], receiver["method"], receiver["args"], (rst) => {
                            
                        })
                    } else {
                        
                    }
                } catch (e: any) {
                    self.sendErr(e.message);
                }
            } else {

            }
            this.receiver = null;
        }
    }

    /**
     * 心跳检测
     */
    checkHeartBeat() {
        let self = this;
        setTimeout(function () {
            if (self.state !== "OPEN") return;

            // 如果连续3次未收到pong回应，则关闭连接
            if (self.pingTimes >= 3) {
                self.close("time out");
                return;
            }


            //记录心跳次数
            self.pingTimes++;
            self.sendPing();

            self.checkHeartBeat();
        }, 60000);
    }

    /**
     * 发送ping
     */
    sendPing() {
        this.socket.write(Buffer.from([137, 0]))
    }

    /**
     * 发送pnong
     */
    sendPong() {
        this.socket.write(Buffer.from([138, 0]))
    }
}

/**
 * 对数据进行解码
*/
function decodeFrame(data: any) {
    let dataIndex = 2; //数据索引，因为第一个字节和第二个字节肯定不为数据，所以初始值为2
    let fin = data[0] >> 7; //获取fin位，因为是第一位，所以8位二进制往后推7位
    let opcode = data[0] & 0b1111; //获取第一个字节的opcode位，与00001111进行与运算
    let masked = data[1] >> 7; //获取masked位，因为是第一位，所以8位二进制往后推7位
    let payloadLength = data[1] & 0b1111111; //获取数据长度，与01111111进行与运算
    let maskingKey,
        payloadData,
        remains = 0;

    //如果为126，则后面16位长的数据为数据长度，如果为127，则后面64位长的数据为数据长度
    if (payloadLength == 126) {
        dataIndex += 2;
        payloadLength = data.readUInt16BE(2);
    } else if (payloadLength == 127) {
        dataIndex += 8;
        payloadLength = data.readUInt32BE(2) + data.readUInt32BE(6);
    }

    //如果有掩码，则获取32位的二进制masking key，同时更新index
    if (masked) {
        maskingKey = data.slice(dataIndex, dataIndex + 4);
        dataIndex += 4;
    }

    // 解析出来的数据
    payloadData = data.slice(dataIndex, dataIndex + payloadLength);

    // 剩余字节数
    remains = dataIndex + payloadLength - data.length;
    // console.log({
    //     fin,
    //     opcode,
    //     masked,
    //     maskingKey,
    //     remains,
    //     payloadData
    // });
    return {
        fin,
        opcode,
        masked,
        maskingKey,
        remains,
        payloadData
    }
}

/**
 * 解析接收到的数据，如果有maskingKey则进行异或运算
 * @param  {Object} receiver 为decodeFrame返回的参数
 * @return {String} 解析后得到的数据
 */
function parseData(receiver: any) {
    let result;

    if (receiver.maskingKey) {
        result = Buffer.alloc(receiver.payloadData.length);
        for (let i = 0; i < receiver.payloadData.length; i++) {
            //对每个字节进行异或运算，masked是4个字节，所以%4，借此循环
            result[i] = receiver.payloadData[i] ^ receiver.maskingKey[i % 4];
        }
    }

    result = (result || receiver.payloadData).toString();
    try {
        return JSON.parse(result);
    } catch(e) {
        return result;
    }  
}

/**
 * 对要发送的数据进行编码
 * @param  {String} message 要发送的数据
 * @return {Buffer}
 */
function encodeFrame(message: any) {
    message = String(message);
    let length = Buffer.byteLength(message);

    if (!length) return;

    //数据的起始位置，如果数据长度16位也无法描述，则用64位，即8字节，如果16位能描述则用2字节，否则用第二个字节描述
    let index = 2 + (length > 65535 ? 8 : (length > 125 ? 2 : 0));

    //定义buffer，长度为描述字节长度 + message长度
    let buffer = Buffer.alloc(index + length);

    //第一个字节，fin位为1，opcode为1
    buffer[0] = 129;

    //因为是由服务端发至客户端，所以无需masked掩码
    if (length > 65535) {
        buffer[1] = 127;

        //长度超过65535的则由8个字节表示，4个字节能表达的长度为4294967295，直接将前面4个字节置0
        buffer.writeUInt32BE(0, 2);
        buffer.writeUInt32BE(length, 6);
    } else if (length > 125) {
        buffer[1] = 126;

        //长度超过125的话就由2个字节表示
        buffer.writeUInt16BE(length, 2);
    } else {
        buffer[1] = length;
    }

    //写入正文
    buffer.write(message, index);

    return buffer;
}
module.exports = HWebSocket;


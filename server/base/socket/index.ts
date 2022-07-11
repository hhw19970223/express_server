import EventEmitter from "../eventEmitter/index";

class WsCollector extends EventEmitter {
    wsCollectList: any[] = [];//记入所有ws连接
}    
let wsCollector = new WsCollector();
export default wsCollector;
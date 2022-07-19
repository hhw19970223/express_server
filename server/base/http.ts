/// <reference path="./HWebSocket.ts" />
module H.Http {
    const debug = require('debug')('server:server');
    export let server_http: any;

    /** 创建 http服务 */
    export function createHttp(app: any, port: number) {
        const { createServer } = require('http');
        server_http = createServer(app);
        H.Ws.createWs(server_http);
        server_http.listen(port, () => {
            console.log("端口" + port + "启动成功")
        });
        server_http.on('error', onError);
        server_http.on('listening', onListening);
    }

    
    function onError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ?
            'Pipe ' + port :
            'Port ' + port;

        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    function onListening() {
        var addr = server_http.address();
        var bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}
namespace H {
    let routeMap: any = {};

    export function registerModule(module: string, methodMap: any): void {
        routeMap[module] = methodMap;
    }

    export function doModuleMethod(req: any, module: string, method: string, args: any, cb: (rst: any) => void): void {
        let methodMap: any = routeMap[module] || {};
        if (!methodMap[method]) throw "模块方法有误!";
        methodMap[method](req, args, cb);
    }
}
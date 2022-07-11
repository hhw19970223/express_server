// import { registerModule } from "../base/toModule";
import { writeFile, readFile, isExists } from "../base/tool/file";
import tool from "../base/tool/tool/index"

let envCode = {
    path: "../client/src/client/temporary/temporary.vue",
    createPath: "../client/src/client/create/create_%s.vue",
    async readFiley(req: any, args: any, cb: (rst?: any) => void) {
        let rst = readFile(this.path);
        return cb(rst);
    },

    async writeFile(req: any, args: any, cb: (rst?: any) => void) {
        writeFile(this.path, args.content);
        return cb();
    },

    async checkFile(req: any, args: any, cb: (rst?: any) => void) {
        isExists(this.createPath.replace(/%s/g, args.moduleName), (status) => {
            if (status) {//存在
                return cb(true);
            } else {
                return cb();
            }
        });   
    },

    //moduleName, fileName
    async createFile(req: any, args: any, cb: (rst?: any) => void) {
        let self = this;
        isExists(this.createPath.replace(/%s/g, args.moduleName), (status) => {
            if (!status) {//存在
                this.createMenu(args.moduleName, args.fileName);
                this.createRouter(args.moduleName);
            } 
            //先获取temporary.vue的内容
            let content = readFile(this.path);
            content = self.removeContent(content);
            //新建对应vue并将内容写入
            writeFile(this.createPath.replace(/%s/g, args.moduleName), content);
            // writeFile(this.path, '');
            return cb();
        });
    },

    //移除注释代码
    removeContent(content: string): string {
        let list = ["<!-- Content begin -->", "<!-- Content end -->", "//Form begin"
            , "//Form end", "//Rule begin", "//Rule end", "//Methods begin"
            , "//Methods end", "//MethodsName begin", "//MethodsName end"];
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            content = content.replace(new RegExp(item, 'g'), '');
        }

        content = tool.removeTextLine(content, "//remove begin", "//remove end", true);
        content = tool.removeSpace(content);
        return content;
    },

    templeteRouter: `        ["/create_%m", "create_%m", () => import('../client/create/create_%m.vue'), {}],`,
    templeteMenu: `                {
                    title: "%f",
                    path: "create_%m",
                },`,
    pathRouter: "../client/src/config/router.js",
    pathMenu: "../client/src/config/subMenu.js",

    createRouter(moduleName: string) {
        let addText = this.templeteRouter.replace(/%m/g, moduleName);
        let content = readFile(this.pathRouter);
        content = tool.addTextLine(content, '//以上开始写入', addText);
        writeFile(this.pathRouter, content);
    },

    createMenu(moduleName: string, fileName?: string) {
        let addText = this.templeteMenu.replace(/%m/g, moduleName);
        addText = addText.replace(/%f/g, fileName || moduleName);
        let content = readFile(this.pathMenu);
        content = tool.addTextLine(content, '//以上开始写入', addText);
        writeFile(this.pathMenu, content);
    },  
}
module.exports = envCode;
// registerModule("envCode", envCode);
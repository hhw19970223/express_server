/**
 * 将ts编译成js 
 *-w能够通过监听文件变化进行编译
 * server的一级目录不能取名index
 */
(async function() {
    const fs = require('fs');
    const childProcess = require('child_process');
    const exec = (shell, cb) => {
        childProcess.exec(shell, function (err, stdout, stderr) {
            if (err) {
                console.error("执行报错");
                console.error(err);
            } else {
                if (cb) cb();
            }
        })       
    }  

    // //d.ts文件
    // let shell_d = `tsc --declarationDir ./hhw.d`;
    // exec(shell_d, () => {
    //     console.log("声明文件生成成功");
    // })

    //js文件
    let module_map = {};

    //server二级目录以上处理
    async function getChildrenlist(_path, list) {
        const fileNames = await fs.promises.readdir(_path);
        if (fileNames && fileNames.length) {
            for (let i = 0; i < fileNames.length; i++) {
                let fileName = fileNames[i];
                if (fileName.indexOf(".ts") > -1) {
                    list.push(_path + `/` + fileName);
                } else {
                    await getChildrenlist(_path + `/` + fileName, list);
                }
            }
        }
    }

    //server一级目录下处理
    let boot_path = './server';
    const fileNames = await fs.promises.readdir(boot_path);
    if (fileNames && fileNames.length) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i];
            if (fileName.indexOf(".ts") > -1) {
                if (!module_map.index) module_map.index = [];
                module_map.index.push(boot_path + `/` + fileName);
            } else {
                //引用会自动导入进index，所以不用编译其他的。。。
                // module_map[fileName] = []
                // await getChildrenlist(boot_path + `/` + fileName, module_map[fileName]);
            }
        }
    }

    for (let key in module_map) {
        let shell = `tsc --outFile ./hhw/${key}.js ${module_map[key].join(' ')} -w`;
        exec(shell, () => {
            console.warn(`编译模块${key}成功`);
        }) 
    }
})();


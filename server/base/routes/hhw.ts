import { doModuleMethod } from "../toModule/index";
var express = require('express');
var router = express.Router();
var multiparty = require('multiparty')
import {moveContent} from '../tool/file/index'
 
/** hhw 这边data返回需要是个对象 方便给前端判断 */

router.get('/hhw', function(req: any, res: any, next: any) {
  let data: any = {};
  data.resultCode = 200
  try {
    doModuleMethod(req, req.query["modules"], req.query["method"], req.query["args"], (rst) => {
      data.data = rst;
      res.send(data);
    })
  } catch(e) {
    console.error(e);
    data.err = e;
    res.send(data);
  }
});

router.post('/hhw', function(req: any, res: any, next: any) {
  let data: any = {};
  data.resultCode = 200
  try {
    doModuleMethod(req, req.body["modules"], req.body["method"], req.body["args"], (rst) => {
      data.data = rst;
      res.send(data);
    })
  } catch (e) {
    console.error(e);  
    data.err = e;
    res.send(data);
  }
});

router.post("/fileXml", function (req: any, res: any, next: any) {
  let form = new multiparty.Form();
  form.encoding = 'utf-8';
  form.uploadDir = './file';
  form.parse(req, function (err: any, fields: any, files: any) {
    try {
      let inputFile = files.file[0];
      let newPath = form.uploadDir + '/db.xml';
      moveContent(inputFile.path, newPath, () => {
        doModuleMethod(req, "binlog", "analyzeXml", null, () => {
          res.send({ data: "上传成功！" });
        })
       
      })
    } catch (err) {
      console.log(err);
      res.send({ err: "上传失败！" });
    };
  })
});

router.post("/fileBinLog", function (req: any, res: any, next: any) {
  let form = new multiparty.Form();
  form.encoding = 'utf-8';
  form.uploadDir = './file';
  form.parse(req, function (err: any, fields: any, files: any) {
    try {
      let inputFile = files.file[0];
      let newPath = form.uploadDir + '/binlog.log';
      moveContent(inputFile.path, newPath, () => {
        doModuleMethod(req, "binlog", "analyzeBinlog", null, () => {
          res.send({ data: "上传成功！" });
        })
      })
    } catch (err) {
      console.log(err);
      res.send({ err: "上传失败！" });
    };
  })
});


module.exports = router;
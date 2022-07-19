/**
 * https://socket.io/docs/v4/server-api/
 */
module H.Router {
    export function create_router(express: any) {
        const router = express.Router();
        router.all('/hhw', function (req: any, res: any, next: any) {
            let data: any = {};
            data.resultCode = 200
            let query = req.query || req.body || {};
            try {
                doModuleMethod(req, query["modules"], query["method"], query["args"], (rst) => {
                    data.data = rst;
                    res.send(data);
                })
            } catch (e) {
                console.error(e);
                data.err = e;
                res.send(data);
            }
        });

        return router;
    }
}


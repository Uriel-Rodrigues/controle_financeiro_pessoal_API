import express, {Request, Response  } from "express";

const router = express.Router()

router.get("/test-connection", (req: Request, res: Response) => {
    res.status(200).json({
        message:"conexão realizada com sucesso!"
    })
})

export default router
import md5 from "md5";
import multer from "multer";
import { Request, Response, NextFunction } from "express";

class UploadFileMiddleware {
  public execute() {
    const storage = this.createStorage();

    const upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }).single("file");

    return (req: Request, res: Response, next: NextFunction) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).send({
              message: "O arquivo é muito grande. O limite máximo é de 5MB.",
            });
          }
          return res.status(400).send({ message: err.message });
        } else if (err) {
          return res.status(500).send({ message: "Erro ao processar o arquivo." });
        }
        next();
      });
    };
  }

  private createStorage() {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./uploads");
      },
      filename: function (req, file, cb) {
        const timestamp = Date.now();
        const userHash = md5(`${req.user}`);
        const fileName = `${timestamp}_${userHash}_${file.originalname}`;

        req.headers.fileName = fileName;
        cb(null, fileName);
      },
    });
  }
}

export const uploadFileMiddleware = new UploadFileMiddleware();
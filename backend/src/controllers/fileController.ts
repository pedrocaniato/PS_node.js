import { Request, Response } from "express";
import { UploadFileUseCase } from "../use-cases/file/uploadFile/uploadFileUseCase";
import { FileRepository } from "../repositories/fileRepository";
import { RetriveFileUseCase } from "../use-cases/file/retrive/retriveFilesUseCase";

class FileController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly retriveFileUseCase: RetriveFileUseCase
  ) {}

  public async upload(req: Request, res: Response) {
    try {
      console.log("UPLOAD: body:", req.body, "headers:", req.headers);
      const folderIdValue = req.body.folderId
        ? Number(req.body.folderId)
        : null;
      const folderId = isNaN(folderIdValue as number) ? null : folderIdValue;

      const response = await this.uploadFileUseCase.execute({
        fileName: req.headers.fileName as string,
        userId: Number(req.headers.user),
        folderId,
      });

      res.status(200).send({ file: response });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).send({ message });
    }
  }

  public async list(req: Request, res: Response) {
    try {
      console.log("LIST: query:", req.query, "headers:", req.headers);
      let folderId: number | null | undefined = null;

      if (req.query.all === "true") {
        folderId = undefined;
      } else if (req.query.folderId !== undefined) {
        const parsed = Number(req.query.folderId);
        folderId = isNaN(parsed) ? null : parsed;
      }

      console.log("LIST: Final folderId filter:", folderId);

      const response = await this.retriveFileUseCase.execute(
        Number(req.headers.user),
        folderId
      );

      res.status(200).send({ files: response });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).send({ message });
    }
  }
}

export const fileController = new FileController(
  new UploadFileUseCase(new FileRepository()),
  new RetriveFileUseCase(new FileRepository())
);
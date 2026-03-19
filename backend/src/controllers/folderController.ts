import { Request, Response } from "express";
import { CreateFolderUseCase } from "../use-cases/folder/create/createFolderUseCase";
import { ListFoldersUseCase } from "../use-cases/folder/list/listFoldersUseCase";
import { FolderRepository } from "../repositories/folderRepository";

class FolderController {
  constructor(
    private readonly createFolderUseCase: CreateFolderUseCase,
    private readonly listFoldersUseCase: ListFoldersUseCase
  ) {}

  public async create(req: Request, res: Response) {
    try {
      const response = await this.createFolderUseCase.execute({
        name: req.body.name,
        userId: Number(req.headers.user),
        parentId: req.body.parentId ? Number(req.body.parentId) : null,
      });

      res.status(200).send({ folder: response });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).send({ message });
    }
  }

  public async list(req: Request, res: Response) {
    try {
      const response = await this.listFoldersUseCase.execute(
        Number(req.headers.user)
      );

      res.status(200).send({ folders: response });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).send({ message });
    }
  }
}

const folderRepository = new FolderRepository();

export const folderController = new FolderController(
  new CreateFolderUseCase(folderRepository),
  new ListFoldersUseCase(folderRepository)
);
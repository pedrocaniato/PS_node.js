import { FolderRepository } from "../../../repositories/folderRepository";
import { Folder } from "../../../entities";

export class CreateFolderUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  public async execute(data: {
    name: string;
    userId: number;
    parentId?: number | null;
  }): Promise<Folder> {
    return this.folderRepository.save(data);
  }
}
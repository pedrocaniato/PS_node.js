import { FolderRepository } from "../../../repositories/folderRepository";
import { Folder } from "../../../entities";

export class ListFoldersUseCase {
  constructor(private readonly folderRepository: FolderRepository) {}

  public async execute(userId: number): Promise<Folder[]> {
    return this.folderRepository.findByUserId(userId);
  }
}
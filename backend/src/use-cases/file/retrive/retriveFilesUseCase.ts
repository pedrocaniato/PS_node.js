import { FileRepository } from "../../../repositories/fileRepository";
import { File } from "../../../entities";

export class RetriveFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  public async execute(userId: number, folderId?: number | null): Promise<File[]> {
    try {
      return this.fileRepository.findByUserId(userId, folderId);
    } catch (error) {
      return [];
    }
  }
}
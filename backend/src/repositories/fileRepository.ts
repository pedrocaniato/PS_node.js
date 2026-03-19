import { IsNull, Repository } from "typeorm";
import { AppDataSource } from "../database/appDataSource";
import { File } from "../entities";
import { UploadFileRequestDto } from "../use-cases/file/uploadFile/uploadFileRequest.dto";

export class FileRepository {
  private fileRepository: Repository<File>;

  constructor() {
    this.fileRepository = AppDataSource.getRepository(File);
  }

  public async save(file: UploadFileRequestDto): Promise<File> {
    return this.fileRepository.save(file);
  }

  public async findByUserId(
    userId: number,
    folderId?: number | null
  ): Promise<File[]> {
    const where: any = { userId };

    if (folderId !== undefined) {
      where.folderId = folderId === null ? IsNull() : folderId;
    }

    return this.fileRepository.find({ where });
  }
}
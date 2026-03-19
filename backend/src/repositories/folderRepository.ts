import { Repository } from "typeorm";
import { AppDataSource } from "../database/appDataSource";
import { Folder } from "../entities";

export class FolderRepository {
  private repository: Repository<Folder>;

  constructor() {
    this.repository = AppDataSource.getRepository(Folder);
  }

  public async save(folder: {
    name: string;
    userId: number;
    parentId?: number | null;
  }): Promise<Folder> {
    return this.repository.save(folder);
  }

  public async findByUserId(userId: number): Promise<Folder[]> {
    return this.repository.findBy({
      userId,
    });
  }

  public async findById(id: number): Promise<Folder | null> {
    return this.repository.findOneBy({ id });
  }
}
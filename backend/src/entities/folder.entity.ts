import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("folder")
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "integer" })
  userId: number;

  @Column({ type: "integer", nullable: true })
  parentId: number | null;
}
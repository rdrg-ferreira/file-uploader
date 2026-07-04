-- AlterTable
CREATE SEQUENCE file_id_seq;
ALTER TABLE "File" ALTER COLUMN "id" SET DEFAULT nextval('file_id_seq');
ALTER SEQUENCE file_id_seq OWNED BY "File"."id";

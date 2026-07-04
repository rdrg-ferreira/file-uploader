-- CreateTable
CREATE TABLE "File" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_name_key" ON "File"("name");

-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");

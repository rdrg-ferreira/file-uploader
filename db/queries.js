const prisma = require('./prisma.js');

exports.getUser = async ({ id, username }) => {
    if (id !== undefined) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    return await prisma.user.findFirst({
        where: { username },
    });
}

exports.createUser = async (name, username, password) => {
    return await prisma.user.create({
        data: {
            name: name,
            username: username,
            password: password,
        }
    });
}

exports.uploadFile = async (files, ownerId, folderId) => {
    return await prisma.file.createMany({
        data: files.map(file => ({
            name: file.originalname,
            size: file.size,
            path: file.path,
            ownerId,
            folderId,
        })),
    });
}

exports.uploadFolder = async (name, ownerId, parentId) => {
    return await prisma.folder.create({
        data: {
            name,
            ownerId,
            parentId,
        },
    });
};

exports.getFolderContent = async (folderId, userId) => {
    const parentId = folderId === undefined ? null : Number(folderId);

    const files = await prisma.file.findMany({
        where: { folderId: parentId, ownerId: userId },
    });

    const subfolders = await prisma.folder.findMany({
        where: { parentId: parentId, ownerId: userId },
    });

    return [files, subfolders];
}

exports.getFolder = async (folderId) => {
    return await prisma.folder.findUnique({
        where: { id: Number(folderId) },
    });
}

exports.getFile = async (fileId) => {
    return await prisma.file.findUnique({
        where: { id: Number(fileId) },
    });
}

exports.deleteFile = async (fileId) => {
    return await prisma.file.delete({
        where: { id: Number(fileId) },
        select: { id: true },
    });
}

exports.deleteFolderAndContent = async (folderId) => {
    await prisma.file.deleteMany({
        where: { folderId: Number(folderId) },
    });
    
    return await prisma.folder.delete({
        where: { id: Number(folderId) },
        select: { id: true },
    });
}
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
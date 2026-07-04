const prisma = require('./prisma.js');

async function main() {
  // create a new user
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
    //   posts: {
    //     create: {
    //       title: "Hello World",
    //       content: "This is my first post!",
    //       published: true,
    //     },
    //   },
    },
    // include: {
    //   posts: true, // returns all fields for all posts
    // },
  });
  console.log("Created user:", user);

  // fetch all users
  const allUsers = await prisma.user.findMany({
    // include: {
    //   posts: true,
    // },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

async function insertarEventoDB(name,filename) {
  return await prisma.eventos.create({
    data: { name , filename},
  });
}

async function listarEventosDB() {
  return await prisma.eventos.findMany();
}

export { insertarEventoDB, listarEventosDB }
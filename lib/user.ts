import { prisma } from "./prisma";
import { User, Link } from "@prisma/client";

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      id: id,
    },
  });
}

export async function getLinkByAlias(alias: string): Promise<Link | null> {
  return prisma.link.findFirst({
    where: {
      alias: alias,
    },
  });
}

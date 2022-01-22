import { prisma } from "./prisma";
import { User } from "@prisma/client";

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      id: id,
    },
  });
}

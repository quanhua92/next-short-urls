import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import { hash } from "../../lib/hash";
import { User, Role } from "@prisma/client";

type Data = {
  data?: {
    id: string;
    username: string;
  };
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { username, password, confirm } = req.body;
  console.log(username, password, confirm);

  if (password !== confirm) {
    res.status(400).json({ message: "Password validation failed" });
    return;
  }

  // check if user
  const prevUser = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      userName: username,
    },
  });

  if (prevUser !== null) {
    res.status(400).json({ message: "Invalid username/password" });
    return;
  }

  const firstAdmin = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      role: Role.ADMIN,
    },
  });
  console.log("first user", firstAdmin);
  let isAdmin = firstAdmin == null;

  const user = await prisma.user.create({
    data: {
      userName: username,
      password: await hash(password),
      role: isAdmin ? Role.ADMIN : Role.USER,
    },
  });

  res.status(200).json({
    data: {
      id: user.id,
      username: user.userName,
    },
    message: "Create user successfully",
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { prisma } from "../../lib/prisma";
import { verify } from "../../lib/hash";
import { sessionOptions } from "../../lib/session";
import { Role } from "@prisma/client";
import { UserSession } from "./user";

type Data = {
  message: string;
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { username, password } = req.body;

  // query user
  const user = await prisma.user.findFirst({
    select: {
      id: true,
      userName: true,
      password: true,
      role: true,
    },
    where: {
      userName: username,
    },
  });

  if (user === null) {
    res.status(400).json({ message: "Invalid username/password" });
    return;
  }

  let validPassword = await verify(password, user?.password as string);

  if (validPassword) {
    const userSession: UserSession = {
      isLoggedIn: true,
      admin: user.role === Role.ADMIN,
      id: user.id,
      username: user.userName,
    };
    req.session.user = userSession;
    await req.session.save();

    res.status(200).json({ message: "Login successfully" });
    return;
  }
  res.status(400).json({ message: "Invalid username/password" });
}

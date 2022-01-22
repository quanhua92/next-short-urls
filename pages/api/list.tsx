import { Link, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { prisma } from "../../lib/prisma";
import { sessionOptions } from "../../lib/session";
import { Role } from "@prisma/client";
import { getUserById } from "../../lib/user";

export type LinkResponse = {
  url: string;
  shortUrl: string;
  alias: string;
  domain: string;
  clicks: number;
};

export type Data = {
  data?: LinkResponse[];
  message?: string;
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const userSession = req.session.user;
  if (!userSession || (userSession && userSession.admin !== true)) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }

  const user = await getUserById(userSession.id);
  if (!user || (user && user.role !== Role.ADMIN)) {
    res.status(400).json({ data: [], message: "Unauthorized" });
    return;
  }

  const links = await prisma.link.findMany({
    select: {
      url: true,
      shortUrl: true,
      clicks: true,
      alias: true,
      domain: true,
    },
  });

  res.status(200).json({ data: links });
}

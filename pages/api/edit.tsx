import { Link, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { prisma } from "../../lib/prisma";
import { sessionOptions } from "../../lib/session";
import { Role } from "@prisma/client";
import { getUserById, getLinkByAlias } from "../../lib/user";

export type LinkResponse = {
  url: string;
  shortUrl: string;
  alias: string;
  domain: string;
  clicks: number;
};

export type Data = {
  data?: LinkResponse;
  message?: string;
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { url, alias } = req.body;
  const userSession = req.session.user;
  if (!userSession) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }

  const user = await getUserById(userSession.id);
  if (!user) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }

  if (user.role !== Role.ADMIN) {
    const link = await getLinkByAlias(alias as string);
    if (link === null || link?.userId !== user.id) {
      res.status(400).json({ message: "Unauthorized" });
      return;
    }
  }

  const link = await prisma.link.update({
    where: {
      alias: alias as string,
    },
    data: {
      url: url,
    },
  });

  if (link === null) {
    res.status(400).json({ message: "Invalid link" });
    return;
  }

  res.status(200).json({ data: link });
}

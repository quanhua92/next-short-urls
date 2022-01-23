import { Link, Role } from "@prisma/client";
import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { sessionOptions } from "../../lib/session";
import { getUserById } from "../../lib/user";

type Data = {
  data?: {
    url?: string;
    shortUrl?: string;
    clicks?: number;
  };
  message?: string;
};
export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { alias } = req.body;

  if (alias === undefined) {
    res.status(400).json({ message: `Missing alias input` });
    return;
  }

  const link = await prisma.link.findFirst({
    select: {
      url: true,
      shortUrl: true,
      clicks: true,
      userId: true,
    },
    where: {
      alias: alias as string,
    },
  });

  if (link === null) {
    res.status(400).json({ message: `${alias} not found` });
    return;
  }

  if (link.userId === null) {
    res.status(200).json({
      data: {
        url: link.url,
        shortUrl: link.shortUrl,
        clicks: link.clicks,
      },
    });
    return;
  }

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
    if (link?.userId !== user.id) {
      res.status(400).json({ message: "Unauthorized" });
      return;
    }
  }

  res.status(200).json({
    data: {
      url: link.url,
      shortUrl: link.shortUrl,
      clicks: link.clicks,
    },
  });
}

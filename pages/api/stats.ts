import { Link, Role } from "@prisma/client";
import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { sessionOptions } from "../../lib/session";
import { getUserById } from "../../lib/user";

export type LinkStats = {
  url?: string;
  shortUrl?: string;
  alias?: string;
  clicks?: number;
  userId?: string | null;
  histories?: { createdAt: number }[];
};

export async function getLinkStatsFromAlias(
  alias: string
): Promise<LinkStats | null> {
  const data = await prisma.link.findFirst({
    select: {
      shortUrl: true,
      alias: true,
      url: true,
      clicks: true,
      userId: true,
      histories: {
        select: {
          createdAt: true,
        },
      },
    },
    where: {
      alias: alias as string,
    },
  });
  if (data === null) {
    return null;
  }
  let { histories, ...rawData } = data;

  let link: LinkStats = { ...rawData, histories: [] };
  data.histories.map((x) => {
    const h = Math.floor(x.createdAt.getTime() / 1000);
    link?.histories?.push({
      createdAt: h,
    });
  });

  return link;
}

type Data = {
  data?: LinkStats;
  message?: string;
};
export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { alias } = req.body;

  if (alias === undefined) {
    res.status(400).json({ message: `Missing alias input` });
    return;
  }

  const link = await getLinkStatsFromAlias(alias as string);

  if (link === null) {
    res.status(400).json({ message: `${alias} not found` });
    return;
  }

  if (link.userId === null) {
    res.status(200).json({
      data: link,
    });
    return;
  }

  const userSession = req.session.user;
  if (
    !userSession ||
    (userSession.admin == false && link.userId !== userSession.id)
  ) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }
  const user = await getUserById(userSession.id);
  if (user === null) {
    res.status(400).json({ message: "Unauthorized" });
    return;
  }

  if (link.userId === user.id || user.role === Role.ADMIN) {
    res.status(200).json({
      data: link,
    });
    return;
  }

  res.status(400).json({ message: "Unauthorized" });
}

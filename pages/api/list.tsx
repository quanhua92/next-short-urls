import { Link, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import { prisma } from "../../lib/prisma";
import { sessionOptions } from "../../lib/session";
import { Role } from "@prisma/client";
import { getUserById } from "../../lib/user";

export type LinkResponse = {
  id: string;
  url: string;
  shortUrl: string;
  alias: string;
  domain: string;
  clicks: number;
  userId: string | null;
  createdAt: any;
};

export type Data = {
  data?: LinkResponse[];
  lastCursorId?: string;
  message?: string;
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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

  var condition: any = {};
  if (user.role !== Role.ADMIN) {
    condition = {
      userId: user.id,
    };
  }

  const { searchUrl, searchAlias, lastCursorId, limit } = req.query;

  if (searchUrl !== undefined) {
    condition["url"] = {
      contains: searchUrl,
    };
  }

  if (searchAlias !== undefined) {
    condition["alias"] = {
      contains: searchAlias,
    };
  }

  let rawLinks = null;
  let num_items_per_page = limit !== undefined ? Number(limit) : 10;
  if (lastCursorId !== undefined) {
    rawLinks = await prisma.link.findMany({
      select: {
        id: true,
        url: true,
        shortUrl: true,
        clicks: true,
        alias: true,
        domain: true,
        userId: true,
        createdAt: true,
      },
      take: num_items_per_page,
      skip: 1,
      cursor: {
        id: lastCursorId as string,
      },
      where: condition,
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    rawLinks = await prisma.link.findMany({
      select: {
        id: true,
        url: true,
        shortUrl: true,
        clicks: true,
        alias: true,
        domain: true,
        userId: true,
        createdAt: true,
      },
      take: num_items_per_page,
      where: condition,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  let links = rawLinks.map((link) => {
    let newLink: LinkResponse = link;
    newLink.createdAt = Math.floor(link.createdAt.getTime() / 1000);
    return newLink;
  });

  let cursorId = undefined;
  if (links.length > 0) {
    cursorId = links.at(links.length - 1)?.id;
  }

  res.status(200).json({ data: links, lastCursorId: cursorId });
}

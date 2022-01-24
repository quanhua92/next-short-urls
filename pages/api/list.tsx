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

  const { search_url, search_alias, last_cursor_id, num_items } = req.query;

  if (search_url !== undefined) {
    condition["url"] = {
      contains: search_url,
    };
  }

  if (search_alias !== undefined) {
    condition["alias"] = {
      contains: search_alias,
    };
  }

  let rawLinks = null;
  let num_items_per_page = num_items !== undefined ? Number(num_items) : 5;
  if (last_cursor_id !== undefined) {
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
        id: last_cursor_id,
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

  res.status(200).json({ data: links });
}

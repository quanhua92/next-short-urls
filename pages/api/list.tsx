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
  userId: string | null;
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

  const { search_url, search_alias } = req.body;

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

  const links = await prisma.link.findMany({
    select: {
      url: true,
      shortUrl: true,
      clicks: true,
      alias: true,
      domain: true,
      userId: true,
      createdAt: true,
    },
    where: condition,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({ data: links });
}

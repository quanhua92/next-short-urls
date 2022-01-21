import { Link } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

type Data = {
  data?: {
    url?: string;
    shortUrl?: string;
    clicks?: number;
  };
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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
    },
    where: {
      alias: alias as string,
    },
  });

  if (link === null) {
    res.status(200).json({ message: `${alias} not found` });
    return;
  }
  res.status(200).json({
    data: {
      url: link.url,
      shortUrl: link.shortUrl,
      clicks: link.clicks,
    },
  });
}

import { Link } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

type LinkResponse = {
  url: string;
  shortUrl: string;
  clicks: number;
};

type Data = {
  data?: LinkResponse[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const links = await prisma.link.findMany({
    select: {
      url: true,
      shortUrl: true,
      clicks: true,
    },
  });

  res.status(200).json({ data: links });
}

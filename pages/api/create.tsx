import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

type Data = {
  shortUrl?: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url, shortUrl } = req.body;
  try {
    // TODO: check if shortURL is valid or empty -> generate

    const link = await prisma.link.create({
      data: {
        url: url,
        shortUrl: shortUrl,
      },
    });

    res.status(200).json({
      shortUrl: shortUrl,
      message: `Created successfully: / ${shortUrl}`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: `Something went wrong when creating short url ${shortUrl}`,
    });
  }
}

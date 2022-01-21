import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import { Link } from "prisma/prisma-client";

type Data = {
  shortUrl?: string;
  message: string;
};

const GENERATED_SHORT_URL_LENGTH = 6;
const MAX_RETRY = 5;

const createLinkWithRetry = async function (
  url: string,
  shortUrl: string,
  random_length: number,
  retry: number
): Promise<Link | undefined> {
  var expectedShortUrl = shortUrl as string;

  for (let i = 0; i < retry; i++) {
    if (expectedShortUrl.length == 0) {
      const result = randomBytes(random_length / 2 + 1).toString("hex");
      expectedShortUrl = result.substring(0, random_length);
    }

    const existedLink = await prisma.link.findFirst({
      select: {
        shortUrl: true,
      },
      where: {
        shortUrl: expectedShortUrl,
      },
    });

    if (existedLink !== null) {
      expectedShortUrl = "";
      continue;
    }

    const link = await prisma.link.create({
      data: {
        url: url,
        shortUrl: expectedShortUrl,
      },
    });
    return link;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { url, shortUrl } = req.body;

  try {
    const link = await createLinkWithRetry(
      url,
      shortUrl,
      GENERATED_SHORT_URL_LENGTH,
      MAX_RETRY
    );
    if (link === undefined) {
      res.status(400).json({
        shortUrl: shortUrl,
        message: `Invalid short url: / ${shortUrl}`,
      });
      return;
    }
    res.status(200).json({
      shortUrl: link.shortUrl,
      message: `Created successfully: / ${link.shortUrl}`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: `Something went wrong when creating short url ${shortUrl}`,
    });
  }
}

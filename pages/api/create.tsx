import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import { Link } from "@prisma/client";
import { sessionOptions } from "../../lib/session";
import { withIronSessionApiRoute } from "iron-session/next";
import { getUserById } from "../../lib/user";

type Data = {
  data?: {
    url: string;
    shortUrl: string;
    domain: string;
    alias: string;
  };
  message: string;
};

const GENERATED_SHORT_URL_LENGTH = 6;
const MAX_RETRY = 5;
const DEFAULT_DOMAIN = "https://next-short-urls.vercel.app";

const createLinkWithRetry = async function (
  url: string,
  alias: string,
  userId: string | undefined,
  domain: string,
  random_length: number,
  retry: number
): Promise<Link | undefined> {
  var expectedAlias = alias as string;

  for (let i = 0; i < retry; i++) {
    if (expectedAlias.length == 0) {
      const result = randomBytes(random_length / 2 + 1).toString("hex");
      expectedAlias = result.substring(0, random_length);
    }

    const existedLink = await prisma.link.findFirst({
      select: {
        alias: true,
      },
      where: {
        alias: expectedAlias,
      },
    });

    if (existedLink !== null) {
      expectedAlias = "";
      continue;
    }

    const link = await prisma.link.create({
      data: {
        url: url,
        alias: expectedAlias,
        shortUrl: domain + "/" + expectedAlias,
        domain: domain,
        userId: userId,
      },
    });
    return link;
  }
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { url, alias } = req.body;
  const userSession = req.session.user;
  let userId = undefined;
  if (userSession) {
    const user = await getUserById(userSession.id);
    if (user) {
      userId = user.id;
    }
  }

  try {
    if (alias === undefined) {
      res.status(400).json({
        message: `Invalid alias: / ${alias}`,
      });
      return;
    }

    const link = await createLinkWithRetry(
      url,
      alias,
      userId,
      DEFAULT_DOMAIN,
      GENERATED_SHORT_URL_LENGTH,
      MAX_RETRY
    );
    if (link === undefined) {
      res.status(400).json({
        message: `Invalid alias: / ${alias}`,
      });
      return;
    }
    res.status(200).json({
      data: {
        url: link.url,
        shortUrl: link.shortUrl,
        alias: link.alias,
        domain: link.domain,
      },
      message: `Created successfully: / ${link.shortUrl}`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: `Something went wrong when creating alias ${alias}`,
    });
  }
}

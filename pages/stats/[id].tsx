import { GetServerSideProps, NextPage } from "next";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { prisma } from "../../lib/prisma";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getUserById } from "../../lib/user";
import { Role } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = withIronSessionSsr(
  async (ctx) => {
    const { id: alias } = ctx.query;
    const link = await prisma.link.findFirst({
      select: {
        shortUrl: true,
        alias: true,
        url: true,
        clicks: true,
        userId: true,
      },
      where: {
        alias: alias as string,
      },
    });

    if (link === null || link?.userId === null) {
      return {
        props: {
          link,
        },
      };
    }

    const userSession = ctx.req.session.user;
    if (
      !userSession ||
      (userSession.admin == false && link.userId !== userSession.id)
    ) {
      return {
        props: {
          link: null,
        },
      };
    }

    const user = await getUserById(userSession.id);
    if (user === null) {
      return {
        props: {
          link: null,
        },
      };
    }

    if (link.userId === user.id || user.role === Role.ADMIN) {
      return {
        props: {
          link: link,
        },
      };
    }

    return {
      props: {
        link: null,
      },
    };
  },
  sessionOptions
);

type LinkStats = {
  url?: string;
  shortUrl?: string;
  alias?: string;
  clicks?: number;
};

type Props = {
  link?: LinkStats | undefined;
};

const Stats: NextPage<Props> = function ({ link }) {
  const router = useRouter();

  useEffect(() => {
    if (link === null) {
      router.push("/");
    }
  });

  return (
    <div className="flex flex-col h-screen max-w-7xl items-center justify-center m-auto">
      <p className="py-3 px-3">Url: {link?.url}</p>
      <p className="py-3 px-3">shortUrl: {link?.shortUrl}</p>
      <p className="py-3 px-3">alias: {link?.alias}</p>
      <p className="py-3 px-3">Clicks: {link?.clicks}</p>
    </div>
  );
};

export default Stats;

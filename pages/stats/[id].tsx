import { GetServerSideProps, NextPage } from "next";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getUserById } from "../../lib/user";
import { Role } from "@prisma/client";
import { LinkStats, getLinkStatsFromAlias } from "../api/stats";

export const getServerSideProps: GetServerSideProps = withIronSessionSsr<Props>(
  async (ctx) => {
    const { id: alias } = ctx.query;
    const link = await getLinkStatsFromAlias(alias as string);

    if (link === null) {
      return {
        props: {},
      };
    }

    if (link.userId === null) {
      return {
        props: {
          link: link,
        },
      };
    }

    const userSession = ctx.req.session.user;
    if (
      !userSession ||
      (userSession.admin == false && link.userId !== userSession.id)
    ) {
      return {
        props: {},
      };
    }

    const user = await getUserById(userSession.id);
    if (user === null) {
      return {
        props: {},
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
      props: {},
    };
  },
  sessionOptions
);

type Props = {
  link?: LinkStats;
};

const Stats: NextPage<Props> = function ({ link }) {
  const router = useRouter();

  useEffect(() => {
    if (link === null || link === undefined) {
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

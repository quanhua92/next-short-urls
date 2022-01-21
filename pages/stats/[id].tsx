import { GetServerSideProps, NextPage } from "next";
import { prisma } from "../../lib/prisma";
import { Link } from "@prisma/client";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id: shortUrl } = ctx.query;
  const link = await prisma.link.findFirst({
    select: {
      shortUrl: true,
      url: true,
      clicks: true,
    },
    where: {
      shortUrl: shortUrl as string,
    },
  });

  if (link === null) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
      props: {},
    };
  }

  return {
    props: {
      link,
    },
  };
};

type Props = {
  link: Link;
};

const Stats: NextPage<Props> = function ({ link }) {
  return (
    <div className="flex flex-col h-screen max-w-7xl items-center justify-center m-auto">
      <p className="py-3 px-3">Url: {link.url}</p>
      <p className="py-3 px-3">shortUrl: {link.shortUrl}</p>
      <p className="py-3 px-3">Clicks: {link.clicks}</p>
    </div>
  );
};

export default Stats;

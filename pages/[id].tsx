import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id: alias } = ctx.query;
  const link = await prisma.link.findFirst({
    select: {
      alias: true,
      url: true,
    },
    where: {
      alias: alias as string,
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

  const { cookie: _cookie, ...info } = ctx.req.headers;
  const sessionInfo = JSON.stringify(info);

  const updatedLink = await prisma.link.update({
    select: {
      shortUrl: true,
      url: true,
    },
    where: {
      alias: link.alias,
    },
    data: {
      clicks: {
        increment: 1,
      },
      histories: {
        create: {
          sessionInfo: sessionInfo,
        },
      },
    },
  });

  return {
    redirect: {
      permanent: false,
      destination: updatedLink.url,
    },
    props: {},
  };
};

export default function Page() {
  return <div></div>;
}

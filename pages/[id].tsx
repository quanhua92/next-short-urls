import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id: alias } = ctx.query;
  const t0 = process.hrtime.bigint();

  const link = await prisma.link.findUnique({
    select: {
      alias: true,
      url: true,
    },
    where: {
      alias: alias as string,
    },
  });

  const t1 = process.hrtime.bigint();

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
  const t2 = process.hrtime.bigint();

  await prisma.link.update({
    select: {
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

  const t3 = process.hrtime.bigint();

  const time_query = Number(t1 - t0) / 1000000;
  const time_info = Number(t2 - t1) / 1000000;
  const time_update = Number(t3 - t2) / 1000000;

  ctx.res.setHeader(
    "Server-Timing",
    `0_query;dur=${time_query}, 1_info;dur=${time_info}, 2_update;dur=${time_update}`
  );

  return {
    redirect: {
      permanent: false,
      destination: link.url,
    },
    props: {},
  };
};

export default function Page() {
  return <div></div>;
}

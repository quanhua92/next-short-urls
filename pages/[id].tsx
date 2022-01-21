import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id: shortUrl } = ctx.query;
  const link = await prisma.link.findFirst({
    select: {
      shortUrl: true,
      url: true,
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

  const updatedLink = await prisma.link.update({
    select: {
      shortUrl: true,
      url: true,
    },
    where: {
      shortUrl: link.shortUrl,
    },
    data: {
      clicks: {
        increment: 1,
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

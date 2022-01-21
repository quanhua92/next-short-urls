import { prisma } from "../lib/prisma";

export const getServerSideProps = async (ctx) => {
  const { id: shortUrl } = ctx.query;
  const link = await prisma.link.findFirst({
    select: {
      shortUrl: true,
      url: true,
    },
    where: {
      shortUrl: shortUrl,
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

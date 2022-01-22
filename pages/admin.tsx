import useSWR from "swr";
import useUser from "../lib/useUser";
import type { Data } from "./api/list";
import Link from "next/link";

export default function Admin() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  const { data } = useSWR<Data>("/api/list");

  if (!user || user?.isLoggedIn == false) {
    return <div>...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-7xl items-center justify-center m-auto">
      Admin Page -{" "}
      <Link href="/">
        <a>Home</a>
      </Link>
      <ul>
        {data &&
          data.data?.map((link, i) => {
            return (
              <li key={i}>
                {link.url} | <a href={link.shortUrl}>{link.alias}</a> |{" "}
                {link.clicks}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

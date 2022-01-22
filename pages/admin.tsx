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
    <div className="flex flex-col h-screen max-w-7xl mx-auto">
      Admin Page -{" "}
      <Link href="/">
        <a>Home</a>
      </Link>
      <div className="flex flex-col">
        <div className="overflow-x-scroll">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Alias
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Short URL
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Original URL
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Clicks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data &&
                    data.data?.map((link, i) => {
                      return (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {link.alias}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {link.shortUrl}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {link.url}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {link.clicks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <a
                              href="#"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ul></ul>
    </div>
  );
}

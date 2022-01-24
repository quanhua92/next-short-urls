import useSWRInfinite from "swr/infinite";
import Link from "next/link";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import toast, { Toaster } from "react-hot-toast";
import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useUser from "../lib/useUser";
import { Data, LinkResponse } from "./api/list";

export const openInNewTab = (url: string): void => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

type FormData = {
  url: string;
  alias: string;
};
const FormSchema = z.object({
  url: z.string().nonempty({ message: "Please enter a URL" }).url(),
  alias: z.string().max(30),
});

export default function Admin() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  const API_LIST_URL = "/api/list";
  const API_LIST_LIMIT = 10;
  const getKey = (pageIndex: number, previousPageData: Data) => {
    // react the end
    if (
      previousPageData &&
      (!previousPageData.data || previousPageData.data.length === 0)
    )
      return null;

    // first page
    if (pageIndex === 0) return `${API_LIST_URL}?limit=${API_LIST_LIMIT}`;

    return `${API_LIST_URL}?limit=${API_LIST_LIMIT}&lastCursorId=${previousPageData.lastCursorId}`;
  };

  const { data, mutate, size, setSize } = useSWRInfinite<Data>(getKey);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentLink, setCurrentLink] = useState<LinkResponse | undefined>();
  const [isWorking, setIsWorking] = useState(false);
  const [actionType, setActionType] = useState<string>("");

  let hasMorePage = true;
  if (
    data?.at(data.length - 1)?.data?.length &&
    data?.at(data.length - 1)?.data?.length! < API_LIST_LIMIT
  ) {
    hasMorePage = false;
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  if (!user || user?.isLoggedIn == false) {
    return <div>...</div>;
  }

  const editLink = async (formData: FormData) => {
    try {
      setIsWorking(true);
      const resp = await fetch("/api/edit", {
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const response = await resp.json();
      if (resp.status != 200) {
        throw new Error(response.message);
      }
      if (data !== undefined) {
        let newData: Data[] = [];

        for (let index = 0; index < data.length; ++index) {
          const originData = data[index];

          let modifiedData: Data = {
            lastCursorId: originData.lastCursorId,
            message: originData.message,
            data: [],
          };
          for (
            let linkIndex = 0;
            linkIndex < originData.data!.length;
            linkIndex++
          ) {
            const link = originData.data![linkIndex];
            if (link.alias !== formData.alias) {
              modifiedData.data!.push(link);
            } else {
              modifiedData.data!.push(response.data);
            }
          }
          newData.push(modifiedData);
        }
        mutate(newData, false);
      }
      setOpenDialog(false);
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsWorking(false);
    }
  };
  const deleteLink = async (data: FormData) => {
    try {
      // setIsWorking(true);
      // await mutate(API_LIST_URL, async (originData: Data) => {
      //   const resp = await fetch("/api/delete", {
      //     body: JSON.stringify(data),
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     method: "POST",
      //   });
      //   const response = await resp.json();
      //   if (resp.status != 200) {
      //     throw new Error(response.message);
      //   }
      //   // TODO: Check the undefined condition here
      //   const filteredData = originData!.data!.filter(
      //     (link) => link.alias !== data.alias
      //   );
      //   const newData = {
      //     data: [...filteredData],
      //     message: originData.message,
      //   };
      //   return newData;
      // });
      // setOpenDialog(false);
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsWorking(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    try {
      if (actionType === "SAVE") {
        toast.promise(editLink(data), {
          loading: "Editing Your Short URL",
          success: "Success!",
          error: (err: Error) => {
            return `${err.message}`;
          },
        });
      } else if (actionType === "DELETE") {
        toast.promise(deleteLink(data), {
          loading: "Deleting Your Short URL",
          success: "Success!",
          error: (err: Error) => {
            return `${err.message}`;
          },
        });
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <Transition.Root show={openDialog} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-hidden"
          onClose={setOpenDialog}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <div className="w-screen max-w-md">
                  <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl">
                    <div className="min-h-0 flex-1 flex flex-col py-6 overflow-y-scroll">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Edit URL
                          </Dialog.Title>
                          <div className="ml-3 h-7 flex items-center">
                            <button
                              type="button"
                              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                              onClick={() => setOpenDialog(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 relative flex-1 px-4 sm:px-6">
                        <div className="h-full" aria-hidden="true">
                          {currentLink && (
                            <form
                              id="edit-url-form"
                              className="w-full"
                              onSubmit={handleSubmit(onSubmit)}
                            >
                              <div>
                                <input
                                  className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700 bg-gray-200"
                                  placeholder="Short Alias"
                                  type="text"
                                  readOnly
                                  defaultValue={currentLink.alias}
                                  {...register("alias")}
                                />
                                {errors.alias && (
                                  <div className="mb-3 text-normal text-red-500">
                                    {errors.alias.message}
                                  </div>
                                )}
                              </div>
                              <div className="mt-4">
                                <input
                                  className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700"
                                  placeholder="Input URL"
                                  type="text"
                                  defaultValue={currentLink.url}
                                  {...register("url", { required: true })}
                                />
                                {errors.url && (
                                  <div className="mb-3 text-normal text-red-500">
                                    {errors.url.message}
                                  </div>
                                )}
                              </div>
                            </form>
                          )}
                        </div>
                        {/* /End replace */}
                      </div>
                    </div>
                    <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                      <button
                        disabled={isWorking}
                        form="edit-url-form"
                        onClick={() => setActionType("SAVE")}
                        className="inline-flex justify-center py-2 px-10 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ml-4 bg-white py-2 px-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setOpenDialog(false)}
                      >
                        Cancel
                      </button>
                      <div className="grow"></div>
                      <button
                        disabled={isWorking}
                        form="edit-url-form"
                        onClick={() => setActionType("DELETE")}
                        className="ml-4 bg-red-600 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-100 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
                        User ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data &&
                      data.map((pageData, pageIndex) => {
                        return (
                          pageData &&
                          pageData.data?.map((link, i) => {
                            return (
                              <tr
                                key={`${pageIndex}-${i}`}
                                className={
                                  i % 2 === 1 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {link.alias}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <a href={link.shortUrl}>{link.shortUrl}</a>
                                </td>
                                <td className="max-w-xs truncate hover:text-clip overflow-hidden px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <a href={link.url}>{link.url}</a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {link.clicks}
                                </td>
                                <td className="max-w-[100px] truncate hover:text-clip px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {link.userId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await navigator.clipboard.writeText(
                                          `${link.shortUrl}`
                                        );
                                        console.log("Copied!");
                                      } catch (err) {
                                        console.log(err);
                                      }
                                    }}
                                    className="mr-3 text-blue-600 hover:text-blue-900"
                                  >
                                    Copy Short URL
                                  </button>
                                  <button
                                    onClick={() => {
                                      openInNewTab(`/stats/${link.alias}`);
                                    }}
                                    className="mr-3 text-blue-600 hover:text-blue-900"
                                  >
                                    Show Stats
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCurrentLink(link);
                                      reset({
                                        url: link.url,
                                        alias: link.alias,
                                      });
                                      setOpenDialog(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Edit URL
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mx-auto mb-10">
            {hasMorePage ? (
              <button
                className="rounded px-4 py-2 bg-blue-400 max-w-xs text-blue-100"
                onClick={() => setSize(size + 1)}
              >
                Load More
              </button>
            ) : (
              <div>React the end!</div>
            )}
          </div>
        </div>
        <ul></ul>
      </div>
    </>
  );
}

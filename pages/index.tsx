import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import useUser from "../lib/useUser";
import { LIST_DOMAINS } from "../lib/config";
import { ThumbUpIcon } from "@heroicons/react/solid";

type PreviousLink = {
  alias: string;
  shortUrl: string;
  domain: string;
};

type FormData = {
  url: string;
  alias: string;
  domain: string;
};

const FormSchema = z.object({
  url: z.string().nonempty({ message: "Please enter a URL" }).url(),
  alias: z.string().max(30),
  domain: z.string().nonempty().url(),
});

export default function Home() {
  const [isWorking, setIsWorking] = useState(false);
  const { user } = useUser();

  const [previousLinks, setPreviousLinks] = useState<PreviousLink[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const create = async (data: FormData) => {
    try {
      setIsWorking(true);
      const resp = await fetch("/api/create", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      if (resp.status != 200) {
        const data = await resp.json();
        throw new Error(data.message);
      }
      const link = await resp.json();

      setPreviousLinks([
        ...previousLinks,
        {
          alias: link.data.alias as string,
          shortUrl: link.data.shortUrl as string,
          domain: link.data.domain as string,
        },
      ]);
      reset({
        url: "",
        alias: "",
      });
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsWorking(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    try {
      toast.promise(create(data), {
        loading: "Creating Your Short URL",
        success: "Success!",
        error: (err: Error) => {
          return `${err.message}`;
        },
      });
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex h-screen max-w-5xl w-full m-auto items-center">
        <div className="flex flex-col basis-1/2">
          <span className="text-4xl py-4">Welcome to next-short-urls</span>

          <div className="text-2xl text-gray-900 mt-2">
            <ThumbUpIcon className="h-5 w-5 text-gray-900 inline-block mr-2" />
            Open Source
          </div>
          <div className="text-2xl text-gray-900 mt-2">
            <ThumbUpIcon className="h-5 w-5 text-gray-900 inline-block mr-2" />
            Easy Link Shortening
          </div>
          <div className="text-2xl text-gray-900 mt-2">
            <ThumbUpIcon className="h-5 w-5 text-gray-900 inline-block mr-2" />
            Full Link History
          </div>
          <div className="mt-10">
            <Link href="/signup">
              <a
                className="bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create free account
              </a>
            </Link>
            <a
              href="https://github.com/quanhua92/next-short-urls"
              className="ml-4 bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Code
            </a>
          </div>
        </div>
        <div className="basis-1/2 flex flex-col">
          <div>
            {user?.username ? (
              <div>
                <span>Current User: {user?.username} </span>
                <Link href="/admin">
                  <a>Admin Page</a>
                </Link>
                <Link href="/api/logout">
                  <a>Log out</a>
                </Link>
              </div>
            ) : (
              <div>
                <Link href="/login">
                  <a className="px-3 py-3">Log in</a>
                </Link>
                <Link href="/signup">
                  <a className="px-3 py-3">Sign up</a>
                </Link>
              </div>
            )}
          </div>
          <form
            className="w-full rounded border border-gray-300 border-solid py-10 px-10 mt-10"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <p className="py-2 text-sm font-semibold text-gray-700">
                Enter your long URL:
              </p>
              <input
                className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700"
                placeholder="Input URL"
                type="text"
                {...register("url", { required: true })}
              />
              {errors.url && (
                <div className="mb-3 text-normal text-red-500">
                  {errors.url.message}
                </div>
              )}
            </div>
            <p className=" mt-4 py-2 text-sm font-semibold text-gray-700">
              Customize your link:
            </p>
            <div className="flex w-full">
              <div className="basis-2/3">
                <select
                  className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700"
                  {...register("domain")}
                >
                  {LIST_DOMAINS.map((domain, i) => {
                    return (
                      <option value={domain} key={i}>
                        {domain}
                      </option>
                    );
                  })}
                </select>

                {errors.domain && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors.domain.message}
                  </div>
                )}
              </div>
              <div className="pl-4 basis-1/3">
                <input
                  className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700"
                  placeholder="alias"
                  type="text"
                  {...register("alias")}
                />
                {errors.alias && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors.alias.message}
                  </div>
                )}
              </div>
            </div>
            <button
              className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
              disabled={isWorking}
              type="submit"
            >
              Submit
            </button>
          </form>
          <div className="w-full mt-4">
            <ul>
              {previousLinks.map((previousLink, i) => {
                return (
                  <li
                    key={i}
                    className="py-3 px-3 border border-solid border-gray-300 my-3"
                  >
                    <span>Short Link: </span>
                    <Link href={`${previousLink.shortUrl}`} passHref>
                      <a className="text-blue-500 font-semibold">
                        {previousLink.shortUrl}
                      </a>
                    </Link>
                    <span> Stats: </span>
                    <Link href={`/stats/${previousLink.alias}`} passHref>
                      <a className="text-blue-500 font-semibold">
                        {`${previousLink.domain}/stats/${previousLink.alias}`}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

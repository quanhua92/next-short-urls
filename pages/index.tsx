import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import useUser from "../lib/useUser";

type FormData = {
  url: string;
  alias: string;
};

type PreviousLink = {
  alias: string;
  shortUrl: string;
  domain: string;
};

const FormSchema = z.object({
  url: z.string().nonempty({ message: "Please enter a URL" }).url(),
  alias: z.string().max(30),
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
      <div className="flex flex-col h-screen max-w-lg items-center justify-center m-auto">
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
          className="w-full border border-gray-300 border-solid py-10 px-10 mt-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
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
          <div className="mt-4">
            <input
              className="border-solid border-gray-300 border py-2 px-4 w-full rounded text-gray-700"
              placeholder="Short Alias"
              type="text"
              {...register("alias")}
            />
            {errors.alias && (
              <div className="mb-3 text-normal text-red-500">
                {errors.alias.message}
              </div>
            )}
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
    </>
  );
}

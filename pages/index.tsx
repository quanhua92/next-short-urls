import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

type FormData = {
  url: string;
  shortUrl: string;
};

const FormSchema = z.object({
  url: z.string().nonempty({ message: "Please enter a URL" }).url(),
  shortUrl: z.string().max(30),
});

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [isCreating, setIsCreating] = useState(false);
  const [previousLinks, setPreviousLinks] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const create = async (data: FormData) => {
    try {
      setIsCreating(true);
      const resp = await fetch("/api/create", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      if (resp.status != 200) {
        throw new Error("Server error.");
      }
      const link = await resp.json();

      setPreviousLinks([...previousLinks, link.shortUrl]);
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    try {
      toast.promise(create(data), {
        loading: "Creating Your Short URL",
        success: "Success!",
        error: "Something went wrong.",
      });
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-screen max-w-lg items-center justify-center m-auto">
        <form
          className="w-full border py-10 px-10 mt-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <input
              className="border-solid border-gray-3000 border py-2 px-4 w-full rounded text-gray-700"
              placeholder="Input URL"
              autoFocus
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
              className="border-solid border-gray-3000 border py-2 px-4 w-full rounded text-gray-700"
              placeholder="Short Handle"
              type="text"
              {...register("shortUrl")}
            />
            {errors.shortUrl && (
              <div className="mb-3 text-normal text-red-500">
                {errors.shortUrl.message}
              </div>
            )}
          </div>
          <motion.button
            className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
            disabled={isCreating}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
            type="submit"
          >
            Submit
          </motion.button>
        </form>
        <div className="w-full mt-4">
          <ul>
            {previousLinks.map((shortUrl, i) => {
              return <li key={i}>{shortUrl}</li>;
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

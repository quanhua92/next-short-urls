import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type FormData = {
  username: string;
  password: string;
};

const FormSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export default function Login() {
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const login = async (data: FormData) => {
    try {
      setIsWorking(true);
      const resp = await fetch("/api/login", {
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

      reset({
        username: "",
        password: "",
      });
      router.push("/");
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsWorking(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    try {
      toast.promise(login(data), {
        loading: "Logging in",
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
    <div className="flex flex-col h-screen max-w-7xl items-center justify-center m-auto">
      <Toaster />
      <form
        className="w-full border py-10 px-10 mt-10 max-w-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            className="border-solid border-gray-3000 border py-2 px-4 w-full rounded text-gray-700"
            placeholder="Username"
            autoFocus
            type="text"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <div className="mb-3 text-normal text-red-500">
              {errors.username.message}
            </div>
          )}
        </div>
        <div className="mt-4">
          <input
            className="border-solid border-gray-3000 border py-2 px-4 w-full rounded text-gray-700"
            placeholder="Password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <div className="mb-3 text-normal text-red-500">
              {errors.password.message}
            </div>
          )}
        </div>

        <button
          className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
          disabled={isWorking}
          type="submit"
        >
          Login
        </button>
      </form>
      <Link href="/signup" passHref>
        <a>Sign up</a>
      </Link>
    </div>
  );
}

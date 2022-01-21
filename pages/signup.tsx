import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

type FormData = {
  username: string;
  password: string;
  confirm: string;
};

const FormSchema = z
  .object({
    username: z.string().min(3),
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export default function SignUp() {
  const [isWorking, setIsWorking] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const signup = async (data: FormData) => {
    try {
      setIsWorking(true);
      const resp = await fetch("/api/signup", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      if (resp.status != 200) {
        throw new Error("Server error.");
      }

      // reset({
      //   username: "",
      //   password: "",
      //   confirm: "",
      // });
      // TODO: REDIRECT TO ADMIN PAGE OR INDEX PAGE
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsWorking(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    try {
      toast.promise(signup(data), {
        loading: "Signing up",
        success: "Success!",
        error: "Something went wrong.",
      });
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="flex h-screen max-w-7xl items-center justify-center m-auto">
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
        <div className="mt-4">
          <input
            className="border-solid border-gray-3000 border py-2 px-4 w-full rounded text-gray-700"
            placeholder="Confirm Password"
            type="password"
            {...register("confirm")}
          />
          {errors.confirm && (
            <div className="mb-3 text-normal text-red-500">
              {errors.confirm.message}
            </div>
          )}
        </div>
        <motion.button
          className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
          disabled={isWorking}
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
          Sign Up
        </motion.button>
      </form>
    </div>
  );
}

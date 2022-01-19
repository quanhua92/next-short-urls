import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });
  const onSubmit: SubmitHandler<FormData> = (data) => console.log(data);

  console.log(errors);

  return (
    <div className="flex h-screen max-w-7xl items-center justify-center m-auto">
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
        <button
          className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

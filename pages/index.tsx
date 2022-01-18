import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type FormData = {
  url: string;
  shortUrl: string;
};

const FormSchema = z.object({
  url: z.string().nonempty({ message: "Please enter a URL" }).url(),
  shortUrl: z.string().max(30),
});

export default function Home() {
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
        <button
          className="mt-4 w-full bg-blue-400 hover:bg-blue-600 text-blue-100 border shadow py-3 px-6 font-semibold rounded"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

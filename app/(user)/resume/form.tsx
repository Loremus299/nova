"use client";

import LoadingButton from "@/components/badcn/loadingButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { FilePlusCorner } from "lucide-react";
import FormController from "@/components/badcn/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { tailorNewResume } from "./action";
import { useRouter } from "next/navigation";

export const newResumeSchema = z.object({
	url: z.url(),
	description: z.string(),
});

export default function NewResumeForm() {
	const router = useRouter();
	const form = useForm({
		resolver: zodResolver(newResumeSchema),
		defaultValues: { url: "", description: "" },
	});

	const onSubmit = async (values: z.infer<typeof newResumeSchema>) => {
		const load = toast.add({ type: "loading", title: "Loading..." });
		const act = await tailorNewResume(values);
		toast.close(load);

		if (act.success) {
			toast.add({ type: "success", title: "Tailored your resume." });
			router.push(`/resume/${act.data}`);
		} else
			toast.add({
				type: "error",
				title: act.error.error,
				description: act.error.requestId,
			});
	};

	return (
		<form
			className="grid gap-4 w-xl portrait:w-full"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<FormController
				form={form}
				name="url"
				label="Job Posting URL"
				render={({ field, fieldState }) => (
					<Input
						{...field}
						aria-invalid={fieldState.invalid}
						id={field.name}
						placeholder="https://..."
					/>
				)}
			/>
			<FormController
				form={form}
				name="description"
				label="Job Description"
				render={({ field, fieldState }) => (
					<Textarea
						{...field}
						aria-invalid={fieldState.invalid}
						id={field.name}
						placeholder="Job Description, you can just copy paste it from job portal...."
					/>
				)}
			/>
			<LoadingButton loading={form.formState.isSubmitting} type="submit">
				<FilePlusCorner />
				Generate Tailored Resume
			</LoadingButton>
		</form>
	);
}

"use client";

import { userSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormController from "@/components/badcn/formController";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/badcn/loadingButton";
import { Check } from "lucide-react";
import FieldArrayController from "@/components/fieldArrayController";
import z from "zod";
import { toast } from "@/components/ui/toast";
import { addPersonalDetails } from "./action";

export default function UserDetailsForm() {
	const form = useForm({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			location: "",
			urls: [{ name: "", url: "" }],
		},
	});

	const onSubmit = async (values: z.infer<typeof userSchema>) => {
		const load = toast.add({ type: "loading", title: "Loading..." });
		const act = await addPersonalDetails(values);
		toast.close(load);

		if (act.success)
			toast.add({ type: "success", title: "Added personal details." });
		else
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
				label="Name"
				name="name"
				render={({ field, fieldState }) => (
					<Input
						{...field}
						id={field.name}
						aria-invalid={fieldState.invalid}
						placeholder="Jane Doe"
					/>
				)}
			/>
			<FormController
				form={form}
				label="Email"
				name="email"
				render={({ field, fieldState }) => (
					<Input
						{...field}
						type="email"
						id={field.name}
						aria-invalid={fieldState.invalid}
						placeholder="jane@doe.com"
					/>
				)}
			/>
			<FormController
				form={form}
				label="Phone Number"
				name="phone"
				render={({ field, fieldState }) => (
					<Input
						{...field}
						id={field.name}
						aria-invalid={fieldState.invalid}
						placeholder="+67 6666 7777"
					/>
				)}
			/>
			<FormController
				form={form}
				label="Physical Address"
				description="optional"
				name="location"
				render={({ field, fieldState }) => (
					<Input
						{...field}
						id={field.name}
						aria-invalid={fieldState.invalid}
						placeholder="Ottawa, Canada."
					/>
				)}
			/>
			<FieldArrayController
				form={form}
				name="urls"
				label="Links"
				defaultItem={{ name: "", url: "" }}
				className="flex items-start gap-2 border p-4"
				renderItem={(i) => (
					<div className="grid gap-4 flex-1">
						<FormController
							form={form}
							name={`urls.${i}.name`}
							label="Name"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="Portfolio"
								/>
							)}
						/>
						<FormController
							form={form}
							name={`urls.${i}.url`}
							label="URL"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="https://..."
								/>
							)}
						/>
					</div>
				)}
			/>
			<LoadingButton loading={form.formState.isSubmitting} type="submit">
				<Check /> Add these details
			</LoadingButton>
		</form>
	);
}

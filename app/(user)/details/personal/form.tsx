"use client";

import { userSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormController from "@/components/badcn/formController";
import { Input } from "@/components/ui/input";
import KeyValueInput from "@/components/kvInput";
import LoadingButton from "@/components/badcn/loadingButton";
import { Check } from "lucide-react";
import z from "zod";
import addUserDetails from "@/actions/details/user-details";
import { toast } from "@/components/ui/toast";

export default function UserDetailsForm() {
	const form = useForm({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			location: "",
			urls: {},
		},
	});

	const onSubmit = async (values: z.infer<typeof userSchema>) => {
		toast.promise(
			addUserDetails(values).then((res) => {
				if (!res.success) throw new Error(res.error);
			}),
			{
				loading: "Adding resume details...",
				error: (e: Error) => e.message,
				success: "Successfully added resume details",
			},
		);
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
			<FormController
				form={form}
				label="Links"
				description="Add your portfolio, LinkedIn, blog, or any other links."
				name="urls"
				render={({ field }) => (
					<KeyValueInput<string>
						value={field.value ?? {}}
						onChange={field.onChange}
						createValue={() => ""}
						renderValue={({ value, onChange }) => (
							<Input
								type="url"
								value={value}
								onChange={(e) => onChange(e.target.value)}
								placeholder="https://..."
							/>
						)}
					/>
				)}
			/>
			<LoadingButton loading={form.formState.isSubmitting} type="submit">
				<Check /> Add these details
			</LoadingButton>
		</form>
	);
}

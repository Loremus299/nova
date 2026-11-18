"use client";

import { userSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormController from "@/components/badcn/formController";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/badcn/loadingButton";
import { Check } from "lucide-react";

export default function UserDetailsForm() {
	const form = useForm({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			location: "",
			urls: [{}],
		},
	});

	return (
		<form className="grid gap-4 w-xl portrait:w-full">
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
			<LoadingButton loading={form.formState.isSubmitting} type="submit">
				<Check /> Add these details
			</LoadingButton>
		</form>
	);
}

"use client";

import FormController from "@/components/badcn/formController";
import FieldArrayController from "@/components/fieldArrayController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { experienceSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import LoadingButton from "@/components/badcn/loadingButton";
import { addExperienceDetails } from "./action";
import { toast } from "@/components/ui/toast";

const schema = z.object({ experience: experienceSchema });

export default function ExperienceDetailsForm({
	defaultValues,
}: {
	defaultValues?: z.infer<typeof experienceSchema>;
}) {
	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			experience: defaultValues ?? [
				{
					company: "",
					duration: "",
					role: "",
					highlights: [{ highlight: "" }],
				},
			],
		},
	});

	const onSubmit = async (values: z.infer<typeof schema>) => {
		const load = toast.add({ type: "loading", title: "Loading..." });
		const act = await addExperienceDetails(values.experience);
		toast.close(load);

		if (act.success)
			toast.add({ type: "success", title: "Added educational details." });
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
			<FieldArrayController
				form={form}
				name="experience"
				label=""
				className="flex items-start border p-4"
				defaultItem={{
					company: "",
					duration: "",
					role: "",
					highlights: [{ highlight: "" }],
				}}
				renderItem={(i) => (
					<div className="flex-1 grid gap-4">
						<FormController
							form={form}
							name={`experience.${i}.company`}
							label="Company"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="Palantir DE"
								/>
							)}
						/>
						<FormController
							form={form}
							name={`experience.${i}.role`}
							label="Role"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="Senior genocide manager"
								/>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormController
								form={form}
								name={`experience.${i}.duration`}
								label="Duration"
								render={({ field, fieldState }) => (
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder="1939-1945"
									/>
								)}
							/>
						</div>
						<FieldArrayController
							form={form}
							className="flex items-start border p-4 border-dashed"
							name={`experience.${i}.highlights`}
							label="Highlights"
							defaultItem={{ highlight: "" }}
							renderItem={(j) => (
								<FormController
									form={form}
									label="Highlight"
									name={`experience.${i}.highlights.${j}.highlight`}
									render={({ field, fieldState }) => (
										<Textarea
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Managed the queer identification & genocide division"
										/>
									)}
								/>
							)}
						/>
					</div>
				)}
			/>
			<LoadingButton loading={form.formState.isSubmitting} type="submit">
				<Check />
				Add These Details
			</LoadingButton>
		</form>
	);
}

"use client";

import FormController from "@/components/badcn/formController";
import FieldArrayController from "@/components/fieldArrayController";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { educationSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function EducationDetailsForm() {
	const form = useForm({
		resolver: zodResolver(z.object({ education: educationSchema })),
		defaultValues: {
			education: [
				{
					institution: "",
					qualification: "",
					grade: "",
					duration: "",
					highlights: [{ highlight: "" }],
				},
			],
		},
	});

	return (
		<form className="grid gap-4 w-xl portrait:w-full">
			<FieldArrayController
				form={form}
				name="education"
				label=""
				className="flex items-start border p-4"
				defaultItem={{
					duration: "",
					institution: "",
					qualification: "",
					grade: "",
					highlights: [{ highlight: "" }],
				}}
				renderItem={(i) => (
					<div className="flex-1 grid gap-4">
						<FormController
							form={form}
							name={`education.${i}.institution`}
							label="Institution"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="Hogwarts School of Computer Engineering"
								/>
							)}
						/>
						<FormController
							form={form}
							name={`education.${i}.qualification`}
							label="Qualification"
							render={({ field, fieldState }) => (
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="BTech in Potions with Minor in Card Tricks"
								/>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormController
								form={form}
								name={`education.${i}.qualification`}
								label="Duration"
								render={({ field, fieldState }) => (
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder="2023-2027"
									/>
								)}
							/>
							<FormController
								form={form}
								name={`education.${i}.qualification`}
								label="Grade"
								render={({ field, fieldState }) => (
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder="3.8/4"
									/>
								)}
							/>
						</div>
						<FieldArrayController
							form={form}
							className="flex items-start border p-4 border-dashed"
							name={`education.${i}.highlights`}
							label="Highlights"
							defaultItem={{ highlight: "" }}
							renderItem={(j) => (
								<FormController
									form={form}
									label="Highlight"
									name={`education.${i}.highlights.${j}.highlight`}
									render={({ field, fieldState }) => (
										<Textarea
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="Top of class in 2025"
										/>
									)}
								/>
							)}
						/>
					</div>
				)}
			/>
			<Button>
				<Check />
				Add These Details
			</Button>
		</form>
	);
}

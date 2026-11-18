import {
	ArrayPath,
	FieldArray,
	FieldValues,
	get,
	useFieldArray,
	UseFormReturn,
} from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { ComponentProps } from "react";

type Props<T extends FieldValues, K extends ArrayPath<T>> = {
	form: UseFormReturn<T>;
	name: K;
	label: string;
	description?: string;
	defaultItem: FieldArray<T, K>;
	renderItem: (index: number) => React.ReactNode;
} & ComponentProps<"div">;

export default function FieldArrayController<
	T extends FieldValues,
	K extends ArrayPath<T>,
>({
	form,
	name,
	label,
	description,
	defaultItem,
	renderItem,
	...divProps
}: Props<T, K>) {
	const fieldArray = useFieldArray({ name, control: form.control });
	const rootError = get(form.formState.errors, `${name}.root`) as
		| { message?: string }
		| undefined;

	return (
		<Field data-invalid={!!rootError}>
			<FieldLabel>{label}</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			{fieldArray.fields.map((f, i) => (
				<div key={f.id} {...divProps}>
					{renderItem(i)}
					<Button type="button" onClick={() => fieldArray.remove(i)}>
						-
					</Button>
				</div>
			))}
			<Button type="button" onClick={() => fieldArray.append(defaultItem)}>
				+
			</Button>
			<FieldError errors={[rootError]} />
		</Field>
	);
}

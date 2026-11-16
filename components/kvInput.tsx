"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "cn";

type KeyValueInputProps<T> = {
	value: Record<string, T>;
	onChange: (value: Record<string, T>) => void;
	createValue: () => T;
	renderValue: (props: { value: T; onChange: (value: T) => void }) => ReactNode;
	className?: string;
};

export default function KeyValueInput<T>({
	value,
	onChange,
	createValue,
	renderValue,
	className,
}: KeyValueInputProps<T>) {
	const [key, setKey] = useState("");

	function add() {
		const name = key.trim();

		if (!name || Object.hasOwn(value, name)) return;

		onChange({
			...value,
			[name]: createValue(),
		});

		setKey("");
	}

	function remove(name: string) {
		const next = { ...value };
		delete next[name];
		onChange(next);
	}

	function update(name: string, nextValue: T) {
		onChange({
			...value,
			[name]: nextValue,
		});
	}

	return (
		<div className={cn("grid gap-4", className)}>
			{Object.entries(value).map(([name, entry]) => (
				<div key={name} className="grid gap-2 rounded-md border p-4 pt-1">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">{name}</span>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => remove(name)}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>

					{renderValue({
						value: entry,
						onChange: (next) => update(name, next),
					})}
				</div>
			))}

			<div className="flex gap-2">
				<Input
					value={key}
					onChange={(e) => setKey(e.target.value)}
					placeholder="Key (e.g. LinkedIn)"
				/>

				<Button
					type="button"
					variant="outline"
					onClick={add}
					disabled={!key.trim() || Object.hasOwn(value, key.trim())}
				>
					<Plus className="size-4" />
					Add
				</Button>
			</div>
		</div>
	);
}

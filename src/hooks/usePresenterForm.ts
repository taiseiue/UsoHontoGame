"use client";

// usePresenterForm Hook
// Feature: 002-game-preparation
// Custom hook for presenter creation form with Zod validation

import { useState, useTransition } from "react";
import { AddPresenterSchema } from "@/server/domain/schemas/gameSchemas";
import { addPresenterAction } from "@/app/actions/presenter";
import type { PresenterWithLieDto } from "@/server/application/dto/PresenterWithLieDto";

interface UsePresenterFormProps {
	/** Game ID to add presenter to */
	gameId: string;
	/** Callback on successful presenter addition */
	onSuccess?: (presenter: PresenterWithLieDto) => void;
}

interface UsePresenterFormReturn {
	/** Form submission handler */
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	/** Whether form is currently submitting */
	isSubmitting: boolean;
	/** Validation errors by field */
	errors: Record<string, string[]>;
	/** Created presenter data on success */
	createdPresenter: PresenterWithLieDto | null;
	/** Whether creation was successful */
	isSuccess: boolean;
	/** Reset form state */
	reset: () => void;
}

/**
 * Custom hook for presenter creation form
 * Handles form validation, submission, and error display
 * @param props Game ID and success callback
 * @returns Form state and handlers
 */
export function usePresenterForm({
	gameId,
	onSuccess,
}: UsePresenterFormProps): UsePresenterFormReturn {
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [createdPresenter, setCreatedPresenter] =
		useState<PresenterWithLieDto | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const reset = () => {
		setErrors({});
		setCreatedPresenter(null);
		setIsSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		setIsSuccess(false);

		const formData = new FormData(e.currentTarget);
		formData.set("gameId", gameId);

		// Client-side validation with Zod
		const rawData = {
			gameId: formData.get("gameId"),
			nickname: formData.get("nickname"),
		};

		const validationResult = AddPresenterSchema.safeParse(rawData);

		if (!validationResult.success) {
			setErrors(validationResult.error.flatten().fieldErrors);
			return;
		}

		// Server action call with transition
		startTransition(async () => {
			try {
				const result = await addPresenterAction(formData);

				if (result.success) {
					setCreatedPresenter(result.presenter);
					setIsSuccess(true);
					onSuccess?.(result.presenter);
					// Reset form after short delay
					setTimeout(() => {
						reset();
					}, 1000);
				} else {
					setErrors(result.errors);
				}
			} catch (error) {
				console.error("Form submission error:", error);
				setErrors({
					_form: ["予期しないエラーが発生しました"],
				});
			}
		});
	};

	return {
		handleSubmit,
		isSubmitting: isPending,
		errors,
		createdPresenter,
		isSuccess,
		reset,
	};
}

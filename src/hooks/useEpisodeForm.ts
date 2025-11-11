"use client";

// useEpisodeForm Hook
// Feature: 002-game-preparation
// Custom hook for episode creation form with Zod validation

import { useState, useTransition } from "react";
import { AddEpisodeSchema } from "@/server/domain/schemas/gameSchemas";
import { addEpisodeAction } from "@/app/actions/presenter";
import type { EpisodeWithLieDto } from "@/server/application/dto/EpisodeWithLieDto";

interface UseEpisodeFormProps {
	/** Presenter ID to add episode to */
	presenterId: string;
	/** Callback on successful episode addition */
	onSuccess?: (episode: EpisodeWithLieDto) => void;
}

interface UseEpisodeFormReturn {
	/** Form submission handler */
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	/** Whether form is currently submitting */
	isSubmitting: boolean;
	/** Validation errors by field */
	errors: Record<string, string[]>;
	/** Created episode data on success */
	createdEpisode: EpisodeWithLieDto | null;
	/** Whether creation was successful */
	isSuccess: boolean;
	/** Reset form state */
	reset: () => void;
}

/**
 * Custom hook for episode creation form
 * Handles form validation, submission, and error display
 * @param props Presenter ID and success callback
 * @returns Form state and handlers
 */
export function useEpisodeForm({
	presenterId,
	onSuccess,
}: UseEpisodeFormProps): UseEpisodeFormReturn {
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<Record<string, string[]>>({});
	const [createdEpisode, setCreatedEpisode] =
		useState<EpisodeWithLieDto | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const reset = () => {
		setErrors({});
		setCreatedEpisode(null);
		setIsSuccess(false);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		setIsSuccess(false);

		const formData = new FormData(e.currentTarget);
		formData.set("presenterId", presenterId);

		// Client-side validation with Zod
		const rawData = {
			presenterId: formData.get("presenterId"),
			text: formData.get("text"),
			isLie: formData.get("isLie") === "true",
		};

		const validationResult = AddEpisodeSchema.safeParse(rawData);

		if (!validationResult.success) {
			setErrors(validationResult.error.flatten().fieldErrors);
			return;
		}

		// Server action call with transition
		startTransition(async () => {
			try {
				const result = await addEpisodeAction(formData);

				if (result.success) {
					setCreatedEpisode(result.episode);
					setIsSuccess(true);
					onSuccess?.(result.episode);
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
		createdEpisode,
		isSuccess,
		reset,
	};
}

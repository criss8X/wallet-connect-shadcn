import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, Droplet } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { Chain } from "viem";
import { useChainId, useChains, useSwitchChain } from "wagmi";
import { cn } from "@/lib/utils";
import { AlertDialogTrigger } from "./AlertDialog";
import { Button } from "./Button";

const chainSelectorDotVariants = cva("size-2 rounded-full ring-2", {
	variants: {
		variant: {
			orange: "bg-orange-500 ring-orange-500/30",
			yellow: "bg-yellow-500 ring-yellow-500/30",
			lime: "bg-lime-500 ring-lime-500/30",
			green: "bg-green-500 ring-green-500/30",
			teal: "bg-teal-500 ring-teal-500/30",
			blue: "bg-blue-500 ring-blue-500/30",
			indigo: "bg-indigo-500 ring-indigo-500/30",
			violet: "bg-violet-500 ring-violet-500/30",
		},
	},
	defaultVariants: {
		variant: "violet",
	},
});

type ChainDotVariants = NonNullable<
	VariantProps<typeof chainSelectorDotVariants>["variant"]
>;

export type ChainSelectorTriggerProps = {
	children?: (selectedChain?: Chain) => React.ReactNode;
	dotVariant?: ChainDotVariants;
} & Omit<React.ComponentProps<"button">, "children">;

export function ChainSelectorTrigger({
	children,
	className,
	"aria-label": ariaLabel = "Select Network",
	dotVariant,
	...props
}: ChainSelectorTriggerProps) {
	const chains = useChains();
	const chainId = useChainId();

	const selectedChain = useMemo(
		() => chains.find((chain) => chain.id === chainId),
		[chainId, chains],
	);

	return (
		<AlertDialogTrigger asChild>
			{children !== undefined ? (
				children(selectedChain)
			) : (
				<Button
					variant="outline"
					className={cn("px-2", className)}
					aria-label={ariaLabel}
					{...props}
				>
					<div className="flex gap-2 items-center size-full">
						<div
							className={chainSelectorDotVariants({
								variant: dotVariant ?? getChainDotVariant(chainId),
							})}
						/>

						<span className="leading-relaxed">
							{selectedChain?.name ?? "Unknown"}
						</span>
					</div>

					<ChevronDown />
				</Button>
			)}
		</AlertDialogTrigger>
	);
}

export type ChainListChildrenProps = {
	chains: readonly Chain[];
	switchChain: (props: { chainId: number }) => void;
};

export type ChainListViewProps = {
	className?: string;
	children?: (props: ChainListChildrenProps) => React.ReactNode;
};

export function ChainListView({ className, children }: ChainListViewProps) {
	const chainId = useChainId();
	const { chains, switchChain } = useSwitchChain();
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		listRef.current?.querySelector("button")?.focus();
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, index: number) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();

				const focusedIndexOverflow =
					e.key === "ArrowDown"
						? index + 1
						: e.key === "ArrowUp"
							? index - 1
							: index;

				const safeFocusedIndex = focusedIndexOverflow % chains.length;

				listRef.current
					?.querySelectorAll("button")
					?.item(safeFocusedIndex)
					?.focus();
			} else if (e.key === " " || e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();

				if (e.currentTarget instanceof HTMLButtonElement) {
					e.currentTarget.focus();
				}

				switchChain({ chainId: chains[index].id });
			}
		},
		[chains, switchChain],
	);

	return (
		<div ref={listRef} className={cn("flex flex-col gap-2 mt-1", className)}>
			{children !== undefined ? (
				children({ chains, switchChain })
			) : chains.length === 0 ? (
				<div className="flex flex-col gap-2 items-center justify-center">
					<Droplet className="size-14" />

					<div className="text-center">No chains available</div>
				</div>
			) : (
				chains.map(({ id, name }, index) => (
					<Button
						key={id}
						aria-label={`Switch to ${name}`}
						aria-selected={id === chainId}
						variant={id === chainId ? "default" : "ghost"}
						className={cn(
							"justify-between focus-visible:ring-0 focus-visible:dark:ring-0 aria-[selected=false]:focus-visible:bg-accent aria-[selected=true]:focus-visible:bg-primary/90",
							className,
						)}
						onKeyDown={(e) => handleKeyDown(e, index)}
						onClick={() => {
							try {
								switchChain({ chainId: id });
							} catch (err) {
								console.error("Failed to switch chain", err);

								toast.error("Failed to switch chain", {
									dismissible: true,
								});
							}
						}}
					>
						<span>{name}</span>

						{id === chainId && <span className="text-xs">Connected</span>}
					</Button>
				))
			)}
		</div>
	);
}

export function getChainDotVariant(chainId: number): ChainDotVariants {
	const variants: ChainDotVariants[] = [
		"orange",
		"yellow",
		"lime",
		"green",
		"teal",
		"blue",
		"indigo",
		"violet",
	];

	const colorIndex = Math.abs(chainId) % variants.length;

	return variants[colorIndex];
}

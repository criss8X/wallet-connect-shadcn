import { default as React } from 'react';
import { Address } from 'viem';
import type * as AvatarPrimitive from "@radix-ui/react-avatar";
export declare function ConnectWallet(): import("react/jsx-runtime").JSX.Element;
export declare function ChainSwitcherDialog({ children, }: {
    children: (currentChainName: string) => React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function WagmiAccount({ address, children, }: {
    address: Address;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
type AccountAvatarImageProps = Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, "children" | "asChild"> & {
    address: Address;
    defaultAvatarUrl?: string | undefined;
};
export declare function AccountAvatarImage({ className, address, defaultAvatarUrl, ...props }: AccountAvatarImageProps): import("react/jsx-runtime").JSX.Element;
type AccountBalanceProps<T extends React.ElementType> = {
    as?: T;
    className?: string;
} & React.ComponentPropsWithoutRef<T>;
export declare function AccountBalance<T extends React.ElementType = "span">({ className, as: Component, ...props }: AccountBalanceProps<T>): import("react/jsx-runtime").JSX.Element;
export declare function truncateAddress(address: Address): string;
export {};

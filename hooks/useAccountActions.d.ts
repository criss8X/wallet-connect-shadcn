export declare function useAccountActions(): {
    address: `0x${string}` | undefined;
    isCopied: boolean;
    handleCopyToClipboard: () => Promise<void>;
    handleDisconnect: () => Promise<void>;
};

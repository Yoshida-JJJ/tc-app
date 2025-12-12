import { useState, useEffect } from 'react';

export interface Bank {
    code: string;
    name: string;
    kana: string;
    hira: string;
    roma: string;
}

export interface Branch {
    code: string;
    name: string;
    kana: string;
    hira: string;
    roma: string;
}

const ZENGIN_BASE_URL = 'https://zengin-code.github.io/api';

export function useZengin() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch All Banks on mount
    useEffect(() => {
        const fetchBanks = async () => {
            setLoadingBanks(true);
            try {
                const res = await fetch(`${ZENGIN_BASE_URL}/banks.json`);
                if (!res.ok) throw new Error('Failed to fetch bank data');
                const data = await res.json();
                // The data is an object where keys are codes, or array? 
                // Zengin data format: { "0001": { code: "0001", name: "みずほ", ... }, ... }
                // Convert to array
                const bankList = Object.values(data) as Bank[];
                setBanks(bankList);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load bank list.');
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();
    }, []);

    // Fetch Branches for a specific bank
    const fetchBranches = async (bankCode: string) => {
        if (!bankCode) {
            setBranches([]);
            return;
        }
        setLoadingBranches(true);
        setBranches([]); // Clear previous
        try {
            const res = await fetch(`${ZENGIN_BASE_URL}/branches/${bankCode}.json`);
            if (!res.ok) throw new Error('Failed to fetch branch data');
            const data = await res.json();
            const branchList = Object.values(data) as Branch[];
            setBranches(branchList);
        } catch (err: any) {
            console.error(err);
            // Some banks might not have branch data in this simplified API or URL issue
            // But typical zengin-data supports major banks.
            setError(`Failed to load branches for bank ${bankCode}`);
            setBranches([]);
        } finally {
            setLoadingBranches(false);
        }
    };

    return {
        banks,
        branches,
        fetchBranches,
        loadingBanks,
        loadingBranches,
        error
    };
}

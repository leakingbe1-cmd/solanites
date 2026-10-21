# Handoff: Live Token Validation

Read-only checks against Solana mainnet. No code was changed.

## Validated with the test mint
Test mint `ESnW5ZbLmoEAg2QEMxnMsY9R3aS8Kw58HJacYURmpump`, a pump.fun token that is **not** $SLNT.
- **Mint facts:** Token-2022 program (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`), decimals 6,
  supply 973,284,076.034801, mint and freeze authority both null. Extensions: metadataPointer and
  tokenMetadata. Confirmed on api.mainnet-beta.solana.com (slot 459322321), solana-rpc.publicnode.com
  (slot 459322811) and pump.fun coins-v2, all on 2026-10-20 around 18:03–18:05 UTC.
- **Holders:** getProgramAccounts on Token-2022, filtered on the mint at offset 0 (no dataSize),
  finalized, slot 459322673, 2026-10-20T18:04:27Z.
  - 11,736 token accounts: 8,328 zero-balance and 3,408 positive.
  - **3,405 unique owners with a positive balance** (3,404 without the PumpSwap pool).
  - 24 owners hold more than one account; 13 of those have a positive balance.
  - Completeness check: all balances add up to the on-chain supply exactly.
- **Independent holder count:** not obtained. The free sources need keys (publicnode, Helius,
  Birdeye), and Solscan returned 502 through the proxy.

## Still to validate with the real mint at launch
- The same mint facts: program, decimals, supply, null authorities, extensions, and no transfer fee or hook.
- A full holder count at a known slot, compared against the site's holder tracking at a nearby slot.
- A second, independent holder count, which needs owner approval for a free RPC key.
- Whether the tracker should exclude pool and program-owned accounts (PDAs) from egg eligibility.

## Gotchas
- **Token-2022:** pump.fun mints use it. Trackers that only query the classic SPL Token program see zero holders.
- **No dataSize filter:** Token-2022 accounts vary in size, so filter on the mint (memcmp at offset 0) only.
- **getTokenLargestAccounts is not a holder list:** it returns the top 20 accounts only.
- **publicnode limits:** it refuses getProgramAccounts, getTokenSupply and getTokenLargestAccounts without a personal token. getAccountInfo works.
- **Pool account:** the biggest "holder" is the PumpSwap pool (13.63% here).
- **Supply drift:** pump.fun shows the 1B launch supply; the on-chain supply is lower after burns.
- **Network access:** the cloud environment's allowlist must include the RPC hosts, or every request fails with a proxy 403.
- **Accounts vs owners:** count unique owners, not token accounts. Zero-balance accounts are about 70% of all accounts.

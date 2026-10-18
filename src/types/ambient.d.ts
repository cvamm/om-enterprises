/**
 * Ambient declarations for browser APIs that `lib.dom.d.ts` does not cover.
 * Interface merging is additive, so this only fills in what is missing.
 */

type NetworkEffectiveType = "slow-2g" | "2g" | "3g" | "4g" | "5g" | "bluetooth" | "cellular";

interface NetworkInformation extends EventTarget {
  /**
   * Whether the user has opted in to saving mobile data. Only `true` when
   * the user has explicitly enabled it — never read it as "offline".
   */
  saveData: boolean;
  /** Conservative estimate of the effective connection type. */
  effectiveType: NetworkEffectiveType;
  /** Whether a network connection exists. */
  online: boolean;
}

interface Navigator {
  /**
   * Network Information API. Chrome, Edge and Samsung Internet only — Safari
   * and Firefox expose nothing, so every caller treats it as optional.
   */
  readonly connection?: NetworkInformation;
}

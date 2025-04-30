import type { Trustline } from "~/@types/trustline.entity";

export interface TrustlineGlobalStore {
  trustlines: Trustline[];

  getAllTrustlines: () => void;
}

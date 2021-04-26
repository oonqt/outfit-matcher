import axios from "axios";

type AvatarType = "R15" | "R6";

interface Scales {
  height: number;
  width: number;
  head: number;
  depth: number;
  proportion: number;
  bodyType: number;
}

interface Colors {
  headColorId: number;
  torsoColorId: number;
  rightArmColorId: number;
  leftArmColorId: number;
  rightLegColorId: number;
  leftLegColorId: number;
}

interface AvatarInfo {
  scales: Scales;
  playerAvatarType: AvatarType;
  bodyColors: Colors;
  assets: {
    id: number;
    name: string;
    assetType: {
      id: number;
      name: string;
    };
  }[];
  defaultShirtApplied: boolean;
  defaultPantsApplied: boolean;
}

interface AssetDetails {
  id: number;
  itemType: string;
  assetType: string;
  bundleType: string;
  name: string;
  description: string;
  productId: number;
  genres: string[];
  bundledItems: {
    owned: boolean;
    id: number;
    name: string;
    type: string;
  }[];
  itemStatus: string[];
  itemRestrictions: string[];
  creatorType: "User";
  creatorTargetId: 0;
  creatorName: string;
  price: 0;
  premiumPricing: {
    premiumDiscountPercentage: 0;
    premiumPriceInRobux: 0;
  };
  lowestPrice: 0;
  priceStatus: string;
  unitsAvailableForConsumption: 0;
  purchaseCount: 0;
  favoriteCount: 0;
  offSaleDeadline: "2021-04-26T01:01:20.028Z";
}

class Roblox {
  public csrfToken: string | null;

  constructor(cookie: string) {
    this.csrfToken = null;
    axios.defaults.headers.common["Cookie"] = `.ROBLOSECURITY=${cookie}`;
    axios.defaults.headers.common["User-Agent"] = "OutfitMatcher/Axios";
    axios.interceptors.response.use()
  }

  public async getAvatar(userId: number | string): Promise<AvatarInfo> {
    const res = await axios(
      `https://avatar.roblox.com/v1/users/${userId}/avatar`
    );

    return res.data;
  }

  public async getMyAvatar(): Promise<AvatarInfo> {
    const res = await axios(`https://avatar.roblox.com/v1/avatar`);

    return res.data;
  }

  public async setAvatarType(type: AvatarType): Promise<void> {
    const res = await axios.post(`https://avatar.roblox.com/v1/avatar/set-player-avatar-type`, {
      playerAvatarTypeModel: type
    });

    if(!res.data.success) return Promise.reject(res);

    return;
  }

  public async setScales(scales: Scales): Promise<void> {
    const res = await axios.post(`https://avatar.roblox.com/v1/avatar/set-scales`, {
      scalesModel: scales
    });

    if(!res.data.success) return Promise.reject(res);

    return;
  }

  public async setColors(colors: Colors) {
    const res = await axios.post(`https://avatar.roblox.com/v1/avatar/set-scales`, {
      bodyColorsModel: colors
    });

    if(!res.data.success) return Promise.reject(res);

    return;
  }
}

export default Roblox;

import axios from "axios";

type AvatarType = "R15" | "R6";

type CreatorType = 'Group' | 'User';

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

interface ProductInfo {
  TargetId: number;
  ProductType: string;
  AssetId: number;
  ProductId: number;
  Name: string;
  Description: string;
  AssetTypeId: number;
  Creator: {
    Id: number;
    Name: string;
    CreatorType: CreatorType;
    CreatorTargetId: number;
  };
  IconImageAssetId: number;
  Created: string;
  Updated: string;
  PriceInRobux: null | number;
  PriceInTickets: null | number;
  Sales: number;
  IsNew: boolean;
  IsForSale: boolean;
  IsPublicDomain: boolean;
  IsLimited: boolean;
  IsLimitedUnique: boolean;
  Remaining: null | number;
  MinimumMembershipLevel: number;
  ContentRatingTypeId: number;
}

class Roblox {
  private userId: string = "";

  constructor(cookie: string) {
    axios.defaults.headers.common["Cookie"] = `.ROBLOSECURITY=${cookie}`;
    axios.defaults.headers.common["User-Agent"] = "OutfitMatcher/Axios";
    axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response && error.response.status === 403) {
          axios.defaults.headers.common["x-csrf-token"] =
            error.response.headers["x-csrf-token"];

          return axios(error.config);
        } else {
          return Promise.reject(error);
        }
      }
    );
  }

  public async init(): Promise<void> {
    const res = await axios("https://users.roblox.com/v1/users/authenticated");

    this.userId = res.data.id;

    return;
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
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-player-avatar-type`,
      {
        playerAvatarTypeModel: type,
      }
    );

    if (!res.data.success) return Promise.reject(res);

    return;
  }

  public async setScales(scales: Scales): Promise<void> {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-scales`,
      {
        ...scales,
      }
    );

    if (!res.data.success) return Promise.reject(res);

    return;
  }

  public async setColors(colors: Colors) {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-body-colors`,
      {
        ...colors,
      }
    );

    if (!res.data.success) return Promise.reject(res);

    return;
  }

  public async setWearingAssets(assetIds: string[] | number[]): Promise<void> {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-wearing-assets`,
      {
        assetIds,
      }
    );

    if (!res.data.success) return Promise.reject(res);

    return;
  }

  public async userOwnsAsset(
    assetId: number | string
  ): Promise<{ assetId: number; owned: boolean }> {
    const res = await axios(
      `https://inventory.roblox.com/v1/users/${this.userId}/items/Asset/${assetId}`
    );

    console.log(assetId);

    // technically type defs are wrong parseInt can accept numbers, it just returns the number passed in lol
    return {
      assetId: parseInt(assetId as string),
      owned: res.data.data.length > 0 ? true : false,
    };
  }

  public async getProductInfo(assetId: number | string): Promise<ProductInfo> {
    const res = await axios(`https://api.roblox.com/marketplace/productinfo?assetId=${assetId}`);

    return res.data;
  }
}

export default Roblox;

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

interface AssetInfo {
  id: number;
  itemType: string;
  assetType: number;
  name: string;
  description: string;
  productId: number;
  genres: string[];
  creatorType: CreatorType;
  itemRestrictions: string[];
  creatorTargetId: number;
  creatorName: string;
  price: number;
  favoriteCount: number;
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
  }

  public async getAvatar(userId: number): Promise<AvatarInfo> {
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
  }

  public async setScales(scales: Scales): Promise<void> {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-scales`,
      {
        ...scales,
      }
    );

    if (!res.data.success) return Promise.reject(res);
  }

  public async setColors(colors: Colors) {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-body-colors`,
      {
        ...colors,
      }
    );

    if (!res.data.success) return Promise.reject(res);
  }

  public async setWearingAssets(assetIds: number[]): Promise<void> {
    const res = await axios.post(
      `https://avatar.roblox.com/v1/avatar/set-wearing-assets`,
      {
        assetIds,
      }
    );

    if (!res.data.success) return Promise.reject(res);
  }

  public async userOwnsAsset(
    assetId: number
  ): Promise<{ assetId: number; owned: boolean }> {
    const res = await axios(
      `https://inventory.roblox.com/v1/users/${this.userId}/items/Asset/${assetId}`
    );

    // technically type defs are wrong parseInt can accept numbers, it just returns the number passed in lol
    return {
      assetId,
      owned: res.data.data.length > 0 ? true : false,
    };
  }

  public async getAssetInfo(assetIds: number[]): Promise<AssetInfo[]> {
    const res = await axios.post('https://catalog.roblox.com/v1/catalog/items/details', {
      items: assetIds.map(asset => ({ id: asset, itemType: 'Asset' }))
    });

    return res.data.data;
  }

  public async getBalance(): Promise<number> {
    const res = await axios('https://api.roblox.com/currency/balance');

    return res.data.robux;
  }

  public async purchaseProduct(productId: number, sellerId: number, price: number): Promise<void> {
    await axios.post(`https://economy.roblox.com/v1/purchases/products/${productId}`, {
      expectedCurrency: 1,
      expectedPrice: price,
      expectedSellerId: sellerId
    });
  }
}

export default Roblox;

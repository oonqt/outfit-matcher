import Roblox from "./roblox";
import deepEqual from "fast-deep-equal";
import {
  COOKIE,
  USER_TO_MATCH,
  OUTFIT_CHECK_INTERVAL,
  LOGGING_WEBHOOK,
  IGNORED_ASSET_TYPES,
} from "./config";

const roblox = new Roblox(COOKIE);
roblox.init();

const checkAndMatchOutfit = async () => {
  try {
    const started = new Date();
    console.log("Checking outfit....");

    const myAvatar = await roblox.getMyAvatar();
    const matcherAvatar = await roblox.getAvatar(USER_TO_MATCH);

    const isScalesSame = deepEqual(myAvatar.scales, matcherAvatar.scales);
    const isColorsSame = deepEqual(
      myAvatar.bodyColors,
      matcherAvatar.bodyColors
    );
    const isAvatarTypeSame =
      myAvatar.playerAvatarType === matcherAvatar.playerAvatarType;

    if (!isAvatarTypeSame) {
      console.log("Changing avatar type...");
      await roblox.setAvatarType(matcherAvatar.playerAvatarType);
    }
    if (!isColorsSame) {
      console.log("Changing avatar colors...");
      await roblox.setColors(matcherAvatar.bodyColors);
    }
    if (!isScalesSame) {
      console.log("Changing avatar scales...");
      await roblox.setScales(matcherAvatar.scales);
    }

    const assetOwnershipStatus = await Promise.all(
      matcherAvatar.assets.map((asset) => roblox.userOwnsAsset(asset.id))
    );
    const assetsToWear = assetOwnershipStatus
      .filter((asset) => asset.owned)
      .map((asset) => asset.assetId);

    const unpurchasedAssetsInfo = (
      await roblox.getAssetInfo(
        assetOwnershipStatus
          .filter((asset) => !asset.owned)
          .map((asset) => asset.assetId)
      )
    ).filter(
      (asset) =>
        !IGNORED_ASSET_TYPES.includes(asset.assetType) &&
        asset.price !== undefined &&
        !asset.itemRestrictions.find((restriction) =>
          ["Limited", "LimitedUnique"].includes(restriction)
        )
    );
    const availableCurrency = await roblox.getBalance();
    const totalPriceToBuy = unpurchasedAssetsInfo.reduce(
      (acc, val) => (acc += val.price),
      0
    );
    console.log(totalPriceToBuy, availableCurrency, unpurchasedAssetsInfo);

    if (availableCurrency >= totalPriceToBuy) {
      await Promise.all(
        unpurchasedAssetsInfo.map((asset) =>
          roblox.purchaseProduct(
            asset.productId,
            asset.creatorTargetId,
            asset.price
          )
        )
      );

      const purchasedAssetIds = unpurchasedAssetsInfo.map((asset) => asset.id);
      console.log(`Purchased: ${purchasedAssetIds.join(", ")}`);
      assetsToWear.push(...purchasedAssetIds);
    } else {
      console.log(
        `Missing avatar items, not enough currency. (Has: ${availableCurrency}, needs ${totalPriceToBuy})`
      );
    }

    if (assetsToWear.length) {
      console.log("Changing avatar assets...");
      await roblox.setWearingAssets(assetsToWear);
    }

    console.log(
      `Finished checking in ${
        (new Date().getTime() - started.getTime()) / 1000
      } seconds`
    );
  } catch (err) {
    console.error("ERROR!");
    console.log(err.config);
    console.error(err.response ? err.response.data : err);
  }

  setTimeout(checkAndMatchOutfit, OUTFIT_CHECK_INTERVAL * 1000);
};

checkAndMatchOutfit();

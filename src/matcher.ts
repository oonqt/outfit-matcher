import Roblox from "./roblox";
import deepEqual from "fast-deep-equal";
import { COOKIE, USER_TO_MATCH, OUTFIT_CHECK_INTERVAL, LOGGING_WEBHOOK, IGNORED_ASSET_TYPES } from "./config";

const roblox = new Roblox(COOKIE);
roblox.init();

const checkAndMatchOutfit = async () => {
  try {
    const started = new Date();
    console.log("Checking outfit....");

    const myAvatar = await roblox.getMyAvatar();
    const matcherAvatar = await roblox.getAvatar(USER_TO_MATCH);

    const isScalesSame = deepEqual(myAvatar.scales, matcherAvatar.scales);
    const isColorsSame = deepEqual(myAvatar.bodyColors, matcherAvatar.bodyColors);
    const isAvatarTypeSame = myAvatar.playerAvatarType === matcherAvatar.playerAvatarType;

    if (!isAvatarTypeSame) {
      console.log("Changing avatar type...");
      await roblox.setAvatarType(matcherAvatar.playerAvatarType);
    }
    if (!isColorsSame) {
      console.log('Changing avatar colors...');
      await roblox.setColors(matcherAvatar.bodyColors);
    }
    if (!isScalesSame) {
      console.log('Changing avatar scales...');
      await roblox.setScales(matcherAvatar.scales);
    }

    const assetsToWear: number[] = [];
    const assetOwnershipStatus = await Promise.all(matcherAvatar.assets.filter(assetInfo => !myAvatar.assets.find(myAsset => myAsset.id === assetInfo.id)).map(asset => roblox.userOwnsAsset(asset.id)));
    for (const asset of assetOwnershipStatus) {
      if (asset.owned) {
        assetsToWear.push(asset.assetId);
      }
    }

    const unpurchasedAssets = (await Promise.all(assetOwnershipStatus.filter(asset => !asset.owned).map(asset => roblox.getProductInfo(asset.assetId)))).filter(asset => !IGNORED_ASSET_TYPES.includes(asset.AssetTypeId) && asset.PriceInRobux);
    const totalPriceToBuy = unpurchasedAssets.reduce((acc, val) => acc += acc.PriceInRobux, 0));

    // console.log(unownedAssetInfo);

    if (assetsToWear.length) { 
      console.log('Changing avatar assets...');
      await roblox.setWearingAssets(assetsToWear);
    }

    console.log(`Finished checking in ${(new Date().getTime() - started.getTime()) / 1000} seconds`);
  } catch (err) {
    console.error(err.response ? err.response.data : err);
  }

  setTimeout(checkAndMatchOutfit, OUTFIT_CHECK_INTERVAL * 1000);
};

checkAndMatchOutfit();

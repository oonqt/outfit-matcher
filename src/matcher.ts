import Roblox from './roblox';
import deepEqual from 'fast-deep-equal';
import { COOKIE, USER_TO_MATCH, OUTFIT_CHECK_INTERVAL } from './config';

const roblox = new Roblox(COOKIE);

const checkAndMatchOutfit = async () => {
    try {
        const myAvatar = await roblox.getMyAvatar();
        const matcherAvatar = await roblox.getAvatar(USER_TO_MATCH);
        
        const isScalesSame = deepEqual(myAvatar.scales, matcherAvatar.scales);
        const isColorsSame = deepEqual(myAvatar.bodyColors, matcherAvatar.bodyColors);
        const isAvatarTypeSame = myAvatar.playerAvatarType === matcherAvatar.playerAvatarType;
        // const isAssetsSame = deepEqual(myAvatar.assets, matcherAvatar.assets);
    
        if (!isScalesSame) await roblox.setScales(matcherAvatar.scales);
        if (!isAvatarTypeSame) await roblox.setAvatarType(matcherAvatar.playerAvatarType);
        if (!isColorsSame) await roblox.setColors(matcherAvatar.bodyColors);

        console.log(myAvatar, matcherAvatar)
    } catch (err) {
        console.error(err);
    }

    setTimeout(checkAndMatchOutfit, OUTFIT_CHECK_INTERVAL * 1000);
};

checkAndMatchOutfit();
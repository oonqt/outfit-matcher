import axios from 'axios';

enum AvatarType {
    R15 = 'R15',
    R6 = 'R6'
}

interface AvatarInfo {
    scales: {
        height: number;
        width: number;
        head: number;
        depth: number;
        proportion: number;
        bodyType: number
    };
    playerAvatarType: AvatarType;
    bodyColors: {
        headColorId: number;
        torsoColorId: number;
        rightArmColorId: number;
        leftArmColorId: number;
        rightLegColorId: number;
        leftLegColorId: number;
    };
    assets: {
        id: number;
        name: string;
        assetType: {
            id: number;
            name: string;
        }
    }[];
    defaultShirtApplied: boolean;
    defaultPantsApplied: boolean;
}

class Roblox {
    public csrfToken: string | null;

    constructor(cookie: string) {
        this.csrfToken = null;
        axios.defaults.headers.common['Cookie'] = `.ROBLOSECURITY=${cookie}`;
        axios.defaults.headers.common['User-Agent'] = 'OutfitMatcher/Axios';
    }

    public async getAvatar(): Promise<AvatarInfo> {
        const res = await axios(`https://avatar.roblox.com/v1/avatfrwar`);

        return res.data;
    }
}

export default Roblox;
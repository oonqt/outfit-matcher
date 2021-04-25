import Roblox from './roblox';
import { COOKIE } from './config';

const roblox = new Roblox(COOKIE);

roblox.getAvatar().then(console.log);
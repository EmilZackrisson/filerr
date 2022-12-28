import PocketBase, { Record } from 'pocketbase';
import publicUrl from '$lib/publicUrl';

const pb = new PocketBase(publicUrl);
var userId = pb.authStore.model?.id;

export async function getCurrentUser(){
    if (!userId) return null;
    return await pb.collection('users').getOne(userId);
}

export async function getAllUsers() {
    // you can also fetch all records at once via getFullList
    let users = await pb
        .collection('users')
        .getFullList(200 /* batch size */, {
            sort: '-created'
        })
        .then((users) => {
            users.map((user: any) => {
                const url = pb.getFileUrl(user, user.vpnConfig);
                const avatar = pb.getFileUrl(user, user.avatar);
                user.avatar = avatar;
                user.vpnConfig = url;
            });
            console.log(users);
            return users;
        });
}

// export default { getCurrentUser, getAllUsers };